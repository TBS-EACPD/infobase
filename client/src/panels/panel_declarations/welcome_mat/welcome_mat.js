import "./welcome-mat.scss";
import text from './welcome_mat.yaml';
import { Fragment } from 'react';
import classNames from 'classnames';
import {
  run_template,
  Table,
  InfographicPanel,
  declare_panel,
  years,
  create_text_maker_component,
  util_components,
  get_planned_fte_source_link,
  get_planned_spending_source_link,
  rpb_link,
  get_appropriate_rpb_subject,
} from "../shared.js";
import { format_and_get_exp_program_spending } from "./welcome_mat_exp_program_spending.js";
import { format_and_get_fte } from "./welcome_mat_fte.js";

const { Format } = util_components;

const { std_years, planning_years } = years;
const exp_cols = _.map(std_years, yr => `${yr}exp`);
const actual_history_years = _.map(std_years, run_template);

const { text_maker, TM } = create_text_maker_component(text);

const SpendFormat = ({amt}) => <Format type={window.is_a11y_mode ? "compact1_written" : "compact1"} content={amt} />;
const FteFormat = ({amt}) => <Format type="big_int" content={amt} />;

const get_estimates_source_link = subject => {
  const table = Table.lookup('orgVoteStatEstimates');
  return {
    html: table.name,
    href: rpb_link({
      subject: subject.guid,
      table: table.id,
      mode: 'details',
      columns: ['{{est_in_year}}_estimates'], 
    }),
  };
};

const get_historical_spending_source_link = subject => {
  const table = Table.lookup('programSpending');
  const appropriate_subject = get_appropriate_rpb_subject(subject);
  return {
    html: table.name,
    href: rpb_link({
      subject: appropriate_subject.guid,
      table: table.id,
      mode: 'details',
      columns: std_years.map(yr => `${yr}exp`), 
    }),
  };
};

const get_historical_fte_source_link = subject => {
  const table = Table.lookup('programFtes');
  const appropriate_subject = get_appropriate_rpb_subject(subject);
  return {
    html: table.name,
    href: rpb_link({
      subject: appropriate_subject.guid,
      table: table.id,
      mode: 'details',
      columns: std_years, 
    }),
  };
};

const Pane = ({ size, children, is_header, noPadding }) => (
  <div className={`mat-grid__lg-panel${size} mat-grid__sm-panel`}>
    <div 
      className={classNames(
        "welcome-mat-rect",
        is_header ? "mat-grid__title" : "mat-grid__inner-grid",
        noPadding && "mat-grid__inner-grid--no-padding"
      )}
    >
      { children }
    </div>
  </div>
);

const HeaderPane = props => <Pane is_header {...props} />;

const PaneItem = ({ hide_a11y, children, textSize, hide_lg }) => (
  <div 
    className={classNames(
      "mat-grid__inner-panel",
      `mat-grid__inner-panel--${textSize}`,
      hide_lg && "mat-grid__inner-panel--large-hide",
    )}
  >
    { children }
  </div>
);

const WelcomeMatShell = ({ header_row, spend_row, fte_row, text_row }) => (
  <div className="mat-grid">
    <div className="mat-grid__row mat-grid__row--sm-hide" aria-hidden>
      {header_row}
    </div>
    <div className="mat-grid__row">
      {spend_row}
    </div>
    {fte_row &&
      <div className="mat-grid__row">
        {fte_row}
      </div>
    }
    {text_row && 
      <div className="mat-grid__row">
        {text_row}
      </div>
    }
  </div>
);


