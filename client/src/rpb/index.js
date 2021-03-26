import _ from "lodash";
import React, { Fragment } from "react";

//data and state stuff

//re-usable view stuff
import { withRouter } from "react-router";

import { is_a11y_mode } from "src/core/injected_build_constants.js";

import { SpinnerWrapper, LabeledBox } from "../components/index.js";
import { FocusLockedModal } from "../components/modals_and_popovers/FocusLockedModal.js";
import { log_standard_event } from "../core/analytics.js";
import { ensure_loaded } from "../core/lazy_loader.js";
import {
  StandardRouteContainer,
  LangSynchronizer,
} from "../core/NavComponents";

//specific view stuff
import { Table } from "../core/TableClass.js";

//misc app stuff
import { SafeJSURL } from "../general_utils.js";
import Footnote from "../models/footnotes/footnotes.js";
import { Subject } from "../models/subject.js";

import { GranularView } from "./granular_view.js";
import { rpb_link } from "./rpb_link.js";
import { TextMaker, text_maker } from "./rpb_text_provider.js";
import { ShareReport } from "./shared.js";
import { AccessibleTablePicker, TablePicker } from "./TablePicker.js";
import "./rpb.scss";

const sub_app_name = "_rpb";

const temp_graphql_ids = ["services"];

function get_all_data_columns_for_table(table) {
  return _.chain(table.unique_headers)
    .map((nick) => table.col_from_nick(nick))
    .filter((col) => !col.hidden && !col.key && col.not_for_display !== true)
    .value();
}

function get_default_dimension_for_table(table) {
  return table.dimensions[0].title_key;
}

//returns a the proposed new slice of state that will change when a new table is selected
function get_default_state_for_new_table(table_id) {
  const table = Table.lookup(table_id);
  const columns = _.map(get_all_data_columns_for_table(table), "nick");
  return {
    table: table_id,
    columns,
    dimension: get_default_dimension_for_table(table),
    filter: text_maker("all"),
    broken_url: false,
  };
}

function naive_to_real_state(naive_state) {
  const { table } = naive_state;

  return {
    //default state
    subject: "gov_gov",
    ...//tables imply their own default state
    (table ? get_default_state_for_new_table(naive_state.table) : {}),
    ...naive_state, //whatever state is already defined takes precedence.
  };
}

const url_state_selector = (str) => {
  const state = (() => {
    if (_.isEmpty(str)) {
      return naive_to_real_state({});
    } else {
      try {
        return _.chain(str)
          .thru((str) => SafeJSURL.parse(str))
          .thru((naive) => naive_to_real_state(naive))
          .value();
      } catch (e) {
        log_standard_event({
          SUBAPP: sub_app_name,
          MISC1: "BROKEN_RPB_URL",
          MISC2: str,
        });

        return naive_to_real_state({ broken_url: true });
      }
    }
  })();

  return state;
};

class RPB extends React.Component {
  constructor(props) {
    super(props);
    if (props.state.table) {
      this.state = {
        table_picking: false,
        ...props.state,
      };
    } else {
      this.state = {
        loading: false,
        table_picking: true,
        ...props.state,
      };
    }
  }

  table_handlers = {
    on_set_filter: ({ dimension, filter }) => {
      this.setState((prevState, props) => {
        return { ...prevState, dimension, filter };
      });
    },

    on_set_dimension: (dim_key) => {
      this.setState((prevState, props) => {
        return {
          ...prevState,
          dim_key,
          filter: text_maker("all"),
        };
      });
    },

    on_switch_table: (table_id) => {
      this.setState((prevState, props) => {
        return {
          ...prevState,
          ...get_default_state_for_new_table(table_id),
        };
      });
    },
  };

  pickTable(table_id) {
    if (this.state.loading || table_id === "select_data") {
      return;
    }
    if (table_id === this.props.state.table) {
      this.setState({
        table_picking: false,
      });
      return;
    }
    this.setState({
      loading: true,
      table_picking: false,
    });
    if (_.includes(temp_graphql_ids, table_id)) {
      this.table_handlers.on_switch_table(table_id);
    } else {
      ensure_loaded({
        table_keys: [table_id],
        footnotes_for: "all",
      }).then(() => {
        this.table_handlers.on_switch_table(table_id);
      });
    }
  }

