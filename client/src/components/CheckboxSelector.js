import './CheckboxSelector.scss';

export class FancyCheckboxSelector extends React.Component {
  constructor(props){
    super(props);
  }
  componentDidUpdate(){
  }
  render(){
    const { items, callbackToggle } = this.props;
    return (
      _.map(items, (item, key) =>
        <FancyCheckbox key={key} callbackToggle={callbackToggle} {...item}/>
      )
    );
  }
}

export class FancyCheckbox extends React.Component {
  constructor(props){
    super(props);
  }
  render(){
    const {id, label, color, active} = this.props;
    const onClickHandler = () => this.props.callbackToggle(this.props.id,!active);
    const borderStyle = {borderColor: color};
    return (
      <div className="checkbox-selector">
        <button
          className={"checkbox-selector--box"}
          style={active ? { backgroundColor: color, ...borderStyle} : borderStyle }
          tabIndex={0}
          aria-role={"checkbox"}
          aria-labelledby={"checkboxLabel_"+id}
          onClick={onClickHandler}
        />
        <label
          className="checkbox-selector--label"
          id={"checkboxLabel_"+id}
          onClick={onClickHandler}
        >
          {label}
        </label>
      </div>
    );
  }
}