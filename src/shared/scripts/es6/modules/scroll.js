 /*
 * Popup logic
 */
export default () => {

  const scroll = $('.scroller'),
        scrollVelocity = 15;

  let lastY,
      currentY,
      currentScroll;

  scroll.on('touchmove', function(e) {
    currentY = e.originalEvent.touches[0].clientY;
    currentScroll = $(this).scrollTop();

    if(currentY > lastY){
       $(this).scrollTop(currentScroll - scrollVelocity);
    }else if(currentY < lastY){
       $(this).scrollTop(currentScroll + scrollVelocity);
    }

    lastY = currentY;
  });
}; 
