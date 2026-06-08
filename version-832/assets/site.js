(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(nextIndex);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5600);
  }

  const searchInput = document.querySelector('[data-search-input]');
  const filterChips = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('.movie-card'));
  const emptyState = document.querySelector('[data-empty-state]');
  let activeFilter = 'all';

  const normalize = function (value) {
    return String(value || '').toLowerCase().trim();
  };

  const applyFilters = function () {
    const query = normalize(searchInput ? searchInput.value : '');
    let visibleCount = 0;

    cards.forEach(function (card) {
      const text = normalize(card.getAttribute('data-search') || card.textContent);
      const matchesQuery = !query || text.indexOf(query) !== -1;
      const matchesFilter = activeFilter === 'all' || text.indexOf(normalize(activeFilter)) !== -1;
      const visible = matchesQuery && matchesFilter;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visibleCount === 0);
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        searchInput.value = q;
        applyFilters();
      }
    } catch (error) {
      applyFilters();
    }
  }

  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeFilter = chip.getAttribute('data-filter') || 'all';
      filterChips.forEach(function (item) {
        item.classList.toggle('active', item === chip);
      });
      applyFilters();
    });
  });

  const players = Array.from(document.querySelectorAll('.player-frame'));
  players.forEach(function (frame) {
    const video = frame.querySelector('video');
    const overlay = frame.querySelector('.play-overlay');
    const videoUrl = frame.getAttribute('data-video-url');
    let hls = null;

    if (!video || !videoUrl) {
      return;
    }

    const prepare = function () {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      video.setAttribute('data-ready', '1');
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else {
        video.src = videoUrl;
      }
    };

    const start = function () {
      prepare();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      const playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    };

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
