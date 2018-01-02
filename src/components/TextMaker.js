const {
  text_maker,
  run_template,
} = require('../models/text.js');

// I think eslint is wrong here
/* disable-eslint react/jsx-no-danger-children */
const TextMaker = ({text_key, el, args, template_str}) => React.createElement(
  el || 'span',
  { 
    dangerouslySetInnerHTML:{__html: text_key ? text_maker(text_key,args) : run_template(template_str, args) },
  }
);

//shorthand for the above
const TM = ({k, el, args, template_str}) => <TextMaker text_key={k} el={el} args={args} template_str={template_str} />;

module.exports = exports = {
  TextMaker,
  TM,
}