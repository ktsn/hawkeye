/**
 * tab_manager.ts
 * Copyright (c) 2014 katashin
 * https://github.com/ktsn/TabManager
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
/// <reference path="../../typings/tsd.d.ts"/>

module TabManager {

  export class TabManager {
    activeTabId: number;
    capturing: boolean;
    tabs: Tab[];

    constructor() {
      var query = { windowType: "normal" };
      chrome.tabs.query(query, (chTabs: chrome.tabs.Tab[]) => {
        this.tabs = chTabs.map(function(t) { return new Tab(t) });
        console.log("--------- initialized tab manager");
        console.log(this.tabs);
      });

      /*  Event Listeners
       ============================================== */

      chrome.tabs.onCreated.addListener((chTab: chrome.tabs.Tab) => {
        console.log("\n--------- onCreated");
        this.addTab(chTab);
      });

      chrome.tabs.onRemoved.addListener((tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
        console.log("\n--------- onRemoved");
        this.removeTab(tabId);
      });

      chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, chTab: chrome.tabs.Tab) => {
        console.log("\n--------- onUpdated " + changeInfo.status);

        this.updateTab(tabId, {
          title: chTab.title,
          url: changeInfo.url || chTab.url,
          loading: changeInfo.status === "loading"
        });

        this.captureActiveTab();
      });

      chrome.tabs.onActivated.addListener((activeInfo: chrome.tabs.TabActiveInfo) => {
        console.log("\n--------- onActivate");
        this.activeTabId = activeInfo.tabId;
        this.captureActiveTab();
      });
    }

    addTab(chTab: chrome.tabs.Tab) : void {
      var tab = new Tab(chTab);
      this.tabs.push(tab);

      console.log("added tab");
      console.log(tab);
    }

    updateTab(tabId: number, updateParams: any) : void {
      var tab = this.findTab(tabId);
      Object.keys(updateParams).forEach((key) => {
        if (tab[key] !== undefined) {
          tab[key] = updateParams[key];
        }
      });

      console.log("updated tab");
      console.log(tab);
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
        });
      }
    }

    removeTab(tabId: number) : void {
      var tab = this.findTab(tabId);
      var index = this.tabs.indexOf(tab);
      this.tabs.splice(index, 1);

      console.log("removed tab");
      console.log(tab);
    }

    findTab(id: number) : Tab {
      for (var i = 0, len = this.tabs.length; i < len; i++) {
        if (this.tabs[i].id === id) return this.tabs[i];
      }
      return null;
    }
  }

  export class Tab {
    id: number;
    title: string;
    url: string;
    loading: boolean;

    private _snapshot: Snapshot;

    constructor(tab: chrome.tabs.Tab) {
      this.id = tab.id;
      this.title = tab.title;
      this.url = tab.url;
      this.loading = tab.status === "loading";
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
    _dataUrl: string;
    _capturedDate: Date;
    _capturedUrl: string;

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