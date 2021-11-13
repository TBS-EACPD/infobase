type Node = {
  root: Node;
  id: number;
  parent_id: number;
  parent: Node;
  children: Node[];
  isExpanded: boolean;
  data: d3NodeData;
};

type d3NodeData = [k: string, v: unknown] | Record<string, unknown>;

type d3Node = {
  data: {
    data: d3NodeData;
    isExpanded: boolean;
    root: d3Node;
    id: number;
  } & typeof Node;
  parent: d3Node;
  descendants: () => d3Node[];
  children: d3Node;
};

export { Node, d3Node };
