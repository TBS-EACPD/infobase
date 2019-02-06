import './LabeledBox.scss';

export class LabeledBox extends React.Component {
  render(){
    const {
      label,
      content,
    } = this.props;

    return (
      <div className="labeled-box">
        <div className='labeled-box-label '>
          <div className='labeled-box-label-text '>
            { label }
          </div>
        </div>
        <div className="labeled-box-content">
          { content }
        </div>
      </div>
    );
  }
}
