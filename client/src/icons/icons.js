import './icons.scss';

const IconHome = (props) => {
  const {
    title,
  } = props;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="icon--svg-inline" aria-labelledby={title}>
      <path fill="none" d="M0 0h24v24H0V0z"/>
      <path className="svg-fill" d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
    </svg>
  );
};


const IconFeedBack = (props) => {
  const {
    title,
  } = props;
  
  return (
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 600 600" style="enable-background:new 0 0 600 600;" aria-labelledby={title}>
      <path className="svg-fill" d="M549.9,503.3c2.3-0.5-8.6-13.2-10.8-17.7l-42.3-68.5c20.8-17.4,54.2-67.8,52.3-113.1
        c-4.2-100.9-112-182.8-250.2-182.8S48.7,203,48.7,304s112,182.9,250.2,182.9c45.4,0,81.3-4.8,118-20.2
        C520.2,497.5,536.1,506.3,549.9,503.3z"/>
    </svg>

  );
};
  


export {
  IconHome,
  IconFeedBack,
};
  