import './dp-coming-soon.ib.yaml';
import { Dept } from '../models/subject.js'
import { 
  TM,
  AutoAccordion,
} from '../util_components.js';

const late_depts = [
  "HRSD",
  "TBC",
  "FIN",
  "ACOA",
  "ND",
];

export const DpComingSoon = () => <div>
  <AutoAccordion 
    title={<TM k="dp_coming_soon_title" />}
    usePullDown
  >
    <div style={{margin: "1rem 1.5rem", fontSize: "1.2em"}}>
      <DpComingSoonContent />
    </div>
  </AutoAccordion>
</div>;


export const DpComingSoonContent = () => <div>
  <TM k="dp_coming_soon__depts" />
  <ul>
    {_.map(late_depts, dept_code => 
      <li key={dept_code}> {Dept.lookup(dept_code).sexy_name} </li>
    )}
  </ul>
</div>;