/*
  markup:
    .mat-grid
      .mat-grid__row mat-grid__row--sm-hide (header only) --also aria-hidden
        .mat-grid__lg-panel20
            .welcome-mat-rect.mat-grid__title
              <content>
            ...
      .mat-grid__row
        .mat-grid__lg-panel20.mat-grid__sm-panel
          .welcome-mat-rect.mat-grid__inner-grid 
            .sr-only
              <title> (five years ago...)
            .mat-grid__inner-panel.mat-grid__inner-panel--large.mat-grid__inner-panel--large-hide + aria-hidden
              <title> (five years ago...)
            .mat-grid__inner-panel.mat-grid__inner-panel--small //in the case of historical FTEs, numbers come first!
              <text> spending was
            .mat-grid__inner-panel.mat-grid__inner-panel--large
              formatted amount 
          ...
        .mat-grid__lg-panel40.mat-grid__sm-panel
          .welcome-mat-rect.font-xsmall


*/

const WelcomeMat = (props) => {
  const { 
    type,
    subject,
    info,
    calcs,
    is_m2m,
  } = props;
  const {
    latest_hist_spend_data,
    oldest_hist_spend_data,
  } = calcs;
  const current_year = _.parseInt( run_template('{{pa_in_year_short_first}}') );
  const oldest_hist_year = _.chain(oldest_hist_spend_data.year)
    .split('-')
    .head()
    .parseInt()
    .value();
  const actual_hist_years_apart = current_year - oldest_hist_year;
  const latest_equals_oldest_hist = oldest_hist_spend_data.year === latest_hist_spend_data.year;

  //vars used multiple times accross multiple cases
  const years_ago = <TM k="years_ago" args={{
    plural_years: actual_hist_years_apart > 1,
    actual_hist_years_apart: actual_hist_years_apart,
    oldest_hist_spend_year: oldest_hist_spend_data.year,
  }} />;  
  const hist_trend = <TM k="hist_trend" args={{
    oldest_hist_spend_year: oldest_hist_spend_data.year,
    latest_hist_spend_year: latest_hist_spend_data.year,
  }} />;
  
  const last_year = <TM k="last_year" />;
  const in_three_years = <TM k="in_three_years" />;
  const in_this_year = <TM k="in_this_year" />;

  const long_term_trend = <TM k="long_term_trend" args={{oldest_hist_spend_year: oldest_hist_spend_data.year}} />;
  const planned_trend = <TM k="3_year_trend" />;
  const no_hist_spending = <TM k="no_historical_spending__new" />;
  // const no_hist_ftes = <TM k="no_historical_fte__new" />;
  const spending_auths_are = <TM k="spending_authorities_are" />;

  const fte_graph = format_and_get_fte(type, info, subject);
  const exp_program_spending_graph = format_and_get_exp_program_spending(type, subject);

  if(type==="hist"){
    //hist-only, old program or org
    //may or may not have FTEs

    //centered 80% width
    //five years ago, last year, graph
    //bottom text: this org|program|CR may be no longer be active

    //note that it may or may not have FTEs...
    const {
      spend_last_year,
      last_year_hist_spend_diff,

      last_year_hist_fte_diff,
      oldest_hist_fte_data,
      fte_last_year,
    } = calcs;

    return (
      <WelcomeMatShell
        header_row={[
          <HeaderPane key="a" size={20} children={years_ago} />,
          <HeaderPane key="b" size={20} children={last_year} />,
          <HeaderPane key="d" size={40} children={hist_trend} />,
        ]}
        spend_row={[

          <Pane key="a" size={20}>
            <MobileOrA11YContent children={years_ago} />
            <PaneItem textSize="small">
              <TM k="spending_was__new" />
            </PaneItem>
            <PaneItem textSize="medium">
              <SpendFormat amt={oldest_hist_spend_data.value} />
            </PaneItem>
          </Pane>,

          <Pane key="b" size={20}>
            <MobileOrA11YContent children={last_year} />
            <PaneItem textSize="small">
              <TM k="spending_change_was__new" args={{hist_change: last_year_hist_spend_diff}}/>
            </PaneItem>
            <PaneItem textSize="medium">
              <SpendFormat amt={spend_last_year} />
            </PaneItem>
          </Pane>,

          <Pane noPadding key="d" size={40}>
            {exp_program_spending_graph}
          </Pane>,
        ]}
        fte_row={ fte_graph && [
          <Pane key="a" size={20}>
            <MobileOrA11YContent children={years_ago} />
            <PaneItem textSize="medium">
              <FteFormat amt={oldest_hist_fte_data.value} />
            </PaneItem>
            <PaneItem textSize="small">
              <TM k="ftes_were_employed" />
            </PaneItem>
          </Pane>,

          <Pane key="b" size={20}>
            <MobileOrA11YContent children={last_year} />
            <PaneItem textSize="small">
              <TM k="fte_change_was__new" args={{hist_change: last_year_hist_fte_diff}}/>
            </PaneItem>
            <PaneItem textSize="medium">
              <FteFormat amt={fte_last_year} />
            </PaneItem>
          </Pane>,

          <Pane noPadding key="d" size={40}>
            {fte_graph}
          </Pane>,
        
        ]}
      />
    );

  } else if(type==="planned"){
    //only planned data available (new DP orgs, all active CRs and programs)
    //has FTEs

    //centered 80% width
    //this year, in three years, graph
    //spend row
    //fte row
    //no text at the bottom

    const {
      spend_plan_1,
      spend_plan_3,
      fte_plan_1,
      fte_plan_3,
    } = calcs;

    const planned_spend_diff = (spend_plan_3-spend_plan_1)/spend_plan_1;
    const planned_fte_diff = (fte_plan_3-fte_plan_1)/fte_plan_1;
    return (
      <WelcomeMatShell
        header_row={[
          <HeaderPane key="b" size={20} children={in_this_year} />,
          <HeaderPane key="c" size={20} children={in_three_years} />,
          <HeaderPane key="d" size={40} children={planned_trend} />,
        ]}
        spend_row={[

          <Pane key="a" size={20}>
            <MobileOrA11YContent children={last_year} />
            <PaneItem textSize="small">
              <TM k="spending_will_be_1__new"/>
            </PaneItem>
            <PaneItem textSize="medium">
              <SpendFormat amt={spend_plan_1} />
            </PaneItem>
          </Pane>,

          <Pane key="b" size={20}>
            <MobileOrA11YContent children={in_three_years} />
            <PaneItem textSize="small">
              <TM k="spending_change_will__new" args={{plan_change: planned_spend_diff}} />
            </PaneItem>
            <PaneItem textSize="medium">
              <SpendFormat amt={spend_plan_3} />
            </PaneItem>
          </Pane>,

          <Pane noPadding key="c" size={40}>
            {exp_program_spending_graph}
          </Pane>,
        ]}
        fte_row={fte_graph && [
          <Pane key="a" size={20}>
            <MobileOrA11YContent children={in_this_year} />
            <PaneItem textSize="medium">
              <FteFormat amt={fte_plan_1} />
            </PaneItem>
            <PaneItem textSize="small">
              <TM k="fte_will_be_1__new"/>
            </PaneItem>
          </Pane>,

          <Pane key="b" size={20}>
            <MobileOrA11YContent children={in_three_years} />
            <PaneItem textSize="small">
              <TM k="fte_change_will__new" args={{plan_change: planned_fte_diff}} />
            </PaneItem>
            <PaneItem textSize="medium">
              <FteFormat amt={fte_plan_3} />
            </PaneItem>
          </Pane>,

          <Pane noPadding key="c" size={40}>
            {fte_graph}
          </Pane>,
        ]}
      />
    );

  } else if(type === "estimates"){
    //new, non-DP org, CR or program

    const { 
      spend_plan_1,
    } = calcs;

    return (
      <WelcomeMatShell
        header_row={[
          <HeaderPane key="a" size={20} children={years_ago} />,
          <HeaderPane key="b" size={20} children={last_year} />,
          <HeaderPane key="c" size={20} children={in_this_year} />,
          <HeaderPane key="d" size={40} children={hist_trend} />,
        ]}
        spend_row={[

          <Pane key="a" size={20}>
            <MobileOrA11YContent children={years_ago} />
            <PaneItem textSize="small" children={no_hist_spending} />
          </Pane>,

          <Pane key="b" size={20}>
            <MobileOrA11YContent children={last_year} />
            <PaneItem textSize="small" children={no_hist_spending} />
          </Pane>,

          <Pane key="c" size={20}>
            <MobileOrA11YContent children={spending_auths_are} />
            <PaneItem textSize="small">
              <TM k="spending_authorities_are" />
            </PaneItem>
            <PaneItem textSize="medium">
              <SpendFormat amt={spend_plan_1} />
            </PaneItem>
          </Pane>,

          <Pane key="d" size={40}>
            <PaneItem textSize="small">
              <div style={{padding: "8rem"}}>
                <TM k="no_trend_info" />
              </div>
            </PaneItem>
          </Pane>,
        ]}
      />
    );

  } else if(type === "hist_estimates"){
    //active, non-DP org, CR or program
    //has no FTEs

    //full-width, 
    //5 yrs ago, last year, this year, graph
    //text about hist-diff
    const {
      spend_plan_1,
      spend_last_year,
      last_year_hist_spend_diff,
      latest_year_hist_spend_diff,
    } = calcs;

    const actual_hist_years_apart = _.parseInt( _.split(latest_hist_spend_data.year, '-') ) - _.parseInt( _.split(oldest_hist_spend_data.year, '-') ) + 1;

    return (
      <WelcomeMatShell
        header_row={[
          <HeaderPane key="a" size={20} children={years_ago} />,
          !latest_equals_oldest_hist &&
          <HeaderPane key="b" size={20} children={last_year} />,
          <HeaderPane key="c" size={20} children={in_this_year} />,
          <HeaderPane key="d" size={40} children={hist_trend} />,
        ]}
        spend_row={[

          <Pane key="a" size={20}>
            <MobileOrA11YContent children={years_ago} />
            <PaneItem textSize="small">
              <TM k="spending_was__new" />
            </PaneItem>
            <PaneItem textSize="medium">
              <SpendFormat amt={oldest_hist_spend_data.value} />
            </PaneItem>
          </Pane>,

          !latest_equals_oldest_hist &&
          <Pane key="b" size={20}>
            <MobileOrA11YContent children={last_year} />
            <PaneItem textSize="small">
              <TM k="spending_change_was__new" args={{hist_change: last_year_hist_spend_diff}}/>
            </PaneItem>
            <PaneItem textSize="medium">
              <SpendFormat amt={spend_last_year} />
            </PaneItem>
          </Pane>,

          <Pane key="c" size={20}>
            {
              spend_plan_1 ? 
              <Fragment>
                <MobileOrA11YContent children={spending_auths_are} />
                <PaneItem textSize="small">
                  <TM k="spending_authorities_are" />
                </PaneItem>
                <PaneItem textSize="medium">
                  <SpendFormat amt={spend_plan_1} />
                </PaneItem>
              </Fragment> :
              <PaneItem textSize="small">
                <TM k="no_spend_auth_this_year__new" />
              </PaneItem>
            }
          </Pane>,

          <Pane noPadding key="d" size={40}>
            {exp_program_spending_graph}
          </Pane>,
        ]}
        text_row={[
          <Pane key="a" size={100}>
            <PaneItem textSize="small">
              <TM
                k="dept2_welcome_mat_spending_summary"
                args={{
                  exp_hist_change: latest_year_hist_spend_diff,
                  actual_hist_years_apart: actual_hist_years_apart,
                  subject,
                }}
              />
            </PaneItem>
          </Pane>,
        ]}
      />
    );

  
  } else if(type==="hist_planned"){
    //an active DP org
    //has FTEs

    //five yrs ago, last year, 3 yrs future, graph
    //spend row
    //fte row
    //spend (hist-diff and plan-diff) txt, fte (hist-diff and plan-diff) txt

    const {  
      spend_last_year,
      spend_plan_3,

      last_year_hist_spend_diff,
      last_year_hist_fte_diff,
      latest_year_hist_spend_diff,
      latest_year_hist_fte_diff,
      planned_spend_diff,

      fte_last_year,
      oldest_hist_fte_data,
      fte_plan_3,
      planned_fte_diff,
    } = calcs;

    const { level } = subject;
    let spend_summary_key;
    let fte_summary_key;
    if ( !_.includes(["crso", "program"], level) ){
      if(level === "gov"){
        spend_summary_key = "gov_welcome_mat_spending_summary";
        fte_summary_key = "welcome_mat_fte_summary";
      } else if(level === "dept"){
        spend_summary_key = "dept1_welcome_mat_spending_summary";
        fte_summary_key = "welcome_mat_fte_summary";
      } else if(level === "tag"){
        spend_summary_key = "tag_welcome_mat_spending_summary";
        fte_summary_key = "tag_welcome_mat_fte_summary";
      }
    } else {
      spend_summary_key = false;
      fte_summary_key = false;
    }

    return (
      <WelcomeMatShell
        header_row={[
          <HeaderPane key="a" size={15} children={years_ago} />,
          !latest_equals_oldest_hist &&
          <HeaderPane key="b" size={15} children={last_year} />,
          <HeaderPane key="c" size={15} children={in_three_years} />,
          <HeaderPane key="d" size={55} children={long_term_trend} />,
        ]}
        spend_row={[

          <Pane key="a" size={15}>
            <MobileOrA11YContent children={years_ago} />
            <PaneItem textSize="small">
              <TM k="spending_was__new" />
            </PaneItem>
            <PaneItem textSize="medium">
              <SpendFormat amt={oldest_hist_spend_data.value} />
            </PaneItem>
            {is_m2m && 
              <PaneItem textSize="small"> (Maximum) </PaneItem>
            }
          </Pane>,

          !latest_equals_oldest_hist &&
          <Pane key="b" size={15}>
            <MobileOrA11YContent children={last_year} />
            <PaneItem textSize="small">
              <TM k="spending_change_was__new" args={{hist_change: last_year_hist_spend_diff}}/>
            </PaneItem>
            <PaneItem textSize="medium">
              <SpendFormat amt={spend_last_year} />
            </PaneItem>
            {is_m2m && 
              <PaneItem textSize="small"> (Maximum) </PaneItem>
            }
          </Pane>,

          <Pane key="c" size={15}>
            <MobileOrA11YContent children={in_three_years} />
            <PaneItem textSize="small">
              <TM k="spending_change_will__new" args={{plan_change: planned_spend_diff}} />
            </PaneItem>
            <PaneItem textSize="medium">
              <SpendFormat amt={spend_plan_3} />
            </PaneItem>
            {is_m2m && 
              <PaneItem textSize="small"> (Maximum) </PaneItem>
            }
          </Pane>,

          <Pane noPadding key="d" size={55}>
            {exp_program_spending_graph}
          </Pane>,
        ]}
        fte_row={fte_graph && [

          <Pane key="a" size={15}>
            <MobileOrA11YContent children={years_ago} />
            <PaneItem textSize="medium">
              <FteFormat amt={oldest_hist_fte_data.value} />
            </PaneItem>
            <PaneItem textSize="small">
              <TM k="ftes_were_employed" />
            </PaneItem>
            {is_m2m && 
              <PaneItem textSize="small"> (Maximum) </PaneItem>
            }
          </Pane>,

          !latest_equals_oldest_hist &&
          <Pane key="b" size={15}>
            <MobileOrA11YContent children={last_year} />
            <PaneItem textSize="small">
              <TM k="fte_change_was__new" args={{hist_change: last_year_hist_fte_diff}}/>
            </PaneItem>
            <PaneItem textSize="medium">
              <FteFormat amt={fte_last_year} />
            </PaneItem>
            {is_m2m && 
              <PaneItem textSize="small"> (Maximum) </PaneItem>
            }
          </Pane>,

          <Pane key="c" size={15}>
            <MobileOrA11YContent children={in_three_years} />
            <PaneItem textSize="small">
              <TM k="fte_change_will__new" args={{plan_change: planned_fte_diff}} />
            </PaneItem>
            <PaneItem textSize="medium">
              <FteFormat amt={fte_plan_3} />
            </PaneItem>
            {is_m2m && 
              <PaneItem textSize="small"> (Maximum) </PaneItem>
            }
          </Pane>,

          <Pane noPadding key="d" size={55}>
            {fte_graph}
          </Pane>,
        ]}
        text_row={[
          spend_summary_key &&
            <Pane key="a" size={45}>
              <PaneItem textSize="small">
                <TM
                  k={spend_summary_key}
                  args={{
                    exp_hist_change: latest_year_hist_spend_diff,
                    exp_plan_change: planned_spend_diff,
                    oldest_hist_spend_year: oldest_hist_spend_data.year,
                    latest_hist_spend_year: latest_hist_spend_data.year,
                    actual_hist_years_apart: actual_hist_years_apart,
                    subject,
                  }}
                />
              </PaneItem>
            </Pane>,
          fte_summary_key &&
            <Pane key="b" size={55}>
              <PaneItem textSize="small">
                <TM
                  k={fte_summary_key}
                  args={{
                    fte_hist_change: latest_year_hist_fte_diff,
                    fte_plan_change: planned_fte_diff,
                    subject,
                  }}
                />
              </PaneItem>
            </Pane>,
        ]}
      />
    );
  }
};

