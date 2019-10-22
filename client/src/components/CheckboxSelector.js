import { Fragment } from 'react';

export class CheckboxSelector extends React.Component {
  constructor(props){
    super(props);
  }
  componentDidUpdate(){
  }
  render(){
    const { checkboxes, handleToggle } = this.props;
    return (
      _.map(checkboxes, ({label, defaultChecked}, index) =>
        <Checkbox id={index} toggleHandler={handleToggle} label={label} defaultChecked={defaultChecked}/>
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
  onClickHandler(){
    const newChecked = !this.state.checked;
    this.props.toggleHandler(this.props.id,newChecked);
    this.setState({checked: newChecked});
  }
  render(){
    const {id, label} = this.props;
    const checked = this.state.checked;
    return (
      <Fragment>
        <span
          className="checkbox"
          tabIndex={id}
          role="checkbox"
          aria-checked={checked}
          aria-labelledby={"checkboxLabel"+id}
          onClick={this.onClickHandler}
        />
        <label
          className="checkbox--label"
          id={"checkboxLabel"+id}
          onClick={this.onClickHandler}
        >
          {label}
        </label>
      </Fragment>
    );
  }
}