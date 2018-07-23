import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-fra.html#orgs/gov/gov/infograph/related`;  // specify the start page


const related_desc_sel = "#app-focus-root > div > div > div > div >" +
  "#gov_related_info > section.panel.panel-info.mrgn-bttm-md > div.panel-body > div.medium_panel_text > span > p";

//then create a test and place your code there
test('(French) app boots and loads related page', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(related_desc_sel).innerText).contains("L'InfoBase");
});