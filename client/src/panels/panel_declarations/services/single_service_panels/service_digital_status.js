import _ from "lodash";
import React, { Fragment } from "react";

import text from "src/panels/panel_declarations/services/services.yaml";
import {
  digital_status_keys,
  available_icons,
  available_keys,
} from "src/panels/panel_declarations/services/shared.js";

import {
  create_text_maker_component,
  Panel,
  DisplayTable,
} from "src/components/index.js";

import FootNote from "src/models/footnotes/footnotes.js";

const { text_maker, TM } = create_text_maker_component(text);

export class ServiceDigitalStatus extends React.Component {
  render() {
    const { service } = this.props;
    const footnote = service.digital_enablement_comment && [
      FootNote.create_and_register({
        id: `digital_enablement_comment_${service.id}`,
        topic_keys: ["DIGITAL_STATUS"],
        subject: service,
        text: service.digital_enablement_comment,
      }),
    ];

    const column_configs = {
      overview_digital_status_desc: {
        index: 0,
        header: text_maker("overview_digital_status_desc"),
        formatter: (key) => (
          <Fragment>
            <TM k={key} el="h4" />
            <TM k={`${key}_desc`} />
          </Fragment>
        ),
        raw_formatter: (key) =>
          `${text_maker(key)} ${text_maker(`${key}_desc`)}}`,
      },
      digital_status: {
        index: 1,
        header: text_maker("online_status"),
        formatter: (value) => (
          <Fragment>
            {available_icons[available_keys[value]]}
            <TM style={{ marginLeft: 5 }} k={available_keys[value]} />
          </Fragment>
        ),
        raw_formatter: (value) => available_keys[value],
      },
    };

    return (
      <Panel title={text_maker("digital_status")} footnotes={footnote}>
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
