import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-fra.html#explore-dept`;  // specify the start page



const explore_desc_sel = "#app-focus-root > div > div > div >" +
  "div > div.common_content.mrgn-bttm-md > div.row > div.col-sm-12.col-md-12 > div.explore_description ";

//then create a test and place your code there
test('(French) app boots and loads explore dept page data', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(explore_desc_sel).innerText).contains("perspectives");
});