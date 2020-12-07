import Handlebars from "handlebars";

const StaticHandlebar = new (class StaticHandlebar {
  constructor() {
    this.handlebar = Handlebars.create();
  }
  static register_helper(helper_name, fn) {
    this.handlebar.registerHelper(helper_name, fn);
  }
})();
export { StaticHandlebar };
