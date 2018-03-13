const {
  TextMaker,
  AutoAccordion,
} = require('../util_components');
const { text_maker } = require("../models/text");

export class PartitionDiagramNotes extends React.Component {
  constructor(){
    super()
  }
  componentDidMount(){
    const autoAccordion = d3.select(ReactDOM.findDOMNode(this.refs.autoAccordion));
    autoAccordion.select(".pull-down-accordion-header").node().click();
  }
  render(){
    const { note_text_key } = this.props;
    return (
      <div className="mrgn-bttm-sm">
        <AutoAccordion
          title={text_maker("some_things_to_keep_in_mind")}
          usePullDown={true}
          ref="autoAccordion"
        >
          <div style={{paddingLeft: '10px', paddingRight:'10px'}}>
            <TextMaker text_key={note_text_key} />
          </div>
        </AutoAccordion>
      </div>
    );
  }
}