import './TabbedContent.scss';
import classNames from 'classnames';

export class TabbedControls extends React.Component {
  render(){
    const {
      tab_options,
      tab_callback,
    } = this.props;
    
    return (
      <div className = "tabbed-controls">
        <ul>
          {_.map(tab_options, 
            ({key, label, is_open, is_disabled}) => (
              <li
                className = { classNames({
                  'tabbed-controls__label': true,
                  'tabbed-controls__label--active': !!is_open,
                  'tabbed-controls__label--disabled': !!is_disabled,
                }) }
                id = {key + "_tab"}
                key = {key + "_tab"}
                onClick = { () => !is_disabled && tab_callback(key) }
              > 
                <span
                  tabIndex = {0} 
                  className = "tabbed-controls__label-text"
                  role = "button"
                  aria-pressed = { is_open }
                  onClick = { () => !is_disabled && tab_callback(key) }
                  onKeyDown = { (e) => !is_disabled && (e.keyCode===13 || e.keyCode===32) && tab_callback(key) }
                >
                  {label}
                </span>
              </li>
            )
          )}
        </ul>
        <div className = "tabbed-controls__bottom-border"/>
      </div>
    );
  }
}


/*props: 
  tab_keys: array of keys associated with tabs,
  tab_labels: object, tab label strings stored by tab key (corresponding to each of tabKeys),
  tab_pane_contents: object, tab pane contents as JSX stored by tab key (corresponding to each of tabKeys),
*/
export class TabbedContent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      open_tab_key: props.tab_keys[0], // Starts with first tab open
    };
  }
  render(){
    const {
      tab_keys,
      tab_labels,
      tab_pane_contents,
    } = this.props;
    
    const open_tab_key = this.state.open_tab_key;
    const tabPaneContent = tab_pane_contents[open_tab_key];
    
    const tab_options = _.map(
      tab_keys,
      (key) => ({
        key,
        label: tab_labels[key],
        is_open: open_tab_key === key,
      })
    );

    const tab_callback = (key) => this.setState({open_tab_key: key});

    return (
      <div className="tabbed-content" aria-hidden="true">
        <TabbedControls { ...{tab_options, tab_callback} } />
        <div 
          className="tabbed-content__pane"
          ref = { open_tab_key+"_tabbed_content_pane" }
          key = { open_tab_key+"_tabbed_content_pane" }
        > 
          {tabPaneContent}
        </div>
      </div>
    );
  }
}