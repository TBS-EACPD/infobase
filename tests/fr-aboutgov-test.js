import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-fra.html#orgs/gov/gov/infograph/intro`;  // specify the start page


const about_gov_sel = "#app-focus-root > div > div > div > div > #simplographic > section.panel.panel-info.mrgn-bttm-md > " +
  "div.panel-body > div.medium_panel_text > div.grid-row.canada-intro-grid > section.lg-grid-panel70 > p > p";
  
//then create a test and place your code there
test('(French) app boots and loads about gov page data', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(about_gov_sel).innerText).contains("gouvernement");
});