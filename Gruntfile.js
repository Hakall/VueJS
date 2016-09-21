/**
 * Created by Alex on 21/09/2016.
 */
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';',
            },
            dist: {
                src: ['js/app/main.js'],
                dest: 'js/app.js'
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'css/index.css': 'css/sass/*.scss',
                }
            },
            prod: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'css/index.min.css': 'css/sass/*.scss'
                }
            }
        },
        uglify: {
            options: {
                separator: ';',
            },
            dist: {
                src: ['js/app/main.js'],
                dest: 'js/app.min.js'
            }
        },

        watch: {
        options: {
          livereload: true,
        },
        src: {
          files: ['js/*.js', 'css/**/*.scss', '**/*.json', '*.html','**/*.html','Gruntfile.js', 'views/*.jade'],
          tasks: ['default'],
        }
      }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat:dist', 'sass:dist']);
    grunt.registerTask('prod', ['uglify:dist', 'sass:prod']);
};
