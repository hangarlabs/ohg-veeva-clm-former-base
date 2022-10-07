/*
 * Popup logic
 */
export default () => {

   const popupCta = $('.pop-up-trigger');

   if (popupCta.length === 0){
      return;
   } else {
      popupCta.on('click', function togglePopUp (e){
         e.preventDefault();
         if ($(this).attr('disabled')) { 
            return;
         } else {
            let popUps = $('.pop-up'),
                activePopUp = popUps.filter('.active'),
                openingPopUp = $(this).data('popup');

            if(activePopUp.length > 0 && activePopUp.data('ref')) {
               openingPopUp = activePopUp.data('ref');
            }

            popUps.addClass('hide');
            popUps.removeClass('active'); 

            $(`#${openingPopUp}`).toggleClass('hide active'); 
            $(this).toggleClass('active');            
         }
      });

      $('.popup-close').on('click', function closeCurrentPopUp(){
         let closetPopUp = $(this).closest('.pop-up');

         closetPopUp.addClass('hide');
         closetPopUp.removeClass('active');
      });    
   }
}; 
