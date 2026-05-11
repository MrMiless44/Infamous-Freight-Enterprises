// Infamous Freight — Book It Extension (Content Script)
// Injected into DAT, Truckstop, and 123Loadboard pages

(function () {
  'use strict';

  const PLATFORM = detectPlatform();
  if (!PLATFORM) return;

  console.log('[Infamous] Book It extension active on', PLATFORM);

  // Inject buttons after page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-inject on dynamic content changes (DAT/Truckstop use SPAs)
  const observer = new MutationObserver((mutations) => {
    const hasNewContent = mutations.some(m => m.addedNodes.length > 0);
    if (hasNewContent) {
      setTimeout(injectButtons, 500);
    }
  });

  function init() {
    injectButtons();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function detectPlatform() {
    const host = window.location.hostname;
    if (host.includes('dat.com')) return 'dat';
    if (host.includes('truckstop.com')) return 'truckstop';
    if (host.includes('123loadboard.com')) return '123loadboard';
    return null;
  }

  function injectButtons() {
    switch (PLATFORM) {
      case 'dat':
        injectDATButtons();
        break;
      case 'truckstop':
        injectTruckstopButtons();
        break;
      case '123loadboard':
        inject123Buttons();
        break;
    }
  }

  // ===== DAT Power Integration =====
  function injectDATButtons() {
    // DAT load cards have various selectors depending on the view
    const loadCards = document.querySelectorAll('[data-testid="load-card"], .load-card, [class*="LoadCard"], [class*="load-card"]');

    loadCards.forEach(card => {
      if (card.querySelector('.infamous-book-btn')) return; // Already injected

      const loadData = extractDATLoadData(card);
      if (!loadData) return;

      const btn = createBookButton(loadData);
      const actionsContainer = card.querySelector('[class*="actions"], [class*="Actions"], .load-card-actions, [data-testid="load-actions"]');

      if (actionsContainer) {
        actionsContainer.appendChild(btn);
      } else {
        card.style.position = 'relative';
        btn.style.position = 'absolute';
        btn.style.top = '10px';
        btn.style.right = '10px';
        card.appendChild(btn);
      }
    });
  }

  function extractDATLoadData(card) {
    try {
      const rateEl = card.querySelector('[class*="rate"], [data-testid="rate"], .rate');
      const originEl = card.querySelector('[class*="origin"], [data-testid="origin"], .origin');
      const destEl = card.querySelector('[class*="destination"], [data-testid="destination"], .destination');
      const equipmentEl = card.querySelector('[class*="equipment"], [data-testid="equipment"], .equipment');
      const distanceEl = card.querySelector('[class*="mileage"], [data-testid="distance"], .distance, [class*="miles"]');
      const brokerEl = card.querySelector('[class*="broker"], [data-testid="broker"], .broker, [class*="company"]');
      const weightEl = card.querySelector('[class*="weight"], [data-testid="weight"], .weight');
      const pickupEl = card.querySelector('[class*="pickup"], [data-testid="pickup-date"], .pickup');
      const refEl = card.querySelector('[class*="reference"], [data-testid="reference"], .reference, [class*="ref"]');

      const rateText = rateEl?.textContent?.replace(/[^0-9.]/g, '') || '0';
      const distanceText = distanceEl?.textContent?.replace(/[^0-9.]/g, '') || '0';

      return {
        rate: parseFloat(rateText) || 0,
        ratePerMile: distanceText > 0 ? parseFloat(rateText) / parseFloat(distanceText) : 0,
        origin: parseLocation(originEl?.textContent || ''),
        destination: parseLocation(destEl?.textContent || ''),
        equipmentType: equipmentEl?.textContent?.trim() || 'Dry Van',
        distance: parseFloat(distanceText) || 0,
        weight: parseFloat(weightEl?.textContent?.replace(/[^0-9]/g, '')) || 0,
        brokerName: brokerEl?.textContent?.trim() || 'Unknown',
        pickupDate: pickupEl?.textContent?.trim() || '',
        reference: refEl?.textContent?.trim() || '',
        source: 'dat',
        scrapedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('[Infamous] Failed to extract DAT load data:', err);
      return null;
    }
  }

  // ===== Truckstop Integration =====
  function injectTruckstopButtons() {
    const loadRows = document.querySelectorAll('[class*="load-row"], [class*="LoadRow"], [data-testid="load-row"], .results-row');

    loadRows.forEach(row => {
      if (row.querySelector('.infamous-book-btn')) return;

      const loadData = extractTruckstopLoadData(row);
      if (!loadData) return;

      const btn = createBookButton(loadData);
      const actionsCell = row.querySelector('td:last-child, [class*="actions"], [class*="Actions"]');

      if (actionsCell) {
        actionsCell.appendChild(btn);
      } else {
        row.appendChild(btn);
      }
    });
  }

  function extractTruckstopLoadData(row) {
    try {
      const cells = row.querySelectorAll('td, [class*="cell"], [class*="Cell"]');
      if (cells.length < 5) return null;

      return {
        rate: parseFloat(cells[4]?.textContent?.replace(/[^0-9.]/g, '')) || 0,
        ratePerMile: 0,
        origin: parseLocation(cells[0]?.textContent || ''),
        destination: parseLocation(cells[1]?.textContent || ''),
        equipmentType: cells[2]?.textContent?.trim() || 'Dry Van',
        distance: parseFloat(cells[3]?.textContent?.replace(/[^0-9]/g, '')) || 0,
        weight: 0,
        brokerName: 'Truckstop Broker',
        pickupDate: cells[5]?.textContent?.trim() || '',
        reference: '',
        source: 'truckstop',
        scrapedAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  // ===== 123Loadboard Integration =====
  function inject123Buttons() {
    const loadCards = document.querySelectorAll('[class*="load-card"], [class*="LoadCard"], .search-result, [class*="result-item"]');

    loadCards.forEach(card => {
      if (card.querySelector('.infamous-book-btn')) return;

      const loadData = extract123LoadData(card);
      if (!loadData) return;

      const btn = createBookButton(loadData);
      card.appendChild(btn);
    });
  }

  function extract123LoadData(card) {
    try {
      const text = card.textContent || '';
      const originMatch = text.match(/([A-Za-z\s]+,\s*[A-Z]{2})/);
      const rateMatch = text.match(/\$([0-9,]+\.?\d*)/);
      const milesMatch = text.match(/(\d+)\s*mi/);

      return {
        rate: parseFloat(rateMatch?.[1]?.replace(/,/g, '')) || 0,
        ratePerMile: 0,
        origin: parseLocation(originMatch?.[0] || ''),
        destination: parseLocation(originMatch?.[0] || ''),
        equipmentType: 'Dry Van',
        distance: parseFloat(milesMatch?.[1]) || 0,
        weight: 0,
        brokerName: '123Loadboard',
        pickupDate: '',
        reference: '',
        source: '123loadboard',
        scrapedAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  // ===== Shared Functions =====

  function createBookButton(loadData) {
    const btn = document.createElement('button');
    btn.className = 'infamous-book-btn';
    btn.type = 'button';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
      Book in Infamous
    `;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      btn.disabled = true;
      btn.innerHTML = 'Booking...';

      try {
        // Send to background script
        const response = await chrome.runtime.sendMessage({
          action: 'bookLoad',
          loadData,
        });

        if (response.success) {
          btn.classList.add('booked');
          btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Booked
          `;
          showFloatingPanel(loadData, response);
        } else {
          btn.innerHTML = 'Error — Retry';
          btn.disabled = false;
          if (response.error?.includes('Not logged in')) {
            alert('Please log into Infamous Freight first. Click the extension icon in your toolbar.');
          }
        }
      } catch (err) {
        btn.innerHTML = 'Error — Retry';
        btn.disabled = false;
      }
    });

    return btn;
  }

  function showFloatingPanel(loadData, response) {
    // Remove existing panel
    const existing = document.querySelector('.infamous-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.className = 'infamous-panel';
    panel.innerHTML = `
      <div class="infamous-panel-header">
        <span class="infamous-panel-title">⚡ Load Captured!</span>
        <button type="button" class="infamous-panel-close" aria-label="Close load captured panel">&times;</button>
      </div>
      <div class="infamous-panel-row">
        <span class="infamous-panel-label">Route</span>
        <span class="infamous-panel-value">${loadData.origin.city || 'N/A'} → ${loadData.destination.city || 'N/A'}</span>
      </div>
      <div class="infamous-panel-row">
        <span class="infamous-panel-label">Rate</span>
        <span class="infamous-panel-value">$${loadData.rate.toLocaleString()}</span>
      </div>
      <div class="infamous-panel-row">
        <span class="infamous-panel-label">Distance</span>
        <span class="infamous-panel-value">${loadData.distance} mi @ $${loadData.ratePerMile.toFixed(2)}/mi</span>
      </div>
      <div class="infamous-panel-actions">
        <button type="button" class="infamous-panel-btn infamous-panel-btn-primary" id="infamous-view-load">View in Infamous</button>
        <button type="button" class="infamous-panel-btn infamous-panel-btn-secondary" id="infamous-dismiss">Dismiss</button>
      </div>
    `;

    document.body.appendChild(panel);

    panel.querySelector('.infamous-panel-close').addEventListener('click', () => panel.remove());
    panel.querySelector('#infamous-dismiss').addEventListener('click', () => panel.remove());
    panel.querySelector('#infamous-view-load').addEventListener('click', () => {
      window.open(`https://infamousfreight.com/dispatch/loads/${response.loadId}`, '_blank');
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => panel.remove(), 10000);
  }

  function parseLocation(text) {
    // Try to parse "City, ST" format
    const match = text.match(/([A-Za-z\s\.]+),?\s*([A-Z]{2})?/);
    return {
      city: match?.[1]?.trim() || text.trim(),
      state: match?.[2] || '',
    };
  }
})();
