(function () {
  function selectVideo() {
    return document.querySelector(".movie-player-video");
  }

  function selectPoster() {
    return document.querySelector(".player-poster");
  }

  function init(source) {
    var video = selectVideo();
    var poster = selectPoster();
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (video.getAttribute("data-ready") === "yes") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute("data-ready", "yes");
    }

    function start() {
      attachSource();
      video.setAttribute("controls", "controls");
      if (poster) {
        poster.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (poster) {
      poster.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.MoviePlayer = {
    init: init
  };
})();
