import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `A11y test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-basic-eng.html#orgs/gov/gov/infograph/financial`;  // specify the start page



const financial_link_sel = "#app-focus-root > div > div > div > div > #budget_measures_panel > section.panel.panel-info.mrgn-bttm-md > div.panel-body > div > div.frow > div.fcol-md-12.fcol-xs-12.medium_panel_text.text > span > p";

//then create a test and place your code there
test('A11Y app finance page boots up', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(financial_link_sel).innerText).contains("Presented");
});