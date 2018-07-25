import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `A11y test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-basic-eng.html#rpb/`;  // specify the start page


const rpb_desc_sel = "#app-focus-root > div > div > " +
"div > div.labeled-box > div.labeled-box-label > div.labeled-box-label-text > span" ;

//then create a test and place your code there
test('A11Y app rpb page boots up', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(rpb_desc_sel).innerText).contains("Select");
});