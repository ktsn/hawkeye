/**
 * util.ts
 * Copyright (c) 2014 katashin
 * https://github.com/ktsn/TabManager
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */


module Util {

  export class Observable {
    listeners: any = {};

    on(name: string, callback: Function) : void {
      if (this.listeners[name] == null) {
        this.listeners[name] = [];
      }
      this.listeners[name].push(callback);
    }

    off(name: string, callback: Function = null) : void {
      if (callback === null) {
        this.listeners[name] = null;
        return;
      }

      if (this.listeners[name] == null) {
        return;
      }

      // remove only the given event listener
      this.listeners[name] = this.listeners[name].filter((listener) => {
        return listener !== callback;
      });
    }

    fire(name: string, data: any) : void {
      if (this.listeners[name] == null) return;

      this.listeners[name].map((f) => f.call(this, data));
    }
  }

}
