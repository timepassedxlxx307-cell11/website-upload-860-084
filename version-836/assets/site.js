(function () {
    var header = document.querySelector('.site-header');
    var navToggle = document.querySelector('.nav-toggle');

    if (header && navToggle) {
        navToggle.addEventListener('click', function () {
            header.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    Array.prototype.slice.call(document.querySelectorAll('.js-card-filter')).forEach(function (input) {
        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            Array.prototype.slice.call(document.querySelectorAll('.movie-card')).forEach(function (card) {
                var source = (card.getAttribute('data-search') || '').toLowerCase();
                card.classList.toggle('hidden-card', keyword && source.indexOf(keyword) === -1);
            });
        });
    });

    function setSearchInputsFromQuery() {
        var query = new URLSearchParams(window.location.search).get('q') || '';
        Array.prototype.slice.call(document.querySelectorAll('input[name="q"]')).forEach(function (input) {
            input.value = query;
        });
        return query.trim();
    }

    var currentQuery = setSearchInputsFromQuery();
    var resultsBox = document.getElementById('search-results');
    var statusBox = document.getElementById('search-status');

    function createSearchCard(movie) {
        var article = document.createElement('article');
        article.className = 'movie-card grid';

        var link = document.createElement('a');
        link.className = 'poster-link';
        link.href = movie.url;

        var frame = document.createElement('span');
        frame.className = 'poster-frame';

        var image = document.createElement('img');
        image.src = movie.cover;
        image.alt = movie.title;
        image.loading = 'lazy';

        var badge = document.createElement('span');
        badge.className = 'poster-badge';
        badge.textContent = movie.region;

        var play = document.createElement('span');
        play.className = 'poster-play';
        play.textContent = '▶';

        frame.appendChild(image);
        frame.appendChild(badge);
        frame.appendChild(play);
        link.appendChild(frame);

        var body = document.createElement('div');
        body.className = 'movie-card-body';

        var title = document.createElement('h3');
        var titleLink = document.createElement('a');
        titleLink.href = movie.url;
        titleLink.textContent = movie.title;
        title.appendChild(titleLink);

        var desc = document.createElement('p');
        desc.textContent = movie.oneLine || movie.genre;

        var tags = document.createElement('div');
        tags.className = 'movie-tags';
        (movie.tags || []).slice(0, 3).forEach(function (tag) {
            var span = document.createElement('span');
            span.textContent = tag;
            tags.appendChild(span);
        });

        var meta = document.createElement('div');
        meta.className = 'movie-meta';
        var type = document.createElement('span');
        type.textContent = movie.type;
        var year = document.createElement('span');
        year.textContent = movie.year;
        meta.appendChild(type);
        meta.appendChild(year);

        body.appendChild(title);
        body.appendChild(desc);
        body.appendChild(tags);
        body.appendChild(meta);
        article.appendChild(link);
        article.appendChild(body);
        return article;
    }

    function renderSearch(query) {
        if (!resultsBox || !statusBox || !window.SEARCH_INDEX) {
            return;
        }

        var normalized = query.toLowerCase();
        var list = window.SEARCH_INDEX.filter(function (movie) {
            if (!normalized) {
                return true;
            }

            var source = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' ').toLowerCase();

            return source.indexOf(normalized) !== -1;
        });

        resultsBox.innerHTML = '';
        list.slice(0, normalized ? 240 : 60).forEach(function (movie) {
            resultsBox.appendChild(createSearchCard(movie));
        });

        if (normalized) {
            statusBox.textContent = '找到 ' + list.length + ' 部相关作品';
        } else {
            statusBox.textContent = '输入关键词可搜索全站影片，当前展示推荐结果';
        }
    }

    renderSearch(currentQuery);
})();
