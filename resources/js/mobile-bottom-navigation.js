/**
 * Mobile Bottom Navigation Keyboard Enhancement
 *
 * Provides enhanced keyboard navigation support for the mobile bottom navigation:
 * - Arrow key navigation (Left/Right)
 * - Home/End key support
 * - Focus management
 * - No modification to native Tab/Enter/Space behavior
 */

class MobileBottomNavigationKeyboard {
  constructor(navElement = null) {
    this.nav = navElement || document.querySelector('.fmbn-bottom-nav');
    if (!this.nav) return;

    this.items = Array.from(this.nav.querySelectorAll('.fmbn-nav-item'));
    this.currentIndex = -1;

    this.bindEvents();
  }

  /**
   * Bind keyboard event listeners
   */
  bindEvents() {
    // Listen for keydown on navigation container
    this.nav.addEventListener('keydown', (e) => this.handleKeydown(e), true);

    // Track current focused item
    this.items.forEach((item, index) => {
      item.addEventListener('focus', () => {
        this.currentIndex = index;
      });
    });
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} event
   */
  handleKeydown(event) {
    const { key } = event;

    // Only handle arrow keys and Home/End
    if (!this.isNavigationKey(key)) return;

    // Only handle if an item is focused
    if (this.currentIndex === -1) return;

    let newIndex = this.currentIndex;

    switch (key) {
      case 'ArrowLeft':
        newIndex = this.getLeftIndex();
        event.preventDefault();
        break;

      case 'ArrowRight':
        newIndex = this.getRightIndex();
        event.preventDefault();
        break;

      case 'Home':
        newIndex = 0;
        event.preventDefault();
        break;

      case 'End':
        newIndex = this.items.length - 1;
        event.preventDefault();
        break;

      default:
        return;
    }

    // Focus the new item
    if (newIndex !== this.currentIndex) {
      this.focusItem(newIndex);
    }
  }

  /**
   * Check if key is a navigation key
   * @param {string} key
   * @returns {boolean}
   */
  isNavigationKey(key) {
    return ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key);
  }

  /**
   * Get next left item index (with wrapping)
   * @returns {number}
   */
  getLeftIndex() {
    if (this.currentIndex > 0) {
      return this.currentIndex - 1;
    }
    // Wrap to end for RTL support consideration
    return this.items.length - 1;
  }

  /**
   * Get next right item index (with wrapping)
   * @returns {number}
   */
  getRightIndex() {
    if (this.currentIndex < this.items.length - 1) {
      return this.currentIndex + 1;
    }
    // Wrap to start
    return 0;
  }

  /**
   * Focus a specific item by index
   * @param {number} index
   */
  focusItem(index) {
    if (index >= 0 && index < this.items.length) {
      this.items[index].focus();
      this.currentIndex = index;
    }
  }
}

/**
 * Initialize keyboard navigation on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MobileBottomNavigationKeyboard();
  });
} else {
  // DOM already loaded
  new MobileBottomNavigationKeyboard();
}

/**
 * Also support dynamic navigation initialization
 * (if nav is added to DOM after initial load)
 */
if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.classList && node.classList.contains('fmbn-bottom-nav')) {
            new MobileBottomNavigationKeyboard(node);
          }
        });
      }
    });
  });

  // Start observing the document body for dynamic nav additions
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Export as default for ES6 modules
export default MobileBottomNavigationKeyboard;
