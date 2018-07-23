import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `Main app tests`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-eng.html#glossary`;  // specify the start page


const glossary_activity_sel = "#app-focus-root > div > div > h1 > span";

//then create a test and place your code there
test('App boots and loads glossary page', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(glossary_activity_sel).innerText).contains("Glossary");
});