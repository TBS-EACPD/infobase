import './CheckboxSelector.scss';

export class FancyCheckboxSelector extends React.Component {
  constructor(props){
    super(props);
  }
  componentDidUpdate(){
  }
  render(){
    const { items, handleToggle } = this.props;
    return (
      _.map(items, (item, key) =>
        <FancyCheckbox key={key} toggleHandler={handleToggle} {...item}/>
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
    const onClickHandler = () => this.props.toggleHandler(this.props.id,!active);
    const borderStyle = {borderColor: color};
    return (
      <div className="checkbox-selector">
        <button
          className={"checkbox-selector--box"}
          style={active ? { backgroundColor: color, ...borderStyle} : borderStyle }
          tabIndex={0}
          aria-pressed={active}
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