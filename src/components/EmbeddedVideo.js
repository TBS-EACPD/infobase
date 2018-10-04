import './EmbeddedVideo.scss';

import { SpinnerWrapper } from './SpinnerWrapper.js';
import { Details } from './Details.js';

export class EmbeddedVideo extends React.Component {
  constructor(){
    super();

    this.state = {
      loading: true,
    };
  }
  render(){
    const { 
      loading,
    } = this.state;

    const {
      video_source,
      transcript,
      container,
    } = this.props;

    return (
      <div className = { container && "embedded-video-container" }>
        <div className = "embedded-video">
          { loading && <SpinnerWrapper ref="spinner" scale = { 2 } /> }
          <iframe
            onLoad = { () => this.setState( { loading: false } ) }
            src = { video_source }
            frameBorder = "0" 
            allow = "encrypted-media" 
            allowFullScreen
          />
        </div>
        { transcript && 
          <Details
            summary_content = "Transcription"
            content = { transcript }
          />
        }
      </div>
    );
  }
}

EmbeddedVideo.defaultProps = {
  container: true,
  transfript: false,
}