/**
 * tab_manager.ts
 * Copyright (c) 2014 katashin
 * https://github.com/ktsn/TabManager
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="util.ts"/>

module TabManager {

  export var TabEvent = {
    onAddWindow: "onaddwindow",
    onRemoveWindow: "onremovewindow",
    onAddTab: "onaddtab",
    onUpdateTab: "onupdatetab",
    onCaptureTab: "oncapturetab",
    onRemoveTab: "onremovetab"
  };

  export class TabManager extends Util.EventTarget {
    activeTabId: number;
    capturing: boolean;
    windows: Window[]; // only manages "normal" type windows
    tabs: Tab[]; // only manages the tabs on "normal" type windows

    constructor() {
      super();
      var query = { windowType: "normal" };
      chrome.tabs.query(query, (chTabs: chrome.tabs.Tab[]) => {
        this.tabs = chTabs.map((t) => new Tab(t));
        console.log("--------- initialized tabs");
        console.log(this.tabs);
      });

      chrome.windows.getAll((chWindows: chrome.windows.Window[]) => {
        var normalWindows = chWindows.filter((w) => w.type === "normal");
        this.windows = normalWindows.map((w) => new Window(w));
        console.log("--------- initialized windows");
        console.log(this.windows);
      });

      /*  Event Listeners
       ============================================== */

      /* Windows */

      chrome.windows.onCreated.addListener((chWindow: chrome.windows.Window) => {
        console.log("\n--------- onWindowCreated");
        if (chWindow.type === "normal") {
          this.addWindow(chWindow);
        }
      });

      chrome.windows.onRemoved.addListener((windowId: number) => {
        console.log("\n--------- onWindowRemoved");
        this.removeWindow(windowId);
      });

      chrome.windows.onFocusChanged.addListener((windowId: number) => {
        console.log("\n--------- onWindowFocusChanged");
        var window = this.findWindow(windowId);
        if (window != null) {
          // get the current active tab
          var query = { active: true, currentWindow: true };
          chrome.tabs.query(query, (chTabs: chrome.tabs.Tab[]) => {
            this.activeTabId = chTabs[0].id;
            this.captureActiveTab();
          });
        }
      });

      /* Tabs */

      chrome.tabs.onCreated.addListener((chTab: chrome.tabs.Tab) => {
        console.log("\n--------- onTabCreated");
        var parentWindow = this.findWindow(chTab.windowId);
        if (parentWindow != null) {
          this.addTab(chTab);
        }
      });

      chrome.tabs.onRemoved.addListener((tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
        console.log("\n--------- onTabRemoved");
        var parentWindow = this.findWindow(removeInfo.windowId);
        if (parentWindow != null) {
          this.removeTab(tabId);
        }
      });

      chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, chTab: chrome.tabs.Tab) => {
        console.log("\n--------- onTabUpdated " + changeInfo.status);
        var tab = this.findTab(tabId);
        if (tab != null) {
          tab.title = chTab.title || tab.title;
          tab.url = changeInfo.url || chTab.url || tab.url;
          if (changeInfo.status != null) {
            tab.loading = changeInfo.status === "loading";
          }

          this.fire(TabEvent.onUpdateTab, tab);

          this.captureActiveTab();
        }
      });

      chrome.tabs.onActivated.addListener((activeInfo: chrome.tabs.TabActiveInfo) => {
        console.log("\n--------- onTabActivate");
        var parentWindow = this.findWindow(activeInfo.windowId);
        if (parentWindow != null) {
          this.activeTabId = activeInfo.tabId;
          this.captureActiveTab();
        }
      });
    }

    addWindow(chWindow: chrome.windows.Window) : void {
      var window = new Window(chWindow);
      this.windows.push(window);

      console.log("added window");
      console.log(window);

      this.fire(TabEvent.onAddWindow, window);
    }

    removeWindow(windowId: number) : void {
      var window = this.findWindow(windowId);
      var index = this.windows.indexOf(window);

      if (index === -1) return;

      this.windows.splice(index, 1);

      console.log("removed window");
      console.log(window);

      this.fire(TabEvent.onRemoveWindow, windowId);
    }

    findWindow(id: number) : Window {
      for (var i = 0, len = this.windows.length; i < len; i++) {
        if (this.windows[i].id === id) return this.windows[i];
      }
      return null;
    }

    addTab(chTab: chrome.tabs.Tab) : void {
      var tab = new Tab(chTab);
      this.tabs.push(tab);

      console.log("added tab");
      console.log(tab);

      this.fire(TabEvent.onAddTab, tab);
    }

    captureActiveTab() : void {
      var tab = this.findTab(this.activeTabId);

      var shouldCapture = !this.capturing && tab.capturedUrl !== tab.url && !tab.loading;

      if (shouldCapture) {
        this.capturing = true;
        console.log("will capture visible tab");

        chrome.tabs.captureVisibleTab(null, (dataUrl: string) => {
          this.capturing = false;

          // when the browser occurs internal error
          if (dataUrl == null) {
            console.log("failed to capture visible tab");
            return;
          }

          tab.snapshot = dataUrl;
          console.log("captured visible tab");
          console.log(tab);

          this.fire(TabEvent.onCaptureTab, tab);
        });
      }
    }

    removeTab(tabId: number) : void {
      var tab = this.findTab(tabId);
      var index = this.tabs.indexOf(tab);

      if (index === -1) return;

      this.tabs.splice(index, 1);

      console.log("removed tab");
      console.log(tab);

      this.fire(TabEvent.onRemoveTab, tabId);
    }

    findTab(id: number) : Tab {
      for (var i = 0, len = this.tabs.length; i < len; i++) {
        if (this.tabs[i].id === id) return this.tabs[i];
      }
      return null;
    }

    moveTab(tabId: number, toWindowId: number) : void {
      console.log("------ move tab(" + tabId + ") to window(" + toWindowId + ")");

      chrome.tabs.move(tabId, { windowId: toWindowId, index: -1 }, (chTab: chrome.tabs.Tab) => { // always add to the end of the window
        var tab = this.findTab(tabId);
        tab.windowId = toWindowId;
      });
    }
  }

  export class Window {
    id: number;

    constructor(window: chrome.windows.Window) {
      this.id = window.id;
    }
  }

  export class Tab {
    id: number;
    title: string;
    url: string;
    loading: boolean;
    windowId: number;

    private _snapshot: Snapshot;

    constructor(tab: chrome.tabs.Tab) {
      this.id = tab.id;
      this.title = tab.title;
      this.url = tab.url;
      this.loading = tab.status === "loading";
      this.windowId = tab.windowId;
      this._snapshot = new Snapshot();
    }

    set snapshot(dataUrl: string) {
      this._snapshot.setDataUrl(dataUrl, this.url);
    }

    get snapshot() : string {
      return this._snapshot.dataUrl;
    }

    get capturedDate() : Date {
      return this._snapshot.capturedDate;
    }

    get capturedUrl() : string {
      return this._snapshot.capturedUrl;
    }
  }

  class Snapshot {
    private _dataUrl: string;
    private _capturedDate: Date;
    private _capturedUrl: string;

    constructor() {
      this._capturedDate = new Date(0);
    }

    setDataUrl(dataUrl: string, capturedUrl: string) {
      this._dataUrl = dataUrl;
      this._capturedDate = new Date();
      this._capturedUrl = capturedUrl;
    }

    get dataUrl() : string {
      return this._dataUrl;
    }

    get capturedDate() : Date {
      return this._capturedDate;
    }

    get capturedUrl() : string {
      return this._capturedUrl;
    }
  }

}
