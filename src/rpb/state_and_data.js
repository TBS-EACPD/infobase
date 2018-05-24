const { text_maker, run_template } = require('../models/text.js');

const { createSelector } = require('reselect');

//data
const Subject = require('../models/subject.js');
const {
  Gov,
  Program,
  Dept,
} = Subject;
const { Table } = require('../core/TableClass.js');
const Footnote = require('../models/footnotes.js');



const initial_state = {
  table_picking: true,
  preferDeptBreakout: true,
  preferTable: false,
  mode: 'simple',
  subject: 'gov_gov',
};

function naive_to_real_state(naive_state){
  const {
    preferTable,

    table,
  } = naive_state;

  return {//default state
    subject: 'gov_gov',
    preferDeptBreakout: true,
    preferTable: preferTable,
    mode: 'simple',
    ...( //tables imply their own default state
      table ? 
      get_default_state_for_new_table(naive_state.table) : 
      {} 
    ),
    ...naive_state, //whatever state is already defined takes precedence.
  };

}

function get_all_data_columns_for_table(table){
  return _.chain(table.unique_headers)
    .map( nick => table.col_from_nick(nick) )
    .filter(col => !col.hidden && !col.key && col.not_for_display !== true)
    .value();
}

function get_default_cols_for_table(table){
  return _.filter(get_all_data_columns_for_table(table), 'simple_default');
}

function get_key_columns_for_table(table){ 
  return _.chain(table.unique_headers)
    .map(nick => table.col_from_nick(nick))
    .filter(col => (col.key && !col.hidden) || col.nick === 'dept')
    .value();
}

function get_default_dimension_for_table(table){
  return table.dimensions[0].title_key;
}

//Note that this will cause a memory leak as this closure will never get GC'd
const get_filters_for_dim = _.memoize(
  (table, dim_key)=> [
    text_maker('all'),
    ..._.keys(table[dim_key]('*',true)),
  ], 
  (table,dim_key)=> `${table.id}-${dim_key}`
)

//returns a the proposed new slice of state that will change when a new table is selected
function get_default_state_for_new_table(table_id){
  const table = Table.lookup(table_id);
  const columns = _.map(get_default_cols_for_table(table), 'nick');
  return {
    table: table_id,
    columns,
    dimension: get_default_dimension_for_table(table),
    filter: text_maker('all'),
    page_num: 0,
    sort_col: 'dept',
    descending: false, 
  };
}

const reducer = (state=initial_state, action) => {

  const { type, payload } = action;

  switch(type){

    case 'navigate_to_new_state': {
      const new_state = payload;
      return new_state;
    }

    case 'header_click': {
      const col_nick = payload;
      if(state.sort_col  === col_nick){
        return {...state, descending: !state.descending };
      } else {
        return {...state,
          sort_col: col_nick,
          descending: true, 
          page_num: 0,
        };
      }

    }

    case 'toggle_col_nick': {
      const col_nick = payload;
      if(state.columns.length < 2 && _.includes(state.columns, col_nick ) ){ 
        return state; 
      }
      return {...state,
        columns: _.toggle_list(state.columns, col_nick),
        page_num: 0,
      };

    }

    case 'switch_table': {
      const table_id = payload;
      return {...state, ...get_default_state_for_new_table(table_id)};
    }

    case 'set_filter': {
      const { dimension, filter} = payload;
      return {...state,
        dimension,
        filter,
        page_num: 0,
      };
    }

    case 'set_dimension': {
      return {...state,
        dimension: payload,
        filter: text_maker('all'),
        page_num: 0,
      };

    }

    case 'set_subject': {
      const { guid } = payload;
      return {...state,
        subject: guid,
        filter: text_maker('all'),
        page_num: 0,
      };
    }

    case 'toggle_deptBreakout': {
      return {...state,
        preferDeptBreakout: !state.preferDeptBreakout,
        filter: text_maker('all'),
        page_num: 0,
      };
    }

    case 'toggle_preferTable': {
      return {...state,
        preferTable: !state.preferTable,
        page_num: 0,
      };
    }

    case 'switch_mode': {
      return {...state,
        mode: payload,
        page_num: 0,
      };

    }

    case 'set_page': {
      return {...state,
        page_num: payload,
      };

    }

    default: 
      return state;

  }

}




