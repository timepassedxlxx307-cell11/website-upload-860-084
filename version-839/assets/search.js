(function () {
    var data = Array.isArray(window.MOVIE_SEARCH_DATA) ? window.MOVIE_SEARCH_DATA : [];
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');
    var presets = Array.prototype.slice.call(document.querySelectorAll('[data-search-preset]'));

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
            '    <span class="poster-frame">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="card-badge">' + escapeHtml(movie.year) + '</span>',
            '    </span>',
            '    <span class="card-body">',
            '        <strong>' + escapeHtml(movie.title) + '</strong>',
            '        <span class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>',
            '        <span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
            '        <span class="tag-row">' + tags + '</span>',
            '    </span>',
            '</a>'
        ].join('');
    }

    function findMatches(query) {
        var q = normalize(query);

        if (!q) {
            return data.slice(0, 60);
        }

        return data.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' '));

            return haystack.indexOf(q) !== -1;
        }).slice(0, 240);
    }

    function render(query) {
        if (!results) {
            return;
        }

        var matches = findMatches(query);

        if (count) {
            count.textContent = String(matches.length);
        }

        if (!matches.length) {
            results.innerHTML = '<div class="empty-state">未找到匹配影片</div>';
            return;
        }

        results.innerHTML = matches.map(card).join('');
    }

    function setQuery(value) {
        if (input) {
            input.value = value;
        }
        render(value);
    }

    if (input) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;
        render(initial);

        input.addEventListener('input', function () {
            render(input.value);
        });
    }

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render(input ? input.value : '');
        });
    }

    presets.forEach(function (button) {
        button.addEventListener('click', function () {
            setQuery(button.getAttribute('data-search-preset') || '');
        });
    });
}());
