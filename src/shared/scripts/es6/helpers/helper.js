export default () => {

   const header = $('header'),
         disclaimer = $('.disclaimer');

   const supCharacter = ($element) => {
      if($element.length !== 0) {
         let html = $element.html().replace(/®/g, '<sup>®</sup>').replace('109/L', '10<sup>9</sup>/L').replace(/breakline/g, '<br />');
         $element.html(html);
      }
   };

   supCharacter(header);
   supCharacter(disclaimer);

};
