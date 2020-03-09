import {
  StandardRouteContainer,
  LangSynchronizer,
} from "../core/NavComponents";
import { createSelector } from "reselect";
import { withRouter } from "react-router";
import { log_standard_event } from "../core/analytics.js";
import { Fragment } from "react";
import { TextMaker, text_maker, TM } from "./rpb_text_provider.js";
import { get_static_url } from "../request_utils.js";
import "./rpb.scss";

//data and state stuff
import {
  reducer,
  mapDispatchToProps,
  create_mapStateToProps,
  naive_to_real_state,
} from "./state_and_data.js";
import { createStore } from "redux";
import { Provider, connect } from "react-redux";
import { ensure_loaded } from "../core/lazy_loader.js";
import { Subject } from "../models/subject.js";

const { Gov } = Subject;

//re-usable view stuff
import {
  SpinnerWrapper,
  RadioButtons,
  LabeledBox,
  TrinityItem,
  DeptSearch,
} from "../components/index.js";
import AriaModal from "react-aria-modal";

//specific view stuff
import { AccessibleTablePicker, TablePicker } from "./TablePicker.js";
import { SimpleView } from "./simple_view.js";
import { GranularView } from "./granular_view.js";
import { SubjectFilterPicker } from "./shared.js";
import { Table } from "../core/TableClass.js";

//misc app stuff
import { rpb_link } from "./rpb_link.js";
import { SafeJSURL } from "../general_utils.js";

const sub_app_name = "_rpb";

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

const RPBTitle = ({ table_name, subject_name }) => {
  if (!table_name) {
    return <h1> {text_maker("report_builder_title")} </h1>;
  }
  return (
    <h1> {subject_name ? subject_name : text_maker("government_stats")} </h1>
  );
};

class Root extends React.Component {
  constructor(props) {
    super(props);

    const { state } = this.props;

    const mapStateToProps = create_mapStateToProps();
    /* eslint-disable-next-line no-use-before-define */
    const Container = connect(mapStateToProps, mapDispatchToProps)(RPB);

    const store = createStore(reducer, state);

    this.state = {
      store,
      Container,
    };
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    prevState.store.dispatch({
      type: "navigate_to_new_state",
      payload: nextProps.state,
    });
    return null;
  }
  shouldComponentUpdate(newProps) {
    return rpb_link(this.state.store.getState()) !== rpb_link(newProps.state);
  }
  render() {
    const { Container, store } = this.state;

    return (
      <Provider store={store}>
        <Container />
      </Provider>
    );
  }
}

class RPB extends React.Component {
  constructor(props) {
    super(props);
    if (props.table) {
      this.state = {
        table_picking: false,
      };
    } else {
      this.state = {
        loading: false,
        table_picking: true,
        dataset_type: "",
        selected_subject: null,
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
    const { dataset_type, selected_subject } = this.state;

    const {
      table,
      mode,
      subject,
      broken_url,

      on_switch_mode,
      on_set_subject,
    } = this.props;

    const Step1 = () => (
      <div style={{ textAlign: "center", paddingBottom: "50px" }}>
        <TextMaker
          style={{ fontWeight: "bold", fontSize: 50 }}
          text_key="select_dataset_type"
        />
        <div className="trinity-container">
          <TrinityItem
            title={<TM k="finances" />}
            img_url={get_static_url("svg/expend.svg")}
            onClick={() => this.setState({ dataset_type: "money" })}
          />
          <TrinityItem
            img_url={get_static_url("svg/people.svg")}
            title={<TM k="people" />}
            onClick={() => this.setState({ dataset_type: "people" })}
          />
        </div>
      </div>
    );

    const Step2 = () => (
      <div style={{ minHeight: 410 }}>
        <TM style={{ fontWeight: "bold", fontSize: 50 }} k={"org_search"} />
        <DeptSearch
          include_gov={true}
          onSelect={(subject) => this.setState({ selected_subject: subject })}
          search_text={text_maker(
            subject.guid === "gov_gov" ? "org_search" : "another_org_search"
          )}
        />
      </div>
    );

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
        <RPBTitle
          subject_name={subject !== Gov && subject && subject.name}
          table_name={table && table.name}
        />
        <LabeledBox label={<TextMaker text_key="rpb_pick_data" />}>
          <div>
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
                      dataset_type: "",
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
                //verticallyCenter={true}
                underlayStyle={{
                  paddingTop: "50px",
                  paddingBottom: "50px",
                }}
                focusDialog={true}
              >
                <div
                  tabIndex={-1}
                  id="modal-child"
                  className="container app-font modal-container"
                >
                  {!dataset_type && <Step1 />}
                  {/*dataset_type && !selected_subject && <Step2/>*/}
                  {dataset_type /* && selected_subject */ && (
                    <TablePicker
                      onSelect={(id) => this.pickTable(id)}
                      dataset_type={dataset_type}
                      broken_url={broken_url}
                    />
                  )}
                </div>
              </AriaModal>
            )}
          </div>
        </LabeledBox>
        {this.state.loading ? (
          <SpinnerWrapper config_name={"route"} />
        ) : (
          <Fragment>
            <LabeledBox label={<TextMaker text_key="rpb_pick_org" />}>
              <SubjectFilterPicker
                subject={subject}
                onSelect={(subj) => on_set_subject(subj)}
              />
            </LabeledBox>
            <LabeledBox label={<TextMaker text_key="rpb_select_mode" />}>
              <div className="centerer">
                <RadioButtons
                  options={[
                    {
                      id: "simple",
                      display: <TextMaker text_key="simple_view_title" />,
                      active: mode === "simple",
                    },
                    {
                      id: "details",
                      display: <TextMaker text_key="granular_view_title" />,
                      active: mode === "details",
                    },
                  ]}
                  onChange={(id) => {
                    on_switch_mode(id);
                  }}
                />
              </div>
            </LabeledBox>
            {table ? (
              mode === "simple" ? (
                <SimpleView {...this.props} />
              ) : (
                <GranularView {...this.props} />
              )
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
    const subject_has_changed = new_props.subject !== this.props.subject;
    const mode_has_changed = new_props.mode !== this.props.mode;

    return mode_has_changed || table_has_changed || subject_has_changed;
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
      SUBJECT_GUID: this.props.subject,
      MISC1: this.props.table,
      MISC2: this.props.mode,
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
          <Root state={url_state} />
        )}
      </StandardRouteContainer>
    );
  }
}
