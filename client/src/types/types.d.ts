interface TextBundle {
  [key: string]: {
    transform?:
      | ["handlebars"]
      | ["markdown"]
      | ["handlebars", "markdown"]
      | ["handlebars", "embeded-markdown", "markdown"]; // TODO embeded-markdown transform is legacy, hacky. Remove at some point
    [key in ("en" | "fr" | "text")]: string;
  };
}
declare module "*.yaml" {
  const content: TextBundle;
  export default content;
}
declare module "*.csv" {
  const content: string;
  export default content;
}
declare module "*.svg" {
  const content: string;
  export default content;
}
