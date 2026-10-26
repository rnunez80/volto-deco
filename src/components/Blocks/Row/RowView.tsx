import React from 'react';
import cx from 'classnames';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';
import { withBlockExtensions } from '@plone/volto/helpers/Extensions';
import config from '@plone/volto/registry';
import { normalizeRowData, deriveGridTemplate } from './normalize';
import { getImageUrl } from '../../../helpers/getImageUrl';

interface RowViewProps {
  data: any;
  path?: string;
  className?: string;
  style?: React.CSSProperties;
  metadata?: any;
  properties?: any;
  blocksConfig?: any;
  [key: string]: any;
}

const RowView: React.FC<RowViewProps> = (props) => {
  const { path, className, style } = props;
  const rawData = props.data;

  if (!rawData) {
    return null;
  }

  // Transparently normalize legacy columnsBlock or gridBlock data on-the-fly
  const data = normalizeRowData(rawData);

  const metadata = props.metadata || props.properties;
  const blocksConfig =
    config.blocks.blocksConfig[data['@type']]?.blocksConfig ||
    props.blocksConfig ||
    config.blocks.blocksConfig;

  const location = { pathname: path };
  const columnIds = data.blocks_layout?.items || [];
  const blockWidth = data.blockWidth || 'default';
  const styleName = data.style_name || data.styles?.style_name;
  const customClass = data.styles?.customClass;
  const gridTemplate =
    data.gridTemplate || deriveGridTemplate(data.blocks_layout, data.blocks);

  const bgImageUrl = getImageUrl(data.backgroundImage);
  const hasBackground =
    !!(styleName && styleName !== 'none') || !!bgImageUrl;

  const mergedStyle: React.CSSProperties = {
    ...style,
    ...(bgImageUrl
      ? {
          backgroundImage: `url(${bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }
      : {}),
  };

  return (
    <div
      className={cx(
        'block',
        'row',
        `has--block-width--${blockWidth}`,
        styleName ? `has--style_name--${styleName}` : null,
        hasBackground ? 'has--background' : null,
        bgImageUrl ? 'has--background-image' : null,
        customClass,
        className,
      )}
      style={mergedStyle}
    >
      <div className="block-inner-container">
        {data.headline && <h2 className="headline">{data.headline}</h2>}

        <div
          className={cx('row-inner-container', {
            'gap--small': data.gridGap === 'small',
            'gap--large': data.gridGap === 'large',
            'gap--none': data.gridGap === 'none',
            [`align--${data.alignItems || 'stretch'}`]: true,
            'reverse-mobile': !!data.reverseMobile,
          })}
          style={{
            gridTemplateColumns: gridTemplate,
          }}
        >
          {columnIds.map((colId: string) => {
            const colData = data.blocks?.[colId];
            if (!colData) return null;

            return (
              <div key={colId} className="row-column">
                <RenderBlocks
                  {...props}
                  metadata={metadata}
                  content={colData}
                  location={location}
                  blocksConfig={blocksConfig}
                  isContainer
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default withBlockExtensions(RowView);
