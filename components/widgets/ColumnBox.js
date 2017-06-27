import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import { Autobind } from 'es-decorators';
import classNames from 'classnames';

// Store
import withRedux from 'next-redux-wrapper';
import { initStore } from 'store';
import { removeFilter, removeColor, removeCategory, removeValue, removeSize } from 'redactions/widgetEditor';
import { toggleTooltip } from 'redactions/tooltip';

// Components
import Icon from 'components/ui/Icon';
import FilterTooltip from 'components/widgets/FilterTooltip';
import AggregateFunctionTooltip from 'components/widgets/AggregateFunctionTooltip';

/**
 * Implements the drag source contract.
 */
const columnBoxSource = {
  beginDrag(props) {
    return {
      name: props.name,
      type: props.type,
      datasetID: props.datasetID,
      tableName: props.tableName
    };
  }
};

/**
 * Specifies the props to inject into your component.
 */
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

class ColumnBox extends React.Component {

  /**
   * Return the position of the click within the page taking
   * into account the scroll (relative to the page, not the
   * viewport )
   * @static
   * @param {MouseEvent} e Event
   * @returns {{ x: number, y: number }}
   */
  static getClickPosition(e) {
    return {
      x: window.scrollX + e.clientX,
      y: window.scrollY + e.clientY
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      // Value of the aggregate function
      aggregateFunction: null,
      // Value of the filter
      filter: null
    };
  }

  componentWillReceiveProps(nextProps) {
    // We add a dragging cursor to the column box if it's being dragged
    // We have to set the CSS property to the body otherwise it won't be
    // taken into account
    if (nextProps.isDragging !== this.props.isDragging) {
      document.body.classList.toggle('-dragging', nextProps.isDragging);
    }
  }

  @Autobind
  onApplyFilter(filter) {
    this.setState({ filter });

    if (this.props.onConfigure) {
      this.props.onConfigure({ name: this.props.name, value: filter });
    }
  }

  @Autobind
  onApplyAggregateFunction(aggregateFunction) {
    const fn = aggregateFunction === 'none'
      ? null
      : aggregateFunction;

    this.setState({ aggregateFunction: fn });

    if (this.props.onConfigure) {
      this.props.onConfigure({ name: this.props.name, value: fn });
    }
  }

  @Autobind
  triggerClose() {
    const { isA } = this.props;
    switch (isA) {
      case 'color':
        this.props.removeColor({ name: this.props.name });
        break;
      case 'size':
        this.props.removeSize({ name: this.props.name });
        break;
      case 'filter':
        this.props.removeFilter({ name: this.props.name });
        break;
      case 'category':
        this.props.removeCategory();
        break;
      case 'value':
        this.props.removeValue();
        break;
      default:
    }
  }

  @Autobind
  triggerConfigure(event) {
    const { filter, aggregateFunction } = this.state;
    const { isA, name, type, datasetID, tableName } = this.props;

    switch (isA) {
      case 'color':
        break;
      case 'size':
        break;
      case 'filter':
        this.props.toggleTooltip(true, {
          follow: false,
          position: ColumnBox.getClickPosition(event),
          children: FilterTooltip,
          childrenProps: {
            name,
            type,
            datasetID,
            tableName,
            filter,
            onApply: this.onApplyFilter
          }
        });
        break;
      case 'category':
        break;
      case 'value':
        this.props.toggleTooltip(true, {
          follow: false,
          position: ColumnBox.getClickPosition(event),
          children: AggregateFunctionTooltip,
          childrenProps: {
            name,
            type,
            datasetID,
            tableName,
            onApply: this.onApplyAggregateFunction,
            aggregateFunction
          }
        });
        break;
      default:
    }
  }

  render() {
    const { aggregateFunction } = this.state;
    const { isDragging, connectDragSource, name, type, closable, configurable, isA } = this.props;
    const iconName = (type.toLowerCase() === 'string') ? 'icon-type' : 'icon-hash';

    const isConfigurable = (isA === 'filter') || (isA === 'value');

    return connectDragSource(
      <div className={classNames({ 'c-columnbox': true, '-dimmed': isDragging })}>
        <Icon
          name={iconName}
          className="-smaller"
        />
        {name}
        {aggregateFunction &&
          <div className="aggregate-function">
            {aggregateFunction}
          </div>
        }
        {closable &&
          <button onClick={this.triggerClose}>
            <Icon
              name="icon-cross"
              className="-smaller close-button"
            />
          </button>
        }
        {configurable && isConfigurable &&
          <button onClick={this.triggerConfigure}>
            <Icon
              name="icon-cog"
              className="-smaller configure-button"
            />
          </button>
        }
      </div>
    );
  }
}

ColumnBox.propTypes = {
  // NOTE: Don't make any of the following props as required as React will
  // throw prop checks errors because of react-dnd (don't know why)
  tableName: PropTypes.string,
  datasetID: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  isA: PropTypes.string,
  closable: PropTypes.bool,
  configurable: PropTypes.bool,
  onConfigure: PropTypes.func,
  // Injected by React DnD:
  isDragging: PropTypes.bool,
  connectDragSource: PropTypes.func,
  // ACTIONS
  removeFilter: PropTypes.func.isRequired,
  removeSize: PropTypes.func.isRequired,
  removeColor: PropTypes.func.isRequired,
  removeCategory: PropTypes.func.isRequired,
  removeValue: PropTypes.func.isRequired,
  toggleTooltip: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => ({
  removeFilter: (filter) => {
    dispatch(removeFilter(filter));
  },
  removeColor: (color) => {
    dispatch(removeColor(color));
  },
  removeSize: (size) => {
    dispatch(removeSize(size));
  },
  removeCategory: (category) => {
    dispatch(removeCategory(category));
  },
  removeValue: (value) => {
    dispatch(removeValue(value));
  },
  toggleTooltip: (opened, opts) => {
    dispatch(toggleTooltip(opened, opts));
  }
});

export default DragSource('columnbox', columnBoxSource, collect)(withRedux(initStore, null, mapDispatchToProps)(ColumnBox));
