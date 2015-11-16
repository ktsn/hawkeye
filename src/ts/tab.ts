/**
 * tab.ts
 * Copyright (c) 2015 katashin
 * https://github.com/ktsn/hawkeye
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

module Hawkeye {
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
      this.loading = tab.status === 'loading';
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
}
