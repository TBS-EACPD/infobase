import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `A11y test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-basic-eng.html#orgs/gov/gov/infograph/intro`;  // specify the start page


const aboutgov_desc_sel = "#app-focus-root > div > div > div > div > " +
 "#simplographic > section.panel.panel-info.mrgn-bttm-md > div.panel-body > div.medium_panel_text > div.grid-row.canada-intro-grid > section.lg-grid-panel70 > header.h2.mrgn-tp-sm > span" ;

//then create a test and place your code there
test('A11Y app about gov page boots up', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(aboutgov_desc_sel).innerText).contains("How much we spend");
});