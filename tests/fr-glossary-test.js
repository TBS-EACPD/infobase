import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-fra.html#glossary`;  // specify the start page


const glossary_activity_sel = "#app-focus-root > div > div > h1 > span";

//then create a test and place your code there
test('(French) app boots and loads glossary page data', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(glossary_activity_sel).innerText).contains("Glossaire");
});