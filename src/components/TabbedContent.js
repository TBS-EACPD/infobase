require('./TabbedContent.scss');

/*props: 
  tabKeys: array of keys associated with tabs,
  tabLabels: object, tab label strings stored by tab key (corresponding to each of tabKeys),
  tabPaneContents: object, tab pane contents as JSX stored by tab key (corresponding to each of tabKeys),
*/
export class TabbedContent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      openTabKey : props.tabKeys[0],
    };
  }
  render(){
    const {
      tabKeys,
      tabLabels,
      tabPaneContents,
    } = this.props;
    
    const openTabKey = this.state.openTabKey; // Open to first tab by default
    const tabPaneContent = tabPaneContents[openTabKey];
    
    // Horizontal bar of tab labels (ul and li's) above a tab content pane (div). 
    // Clicking on a tab label "opens" that tab pane (renders it's contents in the content pane)
    return (
      <div className={"tabbed_content"} aria-hidden={"true"}>
        <ul className={"tabbed_content_label_bar"}>
          {_.map(tabKeys, key => 
            (<li 
              className={key === openTabKey ? "tab_label active_tab" : "tab_label"}
              id={key + "_tab"}
              key={key + "_tab"}
              onClick={()=>{
                this.setState({openTabKey: key});
              }}
            > 
              <p 
                tabIndex={0} 
                className={"tab_label_text"}
                role="button"
                aria-pressed={key === openTabKey}
                onClick={()=>{
                  this.setState({openTabKey: key});
                }}
                onKeyDown={(e)=> (e.keyCode===13 || e.keyCode===32) && this.setState({openTabKey: key})}
              >
                {tabLabels[key]}
              </p>
            </li>)
          )}
        </ul>
        <div 
          className={"tabbed_content_pane"}
          ref={openTabKey+"_tabbed_content_pane"}
          key={_.uniqueId()} // React, trying to be smart, sees this as not needing to be re-rendered (causing tabPaneContent to not update). Setting a new key each time forces the re-render
        > 
          {tabPaneContent}
        </div>
      </div>
    );
  }
}