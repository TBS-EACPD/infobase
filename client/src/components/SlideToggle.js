import './SlideToggle.scss';
import classNames from 'classnames';

export const SlideToggle = (props) => {
//no constructor needed since nothing is being set

  const { onSelect, name } = props;

  return(
    <div className="checkbox-container">
      <div>
        {name}
      </div>
      <input 
        type="checkbox" 
        name={name}
        className="slide-toggle-checkbox"
        onChange={(event) => onSelect(event.target.value)}
      >
      </input>
    </div>
  );
};