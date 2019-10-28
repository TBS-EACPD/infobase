import { declare_result_info_panel } from '../../panels/result_graphs/result_info.js/index.js';
  
export const get_tag_panels = subject => ({
  results: [
    declare_result_info_panel(),
  ],
});