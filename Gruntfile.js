module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	jshint: {
		files: ['Gruntfile.js', 'src/**/*.js']
	},
	concat: {
		js:{
			src: ['src/may.js', 'src/objectUtil.js', 'src/global.js', 'src/util.js', 'src/meta.js', 'src/interface.js', 'src/module.js', 'src/base.js', 'src/$.js', 'src/overload.js',  'src/dsl.js'],
			dest: ['may.js']
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
    }
  });

  //grunt.loadNpmTasks('grunt-cafe-mocha');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['jshint','uglify']);

};
