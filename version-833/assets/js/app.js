(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupForms();
        setupFilters();
        setupPlayers();
    });

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = parseInt(dot.getAttribute("data-hero-dot"), 10) || 0;
                show(next);
                start();
            });
        });

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function setupForms() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var globalInputs = document.querySelectorAll("form[data-search-form] input[name='q']");
        globalInputs.forEach(function (input) {
            if (query) {
                input.value = query;
            }
        });
        var localInput = document.querySelector("[data-filter-input]");
        if (localInput && query) {
            localInput.value = query;
            applyFilters();
        }
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filters]");
        if (!panel) {
            return;
        }
        var controls = panel.querySelectorAll("input, select");
        controls.forEach(function (control) {
            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        });
        applyFilters();
    }

    function applyFilters() {
        var input = document.querySelector("[data-filter-input]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var cards = document.querySelectorAll("[data-movie-card]");
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var type = typeSelect ? typeSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";

        cards.forEach(function (card) {
            var search = (card.getAttribute("data-search") || "").toLowerCase();
            var cardType = card.getAttribute("data-type") || "";
            var cardYear = card.getAttribute("data-year") || "";
            var matched = true;
            if (keyword && search.indexOf(keyword) === -1) {
                matched = false;
            }
            if (type && cardType !== type) {
                matched = false;
            }
            if (year && cardYear.indexOf(year) === -1) {
                matched = false;
            }
            card.classList.toggle("is-hidden", !matched);
        });
    }

    function setupPlayers() {
        var players = document.querySelectorAll("[data-player]");
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            if (!video) {
                return;
            }
            var mediaUrl = video.getAttribute("data-video") || "";
            var prepared = false;
            var hlsInstance = null;

            function prepare() {
                if (prepared || !mediaUrl) {
                    return;
                }
                prepared = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = mediaUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(mediaUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = mediaUrl;
                }
            }

            function play() {
                prepare();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }

            prepare();
            if (cover) {
                cover.addEventListener("click", play);
            }
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }
})();
