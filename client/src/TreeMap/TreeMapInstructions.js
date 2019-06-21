import './TreeMap.scss';
import treemap_text from './TreeMap.yaml';
import { create_text_maker } from '../models/text.js';
import { Fragment } from 'react';

const text_maker = create_text_maker([treemap_text]);

export class TreeMapInstructions extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <Fragment>
        <div className='row'>
          <div className="col-sm-12 col-md-12">
            <div className='explore_description' dangerouslySetInnerHTML={{ __html: text_maker("treemap_instructions") }} />
          </div>
        </div>
      </Fragment>
    );
  }
}