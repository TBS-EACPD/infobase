import * as text_maker from '../models/text.js';

const alerts = {
  dnd: {
    priority: 4,
    css_class: "alert-danger",
    color: '#f3e9e8',
    get_text: ()=> text_maker("conf"),
  },
  not_public: {
    priority: 3,
    css_class: "alert-warning",
    color: '#f9f4d4',
    get_text: ()=> text_maker("not_public"),
  },
  //this one wasn't being used, what is it for anyway?
  /*sensitive: {
    priority: 2,
    css : "alert alert-sensitive",
    text : text_maker("sensitive")
  },*/ 
}

const alert_key = key => alerts[key];
export default alert_key;
