import './TabbedControls.scss';

export class TabbedControls extends React.Component {
  render(){
    const {
      tab_options,
      tab_callback,
    } = this.props;
    
    return (
      <ul className={"tabbed-controls"}>
        {_.map(tab_options, ({key, label, is_open}) => 
          (<li
            className={is_open ? "tabbed-controls__label tabbed-controls__label--active" : "tabbed-controls__label"}
            id={key + "_tab"}
            key={key + "_tab"}
            onClick={ () => tab_callback(key) }
          > 
            <p
              tabIndex={0} 
              className={"tabbed-controls__label-text"}
              role="button"
              aria-pressed={is_open}
              onClick={ () => tab_callback(key) }
              onKeyDown={ (e) => (e.keyCode===13 || e.keyCode===32) && tab_callback(key) }
            >
              {label}
            </p>
          </li>)
        )}
      </ul>
    );
  }
}