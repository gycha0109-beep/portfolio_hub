(() => {
  const byId = (id) => document.getElementById(id);

  const filterToggle = byId('filterToggle');
  const filterPanel = byId('filterPanel');
  if (filterToggle && filterPanel) {
    filterToggle.addEventListener('click', () => {
      filterPanel.hidden = !filterPanel.hidden;
      filterToggle.setAttribute('aria-expanded', filterPanel.hidden ? 'false' : 'true');
    });
  }

  const modal = byId('demoModal');
  const openModal = byId('openModal');
  const openInlineModal = byId('openInlineModal');
  const closeModal = byId('closeModal');
  const modalCancel = byId('modalCancel');

  const setModal = (open) => {
    if (!modal) return;
    modal.classList.toggle('open', open);
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
  };

  [openModal, openInlineModal].filter(Boolean).forEach((button) => {
    button.addEventListener('click', () => setModal(true));
  });
  [closeModal, modalCancel].filter(Boolean).forEach((button) => {
    button.addEventListener('click', () => setModal(false));
  });
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) setModal(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setModal(false);
  });

  const sidebar = byId('sidebar');
  byId('sidebarToggle')?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
  });

  document.querySelectorAll('.switch').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const enabled = toggle.classList.toggle('on');
      toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    });
  });

  const toast = byId('toast');
  let toastTimer;
  const showToast = () => {
    if (!toast) return;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1600);
  };

  byId('saveForm')?.addEventListener('click', showToast);
  byId('saveSettings')?.addEventListener('click', showToast);
})();
