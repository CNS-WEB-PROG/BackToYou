document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('.btn--primary.btn--lg.btn--block');
  const emailEl = document.getElementById('email');
  const passEl = document.getElementById('password');

  if (!loginBtn || !emailEl || !passEl) return;

  loginBtn.addEventListener('click', async () => {
    const email = emailEl.value.trim();
    const password = passEl.value;

    if (!email || !password) {
      alert('Please enter your email and password.');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in…';

    try {
      const res = await fetch('/../Backend/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem('bty_name', data.name);
        window.location.href = 'dashboard.html';
      } else {
        alert(data.error || 'Incorrect email or password.');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Log in';
      }
    } catch (err) {
      alert('Network error — please try again.');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Log in';
      console.error(err);
    }
  });

  [emailEl, passEl].forEach(el =>
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') loginBtn.click();
    })
  );
});
