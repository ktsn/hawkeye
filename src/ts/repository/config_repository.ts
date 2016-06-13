/**
 * config_repository.ts
 * Copyright (c) 2016 katashin
 * https://github.com/ktsn/hawkeye
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */


module Hawkeye.Repository {
  export class ConfigRepository {
    private static _instance: ConfigRepository = null;

    static get instance() : ConfigRepository {
      if (this._instance === null) {
        this._instance = new ConfigRepository();
      }
      return this._instance;
    }

    get thumbnailSize() : number {
      return Number(localStorage.getItem('thumbnailSize')) || null;
    }

    set thumbnailSize(value: number) {
      localStorage.setItem('thumbnailSize', value.toString());
    }
  }
}
