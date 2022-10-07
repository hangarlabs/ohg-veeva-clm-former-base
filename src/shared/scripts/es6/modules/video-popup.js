/*
 * Video Popup Modules
 */
export default () => {

  // Variables
  const videoPopup = $('.video-popup'),
        openVideoBtn = $('.video-popup-open'),
        closeVideoBtn = $('.video-popup-close'),
        videoID = `slide-video`;
  let video;

  if ($(`#${videoID}`).length > 0) {
    video = videojs(videoID);
  }

  // Functions
  const playVideo = () => {
    videoPopup.removeClass('hide');
    video.play();
  };

  const closeVideo = () => {
    videoPopup.addClass('hide');
    video.pause();
    video.currentTime(0);
  };

  // Listeners
  openVideoBtn.click(playVideo);
  closeVideoBtn.click(closeVideo);

};
