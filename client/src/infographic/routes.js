import { SafeJSURL } from '../general_utils.js';

const infograph_href_template = (subj, data_area, useRouterFormat) => {
  const str = `#orgs/${subj.level}/${subj.id}/infograph/${data_area ? data_area : 'intro'}`;
  if(useRouterFormat){
    return str.replace("#","/");
  }
  return str;
};

const panel_href_template = (subj, data_area, panel_key, useRouterFormat) => {
  const str = `#orgs/${subj.level}/${subj.id}/infograph/${data_area ? data_area : ''}/${panel_key ? SafeJSURL.stringify({panel_key: panel_key}) : ''}`;
  if(useRouterFormat){
    return str.replace("#","/");
  }
  return str;
};

export { infograph_href_template, panel_href_template };


