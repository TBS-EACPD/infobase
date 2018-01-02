module.exports = exports = {
  infograph_route_str :  "orgs/:subject_type:/:subject_id:/infograph/:data_area:",

  infograph_href_template : (subj, data_area) => `#orgs/${subj.level}/${subj.id}/infograph/${data_area ? data_area : ''}`,
}

