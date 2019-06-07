import text from './panel_base_text.yaml'
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Fragment } from 'react';
import { 
  FootnoteList, 
  create_text_maker_component,
  SpinnerWrapper,
} from '../util_components.js';
import { Details } from '../components/Details.js';
import { get_static_url } from '../request_utils.js';
import { panel_href_template } from '../infographic/routes.js';
import { panel_context } from '../infographic/context.js';
import './panel-components.scss';
import { create_text_maker } from '../models/text.js';
import { log_standard_event } from '../core/analytics.js';
import * as qrcode from 'qrcode-generator';
import * as html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';


const { TM } = create_text_maker_component(text);
const text_maker = create_text_maker(text);

const PanelSource = ({links}) => {
  if(_.isEmpty(links)){
    return null;
  }
  const last_ix = links.length -1;
  return (
    <span>
      <span aria-hidden> 
        <TM k="source_link_text" />
      </span>
      <span className="sr-only"> <TM k="a11y_source_expl"/> </span>
      <ul
        className="list-unstyled list-inline"
        style={{display: "inline"}}
      >
        {_.map(links, ({href, html},ix) =>
          <li key={ix}>
            <a
              className="source-link"
              href={href}
            >
              <span dangerouslySetInnerHTML={{__html: html}} />
            </a>{ix !== last_ix && ", "}
          </li>
        )}
      </ul>
    </span>
  );
}



export const Panel = props => {
  const { Consumer } = panel_context;
  return (
    <Consumer>
      {(ctx)=>
        <Panel_
          context={ctx}
          {...props}
        />
      }
    </Consumer>
  )
}

class Panel_ extends React.Component {
  constructor(){
    super();

    this.state = {
      generating_pdf: false,
    };
  }
  download_panel_pdf(){
    const {
      context, 
      title,
    } = this.props;

    const file_name_context = context.subject.level === 'dept' ? context.subject.acronym: context.subject.id;
    const file_name = `${file_name_context}_${title}.pdf`;

    const panel_object = document.getElementById(context.graph_key);
    const panel_body = panel_object.getElementsByClassName("panel-body")[0];
    const legend_container_arr = panel_body.getElementsByClassName('legend-container');

    // When the list of legend items are too long such that the items don't all fit into the defined max height, scroll is created to contain them.
    // Screenshotting that will cause items to overflow, hence below sets max height to a big arbitrary number which later gets set back to original.
    const MAX_DIV_HEIGHT = "9999px";
    var oldMaxHeights = _.map(legend_container_arr, legend_container => (legend_container.style.maxHeight));
    _.forEach(legend_container_arr, legend_container => {
      legend_container.style.maxHeight = MAX_DIV_HEIGHT;
    });

    // Img tags are not properly captured, hence needs to be temporarily converted to canvas for pdf purposes only
    const imgElements = _.map(panel_body.getElementsByTagName("img"), _.identity);
    _.forEach (imgElements, (img)=>{
      const parentNode = img.parentNode;

      const canvas = document.createElement('canvas');
      canvas.className = "canvas-temp";
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      canvas.data = img.style.cssText;
      img.style.position = "absolute";
      img.style.zIndex = "1";
      img.style.visibility = 'hidden';

      parentNode.appendChild(canvas);
    });

    html2canvas(panel_body)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const ratio = canvas.height/canvas.width;

        const pdf = new jsPDF({
          compress: true,
          format: 'letter',
        });
        const width = pdf.internal.pageSize.getWidth();
        const height = ratio * width;

        const FOOTER_HEIGHT = 27;
        const EXTRA_HEIGHT = 20;

        pdf.internal.pageSize.setHeight(height + FOOTER_HEIGHT + EXTRA_HEIGHT);
        pdf.setFontStyle('bold');
        pdf.setLineWidth(2);
        pdf.text(2,10,title);
        pdf.line(0,12,width,12,'F');
        pdf.addImage(imgData, 'JPEG', 0, 12, width, height);

        const panel_link = `https://canada.ca/gcinfobase${panel_href_template(context.subject, context.bubble, context.graph_key)}`;

        const qr = qrcode(0, 'L');
        qr.addData(panel_link);
        qr.make();
        const qrCodeImg = qr.createDataURL();
        pdf.addImage(qrCodeImg, 'JPEG', 1, height + EXTRA_HEIGHT);

        pdf.setFontStyle('normal');
        pdf.setFontSize(10);
        pdf.textWithLink('canada.ca/gcinfobase', 2.5, height + EXTRA_HEIGHT + 25, {url: panel_link});

        const footerImg = new Image();
        footerImg.src = get_static_url(`png/wmms-blk.png`);
        pdf.addImage(footerImg, 'png', 174.5, height + EXTRA_HEIGHT + 15);
        
        pdf.save(file_name);
      })
      .then(() => {
        _.forEach (imgElements, (img)=>{
          const parentNode = img.parentNode;
          const canvas = parentNode.getElementsByClassName("canvas-temp")[0];

          img.style.cssText = canvas.data;
          parentNode.removeChild(canvas);
        });

        _.forEach(
          legend_container_arr,
          (legend_container, index) => legend_container.style.maxHeight = oldMaxHeights[index]
        )

        log_standard_event({
          SUBAPP: window.location.hash.replace('#',''),
          MISC1: "PDF_DOWNLOAD",
          MISC2: title,
        })

        this.setState({generating_pdf: false});
      });
  }
  componentDidUpdate(){
    this.state.generating_pdf && this.download_panel_pdf();
  }
  render(){
    const {
      context,
      title,
      sources,
      footnotes,
      children,
      allowOverflow,
    } = this.props;

    const { generating_pdf } = this.state;

    return (
      <section className={classNames('panel panel-info mrgn-bttm-md', allowOverflow && "panel-overflow")}>
        {title && <header className='panel-heading'>
          <header className="panel-title"> {title} </header>
          <div style={{marginLeft: 'auto'}}>
            { context && !window.feature_detection.is_IE() && !generating_pdf &&
              <img src={get_static_url("svg/download.svg")}
                className='panel-heading-utils'
                onClick={ () => this.setState({generating_pdf: true}) }
                alt={text_maker("a11y_download_panel")}
                title={text_maker("a11y_download_panel")}
              />
            }
            {context && !window.feature_detection.is_IE() && generating_pdf &&
              <SpinnerWrapper config_name={"small_inline"} />
            }
            { context && !context.no_permalink && panel_href_template(context.subject, context.bubble, context.graph_key) && 
              <a href={panel_href_template(context.subject, context.bubble, context.graph_key)}>
                <img src={get_static_url("svg/permalink.svg")}
                  alt={text_maker("a11y_permalink")}
                  className='panel-heading-utils'
                  title={text_maker("a11y_permalink")}
                />
              </a>
            }
          </div>
        </header>
        }
        <div className='panel-body'>
          { children }
          <div className="mrgn-tp-md" />
          {_.nonEmpty(sources) && 
            <div>
              <PanelSource links={sources} />
            </div>
          }
          {_.nonEmpty(footnotes) && 
            <div className="mrgn-tp-md">
              <Details
                summary_content={ <TM k="footnotes" /> }
                content={
                  <FootnoteList
                    footnotes={footnotes}
                  />
                }
              />
            </div>
          }
        </div>
      </section>
    );
  }
}


