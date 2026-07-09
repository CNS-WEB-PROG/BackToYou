document.addEventListener('DOMContentLoaded', () => {
  const registerBtn = document.querySelector('.btn--primary.btn--lg.btn--block');
  const firstEl = document.getElementById('first-name');
  const lastEl = document.getElementById('last-name');
  const emailEl = document.getElementById('email');
  const gradeEl = document.getElementById('grade');
  const passEl = document.getElementById('password');
  const confirmEl = document.getElementById('confirm-password');

  if (!registerBtn || !firstEl || !lastEl || !emailEl || !gradeEl || !passEl || !confirmEl) return;

  registerBtn.addEventListener('click', async () => {
    const name = (firstEl.value.trim() + ' ' + lastEl.value.trim()).trim();
    const email = emailEl.value.trim();
    const grade = gradeEl.value;
    const password = passEl.value;
    const confirm = confirmEl.value;

    if (!name) return alert('Please enter your name.');
    if (!email) return alert('Please enter your email.');
    if (!password) return alert('Please enter a password.');
    if (password.length < 8) return alert('Password must be at least 8 characters.');
    if (password !== confirm) return alert('Passwords do not match.');

    registerBtn.disabled = true;
    registerBtn.textContent = 'Creating account…';

    try {
      const res = await fetch('/backtoyou/Backend/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          student_id: document.getElementById('student-id').value.trim(),
          email,
          password,
          phone: document.getElementById('phone').value.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem('bty_name', name);
        window.location.href = 'dashboard.html';
      } else {
        alert(data.error || 'Registration failed. Please try again.');
        registerBtn.disabled = false;
        registerBtn.textContent = 'Create account';
      }
    } catch (err) {
      alert('Network error — please try again.');
      registerBtn.disabled = false;
      registerBtn.textContent = 'Create account';
    }
  });
});