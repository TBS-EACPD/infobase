import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-fra.html#budget-measures/budget-measure`;  // specify the start page


const budget_desc_sel = "#app-focus-root > div > div > div.budget-measures > " +
  "div > span > p";

//then create a test and place your code there
test('(French) app boots and loads budget tracker page', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(budget_desc_sel).innerText).contains("Présenté");
});