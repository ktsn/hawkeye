/**
 * index.ts
 * Copyright (c) 2014 katashin
 * https://github.com/ktsn/hawkeye
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

module Index {
  import Tab = Hawkeye.Model.Tab;
  import Window = Hawkeye.Model.Window;
  import TabManager = Hawkeye.TabManager;
  import TabEvent = Hawkeye.TabEvent;

  const DEFAULT_TAB_WIDTH = 400;
  const TAB_HEIGHT_PER_WIDTH = 3 / 4;

  const backgroundWindow: any = chrome.extension.getBackgroundPage();
  const tabManager: TabManager = backgroundWindow.tabManager;

  /*  Interfaces
     =============================================== */

  interface WindowUpdateOption {
    title?: string;
    snapshot?: string;
  }

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

    selectedWindowId: number = -1;
    currentTabWidth: number = DEFAULT_TAB_WIDTH;

    constructor() {
      this.windowWrapper = $('#window-wrapper-inner');
      this.tabWrapper = $('#tab-wrapper');
      this.windowTemplate = $($('#window-template').html());
      this.tabTemplate = $($('#tab-template').html());

      $('#window-add-btn').on('click', this.onClickAddWindow);
      this.tabWrapper.on('click', '.tab-remove-btn', this.onClickRemoveTab);
      this.tabWrapper.on('dblclick', '.tab', this.onDblClickTab);
    }

    addWindow(window: Window) : void {
      const windowDom = this.windowTemplate.clone();

      // be droppable to move tabs to the window
      windowDom.droppable({
        accept: '.tab',
        hoverClass: 'window-tab-hover',
        tolerance: 'pointer',
        drop: (event: Event, ui: JQueryUI.DroppableEventUIParam) => {
          const tabDom = ui.draggable;
          const windowDom = $(event.target);

          tabManager.moveTab(tabDom.data('id'), windowDom.data('id'));
          tabDom.remove();
        }
      });

      windowDom.click((event: JQueryEventObject) => {
        const windowDom = $(event.currentTarget);
        this.selectWindow(windowDom.data('id'));
      });

      windowDom.data('id', window.id);

      this.windowWrapper.append(windowDom);

      this.windowDomHash[window.id] = windowDom;
    }

    removeWindow(windowId: number) : void {
      const windowDom = this.windowDomHash[windowId];
      windowDom.remove();
      delete this.windowDomHash[windowId];
    }

    updateWindow(windowId: number, updates: WindowUpdateOption) : void {
      const windowDom = this.windowDomHash[windowId];

      if (windowDom == null) {
        return;
      }

      if (updates.title !== undefined) {
        windowDom.find('.template-title').text(updates.title);
      }
      if (updates.snapshot !== undefined) {
        windowDom.find('.template-image').css('background-image', 'url(' + updates.snapshot + ')');
      }
    }

    selectWindow(windowId: number) : void {
      const windowDom = this.windowDomHash[windowId];
      if (windowDom == null) {
        return;
      }
      this.selectedWindowId = windowId;

      this.windowWrapper.children().removeClass('window-selected');
      windowDom.addClass('window-selected');

      // display tabs on the current selected window
      this.tabWrapper.children().remove();
      this.tabDomHash = {};
      const tabs: Tab[] = tabManager.findTabsByWindowId(windowId);
      tabs.forEach((tab) => {
        this.addTab(tab);
      });
    }

    addTab(tab: Tab) : void {
      const tabDom = this.tabTemplate.clone();

      // be draggable the tab to move to any windows
      tabDom.draggable({
        opacity: 0.7,
        revert: true,
        revertDuration: 300,
        scroll: false,
        stack: '.tab'
      });

      tabDom.data('id', tab.id);
      tabDom.find('.template-image').css('background-image', 'url(' + tab.snapshot + ')');
      tabDom.find('.template-title').text(tab.title);
      this.resizeTab(tabDom, this.currentTabWidth);

      if (this.selectedWindowId === tab.windowId) {
        this.tabWrapper.append(tabDom);
      }

      this.tabDomHash[tab.id] = tabDom;
    }

    removeTab(tabId: number) : void {
      const tabDom = this.tabDomHash[tabId];
      tabDom.remove();
      delete this.tabDomHash[tabId];
    }

    updateTab(tabId: number, updates: TabUpdateOption) : void {
      const tabDom = this.tabDomHash[tabId];
      if (tabDom == null) {
        return;
      }

      if (updates.title !== undefined) {
        tabDom.find('.template-title').text(updates.title);
      }
      if (updates.snapshot !== undefined) {
        tabDom.find('.template-image').css('background-image', 'url(' + updates.snapshot + ')');
      }
    }

    resizeTabs(width: number) : void {
      Object.keys(this.tabDomHash).forEach((tabId: string) => {
        this.resizeTab(this.tabDomHash[tabId], width);
      });
    }

    private onClickAddWindow(event: JQueryEventObject) {
      chrome.windows.create({ focused: false });
    }

    private onClickRemoveTab(event: JQueryEventObject) {
      chrome.tabs.remove($(event.target).closest('.tab').data('id'));
    }

    private onDblClickTab(event: JQueryEventObject) {
      const tabId: number = $(event.currentTarget).data('id');
      const tab: Tab = tabManager.findTab(tabId);

      chrome.tabs.getCurrent((hawkeyeTab: chrome.tabs.Tab) => {
        chrome.tabs.update(tabId, { active: true });
        chrome.windows.update(tab.windowId, { focused: true });

        chrome.tabs.remove(hawkeyeTab.id);
      });
    }

    private resizeTab(tab: JQuery, width: number) : void {
      tab.width(width);
      tab.height(width * TAB_HEIGHT_PER_WIDTH);
    }
  }

  /*  Controller
     =============================================== */

  $(function() {

    /*  Initialize
     * ================================================ */

    const view = new IndexView();

    tabManager.windows.forEach((w) => {
      view.addWindow(w);

      // select the the current focused window
      const focusWindowId = tabManager.focusWindowId || -1;
      view.selectWindow(focusWindowId);
    });

    $('#tab-size-input').on('input', (event: any) => {
      view.currentTabWidth = event.target.value;
      view.resizeTabs(event.target.value);
    });

    /*  remove event listeners when the page is closed
     * ================================================ */

     $(window).on('unload', function() {
       tabManager.off(TabEvent.onAddWindow, onAddWindow);
       tabManager.off(TabEvent.onRemoveWindow, onRemoveWindow);
       tabManager.off(TabEvent.onAddTab, onAddTab);
       tabManager.off(TabEvent.onRemoveTab, onRemoveTab);
       tabManager.off(TabEvent.onCaptureTab, onCaptureTab);
       tabManager.off(TabEvent.onUpdateTab, onUpdateTab);
       tabManager.off(TabEvent.onActivateTab, onActivateTab);
     });

    /*  Event Listeners
     * ================================================ */

    tabManager.on(TabEvent.onAddWindow, onAddWindow);
    tabManager.on(TabEvent.onRemoveWindow, onRemoveWindow);
    tabManager.on(TabEvent.onAddTab, onAddTab);
    tabManager.on(TabEvent.onRemoveTab, onRemoveTab);
    tabManager.on(TabEvent.onCaptureTab, onCaptureTab);
    tabManager.on(TabEvent.onUpdateTab, onUpdateTab);
    tabManager.on(TabEvent.onActivateTab, onActivateTab);

    /*  Event Listeners Implementation
     * ================================================ */

    function onAddWindow(window: Window) {
      view.addWindow(window);
    }

    function onRemoveWindow(windowId: number) {
      view.removeWindow(windowId);
    }

    function onAddTab(tab: Tab) {
      view.addTab(tab);
    }

    function onRemoveTab(tabId: number) {
      view.removeTab(tabId);
    }

    function onCaptureTab(tab: Tab) {
      console.log('----- capture tab');
      view.updateTab(tab.id, { snapshot: tab.snapshot });
      view.updateWindow(tab.windowId, { snapshot: tab.snapshot });
    }

    function onUpdateTab(tab: Tab) {
      console.log('----- update tab');
      view.updateTab(tab.id, { title: tab.title, snapshot: tab.snapshot });
    }

    function onActivateTab(tab: Tab) {
      console.log('----- activate tab');
      view.updateWindow(tab.windowId, { snapshot: tab.snapshot });
    }
  });
}