const MobileOrA11YContent = ({ children }) => [
  <div key="x" className="sr-only"> {children} </div>,
  <PaneItem key="y" hide_lg textSize="large">
    {children}
  </PaneItem>,
];

function render({calculations, footnotes, sources}){
  const { graph_args, subject } = calculations;

  let sources_override = sources;
  const { type, calcs } = graph_args;
  if(type==="planned"){
    sources_override = [ 
      get_planned_spending_source_link(subject), 
      get_planned_fte_source_link(subject),
    ];
  } else if(type==="estimates"){
    sources_override = [ get_estimates_source_link(subject) ];
  } else if(type==="hist_estimates"){
    sources_override = [
      get_estimates_source_link(subject),
      get_historical_spending_source_link(subject),
    ];
  } else if(type==="hist"){
    sources_override = [ get_historical_spending_source_link(subject) ];
    if(calcs.fte_data){
      sources_override.push( get_historical_fte_source_link(subject) );
    }
  } else if(type==="hist_planned"){
    sources_override = [
      get_planned_fte_source_link(subject),
      get_planned_spending_source_link(subject),
    ];
  }

  return (
    <InfographicPanel
      title={text_maker("welcome_mat_title")}
      sources={sources_override}
      footnotes={footnotes}
    >
      <WelcomeMat subject={subject} {...graph_args} />
    </InfographicPanel>
  );
}

