(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

exports.default = function () {

   var header = $('header'),
       disclaimer = $('.disclaimer');

   var supCharacter = function supCharacter($element) {
      if ($element.length !== 0) {
         var html = $element.html().replace(/®/g, '<sup>®</sup>').replace('109/L', '10<sup>9</sup>/L').replace(/breakline/g, '<br />');
         $element.html(html);
      }
   };

   supCharacter(header);
   supCharacter(disclaimer);
};

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {

  //global listeners
  document.addEventListener('touchmove', function (e) {
    e.preventDefault();
  }, false); //prevent webview window from scrolling
  // $('a[href="#"]').on('click', function (e) { e.preventDefault(); }); //prevent default behavior for anchor tags with hash


  FastClick.attach(document.body); //fastclick for mobile 

  // $('a').on('touchend', function (e) {
  //   var path = $(this).attr('href');
  //   document.location = path;
  //   e.stopPropagation();
  // });
};

},{}],3:[function(require,module,exports){
'use strict';

var _helper = require('./helpers/helper');

var _helper2 = _interopRequireDefault(_helper);

var _utils = require('./helpers/utils');

var _utils2 = _interopRequireDefault(_utils);

var _globalSwipeNav = require('./modules/global-swipe-nav');

var _globalSwipeNav2 = _interopRequireDefault(_globalSwipeNav);

var _globalNav = require('./modules/global-nav');

var _globalNav2 = _interopRequireDefault(_globalNav);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//EXAMPLE, PUT YOUR LEVEL

// Modules
// Helpers
$(function () {

  // Helpers
  (0, _helper2.default)();
  (0, _utils2.default)();

  // Modules
  (0, _globalNav2.default)();
});

},{"./helpers/helper":1,"./helpers/utils":2,"./modules/global-nav":4,"./modules/global-swipe-nav":5}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/*
 * Side Nav
 */
exports.default = function () {

  var globalContent = $('.global-content'),
      navContainer = $('.lux-idtl-globla-nav'),
      navToogle = navContainer.find('.hamburger'),
      sideBar = navContainer.find('.side-bar');

  //Toggle global nav bar
  navToogle.on('click tab', function (e) {
    sideBar.toggleClass('active');

    if (sideBar.hasClass('active')) {
      globalContent.on('click tab', function () {
        sideBar.removeClass('active');
        globalContent.off('click tab');
      });
    }
  });
};

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/*
 * Global Swipe Nav
 * This module has the logic in case that some slides can have vertical navigation
 */
exports.default = function () {

  var presentationName = 'ohg_base_example',
      slidesConfig = ['01_00', '02_00'];
  // v{#of slide}SlideConfig = [
  // ],
  //
  // v{#of slide}SlideConfig = [
  // ];
  var dragging = false,
      mousePosX = 0,
      mousePosXEnd = 0;

  var prefixPresentation = function prefixPresentation(presentation) {
    if (typeof presentation === 'undefined') {
      return presentationName;
    } else {
      return presentationName + '_' + presentation;
    }
  };

  var prefixSlide = function prefixSlide(slide, presentation) {
    presentation = prefixPresentation(presentation);
    return presentation + '_' + slide;
  };

  var goTo = function goTo(slideId, presentation) {
    if (typeof slideId === 'undefined') {
      return;
    }

    var href = '';
    var slide = prefixSlide(slideId, presentation);

    if (typeof presentation === 'undefined') {
      presentation = presentationName;
    } else {
      presentation = prefixPresentation(presentation);
    }

    href = 'veeva:gotoSlide(' + slide + '.zip, ' + presentation + ')';
    console.log('veeva:gotoSlide(' + slide + '.zip, ' + presentation + ')');
    window.location = href;
  };

  var assignEvent = function assignEvent(element, event, callback, useCapture) {
    useCapture = typeof useCapture !== 'undefined' ? useCapture : false;

    if (element !== null) {

      if (event === 'tap press') {
        var ev = 'touchend';

        //On touch start we reset values and set the start position
        element.addEventListener('touchstart', function (e) {
          dragging = false;
          mousePosX = e.touches[0].pageX;
          mousePosXEnd = e.touches[0].pageX;
        });

        //When moving we record the last position
        element.addEventListener('touchmove', function (e) {
          mousePosXEnd = e.touches[0].pageX;
        });

        //When the touch finishes, we calculate the distance from the start position
        //if it's bigger than the treshold we set the flag to trigger the swipe
        element.addEventListener('touchend', function (e) {
          //Treshold set to a third of the screen width, if bigger than this we trigger the swipe
          var treshold = $(window).width() / 3;

          //This covers the swipe to the right and to the left
          if (mousePosXEnd - mousePosX > treshold || mousePosXEnd - mousePosX < -treshold) {
            dragging = true;
          } else {
            dragging = false;
          }

          //For testing
          console.log(mousePosX + ' ' + mousePosXEnd + ' ' + dragging);
        });
        element.addEventListener(ev, callback);
        // }
      } else {
        var mc = new Hammer(element);
        mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
        mc.on(event, callback);
      }
    }
  };

  var configureListener = function configureListener() {
    if (typeof Slide !== 'undefined' && typeof Slide.id !== 'undefined' && Slide.id && (typeof Slide.disableSwipe === 'undefined' || !Slide.disableSwipe) && typeof slidesConfig !== 'undefined' && slidesConfig.length > 0) {
      var slideId = typeof Slide.swipeId !== 'undefined' && Slide.swipeId ? Slide.swipeId : Slide.id;
      var slideIndex = slidesConfig.indexOf(slideId);

      assignEvent(document.body, 'swipeleft', function () {
        console.log('swipe left is go');
        if (slideIndex < slidesConfig.length - 1) {
          goTo(slidesConfig[slideIndex + 1]);
        }
      });

      assignEvent(document.body, 'swiperight', function () {
        console.log('swipe right is go');
        if (slideIndex > 0) {
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

  var initSwipeNav = function initSwipeNav() {
    configureListener();
  };

  initSwipeNav();
};

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2hhcmVkL3NjcmlwdHMvZXM2L2hlbHBlcnMvaGVscGVyLmpzIiwic3JjL3NoYXJlZC9zY3JpcHRzL2VzNi9oZWxwZXJzL3V0aWxzLmpzIiwic3JjL3NoYXJlZC9zY3JpcHRzL2VzNi9tYWluLmpzIiwic3JjL3NoYXJlZC9zY3JpcHRzL2VzNi9tb2R1bGVzL2dsb2JhbC1uYXYuanMiLCJzcmMvc2hhcmVkL3NjcmlwdHMvZXM2L21vZHVsZXMvZ2xvYmFsLXN3aXBlLW5hdi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztrQkNBZSxZQUFNOztBQUVsQixPQUFNLFNBQVMsRUFBRSxRQUFGLENBQWY7QUFBQSxPQUNNLGFBQWEsRUFBRSxhQUFGLENBRG5COztBQUdBLE9BQU0sZUFBZSxTQUFmLFlBQWUsQ0FBQyxRQUFELEVBQWM7QUFDaEMsVUFBRyxTQUFTLE1BQVQsS0FBb0IsQ0FBdkIsRUFBMEI7QUFDdkIsYUFBSSxPQUFPLFNBQVMsSUFBVCxHQUFnQixPQUFoQixDQUF3QixJQUF4QixFQUE4QixjQUE5QixFQUE4QyxPQUE5QyxDQUFzRCxPQUF0RCxFQUErRCxrQkFBL0QsRUFBbUYsT0FBbkYsQ0FBMkYsWUFBM0YsRUFBeUcsUUFBekcsQ0FBWDtBQUNBLGtCQUFTLElBQVQsQ0FBYyxJQUFkO0FBQ0Y7QUFDSCxJQUxEOztBQU9BLGdCQUFhLE1BQWI7QUFDQSxnQkFBYSxVQUFiO0FBRUYsQzs7Ozs7Ozs7O2tCQ2ZjLFlBQU07O0FBRW5CO0FBQ0EsV0FBUyxnQkFBVCxDQUEwQixXQUExQixFQUF1QyxVQUFVLENBQVYsRUFBYTtBQUFFLE1BQUUsY0FBRjtBQUFxQixHQUEzRSxFQUE2RSxLQUE3RSxFQUhtQixDQUdrRTtBQUNyRjs7O0FBR0EsWUFBVSxNQUFWLENBQWlCLFNBQVMsSUFBMUIsRUFQbUIsQ0FPYzs7QUFFakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVE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LElBQTRMLGFBQWEsTUFBYixHQUFzQixDQUF0TixFQUF5TjtBQUN2TixVQUFJLFVBQVUsT0FBTyxNQUFNLE9BQWIsS0FBeUIsV0FBekIsSUFBd0MsTUFBTSxPQUE5QyxHQUF3RCxNQUFNLE9BQTlELEdBQXdFLE1BQU0sRUFBNUY7QUFDQSxVQUFJLGFBQWEsYUFBYSxPQUFiLENBQXFCLE9BQXJCLENBQWpCOztBQUVBLGtCQUFZLFNBQVMsSUFBckIsRUFBMkIsV0FBM0IsRUFBd0MsWUFBVztBQUNqRCxnQkFBUSxHQUFSLENBQVksa0JBQVo7QUFDQSxZQUFHLGFBQWEsYUFBYSxNQUFiLEdBQXNCLENBQXRDLEVBQXlDO0FBQ3ZDLGVBQUssYUFBYSxhQUFhLENBQTFCLENBQUw7QUFDRDtBQUVGLE9BTkQ7O0FBUUEsa0JBQVksU0FBUyxJQUFyQixFQUEyQixZQUEzQixFQUF5QyxZQUFXO0FBQ2xELGdCQUFRLEdBQVIsQ0FBWSxtQkFBWjtBQUNBLFlBQUcsYUFBYSxDQUFoQixFQUFtQjtBQUNqQixlQUFLLGFBQWEsYUFBYSxDQUExQixDQUFMO0FBQ0Q7QUFDRixPQUxEO0FBTUQ7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0QsR0F6REQ7O0FBMkRBLE1BQU0sZUFBZSxTQUFmLFlBQWUsR0FBTTtBQUN6QjtBQUNELEdBRkQ7O0FBSUE7QUFFRCxDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZXhwb3J0IGRlZmF1bHQgKCkgPT4ge1xuXG4gICBjb25zdCBoZWFkZXIgPSAkKCdoZWFkZXInKSxcbiAgICAgICAgIGRpc2NsYWltZXIgPSAkKCcuZGlzY2xhaW1lcicpO1xuXG4gICBjb25zdCBzdXBDaGFyYWN0ZXIgPSAoJGVsZW1lbnQpID0+IHtcbiAgICAgIGlmKCRlbGVtZW50Lmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgbGV0IGh0bWwgPSAkZWxlbWVudC5odG1sKCkucmVwbGFjZSgvwq4vZywgJzxzdXA+wq48L3N1cD4nKS5yZXBsYWNlKCcxMDkvTCcsICcxMDxzdXA+OTwvc3VwPi9MJykucmVwbGFjZSgvYnJlYWtsaW5lL2csICc8YnIgLz4nKTtcbiAgICAgICAgICRlbGVtZW50Lmh0bWwoaHRtbCk7XG4gICAgICB9XG4gICB9O1xuXG4gICBzdXBDaGFyYWN0ZXIoaGVhZGVyKTtcbiAgIHN1cENoYXJhY3RlcihkaXNjbGFpbWVyKTtcblxufTtcbiIsImV4cG9ydCBkZWZhdWx0ICgpID0+IHtcblxuICAvL2dsb2JhbCBsaXN0ZW5lcnNcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24gKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyB9LCBmYWxzZSk7IC8vcHJldmVudCB3ZWJ2aWV3IHdpbmRvdyBmcm9tIHNjcm9sbGluZ1xuICAvLyAkKCdhW2hyZWY9XCIjXCJdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyB9KTsgLy9wcmV2ZW50IGRlZmF1bHQgYmVoYXZpb3IgZm9yIGFuY2hvciB0YWdzIHdpdGggaGFzaFxuXG5cbiAgRmFzdENsaWNrLmF0dGFjaChkb2N1bWVudC5ib2R5KTsgLy9mYXN0Y2xpY2sgZm9yIG1vYmlsZSBcblxuICAvLyAkKCdhJykub24oJ3RvdWNoZW5kJywgZnVuY3Rpb24gKGUpIHtcbiAgLy8gICB2YXIgcGF0aCA9ICQodGhpcykuYXR0cignaHJlZicpO1xuICAvLyAgIGRvY3VtZW50LmxvY2F0aW9uID0gcGF0aDtcbiAgLy8gICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAvLyB9KTtcblxufTtcbiIsIi8vIEhlbHBlcnNcbmltcG9ydCBoZWxwZXIgZnJvbSAnLi9oZWxwZXJzL2hlbHBlcic7XG5pbXBvcnQgdXRpbHMgZnJvbSAnLi9oZWxwZXJzL3V0aWxzJztcblxuLy8gTW9kdWxlc1xuaW1wb3J0IGdsb2JhbFN3aXBlTmF2IGZyb20gJy4vbW9kdWxlcy9nbG9iYWwtc3dpcGUtbmF2JztcbmltcG9ydCBnbG9iYWxOYXYgZnJvbSAnLi9tb2R1bGVzL2dsb2JhbC1uYXYnOyAvL0VYQU1QTEUsIFBVVCBZT1VSIExFVkVMXG5cbiQoKCkgPT4ge1xuXG4gIC8vIEhlbHBlcnNcbiAgaGVscGVyKCk7XG4gIHV0aWxzKCk7XG5cbiAgLy8gTW9kdWxlc1xuICBnbG9iYWxOYXYoKTtcbn0pO1xuIiwiLypcbiAqIFNpZGUgTmF2XG4gKi9cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHtcblxuICBjb25zdCBnbG9iYWxDb250ZW50ID0gJCgnLmdsb2JhbC1jb250ZW50JyksXG4gIFx0XHRcdG5hdkNvbnRhaW5lciA9ICQoJy5sdXgtaWR0bC1nbG9ibGEtbmF2JyksXG4gIFx0XHRcdG5hdlRvb2dsZSA9IG5hdkNvbnRhaW5lci5maW5kKCcuaGFtYnVyZ2VyJyksXG4gIFx0XHRcdHNpZGVCYXIgPSBuYXZDb250YWluZXIuZmluZCgnLnNpZGUtYmFyJyk7XG5cbiAgLy9Ub2dnbGUgZ2xvYmFsIG5hdiBiYXJcbiAgbmF2VG9vZ2xlLm9uKCdjbGljayB0YWInLCBmdW5jdGlvbiAoZSkge1xuICBcdHNpZGVCYXIudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gIFx0aWYgKHNpZGVCYXIuaGFzQ2xhc3MoJ2FjdGl2ZScpKSB7XG5cdFx0XHRnbG9iYWxDb250ZW50Lm9uKCdjbGljayB0YWInLGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHNpZGVCYXIucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpOyBcblx0XHRcdFx0Z2xvYmFsQ29udGVudC5vZmYoJ2NsaWNrIHRhYicpO1xuXHRcdFx0fSk7ICBcdFx0XG4gIFx0fVxuXG4gIH0pOyBcbn07IiwiLypcbiAqIEdsb2JhbCBTd2lwZSBOYXZcbiAqIFRoaXMgbW9kdWxlIGhhcyB0aGUgbG9naWMgaW4gY2FzZSB0aGF0IHNvbWUgc2xpZGVzIGNhbiBoYXZlIHZlcnRpY2FsIG5hdmlnYXRpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge1xuXG4gIGNvbnN0IHByZXNlbnRhdGlvbk5hbWUgPSAnb2hnX2Jhc2VfZXhhbXBsZScsXG4gICAgICAgIHNsaWRlc0NvbmZpZyA9IFtcbiAgICAgICAgICAgJzAxXzAwJyxcbiAgICAgICAgICAgJzAyXzAwJ1xuICAgICAgICBdO1xuICAgICAgICAvLyB2eyNvZiBzbGlkZX1TbGlkZUNvbmZpZyA9IFtcbiAgICAgICAgLy8gXSxcbiAgICAgICAgLy9cbiAgICAgICAgLy8gdnsjb2Ygc2xpZGV9U2xpZGVDb25maWcgPSBbXG4gICAgICAgIC8vIF07XG4gIHZhciBkcmFnZ2luZyA9IGZhbHNlLFxuICAgICAgbW91c2VQb3NYID0gMCxcbiAgICAgIG1vdXNlUG9zWEVuZCA9IDA7XG5cbiAgY29uc3QgcHJlZml4UHJlc2VudGF0aW9uID0gKHByZXNlbnRhdGlvbikgPT4ge1xuICAgIGlmICh0eXBlb2YgcHJlc2VudGF0aW9uID09PSAndW5kZWZpbmVkJyl7XG4gICAgICByZXR1cm4gcHJlc2VudGF0aW9uTmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHByZXNlbnRhdGlvbk5hbWUgKyAnXycgKyBwcmVzZW50YXRpb247XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHByZWZpeFNsaWRlID0gKHNsaWRlLCBwcmVzZW50YXRpb24pID0+IHtcbiAgICBwcmVzZW50YXRpb24gPSBwcmVmaXhQcmVzZW50YXRpb24ocHJlc2VudGF0aW9uKTtcbiAgICByZXR1cm4gcHJlc2VudGF0aW9uICsgJ18nICsgc2xpZGU7XG4gIH07XG5cbiAgY29uc3QgZ29UbyA9IChzbGlkZUlkLCBwcmVzZW50YXRpb24pID0+IHtcbiAgICBpZiAodHlwZW9mIHNsaWRlSWQgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgaHJlZiA9ICcnO1xuICAgIHZhciBzbGlkZSA9IHByZWZpeFNsaWRlKHNsaWRlSWQsIHByZXNlbnRhdGlvbik7XG5cbiAgICBpZiAodHlwZW9mIHByZXNlbnRhdGlvbiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHByZXNlbnRhdGlvbiA9IHByZXNlbnRhdGlvbk5hbWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcHJlc2VudGF0aW9uID0gcHJlZml4UHJlc2VudGF0aW9uKHByZXNlbnRhdGlvbik7XG4gICAgfVxuXG4gICAgaHJlZiA9ICd2ZWV2YTpnb3RvU2xpZGUoJyArIHNsaWRlICsgJy56aXAsICcgKyBwcmVzZW50YXRpb24gKyAnKSc7XG4gICAgY29uc29sZS5sb2coJ3ZlZXZhOmdvdG9TbGlkZSgnICsgc2xpZGUgKyAnLnppcCwgJyArIHByZXNlbnRhdGlvbiArICcpJyk7XG4gICAgd2luZG93LmxvY2F0aW9uID0gaHJlZjtcblxuICB9O1xuXG4gIGNvbnN0IGFzc2lnbkV2ZW50ID0gKGVsZW1lbnQsIGV2ZW50LCBjYWxsYmFjaywgdXNlQ2FwdHVyZSkgPT4ge1xuICAgIHVzZUNhcHR1cmUgPSB0eXBlb2YgdXNlQ2FwdHVyZSAhPT0gJ3VuZGVmaW5lZCcgPyB1c2VDYXB0dXJlIDogZmFsc2U7XG5cbiAgICBpZiAoZWxlbWVudCAhPT0gbnVsbCkge1xuXG4gICAgICBpZiAoZXZlbnQgPT09ICd0YXAgcHJlc3MnKSB7XG4gICAgICAgIHZhciBldiA9ICd0b3VjaGVuZCc7XG5cbiAgICAgICAgLy9PbiB0b3VjaCBzdGFydCB3ZSByZXNldCB2YWx1ZXMgYW5kIHNldCB0aGUgc3RhcnQgcG9zaXRpb25cbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgICBtb3VzZVBvc1ggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICAgICAgbW91c2VQb3NYRW5kID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL1doZW4gbW92aW5nIHdlIHJlY29yZCB0aGUgbGFzdCBwb3NpdGlvblxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIG1vdXNlUG9zWEVuZCA9IGUudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9XaGVuIHRoZSB0b3VjaCBmaW5pc2hlcywgd2UgY2FsY3VsYXRlIHRoZSBkaXN0YW5jZSBmcm9tIHRoZSBzdGFydCBwb3NpdGlvblxuICAgICAgICAvL2lmIGl0J3MgYmlnZ2VyIHRoYW4gdGhlIHRyZXNob2xkIHdlIHNldCB0aGUgZmxhZyB0byB0cmlnZ2VyIHRoZSBzd2lwZVxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgLy9UcmVzaG9sZCBzZXQgdG8gYSB0aGlyZCBvZiB0aGUgc2NyZWVuIHdpZHRoLCBpZiBiaWdnZXIgdGhhbiB0aGlzIHdlIHRyaWdnZXIgdGhlIHN3aXBlXG4gICAgICAgICAgdmFyIHRyZXNob2xkID0gJCh3aW5kb3cpLndpZHRoKCkvMztcblxuICAgICAgICAgIC8vVGhpcyBjb3ZlcnMgdGhlIHN3aXBlIHRvIHRoZSByaWdodCBhbmQgdG8gdGhlIGxlZnRcbiAgICAgICAgICBpZihtb3VzZVBvc1hFbmQgLSBtb3VzZVBvc1ggPiB0cmVzaG9sZCB8fCBtb3VzZVBvc1hFbmQgLSBtb3VzZVBvc1ggPCAtdHJlc2hvbGQpe1xuICAgICAgICAgICAgZHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvL0ZvciB0ZXN0aW5nXG4gICAgICAgICAgY29uc29sZS5sb2cobW91c2VQb3NYICsgJyAnICsgbW91c2VQb3NYRW5kICsgJyAnICsgZHJhZ2dpbmcpO1xuICAgICAgICB9KTtcbiAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXYsIGNhbGxiYWNrKTtcbiAgICAgICAgLy8gfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBtYyA9IG5ldyBIYW1tZXIoZWxlbWVudCk7XG4gICAgICAgIG1jLmdldCgnc3dpcGUnKS5zZXQoe2RpcmVjdGlvbjogSGFtbWVyLkRJUkVDVElPTl9BTEx9KTtcbiAgICAgICAgbWMub24oZXZlbnQsIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY29uc3QgY29uZmlndXJlTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBTbGlkZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIFNsaWRlLmlkICE9PSAndW5kZWZpbmVkJyAmJiBTbGlkZS5pZCAmJiAodHlwZW9mIFNsaWRlLmRpc2FibGVTd2lwZSA9PT0gJ3VuZGVmaW5lZCcgfHwgIVNsaWRlLmRpc2FibGVTd2lwZSkgJiYgdHlwZW9mIHNsaWRlc0NvbmZpZyAhPT0gJ3VuZGVmaW5lZCcgJiYgc2xpZGVzQ29uZmlnLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBzbGlkZUlkID0gdHlwZW9mIFNsaWRlLnN3aXBlSWQgIT09ICd1bmRlZmluZWQnICYmIFNsaWRlLnN3aXBlSWQgPyBTbGlkZS5zd2lwZUlkIDogU2xpZGUuaWQ7XG4gICAgICB2YXIgc2xpZGVJbmRleCA9IHNsaWRlc0NvbmZpZy5pbmRleE9mKHNsaWRlSWQpO1xuXG4gICAgICBhc3NpZ25FdmVudChkb2N1bWVudC5ib2R5LCAnc3dpcGVsZWZ0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzd2lwZSBsZWZ0IGlzIGdvJyk7XG4gICAgICAgIGlmKHNsaWRlSW5kZXggPCBzbGlkZXNDb25maWcubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIGdvVG8oc2xpZGVzQ29uZmlnW3NsaWRlSW5kZXggKyAxXSk7XG4gICAgICAgIH1cblxuICAgICAgfSk7XG5cbiAgICAgIGFzc2lnbkV2ZW50KGRvY3VtZW50LmJvZHksICdzd2lwZXJpZ2h0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzd2lwZSByaWdodCBpcyBnbycpO1xuICAgICAgICBpZihzbGlkZUluZGV4ID4gMCkge1xuICAgICAgICAgIGdvVG8oc2xpZGVzQ29uZmlnW3NsaWRlSW5kZXggLSAxXSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vSUYgVEhFIFNMSURFIEhBUyBWRVJUSUNBTCBOQVZJR0FUSU9OXG4gICAgLy8gaWYgKFNsaWRlLnZTd2lwZUlkKSB7XG4gICAgLy8gICBsZXQgdlNsaWRlSWQgPSBTbGlkZS52U3dpcGVJZCxcbiAgICAvLyAgICAgICB2U2xpZGVJbmRleCxcbiAgICAvLyAgICAgICB2U2xpZGVDb25maWc7XG4gICAgLy8gICAvL0ZpbHRlciB3aWNoIHZlcnRpY2FsIHNsaWRlIGNvbmZpZyB3aWxsIGJlIHVzZWRcbiAgICAvLyAgIHN3aXRjaCAodlNsaWRlSWQuc3Vic3RyaW5nKDAsMikpIHtcbiAgICAvLyAgICAgY2FzZSAnMjAnOlxuICAgIC8vICAgICAgIHZTbGlkZUNvbmZpZyA9IHYyMFNsaWRlQ29uZmlnO1xuICAgIC8vICAgICAgIGJyZWFrO1xuICAgIC8vICAgICBjYXNlICc1MCc6XG4gICAgLy8gICAgICAgdlNsaWRlQ29uZmlnID0gdjUwU2xpZGVDb25maWc7XG4gICAgLy8gICAgICAgYnJlYWs7XG4gICAgLy8gICAgIGRlZmF1bHQ6XG4gICAgLy8gICAgICAgYnJlYWs7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIC8vQXNpZ24gdmVydGljYWwgc2xpZGUgaW5kZXggb2Ygc2xpZGVcbiAgICAvLyAgIHZTbGlkZUluZGV4ID0gdlNsaWRlQ29uZmlnLmluZGV4T2YodlNsaWRlSWQpO1xuICAgIC8vXG4gICAgLy8gICAvL0Fzc2lnbiB1cCBhbmQgZG93biBzd2lwZSBldmVudHMgZnJvbSBIYW1tZXJcbiAgICAvLyAgIGFzc2lnbkV2ZW50KGRvY3VtZW50LmJvZHksICdzd2lwZXVwJywgZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKCdzd2lwZSB1cCBpcyBnbycpO1xuICAgIC8vICAgICBpZih2U2xpZGVJbmRleCA8IHZTbGlkZUNvbmZpZy5sZW5ndGggLSAxKSB7XG4gICAgLy8gICAgICAgZ29Ubyh2U2xpZGVDb25maWdbdlNsaWRlSW5kZXggKyAxXSk7XG4gICAgLy8gICAgIH1cbiAgICAvL1xuICAgIC8vICAgfSk7XG4gICAgLy9cbiAgICAvLyAgIGFzc2lnbkV2ZW50KGRvY3VtZW50LmJvZHksICdzd2lwZWRvd24nLCBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2coJ3N3aXBlIGRvd24gaXMgZ28nKTtcbiAgICAvLyAgICAgaWYodlNsaWRlSW5kZXggPiAwKSB7XG4gICAgLy8gICAgICAgZ29Ubyh2U2xpZGVDb25maWdbdlNsaWRlSW5kZXggLSAxXSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH0pO1xuICAgIC8vIH1cbiAgfTtcblxuICBjb25zdCBpbml0U3dpcGVOYXYgPSAoKSA9PiB7XG4gICAgY29uZmlndXJlTGlzdGVuZXIoKTtcbiAgfTtcblxuICBpbml0U3dpcGVOYXYoKTtcblxufTtcbiJdfQ==
