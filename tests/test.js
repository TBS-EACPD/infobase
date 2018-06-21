import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `Main app tests`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-eng.html#start`;  // specify the start page


const financial_link_sel = "#app-focus-root > div > div > div > div > div.intro-box > div.equal-height-row.equal-height-row--home-row > div:nth-child(1) > div > a > div > div > div.h-img-card__text";

//then create a test and place your code there
test('App boots and loads home page', async t => {
  await t
    // First assure target exists, just testing innerText seems faulty in container when element doesn't exist
    .expect(Selector(financial_link_sel).exists).ok()
    // Use the assertion to check if the actual target text is equal to the expected one
    .expect(Selector(financial_link_sel).innerText).contains("Transforming");
});