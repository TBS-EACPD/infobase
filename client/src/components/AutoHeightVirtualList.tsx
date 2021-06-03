import React from "react";
import { List } from "react-virtualized";
import type { ListProps } from "react-virtualized";

interface AutoHeightVirtualListProps extends Omit<ListProps, "height"> {
  list_ref: React.RefObject<any>; //cannot use List from react-virtualized because it doesn't have "getTotalRowsHeight"
  max_height?: number;
}

interface AutoHeightVirtualListState {
  list_height: number;
}

export class AutoHeightVirtualList extends React.Component<
  AutoHeightVirtualListProps,
  AutoHeightVirtualListState
> {
  list_ref: React.RefObject<any>;
  static defaultProps = {
    max_height: 400,
  };

  constructor(props: AutoHeightVirtualListProps) {
    super(props);

    this.list_ref = props.list_ref || React.createRef();

    this.state = {
      list_height: props.max_height!,
    };
  }

  componentDidUpdate(
    prev_props: AutoHeightVirtualListProps,
    prev_state: AutoHeightVirtualListState
  ) {
    const { max_height } = this.props;

    if (this.list_ref && this.list_ref.current) {
      this.list_ref.current.Grid.measureAllCells();
      const list_height = this.list_ref.current.Grid.getTotalRowsHeight();
      if (list_height !== this.state.list_height) {
        if (list_height < max_height!) {
          this.setState({ list_height: list_height });
        } else if (this.state.list_height < max_height!) {
          this.setState({ list_height: max_height! });
        }
      }
    }
  }

  render() {
    return (
      <List
        {...this.props}
        rowHeight={this.props.rowHeight}
        rowCount={this.props.rowCount}
        width={this.props.width}
        rowRenderer={this.props.rowRenderer}
        ref={this.list_ref}
        height={this.state.list_height}
      />
    );
  }
}
