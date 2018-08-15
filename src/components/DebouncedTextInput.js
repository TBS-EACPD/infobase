class DebouncedTextInput extends React.Component {
  render(){
    const {
      placeHolder,
      defaultValue,
      debounceTime,
      updateCallback,
    } = this.props;

    this.debounced_callback = _.debounce(event => updateCallback(event.target.value), debounceTime);
    const handle_change = event => {
      event.persist();
      this.debounced_callback(event);
    }

    return <input  
      type = "text"
      className = "form-control search"
      placeholder = { placeHolder || "" }
      defaultValue = { defaultValue || undefined }
      onChange = { handle_change }
    >
    </input>;
  }
  componentWillUnmount(){
    !_.isUndefined(this.debounced_callback) && this.debounced_callback.cancel();
  }
}

DebouncedTextInput.defaultProps= {debounceTime: 500};

export { DebouncedTextInput }