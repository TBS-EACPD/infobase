interface TextBundle {
  [key: string]: {
    transform?:
      | ["handlebars"]
      | ["markdown"]
      | ["handlebars", "markdown"]
      | ["handlebars", "embeded-markdown", "markdown"]; // TODO embeded-markdown transform is legacy, hacky. Remove at some point
  };
  [(key in "en") | "fr" | "text"]: string;
}
declare module "*.yaml" {
  let val: TextBundle;
  export default val;
}
declare module "*.csv" {
  let val: string;
  export default val;
}
declare module "*.svg" {
  let val: string;
  export default val;
}
