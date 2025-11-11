/**
 * Theme Detection and Management
 * Automatically detects system theme preference and updates PWA accordingly
 */

(function() {
  'use strict';

  // Detect system theme preference
  function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  // Update theme-color meta tag
  function updateThemeColor(theme) {
    const lightThemeColor = '#3b82f6'; // Blue
    const darkThemeColor = '#121212'; // Dark gray
    
    // Remove existing theme-color meta tags
    const existingTags = document.querySelectorAll('meta[name="theme-color"]');
    existingTags.forEach(tag => tag.remove());
    
    // Add new theme-color meta tag
    const metaTag = document.createElement('meta');
    metaTag.name = 'theme-color';
    metaTag.content = theme === 'dark' ? darkThemeColor : lightThemeColor;
    document.head.appendChild(metaTag);
    
    // Also update for media query
    const mediaMetaTag = document.createElement('meta');
    mediaMetaTag.name = 'theme-color';
    mediaMetaTag.content = theme === 'dark' ? darkThemeColor : lightThemeColor;
    mediaMetaTag.setAttribute('media', `(prefers-color-scheme: ${theme})`);
    document.head.appendChild(mediaMetaTag);
  }

  // Update manifest icon based on theme (if needed)
  function updateManifestIcons(theme) {
    // This is handled by the browser automatically based on media queries in manifest
    // But we can update the manifest link if needed
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      // Force manifest reload (browser will handle theme selection)
      const href = manifestLink.href;
      manifestLink.href = '';
      setTimeout(() => {
        manifestLink.href = href;
      }, 100);
    }
  }

  // Initialize theme detection
  function initThemeDetection() {
    const systemTheme = getSystemTheme();
    updateThemeColor(systemTheme);
    updateManifestIcons(systemTheme);
    
    // Listen for theme changes
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeQuery.addEventListener('change', (e) => {
        const newTheme = e.matches ? 'dark' : 'light';
        updateThemeColor(newTheme);
        updateManifestIcons(newTheme);
        console.log('[Theme Detector] Theme changed to:', newTheme);
      });
    }
  }

  // Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeDetection);
  } else {
    initThemeDetection();
  }
})();

