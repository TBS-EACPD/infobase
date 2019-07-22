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

  hnadleSubTag(e) {
    this.handleChange(e);
    const checkedCount = document.querySelectorAll('input.sub-tag-checkbox:checked').length;
    this.setState(prevState => ({checkedItems: prevState.checkedItems.set('tags', checkedCount > 0)}));
  }

  handleChange(e) {
    const item = e.target.name;
    const isChecked = e.target.checked;
    this.setState(prevState => ({ checkedItems: prevState.checkedItems.set(item, isChecked) }));
    this.props.handleCheckBox(isChecked, item);


    if (item === 'tags') {
      const subTags = document.querySelectorAll('input.sub-tag-checkbox');
      subTags.forEach((subTags) => {
        this.setState(prevState => ({checkedItems: prevState.checkedItems.set(subTags.name, isChecked)}));
      });
    }
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

    const subTags = [
      {
        name: 'goco',
        key: 'checkBox1',
        label: ' GOCO',
        className: 'sub-tag-checkbox',
      },
      {
        name: 'hwh',
        key: 'checkBox2',
        label: ' How We Help',
        className: 'sub-tag-checkbox',
      },
      {
        name: 'hi',
        key: 'checkBox3',
        label: ' Horizontal Iniatives',
        className: 'sub-tag-checkbox',
      },
    ];

    const Checkbox = ({label, name, onChange, checked = true, className}) => (
      <div className="checkbox">
        <label>
          <input type={'checkbox'} name={name} checked={checked} onChange={onChange} className={className} />
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
                      <Checkbox
                        key={item.key}
                        name={item.name} 
                        label={item.label}
                        checked={this.state.checkedItems.get(item.name)}
                        onChange={(e) => this.handleChange(e)}
                      />  
                    ))
                  }
                  <ul style={{listStyle: 'none'}}>
                    {
                      subTags.map(item => (
                        <li key={item.key}>
                          <Checkbox
                            key={item.key}
                            name={item.name} 
                            label={item.label}
                            checked={this.state.checkedItems.get(item.name)}
                            onChange={(e) => this.hnadleSubTag(e)}
                            className={item.className}
                          /> 
                        </li>
                      ))
                    }
                  </ul>
                </Fragment>
              </div>
            </div>
          </section>
        </div>
      </div>
     
    );
  }

}