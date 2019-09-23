import './StatelessModal.scss';

import { Modal } from 'react-bootstrap';
import classNames from 'classnames';

import { CountdownCircle } from './CountdownCircle.js';
import { trivial_text_maker } from '../models/text.js';


export class StatelessModal extends React.Component {
  constructor(props){
    super(props);

    this.closeModal = this.closeModal.bind(this);

    this.state = {
      keyboard_navigation_detected: false,
      timeout_stopped: false,
    };
  }
  componentDidUpdate(){
    const { 
      show,
      backdrop,
    } = this.props;

    if (show && !backdrop){
      // Bootstrap modals prevent scrolling by temporarily adding the 'modal-open' class to <body>
      document.body.classList.add('modal-open--allow-scroll');
    }
  }
  componentWillUnmount(){
    this.closeModal();
  }
  closeModal(){
    const {
      on_close_callback,
      backdrop,
    } = this.props;

    if (!backdrop){
      // Bootstrap modals prevent scrolling by temporarily adding the 'modal-open' class to <body>
      document.body.classList.remove('modal-open--allow-scroll');
    }

    this.setState({ timeout_stopped: false });

    on_close_callback();
  }
  render(){
    const {
      show,
      title,
      subtitle,
      header,
      body,
      footer,
      backdrop,
      dialog_position,
      additional_dialog_class,
      auto_close_time,
      close_text,
      close_button_in_header,
    } = this.props;

    const {
      keyboard_navigation_detected,
      timeout_stopped,
    } = this.state;

    const default_header = (
      <div style={{display: "inline-block"}}>
        {title && <Modal.Title style={{fontSize: '130%'}}>{title}</Modal.Title>}
        {subtitle && <Modal.Title style={{fontSize: '100%', marginTop: '7px'}}>{subtitle}</Modal.Title>}
      </div>
    );

    const close_button_and_timer = (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "3em",
        }}
      >
        { auto_close_time && !timeout_stopped &&
          <CountdownCircle 
            time={auto_close_time}
            show_numbers={auto_close_time >= 2000}
            size="3em"
            on_end_callback={this.closeModal}
          />
        }
        { close_text &&
          <button className="btn btn-ib-primary" onClick={this.closeModal}>
            {close_text}
          </button>
        }
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
        {include_close_button && close_button_and_timer}
      </div>
    );
    const header_content = common_layout(header || default_header, close_button_in_header);
    const footer_content = footer || !close_button_in_header && common_layout(footer || <div/>, !close_button_in_header);

    return (
      <Modal 
        show={show}
        backdrop={backdrop}
        modal-without-backdrop={(!backdrop).toString()}
        dialogClassName={classNames(`modal-dialog--${dialog_position}`, additional_dialog_class)}
        onHide={this.closeModal}
        restoreFocus={
          // don't want to restore focus if the window could scroll, since it will (unexpectedly for the user) jump the window back
          // when focus returns. Always restore focus in a11y mode
          backdrop || keyboard_navigation_detected || window.is_a11y_mode
        }
      >
        <div
          onFocus={() => this.setState({ timeout_stopped: show })}
          onMouseOver={() => this.setState({ timeout_stopped: show })}
          onKeyDown={() => this.setState({ keyboard_navigation_detected: show })}
        >
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
  backdrop: true,
  dialog_position: "center",
  auto_close_time: false,
  close_text: _.upperFirst( trivial_text_maker("close") ),
  close_button_in_header: false,
};