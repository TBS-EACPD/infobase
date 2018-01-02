const {
  formats,
  text_maker,
  PanelGraph,
  utils : { Select },
  years : {std_years, planning_years},
  D3} = require("./shared"); 

  
new PanelGraph({
  level: "crso",
  footnotes : ["PLANNED_EXP"],
  key : "crso_prg_full_spending",
  depends_on: ['table6', 'table12'],
  info_deps: ['table6_crso_info','table12_crso_info'],
  layout : {
    full : {text : 12, graph: [4,8]},
    half: {text : 12, graph: [12,12]},
  },
  title :"crso_prg_full_spending_title",
  // text : "crso_historical_program_spending_text",
  calculate(subject,info){
    if(subject.dead_so){
      return false;
    }

    const {table6, table12} = this.tables;

    const exp_cols = _.map(std_years, yr=>yr+"exp");
    const exp_all_years =   exp_cols.concat(planning_years)
    const all_years =   std_years.concat(planning_years)
    const all_years_lbl = info.last_years.concat(info.planning_years)

    //must wrap this in an update function and pass either fte or exp based on selection

    const fte_data = _.map(all_years, (yy, i) => 
      d4.sum(
        _.map(
          _.map(
            table12.q(subject).data, xx => 
              all_years.map(col => xx[col])
          ), xx => xx[i])))

    const fte_yrs_non_null = all_years.slice(_.findIndex(fte_data, val => val !==0))
    const fte_yrs_non_null_lbl = all_years_lbl.slice(_.findIndex(fte_data, val => val !==0))     


    const exp_data = _.map(exp_all_years, (yy, i) => 
      d4.sum(
        _.map(
          _.map(
            table6.q(subject).data, xx => 
              exp_all_years.map(col => xx[col])
          ), xx => xx[i])))

    const exp_yrs_non_null = exp_all_years.slice(_.findIndex(exp_data, val => val !==0))
    const exp_yrs_non_null_lbl = all_years_lbl.slice(_.findIndex(exp_data, val => val !==0))

    const exp_graph_data = {
      type: "EXP",
      years: exp_yrs_non_null_lbl,
      programs: _.chain( table6.q(subject).data)
        .map(row => 
          ({
            label : row.prgm,
            data : exp_yrs_non_null.map(col => row[col]),
            active : table6.q(subject).data.length < 4 ? true: false ,
          }))  
        .sortBy(x => -d4.sum(x.data))
        .value(),
    }
  
    const fte_graph_data = {
      type: "FTE",
      years: fte_yrs_non_null_lbl,
      programs: _.chain(table12.q(subject).data)
        .map(row => 
          ({
            label : row.prgm,
            data : fte_yrs_non_null.map(col => row[col]),
            active : table12.q(subject).data.length < 4 ? true: false ,
          }))    
        .sortBy(x => -d4.sum(x.data))
        .value(),
    }


    const fte_total = d4.sum(
      _.flatten(
        _.map(table12.q(subject).data, xx => 
          all_years.map(col => xx[col])
        )
      )
    )

    const exp_total = d4.sum(
      _.flatten(
        _.map(table6.q(subject).data, xx => 
          exp_all_years.map(col => xx[col])
        )
      )
    )

    if (fte_total === 0 && exp_total === 0 ) {
      return false;      
    }

    return  {exp_graph_data, fte_graph_data}

  },

  render(panel,calculations){
    const { graph_args, subject, info } = calculations;

    const graph_area=  panel.areas().graph;
    const text_area =  panel.areas().text;
    const inner_text_area = text_area
      .append('div')

    // const select_label_area = text_area
    //                       // .append('div')
    //                       .append("span")
    //                       .html(text_maker("spending_or_FTE"))

    const select_area = text_area
      .append('div')
      .style("margin-bottom", "10px")
      .style("padding-right", "30px")
      .style("padding-left", "0px")
      .style("display", "inline-block")
      .classed("col-md-4", true)
      .node();

    const update = fte_exp_data => {

      graph_area.selectAll(".__svg__").remove()
      graph_area.selectAll(".d3-list").remove()
      graph_area.selectAll(".sr-list").remove()

      const is_data_fte = data => (data.type === "FTE" );
      const first_yr = _.first(fte_exp_data.years)
      const last_yr = _.last(fte_exp_data.years)

      inner_text_area.html(text_maker("historical_program_spending_text",{
        subject,
        first_yr,
        last_yr,
        prg: {
          crso_prg_num : is_data_fte(fte_exp_data) ? info.crso_fte_prg_num : info.crso_exp_prg_num,
          crso_prg_top1 : is_data_fte(fte_exp_data) ? info.crso_fte_prg_top1 : info.crso_exp_prg_top1,
          crso_prg_top1_amnt  : is_data_fte(fte_exp_data) ? info.crso_fte_prg_top1_amnt : info.crso_exp_prg_top1_amnt,
          crso_prg_top2 : is_data_fte(fte_exp_data) ? info.crso_fte_prg_top2 : info.crso_exp_prg_top2,
          crso_prg_top2_amnt :  is_data_fte(fte_exp_data) ? info.crso_fte_prg_top2_amnt : info.crso_exp_prg_top2_amnt,
          is_fte : is_data_fte(fte_exp_data),
        },  
      }));

      D3.create_graph_with_legend.call(
        {panel},
        {
          get_data :  _.property("data"),
          data :      fte_exp_data.programs,
          ticks :     fte_exp_data.years,
          y_axis :    is_data_fte(fte_exp_data)  ? 
                        text_maker("employees"):
                        "($)",                     
          yaxis_formatter :  is_data_fte(fte_exp_data) ? 
                        formats["big_int_real_raw"]:
                        formats["compact1_raw"],
          legend_title : "program",
          stacked: (first_yr === "2017-18" || first_yr === "2017-2018") ? true : false,
          bar : (first_yr === "2017-18" || first_yr === "2017-2018") ? true: false,
        }
      );
    };

    
    const sel_items = [
      {
        name : lang === "fr" ? "Dépenses" : "Spending",
        data : graph_args.exp_graph_data,
      },
      {
        name : lang === "fr" ? "Équivalents Temps Plein":"Full-Time Equivalents",
        data : graph_args.fte_graph_data,
      }, 
    ]


    new Select({
      container: select_area,
      data: sel_items,
      onSelect : d => update(d.data),
      display_func: d => d.name,
    });


    d4.select("select")
      .style("width","100%")


    if (graph_args.fte_graph_data.programs.length === 0 && graph_args.exp_graph_data.programs.length === 0){
      return false
    }
    else if (graph_args.fte_graph_data.programs.length === 0){
      select_area.parentNode.removeChild(select_area);
      update(graph_args.exp_graph_data)
    }else if (graph_args.exp_graph_data.programs.length === 0){
      select_area.parentNode.removeChild(select_area);
      update(graph_args.fte_graph_data)
    }else{
      update(graph_args.exp_graph_data)
    }

  },
});

