function initPlayer(root) {
  var video = root.querySelector("video");
  var button = root.querySelector("[data-play-button]");
  var source = video ? video.querySelector("source") : null;
  var url = source ? source.getAttribute("src") : "";
  var attached = false;

  function attach() {
    if (!video || !url || attached) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      attached = true;
      return;
    }

    var Hls = window.Hls;

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      attached = true;
      return;
    }

    video.src = url;
    attached = true;
  }

  function play() {
    if (!video) {
      return;
    }

    attach();

    if (button) {
      button.classList.add("is-hidden");
    }

    var request = video.play();

    if (request && typeof request.catch === "function") {
      request.catch(function () {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }

  if (video) {
    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(initPlayer);
});
