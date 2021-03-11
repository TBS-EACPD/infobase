import React from "react";
import { List } from "react-virtualized";

export class AutoHeightVirtualList extends React.Component {
  constructor(props) {
    super(props);

    this.list_ref = this.props.list_ref || React.createRef();

    this.state = {
      list_height: props.max_height,
    };
  }

  componentDidUpdate(prev_props, prev_state) {
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
        {...{
          ...this.props,
          ref: this.list_ref,
          height: this.state.list_height,
        }}
      />
    );
  }
}

AutoHeightVirtualList.defaultProps = {
  max_height: 400,
};
