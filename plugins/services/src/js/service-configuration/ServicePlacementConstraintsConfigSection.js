import PropTypes from "prop-types";
import React from "react";
import { MountService } from "foundation-ui";

import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapSection
  from "#SRC/js/components/ConfigurationMapSection";

import ConfigurationMapTable from "../components/ConfigurationMapTable";
import PlacementConstraintsUtil from "../utils/PlacementConstraintsUtil";

class ServicePlacementConstraintsConfigSection extends React.Component {
  getColumns() {
    return [
      {
        heading: "Operator",
        prop: "operator"
      },
      {
        heading: "Field Name",
        prop: "fieldName"
      },
      {
        heading: "Value",
        prop: "value"
      }
    ];
  }

  getConstraints() {
    const constraints = this.props.appConfig.constraints || [];

    return constraints.map(function([fieldName, operator, value]) {
      if (PlacementConstraintsUtil.requiresEmptyValue(operator)) {
        value = <em>Not Applicable</em>;
      }

      return { fieldName, operator, value };
    });
  }

  render() {
    const { onEditClick } = this.props;
    const constraints = this.getConstraints();

    // Since we are stateless component we will need to return something for react
    // so we are using the `<noscript>` tag as placeholder.
    if (!constraints.length) {
      return <noscript />;
    }

    return (
      <div>
        <ConfigurationMapHeading level={1}>
          Placement
        </ConfigurationMapHeading>
        <ConfigurationMapSection>
          <MountService.Mount
            type="CreateService:ServiceConfigDisplay:App:PlacementConstraints"
            appConfig={this.props.appConfig}
            onEditClick={onEditClick}
          >
            <ConfigurationMapTable
              columns={this.getColumns()}
              data={constraints}
              onEditClick={onEditClick}
              tabViewID="services"
            />
          </MountService.Mount>
        </ConfigurationMapSection>
      </div>
    );
  }
}

ServicePlacementConstraintsConfigSection.defaultProps = {
  appConfig: {}
};

ServicePlacementConstraintsConfigSection.propTypes = {
  appConfig: PropTypes.object,
  onEditClick: PropTypes.func
};

module.exports = ServicePlacementConstraintsConfigSection;
