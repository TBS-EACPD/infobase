export class DevFip extends React.Component {
  componentDidMount(){
    if(window.is_dev_link){
      document.querySelector(".canada-logo").setAttribute("data","./svg/infobase-dev-fip.svg");
      document.querySelector('#ib-site-header').style.backgroundColor = "red";
    }
  }
  render(){
    return null;
  }
}