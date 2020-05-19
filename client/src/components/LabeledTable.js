import "./LabeledTable.scss";

export class LabeledTable extends React.Component {
  render() {
    const { title, contents } = this.props;
    return (
      <section className="labeled-table">
        <div className="labeled-table__header">{title}</div>
        <div className="labeled-table__items">
          {_.map(contents, ({ id, label, content }, ix) => (
            <div
              className="labeled-table__item"
              key={id || ix}
              id={id}
              tabIndex={0}
            >
              <div className="labeled-table__item-label">{label}</div>
              <div className="labeled-table__item-description">{content}</div>
            </div>
          ))}
        </div>
      </section>
    );
  }
}
