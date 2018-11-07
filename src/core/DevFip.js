export class DevFip extends React.Component {
  componentDidMount(){
    if(window.is_dev_link){
      // document.querySelector(".ib-site-header-logo.gl-FIP").innerHTML = `
      //   <div class="canada-logo"> DEV </div>
      // `;
      document.querySelector(".canada-logo").setAttribute("data","./svg/infobase-dev-fip.svg");
      document.querySelector('#ib-site-header').style.backgroundColor = "red";
      
    }
    
  }
  render(){
    return null;
  }
}