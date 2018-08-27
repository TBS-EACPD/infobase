import 'FilterTable.scss';

const eye_open = (
  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    viewBox="0 0 500 500" style="enable-background:new 0 0 500 500;" xml:space="preserve"
    class="eye-open"
  >
    <path 
      d="M250,125.4 M247.3,125.4c-95.5,1.9-169.7,101.1-172.9,105.4l-6.2,8.4l5.5,8.9c3.2,5.2,79.5,126.4,177,126.4
      c97.6,0,172.5-121.4,175.6-126.5l5.4-8.9l-6.2-8.4c-3.1-4.3-77.4-103.6-173-105.4 M182.1,233.3l70,49.8c-6.8,9.6-28,6.2-47.3-7.5
      C185.5,261.8,175.3,242.9,182.1,233.3z M354.6,288.7c-24.7,25.1-62.8,54.9-103.9,54.9c-41,0-79.3-29.7-104.2-54.6
      c-18.6-18.6-32.8-37.5-40.4-48.2c7.5-8.9,20.9-23.7,38.5-38.5c7.1-6,14-11.2,20.7-15.8c-2.9,8.8-4.5,18.2-4.5,28
      c0,49.2,39.9,89.1,89.1,89.1s89.1-39.9,89.1-89.1c0-9.8-1.6-19.2-4.5-28c27.8,19,49.1,42.3,59.4,54.4
      C386.6,251.5,372.9,270.1,354.6,288.7z"
    />
  </svg>
);

const eye_closed = (
  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     viewBox="0 0 500 500" style="enable-background:new 0 0 500 500;" xml:space="preserve"
     class="eye-closed"
  >
    <path 
      d="M381.9,227.9c4.1,4.3,8,8.7,11.8,13.2c-11.7,17-24.9,33-39.3,47.8c-15,15.2-35,32.2-57.6,43.2l0,0l0,0
    	l-18.5,39.5c83.7-19.3,145-118.7,147.8-123.3l5.4-8.9l-6-8.3c-16-20.7-34.4-39.6-54.8-56L357,204.2"
    />
    <path 
      d="M362.7,71.1l-35.3,75.2c-18.1-9.5-38-16.7-59.2-19.4c-12-2.5-24.4-2.5-36.4,0
    	C143.9,138.2,77.4,227.1,74.5,231.1l-6.2,8.4l5.5,8.9c2.9,4.6,64.6,103.1,147.9,123l-25.4,54.1l23.9,9.7L386.5,80.9h0.1v-0.1
    	L362.7,71.1z M182.1,232.9L182.1,232.9L182.1,232.9l70,49.8c-2.6,3.6-7.1,5.4-12.9,5.4c-9.6,0.1-22.4-4.4-34.5-13
    	C185.5,261.5,175.3,242.5,182.1,232.9z M235.2,342.6c-35.1-6.1-67-31.5-88.8-53.2c-14.8-14.9-28.3-31-40.3-48.2
    	c11.7-13.9,24.6-26.8,38.5-38.5c7-5.9,13.8-11.1,20.5-15.6c-14.9,46.9,11,97,57.9,111.9c8.7,2.8,17.8,4.2,26.9,4.2
    	c1.3,0,2.5,0,3.8-0.1L235.2,342.6z"
    />
  </svg>
);

export class FilterTable extends React.Component {
  constructor(){
    super();
  }
  render(){
    return (
      <div className="filter-table">
        {
          _.chain(all_chapter_keys)
            .map( chapter_key => ({
              chapter_key, 
              count: measure_counts_by_chapter_key[chapter_key] || 0,
            }) )
            .map( ({chapter_key, count }) =>
              <button
                aria-pressed={ _.includes(active_list, chapter_key) }
                onClick={ () => update_filtered_chapter_keys(filtered_chapter_keys, chapter_key) }
                className={ classNames("filter-table__item", _.includes(active_list, chapter_key) && "filter-table__item--active" ) }
                key={chapter_key}
              >
                <div 
                  className="filter-table__eye"
                  style={{
                    visibility: filtered_chapter_keys.length !== 0 ? "visible" : "hidden",
                  }}
                >
                  { _.includes(active_list, chapter_key) ? eye_open : eye_closed }
                </div>
                <div className="filter-table__word">
                  <span className="link-unstyled">
                    {budget_chapters[chapter_key].text}
                  </span>
                </div>
                <div className="filter-table__icon-count">
                  <span className="filter-table__count">
                    {count} <br/> { text_maker("budget_measures_short") }
                  </span>
                </div>
              </button>
            )
            .value()
        }
      </div>
    );
  }
}