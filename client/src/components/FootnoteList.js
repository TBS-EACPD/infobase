import './FootnoteList.scss';

import { sanitized_dangerous_inner_html } from '../general_utils.js';

import { FancyUL } from './misc_util_components.js';


const FootnoteList = ({ footnotes }) => (
  <div className={"footnote-list"}>
    <FancyUL>
      {_.chain(footnotes)
        .uniqWith( ({text_1}, {text_2}) => !_.isUndefined(text_1) && text_1 === text_2)
        .map( 
          ({text, component}, ix) => {
            const props = component ? 
              ({ children: component }) :
              ({ dangerouslySetInnerHTML: sanitized_dangerous_inner_html(text) });
  
            return (
              <div 
                {...props}
                className={"footnote-list__note"} 
                key={ix} 
              />
            );
          }
        )
        .value()
      }
    </FancyUL>
  </div>
);

export { FootnoteList };