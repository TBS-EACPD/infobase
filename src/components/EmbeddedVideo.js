import './EmbeddedVideo.scss';

import { Details } from './Details.js';

export class EmbeddedVideo extends React.Component {
  render(){
    const {
      video_source,
      transcript,
    } = this.props;

    return (
      <div className="embedded-video-container">
        <div className="embedded-video">
          <iframe 
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