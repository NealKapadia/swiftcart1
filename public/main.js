document.getElementById('y').textContent = new Date().getFullYear();
const form = document.getElementById('waitlist-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  // TODO: send the email to a real backend (e.g. a Worker + D1, Formspree, etc.)
  form.innerHTML = '<p class="thanks">Thanks! You\'re on the list. 🎉</p>';
});
