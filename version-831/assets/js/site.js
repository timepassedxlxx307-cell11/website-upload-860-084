(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
        toggle.textContent = panel.classList.contains("is-open") ? "×" : "☰";
      });
    }

    var stage = document.querySelector("[data-hero-carousel]");

    if (stage) {
      var slides = Array.prototype.slice.call(stage.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(stage.querySelectorAll(".hero-dot"));
      var current = 0;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    }

    var filterRoot = document.querySelector("[data-filter-root]");

    if (filterRoot) {
      var input = filterRoot.querySelector("[data-search-input]");
      var buttons = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-filter-button]"));
      var cards = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-movie-card]"));
      var status = filterRoot.querySelector("[data-result-status]");
      var activeKind = "all";

      function update() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var kind = card.getAttribute("data-kind") || "other";
          var year = Number(card.getAttribute("data-year") || "0");
          var matchKind = activeKind === "all" || kind === activeKind || (activeKind === "latest" && year >= 2024);
          var matchText = !query || text.indexOf(query) !== -1;
          var showCard = matchKind && matchText;
          card.classList.toggle("is-hidden-card", !showCard);
          if (showCard) {
            visible += 1;
          }
        });

        if (status) {
          status.textContent = visible > 0 ? "正在显示匹配影片" : "没有找到匹配影片";
        }
      }

      if (input) {
        input.addEventListener("input", update);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeKind = button.getAttribute("data-filter-button") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          update();
        });
      });

      update();
    }
  });
})();
