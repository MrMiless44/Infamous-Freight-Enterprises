// Infamous Freight — Book It Extension (Popup)

document.addEventListener('DOMContentLoaded', async () => {
  const loginState = document.getElementById('login-state');
  const connectedState = document.getElementById('connected-state');
  const connectBtn = document.getElementById('connect-btn');
  const disconnectBtn = document.getElementById('disconnect-btn');
  const openDashboardBtn = document.getElementById('open-dashboard');

  // Check auth state
  const { isLoggedIn } = await chrome.runtime.sendMessage({ action: 'checkAuth' });
  showState(isLoggedIn);

  connectBtn?.addEventListener('click', async () => {
    const apiKey = document.getElementById('api-key-input').value.trim();
    const carrierId = document.getElementById('carrier-id-input').value.trim();

    if (!apiKey || !carrierId) {
      alert('Please enter both API key and Carrier ID');
      return;
    }

    await chrome.runtime.sendMessage({
      action: 'saveApiKey',
      apiKey,
      carrierId,
    });

    showState(true);
  });

  disconnectBtn?.addEventListener('click', async () => {
    await chrome.storage.sync.remove(['infamousApiKey', 'infamousCarrierId']);
    showState(false);
  });

  openDashboardBtn?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.infamousfreight.com/dispatch' });
  });

  function showState(connected) {
    if (connected) {
      loginState.style.display = 'none';
      connectedState.style.display = 'block';
    } else {
      loginState.style.display = 'block';
      connectedState.style.display = 'none';
    }
  }
});
