import text from './isc.yaml';
import { GlossaryEntry } from '../../models/glossary.js';

/*
  snippet to get orgs sorted by isc fte % 

  _.chain(_Subject.Dept.get_all())
    .map(org => ({ 
      org: org.name, 
      pct: (_.get(_Table.lookup('table12').horizontal("{{pa_last_year}}"), `Internal Services.${org.id}`) ||0) / (_Table.lookup('table12').q(org).sum("{{pa_last_year}}")) 
    })).reject( ({pct}) => _.isNaN(pct) )
    .sortBy('pct')
    .reverse()
    .value()

*/
import { 
  Panel, 
  Subject, 
  formats, 
  run_template, 
  PanelGraph, 
  create_text_maker_component,
  years, 
  declarative_charts,
} from '../shared';

const { Gov, Tag } = Subject;
const { std_years } = years;
const { Bar, GraphLegend } = declarative_charts;

const { text_maker, TM } = create_text_maker_component(text);

new PanelGraph({
  level: "dept",
  key:"internal_services",
  depends_on : ['table12', "table6"],
  title : "internal_service_panel_title",
  calculate(subject,info){
    const { table12 } = this.tables;

    const isc_crsos = _.filter(subject.crsos, "is_internal_service");
    if(_.isEmpty(isc_crsos)){
      //org has no isc programs 
      return false;
    }

    const isc_tag = Tag.lookup("GOC017");

    const last_year_fte_col = "{{pa_last_year}}";
    const gov_fte_total = table12.q(Gov).sum(last_year_fte_col);
    const gov_isc_fte = table12.q(isc_tag).sum(last_year_fte_col);

    const series = _.map(std_years,  yr => {
      const isc_amt = _.sum( _.map(isc_crsos, crso => table12.q(crso).sum(yr) ) );
      return {
        isc: isc_amt,
        non_isc: table12.q(subject).sum(yr) - isc_amt,
      };
    });

    const total_fte = table12.q(subject).sum(last_year_fte_col);
    if(total_fte === 0){
      return false;
    }
    const isc_fte = _.last(series).isc;

    return {
      gov_fte_total,
      gov_isc_fte,

      total_fte,
      isc_fte,

      series,
    };
  },
  render({calculations,sources,footnotes}){
    const {
      subject,
      graph_args: {

        gov_fte_total,
        gov_isc_fte,
        total_fte,
        isc_fte,

        series,
      },
    } = calculations;

    const more_footnotes = [{
      text: GlossaryEntry.lookup("INT_SERVICES").definition,
    }].concat(footnotes);

    const isc_label=text_maker("internal_services");
    const other_label = text_maker("other_programs");
    const bar_series = _.fromPairs([
      [ isc_label, _.map(series, 'isc') ],
      [ other_label, _.map(series, "non_isc") ],
    ]);
    const colors = infobase_colors();

    const to_render = <div>
      <div className="medium_panel_text" style={{marginBottom: "15px"}}>
        <TM
          k="internal_service_panel_text"
          args={{
            subject,
            isc_fte_pct: isc_fte/total_fte,
            gov_isc_fte_pct: gov_isc_fte/gov_fte_total,
          }}
        />
      </div>
      <div className="frow md-middle"> 
        <div className="fcol-md-3">
          <div className="well legend-container">
            <GraphLegend
              items={[
                {
                  color: colors(isc_label),
                  label: isc_label,
                  id: isc_label,
                },
                {
                  id: other_label,
                  label: other_label,
                  color: colors(other_label),
                },
              ]}
            />
          </div>
        </div>
        <div className="fcol-md-9">
          <Bar
            {...{
              colors : window.infobase_colors(),
              height: 300,
              series: bar_series,
              stacked: true,
              ticks : _.map(std_years, yr => run_template(yr)),
              formater: formats.big_int_real_raw,
              y_axis: text_maker("ftes"),
            }}
          />
        </div>
      </div>
    </div>

    return (
      <Panel
        title={text_maker("internal_service_panel_title")}
        {...{sources,footnotes: more_footnotes}}
      >
                  
        {to_render}
        
      </Panel>
    );

  },
});