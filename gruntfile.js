"use strict";

var // 清理发布文件夹
	cleanDirection = [
		'dist/', 'vendor/'
	];

module.exports = function (grunt) {
	grunt.initConfig({
		// 读取PACKAGE包
		pkg: grunt.file.readJSON('package.json'),
		// 清空文件夹
		clean: {
			'dist': {
				src: cleanDirection
			}
		},
		// 压缩JS文件
		uglify: {
			'script-ud2': {
				options: {
					// 是否混淆变量名 true:混淆
					mangle: true,
					// 是否删除注释 false:删除全部
					preserveComments: false,
					// 头注释
					banner: '/*! <%= pkg.name %> - v<%= pkg.version %>'
						+ '\n * (c) <%= grunt.template.today("yyyy") %> Peak(peak@udtwo.com)\n */\n'
				},
				files: {
					'dist/js/ud2.js': [
						'src/js/ud2.js'
					]
				}
			}
		},
		// 编译LESS
		less: {
			'css-ud2': {
				options: {
					// 是否压缩 true:是
					compress: true,
					// 头注释
					banner: '/*! <%= pkg.name %>.css - v<%= pkg.version %>'
						+ '\n * (c) <%= grunt.template.today("yyyy") %> Peak(peak@udtwo.com)\n */\n'
				},
				files: {
					'dist/css/ud2.css': [
						'src/less/style/base/reset.less',
						'src/less/style/base/elements.less',
						'src/less/style/base/ico.less',
						'src/less/style/base/loading.less',
						'src/less/style/base/form.less',

						'src/less/style/control/common.less',
						'src/less/style/control/ud2-number.less',
						'src/less/style/control/ud2-range.less',

						'src/less/style/event/ud2-scroll.less'

						//,
						// 'src/less/style/scroll.less',
						// 'src/less/style/table.less',
						// 'src/less/style/ctrl.less',

						// 'src/less/style/panel-signal.less',

						// 'src/less/style/ud2-address.less',
						// 'src/less/style/ud2-calendar.less',
						// 'src/less/style/ud2-file.less',
						// 'src/less/style/ud2-number.less',
						// 'src/less/style/ud2-range.less',
						// 'src/less/style/ud2-select.less',
						// 'src/less/style/ud2-page.less',
						// 'src/less/style/ud2-grid.less',

						// 'src/less/style/ud2-dialog.less',
						// 'src/less/style/ud2-message.less'
					]
				}
			}
		},
		// 复制文件
		copy: {
			'jquery': {
				expand: true,
				cwd: 'bower_components/jQuery/dist/',
				src: 'jquery.min.js',
				ext: '.js',
				dest: 'vendor/js/'
			},
			'ico': {
				expand: true,
				cwd: 'src/ico/',
				src: '*',
				dest: 'dist/ico/'
			},
			'json': {
				expand: true,
				cwd: 'json/compression/',
				src: '*',
				dest: 'dist/json'
			}
		},
		// 文件监测
		watch: {
			'watch-ud2': {
				// 监测的文件
				files: ['src/js/ud2.js'],
				// 执行任务
				tasks: ['uglify:script-ud2']
			},
			'watch-less-ud2': {
				// 监测的文件
				files: ['src/less/**'],
				tasks: ['less']
			}
		}
	});

	// 读取NPM任务组件
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');

	// 建立发布任务
	grunt.registerTask('project-open', ['clean', 'copy', 'less', 'uglify', 'watch']);
	grunt.registerTask('project-publish', ['clean', 'copy', 'less', 'uglify']);
};