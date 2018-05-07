import './dp-coming-soon.ib.yaml';
import { Dept } from '../models/subject.js'
import { 
  TM,
} from '../util_components.js';



const late_depts = [
  86,
  238,
  136,
  305,
];

export const DpComingSoonHomeComponent = () => {
  
  
  return (
    <div
      style={{
        border: "4px solid #576675",
        borderRadius: "10px",
        padding: "1rem 2rem",
      }}
      className="large_panel_text"
    >
      <div>      
        <TM k="dp_coming_soon__depts" />
      </div>
      <div 
        style={{
          display: "flex",
          flexWrap: "nowrap",
          flexDirection: "row",
          overflowX: "auto",
        }}
      >
        {
          _.chain(late_depts)
            .map(dept_code =>  Dept.lookup(dept_code).sexy_name )
            .sortBy() //alphebetical
            .chunk(2)
            .map( (group,ix) => 
              <div 
                key={ix}
                style={{
                  flex: "0 0 auto",
                }}
              >
                <ul>
                  {_.map(group, dept => 
                    <li key={dept}>
                      {dept}
                    </li>
                  )}
                </ul>
              </div>
            )
            .value()
        }
      </div>
    </div>
  );
}


export const DpComingSoonPanel = () => <div>
  <TM k="dp_coming_soon__depts"/>
  <ul>
    {_.map(late_depts, dept_code => 
      <li key={dept_code}> {Dept.lookup(dept_code).sexy_name} </li>
    )}
  </ul>
</div>;


