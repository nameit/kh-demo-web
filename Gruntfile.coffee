mountFolder = (connect, dir) ->
    connect.static(require('path').resolve(dir))

module.exports = (grunt) ->

  # Loads all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    meta:
      banner:
        '/* <%= pkg.name %> \n' +
        ' * version: <%= pkg.version %>\n' +
        ' * project: <%= pkg.project %>\n' +
        ' * update: <%= grunt.template.today(\"yyyy-mm-dd\") %>\n' +
        ' * Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %> <<%=pkg.author.email%>>; \n' +
        ' */\n\n'

    connect:
      site:
        options:
          port: 8088
          middleware: (connect) ->
            [mountFolder(connect, '_site')]
      docs:
        options:
          port: 8089
          middleware: (connect) ->
            [mountFolder(connect, '_docs')]

    sync:
      source:
        expand: true
        cwd: 'source/'
        src: '**'
        dest: 'site/'
        verbose: true
      project:
        expand: true
        cwd: 'project/<%= pkg.project %>/'
        src: '**'
        dest: 'site/'
        verbose: true
      release:
        expand: true
        cwd: '_site/'
        src: '**'
        dest: 'release/<%= pkg.project %>/<%= pkg.version %>/'
        verbose: true

    clean:
      site: ['site/**']
      release: ['.sass-cache', 'release/<%= pkg.project %>/<%= pkg.version %>/**']

    concat:
      jsToDest:
        src: ['site/_scripts/*.js']
        dest: 'site/js/ui.debug.js'

    uglify:
      options:
        banner: '<%= meta.banner %>'
      release:
        files: 'release/<%= pkg.project %>/<%= pkg.version %>/js/ui.min.js': ['release/<%= pkg.project %>/<%= pkg.version %>/js/ui.debug.js']

    cssmin:
      options:
        banner: '<%= meta.banner %>'
      release:
        expand: true
        cwd: 'release/<%= pkg.project %>/<%= pkg.version %>/css/'
        src: ['*.css', '!*.min.css']
        dest: 'release/<%= pkg.project %>/<%= pkg.version %>/css/'
        ext: '.min.css'

    compass:
      site:
        options:
          config: 'site/config.rb'

    jekyll:
      site:
        options:
          config: 'site/_config.yml'
      docs:
        options:
          config: 'docs/_config.yml'

    watch:
      css:
        files: ['site/_sass/**/*.scss']
        tasks: ['compass:site']
      js:
        files: ['site/_scripts/**/*.js']
        tasks: ['concat']
      site:
        files: ['site/**', '!site/_sass/**', '!site/_scripts/**']
        tasks: ['jekyll:site']
      source:
        files: ['source/**']
        tasks: ['sync:source']
      project:
        files: ['project/**']
        tasks: ['sync:project']

  grunt.registerTask 'build', ['compass:site', 'jekyll:site']
  grunt.registerTask 'dev', ['clean:site', 'sync:source', 'concat:jsToDest', 'build', 'connect:site', 'watch']
  grunt.registerTask 'release', ['clean:release', 'sync:release', 'cssmin', 'uglify']
