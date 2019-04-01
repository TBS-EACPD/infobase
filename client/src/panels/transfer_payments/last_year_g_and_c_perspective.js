import { Fragment } from 'react';
import {
  text_maker,
  TM,
} from './gnc_text_provider.js';
import {
  Subject,
  formats,
  PanelGraph,
  StdPanel,
  Col,
  declarative_charts,
} from "../shared";

const { CirclePieChart } = declarative_charts;

new PanelGraph({
  level: "dept",
  key: "last_year_g_and_c_perspective",
  depends_on: ['orgTransferPayments'],
  footnotes: ['SOBJ10'],
  info_deps: ['orgTransferPayments_gov_info', 'orgTransferPayments_dept_info', 'orgVoteStatPa_dept_info'],
  calculate(subject, info, options){
    return {
      data1: [
        { value: info.gov_tp_exp_pa_last_year, name: 'y'},
        { value: info.dept_tp_exp_pa_last_year, name: 'x'},
      ],
      data2: [
        { value: info.dept_exp_pa_last_year, name: 'z'},
        { value: info.dept_tp_exp_pa_last_year, name: 'x'},
      ],
    }
  },
  render({calculations, footnotes, sources}){
    const { subject, graph_args, info } = calculations; 
    const colors = infobase_colors();

    return (
      <StdPanel
        title={text_maker("last_year_g_and_c_perspective_title")}
        footnotes={footnotes}
        sources={sources}
      >
        <Col size={6} isText>
          <TM k="dept_last_year_g_and_c_perspective_text" args={info} />
        </Col>
        { !window.is_a11y_mode &&
          <Fragment>
            <Col size={3} isGraph>
              <CirclePieChart 
                height={300}
                colors={colors}
                formatter={formats.compact1}
                font_size="16"
                title={Subject.Gov.name}
                data={graph_args.data1}
              />
            </Col>
            <Col size={3} isGraph>
              <CirclePieChart
                height={300}
                colors={colors}
                formatter={formats.compact1}
                font_size="16"
                title={subject.fancy_name}
                data={graph_args.data2}
              />
            </Col>
          </Fragment>
        }
      </StdPanel>
    );
  },
});

