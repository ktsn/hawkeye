###
 Gruntfile.coffee
 Copyright (c) 2014 katashin
 https://github.com/ktsn/TabManager

 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
###

module.exports = (grunt) ->

  grunt.loadNpmTasks "grunt-bower-task"
  grunt.loadNpmTasks "grunt-tsd"
  grunt.loadNpmTasks "grunt-typescript"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-clean"

  grunt.initConfig
    dir:
      src: "src"
      dest: "dest"

    bower:
      install:
        options:
          targetDir: '<%= dir.dest %>/lib'
          layout: 'byComponent'
          install: true

    tsd:
      refresh:
        options:
          command: "reinstall"
          config: "tsd.json"

    typescript:
      base:
        src: ["<%= dir.src %>/ts/background.ts"]
        dest: "<%= dir.dest %>/js/background.js"
      options:
        target: 'es5'

    copy:
      html:
        expand: true
        cwd: "<%= dir.src %>"
        src: ["**/*.html"]
        dest: "<%= dir.dest %>"
      js:
        expand: true
        cwd: "<%= dir.src %>"
        src: ["js/**"]
        dest: "<%= dir.dest %>"
      images:
        expand: true
        cwd: "<%= dir.src %>"
        src: ["images/**"]
        dest: "<%= dir.dest %>"
      manifest:
        expand: true
        cwd: "<%= dir.src %>"
        src: ["manifest.json"]
        dest: "<%= dir.dest %>"

    clean:
      destFolder:
        src: '<%= dir.dest %>'


  grunt.registerTask "default", ["clean:destFolder", "bower", "tsd", "typescript", "copy:html", "copy:js", "copy:images", "copy:manifest"]