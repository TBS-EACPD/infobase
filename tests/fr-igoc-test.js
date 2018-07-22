import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-fra.html#igoc`;  // specify the start page


const igoc_sel = "#app-focus-root > div > div > div.medium_panel_text > " +
  "div > span > p ";

//then create a test and place your code there
test('(French) app boots and loads igoc page data', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(igoc_sel).innerText).contains("dresse");
});