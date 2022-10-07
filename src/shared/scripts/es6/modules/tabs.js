/*
 * Tabs Module
 */
export default () => {

   const tab = $('.item'),
         tabSection = $('.tab-section'),
         popups = $('.popup-text'),
         tabSubSection = $('.tab-sub-section'),
         tabFirst = $('#tab-item-0'),
         tabSectionFirst = $('#tab-item-0-section'),
         tabSectionPopupFirst = $('#tab-item-0-section-popup, #slide-popup'),
         openSubSection = $('.open-section-sub'),
         closeSubSection = $('.close-section-sub'),
         popupHeader = $('.popup-header'),
         container = $('.global-content'),
         toggleModules = $('.parent-section, .tabs, .redirect');

   let sectionActive = '';


   // Active first tab and show first tab section
   const init = () => {
      popups.hide();
      tabFirst.addClass('active');
      tabSectionFirst.show();
      tabSectionPopupFirst.show();
      closeSubSection.hide();
      popupHeader.hide();
      tabSubSection.hide();
   };

   // Tab click function
   tab.on('click', function changeActiveTab() {

      sectionActive = `#${$(this).attr('id')}-section`;

      // Remove all active tabs and hide all tabs section
      tab.removeClass('active');
      tabSection.hide();
      popups.hide();
      // Active selected tab and show selected tab section
      $(this).addClass('active');
      $(`${sectionActive}, ${sectionActive}-popup`).show();

      //Showing popup if exist
      activeReferences($(`${sectionActive}-popup`));
   });

   // Open subsection
   openSubSection.on('click', function openSubSectionHandler() {
      let subSection = `#${$(this).attr('id').replace('open', 'sub')}`;
      container.addClass('bordered');
      toggleModules.hide();
      popups.hide();
      $(`${subSection}, ${subSection}-popup`).show();
      closeSubSection.show();
      popupHeader.show();
   });

   // Close subsection
   closeSubSection.on('click', function closeSubSectionHandler() {
      container.removeClass('bordered');
      popups.hide();
      $(`#${$(`.item.active`).attr('id')}-section-popup`).show();
      toggleModules.show();
      tabSubSection.hide();
      closeSubSection.hide();
      popupHeader.hide();
   });

   init();

};
