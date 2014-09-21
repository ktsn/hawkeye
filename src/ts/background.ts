/**
 * background.ts
 * Copyright (c) 2014 katashin
 * https://github.com/ktsn/TabManager
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="tab_manager.ts"/>

var tabManager = new TabManager.TabManager();

chrome.browserAction.onClicked.addListener((tab: chrome.tabs.Tab) => {
  chrome.tabs.create({
    url: "../index.html"
  });
});