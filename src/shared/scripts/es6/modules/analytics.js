module.exports = function () {

  $(function IIFE() {

    const dataPage = $('body').attr('data-analytics-page'),
          dataTitle = $('body').attr('data-analytics-title');

    // Track pageView each slide
    // ga('send', { 'hitType': 'pageview', 'page': dataPage, 'title': dataTitle });

    // Track clicks in the slides
    $('*[data-gaid-click]').bind('click', function (e) {
      let gaID = $(this).attr('data-gaid-click');
      ga('send', 'event', 'Button', 'Click', `${gaID}`);
    });
    
  });

};
