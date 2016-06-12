/**
 * tab_manager.ts
 * Copyright (c) 2014 katashin
 * https://github.com/ktsn/hawkeye
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

module Hawkeye {
  import Tab = Model.Tab;
  import Window = Model.Window;

  export const TabEvent = {
    onAddWindow: 'onaddwindow',
    onRemoveWindow: 'onremovewindow',
    onAddTab: 'onaddtab',
    onUpdateTab: 'onupdatetab',
    onActivateTab: 'onactivatetab',
    onCaptureTab: 'oncapturetab',
    onRemoveTab: 'onremovetab'
  };

  export class TabManager extends Util.Observable {
    activeTabId: number;
    focusWindowId: number;
    movingTab: Tab;

    windows: Window[]; // only manages 'normal' type windows
    tabs: Tab[]; // only manages the tabs on 'normal' type windows

    constructor() {
      super();
      const query = { windowType: 'normal' };
      chrome.tabs.query(query, (chTabs: chrome.tabs.Tab[]) => {
        this.tabs = chTabs.map((t) => new Tab(t));
        console.log('--------- initialized tabs');
        console.log(this.tabs);
      });

      chrome.windows.getAll((chWindows: chrome.windows.Window[]) => {
        const normalWindows = chWindows.filter((w) => w.type === 'normal');
        this.windows = normalWindows.map((w) => new Window(w));
        console.log('--------- initialized windows');
        console.log(this.windows);
      });

      /*  Event Listeners
       ============================================== */

      /* Windows */

      chrome.windows.onCreated.addListener((chWindow: chrome.windows.Window) => {
        console.log('\n--------- onWindowCreated');
        if (chWindow.type === 'normal') {
          this.addWindow(chWindow);
        }
      });

      chrome.windows.onRemoved.addListener((windowId: number) => {
        console.log('\n--------- onWindowRemoved');
        this.removeWindow(windowId);
      });

      chrome.windows.onFocusChanged.addListener((windowId: number) => {
        console.log('\n--------- onWindowFocusChanged');
        this.focusWindowId = windowId;

        const window = this.findWindow(windowId);
        if (window != null) {
          // get the current active tab
          const query = { active: true, currentWindow: true };
          chrome.tabs.query(query, (chTabs: chrome.tabs.Tab[]) => {
            this.activeTabId = chTabs[0].id;
            this.captureActiveTab();
          });
        }
      });

      /* Tabs */

      chrome.tabs.onCreated.addListener((chTab: chrome.tabs.Tab) => {
        console.log('\n--------- onTabCreated');
        const parentWindow = this.findWindow(chTab.windowId);
        if (parentWindow != null) {
          this.addTab(chTab);
        }
      });

      chrome.tabs.onRemoved.addListener((tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
        console.log('\n--------- onTabRemoved');
        const parentWindow = this.findWindow(removeInfo.windowId);
        if (parentWindow != null) {
          this.removeTab(tabId);
        }
      });

      chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, chTab: chrome.tabs.Tab) => {
        console.log('\n--------- onTabUpdated ' + changeInfo.status);
        const tab = this.findTab(tabId);
        if (tab != null) {
          tab.title = chTab.title || tab.title;
          tab.url = changeInfo.url || chTab.url || tab.url;
          if (changeInfo.status != null) {
            tab.loading = changeInfo.status === 'loading';
          }

          this.fire(TabEvent.onUpdateTab, tab);

          if (this.activeTabId === tab.id) {
            this.captureActiveTab();
          }
        }
      });

      chrome.tabs.onActivated.addListener((activeInfo: chrome.tabs.TabActiveInfo) => {
        console.log('\n--------- onTabActivate');
        const parentWindow = this.findWindow(activeInfo.windowId);
        const tab = this.findTab(activeInfo.tabId);
        if (parentWindow != null) {
          this.activeTabId = activeInfo.tabId;
          this.fire(TabEvent.onActivateTab, tab);

          this.captureActiveTab();
        }
      });

      chrome.tabs.onReplaced.addListener((addedTabId: number, removedTabId: number) => {
        console.log('\n--------- onTabReplaced');
        const tab = this.findTab(removedTabId);
        this.removeTab(tab);

        tab.id = addedTabId;
        this.addTab(tab);
      });

      chrome.tabs.onAttached.addListener((tabId: number, attachInfo: chrome.tabs.TabAttachInfo) => {
        console.log('\n--------- onTabAttached');

        if (this.movingTab == null) {
          throw new Error('Unexpected Error: onTabAttached');
        }

        this.movingTab.windowId = attachInfo.newWindowId;
        this.addTab(this.movingTab);

        this.movingTab = null;
      });

      chrome.tabs.onDetached.addListener((tabId: number, detachInfo: chrome.tabs.TabDetachInfo) => {
        console.log('\n--------- onTabDetached');
        this.movingTab = this.findTab(tabId);
        this.removeTab(this.movingTab);
      });
    }

    addWindow(chWindow: chrome.windows.Window) : void {
      const window = new Window(chWindow);
      this.windows.push(window);

      console.log('added window');
      console.log(window);

      this.fire(TabEvent.onAddWindow, window);
    }

    removeWindow(windowId: number) : void {
      const window = this.findWindow(windowId);
      const index = this.windows.indexOf(window);

      if (index === -1) return;

      this.windows.splice(index, 1);

      console.log('removed window');
      console.log(window);

      this.fire(TabEvent.onRemoveWindow, windowId);
    }

    findWindow(id: number) : Window {
      for (let i = 0, len = this.windows.length; i < len; i++) {
        if (this.windows[i].id === id) return this.windows[i];
      }
      return null;
    }

    addTab(tab: Tab) : void;
    addTab(chTab: chrome.tabs.Tab) : void;
    addTab(tab: any) {
      if (!(tab instanceof Tab)) {
        tab = new Tab(tab);
      }
      this.tabs.push(tab);

      console.log('added tab');
      console.log(tab);

      this.fire(TabEvent.onAddTab, tab);
    }

    captureActiveTab() : void {
      const tab = this.findTab(this.activeTabId);

      const shouldCapture = !tab.loading && !this.movingTab && tab.windowId === this.focusWindowId;

      if (shouldCapture) {
        console.log('will capture visible tab');

        chrome.tabs.captureVisibleTab(null, (dataUrl: string) => {

          // when the browser occurs internal error
          if (dataUrl == null) {
            console.log('failed to capture visible tab');
            return;
          }

          tab.snapshot = dataUrl;
          console.log('captured visible tab');
          console.log(tab);

          this.fire(TabEvent.onCaptureTab, tab);
        });
      }
    }

    removeTab(tab: Tab) : void;
    removeTab(tabId: number) : void;
    removeTab(tab: any) {
      if (typeof tab === 'number') {
        tab = this.findTab(tab);
      }
      const index = this.tabs.indexOf(tab);

      if (index === -1) return;

      this.tabs.splice(index, 1);

      console.log('removed tab');
      console.log(tab);

      this.fire(TabEvent.onRemoveTab, tab.id);
    }

    findTab(id: number) : Tab {
      for (let i = 0, len = this.tabs.length; i < len; i++) {
        if (this.tabs[i].id === id) return this.tabs[i];
      }
      return null;
    }

    findTabsByWindowId(windowId: number) : Tab[] {
      return this.tabs.filter((tab) => tab.windowId === windowId);
    }

    moveTab(tabId: number, toWindowId: number) : void {
      console.log('------ move tab(' + tabId + ') to window(' + toWindowId + ')');

      chrome.tabs.move(tabId, { windowId: toWindowId, index: -1 }, (chTab: chrome.tabs.Tab) => { // always add to the end of the window
        const tab = this.findTab(tabId);
        tab.windowId = toWindowId;
      });
    }
  }
}
