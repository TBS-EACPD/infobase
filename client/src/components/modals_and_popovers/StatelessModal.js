import './bootstrap_modal_exstension.scss';

import { Modal } from 'react-bootstrap';

import { trivial_text_maker } from '../../models/text.js';


export class StatelessModal extends React.Component {
  constructor(props){
    super(props);

    this.closeModal = this.closeModal.bind(this);
  }
  componentWillUnmount(){
    this.closeModal();
  }
  closeModal(){
    this.props.on_close_callback();
  }
  render(){
    const {
      show,
      title,
      subtitle,
      header,
      body,
      footer,
      close_text,
      close_button_in_header,
    } = this.props;

    const default_header = (
      <div style={{display: "inline-block"}}>
        {title && <Modal.Title style={{fontSize: '130%'}}>{title}</Modal.Title>}
        {subtitle && <Modal.Title style={{fontSize: '100%', marginTop: '7px'}}>{subtitle}</Modal.Title>}
      </div>
    );

    const common_layout = (content, include_close_button) => (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {content || <div /> /* empty div fallback so that space-between justification consistently positions the close button */} 
        { include_close_button && 
          <button className="btn btn-ib-primary" onClick={this.closeModal}>
            {close_text}
          </button>
        }
      </div>
    );
    const header_content = common_layout(header || default_header, close_button_in_header);
    const footer_content = footer || !close_button_in_header && common_layout(footer || <div/>, !close_button_in_header);

    return (
      <Modal 
        show={show}
        onHide={this.closeModal}
      >
        <div>
          <Modal.Header closeButton={!close_text}>
            {header_content}
          </Modal.Header>
          { body &&
            <Modal.Body>
              {body}
            </Modal.Body>
          }
          { footer_content &&
            <Modal.Footer>
              {footer_content}
            </Modal.Footer>
          }
        </div>
        <div tabIndex='0' onFocus={this.closeModal} />
      </Modal>
    );
  }
}
StatelessModal.defaultProps = {
  close_text: _.upperFirst( trivial_text_maker("close") ),
  close_button_in_header: false,
};