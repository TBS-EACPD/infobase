export class DevFip extends React.Component {
  componentDidMount(){
    if(IS_DEV_LINK){
      // document.querySelector(".ib-site-header-logo.gl-FIP").innerHTML = `
      //   <div class="canada-logo"> DEV </div>
      // `;
      document.querySelector(".canada-logo").setAttribute("data","./svg/infobase-dev-fip.svg");
      
    }
    
  }
  render(){
    return null;
  }
}