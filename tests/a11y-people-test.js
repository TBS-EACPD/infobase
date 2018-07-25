import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `A11y test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-basic-eng.html#orgs/gov/gov/infograph/people`;  // specify the start page



const people_header_sel = "#app-focus-root > div > div > div > div > #employee_totals > section.panel.panel-info.mrgn-bttm-md > header.panel-heading > header.panel-title";

//then create a test and place your code there
test('A11Y app people page boots up', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(people_header_sel).innerText).contains("Total Federal");
});