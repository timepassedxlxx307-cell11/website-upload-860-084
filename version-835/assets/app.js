(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".site-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector(".hero-prev");
        var next = root.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5600);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initFilters() {
        var roots = document.querySelectorAll("[data-filter-root]");
        roots.forEach(function (root) {
            var input = root.querySelector("[data-search-input]");
            var selects = Array.prototype.slice.call(root.querySelectorAll("[data-filter]"));
            var container = root.parentElement;
            var cards = Array.prototype.slice.call(container.querySelectorAll("[data-search-card]"));
            var empty = container.querySelector("[data-empty-state]");
            function apply() {
                var query = normalize(input ? input.value : "");
                var activeFilters = selects.map(function (select) {
                    return {
                        key: select.getAttribute("data-filter"),
                        value: normalize(select.value)
                    };
                }).filter(function (item) {
                    return item.value;
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.textContent
                    ].join(" "));
                    var passQuery = !query || text.indexOf(query) !== -1;
                    var passFilters = activeFilters.every(function (item) {
                        return normalize(card.getAttribute("data-" + item.key)).indexOf(item.value) !== -1;
                    });
                    var pass = passQuery && passFilters;
                    card.classList.toggle("is-filtered-out", !pass);
                    if (pass) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            apply();
        });
    }

    window.setupPlayer = function (source) {
        ready(function () {
            var shell = document.querySelector("[data-player-shell]");
            var video = document.querySelector(".movie-video");
            var button = document.querySelector(".play-button");
            if (!shell || !video || !button || !source) {
                return;
            }
            var hls = null;
            function load() {
                if (video.getAttribute("data-ready") === "yes") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.setAttribute("data-ready", "yes");
            }
            function start() {
                load();
                button.classList.add("is-hidden");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        button.classList.remove("is-hidden");
                    });
                }
            }
            button.addEventListener("click", function (event) {
                event.preventDefault();
                start();
            });
            shell.addEventListener("click", function (event) {
                if (event.target === video) {
                    return;
                }
                start();
            });
            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    button.classList.remove("is-hidden");
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
