import { Fragment } from "react";

import {
  Subject,
  util_components,
  create_text_maker_component,
  InfographicPanel,
  ensure_loaded,
  declare_panel,
} from "../../shared.js";

import text from "./covid_estimates.yaml";

const { CovidEstimates, CovidInitiatives, CovidMeasures, Dept } = Subject;

const { TabbedControls, SpinnerWrapper, SmartDisplayTable } = util_components;

const { text_maker, TM } = create_text_maker_component([text]);

class CovidEstimatesPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }
  mountAndUpdate() {
    const { loading } = this.state;

    // TODO, wire up to state later to only load measures as needed?

    if (loading) {
      ensure_loaded({
        covid_measures: true,
      }).then(() => this.setState({ loading: false }));
    }
  }
  componentDidMount() {
    this.mountAndUpdate();
  }
  componentDidUpdate() {
    this.mountAndUpdate();
  }
  render() {
    const { panel_args } = this.props;

    const { subject } = panel_args;

    const { loading } = this.state;

    const inner_content = (
      <Fragment>
        {loading && (
          <div
            style={{
              position: "relative",
              height: "80px",
              marginBottom: "-10px",
            }}
          >
            <SpinnerWrapper config_name={"tabbed_content"} />
          </div>
        )}
        {!loading && "TODO"}
      </Fragment>
    );

    return (
      <Fragment>
        <div className="frow">
          <div className="fcol-md-12 fcol-xs-12 medium_panel_text text">
            <TM
              k={`${panel_args.subject.level}_covid_estimates_above_tab_text`}
              args={{
                subject,
              }}
            />
          </div>
        </div>
        <div className="tabbed-content">
          <TabbedControls
            tab_callback={(year) =>
              this.setState({
                /* TODO */
              })
            }
            tab_options={[
              {
                key: "TODO",
                label: "TODO",
                is_open: true,
                is_disabled: false,
              },
            ]}
          />
          <div className="tabbed-content__pane">{inner_content}</div>
        </div>
      </Fragment>
    );
  }
}

const covid_estimates_render = function ({ calculations, footnotes, sources }) {
  const { panel_args } = calculations;

  return (
    <InfographicPanel
      title={text_maker("covid_estimates_panel_title")}
      {...{
        sources,
        footnotes,
      }}
    >
      <CovidEstimatesPanel panel_args={panel_args} />
    </InfographicPanel>
  );
};

const calculate_functions = {
  gov: (subject, options) => {
    // TODO
    return {
      subject,
    };
  },
  dept: (subject, options) => {
    // TODO
    return {
      subject,
    };
  },
};

export const declare_covid_estimates_panel = () =>
  declare_panel({
    panel_key: "covid_estimates_panel",
    levels: ["gov", "dept"],
    panel_config_func: (level_name, panel_key) => ({
      requires_covid_estimates: true,
      footnotes: false,
      source: (subject) => [],
      calculate: calculate_functions[level_name],
      render: covid_estimates_render,
    }),
  });
