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

const text_maker = create_text_maker(text);

export class ShareModal extends React.Component {
  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.toggleModal}>
        <Modal.Header>
          <Modal.Title>{text_maker("share")}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FacebookShareButton className='share-icons' url={this.props.url}>
            <FacebookIcon size={32}></FacebookIcon>
          </FacebookShareButton> 
          <TwitterShareButton className='share-icons' url={this.props.url}>
            <TwitterIcon size={32}></TwitterIcon >
          </TwitterShareButton> 
          <EmailShareButton className='share-icons' url={this.props.url}> 
            <EmailIcon size={32}></EmailIcon>
          </EmailShareButton>
          <LinkedinShareButton className='share-icons' url={this.props.url}>
            <LinkedinIcon size={32}></LinkedinIcon>
          </LinkedinShareButton> 
          <RedditShareButton className='share-icons' url={this.props.url} title={this.props.title}>
            <RedditIcon size={32}></RedditIcon>
          </RedditShareButton>
        </Modal.Body>

        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.props.toggleModal}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}