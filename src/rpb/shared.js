const {
  Gov, 
} = require("../models/subject");
const { 
  sources: all_sources, 
} = require('../metadata/data_sources.js');
const { text_maker } = require('../models/text');
const {
  TextMaker,
  DeptSearch,
  FancyUL,
} = require('../util_components.js');
const alerts = require('../models/alerts.js');
const classNames= require('classnames');

const SelectList = ({
  legend_text,
  items, //[ {id,display} ]
  selected,  //[ ids ]
  is_multi_select, //true, defaults to false. All it does is provide the aria attr.
  onSelect,  //(id)=> { ... }
  display,
}) => {
  const name = "a"+_.uniqueId();
  return (
    <ul 
      className="list-unstyled" 
    >
      {_.map(items , ({id,display})=> {
        const isSelected = _.includes(selected,id);
        return (
          <li 
            key={id}
            className={ is_multi_select ? "checkbox" : "radio" }
          >
            <label
            >
              <input 
                onChange={()=>onSelect(id)}
                name={name} 
                type={ is_multi_select ? 'checkbox' : 'radio' }
                checked={isSelected}
              /> 
              {display} 
            </label>
          </li>
        );
      })}
    </ul>
  );
};

const ReportDetails = ({
  table, 
  dimension, 
  filter, 
  preferDeptBreakout, 
  mode,
  subject,
  columns,
  preferTable, 
  def_ready_columns,
  footnotes,
}) => {
  const { title: table_title, description : table_description } = table;

  return (
    <section>
      <header>
        <strong>
          {table_title}
        </strong>
      </header>
      <div className="mrgn-tp-md">
        <p dangerouslySetInnerHTML={{__html: table_description}} />
      </div>
      <section className="mrgn-tp-lg">
        <h5> <TextMaker text_key="col_defs" /> </h5> 
        <table className='table'>
          <thead>
            <tr> 
              <th> <TextMaker text_key="col_name" /> </th>
              <th> <TextMaker text_key="col_def" /> </th>
            </tr>
          </thead>
          <tbody>
            {_.map(def_ready_columns, ({name, def}) => 
              <tr key={name}> 
                <td> {name} </td>
                <td> {def} </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <div
        style={{borderTop: "1px solid #ccc"}} 
      />
      {!_.isEmpty(footnotes) && 
      <div 
        className="mrgn-tp-lg"
      >
        <h5> <TextMaker text_key="footnotes" /> </h5>
        <ul>
          {_.map( footnotes, (note, index) => 
            <li key={index}> <div dangerouslySetInnerHTML={{__html: note}} /> </li> 
          )}
        </ul>
      </div>
      }
    </section>
  );
}

const ReportDatasets = ({
  table, 
  subject,
}) => {

  const dataset_spans = table.link[window.lang] &&
    [
      <span key={"datasets_header"} className="fancy-ul-span-flex">
        <span className="fancy-ul-title-row">
          {text_maker("metadata")}
        </span>
      </span>,
      <span key={table.id} className="fancy-ul-span-flex">
        <span>
          {table.name}
        </span>
        <a 
          target="_blank" 
          className="btn btn-xs btn-ib-primary btn-responsive-fixed-width" 
          href={table.link[window.lang]}>
          <TextMaker text_key="open_data_link"/>
        </a>
      </span>,
    ];
  
  const data_source_spans = table.source.length > 0 &&
    [
      <span key={"datasets_header"} className="fancy-ul-span-flex">
        <span className="fancy-ul-title-row">
          {text_maker("data_sources")}
        </span>
      </span>,
      ..._.chain(table.source)
        .map( source => {
          return all_sources[source].open_data ?
            <span key={table.id} className="fancy-ul-span-flex">
              <a href={"#metadata/"+source}>
                {all_sources[source].title()}
              </a>
              <a 
                target="_blank" 
                className="btn btn-xs btn-ib-primary btn-responsive-fixed-width" 
                href={all_sources[source].open_data[window.lang]}>
                <TextMaker text_key="open_data_link"/>
              </a>
            </span> :
            false;
        })
        .filter( span => span)
        .value(),
    ];

  return (
    <div className="rpb-option-fancy-ul-container">
      <FancyUL>
        {
          _.flatten([dataset_spans, data_source_spans]
            .filter(d => d.length > 1))
        }
      </FancyUL>
    </div>
  );
}

//the parent flexbox styling screws stuff up and makes it impossible to center vertically,
// a padding of 6px at the top seems to fix it ¯\_(ツ)_/¯
const SubjectFilterPicker = ({ subject, onSelect })=> <div style={{paddingTop: '6px'}}>
  <div className="md-half-width md-gutter-right">
    <button 
      disabled={ subject.guid==="gov_gov" }
      onClick={
        subject.guid==="gov_gov" ? 
        null : 
        ()=> { onSelect(Gov) } 
      }
      className="btn btn-ib-primary"
      style={{ 
        width: '100%',
      }}
    > 
      <TextMaker text_key="see_all_data" args={{selected:subject.guid==='gov_gov'}} />
    </button>
  </div>
  <div className="md-half-width md-gutter-left">
    <DeptSearch 
      include_gov={true} 
      onSelect={ subject=> { onSelect(subject) }}
      search_text={
        text_maker(
          subject.guid==='gov_gov' ? 
          'org_search' : 
          'another_org_search'
        ) 
      }
    />
  </div>
</div>;

const NoDataMessage = ()=> (
  <div className="well large_panel_text">
    <div style={{textAlign: 'center'}}>
      <TextMaker text_key="rpb_no_data" />
    </div>
  </div>
);

const AlertMessage = ({table}) => {
  const alert_info = alerts(table.classification);
  if(alert_info){
    return (
      <div 
        className={classNames("alert", alert_info.css_class)}
        style={{
          textAlign:'center', 
          fontSize: '2.0em', 
          fontWeight: '500',
          marginBottom: 0,
          borderWidth: "1px",
          borderBottomWidth: 0,
        }}
      >
        <span>{ alert_info.get_text() }</span>
      </div>
    );
  } else { 
    return null; 
  }
}

module.exports = exports = { 
  SelectList,
  ReportDetails,
  ReportDatasets,
  SubjectFilterPicker,
  NoDataMessage,
  AlertMessage,
};
