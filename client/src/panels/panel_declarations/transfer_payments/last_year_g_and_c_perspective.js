import { Fragment } from 'react';
import {
  text_maker,
  TM,
} from './gnc_text_provider.js';
import {
  Subject,
  formatter,
  declare_panel,
  StdPanel,
  Col,
  declarative_charts,
} from "../shared.js";

const { LiquidFillGauge } = declarative_charts;


export const declare_last_year_g_and_c_perspective_panel = () => declare_panel({
  panel_key: "last_year_g_and_c_perspective",
  levels: ["dept"],
  panel_config_func: (level, panel_key) => ({
    depends_on: ['orgTransferPayments'],
    footnotes: ['SOBJ10'],
    info_deps: ['orgTransferPayments_gov_info', 'orgTransferPayments_dept_info', 'orgVoteStatPa_dept_info'],
    calculate(subject, info, options){
      const panel_args = {
        dept_in_gov: [
          { value: info.gov_tp_exp_pa_last_year, name: 'y'},
          { value: info.dept_tp_exp_pa_last_year, name: 'x'},
        ],
        tp_in_exp: [
          { value: info.dept_exp_pa_last_year, name: 'z'},
          { value: info.dept_tp_exp_pa_last_year, name: 'x'},
        ],
      };
  
      const has_transfer_payments = info.dept_tp_exp_pa_last_year !== 0;
  
      return has_transfer_payments && panel_args;
    },
    render({calculations, footnotes, sources}){
      const { subject, panel_args, info } = calculations; 
      const gov_tp_exp_pa_last_year = panel_args.dept_in_gov[0].value;
      const dept_tp_exp_pa_last_year = panel_args.dept_in_gov[1].value;
      const dept_exp_pa_last_year= panel_args.tp_in_exp[0].value;
  
      const fmt_gov_tp_exp_pa_last_year = formatter("compact", gov_tp_exp_pa_last_year, {raw: true, precision: 1});
      const fmt_dept_tp_exp_pa_last_year = formatter("compact", dept_tp_exp_pa_last_year, {raw: true, precision: 1});
      const fmt_dept_exp_pa_last_year = formatter("compact", dept_exp_pa_last_year, {raw: true, precision: 1});
  
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
                  totalValue={gov_tp_exp_pa_last_year}
                  value={dept_tp_exp_pa_last_year}
                  descriptiveTextValue={`${fmt_dept_tp_exp_pa_last_year} ${text_maker("of")} ${fmt_gov_tp_exp_pa_last_year}`}
                />
              </Col>
              <Col size={3} isGraph>
                <LiquidFillGauge
                  height={200}
                  title={subject.fancy_name}
                  totalValue={dept_exp_pa_last_year}
                  value={dept_tp_exp_pa_last_year}
                  descriptiveTextValue={`${fmt_dept_tp_exp_pa_last_year} ${text_maker("of")} ${fmt_dept_exp_pa_last_year}`}
                />
              </Col>
            </Fragment>
          }
        </StdPanel>
      );
    },
  }),
});
