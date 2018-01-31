import { Route, Switch } from 'react-router';
import { Link, NavLink } from 'react-router-dom';
import { OrgIndex } from './OrgIndex.js';
import { Infograph } from './InfoGraph.js';



window.lang = APPLICATION_LANGUAGE;

export const app_reducer = (state={ lang: window.lang }, { type, payload }) => {
  //doesn't do anything yet...
  return state;
};


// Now you can dispatch navigation actions from anywhere!
// store.dispatch(push('/foo'))

const Nav = () => <nav>
  <ul>
    <li> <NavLink to="/"> Home </NavLink> </li>
    <li> <NavLink to="/about"> About </NavLink> </li>
    <li> <NavLink to="/topics"> Topics </NavLink> </li>
    <li> <NavLink to="/orgs"> Orgs </NavLink> </li>
  </ul>
</nav>

const Home = () => <div> 
  Home page 
</div>


const About = () => <div> 
  About page 
</div>

const Topics = () => <div> 
  Topics page
</div>

const Page404 = () => <div>
  <div> Page not found, go to our <Link to="/"> Home page</Link> </div> 
</div>

export class App extends React.Component {
  render(){
    return (
      <div tabIndex={-1} id="app-focus-root">
        <Nav />
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route exact path="/about" component={About}/>
          <Route exact path="/topics" component={Topics}/>
          <Route exact path="/orgs" component={OrgIndex} />
          <Route exact path="/infographic/:level/:id/:bubble?" component={Infograph} />
          { /*
            <Route exact path="/infographic/:level/:id/:bubble?" component={Infograph} />
          */}
          <Route component={Page404} />
        </Switch>
      </div>
    );
  }
}
