/*
 * Table of Contents Module
 */
export default () => {

   const toggleElements = $('.neulasta-icva-m-btn-toc, .neulasta-icva-m-toc'),
         clickElements = $('.neulasta-icva-m-btn-toc, .return-link');

   const toggleTOF = () => {
      toggleElements.toggleClass('hide');
   };

   clickElements.on('click', toggleTOF);

};
