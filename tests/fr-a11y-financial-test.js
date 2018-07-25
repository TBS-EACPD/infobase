import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French A11y test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-basic-fra.html#orgs/gov/gov/infograph/financial`;  // specify the start page



const budget_fund_desc = "#app-focus-root > div > div > div > div > #budget_measures_panel > section.panel.panel-info.mrgn-bttm-md > div.panel-body > div > div.frow > div.fcol-md-12.fcol-xs-12.medium_panel_text.text > span > p";

//then create a test and place your code there
test('French A11Y app finance page boots up', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(budget_fund_desc).innerText).contains("Présenté");
});