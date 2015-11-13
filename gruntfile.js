/// <binding BeforeBuild='project-publish' ProjectOpened='project-open' />
"use strict";

module.exports = function (grunt) {
	grunt.initConfig({
		// 读取PACKAGE包
		pkg: grunt.file.readJSON('package.json'),
		// 清空文件夹
		clean: {
			'dist': {
				src: ['dist/', 'vendor/']
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
						+ '\n * (c) <%= grunt.template.today("yyyy") %> Peak(peak@udtwo.com) */\n',
					// 结尾注释
					footer: '\n/* lasted： <%= grunt.template.today("yyyy-mm-dd hh:MM:ss") %> */'
				},
				files: {
					'dist/js/ud2.js': [
						'src/js/ud2.js'
					]
				}
			},
			'script-ud2-oldbrowser': {
				options: {
					mangle: true,
					preserveComments: false,
					banner: '/*! <%= pkg.name %>(oldbrowser) - v<%= pkg.version %>'
						+ '\n * (c) <%= grunt.template.today("yyyy") %> Peak(peak@udtwo.com) */\n',
					footer: '\n/* lasted： <%= grunt.template.today("yyyy-mm-dd hh:MM:ss") %> */'
				},
				files: {
					'dist/js/ud2.oldbrowser.js': 'src/js/ud2.oldbrowser.js'
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
						+ '\n * (c) <%= grunt.template.today("yyyy") %> Peak(peak@udtwo.com) */\n',
					footer: '\n/* lasted： <%= grunt.template.today("yyyy-mm-dd hh:MM:ss") %> */'
				},
				files: {
					'dist/css/ud2.css': [
						'src/less/style/reset.less',
						'src/less/style/base.less',
						'src/less/style/form.less',
						'src/less/style/scroll.less',
						'src/less/style/table.less',
						'src/less/style/ctrl.less',

						'src/less/style/panel-signal.less',

						'src/less/style/ud2-address.less',
						'src/less/style/ud2-calendar.less',
						'src/less/style/ud2-file.less',
						'src/less/style/ud2-number.less',
						'src/less/style/ud2-range.less',
						'src/less/style/ud2-select.less',
						'src/less/style/ud2-table.less',

						'src/less/style/ud2-message.less',
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
			'watch-ud2-oldbrowser': {
				// 监测的文件
				files: ['src/js/ud2.oldbrowser.js'],
				// 执行任务
				tasks: ['uglify:script-ud2-oldbrowser']
			},
			'watch-less-ud2': {
				// 监测的文件
				files: ['src/**'],
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
}