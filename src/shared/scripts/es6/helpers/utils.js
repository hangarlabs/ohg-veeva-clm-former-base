export default () => {

  //global listeners
  document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false); //prevent webview window from scrolling
  // $('a[href="#"]').on('click', function (e) { e.preventDefault(); }); //prevent default behavior for anchor tags with hash


  FastClick.attach(document.body); //fastclick for mobile 

  // $('a').on('touchend', function (e) {
  //   var path = $(this).attr('href');
  //   document.location = path;
  //   e.stopPropagation();
  // });

};
