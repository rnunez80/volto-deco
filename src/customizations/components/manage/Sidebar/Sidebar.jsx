import React, { useState, Fragment, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button, Tab } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import { withCookies } from 'react-cookie';
import { defineMessages, useIntl } from 'react-intl';
import cx from 'classnames';
import BodyClass from '@plone/volto/helpers/BodyClass/BodyClass';
import { getCookieOptions } from '@plone/volto/helpers/Cookies/cookies';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import forbiddenSVG from '@plone/volto/icons/forbidden.svg';
import { setSidebarTab } from '@plone/volto/actions/sidebar/sidebar';
import expandSVG from '@plone/volto/icons/left-key.svg';
import collapseSVG from '@plone/volto/icons/right-key.svg';

const messages = defineMessages({
  document: {
    id: 'Document',
    defaultMessage: 'Document',
  },
  block: {
    id: 'Block',
    defaultMessage: 'Block',
  },
  row: {
    id: 'Row',
    defaultMessage: 'Row',
  },
  settings: {
    id: 'Settings',
    defaultMessage: 'Settings',
  },
  shrinkSidebar: {
    id: 'Shrink sidebar',
    defaultMessage: 'Shrink sidebar',
  },
  expandSidebar: {
    id: 'Expand sidebar',
    defaultMessage: 'Expand sidebar',
  },
  order: {
    id: 'Order',
    defaultMessage: 'Order',
  },
});

const Sidebar = (props) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const {
    cookies,
    content,
    documentTab,
    blockTab,
    rowTab = true,
    settingsTab,
    orderTab = false,
  } = props;
  const [expanded, setExpanded] = useState(
    cookies.get('sidebar_expanded') !== 'false',
  );
  const [size] = useState(0);
  const [showFull, setshowFull] = useState(true);

  const tab = useSelector((state) => state.sidebar.tab);
  const toolbarExpanded = useSelector((state) => state.toolbar.expanded);
  const type = useSelector((state) => state.schema?.schema?.title);

  const onToggleExpanded = () => {
    cookies.set('sidebar_expanded', !expanded, getCookieOptions());
    setExpanded(!expanded);
    resetFullSizeSidebar();
  };

  const resetFullSizeSidebar = useCallback(() => {
    if (!expanded) {
      const currentResizer = document.querySelector('#sidebar');
      const sidebarContainer =
        currentResizer?.getElementsByClassName('sidebar-container')[0];
      if (sidebarContainer) {
        sidebarContainer.classList.remove('full-size');
        sidebarContainer.classList.remove('no-toolbar');
      }
      setshowFull(true);
    }
  }, [expanded]);

  const onToggleFullSize = useCallback(() => {
    const currentResizer = document.querySelector('#sidebar');
    const sidebarContainer =
      currentResizer?.getElementsByClassName('sidebar-container')[0];

    if (sidebarContainer) {
      if (showFull) {
        sidebarContainer.classList.add('full-size');
        if (!toolbarExpanded) {
          sidebarContainer.classList.add('no-toolbar');
        } else {
          sidebarContainer.classList.remove('no-toolbar');
        }
      } else {
        sidebarContainer.classList.remove('full-size');
        sidebarContainer.classList.remove('no-toolbar');
      }
    }
    setshowFull(!showFull);
  }, [showFull, toolbarExpanded]);

  const onTabChange = (event, data) => {
    event.nativeEvent.stopImmediatePropagation();
    dispatch(setSidebarTab(data.activeIndex));
  };

  const panes = [
    !!documentTab && {
      menuItem: {
        key: 'documentTab',
        as: 'button',
        className: 'ui button',
        type: 'button',
        content: type || intl.formatMessage(messages.document),
      },
      pane: (
        <Tab.Pane
          key="metadata"
          className="tab-wrapper"
          id="sidebar-metadata"
        />
      ),
    },
    !!blockTab && {
      menuItem: {
        key: 'blockTab',
        as: 'button',
        className: 'ui button',
        type: 'button',
        content: intl.formatMessage(messages.block),
      },
      pane: (
        <Tab.Pane
          key="properties"
          className="tab-wrapper"
          id="sidebar-properties"
        >
          <Icon className="tab-forbidden" name={forbiddenSVG} size="48px" />
        </Tab.Pane>
      ),
    },
    !!rowTab && {
      menuItem: {
        key: 'rowTab',
        as: 'button',
        className: 'ui button',
        type: 'button',
        content: intl.formatMessage(messages.row),
      },
      pane: (
        <Tab.Pane key="row" className="tab-wrapper" id="sidebar-row">
          <Icon className="tab-forbidden" name={forbiddenSVG} size="48px" />
        </Tab.Pane>
      ),
    },
    !!orderTab && {
      menuItem: {
        key: 'orderTab',
        as: 'button',
        className: 'ui button item-order',
        type: 'button',
        content: intl.formatMessage(messages.order),
      },
      pane: (
        <Tab.Pane key="order" className="tab-wrapper" id="sidebar-order">
          <Icon className="tab-forbidden" name={forbiddenSVG} size="48px" />
        </Tab.Pane>
      ),
    },
    !!settingsTab && {
      menuItem: {
        key: 'settingsTab',
        as: 'button',
        className: 'ui button',
        type: 'button',
        content: intl.formatMessage(messages.settings),
      },
      pane: (
        <Tab.Pane key="settings" className="tab-wrapper" id="sidebar-settings">
          <Icon className="tab-forbidden" name={forbiddenSVG} size="48px" />
        </Tab.Pane>
      ),
    },
  ].filter(Boolean);

  const activeTab = tab >= panes.length ? 0 : tab;

  return (
    <Fragment>
      <BodyClass
        className={expanded ? 'has-sidebar' : 'has-sidebar-collapsed'}
      />
      <div
        className={cx('sidebar-container', { collapsed: !expanded })}
        style={size > 0 ? { width: size } : null}
      >
        <Button
          type="button"
          aria-label={
            expanded
              ? intl.formatMessage(messages.shrinkSidebar)
              : intl.formatMessage(messages.expandSidebar)
          }
          className={
            content && content.review_state
              ? `${content.review_state} trigger`
              : 'trigger'
          }
          onClick={onToggleExpanded}
        />
        <Button
          type="button"
          className="full-size-sidenav-btn"
          onClick={onToggleFullSize}
          aria-label="full-screen-sidenav"
        >
          <Icon
            className="full-size-icon"
            name={showFull ? expandSVG : collapseSVG}
          />
        </Button>
        <Tab
          menu={{
            secondary: true,
            pointing: true,
            attached: true,
            tabular: true,
            className: 'formtabs',
          }}
          className="tabs-wrapper"
          renderActiveOnly={false}
          activeIndex={activeTab}
          onTabChange={onTabChange}
          panes={panes}
        />
        {/* Hidden portal target for Volto's BlocksForm createPortal so it never throws target container missing error when orderTab is hidden */}
        {!orderTab && <div id="sidebar-order" style={{ display: 'none' }} />}
      </div>
      <div className={expanded ? 'pusher expanded' : 'pusher'} />
    </Fragment>
  );
};

Sidebar.propTypes = {
  documentTab: PropTypes.bool,
  blockTab: PropTypes.bool,
  rowTab: PropTypes.bool,
  settingsTab: PropTypes.bool,
  orderTab: PropTypes.bool,
};

Sidebar.defaultProps = {
  documentTab: true,
  blockTab: true,
  rowTab: true,
  settingsTab: false,
  orderTab: false,
};

export default compose(withCookies)(Sidebar);
