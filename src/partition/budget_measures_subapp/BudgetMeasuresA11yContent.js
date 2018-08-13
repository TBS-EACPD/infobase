import { formats } from '../../core/format.js';
import {
  text_maker,
  TextMaker,
} from './budget_measure_text_provider.js';
import { budget_measures_hierarchy_factory } from './budget_measures_hierarchy_factory.js';
import { businessConstants } from '../../models/businessConstants.js';
import { Subject } from '../../models/subject';

const { budget_values } = businessConstants;
const { BudgetMeasure } = Subject;

const value_formatter = value => {
  const in_billions = value >= 1*Math.pow(10,9);
  const format = in_billions ? formats.compact1 : formats.compact;
  return format(value, {raw: true});
}
const name_and_value_cell_formatter = node => {
  if (node.data.type === "budget_measure" || node.data.type === "net_adjust"){
    return `${node.data.name} (${value_formatter(node.value)} ${budget_values.funding.text})`;
  } else if (node.data.type === "measure_withheld_slice" || node.data.type === "measure_remaining_slice"){
    return `${value_formatter(node.value)} ${node.data.name}`;
  } else if (node.data.type === "dept"){
    return `${value_formatter(node.value)} ${text_maker("allocated_to")} ${node.data.name}`;
  } else if (node.data.type === "program_allocation"){
    return "TODO";
  }
};

export function BudgetMeasuresA11yContent(){
  const hierarchical_budget_measures_overview = budget_measures_hierarchy_factory("overview","budget-measure", []);
  
  const ordered_col_header_text_keys = [
    "budget_measures",
    "budget_measure_descriptions",
    "budget_measure_link_header",
    "funding_decisions_header",
    //"program_allocations",
  ];

  return (
    <div style={{overflow: "auto"}}>
      <table className="table table-striped table-bordered" >
        <caption>
          <TextMaker text_key="budget_measures_partition_a11y_chapter_table_caption" />
          <br/>
          <TextMaker text_key="notes"/>: <TextMaker text_key="budget_measure_description_values_clarification"/>
        </caption>
        <thead>
          <tr>
            {_.map(ordered_col_header_text_keys, col_text_key =>
              <th 
                scope="col"
                key={ col_text_key }
              >
                { text_maker(col_text_key) }
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {
            _.map(hierarchical_budget_measures_overview.children, budget_measure => {
              const has_children = !_.isUndefined(budget_measure.children) && budget_measure.children.length > 0;
              const rows_to_span = has_children ? budget_measure.children.length : 1;

              const main_row = <tr key={ "measure" + budget_measure.data.id }>
                <th
                  scope="row"
                  rowSpan={ rows_to_span }
                >
                  { name_and_value_cell_formatter(budget_measure) }
                </th>
                <td
                  key={ "measure_description" + budget_measure.data.id }
                  rowSpan={ rows_to_span }
                >
                  { !_.isEmpty(budget_measure.data.description) && 
                    <div dangerouslySetInnerHTML={{__html: budget_measure.data.description}} />
                  }
                </td>
                <td
                  key={ "measure_link" + budget_measure.data.id }
                  rowSpan={ rows_to_span }
                >
                  { ( (budget_measure.data.chapter_key === "oth" && budget_measure.data.type !== "net_adjust") || !_.isEmpty(budget_measure.data.ref_id) ) && 
                    <a
                      href = { BudgetMeasure.make_budget_link(budget_measure.data.chapter_key, budget_measure.data.ref_id) }
                    >
                      { text_maker("link") }
                    </a>
                  }
                  { budget_measure.data.chapter_key !== "oth" && _.isEmpty(budget_measure.data.ref_id) && 
                    text_maker("not_found_in_budget_text") 
                  }
                </td>
                { has_children &&
                  <td 
                    key={ "measure" + budget_measure.data.id + "-org" + budget_measure.children[0].data.id }
                  >
                    { name_and_value_cell_formatter(budget_measure.children[0]) }
                  </td>
                }
                { !has_children &&
                  <td>
                    {
                      `${value_formatter(budget_measure.value)} ${budget_measure.data.type !== "net_adjust" ?
                        budget_values.remaining.text :
                        budget_values.withheld.text}`
                    }
                  </td>
                }
              </tr>;
  
              if ( !has_children || budget_measure.children.length === 1 ){
                return main_row;
              } else {
                const sub_rows = _.chain(budget_measure.children)
                  .tail()
                  .map( org => 
                    <tr key={ "measure" + budget_measure.data.id + "-org" + org.data.id }>
                      <td>
                        { name_and_value_cell_formatter(org) }
                      </td>
                    </tr>
                  )
                  .value();
  
                return [
                  main_row,
                  ...sub_rows,
                ];
              }
            })
          }
        </tbody>
      </table>
    </div>
  );
}