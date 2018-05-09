const classNames = require('classnames');
const {
  Subject : {
    Dept,
    Tag,
    Program,
  },
  PanelGraph,
  reactAdapter,
  panel_components:{
    PanelText,
  },
  util_components: {
    TextMaker,
    HeightClipper,
  },
} = require("../shared"); 

const { WellList } = require("./WellList.js")

const { 
  infograph_href_template,
} = require('../../link_utils.js');



const scheme_order = [
  "GOCO",
  "WWH",
  "MLT",
  "CCOFOG",
  "HWH",
];

const tag_root_display = tag_root => <div>
  <div> {tag_root.name} </div>
  <div className="small_panel_text"> {tag_root.description} </div>
</div>;

const tag_display = tag => ({
  href: infograph_href_template(tag),
  display: tag.name,
});

function get_related_tag_list_args(subject){



  let tags_by_root_id; 
  switch(subject.level){
    case 'program':
      tags_by_root_id = _.groupBy(subject.tags, "root.id");
      
      break;
    
    case 'dept':
    case 'crso':
      tags_by_root_id = _.chain(subject.programs)
        .map("tags")
        .flatten()
        .uniq('id')
        .groupBy("root.id")
        .value(); 
      
      break;

  } 

  return _.chain(tags_by_root_id)
    .toPairs()
    .reject( ([_x, group]) => _.isEmpty(group) )
    .sortBy( ([id, _group]) => _.indexOf(scheme_order, id) )
    .map( ([id, tags]) => ({
      display: tag_root_display(Tag.lookup(id)),
      children: _.map(tags, tag_display),
    }))
    .value();
}


const title_by_level = {
  dept: "dept_related_tags_title",
  program: "program_tags_title", 
  crso: "crso_tags_title",
};

_.each(['dept','crso','program'], level => {
  new PanelGraph({
    level,
    key : "tags_of_interest",
    title: title_by_level[level],
    footnotes: false,
    layout : {
      full :{  graph : [12]},
      half : { graph : [12]},
    },
    calculate(subject){
      const tags_by_root = get_related_tag_list_args(subject);
      if(subject.dp_status === false || _.isEmpty(tags_by_root)){
        return false;
      }
      
      return tags_by_root;
  
    },
    render(panel,calculations){
      const { 
        graph_args: tags_by_root, 
        subject, 
      } = calculations;

      const view = <PanelText>
        <div className="medium_panel_text">
          <TextMaker text_key="tags_of_interest_sentence" args={{subject}} /> 
          <WellList elements={tags_by_root} />
        </div>
      </PanelText>;
  
  
      reactAdapter.render(
        view, 
        panel.areas().graph.node() 
      );
    },
  });
})



new PanelGraph({
  level: 'tag',
  key : "tag_progs_by_dept",

  layout : {
    full :{  graph : [12]},
    half : { graph : [12]},
  },

  title: 'tag_progs_by_dept_title',
  footnotes: false,
  calculate: _.constant(true),

  render(panel,calculations){
    const {subject } = calculations;

    const list_args = _.chain(subject.programs)
      .groupBy(prog => prog.dept.id)
      .map( (prog_group, dept_id) => ({
        display : <div>{Dept.lookup(dept_id).name}</div>,
        href: infograph_href_template(Dept.lookup(dept_id)),
        children: _.chain(prog_group)
          .sortBy('dead_program')
          .map(prog => ({
            display: (
              <span className={classNames(prog.dead_program && 'dead-element')}>
                <a 
                  href={infograph_href_template(prog)}
                > 
                  {prog.name}
                </a>
              </span>
            ),
          }))
          .value(),
      }))
      .value();

    const view = <div className="medium_panel_text">
      <div className="col-md-10 col-md-offset-1">
        <HeightClipper clipHeight={250} allowReclip={true}>
          <WellList elements={list_args} />
          { _.some(subject.programs, 'dead_program') && 
            <TextMaker text_key="hierarchy_contains_dead_elements" />
          }
        </HeightClipper>
      </div>
      <div className="clearfix"/>
    </div>;

    reactAdapter.render(
      view, 
      panel.areas().graph.node() 
    );
  },
});

new PanelGraph({
  level: 'tag',
  key : "related_tags",

  layout : {
    full :{ graph : [12]},
    half : { graph : [12]},
  },

  title: 'related_tags_title',
  footnotes: false,

  calculate(subject){

    const related_tags_by_type_with_counts = (
      _.chain(subject.programs)
        .map( prog => prog.tags )
        .flatten()
        .reject({ id: subject.id})
        .groupBy( tag => tag.id )
        .map( group => ({
          tag : _.first(group),
          count: group.length,
          type: _.first(group).root.id,
        }))
        .filter('count')
        .groupBy('type')
        .map( (group_of_tags, type) => ({
          tag_and_counts: _.chain(group_of_tags)
            .sortBy(obj => obj.tag.name )
            .sortBy(obj => -obj.count )
            .take(10)
            .value(),
          type,
        }))
        .sortBy( ({type}) => _.indexOf(scheme_order, type) )
        .value()
    );
    if(_.isEmpty(related_tags_by_type_with_counts)){
      return false;
    }
    return {
      related_tags_by_type_with_counts,
    }

  },

  render(panel,calculations){
    const {
      graph_args: {
        related_tags_by_type_with_counts,
      },
    } = calculations;

    const list_args = _.map( related_tags_by_type_with_counts, ({type, tag_and_counts}) => ({
      display: tag_root_display(Tag.lookup(type)),
      children: _.map( tag_and_counts, ({ tag, count }) => ({
        href: infograph_href_template(tag),
        display: <span>{tag.name} - {count} {Program.plural} <TextMaker text_key="in_common" /></span>,
      })),
    }))

    const view = <div className="medium_panel_text">
      <div className="col-md-10 col-md-offset-1">
        <HeightClipper clipHeight={350} allowReclip={true}>
          <WellList elements={list_args} />
        </HeightClipper>
      </div>
      <div className="clearfix"/>
    </div>;


    reactAdapter.render(
      view, 
      panel.areas().graph.node() 
    );
  },
});

