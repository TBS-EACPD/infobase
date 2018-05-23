const JSURL = require('jsurl');
const base_url = "#rpb/";
const rpb_link = (naive_state, useRouterFormat) => _.chain(naive_state)
  .pipe(obj => {
    const { table, subject, columns } = obj;

    return {...obj, 
      table: ( 
        table && table.is_table ?
        table.id  :
        table
      ),
      subject: (
        subject && subject.level  ?
        subject.guid : 
        subject
      ),
      columns: (
        _.first(columns) && _.first(columns).nick ? 
        _.map(columns, 'nick') :
        columns
      ),
    };
  })
  .pick([
    'columns',
    'subject',
    'mode',
    'dimension',
    'table',
    'preferDeptBreakout',
    'preferTable',
    'sorting_column',
    'descending',
    'filter',
  ])
  //.pipe(obj => JSON.stringify(obj))
  //.pipe( str => encodeURIComponent(str) )
  .pipe(obj => JSURL.stringify(obj))
  .pipe( str => base_url+str )
  .pipe(str => useRouterFormat ? str.replace("#","/") : str )
  .value();

exports = module.exports = { rpb_link };
