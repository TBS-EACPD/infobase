import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-fra.html#start`;  // specify the start page



const financial_link_sel = "#app-focus-root > div > div > div > div > div.intro-box > div.equal-height-row.equal-height-row--home-row > div:nth-child(1) > div > a > div > div > div.h-img-card__text"

//then create a test and place your code there
test('(French) app boots and loads home page data', async t => {
  const target_selector = Selector(financial_link_sel);
  await t
    // First assure target exists, just testing innerText seems faulty in container when element doesn't exist
    .expect(target_selector.exists).ok()
    // Use the assertion to check if the actual target text is equal to the expected one
    .expect(target_selector.innerText).contains("246,0 milliards");
});