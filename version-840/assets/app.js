(function () {
  var hlsPromise = null;
  var hlsUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = hlsUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        show(current);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-filter-section]"));
    sections.forEach(function (section) {
      var scope = section.parentElement || document;
      var input = section.querySelector("[data-search-input]");
      var region = section.querySelector("[data-filter-region]");
      var type = section.querySelector("[data-filter-type]");
      var year = section.querySelector("[data-filter-year]");
      var status = section.querySelector("[data-filter-status]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      function apply() {
        var query = normalize(input && input.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.tags,
            card.textContent
          ].join(" "));
          var matched = true;
          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }
          if (regionValue && normalize(card.dataset.region) !== regionValue) {
            matched = false;
          }
          if (typeValue && normalize(card.dataset.type) !== typeValue) {
            matched = false;
          }
          if (yearValue && normalize(card.dataset.year) !== yearValue) {
            matched = false;
          }
          card.hidden = !matched;
        });
        if (status) {
          status.textContent = query || regionValue || typeValue || yearValue ? "筛选结果已更新。" : "输入片名、题材或标签，快速定位想看的影片。";
        }
      }
      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupImages() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      }, { once: true });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-video-url]");
      var shell = player.querySelector(".video-shell");
      if (!video || !button || !shell) {
        return;
      }
      var started = false;
      function play() {
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        var url = button.getAttribute("data-video-url");
        shell.classList.add("is-playing");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          video.play().catch(function () {
            shell.classList.remove("is-playing");
          });
          return;
        }
        loadHls().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {
                shell.classList.remove("is-playing");
              });
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                shell.classList.remove("is-playing");
              }
            });
          } else {
            shell.classList.remove("is-playing");
          }
        }).catch(function () {
          shell.classList.remove("is-playing");
        });
      }
      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!started) {
          play();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupImages();
    setupPlayers();
  });
})();