  get_key_columns_for_table = (table) => {
    return _.chain(table.unique_headers)
      .map((nick) => table.col_from_nick(nick))
      .filter((col) => (col.key && !col.hidden) || col.nick === "dept")
      .value();
  };

  get_filters_for_dim = (table, dim_key) => {
    if (_.includes(temp_graphql_ids, table.id)) {
      return [text_maker("all")];
    }
    return _.uniq([text_maker("all"), ..._.keys(table[dim_key]("*", true))]);
  };

  render() {
    const { broken_url } = this.props;

    const table = this.state.table && Table.lookup(this.state.table);

    const subject =
      this.state.subject && Subject.get_by_guid(this.state.subject);

    const all_data_columns = get_all_data_columns_for_table(table);

    const columns = _.filter(all_data_columns, ({ nick }) =>
      _.includes(this.state.columns, nick)
    );

    const sorted_key_columns =
      this.state.table && this.get_key_columns_for_table(table);

    const def_ready_columns =
      !_.isEmpty(columns) &&
      _.map(columns, (col) => ({
        name: col.fully_qualified_name,
        def: table.column_description(col.nick),
      }));

    const footnotes =
      subject &&
      table &&
      Footnote.get_for_subject(subject, table.tags.concat(["MACHINERY"]));

    const dimensions =
      this.state.table &&
      _.chain(table.dimensions)
        .filter("include_in_report_builder")
        .map(({ title_key }) => ({
          id: title_key,
          display: text_maker(title_key),
        }))
        .value();

    const filters =
      table &&
      this.state.dimension &&
      this.get_filters_for_dim(table, this.state.dimension);

    const filters_by_dimension =
      !_.isEmpty(dimensions) &&
      _.map(dimensions, ({ id: dim_key, display }) => ({
        display,
        id: dim_key,
        children: _.map(this.get_filters_for_dim(table, dim_key), (filter) => ({
          filter: filter,
          dimension: dim_key,
          display: filter,
        })),
      }));

    const table_data =
      this.state.table &&
      (() => {
        table.fill_dimension_columns();
        return table.data;
      })();

    const cat_filter_func =
      this.state.filter &&
      this.state.dimension &&
      this.state.filter === text_maker("all")
        ? _.constant(true)
        : { [this.state.dimension]: this.state.filter };

    const zero_filter_func =
      this.state.columns &&
      _.chain(this.state.columns)
        .map((nick) => this.state.columns[nick])
        .compact()
        .isEmpty()
        .value();

    const flat_data =
      !_.isEmpty(table_data) &&
      _.chain(table_data)
        .filter(cat_filter_func)
        .reject(zero_filter_func)
        .value();

    const options = {
      table,
      subject,
      columns,
      dimensions,
      filters,
      footnotes,
      def_ready_columns,
      all_data_columns,
      flat_data,
      filters_by_dimension,
      sorted_key_columns,
    };

    return (
      <div style={{ minHeight: "800px", marginBottom: "100px" }} id="">
        <URLSynchronizer state={{ ...this.props, ...options }} />
        <LangSynchronizer
          lang_modifier={(hash) => {
            const config_str = hash.split("rpb/")[1];
            if (_.isEmpty(config_str)) {
              return hash;
            } else {
              let state = _.cloneDeep(url_state_selector(config_str));
              delete state.filter;
              return rpb_link(state);
            }
          }}
        />
        <div style={{ display: "flex", flexDirection: "row" }}>
          <h1> {text_maker("report_builder_title")} </h1>
          <ShareReport />
        </div>
        <LabeledBox label={<TextMaker text_key="rpb_pick_data" />}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              role="region"
              aria-label={text_maker("rpb_pick_data")}
              className="centerer md-half-width"
            >
              {is_a11y_mode ? (
                <AccessibleTablePicker
                  onSelect={(id) => this.pickTable(id)}
                  tables={_.reject(Table.get_all(), "reference_table")}
                  selected={_.get(table, "id")}
                  broken_url={broken_url}
                />
              ) : (
                <button
                  className="btn btn-ib-primary"
                  style={{ width: "100%" }}
                  onClick={() => {
                    this.setState({ table_picking: true });
                  }}
                >
                  <TextMaker
                    text_key={
                      table
                        ? "select_another_table_button"
                        : "select_table_button"
                    }
                  />
                </button>
              )}
            </div>
            {!is_a11y_mode && (
              <FocusLockedModal
                mounted={this.state.table_picking}
                on_exit={() => {
                  if (this.state.table_picking) {
                    this.setState({
                      table_picking: false,
                    });
                    setTimeout(() => {
                      const sub_app_node = document.querySelector(
                        "#" + sub_app_name
                      );
                      if (sub_app_node !== null) {
                        sub_app_node.focus();
                      }
                    }, 200);
                  }
                }}
                aria_label={`${text_maker("table_picker_title")}. 
                  ${text_maker("table_picker_top_instructions")}`}
                getApplicationNode={() => document.getElementById("app")}
                underlayStyle={{
                  paddingTop: "50px",
                  paddingBottom: "50px",
                }}
                focusDialog={true}
              >
                <div
                  tabIndex={-1}
                  id="modal-child"
                  className="container app-font rpb-modal-container"
                >
                  <TablePicker
                    onSelect={(id) => this.pickTable(id)}
                    broken_url={broken_url}
                  />
                </div>
              </FocusLockedModal>
            )}
          </div>
        </LabeledBox>
        {this.state.loading ? (
          <SpinnerWrapper config_name={"route"} />
        ) : (
          <Fragment>
            {table ? (
              <GranularView
                {...this.props.state}
                {...this.table_handlers}
                {...options}
              />
            ) : null}
          </Fragment>
        )}
      </div>
    );
  }
}

