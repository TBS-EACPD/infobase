require("./metadata.ib.yaml");
const { 
  StandardRouteContainer,
  ScrollToTargetContainer,
} = require('../core/NavComponents.js');
const {text_maker} = require('../models/text');
const { 
  TM,
  FancyUL,
}  = require('../util_components.js');
const { sources } = require('./data_sources.js');
const {
  Panel,
  PanelBody,
} = require('../panel_components.js');
const { months } = require('../models/businessConstants');

const FormattedDate = ({ day, month, year}) => <span>{months[month].text} {year}</span>;

export class MetaData extends React.Component {
  render(){
    const { 
      match: {
        params : {
          data_source,
        },
      },
    } = this.props;

    const sorted_sources = _.sortBy(sources, source => source.title()); 
  
    return (
      <StandardRouteContainer
        title={text_maker("metadata")}
        breadcrumbs={[text_maker("metadata")]}
        description={text_maker("metadata_document_description")}
        route_key="_metadata"
      >
        <div>
          <h1><TM k="metadata"/></h1>
        </div>
        <p> <TM k='metadata_t'/> </p>
        <ScrollToTargetContainer target_id={data_source}>
          {_.map(sorted_sources, (source) => (
            <Panel key={source.key}>
              <header className="panel-heading" id={source.key}>
                <div style={{marginBottom:'3px'}}>
                  <div className="panel-title"> 
                    {source.title()}
                  </div>
                </div>
                <div style={{fontWeight: "400", opacity: 0.8}}>
                  <TM k="refreshed"/> {source.frequency.text}
                </div>
              </header>
    
              <PanelBody>
                <div>
                  { source.description() }
                </div>
                <div className="h4"> <TM k='datasets' /> </div>
                <FancyUL>
                  {_.map(source.items(), ({id, text, inline_link, external_link }) => (
                    <span key={id} className="fancy-ul-span-flex">
                      { 
                        inline_link ? 
                        <a 
                          title={text_maker('rpb_link_text')}
                          href={inline_link}
                          style={{alignSelf: "center"}}
                        >
                          {text}
                        </a>  :
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
                  <div style={{opacity: 0.8 }}> 
                    <TM k="last_refresh" /> {FormattedDate(source.last_updated)}
                  </div>
                  { source.open_data &&
                    <a 
                      style={{marginLeft:'auto'}} //fix a flexbox bug
                      className="btn btn-ib-primary" 
                      target="_blank" 
                      href={source.open_data[window.lang]}
                    > 
                      <TM k='open_data_link' /> 
                    </a>
                  }
                </div>
              </PanelBody>
            </Panel>
          ))}
        </ScrollToTargetContainer>
      </StandardRouteContainer>
    );
  }
};