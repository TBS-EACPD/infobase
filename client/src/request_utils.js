const static_url = window.cdn_url;

//no URL should start with "./" or "/"
export const get_static_url = (url, version_query) => {
  const query_string = version_query || window.sha;

  return `${static_url}/${url}?v=${query_string}`;
};

export const make_request = url => fetch(
  url, {
    method: 'GET',  
    mode: "cors",
  })
  .then( resp=> resp.text() );
