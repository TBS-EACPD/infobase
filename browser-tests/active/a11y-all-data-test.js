import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `A11y test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-basic-eng.html#orgs/gov/gov/infograph/all_data`;  // specify the start page


const all_data_desc_sel = "#app-focus-root > div > div > div > div > " +
  "#links_to_rpb > section.panel.panel-info.mrgn-bttm-md > div.panel-body > div.medium_panel_text > span > p" ;
 
//then create a test and place your code there
test('A11Y app all data page boots up', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(all_data_desc_sel).innerText).contains("Select from");
});