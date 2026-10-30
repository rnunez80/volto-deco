import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { SidebarPortal } from '@plone/volto/components';
import { BlocksForm } from '@plone/volto/components/manage/Form';
import { useDispatch } from 'react-redux';
import { setSidebarTab } from '@plone/volto/actions/sidebar/sidebar';
import RowData from './RowData';
import { normalizeRowData, deriveGridTemplate } from './normalize';
import { v4 as uuid } from 'uuid';
import config from '@plone/volto/registry';
import BlockChooser from '@plone/volto/components/manage/BlockChooser/BlockChooser';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import trashSVG from '@plone/volto/icons/delete.svg';
import { moveBlockIntoColumn, insertBlockAsNewColumn } from './split';
import { getImageUrl } from '../../../helpers/getImageUrl';

interface RowEditProps {
  block: string;
  data: any;
  onChangeBlock: (blockId: string, data: any) => void;
  pathname: string;
  selected: boolean;
  manage: boolean;
  metadata?: any;
  properties?: any;
  [key: string]: any;
}

type DropHint =
  | { colId: string; mode: 'before' | 'after' }
  | { colId: string; mode: 'into'; beforeId: string | null; top: number };

const getDraggingId = (): string | null =>
  typeof window !== 'undefined'
    ? (window as any).__volto_dragging_block_id || null
    : null;

const QUICK_TYPES = [
  { type: 'slate', label: 'Text' },
  { type: 'image', label: 'Image' },
  { type: 'video', label: 'Video' },
  { type: 'teaser', label: 'Teaser' },
];

const SNAP_PRESETS = [
  { ratio: 0.2, label: '20% / 80% (1 : 4)', w0: '1fr', w1: '4fr' },
  { ratio: 0.25, label: '25% / 75% (1 : 3)', w0: '1fr', w1: '3fr' },
  { ratio: 0.3333, label: '33% / 67% (1 : 2)', w0: '1fr', w1: '2fr' },
  { ratio: 0.4, label: '40% / 60% (2 : 3)', w0: '2fr', w1: '3fr' },
  { ratio: 0.5, label: '50% / 50% (Equal)', w0: '1fr', w1: '1fr' },
  { ratio: 0.6, label: '60% / 40% (3 : 2)', w0: '3fr', w1: '2fr' },
  { ratio: 0.6667, label: '67% / 33% (2 : 1)', w0: '2fr', w1: '1fr' },
  { ratio: 0.75, label: '75% / 25% (3 : 1)', w0: '3fr', w1: '1fr' },
  { ratio: 0.8, label: '80% / 20% (4 : 1)', w0: '4fr', w1: '1fr' },
];

