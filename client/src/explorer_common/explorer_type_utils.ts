type Node = {
  root: boolean | undefined;
  id: string;
  parent_id: string | null;
  children: Node[];
  isExpanded: boolean | undefined;
  data: Record<string, unknown>;
};

type d3Node = {
  data: {
    data: Record<string, unknown>;
    isExpanded: boolean | undefined;
    root: boolean | undefined;
    id: string;
  } & typeof Node;
  parent: d3Node;
  descendants: () => d3Node[];
  children: d3Node;
};

export { Node, d3Node };
