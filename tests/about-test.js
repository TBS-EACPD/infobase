import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `Main app tests`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-eng.html#about`;  // specify the start page


const about_desc_sel = "#app-focus-root > div > div > div.medium_panel_text.about-root > " +
  "div > p ";

//then create a test and place your code there
test('App boots and loads about page', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(about_desc_sel).innerText).contains("interactive");
});