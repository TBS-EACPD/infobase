import text from "./services.yaml";

export default {
  text,
  is_temp: true,
  id: "services",
  source: ["PA"], // TEMP
  tags: ["AUTH"], // TEMP
  link: {
    // TEMP
    en:
      "https://open.canada.ca/data/en/dataset/a35cf382-690c-4221-a971-cf0fd189a46f",
    fr:
      "https://ouvert.canada.ca/data/fr/dataset/a35cf382-690c-4221-a971-cf0fd189a46f",
  },

  name: {
    en: "Services",
    fr: "TODO",
  },

  title: {
    en: "Services",
    fr: "TODO",
  },
  is_graphql_only: true,

  add_cols: function () {
    this.add_col({
      key: true,
      type: "short-str",
      nick: "service_type",
      header: {
        en: "Type",
        fr: "TODO",
      },
      description: {
        en: "Service type",
        fr: "TODO",
      },
    });
  },
};
