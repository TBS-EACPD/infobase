import { TextMaker, text_maker } from './rpb_text_provider.js';
import { sources as all_sources } from '../metadata/data_sources.js';
import { Subject } from '../models/subject';
import {
  DeptSearch,
  FancyUL,
  ShareButton,
  WriteToClipboard,
  FootnoteList,
} from '../components/index.js';
import { IconCopyLink } from '../icons/icons.js';

import classNames from 'classnames';

const { Gov } = Subject;

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
  const { title: table_title, description: table_description } = table;

  return (
    <section>
      <div>
        <strong>
          {table_title}
        </strong>
      </div>
      <div className="mrgn-tp-md">
        <p dangerouslySetInnerHTML={{__html: table_description}} />
      </div>
      <section className="mrgn-tp-lg">
        <div className="h5"> <TextMaker text_key="col_defs" /> </div> 
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
      <div className="rpb-separator" />
      {!_.isEmpty(footnotes) && 
        <div 
          className="mrgn-tp-lg"
        >
          <div className="h5"> <TextMaker text_key="footnotes" /> </div>
          <FootnoteList footnotes={footnotes} />
        </div>
      }
    </section>
  );
};

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
          rel="noopener noreferrer"
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
                rel="noopener noreferrer"
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
};

const ShareReport = () => (
  <div className="rpb-config-item rpb-share-options">
    <ShareButton
      url={window.location.href}
      icon_color={window.infobase_color_constants.secondaryColor}
    />
    <WriteToClipboard 
      text_to_copy={window.location.href}
      icon_color={window.infobase_color_constants.secondaryColor}
      IconComponent={IconCopyLink}
    />
  </div>
);


class ExportButton extends React.Component {
  //note that though props may not have changed, this method doesn't get triggered from this.setState 
  constructor(){
    super();
    this.state = { 
      success: null,
    }; 
  }
  static getDerivedStateFromProps(nextProps, prevState){
    return { 
      success: null,
    };
  }
  render(){
    const {
      id,
      get_csv_string,
    } = this.props;
    const { 
      success,
    } = this.state;


    if( window.feature_detection.download_attr ){
      return <div>
        <button 
          id={id}
          className="btn btn-ib-primary btn-block"
          onClick={ ()=> { this.triggerDownload(); } }
        >
          <TextMaker text_key="export_table" />
        </button>
      </div>;
    } else {
      const buttonText = (
        success === false ? 
        <TextMaker text_key="error" /> :
        ( 
          success === true ?
          <TextMaker text_key="finished_export_table_to_clipboard" /> :
          <TextMaker text_key="export_table_to_clipboard" />
        )
      );
      
      return <WriteToClipboard 
        text_to_copy={get_csv_string()}
        icon_color={window.infobase_color_constants.secondaryColor}
        button_class_name="btn btn-ib-primary btn-block"
        IconComponent={() => buttonText}
      />;
    }
  }
  triggerDownload(){
    const csv_str = this.props.get_csv_string();
    const uri = "data:text/csv;charset=UTF-8," + encodeURIComponent(csv_str);
    
    const temporary_anchor = document.createElement('a');
    temporary_anchor.setAttribute("download", 'table.csv');
    temporary_anchor.setAttribute("href", uri);
    temporary_anchor.dispatchEvent( new MouseEvent('click') );
  }
}

//the parent flexbox styling screws stuff up and makes it impossible to center vertically, top padding tweaked to correct
const SubjectFilterPicker = ({ subject, onSelect })=> <div style={{paddingTop: '10px'}}>
  <div className="md-half-width md-gutter-right">
    <button 
      onClick={
        subject.guid==="gov_gov" ? 
        null : 
        ()=> { onSelect(Gov); } 
      }
      className={classNames("btn btn-ib-primary", {"btn-ib-primary--selected": subject.guid==="gov_gov"})}
      style={{ 
        width: '100%',
        verticalAlign: 'baseline',
      }}
    > 
      <TextMaker text_key="see_all_data" args={{selected: subject.guid==='gov_gov'}} />
    </button>
  </div>
  <div className="md-half-width md-gutter-left row-opition-content-search">
    <DeptSearch 
      include_gov={true} 
      onSelect={ subject=> { onSelect(subject); }}
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


export { 
  ReportDetails,
  ReportDatasets,
  ShareReport,
  ExportButton,
  SubjectFilterPicker,
  NoDataMessage,
};
