import metadata_text from './metadata.yaml';
import { StandardRouteContainer, ScrollToTargetContainer } from '../core/NavComponents.js';
import { create_text_maker_component, FancyUL } from '../util_components.js';
import { sources } from './data_sources.js';
import { Panel } from '../components/panel-components.js';

const { text_maker, TM } = create_text_maker_component(metadata_text);

export default class MetaData extends React.Component {
  render(){
    const { 
      match: {
        params: {
          data_source,
        },
      },
    } = this.props;

    const sorted_sources = _.sortBy(sources, source => source.title()); 

    return (
      <StandardRouteContainer
        title={text_maker("metadata")}
        breadcrumbs={[text_maker("metadata")]}
        description={text_maker("metadata_desc_meta_attr")}
        route_key="_metadata"
      >
        <div>
          <h1><TM k="metadata"/></h1>
        </div>
        <p> <TM k='metadata_t'/> </p>
        <ScrollToTargetContainer target_id={data_source}>
          {_.map(sorted_sources, (source) => (
            <div key={source.key} id={source.key}>
              <Panel
                title={source.title()}
              >
                <div>
                  { source.description() }
                </div>
                <div className="h4"> <TM k='datasets' /> </div>
                <FancyUL>
                  {_.map(source.items(), ({key, id, text, inline_link, external_link }) => (
                    <span key={key || id} className="fancy-ul-span-flex">
                      { 
                        inline_link ? 
                        <a 
                          title={text_maker('rpb_link_text')}
                          href={inline_link}
                          style={{alignSelf: "center"}}
                        >
                          {text}
                        </a> :
                        <span
                          style={{alignSelf: "center"}}
                        >
                          {text}
                        </span> 
                      }
                      {
                        external_link &&
                        <a 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-xs btn-ib-primary btn-responsive-fixed-width" 
                          href={external_link}
                        >
                          <TM k="open_data_link"/>
                        </a>
                      }
                    </span>
                  ))}
                </FancyUL>
                <div className="fancy-ul-span-flex">
                  { source.open_data &&
                    <a 
                      style={{marginLeft: 'auto'}} //fix a flexbox bug
                      className="btn btn-ib-primary" 
                      target="_blank"
                      rel="noopener noreferrer"
                      href={source.open_data[window.lang]}
                    > 
                      <TM k='open_data_link' /> 
                    </a>
                  }
                </div>
                <span><TM k="refresh_freq"/> {source.frequency.text}</span>
              </Panel>
            </div>
          ))}
        </ScrollToTargetContainer>
      </StandardRouteContainer>
    );
  }
};