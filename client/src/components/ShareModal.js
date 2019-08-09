import './ShareModal.scss';
import text1 from "./ShareModal.yaml";
import text2 from "./ShareButton.yaml";

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
import { create_text_maker } from '../models/text.js';
import { get_static_url } from '../request_utils.js';

const text_maker = create_text_maker([text1, text2]);

export class ShareModal extends React.Component {

  constructor(props){
    super(props);

    this.onBlur = this.onBlur.bind(this);
  }

  onBlur(e){
    var currentTarget = e.currentTarget;
    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        this.props.closeModal();
      }
    }, 0);
  }

  render(){
    const {
      closeModal,
      url,
      title,
      show,
    } = this.props;

    return (
      <Modal show={show} onHide={closeModal}>
        <div onBlur={this.onBlur}>
          <Modal.Header>
            <Modal.Title style={{fontSize: '130%'}}><img src={get_static_url('./svg/shareGrey.svg')}/>{text_maker("share")}</Modal.Title>
            <Modal.Title style={{fontSize: '100%', marginTop: '7px'}}>{title}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FacebookShareButton className='share-icons' url={url}>
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
            <Button className="btn btn-ib-primary" onClick={closeModal}>{text_maker("cancel")}</Button>
          </Modal.Footer>
          <div tabIndex='0' onFocus={closeModal} />
        </div>
      </Modal>
    );
  }
}