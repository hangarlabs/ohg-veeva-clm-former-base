/*
 * Popup tab logic
 */
export default () => {

   const tabPopup = $('.tab-popup'),
         tabLinks = tabPopup.find('.tab-link a');

   if (tabPopup.length > 0){
      tabLinks.on('click', (e) => {
         e.preventDefault();
         const currentActive = tabPopup.filter('.active'),
               currentTabLinks = currentActive.find('.tab-link a'), 
               currentTabs = currentActive.find('.tab');

         let targetTab = $(e.target).data('target');  

         currentTabs.removeClass('active');
         $('#'+targetTab).addClass('active');

      });
   }
}; 
