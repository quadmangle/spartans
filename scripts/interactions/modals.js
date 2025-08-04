/**
 * @fileoverview Manages all modal interactions: opening, closing, and dragging.
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeModal(modal) {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

function setupModalDragging(modal) {
  const handle = modal.querySelector('.draggable-handle');
  if (!handle) return;

  let isDragging = false;
  let offsetX, offsetY;

  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - modal.getBoundingClientRect().left;
    offsetY = e.clientY - modal.getBoundingClientRect().top;
    modal.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const newLeft = e.clientX - offsetX;
    const newTop = e.clientY - offsetY;
    modal.style.left = `${newLeft}px`;
    modal.style.top = `${newTop}px`;
    modal.style.transform = 'none';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    modal.style.cursor = 'grab';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Close modals when the 'x' button is clicked or backdrop is clicked
  document.querySelectorAll('.close-modal, .modal-backdrop').forEach(element => {
    element.addEventListener('click', (e) => {
      // Check if the click was directly on the backdrop or the close button
      if (e.target.classList.contains('close-modal') || e.target.classList.contains('modal-backdrop')) {
        const modal = e.target.closest('.modal-backdrop');
        if (modal) {
          closeModal(modal);
        }
      }
    });
  });

  // Handle ESC key to close all modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.show').forEach(modal => closeModal(modal));
    }
  });

  // Set up dragging for all modals
  document.querySelectorAll('.ops-modal').forEach(modal => {
    setupModalDragging(modal);
  });
});
