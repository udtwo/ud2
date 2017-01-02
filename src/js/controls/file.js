/// <reference path="../ud2.js" />

// 日期选择控件
ud2.libExtend(function (inn, ud2) {
	'use strict';

	inn.controlCreater('file', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = inn.className(cls),
			// 错误常量
			ERR_LENGTH = 'length-error', ERR_TYPE = 'type-error', ERR_SIZE = 'size-error',
			ERR_REPEAT = 'repeat-error', ERR_SERVER = 'server-error', ERR_SERVER_RETURN = 'server-return-error',
			// 样式常量
			STY_SIMPLE = 'simple', STY_STANDARD = 'standard', STY_CUSTOM = 'custom',
			// 生成控件类型
			styles = inn.createStyle(STY_SIMPLE, STY_STANDARD, STY_CUSTOM);

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // 最大长度 最大文件尺寸(KB) 可重命名 重命名最大名称长度 文件过滤 文件上传URL 样式
				maxlength, maxsize, rename, renameLength, filter, urlUpload, style,
				// 获取用户自定义项
				options = control.getOptions([
					'maxlength', 'maxsize',
					['rename', 'isRename'],
					'renamLength', 'urlUpload', 'filter', 'style'
				], function (options) {
					var // 文件后缀
						ext = '(png|jpg|gif|bmp|svg|ico|html|js|cs|vb|css|less|scss|sass|mp3|mp4|wav|avi|ogg|mov|wmv|webm|flv|swf|txt|pdf|doc|docx|xls|xlsx|ppt|pptx|ett|wpt|dpt|rar|zip|iso)',
						files = new RegExp('^(' + ext + ',)*' + ext + '$'),
						i, len;

					// 初始化最大文件量
					maxlength = parseInt(options.maxlength) || 20;
					// 初始化最大文件尺寸
					maxsize = parseInt(options.maxsize) || 2048;
					// 初始化是否启用重命名
					rename = inn.boolCheck(options.rename, true);
					// 初始化启用重命名的最大名称长度
					renameLength = parseInt(options.renameLength) || 50;
					// 初始化文件过滤
					filter = options.filter || '';
					filter = files.test(filter) ? filter : 'gif,jpg,png';
					filter = filter === 'all' ? files.split('|') : filter.split(',');
					len = filter.length;
					for (i = 0; i < len; i++) filter[filter[i]] = filter[i];
					// 初始化文件上传URL
					urlUpload = options.urlUpload || '';
					// 初始化样式
					style = options.style;
					if (!styles[style]) style = STY_CUSTOM;
				}),
				// 控件结构
				template = '<input type="file" multiple />',
				// 获取初始化的控件对象
				current = control.current,
				// 控件对象
				$file = current.html(template),
				// 文件输入对象 
				$input = $file.children('input'),
				// 待上传的文件集合
				upfiles = [],
				// 控件状态
				// 0 未上传  1 上传中  2 已完成
				upState = 0,
				// 上传完成统计
				upDownNum = 0,
				// 上传失败统计
				upErrorNum = 0,
				// 样式相关操作集合
				fileStyle = {},
				// 文件相关操作回调函数
				fileFunction = {
					// 文件添加
					add: $.noop,
					// 文件移出
					remove: $.noop,
					// 文件上传
					upload: $.noop,
					// 文件清空
					clear: $.noop,
					// 文件上传进度
					progress: $.noop,
					// 文件上传完成
					done: $.noop,
					// 文件上传失败
					fail: $.noop
				},
				// 回调函数
				controlCallbacks = {
					// 发生错误
					error: function (errType, userArg) {
						switch (errType) {
							case ERR_LENGTH: ud2.message.danger('您选择的文件数量已经超过最大个数限制，该限制为 ' + maxlength + ' 个'); break;
							case ERR_TYPE: ud2.message.danger('您选择的文件类型不符合要求，请您重新选择文件'); break;
							case ERR_SIZE: ud2.message.danger('您选择的文件超出 ' + maxsize + 'KB 限制，尺寸不符的文件：' + userArg.join('、')); break;
							case ERR_REPEAT: ud2.message.warning('您选择的文件已存在于列表中，重复的文件：' + userArg.join('、')); break;
							case ERR_SERVER: ud2.message.danger('您的文件 ' + userArg + ' 已被阻止，请检查您的文件'); break;
							case ERR_SERVER_RETURN: ud2.message.danger('文件 ' + userArg + ' 被服务器退回，请检查您的文件是否符合要求'); break;
						}
					},
					// 全部上传完成
					complete: $.noop,
					// 单个文件上传完成
					// 此回调函数在设置时需要回传服务器的返回结果true返回上传服务器成功，false返回上传服务器失败
					done: $.noop,
					// 单个文件上传失败
					fail: $.fail
				};

			// #endregion

			// #region 私有方法

			// 检测文件类型
			// files[file]: 选择文件集合
			// return[bool]: 返回类型检测状态  false 未通过检测  true 通过检测
			function typeCheck(files) {
				var errNum = 0, ext, i = 0, len = files.length;

				// 迭代
				for (; i < len; i++) {
					// 当前文件扩展名
					ext = files[i].name.split('.');
					ext = ext[ext.length - 1].toLowerCase();
					if (!ext || filter[ext] === void 0) {
						return false;
					}
				}

				return true;
			}
			// 文件处理并加入到待上传列表
			// files[file]: 选择文件集合
			function filesHandler(files) {
				var i = 0, len = files.length;
				if (len + upfiles.length > maxlength) {
					controlCallbacks.error.call(control.public, ERR_LENGTH);
				}
				else if (!typeCheck(files)) {
					controlCallbacks.error.call(control.public, ERR_TYPE);
				}
				else {
					var errFile = [], repeatFile = [], up = 0;
					for (; i < len; i++) {
						if (files[i].size > maxsize * 1024) {
							errFile.push(files[i].name);
						}
						else {
							if (upfiles.some(function (file) { return file.name === files[i].name && file.size === files[i].size; })) {
								repeatFile.push(files[i].name);
							} else {
								upfiles.push(files[i]);
								fileFunction.add(files[i]);
								up++;
							}
						}
					}

					if (repeatFile.length > 0) {
						controlCallbacks.error.call(control.public, ERR_REPEAT, repeatFile);
					}

					if (errFile.length > 0) {
						controlCallbacks.error.call(control.public, ERR_SIZE, errFile);
					}
				}
			}
			// 控件XML HTTP REQUEST设置
			// file[file]: 文件对象
			function xhrSetting(file) {
				var data = new FormData(), url = urlUpload;
				data.append('file', file);

				// 判断是否支持重命名
				if (rename) url += '?name=' + file.newname + '&tick=' + new Date().getTime();

				$.ajax({
					'type': 'POST',
					'url': url,
					'data': data,
					'contentType': false,
					'processData': false,
					'xhr': function () {
						var xhr = $.ajaxSettings.xhr();
						if (xhr.upload) {
							xhr.upload.addEventListener('progress', function (event) {
								var progress = parseInt(event.loaded / event.total * 100);
								fileFunction.progress(file, progress);
							}, false);
						}
						return xhr;
					}
				}).done(function (data) {
					var isSuccess;
					setDoneNumIncrease();
					isSuccess = controlCallbacks.done.call(control.public, data, file);
					if (isSuccess === void 0) isSuccess = true;
					if (!isSuccess) {
						setErrorNumIncrease();
						controlCallbacks.error.call(ctrl.public, ERR_SERVER_RETURN, file.name);
					}
					fileFunction.done(isSuccess, file);
					if (getDoneNum() === upfiles.length) {
						upState = 2;
						controlCallbacks.complete.call(control.public);
					}
				}).fail(function (data) {
					setDoneNumIncrease();
					setErrorNumIncrease();
					controlCallbacks.fail.call(control.public, data, file);
					fileFunction.fail(file);
					controlCallbacks.error.call(ctrl.public, ERR_SERVER, file.name);
					if (getDoneNum() === upfiles.length) {
						upState = 2;
						controlCallbacks.complete.call(control.public);
					}
				});
			}
			// 设置完成文件数量递增
			function setDoneNumIncrease() {
				upDownNum++;
			}
			// 设置失败文件数量递增
			function setErrorNumIncrease() {
				upErrorNum++;
			}

			// #endregion

			// #region 公共方法

			// 获取控件内容对象
			// return[jQuery]: 控件内容对象
			function getContent() {
				return $file;
			}
			// 获取控件重命名相关设置状态
			// return[object]: 重命名相关设置
			function getRenameState() {
				return {
					state: rename,
					length: renameLength
				};
			}
			// 获取上传文件集合
			// return[array]: 文件对象组
			function getUpfiles() {
				return upfiles;
			}
			// 获取完成文件数量
			// return[number]: 获取完成上传数量
			function getDoneNum() {
				return upDownNum;
			}
			// 获取失败文件数量
			// return[number]: 获取上传失败数量
			function getErrorNum() {
				return upErrorNum;
			}
			// 获取当前控件状态
			// return[number]: 当前控件状态
			function getUpState() {
				return upState;
			}
			// 为按钮绑定文件添加功能
			// fileAdd[jQuery]: 文件添加按钮
			// return[ud2.file]: 返回该控件对象
			function bindFileAddBtn(fileAdd) {
				fileAdd = inn.convertToJQ(fileAdd);
				ud2.event(fileAdd, { stopPropagation: true }).setTap(function () {
					// 判断控件状态，只允许控件在等待上传状态下进行操作
					if (upState !== 0) return;
					$input.trigger('click');
				});
				return fileStyle;
			}
			// 为按钮绑定文件删除功能
			// fileClose[jQuery]: 文件删除按钮
			// file[file]: 待删除的文件
			// return[ud2.file]: 返回该控件对象
			function bindFileRemoveBtn(fileRemove, file) {
				fileRemove = inn.convertToJQ(fileRemove);
				ud2.event(fileRemove, { stopPropagation: true }).setTap(function () {
					// 判断控件状态，只允许控件在等待上传状态下进行操作
					if (upState !== 0) return;
					fileFunction.remove.call(this, file);
				});
				return fileStyle;
			}
			// 为按钮绑定文件上传功能
			// fileUpload[jQuery]: 文件上传按钮
			// return[ud2.file]: 返回该控件对象
			function bindUploadBtn(fileUpload) {
				fileUpload = inn.convertToJQ(fileUpload);
				ud2.event(fileUpload, { stopPropagation: true }).setTap(function () {
					var data, i, len;
					if (upState !== 0 || upfiles.length === 0) return;
					upState = 1;
					data = new FormData(), i = 0, len = upfiles.length;
					for (; i < len; i++) xhrSetting(upfiles[i]);
					fileFunction.upload.call(this);
				});
				return fileStyle;
			}
			// 为按钮绑定待文件清空功能
			// fileClear[jQuery]: 文件清空按钮
			// return[ud2.file]: 返回该控件对象
			function bindClearBtn(fileClear) {
				fileClear = inn.convertToJQ(fileClear);
				ud2.event(fileClear, { stopPropagation: true }).setTap(function () {
					if (upState !== 0) return;
					upfiles.length = 0;
					fileFunction.clear.call(this);
				});
				return fileStyle;
			}
			// 为文件添加功能绑定处理方法
			// fn[function]: 处理方法
			function bindFileAdd(fn) {
				fileFunction.add = fn;
				return fileStyle;
			}
			// 为文件删除功能绑定处理方法
			// fn[function]: 处理方法
			function bindFileRemove(fn) {
				fileFunction.remove = fn;
				return fileStyle;
			}
			// 为文件上传功能绑定处理方法
			// fn[function]: 处理方法
			function bindFileUpload(fn) {
				fileFunction.upload = fn;
				return fileStyle;
			}
			// 为文件清空功能绑定处理方法
			// fn[function]: 处理方法
			function bindFileClear(fn) {
				fileFunction.clear = fn;
				return fileStyle;
			}
			// 为文件进度函数功能绑定处理方法
			// fn[function]: 处理方法
			function bindFileProgress(fn) {
				fileFunction.progress = fn;
				return fileStyle;
			}
			// 为文件完成功能绑定处理方法
			// fn[function]: 处理方法
			function bindFileDone(fn) {
				fileFunction.done = fn;
				return fileStyle;
			}
			// 为文件失败功能绑定处理方法
			// fn[function]: 处理方法
			function bindFileFail(fn) {
				fileFunction.fail = fn;
				return fileStyle;
			}

			// #endregion

			// #region 回调方法

			// 设置文件选取错误回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// - fn(errType, userArg)
			//   errType[string]: 错误类型
			//   userArg[object]: 用户参数
			// return[ud2.file]: 返回该控件对象
			function setError(fn) {
				controlCallbacks.error = fn;
				return control.public;
			}
			// 设置全部上传完成回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.file]: 返回该控件对象
			function setComplete(fn) {
				controlCallbacks.complete = fn;
				return control.public;
			}
			// 设置单个上传完成回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// - fn(data, file)
			//   data[string]: 服务器回传数据
			//   file[file]: 回传数据所属的上传文件
			// return[ud2.file]: 返回该控件对象
			function setDone(fn) {
				controlCallbacks.done = fn;
				return control.public;
			}
			// 设置单个上传失败回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// - fn(data, file)
			//   data[string]: 服务器回传数据
			//   file[file]: 回传数据所属的上传文件
			// return[ud2.file]: 返回该控件对象
			function setFail(fn) {
				controlCallbacks.fail = fn;
				return control.public;
			}

			// #endregion

			// #region 事件绑定

			// 文件输入框选择回调
			function inputChange() {
				filesHandler(this.files);
				inputClear();
			}
			// 清除文件输入框的值
			function inputClear() {
				var $form;
				if ($input.val() !== '') {
					if ($input.parent().get(0).nodeName.toLowerCase() !== 'form') {
						$form = $('<form />');
						$input.wrap($form);
					}
					$form = $input.parent();
					$form.get(0).reset();
				}
			}
			// 事件绑定
			function bindEvent() {
				// 文件编辑回调
				$input.on('change', inputChange);
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {

				// 控件初始化
				if (control.origin.length) {
					control.origin.after($file);
					control.origin.remove();
					control.transferStyles();
					control.transferAttrs({ accept: $input, attrReg: 'name|tabindex' });
				}
				// 事件绑定
				bindEvent();

				// 更新返回对象
				updateControlPublic();

				// 非自定义样式返回指定集成样式对象
				if (style === STY_STANDARD) return constructor.standard(control.public);

			}());

			// #endregion

			// #region 返回

			// 更新返回对象
			function updateControlPublic() {
				ud2.extend(control.public, {
					style: ud2.extend(fileStyle, {
						filesHandler: filesHandler,
						fileAddBtn: bindFileAddBtn,
						fileRemoveBtn: bindFileRemoveBtn,
						uploadBtn: bindUploadBtn,
						clearBtn: bindClearBtn,
						fileAddFn: bindFileAdd,
						fileRemoveFn: bindFileRemove,
						uploadFn: bindFileUpload,
						clearFn: bindFileClear,
						progressFn: bindFileProgress,
						doneFn: bindFileDone,
						failFn: bindFileFail
					}),
					getContent: getContent,
					getUpState: getUpState,
					getRenameState: getRenameState,
					getUpfiles: getUpfiles,
					getDoneNum: getDoneNum,
					getErrorNum: getErrorNum,
					setError: setError,
					setComplete: setComplete,
					setDone: setDone,
					setFail: setFail
				});
			}
			// 返回
			return control.public;

			// #endregion

		};
		// 控件类型
		constructor.style = styles;
		// 标准文件上传控件
		constructor.standard = function (control) {

			var // 容器对象
				$default, $fileEmpty, $fileDrag, $fileList, $fileTools, $fileAdd, $fileAddBox,
				// 重命名状态 文件集合对象
				rename, upfiles, style,
				// 继承父对象
				parent = control && control.ud2 && control.type === 'file' ? control
					: ud2.file.create.apply(constructor, arguments);

			// 文件添加处理方法
			function fileAdd(file) {
				var // 显示图片容器
					$box = $('<div class="' + cn('full-figure') + '">'
						+ '<div class="' + cn('full-img') + '"><img ondragstart="return false;" /></div>' + (rename.state ? '<div class="' + cn('full-rename') + '"><input type="text" value="' + file.name.substring(0, rename.length) + '" maxlength="' + rename.length + '" /></div>' : '<div>' + file.name + '</div>')
						+ '<div class="' + cn('full-close') + '"></div><div class="' + cn('full-progress') + '"></div></div>'),
					// 输入框
					$boxInput = $box.find('input'),
					// 关闭按钮
					$boxClose = $box.children(cn('full-close', 1)),
					// 文件读取对象
					reader;

				// 判断待上传文件框是否为空
				if (upfiles.length === 1) {
					$fileEmpty.fadeOut(200);
					$fileList.fadeIn(200);
					$fileTools.fadeIn(200);
				}

				// 图片处理方式
				if (/^image\/(png|jpeg|gif|bmp|svg)/.test(file.type)) {
					reader = new FileReader();
					reader.readAsDataURL(file);
					reader.addEventListener('loadend', function () {
						$box.find('img').attr('src', reader.result);
					});
				} else {
					$box.find('img').attr('src', 'data:image/svg+xml;base64,77u/PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDEzOCAxMTgiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEzOCAxMTg7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+DQoJLnB7ZmlsbDojZmZmO30NCjwvc3R5bGU+DQoJPHBhdGggY2xhc3M9InAiIGQ9Ik05MS42LDQzLjJjLTEuMi0xLjctMy0zLjctNC45LTUuNmMtMS45LTEuOS0zLjktMy42LTUuNi00LjljLTIuOS0yLjEtNC4zLTIuNC01LjEtMi40SDQ4LjUNCgkJYy0yLjUsMC00LjUsMi00LjUsNC41djQ4LjJjMCwyLjUsMiw0LjUsNC41LDQuNWg0MS4xYzIuNSwwLDQuNS0yLDQuNS00LjVWNDguM0M5NCw0Ny41LDkzLjgsNDYuMSw5MS42LDQzLjJ6IE04NC4zLDQwLjINCgkJYzEuNywxLjcsMy4xLDMuMyw0LjEsNC41aC04LjZ2LTguNkM4MSwzNy4xLDgyLjUsMzguNSw4NC4zLDQwLjJMODQuMyw0MC4yeiBNOTAuNCw4My4xYzAsMC41LTAuNCwwLjktMC45LDAuOUg0OC41DQoJCWMtMC41LDAtMC45LTAuNC0wLjktMC45VjM0LjljMC0wLjUsMC40LTAuOSwwLjktMC45YzAsMCwyNy43LDAsMjcuNywwdjEyLjVjMCwxLDAuOCwxLjgsMS44LDEuOGgxMi41VjgzLjF6Ii8+DQoJPHBhdGggY2xhc3M9InAiIGQ9Ik04MS41LDc2LjloLTI1Yy0xLDAtMS44LTAuOC0xLjgtMS44YzAtMSwwLjgtMS44LDEuOC0xLjhoMjVjMSwwLDEuOCwwLjgsMS44LDEuOA0KCQlDODMuMyw3Ni4xLDgyLjUsNzYuOSw4MS41LDc2Ljl6Ii8+DQoJPHBhdGggY2xhc3M9InAiIGQ9Ik04MS41LDY5LjdoLTI1Yy0xLDAtMS44LTAuOC0xLjgtMS44YzAtMSwwLjgtMS44LDEuOC0xLjhoMjVjMSwwLDEuOCwwLjgsMS44LDEuOA0KCQlDODMuMyw2OC45LDgyLjUsNjkuNyw4MS41LDY5Ljd6Ii8+DQoJPHBhdGggY2xhc3M9InAiIGQ9Ik04MS41LDYyLjZoLTI1Yy0xLDAtMS44LTAuOC0xLjgtMS44YzAtMSwwLjgtMS44LDEuOC0xLjhoMjVjMSwwLDEuOCwwLjgsMS44LDEuOA0KCQlDODMuMyw2MS44LDgyLjUsNjIuNiw4MS41LDYyLjZ6Ii8+DQo8L3N2Zz4=');
					$box.find('img').css('background', '#3f99d5');
				}

				// 建立互相引用关系
				$box.data('file', file);
				file.element = $box;
				style.fileRemoveBtn($boxClose, file);

				// 如果支持重命名则开启重命名
				if (rename.state) {
					file.newname = file.name;
					$boxInput.on(inn.an.event[20], function (event) {
						event.preventDefault();
						$(this).select();
					}).on(inn.an.event[18], function () {
						file.newname = $(this).val();
					});
				}

				// 放入列表
				$fileAddBox.before($box);
				window.setTimeout(function () { $box.addClass(cn('full-figure-on')); }, 150);
			}
			// 文件删除处理方法
			function fileRemove(file) {
				var index = upfiles.indexOf(file);
				upfiles.splice(index, 1);
				file.element.removeClass(cn('full-figure-on'));
				window.setTimeout(function () { file.element.remove(); }, 100);
				if (upfiles.length === 0) {
					$fileEmpty.show();
					$fileList.hide();
					$fileTools.hide();
				}
			}
			// 文件清空处理方法
			function clear() {
				$fileList.children().not('[' + cn('add') + ']').remove();
				$fileEmpty.show();
				$fileList.hide();
				$fileTools.hide();
			}
			// 文件进度处理方法
			function progress(file, progressNum) {
				var $progress = file.element.find(cn('full-progress', 1));
				$progress.css('width', progressNum + '%');
				$progress.html(progressNum + '%');
			}
			// 文件上传处理方法
			function upload(file) {
				$fileList.find('[' + cn('add') + ']').hide();
				$fileList.find(cn('full-close', 1)).hide();
				$fileList.find(cn('full-figure input')).attr('readonly', 'readonly');
				$fileTools.html('文件开始上传...');
			}
			// 文件上传完毕处理方法
			function done(state, file) {
				if (state) {
					file.element.addClass('success');
				} else {
					file.element.addClass('fail');
				}
				uploadStateView();
			}
			// 文件上传失败处理方法
			function fail() {
				file.element.addClass('fail');
				uploadStateView();
			}
			// 上传状态显示
			function uploadStateView() {
				if (control.getDoneNum() === upfiles.length) {
					$fileTools.html('<span class="c-success">全部文件已上传完毕，共 ' + control.getDoneNum() + ' 个' + (control.getErrorNum() !== 0 ? '，失败 ' + control.getErrorNum() + ' 个' : '') + '</span>');
				} else {
					$fileTools.html('已上传文件 ' + control.getDoneNum() + ' 个' + (control.getErrorNum() !== 0 ? '，失败 ' + control.getErrorNum() + ' 个' : ''));
				}
			}

			// 事件绑定
			function bindEvent() {
				$default.on('dragenter', function () {
					if (control.getUpState() !== 0) return;
					$default.addClass('ud2-file-full-dragenter');
				});
				$fileDrag.on('dragleave', function () {
					if (control.getUpState() !== 0) return;
					$default.removeClass('ud2-file-full-dragenter');
				}).on('dragover', function (event) {
					if (control.getUpState() !== 0) return;
					event.preventDefault();
					$default.addClass('ud2-file-full-dragenter');
				}).on('drop', function (event) {
					if (control.getUpState() !== 0) return;
					event.preventDefault();
					event = event.originalEvent;
					var files = event.dataTransfer && event.dataTransfer.files
						|| event.target && event.target.files;
					style.filesHandler(files);
					$default.removeClass('ud2-file-full-dragenter');
				});
			}

			// 初始化
			(function init() {
				style = parent.style;
				rename = parent.getRenameState();
				upfiles = parent.getUpfiles();

				$default = inn.jqe[0].clone().addClass(cn('full'));
				$fileEmpty = $('<div class="' + cn('full-nofile') + '"><button class="btn btn-solid c-blue" ud2-file-add><i class="ico ico-group-file"></i> 添加文件</button><em>拖拽文件上传 / 长按CTRL键可多选上传</em></div>');
				$fileDrag = $('<div class="' + cn('full-drag') + '">请松开鼠标按钮，文件将进入待上传队列</div>');
				$fileList = $('<div class="' + cn('full-list') + '"><div class="' + cn('full-add') + '" ud2-file-add><div><i class="ico ico-hollow-plus"></i><em>继续添加文件</em></div></div></div>');
				$fileTools = $('<div class="' + cn('full-tools') + '"><button class="btn btn-solid">确定上传</button><button class="btn btn-solid">清空列表</button></div>');
				$default.append($fileList).append($fileEmpty).append($fileDrag).append($fileTools);
				$fileAdd = $default.find('[' + cn('add') + ']');
				$fileAddBox = $fileList.find('[' + cn('add') + ']');
				parent.getContent().append($default);

				style
					.fileAddBtn($fileAdd)
					.uploadBtn($fileTools.children().eq(0))
					.clearBtn($fileTools.children().eq(1))
					.fileAddFn(fileAdd)
					.fileRemoveFn(fileRemove)
					.clearFn(clear)
					.progressFn(progress)
					.uploadFn(upload)
					.doneFn(done)
					.failFn(fail);

				bindEvent();

			}());

			// 返回
			delete parent.style;
			return parent;

		};

	});

});