import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `Main app tests`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-eng.html#compare_estimates`;  // specify the start page



const estimates_desc_sel = "#app-focus-root > div > div > div >" +
  "div.medium_panel_text.mrgn-tp-lg > span > p ";


//then create a test and place your code there
test('App boots and loads estimates comparisons page', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(estimates_desc_sel).innerText).contains("Supplementary Estimates A");
});