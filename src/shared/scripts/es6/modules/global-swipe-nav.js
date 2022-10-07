/*
 * Global Swipe Nav
 * This module has the logic in case that some slides can have vertical navigation
 */
export default () => {

  const presentationName = 'ohg_base_example',
        slidesConfig = [
           '01_00',
           '02_00'
        ];
        // v{#of slide}SlideConfig = [
        // ],
        //
        // v{#of slide}SlideConfig = [
        // ];
  var dragging = false,
      mousePosX = 0,
      mousePosXEnd = 0;

  const prefixPresentation = (presentation) => {
    if (typeof presentation === 'undefined'){
      return presentationName;
    } else {
      return presentationName + '_' + presentation;
    }
  };

  const prefixSlide = (slide, presentation) => {
    presentation = prefixPresentation(presentation);
    return presentation + '_' + slide;
  };

  const goTo = (slideId, presentation) => {
    if (typeof slideId === 'undefined'){
      return;
    }

    var href = '';
    var slide = prefixSlide(slideId, presentation);

    if (typeof presentation === 'undefined') {
      presentation = presentationName;
    }
    else {
      presentation = prefixPresentation(presentation);
    }

    href = 'veeva:gotoSlide(' + slide + '.zip, ' + presentation + ')';
    console.log('veeva:gotoSlide(' + slide + '.zip, ' + presentation + ')');
    window.location = href;

  };

  const assignEvent = (element, event, callback, useCapture) => {
    useCapture = typeof useCapture !== 'undefined' ? useCapture : false;

    if (element !== null) {

      if (event === 'tap press') {
        var ev = 'touchend';

        //On touch start we reset values and set the start position
        element.addEventListener('touchstart', function(e){
          dragging = false;
          mousePosX = e.touches[0].pageX;
          mousePosXEnd = e.touches[0].pageX;
        });

        //When moving we record the last position
        element.addEventListener('touchmove', function(e){
          mousePosXEnd = e.touches[0].pageX;
        });

        //When the touch finishes, we calculate the distance from the start position
        //if it's bigger than the treshold we set the flag to trigger the swipe
        element.addEventListener('touchend', function(e){
          //Treshold set to a third of the screen width, if bigger than this we trigger the swipe
          var treshold = $(window).width()/3;

          //This covers the swipe to the right and to the left
          if(mousePosXEnd - mousePosX > treshold || mousePosXEnd - mousePosX < -treshold){
            dragging = true;
          }else{
            dragging = false;
          }

          //For testing
          console.log(mousePosX + ' ' + mousePosXEnd + ' ' + dragging);
        });
          element.addEventListener(ev, callback);
        // }
      }
      else {
        var mc = new Hammer(element);
        mc.get('swipe').set({direction: Hammer.DIRECTION_ALL});
        mc.on(event, callback);
      }
    }
  };

  const configureListener = () => {
    if (typeof Slide !== 'undefined' && typeof Slide.id !== 'undefined' && Slide.id && (typeof Slide.disableSwipe === 'undefined' || !Slide.disableSwipe) && typeof slidesConfig !== 'undefined' && slidesConfig.length > 0) {
      var slideId = typeof Slide.swipeId !== 'undefined' && Slide.swipeId ? Slide.swipeId : Slide.id;
      var slideIndex = slidesConfig.indexOf(slideId);

      assignEvent(document.body, 'swipeleft', function() {
        console.log('swipe left is go');
        if(slideIndex < slidesConfig.length - 1) {
          goTo(slidesConfig[slideIndex + 1]);
        }

      });

      assignEvent(document.body, 'swiperight', function() {
        console.log('swipe right is go');
        if(slideIndex > 0) {
          goTo(slidesConfig[slideIndex - 1]);
        }
      });
    }

    //IF THE SLIDE HAS VERTICAL NAVIGATION
    // if (Slide.vSwipeId) {
    //   let vSlideId = Slide.vSwipeId,
    //       vSlideIndex,
    //       vSlideConfig;
    //   //Filter wich vertical slide config will be used
    //   switch (vSlideId.substring(0,2)) {
    //     case '20':
    //       vSlideConfig = v20SlideConfig;
    //       break;
    //     case '50':
    //       vSlideConfig = v50SlideConfig;
    //       break;
    //     default:
    //       break;
    //   }
    //
    //   //Asign vertical slide index of slide
    //   vSlideIndex = vSlideConfig.indexOf(vSlideId);
    //
    //   //Assign up and down swipe events from Hammer
    //   assignEvent(document.body, 'swipeup', function() {
    //     console.log('swipe up is go');
    //     if(vSlideIndex < vSlideConfig.length - 1) {
    //       goTo(vSlideConfig[vSlideIndex + 1]);
    //     }
    //
    //   });
    //
    //   assignEvent(document.body, 'swipedown', function() {
    //     console.log('swipe down is go');
    //     if(vSlideIndex > 0) {
    //       goTo(vSlideConfig[vSlideIndex - 1]);
    //     }
    //   });
    // }
  };

  const initSwipeNav = () => {
    configureListener();
  };

  initSwipeNav();

};
