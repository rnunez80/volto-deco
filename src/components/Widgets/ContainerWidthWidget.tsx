import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ButtonsWidget, {
  type ActionInfo,
  type ButtonsWidgetProps,
} from '@plone/volto/components/manage/Widgets/ButtonsWidget';
import imageNarrowSVG from '@plone/volto/icons/image-narrow.svg';
import imageFitSVG from '@plone/volto/icons/image-fit.svg';
import imageWideSVG from '@plone/volto/icons/image-wide.svg';
import imageFullSVG from '@plone/volto/icons/image-full.svg';
import type { IntlShape } from 'react-intl';

const messages = defineMessages({
  narrow: {
    id: 'Narrow (720px)',
    defaultMessage: 'Narrow (720px)',
  },
  default: {
    id: 'Default (940px)',
    defaultMessage: 'Default (940px)',
  },
  layout: {
    id: 'Layout (1440px)',
    defaultMessage: 'Layout (1440px)',
  },
  full: {
    id: 'Full Width (100%)',
    defaultMessage: 'Full Width (100%)',
  },
});

export const defaultActionsInfo = ({
  intl,
}: {
  intl: IntlShape;
}): Record<string, ActionInfo> => ({
  narrow: [imageNarrowSVG, intl.formatMessage(messages.narrow)],
  default: [imageFitSVG, intl.formatMessage(messages.default)],
  layout: [imageWideSVG, intl.formatMessage(messages.layout)],
  full: [imageFullSVG, intl.formatMessage(messages.full)],
});

export type ContainerWidthWidgetProps = ButtonsWidgetProps & {
  defaultAction?: string;
};

const ContainerWidthWidget = (props: ContainerWidthWidgetProps) => {
  const intl = useIntl();

  const {
    actions = ['narrow', 'default', 'layout', 'full'],
    actionsInfoMap,
    default: defaultValue,
    defaultAction,
    value,
  } = props;

  let stringValue = value;
  if (typeof value === 'object' && value !== null) {
    const cssVal = (value as any)['--block-width'];
    if (cssVal === 'var(--narrow-container-width)') stringValue = 'narrow';
    else if (cssVal === 'var(--layout-container-width)') stringValue = 'layout';
    else if (cssVal === 'unset') stringValue = 'full';
    else stringValue = 'default';
  }

  const actionsInfo = {
    ...defaultActionsInfo({ intl }),
    ...actionsInfoMap,
  };

  return (
    <ButtonsWidget
      {...props}
      value={stringValue}
      actions={actions}
      actionsInfoMap={actionsInfo}
      default={defaultValue ?? defaultAction ?? 'default'}
    />
  );
};

export default ContainerWidthWidget;
