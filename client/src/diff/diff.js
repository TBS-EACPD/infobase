import './diff.scss';
import { StandardRouteContainer } from '../core/NavComponents.js';
import { create_text_maker } from '../models/text.js';
import { 
  create_text_maker_component,
} from '../util_components.js';
import lab_text from './diff.yaml';
import { get_static_url } from '../request_utils.js';


const { TM } = create_text_maker_component(lab_text);
const text_maker = create_text_maker(lab_text);


export default class TextDiffApp extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <StandardRouteContainer
        title={text_maker("diff_title")}
        breadcrumbs={[text_maker("diff_title")]}
        //description={} TODO
        route_key="_diff"
      >
        <TM k="diff_title" el="h1" />
        <div>
          <TM k="diff_intro_text"/>
        </div>

      </StandardRouteContainer>
    );
  }

}