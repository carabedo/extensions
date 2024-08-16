chrome.storage.local.get('savedText', (data) => {
    if (data.savedText) {
      document.getElementById('savedText').value = data.savedText;
    }
  });
  