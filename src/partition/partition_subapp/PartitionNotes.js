import { AutoAccordion } from '../../util_components';
import { text_maker } from "../../models/text";

export class PartitionNotes extends React.Component {
  constructor(){
    super()
  }
  componentDidMount(){
    const autoAccordion = d3.select(ReactDOM.findDOMNode(this.refs.autoAccordion));
    autoAccordion.select(".pull-down-accordion-header").node().click();
  }
  render(){
    const { note_content } = this.props;
    return (
      <div className="mrgn-bttm-sm">
        <AutoAccordion
          title={text_maker("some_things_to_keep_in_mind")}
          usePullDown={true}
          ref="autoAccordion"
        >
          <div style={{paddingLeft: '10px', paddingRight:'10px'}}>
            { note_content }
          </div>
        </AutoAccordion>
      </div>
    );
  }
}