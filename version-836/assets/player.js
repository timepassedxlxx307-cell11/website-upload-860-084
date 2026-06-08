(function () {
    var video = document.getElementById('movie-player');
    var cover = document.querySelector('.player-cover');
    var playButton = document.querySelector('.player-play-button');
    var configElement = document.getElementById('player-config');

    if (!video || !configElement) {
        return;
    }

    var config = JSON.parse(configElement.textContent || '{}');
    var loaded = false;
    var hls = null;

    function loadSource() {
        if (loaded || !config.src) {
            return;
        }

        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(config.src);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = config.src;
        } else {
            video.src = config.src;
        }
    }

    function startPlayback() {
        loadSource();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    if (cover) {
        cover.addEventListener('click', startPlayback);
    }

    if (playButton) {
        playButton.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            startPlayback();
        });
    }

    video.addEventListener('click', function () {
        if (!loaded || video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
})();
