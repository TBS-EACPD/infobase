import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-fra.html#metadata`;  // specify the start page


const metadata_desc_sel = "#app-focus-root > div > div > p > " +
  "span > p";

//then create a test and place your code there
test('(French) app boots and loads metadata page', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(metadata_desc_sel).innerText).contains("périodiquement");
});