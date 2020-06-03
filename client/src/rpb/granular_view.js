import { TextMaker, text_maker } from "./rpb_text_provider.js";
import { ReportDetails, ReportDatasets } from "./shared.js";
import {
  LabeledBox,
  AlertBanner,
  DisplayTable,
  Details,
  DropdownMenu,
} from "../components/index.js";
import { Subject } from "../models/subject.js";

const { Dept } = Subject;

class GranularView extends React.Component {
  render() {
    const { subject, table } = this.props;
    return (
      <div>
        <LabeledBox
          label={
            <TextMaker
              text_key="rpb_report_details"
              args={{ table_name: table.name }}
            />
          }
        >
          <Details
            summary_content={
              <div>
                {table.title} : {subject.name}
              </div>
            }
            content={<ReportDetails {...this.props} />}
          />
        </LabeledBox>
        <LabeledBox label={<TextMaker text_key="rpb_report_data_sources" />}>
          <ReportDatasets {...this.props} />
        </LabeledBox>
        {table.rpb_banner && <AlertBanner>{table.rpb_banner}</AlertBanner>}
        <div id="rpb-main-content">{this.get_table_content()}</div>
      </div>
    );
  }

  get_table_content() {
    const {
      columns: data_columns,
      flat_data,
      sorted_key_columns,

      on_set_filter,
      filters_by_dimension,
      dimension,
      filter,
    } = this.props;

    const non_dept_key_cols = _.reject(sorted_key_columns, { nick: "dept" });

    const cols = [...non_dept_key_cols, ...data_columns];
    const is_matched_undefined = (column_collection, nick) =>
      _.isUndefined(_.find(column_collection, (col) => col.nick === nick));

    const column_configs = {
      dept: {
        index: 0,
        header: text_maker("org"),
        is_searchable: true,
        formatter: "wide-str",
      },
      ..._.chain(cols)
        .map(({ nick, type, fully_qualified_name, initial_visible }, idx) => [
          nick,
          {
            index: idx + 1,
            header: fully_qualified_name,
            is_searchable: !is_matched_undefined(non_dept_key_cols, nick),
            is_summable: !is_matched_undefined(data_columns, nick),
            formatter: type,
            initial_visible:
              !is_matched_undefined(non_dept_key_cols, nick) || initial_visible,
          },
        ])
        .fromPairs()
        .value(),
    };
    const table_data = _.map(flat_data, (row) => ({
      dept: Dept.lookup(row.dept).name,
      ..._.chain(cols)
        .map(({ nick }) => [nick, row[nick]])
        .fromPairs()
        .value(),
    }));
    const group_filter_options = _.map(
      filters_by_dimension,
      (filter_by_dim) => ({
        ...filter_by_dim,
        children: _.sortBy(filter_by_dim.children, "display"),
      })
    );

    return (
      <DisplayTable
        data={table_data}
        column_configs={column_configs}
        util_components={{
          rpb_group_data: (
            <DropdownMenu
              opened_button_class_name={"btn-ib-opened"}
              closed_button_class_name={"btn-ib-light"}
              key={"rpb_group_data"}
              button_description={text_maker("group_data")}
              custom_dropdown_trigger={text_maker("group_data")}
              dropdown_content={
                <div className="group_filter_dropdown">
                  {_.map(group_filter_options, (group) => (
                    <div key={group.id}>
                      <span key={group.id} style={{ fontWeight: 700 }}>
                        {group.display}
                      </span>
                      {_.map(group.children, (child) => (
                        <div key={`${group.id}_${child.id}`}>
                          <input
                            type={"radio"}
                            value={child.id}
                            name={"rpb_group_filter"}
                            key={child.id}
                            onClick={(evt) => {
                              const [
                                dim_key,
                                filt_key,
                              ] = evt.target.value.split("__");
                              on_set_filter({
                                filter: filt_key,
                                dimension: dim_key,
                              });
                            }}
                            defaultChecked={
                              child.id === `${dimension}__${filter}`
                            }
                          />
                          <label
                            className={"normal-rd-label"}
                            key={child.display}
                          >
                            {child.display}
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              }
            />
          ),
        }}
      />
    );
  }
}

export { GranularView };
