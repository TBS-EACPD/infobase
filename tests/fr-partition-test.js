import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `French test`// declare the fixture
  .page `http://localhost:8080/build/InfoBase/index-fra.html#partition/dept/exp`;  // specify the start page


const partition_desc_sel = "#app-focus-root > div > div > div.outer-container-escape-hatch > div.inner-container-escape-hatch > " +
  "div.partition-container > div.__partition__ > div.partition-controls > form.form-horizontal > div.partition-control-element > text";

//then create a test and place your code there
test('(French) app boots and loads partition page data', async t => {
  await t
    // Use the assertion to check if the actual header text is equal to the expected one
    .expect(Selector(partition_desc_sel).innerText).contains("données");
});