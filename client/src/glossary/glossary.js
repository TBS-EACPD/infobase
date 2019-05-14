import './glossary.scss';
import glossary_text from "./glossary.yaml";
import { Fragment } from 'react';
import { 
  StandardRouteContainer,
  ScrollToTargetContainer,
} from '../core/NavComponents.js';
import { GlossaryEntry } from '../models/glossary.js';
import { 
  create_text_maker_component,
  GlossarySearch,
} from '../util_components.js';

const { text_maker, TM } = create_text_maker_component(glossary_text);

function get_glossary_items_by_letter(){
  const glossary_items = GlossaryEntry.get_all();

  const glossary_items_by_letter = _.chain(glossary_items)
    .groupBy(item => {
      const first_letter = item.title[0];
      if (_.includes(["É","È","Ê","Ë"],first_letter)){
        return "E";
      }
      return first_letter;
    })
    .map( (items, letter) => {
      const sorted_items = _.sortBy(items, 'title');
      return {
        items: sorted_items, 
        letter,
      };
    })
    .sortBy('letter')
    .value();
  return glossary_items_by_letter;
}


//id tag is there for legacy styles 
const Glossary_ = ({ active_key, items_by_letter }) => (
  <div id="#glossary-key">
    <div className="col-sm-12 col-md-8 col-md-offset-2 font-large">
      { !window.is_a11y_mode &&
        <div 
          aria-hidden={true}
          id="glossary_search"
          className='org_list font-xlarge mrgn-bttm-lg'
        >
          <GlossarySearch />
        </div>
      }
      <div
        aria-hidden={true}
        className="glossary-letters mrgn-bttm-xl"
        style={{ textAlign: "center" }}
      >
        <ul
          className="list-inline glossary-letter-list"
          style={{
            display: "inline",
            margin: "0px",
          }}
        >
          {_.map(items_by_letter, ({ letter }) => 
            <li key={letter}> 
              <a
                href={`#__${letter}`}
                className="glossary-letter-link"
                onClick={evt => {
                  evt.preventDefault();
                  const el = document.getElementById(`__${letter}`);
                  el.scrollIntoView({behavior: "instant"});
                  el.focus();
                }}
              >
                {letter}
              </a>
            </li>  
          )}
        </ul>
      </div>
      <div className="glossary-items">
        <dl>
          {_.map(items_by_letter, ({ letter, items}) => _.map(items, (item,ix) => 
            <Fragment key={ix}>
              <dt
                className="glossary-dt"
                id={
                ix === 0 ?
                `__${letter}` :
                null 
                }
                tabIndex={
                ix === 0 ?
                0 :
                null
                }
              >
                <span
                  id={item.id}
                  tabIndex={-1}
                >
                  {item.title}
                </span>
              </dt>
              <dd>
                <div 
                  dangerouslySetInnerHTML={{__html: item.definition}}
                />
              </dd>
            </Fragment>))}
        </dl>
      </div>
    </div>
  </div>
);

export default class Glossary extends React.Component {
  render(){
    const { 
      match: {
        params: {
          active_key,
        },
      },
    } = this.props;

    const items_by_letter = get_glossary_items_by_letter();

    return (
      <StandardRouteContainer
        route_key="glossary-key"
        title={text_maker("glossary")}
        breadcrumbs={[text_maker("glossary")]}
        description={text_maker("glossary_meta_desc")}
      >
        <h1> <TM k="glossary" /> </h1>
        <ScrollToTargetContainer target_id={active_key}>
          <Glossary_
            active_key={active_key}
            items_by_letter={items_by_letter}
          />
        </ScrollToTargetContainer>
      </StandardRouteContainer>
    );
  }
}