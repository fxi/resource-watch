import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import classnames from 'classnames';

// Utils
import { logEvent } from 'utils/analytics';

// Components
import Map from 'components/ui/map/Map';
import MapControls from 'components/ui/map/MapControls';
import BasemapControl from 'components/ui/map/controls/BasemapControl';
import ShareControl from 'components/ui/map/controls/ShareControl';

import { Legend, LegendItemToolbar, LegendItemTypes } from 'wri-api-components';

// Utils
import LayerManager from 'utils/layers/LayerManager';

class ExploreMapComponent extends React.Component {
  static propTypes = {
    zoom: PropTypes.number,
    latLng: PropTypes.object,
    layerGroups: PropTypes.array,

    // Actions
    setMapZoom: PropTypes.func,
    setMapLatLng: PropTypes.func,
    toggleMapLayerGroup: PropTypes.func,
    setMapLayerGroupVisibility: PropTypes.func,
    setMapLayerGroupOpacity: PropTypes.func,
    setMapLayerGroupActive: PropTypes.func,
    setMapLayerGroupsOrder: PropTypes.func
  };

  // Legend actions
  onChangeOpacity = debounce((l, opacity) => {
    this.props.setMapLayerGroupOpacity({ dataset: { id: l.dataset }, opacity });
  }, 500)

  onChangeVisibility = (l, visibility) => {
    this.props.setMapLayerGroupVisibility({ dataset: { id: l.dataset }, visibility });
  }

  onChangeLayer = (l) => {
    this.props.setMapLayerGroupActive({ dataset: { id: l.dataset }, active: l.id });
  }

  onRemoveLayer = (l) => {
    this.props.toggleMapLayerGroup({ dataset: { id: l.dataset }, toggle: false });
  }

  onChangeOrder = (datasetIds) => {
    this.props.setMapLayerGroupsOrder({ datasetIds });
  }

  // Map params
  onMapParams = debounce(({ zoom, latLng }) => {
    this.props.setMapZoom(zoom);
    this.props.setMapLatLng(latLng);
  }, 1000)

  render() {
    const { zoom, latLng, layerGroups } = this.props;

    return (
      <div className="l-map">
        <Map
          mapConfig={{ zoom, latLng }}
          onMapParams={this.onMapParams}
          setMapInstance={(map) => { this.map = map; }}
          disableScrollZoom={false}
          // layerManager
          layerGroups={layerGroups}
          LayerManager={LayerManager}
          // // Interaction
          // interaction={interaction}
          // interactionLatLng={interactionLatLng}
          // interactionSelected={interactionSelected}
          // setLayerInteraction={this.props.setLayerInteraction}
          // setLayerInteractionSelected={this.props.setLayerInteractionSelected}
          // setLayerInteractionLatLng={this.props.setLayerInteractionLatLng}
          // resetLayerInteraction={this.props.resetLayerInteraction}
        />

        <MapControls>
          <ShareControl />
          <BasemapControl />
        </MapControls>

        <div className="c-legend-map">
          <Legend
            maxHeight={300}
            layerGroups={layerGroups}
            // Item
            LegendItemToolbar={<LegendItemToolbar />}
            LegendItemTypes={<LegendItemTypes />}
            // Actions
            onChangeInfo={this.onChangeInfo}
            onChangeOpacity={this.onChangeOpacity}
            onChangeVisibility={this.onChangeVisibility}
            onChangeLayer={this.onChangeLayer}
            onChangeOrder={this.onChangeOrder}
            onRemoveLayer={this.onRemoveLayer}
          />
        </div>
      </div>
    );
  }
}

export default ExploreMapComponent;
