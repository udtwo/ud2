/// <reference path="../ud2.js" />

// 对话框控件
ud2.libExtend(function (inn, ud2) {
	'use strict';

	inn.controlCreater('dialog', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = inn.className(cls),
			// 按钮常量
			FOOTER_SEND = '<button class="btn">确 定</button>', FOOTER_CANCEL = '<button class="btn">取 消</button>';

		// 通过参数获取坐标值
		// val[array, object, string, number]: 待转换的值
		// bX[number]: 缺省x值
		// bY[number]: 缺省y值
		// return[object]: 转换后的坐标值
		function getCoordinate(val, bX, bY) {
			if (ud2.type.isArray(val) && val.length === 2) {
				val = {
					x: val[0], y: val[1]
				};
			}
			else if (ud2.type.isObject(val)) {
				val = {
					x: val.x || val.width || val.w, y: val.y || val.height || val.h
				};
			}
			else if (ud2.type.isString(val)) {
				val = val.split(val.indexOf(',') > -1 ? ',' : ' ');
				if (val.length === 2)
					val = {
						x: val[0], y: val[1]
					};
				else
					val = {
						x: val[0], y: val[1]
					};
			}
			else if (ud2.type.isNumber(val)) {
				val = {
					x: val, y: val
				};
			}
			else {
				val = {
					x: 0, y: 0
				};
			}
			val.x = parseInt(val.x) || bX;
			val.y = parseInt(val.y) || bY;
			return val;
		}
		// 对话框参数处理方法
		// (option)
		// (title, content)
		// (title, content, icoStyle)
		// (title, content, sendFn)
		// (title, content, icoStyle, sendFn)
		// (title, content, ico, icoStyle)
		// (title, content, sendFn, cancelFn)
		// (title, content, icoStyle, sendFn, cancelFn)
		// (title, content, ico, icoStyle, sendFn)
		// (title, content, ico, icoStyle, sendFn, cancelFn)
		function dialogArgs(options, fn) {
			var len = options.length,
				title, content, ico, icoStyle, sendFn, cancelFn;

			if (len === 1 && ud2.type.isObject(options[0])) {
				title = options[0].title || '';
				content = options[0].content || '';
				ico = options[0].ico;
				icoStyle = options[0].icoStyle;
				sendFn = options[0].sendFn;
				cancelFn = options[0].cancelFn;
			}
			else {
				title = options[0] || '';
				content = options[1] || '';

				if (len === 3) {
					if (ud2.type.isFunction(options[2])) {
						sendFn = options[2];
					}
					else {
						icoStyle = options[2];
					}
				}

				if (len === 4) {
					if (ud2.type.isFunction(options[2]) && ud2.type.isFunction(options[3])) {
						sendFn = options[2];
						cancelFn = options[3];
					}
					else if (ud2.type.isObject(options[2]) && ud2.type.isFunction(options[3])) {
						icoStyle = options[2];
						sendFn = options[3];
					}
					else {
						ico = options[2];
						icoStyle = options[3];
					}
				}

				if (len === 5) {
					if (ud2.type.isObject(options[2]) && ud2.type.isFunction(options[3]) && ud2.type.isFunction(options[4])) {
						icoStyle = options[2];
						sendFn = options[3];
						cancelFn = options[4];
					}
					else {
						ico = options[2];
						icoStyle = options[3];
						sendFn = options[4];
					}
				}

				if (len === 6) {
					ico = options[2];
					icoStyle = options[3];
					sendFn = options[4];
					cancelFn = options[5];
				}
			}

			icoStyle = icoStyle && (!icoStyle.name || !icoStyle.ico) ? style.normal : icoStyle;
			sendFn = ud2.type.isFunction(sendFn) ? sendFn : inn.noop;
			cancelFn = ud2.type.isFunction(cancelFn) ? cancelFn : inn.noop;
			return fn(title, content, ico, icoStyle, sendFn, cancelFn);
		}
		// 对话框事件绑定
		function dialogBindEvent(dialog, $event, eventObj, sendFn, cancelFn, $input) {
			var send, cancel;
			if (eventObj.send) {
				send = ud2.event($event.eq(0)).setTap(function () {
					if (sendFn) sendFn($input && $input.val());
					if (send) send.off();
					if (cancel) cancel.off();
					dialog.remove();
				});
			}

			if (eventObj.cancel) {
				cancel = ud2.event($event.eq(1)).setTap(function () {
					if (cancelFn) cancelFn($input && $input.val());
					if (send) send.off();
					if (cancel) cancel.off();
					dialog.remove();
				});
			}
		}
		// 对话框CSS样式重写
		function dialogRewriteCSS($content, ico, icoStyle, content) {
			var $base = $('<table><tr><td></td></tr></table>'),
				$td = $base.find('td');
			$content.addClass(cn('built'));
			if (ico !== void 0) {
				$td.before('<td><i class="ico fc-' + icoStyle.name + '">' + ico + '</i></td>');
			}
			else if (icoStyle !== void 0 && icoStyle.name !== 'normal') {
				$td.before('<td><i class="ico fc-' + icoStyle.name + '">' + icoStyle.ico + '</i></td>');
			}
			$base.find('td:last').append(content);
			$content.append($base);
		}

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // 尺寸 位置     标题    内容     内容类型       底部    关闭按钮
				size, position, title, content, contentType, footer, btnClose,
				// 获取用户自定义项
				options = control.getOptions([
					'size', 'position', 'title', ['btnClose', 'isBtnClose'],
					'content', 'contentType', 'footer'
				], function (options) {
					// 初始化标题及内容
					title = options.title || '未定义标题';
					content = options.content || null;
					footer = options.footer === void 0 ? null : options.footer;
					setContentType(options.contentType);

					// 初始化尺寸
					size = getCoordinate(options.size, 400, 300);
					// 初始化位置
					position = options.position;
					position = position === void 0 ? inn.an.pos[0] : position;
					setPosition(position);

					// 初始化关闭按钮状态
					btnClose = inn.boolCheck(options.btnClose, true);
				}),
				// 控件结构
				template = '<div class="' + cn('header') + '">' + title + '</div>'
					+ '<div class="' + cn('body') + '" /><div class="' + cn('footer') + '" />'
					+ '<a class="' + cn('close') + ' ico">&#xed1f;</a>',
				// 获取初始化的控件对象
				current = control.current,
				// 控件对象
				$dialog = current.html(template),
				// 控件头部对象
				$header = $dialog.children('div').eq(0),
				// 控件内容对象
				$content = $dialog.children('div').eq(1),
				// 控件底部对象
				$footer = $dialog.children('div').eq(2),
				// 关闭按钮对象
				$close = $dialog.children('a'),
				// 动画锁
				animateLock = false,
				// 开启状态
				openState = false,
				// 事件对象
				eventObj = null,
				// 回调	
				controlCallbacks = {
					// 开启回调
					open: inn.noop,
					// 关闭回调
					close: inn.noop
				};

			// #endregion

			// #region 私有方法

			// 设置位置
			// pos[object, string, number]: 位置参数
			function setPosition(pos) {
				switch (pos) {
					case inn.an.pos[0]: case '0': { position = inn.an.pos[0]; break; }
					case inn.an.pos[1]: case '1': case 'full': case 'fullScreen': { position = inn.an.pos[1]; break; }
					case inn.an.pos[2]: case '2': case 'topLeft': { position = inn.an.pos[2]; break; }
					case inn.an.pos[3]: case '3': case 'topRight': { position = inn.an.pos[3]; break; }
					case inn.an.pos[5]: case '4': case 'bottomLeft': { position = inn.an.pos[5]; break; }
					case inn.an.pos[6]: case '5': case 'bottomRight': { position = inn.an.pos[6]; break; }
					default: { position = getCoordinate(position, 0, 0); break; }
				}
			}
			// 设置内容的类型
			function setContentType(val) {
				switch (val) {
					case 'url': case 1: case '1': { contentType = 1; break; }
					default: case 'html': case 0: case '0': { contentType = 0; break; }
				}
			}
			// 解析底部参数
			function analysisFooterArgs() {
				var foot = [];

				function analysisBtns(f) {
					if (!ud2.type.isObject(f)) return;

					var $btns = inn.jqe[2].clone().addClass('btn'), e = ud2.event($btns);
					$btns.html(f.text || '');
					$btns.event = e;
					if (f.class) $btns.addClass(f.class);
					if (f.tap) e.setTap(f.tap);
					foot.push($btns);
				}

				if (ud2.type.isArray(footer)) {
					footer.forEach(function (f) { analysisBtns(f); });
				}
				else {
					analysisBtns(footer);
				}

				// 迭代生成的按钮对象
				foot.forEach(function (f) { $footer.append(f); });
				footer = foot;
			}

			// #endregion

			// #region 公共方法

			// 获取对话框内容对象
			// return[jquery]: 返回对话框内容对象
			function getContent() {
				return $content;
			}
			// 获取对话框底部内容对象
			// return[jquery]: 返回对话框底部内容对象
			function getFooterContent() {
				return $footer;
			}
			// 对话框开启
			// return[ud2.dialog]: 返回该控件对象
			function open() {
				if (!openState && !animateLock) {
					openState = true;
					animateLock = true;
					inn.backmask.open(control.public);
					window.setTimeout(function () {
						$dialog.addClass('on');
					}, 10);
					window.setTimeout(function () {
						animateLock = false;
						controlCallbacks.open.call(control.public);
					}, 310);
				}
				return control.public;
			}
			// 对话框关闭
			// return[ud2.dialog]: 返回该控件对象
			function close() {
				if (openState && !animateLock) {
					openState = false;
					animateLock = true;
					inn.backmask.close(control.public);
					window.setTimeout(function () {
						$dialog.removeClass('on');
					}, 10);
					window.setTimeout(function () {
						animateLock = false;
						controlCallbacks.close.call(control.public);
					}, 310);
				}
				return control.public;
			}
			// 对话框移除
			// return[null]: 返回空对象
			function remove() {
				if (openState || animateLock) {
					if (openState) close();
					window.setTimeout(remove, 310);
					return null;
				}
				if (ud2.type.isArray(footer)) footer.forEach(function (f) { f.event.off(); });
				$dialog.remove();
				eventObj.off();
				control.remove();
				return null;
			}

			// 设置尺寸
			function size(resize) {
				var dialogCSS = {};

				resize = getCoordinate(resize, 400, 300);

				// 修改样式
				if (position !== inn.an.pos[1]) {
					dialogCSS.width = resize.x;
					dialogCSS.height = resize.y;
				}

				if (position === inn.an.pos[2]) $dialog.addClass(cn(inn.an.pos[2]));
				else if (position === inn.an.pos[3]) $dialog.addClass(cn(inn.an.pos[3]));
				else if (position === inn.an.pos[5]) $dialog.addClass(cn(inn.an.pos[5]));
				else if (position === inn.an.pos[6]) $dialog.addClass(cn(inn.an.pos[6]));
				else if (position === inn.an.pos[1]) $dialog.addClass(cn(inn.an.pos[1]));
				else if (position === inn.an.pos[0]) $dialog.addClass(cn(inn.an.pos[0]));
				else {
					dialogCSS.top = position.y;
					dialogCSS.left = position.x;
				}
				$dialog.css(dialogCSS);
			}

			// #endregion

			// #region 回调方法

			// 设置开启回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.dialog]: 返回该控件对象
			function setOpen(fn) {
				controlCallbacks.open = fn;
				return control.public;
			}
			// 设置关闭回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.dialog]: 返回该控件对象
			function setClose(fn) {
				controlCallbacks.close = fn;
				return control.public;
			}

			// #endregion

			// #region 样式与事件处理

			// 样式重写
			function rewriteCSS() {
				var ch;

				sizeHandler(size);

				// 关闭按钮
				if (!btnClose) {
					$close.detach();
				}

				// 内容初始化
				switch (contentType) {
					case 0: {
						if (control.origin.length) $content.append(control.origin.html());
						else $content.append(content);
						break;
					}
					case 1: {
						if (control.origin.length) ch = control.origin.html();
						else ch = content;
						$content.append('<iframe src="' + ch + '" />');
						$content.css('overflow-y', 'hidden');
						break;
					}
				}
				// 判断底部元素
				if (footer === null) {
					$footer.remove();
				}
				else {
					if ((ud2.type.isObject(footer) || ud2.type.isArray(footer)) && !ud2.type.isJQuery(footer)) {
						analysisFooterArgs();
					}
					else {
						$footer.html(footer);
					}
					$content.css('bottom', '3em');
				}

				// 放置到文档中
				inn.body().append($dialog);
			}
			// 事件绑定
			function bindEvent() {
				eventObj = ud2.event($close).setTap(close);
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 样式重写
				rewriteCSS();
				// 事件绑定
				bindEvent();
			}());

			// #endregion

			// #region 返回

			// 返回
			return ud2.extend(control.public, {
				getContent: getContent,
				getFooterContent: getFooterContent,
				open: open,
				close: close,
				remove: remove,
				setOpen: setOpen,
				setClose: setClose,
				size: size
			});

			// #endregion

		};
		// 对话框位置
		constructor.position = {
			center: inn.an.pos[0],
			fullScreen: inn.an.pos[1],
			topLeft: inn.an.pos[2],
			topRight: inn.an.pos[3],
			bottomLeft: inn.an.pos[5],
			bottomRight: inn.an.pos[6]
		};
		// 选项页类型
		constructor.contentType = {
			html: 0,
			url: 1
		};

		// 弹出对话框
		constructor.alert = function () {

			// 解析传入参数
			return dialogArgs.call(this, inn.argsToArray(arguments), function (title, content, ico, icoStyle, sendFn) {

				var // 对话框对象
					dialog = constructor({ title: title, size: [300, 220], btnClose: false, footer: FOOTER_SEND }),
					// 对话框内容对象
					$content = dialog.getContent(),
					// 对话框底部对象
					$footer = dialog.getFooterContent(),
					// 确定按钮
					$send = $footer.children('.btn:eq(0)'),
					// 事件对象
					eventObj = { send: 1 };

				// 初始化
				(function init() {
					dialogRewriteCSS($content, ico, icoStyle, content);
					dialog.setOpen(function () {
						$send.on('keydown', function (e) {
							var k = e.keyCode;
							if (k === 32 || k === 13) {
								$(this).blur();
								sendFn();
								dialog.close();
							}
						}).focus();
						dialogBindEvent(dialog, $footer.children('button'), eventObj, sendFn);
					}).setClose(function () {
						$send.off('keydown');
					}).open();
				}());

				return dialog;

			});

		};
		// 确认对话框
		constructor.confirm = function () {

			// 解析传入参数
			return dialogArgs.call(this, inn.argsToArray(arguments), function (title, content, ico, icoStyle, sendFn, cancelFn) {
				var // 对话框对象
					dialog = constructor({ title: title, size: [300, 220], btnClose: false, footer: FOOTER_SEND + FOOTER_CANCEL }),
					// 对话框内容对象
					$content = dialog.getContent(),
					// 对话框页脚内容
					$footer = dialog.getFooterContent(),
					// 确定按钮
					$send = $footer.children('.btn:eq(0)'),
					// 取消按钮
					$cancel = $footer.children('.btn:eq(1)'),
					// 事件对象
					eventObj = { send: 1, cancel: 1 };

				// 初始化
				(function init() {
					dialogRewriteCSS($content, ico, icoStyle, content);
					dialog.setOpen(function () {
						$send.on('keydown', function (e) {
							var k = e.keyCode;
							if (k === 32 || k === 13) {
								$(this).blur();
								sendFn();
								dialog.close();
							}
						}).focus();

						$cancel.on('keydown', function (e) {
							var k = e.keyCode;
							if (k === 32 || k === 13) {
								$(this).blur();
								cancelFn();
								dialog.close();
							}
						});

						dialogBindEvent(dialog, $footer.children('button'), eventObj, sendFn, cancelFn);
					}).setClose(function () {
						$send.off('keydown');
						$cancel.off('keydown');
					}).open();
				}());

				return dialog;
			});

		};
		// 提问对话框
		constructor.prompt = function () {

			// 解析传入参数
			return dialogArgs.call(this, inn.argsToArray(arguments), function (title, content, ico, icoStyle, sendFn, cancelFn) {
				var // 对话框对象
					dialog = constructor({ title: title, size: [300, 220], btnClose: false, footer: FOOTER_SEND + FOOTER_CANCEL }),
					// 对话框内容对象
					$content = dialog.getContent(),
					// 对话框页脚内容
					$footer = dialog.getFooterContent(),
					// 输入框内容对象
					$input = $('<input type="text" class="textbox" />'),
					// 事件对象
					eventObj = { send: 1, cancel: 1 };

				// 初始化
				(function init() {
					dialogRewriteCSS($content, ico, icoStyle, content);
					$content.find('td:last').append($input);
					dialog.setOpen(function () {
						dialogBindEvent(dialog, $footer.children('button'), eventObj, sendFn, cancelFn, $input);
					}).open();
				}());

				return dialog;
			});

		};

	});

});