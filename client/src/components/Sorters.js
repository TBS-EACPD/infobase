import './Sorters.scss';
import { trivial_text_maker } from '../models/text.js';

export const Sorter = ({ sortDirection, active }) => (
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
    aria-pressed={active}
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

export const Sorters = ({ asc, desc }) => <div className="text-nowrap">
  <Sorter sortDirection="ASC" active={asc} />
  <Sorter sortDirection="DESC" active={desc} />
</div>;
