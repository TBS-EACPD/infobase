require("./about.ib.yaml");
require('./about.scss');

const ROUTER = require('../core/router.js');
const {text_maker} = require('../models/text');

const { reactAdapter } = require('../core/reactAdapter.js');
const { TextMaker }  = require('../util_components.js');

const About = () => (
  <div className="medium_panel_text about-root">
    <TextMaker el="div" text_key="about_body_text" />
  </div>
);


ROUTER.add_container_route("about", "_about",function(container){
  this.add_crumbs([{html: text_maker("about_title")}]);
  this.add_title("about_title");
   
  reactAdapter.render( <About />, container );
  
});