import { Fragment } from 'react';
import {
  text_maker,
  TM,
} from './gnc_text_provider.js';
import {
  Subject,
  formatter,
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
    const data1_total = graph_args.data1[0].value
    const data1_value = graph_args.data1[1].value
    const data2_total= graph_args.data2[0].value
    const data2_value = graph_args.data2[1].value

    const data1_totalFmt = formatter("compact", data1_total, {raw: true, precision: 1})
    const data1_valueFmt = formatter("compact", data1_value, {raw: true, precision: 1})
    const data2_totalFmt = formatter("compact", data2_total, {raw: true, precision: 1})
    const data2_valueFmt = formatter("compact", data2_value, {raw: true, precision: 1})

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
                title={Subject.Gov.name}
                totalValue={data1_total}
                value={data1_value}
                descriptiveTextValue={`${data1_valueFmt} of ${data1_totalFmt}`}
              />
            </Col>
            <Col size={3} isGraph>
              <LiquidFillGauge
                height={200}
                title={subject.fancy_name}
                totalValue={data2_total}
                value={data2_value}
                descriptiveTextValue={`${data2_valueFmt} of ${data2_totalFmt}`}
              />
            </Col>
          </Fragment>
        }
      </StdPanel>
    );
  },
});

