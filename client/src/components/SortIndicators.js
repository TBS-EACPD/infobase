import './SortIndicators.scss';
import { trivial_text_maker } from '../models/text.js';

export const SortIndicator = ({ sortDirection, active }) => (
  <button
    className="SortIndicator"
    style={{ 
      color: "white",
      fontSize: '1.2em',
    }}
    aria-label={trivial_text_maker(
      sortDirection === "ASC" ? 
      "a11y_sort_asc" :
      "a11y_sort_desc"  
    )}
    aria-selected={active}
  >
    { 
      active ? (
        sortDirection === 'ASC' ? 
        "▲" : 
        "▼"         
      ) : (
        sortDirection === 'ASC' ? 
        "△" : 
        "▽"
      )
    }
  </button>
);

export const SortIndicators = ({ asc, desc }) => <div className="text-nowrap">
  <SortIndicator sortDirection="ASC" active={asc} />
  <SortIndicator sortDirection="DESC" active={desc} />
</div>;
