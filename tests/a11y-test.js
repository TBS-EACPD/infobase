import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `A11y test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-basic-eng.html#start`;  // specify the start page



const financial_link_sel = "#app-focus-root > div > div > section:nth-child(2) > ul > li:nth-child(1) > a";

//then create a test and place your code there
test('A11Y app boots up', async t => {
  const target_selector = await Selector(financial_link_sel);
  await t
    // First assure target exists, just testing innerText seems faulty in container when element doesn't exist
    .expect(target_selector.exists).ok()
    // Use the assertion to check if the actual target text is equal to the expected one
    .expect(target_selector.innerText).contains("Learn about government finances");
});