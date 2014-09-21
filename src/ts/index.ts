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

/*  Interfaces
   =============================================== */

interface TabUpdateOption {
  title?: string;
  snapshot?: string;
}

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

    // be droppable to move tabs to the window
    windowDom.droppable({
      accept: ".tab",
      hoverClass: "window-tab-hover",
      drop: function(event, ui) {
        var tabDom = ui.draggable;
        var windowDom = $(event.target);

        tabManager.moveTab(tabDom.data("id"), windowDom.data("id"));
      }
    });

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

    // be draggable the tab to move to any windows
    tabDom.draggable({
      opacity: 0.7,
      revert: true,
      revertDuration: 300,
      scroll: false,
      stack: ".tab"
    });

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

  updateTab(tabId: number, updates: TabUpdateOption) : void {
    var tab = this.tabDomHash[tabId];
    if (tab == null) {
      return;
    }

    if (updates.title !== undefined) {
      tab.find(".template-title").text(updates.title);
    }
    if (updates.snapshot !== undefined) {
      tab.find(".template-image").attr("src", updates.snapshot);
    }
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
    console.log("----- capture tab");
    view.updateTab(tab.id, { snapshot: tab.snapshot });
  });

  tabManager.on(TabManager.TabEvent.onUpdateTab, (tab: TabManager.Tab) => {
    console.log("----- update tab");
    view.updateTab(tab.id, { title: tab.title, snapshot:tab.snapshot });
  });
});
