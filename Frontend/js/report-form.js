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
      if (pressed) selectedCategory = btn.getAttribute('data-category') || btn.textContent.trim();

      btn.addEventListener('click', () => {
        buttons.forEach((b) => {
          b.classList.remove('selected');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
        selectedCategory = btn.getAttribute('data-category') || btn.textContent.trim();
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

      submitBtn.disabled = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = 'Posting…';

      try {
        // Step 1: if a photo was picked, upload it first - upload.php only
        // accepts multipart file uploads and hands back a photo_url that
        // create_item.php can store.
        let photo_path = '';
        if (selectedFile) {
          const uploadData = new FormData();
          uploadData.append('photo', selectedFile);

          const uploadRes = await fetch('../../Backend/api/upload.php', {
            method: 'POST',
            credentials: 'include',
            body: uploadData
          });
          const uploadResult = await uploadRes.json();

          if (!uploadResult.success) {
            throw new Error(uploadResult.error || 'Photo upload failed.');
          }
          photo_path = uploadResult.photo_url;
        }

        // Step 2: create the item. create_item.php expects JSON with these
        // exact keys (type/category/title/description/location/
        // location_detail/date_occurred/time_occurred/item_held_at/photo_path).
        const payload = {
          type: isFoundForm ? 'found' : 'lost',
          category: selectedCategory,
          title: document.getElementById('item-name').value.trim(),
          description: document.getElementById('item-desc').value.trim(),
          location: document.getElementById('location').value,
          location_detail: document.getElementById('location-detail')?.value.trim() || '',
          date_occurred: document.getElementById(isFoundForm ? 'date-found' : 'date-lost').value,
          time_occurred: document.getElementById(isFoundForm ? 'time-found' : 'time-lost')?.value || '',
          item_held_at: isFoundForm ? document.getElementById('item-location').value : '',
          photo_path,
        };

        const res = await fetch('../../Backend/api/create_item.php', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
          formCard.innerHTML = `
            <div style="text-align:center; padding: 32px 8px;">
              <div style="font-size:2.5rem; margin-bottom:8px;">✅</div>
              <h3 style="margin-bottom:6px;">Posted!</h3>
              <p style="color:var(--text-muted); font-size:0.9rem;">
                We'll notify you the moment someone reports a matching
                ${isFoundForm ? 'lost' : 'found'} item.
              </p>
            </div>
          `;
        } else {
          alert(data.error || 'Failed to submit your post. Please try again.');
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
        alert(err.message || 'Network error — please verify connection parameters and try again.');
      }
    });
  }
});