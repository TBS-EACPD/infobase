import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `Main app tests`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-eng.html#orgs/gov/gov/infograph/people`;  // specify the start page


const people_desc_sel = "#app-focus-root > div > div > div > div >" +
  "#employee_totals > section.panel.panel-info.mrgn-bttm-md > div.panel-body > div.frow.middle-xs > div.fcol-xs-12.fcol-md-4.medium_panel_text > span > p";

//then create a test and place your code there
test('App boots and loads people page data', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(people_desc_sel).innerText).contains("average");
});