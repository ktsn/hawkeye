/**
 * db.ts
 * Copyright (c) 2016 katashin
 * https://github.com/ktsn/hawkeye
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

module Util {
  export function dbRequest<T>(req: IDBRequest) : Promise<T> {
    return new Promise((resolve, reject) => {
      req.onsuccess = event => resolve((<IDBRequest>event.target).result);
      req.onerror = event => reject((<IDBRequest>event.target).error);
    });
  }
}
