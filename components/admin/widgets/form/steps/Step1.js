import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { toastr } from 'react-redux-toastr';
import WidgetEditor from 'widget-editor';

// Constants
import { FORM_ELEMENTS, CONFIG_TEMPLATE, CONFIG_TEMPLATE_OPTIONS } from 'components/admin/widgets/form/constants';

// Components
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import TextArea from 'components/form/TextArea';
import Select from 'components/form/SelectInput';
import Code from 'components/form/Code';
import Checkbox from 'components/form/Checkbox';
import SwitchOptions from 'components/ui/SwitchOptions';
import VegaChart from 'components/widgets/charts/VegaChart';
import Spinner from 'components/ui/Spinner';
import Map from 'components/ui/map/Map';
import Legend from 'components/ui/Legend';

// Utils
import ChartTheme from 'utils/widgets/theme';
import LayerManager from 'utils/layers/LayerManager';

// Constants
const MAP_CONFIG = {
  zoom: 3,
  latLng: {
    lat: 0,
    lng: 0
  },
  zoomControl: false
};

class Step1 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.id,
      form: props.form,
      loadingVegaChart: false,
      layerGroups: []
    };

    // ------------------- BINDINGS ---------------------------
    this.triggerChangeMode = this.triggerChangeMode.bind(this);
    this.triggerToggleLoadingVegaChart = this.triggerToggleLoadingVegaChart.bind(this);
    this.refreshWidgetPreview = this.refreshWidgetPreview.bind(this);
  }

  componentDidMount() {
    this.setLayerGroups();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ form: nextProps.form });
  }

  setLayerGroups() {
    const { form } = this.props;
    console.log('form', form);
    const layerGroups = [{
      dataset: form.dataset,
      visible: true,
      layers: [{
        active: true,
        application: form.application,
        layerConfig: form.layerConfig || {},
        interactionConfig: form.interactionConfig,
        legendConfig: form.legendConfig || {},
        id: form.widgetConfig.layer_id,
        name: form.name,
        provider: form.provider,
        slug: form.slug,
        iso: form.iso,
        description: form.description
      }]
    }];
    this.setState({ layerGroups });
  }

  /**
   * HELPERS
   * - triggerChangeMode
  */
  triggerChangeMode(mode) {
    if (mode === 'editor') {
      toastr.confirm('By switching you will start editing from scratch', {
        onOk: () => {
          this.props.onModeChange(mode);
        },
        onCancel: () => {
          this.props.onModeChange(this.props.mode);
        }
      });
    } else {
      toastr.confirm('By switching you can edit your current widget but you can\'t go back to the editor', {
        onOk: () => {
          this.props.onModeChange(mode);
        },
        onCancel: () => {
          this.props.onModeChange(this.props.mode);
        }
      });
    }
  }

  triggerToggleLoadingVegaChart(loading) {
    this.setState({ loadingVegaChart: loading });
  }

  refreshWidgetPreview() {
    const isMap = this.state.form.widgetConfig.type === 'map';

    if (isMap) {
      this.forceChartUpdate();
    } else {
      const layerGroups = this.state.layerGroups;
      layerGroups[0].layers[0].id = this.state.form.widgetConfig.layer_id;
      this.setState({ layerGroups });
    }
  }

  render() {
    const { id, loadingVegaChart, layerGroups } = this.state;
    const { showEditor } = this.props;

    // Reset FORM_ELEMENTS
    FORM_ELEMENTS.elements = {};

    const editorFieldContainerClass = classnames({
      '-expanded': this.props.mode === 'editor'
    });

    const isMap = this.state.form.widgetConfig.type === 'map';

    console.log('layerGroups', layerGroups);

    return (
      <fieldset className="c-field-container">
        <fieldset className="c-field-container">
          {/* DATASET */}
          <Field
            ref={(c) => { if (c) FORM_ELEMENTS.elements.dataset = c; }}
            onChange={value => this.props.onChange({
              dataset: value,
              widgetConfig: {}
            })}
            validations={['required']}
            className="-fluid"
            options={this.props.datasets}
            properties={{
              name: 'dataset',
              label: 'Dataset',
              default: this.state.form.dataset,
              value: this.state.form.dataset,
              disabled: !!id,
              required: true,
              instanceId: 'selectDataset'
            }}
          >
            {Select}
          </Field>

          {/* NAME */}
          <Field
            ref={(c) => { if (c) FORM_ELEMENTS.elements.name = c; }}
            onChange={value => this.props.onChange({ name: value })}
            validations={['required']}
            className="-fluid"
            properties={{
              name: 'name',
              label: 'Name',
              type: 'text',
              required: true,
              default: this.state.form.name,
              value: this.state.form.name
            }}
          >
            {Input}
          </Field>

          {/* DESCRIPTION */}
          <Field
            ref={(c) => { if (c) FORM_ELEMENTS.elements.description = c; }}
            onChange={value => this.props.onChange({ description: value })}
            className="-fluid"
            properties={{
              name: 'description',
              label: 'Description',
              default: this.state.form.description
            }}
          >
            {TextArea}
          </Field>

          {/* PUBLISHED */}
          <Field
            ref={(c) => { if (c) FORM_ELEMENTS.elements.published = c; }}
            onChange={value => this.props.onChange({ published: value.checked })}
            properties={{
              name: 'published',
              label: 'Do you want to set this widget as published?',
              value: 'published',
              title: 'Published',
              defaultChecked: this.props.form.published,
              checked: this.props.form.published
            }}
          >
            {Checkbox}
          </Field>

          {/* DEFAULT */}
          <Field
            ref={(c) => { if (c) FORM_ELEMENTS.elements.default = c; }}
            onChange={value => this.props.onChange({ default: value.checked })}
            properties={{
              name: 'default',
              label: 'Do you want to set this widget as default?',
              value: 'default',
              title: 'Default',
              defaultChecked: this.props.form.default,
              checked: this.props.form.default
            }}
          >
            {Checkbox}
          </Field>

          {/* DEFAULT EDITABLE WIDGET */}
          <Field
            ref={(c) => { if (c) FORM_ELEMENTS.elements.defaultEditableWidget = c; }}
            onChange={value => this.props.onChange({ defaultEditableWidget: value.checked })}
            properties={{
              name: 'defaultEditableWidget',
              label: 'Do you want to set this widget as the default editable widget?',
              value: 'defaultEditableWidget',
              title: 'Default editable widget',
              defaultChecked: this.props.form.defaultEditableWidget,
              checked: this.props.form.defaultEditableWidget
            }}
          >
            {Checkbox}
          </Field>

          {/* FREEZE */}
          <div className="freeze-container">
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.freeze = c; }}
              onChange={value => this.props.onChange({ freeze: value.checked })}
              properties={{
                name: 'freeze',
                label: this.props.id ? '' : 'Do you want to freeze this widget?',
                value: 'freeze',
                title: 'Freeze',
                defaultChecked: this.props.form.freeze,
                checked: this.props.form.freeze,
                disabled: this.props.id && this.props.form.freeze
              }}
            >
              {Checkbox}
            </Field>
            {this.props.form.freeze && this.props.id &&
              <div className="freeze-text">
                This widget has been <strong>frozen</strong> and cannot be modified...
              </div>
            }
          </div>
        </fieldset>

        {this.state.form.dataset && showEditor &&
          <fieldset className={`c-field-container ${editorFieldContainerClass}`}>
            <div className="l-row row align-right">
              <div className="column shrink">
                <SwitchOptions
                  selected={this.props.mode}
                  options={[{
                    value: 'advanced',
                    label: 'Advanced'
                  }, {
                    value: 'editor',
                    label: 'Editor'
                  }]}
                  onChange={selected => this.triggerChangeMode(selected.value)}
                />
              </div>
            </div>

            {this.props.mode === 'editor' &&
              <WidgetEditor
                datasetId={this.state.form.dataset}
                widgetId={this.props.id}
                saveButtonMode="never"
                embedButtonMode="never"
                titleMode="never"
                provideWidgetConfig={this.props.onGetWidgetConfig}
              />
            }

            {this.props.mode === 'advanced' &&
              <Field
                onChange={value => this.props.onChange({
                  widgetConfig: CONFIG_TEMPLATE[value] || {}
                })}
                options={CONFIG_TEMPLATE_OPTIONS}
                properties={{
                  name: 'template',
                  label: 'Template',
                  instanceId: 'selectTemplate'
                }}
              >
                {Select}
              </Field>
            }

            {this.props.mode === 'advanced' &&
              <div className="advanced-mode-container">
                <Field
                  ref={(c) => { if (c) FORM_ELEMENTS.elements.widgetConfig = c; }}
                  onChange={value => this.props.onChange({ widgetConfig: value })}
                  properties={{
                    name: 'widgetConfig',
                    label: 'Widget config',
                    default: this.state.form.widgetConfig,
                    value: this.state.form.widgetConfig
                  }}
                >
                  {Code}
                </Field>
                <div className="preview-container c-field">
                  <h5>Widget preview</h5>
                  <Spinner isLoading={loadingVegaChart} className="-light -relative" />
                  {!isMap &&
                    <VegaChart
                      data={this.state.form.widgetConfig}
                      theme={ChartTheme()}
                      showLegend
                      reloadOnResize
                      toggleLoading={this.triggerToggleLoadingVegaChart}
                      getForceUpdate={(func) => { this.forceChartUpdate = func; }}
                    />
                  }
                  {isMap &&
                    <div className="map-container">
                      <Map
                        LayerManager={LayerManager}
                        mapConfig={MAP_CONFIG}
                        layerGroups={layerGroups}
                        setMapInstance={(map) => { this.map = map; }}
                      />
                      {layerGroups.length > 0 &&
                        <Legend
                          layerGroups={this.state.layerGroups}
                          className={{ color: '-dark' }}
                          toggleLayerGroupVisibility={() => {}}
                          setLayerGroupsOrder={() => {}}
                          setLayerGroupActiveLayer={() => {}}
                          readonly
                        />
                      }
                    </div>
                  }
                  <div className="actions">
                    <button
                      type="button"
                      className="c-button -primary"
                      onClick={this.refreshWidgetPreview}
                    >
                        Refresh
                    </button>
                  </div>
                </div>
              </div>
            }

          </fieldset>
        }
        {!showEditor && this.state.form.dataset && !isMap &&
          <div>
            <Spinner isLoading={loadingVegaChart} className="-light -relative" />
            <VegaChart
              data={this.state.form.widgetConfig}
              theme={ChartTheme()}
              showLegend
              reloadOnResize
              toggleLoading={this.triggerToggleLoadingVegaChart}
            />
          </div>
        }
      </fieldset>
    );
  }
}

Step1.defaultProps = {
  showEditor: true
};

Step1.propTypes = {
  id: PropTypes.string,
  form: PropTypes.object,
  mode: PropTypes.string,
  datasets: PropTypes.array,
  onChange: PropTypes.func,
  onModeChange: PropTypes.func,
  showEditor: PropTypes.bool,
  onGetWidgetConfig: PropTypes.func
};

export default Step1;
