document.addEventListener('DOMContentLoaded', () => {
  const formCard = document.querySelector('.form-card');
  if (!formCard) return;

  const isFoundForm = !!document.getElementById('item-location');

  const categoryGrid = formCard.querySelector('.category-grid');
  let selectedCategory = null;

  if (categoryGrid) {
    const buttons = categoryGrid.querySelectorAll('.category-btn');
    buttons.forEach((btn) => {
      const pressed = btn.classList.contains('selected');
      btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      if (pressed) selectedCategory = btn.textContent.trim();

      btn.addEventListener('click', () => {
        buttons.forEach((b) => {
          b.classList.remove('selected');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
        selectedCategory = btn.textContent.trim();
        categoryGrid.style.outline = '';
      });
    });
  }

  const uploadZone = formCard.querySelector('.upload-zone');
  let selectedFile = null;

  if (uploadZone) {
    const originalHTML = uploadZone.innerHTML;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png, image/jpeg, image/heic';
    fileInput.style.display = 'none';
    uploadZone.appendChild(fileInput);

    const openPicker = () => fileInput.click();

    uploadZone.addEventListener('click', openPicker);
    uploadZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPicker();
      }
    });
    fileInput.addEventListener('click', (e) => e.stopPropagation());

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        alert('That photo is over 10 MB — please choose a smaller file.');
        fileInput.value = '';
        return;
      }

      selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadZone.innerHTML = '';
        uploadZone.appendChild(fileInput);

        const preview = document.createElement('img');
        preview.src = e.target.result;
        preview.alt = 'Selected photo preview';
        Object.assign(preview.style, {
          maxWidth: '160px',
          maxHeight: '160px',
          borderRadius: '8px',
          display: 'block',
          margin: '0 auto 8px',
          objectFit: 'cover',
        });

        const fileName = document.createElement('p');
        fileName.textContent = file.name;
        fileName.style.fontSize = '0.8rem';
        fileName.style.fontWeight = '600';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Remove photo';
        Object.assign(removeBtn.style, {
          fontSize: '0.78rem',
          color: '#dc2626',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textDecoration: 'underline',
        });
        removeBtn.addEventListener('click', (evt) => {
          evt.stopPropagation();
          selectedFile = null;
          fileInput.value = '';
          uploadZone.innerHTML = originalHTML;
          uploadZone.appendChild(fileInput);
        });

        uploadZone.appendChild(preview);
        uploadZone.appendChild(fileName);
        uploadZone.appendChild(removeBtn);
      };
      reader.readAsDataURL(file);
    });
  }

  function showFieldError(field, message) {
    clearFieldError(field);
    field.style.borderColor = '#dc2626';
    const error = document.createElement('small');
    error.className = 'field-error';
    error.textContent = message;
    error.style.color = '#dc2626';
    error.style.display = 'block';
    error.style.marginTop = '4px';
    field.insertAdjacentElement('afterend', error);
  }

  function clearFieldError(field) {
    field.style.borderColor = '';
    const next = field.nextElementSibling;
    if (next && next.classList.contains('field-error')) next.remove();
  }

  function validate() {
    const invalidFields = [];

    const requiredIds = [
      'item-name',
      'item-desc',
      'location',
      'your-name',
      'your-email',
      isFoundForm ? 'item-location' : null,
      isFoundForm ? 'date-found' : 'date-lost',
    ].filter(Boolean);

    requiredIds.forEach((id) => {
      const field = document.getElementById(id);
      if (!field) return;
      if (!field.value || !field.value.trim()) {
        showFieldError(field, 'This field is required.');
        invalidFields.push(field);
      } else {
        clearFieldError(field);
      }
    });

    const emailField = document.getElementById('your-email');
    if (emailField && emailField.value.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailField.value.trim())) {
        showFieldError(emailField, 'Enter a valid email address.');
        invalidFields.push(emailField);
      }
    }

    if (categoryGrid) {
      if (!selectedCategory) {
        categoryGrid.style.outline = '2px solid #dc2626';
        categoryGrid.style.outlineOffset = '4px';
        invalidFields.unshift(categoryGrid);
      } else {
        categoryGrid.style.outline = '';
      }
    }

    return { valid: invalidFields.length === 0, firstInvalid: invalidFields[0] || null };
  }

  const submitBtn = formCard.querySelector('.form-submit-area button');

  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const { valid, firstInvalid } = validate();

      if (!valid) {
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (typeof firstInvalid.focus === 'function') firstInvalid.focus({ preventScroll: true });
        }
        return;
      }