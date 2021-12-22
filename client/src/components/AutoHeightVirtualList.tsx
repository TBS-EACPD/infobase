import React from "react";
import { List } from "react-virtualized";
import type { ListProps } from "react-virtualized";

import type { SafeOmit } from "src/types/util_types.d";

interface AutoHeightVirtualListProps extends SafeOmit<ListProps, "height"> {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  list_ref: React.RefObject<any>; //cannot use List from react-virtualized because it doesn't have "getTotalRowsHeight". Possible workaround: (this.list_ref.current.Grid as any).getTotalRowsHeight();
  max_height: number;
}

interface AutoHeightVirtualListState {
  list_height: number;
}

export class AutoHeightVirtualList extends React.Component<
  AutoHeightVirtualListProps,
  AutoHeightVirtualListState
> {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  list_ref: React.RefObject<any>;

  constructor(props: AutoHeightVirtualListProps) {
    super(props);

    this.list_ref = props.list_ref || React.createRef();

    this.state = {
      list_height: props.max_height,
    };
  }

  componentDidUpdate() {
    const { max_height } = this.props;

    if (this.list_ref && this.list_ref.current) {
      this.list_ref.current.Grid.measureAllCells();
      const list_height = this.list_ref.current.Grid.getTotalRowsHeight();
      if (list_height !== this.state.list_height) {
        if (list_height < max_height) {
          this.setState({ list_height: list_height });
        } else if (this.state.list_height < max_height) {
          this.setState({ list_height: max_height });
        }
      }
    }
  }

  render() {
    return (
      <List
        role="tabpanel"
        {...{
          ...this.props,
          ref: this.list_ref,
          height: this.state.list_height,
        }}
      />
    );
  }
}
