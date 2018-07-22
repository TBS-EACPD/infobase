import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `Main app tests`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-eng.html#orgs/gov/gov/infograph/results`;  // specify the start page


const results_desc_sel = "#app-focus-root > div > div > div > div > #gov_dp > " +
  "section.panel.panel-info.mrgn-bttm-md.panel-overflow > div.panel-body > div.frow.middle-xs > div.fcol-md-7.medium_panel_text > span > p";

//then create a test and place your code there
test('App boots and loads results page data', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(results_desc_sel).innerText).contains("migrated");
});