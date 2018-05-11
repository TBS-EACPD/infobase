const static_url = CDN_URL;

//no URL should start with "./" or "/"
export const get_static_url =  url => {
  return `${static_url}/${url}`
}

export const make_request = url => fetch(
  url, {
    method: 'GET',  
    mode: "cors",
  })
  .then( resp=> resp.text() )
