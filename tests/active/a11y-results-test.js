import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `A11y test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-basic-eng.html#orgs/gov/gov/infograph/results`;  // specify the start page


const people_header_sel = "#app-focus-root > div > div > div > div > " +
 "#gov_dp > section.panel.panel-info.mrgn-bttm-md.panel-overflow > div.panel-body > div.frow.middle-xs > div.fcol-md-7.medium_panel_text > span > p" ;

//then create a test and place your code there
test('A11Y app results page boots up', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(people_header_sel).innerText).contains("all organizations");
});