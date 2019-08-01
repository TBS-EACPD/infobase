import '../../components/Details.scss';
import { Details } from '../../components/Details.js';
import text from './historical_planned_fte.yaml';
import text2 from '../../common_text/common_lang.yaml';
import MediaQuery from 'react-responsive';
import {
  run_template,
  PanelGraph,
  years,
  declarative_charts,
  StdPanel,
  Col,
  create_text_maker_component,
  NivoResponsiveLine,
  newIBCategoryColors,
  formatter,
} from "../shared.js";

const {
  A11YTable,
} = declarative_charts;

const { text_maker, TM } = create_text_maker_component([text, text2]);
const { std_years, planning_years } = years;

const render = function({calculations, footnotes, sources}) {
  const { info, subject } = calculations;
  console.log(info);
  console.log(subject);

  const colors = d3.scaleOrdinal().range(newIBCategoryColors);
  const series_labels = [text_maker("actual_ftes"), text_maker("planned_ftes")];
  const history_ticks = _.map(std_years, run_template);
  const plan_ticks = _.map(planning_years, run_template);

  const latest_historical_year = _.chain(history_ticks)
    .last()
    .split('-')
    .first()
    .parseInt()
    .value();
  const first_planning_year = _.chain(plan_ticks)
    .first()
    .split('-')
    .first()
    .parseInt()
    .value();
  const gap_year = first_planning_year - latest_historical_year === 2 && subject.has_planned_spending ? 
  `${latest_historical_year+1}-${(latest_historical_year+2).toString().substring(2)}` :
  null;
  const marker_year = subject.has_planned_spending ? (gap_year || _.first(plan_ticks)) : null;

  const history_data_index = _.map(std_years, (std_year) => `${subject.level}_fte_${std_year.replace(/{|}/g, "")}`);
  const planned_data_index = _.map(planning_years, (planned_year) => `${subject.level}_fte_${planned_year.replace(/{|}/g, "")}`);
  
  let graph_content;

  if(window.is_a11y_mode){
    const history_a11y_data = _.zipWith(history_ticks, history_data_index, (year, idx) => ({
      label: year,
      data: [info[idx], null],
    }));
    const planned_a11y_data = _.zipWith(plan_ticks, planned_data_index, (year, idx) => ({
      label: year,
      data: [null, info[idx]],
    }));

    graph_content = (
      <A11YTable
        data_col_headers={series_labels}
        data={_.concat(history_a11y_data, planned_a11y_data)}
      />
    );
  } else{
    const prepare_raw_data = (data, data_index) => _.map(data_index, (idx) => data[idx]);
    const raw_data = _.concat(
      prepare_raw_data(info, history_data_index), prepare_raw_data(info, planned_data_index)
    );
  
    const prepare_graph_data = (data, data_index, years) => (
      _.zipWith(years, data_index, (year, idx) => (
        {
          x: year,
          y: data[idx],
        }
      ))
    );
    const graph_data = _.chain(series_labels)
      .zip([
        prepare_graph_data(info, history_data_index, history_ticks),
        _.compact([
          gap_year && {
            x: gap_year,
            y: null,
          },
          ...prepare_graph_data(info, planned_data_index, plan_ticks),
        ]),
      ])
      .map( ([id, data]) => ({id, data}) )
      .value();
    const nivo_default_props = {
      data: graph_data,
      raw_data: raw_data,
      is_money: false,
      colorBy: d => colors(d.id),
      magnify_glass_translateX: 80,
      margin: {
        top: 27,
        right: 30,
        bottom: 30,
        left: 100,
      },
      legends: [
        {
          anchor: 'top-left',
          direction: 'row',
          translateY: -27,
          itemDirection: 'left-to-right',
          itemWidth: 160,
          itemHeight: 20,
          itemsSpacing: 2,
          itemOpacity: 0.75,
          symbolSize: 12,
        },
      ],
    };
    if(marker_year){
      nivo_default_props["markers"] = [
        {
          axis: 'x',
          value: marker_year,
          lineStyle: { 
            stroke: window.infobase_color_constants.tertiaryColor, 
            strokeWidth: 2,
            strokeDasharray: ("3, 3"),
          },
        },
      ];  
    }
    const nivo_mobile_props = _.merge(
      {},
      nivo_default_props,
      {
        margin: {top: 60},
        legends: [
          {
            translateY: -60,
            directio: "column",
            itemsSpacing: 1,
          },
        ],
      }
    );
  
    graph_content = (
      <div style={{height: 400}} aria-hidden = {true}>
        {
          <MediaQuery minWidth={991}>
            <NivoResponsiveLine
              {...nivo_default_props}
            />
          </MediaQuery>
        }
        {
          <MediaQuery maxWidth={992}>
            <NivoResponsiveLine
              {...nivo_mobile_props}
            />
          </MediaQuery>
        }
      </div>
    );  
  }

  return (
    <StdPanel
      containerAlign={gap_year ? "top" : "middle"}
      title={"example title"}
      {...{footnotes,sources}}
    >
      <Col size={4} isText>
        { gap_year &&
          <div className="IBDetails__container">
            <Details
              summary_content={<TM k={"gap_explain_title"} args={{...info}}/>}
              content={<TM k={`${subject.level}_gap_explain_body`} args={{...info}}/>}
            />
          </div>
        }
      </Col>
      <Col size={8} isGraph>
        {graph_content}
      </Col>
    </StdPanel>
  );
};

new PanelGraph({
  level: "gov",
  key: "historical_planned_fte",
  info_deps: ["programFtes_gov_info"],
  render,
});

new PanelGraph({
  level: "dept",
  key: "historical_planned_fte",
  info_deps: ["programFtes_dept_info"],
  render,
});

new PanelGraph({
  level: "program",
  key: "historical_planned_fte",
  info_deps: ["programFtes_program_info"],
  render,
});

new PanelGraph({
  level: "crso",
  key: "historical_planned_fte",
  info_deps: ["programFtes_crso_info"],
  render,
});

