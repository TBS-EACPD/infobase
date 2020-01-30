import { Fragment } from "react";
import { IconCheckmark } from '../icons/icons.js';

export const CheckBox = ({id, onClick, color, label, active, isSolidBox}) =>
  <Fragment>
    <span
      aria-hidden={true}
      style={{
        border: `1px solid ${color}`,
        backgroundColor: (!onClick || active) ? color : "transparent",
        textAlign: "center",
      }}
      className={ onClick ? "legend-color-checkbox span-hover" : "legend-color-checkbox" }
      onClick={ () => onClick && onClick(id) }
    >
      { !isSolidBox && <IconCheckmark
        color="white"
        width={10}
        height={10}
        vertical_align={0.1}
      />
      }
    </span>

    { onClick ?
      <span
        role="checkbox"
        aria-checked={active}
        tabIndex={0}
        className="link-styled"
        onClick={ () => onClick(id) }
        onKeyDown={ (e) => (e.keyCode===13 || e.keyCode===32) && onClick(id) }
      > 
        { label }
      </span> :
      <span> { label } </span>
    }
  </Fragment>;