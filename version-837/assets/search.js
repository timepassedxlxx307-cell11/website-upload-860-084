(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function textOf(movie) {
    return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine].concat(movie.tags || []).join(" ").toLowerCase();
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<article class=\"movie-card\">" +
      "<a class=\"movie-card-poster\" href=\"" + movie.url + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" decoding=\"async\">" +
      "<span class=\"movie-type\">" + escapeHtml(movie.type) + "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.genre.split(/[，,、/]/)[0]) + "</span></div>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function render() {
    var list = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    var status = document.getElementById("searchStatus");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var filter = "all";

    if (!input || !results || !status) {
      return;
    }

    input.value = getQuery();

    function update() {
      var q = input.value.trim().toLowerCase();
      var matches = list.filter(function (movie) {
        var inFilter = filter === "all" || movie.category === filter || movie.type.indexOf(filter) !== -1 || movie.genre.indexOf(filter) !== -1;
        var inQuery = !q || textOf(movie).indexOf(q) !== -1;
        return inFilter && inQuery;
      }).slice(0, 96);

      status.textContent = q ? "搜索结果" : "热门影片";
      results.innerHTML = matches.map(card).join("");
    }

    input.addEventListener("input", update);

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        filterButtons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        filter = button.getAttribute("data-filter") || "all";
        update();
      });
    });

    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
