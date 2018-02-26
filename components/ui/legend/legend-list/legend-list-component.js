import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Components
import LegendListItem from './legend-item';

class Legend extends PureComponent {
  static propTypes = {
    items: PropTypes.array,
    readonly: PropTypes.bool,

    // FUNC
    onChangeLayer: PropTypes.func,
    onChangeOpacity: PropTypes.func,
    onChangeVisibility: PropTypes.func,
    onRemoveLayer: PropTypes.func
  }

  static defaultProps = {
    items: []
  }

  render() {
    const { items } = this.props;

    return (
      <ul className="legend-list">
        {items.map((value, index) => (
          <LegendListItem
            index={index}
            value={value}
            readonly={this.props.readonly}
            onChangeLayer={this.props.onChangeLayer}
            onChangeOpacity={this.props.onChangeOpacity}
            onChangeVisibility={this.props.onChangeVisibility}
            onRemoveLayer={this.props.onRemoveLayer}
          />
        ))}
      </ul>
    );
  }
}

export default Legend;
