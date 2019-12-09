import './glossary.scss';
import glossary_text from "./glossary.yaml";
import { Fragment } from 'react';
import { 
  StandardRouteContainer,
  ScrollToTargetContainer,
} from '../core/NavComponents.js';
import { Table } from '../core/TableClass.js'; 
import { rpb_link } from '../rpb/rpb_link.js';
import { GlossaryEntry } from '../models/glossary.js';
import { 
  create_text_maker_component,
  GlossarySearch,
  BackToTop,
} from '../components/index.js';

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
          id="glossary_search"
          className='org_list font-xlarge mrgn-bttm-lg'
        >
          <GlossarySearch />
        </div>
      }
      <div
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
                aria-label={`${text_maker("jump_to_letter_glossary_entries")} ${letter}`}
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
          {_.map(
            items_by_letter, 
            ({letter, items}) => _.map(
              items, 
              (item, ix) => {
                
                const tagged_table_links = _.chain( Table.get_all() )
                  .filter( (table) => _.includes(table.tags, item.id) )
                  .map( (table) => <a key={table.id} href={rpb_link({table})}>{table.name}</a> )
                  .value();

                return (
                  <Fragment key={ix}>
                    <dt
                      className="glossary-dt"
                      id={
                      ix === 0 ?
                      `__${letter}` :
                      null 
                      }
                      tabIndex={0}
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
  
                      <p>
                        {text_maker("glossary_translation")} {item.translation}
                      </p>
  
                      { !_.isEmpty(tagged_table_links) &&
                        <p>
                          {text_maker("glossary_related_data")} {tagged_table_links}
                        </p>
                      }
                      
                      <div className='glossary-top-link-container'>
                        <a className="glossary-top-link"
                          href="#"
                          tabIndex='0'
                          onClick={evt => {
                            evt.preventDefault();
                            document.body.scrollTop = document.documentElement.scrollTop = 0;
                            document.querySelector('#glossary_search > div > div > input').focus();
                          }}
                        >{text_maker("back_to_top")}</a>
                      </div>
                    </dd>
                  </Fragment>
                );
              }
            )
          )}
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
          <BackToTop focus="#glossary_search > div > div > input"/>
          <Glossary_
            active_key={active_key}
            items_by_letter={items_by_letter}
          />
        </ScrollToTargetContainer>
      </StandardRouteContainer>
    );
  }
}