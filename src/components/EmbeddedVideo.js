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
    } = this.props;

    return (
      <div className="embedded-video-container">
        <div className="embedded-video">
          { loading && <SpinnerWrapper ref="spinner" scale = { 2 } /> }
          <iframe
            onLoad = { () => this.setState( { loading: false } ) }
            src = { video_source }
            frameBorder = "0" 
            allow = "encrypted-media" 
            allowFullscreen
          />
        </div>
        { transcript && 
          <Details
            summary_content = "TODO: transcript text key"
            content = { transcript }
          />
        }
      </div>
    );
  }
} 