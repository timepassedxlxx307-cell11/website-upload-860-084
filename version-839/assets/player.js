import { H as Hls } from './hls-vendor-dru42stk.js';

function setupVideo(video, message) {
    var source = video.getAttribute('data-src');

    if (!source || video.dataset.ready === '1') {
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.dataset.ready = '1';
        return;
    }

    if (Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video.dataset.ready = '1';

        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && message) {
                message.textContent = '视频加载失败，请稍后重试';
                message.classList.add('is-visible');
            }
        });

        return;
    }

    if (message) {
        message.textContent = '当前浏览器暂不支持视频播放';
        message.classList.add('is-visible');
    }
}

function startVideo(wrapper) {
    var video = wrapper.querySelector('video');
    var overlay = wrapper.querySelector('[data-player-start]');
    var message = wrapper.querySelector('[data-player-message]');

    if (!video) {
        return;
    }

    setupVideo(video, message);

    if (overlay) {
        overlay.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
            if (message) {
                message.textContent = '点击播放器即可继续播放';
                message.classList.add('is-visible');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (wrapper) {
        var video = wrapper.querySelector('video');
        var overlay = wrapper.querySelector('[data-player-start]');
        var message = wrapper.querySelector('[data-player-message]');

        if (video) {
            setupVideo(video, message);

            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                if (message) {
                    message.classList.remove('is-visible');
                }
            });

            video.addEventListener('click', function () {
                if (video.paused) {
                    startVideo(wrapper);
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                startVideo(wrapper);
            });
        }
    });
});
