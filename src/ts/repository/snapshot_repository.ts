/**
 * snapshot_repository.ts
 * Copyright (c) 2016 katashin
 * https://github.com/ktsn/hawkeye
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

module Hawkeye.Repository {

  export class SnapshotRepository {
    static storeName: string = 'snapshots';
    static keyPath: string = 'url';

    private static _instance: SnapshotRepository = null;

    static get instance() : SnapshotRepository {
      if (this._instance === null) {
        this._instance = new SnapshotRepository();
      }
      return this._instance;
    }

    constructor() {}

    put(snapshot: Model.Snapshot) : Promise<void> {
      console.log('Before saving snapshot: ', snapshot);

      return Service
        .getDatabase()
        .then(db => {
          const t = db.transaction(SnapshotRepository.storeName, 'readwrite');
          const store = t.objectStore(SnapshotRepository.storeName);
          const obj = this.serialize(snapshot);
          return Util.dbRequest<void>(store.put(obj));
        })
        .then(_ => console.log('After saving snapshot: ', snapshot));
    }

    get(url: string) : Promise<Model.Snapshot> {
      console.log('Before getting snapshot of', url);

      return Service
        .getDatabase()
        .then(db => {
          const t = db.transaction(SnapshotRepository.storeName, 'readonly');
          const store = t.objectStore(SnapshotRepository.storeName);
          return Util.dbRequest(store.get(url));
        })
        .then(obj => {
          console.log('After getting snapshot of', url);

          if (obj == null) {
            return null;
          }

          return this.deserialize(obj);
        });
    }

    private serialize(s: Model.Snapshot) : { [key: string] : any } {
      return {
        image: s._dataUrl,
        url: s._capturedUrl,
        capturedDate: s._capturedDate
      };
    }

    private deserialize(o: { [key: string] : any }) : Model.Snapshot {
      return new Model.Snapshot(
        o['image'],
        o['url'],
        o['capturedDate']
      );
    }
  }
}
