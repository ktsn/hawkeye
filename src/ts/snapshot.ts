/**
 * snapshot.ts
 * Copyright (c) 2015 katashin
 * https://github.com/ktsn/hawkeye
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

module Hawkeye {
  export class Snapshot {
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
