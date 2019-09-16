import { StandardRouteContainer } from '../core/NavComponents';

import { get_panels_for_subject } from '../infographic/get_panels_for_subject';
import { Subject } from '../models/subject';
import { EverythingSearch, SpinnerWrapper } from '../components/index.js';
import { ensure_loaded } from '../core/lazy_loader';
import { PanelGraph } from '../core/PanelGraph';
import { Indicator } from '../models/results.js';
import { ReactPanelGraph } from '../core/PanelCollectionView';

const {
  Dept, 
  Program, 
  Tag,
  Gov,
  CRSO,
} = Subject;
  
function url_template(subject, panel){
  return `/panel/${subject.level}/${subject.id}/${panel.key}`;
}


const get_subject = (level, id) => {
  let subject;
  switch(level){
    case 'ind':
      subject = Indicator.lookup(id);
      break;
    case 'dept':
      subject = Dept.lookup(id);
      break;
    case 'tag':
      subject = Tag.lookup(id);
      break;
    case 'program':
      subject = Program.lookup(id);
      break;
    case 'crso':
      subject = CRSO.lookup(id);
      break;
    default:
      subject = Gov;
  }
  return subject;

};

<ReactPanelGraph 
graph_key={graph_key}
subject={subject}
bubble={active_bubble_id}
key={graph_key + subject.guid}
/>