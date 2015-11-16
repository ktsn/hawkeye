###
 Gruntfile.coffee
 Copyright (c) 2014 katashin
 https://github.com/ktsn/hawkeye

 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
###

module.exports = (grunt) ->

  grunt.loadNpmTasks "grunt-bower-task"
  grunt.loadNpmTasks "grunt-tsd"
  grunt.loadNpmTasks "grunt-typescript"
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

    tsd:
      refresh:
        options:
          command: "reinstall"
          config: "tsd.json"

    typescript:
      base:
        src: ["<%= dir.src %>/ts/*.ts"]
        dest: "<%= dir.dest %>/js/"
        options: require('./tsconfig.json').compilerOptions

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

    clean:
      destFolder:
        src: "<%= dir.dest %>"
      tmpFolder:
        src: "tmp/"

    watch:
      typescript:
        files: "<%= dir.src %>/ts/**.ts"
        tasks: ["typescript", "clean:tmpFolder"]
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
  grunt.registerTask "build", ["clean:destFolder", "bower", "tsd", "typescript", "copy:html", "copy:css", "copy:images", "copy:manifest", "clean:tmpFolder"]
