import { Route, Switch } from 'react-router';
import { Link, NavLink } from 'react-router-dom';
import { Infograph } from './Infograph.js';


window.lang = APPLICATION_LANGUAGE;

export const app_reducer = (state={ lang: window.lang }, { type, payload }) => {
  //doesn't do anything yet...
  return state;
};


// Now you can dispatch navigation actions from anywhere!
// store.dispatch(push('/foo'))

const Nav = () => <div>
  <ul>
    <li> <NavLink to="/"> Home </NavLink> </li>
    <li> <NavLink to="/about"> About </NavLink> </li>
    <li> <NavLink to="/topics"> Topics </NavLink> </li>
  </ul>
</div>

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
  <div> Page not found </div>
  
  <Link to="/"> Home </Link>

</div>

export class App extends React.Component { 
  render(){
    return (
      <div>
        <Nav />
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route exact path="/about" component={About}/>
          <Route exact path="/topics" component={Topics}/>
          <Route exact path="/infographic/:level/:id/:bubble?" component={Infograph} />
          <Route component={Page404} />
        </Switch>
      </div>
    );
  }
}
