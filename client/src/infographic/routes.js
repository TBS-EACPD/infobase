var infograph_href_template = (subj, data_area, useRouterFormat) => {
  const str = `#orgs/${subj.level}/${subj.id}/infograph/${data_area ? data_area : ''}`;
  if(useRouterFormat){
    return str.replace("#","/");
  }
  return str;
};

export { infograph_href_template };