//assumes programSpending/12 are loaded
function has_hist_data(subject, q6){
  return _.chain(exp_cols)
    .map(yr => q6.sum(yr) || 0)
    .some()
    .value();
}

function has_planning_data(subject, q6){
  let has_dp;
  switch(subject.level){
    case "dept":
      has_dp = subject.dp_status;
      break;
    case "program":
    case "crso":
      has_dp = subject.dept.dp_status;
      break;
    case "gov":
    case "tag":
      has_dp = true;
  }

  return has_dp && _.chain(planning_years)
    .map(yr => q6.sum(yr) || 0)
    .some()
    .value();
}

function get_calcs(subject, q6, q12){
  const has_planned = has_planning_data(subject,q6);
  const has_hist = has_hist_data(subject,q6);

  const hist_spend_data = _.map(exp_cols, col => q6.sum(col) || 0);
  const planned_spend_data = _.map(planning_years, col => q6.sum(col) || 0);
  
  const hist_fte_data = _.map(std_years, col => q12.sum(col) || 0);
  const planned_fte_data = _.map(planning_years, col => q12.sum(col) || 0);
  const fte_data = _.concat(hist_fte_data, planned_fte_data);

  const get_non_zero_data_year = (data, years, reverse) => {
    const loop = reverse ? _.forEachRight : _.forEach;
    let matched_data;
    loop(data, (value, key) => {
      if(value > 0){
        matched_data = {
          year: years[key],
          value: value,
        };
        return false;
      }
    });
    matched_data = matched_data ? matched_data
      : {
        year: reverse ? _.last(years) : _.first(years),
        value: 0,
      };
    return matched_data;
  };

  const oldest_hist_spend_data = get_non_zero_data_year(hist_spend_data, actual_history_years);
  const latest_hist_spend_data = get_non_zero_data_year(hist_spend_data, actual_history_years, true);
  
  const oldest_hist_fte_data = get_non_zero_data_year(hist_fte_data, actual_history_years);
  const latest_hist_fte_data = get_non_zero_data_year(hist_fte_data, actual_history_years, true);

  const spend_last_year_5 = _.first(hist_spend_data);
  const spend_last_year = _.last(hist_spend_data);
  const spend_plan_1= _.first(planned_spend_data);
  const spend_plan_3= _.last(planned_spend_data);
  
  const latest_year_hist_spend_diff = (latest_hist_spend_data.value-oldest_hist_spend_data.value)/oldest_hist_spend_data.value;
  const last_year_hist_spend_diff = (spend_last_year-oldest_hist_spend_data.value)/oldest_hist_spend_data.value;
  const planned_spend_diff = (spend_plan_3-spend_last_year)/spend_last_year;

  const fte_last_year_5= _.first(hist_fte_data);
  const fte_last_year= _.last(hist_fte_data);
  const fte_plan_1= _.first(planned_fte_data);
  const fte_plan_3= _.last(planned_fte_data);

  const latest_year_hist_fte_diff = (latest_hist_fte_data.value-oldest_hist_fte_data.value)/oldest_hist_fte_data.value;
  const last_year_hist_fte_diff = (fte_last_year-oldest_hist_fte_data.value)/oldest_hist_fte_data.value;
  const planned_fte_diff = (fte_plan_3-fte_last_year)/fte_last_year;

  return {
    oldest_hist_spend_data,
    latest_hist_spend_data,
    oldest_hist_fte_data,
    has_hist,
    has_planned,
    spend_last_year_5,
    spend_last_year,
    spend_plan_1,
    spend_plan_3,
    latest_year_hist_spend_diff,
    last_year_hist_spend_diff,
    planned_spend_diff,

    fte_last_year_5,
    fte_last_year,
    fte_plan_1,
    fte_plan_3,
    latest_year_hist_fte_diff,
    last_year_hist_fte_diff,
    planned_fte_diff,

    fte_data,
  };

}


