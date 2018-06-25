import "./welcome-mat.scss";
import text from './welcome_mat.yaml';
import { Fragment } from 'react';
import classNames from 'classnames';
import {
  Table,
  Panel,
  formats,
  PanelGraph,
  TM as StdTM,
  years,
  declarative_charts,
  create_text_maker,
  util_components,
  get_planned_fte_source_link,
  get_planned_spending_source_link,
  rpb_link,
  get_appropriate_rpb_subject,
} from "../shared.js" 

const { Format } = util_components;

const {
  Bar,
  Line,
} = declarative_charts;

const {std_years, planning_years} = years;
const exp_cols = _.map(std_years, yr => `${yr}exp`);
const text_maker = create_text_maker(text);
const TM = props => <StdTM tmf={text_maker} {...props} />;


const SpendFormat = ({amt}) => <Format type="compact1" content={amt} />
const FteFormat = ({amt}) => <Format type="big_int_real" content={amt} />

const get_estimates_source_link = subject => {
  const table = Table.lookup('table8');
  return {
    html: table.name,
    href: rpb_link({
      subject: subject.guid,
      table: table.id,
      mode: 'details',
      columns: ['{{est_in_year}}_estimates'], 
    }),
  }
};

const get_historical_spending_source_link = subject => {
  const table = Table.lookup('table6');
  const appropriate_subject = get_appropriate_rpb_subject(subject);
  return {
    html: table.name,
    href: rpb_link({
      subject: appropriate_subject.guid,
      table: table.id,
      mode: 'details',
      columns: std_years.map(yr => `${yr}_exp`), 
    }),
  }
};

const get_historical_fte_source_link = subject => {
  const table = Table.lookup('table12');
  const appropriate_subject = get_appropriate_rpb_subject(subject);
  return {
    html: table.name,
    href: rpb_link({
      subject: appropriate_subject.guid,
      table: table.id,
      mode: 'details',
      columns: std_years, 
    }),
  }
};


const Chart = ({
  is_fte,
  use_line,
  data,
  is_light,
}) => React.createElement(use_line ? Line : Bar, {
  margin : {top:5,bottom:5,left:75,right:5},
  height : 200,
  add_xaxis : false,
  hide_gridlines : true,
  ticks: _.range(0,data.length),
  colors : _.constant(is_light ? "#335075" : 'black'),
  formater :  formats[ is_fte ? "big_int_real_raw" : "compact1_raw" ],
  series : {"0": data },
})


const Pane = ({ size, children, is_header, noPadding }) => (
  <div className={`mat-grid__lg-panel${size} mat-grid__sm-panel`}>
    <div 
      className={classNames(
        "welcome-mat-rect",
        is_header ? "mat-grid__title": "mat-grid__inner-grid",
        noPadding && "mat-grid__inner-grid--no-padding"
      )}
    >
      { children }
    </div>
  </div>
);

