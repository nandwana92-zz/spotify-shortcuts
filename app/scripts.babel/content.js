'use strict';

var spotifyInitialized = false;
var messageHandler = {
  togglePlayback: togglePlayback,
  playNext: playNext,
  playPrevious: playPrevious,
  showSearch: showSearch
};
var mouseDownEvent = new MouseEvent('mousedown', {
  view: window,
  bubbles: true,
  cancelable: true,
});

elementReady('#app-player', document).then(function (element) {
  var intervalId = setInterval(function () {
    var playPauseElem = document.getElementById('app-player').contentDocument.getElementById('play-pause');

    if (playPauseElem) {
      clearInterval(intervalId);
      spotifyInitialized = true;

      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.attributeName === 'class') {
            if (mutation.target.classList.contains('playing')) {
              console.log('played');
              chrome.runtime.sendMessage({ messageId: 'played' });
            } else {
              console.log('paused');
              chrome.runtime.sendMessage({ messageId: 'paused' });
            }
          }
        });
      });

      var config = { attributes: true };

      observer.observe(playPauseElem, config);
    }
  }, 50);
});

function togglePlayback() {
  var playPauseElem = document.getElementById('app-player').contentDocument.getElementById('play-pause');
  playPauseElem.click();
}

function playNext() {
  var nextElem = document.getElementById('app-player').contentDocument.getElementById('next');
  nextElem.click();
}

function playPrevious() {
  var previousElem = document.getElementById('app-player').contentDocument.getElementById('previous');
  previousElem.click();
}

function showSearch() {
  var searchElem = document.getElementById('nav-search');
  searchElem.dispatchEvent(mouseDownEvent);
}

chrome.runtime.onMessage.addListener(function (message, sender) {
  if (spotifyInitialized) {
    messageHandler[message.messageId]();
  }
});

chrome.runtime.sendMessage({ messageId: 'registerTab' });
