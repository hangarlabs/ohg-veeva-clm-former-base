/*
 * Audio Player Modules
 */
export default () => {

  // Variables
  const audioPlayer = $('.audio-player');

  // Functions
  const toggleAudio = (audio) => {
    if(audio.paused) {
      audio.play();  
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
    
  };

  // Asign listener to cta for each audio present on the slide
  $.each(audioPlayer, function(){
    const $this = $(this),
        currentAudioCta = $this.find('.audio-cta'),
        currentAudioSrc = $this.find('.audio-file');

      currentAudioCta.on('click', function(){
        toggleAudio(currentAudioSrc[0]);
      });
  });

};
