export function hashless_infograph_link(level,id){
  return `/infographic/${level}/${id}`;
}

export function infograph_link_with_hash(level,id){
  return `#${hashless_infograph_link(level,id)}`;
}