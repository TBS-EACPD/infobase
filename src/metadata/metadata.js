require("./metadata.ib.yaml");

const ROUTER = require('../core/router.js');
const {text_maker} = require('../models/text');
const { reactAdapter } = require('../core/reactAdapter.js');
const { 
  TextMaker,
  FancyUL,
}  = require('../util_components.js');
const { sources } = require('./data_sources.js');
const {
  Panel,
  PanelBody,
} = require('../panel_components.js');
const { months } = require('../models/businessConstants');

const FormattedDate = ({ day, month, year}) => <span>{months[month].text} {year}</span>;

const MetaData = () => {


  const sorted_sources = _.sortBy(sources, source => source.title()); 

  return <div>
    <p> <TextMaker text_key='metadata_t'/> </p>
    {_.map(sorted_sources, (source) => (
      <Panel key={source.key}>
        <header className="panel-heading" id={source.key}>
          <div style={{marginBottom:'3px'}}>
            <h3 className="panel-title"> 
              {source.title()}
            </h3>
          </div>
          <div style={{opacity: 0.8}}>
            <TextMaker text_key="refreshed"/> {source.frequency.text}
          </div>
        </header>

        <PanelBody>
          <div>
            { source.description() }
          </div>
          <h4> <TextMaker text_key='datasets' /> </h4>
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
                    <TextMaker text_key="open_data_link"/>
                  </a>
                }
              </span>
            ))}
          </FancyUL>
          <div className="fancy-ul-span-flex">
            <div style={{opacity: 0.8 }}> 
              <TextMaker text_key="last_refresh" /> {FormattedDate(source.last_updated)}
            </div>
            { source.open_data &&
              <a 
                style={{marginLeft:'auto'}} //fix a flexbox bug
                className="btn btn-ib-primary" 
                target="_blank" 
                href={source.open_data[window.lang]}
              > 
                <TextMaker text_key='open_data_link' /> 
              </a>
            }
          </div>
        </PanelBody>
      </Panel>
    ))}
  </div>
};

ROUTER.add_container_route("metadata/:source_key:", "_metadata",function(container, source_key){
  this.add_crumbs([{html: text_maker("metadata")}]);
  this.add_title("metadata");
   
  reactAdapter.render( <MetaData />, container );
  
  // If given a valid source_key, scroll the page to that source's section
  if (!_.isEmpty(source_key) && source_key !== "__"){
    var el = document.querySelector("#"+source_key);
    if (el){
      el.scrollIntoView();
      
      // For tab-nav, need to give focus to something (using the first link under the scrolled-to source, here)
      // Otherwise hitting tab after the navigation jumps you right back to the top
      document.querySelector("#"+source_key+" ~ * a").focus(); 
    }
  }
});
