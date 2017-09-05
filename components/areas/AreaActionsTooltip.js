import React from 'react';
import PropTypes from 'prop-types';
import { Autobind } from 'es-decorators';

class AreaActionsTooltip extends React.Component {
  componentDidMount() {
    document.addEventListener('mousedown', this.triggerMouseDown);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.triggerMouseDown);
  }

  @Autobind
  triggerMouseDown(e) {
    const el = document.querySelector('.c-tooltip');
    const clickOutside = el && el.contains && !el.contains(e.target);
    if (clickOutside) {
      this.props.toggleTooltip(false);
    }
  }

  @Autobind
  handleClick(link) {
    switch (link) { // eslint-disable-line default-case
      case 'edit_area':
        this.props.onEditArea();
        break;
      case 'edit_subscriptions':
        this.props.onEditSubscriptions();
        break;
    }
    this.props.toggleTooltip(false);
  }

  render() {
    return (
      <div className="c-area-actions-tooltip">
        <ul>
          <li>
            <button onClick={() => this.handleClick('edit_area')}>
              Edit area
            </button>
          </li>
          <li>
            <button onClick={() => this.handleClick('edit_subscriptions')}>
              Edit subscriptions
            </button>
          </li>
        </ul>
      </div>
    );
  }
}

AreaActionsTooltip.propTypes = {
  toggleTooltip: PropTypes.func.isRequired,
  // Callbacks
  onEditArea: PropTypes.func.isRequired,
  onEditSubscriptions: PropTypes.func.isRequired
};

export default AreaActionsTooltip;
