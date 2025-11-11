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

  // Update favicon and icons based on theme
  function updateIcons(theme) {
    const themePath = theme === 'dark' ? '/icons/dark' : '/icons/light';
    
    try {
      // Update favicon links
      const faviconLinks = document.querySelectorAll('link[rel="icon"]');
      faviconLinks.forEach(link => {
        const sizes = link.getAttribute('sizes');
        if (sizes) {
          // Update PNG favicons
          if (sizes === '16x16') {
            link.href = `${themePath}/favicon-16x16.png`;
          } else if (sizes === '32x32') {
            link.href = `${themePath}/favicon-32x32.png`;
          }
        }
        // Keep SVG favicon as is (it's theme-agnostic)
      });
      
      // Update Apple touch icons
      const appleTouchIcons = document.querySelectorAll('link[rel="apple-touch-icon"]');
      appleTouchIcons.forEach(link => {
        const sizes = link.getAttribute('sizes');
        if (sizes === '152x152') {
          link.href = `${themePath}/apple-touch-icon-152x152.png`;
        } else if (sizes === '167x167') {
          link.href = `${themePath}/apple-touch-icon-167x167.png`;
        } else if (sizes === '180x180') {
          link.href = `${themePath}/apple-touch-icon-180x180.png`;
        }
      });
      
      // Force browser to reload icons by adding timestamp
      const timestamp = Date.now();
      faviconLinks.forEach(link => {
        if (link.href && link.href.includes('.png')) {
          try {
            const url = new URL(link.href, window.location.origin);
            url.searchParams.set('v', timestamp);
            link.href = url.toString();
          } catch (e) {
            // If URL parsing fails, just update the path directly
            link.href = link.href.split('?')[0] + '?v=' + timestamp;
          }
        }
      });
      
      appleTouchIcons.forEach(link => {
        if (link.href) {
          try {
            const url = new URL(link.href, window.location.origin);
            url.searchParams.set('v', timestamp);
            link.href = url.toString();
          } catch (e) {
            // If URL parsing fails, just update the path directly
            link.href = link.href.split('?')[0] + '?v=' + timestamp;
          }
        }
      });
      
      console.log('[Theme Detector] Icons updated to', theme, 'theme');
    } catch (error) {
      console.error('[Theme Detector] Error updating icons:', error);
    }
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
    updateIcons(systemTheme);
    updateManifestIcons(systemTheme);
    
    // Listen for theme changes
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeQuery.addEventListener('change', (e) => {
        const newTheme = e.matches ? 'dark' : 'light';
        updateThemeColor(newTheme);
        updateIcons(newTheme);
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

