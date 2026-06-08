(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobileMenu = document.querySelector('.mobile-menu');

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    var slides = selectAll('.hero-slide');
    var dots = selectAll('[data-hero-dot]');
    var arrows = selectAll('[data-hero-dir]');
    var current = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }

      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    arrows.forEach(function (arrow) {
      arrow.addEventListener('click', function () {
        var direction = arrow.getAttribute('data-hero-dir') === 'next' ? 1 : -1;
        showSlide(current + direction);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var searchInput = document.querySelector('.site-search');
    var cards = selectAll('[data-filter-card]');
    var buttons = selectAll('[data-filter-value]');
    var activeValue = 'all';

    function searchableText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';

      cards.forEach(function (card) {
        var region = card.getAttribute('data-region') || '';
        var type = card.getAttribute('data-type') || '';
        var genre = card.getAttribute('data-genre') || '';
        var bucket = card.getAttribute('data-bucket') || '';
        var matchesButton = activeValue === 'all' || activeValue === region || activeValue === type || activeValue === genre || activeValue === bucket;
        var matchesSearch = !query || searchableText(card).indexOf(query) !== -1;
        card.hidden = !(matchesButton && matchesSearch);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeValue = button.getAttribute('data-filter-value') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });
  });

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector('[data-player="movie"]');
    var cover = document.querySelector('.watch-cover');
    var playButton = document.querySelector('#play-button');
    var hlsInstance = null;
    var hasStarted = false;

    if (!video || !streamUrl) {
      return;
    }

    function reveal() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
    }

    function attachStream() {
      if (hasStarted) {
        reveal();
        var replay = video.play();
        if (replay && typeof replay.catch === 'function') {
          replay.catch(function () {});
        }
        return;
      }

      hasStarted = true;
      reveal();

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', attachStream);
    }

    if (playButton && playButton !== cover) {
      playButton.addEventListener('click', attachStream);
    }

    video.addEventListener('click', function () {
      if (!hasStarted) {
        attachStream();
      }
    });

    video.addEventListener('play', reveal);

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
