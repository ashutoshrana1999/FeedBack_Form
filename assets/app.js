(function () {
  // Adjust this to match your repository folder name if different:
  const REPO_NAME = 'FeedBack_Form';

  // Utility: escape for safe DOM insertion
  function escapeHtml(s) {
    return (s || '').replace(/[&<>\"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  // Parse path segments
  // e.g. /FeedBack_Form/project-type/project-code
  const segments = location.pathname.split('/').filter(Boolean); // removes empty strings
  let projectType = null;
  let projectCode = null;

  const repoIndex = segments.indexOf(REPO_NAME);
  if (repoIndex >= 0) {
    projectType = segments[repoIndex + 1] || null;
    projectCode = segments[repoIndex + 2] || null;
  } else {
    // fallback: if your Pages is served such that the repo name is not present in pathname
    if (segments.length >= 2) {
      projectType = segments[0];
      projectCode = segments[1];
    }
  }

  const app = document.getElementById('app') || document.body;
  const nav = document.getElementById('nav');

  // Optional: small nav example (you can remove)
  if (nav) {
    nav.innerHTML = '<a href="/">Home</a> <a href="/' + REPO_NAME + '/sample-type/ABC123">Example: sample-type/ABC123</a>';
  }

  if (projectType && projectCode) {
    renderProject(projectType, projectCode);
  } else {
    renderLanding();
  }

  function renderLanding() {
    app.innerHTML = [
      '<h2>Welcome</h2>',
      '<p class="muted">Open a URL with the pattern: <code>/' + REPO_NAME + '/&lt;project-type&gt;/&lt;project-code&gt;</code></p>',
      '<div class="field"><label for="pt">Project type</label><input id="pt" placeholder="e.g. web-app"></div>',
      '<div class="field"><label for="pc">Project code</label><input id="pc" placeholder="e.g. PROJ001"></div>',
      '<button id="go">Open feedback page</button>'
    ].join('');
    const go = document.getElementById('go');
    go.addEventListener('click', function () {
      const pt = document.getElementById('pt').value.trim();
      const pc = document.getElementById('pc').value.trim();
      if (!pt || !pc) return alert('Enter project type and code');
      // navigate to the constructed url
      location.pathname = '/' + REPO_NAME + '/' + encodeURIComponent(pt) + '/' + encodeURIComponent(pc);
    });
  }

  function renderProject(pt, pc) {
    const safePt = escapeHtml(pt);
    const safePc = escapeHtml(pc);

    app.innerHTML = [
      '<h2>Feedback for <em>' + safePt + '</em> / <strong>' + safePc + '</strong></h2>',
      '<form id="feedbackForm">',
      '<div class="field"><label for="name">Your name</label><input id="name" name="name" required/></div>',
      '<div class="field"><label for="email">Email (optional)</label><input id="email" name="email" type="email"/></div>',
      '<div class="field"><label for="rating">Rating</label><select id="rating" name="rating"><option value="">Choose</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></div>',
      '<div class="field"><label for="comments">Comments</label><textarea id="comments" name="comments" rows="6" placeholder="Write your feedback here..."></textarea></div>',
      '<input type="hidden" name="projectType" value="' + safePt + '"/>
      <input type="hidden" name="projectCode" value="' + safePc + '"/>
      <button type="submit">Submit feedback</button>',
      '</form>',
      '<div id="result" style="margin-top:12px"></div>'
    ].join('');

    const form = document.getElementById('feedbackForm');
    const result = document.getElementById('result');

    // Simple submit handler: store in localStorage (for demonstration).
    // Replace this with a fetch() to your real backend or a Google Form webhook to persist results.
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const data = {
        projectType: pt,
        projectCode: pc,
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        rating: form.rating.value,
        comments: form.comments.value.trim(),
        timestamp: new Date().toISOString()
      };
      try {
        const key = 'feedback::' + pt + '::' + pc;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(data);
        localStorage.setItem(key, JSON.stringify(existing));
        result.innerHTML = '<div class="muted">Thanks — feedback saved locally in your browser. To collect centrally, wire the form to a server/API.</div>';
        form.reset();
      } catch (e) {
        console.error(e);
        result.textContent = 'Failed to save feedback: ' + e.message;
      }
    });
  }
})();
