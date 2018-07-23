import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-fra.html#resource-explorer`;  // specify the start page



const resource_desc_sel = "#app-focus-root > div > div > div >" +
  "div > div > p ";

//then create a test and place your code there
test('(French) app boots and loads resource explorer page', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(resource_desc_sel).innerText).contains("naviguer");
});