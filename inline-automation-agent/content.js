(function () {
  'use strict';

  let floatingBtn = null;
  let activeSelectionData = null;
  const BACKEND_URL = 'http://localhost:8000/api/doubt';

  const SPARKS_ICON = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>`;
  const MINIMIZE_ICON = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;

  document.addEventListener('mouseup', handleSelection);
  document.addEventListener('keyup', handleSelection);

  function handleSelection(e) {
    if (e && e.target && (e.target.closest('.inline-doubt-fab') || e.target.closest('.inline-doubt-box') || e.target.closest('.inline-doubt-minimized-badge'))) {
      return;
    }
    setTimeout(checkAndShowFloatingBtn, 30);
  }

  function checkAndShowFloatingBtn() {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';

    if (!selectedText || selectedText.length < 3) {
      removeFloatingBtn();
      return;
    }

    if (selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const rects = range.getClientRects();
    const lastRect = rects.length > 0 ? rects[rects.length - 1] : range.getBoundingClientRect();

    if (!lastRect || (lastRect.width === 0 && lastRect.height === 0)) return;

    // Use range.startContainer to target the EXACT paragraph where selection started
    let startNode = range.startContainer;
    const anchorElement = findAnchorElement(startNode);

    activeSelectionData = {
      snippet: selectedText,
      rect: lastRect,
      anchorElement: anchorElement
    };

    showFloatingBtn(lastRect);
  }

  /**
   * Precise paragraph target locator
   */
  function findAnchorElement(node) {
    if (!node) return null;
    let curr = (node.nodeType === Node.TEXT_NODE) ? node.parentElement : node;
    if (!curr) return null;

    while (curr && curr !== document.body) {
      const tag = curr.tagName ? curr.tagName.toLowerCase() : '';

      // Direct paragraph, list item, or header block
      if (['p', 'li', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5'].includes(tag)) {
        return curr;
      }

      // If div/span, check if it acts as a paragraph line wrapper
      if (tag === 'div' || tag === 'span') {
        const childParagraphs = curr.querySelectorAll('p, div, li');
        if (childParagraphs.length === 0 || childParagraphs.length < 3) {
          return curr;
        }
      }

      curr = curr.parentElement;
    }
    return (node.nodeType === Node.TEXT_NODE) ? node.parentElement : node;
  }

  function showFloatingBtn(rect) {
    removeFloatingBtn();

    floatingBtn = document.createElement('div');
    floatingBtn.className = 'inline-doubt-fab';
    floatingBtn.innerHTML = `${SPARKS_ICON} <span>Ask Doubt</span>`;

    const topPos = Math.max(10, rect.top - 38);
    const leftPos = Math.min(window.innerWidth - 130, Math.max(10, rect.right - 50));

    floatingBtn.style.position = 'fixed';
    floatingBtn.style.top = `${topPos}px`;
    floatingBtn.style.left = `${leftPos}px`;
    floatingBtn.style.zIndex = '2147483647';

    floatingBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openDoubtBox();
    });

    floatingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openDoubtBox();
    });

    document.body.appendChild(floatingBtn);
  }

  function removeFloatingBtn() {
    if (floatingBtn) {
      floatingBtn.remove();
      floatingBtn = null;
    }
  }

  function openDoubtBox() {
    if (!activeSelectionData) return;

    const { snippet, anchorElement } = activeSelectionData;
    removeFloatingBtn();

    const box = document.createElement('div');
    box.className = 'inline-doubt-box';

    box.innerHTML = `
      <!-- Expanded Full View -->
      <div class="inline-doubt-expanded-view">
        <div class="inline-doubt-header">
          <div class="inline-doubt-brand">
            ${SPARKS_ICON} <span>InlineDoubt AI</span>
          </div>
          <div class="inline-doubt-header-actions">
            <button class="inline-doubt-min-btn" title="Minimize to icon">${MINIMIZE_ICON}</button>
            <button class="inline-doubt-close-btn" title="Close">&times;</button>
          </div>
        </div>

        <div class="inline-doubt-snippet">
          <span class="inline-doubt-snippet-label">Context:</span>
          <span class="inline-doubt-snippet-text">"${escapeHtml(snippet)}"</span>
        </div>

        <div class="inline-doubt-input-wrapper">
          <textarea class="inline-doubt-textarea" rows="2" placeholder="What is unclear? Ask your doubt..."></textarea>
          <div class="inline-doubt-actions">
            <span class="inline-doubt-hint">Ctrl + Enter</span>
            <button class="inline-doubt-submit-btn">
              ${SPARKS_ICON} <span>Ask AI</span>
            </button>
          </div>
        </div>

        <div class="inline-doubt-response-container"></div>
      </div>

      <!-- Minimized Tiny Animated Glowing Badge -->
      <div class="inline-doubt-minimized-badge" title="Click to view/reopen Doubt">
        <div class="inline-doubt-badge-pulse"></div>
        <span class="inline-doubt-badge-icon">${SPARKS_ICON}</span>
        <span class="inline-doubt-badge-text">Doubt</span>
        <span class="inline-doubt-badge-arrow">↗</span>
        <button class="inline-doubt-badge-close" title="Dismiss">&times;</button>
      </div>
    `;

    const minBtn = box.querySelector('.inline-doubt-min-btn');
    const closeBtn = box.querySelector('.inline-doubt-close-btn');
    const minimizedBadge = box.querySelector('.inline-doubt-minimized-badge');
    const closeBadgeBtn = box.querySelector('.inline-doubt-badge-close');

    // Minimize to small glowing badge
    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      box.classList.add('is-badge');
    });

    // Re-expand on clicking badge
    minimizedBadge.addEventListener('click', (e) => {
      if (e.target.closest('.inline-doubt-badge-close')) return;
      box.classList.remove('is-badge');
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      box.remove();
    });

    closeBadgeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      box.remove();
    });

    const submitBtn = box.querySelector('.inline-doubt-submit-btn');
    const textarea = box.querySelector('.inline-doubt-textarea');
    const responseContainer = box.querySelector('.inline-doubt-response-container');

    setTimeout(() => textarea.focus(), 50);

    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        submitDoubt();
      }
    });

    submitBtn.addEventListener('click', submitDoubt);

    async function submitDoubt() {
      const question = textarea.value.trim();
      if (!question) {
        textarea.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<div class="inline-doubt-spinner"></div> <span>Thinking...</span>`;
      responseContainer.innerHTML = '';

      try {
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ snippet, question })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ detail: 'Failed to connect to backend' }));
          throw new Error(errData.detail || `Server error ${response.status}`);
        }

        const data = await response.json();
        renderAnswer(data.answer);
      } catch (err) {
        responseContainer.innerHTML = `
          <div class="inline-doubt-response">
            <div class="inline-doubt-error">
              <strong>Error:</strong> ${escapeHtml(err.message)}
            </div>
          </div>
        `;
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${SPARKS_ICON} <span>Ask AI</span>`;
      }
    }

    function renderAnswer(answerText) {
      const formattedHtml = escapeHtml(answerText).replace(/\n/g, '<br>');
      responseContainer.innerHTML = `
        <div class="inline-doubt-response">
          <div class="inline-doubt-response-title">
            ${SPARKS_ICON} Explanation
          </div>
          <div class="inline-doubt-response-body">${formattedHtml}</div>
        </div>
      `;
    }

    // Insert inline directly after the exact paragraph where text was highlighted
    if (anchorElement && anchorElement.parentNode) {
      anchorElement.parentNode.insertBefore(box, anchorElement.nextSibling);
    } else {
      document.body.appendChild(box);
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
