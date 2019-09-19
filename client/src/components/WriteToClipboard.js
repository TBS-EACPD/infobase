import text from './WriteToClipboard.yaml';

import * as clipboard from 'clipboard-polyfill';
import { Fragment } from 'react';

import { StatelessModal } from './StatelessModal.js';
import { IconCopy } from '../icons/icons.js';

import { create_text_maker } from '../models/text.js';

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
      IconComponent,
    } = this.props;

    const { copy_status_message } = this.state;

    return (
      <Fragment>
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
          <IconComponent
            title={button_description}
            color={window.infobase_color_constants.textLightColor}
            alternate_color={false}
          />
        </button>
        <StatelessModal
          show={!!copy_status_message} 
          on_close_callback={() => this.setState({copy_status_message: false})}
          auto_close_time={!window.is_a11y_mode && copy_status_message === text_maker("copy_success") && 3000}
          title={
            <Fragment>
              <IconCopy
                title={button_description}
                color={window.infobase_color_constants.tertiaryColor}
                alternate_color={false}
              />
              {copy_status_message}
            </Fragment>
          }
          body={<div tabIndex="0">{text_to_copy}</div>}
        />
      </Fragment>
    );
  }
}
WriteToClipboard.defaultProps = {
  button_description: text_maker("copy_to_clipboard"),
  IconComponent: IconCopy,
};