const { text_maker } = require('../models/text.js');

const SortIndicator = ({ sortDirection, active }) => (
  <button
    className="button-unstyled rpb-sort-indicator"
    style={{ 
      color: (
        active ?  
        "white" : 
        'rgba(180,180,180,0.3)'
      ),
      fontSize: '1.2em',
    }}
    aria-label={text_maker(
      sortDirection === "ASC" ? 
      "a11y_sort_asc" :
      "a11y_sort_desc"  
    )}
  >
    { sortDirection === 'ASC' ? "▲" : "▼" }
  </button>
);

const SortIndicators = ({ asc, desc }) => <div className="text-nowrap">
  <SortIndicator sortDirection="ASC" active={asc} />
  <SortIndicator sortDirection="DESC" active={desc} />
</div>;

module.exports = exports = {
  SortIndicators,
}