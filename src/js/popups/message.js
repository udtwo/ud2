/// <reference path="../ud2.js" />

// 浮动消息控件
ud2.libExtend(function (inn, ud2) {
	'use strict';

	inn.controlCreater('message', function (collection, constructor) {

		var // className存于变量
			cls = collection.className,
			// 漂浮消息集合，装载处于显示状态的漂浮消息
			showBox = {}, LEN = 12;

		// 建立集合
		showBox[inn.an.pos[2]] = [];
		showBox[inn.an.pos[4]] = [];
		showBox[inn.an.pos[3]] = [];
		showBox[inn.an.pos[5]] = [];
		showBox[inn.an.pos[7]] = [];
		showBox[inn.an.pos[6]] = [];

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var //　位置   信息      样式   默认开启及关闭 是否有关闭按钮 关闭时间
				position, message, msgSC, autoSwitch, btnClose, closeTime,
				// 获取用户自定义项
				options = control.getOptions([
					'position', 'message', 'style', 'autoSwitch',
					['btnClose', 'isBtnClose'], 'closeTime'
				], function (options) {
					// 初始化是否默认开启及关闭
					autoSwitch = inn.boolCheck(options.autoSwitch, true);
					// 初始化位置
					setPosition(options.position);
					// 初始化消息内容
					if (control.origin.length) {
						message = options.message || control.origin.text() || '未知消息';
						control.origin.remove();
					} else {
						message = options.message || '未知消息';
					}
					// 初始化样式
					msgSC = options.style || '';
					// 初始化是否有关闭按钮
					btnClose = inn.boolCheck(options.btnClose, true);
					// 初始化关闭时间
					closeTime = options.closeTime || 5000;
				}),
				// 控件结构
				template = '<div class="message-content">' + message + '</div>',
				// 获取初始化的控件对象
				current = control.current,
				// 控件对象
				$message = current.html(template),
				// 关闭按钮
				$close = inn.jqe[2].clone().addClass('message-close'),
				// 显示状态
				isOpen = false,
				// 关闭定时器
				closeTimer = null,
				// 关闭按钮事件对象
				eventClose,
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
					case inn.an.pos[2]: case 'topLeft': case '1': case 1: { position = inn.an.pos[2]; break; }
					case inn.an.pos[3]: case 'topRight': case '2': case 2: { position = inn.an.pos[3]; break; }
					case inn.an.pos[7]: case 'bottomCenter': case '3': case 3: { position = inn.an.pos[7]; break; }
					case inn.an.pos[5]: case 'bottomLeft': case '4': case 4: { position = inn.an.pos[5]; break; }
					case inn.an.pos[6]: case 'bottomRight': case '5': case 5: { position = inn.an.pos[6]; break; }
					default: case inn.an.pos[4]: case 'topCenter': case '0': case 0: { position = inn.an.pos[4]; break; }
				}
			}

			// #endregion

			// #region 公共方法

			// 获取浮动消息内容对象
			// return[jquery]: 返回该控件内容容器
			function getContent() {
				return $message;
			}
			// 开启浮动消息控件
			// return[ud2.message]: 返回该控件对象
			function open() {
				var w, h, css, len, tb;

				if (!isOpen) {
					w = $message.outerWidth();
					h = $message.outerHeight();
					len = showBox[position].length;
					isOpen = true;
					showBox[position].push(control.public);

					tb = LEN + len * (h + LEN);
					switch (position) {
						case inn.an.pos[4]: { css = { top: tb, left: '50%', marginLeft: -w / 2 }; break; }
						case inn.an.pos[2]: { css = { top: tb, left: LEN }; break; }
						case inn.an.pos[3]: { css = { top: tb, right: LEN }; break; }
						case inn.an.pos[7]: { css = { bottom: tb, left: '50%', marginLeft: -w / 2 }; break; }
						case inn.an.pos[5]: { css = { bottom: tb, left: LEN }; break; }
						case inn.an.pos[6]: { css = { bottom: tb, right: LEN }; break; }
					}

					control.public.data = { tb: tb };
					$message.css(css).addClass('on');
					controlCallbacks.open.call(control.public);

					if (closeTime !== -1 && autoSwitch) {
						closeTimer = window.setTimeout(function () { remove(); }, closeTime);
					}
				}

				return control.public;
			}
			// 关闭浮动消息控件
			// return[ud2.message]: 返回该控件对象
			function close() {
				var h, index, len, i, top, topNow;

				if (isOpen) {
					if (closeTimer !== null) window.clearTimeout(closeTimer);
					h = $message.outerHeight();
					index = showBox[position].indexOf(control.public);
					len = showBox[position].length;
					isOpen = false;
					for (i = index; i < len; i++) {
						top = showBox[position][i].data.tb;
						topNow = top - h - LEN;
						showBox[position][i].data.tb = topNow;
						if (position === inn.an.pos[2] || position === inn.an.pos[3] || position === inn.an.pos[4]) {
							showBox[position][i].getContent().css('top', topNow);
						}
						else {
							showBox[position][i].getContent().css('bottom', topNow);
						}
					}

					showBox[position].splice(index, 1);
					$message.removeClass('on');
					controlCallbacks.close.call(control.public);
				}

				return control.public;
			}
			// 移除浮动消息控件
			// return[null]: 返回空对象
			function remove() {
				if (isOpen) {
					close();
					window.setTimeout(remove, 310);
					return null;
				}
				$message.remove();
				eventClose.off();
				control.remove();
				return null;
			}

			// #endregion

			// #region 回调方法

			// 设置开启回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.message]: 返回该控件对象
			function setOpen(fn) {
				controlCallbacks.open = fn;
				return control.public;
			}
			// 设置关闭回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.message]: 返回该控件对象
			function setClose(fn) {
				controlCallbacks.close = fn;
				return control.public;
			}

			// #endregion

			// #region 样式与事件处理

			// 事件处理
			function bindEvent() {
				eventClose = ud2.event($close).setTap(function () { remove(); });
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 向文档中添加控件
				$message.addClass('message');
				inn.body().append($message);

				// 添加样式
				if (msgSC !== '') $message.addClass(msgSC.name ? msgSC.name : msgSC);
				// 是否有关闭按钮
				if (btnClose) $message.append($close);
				// 是否自动开启
				if (autoSwitch) open();

				// 事件绑定
				bindEvent();
			}());

			// #endregion

			// #region 返回

			// 返回
			return ud2.extend(control.public, {
				getContent: getContent,
				open: open,
				close: close,
				remove: remove,
				setOpen: setOpen,
				setClose: setClose
			});

			// #endregion

		};
		// 浮动消息位置
		constructor.position = {
			topCenter: inn.an.pos[4],
			topLeft: inn.an.pos[2],
			topRight: inn.an.pos[3],
			bottomCenter: inn.an.pos[7],
			bottomLeft: inn.an.pos[5],
			bottomRight: inn.an.pos[6]
		};
		// 信息浮动消息控件
		constructor.info = function (text) {
			constructor({ message: text, style: ud2.style.info });
		};
		// 警告浮动消息控件
		constructor.warning = function (text) {
			constructor({ message: text, style: ud2.style.warning });
		};
		// 成功浮动消息控件
		constructor.success = function (text) {
			constructor({ message: text, style: ud2.style.success });
		};
		// 危险浮动消息控件
		constructor.danger = function (text) {
			constructor({ message: text, style: ud2.style.danger });
		};

	});

});