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
      <div className="labeledTable">
        <div className="labeledTable__header">
          {title}
        </div>
        <div className="labeledTable__items">
          {_.map(content, item =>
          item.href ?
              <a href={item.href}
                role="radio"
                title={title}
                className={classNames("labeledTable__item", item.active && "active")}
                tabIndex={0}
                aria-checked={item.active}
                key={item.name}
              >
                <div className="labeledTable__item--header">
                  { styles && styles.header ? <span className={styles.header}>{item.name}</span> : item.name }
                </div>
                <div className="labeledTable__item--description">
                  { styles && styles.desc ? <span className={styles.desc}>item.desc</span> : item.desc }
                </div>
              </a> :
              <div className="labeledTable__item" key={item.name}>
                <div className="labeledTable__item--header">
                  { styles && styles.header ? <span className={styles.header}>{item.name}</span> : item.name }
                </div>
                <div className="labeledTable__item--description">
                  { styles && styles.desc ? <span className={styles.desc}>item.desc</span> : item.desc }
                </div>
              </div>
          )}
        </div>
      </div>
    );
  }
}
