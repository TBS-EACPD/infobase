import { TM } from '../util_components.js';
export class EasyAccess extends React.Component {
  render(){ return null; }
  componentDidMount(){
    ReactDOM.render(
      <EasyAccess_ />,
      document.getElementById("easy-access")
    )
  }
}

const EasyAccess_ = () => [
  <a key="a" href='#glossary'>
    <TM k="glossary" />
  </a>,
  <a
    key="b"
    href="#metadata"
    className="mrgn-lft-md"
  >
    <TM k="metadata" />
  </a>,
];