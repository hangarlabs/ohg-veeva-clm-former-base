/*
 * Side Nav
 */
export default () => {

  const globalContent = $('.global-content'),
  			navContainer = $('.lux-idtl-globla-nav'),
  			navToogle = navContainer.find('.hamburger'),
  			sideBar = navContainer.find('.side-bar');

  //Toggle global nav bar
  navToogle.on('click tab', function (e) {
  	sideBar.toggleClass('active');

  	if (sideBar.hasClass('active')) {
			globalContent.on('click tab',function(){
				sideBar.removeClass('active'); 
				globalContent.off('click tab');
			});  		
  	}

  }); 
};