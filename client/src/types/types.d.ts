interface TextBundle {
  [key: string]: Object;
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
