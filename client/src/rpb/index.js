import {
  StandardRouteContainer,
  LangSynchronizer,
} from "../core/NavComponents";
import { createSelector } from "reselect";
import { withRouter } from "react-router";
import { log_standard_event } from "../core/analytics.js";
import { Fragment } from "react";
import { TextMaker, text_maker } from "./rpb_text_provider.js";
import "./rpb.scss";

//data and state stuff
import { ensure_loaded } from "../core/lazy_loader.js";

//re-usable view stuff
import { SpinnerWrapper, LabeledBox } from "../components/index.js";
import AriaModal from "react-aria-modal";

//specific view stuff
import { AccessibleTablePicker, TablePicker } from "./TablePicker.js";
import { GranularView } from "./granular_view.js";
import { ShareReport } from "./shared.js";
import { Table } from "../core/TableClass.js";
import { Subject } from "../models/subject.js";
import Footnote from "../models/footnotes/footnotes.js";

//misc app stuff
import { rpb_link } from "./rpb_link.js";
import { SafeJSURL } from "../general_utils.js";

const sub_app_name = "_rpb";

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

const url_state_selector = createSelector(_.identity, (str) => {
  const state = (() => {
    if (_.isEmpty(str)) {
      return naive_to_real_state({});
    } else {
      try {
        return _.chain(str)
          .pipe((str) => SafeJSURL.parse(str))
          .pipe((naive) => naive_to_real_state(naive))
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
});

class Root extends React.Component {
  constructor(props) {
    super(props);

    const { state } = this.props;

    this.state = {
      ...state,
    };
  }

  shouldComponentUpdate(newProps, newState) {
    return rpb_link(this.state) !== rpb_link(newState);
  }
  render() {
    const on_set_filter = ({ dimension, filter }) => {
      this.setState((prevState, props) => {
        return { ...prevState, dimension, filter };
      });
    };

    const on_set_dimension = (dim_key) => {
      this.setState((prevState, props) => {
        return {
          ...prevState,
          dim_key,
          filter: text_maker("all"),
        };
      });
    };

    const on_switch_table = (table_id) => {
      this.setState((prevState, props) => {
        return {
          ...prevState,
          ...get_default_state_for_new_table(table_id),
        };
      });
    };

    function get_key_columns_for_table(table) {
      return _.chain(table.unique_headers)
        .map((nick) => table.col_from_nick(nick))
        .filter((col) => (col.key && !col.hidden) || col.nick === "dept")
        .value();
    }

    //Note that this will cause a memory leak as this closure will never get GC'd
    const get_filters_for_dim = _.memoize(
      (table, dim_key) =>
        _.uniq([text_maker("all"), ..._.keys(table[dim_key]("*", true))]),
      (table, dim_key) => `${table.id}-${dim_key}`
    );

    const get_table = createSelector(_.property("table"), (table) =>
      Table.lookup(table)
    );

    const get_subject = createSelector(_.property("subject"), (guid) =>
      Subject.get_by_guid(guid)
    );

    const get_all_data_columns = createSelector(
      get_table,
      get_all_data_columns_for_table
    );

    const get_sorted_columns = createSelector(
      [get_table, _.property("columns")],
      (table, col_nicks) =>
        _.filter(get_all_data_columns_for_table(table), ({ nick }) =>
          _.includes(col_nicks, nick)
        )
    );

    const get_sorted_key_columns = createSelector(
      get_table,
      get_key_columns_for_table
    );

    const get_def_ready_cols = createSelector(
      get_table,
      get_sorted_columns,
      (table, sorted_data_columns) =>
        _.chain(sorted_data_columns)
          .map((col) => ({
            name: col.fully_qualified_name,
            def: table.column_description(col.nick),
          }))
          .value()
    );

    //array of html footnotes
    const get_footnotes = createSelector(
      [get_table, get_subject],
      (table, subject) => {
        const topics = table.tags.concat(["MACHINERY"]);
        const subject_footnotes = Footnote.get_for_subject(subject, topics);
        return subject_footnotes;
      }
    );

    const get_dimensions = createSelector(get_table, (table) =>
      _.chain(table.dimensions)
        .filter("include_in_report_builder")
        .map(({ title_key }) => ({
          id: title_key,
          display: text_maker(title_key),
        }))
        .value()
    );

    const get_all_filters = createSelector(
      [get_table, _.property("dimension")],
      (table, dim_key) => get_filters_for_dim(table, dim_key)
    );

    const get_filters_by_dimension = createSelector(
      [get_table, get_dimensions],
      (table, dimensions) =>
        _.map(dimensions, ({ id: dim_key, display }) => ({
          display,
          id: dim_key,
          children: _.map(get_filters_for_dim(table, dim_key), (filter) => ({
            filter: filter,
            dimension: dim_key,
            display: filter,
          })),
        }))
    );

    const get_table_data = createSelector(get_table, (table) => {
      table.fill_dimension_columns();
      return table.data;
    });

    const get_cat_filter_func = createSelector(
      [_.property("dimension"), _.property("filter")],
      (dim_key, filter_val) =>
        filter_val === text_maker("all")
          ? _.constant(true)
          : { [dim_key]: filter_val }
    );

    const get_zero_filter_func = createSelector(
      [_.property("columns")],
      (col_nicks) => (row) =>
        _.chain(col_nicks)
          .map((nick) => row[nick])
          .compact()
          .isEmpty()
          .value()
    );
    const get_flat_data = createSelector(
      [get_table_data, get_cat_filter_func, get_zero_filter_func],
      (table_data, cat_filter_func, zero_filter_func) =>
        _.chain(table_data)
          .filter(cat_filter_func)
          .reject(zero_filter_func)
          .value()
    );

    return (
      <RPB
        {...this.state}
        table={this.state.table && get_table(this.state)}
        subject={this.state.subject && get_subject(this.state)}
        columns={
          !_.isEmpty(this.state.columns) && get_sorted_columns(this.state)
        }
        dimensions={this.state.table && get_dimensions(this.state)}
        filters={this.state.table && get_all_filters(this.state)}
        footnotes={this.state.table && get_footnotes(this.state)}
        def_ready_columns={
          !_.isEmpty(this.state.columns) && get_def_ready_cols(this.state)
        }
        all_data_columns={
          !_.isEmpty(this.state.columns) && get_all_data_columns(this.state)
        }
        flat_data={this.state.table && get_flat_data(this.state)}
        //granular props
        filters_by_dimension={
          this.state.table && get_filters_by_dimension(this.state)
        }
        sorted_key_columns={
          !_.isEmpty(this.state.columns) && get_sorted_key_columns(this.state)
        }
        on_set_filter={on_set_filter}
        on_set_dimension={on_set_dimension}
        on_switch_table={on_switch_table}
      />
    );
  }
}

class RPB extends React.Component {
  constructor(props) {
    super(props);
    if (props.table) {
      this.state = {
        table_picking: false,
        ...props.state,
      };
    } else {
      this.state = {
        loading: false,
        table_picking: true,
        selected_subject: null,
        ...props.state,
      };
    }
  }
  pickTable(table_id) {
    if (this.state.loading) {
      return;
    }
    this.setState({
      loading: true,
      table_picking: false,
    });
    ensure_loaded({
      table_keys: [table_id],
      footnotes_for: "all",
    }).then(() => {
      this.props.on_switch_table(table_id);
      this.setState({ loading: false });
    });
  }

  render() {
    const { table, broken_url } = this.props;

    return (
      <div style={{ minHeight: "800px", marginBottom: "100px" }} id="">
        <URLSynchronizer state={this.props} />
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
            <div className="centerer md-half-width">
              {window.is_a11y_mode ? (
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
            {!window.is_a11y_mode && (
              <AriaModal
                mounted={this.state.table_picking}
                onExit={() => {
                  if (this.state.table_picking) {
                    this.setState({
                      table_picking: false,
                      selected_subject: null,
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
                titleId="tbp-title"
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
                  }
                </div>
              </AriaModal>
            )}
          </div>
        </LabeledBox>
        {this.state.loading ? (
          <SpinnerWrapper config_name={"route"} />
        ) : (
          <Fragment>{table ? <GranularView {...this.props} /> : null}</Fragment>
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
      this.state.config_str !== nextState.config_str ||
      rpb_link(this.state.url_state) !== rpb_link(nextState.url_state)
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
          <Root state={url_state} />
        )}
      </StandardRouteContainer>
    );
  }
}
