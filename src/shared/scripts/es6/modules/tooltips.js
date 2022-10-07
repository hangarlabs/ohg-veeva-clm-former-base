/*
 * Tooltips Module
 */
export default () => {

  const tooltips = $('.tooltip');

  tooltips.on('click', function toogleTooltip () {
  	$(this).toggleClass('active');
  });

};
