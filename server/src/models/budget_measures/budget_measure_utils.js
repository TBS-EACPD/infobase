import _ from "lodash";

const make_budget_link = (budget_measure, context) => {
  const lang = context.lang;

  const chapter_key = budget_measure.chapter_key;
  const ref_id = budget_measure[`ref_id_${lang}`];

  const valid_chapter_keys_to_page_number = {
    grw: "01",
    prg: "02",
    rec: "03",
    adv: "04",
    oth: "",
  };

  const is_chapter_key_valid = _.has(valid_chapter_keys_to_page_number, chapter_key);
  const is_ref_id_valid = !_.isUndefined(ref_id) && !_.isEmpty(ref_id);

  if (!is_chapter_key_valid){
    return `https://www.budget.gc.ca/2018/home-accueil-${lang}.html`;
  } else if (chapter_key === "oth"){
    return {
      en: "https://www.budget.gc.ca/2018/docs/plan/anx-02-en.html#23-Other-Budget-2018-Measures-(Not-Included-in-Previous-Chapters)",
      fr: "https://www.budget.gc.ca/2018/docs/plan/anx-02-fr.html#23-Autres-mesures-prevues-dans-le-budget-de-2018-(non-incluses-dans-les-chapitres-anterieurs)",
    }[lang];
  } else {
    const base_chapter_link = `https://www.budget.gc.ca/2018/docs/plan/chap-${valid_chapter_keys_to_page_number[chapter_key]}-${lang}.html`;

    if (is_ref_id_valid){
      return `${base_chapter_link}#${ref_id}`;
    } else {
      return base_chapter_link;
    }
  }
}

export {
  make_budget_link,
}