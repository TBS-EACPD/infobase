import './ShareModal.scss' ;
import { Button, Modal } from 'react-bootstrap';
import {
  TwitterShareButton,
  TwitterIcon,
  FacebookShareButton,
  FacebookIcon,
  EmailShareButton,
  EmailIcon,
  LinkedinShareButton,
  LinkedinIcon,
  RedditShareButton,
  RedditIcon,
} from 'react-share';
import text from "./ShareModal.yaml" ;
import { create_text_maker } from '../models/text.js' ;
import { get_static_url } from '../request_utils.js';
import svgs from './ShareModalSVG.yaml';

const text_maker = create_text_maker(text);
const svg_maker = create_text_maker(svgs);

export class ShareModal extends React.Component {

  constructor(props) {
    super(props);

    this.onBlur = this.onBlur.bind(this);
    this.check = this.check.bind(this);
    this.counter = 0;
  }

  onBlur(e) {
    var currentTarget = e.currentTarget;
    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        //this.props.modalOff();
        this.activeModal.onHide=this.props.modalOff();
      }
    }, 0);
  } ;

  componentWillUpdate() {
    this.counter = 0;
  }
  
  check() {
    if (this.counter > 0) {
      this.props.modalOff();
    }
    this.counter++;
  }
  
  render() {
    const {
      subject,
      modalOff,
      title,
      url,
      show,
    } = this.props;
    
    let acronym = subject.level === 'dept' ? subject.acronym : subject.id;
    acronym = acronym == '' ? subject.name : acronym.toUpperCase();

    return (
      <Modal ref={modal => this.activeModal = modal} show={show} onHide={modalOff} onBlur={this.onBlur}>
        <div tabIndex='0' ref={div => this.checkFocus = div} onFocus={this.check}></div>
        <Modal.Header>
          <Modal.Title style={{fontSize: '130%'}}><img src='./svg/shareGrey.svg'/> {text_maker("share")}</Modal.Title>
          <Modal.Title style={{fontSize: '100%', marginTop: '7px'}}>{acronym} — {title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FacebookShareButton className='share-icons' url={url} >
            <FacebookIcon size={32}></FacebookIcon>
          </FacebookShareButton> 
          <TwitterShareButton className='share-icons' url={url}>
            <TwitterIcon size={32}></TwitterIcon >
          </TwitterShareButton> 
          <EmailShareButton className='share-icons' url={url}> 
            <EmailIcon size={32}></EmailIcon>
          </EmailShareButton>
          <LinkedinShareButton className='share-icons' url={url}>
            <LinkedinIcon size={32}></LinkedinIcon>
          </LinkedinShareButton> 
          <RedditShareButton className='share-icons' url={url} title={title}>
            <RedditIcon size={32}></RedditIcon>
          </RedditShareButton>
        </Modal.Body>

        <Modal.Footer>
          <Button bsStyle="primary" onClick={modalOff}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}