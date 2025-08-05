function initDynamicSections(form) {
  if (!form) return;
  const container = form.querySelector('.dynamic-fields');
  const addBtn = form.querySelector('.add-field');
  if (!container || !addBtn) return;

  addBtn.addEventListener('click', () => {
    const group = document.createElement('div');
    group.className = 'field-group';
    group.innerHTML = '<input type="text" name="skills[]" placeholder="Skill" required />' +
                      '<button type="button" class="remove-field" aria-label="Remove">&minus;</button>';
    container.appendChild(group);
  });

  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-field')) {
      e.target.parentElement.remove();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form.dynamic-form').forEach(form => {
    initDynamicSections(form);
  });
});
