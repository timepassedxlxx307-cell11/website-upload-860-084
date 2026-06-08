(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<a class="movie-card" href="" + escapeHtml(movie.url) + "" data-movie-card>" +
      "<span class="poster-frame">" +
      "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">" +
      "<span class="poster-badge">" + escapeHtml(movie.year) + "</span>" +
      "</span>" +
      "<span class="movie-info">" +
      "<strong>" + escapeHtml(movie.title) + "</strong>" +
      "<em>" + escapeHtml(movie.oneLine) + "</em>" +
      "<span class="movie-tags">" + tags + "</span>" +
      "<span class="movie-meta">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.genre) + "</span>" +
      "</span>" +
      "</a>";
  }

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (navToggle && mobileMenu) {
      navToggle.addEventListener("click", function () {
        mobileMenu.classList.toggle("open");
      });
    }

    document.querySelectorAll("form[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === currentSlide);
      });
    }

    if (slides.length) {
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });
      window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 6200);
    }

    document.querySelectorAll("[data-filter-button]").forEach(function (button) {
      button.addEventListener("click", function () {
        var group = button.closest("[data-filter-group]");
        var value = button.getAttribute("data-filter-value");
        var field = button.getAttribute("data-filter-field") || "type";
        if (!group) {
          return;
        }
        group.querySelectorAll("[data-filter-button]").forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        group.querySelectorAll("[data-movie-card]").forEach(function (card) {
          if (value === "all" || card.getAttribute("data-" + field) === value) {
            card.classList.remove("is-hidden");
          } else {
            card.classList.add("is-hidden");
          }
        });
      });
    });

    var searchRoot = document.querySelector("[data-search-results]");
    if (searchRoot) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      var input = document.querySelector("[data-search-input]");
      var title = document.querySelector("[data-search-title]");
      if (input) {
        input.value = query;
      }
      if (title && query) {
        title.textContent = "搜索：" + query;
      }
      var normalized = normalizeText(query);
      if (!normalized) {
        searchRoot.innerHTML = "<div class="empty-state">请输入片名、地区、类型或关键词进行搜索。</div>";
        return;
      }
      var data = window.SEARCH_MOVIES || [];
      var results = data.filter(function (movie) {
        var target = [movie.title, movie.oneLine, movie.region, movie.type, movie.genre, (movie.tags || []).join(" ")].join(" ");
        return normalizeText(target).indexOf(normalized) !== -1;
      }).slice(0, 120);
      if (!results.length) {
        searchRoot.innerHTML = "<div class="empty-state">没有找到匹配的影视作品。</div>";
        return;
      }
      searchRoot.innerHTML = "<div class="movie-grid">" + results.map(movieCard).join("") + "</div>";
    }
  });
})();
