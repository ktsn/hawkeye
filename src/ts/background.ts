/**
 * background.ts
 * Copyright (c) 2014 katashin
 * https://github.com/ktsn/hawkeye
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

var tabManager = new Hawkeye.TabManager();

chrome.browserAction.onClicked.addListener((tab: chrome.tabs.Tab) => {
  chrome.tabs.create({
    url: '../index.html'
  });
});
