import { IconCheckmark } from '../icons/icons.js';

export class CheckBox extends React.Component{
  render(){
    const {
      id,
      onClick, //required: id => {}
      label, //required text for checkbox
      active, //required, equivalent of 'checked'
      color, //defaults to window.infobase_color_constants.primaryColor
      isSolidBox, //defaults to false
      container_style, //style for div, containing checkbox and label
      checkbox_style, //style for checkbox
      label_style, //style for label
      checkmark_vertical_align, //defaults to 0.1
      disabled, //greys out checkbox and make it non-clickable if true
    } = this.props;

    return window.is_a11y_mode ?
    <div className="checkbox">
      <label>
        <input 
          type='checkbox'
          checked={active}
          onChange={onClick}
          style={{marginRight: 5}}
        />
        { label }
      </label>
    </div>
    : <div style={{
      display: "flex",
      pointerEvents: disabled && "none",
      opacity: disabled && 0.4,
      ...container_style,
    }}>
      <span
        aria-hidden={true}
        style={{
          ...checkbox_style,
          border: `1px solid ${color}`,
          backgroundColor: (!onClick || active) ? color : "transparent",
          textAlign: "center",
        }}
        className={ onClick ? "legend-color-checkbox span-hover" : "legend-color-checkbox" }
        onClick={ () => !disabled && onClick && onClick(id) }
      >
        { !isSolidBox && 
        <IconCheckmark
          color={window.infobase_color_constants.backgroundColor}
          width={10}
          height={10}
          vertical_align={checkmark_vertical_align}
        />
        }
      </span>

      { onClick ?
        <span
          style={label_style}
          role="checkbox"
          aria-checked={active}
          tabIndex={0}
          className="link-styled"
          onClick={ () => onClick(id) }
          onKeyDown={ (e) => (e.keyCode===13 || e.keyCode===32) && !disabled && onClick(id) }
        > 
          { label }
        </span> :
        <span style={label_style}> { label } </span>
      }
    </div>;
  }
}
CheckBox.defaultProps = {
  color: window.infobase_color_constants.primaryColor,
  checkmark_vertical_align: 0.1,
};