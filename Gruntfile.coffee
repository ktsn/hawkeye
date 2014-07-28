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
        src: ["<%= dir.src %>/ts/*.ts"]
        dest: "tmp/"
        options:
          module: "amd"
          target: "es5"

    copy:
      html:
        expand: true
        cwd: "<%= dir.src %>"
        src: ["**/*.html"]
        dest: "<%= dir.dest %>"
      js:
        expand: true
        cwd: "tmp/<%= dir.src %>/ts/"
        src: ["*.js"]
        dest: "<%= dir.dest %>/js/"
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
        src: "<%= dir.dest %>"
      tmpFolder:
        src: "tmp/"


  grunt.registerTask "default", ["clean:destFolder", "bower", "tsd", "typescript", "copy:html", "copy:js", "copy:images", "copy:manifest", "clean:tmpFolder"]