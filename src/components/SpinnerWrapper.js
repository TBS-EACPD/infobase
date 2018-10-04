import { Spinner } from 'spin.js';

export class SpinnerWrapper extends React.Component {
  render(){ return <div ref="main" /> }
  componentDidMount(){ 
    const {scale} = this.props || {scale: 2};
    this.refs.main.appendChild( new Spinner({scale}).spin().el );
  }
}