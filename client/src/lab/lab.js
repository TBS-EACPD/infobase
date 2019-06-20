import './lab.scss';
import { StandardRouteContainer } from '../core/NavComponents.js';
import { create_text_maker } from '../models/text.js';
import { 
  create_text_maker_component,
  CardLeftImage,
} from '../util_components.js';
import lab_text from './lab.yaml';
import { get_static_url } from '../request_utils.js';


const { TM } = create_text_maker_component(lab_text);
const text_maker = create_text_maker(lab_text);


export default class InfoLab extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <StandardRouteContainer
        title={text_maker("lab_title")}
        breadcrumbs={[text_maker("lab_title")]}
        //description={} TODO
        route_key="_about"
        beta={true}
        beta_banner_content="BETA site! don't trust anything here!!!"
      >
        <TM k="lab_title" el="h1" />
        <div>
          <TM k="lab_intro_text"/>
        </div>
        <div>
          <div className="lab-content">
            <CardLeftImage
              tmf={text_maker}
              img_src={get_static_url("svg/DPs.svg")}
              title_key="text_diff_lab_title"
              text_key="text_diff_lab_text"
              link_key="link_text"
              link_href="#text_diff"
            />
          </div>
          <div className="lab-content">
            <CardLeftImage
              tmf={text_maker}
              img_src={get_static_url("svg/eye-open.svg")}
              title_key="coming_soon_title"
              text_key="coming_soon_text"
            />
          </div>
        </div>
      </StandardRouteContainer>
    );
  }

}