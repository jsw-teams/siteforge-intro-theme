(function () {
  function text(value) {
    return value == null ? '' : String(value);
  }

  function formatDate(value, lang) {
    if (!value) return '';
    var date = new Date(value);
    if (Number.isNaN(date.valueOf())) return '';
    return new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(date);
  }

  function renderCard(post, config) {
    var article = document.createElement('article');
    article.className = 'article-card';

    var link = document.createElement('a');
    link.href = post.url;
    link.rel = 'noopener noreferrer';

    var date = formatDate(post.date, config.lang);
    if (date) {
      var meta = document.createElement('p');
      meta.className = 'article-meta';
      meta.textContent = config.published + ' ';
      var time = document.createElement('time');
      time.dateTime = post.date;
      time.textContent = date;
      meta.append(time);
      link.append(meta);
    }

    var title = document.createElement('h2');
    title.textContent = text(post.title);
    link.append(title);

    if (post.excerpt) {
      var excerpt = document.createElement('p');
      excerpt.textContent = text(post.excerpt);
      link.append(excerpt);
    }

    var more = document.createElement('span');
    more.className = 'read-more';
    more.textContent = config.readMore;
    link.append(more);
    article.append(link);
    return article;
  }

  function renderEmpty(target, title, body) {
    var box = document.createElement('div');
    box.className = 'empty-state';
    var heading = document.createElement('h2');
    heading.textContent = title;
    var copy = document.createElement('p');
    copy.textContent = body;
    box.append(heading, copy);
    target.replaceChildren(box);
  }

  document.querySelectorAll('[data-recent-posts]').forEach(function (target) {
    var config = {
      endpoint: target.dataset.endpoint,
      lang: target.dataset.lang || 'zh-CN',
      emptyTitle: target.dataset.emptyTitle || '',
      emptyText: target.dataset.emptyText || '',
      published: target.dataset.published || '',
      readMore: target.dataset.readMore || ''
    };

    fetch(config.endpoint, { headers: { accept: 'application/json' } })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (postsByLang) {
        var posts = Array.isArray(postsByLang[config.lang]) ? postsByLang[config.lang] : [];
        if (posts.length === 0) {
          renderEmpty(target, config.emptyTitle, config.emptyText);
          return;
        }
        target.replaceChildren.apply(target, posts.map(function (post) {
          return renderCard(post, config);
        }));
      })
      .catch(function () {
        renderEmpty(target, config.emptyTitle, config.emptyText);
      });
  });
})();
