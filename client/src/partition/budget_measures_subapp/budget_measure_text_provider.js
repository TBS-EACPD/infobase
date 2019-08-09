import budget_measure_text from './BudgetMeasuresPartition.yaml';
import route_text from './BudgetMeasuresRoute.yaml';
import controls_text from './BudgetMeasuresControls.yaml';
import a11y_text from './BudgetMeasuresA11yContent.yaml';
import partition_text from '../partition_diagram/PartitionDiagram.yaml';
import { TextMaker as StandardTextMaker } from '../../components/index.js';
import { create_text_maker } from '../../models/text.js';

export const text_maker = create_text_maker([budget_measure_text, route_text, controls_text, a11y_text, partition_text]);
export const TextMaker = props => <StandardTextMaker text_maker_func={text_maker} {...props} />;
