/**
 * database_service.ts
 * Copyright (c) 2016 katashin
 * https://github.com/ktsn/hawkeye
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

module Hawkeye.Service {
  import Repository = Hawkeye.Repository;

  const DATABASE_NAME = 'hawkeye';
  const DATABASE_VERSION = 1;

  let _db: IDBDatabase = null;
  let _promise: Promise<IDBDatabase> = null;

  type KeyPath = string | number;

  export function getDatabase() : Promise<IDBDatabase> {
    if (_db !== null) {
      return Promise.resolve(_db);
    }

    if (_promise !== null) {
      return _promise;
    }

    const req = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    _promise = new Promise((resolve, reject) => {
      req.onsuccess = event => {
        console.log('Success opening IndexedDB');
        _db = (<IDBOpenDBRequest>event.target).result;
        resolve(_db);
      };

      req.onerror = event => {
        console.log('Error openeing IndexedDB');
        reject((<IDBOpenDBRequest>event.target).error);
      };

      req.onupgradeneeded = onUpgradeNeeded;
    });

    return _promise;
  }

  function onUpgradeNeeded(event: Event) {
    console.log('Upgrade IndexedDB');

    const db: IDBDatabase = (<IDBOpenDBRequest>event.target).result;

    db.createObjectStore(
      Repository.SnapshotRepository.storeName,
      { keyPath: Repository.SnapshotRepository.keyPath }
    );
  }
}
