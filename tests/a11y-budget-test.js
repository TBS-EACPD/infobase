import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `A11y test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-basic-eng.html#budget-measures/budget-measure`;  // specify the start page


const igoc_desc_sel = "#app-focus-root > div > div > " +
"div.budget-measures > div > table.table.table-striped.table-bordered > caption > span" ;

//then create a test and place your code there
test('A11Y app budget measure page boots up', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(igoc_desc_sel).innerText).contains("Budget measures");
});