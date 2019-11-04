import './AverageSharePie.scss';

import {
  infobase_colors_smart,
  newIBCategoryColors,
  trivial_text_maker,
  formats,
  NivoResponsivePie,
  declarative_charts,
  util_components,
} from "../shared.js"; 

const { TabularPercentLegend } = declarative_charts;
const { Format } = util_components;

export const AverageSharePie = ({panel_args, sort_func}) => {
  const used_sort_func = sort_func || ((a,b) => b.value-a.value);

  const data = panel_args
    .map( d => 
      ({
        value: d.five_year_percent, 
        label: d.label,
        id: d.label,
      })
    ).sort(used_sort_func);

  const color_scale = infobase_colors_smart( d3.scaleOrdinal().range(newIBCategoryColors) );

  const legend_items = _.map(
    data, 
    ({value, label }) => ({
      value,
      label,
      color: color_scale(label),
      id: label,
    })
  );

  return (
    <div 
      aria-hidden={true}
      className="average-share-pie"
    >
      <div className="average-share-pie__graph" style = {{height: '350px'}}>
        <NivoResponsivePie
          data = {data}
          colors = {({id}) => color_scale(id)}
          margin = {{
            'top': 30,
            'right': 40,
            'left': 50,
            'bottom': 40,
          }}
          include_percent = {false}
          text_formatter = {formats.percentage1}
        />
      </div>
      <div className="average-share-pie__legend">
        <div className="centerer">
          <div className="centerer-IE-fix">
            <span className="average-share-percent-header">
              {trivial_text_maker("five_year_percent_header")}
            </span>
            <TabularPercentLegend
              items={legend_items}
              get_right_content={item => 
                <span>
                  <Format type="percentage1" content={item.value} />
                </span>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};