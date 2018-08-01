import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `A11y test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-basic-eng.html#metadata`;  // specify the start page


const metadata_desc_sel = "#app-focus-root > div > div > " +
" p > span > p" ;

//then create a test and place your code there
test('A11Y app Datasets page boots up', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(metadata_desc_sel).innerText).contains("The financial");
});