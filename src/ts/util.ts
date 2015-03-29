/**
 * util.ts
 * Copyright (c) 2014 katashin
 * https://github.com/ktsn/TabManager
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */


module Util {

  export class EventTarget {
    listeners: any = {};

    on(name: string, callback: Function) : void {
      if (this.listeners[name] == null) {
        this.listeners[name] = [];
      }
      this.listeners[name].push(callback);
    }

    off(name: string) : void {
      this.listeners[name] = null;
    }

    fire(name: string, data: any) : void {
      if (this.listeners[name] == null) return;

      this.listeners[name].map((f) => f.call(this, data));
    }
  }

}
