'use strict';

var lastActiveTab;
var actions = {
  open: openTab,
  playPause: togglePlayback,
  previous: playPrevious,
  next: playNext,
  search: showSearch
};
var messageHandler = {
  registerTab: function registerTab(tab) {
    if (typeof lastActiveTab === 'undefined') {
      lastActiveTab = tab;
    }
  },
  played: setActiveTab
};

function setActiveTab(tab) {
  if (tab.tabId !== lastActiveTab.tabId) {
    lastActiveTab = tab;
  }
}

function togglePlayback() {
  chrome.tabs.sendMessage(lastActiveTab.tabId, {
    messageId: 'togglePlayback'
  });
}

function playNext() {
  chrome.tabs.sendMessage(lastActiveTab.tabId, {
    messageId: 'playNext'
  });
}

function playPrevious() {
  chrome.tabs.sendMessage(lastActiveTab.tabId, {
    messageId: 'playPrevious'
  });
}

function showSearch() {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    if (tabs.length && tabs[0].id === lastActiveTab.tabId) {
      chrome.tabs.sendMessage(lastActiveTab.tabId, {
        messageId: 'showSearch'
      });
    }
  });
}

function openTab() {
  if (typeof lastActiveTab === 'undefined') {
    chrome.tabs.create({
      url: 'https://play.spotify.com'
    });
  } else {
    chrome.tabs.update(lastActiveTab.tabId, {
      active: true
    });
    chrome.windows.update(lastActiveTab.windowId, {
      focused: true,
      state: 'maximized'
    });
  }
}

chrome.commands.onCommand.addListener(function(command) {
  actions[command]();
});

chrome.runtime.onMessage.addListener(function(message, sender) {
  var tabId = sender.tab.id;
  var windowId = sender.tab.windowId;
  var tab = {
    tabId,
    windowId
  }
  messageHandler[message.messageId](tab);
});

chrome.tabs.onRemoved.addListener(function(tabId) {
  if (lastActiveTab && tabId === lastActiveTab.tabId) {
    chrome.tabs.query({
      url: 'https://play.spotify.com/*'
    }, function(tabs) {
      if (tabs.length) {
        lastActiveTab = {
          tabId: tabs[0].id,
          windowId: tabs[0].windowId
        }
      } else {
        lastActiveTab = undefined;
      }
    });
  }
});

chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
  if (lastActiveTab && tabId === lastActiveTab.tabId) {
    lastActiveTab.windowId = attachInfo.newWindowId;
  }
});
