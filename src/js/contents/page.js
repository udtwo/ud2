/// <reference path="../ud2.js" />

// 选项卡组控件
ud2.libExtend(function (inn, ud2) {
	'use strict';

	inn.controlCreater('page', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = inn.className(cls);

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // 默认当前页码 默认最大页码 默认两端显示页码数量 是否包含页码 
				now, max, show, isMenu,
				// 图标显示状态 文本显示状态
				isIco, isText,
				// 布局模式 动态布局模式 动态布局模式触发宽度
				layout, relayout, relayoutWidth,
				// 获取用户自定义项
				options = control.getOptions([
					'now', 'max', 'show', ['menu', 'isMenu'], ['ico', 'isIco'], ['text', 'isText'],
					'layout', 'relayout', 'relayoutWidth'
				], function (options) {
					// 初始化当前页码和最大页码
					now = parseInt(options.now) || 1;
					max = parseInt(options.max) || now;
					if (now < 1) now = 1;
					if (max < now) max = now;
					// 初始化两端页码显示数量
					show = parseInt(options.show) || 2;
					// 初始化是否包含页码菜单
					isMenu = inn.boolCheck(options.menu, true);
					// 初始化图标显示状态
					isIco = inn.boolCheck(options.ico, true);
					// 初始化文本显示状态
					isText = inn.boolCheck(options.text, true);
					// 当小图标与文本都隐藏时，默认显示文本
					if (!isIco && !isText) isText = true;
					// 初始化动态布局模式
					relayout = inn.boolCheck(options.relayout, true);
					// 初始化动态布局模式触发宽度
					relayoutWidth = parseInt(options.relayoutWidth) || 767;

					// 初始化布局模式
					// 在init时，检测值是否符合要求
					layout = options.layout;
				}),
				// 控件结构
				template = '<a class="btn" ' + cn('fn') + '="0"><i class="ico">&#xec00;</i><span>首页</span></a>'
					+ '<a class="btn" ' + cn('fn') + '="1"><i class="ico">&#xec01;</i><span>上页</span></a>'
					+ '<a class="btn" ' + cn('fn') + '="2"><span>下页</span><i class="ico">&#xec02;</i></a>'
					+ '<a class="btn" ' + cn('fn') + '="3"><span>末页</span><i class="ico">&#xec03;</i></a>',
				// 获取初始化的控件对象
				current = control.current,
				// 控件对象
				$page = current.html(template).addClass('group'),
				// 按钮对象
				$btns = $page.children('a'),
				// 下拉菜单
				uSelect,
				// 页码事件
				eventNum,
				// 是否阻止页码回调
				// 当select控件更改显示值时，阻止回调，避免回调两次
				stopPageCall = false,
				// 回调方法
				controlCallbacks = {
					// 页码值变更回调
					change: inn.noop
				};

			// #endregion

			// #region 私有方法

			// 创建页码
			function linksCreate() {
				var links = [], i, $num = $page.find('[' + cn('num') + ']');
				$num.remove();
				if (layout === 0) return;
				if (eventNum) { eventNum.off(); }
				for (i = show; i >= 1; i--) if (now - i > 0) links.push('<a class="btn btn-solid" ' + cn('num') + '="' + (now - i) + '">' + (now - i) + '</a>');
				links.push('<a class="btn" ' + cn('num') + '="' + now + '" ' + cn('now') + '>' + now + '</a>');
				for (i = 1; i <= show; i++) if (now + i <= max) links.push('<a class="btn btn-solid" ' + cn('num') + '="' + (now + i) + '">' + (now + i) + '</a>');
				$btns.eq(1).after(links.join(''));
				$num = $page.find('[' + cn('num') + ']');
				eventNum = ud2.event($num).setTap(function () {
					var pageNum = this.attr(cn('num'));
					btnChange(pageNum);
				});
			}
			// 创建列表
			function listCreate() {
				// 移除列表
				listRemove();
				// 生成新页码
				for (var i = 1; i <= max; i++) {
					var selected = i === now ? true : false;
					uSelect.optionAdd(ud2.select.option(i, i, false, selected));
				}
			}
			// 移除列表
			function listRemove() {
				stopPageCall = true;
				var list = uSelect.options, listLen = list.length;
				for (var i = 0; i < listLen; i++) list[0].selectOut();
				stopPageCall = false;
			}
			// 按钮触发改变时的事件方法
			function btnChange(pageNow) {
				if (pageNow > max) pageNow = max;
				if (pageNow < 1) pageNow = 1;

				if (isMenu) {
					stopPageCall = true;
					uSelect.val(pageNow);
					stopPageCall = false;
				}

				pageChange(pageNow);
			}
			// 页码发生改变时的事件方法
			function pageChange(pageNow) {
				pageNow = parseInt(pageNow) || 1;
				if (pageNow === now) return;
				now = pageNow;
				linksCreate();
				controlCallbacks.change.call(control.public, now);
			}
			// 设置控件布局状态
			function setLayout(mode) {
				if (mode === 0 || mode === '0' || mode === 'small') layout = 0;
				else layout = 1;
				linksCreate();
				if (isMenu) {
					if (layout === 0) uSelect.insertAfter($btns.eq(1));
					else uSelect.appendTo($page);
				}
			}

			// #endregion

			// #region 公共方法

			// 操作控件的布局状态
			// 如果relayout动态布局已开启，则无法设置布局模式
			// () 获取控件当前的布局状态
			// - return[number]: 返回当前的布局状态码
			// (mode) 设置控件的布局模式
			// - mode[ud2.page.layout]: 布局状态码
			// - return[ud2.page]: 返回该控件对象
			function layoutOperate(mode) {
				if (mode !== void 0) {
					if (!relayout) setLayout(mode);
					return control.public;
				}
				else {
					return layout;
				}
			}
			// 操作控件的文本显示状态
			// () 获取控件当前的文本显示状态
			// - return[bool]: 返回当前的文本显示状态
			// (state) 设置控件的布局模式
			// - state[bool]: 文本显示状态
			// - return[ud2.page]: 返回该控件对象
			function isTextOperate(state) {
				if (state !== void 0) {
					isText = !!state;
					if (isText) {
						$page.removeClass('notext');
					}
					else {
						$page.addClass('notext');
					}
					return control.public;
				}
				else {
					return isText;
				}
			}
			// 操作控件的图标显示状态
			// () 获取控件当前的图标显示状态
			// - return[bool]: 返回当前的图标显示状态
			// (state) 设置控件的布局模式
			// - state[bool]: 图标显示状态
			// - return[ud2.page]: 返回该控件对象
			function isIcoOperate(state) {
				if (state !== void 0) {
					isIco = !!state;
					if (isIco) {
						$page.removeClass('noico');
					}
					else {
						$page.addClass('noico');
					}
					return control.public;
				}
				else {
					return isIco;
				}
			}
			// 操作当前页码
			// () 获取当前页码
			// - return[number]: 返回当前页码
			// (num) 设置当前页码
			// - num[number]: 待设置的页码
			// - return[ud2.page]: 返回该控件对象
			function nowOperate(num) {
				if (num !== void 0) {
					num = parseInt(num) || now;
					if (num < 1) num = 1;
					if (num > max) num = max;
					btnChange(num);
					return control.public;
				}
				else {
					return now;
				}
			}
			// 操作最大页码
			// () 获取最大页码
			// - return[number]: 返回最大页码
			// (num) 设置最大页码
			// - num[number]: 待设置的页码
			// - return[ud2.page]: 返回该控件对象
			function maxOperate(num) {
				if (num !== void 0) {
					max = parseInt(num) || max;
					if (max < 1) max = 1;
					if (isMenu) listCreate();
					if (max < now) btnChange(max);
					else linksCreate();
					return control.public;
				}
				else {
					return max;
				}
			}
			// 操作两端显示页码数量
			// () 获取两端显示页码数量
			// - return[number]: 返回两端显示页码数量
			// (num) 设置两端显示页码数量
			// - num[number]: 待设置的页码数量
			// - return[ud2.page]: 返回该控件对象
			function showOperate(num) {
				if (num !== void 0) {
					show = parseInt(num) || show;
					if (show < 0) show = 0;
					linksCreate();
					return control.public;
				}
				else {
					return show;
				}
			}

			// #endregion

			// #region 回调方法

			// 设置页发生改变时的回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.page]: 返回该控件对象
			function setChange(fn) {
				controlCallbacks.change = fn;
				return control.public;
			}

			// #endregion

			// #region 事件处理

			// 窗口尺寸改变的事件回调
			function resize() {
				var $parent = $page.parent(), width = $parent.width();
				if (width < relayoutWidth) {
					setLayout(0);
				}
				else {
					setLayout(1);
				}
			}
			// 事件绑定
			function bindEvent() {
				ud2.event($btns).setTap(function () {
					var index = parseInt(this.attr(cn('fn')));
					switch (index) {
						case 0: { btnChange(1); break; }
						case 1: { btnChange(now - 1); break; }
						case 2: { btnChange(now + 1); break; }
						case 3: { btnChange(max); break; }
					}
				});

				if (isMenu) {
					uSelect.setChange(function (val) {
						if (!stopPageCall) pageChange(val);
					});
				}
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {

				// 控件初始化
				if (control.origin.length) {
					control.origin.after($page);
					control.origin.remove();
					control.transferStyles();
				}

				// 如果包含菜单，添加菜单
				if (isMenu) {
					uSelect = ud2.select(control.public.id + '-select', { dir: ud2.select.direction.up, moveSelected: true });
					listCreate();
				}
				// 如果不带有图标，则取消
				if (!isIco) $page.addClass('noico');
				// 如果不带文本，则取消
				if (!isText) $page.addClass('notext');
				// 判断是否为动态布局模式
				if (relayout) {
					resize();
					ud2.callbacks.pageResize.add(resize);
				}
				else {
					// 设置布局
					setLayout(layout);
				}

				// 事件绑定
				bindEvent();
			}());

			// #endregion

			// #region 返回

			// 返回
			return ud2.extend(control.public, {
				layout: layoutOperate,
				isText: isTextOperate,
				isIco: isIcoOperate,
				now: nowOperate,
				max: maxOperate,
				show: showOperate,
				setChange: setChange
			});

			// #endregion

		};
		// 选项页类型
		constructor.layout = {
			small: 0,
			normal: 1
		};

	});

});