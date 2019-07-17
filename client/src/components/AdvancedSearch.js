import './AdvancedSearch.scss';
import { Fragment } from 'react';
import text from "./AdvancedSearch.yaml";
import {
  create_text_maker_component,
} from '../util_components.js';

const { text_maker, TM } = create_text_maker_component(text);

export class AdvancedSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      loading: true,
      checkedItems: new Map(),
    };

    this.divRef = React.createRef();
    
  }

  componentDidMount(){
    this.setState({loading: false});
  }

  toggleOpen() {
    let content = this.panelRef;
    content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + 'px';
  }

  handleChange(e) {
    const item = e.target.name;
    const isChecked = e.target.checked;
    this.setState(prevState => ({ checkedItems: prevState.checkedItems.set(item, isChecked) }));
    this.props.handleCheckBox(e.target.checked, e.target.name);
  }

  render() {
    const checkboxes = [
      {
        name: 'programs',
        key: 'checkBox1',
        label: ' Programs',
      },
      {
        name: 'crsos',
        key: 'checkBox2',
        label: ' CRSOs',
      },
      {
        name: 'tags',
        key: 'checkBox3',
        label: ' Tags',
      },
    ];

    const Checkbox = ({label, name, onChange, checked = true}) => (
      <div className="checkbox">
        <label>
          <input type={'checkbox'} name={name} checked={checked} onChange={onChange} />
          {label}
        </label>
      </div>
    );

    return(  
      <div>
        <div className='col-md-4' >
          <button 
            className="btn-lg btn btn-ib-primary btn-block"
            onClick={() => this.toggleOpen()}>
          Advanced Search
          </button>
          <br />
        </div>
        <div className='col-md-12' >
          <section className='panel advanced-search-panel panel-info mrgn-bttm-md' ref={e => this.panelRef = e}>
            <header className='panel-heading'>
              <header className="panel-title"> Advanced Search </header>
            </header>
            <div className='panel-body'>
            
              <div>
                <p>Specify filtering options:</p>
                <Fragment>
                  {
                    checkboxes.map(item => (
                      <Checkbox
                        key = {item.key} 
                        name={item.name} 
                        label={item.label}
                        checked={this.state.checkedItems.get(item.name)}
                        onChange={(e) => this.handleChange(e)}
                      />    
                    ))
                  }
                </Fragment>
              </div>
            </div>
          </section>
        </div>
      </div>
     
    );
  }

}