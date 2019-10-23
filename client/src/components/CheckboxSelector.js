import { Fragment } from 'react';
import './CheckboxSelector.scss';

export class CheckboxSelector extends React.Component {
  constructor(props){
    super(props);
  }
  componentDidUpdate(){
  }
  render(){
    const { checkboxes, handleToggle } = this.props;
    return (
      _.map(checkboxes, (checkbox, index) =>
        <Checkbox key={index} id={index} toggleHandler={handleToggle} {...checkbox}/>
      )
    );
  }
}

export class Checkbox extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      checked: props.defaultChecked,
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
    const borderStyle = {border: `2px solid ${color}`}
    return (
      <div>
        <button
          className={checked ? "checkbox checkbox--is-checked" : "checkbox"}
          style={checked ? { backgroundColor: color, ...borderStyle} : borderStyle }
          tabIndex={1}
          aria-pressed={checked}
          aria-labelledby={"checkboxLabel"+id}
          onClick={onClickHandler}
        />
        <label
          className="checkbox--label"
          id={"checkboxLabel"+id}
          onClick={onClickHandler}
        >
          {label}
        </label>
      </div>
    );
  }
}