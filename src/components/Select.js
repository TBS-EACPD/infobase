//expects options to be of the form [ { id, display } ]
const Select = ({  id, selected, className, options, onSelect, disabled, style }) => (
  <select 
    style={style}
    id={id}
    disabled={disabled}
    className={className}
    value={selected} 
    onChange={ event => onSelect(event.target.value)} 
  > 
    {_.map( options, choice =>
      <option key={choice.id} value={choice.id} >
        { choice.display } 
      </option>
    )}
  </select>
)

module.exports = exports = {
  Select,
}