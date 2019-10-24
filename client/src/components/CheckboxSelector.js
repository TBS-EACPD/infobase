import './CheckboxSelector.scss';

export class CheckboxSelector extends React.Component {
  constructor(props){
    super(props);
  }
  componentDidUpdate(){
  }
  render(){
    const { items, handleToggle } = this.props;
    return (
      _.map(items, (item, key) =>
        <Checkbox key={key} toggleHandler={handleToggle} {...item}/>
      )
    );
  }
}

export class Checkbox extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      checked: props.active,
    };
  }
  render(){
    const {id, label, color} = this.props;
    const checked = this.state.checked;
    const onClickHandler = () => {
      const newChecked = !this.state.checked;
      this.props.toggleHandler(this.props.id,newChecked);
      this.setState({checked: newChecked});
    };
    const borderStyle = {borderColor: color};
    return (
      <div className="checkbox-selector">
        <button
          className={"checkbox-selector--box"}
          style={checked ? { backgroundColor: color, ...borderStyle} : borderStyle }
          tabIndex={0}
          aria-pressed={checked}
          aria-labelledby={"checkboxLabel_"+id}
          onClick={onClickHandler}
        />
        <label
          className="checkbox-selector--label"
          id={"checkboxLabel"+id}
          onClick={onClickHandler}
        >
          {label}
        </label>
      </div>
    );
  }
}