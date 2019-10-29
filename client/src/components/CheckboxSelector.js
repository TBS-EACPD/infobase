import './CheckboxSelector.scss';

export const FancyCheckboxSelector = ({items, legend, callbackToggle}) =>
  <div className="legend-container">
    <fieldset>
      <legend> {legend} </legend>
      { _.map(
        items,
        (item, key) => <FancyCheckbox key={key} callbackToggle={callbackToggle} {...item}/>
      ) }
    </fieldset>
  </div>;

export class FancyCheckbox extends React.Component {
  constructor(props){
    super(props);
  }
  render(){
    const {id, label, color, active, boxElement} = this.props;
    const onClickHandler = () => this.props.callbackToggle(this.props.id,!active);
    const borderStyle = {borderColor: color};
    return (
      <div className="fancy-checkbox">
        { boxElement ?
          boxElement({
            tabIndex: 0,
            role: "checkbox",
            "aria-checked": active,
            "aria-labelledby": "checkboxLabel_"+id,
            onClick: onClickHandler,
          })
          :
          <button
            className={"fancy-checkbox__box"}
            style={active ? { backgroundColor: color, ...borderStyle} : borderStyle }
            tabIndex={0}
            role={"checkbox"}
            aria-checked={active}
            aria-labelledby={"checkboxLabel_"+id}
            onClick={onClickHandler}
          />
        }
        <label
          className="fancy-checkbox__label"
          id={"checkboxLabel_"+id}
          onClick={onClickHandler}
        >
          {label}
        </label>
      </div>
    );
  }
}