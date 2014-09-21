/**
 * index.ts
 * Copyright (c) 2014 katashin
 * https://github.com/ktsn/TabManager
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="tab_manager.ts"/>

var backgroundWindow: any = chrome.extension.getBackgroundPage();
var tabManager: TabManager.TabManager = backgroundWindow.tabManager;

/*  View
   =============================================== */

class IndexView {
  windowWrapper: JQuery;
  tabWrapper: JQuery;
  windowTemplate: JQuery;
  tabTemplate: JQuery;

  windowDomHash: any = {};
  tabDomHash: any = {};

  constructor() {
    this.windowWrapper = $("#window-wrapper");
    this.tabWrapper = $("#tab-wrapper");
    this.windowTemplate = $($("#window-template").html());
    this.tabTemplate = $($("#tab-template").html());
  }

  addWindow(window: TabManager.Window) : void {
    var windowDom = this.windowTemplate.clone();
    windowDom.data("id", window.id);

    this.windowWrapper.append(windowDom);

    this.windowDomHash[window.id] = windowDom;
  }

  removeWindow(windowId: number) : void {
    var windowDom = this.windowDomHash[windowId];
    windowDom.remove();
    delete this.windowDomHash[windowId];
  }

  addTab(tab: TabManager.Tab) : void {
    var tabDom = this.tabTemplate.clone();
    tabDom.data("id", tab.id);
    tabDom.find(".template-image").attr("src", tab.snapshot);
    tabDom.find(".template-title").text(tab.title);
    this.tabWrapper.append(tabDom);

    this.tabDomHash[tab.id] = tabDom;
  }

  removeTab(tabId: number) : void {
    var tabDom = this.tabDomHash[tabId];
    tabDom.remove();
    delete this.tabDomHash[tabId];
  }
}

/*  Controller
   =============================================== */

$(function() {
  var view = new IndexView();

  tabManager.windows.forEach((w) => {
    view.addWindow(w);
  });

  tabManager.tabs.forEach((t) => {
    view.addTab(t);
  });

  tabManager.on(TabManager.TabEvent.onAddWindow, (window: TabManager.Window) => {
    view.addWindow(window);
  });

  tabManager.on(TabManager.TabEvent.onRemoveWindow, (windowId: number) => {
    view.removeWindow(windowId);
  });

  tabManager.on(TabManager.TabEvent.onAddTab, (tab: TabManager.Tab) => {
    view.addTab(tab);
  });

  tabManager.on(TabManager.TabEvent.onRemoveTab, (tabId: number) => {
    view.removeTab(tabId);
  });

  tabManager.on(TabManager.TabEvent.onCaptureTab, (tab: TabManager.Tab) => {

  });

  tabManager.on(TabManager.TabEvent.onUpdateTab, (tab: TabManager.Tab) => {

  });
});