const RowEdit: React.FC<RowEditProps> = (props) => {
  const {
    block,
    data: rawData,
    onChangeBlock,
    pathname,
    selected,
    manage,
  } = props;
  const dispatch = useDispatch();
  const metadata = props.metadata || props.properties;
  const rowInnerRef = useRef<HTMLDivElement>(null);

  // On mount, normalize if legacy block data is present
  useEffect(() => {
    if (
      rawData &&
      (rawData['@type'] === 'columnsBlock' || rawData['@type'] === 'gridBlock')
    ) {
      onChangeBlock(block, normalizeRowData(rawData));
    }
  }, [rawData, block, onChangeBlock]);

  const data = normalizeRowData(rawData);
  const latestDataRef = useRef(data);
  latestDataRef.current = data;

  const emitRowChange = (nextData: any) => {
    latestDataRef.current = nextData;
    onChangeBlock(block, nextData);
  };

  const columnIds: string[] = data.blocks_layout?.items || [];
  const blockWidth = data.blockWidth || 'default';
  const styleName = data.style_name || data.styles?.style_name;
  const customClass = data.styles?.customClass;
  const gridTemplate =
    data.gridTemplate || deriveGridTemplate(data.blocks_layout, data.blocks);

  const bgImageUrl = getImageUrl(data.backgroundImage);
  const hasBackground =
    !!(styleName && styleName !== 'none') || !!bgImageUrl;

  const rowStyle: React.CSSProperties = {
    ...(bgImageUrl
      ? {
          backgroundImage: `url(${bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }
      : {}),
  };

  const isRowActive = !!(selected || props.multiSelected);

  const [selectedInnerBlock, setSelectedInnerBlock] = useState<string | null>(
    null,
  );
  const [multiSelectedInnerBlocks, setMultiSelectedInnerBlocks] = useState<
    string[]
  >([]);
  const [dropHint, setDropHint] = useState<DropHint | null>(null);
  const [chooserColId, setChooserColId] = useState<string | null>(null);

  // Column resizing state
  const [resizingIndex, setResizingIndex] = useState<number | null>(null);
  const [resizeTooltip, setResizeTooltip] = useState<{
    x: number;
    y: number;
    text: string;
    isSnapped?: boolean;
  } | null>(null);

  // Clear inner selection when row becomes inactive
  useEffect(() => {
    if (
      !isRowActive &&
      (selectedInnerBlock || multiSelectedInnerBlocks.length > 0)
    ) {
      setSelectedInnerBlock(null);
      setMultiSelectedInnerBlocks([]);
    }
  }, [isRowActive, selectedInnerBlock, multiSelectedInnerBlocks.length]);

  // Listen for direct Row container selection (e.g. Cmd/Ctrl+click on row outside inner blocks)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onSelectRowContainer = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.block === block) {
        setSelectedInnerBlock(null);
        setMultiSelectedInnerBlocks([]);
        dispatch(setSidebarTab(2));
      }
    };
    window.addEventListener('voltoSelectRowContainer', onSelectRowContainer);
    return () => {
      window.removeEventListener(
        'voltoSelectRowContainer',
        onSelectRowContainer,
      );
    };
  }, [block, dispatch]);

  // When row container itself is selected (and no inner block), default to the "Row" sidebar tab (tab index 2)
  useEffect(() => {
    if (isRowActive && !selectedInnerBlock) {
      dispatch(setSidebarTab(2));
    }
  }, [isRowActive, selectedInnerBlock, dispatch]);

  const handleSelectInnerBlock = (
    id: string | null,
    isMultipleSelection?: boolean,
    _event?: any,
  ) => {
    setSelectedInnerBlock(id);
    if (id) {
      setMultiSelectedInnerBlocks(isMultipleSelection ? [id] : []);
      if ((!selected || props.multiSelected) && props.onSelectBlock) {
        props.onSelectBlock(block, false);
      }
      // When an inner block is selected, switch to the "Block" sidebar tab (tab index 1)
      dispatch(setSidebarTab(1));
    } else {
      setMultiSelectedInnerBlocks([]);
    }
  };

  // Clear drop hint whenever any drag finishes (drop may happen elsewhere)
  useEffect(() => {
    if (!dropHint) return;
    const clear = () => setDropHint(null);
    window.addEventListener('dragend', clear);
    window.addEventListener('drop', clear);
    return () => {
      window.removeEventListener('dragend', clear);
      window.removeEventListener('drop', clear);
    };
  }, [dropHint]);

  const updateColumns = (items: string[], blocks: Record<string, any>) => {
    const currentData = latestDataRef.current;
    const preset =
      items.length === 2
        ? '2-col-equal'
        : items.length === 3
          ? '3-col-equal'
          : items.length === 4
            ? '4-col-equal'
            : 'custom';

    emitRowChange({
      ...currentData,
      layoutPreset: preset,
      blocks_layout: { items },
      blocks,
      gridTemplate: deriveGridTemplate({ items }, blocks),
    });
  };

  const handleColBlockChange = (
    colId: string,
    newColData: any,
    renderColData?: any,
  ) => {
    const currentData = latestDataRef.current;
    const currentCol = currentData.blocks?.[colId] || {
      '@type': 'rowColumn',
      id: colId,
      width: '1fr',
      blocks: {},
      blocks_layout: { items: [] },
    };

    // Handle Volto deleteBlock edge case where deleting the last block returns [id, formData]
    const resolvedColData = Array.isArray(newColData)
      ? { blocks: {}, blocks_layout: { items: [] } }
      : newColData;

    // If a synchronous batch (e.g. Slate Enter key split) already added/updated blocks_layout via
    // onChangeField in this tick, and a follow-up changeBlock call passed stale renderColData.blocks_layout,
    // merge the updated block data without reverting blocks_layout or dropping newly created blocks.
    let nextCol: any;
    if (
      renderColData &&
      currentCol.blocks_layout &&
      renderColData.blocks_layout &&
      currentCol.blocks_layout !== renderColData.blocks_layout &&
      resolvedColData.blocks_layout === renderColData.blocks_layout
    ) {
      const mergedBlocks = { ...(currentCol.blocks || {}) };
      Object.keys(resolvedColData.blocks || {}).forEach((bid) => {
        if (resolvedColData.blocks[bid] !== renderColData.blocks?.[bid]) {
          mergedBlocks[bid] = resolvedColData.blocks[bid];
        }
      });
      nextCol = {
        ...currentCol,
        blocks: mergedBlocks,
        '@type': 'rowColumn',
        id: colId,
      };
    } else {
      nextCol = {
        ...currentCol,
        ...resolvedColData,
        '@type': 'rowColumn',
        id: colId,
      };
    }

    emitRowChange({
      ...currentData,
      blocks: {
        ...currentData.blocks,
        [colId]: nextCol,
      },
    });
  };

  const handleAddBlockToColumn = (colId: string, blockType = 'slate') => {
    const currentCol = data.blocks[colId] || {
      blocks: {},
      blocks_layout: { items: [] },
    };
    const newBlockId = uuid();
    const blockConfig = config.blocks?.blocksConfig?.[blockType] || {};
    handleColBlockChange(colId, {
      blocks: {
        ...(currentCol.blocks || {}),
        [newBlockId]: {
          '@type': blockType,
          ...(blockConfig.defaultData || {}),
        },
      },
      blocks_layout: {
        items: [...(currentCol.blocks_layout?.items || []), newBlockId],
      },
    });
    handleSelectInnerBlock(newBlockId);
    setChooserColId(null);
  };

  const handleAddColumn = () => {
    const newColId = uuid();
    updateColumns([...columnIds, newColId], {
      ...data.blocks,
      [newColId]: {
        '@type': 'rowColumn',
        id: newColId,
        width: '1fr',
        blocks: {},
        blocks_layout: { items: [] },
      },
    });
  };

  const handleDeleteColumn = (colId: string) => {
    if (columnIds.length <= 1) return;
    const newBlocks = { ...data.blocks };
    delete newBlocks[colId];
    updateColumns(
      columnIds.filter((id) => id !== colId),
      newBlocks,
    );
  };

  const handleMoveColumn = (colId: string, direction: -1 | 1) => {
    const idx = columnIds.indexOf(colId);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= columnIds.length) return;
    const items = [...columnIds];
    [items[idx], items[target]] = [items[target], items[idx]];
    updateColumns(items, data.blocks);
  };

  const handleSetColumnWidth = (colId: string, width: string) => {
    if (!data.blocks[colId]) return;
    updateColumns(columnIds, {
      ...data.blocks,
      [colId]: { ...data.blocks[colId], width },
    });
  };

  // ---- Interactive Column Width Resizer ("grab between rows and adjust the width") ----

  const handleColResizeStart = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!rowInnerRef.current) return;
    const colElements = Array.from(
      rowInnerRef.current.children,
    ) as HTMLElement[];
    if (index < 0 || index >= colElements.length - 1) return;

    const col0 = colElements[index];
    const col1 = colElements[index + 1];
    const rect0 = col0.getBoundingClientRect();
    const rect1 = col1.getBoundingClientRect();
    const combinedWidth = rect0.width + rect1.width;
    const totalColsWidth = colElements.reduce(
      (sum, el) => sum + el.getBoundingClientRect().width,
      0,
    );

    const startX = e.clientX;
    const initialCol0Width = rect0.width;

    // Current proportions of each column out of total width
    const currentPercents = colElements.map(
      (el) => (el.getBoundingClientRect().width / totalColsWidth) * 100,
    );
    const combinedPercent = currentPercents[index] + currentPercents[index + 1];

    setResizingIndex(index);
    if (typeof document !== 'undefined') {
      document.body.classList.add('is-resizing-columns');
    }

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const dx = moveEvent.clientX - startX;

      const minWidthPx = 60;
      const newCol0Px = Math.max(
        minWidthPx,
        Math.min(combinedWidth - minWidthPx, initialCol0Width + dx),
      );
      const rawRatio = newCol0Px / combinedWidth;

      // Magnetic snap to preset ratios (within 4% threshold)
      let effectiveRatio = rawRatio;
      let matchedPreset: (typeof SNAP_PRESETS)[0] | null = null;
      for (const preset of SNAP_PRESETS) {
        if (Math.abs(rawRatio - preset.ratio) < 0.04) {
          effectiveRatio = preset.ratio;
          matchedPreset = preset;
          break;
        }
      }

      const p0 = Math.max(
        5,
        Math.min(
          combinedPercent - 5,
          Math.round(combinedPercent * effectiveRatio),
        ),
      );
      const p1 = Math.round(combinedPercent - p0);

      // Live update gridTemplateColumns directly for 60fps smooth feedback
      const liveWidths = currentPercents.map((p, i) => {
        if (i === index) return `${p0}fr`;
        if (i === index + 1) return `${p1}fr`;
        return `${Math.round(p)}fr`;
      });
      if (rowInnerRef.current) {
        rowInnerRef.current.style.gridTemplateColumns = liveWidths.join(' ');
      }

      setResizeTooltip({
        x: moveEvent.clientX,
        y: rect0.top + 20,
        text: matchedPreset
          ? `⚡ Snapped: ${matchedPreset.label}`
          : `${p0}% | ${p1}%`,
        isSnapped: !!matchedPreset,
      });
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (typeof document !== 'undefined') {
        document.body.classList.remove('is-resizing-columns');
      }
      setResizingIndex(null);
      setResizeTooltip(null);

      const dx = upEvent.clientX - startX;
      const minWidthPx = 60;
      const newCol0Px = Math.max(
        minWidthPx,
        Math.min(combinedWidth - minWidthPx, initialCol0Width + dx),
      );
      const rawRatio = newCol0Px / combinedWidth;

      let effectiveRatio = rawRatio;
      let matchedPreset: (typeof SNAP_PRESETS)[0] | null = null;
      for (const preset of SNAP_PRESETS) {
        if (Math.abs(rawRatio - preset.ratio) < 0.04) {
          effectiveRatio = preset.ratio;
          matchedPreset = preset;
          break;
        }
      }

      const p0 = Math.max(
        5,
        Math.min(
          combinedPercent - 5,
          Math.round(combinedPercent * effectiveRatio),
        ),
      );
      const p1 = Math.round(combinedPercent - p0);

      const updatedBlocks = { ...data.blocks };
      columnIds.forEach((cid, i) => {
        let w = `${Math.round(currentPercents[i])}fr`;
        if (columnIds.length === 2 && matchedPreset) {
          if (i === 0) w = matchedPreset.w0;
          if (i === 1) w = matchedPreset.w1;
        } else {
          if (i === index) w = `${p0}fr`;
          if (i === index + 1) w = `${p1}fr`;
        }
        updatedBlocks[cid] = {
          ...(updatedBlocks[cid] || {}),
          width: w,
        };
      });

      updateColumns(columnIds, updatedBlocks);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // ---- Mosaic drag & drop on columns ------------------------------------

  const computeHint = (e: React.DragEvent, colId: string): DropHint => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const draggingId = getDraggingId();
    const rawItems: string[] = data.blocks[colId]?.blocks_layout?.items || [];
    const isIntraCol = !!(draggingId && rawItems.includes(draggingId));

    // Only allow creating a new column at the outer edges if dragging from OUTSIDE this column
    // and only when hovering at the extreme left/right edges (outer 28px or 10%)
    if (!isIntraCol) {
      const edgeThreshold = Math.min(28, rect.width * 0.1);
      const isLeftEdge = e.clientX - rect.left < edgeThreshold;
      const isRightEdge = rect.right - e.clientX < edgeThreshold;
      if (isLeftEdge) return { colId, mode: 'before' };
      if (isRightEdge) return { colId, mode: 'after' };
    }

    // Filter out the dragged block so we don't compare against itself
    const items = draggingId
      ? rawItems.filter((id) => id !== draggingId)
      : rawItems;
    if (items.length === 0) {
      return { colId, mode: 'into', beforeId: null, top: rect.height / 2 };
    }

    let beforeId: string | null = null;
    let top = 0;
    for (let i = 0; i < items.length; i++) {
      const id = items[i];
      const node = el.querySelector(
        `[data-block-id="${id}"], [data-rbd-draggable-id="${id}"]`,
      );
      if (!node) continue;
      const r = node.getBoundingClientRect();
      const midY = r.top + r.height / 2;
      if (e.clientY < midY) {
        beforeId = id;
        top = r.top - rect.top;
        break;
      } else if (i === items.length - 1) {
        beforeId = null;
        top = r.bottom - rect.top;
        break;
      }
    }
    return { colId, mode: 'into', beforeId, top };
  };

  const sameHint = (a: DropHint | null, b: DropHint) =>
    !!a &&
    a.colId === b.colId &&
    a.mode === b.mode &&
    (a.mode !== 'into' ||
      (b.mode === 'into' && a.beforeId === b.beforeId && a.top === b.top));

  const handleColumnDragOver = (e: React.DragEvent, colId: string) => {
    const draggingId = getDraggingId();
    const native = e.nativeEvent as any;
    if (!draggingId || native.__voltoDropHandled) return;
    native.__voltoDropHandled = true;
    e.preventDefault();
    const hint = computeHint(e, colId);
    if (!sameHint(dropHint, hint)) setDropHint(hint);
  };

  const handleColumnDragLeave = (e: React.DragEvent, colId: string) => {
    if (
      !e.currentTarget.contains(e.relatedTarget as Node) &&
      dropHint?.colId === colId
    ) {
      setDropHint(null);
    }
  };

  const handleColumnDrop = (e: React.DragEvent, colId: string) => {
    const native = e.nativeEvent as any;
    const draggingId =
      e.dataTransfer.getData('text/volto-block-id') ||
      e.dataTransfer.getData('application/x-volto-block-id') ||
      getDraggingId();
    if (!draggingId || native.__voltoDropHandled) return;
    native.__voltoDropHandled = true;
    e.preventDefault();
    e.stopPropagation();

    const hint = computeHint(e, colId);
    setDropHint(null);
    if (typeof document !== 'undefined') {
      document.body.classList.remove('is-dragging-volto-block');
    }
    if (typeof window !== 'undefined') {
      (window as any).__volto_dragging_block_id = null;
    }

    const rawItems: string[] = data.blocks[colId]?.blocks_layout?.items || [];

    // 1. Intra-column reorder (drag item above or below within the same column)
    if (hint.mode === 'into' && rawItems.includes(draggingId)) {
      const itemsWithout = rawItems.filter((id) => id !== draggingId);
      const insertIdx = hint.beforeId
        ? itemsWithout.indexOf(hint.beforeId)
        : itemsWithout.length;
      itemsWithout.splice(
        insertIdx > -1 ? insertIdx : itemsWithout.length,
        0,
        draggingId,
      );

      const currentCol = data.blocks[colId] || {};
      onChangeBlock(block, {
        ...data,
        blocks: {
          ...data.blocks,
          [colId]: {
            ...currentCol,
            blocks_layout: { items: itemsWithout },
          },
        },
      });
      handleSelectInnerBlock(draggingId);
      return;
    }

    // 2. Moving between columns in the same row
    const sourceColId = columnIds.find((cid) =>
      (data.blocks[cid]?.blocks_layout?.items || []).includes(draggingId),
    );

    if (sourceColId && hint.mode === 'into') {
      const sourceCol = data.blocks[sourceColId];
      const targetCol = data.blocks[colId] || {
        blocks: {},
        blocks_layout: { items: [] },
      };
      const draggedBlockData = sourceCol?.blocks?.[draggingId];

      const newSourceItems = (sourceCol.blocks_layout?.items || []).filter(
        (id: string) => id !== draggingId,
      );
      const newSourceBlocks = { ...(sourceCol.blocks || {}) };
      delete newSourceBlocks[draggingId];

      const newTargetItems = [...(targetCol.blocks_layout?.items || [])];
      const insertIdx = hint.beforeId
        ? newTargetItems.indexOf(hint.beforeId)
        : newTargetItems.length;
      newTargetItems.splice(
        insertIdx > -1 ? insertIdx : newTargetItems.length,
        0,
        draggingId,
      );
      const newTargetBlocks = {
        ...(targetCol.blocks || {}),
        [draggingId]: draggedBlockData,
      };

      if (newSourceItems.length === 0 && columnIds.length > 1) {
        const nextColIds = columnIds.filter((cid) => cid !== sourceColId);
        const nextBlocks = {
          ...data.blocks,
          [colId]: {
            ...targetCol,
            blocks: newTargetBlocks,
            blocks_layout: { items: newTargetItems },
          },
        };
        delete nextBlocks[sourceColId];
        updateColumns(nextColIds, nextBlocks);
      } else {
        onChangeBlock(block, {
          ...data,
          blocks: {
            ...data.blocks,
            [sourceColId]: {
              ...sourceCol,
              blocks: newSourceBlocks,
              blocks_layout: { items: newSourceItems },
            },
            [colId]: {
              ...targetCol,
              blocks: newTargetBlocks,
              blocks_layout: { items: newTargetItems },
            },
          },
        });
      }
      handleSelectInnerBlock(draggingId);
      return;
    }

    // 3. Adding a new column by dragging a block from within this row
    if (sourceColId && (hint.mode === 'before' || hint.mode === 'after')) {
      const sourceCol = data.blocks[sourceColId];
      const draggedBlockData = sourceCol?.blocks?.[draggingId];
      const newColId = uuid();
      const newCol = {
        '@type': 'rowColumn',
        id: newColId,
        width: '1fr',
        blocks: { [draggingId]: draggedBlockData },
        blocks_layout: { items: [draggingId] },
      };

      const newSourceItems = (sourceCol.blocks_layout?.items || []).filter(
        (id: string) => id !== draggingId,
      );
      const newSourceBlocks = { ...(sourceCol.blocks || {}) };
      delete newSourceBlocks[draggingId];

      const newColIds = [...columnIds];
      const refIdx = newColIds.indexOf(colId);
      const insertAt = hint.mode === 'before' ? refIdx : refIdx + 1;
      newColIds.splice(insertAt, 0, newColId);

      const newBlocks = {
        ...data.blocks,
        [sourceColId]: {
          ...sourceCol,
          blocks: newSourceBlocks,
          blocks_layout: { items: newSourceItems },
        },
        [newColId]: newCol,
      };

      if (newSourceItems.length === 0) {
        const sIdx = newColIds.indexOf(sourceColId);
        if (sIdx > -1) newColIds.splice(sIdx, 1);
        delete newBlocks[sourceColId];
      }

      newColIds.forEach((cid) => {
        if (newBlocks[cid])
          newBlocks[cid] = { ...newBlocks[cid], width: '1fr' };
      });

      updateColumns(newColIds, newBlocks);
      handleSelectInnerBlock(draggingId);
      return;
    }

    // 4. Dragging a block from OUTSIDE the row into this row
    if (!props.properties || !props.onChangeFormData) return;

    const currentRootFormData = {
      ...props.properties,
      blocks: {
        ...(props.properties?.blocks || {}),
        [block]: {
          ...data,
          blocks: data.blocks,
          blocks_layout: data.blocks_layout,
        },
      },
    };

    const next =
      hint.mode === 'into'
        ? moveBlockIntoColumn(
            currentRootFormData,
            draggingId,
            block,
            colId,
            hint.beforeId,
          )
        : insertBlockAsNewColumn(
            currentRootFormData,
            draggingId,
            block,
            colId,
            hint.mode,
          );
    props.onChangeFormData(next);
    handleSelectInnerBlock(draggingId);
  };

  const renderChooser = (colId: string, colData: any) => (
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
    <div className="row-col-chooser" onClick={(e) => e.stopPropagation()}>
      <div className="quick-block-types">
        {QUICK_TYPES.map((q) => (
          <button
            key={q.type}
            type="button"
            className="btn-quick-type"
            onClick={() => handleAddBlockToColumn(colId, q.type)}
          >
            {q.label}
          </button>
        ))}
      </div>
      <BlockChooser
        onInsertBlock={(_id: string, value: any) =>
          handleAddBlockToColumn(colId, value?.['@type'] || 'slate')
        }
        onMutateBlock={(_id: string, value: any) =>
          handleAddBlockToColumn(colId, value?.['@type'] || 'slate')
        }
        currentBlock={colId}
        properties={props.properties || colData}
        blocksConfig={config.blocks.blocksConfig}
      />
    </div>
  );

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        className={cx(
          'block',
          'row',
          `has--block-width--${blockWidth}`,
          styleName ? `has--style_name--${styleName}` : null,
          hasBackground ? 'has--background' : null,
          bgImageUrl ? 'has--background-image' : null,
          customClass,
          'row-edit-container',
          {
            'is-selected': isRowActive && !selectedInnerBlock,
            'is-dragging-over': !!dropHint,
          },
        )}
        style={rowStyle}
        onClick={(e) => {
          // Deselect inner block and switch to Row tab when clicking row container outside any inner block
          const target = e.target as HTMLElement;
          if (
            target &&
            typeof target.closest === 'function' &&
            !target.closest('.row-column [data-block-id], .row-col-chooser')
          ) {
            handleSelectInnerBlock(null);
            dispatch(setSidebarTab(2));
          }
        }}
      >
        <div className="block-inner-container">
          {data.headline && <h2 className="headline">{data.headline}</h2>}
          <div
            ref={rowInnerRef}
            className={cx('row-inner-container', {
              'gap--small': data.gridGap === 'small',
              'gap--large': data.gridGap === 'large',
              'gap--none': data.gridGap === 'none',
              [`align--${data.alignItems || 'stretch'}`]: true,
              'reverse-mobile': !!data.reverseMobile,
            })}
            style={{
              gridTemplateColumns: gridTemplate,
              alignItems:
                data.alignItems === 'start' ||
                data.alignItems === 'top' ||
                data.alignItems === 'flex-start'
                  ? 'flex-start'
                  : data.alignItems === 'center' ||
                    data.alignItems === 'middle'
                  ? 'center'
                  : data.alignItems === 'end' ||
                    data.alignItems === 'bottom' ||
                    data.alignItems === 'flex-end'
                  ? 'flex-end'
                  : 'stretch',
            }}
          >
            {columnIds.map((colId, index) => {
              const rawCol = data.blocks?.[colId] || {};
              const colData = {
                '@type': 'rowColumn',
                id: colId,
                ...rawCol,
                blocks: rawCol.blocks || {},
                blocks_layout: rawCol.blocks_layout || { items: [] },
              };
              const hasBlocks = (colData.blocks_layout?.items || []).length > 0;
              const hint = dropHint?.colId === colId ? dropHint : null;

              return (
                <div
                  key={colId}
                  className={cx('row-column', 'row-column-edit', {
                    'is-empty': !hasBlocks,
                  })}
                  onDragOverCapture={(e) => handleColumnDragOver(e, colId)}
                  onDragLeave={handleColumnDragLeave}
                  onDropCapture={(e) => handleColumnDrop(e, colId)}
                  role="presentation"
                >
                  {/* Single drop line: vertical at column edges, horizontal between blocks */}
                  {hint && hint.mode !== 'into' && (
                    <div
                      className={cx('mosaic-drop-line', 'vertical', hint.mode)}
                    />
                  )}
                  {hint && hint.mode === 'into' && (
                    <div
                      className="mosaic-drop-line horizontal"
                      style={{ top: hasBlocks ? hint.top : '50%' }}
                    />
                  )}

                  {hasBlocks ? (
                    <BlocksForm
                      metadata={metadata}
                      properties={colData}
                      manage={manage}
                      selectedBlock={isRowActive ? selectedInnerBlock : null}
                      multiSelected={
                        isRowActive ? multiSelectedInnerBlocks : []
                      }
                      isMainForm={false}
                      stopPropagation
                      pathname={pathname}
                      blocksConfig={
                        props.blocksConfig || config.blocks.blocksConfig
                      }
                      allowedBlocks={props.allowedBlocks}
                      showRestricted={props.showRestricted}
                      navRoot={props.navRoot}
                      type={props.contentType || props.type}
                      onSelectBlock={(
                        id: string,
                        isMultipleSelection?: boolean,
                        event?: any,
                      ) =>
                        handleSelectInnerBlock(id, isMultipleSelection, event)
                      }
                      onChangeFormData={(newColData: any) =>
                        handleColBlockChange(colId, newColData, colData)
                      }
                      onChangeField={(id: string, value: any) => {
                        if (['blocks', 'blocks_layout'].includes(id)) {
                          handleColBlockChange(colId, { [id]: value });
                        }
                      }}
                    />
                  ) : (
                    <div className="row-empty-column">
                      <div className="empty-col-actions">
                        <button
                          type="button"
                          className="btn-empty-col-add"
                          title="Add a block to this column"
                          aria-label="Add a block to this column"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChooserColId(
                              chooserColId === colId ? null : colId,
                            );
                          }}
                        >
                          +
                        </button>
                        {columnIds.length > 1 && (
                          <button
                            type="button"
                            className="btn-empty-col-delete"
                            title="Remove this empty column"
                            aria-label="Remove this empty column"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteColumn(colId);
                            }}
                          >
                            <Icon name={trashSVG} size="16px" />
                          </button>
                        )}
                      </div>
                      <span className="empty-col-hint">Empty column</span>
                    </div>
                  )}
                  {chooserColId === colId && renderChooser(colId, colData)}

                  {/* Column divider resizer handle between adjacent columns */}
                  {index < columnIds.length - 1 && (
                    /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */
                    <div
                      className={cx('row-col-resizer', {
                        'is-resizing': resizingIndex === index,
                      })}
                      onMouseDown={(e) => handleColResizeStart(e, index)}
                      onClick={(e) => e.stopPropagation()}
                      title="Drag between columns to adjust width"
                      role="separator"
                      aria-orientation="vertical"
                    >
                      <div className="row-col-resizer-line" />
                      <div className="row-col-resizer-handle">
                        <span className="resizer-dots">⋮</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating column resize percentage tooltip */}
      {resizeTooltip && (
        <div
          className={cx('row-col-resizer-tooltip', {
            'is-snapped': resizeTooltip.isSnapped,
          })}
          style={{ left: resizeTooltip.x, top: resizeTooltip.y }}
        >
          {resizeTooltip.text}
        </div>
      )}

      {/* Row settings + column management live in the "Row" sidebar tab */}
      <SidebarPortal selected={isRowActive} tab="sidebar-row">
        <div className="sidebar-row-scroll-wrapper">
          {/* Columns panel placed at top of Row tab for immediate visibility */}
          <div className="row-columns-panel">
            <div className="row-columns-panel-header">
              <h3>Columns ({columnIds.length})</h3>
              <button
                type="button"
                className="btn-add-col-toolbar"
                onClick={handleAddColumn}
              >
                + Add column
              </button>
            </div>
            {columnIds.map((colId, index) => {
              const col = data.blocks?.[colId] || {};
              const count = (col.blocks_layout?.items || []).length;
              const currentWidth = col.width || '1fr';
              return (
                <div key={colId} className="row-columns-panel-item">
                  <span className="col-badge">
                    Col {index + 1} ({currentWidth}) · {count} block
                    {count === 1 ? '' : 's'}
                  </span>
                  <div className="col-actions">
                    {['1fr', '2fr', '3fr'].map((w) => (
                      <button
                        key={w}
                        type="button"
                        className={cx('btn-col-action', {
                          active: currentWidth === w,
                        })}
                        onClick={() => handleSetColumnWidth(colId, w)}
                      >
                        {w}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn-col-action"
                      disabled={index === 0}
                      onClick={() => handleMoveColumn(colId, -1)}
                      title="Move left"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="btn-col-action"
                      disabled={index === columnIds.length - 1}
                      onClick={() => handleMoveColumn(colId, 1)}
                      title="Move right"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      className="btn-col-action btn-col-delete"
                      disabled={columnIds.length <= 1}
                      onClick={() => handleDeleteColumn(colId)}
                      title="Delete column"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Row settings (Container width, layout presets, alignment, styles) */}
          <RowData
            {...props}
            data={data}
            block={block}
            onChangeBlock={onChangeBlock}
          />
        </div>
      </SidebarPortal>

      {/* Notice on the "Block" tab only when the Row container itself is selected without an inner block */}
      {isRowActive && !selectedInnerBlock && (
        <SidebarPortal selected tab="sidebar-properties">
          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3
              style={{
                fontSize: '1.1rem',
                marginBottom: '0.5rem',
                fontWeight: 600,
              }}
            >
              Row Container
            </h3>
            <p
              style={{
                color: '#64748b',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                lineHeight: 1.4,
              }}
            >
              Container width, column layout, columns and vertical alignment are
              managed in the <strong>Row</strong> tab.
            </p>
            <button
              type="button"
              className="ui primary button"
              onClick={() => dispatch(setSidebarTab(2))}
            >
              Open Row Settings
            </button>
          </div>
        </SidebarPortal>
      )}
    </>
  );
};

export default RowEdit;
