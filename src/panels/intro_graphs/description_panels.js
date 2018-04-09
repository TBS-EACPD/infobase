import {
  PanelGraph,
  reactAdapter,
  util_components,
} from '../shared.js';

const { TM } = util_components;


const title_keys = {
  tag: 'tag_desc_title',
  crso: 'crso_desc_title',
  program: 'program_desc_title',
};

_.each(['tag','crso','program'], level => {
  new PanelGraph({
    level,
    key : "description",
    layout : {
      full : { graph : [12]},
      half : { graph : [12]},
    },
    footnotes: false,
    title: title_keys[level],
    calculate: subject => _.nonEmpty(subject.description),
    render(panel,calculations){
      
      const {subject} = calculations;

      let link_content = null;
      if(subject.level==='program' && !_.isEmpty(subject.links)){
        link_content = (
          <div>
            <TM k="additional_links" />
            <ul>
              {_.map(subject.links, href => 
                <li key={href}>
                  <a target="_blank" href={href}>
                    {_.truncate(href, 50)}
                  </a>
                </li>
              )}
            </ul>
          </div>
        );
      }
      
      const view = <div className="medium_panel_text">
        <p> {subject.description} </p>
        { link_content }
      </div>;

      reactAdapter.render(
        view, 
        panel.areas().graph.node() 
      );
    },
  });
});
