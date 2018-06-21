import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-fra.html#start`;  // specify the start page


const financial_link_sel = "#app-focus-root > div > div > div.outer-container-escape-hatch > " +
  "div.inner-container-escape-hatch > div.home-root > div.intro-box > div.container > h2 > span";

//then create a test and place your code there
test('(French) app boots and loads home page', async t => {
  const target_selector = await Selector(financial_link_sel);
  await t
    // First assure target exists, just testing innerText seems faulty in container when element doesn't exist. Give it a long timeout for when CI runs slow
    .expect(target_selector.exists).ok({timeout: 100000})
    // Use the assertion to check if the actual target text is equal to the expected one
    .expect(target_selector.innerText).contains("Traduit");
});