const DebouncedTextInput = ({
  placeHolder,
  defaultValue,
  debounce_time,
  updateCallback,
}) => {
  const debounced_callback = _.debounce(event => updateCallback(event.target.value), 500);
  const handle_change = event => {
    event.persist();
    debounced_callback(event);
  }

  return <input  
    type = "text"
    className = "form-control search"
    placeholder = { placeHolder || "" }
    defaultValue = { defaultValue || undefined }
    onChange = { handle_change }
  >
  </input>
};

export { DebouncedTextInput }