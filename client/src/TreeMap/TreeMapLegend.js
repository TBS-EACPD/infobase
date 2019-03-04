import './TreeMap.scss';
import treemap_text from './TreeMap.yaml';
import { create_text_maker } from '../models/text.js';
import { Fragment } from 'react';
import { formats } from '../core/format.js';

const text_maker = create_text_maker([treemap_text]);


const size_controls = {
  "drf": text_maker("expenditures"),
  "drf_ftes": text_maker("fte"),
  "tp": text_maker("SOBJ10"),
  "vote_stat": text_maker("expenditures"),
  "so": text_maker("expenditures"),
}

export class TreeMapLegend extends React.Component {
  constructor() {
    super();
  }
  render() {
    const {
      perspective,
      legend_cols,
      legend_measure_text,
    } = this.props;
    return (
      <Fragment>
        <div className='row'>
          <div className="col-sm-12">
            <h5>Reading the chart</h5>
          </div>
        </div>
        <div className='row'>
          <div className="col-sm-5">
            <div className="row">
              <div className="col-sm-6">Boxes are scaled proportionally according to {size_controls[perspective]}</div>
              <div className="col-sm-6">
                <svg width="110" height="110">
                  <g transform="translate(5,5)">
                    <rect className="mutLegendBG" fill="white" stroke="black" strokeWidth="2" width="100" height="100" />
                    <rect className="mutLegendBG" fill="white" stroke="black" strokeWidth="2" width="50" height="50" />
                    <text className="breakLabels" x="45" y="45" style={{ textAnchor: "end", display: "block" }} >
                      {`${formats.big_int_real_raw(25000)}`}
                    </text>
                    <text className="breakLabels" x="95" y="95" style={{ textAnchor: "end", display: "block" }} >
                      {`${formats.big_int_real_raw(100000)}`}
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <div className="col-sm-7">
            <div className="row">
              {legend_measure_text}
              <svg width="500" height="66">
                <g className="mutLegendGroup" transform="translate(0,0)">
                  <rect className="mutLegendBG" fill="white" stroke="black" width="500" height="66" />
                  {_.map(legend_cols, (o, ix) => {
                    return legend_block(o.val, o.col, ix);
                  })
                  }
                </g>
              </svg>
            </div>
          </div>
        </div>
      </Fragment>
    )
  }
}

const legend_block = (val, col, ix) =>
  <g className="legendCells" transform={`translate(${ix * 80 + 20},20)`}>
    <rect className="breakRect" height="25" width="80" fill={col} stroke="black" />
    {val &&
      <text className="breakLabels" x="0" y="40" style={{ textAnchor: "middle", display: "block" }} >
        {val}
      </text>}
  </g>