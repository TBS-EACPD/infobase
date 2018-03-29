import * as Subject from '../../models/subject';
import * as businessConstants from '../../models/businessConstants.yaml';
import { StackedHbarChart } from '../../charts/declarative_charts.js';
import { formats } from '../../core/format.js';

const { BudgetMeasure } = Subject;
const { budget_chapters } = businessConstants;

export class BudgetMeasuresTop extends React.Component {
  constructor(){
    super();

    this.allocation_by_chapter = _.chain(BudgetMeasure.get_all())
      .groupBy("chapter_key")
      .mapValues( (chapter_group, chapter_key) => {
        const allocation_total = _.chain(chapter_group)
          .flatMap( BudgetMeasure => BudgetMeasure.allocations )
          .reduce((total, allocation_row) => total + (+allocation_row[2]), 0)
          .value();

        return {
          key: chapter_key,
          label: budget_chapters[chapter_key].text,
          data: [{
            label: chapter_key,
            data: allocation_total,
          }],
        };
      })
      .value();

  }
  render(){
    // Using the chapter colours from budget.gc.ca here
    const colors_by_chapter_key = {
      adv: "#279948",
      grw: "#5e4b8c",
      prg: "#01bcc7",
      rec: "#e82b4f",
      n_a: "#ddd6d2",
    };
    const colors_func = (key) => colors_by_chapter_key[key];

    return (
      <div>
        {"TODO: intro text"}
        { !window.is_a11y_mode &&
          <StackedHbarChart
            colors = { colors_func }
            formater = { formats.compact1 }
            font_size = "14px"
            bar_height = { 40 }
            bar_label_formater = { ({label}) => label }
            data={this.allocation_by_chapter}
          />
        }
        { window.is_a11y_mode &&
          <div/> // TODO: table version of graphic
        }
        {"TODO: some more text, to break up page between the two diagrams"}
      </div>
    );
  }
}