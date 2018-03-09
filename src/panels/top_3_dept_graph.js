const {
  D3, 
  text_maker,
  PanelGraph, 
  Subject :   { Dept},
} = require("./shared");


new PanelGraph({
  level: "tag",
  key : "tag_top_3_depts",
  depends_on: ['table6'],

  notes: `
    data: last year program expenditures as per public accounts.
    what you're looking at:  Given a tag, collapse all its programs' expenditures by parent department,
    look at the top three departments, compare the resulting number against the departments total expenditures last years
  `,

  layout : {
    full : {text : 5, graph: 7},
    half: {text : 12, graph: [12,12]},
  },

  info_deps: ["table6_tag_info"],
  title :"tag_top_3_depts_title",

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

  render(panel,calculations, options){
    const { graph_args, subject, info } = calculations;
    const { top_3_depts } = graph_args;
    //split container into three equal columns... unless there are less than 3 to show.
    //tip for testing this graph: Tag #1 will have all three, tag #3 will have zero Depts to show,
    //tags #20 will have two depts to show and tag 32 will only have one circle.
    const graph_area=  panel.areas().graph;
    const text_area=  panel.areas().text;
    text_area.html(text_maker("tag_top_3_depts_text",Object.assign({top_3_depts},info)));

    const row = d3.select(graph_area.node())
      .append('div')
      .append('ul')
      .styles({"padding":"0"})
      .selectAll('li')
      .data(top_3_depts)
      .enter()
      .append('li')
      .styles({
        "position": 'relative',
        "border-radius": "5px",
        "display": "block",
      })
      .append('div')
      .style("display", "flex");

    row
      .append('div')
      .classed('col-xs-8',true)
      .classed('col-md-10',true)
      .styles({
        "align-self" : "center",
        "border-right" : "1px solid #ccc",
      })
      .html(d => (
        text_maker('dept_tag_spent_text',{
          dept: d.dept,
          tag_spent : d.tag_spent,
          tag_spent_pct : d.tag_spent/d.total_spent, 
        })
      ));
    
    row
      .append('div')
      .classed('col-md-2',true)
      .classed('col-xs-4',true)
      .style('padding-left', 0)
      .each(function(d,i){
        new D3.SAFE_PROGRESS_DONUT.SafeProgressDonut(
          d3.select(this).node(),
          { 
            data: [
              { label: subject.sexy_name, value: d.tag_spent},
              { label: d.dept.sexy_name, value: d.total_spent },
            ],
            height: 80,
          }
        ).render();
      });
    
    row.append('div').attr('class','clearfix');
  },
});
