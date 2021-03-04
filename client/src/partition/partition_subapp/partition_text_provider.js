import { create_text_maker } from "src/models/text.js";
import diagram_text from "../partition_diagram/PartitionDiagram.yaml";

import perspective_text from "./perspectives/perspective_content.yaml";

import partition_text from "./PartitionSubApp.yaml";

export const text_maker = create_text_maker([
  partition_text,
  perspective_text,
  diagram_text,
]);
