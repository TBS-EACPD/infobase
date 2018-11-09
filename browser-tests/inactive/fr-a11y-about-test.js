import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French A11y test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-basic-fra.html#about`;  // specify the start page


const aboutus_desc_sel = "#app-focus-root > div > div > " +
"div.medium_panel_text.about-root > div > p" ;

//then create a test and place your code there
test('French A11Y app About us page boots up', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(aboutus_desc_sel).innerText).contains("L’InfoBase du GC");
});