import _ from "lodash";
import React, { Fragment } from "react";

import { declare_panel } from "src/panels/panel_declarations/common_panel_utils";
import text from "src/panels/panel_declarations/services/services.yaml";
import {
  digital_status_keys,
  available_icons,
  available_keys,
} from "src/panels/panel_declarations/services/shared";

import {
  create_text_maker_component,
  Panel,
  DisplayTable,
} from "src/components/index";

import { create_fake_footnote } from "src/models/footnotes/footnotes";

const { text_maker, TM } = create_text_maker_component(text);

export class ServiceDigitalStatus extends React.Component {
  render() {
    const { service, title } = this.props;

    const footnote = service.digital_enablement_comment && [
      create_fake_footnote({
        topic_keys: ["DIGITAL_STATUS"],
        text: service.digital_enablement_comment,
      }),
    ];

    const column_configs = {
      overview_digital_status_desc: {
        index: 0,
        is_sortable: false,
        header: text_maker("overview_digital_status_desc"),
        formatter: (key) => (
          <Fragment>
            <TM k={key} el="h4" />
            <TM k={`${key}_desc`} />
          </Fragment>
        ),
        plain_formatter: (key) =>
          `${text_maker(key)} ${text_maker(`${key}_desc`)}}`,
      },
      digital_status: {
        index: 1,
        is_sortable: false,
        header: text_maker("online_status"),
        formatter: (value) => (
          <Fragment>
            {available_icons[available_keys[value]]}
            <TM style={{ marginLeft: 5 }} k={available_keys[value]} />
          </Fragment>
        ),
        plain_formatter: (value) => available_keys[value],
      },
    };

    return (
      <Panel title={title} footnotes={footnote}>
        <TM className="medium-panel-text" k="overview_digital_status_title" />
        <DisplayTable
          unsorted_initial={true}
          data={_.map(digital_status_keys, (key) => ({
            overview_digital_status_desc: key,
            digital_status: service[`${key}_status`],
          }))}
          column_configs={column_configs}
          util_components={{
            copyCsvUtil: null,
            downloadCsvUtil: null,
            columnToggleUtil: null,
          }}
        />
      </Panel>
    );
  }
}

export const declare_single_service_digital_status_panel = () =>
  declare_panel({
    panel_key: "single_service_digital_status",
    subject_types: ["service"],
    panel_config_func: (subject_type, panel_key) => ({
      title: text_maker("digital_status"),
      footnotes: false,
      render({ title, calculations, sources }) {
        const { subject } = calculations;
        return <ServiceDigitalStatus service={subject} title={title} />;
      },
    }),
  });
