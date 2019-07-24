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
      checkedItems: new Map(),
    };
  }
  

  handleSubBox(e, include_configs) {
    e.persist();
    this.handleChange(e, include_configs);
    const checkedCount = document.querySelectorAll('input.'+e.target.className+':checked').length;
    this.setState(prevState => ({checkedItems: prevState.checkedItems.set(e.target.getAttribute('parent'), checkedCount > 0)}));
  }

  handleChange(e, include_configs) {
    const item = e.target.name;
    const isChecked = e.target.checked;
    this.setState(prevState => ({ checkedItems: prevState.checkedItems.set(item, isChecked) }));
    include_configs[item] = isChecked;

    const subBoxes = document.querySelectorAll('input.'+e.target.getAttribute('child'));
    subBoxes.forEach(subBoxes =>{
      this.setState(prevState => ({ checkedItems: prevState.checkedItems.set(subBoxes.name, isChecked) }));
      include_configs[subBoxes.name] = isChecked;
    });

    this.props.handleCheckBox(e, include_configs);
  }

  render() {

    const {
      include_programs,
      include_crsos,
      include_goco,
      include_hwh,
      include_hi,
      include_limited,
      include_extensive,
    } = this.props;

    const include_configs = {
      include_programs,
      include_crsos,
      include_goco,
      include_hwh,
      include_hi,
      include_limited,
      include_extensive,
    }; 

    const checkboxes = [
      {
        name: 'include_orgs',
        key: 'checkBox0',
        label: ' Departments',
        child: 'sub-orgs-checkbox',
      },
      {
        name: 'include_programs',
        key: 'checkBox1',
        label: ' Programs',
      },
      {
        name: 'include_crsos',
        key: 'checkBox2',
        label: ' CRSOs',
      },
      {
        name: 'include_tags',
        key: 'checkBox3',
        label: ' Tags',
        child: 'sub-tags-checkbox',
      },
    ];

    const subBoxes = [
      {
        parent: 'include_orgs',
        name: 'include_limited',
        key: 'checkBox0',
        label: ' Limited data',
        className: 'sub-orgs-checkbox',
      },
      {
        parent: 'include_orgs',
        name: 'include_extensive',
        key: 'checkBox1',
        label: ' Extensive data',
        className: 'sub-orgs-checkbox',
      },
      {
        parent: 'include_tags',
        name: 'include_goco',
        key: 'checkBox2',
        label: ' GOCO',
        className: 'sub-tags-checkbox',
      },
      {
        parent: 'include_tags',
        name: 'include_hwh',
        key: 'checkBox3',
        label: ' How We Help',
        className: 'sub-tags-checkbox',
      },
      {
        parent: 'include_tags',
        name: 'include_hi',
        key: 'checkBox4',
        label: ' Horizontal Iniatives',
        className: 'sub-tags-checkbox',
      },
    ];

    const Checkbox = ({label, name, onChange, checked = true, className, parent, child}) => (
      <div className="checkbox">
        <label>
          <input type={'checkbox'} name={name} checked={checked} onChange={onChange} className={className} parent={parent} child={child}/>
          {label}
        </label>
      </div>
    );

    return(  
      <div>
        <div className='col-md-4' >
          <button 
            className="btn-lg btn btn-ib-primary btn-block"
            onClick={() => this.setState({open: !this.state.open})}>
          Advanced Search
          </button>
          <br />
        </div>
        <div className="col-md-12">
          <section className={`panel panel-info mrgn-bttm-md advanced-search-panel advanced-search-panel-open--${this.state.open}`}>
            <header className='panel-heading'>
              <header className="panel-title"> Advanced Search </header>
            </header>
            <div className='panel-body'>
            
              <div>
                <p>Specify filtering options:</p>
                <Fragment>
                  {
                    checkboxes.map(item => (
                      <div key={item.key}>
                        <Checkbox
                          key={item.key}
                          name={item.name} 
                          label={item.label}
                          checked={this.state.checkedItems.get(item.name)}
                          onChange={(e) => this.handleChange(e, include_configs)}
                          child={item.child}
                        />  
                        <ul style={{listStyle: 'none'}}>
                          { subBoxes.map(sub => { return item.name === sub.parent ?
                            <li key={sub.key}>
                              <Checkbox
                                key={sub.key}
                                name={sub.name} 
                                label={sub.label}
                                checked={this.state.checkedItems.get(sub.name)}
                                onChange={(e) => this.handleSubBox(e, include_configs)}
                                className={sub.className}
                                parent={sub.parent}
                              /> 
                            </li> : null;
                          })
                          }
                        </ul>
                      </div>
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