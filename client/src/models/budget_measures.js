import {
  mix,
  staticStoreMixin,
  PluralSingular,
  SubjectMixin,
} from "./storeMixins.js";
import { trivial_text_maker } from "../models/text.js";

const static_subject_store = () =>
  mix().with(staticStoreMixin, PluralSingular, SubjectMixin);

const get_id_for_measure = (measure) => `${measure.year}_${measure.measure_id}`;
const BudgetMeasure = class BudgetMeasure extends static_subject_store() {
  static get budget_years() {
    return ["2018", "2019"];
  }
  static get budget_data_source_dates() {
    return {
      2018: {
        en: "March 31, 2019",
        fr: "31 mars 2019",
      }[window.lang],
      2019: {
        en: "March 31, 2020",
        fr: "31 mars 2020",
      }[window.lang],
    };
  }
  static get main_estimates_budget_links() {
    return {
      2018: {
        en:
          "https://www.canada.ca/en/treasury-board-secretariat/services/planned-government-spending/government-expenditure-plan-main-estimates/2018-19-estimates/2018-19-sources-uses-budget-implementation-vote-department.html",
        fr:
          "https://www.canada.ca/fr/secretariat-conseil-tresor/services/depenses-prevues/plan-depenses-budget-principal/2018-19-budget-depenses/2018-2019-provenance-utilisation-credit-execution-budget-ministere.html",
      }[window.lang],
      2019: {
        en:
          "https://www.canada.ca/en/treasury-board-secretariat/services/planned-government-spending/sources-uses-budget-measures-organization.html",
        fr:
          "https://www.canada.ca/fr/secretariat-conseil-tresor/services/depenses-prevues/provenance-utilisations-fonds-mesures-budget-organisation.html",
      }[window.lang],
    };
  }
  static get subject_type() {
    return "budget_measure";
  }
  static get singular() {
    return trivial_text_maker("budget_measure");
  }
  static get plural() {
    return trivial_text_maker("budget_measures");
  }
  static make_budget_link(chapter_key, ref_id) {
    const valid_chapter_keys_to_page_number = {
      grw: "01",
      prg: "02",
      rec: "03",
      adv: "04",
      oth: "",
    };

    const is_chapter_key_valid = _.has(
      valid_chapter_keys_to_page_number,
      chapter_key
    );
    const is_ref_id_valid = !_.isUndefined(ref_id) && !_.isEmpty(ref_id);

    if (!is_chapter_key_valid) {
      return `https://www.budget.gc.ca/2018/home-accueil-${window.lang}.html`;
    } else if (chapter_key === "oth") {
      return {
        en:
          "https://www.budget.gc.ca/2018/docs/plan/anx-02-en.html#23-Other-Budget-2018-Measures-(Not-Included-in-Previous-Chapters)",
        fr:
          "https://www.budget.gc.ca/2018/docs/plan/anx-02-fr.html#23-Autres-mesures-prevues-dans-le-budget-de-2018-(non-incluses-dans-les-chapitres-anterieurs)",
      }[window.lang];
    } else {
      const base_chapter_link = `https://www.budget.gc.ca/2018/docs/plan/chap-${valid_chapter_keys_to_page_number[chapter_key]}-${window.lang}.html`;

      if (is_ref_id_valid) {
        return base_chapter_link + "#" + ref_id;
      } else {
        return base_chapter_link;
      }
    }
  }
  static lookup_measure(year, measure_id) {
    return this.lookup(`${year}_${measure_id}`);
  }

  static create_and_register(measure) {
    const inst = new BudgetMeasure(measure);
    this.register(get_id_for_measure(measure), inst);
  }
  constructor(measure) {
    super();

    _.assign(this, {
      ...measure,
      id: get_id_for_measure(measure),
      orgs: _.map(measure.data, (measure_data) => measure_data.org_id),
    });
  }
};

export { BudgetMeasure };
