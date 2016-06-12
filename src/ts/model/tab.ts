/**
 * tab.ts
 * Copyright (c) 2015 katashin
 * https://github.com/ktsn/hawkeye
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

module Hawkeye.Model {
  import SnapshotRepository = Hawkeye.Repository.SnapshotRepository;

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

      // Retrieve snapshot for given url
      SnapshotRepository.instance.get(this.url)
        .then(snapshot => {
          if (snapshot != null) {
            this._snapshot = snapshot;
          }
        });
    }

    set snapshot(dataUrl: string) {
      this._snapshot.setDataUrl(dataUrl, this.url);

      SnapshotRepository.instance.put(this._snapshot);
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
