'use strict';

const test_groups = [];
const AppRouter = require('./core/router.js');

/*

  currently, this is more accurately 'page-level' tests than integration tests, as you can't follow links. 

  link quality could be done via selecting and parsing URLs 
  it could also be done via a better linking tool with unit-tests or something.

  API: in order to test something, you have to give a URL
  bonus: Could be run-time determined URL
  
  you use registerTest(url, description, func(page_proms, test) )
  func can call it( func(done) ) as much as it wants, just keep it synchronous, that's what the done callback passed to it is for.
  by default, all tests are assumed to be async.
  if you don't pass a function to test, e.g. test('infographic remove nav button should clear bubble menu'), 
  the test is considered 'pending' or not written yet. It's useful to have these test cases planned out even if you can't write them yet.


  registerTest('/infographic/prog/1/', 'a program infographic', (page_proms,test) => {
    test('the page should render', function(done){
      page_proms['page-rendered'].then( ()=> done() )
    });
    test( 'it should render' ,function(done){
      qs('#show_fin').click()
      page_proms['infograph-rendered'].then( ()=> {
        expect(qs('# ', true)).to.have.length(5); 
        done();
      })
    });
  });

  output in console: 
  now testing a program infographic
    page should render (in green)
    it should render  (in green)

*/

function reportTestGroup(name){
  console.log("%cnow testing "+name, "font-weight:bold");
}
function reportSuccess(text){
  console.log("%c  "+text, "color:green")
}
function reportFailure(text){
  console.log("%c  "+text, "color:red")
}
function reportPending(text){
  console.log("%c  "+text, "color:burlywood")
}

const route_tests = [];

function registerTest(route, name, func){
  route_tests.push( { route, name, func}); 
}

function create_task_from_route_test(route_test){
  const ret = $.Deferred();
  const { route, name, func } = route_test;  
  const tests = [];

  const test_runner = (description, _func) => {
    tests.push({ description, _func});
  }

  return () => {
    reportTestGroup(name);
    AppRouter.navigate_and_listen( route, page => {
      func(page, test_runner);
    });
    return tests.reduce( (chain, test) => {
      return chain.then( () => {
        const ret = $.Deferred();
        if( _.isUndefined(test._func) ){
          reportPending(test.description);
          return ret.resolve();
        }
        //this is similar to try/catch but will catch async errors.
        window.onerror = message=>{
          reportFailure(test.description); 
        };

        test._func(ret.resolve); //test will call resolve on the promise

        const error_timer = setTimeout(()=> { 
          throw "it took too long"; 
        }, 5000);

        return ret.then( () => {
          clearTimeout(error_timer);
          window.onerror = null;
          reportSuccess(test.description);
        });
      })
    }, $.Deferred().resolve());

  };

}

function start_tests(){
  const route_test_tasks = (
    route_tests
      //TODO sort tests by priority
      .map( create_task_from_route_test )
  );
  route_test_tasks.reduce( (chain,task) => {
    return chain.then( () => task() )
  }, $.Deferred().resolve() )
    .then(()=> console.log(' testing is complete! '));
}

module.exports = exports = { start_tests, registerTest  };
