import './StatelessModal.scss';

import { Modal } from 'react-bootstrap';
import classNames from 'classnames';

import { CountdownCircle } from './CountdownCircle.js';
import { trivial_text_maker } from '../models/text.js';


export class StatelessModal extends React.Component {
  constructor(props){
    super(props);

    this.auto_close_timeouts = [];
    this.onBlur = this.onBlur.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }
  closeModal(){
    const {
      on_close_callback,
      let_window_scroll,
    } = this.props;

    this.auto_close_timeouts.forEach( (auto_close_timeout) => clearTimeout(auto_close_timeout) );

    if (let_window_scroll){
      // Bootstrap modals prevent scrolling by temporarily adding the 'modal-open' class to <body>
      document.body.classList.remove('modal-open--allow-scroll');
    }

    on_close_callback();
  }
  onBlur(e){
    const currentTarget = e.currentTarget;
    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        this.closeModal();
      }
    }, 0);
  }
  componentWillUnmount(){
    this.closeModal();
  }
  componentDidUpdate(){
    const { 
      auto_close_time,
      show,
      let_window_scroll,
    } = this.props;

    if (show && let_window_scroll){
      // Bootstrap modals prevent scrolling by temporarily adding the 'modal-open' class to <body>
      document.body.classList.add('modal-open--allow-scroll');
    }

    if ( _.isNumber(auto_close_time) ){
      this.auto_close_timeouts.push( setTimeout(this.closeModal, auto_close_time) );
    }
  }
  render(){
    const {
      show,
      let_window_scroll,
      title,
      subtitle,
      body,
      backdrop,
      dialog_position,
      additional_dialog_class,
      auto_close_time,
      close_text,
    } = this.props;

    return (
      <Modal 
        show={show}
        backdrop={backdrop}
        dialogClassName={classNames(`modal-dialog--${dialog_position}`, additional_dialog_class)}
        onHide={this.closeModal}
        restoreFocus={
          // don't want to restore focus if the window could scroll, since it will (unexpectedly for the user) jump the window back
          // when focus returns. Always restore focus in a11y mode
          !let_window_scroll || window.is_a11y_mode
        }
      >
        <div onBlur={this.onBlur}>
          <Modal.Header closeButton={!close_text}>
            {title && <Modal.Title style={{fontSize: '130%'}}>{title}</Modal.Title>}
            {subtitle && <Modal.Title style={{fontSize: '100%', marginTop: '7px'}}>{subtitle}</Modal.Title>}
          </Modal.Header>
          <Modal.Body>
            {body}
          </Modal.Body>
          <Modal.Footer
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            { auto_close_time && 
              <CountdownCircle time={auto_close_time} show_numbers={true} />
            }
            { close_text &&
              <button className="btn btn-ib-primary" onClick={this.closeModal}>
                {close_text}
              </button>
            }
          </Modal.Footer>
          <div tabIndex='0' onFocus={this.closeModal} />
        </div>
      </Modal>
    );
  }
}
StatelessModal.defaultProps = {
  let_window_scroll: false,
  backdrop: true,
  dialog_position: "center",
  auto_close_time: false,
  close_text: _.upperFirst( trivial_text_maker("close") ),
};