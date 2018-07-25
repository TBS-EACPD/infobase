import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French A11y test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-basic-fra.html#`;  // specify the start page

const financial_link_sel = "#app-focus-root > div > div > section:nth-child(2) > ul > li:nth-child(1) > a";

//then create a test and place your code there
test('French A11Y app home page boots up', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(financial_link_sel).innerText).contains("Apprendre au sujet des finances du gouvernement");
});