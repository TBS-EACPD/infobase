import text from './WriteToClipboard.yaml';

import * as clipboard from 'clipboard-polyfill';

import { create_text_maker } from '../models/text.js';
import { get_static_url } from '../request_utils.js';

const text_maker = create_text_maker(text);

export class WriteToClipboard extends React.Component {
  render(){
    const {
      text_to_copy,
      button_class_name,
      button_description,
    } = this.props;

    return (
      <button
        className={button_class_name}
        onClick={
          () => clipboard
            .writeText(text_to_copy)
            .then(
              () => this.setState() //TODO
            )
            .catch(
              () => this.setState() //TODO
            )
        }
      >
        <img 
          src={get_static_url("svg/permalink.svg")}
          alt={button_description}
          title={button_description}
        />
      </button>
    );
  }
}
WriteToClipboard.defaultProps = { button_description: text_maker("copy_to_clipboard") };