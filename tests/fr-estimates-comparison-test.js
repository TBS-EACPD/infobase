import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-fra.html#compare_estimates`;  // specify the start page



const estimates_desc_sel = "#app-focus-root > div > div > div >" +
  "div.medium_panel_text.mrgn-tp-lg > span > p ";

//then create a test and place your code there
test('(French) app boots and loads estimates comparisons page data', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(estimates_desc_sel).innerText).contains("Comparaison");
});
