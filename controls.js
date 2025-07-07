window.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.sidebar-content input, .sidebar-content select, .sidebar-content button');

  // add knob styling for range inputs
  document.querySelectorAll('input[type="range"]').forEach(r => {
    r.classList.add('knob');
    const update = () => r.style.setProperty('--val', r.value * 100 / (r.max - r.min));
    r.addEventListener('input', update);
    update();
  });

  elements.forEach(el => {
    const handler = () => {
      const message = {id: el.id, value: el.value, checked: el.checked, tag: el.tagName, type: el.type};
      if (window.opener) {
        window.opener.postMessage(message, '*');
      }
    };
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
    if (el.tagName === 'BUTTON') {
      el.addEventListener('click', handler);
    }
  });
});
