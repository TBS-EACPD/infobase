const static_url = CDN_URL;

//no URL should start with "./" or "/"
export const get_static_url =  url => {
  return `${static_url}/${url}`
}