/* 
  The below components allow to reduce some redundancy when addressing a particular use case: 
  
  A simple column split with vertically-centered content in each column.   

  Simply use 

  <StdPanel title footnotes sources>
    <Col size={12}>
      All children must be of type 'Col'. If you need non column based content, you must wrap it in a 12-sized Col
    </Col>
    <Col size={5}>
      {...first_col_content}
    </Col>
    <Col size={7}>
      {...first_col_content}
    </Col>
  </StdPanel>


*/


const Col = ({ children, size }) => null;

Col.propTypes = {
  size: PropTypes.number.isRequired,
  isText: PropTypes.bool,
  isGraph: PropTypes.bool,
};


//Dummy component that will be remapped to flexboxgrid columns 

const StdPanel = ({ title, sources, footnotes, children }) => {
  const mapped_children = _.chain(children)
    .flatMap( child => {
      if ( child.type && child.type === Fragment ){
        return child.props.children;
      } else {
        return child;
      }
    })
    .filter( child => child && child.type )
    .map( ({ props }, ix) => {
      const { size, isText, isGraph, extraClasses, passedRef } = props;
     
      return (
        <div 
          className={
            classNames(
              `fcol-xs-12 fcol-md-${size}`,
              isText && "medium_panel_text", 
              !_.isUndefined(extraClasses) && extraClasses
            )
          }
          style={ isGraph ? {position: "relative"} : null }
          key={ix}
          ref={passedRef}
        >
          {props.children}
        </div>
      );
    })
    .value();

  return (
    <Panel {...{title, sources, footnotes}}>
      <div className="frow middle-xs">
        {mapped_children}
      </div>
    </Panel>
  );

}

StdPanel.propTypes = {
  children: function (props) {
    const { children } = props;
    
    const are_children_valid = (children) => {
      const filtered_and_flattened_children = _.chain(children)
        .flatMap( child => {
          if ( child.type && child.type === Fragment ){
            return child.props.children;
          } else {
            return child;
          }
        })
        .filter(_.identity)
        .value();

      return _.every(filtered_and_flattened_children, {type: Col});
    }

    if( !are_children_valid(children) ){
      return new Error(`StdPanel expects all children to be either of the type 'Col', a fragment containing children of type 'Col', or false (in the case of a conditional child component)`);
    }
  },
}

export { Col, StdPanel};



/*
  shorthand for 
    <Panel>
      <div className="medium_panel_text">
        {children}
      </div>
    </Panel>
*/
export const TextPanel = props => {
  const { children } = props;
  const filtered_props = _.omit(props, "children");
  const new_children = <div className="medium_panel_text"> {children} </div>;
  return (
    <Panel {...filtered_props}>
      {new_children}
    </Panel>
  );
}