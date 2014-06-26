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
        copy:
            {
                pack:
                    {
                        src: 'renderer.js',
                        dest: 'build/renderer.js'
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
                ts:
                    {
                        files: '*.ts',
                        taks: ['devBuild']
                    }

            },
        'ftp-deploy': {
            build: {
                auth: {
                    host: 'mrh-development.de',
                    port: 21,
                    authKey: 'key1'
                },
                src: './',
                dest: '/',
                exclusions: ['.ftppass', 'bin', 'Controller', 'node_modules', 'obj', '.gitignore', 'jshint', '*.csproj', '**/*.cs', '*.user', '*.ts']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-tslint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ftp-deploy');

    grunt.registerTask('devBuild',
        [
          'clean:build',
          'tslint',
          'jshint',
          'typescript',
          'copy:pack',
          'concat:main'
        ]);

    grunt.registerTask('dev',
      [
          'devBuild',
          'watch'
      ]);

    grunt.registerTask('default',
      [
          'devBuild',
          'uglify'
      ]);

    grunt.registerTask('deploy',
      [
          'default',
          'ftp-deploy'
      ]);

};