class AnalyticsSynchronizer extends React.Component {
  //note that we do not update the URL when componentDidMount().
  //this is so that the URL isn't printed too often
  //alternatively, we *can* overwrite the URL in componentDidMount() using replaceState().
  render() {
    return null;
  }
  shouldComponentUpdate(new_props) {
    const table_has_changed = new_props.table !== this.props.table;

    return table_has_changed;
  }
  componentDidUpdate() {
    if (this.props.table) {
      this.send_event();
    }
  }
  componentDidMount() {
    if (this.props.table) {
      this.send_event();
    }
  }
  send_event() {
    log_standard_event({
      SUBAPP: sub_app_name,
      MISC1: this.props.table,
    });
  }
}

const URLSynchronizer = withRouter(
  class URLSynchronizer_ extends React.Component {
    render() {
      return null;
    }
    shouldComponentUpdate(new_props) {
      // return rpb_link(this.props.state) !== rpb_link(new_props.state);
      return rpb_link(new_props.state) !== window.location.hash;
    }
    componentDidMount() {
      //on the first render, it's possible the url is naive
      const { history } = this.props;
      const new_url = rpb_link(this.props.state, "/");
      history.replace(new_url);
    }
    componentDidUpdate() {
      const { history } = this.props;
      const new_url = rpb_link(this.props.state, "/");
      history.push(new_url);
    }
  }
);

export default class ReportBuilder extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      config_str: null,
      url_state: null,
    };
  }
  loadDeps({ table }) {
    ensure_loaded({
      table_keys: [table],
      footnotes_for: "all",
    }).then(() => {
      this.setState({
        loading: false,
      });
    });
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    const config_str = nextProps.match.params.config;
    const url_state = url_state_selector(config_str);

    let loading =
      _.isNull(prevState.config_str) ||
      _.isNull(prevState.url_state) ||
      (url_state.table && prevState.url_state.table !== url_state.table);

    if (_.isEmpty(url_state.table)) {
      loading = false;
    }

    return {
      loading,
      config_str,
      url_state,
    };
  }
  componentDidMount() {
    const { url_state } = this.state;
    if (url_state.table) {
      this.loadDeps(url_state);
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.loading !== nextState.loading ||
      this.state.config_str !== nextState.config_str
    );
  }
  componentDidUpdate() {
    if (this.state.loading) {
      this.loadDeps(this.state.url_state);
    }
  }
  render() {
    const { url_state } = this.state;

    return (
      <StandardRouteContainer
        title={text_maker("report_builder_title")}
        breadcrumbs={[text_maker("self_serve")]}
        description={text_maker("report_builder_meta_desc")}
        route_name="_rpb"
        shouldSyncLang={false}
      >
        <AnalyticsSynchronizer {...url_state} />
        {this.state.loading ? (
          <SpinnerWrapper config_name={"route"} />
        ) : (
          <RPB state={url_state} />
        )}
      </StandardRouteContainer>
    );
  }
}
