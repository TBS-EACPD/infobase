import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-fra.html#rpb/~(columns~(~'thisyearexpenditures)~subject~'gov_gov~mode~'simple~dimension~'major_voted_stat~table~'table1~preferDeptBreakout~true~descending~false~filter~'Tout)`;  // specify the start page


const rpb_desc_sel = "#app-focus-root > div > div > div > " +
  "div.labeled-box > div.labeled-box-content > div > div.centerer > p#picker-label.md-half-width.md-gutter-right > span";

//then create a test and place your code there
test('(French) app boots and loads rpb page data', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(rpb_desc_sel).innerText).contains("Autorisations");
});