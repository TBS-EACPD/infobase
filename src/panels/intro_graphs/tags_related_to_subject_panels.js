const { text_maker, TM } = require('./intro_graph_text_provider.js');
const classNames = require('classnames');
const {
  Subject : {
    Dept,
    Tag,
    Program,
  },
  PanelGraph,
  TextPanel,
  util_components: {
    HeightClipper,
  },
} = require("../shared"); 

const { WellList } = require("./WellList.js")

const { 
  infograph_href_template,
} = require('../../link_utils.js');


//this is re-used often enough by users of WellList
const tag_root_display = tag_root => <div>
  <div> {tag_root.name} </div>
  <div className="small_panel_text"> {tag_root.description} </div>
</div>;

new PanelGraph({
  level: 'dept',
  key : "related_tags",
  title: 'dept_related_tags_title',
  footnotes: false,

  calculate(subject){
    if(subject.dp_status === false){
      return false;
    }

    const progs = subject.programs;

    const gocos = _.chain(progs)
      .map( prog => _.first(prog.tags_by_scheme.GOCO))
      .uniqBy()
      .compact()
      .value()

    const how_we_help_tags = _.chain(progs)
      .map( prog => prog.tags_by_scheme.HWH )
      .flatten()
      .uniqBy()
      .compact()
      .value();

    if( _.isEmpty( [...gocos, ...how_we_help_tags] ) ){ 
      return false; 
    }
    
    return {
      gocos,
      how_we_help_tags,
    }

  },

  render({calculations}){
    const { 
      graph_args: {
        gocos,
        how_we_help_tags,
      }, 
      subject, 
    } = calculations;

    const tag_display = tag => ({
      href: infograph_href_template(tag),
      display: tag.name,
    });

    const { GOCO, HWH } = Tag.tag_roots;

    const list_args = [
      { 
        display: tag_root_display(GOCO),
        children: _.map(gocos, tag_display),
      },
      {
        display: tag_root_display(HWH),
        children: _.map(how_we_help_tags, tag_display ),
      },
    ];

    return (
      <TextPanel 
        title={text_maker("dept_related_tags_title")}
      >
        <TM k="org_is_tagged_with_following" args={{subject}} />
        <WellList elements={list_args} />
      </TextPanel>
    )
  },
});

new PanelGraph({
  level: 'crso',
  key : "crso_tags",

  footnotes: false,

  calculate(subject){

    if(subject.dept.dp_status === false){
      return false;
    }

    const progs = subject.programs;

    const gocos = _.chain(progs)
      .map( prog => prog.tags_by_scheme.GOCO )
      .flatten()
      .uniqBy()
      .compact()
      .value()

    const how_we_help_tags = _.chain(progs)
      .map( prog => prog.tags_by_scheme.HWH )
      .flatten()
      .uniqBy()
      .compact()
      .value();

    if( _.isEmpty( [...gocos, ...how_we_help_tags] ) ){ 
      return false; 
    }
  
    return {
      gocos,
      how_we_help_tags,
    }

  },

  render({calculations}){
    const { 
      graph_args: {
        gocos,
        how_we_help_tags,
      }, 
      subject, 
    } = calculations;

    const tag_display = tag => ({
      href: infograph_href_template(tag),
      display: tag.name,
    });

    const { GOCO, HWH } = Tag.tag_roots;

    const list_args = [
      { 
        display: tag_root_display(GOCO),
        children: _.map(gocos, tag_display),
      },
      {
        display: tag_root_display(HWH),
        children: _.map(how_we_help_tags, tag_display ),
      },
    ];

    return (
      <TextPanel
        title={text_maker("crso_tags_title")}
      >
        <TM k="crso_tags_intro" args={{name: subject.name}} />
        <HeightClipper allowReclip={true} clipHeight={350}>
          <WellList elements={list_args} />
        </HeightClipper>
      </TextPanel>
    );


  },
});

new PanelGraph({
  level: 'program',
  key : "program_tags",

  footnotes: false,

  calculate(subject){ 
    return _.nonEmpty(subject.tags);
  },

  render({calculations}){
    const { subject } = calculations;

    const {
      GOCO: goco_root,
      HWH: hwh_root,
    } = Tag.tag_roots;

    let {
      GOCO : gocos,
      HWH : how_we_help_tags,
    } = subject.tags_by_scheme;

    gocos = gocos || []; 
    how_we_help_tags = how_we_help_tags || []; 


    const tag_display = tag => ({
      href: infograph_href_template(tag),
      display: tag.name,
    });

    const list_args = [
      { 
        display: tag_root_display(goco_root),
        children: _.map(gocos, tag_display),
      },
      {
        display: tag_root_display(hwh_root),
        children:  _.map(how_we_help_tags, tag_display),
      },
    ].filter(e => !_.isEmpty(e.children))


    return (
      <TextPanel
        title={text_maker("program_tags_title")}
      >
        <p>
          <TM 
            k="program_is_tagged_with_following" 
            args={{name:subject.name}} 
          />
        </p>
        <HeightClipper allowReclip={true} clipHeight={350}>
          <WellList elements={list_args} /> 
        </HeightClipper>
      </TextPanel>
    );

  },
});

new PanelGraph({
  level: 'tag',
  key : "tag_progs_by_dept",

  footnotes: false,
  calculate: _.constant(true),

  render({calculations}){
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

    return (
      <TextPanel
        title={text_maker("tag_progs_by_dept_title")}
      >
        <div className="col-md-10 col-md-offset-1">
          <HeightClipper clipHeight={250} allowReclip={true}>
            <WellList elements={list_args} />
            { _.some(subject.programs, 'dead_program') && 
              <TM k="hierarchy_contains_dead_elements" />
            }
          </HeightClipper>
        </div>
        <div className="clearfix"/>
      </TextPanel>
    )

  },
});

new PanelGraph({
  level: 'tag',
  key : "related_tags",
  footnotes: false,

  calculate(subject){

    const tag_roots =  Tag.tag_roots;

    const indices = {
      [tag_roots.GOCO.id]: 5,
      [tag_roots.HWH.id]: 10,
    };

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
        .groupBy('type')
        .map( (group_of_tags, type) => ({
          tag_and_counts: _.chain(group_of_tags)
            .sortBy(obj => obj.tag.name )
            .sortBy(obj => -obj.count )
            .value(),
          type,
        }))
        .sortBy( ({type}) => indices[type] )
        .value()
    );
    if(_.isEmpty(related_tags_by_type_with_counts)){
      return false;
    }
    return {
      related_tags_by_type_with_counts,
    }

  },

  render({calculations}){
    const {
      graph_args: {
        related_tags_by_type_with_counts,
      },
    } = calculations;

    const list_args = _.map( related_tags_by_type_with_counts, ({type, tag_and_counts}) => ({
      display: tag_root_display(Tag.lookup(type)),
      children: _.map( tag_and_counts, ({ tag, count }) => ({
        href: infograph_href_template(tag),
        display: <span>{tag.name} - {count} {Program.plural} <TM k="in_common" /></span>,
      })),
    }))

    return (
      <TextPanel
        title={text_maker("related_tags_title")}
      >
        <div className="col-md-10 col-md-offset-1">
          <HeightClipper clipHeight={350} allowReclip={true}>
            <WellList elements={list_args} />
          </HeightClipper>
        </div>
        <div className="clearfix"/>
      </TextPanel>
    )

  },
});