const common_program_crso_calculate = function(subject, info, options){
  const { table6, table12 } = this.tables; 
  const q6 = table6.q(subject);
  const q12 = table12.q(subject);

  const has_planned = has_planning_data(subject, q6);
  const has_hist = has_hist_data(subject, q6);
  const calcs = get_calcs(subject, q6, q12);

  let type;
  if(has_hist && has_planned){
    type = "hist_planned";
  } else if(has_planned){
    type = "planned";
  } else if (has_hist){
    type = "hist";
  } else {
    // No data, bail
    return false;
  }

  return {type, info, calcs};
};


export const declare_welcome_mat_panel = () => declare_panel({
  panel_key: "welcome_mat",
  levels: ["gov", "dept", "program", "crso", "tag"],
  panel_config_func: (level, panel_key) => {
    switch (level){
      case "gov":
        return {
          footnotes: ["MACHINERY", "PLANNED_EXP", "FTE", "PLANNED_FTE", "EXP"],
          info_deps: ["programFtes_gov_info"],
          depends_on: ['programSpending','programFtes'],
          missing_info: "ok",
          calculate (subject, info, options){
            const { programSpending, programFtes } = this.tables; 
            const q6 = programSpending.q(subject);
            const q12 = programFtes.q(subject);
        
            const calcs = get_calcs(subject, q6, q12);
        
            return {
              type: "hist_planned",
              info,
              calcs,
            };
          },
          render,
        };
      case "dept":
        return {
          footnotes: ["MACHINERY", "PLANNED_EXP", "FTE", "PLANNED_FTE", "EXP"],
          info_deps: ["programFtes_dept_info"],
          depends_on: ['programSpending','programFtes', 'orgVoteStatEstimates', 'orgVoteStatPa'],
          missing_info: "ok",
          calculate (subject, info, options){
            const { programSpending, programFtes, orgVoteStatEstimates } = this.tables; 
            const q6 = programSpending.q(subject);
            const q12 = programFtes.q(subject);
        
            const has_planned = has_planning_data(subject, q6);
            const has_hist = has_hist_data(subject, q6);
            const estimates_amt = orgVoteStatEstimates.q(subject).sum("{{est_in_year}}_estimates");
            const calcs = get_calcs(subject, q6, q12);
        
            if( !(has_planned || has_hist) ){
              if(estimates_amt){
                return {
                  type: "estimates",
                  calcs: _.immutate(calcs, { spend_plan_1: estimates_amt }),
                };
              } else {
                return false;
              }
            }
        
            if(!subject.dp_status){
              //for non-dp orgs, we refer to estimate authorities. Must use orgVoteStatEstimates to get amounts
              const proper_calcs = _.immutate(
                calcs,
                { spend_plan_1: orgVoteStatEstimates.q(subject).sum("{{est_in_year}}_estimates") }
              );
              return {
                type: "hist_estimates",
                info,
                calcs: proper_calcs,
              };
            } else {
              //org with DP, we have everything! 
        
              if(has_planned){
                return {
                  type: "hist_planned",
                  info,
                  calcs,
                };
              } else {
                return {
                  type: "hist",
                  info,
                  calcs,
                };
              }
            }
          },
          render,
        };
      case "program":
        return {
          footnotes: ["MACHINERY", "PLANNED_EXP", "FTE", "PLANNED_FTE", "EXP"],
          info_deps: ["programFtes_program_info"],
          depends_on: ['table6', 'table12'],
          missing_info: "ok",
          calculate: common_program_crso_calculate,
          render,
        };
      case "crso":
        return {
          footnotes: ["MACHINERY", "PLANNED_EXP", "FTE", "PLANNED_FTE", "EXP"],
          info_deps: ["programFtes_crso_info"],
          depends_on: ['table6', 'table12'],
          missing_info: "ok",
          calculate: common_program_crso_calculate,
          render,
        };
      case "tag":
        return {
          footnotes: ["MACHINERY", "PLANNED_EXP", "FTE", "PLANNED_FTE", "EXP"],
          info_deps: ["programFtes_program_info"],
          depends_on: ['programSpending','programFtes'],
          missing_info: "ok",
          calculate (subject, info, options){
            const { programSpending, programFtes } = this.tables; 
            const q6 = programSpending.q(subject);
            const q12 = programFtes.q(subject);
        
            const calcs = get_calcs(subject, q6, q12);
        
            return {
              type: "hist_planned",
              info,
              calcs,
              is_m2m: subject.root.cardinality === "MtoM",
            };
          },
          render,
        };
    }
  },
});
