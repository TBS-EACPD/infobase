import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French A11y test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-basic-fra.html#glossary`;  // specify the start page


const glossary_header_sel = "#app-focus-root > div > div > h1 > span";

//then create a test and place your code there
test('French A11Y app glossary page boots up', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(glossary_header_sel).innerText).contains("Glossaire");
});