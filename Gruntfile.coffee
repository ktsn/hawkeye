###
 Gruntfile.coffee
 Copyright (c) 2014 katashin
 https://github.com/ktsn/hawkeye

 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
###

module.exports = (grunt) ->

  grunt.loadNpmTasks "grunt-bower-task"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-watch"

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

    copy:
      html:
        expand: true
        cwd: "<%= dir.src %>"
        src: ["**/*.html"]
        dest: "<%= dir.dest %>"
      css:
        expand: true
        cwd: "<%= dir.src %>"
        src: ["**/*.css"]
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

    watch:
      css:
        files: "<%= dir.src %>/css/**.css"
        tasks: ["copy:css"]
      library:
        files: "bower.json"
        tasks: ["bower"]
      html:
        files: "<%= dir.src %>/**.html"
        tasks: ["copy:html", "copy:images", "copy:manifest"]

  grunt.registerTask "default", ["watch"]
  grunt.registerTask "build", ["bower", "copy:html", "copy:css", "copy:images", "copy:manifest"]
