import {get_glossary_item_tooltip_html} from '../models/glossary.js';

export class TooltipActivator extends React.Component {
  componentDidMount(){
    $('body').tooltip({
      selector: '[data-toggle=tooltip]',
      title: function(){ 
        if(this.getAttribute('data-glossary-key')){ //this is hacky, but tooltips with inline html as titles were being messed with by markdown =
          return get_glossary_item_tooltip_html(this.getAttribute('data-glossary-key'));
        } else {
          return this.getAttribute('title');
        }
      },
      placement: 'bottom',
    });
  }
  render(){
    return null;
  }
}