function create_mapStateToProps(){

  const get_table = createSelector(_.property('table'), table => Table.lookup(table));
  
  const get_subject = createSelector(_.property('subject'), guid => Subject.get_by_guid(guid) );

  const get_all_data_columns = createSelector(
    get_table, 
    get_all_data_columns_for_table
  );

  const get_sorted_columns = createSelector(
    [ get_table, _.property('columns') ],
    (table, col_nicks) => _.filter(get_all_data_columns_for_table(table), ({nick}) => _.includes(col_nicks, nick))
  );

  const get_sorted_key_columns = createSelector(
    get_table, 
    get_key_columns_for_table
  );

  const get_def_ready_cols = createSelector(get_sorted_columns, sorted_data_columns => (
    _.chain(sorted_data_columns)
      .map(col => ({
        name: col.fully_qualified_name,
        def: run_template(col.description[window.lang]),
      }))
      .value()
  ));



 

  //array of html footnotes
  const get_footnotes = createSelector([get_table, get_subject], (table, subject)=> {
    const topics = table.tags.concat(["MACHINERY"]);
    const gov_footnotes = Footnote.get_for_subject( Subject.Gov, topics);
    const subject_footnotes = Footnote.get_for_subject( subject, topics);

    return _.chain(gov_footnotes)
      .concat(subject_footnotes)
      .map('text')
      .uniqBy()
      .compact()
      .concat([ text_maker('different_org_names_rpb_footnote') ])
      .value();

  });

  const get_dimensions = createSelector(get_table, table=> (
    _.chain(table.dimensions)
      .reject('exclude_from_rpb')
      .map(({title_key}) => ({
        id: title_key, 
        display: text_maker(title_key), 
      }))
      .value()
  ));

  const get_all_filters =  createSelector(
    [get_table, _.property('dimension')],
    (table, dim_key) => get_filters_for_dim(table, dim_key)
  );

  const get_filters_by_dimension = createSelector(
    [ get_table, get_dimensions],
    (table, dimensions) => (
      _.map(dimensions, ({id: dim_key, display}) => ({
        display,
        id: dim_key,
        children: _.map(
          get_filters_for_dim(table,dim_key),
          filt => ({
            id: dim_key+'__'+filt,
            display: filt,
          })
        ),
      }) 
      )
    )
  );

  const get_table_data = createSelector(get_table, table => {
    table.fill_dimension_columns();
    return table.data;
  });
  

  const get_subject_filter_func = createSelector(
    [get_table, get_subject], (table, subject) => {

      let subj_filter = _.constant(true);
      if(subject.level === 'dept'){
        subj_filter = { dept : subject.id }

      } else if(subject.level === 'program' && table.programs){
        subj_filter = { 
          dept: subject.dept.id , 
          activity_code : subject.activity_code, 
        };

      } else if( subject.level  === 'tag' && table.programs){
        const prog_ids = _.map(subject.programs, 'id');
        subj_filter = row => _.includes(prog_ids, Program.unique_id(row.dept, row.activity_code) );

      }
      return subj_filter;
    });


  const get_cat_filter_func = createSelector(
    [_.property('dimension'), _.property('filter') ],
    (dim_key, filter_val) => (
      filter_val === text_maker('all') ? 
      _.constant(true) : 
      { [ dim_key ] : filter_val }
    )
  );


  const get_zero_filter_func = createSelector(
    [_.property('columns')],
    col_nicks => (
      row =>  _.chain(col_nicks)
        .map(nick => row[nick])
        .compact()
        .isEmpty()
        .value()
    )
  );

  const get_canGraph = createSelector(
    [get_table, get_subject, get_sorted_columns, _.property('preferDeptBreakout'), _.property('filter') ],
    (table, subject, columns, preferDeptBreakout, filter ) => {
      if(columns.length > 1){ 
        return false; 
      } else {
        // the only case we can't graph a single column is when we're trying to 
        //  show a dept breakout with no filters on a non-linearly lined column 
        //(e.g. lapse % column)
        const col = _.first(columns);
        return !(
          preferDeptBreakout && 
          subject === Gov && 
          filter === text_maker('all') && 
          ( !col.formula || !col.formula.default )
        );
      }
    }
  );

  const get_shouldGraph = state => !window.is_a11y_mode && !state.preferTable && get_canGraph(state);

  const get_deptBreakoutMode = state => state.subject === 'gov_gov' && state.preferDeptBreakout;

  const reverse_array = arr => _.clone(arr).reverse();

  const get_flat_data = createSelector(
    [ get_table_data, get_subject_filter_func, get_cat_filter_func, get_zero_filter_func, _.property('sort_col') , _.property('descending') ],
    ( table_data, subject_filter_func, cat_filter_func, zero_filter_func, sort_col, descending ) => (
      _.chain(table_data)
        .filter(subject_filter_func)
        .filter(cat_filter_func)
        .reject(zero_filter_func)
        .sortBy( 
        sort_col === 'dept' ? 
        row => Dept.lookup(row.dept).name : 
        sort_col
        )
        .pipe(
        descending ? 
        reverse_array :  
        _.identity 
        )
        .value()

    )
  );

  const get_graph_split_data = createSelector(
    [ get_flat_data, get_subject, get_table, get_sorted_columns, _.property('dimension'), _.property('filter'), get_all_filters, get_deptBreakoutMode ],
    ( flat_data, subject, table, columns, dimension, filter, filters_for_dim, deptBreakoutMode ) => {
  
      if(_.isEmpty(flat_data) || columns.length > 1){ 
        return null; 
      }
      const [ col ]  = columns;

      if(deptBreakoutMode){
        let artificial_filter; 

        if(filters_for_dim.length > 8){

          const top_5_filters = _.chain(flat_data)
            .groupBy(dimension)
            .map((rows , filt_val) => ({
              filt: filt_val,
              total: col.formula(rows),
            }))
            .sortBy('total')
            .reverse()
            .take(5)
            .map('filt')
            .value();

          artificial_filter = filt_val => (
            _.includes(top_5_filters, filt_val) ?
            filt_val :
            text_maker('other')
          )

        } else { 
          artificial_filter = _.identity;
        }

        
        return _.chain(flat_data)
          .groupBy('dept')
          .map( (dept_rows, dept_id) => ({ dept_id, dept_rows }) )
          .sortBy( ({dept_rows}) => col.formula(dept_rows) )
          .reverse()
          .map( ({dept_rows, dept_id}) => ({
            key: dept_id,
            label: Dept.lookup(dept_id).name,
            subject: Dept.lookup(dept_id),
            data : (
              _.chain(dept_rows)
                .groupBy(row => artificial_filter(row[dimension]) )
                .map( (filt_rows, filt_val)=> ({
                  label: filt_val,
                  data : col.formula(filt_rows),
                }))
                .sortBy('data')
                .reverse()
                .value()
            ),
          }))
          .value();

      } else {

        return _.chain(flat_data)
          .groupBy(dimension)
          .map( (rows, filt_val)=> ({
            label: filt_val,
            key: filt_val,
            data:  [{ data: col.formula(rows), label: filt_val}],
          }))
          .sortBy( ({data})=> _.first(data) || 0 )
          .value();

      }

    }
  );

  const get_simple_table_rows = createSelector(
    [get_flat_data, get_sorted_columns, get_deptBreakoutMode, _.property('filter'), _.property('dimension'), _.property('sort_col'), _.property('descending') ],
    (flat_data, columns,deptBreakoutMode, filter, dimension, sort_col, descending) => {
      
      const rows = (
        deptBreakoutMode ?
        (
          _.chain(flat_data)
            .groupBy('dept')
            .map( (rows, dept) => _.fromPairs([
              ['dept' , dept], 
              ..._.map( columns, col => (
                [ col.nick , col.formula(rows) ]
              )), 
            ]))
            .sortBy(
              sort_col === 'dept' ? 
              row => Dept.lookup(row.dept).name : 
              sort_col
            )
            .pipe( descending ? reverse_array : _.identity )
            .value()  
        ) : 
        (
         _.chain(flat_data)
           .groupBy(dimension)
           .map( (rows, filter ) => _.fromPairs([
             [ dimension, filter ],
             ..._.map( columns, col => (
               [ col.nick , col.formula(rows) ]
             )),
           ]))
           .sortBy(sort_col)
           .pipe( descending ? reverse_array : _.identity )
           .value()
        )
      );

      
      const total_row = _.chain(columns)
        .map( col => [ col.nick, col.formula(flat_data) ] )
        //.concat([ deptBreakoutMode ? 'dept' : dimension, text_maker('all') ])
        .fromPairs()
        .value();

      
    
      return {
        rows,
        total_row,
      }; 

    }
  );
  
  return state => {
    return {...state,
      table: state.table && get_table(state),
      subject: state.subject && get_subject(state),
      columns: !_.isEmpty(state.columns) && get_sorted_columns(state),
      dimensions: state.table && get_dimensions(state),
      filters: state.table && get_all_filters(state),
      footnotes: state.table && get_footnotes(state),
      def_ready_columns: !_.isEmpty(state.columns) && get_def_ready_cols(state),
      all_data_columns: !_.isEmpty(state.columns) && get_all_data_columns(state),
      flat_data : state.table && get_flat_data(state),

      //simple view props,
      deptBreakoutMode: get_deptBreakoutMode(state),
      canGraph: !window.is_a11y_mode && state.table && get_canGraph(state),
      shouldGraph: state.table && get_shouldGraph(state),
      graph_data: state.table && state.mode === 'simple' && get_graph_split_data(state),
      simple_table_rows: state.table && state.mode === 'simple' && get_simple_table_rows(state),


      //granular props
      filters_by_dimension: state.table && state.mode === 'details' && get_filters_by_dimension(state),
      sorted_key_columns: !_.isEmpty(state.columns) && get_sorted_key_columns(state),

    };



  }
}

function mapDispatchToProps(dispatch){
  return {
    on_switch_mode: mode => dispatch({type: 'switch_mode', payload: mode}),
    on_set_subject: subj => dispatch({type: 'set_subject', payload: subj}),
    on_set_dimension: dim_key => dispatch({type: 'set_dimension', payload: dim_key}),
    on_set_filter: ({ dimension, filter }) => dispatch({ type: 'set_filter', payload: { dimension, filter} }),
    on_switch_table: table_id => dispatch({ type: 'switch_table', payload: table_id }),
    on_header_click: col_nick => dispatch({type: 'header_click', payload: col_nick }),
    on_toggle_col_nick: col_nick => dispatch({type: 'toggle_col_nick', payload: col_nick }),
    on_toggle_deptBreakout: ()=> dispatch({type: 'toggle_deptBreakout'}),
    on_toggle_preferTable: ()=> dispatch({type: 'toggle_preferTable'}),
    on_set_page: num => dispatch({type: 'set_page', payload: num }),
  };
}

module.exports = exports = {
  reducer,
  mapDispatchToProps,
  create_mapStateToProps,
  naive_to_real_state,
}; 
