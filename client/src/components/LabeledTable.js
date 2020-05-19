import "./LabeledTable.scss";
import classNames from "classnames";

export class LabeledTable extends React.Component {
  render() {
    const { title, content, styles } = this.props;
    return (
      <section className="labeled-table">
        <div className="labeled-table__header">{title}</div>
        <div className="labeled-table__items">
          {_.map(content, (item, ix) => (
            <div className="labeled-table__item" key={ix}>
              <div className="labeled-table__item-label">
                {styles && styles.header ? (
                  <span className={styles.header}>{item.name}</span>
                ) : (
                  item.name
                )}
              </div>
              <div className="labeled-table__item-description">
                {styles && styles.desc ? (
                  <span className={styles.desc}>{item.desc}</span>
                ) : (
                  item.desc
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
}
