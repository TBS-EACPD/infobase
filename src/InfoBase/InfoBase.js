const { populate_stores } = require('../models/populate_stores.js');

const ROUTER = require("../core/router.js");
const { Table } = require('../core/TableClass.js');
const WebFont = require('webfontloader');

require("../tables/table_common");

const table_defs = [
  require("../tables/table1/table1"),
  require("../tables/table2/table2"),
  require("../tables/table4/table4"),
  require("../tables/table5/table5"),
  require("../tables/table6/table6"),
  require("../tables/table7/table7"),
  require("../tables/table8/table8"),
  require("../tables/table9/table9"),
  require("../tables/table10/table10"),
  require("../tables/table11/table11"),
  require("../tables/table12/table12"),
  //require("../tables/table111/table111"),
  //require("../tables/table112/table112"),
  require('../tables/table300/table300.js'), //prog_by_vote/stat
  //require('../tables/table302/table302'),
  //require('../tables/table303/table303'),
  //require('../tables/table304/table304'),
  require('../tables/table305/table305.js'), //prog_by_sobj
];

require('../home/home.js');
require("../igoc_explorer/igoc_explorer.js");
require("../dept_explore/dept_explore");
require("../rpb/index.js");
require("../glossary/glossary");
require("../metadata/metadata.js");
require("../about/about.js");
require("../infographic/infographic");

require('../gen_expl/gen_expl.js');
require('../program_explorer/resource-explorer.js');
require('../program_explorer2/pe2.js');

require("../graph_route/graph_route.js");
require("../footnote_inventory/footnote_inventory.js");


module.exports = exports = function start({spinner, app_el}){
  
  WebFont.load({
    google: {
      families: ["Roboto:300,300i,400,400i,700,700i"],
    },
  });

  populate_stores().then(()=>{
    _.each(table_defs, table_def => Table.create_and_register(table_def));

    ROUTER.start();

    spinner.stop();
    d4.select(app_el).attr('aria-busy', false);

  });

}

