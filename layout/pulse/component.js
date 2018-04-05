import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import renderHTML from 'react-render-html';

// Redux
import { connect } from 'react-redux';
import { initStore } from 'store';
import { getLayers, getLayerPoints, resetLayerPoints } from 'layout/pulse/actions';
import { toggleActiveLayer } from 'layout/pulse/layer-menu/actions';
import { toggleTooltip } from 'redactions/tooltip';

// Selectors
import getLayersGroupPulse from 'selectors/pulse/layersGroupPulse';
import getActiveLayersPulse from 'selectors/pulse/layersActivePulse';

// Helpers
import LayerGlobeManager from 'utils/layers/LayerGlobeManager';
import { substitution } from 'utils/utils';

// Utils
import { logEvent } from 'utils/analytics';
import { isIE } from 'utils/browser';

// Components
import LayerContainer from 'layout/pulse/layer-container';
import LayerMenu from 'layout/pulse/layer-menu';
import LayerCard from 'layout/pulse/layer-card';
import Modal from 'components/modal/modal-component';
import SubmitModalComponent from 'components/modal/submit-modal';
import Spinner from 'components/ui/Spinner';
import ZoomControl from 'components/ui/ZoomControl';
import GlobeTooltip from 'layout/pulse/globe-tooltip';
import GlobeCesium from 'components/vis/globe-cesium';
import Page from 'layout/page';
import Layout from 'layout/layout/layout-app';

// Cesium
let Cesium;

class Pulse extends Page {
  constructor(props) {
    super(props);
    this.state = {
      selectedMarker: null,
      interactionConfig: null,
      zoom: 0,
      showIEPopup: false
    };
    this.layerGlobeManager = new LayerGlobeManager();

    // -------------------------- Bindings ----------------------------
    this.handleMouseHoldOverGlobe = debounce(this.handleMouseHoldOverGlobe.bind(this), 10);
    this.triggerZoomIn = this.triggerZoomIn.bind(this);
    this.triggerZoomOut = this.triggerZoomOut.bind(this);
    this.handleMouseClick = this.handleMouseClick.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMarkerSelected = this.handleMarkerSelected.bind(this);
    this.handleEarthClicked = this.handleEarthClicked.bind(this);
    this.handleClickInEmptyRegion = this.handleClickInEmptyRegion.bind(this);
    this.setTooltipValue = this.setTooltipValue.bind(this);
    this.handleCesiumClick = this.handleCesiumClick.bind(this);
    this.handleCesiumMouseDown = this.handleCesiumMouseDown.bind(this);
    this.handleCesiumMoveStart = this.handleCesiumMoveStart.bind(this);
    this.handleShapesCreated = this.handleShapesCreated.bind(this);
    //------------------------------------------------------------------
  }

  /**
   * COMPONENT LIFECYCLE
   * - componentDidMount
   * - componentWillReceiveProps
   * - componentWillUnmount
  */
  componentDidMount() {
    // Init Cesium var
    Cesium = window.Cesium; // eslint-disable-line prefer-destructuring
    Cesium.BingMapsApi.defaultKey = process.env.BING_MAPS_API_KEY;

    this.props.getLayers();
    document.addEventListener('click', this.handleMouseClick);
  }

  componentWillReceiveProps(nextProps) {
    const { layerActive } = this.props.layerMenuPulse;
    const nextLayerActive = nextProps.layerMenuPulse.layerActive;
    const lastId = (layerActive) ? layerActive.id : null;
    const newId = (nextLayerActive) ? nextLayerActive.id : null;
    if (lastId !== newId) {
      if (nextLayerActive) {
        this.setState({
          interactionConfig: nextLayerActive.attributes.interactionConfig
        });

        if (nextLayerActive.threedimensional) {
          const url = nextLayerActive.attributes.layerConfig.pulseConfig.url;
          this.props.getLayerPoints(url);
        } else {
          this.props.resetLayerPoints();
        }
      } else {
        this.layerGlobeManager.abortRequest();
      }
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleMouseClick);
    this.props.toggleTooltip(false);
    this.props.toggleActiveLayer({});
    this.props.resetLayerPoints();
    this.mounted = false;
    if (isIE()) {
      this.setState({
        showIEPopup: true
      });
    }
  }

  /**
  * UI EVENTS
  * - triggerZoomIn
  * - triggerZoomOut
  * - handleMouseClick
  * - handleMouseDown
  * - handleMarkerSelected
  * - handleEarthClicked
  * - handleClickInEmptyRegion
  * - handleMouseHoldOverGlobe
  */
  handleMouseHoldOverGlobe() {
    this.props.toggleTooltip(false);
  }
  triggerZoomIn() {
    this.setState({ zoom: this.state.zoom - 1000000 });
  }
  triggerZoomOut() {
    this.setState({ zoom: this.state.zoom + 1000000 });
  }
  handleMouseClick(event) {
    if (event.target.tagName !== 'CANVAS') {
      this.props.toggleTooltip(false);
    }
  }
  handleMouseDown() {
    this.props.toggleTooltip(false);
  }
  handleMarkerSelected(marker, event) {
    const tooltipContentObj = this.state.interactionConfig.output.map(elem =>
      ({ key: elem.property, value: marker[elem.column], type: elem.type }));

    if (this.mounted) {
      this.props.toggleTooltip(true, {
        follow: false,
        children: GlobeTooltip,
        childrenProps: { value: tooltipContentObj },
        position: { x: event.clientX, y: event.clientY }
      });
    }
  }
  handleEarthClicked(latLon, clientX, clientY) {
    const { layerMenuPulse } = this.props;
    const { interactionConfig } = this.state;
    this.props.toggleTooltip(false);

    if (layerMenuPulse.layerActive && interactionConfig.pulseConfig) {
      const requestURL = substitution(
        interactionConfig.pulseConfig.url,
        [{ key: 'point', value: `[${latLon.longitude}, ${latLon.latitude}]` }]
      );
      this.setTooltipValue(requestURL, clientX, clientY);
      logEvent('Planet Pulse', 'Click a datapoint', `${latLon.latitude},${latLon.longitude}`);
    }
  }
  handleClickInEmptyRegion() {
    this.props.toggleTooltip(false);
  }

