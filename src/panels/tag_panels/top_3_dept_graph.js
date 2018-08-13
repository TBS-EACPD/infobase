import text from './top_3_depts.yaml';
import {
  PanelGraph, 
  Subject,
  CTMTM,
  StdPanel,
  Col,
  declarative_charts,
} from "../shared";

const { Dept } = Subject;
const { ProgressDonut } = declarative_charts;
const [ text_maker, TM ] = CTMTM(text);

new PanelGraph({
  level: "tag",
  key : "tag_top_3_depts",
  depends_on: ['table6'],
  info_deps: ["table6_tag_info"],

  calculate(subject,info,options){
    const {table6} = this.tables;
    const col = "{{pa_last_year}}exp";
    const programs = subject.programs;
    const top_3_last_year_tag_exps = _.chain(programs)
      .map( prog => {
        const row = _.first(table6.programs.get(prog));
        const exp = (row && row[col]);
        return [ prog, exp ];
      })
      .filter( ([prog, exp]) => exp > 0 )
      .groupBy( ([prog,exp]) => prog.dept.unique_id )
      .map( (prog_exp_vals, dept_key) => ({ dept_key, exp: _.reduce(prog_exp_vals,(x,y) => x + y[1], 0 ) }) )
      .sortBy(pair => -pair.exp)
      .take(3)
      .filter( d => d.dept_key ) // in case there aren't even 3 depts
      .map( d => ({ dept: Dept.lookup(d.dept_key), exp: d.exp }))
      .value();

    const top_3_last_year_total_exps = _.chain(top_3_last_year_tag_exps)
      .map(d => ({dept:d.dept, exp: table6.q(d.dept).sum(col) }))
      .value();

    const top_3_depts = _.chain(top_3_last_year_tag_exps)
      .zip(top_3_last_year_total_exps)
      .map( ([tag, total]) => (
        { dept: tag.dept,
          tag_spent: tag.exp,
          total_spent: total.exp,
        }
      ))
      .value()

    if(top_3_depts.length !== 3){
      return false;
    }

    return { top_3_depts };
  },

  render({calculations, footnotes, sources}){
    const { graph_args, subject, info } = calculations;
    const { top_3_depts } = graph_args;

    return (
      <StdPanel
        title={text_maker("tag_top_3_depts_title")}
        {...{sources,footnotes}}
      >
        <Col isText size={5}>
          <TM 
            k="tag_top_3_depts_text"
            args={{
              top_3_depts, 
              ...info,
            }}
          />
        </Col>
        <Col isGraph size={7}>
          <div>
            <ul style={{padding:0}}>
              {_.map(top_3_depts, ({dept, tag_spent, total_spent}) => 
                <li
                  key={dept.id}
                  style={{
                    position: "relative",
                    borderRadius: "5px",
                    display: "block",
                  }}
                >
                  <div className="frow">
                    <div
                      className="fcol-xs-8 fcol-md-10"
                      style={{
                        alignSelf: "center",
                        borderRight: "1px solid #ccc",
                      }}
                    >
                      <TM
                        k="dept_tag_spent_text"
                        args={{
                          dept,
                          tag_spent,
                          tag_spent_pct: tag_spent/total_spent, 
                        }}
                      />
                    </div>
                    <div
                      className="fcol-md-2 fcol-xs-4"
                      style={{paddingLeft: 0}}
                    >
                      <ProgressDonut
                        height={80}
                        data={[
                          { label: subject.sexy_name, value: tag_spent },
                          { label: dept.sexy_name, value: total_spent },
                        ]}
                      />
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </Col>
      </StdPanel>
    )
  },
});
