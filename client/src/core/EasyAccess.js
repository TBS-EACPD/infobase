import { TrivialTM } from '../util_components.js';
import { Fragment } from 'react';

export class EasyAccess extends React.Component {
  render(){ return null; }
  componentDidMount(){
    ReactDOM.render(

      <EasyAccess_ />,
      document.getElementById("easy-access")
    )
  }
}
const TM = TrivialTM;

const EasyAccess_ = () =>
  <Fragment>
    <a href='#glossary'>
      <TM k="glossary" />
    </a>
    <a
      href="#metadata"
      className="mrgn-lft-md"
    >
      <TM k="metadata" />
    </a>
    <a
      href="#about"
      className="mrgn-lft-md"
    >
      <TM k="about_title" />
    </a>
  </Fragment>;