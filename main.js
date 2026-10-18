// Lunsford Gas Service - shared site behavior

document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initScheduleForm();
});

function initMobileNav() {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

var STEP_LABELS = {
  1: "Step 1 of 3: What's going on",
  2: 'Step 2 of 3: Your info',
  3: 'Step 3 of 3: Timing and notes'
};

function initScheduleForm() {
  var form = document.getElementById('schedule-form');
  if (!form) return;

  var serviceSelect = document.getElementById('service-type');
  var leakWarning = document.getElementById('leak-warning');
  var otherField = document.getElementById('other-detail-field');
  var status = document.getElementById('form-status');
  var steps = Array.from(form.querySelectorAll('.form-step'));
  var dots = Array.from(document.querySelectorAll('.step-dot'));
  var label = document.getElementById('wizard-label');
  var currentStep = 1;

  // Pre-fill the service dropdown from a link like schedule.html?service=gas-logs
  var params = new URLSearchParams(window.location.search);
  var preselect = params.get('service');
  if (preselect && serviceSelect) {
    var match = Array.from(serviceSelect.options).find(function (o) { return o.value === preselect; });
    if (match) serviceSelect.value = preselect;
  }

  function syncServiceUI() {
    var value = serviceSelect.value;
    if (leakWarning) leakWarning.classList.toggle('visible', value === 'gas-leak');
    if (otherField) otherField.style.display = value === 'other' ? 'block' : 'none';
  }

  function goToStep(n) {
    currentStep = n;
    steps.forEach(function (stepEl) {
      stepEl.classList.toggle('active', Number(stepEl.dataset.step) === n);
    });
    dots.forEach(function (dot) {
      var dotNum = Number(dot.dataset.dot);
      dot.classList.toggle('active', dotNum === n);
      dot.classList.toggle('done', dotNum < n);
    });
    if (label) label.textContent = STEP_LABELS[n] || '';
    form.closest('.form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validateStep(n) {
    var stepEl = steps.find(function (s) { return Number(s.dataset.step) === n; });
    if (!stepEl) return true;
    var valid = true;
    stepEl.querySelectorAll('[required]').forEach(function (field) {
      var wrapper = field.closest('.field');
      var isEmpty = !field.value || !field.value.trim();
      if (wrapper) wrapper.classList.toggle('has-error', isEmpty);
      if (isEmpty) valid = false;
    });
    if (!valid) {
      var firstError = stepEl.querySelector('.has-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return valid;
  }

  if (serviceSelect) {
    serviceSelect.addEventListener('change', syncServiceUI);
    syncServiceUI();
  }

  form.querySelectorAll('[data-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (validateStep(currentStep)) goToStep(currentStep + 1);
    });
  });

  form.querySelectorAll('[data-back]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      goToStep(currentStep - 1);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(3)) return;

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    var payload = Object.fromEntries(new FormData(form).entries());

    fetch('/api/schedule-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then(function () {
        showStatus(status, 'success', "Request received. We'll call or text you shortly to confirm a time.");
        form.reset();
        syncServiceUI();
        goToStep(1);
      })
      .catch(function () {
        showStatus(
          status,
          'error',
          "We couldn't submit that automatically. Please call us directly at (615) 445-9977 and we'll get you scheduled."
        );
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request appointment';
      });
  });
}

function showStatus(el, type, message) {
  if (!el) return;
  el.textContent = message;
  el.className = 'form-status visible ' + type;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
