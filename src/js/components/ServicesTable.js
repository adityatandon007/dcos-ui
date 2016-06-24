import classNames from 'classnames';
import {Link} from 'react-router';
var React = require('react');

import Cluster from '../utils/Cluster';
var EventTypes = require('../constants/EventTypes');
import Framework from '../structs/Framework';
import HealthBar from './HealthBar';
import IconNewWindow from './icons/IconNewWindow';
var MarathonStore = require('../stores/MarathonStore');
var ResourceTableUtil = require('../utils/ResourceTableUtil');
var ServiceTableHeaderLabels = require('../constants/ServiceTableHeaderLabels');
import ServiceTableUtil from '../utils/ServiceTableUtil';
import ServiceTree from '../structs/ServiceTree';
import StringUtil from '../utils/StringUtil';
import {Table} from 'reactjs-components';
import TableUtil from '../utils/TableUtil';
var Units = require('../utils/Units');

const StatusMapping = {
  'Running': 'running-state'
};

var ServicesTable = React.createClass({

  displayName: 'ServicesTable',

  propTypes: {
    services: React.PropTypes.array.isRequired
  },

  componentDidMount: function () {
    MarathonStore.addChangeListener(
      EventTypes.MARATHON_APPS_CHANGE,
      this.onMarathonAppsChange
    );
  },

  componentWillUnmount: function () {
    MarathonStore.removeChangeListener(
      EventTypes.MARATHON_APPS_CHANGE,
      this.onMarathonAppsChange
    );
  },

  getDefaultProps: function () {
    return {
      services: []
    };
  },

  getOpenInNewWindowLink(service) {
    if (!(service instanceof Framework) || !service.getWebURL()) {
      return null;
    }

    return (
      <a className="table-display-on-row-hover"
        href={Cluster.getServiceLink(service.getName())} target="_blank"
        title="Open in a new window">
        <IconNewWindow className="icon icon-new-window icon-margin-left
          icon-margin-left-wide" />
      </a>
    );
  },

  onMarathonAppsChange: function () {
    this.forceUpdate();
  },

  renderHeadline: function (prop, service) {
    const id = encodeURIComponent(service.getId());
    let itemImage = null;

    if (service instanceof ServiceTree) {
      // Get serviceTree image/icon
      itemImage = (
      <span
        className="icon icon-small icon-image-container icon-app-container icon-margin-right">
          <i className="icon icon-sprite icon-sprite-mini icon-directory "/>
        </span>
      );
    }

    if (service instanceof Framework) {
      // Get framework image/icon
      itemImage = (
        <span
          className="icon icon-small icon-image-container icon-app-container icon-margin-right">
          <img src={service.getImages()['icon-small']}/>
        </span>
      );
    }

    return (
      <div className="service-table-heading flex-box
        flex-box-align-vertical-center table-cell-flex-box">
        <Link to="services-detail"
          className="table-cell-icon"
          params={{id}}>
          {itemImage}
        </Link>
        <Link to="services-detail"
          className="headline table-cell-value flex-box flex-box-col"
          params={{id}}>
          <span className="text-overflow">
            {service.getName()}
          </span>
        </Link>
        {this.getOpenInNewWindowLink(service)}
      </div>
    );
  },

  renderStatus: function (prop, service) {
    let instanceCount = service.getInstancesCount();
    let serviceStatus = service.getStatus();
    let serviceStatusClassSet = StatusMapping[serviceStatus] || '';
    let taskSummary = service.getTasksSummary();
    let {tasksRunning} = taskSummary;

    let text = ` (${tasksRunning} ${StringUtil.pluralize('Task', tasksRunning)})`;
    if (tasksRunning !== instanceCount) {
      text = ` (${tasksRunning} of ${instanceCount} Tasks)`;
    }

    return (
      <div className="status-bar-wrapper">
        <span className="status-bar-indicator">
          <HealthBar tasksSummary={taskSummary} instancesCount={instanceCount} />
        </span>
        <span className="status-bar-text">
          <span className={serviceStatusClassSet}>{serviceStatus}</span>
          {text}
        </span>
      </div>
    );
  },

  renderStats: function (prop, service) {
    return (
      <span>
        {Units.formatResource(prop, service.getResources()[prop])}
      </span>
    );
  },

  renderStatsHeading: function (prop, sortBy, row) {
    let isHeader = row == null;

    return classNames('flush-left text-align-right hidden-mini hidden-small', {
      'highlight': prop === sortBy.prop,
      'clickable': isHeader
    });
  },

  getColumns: function () {
    let className = ResourceTableUtil.getClassName;
    let heading = ResourceTableUtil.renderHeading(ServiceTableHeaderLabels);

    return [
      {
        className,
        headerClassName: className,
        prop: 'name',
        render: this.renderHeadline,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: 'status',
        render: this.renderStatus,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className: this.renderStatsHeading,
        headerClassName: this.renderStatsHeading,
        prop: 'disk',
        render: this.renderStats,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className: this.renderStatsHeading,
        headerClassName: this.renderStatsHeading,
        prop: 'cpus',
        render: this.renderStats,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className: this.renderStatsHeading,
        headerClassName: this.renderStatsHeading,
        prop: 'mem',
        render: this.renderStats,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      }
    ];
  },

  getColGroup: function () {
    return (
      <colgroup>
        <col />
        <col className="status-bar-column"/>
        <col className="hidden-mini hidden-small" style={{width: '85px'}} />
        <col className="hidden-mini hidden-small" style={{width: '75px'}} />
        <col className="hidden-mini hidden-small" style={{width: '85px'}} />
      </colgroup>
    );
  },

  render: function () {
    return (
      <div>
        <Table
          buildRowOptions={this.getRowAttributes}
          className="table service-table inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.props.services.slice()}
          itemHeight={TableUtil.getRowHeight()}
          containerSelector=".gm-scroll-view"
          sortBy={{prop: 'name', order: 'asc'}} />
      </div>
    );
  }
});

module.exports = ServicesTable;
