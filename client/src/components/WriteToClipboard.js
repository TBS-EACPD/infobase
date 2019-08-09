import text from './WriteToClipboard.yaml';

import * as clipboard from 'clipboard-polyfill';
import { Overlay, Popover } from 'react-bootstrap';
import { Fragment } from 'react';

import { create_text_maker } from '../models/text.js';
import { get_static_url } from '../request_utils.js';

const text_maker = create_text_maker(text);

export class WriteToClipboard extends React.Component {
  constructor(){
    super();

    this.state = { copy_status_message: false };
  }
  render(){
    const {
      text_to_copy,
      button_class_name,
      button_description,
    } = this.props;

    const { copy_status_message } = this.state;

    const placement = "left";

    return (
      <Fragment>
        <Overlay
          show={!!copy_status_message}
          target={this.state.target}
          placement={placement}
          positionLeft={100}
          container={this}
          containerPadding={20}
        >
          <Popover
            id="popover-contained"
            placement={placement}
            title={button_description}
          >
            {copy_status_message}
          </Popover>
        </Overlay>
        <button
          className={button_class_name}
          onClick={
            () => clipboard
              .writeText(text_to_copy)
              .then(
                () => this.setState({copy_status_message: text_maker("copy_success")})
              )
              .catch(
                () => this.setState({copy_status_message: text_maker("copy_fail")})
              )
          }
        >
          <img 
            src={get_static_url("svg/permalink.svg")}
            alt={button_description}
            title={button_description}
          />
        </button>
      </Fragment>
    );
  }
}
WriteToClipboard.defaultProps = { button_description: text_maker("copy_to_clipboard") };