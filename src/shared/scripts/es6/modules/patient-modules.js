/*
 * Patient Modules
 */
export default () => {

   const navItem = $('.patient-nav li'),
         tabItem = $('.patient-tab-item-section'),
         popups = $('.popup-text'),
         disclaimers = $('.disclaimer-custom'),
         references = $('.references'),
         headers = $('.header-title');

   navItem.click(function (){
      let section = `#${$(this).attr('id')}-section`,
          popup = `#${$(this).attr('id')}-section-popup`,
          disclaimer = `#${$(this).attr('id')}-section-disclaimer`,
          header = `#${$(this).attr('id')}-section-title`;

      if ($(this).hasClass('no-references')){
         references.addClass('inactive');
      } else {
         references.removeClass('inactive');
      }

      navItem.removeClass('active');
      $(this).addClass('active');

      tabItem.hide();
      popups.hide();
      headers.hide();
      disclaimers.hide();
      $(`${section}, ${popup}, ${disclaimer}, ${header}`).show();
   });

};