const HeaderPane = props => <Pane is_header {...props} />

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
)


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
    calcs,
    is_m2m,
  } = props;

  //vars used multiple times accross multiple cases
  const five_years_ago = <TM k="five_years_ago" />;
  const last_year = <TM k="last_year" />;
  const in_three_years = <TM k="in_three_years" />;
  const in_this_year = <TM k="in_this_year" />;

  const long_term_trend = <TM k="8_year_trend" />;
  const hist_trend = <TM k="5_year_trend" />;
  const planned_trend = <TM k="3_year_trend" />;
  const no_hist_spending = <TM k="no_historical_spending__new" />;
  // const no_hist_ftes = <TM k="no_historical_fte__new" />;
  const spending_auths_are = <TM k="spending_authorities_are" />
  



  if(type==="hist"){
    //hist-only, old program or org
    //may or may not have FTEs

    //centered 80% width
    //five years ago, last year, graph
    //bottom text: this org|program|CR may be no longer be active

    const { 
      spend_last_year_5,
      spend_last_year,
      spend_data,
      hist_spend_diff,
      
      fte_last_year_5,
      fte_last_year,
      fte_data,
      hist_fte_diff,
    } = calcs;


    //note that it may or may not have FTEs...
    
    return (
      <WelcomeMatShell
        header_row={[
          <HeaderPane key="a" size={20} children={five_years_ago} />,
          <HeaderPane key="b" size={20} children={last_year} />,
          <HeaderPane key="d" size={40} children={hist_trend} />,
        ]}
        spend_row={[

          <Pane key="a" size={20}>
            <MobileOrA11YContent children={five_years_ago} />
            <PaneItem textSize="small">
              <TM k="spending_was__new" />
            </PaneItem>
            <PaneItem textSize="large">
              <SpendFormat amt={spend_last_year_5} />
            </PaneItem>
          </Pane>,

          <Pane key="b" size={20}>
            <MobileOrA11YContent children={last_year} />
            <PaneItem textSize="small">
              <TM k="spending_change_was__new" args={{hist_change: hist_spend_diff}}/>
            </PaneItem>
            <PaneItem textSize="large">
              <SpendFormat amt={spend_last_year} />
            </PaneItem>
          </Pane>,

          <Pane noPadding key="d" size={40}>
            <Chart 
              use_line
              data={_.take(spend_data,5)}
            />
          </Pane>,
        ]}
        fte_row={ fte_data && [
          <Pane key="a" size={20}>
            <MobileOrA11YContent children={five_years_ago} />
            <PaneItem textSize="large">
              <FteFormat amt={fte_last_year_5} />
            </PaneItem>
            <PaneItem textSize="small">
              <TM k="ftes_were_employed" />
            </PaneItem>
          </Pane>,

          <Pane key="b" size={20}>
            <MobileOrA11YContent children={last_year} />
            <PaneItem textSize="small">
              <TM k="fte_change_was__new" args={{hist_change: hist_fte_diff}}/>
            </PaneItem>
            <PaneItem textSize="large">
              <FteFormat amt={fte_last_year} />
            </PaneItem>
          </Pane>,

          <Pane noPadding key="d" size={40}>
            <Chart 
              use_line
              is_fte
              data={_.take(fte_data,5)}
            />
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
      spend_data,
      fte_plan_1,
      fte_plan_3,
      fte_data,
    } = calcs;

    const planned_spend_diff = spend_plan_3 && ( (spend_plan_3-spend_plan_1)/spend_plan_1);
    const planned_fte_diff = fte_plan_3 && ( (fte_plan_3-fte_plan_1)/fte_plan_1);



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
            <PaneItem textSize="large">
              <SpendFormat amt={spend_plan_1} />
            </PaneItem>
          </Pane>,

          <Pane key="b" size={20}>
            <MobileOrA11YContent children={in_three_years} />
            <PaneItem textSize="small">
              <TM k="spending_change_will__new" args={{plan_change: planned_spend_diff}} />
            </PaneItem>
            <PaneItem textSize="large">
              <SpendFormat amt={spend_plan_3} />
            </PaneItem>
          </Pane>,

          <Pane noPadding key="c" size={40}>
            <Chart 
              data={_.takeRight(spend_data, 3)}
              is_light
            />
          </Pane>,
        ]}
        fte_row={fte_data && [

          <Pane key="a" size={20}>
            <MobileOrA11YContent children={in_this_year} />
            <PaneItem textSize="large">
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
            <PaneItem textSize="large">
              <FteFormat amt={fte_plan_3} />
            </PaneItem>
          </Pane>,

          <Pane noPadding key="c" size={40}>
            <Chart  
              data={_.takeRight(fte_data,3)}
              is_fte
              is_light
            />
          </Pane>,
        ]}
      />
      
    )


  } else if(type === "estimates"){
    //new, non-DP org, CR or program

    const { 
      spend_plan_1,
    } = calcs;


    return (
      <WelcomeMatShell
        header_row={[
          <HeaderPane key="a" size={20} children={five_years_ago} />,
          <HeaderPane key="b" size={20} children={last_year} />,
          <HeaderPane key="c" size={20} children={in_this_year} />,
          <HeaderPane key="d" size={40} children={hist_trend} />,
        ]}
        spend_row={[

          <Pane key="a" size={20}>
            <MobileOrA11YContent children={five_years_ago} />
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
            <PaneItem textSize="large">
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
      spend_last_year_5,
      spend_data,
    } = calcs;

    const hist_spend_diff = spend_last_year_5 && ( (spend_last_year-spend_last_year_5)/spend_last_year_5);


    return (
      <WelcomeMatShell
        header_row={[
          <HeaderPane key="a" size={20} children={five_years_ago} />,
          <HeaderPane key="b" size={20} children={last_year} />,
          <HeaderPane key="c" size={20} children={in_this_year} />,
          <HeaderPane key="d" size={40} children={hist_trend} />,
        ]}
        spend_row={[

          <Pane key="a" size={20}>
            <MobileOrA11YContent children={five_years_ago} />
            <PaneItem textSize="small">
              <TM k="spending_was__new" />
            </PaneItem>
            <PaneItem textSize="large">
              <SpendFormat amt={spend_last_year_5} />
            </PaneItem>
          </Pane>,

          <Pane key="b" size={20}>
            <MobileOrA11YContent children={last_year} />
            <PaneItem textSize="small">
              <TM k="spending_change_was__new" args={{hist_change: hist_spend_diff}}/>
            </PaneItem>
            <PaneItem textSize="large">
              <SpendFormat amt={spend_last_year} />
            </PaneItem>
          </Pane>,

          <Pane key="c" size={20}>
            <MobileOrA11YContent children={spending_auths_are} />
            {
              spend_plan_1 ? 
              <Fragment>
                <PaneItem textSize="small">
                  <TM k="spending_authorities_are" />
                </PaneItem>
                <PaneItem textSize="large">
                  <SpendFormat amt={spend_plan_1} />
                </PaneItem>
              </Fragment> :
              <PaneItem textSize="small">
                <TM k="no_spend_auth_this_year__new" />
              </PaneItem>
            }
          </Pane>,

          <Pane noPadding key="d" size={40}>
            <Chart 
              use_line
              data={_.take(spend_data,5)}
            />
          </Pane>,
        ]}
        text_row={[
          <Pane key="a" size={100}>
            <PaneItem textSize="small">
              <TM
                k="dept2_welcome_mat_spending_summary"
                args={{
                  exp_hist_change: hist_spend_diff,
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
      spend_last_year_5,
      spend_last_year,
      spend_plan_3,

      hist_spend_diff,
      planned_spend_diff,

      spend_data,

      fte_last_year_5,
      fte_last_year,
      fte_plan_3,
      hist_fte_diff,
      planned_fte_diff,
      fte_data,
    } = calcs;

    const { level } = subject;
    let spend_summary_key;
    if(level === "gov"){
      spend_summary_key = "gov_welcome_mat_spending_summary";
    } else if(level === "dept"){
      spend_summary_key = "dept1_welcome_mat_spending_summary";
    } else if(level === "tag"){
      spend_summary_key = "tag_welcome_mat_spending_summary";
      //TODO... is it possible for programs or CRs to have hist_planned ?
    }

    const fte_summary_key = (
      level === "tag" ? 
      "tag_welcome_mat_fte_summary" : 
      "welcome_mat_fte_summary"
    );

    

    return (
      <WelcomeMatShell
        header_row={[
          <HeaderPane key="a" size={20} children={five_years_ago} />,
          <HeaderPane key="b" size={20} children={last_year} />,
          <HeaderPane key="c" size={20} children={in_three_years} />,
          <HeaderPane key="d" size={40} children={long_term_trend} />,
        ]}
        spend_row={[

          <Pane key="a" size={20}>
            <MobileOrA11YContent children={five_years_ago} />
            <PaneItem textSize="small">
              <TM k="spending_was__new" />
            </PaneItem>
            <PaneItem textSize="large">
              <SpendFormat amt={spend_last_year_5} />
            </PaneItem>
            {is_m2m && 
              <PaneItem textSize="small"> (Maximum) </PaneItem>
            }
          </Pane>,

          <Pane key="b" size={20}>
            <MobileOrA11YContent children={last_year} />
            <PaneItem textSize="small">
              <TM k="spending_change_was__new" args={{hist_change: hist_spend_diff}}/>
            </PaneItem>
            <PaneItem textSize="large">
              <SpendFormat amt={spend_last_year} />
            </PaneItem>
            {is_m2m && 
              <PaneItem textSize="small"> (Maximum) </PaneItem>
            }
          </Pane>,

          <Pane key="c" size={20}>
            <MobileOrA11YContent children={in_three_years} />
            <PaneItem textSize="small">
              <TM k="spending_change_will__new" args={{plan_change: planned_spend_diff}} />
            </PaneItem>
            <PaneItem textSize="large">
              <SpendFormat amt={spend_plan_3} />
            </PaneItem>
            {is_m2m && 
              <PaneItem textSize="small"> (Maximum) </PaneItem>
            }
          </Pane>,

          <Pane noPadding key="d" size={40}>
            <Chart 
              use_line 
              data={spend_data}
            />
          </Pane>,
        ]}
        fte_row={fte_data && [

          <Pane key="a" size={20}>
            <MobileOrA11YContent children={five_years_ago} />
            <PaneItem textSize="large">
              <FteFormat amt={fte_last_year_5} />
            </PaneItem>
            <PaneItem textSize="small">
              <TM k="ftes_were_employed" />
            </PaneItem>
            {is_m2m && 
              <PaneItem textSize="small"> (Maximum) </PaneItem>
            }
          </Pane>,

          <Pane key="b" size={20}>
            <MobileOrA11YContent children={last_year} />
            <PaneItem textSize="small">
              <TM k="fte_change_was__new" args={{hist_change: hist_fte_diff}}/>
            </PaneItem>
            <PaneItem textSize="large">
              <FteFormat amt={fte_last_year} />
            </PaneItem>
            {is_m2m && 
              <PaneItem textSize="small"> (Maximum) </PaneItem>
            }
          </Pane>,

          <Pane key="c" size={20}>
            <MobileOrA11YContent children={in_three_years} />
            <PaneItem textSize="small">
              <TM k="fte_change_will__new" args={{plan_change: planned_fte_diff}} />
            </PaneItem>
            <PaneItem textSize="large">
              <FteFormat amt={fte_plan_3} />
            </PaneItem>
            {is_m2m && 
              <PaneItem textSize="small"> (Maximum) </PaneItem>
            }
          </Pane>,

          <Pane noPadding key="d" size={40}>
            <Chart 
              use_line 
              data={fte_data}
              is_fte
            />
          </Pane>,
        ]}
        text_row={[
          <Pane key="a" size={50}>
            <PaneItem textSize="small">
              <TM
                k={spend_summary_key}
                args={{
                  exp_hist_change: hist_spend_diff,
                  exp_plan_change: planned_spend_diff,
                  subject,
                }}
              />
            </PaneItem>
          </Pane>,
          <Pane key="b" size={50}>
            <PaneItem textSize="small">
              <TM
                k={fte_summary_key}
                args={{
                  fte_hist_change: hist_fte_diff,
                  fte_plan_change: planned_fte_diff,
                  subject,
                }}
              />
            </PaneItem>
          </Pane>,
        ]}
      />
      
    )

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

  //remove DRR_FTE and DRR_EXP footnotes (pipeline will handle this later)
  let new_footnotes = _.filter(
    footnotes,
    ({glossary_keys}) => _.chain(glossary_keys)
      .intersection(["DRR_FTE", "DRR_EXP"])
      .isEmpty()
      .value()
  );

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
    ]
  }

  return (
    <Panel
      title={text_maker("welcome_mat_title")}
      sources={sources_override}
      footnotes={new_footnotes}
    >
      <WelcomeMat subject={subject} {...graph_args} />
    </Panel>
  );
}

//assumes table6/12 are loaded
function has_hist_data(subject,q6){
  return _.chain(exp_cols)
    .map(yr => q6.sum(yr) || 0)
    .some()
    .value();
}

function has_planning_data(subject, q6){
  return _.chain(planning_years)
    .map(yr => q6.sum(yr) || 0)
    .some()
    .value();
}

function get_calcs(subject, q6, q12){

  const hist_spend_data =  _.map(exp_cols, col => q6.sum(col) || 0);
  const planned_spend_data = _.map(planning_years, col => q6.sum(col) || 0);
  
  const hist_fte_data = _.map(std_years, col => q12.sum(col) || 0);
  const planned_fte_data = _.map(planning_years, col => q12.sum(col) || 0);


  let spend_data;
  if(_.some(hist_spend_data) && _.some(planned_spend_data)){
    spend_data = [...hist_spend_data, ...planned_spend_data];
  }
  if(_.some(hist_spend_data) && !_.some(planned_spend_data)){
    spend_data = hist_spend_data;
  }
  if(!_.some(hist_spend_data) && _.some(planned_spend_data)){
    spend_data = planned_spend_data;
  }


  let fte_data;
  if(_.some(hist_fte_data) && _.some(planned_fte_data)){
    fte_data = [...hist_fte_data, ...planned_fte_data];
  } else if(_.some(hist_fte_data) && !_.some(planned_fte_data)){
    fte_data = hist_fte_data;
  } else if(!_.some(hist_fte_data) && _.some(planned_fte_data)){
    fte_data = planned_fte_data;
  }

  const spend_last_year_5 = _.first(hist_spend_data);
  const spend_last_year = _.last(hist_spend_data);
  const spend_plan_1= _.first(planned_spend_data);
  const spend_plan_3= _.last(planned_spend_data);

  const hist_spend_diff = spend_last_year_5 && ( (spend_last_year-spend_last_year_5)/spend_last_year_5);
  const planned_spend_diff = spend_plan_3 && ( (spend_plan_3-spend_last_year)/spend_last_year);

  const fte_last_year_5= _.first(hist_fte_data);
  const fte_last_year= _.last(hist_fte_data);
  const fte_plan_1= _.first(planned_fte_data);
  const fte_plan_3= _.last(planned_fte_data);

  const hist_fte_diff = fte_last_year_5 && ( (fte_last_year-fte_last_year_5)/fte_last_year_5);
  const planned_fte_diff = fte_plan_3 && ( (fte_plan_3-fte_last_year)/fte_last_year);

  return {
    spend_last_year_5,
    spend_last_year,
    spend_plan_1,
    spend_plan_3,
    hist_spend_diff,
    planned_spend_diff,

    spend_data,


    fte_last_year_5,
    fte_last_year,
    fte_plan_1,
    fte_plan_3,
    hist_fte_diff,
    planned_fte_diff,

    fte_data,
  };

}


new PanelGraph({
  level: "dept",
  key: 'welcome_mat',
  footnotes : ["MACHINERY", "PLANNED_EXP", "FTE", "PLANNED_FTE", "EXP"],
  depends_on : ['table6','table12', 'table8'],
  missing_info: "ok",
  calculate (subject,info,options){
    const { table6, table12, table8 } = this.tables; 
    const q6 = table6.q(subject);
    const q12 = table12.q(subject);

    const has_planned = has_planning_data(subject,q6);
    const has_hist = has_hist_data(subject, q6);
    const estimates_amt = table8.q(subject).sum("{{est_in_year}}_estimates");
    const calcs = get_calcs(subject,q6,q12);

    if(! (has_planned || has_hist) ){
      if(estimates_amt){
        return {
          type: "estimates",
          calcs: _.immutate(calcs,{ spend_plan_1: estimates_amt }),
        };
      } else {
        return false;
      }
    }

    if(!subject.dp_status){
      //for non-dp orgs, we refer to estimate authorities. Must use table8 to get amounts
      const proper_calcs = _.immutate(calcs,{
        spend_plan_1: table8.q(subject).sum("{{est_in_year}}_estimates"),
        
      });
      return {
        type: "hist_estimates",
        calcs: proper_calcs,
      };
    } else {
      //org with DP, we have everything! 

      if(has_planned){
        return {
          type: "hist_planned",
          calcs,
        }
      } else {
        return {
          type: "hist",
          calcs,
        };
      }
    }
  },
  render,
});



new PanelGraph({
  level: "program",
  key: 'welcome_mat',
  footnotes : ["MACHINERY", "PLANNED_EXP", "FTE", "PLANNED_FTE", "EXP"],
  depends_on : ['table6','table12'],
  missing_info: "ok",
  calculate (subject,info,options){
    const { table6, table12 } = this.tables; 
    const q6 = table6.q(subject);
    const q12 = table12.q(subject);

    const has_planned = has_planning_data(subject,q6);
    const has_hist = has_hist_data(subject, q6);
    const calcs = get_calcs(subject,q6,q12);

    if(! (has_planned || has_hist) ){
      return false;
    }
    let type;
    if(!subject.dept.dp_status){
      if(has_planned){
        type = "estimates";
      } else {
        type ="hist";
      }
    } else if(has_planned){
      //program with DP: only planned
      type = "planned";
    } else {
      //old program, only historical
      type = "hist";
    }

    return {type, calcs};

  },

  render,
});

new PanelGraph({
  level: "crso",
  key: 'welcome_mat',
  footnotes : ["MACHINERY", "PLANNED_EXP", "FTE", "PLANNED_FTE", "EXP"],
  depends_on : ['table6','table12'],
  missing_info: "ok",
  calculate (subject,info,options){
    const { table6, table12 } = this.tables; 
    const q6 = table6.q(subject);
    const q12 = table12.q(subject);

    const has_planned = has_planning_data(subject,q6);
    const has_hist = has_hist_data(subject, q6);
    const calcs = get_calcs(subject,q6,q12);

    if(! (has_planned || has_hist) ){
      return false;
    }
    return {
      type: "planned",
      calcs,
    };

  },

  render,
});

new PanelGraph({
  level: "gov",
  key: 'welcome_mat',
  footnotes : ["MACHINERY", "PLANNED_EXP", "FTE", "PLANNED_FTE", "EXP"],
  depends_on : ['table6','table12'],
  missing_info: "ok",
  calculate (subject,info,options){
    const { table6, table12 } = this.tables; 
    const q6 = table6.q(subject);
    const q12 = table12.q(subject);

    const calcs = get_calcs(subject,q6,q12);

    return {
      type: "hist_planned",
      calcs,
    };

  },

  render,
});

new PanelGraph({
  level: "tag",
  key: 'welcome_mat',
  footnotes : ["MACHINERY", "PLANNED_EXP", "FTE", "PLANNED_FTE", "EXP"],
  depends_on : ['table6','table12'],
  missing_info: "ok",
  calculate (subject,info,options){
    const { table6, table12 } = this.tables; 
    const q6 = table6.q(subject);
    const q12 = table12.q(subject);

    const calcs = get_calcs(subject,q6,q12);

    return {
      type: "hist_planned",
      calcs,
      is_m2m: subject.root.cardinality === "MtoM",
    };

  },

  render,
});