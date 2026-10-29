(() => {
  const $ = (selector, element = document) => element.querySelector(selector);

  $('#y').textContent = new Date().getFullYear();

  const toast = $('#toast');
  let toastTimer;
  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  };

  $('#copy-email').addEventListener('click', async (event) => {
    const email = event.currentTarget.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied to clipboard');
    } catch {
      showToast(email);
    }
  });

  $('#contact-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const subject = encodeURIComponent(`SwiftCart question from ${form.get('name')}`);
    const body = encodeURIComponent(`${form.get('message')}\n\nFrom: ${form.get('name')} <${form.get('email')}>`);
    const mailto = `mailto:bankimbhavsar@yahoo.com?subject=${subject}&body=${body}`;
    const fallback = $('#mailto-fallback');
    fallback.href = mailto;
    fallback.hidden = false;

    // Use a real link click so the browser can hand the mailto URL to the OS.
    fallback.click();
    showToast('Opening your email app…');
  });
})();
