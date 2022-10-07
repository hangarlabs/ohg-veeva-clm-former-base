/*
 * Isi Intersticial
 */
export default () => {

  const isiInt = $('#ohg-base-example-m-isi-intersticial'),
        piTrigger = isiInt.find('.pi-trigger'),
        piPopup = $('#ohg-base-example-m-pi');

  piTrigger.on('click', function () {
    piPopup.removeClass('hide');
  });
}; 
