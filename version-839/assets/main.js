(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var list = document.querySelector('[data-card-list]');
    var searchInput = document.querySelector('[data-list-search]');
    var resultCount = document.querySelector('[data-result-count]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyListFilter() {
        if (!list) {
            return;
        }

        var keyword = normalize(searchInput ? searchInput.value : '');
        var activeButton = document.querySelector('[data-filter-button].active');
        var filter = activeButton ? activeButton.getAttribute('data-filter-button') : 'all';
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var type = card.getAttribute('data-type') || '';
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchFilter = filter === 'all' || type === filter;
            var show = matchKeyword && matchFilter;

            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });

        if (resultCount) {
            resultCount.textContent = String(visible);
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyListFilter);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            filterButtons.forEach(function (item) {
                item.classList.remove('active');
            });
            button.classList.add('active');
            applyListFilter();
        });
    });

    applyListFilter();
}());
