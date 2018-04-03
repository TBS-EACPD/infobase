const { get_static_url } = require('../core/static_url');
const { run_template } = require('./text.js');
const Subject = require('./subject.js');

const FootNote = require('./footnotes.js');
const { fetch_and_inflate } =require('../core/utils.js');

let _loaded_dept_or_tag_codes = {};

function populate_footnotes_info(csv_str){
  const rows = _.map(
    d3.csvParse(_.trim(csv_str)), 
    row => _.mapValues(row, item => _.trim(item) )
  );

  _.each(rows, obj => {

    const {
      id,
      subject_class,
      subject_id,
      fyear1,
      fyear2,
      topic_keys,
      footnote,
    } = obj;

    const glossary_keys = topic_keys.split(",").map(key=> key.replace(" ",""));
    
    const year1 = fyear1.split("-")[0];
    const year2 = fyear2.split("-")[0];

    const text = marked(
      run_template(footnote),
      { sanitize: false,  gfm: true }
    );

    if (subject_id !== '*'){
      
      const subject = Subject[subject_class].lookup(subject_id);
      FootNote.create_and_register({
        id: obj.id,
        subject,
        year1,
        year2,
        glossary_keys,
        text,
      }); 
    } else {

      const actual_subject_class = Subject[obj.level_name];
      FootNote.create_and_register({
        id,
        subject_class: actual_subject_class,
        year1,
        year2,
        glossary_keys,
        text,
      });
    }
  });
}

function load_footnotes_bundle(subject){

  let subject_code;
  if(subject){
    switch(subject.level){
      case 'gov':
        return $.Deferred().resolve();
      case 'dept':
        subject_code = subject.acronym;
        break;
      case 'program':
        subject_code = subject.dept.acronym;
        break;
      case 'crso':
        subject_code = subject.dept.acronym;
        break;
      case 'tag':
        subject_code = subject.id;
        break;
      default:
        subject_code = 'all';
        break;
    }
  } else {
    subject_code = 'all';
  }

  if(_loaded_dept_or_tag_codes[subject_code] || _loaded_dept_or_tag_codes['all']){
    return $.Deferred().resolve();
  }

  return (
    window.binary_download && !window.isIE() ? 
    fetch_and_inflate(get_static_url(`footnotes/fn_${lang}_${subject_code}_min.html`)) :
    $.ajax({url : 
      get_static_url(`footnotes/fn_${lang}_${subject_code}.html`),
    })
  ).then( csv_str => {

    populate_footnotes_info(csv_str);
    _loaded_dept_or_tag_codes[subject_code] = true;
  });

}

//this is exposed so populate stores can take the 'global' class-level footnotes that will be used by every infograph.
function populate_global_footnotes(csv_str){
  populate_footnotes_info(csv_str); 
}

module.exports = {
  load_footnotes_bundle,
  populate_global_footnotes,
};