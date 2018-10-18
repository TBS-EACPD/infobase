import { text_maker, TM } from './intro_graph_text_provider.js';
import {
  PanelGraph,
  TextPanel,
} from "../shared";

const title_keys = {
  tag: 'tag_desc_title',
  crso: 'crso_desc_title',
  program: 'program_desc_title',
};

_.each(['tag','crso','program'], level => {
  new PanelGraph({
    level,
    key : "description",
    footnotes: false,
    calculate: subject => _.nonEmpty(subject.description),

    render({calculations}){
      
      const {subject} = calculations;

      let link_content = null;
      if(subject.level==='program' && !_.isEmpty(subject.web_links)){
        link_content = (
          <div>
            <TM k="additional_links" />
            <ul>
              {_.map(subject.web_links, href => 
                <li key={href}>
                  <a target="_blank" rel="noopener noreferrer" href={href}>
                    {_.truncate(href, {length:150})}
                  </a>
                </li>
              )}
            </ul>
          </div>
        );
      }
      
      return <TextPanel title={text_maker(title_keys[level])}>
        <div dangerouslySetInnerHTML={{__html: subject.description }} />
        { link_content }
      </TextPanel>

    },
  });
});
