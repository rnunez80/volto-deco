import React, { useState, useEffect } from 'react';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import {
  applyBlockDefaults,
  applyBlockInitialValue,
  getBlocksFieldname,
  blockHasValue,
  buildStyleClassNamesFromData,
  buildStyleObjectFromData,
  buildStyleClassNamesExtenders,
} from '@plone/volto/helpers/Blocks/Blocks';
import dragSVG from '@plone/volto/icons/drag.svg';
import includes from 'lodash/includes';
import isBoolean from 'lodash/isBoolean';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import config from '@plone/volto/registry';
import BlockChooserButton from '@plone/volto/components/manage/BlockChooser/BlockChooserButton';
import { SidebarPortal } from '@plone/volto/components';
import trashSVG from '@plone/volto/icons/delete.svg';
import {
  splitBlocksIntoRow,
  moveBlockToRoot,
} from '../../../../../components/Blocks/Row/split';
import StandaloneRowSettings from '../../../../../components/Blocks/Row/StandaloneRowSettings';

const messages = defineMessages({
  delete_block: {
    id: 'delete_block',
    defaultMessage: 'delete {type} block',
  },
  drag_block: {
    id: 'drag_block',
    defaultMessage: 'drag {type} block',
  },
});

const EditBlockWrapper = (props) => {
  const hideHandler = (data) => {
    return (
      !!data.fixed ||
      (!config.experimental.addBlockButton.enabled &&
        !(blockHasValue(data) && props.blockProps.editable))
    );
  };

  const { intl, blockProps, draginfo, children } = props;
  const {
    allowedBlocks,
    showRestricted,
    block,
    blocksConfig,
    selected,
    multiSelected,
    type,
    onChangeBlock,
    onChangeFormData,
    onDeleteBlock,
    onInsertBlock,
    onSelectBlock,
    onMutateBlock,
    data: originalData,
    editable,
    properties,
    showBlockChooser,
    navRoot,
    contentType,
  } = blockProps;

  const [dropPosition, setDropPosition] = useState(null);

  const data = applyBlockDefaults({ data: originalData, ...blockProps, intl });
  const isSelectedOrMulti = selected || multiSelected;
  const visible = (selected || multiSelected) && !hideHandler(data);
  const required = isBoolean(data.required)
    ? data.required
    : includes(config.blocks.requiredBlocks, type);

  let classNames = buildStyleClassNamesFromData(data.styles);
  classNames = buildStyleClassNamesExtenders({
    block,
    content: properties,
    data,
    classNames,
  });
  const style = buildStyleObjectFromData(data);

  const styleMergedWithDragProps = {
    ...draginfo.draggableProps,
    style: { ...style, ...draginfo.draggableProps.style },
  };

  // Mosaic 2D Canvas Drag-and-Drop (root level only):
  //   left/right edge -> split into columns, otherwise -> insert above/below.
  // Blocks living inside a row column are handled by the column itself
  // (RowEdit), so only one drop line is ever visible.
  const isNested = !!blockProps.isContainer;

  useEffect(() => {
    const clear = () => {
      setDropPosition(null);
      if (typeof document !== 'undefined') {
        document.body.classList.remove('is-dragging-volto-block');
      }
    };
    window.addEventListener('dragend', clear);
    window.addEventListener('drop', clear);
    return () => {
      window.removeEventListener('dragend', clear);
      window.removeEventListener('drop', clear);
    };
  }, []);

  const computeDropPosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = (e.clientY - rect.top) / rect.height;
    if (isNested) {
      return relY < 0.5 ? 'top' : 'bottom';
    }
    const relX = (e.clientX - rect.left) / rect.width;
    if (relX < 0.2) return 'left';
    if (relX > 0.8) return 'right';
    return relY < 0.5 ? 'top' : 'bottom';
  };

  // When the pointer is over a column of a row living inside this wrapper,
  // let the column (RowEdit) handle the drop so blocks can be inserted
  // above/below items inside that column instead of around the whole row.
  const isOverOwnRowColumn = (e) => {
    if (isNested) return false;
    const target = e.target;
    if (!target || typeof target.closest !== 'function') return false;
    const col = target.closest('.row-column');
    return !!col && e.currentTarget.contains(col);
  };

  const handleDragOver = (e) => {
    const draggingId =
      typeof window !== 'undefined' ? window.__volto_dragging_block_id : null;
    if (!draggingId || draggingId === block) {
      if (dropPosition !== null) setDropPosition(null);
      return;
    }
    if (isOverOwnRowColumn(e)) {
      if (dropPosition !== null) setDropPosition(null);
      return;
    }
    // A column (or another block) inside this one already claimed the event
    if (e.nativeEvent.__voltoDropHandled) {
      if (dropPosition !== null) setDropPosition(null);
      return;
    }

    if (isNested) {
      // Reordering above or below within the same column
      const currentItems = properties?.blocks_layout?.items || [];
      if (currentItems.includes(draggingId) && currentItems.includes(block)) {
        e.nativeEvent.__voltoDropHandled = true;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const relY = (e.clientY - rect.top) / rect.height;
        const pos = relY < 0.5 ? 'top' : 'bottom';
        if (pos !== dropPosition) setDropPosition(pos);
      }
      return;
    }

    e.nativeEvent.__voltoDropHandled = true;
    e.preventDefault();
    const pos = computeDropPosition(e);
    if (pos !== dropPosition) setDropPosition(pos);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropPosition(null);
    }
  };

  const handleDrop = (e) => {
    if (e.nativeEvent.__voltoDropHandled) return;
    if (isOverOwnRowColumn(e)) {
      setDropPosition(null);
      return;
    }
    const draggingId =
      e.dataTransfer.getData('text/volto-block-id') ||
      e.dataTransfer.getData('application/x-volto-block-id') ||
      (typeof window !== 'undefined' ? window.__volto_dragging_block_id : null);
    const pos = dropPosition || computeDropPosition(e);

    if (draggingId && draggingId !== block && properties && onChangeFormData) {
      if (isNested) {
        const currentItems = properties.blocks_layout?.items || [];
        if (currentItems.includes(draggingId) && currentItems.includes(block)) {
          e.nativeEvent.__voltoDropHandled = true;
          e.preventDefault();
          e.stopPropagation();

          const items = currentItems.filter((id) => id !== draggingId);
          const targetIdx = items.indexOf(block);
          const insertIdx = pos === 'top' ? targetIdx : targetIdx + 1;
          items.splice(insertIdx, 0, draggingId);

          onChangeFormData({
            ...properties,
            blocks_layout: { items },
          });

          if (onSelectBlock) {
            onSelectBlock(draggingId);
          }

          setDropPosition(null);
          if (typeof window !== 'undefined') {
            window.__volto_dragging_block_id = null;
          }
          if (typeof document !== 'undefined') {
            document.body.classList.remove('is-dragging-volto-block');
          }
          return;
        }
        // If dragged block is from outside this column, don't claim it here so it bubbles to RowEdit
        setDropPosition(null);
        return;
      }

      e.nativeEvent.__voltoDropHandled = true;
      e.preventDefault();
      e.stopPropagation();

      if (pos === 'left' || pos === 'right') {
        const result = splitBlocksIntoRow(properties, block, draggingId, pos);
        onChangeFormData(result);
        if (onSelectBlock && result.newRowId) {
          onSelectBlock(result.newRowId);
        }
      } else {
        const result = moveBlockToRoot(properties, draggingId, block, pos);
        onChangeFormData(result);
        if (onSelectBlock) {
          onSelectBlock(draggingId);
        }
      }

      setDropPosition(null);
      if (typeof window !== 'undefined') {
        window.__volto_dragging_block_id = null;
      }
      if (typeof document !== 'undefined') {
        document.body.classList.remove('is-dragging-volto-block');
      }
    }
  };

  const handleModifierClick = (e) => {
    const isMultipleSelection = e.shiftKey || e.ctrlKey || e.metaKey;
    if (isMultipleSelection && onSelectBlock) {
      e.preventDefault();
      e.stopPropagation();
      onSelectBlock(block, true, e);
    }
  };

  return (
    <div
      ref={draginfo.innerRef}
      {...styleMergedWithDragProps}
      data-block-id={block}
      className={cx(
        `block-editor-${data['@type']}`,
        'has-horizontal-drop-zone',
        classNames,
        {
          [data.align]: data.align,
          [`has--block-width--${data.blockWidth || 'default'}`]: !isNested,
          'is-selected': selected,
          'is-multi-selected': multiSelected,
          selected: isSelectedOrMulti,
          multiSelected: multiSelected,
        },
      )}
      onMouseDownCapture={(e) => {
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
          e.preventDefault();
        }
      }}
      onClickCapture={handleModifierClick}
      onDragOverCapture={handleDragOver}
      onDragLeave={handleDragLeave}
      onDropCapture={handleDrop}
    >
      {/* Mosaic drop line: vertical = new column, horizontal = above/below */}
      {dropPosition && (
        <div
          className={cx(
            'mosaic-drop-line',
            dropPosition === 'left' || dropPosition === 'right'
              ? 'vertical'
              : 'horizontal',
            dropPosition,
          )}
        />
      )}

      <div style={{ position: 'relative' }}>
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            const isMultipleSelection = e.shiftKey || e.ctrlKey || e.metaKey;
            if (onSelectBlock) {
              onSelectBlock(block, isMultipleSelection, e);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              const isMultipleSelection = e.shiftKey || e.ctrlKey || e.metaKey;
              if (onSelectBlock) {
                onSelectBlock(block, isMultipleSelection, e);
              }
            }
          }}
          draggable={true}
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer.setData('text/volto-block-id', block);
            e.dataTransfer.setData('application/x-volto-block-id', block);
            e.dataTransfer.effectAllowed = 'move';
            if (typeof window !== 'undefined') {
              window.__volto_dragging_block_id = block;
            }
            if (typeof document !== 'undefined') {
              document.body.classList.add('is-dragging-volto-block');
            }
          }}
          onDragEnd={() => {
            if (typeof window !== 'undefined') {
              window.__volto_dragging_block_id = null;
            }
            if (typeof document !== 'undefined') {
              document.body.classList.remove('is-dragging-volto-block');
            }
            setDropPosition(null);
          }}
          className={cx('drag handle wrapper', {
            'is-selected': selected,
            'is-multi-selected': multiSelected,
            'is-hidden': !visible,
            'is-nested-handle': isNested,
            'is-root-handle': !isNested,
            'is-row-handle': type === 'row',
          })}
          aria-label={intl.formatMessage(messages.drag_block, { type })}
          title={
            type === 'row' ? 'Drag entire Row' : 'Drag to reorder or move block'
          }
        >
          <Icon name={dragSVG} size={type === 'row' ? '12px' : '16px'} />
          {type === 'row' && <span className="row-handle-label">Row</span>}
        </div>
        <div className={`ui drag block inner ${type}`}>
          {children}
          {selected && !required && editable && (
            <button
              type="button"
              onClick={() => onDeleteBlock(block, true)}
              className="block-delete-button delete-button"
              aria-label={intl.formatMessage(messages.delete_block, { type })}
              title={
                intl.formatMessage(messages.delete_block, { type }) ||
                'Delete block'
              }
            >
              <Icon name={trashSVG} size="18px" />
            </button>
          )}
          {config.experimental.addBlockButton.enabled && showBlockChooser && (
            <BlockChooserButton
              data={data}
              block={block}
              onInsertBlock={(id, value) => {
                if (blockHasValue(data)) {
                  onSelectBlock(onInsertBlock(id, value));
                } else {
                  const blocksFieldname = getBlocksFieldname(properties);
                  const newFormData = applyBlockInitialValue({
                    id,
                    value,
                    blocksConfig,
                    formData: {
                      ...properties,
                      [blocksFieldname]: {
                        ...properties[blocksFieldname],
                        [id]: value || null,
                      },
                    },
                    intl,
                  });
                  const newValue = newFormData[blocksFieldname][id];
                  onChangeBlock(id, newValue);
                }
              }}
              onMutateBlock={onMutateBlock}
              allowedBlocks={allowedBlocks}
              showRestricted={showRestricted}
              blocksConfig={blocksConfig}
              size="24px"
              properties={properties}
              navRoot={navRoot}
              contentType={contentType}
            />
          )}
        </div>
      </div>

      {selected &&
        !isNested &&
        type !== 'row' &&
        (!properties?.blocks_layout?.items ||
          properties.blocks_layout.items.includes(block)) && (
          <SidebarPortal selected={selected} tab="sidebar-row">
            <StandaloneRowSettings
              block={block}
              type={type}
              data={data}
              onChangeBlock={onChangeBlock}
              onChangeFormData={onChangeFormData}
              onSelectBlock={onSelectBlock}
              properties={properties}
            />
          </SidebarPortal>
        )}
    </div>
  );
};

export default injectIntl(EditBlockWrapper);
