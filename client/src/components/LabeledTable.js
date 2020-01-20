import './LabeledTable.scss';
import classNames from 'classnames';

export class LabeledTable extends React.Component {
  render() {
    const {
      title,
      content,
      styles,
    } = this.props;
    return (
      <div className="labeled-table">
        <div className="labeled-table__header">
          {title}
        </div>
        <div className="labeled-table-items">
          {_.map(content, item =>
          item.href ?
              <a href={item.href}
                role="radio"
                title={title}
                className={classNames("labeled-table-item", item.active && "active")}
                tabIndex={0}
                aria-checked={item.active}
                key={item.name}
              >
                <div className="labeled-table-item__header">
                  { styles && styles.header ? <span className={styles.header}>{item.name}</span> : item.name }
                </div>
                <div className="labeled-table-item__description">
                  { styles && styles.desc ? <span className={styles.desc}>item.desc</span> : item.desc }
                </div>
              </a> :
              <div className="labeled-table-item" key={item.name}>
                <div className="labeled-table-item__header">
                  { styles && styles.header ? <span className={styles.header}>{item.name}</span> : item.name }
                </div>
                <div className="labeled-table-item__description">
                  { styles && styles.desc ? <span className={styles.desc}>item.desc</span> : item.desc }
                </div>
              </div>
          )}
        </div>
      </div>
    );
  }
}
