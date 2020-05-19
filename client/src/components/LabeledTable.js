import "./LabeledTable.scss";

export class LabeledTable extends React.Component {
  render() {
    const { title, contents } = this.props;

    const title_and_labels_are_strings = !_.some(
      [title, ..._.map(contents, "label")],
      !_.isString
    );

    if (!title_and_labels_are_strings) {
      throw new Error(
        "LabeledTable component requires a title and content labels that are strings. Content may be string or component."
      );
    }

    return (
      <section className="labeled-table" aria-label={title}>
        <div className="labeled-table__header" aria-hidden={true}>
          {title}
        </div>
        <div className="labeled-table__items">
          {_.map(contents, ({ id, label, content }, ix) => (
            <div
              className="labeled-table__item"
              key={id || ix}
              id={id}
              tabIndex={0}
              aria-label={label}
            >
              <div className="labeled-table__item-label" aria-hidden={true}>
                {label}
              </div>
              <div className="labeled-table__item-description">{content}</div>
            </div>
          ))}
        </div>
      </section>
    );
  }
}
