const make_budget_link = (chapter_key, ref_id) => {
  const valid_chapter_keys_to_page_number = {
    grw: "01",
    prg: "02",
    rec: "03",
    adv: "04",
  };

  const is_chapter_key_valid = _.has(valid_chapter_keys_to_page_number, chapter_key);
  const is_ref_id_valid = !_.isUndefined(ref_id) && !_.isEmpty(ref_id);

  if (!is_chapter_key_valid){
    return `https://www.budget.gc.ca/2018/home-accueil-${window.lang}.html`;
  } else {
    const base_chapter_link = `https://www.budget.gc.ca/2018/docs/plan/chap-${valid_chapter_keys_to_page_number[chapter_key]}-${window.lang}.html`;

    if (is_ref_id_valid){
      return base_chapter_link + "#" + ref_id;
    } else {
      return base_chapter_link;
    }
  }
}

export {
  make_budget_link,
}