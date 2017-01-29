/// <reference path="../ud2.js" />

// 选项卡组控件
ud2.libExtend(function (inn, ud2) {
	'use strict';

	inn.controlCreater('tabs', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = inn.className(cls),
			// 内容对象模版
			$contentTemplate = inn.jqe[0].clone().addClass(cn('content')),
			// 主题对象
			themes = { normal: 'normal', simple: 'simple' },
			// 替代文本常量
			TYPE_TABS = 'tabs', TYPE_PAGE = TYPE_TABS + '.page', TYPE_PAGE_NAME = 'tabs-page';

		// 选项页添加
		// (object) 通过参数对象，创建一个选项页对象
		// - type[ud2.tabs.pageType]: 选项页类型
		// - name[string]: 选项页名称
		// - title[string]: 选项页标题
		// - details[string]: 选项页内容
		// - btnClose[bool]: 是否包含关闭按钮
		// (title, details) 通过参数对象创建一个不可关闭的内容选项页对象，该创建方式通常用于常规选项卡对象中，命名为递增种子方式自动命名
		// - title[string]: 选项页标题
		// - details[string]: 选项页内容
		// (type, title, details) 通过参数对象创建一个可关闭的自定义类型的选项页对象，该创建方式通常省略了选项页命名，命名为递增种子方式自动命名
		// - type[ud2.tabs.pageType]: 选项页类型
		// - title[string]: 选项页标题
		// - details[string]: 选项页内容
		// (type, name, title, details, btnClose) 通过参数创建一个选项页对象
		// - type[ud2.tabs.pageType]: 选项页类型
		// - name[string]: 选项页名称
		// - title[string]: 选项页标题
		// - details[string]: 选项页内容
		// - btnClose[bool]: 是否包含关闭按钮
		// return[ud2.tabs.page]: 返回创建的选项页对象
		inn.creater('page', function () {

			var // 参数集合         参数长度            参数对象
				args = arguments, len = args.length, argObj = args[0],
				// 选项页对象
				pageObj = { tabs: null },
				// 类型    标题    详情     是否包含关闭按钮 页名称
				pageType, title, details, btnClose, name,
				// 选项卡对象 内容对象 菜单项
				$tab, $content, $tabLink,
				// 显示状态
				isOpen = false;

			// 设置选项页的类型
			function setPageType(val) {
				switch (val) {
					case 'url': case 1: case '1': { pageType = 1; break; }
					default: case 'html': case 0: case '0': { pageType = 0; break; }
				}
			}

			// 标题操作
			// () 获取标题
			// - return[string]: 返回标题
			// (text) 设置标题
			// - text[string]: 待更改的标题
			// - return[ud2.tabs.page]: 返回该选项页对象
			function titleOperate(text) {
				if (text !== void 0) {
					title = String(text);
					$tab.attr('title', title).children('span').html(title);
					$tabLink.attr('title', title).children('span').html(title);
					return pageObj;
				}
				else {
					return title;
				}
			}
			// 描述操作
			// () 获取描述
			// - return[string]: 返回描述
			// (text) 设置描述
			// - text[string]: 待更改的描述
			// - return[ud2.tabs.page]: 返回该选项页对象
			function detailsOperate(text) {
				if (text !== void 0) {
					details = String(text);
					switch (pageType) {
						case 0: {
							$content.html(details);
							break;
						}
						case 1: {
							$content.children('iframe').attr('src', details);
							break;
						}
					}
					return pageObj;
				}
				else {
					return details;
				}
			}
			// 将对象加入到选项卡控件中
			// whichTabs[ud2.tabs]: 选项卡控件
			// return[ud2.tabs.page]: 返回该选项页对象
			function tabsIn(whichTabs) {
				if (whichTabs && whichTabs.type === TYPE_TABS && !pageObj.tabs) {
					whichTabs.pageAdd(pageObj);
				}
				return pageObj;
			}
			// 将对象从选项卡控件中移除
			// return[ud2.tabs.page]: 返回该选项页对象
			function tabsOut() {
				if (pageObj.tabs) {
					pageObj.tabs.pageRemove(pageObj);
				}
				return pageObj;
			}
			// 显示状态操作
			// () 获取当前对象的显示状态
			// - return[bool]: 返回当前对象的显示状态
			// (state) 设置当前对象的显示状态
			// - state[bool]: 当前对象的显示状态
			// - return[ud2.tabs.page]: 返回该选项页对象
			function openState(state) {
				if (state === void 0) {
					return isOpen;
				}
				else {
					isOpen = !!state;
					if (isOpen) {
						$tab.addClass('on');
						$content.addClass('on');
						$tabLink.addClass('on');
					}
					else {
						$tab.removeClass('on');
						$content.removeClass('on');
						$tabLink.removeClass('on');
					}
					return pageObj;
				}
			}

			// 获取选项内容对象
			// return[jquery]: 返回选项内容对象
			function getTab() {
				return $tab;
			}
			// 获取链接内容对象
			// return[jquery]: 返回链接内容对象
			function getTabLink() {
				return $tabLink;
			}
			// 获取描述内容对象
			// return[jquery]: 返回描述内容对象
			function getContent() {
				return $content;
			}

			// 初始化
			(function init() {

				if (len === 1 && ud2.type.isObject(argObj = args[0])) {
					pageType = argObj.type;
					name = argObj.name;
					title = argObj.title;
					details = argObj.details;
					btnClose = argObj.btnClose;

				}
				else if (len === 2) {
					title = args[0];
					details = args[1];
					btnClose = 0;
				}
				else if (len === 3) {
					pageType = args[0];
					title = args[1];
					details = args[2];
				}
				else if (len === 5) {
					pageType = args[0];
					name = args[1];
					title = args[2];
					details = args[3];
					btnClose = args[4];
				}

				setPageType(pageType);
				name = name || inn.createControlID(TYPE_PAGE_NAME);
				title = title || '未命名选项卡';
				details = details || (pageType === 1 ? 'about:blank' : '');
				btnClose = inn.boolCheck(btnClose, true);

				// 生成选项和描述内容对象
				$tab = inn.jqe[0].clone().addClass(cn('tab')).attr('title', title).append(inn.jqe[1].clone().html(title));
				$tabLink = inn.jqe[0].clone().addClass(cn('menu-item')).attr('title', title).append(inn.jqe[1].clone().html(title));
				$content = $contentTemplate.clone();
				if (btnClose) {
					$tab.append('<i class="ico ico-solid-cancel" />');
					$tabLink.append('<i class="ico ico-hollow-cancel" />');
				}
				switch (pageType) {
					case 0: {
						$content.append(details);
						break;
					}
					case 1: {
						$content.append('<iframe id="' + name + '" name="' + name + '" src="' + details + '" />').addClass('iframe');
						// 通过此项设置让apple中的iframe正常滚动
						if (ud2.support.apple) {
							$content.css({
								'-webkit-overflow-scrolling': 'touch',
								'overflow-y': 'scroll'
							});
						}
						break;
					}
				}

				

			}());

			// 返回
			return ud2.extend(pageObj, {
				name: name,
				type: TYPE_PAGE,
				getTab: getTab,
				getTabLink: getTabLink,
				getContent: getContent,
				openState: openState,
				title: titleOperate,
				details: detailsOperate,
				tabsIn: tabsIn,
				tabsOut: tabsOut
			});

		}, constructor);
		
		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // 是否有菜单工具 布局方式 选项卡可滚动 选项卡自动移动 目录自动移动  高度  选项卡最大宽度  主题
				isMenu, layout, isTabScroll, isTabAutoMove, isMenuAutoMove, height, maxWidth, theme,
				// 获取用户自定义项
				options = control.getOptions([
					'layout', ['menu', 'isMenu'], 'height', 'maxWidth', 'theme',
					['tabScroll', 'isTabScroll'],
					['tabAutoMove', 'isTabAutoMove'],
					['menuAutoMove', 'isMenuAutoMove']
				], function (options) {
					// 初始化是否可以关闭
					isMenu = inn.boolCheck(options.menu, true);
					// 初始化选项卡是否可以滚动
					isTabScroll = inn.boolCheck(options.tabScroll, true);
					// 初始化选项卡是否可以自动移动
					isTabAutoMove = inn.boolCheck(options.tabAutoMove, true);
					// 初始化目录项是否可以自动移动
					isMenuAutoMove = inn.boolCheck(options.menuAutoMove, true);
					// 初始化是否自动填满父层
					height = options.height || null;
					// 初始化横向选项卡组的选项卡最大宽度
					maxWidth = options.maxWidth;
					// 获取主题，在初始化时，赋值主题
					theme = options.theme;

					// 布局方式
					// 在init时，检测值是否符合要求
					layout = options.layout;
				}),
				// 控件结构
				template = '<div class="' + cn('bar') + '"><div class="' + cn('bar-inner') + '" /></div><div class="' + cn('main') + '" />',
				// 获取初始化的控件对象
				current = control.current,
				// 控件对象
				$tabs = current.html(template),
				// 选项滚动容器对象
				$tabScroll = $tabs.children(cn('bar', 1)),
				// 选项容器对象
				$tabBox = $tabs.find(cn('bar-inner', 1)),
				// 内容容器对象
				$contentBox = $tabs.find(cn('main', 1)),
				// 目录对象
				$menu = $('<div class="' + cn('menu') + '"><div class="' + cn('menu-btn') + '" /></div>'),
				// 事件遮罩
				$mask = $('<div class="' + cn('mask') + '" />'),
				// 目录按钮对象
				$menuBtn = $menu.children(':first'),
				// 目录容器对象
				$menuScroll = $('<div class="' + cn('menu-list') + ' empty" ' + cn('empty') + '="这里是空的"><div class="' + cn('menu-inner') + '" /></div>'),
				// 目录滚动容器对象
				$menuBox = $menuScroll.children(),
				// 选项页对象集合
				pageCollection = [],
				// 目录列表容器滚动条对象
				menuBoxScroll,
				// 选项卡容器滚动条对象
				tabBoxScroll, scrollSize = 0,
				// 当前开启的选项页对象
				pageOpenNow,
				// 控件回调
				controlCallbacks = {
					// 选项页改变时的回调
					change: inn.noop
				};

			// #endregion

			// #region 私有方法

			// 设置列表方向
			// direction[ud2.select.direction]: 方向值
			function setLayout(layoutNo) {
				// 移除旧CSS属性
				if (layout === 0) $tabs.removeClass(cn('top'));
				if (layout === 1) $tabs.removeClass(cn('bottom'));
				if (layout === 2) $tabs.removeClass(cn('left'));
				if (layout === 3) $tabs.removeClass(cn('right'));
				pageCollection.forEach(function (p) { p.getTab().removeAttr('style'); });

				// 加入新CSS属性
				switch (layoutNo) {
					default:
					case 'top':
					case '0':
					case 0: {
						layout = 0;
						$tabs.addClass(cn('top'));
						break;
					}
					case 'bottom':
					case '1':
					case 1: {
						layout = 1;
						$tabs.addClass(cn('bottom'));
						break;
					}
					case 'left':
					case '2':
					case 2: {
						layout = 2;
						$tabs.addClass(cn('left'));
						break;
					}
					case 'right':
					case '3':
					case 3: {
						layout = 3;
						$tabs.addClass(cn('right'));
						break;
					}
				}
				recountScrollSize();
			}
			// 设置横向选项卡组的选项卡最大宽度
			// mWidth[number]: 选项卡的最大宽度
			function setMaxWidth(mWidth) {
				if (mWidth === 'auto') {
					maxWidth = null;
				}
				else {
					maxWidth = parseInt(mWidth) || 150;
				}
			}
			// 设置主题
			// tm[string, number, ud2.tabs.theme]: 主题名称
			function setTheme(tm) {
				// 移除旧主题
				if (theme) $tabs.removeClass(cn(themes[theme]));

				switch (tm) {
					default:
					case themes.normal:
					case '0':
					case 0: {
						theme = null;
						break;
					}
					case themes.simple:
					case '1':
					case 1: {
						theme = themes.simple;
						$tabs.addClass(cn(themes[theme]));
						break;
					}
				}
			}
			// 重新计算滚动区域尺寸
			function recountScrollSize(size) {
				if (size === void 0) {
					scrollSize = 0;
					pageCollection.forEach(function (page) {
						// 重计算滚动尺寸
						if (layout === 0 || layout === 1) {
							size = Math.ceil(page.getTab().width());
							if (maxWidth && maxWidth < size) size = maxWidth;
							page.getTab().css('width', size);
						}
						else {
							size = Math.ceil(page.getTab().height());
							page.getTab().css('height', size);
						}

						// 赋值新尺寸
						page.size = size;
						recountScrollSize(size);
					});
				}
				else {
					scrollSize += size;
					if (layout === 0 || layout === 1) {
						$tabBox.width(scrollSize + pageCollection.length * 2);
					}
					else {
						$tabBox.height(scrollSize + pageCollection.length * 2);
					}
				}
			}
			// 重新计算并移动滚动区域
			function moveScroll(obj) {
				var pos, menuPos;
				if (isTabScroll) {
					tabBoxScroll.recountPosition();

					if (isTabAutoMove) {
						if (obj.getTab().prev().length !== 0) {
							pos = obj.getTab().prev().position();
						}
						else {
							pos = obj.getTab().position();
						}

						if (layout === 0 || layout === 1) {
							tabBoxScroll.move(pos.left, 0, 300);
						}
						else {
							tabBoxScroll.move(0, pos.top, 300);
						}
					}
				}

				if (isMenu) {
					menuBoxScroll.recountPosition();

					if (isMenuAutoMove) {
						if (obj.getTabLink().prev().length !== 0) {
							menuPos = obj.getTabLink().prev().position();
						}
						else {
							menuPos = obj.getTabLink().position();
						}

						menuBoxScroll.move(0, menuPos.top - 5, 300);
					}
				}
			}
			// 通过name属性获取选项页对象
			function getPageObjByName(name) {
				var f = pageCollection.filter(function (element) {
					return element.name === name;
				});
				return f && f[0];
			}
			// 解析原控件内的全部选项对象
			function analysisElements() {
				if (!control.origin.length) return;

				var selector = '[' + cn('page') + ']',
					$pages = control.origin.children(selector),
					i = 0, l = $pages.length,
					p, type, title, name, content, btnClose, openState;

				for (; i < l; i++) {
					p = $pages.eq(i);
					type = inn.attrValue(p, 'page-type', cls);
					name = inn.attrValue(p, 'page-name', cls);
					title = inn.attrValue(p, 'page-title', cls);
					content = p.html();
					btnClose = inn.attrValue(p, 'page-btn-close', cls, 1);
					openState = inn.boolCheck(inn.attrValue(p, 'page-open', cls, 0), 0);
					pageAdd(constructor.page({ type: type, title: title, name: name, details: content, btnClose: btnClose }), openState);
				}
			}

			// #endregion

			// #region 公共方法

			// 操作控件的布局状态
			// () 获取控件当前的布局状态
			// - return[number]: 返回当前的布局状态码
			// (mode) 设置控件的布局模式
			// - mode[ud2.tabs.layout]: 布局状态码
			// - return[ud2.tabs]: 返回该控件对象
			function layoutOperate(mode) {
				if (mode !== void 0) {
					setLayout(mode);
					recountScrollSize();
					return control.public;
				}
				else {
					return layout;
				}
			}
			// 操作控件的主题
			// () 获取控件当前的主题
			// - return[number]: 返回当前的主题名称
			// (mode) 设置控件的主题
			// - mode[ud2.tabs.layout]: 主题名称
			// - return[ud2.tabs]: 返回该控件对象
			function themeOperate(mode) {
				if (mode !== void 0) {
					setTheme(mode);
					return control.public;
				}
				else {
					return theme ? theme : themes.normal;
				}
			}
			// 操作控件高度
			// () 获取当前控件高度
			// - return[number]: 返回控件的高度
			// (h) 设置控件高度
			// - h[number, string]: 设置的高度值，可以是数字或字符形式的百分数
			// - return[ud2.tabs]: 返回该控件对象
			function heightOperate(h) {
				if (h === void 0) {
					return $tabs.height();
				}
				else {
					if (ud2.regex.percent.test(h) || ud2.regex.nonNegative.test(h) || h === 'auto') {
						$tabs.css('height', h);
						if (h === 'auto') $tabs.addClass(cn('auto'));
						else $tabs.removeClass(cn('auto'));
						height = h;
					}
					return control.public;
				}
			}

			// 向选项卡控件添加选项页对象
			// page[ud2.tabs.page]: 选项页对象
			// isOpen[bool]: 是否默认开启
			// return[ud2.tabs]: 返回该控件对象
			function pageAdd(page, isOpen) {
				var size, e, ce;
				if (page && page.type === TYPE_PAGE && !page.tabs && !hasName(page.name)) {
					// 绑定对象
					page.tabs = control.public;
					pageCollection.push(page);
					// 将元素加入到容器中
					$tabBox.append(page.getTab());
					$contentBox.append(page.getContent());

					// 重计算滚动尺寸
					if (layout === 0 || layout === 1) {
						size = Math.ceil(page.getTab().width());
						if (maxWidth && maxWidth < size) size = maxWidth;
						page.getTab().css('width', size);
					}
					else {
						size = Math.ceil(page.getTab().height());
						page.getTab().css('height', size);
					}
					// 赋值新尺寸
					page.size = size;
					recountScrollSize(size);

					if (isTabScroll) tabBoxScroll.recountPosition();
					// 生成菜单项
					if (isMenu) {
						$menuBox.append(page.getTabLink());
						menuBoxScroll.recountPosition();
					}

					// 是否自动开启
					if (pageCollection.length === 1 || isOpen) {
						pageOpen(page);
					}
					// 清除空选项样式
					if (pageCollection.length === 1) {
						$menuScroll.removeClass('empty');
					}

					// 绑定事件
					e = $().add(page.getTab().children('span'));
					ce = $().add(page.getTab().find('i'));
					if (isMenu) {
						e = e.add(page.getTabLink().children('span'));
						ce = ce.add(page.getTabLink().find('i'));
					}
					page.event = ud2.event(e).setTap(function () {
						pageOpen(page); menuClose();
					});
					page.closeEvent = ud2.event(ce).setTap(function () {
						pageRemove(page);
					});
				}
				return control.public;
			}
			// 从选项卡控件中移除指定的选项页对象
			// (name) 通过传入选项页名称查找相关的选项页对象并从控件中移除此对象
			// - name[string]: 选项页名称
			// (page) 通过传入选项页对象从控件中移除此对象
			// - page[ud2.tabs.page]: 选项页对象
			// return[ud2.tabs]: 返回该控件对象
			function pageRemove(page) {
				var index, size;
				if (page && page.type === TYPE_PAGE && page.tabs === control.public) {
					// 移除元素
					page.getTab().detach();
					page.getTabLink().detach();
					page.getContent().detach();
					page.event.off();
					page.closeEvent.off();
					// 解绑关系
					page.tabs = null;

					// 如果移除正在显示的页，则重新定位显示页
					index = pageCollection.indexOf(page);
					if (pageOpenNow === page) {
						page.openState(0);
						if (index > 0) {
							pageOpenNow = pageCollection[index - 1].openState(1);
						}
						else if (pageCollection.length > 1) {
							pageOpenNow = pageCollection[1].openState(1);
						}
					}
					pageCollection.splice(index, 1);

					// 计算尺寸
					size = -page.size;
					delete page.size;
					recountScrollSize(size);

					// 重新定位
					if (pageCollection.length === 0) {
						pageOpenNow = null;
						$menuScroll.addClass('empty');
					}
					else {
						moveScroll(pageOpenNow);
					}
				}
				else if (page) {
					return pageRemove(pageFind(page));
				}
				return control.public;
			}
			// 开启指定的选项页
			// (name) 通过传入选项页名称查找相关的选项页对象并从控件中移除此对象
			// - name[string]: 选项页名称
			// (page) 通过传入选项页对象从控件中移除此对象
			// - page[ud2.tabs.page]: 选项页对象
			// return[ud2.tabs]: 返回该控件对象
			function pageOpen(page) {
				if (page && page.type === TYPE_PAGE && page.tabs === control.public && pageOpenNow !== page) {
					if (pageOpenNow) pageOpenNow.openState(false);
					page.openState(true);
					moveScroll(page);
					pageOpenNow = page;
					controlCallbacks.change.call(control.public, page);
				}
				else if (page) {
					return pageOpen(pageFind(page));
				}
				return control.public;
			}
			// 通过name属性查找选项页对象
			// name[string]: 选项页名称
			// return[ud2.tabs.page]: 返回选项页对象
			function pageFind(name) {
				return getPageObjByName(name) || null;
			}
			// 查询选项页集合中是否包含此名称
			// name[string]: 待查询的名称
			// return[bool]: 返回是否包含该名称
			function hasName(name) {
				return !!getPageObjByName(name);
			}

			// #endregion

			// #region 回调方法

			// 设置选项页改变时的回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.page]: 返回该控件对象
			function setChange(fn) {
				controlCallbacks.change = fn;
				return control.public;
			}

			// #endregion

			// #region 事件处理

			// 目录关闭
			function menuClose() {
				$menu.removeClass('on');
			}
			// 目录开关
			function menuToggle() {
				$menu.toggleClass('on');
			}

			// 事件绑定
			function bindEvent() {
				// 选项容器滚动条
				var scrollOptions = {
					barState: 2,
					recountByResize: true,
					isScrollMode: false
				};
				if (isTabScroll) {
					if (layout === 0 || layout === 1) {
						scrollOptions.hasHorizontal = true;
						scrollOptions.hasVertical = false;
					}
					else {
						scrollOptions.hasHorizontal = false;
						scrollOptions.hasVertical = true;
					}

					tabBoxScroll = ud2.scroll($tabScroll, scrollOptions);
				}

				// 目录菜单
				if (isMenu) {
					ud2.event($menuBtn).setTap(menuToggle);
					menuBoxScroll = ud2.scroll($menuScroll, { barSize: 3, barColor: '#d5d5d5' });
				}

				// 设置遮罩
				ud2.event($tabScroll).setDown(function () {
					$mask.show();
				}).setUp(function () {
					$mask.hide();
				});
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 控件初始化
				if (control.origin.length) {
					control.origin.after($tabs);
					control.origin.remove();
					control.transferStyles();
				}

				// 设置布局
				setLayout(layout);
				// 设置横向选项卡组的选项卡最大宽度
				setMaxWidth(options.maxWidth);
				// 设置主题
				setTheme(theme);
				// 如果目录存在，加入目录对象
				if (isMenu) {
					$tabs.prepend($menu);
					$menu.after($menuScroll);
				}
				// 是数字或百分比，则设置高度
				heightOperate(height);
				// 加入遮罩
				$tabs.append($mask);

				// 事件绑定
				bindEvent();
				// 解析原控件
				analysisElements();
			}());

			// #endregion

			// #region 返回

			// 返回
			return ud2.extend(control.public, {
				height: heightOperate,
				layout: layoutOperate,
				theme: themeOperate,
				pages: pageCollection,
				pageAdd: pageAdd,
				pageRemove: pageRemove,
				pageOpen: pageOpen,
				pageFind: pageFind,
				hasName: hasName,
				setChange: setChange
			});

			// #endregion

		};
		// 主题
		constructor.theme = themes;
		// 布局方式
		constructor.layout = {
			// 上方
			top: 0,
			// 下方
			bottom: 1,
			// 左侧
			left: 2,
			// 右侧
			right: 3
		};
		// 选项页类型
		constructor.pageType = {
			html: 0,
			url: 1
		};

	});

});