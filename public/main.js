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

  const contactForm = $('#contact-form');
  const submitBtn = $('#contact-submit');
  const status = $('#form-status');
  const setStatus = (text, kind = '') => {
    status.textContent = text;
    status.className = `form-note ${kind}`.trim();
  };

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(contactForm));
    const label = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    setStatus('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) throw new Error(result.error || 'Something went wrong. Please try again.');

      contactForm.reset();
      setStatus("Thanks! Your message was sent. We'll be in touch soon.", 'ok');
      showToast('Message sent ✅');
    } catch (err) {
      setStatus(err.message || 'Something went wrong. Please try again.', 'err');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = label;
    }
  });
})();
