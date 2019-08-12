import './StatelessModal.scss';

import { Modal } from 'react-bootstrap';
import { trivial_text_maker } from '../models/text.js';

export class StatelessModal extends React.Component {
  constructor(props){
    super(props);

    this.onBlur = this.onBlur.bind(this);
  }

  onBlur(e){
    var currentTarget = e.currentTarget;
    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        this.props.on_close_callback();
      }
    }, 0);
  }

  render(){
    const {
      show,
      on_close_callback,
      title,
      subtitle,
      body,
      close_text,
    } = this.props;

    return (
      <Modal show={show} onHide={on_close_callback}>
        <div onBlur={this.onBlur}>
          <Modal.Header>
            {title && <Modal.Title style={{fontSize: '130%'}}>{title}</Modal.Title> }
            {subtitle && <Modal.Title style={{fontSize: '100%', marginTop: '7px'}}>{subtitle}</Modal.Title>}
          </Modal.Header>

          <Modal.Body>
            {body}
          </Modal.Body>

          <Modal.Footer>
            <button className="btn btn-ib-primary" onClick={on_close_callback}>{close_text}</button>
          </Modal.Footer>
          <div tabIndex='0' onFocus={on_close_callback} />
        </div>
      </Modal>
    );
  }
}
StatelessModal.defaultProps = {
  close_text: _.upperFirst( trivial_text_maker("close") ),
};