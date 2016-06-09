/**
 * window.ts
 * Copyright (c) 2015 katashin
 * https://github.com/ktsn/hawkeye
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

module Hawkeye {
  export class Window {
    id: number;

    constructor(window: chrome.windows.Window) {
      this.id = window.id;
    }
  }
}
