module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      glob_to_multiple: {
        expand: true,
        flatten: true,
        cwd: 'test',
        src: ['*.coffee'],
        dest: 'test/',
        ext: '.js'
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js']
    },
    concat: {
      js: {
        src: [
          'src/boot.js',
          'src/util.js',
          'src/MObjectUtil.js',
          'src/interface.js'
          // 'src/module.js',
          // 'src/base.js',
          // 'src/$.js',
          // 'src/overload.js',
          // 'src/dsl.js'
          // 'src/may.js',
         ],
        dest: 'may.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'may.js',
        dest: 'may.min.js'
      }
    },
    cafemocha: {
      src: 'test/**/*.js',
      options: {
        require: ["should","sinon"],
        reporter: 'spec',
        ui: 'bdd',
        compilers: {
          coffee: ["coffee-script"]
        },
        globals: 'config'
      }
    },
    watch: {
      scripts: {
        files: ['src/*.js', 'test/*.coffee'],
        tasks: ['coffee', 'concat:js', 'cafemocha'],
        options: {
          spawn: true //为false时可能导致测试失败
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-cafe-mocha');

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['coffee', 'concat:js', 'cafemocha']);
};