  /**
  * HELPER FUNCTIONS
  * - setTooltipValue
  */
  setTooltipValue(requestURL, tooltipX, tooltipY) {
    fetch(new Request(requestURL))
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      }).then((response) => {
        if (response.data.length > 0) {
          const obj = response.data[0];

          const tooltipContentObj = this.state.interactionConfig.output.map(elem =>
            ({ key: elem.property, value: obj[elem.column], type: elem.type }));

          this.props.toggleTooltip(true, {
            follow: false,
            children: GlobeTooltip,
            childrenProps: { value: tooltipContentObj },
            position: { x: tooltipX, y: tooltipY }
          });
        }
      });
  }

  handleCesiumClick(e) {
    const { layerMenuPulse } = this.props;
    const { viewer, clickedPosition } = e;
    const { scene, camera } = viewer;
    const { globe } = scene;
    const { ellipsoid } = globe;
    const threedimensional = layerMenuPulse.layerActive &&
      layerMenuPulse.layerActive.threedimensional;
    const mousePosition = new Cesium.Cartesian2(clickedPosition.x, clickedPosition.y);

    const cartesian = camera.pickEllipsoid(mousePosition, ellipsoid);

    if (cartesian && threedimensional !== 'true') {
      const cartographic = ellipsoid.cartesianToCartographic(cartesian);
      const longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
      const latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
      this.handleEarthClicked(
        { longitude: longitudeString, latitude: latitudeString },
        clickedPosition.x, clickedPosition.y + 75
      ); // TODO: 75 is the header height
    }
  }

  handleCesiumMouseDown() {
    this.props.toggleTooltip(false);
  }

  handleCesiumMoveStart() {
    this.props.toggleTooltip(false);
  }

  handleShapesCreated() {
    this.setState({ loading: false });
  }

  render() {
    const {
      url,
      layersGroup,
      layerMenuPulse,
      pulse,
      globeCesium
    } = this.props;
    const { layerActive } = layerMenuPulse;
    // const { layerPoints } = pulse;
    const { zoom, showIEPopup } = this.state;
    // const shapes = this.getShapes(layerPoints, layerActive && layerActive.markerType);

    // Check if there's a custom basemap
    const basemap = layerActive && layerActive.basemap;

    return (
      <Layout
        title="Planet Pulse"
        description="Planet Pulse description"
        url={url}
        user={this.props.user}
      >
        {showIEPopup &&
          <Modal
            isOpen
            className="-medium"
            onRequestClose={() => this.setState({ showIEPopup: false })}
          >
            <SubmitModalComponent
              header="Monitoring the Planets Pulse"
              text={renderHTML('Resource Watch provides trusted and timely data for a more sustainable future. Please visit this link in <a href="https://www.google.com/chrome/" target="_blank">Chrome</a> or <a href="https://www.mozilla.org/en-US/firefox/new/" target="_blank">Firefox</a> to see the latest data on the world today.')}
            />
          </Modal>
        }
        <div
          className="p-pulse l-map -dark"
        >
          <Spinner
            isLoading={
              pulse.loading ||
              layerMenuPulse.loading ||
              (pulse.layerPoints.length > 0 && !globeCesium.shapesCreated)
            }
          />
          <GlobeCesium
            basemap={basemap}
            zoom={zoom}
            contextLayersOnTop={layerActive && layerActive.contextLayersOnTop}
            onClick={this.handleCesiumClick}
            onMouseDown={this.handleCesiumMouseDown}
            onMoveStart={this.handleCesiumMoveStart}
            onShapesCreated={this.handleShapesCreated}
          />
          <LayerContainer>
            <LayerMenu
              layerActive={layerActive}
              layersGroup={layersGroup}
            />
            <LayerCard />
          </LayerContainer>
          <ZoomControl
            onZoomIn={this.triggerZoomIn}
            onZoomOut={this.triggerZoomOut}
          />
        </div>
      </Layout>
    );
  }
}

Pulse.propTypes = {
  // ROUTER
  url: PropTypes.object,

  // STORE
  layersGroup: PropTypes.array,
  layerActive: PropTypes.object,
  getLayers: PropTypes.func.isRequired,
  getLayerPoints: PropTypes.func.isRequired,
  toggleTooltip: PropTypes.func.isRequired,
  toggleActiveLayer: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  layerMenuPulse: state.layerMenuPulse,
  pulse: state.pulse,
  layersGroup: getLayersGroupPulse(state),
  layerActive: getActiveLayersPulse(state),
  globeCesium: state.globeCesium
});

const mapDispatchToProps = {
  getLayers,
  toggleTooltip,
  getLayerPoints,
  toggleActiveLayer,
  resetLayerPoints
};

export default connect(mapStateToProps, mapDispatchToProps)(Pulse);
