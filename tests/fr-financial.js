import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-fra.html#orgs/gov/gov/infograph/financial`;  // specify the start page


const financial_funding_sel = "#app-focus-root > div > div > div > div > #budget_measures_panel > section.panel.panel-info.mrgn-bttm-md > " +
  "div.panel-body > div > div.frow > div.fcol-md-12.fcol-xs-12.medium_panel_text.text > span > p";

//then create a test and place your code there
test('(French) app boots and loads financial page data', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(financial_funding_sel).innerText).contains("mesures");
});