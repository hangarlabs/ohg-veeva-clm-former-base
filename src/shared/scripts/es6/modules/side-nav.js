/*
 * Side Nav
 */
export default () => {

   const navLinlks = $('.sh-iva-m-sidenav-bar').find('a'),
   			 sideBar = $('.sh-iva-m-sidenav-bar-section-m'),
   			 globalContent = $('.global-content'),
   			 sectionNavs = $('.section-nav-container').find('ul');


   navLinlks.on('click tab', function(e){
   	var $this = $(this); 

 		if ($this.hasClass('sub-nav-link')) {
 			e.preventDefault();
 			e.stopPropagation();

 			// Show side bar, validating is not already visible
 			if(!sideBar.hasClass('hide') && $this.hasClass('active')) {

 				sideBar.addClass('hide'); 
 				$this.removeClass('active'); 

 			} else {

	 			// Remove active class to all sub nav sections to aviod duplicates
	 			sectionNavs.removeClass('active');
	 			navLinlks.removeClass('active');

	 			// Add active class to corresponding subnav and nav link
	 			$(`.${$this.data('subnav')}`).addClass('active'); 
	 			$this.addClass('active');

	 			// Assign click to global content to hide nav 
	 			globalContent.on('click tab',function(){
	 				sideBar.addClass('hide');
	 				$this.removeClass('active'); 
	 				globalContent.off('click tab'); 
	 			});

	 			//Show side Bar
	 			sideBar.removeClass('hide');

 			}
 		}
   }); 
 
};
