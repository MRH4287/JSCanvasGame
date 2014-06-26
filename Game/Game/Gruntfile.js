'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
          '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
          '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
          ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

        typescriptFiles:
        [
          'build/GameHandler.js',
          'build/animationHandler.js',
          'build/eventHandler.js',
          'build/MultiplayerHandler.js',
          'build/NPCHandler.js',
          'build/PlayerManager.js',
          'build/Profiler.js',
          'build/renderer.js',
          'build/scriptHandler.js',
          'build/windowManager.js'
        ],

        // Task configuration.

        concat: {
            options:
            {
                /*banner: '<%= banner %>',
                stripBanners: true*/
            },
            main:
            {
                src: '<%= typescriptFiles %>',
                dest: 'build/package.js' //<%= pkg.name %>

            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: 'build/package.js', //'<%= concat.dist.dest %>',
                dest: 'build/package.min.js'
            }
        },

        tslint: {
            options: {
                configuration: grunt.file.readJSON("tslint.json")
            },
            files: {
                src: ['*.ts']
            }
        },
        jshint:
            {
                options: {
                    jshintrc: '.jshintrc'
                },
                gruntfile: {
                    src: 'Gruntfile.js'
                }
            },

        typescript: {
            base: {
                src: ['*.ts'],
                dest: 'build',
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    basePath: '',
                    sourceMap: true,
                    declaration: true
                }
            }
        },
        clean:
          {
              build:
              {
                  src: ["build"]
              }
          },
        watch:
            {
                gruntfile:
                    {
                        files: '<%= jshint.gruntfile.src %>',
                        tasks: ['jshint:gruntfile']
                    },

            },
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-tslint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default',
      [
          'clean:build',
          'tslint',
          'jshint',
          'typescript',
          'concat:main',
          'uglify'
      ]);

};

