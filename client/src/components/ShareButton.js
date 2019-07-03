import { ShareModal } from './ShareModal.js';
import text from './panel_base_text.yaml';
import { create_text_maker } from '../models/text.js';
import { get_static_url } from '../request_utils.js';
import { panel_href_template } from '../infographic/routes.js';

const text_maker = create_text_maker(text);

export class ShareButton extends React.Component {

  constructor(props) {
    super();

    this.props = props;

    this.state = {
      showModal: false,
    };
  }

  toggleModal(bool) {
    this.setState({showModal: bool});
  }

  render() {
    const {context, button_class_name, title} = this.props;

    return(
      <div style={{display: 'inline'}}>
        <button onClick={() => this.toggleModal(true)} className={button_class_name}>
          <img src={get_static_url("svg/share.svg")} 
            alt={text_maker("a11y_share_button")}
            title={text_maker("a11y_share_button")}
          />
        </button>
        <ShareModal 
          show={this.state.showModal} 
          toggleModal={() => this.toggleModal()} 
          url={
            window.location.href.replace(
              window.location.hash,
              panel_href_template(context.subject, context.bubble, context.graph_key).replace(/~/g, '%7E')
            )
          } 
          title={title}
          subject={context.subject}
        />
      </div>
    );
  }
}