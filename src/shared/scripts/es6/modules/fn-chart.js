'use strict';

/*
 * FN-Chart Module
 */

export default () => {

  // setup
  const updateHandler = ($param1, $element) => {
    $(`${$param1} p`).html(`${$element.score.toFixed(0)}%`);
  };

  const incrementNumbers = () => {
    let gray = { score: 0 },
        blue = { score: 0 };

        //incriment numbers
        TweenLite.to(gray, 1, { score: '10', onUpdate: updateHandler, onUpdateParams:['.gray-number', gray], ease: Linear.easeNone });
        TweenLite.to(blue, 1, { score: '36', onUpdate: updateHandler, onUpdateParams:['.blue-number', blue], ease: Linear.easeNone });
  };

  // listeners
  $('.fn-chart-open').click(function(){
    setTimeout(function(){
      $('.fn-chart').addClass('active');
      incrementNumbers();
    }, 500);
  });

  $('.fn-chart-close').click(function(){
    $('.fn-chart').removeClass('active');
    $('.fn-chart .bar p').html('');
  });

};
