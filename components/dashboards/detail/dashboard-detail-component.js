import React from 'react';
import PropTypes from 'prop-types';

// Wysiwyg
import Wysiwyg from 'vizz-wysiwyg';
import DashboardWidget from 'components/dashboards/wysiwyg/DashboardWidget';
import WidgetBlockEdition from 'components/dashboards/wysiwyg/widget-block-edition/widget-block-edition';

export default function DashboardDetail({ dashboardDetail }) {
  let items = [];

  try {
    items = JSON.parse(dashboardDetail.dashboard.content);
  } catch (e) {
    console.error(e);
  }

  return (
    <Wysiwyg
      readOnly
      items={items}
      blocks={{
        widget: {
          Component: DashboardWidget,
          EditionComponent: WidgetBlockEdition,
          renderer: 'modal'
        }
      }}
    />
  );
}

DashboardDetail.propTypes = {
  dashboardDetail: PropTypes.object
};

DashboardDetail.defaultProps = {
  dashboardDetail: {}
};