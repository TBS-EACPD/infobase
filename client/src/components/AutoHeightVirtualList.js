import PropTypes from "prop-types";
import React, { Component } from "react";
import { List } from "react-virtualized";

export class AutoHeightVirtualList extends React.Component {
  constructor(props) {
    super(props);

    this.max_height = props.max_height || 400;

    this.state = {
      list_height: this.max_height,
    };
  }

  componentDidUpdate(prev_props, prev_state) {
    const { list_ref } = this.props;
    if (list_ref && list_ref.current) {
      list_ref.current.Grid.measureAllCells();
      const list_height = list_ref.current.Grid.getTotalRowsHeight();
      if (list_height !== this.state.list_height) {
        if (list_height < this.max_height) {
          this.setState({ list_height: list_height });
        } else if (this.state.list_height < this.max_height) {
          this.setState({ list_height: this.max_height });
        }
      }
    }
  }

  render() {
    return (
      <List
        {...{
          ...this.props,
          ref: this.props.list_ref,
          height: this.state.list_height,
        }}
      />
    );
  }
}

AutoHeightVirtualList.propTypes = {
  list_ref: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Component) }),
  ]).isRequired,
};
