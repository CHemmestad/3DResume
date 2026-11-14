const contactForm = document.querySelector('#contactForm');
const contactSubmit = document.querySelector('#contactSubmit');
const contactModalBody = document.querySelector('#contactModalBody');
const contactEndpoint = import.meta.env.VITE_CONTACT_ENDPOINT || '/api/contact';
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const turnstileAction = 'contact';
const verificationStatus = document.querySelector('#contactVerificationStatus');
const verificationRetry = document.querySelector('#contactVerificationRetry');
let contactTurnstileWidgetId = null;

initCharacterCounts();
initContactTurnstile();
verificationRetry?.addEventListener('click', resetTurnstile);

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.classList.add('was-validated');
      return;
    }

    const formData = new FormData(contactForm);
    const turnstileToken = formData.get('cf-turnstile-response')?.trim();

    if (!turnstileToken) {
      setContactStatus('Please complete the verification check before sending.');
      showContactModal();
      return;
    }

    const payload = {
      name: formData.get('name')?.trim(),
      email: formData.get('email')?.trim(),
      subject: formData.get('subject')?.trim(),
      message: formData.get('message')?.trim(),
      website: formData.get('website')?.trim(),
      turnstileToken,
    };

    setContactStatus('Sending message...');
    setContactSubmitDisabled(true);

    try {
      const response = await fetch(contactEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Message failed to send.');
      }

      contactForm.reset();
      updateCharacterCounts();
      contactForm.classList.remove('was-validated');
      setContactStatus('Message sent. Thanks for reaching out!');
    } catch (error) {
      setContactStatus(error.message || 'Message failed to send. Please try again later.');
    } finally {
      setContactSubmitDisabled(false);
      resetTurnstile();
      showContactModal();
    }
  });
}

function initContactTurnstile() {
  if (!contactForm) return;
  if (!turnstileSiteKey) {
    setVerificationStatus('Verification is unavailable. Please use the email link above to get in touch.');
    return;
  }

  if (window.turnstile) {
    renderContactTurnstile();
    return;
  }

  const script = document.querySelector('#turnstileScript');
  const loadTimeout = window.setTimeout(handleLoadFailure, 15000);
  function handleLoadFailure() {
    window.clearTimeout(loadTimeout);
    setVerificationStatus('Verification could not load. Refresh the page or use the email link above.');
  }
  script?.addEventListener('load', () => {
    window.clearTimeout(loadTimeout);
    renderContactTurnstile();
  }, { once: true });
  script?.addEventListener('error', handleLoadFailure, { once: true });
  setVerificationStatus('Loading verification…');
}

function setVerificationStatus(message, canRetry = false) {
  if (verificationStatus) verificationStatus.textContent = message;
  if (verificationRetry) verificationRetry.hidden = !canRetry;
}

function renderContactTurnstile() {
  const container = document.querySelector('#contactTurnstile');
  if (!container || !window.turnstile || !turnstileSiteKey || contactTurnstileWidgetId !== null) {
    return;
  }

  setVerificationStatus('');
  try {
    contactTurnstileWidgetId = window.turnstile.render(container, {
      sitekey: turnstileSiteKey,
      action: turnstileAction,
      retry: 'never',
      'refresh-expired': 'manual',
      'refresh-timeout': 'manual',
      callback: () => setVerificationStatus(''),
      'error-callback': (code) => {
        setVerificationStatus(`Verification failed (${code}). Retry or use the email link above.`, true);
        return true;
      },
      'expired-callback': () => setVerificationStatus('Verification expired. Please retry.', true),
      'timeout-callback': () => setVerificationStatus('Verification timed out. Please retry.', true),
      'unsupported-callback': () => setVerificationStatus('Verification is unsupported in this browser. Please use the email link above.'),
    });
  } catch {
    setVerificationStatus('Verification could not start. Refresh the page or use the email link above.');
  }
}

function setContactStatus(message) {
  if (contactModalBody) {
    contactModalBody.textContent = message;
  }
}

function setContactSubmitDisabled(isDisabled) {
  if (contactSubmit) {
    contactSubmit.disabled = isDisabled;
  }
}

function showContactModal() {
  const modalElement = document.querySelector('#exampleModal');
  if (modalElement && window.bootstrap) {
    window.bootstrap.Modal.getOrCreateInstance(modalElement).show();
  }
}

function resetTurnstile() {
  if (window.turnstile && contactTurnstileWidgetId !== null) {
    setVerificationStatus('');
    window.turnstile.reset(contactTurnstileWidgetId);
  }
}

function initCharacterCounts() {
  document.querySelectorAll('[data-character-count-for]').forEach((counter) => {
    const field = document.querySelector(`#${counter.dataset.characterCountFor}`);
    if (!field) {
      return;
    }

    field.addEventListener('input', updateCharacterCounts);
  });

  updateCharacterCounts();
}

function updateCharacterCounts() {
  document.querySelectorAll('[data-character-count-for]').forEach((counter) => {
    const field = document.querySelector(`#${counter.dataset.characterCountFor}`);
    if (!field) {
      return;
    }

    counter.textContent = `${field.value.length} / ${field.maxLength}`;
  });
}

