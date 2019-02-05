export default function({models}){
  const { SubjectSearch }  = models;

  //should the population implementation be moved here?
  SubjectSearch.init();

}