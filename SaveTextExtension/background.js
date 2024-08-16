chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "saveText",
      title: "Save selected text",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "saveText" && info.selectionText) {
      chrome.storage.local.set({ savedText: info.selectionText }, () => {
        console.log("Text saved:", info.selectionText);
      });
    }
  });
  