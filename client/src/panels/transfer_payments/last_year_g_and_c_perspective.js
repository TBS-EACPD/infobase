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

const { LiquidFillGauge } = declarative_charts;

new PanelGraph({
  level: "dept",
  key: "last_year_g_and_c_perspective",
  depends_on: ['orgTransferPayments'],
  footnotes: ['SOBJ10'],
  info_deps: ['orgTransferPayments_gov_info', 'orgTransferPayments_dept_info', 'orgVoteStatPa_dept_info'],
  calculate(subject, info, options){
    const graph_args = {
      data1: [
        { value: info.gov_tp_exp_pa_last_year, name: 'y'},
        { value: info.dept_tp_exp_pa_last_year, name: 'x'},
      ],
      data2: [
        { value: info.dept_exp_pa_last_year, name: 'z'},
        { value: info.dept_tp_exp_pa_last_year, name: 'x'},
      ],
    };

    const has_transfer_payments = info.dept_tp_exp_pa_last_year !== 0;

    return has_transfer_payments && graph_args;
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
              <LiquidFillGauge 
                height={200}
                title="Department of Finance"
                totalValue={graph_args.data1[0].value}
                value={graph_args.data1[1].value}
              />
            </Col>
            <Col size={3} isGraph>
              <LiquidFillGauge
                height={200}
                title="Government"
                totalValue={graph_args.data2[0].value}
                value={graph_args.data2[1].value}
              />
            </Col>
          </Fragment>
        }
      </StdPanel>
    );
  },
});

