import partition_text from './PartitionSubApp.yaml';
import perspective_text from './perspectives/perspective_content.yaml';
import diagram_text from '../partition_diagram/PartitionDiagram.yaml';

import { create_text_maker } from '../../models/text.js';

export const text_maker = create_text_maker([partition_text, perspective_text, diagram_text]);