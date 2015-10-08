﻿/// <reference path="../../vendor/js/jquery.js" />

if (typeof $ === 'undefined') throw new Error('ud2ui库需要JQuery支持');
var ud2 = (function (window, $) {
	"use strict";

	// #region 私有变量

	var // 页面的 document 对象
		document = window.document,
		// window 的 jQuery 对象
		$win = $(window),
		// document 的 jQuery 对象
		$dom = $(document),

		// 库名称
		libName = 'ud2',
		// 连接符
		joinStr = '-',
		// 数据属性前缀
		prefixData = 'data-',
		// 库属性前缀
		prefixLibName = [libName, joinStr].join(''),
		// 样式属性前缀集合
		// 有效集合 {1-4}
		prefixStyles = ' -webkit- -moz- -o- -ms- '.split(' '),

		// 浏览器支持情况
		support = (function () {
			var // 支持情况对象
				support = {},
				// 创建一个空的 div 元素
				div = document.createElement('div');

			// 判断是否为 safari 浏览器
			support.safari = /constructor/i.test(window.HTMLElement);
			// 判断是否支持 Touch 触摸事件
			support.touch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
			// 判断是否支持 Pointer 事件
			support.pointer = window.navigator.pointerEnabled;
			// 判断是否支持 MSPointer 事件 (IE10)
			support.msPointer = window.navigator.msPointerEnabled;
			// 判断是否支持 [CSS] touchAction(msTouchAction)
			support.touchAction = div.style.touchAction !== undefined || div.style.msTouchAction !== undefined || false;
			// 判断是否支持 [CSS] prespective
			support.perspective = div.style.perspective !== undefined ||
				div.style.msPerspective !== undefined ||
				div.style.mozPerspective !== undefined ||
				div.style.webkitPerspective !== undefined ||
				false;
			// 判断是否支持 [CSS] transition
			support.transition =
				div.style.transition !== undefined ||
				div.style.msTransition !== undefined ||
				div.style.mozTransition !== undefined ||
				div.style.webkitTransition !== undefined ||
				div.style.oTransition !== undefined ||
				false;
			// 判断是否支持 [CSS] animation
			support.animation =
				div.style.animation !== undefined ||
				div.style.mozAnimation !== undefined ||
				div.style.webkitAnimation !== undefined ||
				div.style.oAnimation !== undefined ||
				false;

			return support;
		}()),
		// 动画函数
		animationFrame = (function () {
			return
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function (callback) { window.setTimeout(callback, 1000 / 60); };
		}),
		// 当前时间
		getTime = Date.now || function getTime() { return new Date().getTime(); },

		// 触点常量
		POINTER_DOWN = support.pointer ? 'pointerdown' : 'MSPointerDown',
		POINTER_MOVE = support.pointer ? 'pointermove' : 'MSPointerMove',
		POINTER_UP = support.pointer ? 'pointerup' : 'MSPointerUp',
		TOUCH_START = 'touchstart',
		TOUCH_MOVE = 'touchmove',
		TOUCH_END = 'touchend',
		TOUCH_CANCEL = 'touchcancel',
		MOUSE_DOWN = 'mousedown',
		MOUSE_MOVE = 'mousemove',
		MOUSE_UP = 'mouseup',
		MOUSE_OUT = 'mouseout',
		// 触点 TAP/PRESS 事件有效长度
		POINTER_EVENT_VALIDLENGTH = 5,
		// 用于综合触点/触屏/鼠标按下时的事件名
		EVENT_DOWN = [POINTER_DOWN, TOUCH_START, MOUSE_DOWN].join(' '),

		// 日期正则
		// 可以匹配 xxxx(-|.|/)x{1,2}(-|.|/)x{1,2}
		regDate = /^(?:[12]\d{3}([\.\-\/])(?:(?:0?[13578]|1[02])\1(?:0?[1-9]|[12]\d|3[01])|(?:0?[469]|11)\1(?:0?[1-9]|[12]\d|30)|0?2\1(?:0?[1-9]|1\d|2[0-8]))$|[12]\d(?:[02468][048]|[13579][26])([\.\-\/])(?:(?:0?[13578]|1[02])\2(?:0?[1-9]|[12]\d|3[01])|(?:0?[469]|11)\2(?:0?[1-9]|[12]\d|30)|0?2\2(?:0?[1-9]|1\d|2[0-9])))$/,

		// 用于克隆的空 jQuery 对象
		$div = $('<div />'),
		$a = $('<a />'),
		$span = $('<span />'),

		// 返回 false 的空方法
		fnReturnFalse = function () { return false; },

		// 页面完成加载时的回调函数
		callbacksPageReady = $.Callbacks(),
		// 控件完全关闭的回调
		callbacksCtrlClose = $.Callbacks();

	// #endregion

	// #region 私有方法

	// 生成一个随机数
	// 随机数最大有效位数为 18 位
	// length[int]: 当函数传入一个参数，且参数为数字时，返回 len 位长度的随机数，len 超过最大有效位数时，则返回最大有效位数的随机数
	// return[number]: 返回的随机数
	function random(length) {
		var // 获取一个随机数
			r = Math.random(),
			// 获取方法参数
			args = arguments,
			// 获取参数
			len = length;

		// 判断传入参数
		if (!len || isNaN(parseInt(len))) len = 1;

		var // 10的乘积
			mul = 1,
			// 随机数长度
			len = args[0] > 18 ? 18 : args[0],
			// 迭代种子
			i = 0;

		for (; i < len; i++) mul *= 10;
		r = parseInt(r * mul).toString();

		// 当位数不足，则用0在前补位
		i = 0, len = len - r.length;
		for (; i < len; i++) r = '0' + r;

		// 返回随机数
		return r;
	}

	// 判断参数类型 isType(TypeName)(Value)
	// type[object]: 判断的参数类型 例如 Function、Array...
	// return[function]: 返回一个方法，此方法来判断传入的 Value 参数是否为 TypeName 类型
	function isType(type) {
		return function (obj) {
			return {}.toString.call(obj) === "[object " + type + "]";
		};
	}
	// 判断传入参数是否为一个对象 Object
	// typeValue[object]: 判断变量
	// return[bool]: 返回一个布尔值，此布尔值表示传入的 typeValue 参数是否为对象
	function isObject(typeValue) {
		return isType("Object")(typeValue);
	}
	// 判断传入参数是否为一个方法 Function
	// typeValue[object]: 判断变量
	// return[bool]: 返回一个布尔值，此布尔值表示传入的 typeValue 参数是否为方法
	function isFunction(typeValue) {
		return isType("Function")(typeValue);
	}
	// 判断传入参数是否为一个字符串 String 
	// typeValue[object]: 判断变量
	// return[bool]: 返回一个布尔值，此布尔值表示传入的 typeValue 参数是否为字符串
	function isString(typeValue) {
		return isType("String")(typeValue);
	}
	// 判断传入参数是否为一个数字 Number
	// typeValue[object]: 判断变量
	// return[bool]: 返回一个布尔值，此布尔值表示传入的 typeValue 参数是否为数字
	function isNumber(typeValue) {
		return isType("Number")(typeValue);
	}
	// 判断传入参数是否为一个自然数[非负整数](Natural Number)
	// typeValue[object]: 判断变量
	// return[bool]: 返回一个布尔值，此布尔值表示传入的 typeValue 参数是否为自然数
	function isNaturalNumber(typeValue) {
		return /^([1-9]\d+|[0-9])$/.test(typeValue);
	}
	// 判断传入参数是否为一个 jQuery 对象
	// typeValue[object]: 判断变量
	// return[bool]: 返回一个布尔值，此布尔值标识传入的 typeValue 参数是否为 jQuery 对象
	function isJQuery(typeValue) {
		return typeValue instanceof $;
	}

	// 强制转换传入参数成为一个自然数[非负整数](Natural Number)
	// 当不满足转换条件时，返回一个0
	// value[object]: 转换变量
	// return[int(0-∞)]: 返回一个自然数
	function convertToNaturalNumber(value) {
		return isNaturalNumber(value) ? +value : 0;
	}

	// #endregion

	// #region ud2 库私有方法

	// 检测传入的参数是否为 jQuery 对象
	// 如果是字符串则通过字符串生成 jQuery 对象
	// 如果检测非 jQuery 对象或无法转换为 jQuery 对象则转换为空 jQuery 对象
	// $elements[string, jQuery]: jQuery 对象或可生成 jQuery 对象的字符串
	// return[jQuery]: 返回一个检测后的 jQuery 对象
	function checkJQElements($elements) {
		if (!$elements) $elements = $();
		if (isString($elements)) $elements = $($elements);
		if ($elements === window) $elements = $(window);
		if (!isJQuery($elements)) $elements = $();
		return $elements;
	}
	// 遍历 $elements 的全部元素，并执行回调方法
	// 此方法会自动执行 checkJQElements 来检测传入参数
	// $elements[string, jQuery]: jQuery 对象或可生成 jQuery 对象的字符串
	// callbacks[function]: 遍历元素执行的回调
	// - callbacks($each[jQuery])
	//   $each[jQuery]: 遍历元素时的当前对象
	function eachJQElements($elements, callbacks) {
		$elements = checkJQElements($elements);
		$elements.each(function () {
			callbacks($(this));
		});
	}

	// 设置 options 选项
	// options[optionObject]: 控件默认选项
	// userOptions[optionObject]: 用户设置默认选项
	function setOptions(options, userOptions) {
		if (isObject(userOptions)) {
			for (var i in userOptions) {
				if (options[i] !== undefined) {
					options[i] = userOptions[i];
				}
			}
		}
	}

	// #endregion

	// #region ud2 库事件

	// ud2 库的事件对象
	// 用于处理触摸笔、触碰、鼠标等方式操作元素的事件处理
	// $elements[string, jQuery]: jQuery 对象或可生成 jQuery 对象的字符串
	// userOptions[object]: 用户参数
	// - (optional) stopPropagation[bool]: 是否阻止事件向外冒泡，默认为 false
	// return[event] => 返回一个事件公开方法对象
	var event = function ($elements, userOptions) {

		// #region 私有字段

		var // 事件对象
			eventObj = {},
			// 默认选项
			options = {
				// 阻止冒泡
				stopPropagation: false,
				// tap 的最大时间间隔，超出时间间隔则视为 press
				tapMaxTime: 300,
				// swipe 的最大时间间隔
				swipeMaxTime: 500
			},
			// 回调函数
			callbacks = {
				// 拖动
				pan: $.noop,
				// 短按
				tap: $.noop,
				// 长按
				press: $.noop,
				// 快速左滑动（< SWIPE_MAXTIME && >= POINTER_EVENT_VALIDLENGTH）
				swipeLeft: $.noop,
				// 快速右滑动（< SWIPE_MAXTIME && >= POINTER_EVENT_VALIDLENGTH）
				swipeRight: $.noop,
				// 快速上滑动（< SWIPE_MAXTIME && >= POINTER_EVENT_VALIDLENGTH）
				swipeTop: $.noop,
				// 快速下滑动（< SWIPE_MAXTIME && >= POINTER_EVENT_VALIDLENGTH）
				swipeBottom: $.noop,
				// 触点按下
				down: $.noop,
				// 触点抬起
				up: $.noop
			},
			// 最后一次触点弹起
			lastUpEvent = null,
			// 事件对象集合
			events = [];

		// #endregion

		// #region 私有方法

		// 设置浏览器的触控属性
		// $element[jQuery]: jQuery 对象
		// method[bool]: 添加触控属性 / 移除触控属性
		function setTouchAction($element, method) {
			if (method) {
				$element.css({
					// 在不支持 W3C 标准的 IE10/IE11 浏览器下清除触控效果
					'-ms-touch-action': 'none',
					// 在支持 W3C 标准的浏览器下清除触控效果
					'touch-action': 'none'
				});
			} else {
				$element.css({
					// 在不支持 W3C 标准的 IE10/IE11 浏览器下清除触控效果
					'-ms-touch-action': 'auto',
					// 在支持 W3C 标准的浏览器下清除触控效果
					'touch-action': 'auto'
				});
			}

			// 如果不支持 touchAction 则模拟
			if (!support.touchAction) {
				if (method) $element.bind('selectstart', fnReturnFalse);
				else $element.unbind('selectstart', fnReturnFalse);
			}
		}

		// #endregion

		// #region 设置回调方法

		// 设置拖动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(move[moveObj]) 
		//   move: 此回调函数拥有一个参数move，用来时时返回鼠标按下后移动的距离
		// return[event]: 当前事件对象，方便链式调用
		function setPan(fn) { callbacks.pan = fn; return eventObj; }
		// 设置短按回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// return[event]: 当前事件对象，方便链式调用
		function setTap(fn) { callbacks.tap = fn; return eventObj; }
		// 设置长按回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// return[event]: 当前事件对象，方便链式调用
		function setPress(fn) { callbacks.press = fn; return eventObj; }
		// 设置快速左滑动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// return[event]: 当前事件对象，方便链式调用
		function setSwipeLeft(fn) { callbacks.swipeLeft = fn; return eventObj; }
		// 设置快速右滑动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// return[event]: 当前事件对象，方便链式调用
		function setSwipeRight(fn) { callbacks.swipeRight = fn; return eventObj; }
		// 设置快速上滑动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// return[event]: 当前事件对象，方便链式调用
		function setSwipeTop(fn) { callbacks.swipeTop = fn; return eventObj; }
		// 设置快速下滑动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// return[event]: 当前事件对象，方便链式调用
		function setSwipeBottom(fn) { callbacks.swipeBottom = fn; return eventObj; }
		// 设置触点按下时的回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// return[event]: 当前事件对象，方便链式调用
		function setDown(fn) { callbacks.down = fn; return eventObj; }
		// 设置触点抬起时的回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// return[event]: 当前事件对象，方便链式调用
		function setUp(fn) { callbacks.up = fn; return eventObj; }

		// #endregion

		// #region 设置事件绑定与解绑

		// 事件绑定
		function on() {
			events.forEach(function () {
				arguments[0].bind();
			});
		}
		// 事件解绑
		function off() {
			events.forEach(function () {
				arguments[0].unbind();
			});
		}

		// #endregion

		// #region 构造方法

		// 构造一个触点
		// 用来存储触点相关数据
		// id[string]: 系统触点 ID
		// event[eventObject]: 系统触点数据对象
		function Pointer(id, event) {
			// 已被删除
			this.del = false;
			// 触点 ID
			this.id = id;
			// 按下时触点所在屏幕的 X 坐标
			this.downScreenX = event ? event.screenX : 0;
			// 按下时触点所在屏幕的 Y 坐标
			this.downScreenY = event ? event.screenY : 0;
			// 按下时计算滚轮数值时当前触碰点距离浏览器窗口左上角的 X 坐标
			this.downPageX = event ? event.pageX : 0;
			// 按下时计算滚轮数值时当前触碰点距离浏览器窗口左上角的 Y 坐标
			this.downPageY = event ? event.pageY : 0;
			// 按下时不计算滚轮数值时当前触碰点距离浏览器窗口左上角的 X 坐标
			this.downClientX = event ? event.clientX : 0;
			// 按下时不计算滚轮数值时当前触碰点距离浏览器窗口左上交的 Y 坐标
			this.downClientY = event ? event.clientY : 0;
			// 移动中触点所在屏幕的 X 坐标
			this.moveScreenX = this.downScreenX;
			// 移动中触点所在屏幕的 Y 坐标
			this.moveScreenY = this.downScreenY;
			// 移动中计算滚轮数值时当前触碰点距离浏览器窗口左上角的 X 坐标
			this.movePageX = this.downPageX;
			// 移动中计算滚轮数值时当前触碰点距离浏览器窗口左上角的 Y 坐标
			this.movePageY = this.downPageY;
			// 移动中不计算滚轮数值时当前触碰点距离浏览器窗口左上角的 X 坐标
			this.moveClientX = this.downClientX;
			// 移动中不计算滚轮数值时当前触碰点距离浏览器窗口左上交的 Y 坐标
			this.moveClientY = this.downClientY;
		}
		// 设置移动后的点数据
		// event[eventObject]: 事件对象
		Pointer.prototype.setMove = function (event) {
			event && event.screenX && (this.moveScreenX = event.screenX);
			event && event.screenY && (this.moveScreenY = event.screenY);
			event && event.pageX && (this.movePageX = event.pageX);
			event && event.pageY && (this.movePageY = event.pageY);
			event && event.clientX && (this.moveClientX = event.clientX);
			event && event.clientY && (this.moveClientY = event.clientY);
		}
		// 获取触点移动的距离
		// return[object]: 移动距离
		Pointer.prototype.getMoveLength = function () {
			return {
				x: this.movePageX - this.downPageX,
				y: this.movePageY - this.downPageY
			};
		}

		// #endregion

		// #region 事件对象

		// 通过 $element 对象一个事件监听对象
		// $element: jQuery => jQuery对象
		function event($element) {

			// #region 私有字段

			var // 事件承载对象
				$event = $element,
				// 事件名称
				eventsName = [
					POINTER_DOWN,         // 0
					POINTER_MOVE,         // 1
					POINTER_UP,           // 2
					TOUCH_START,          // 3
					TOUCH_MOVE,           // 4
					TOUCH_END,            // 5
					TOUCH_CANCEL,         // 6
					MOUSE_DOWN,           // 7
					MOUSE_MOVE,           // 8
					MOUSE_UP,             // 9
					MOUSE_OUT             // 10
				],
				// 触点集合
				pointer = {},
				// 第一个触点信息
				first = {
					id: null,
					time: null
				},
				// 外层存在 scroll 滚动控件则当前滚动状态
				// 不存在滚动控件则为 false
				isParentsScrolling = false,
				// 事件状态 
				// true: 绑定 false: 解绑
				state = false;

			// #endregion

			// #region 私有方法

			// 设置第一个触点信息
			// id[int]: 触点 ID
			function setFirstPointerInfo(id) {
				// 如果集合中的触控点个数不是 0，则中断
				if (getPointerLength() !== 0) return;
				// 设置第一个触点信息
				first.id = id;
				first.time = getTime();
			}
			// 获取触点集合的长度
			function getPointerLength() {
				var // 创建计数种子
					seed = 0;
				// 迭代触点集合，如果触点集合中存在未删除触点，则计数种子递增
				for (var i in pointer) if (!pointer[i].del) seed++;
				// 返回计数
				return seed;
			}
			// 清除无效触点
			function removeInvalidPointer() {
				for (var i in pointer) {
					if (pointer[i].del) {
						delete pointer[i];
					}
				}
			}

			// #endregion

			// #region 事件回调

			// pointerdown 事件触发函数
			// event[eventObject]: 事件对象
			function pointerDown(event) {
				if (options.stopPropagation) event.stopPropagation();

				var // 获取浏览器 event 对象
					o = event.originalEvent,
					// 当前触点 ID
					pid = o.pointerId;

				setFirstPointerInfo(pid);

				// 查询集合中触点的个数，如果不是 0 个，则绑定 move，up 事件
				if (getPointerLength() === 0) {
					// 绑定 move 事件
					$dom.bind(eventsName[1], pointerMove);
					// 绑定 up 事件
					$dom.bind(eventsName[2], pointerUp);
				}

				// 如果列表中不存在此触点或此点已被删除，则进行以下操作		
				if (!pointer[pid] || pointer[pid].del) {
					// 建立一个新触点
					pointer[pid] = new Pointer(pid, o);
					// 执行 downHandler 回调
					downHandler(event, pid);
				}
			}
			// pointermove 事件触发函数
			// event[eventObject]: 事件对象
			function pointerMove(event) {
				if (options.stopPropagation) event.stopPropagation();
				event.preventDefault();

				var // 获取浏览器 event 对象
					o = event.originalEvent,
					// 当前触点 ID
					pid = o.pointerId;

				// 如果集合中不存在此触点则跳出
				if (!pointer[pid]) return;
				pointer[pid].setMove(o);
				// 执行 moveHandler 回调
				moveHandler(event, pid);
			}
			// pointerup 事件触发函数
			// event[eventObject]: 事件对象
			function pointerUp(event) {
				if (options.stopPropagation) event.stopPropagation();

				var // 获取浏览器 event 对象
					o = event.originalEvent,
					// 当前触点 ID
					pid = o.pointerId;

				// 如果集合中不存在此触点则跳出
				if (!pointer[pid]) return;
				// 执行 upHandler 回调
				upHandler(event, pid);
				// 删除触点
				pointer[pid].del = true;

				if (getPointerLength() === 0) {
					$dom.unbind(eventsName[1], pointerMove);
					$dom.unbind(eventsName[2], pointerUp);
				}

			}
			// touchstart 事件触发函数
			// event[eventObject]: 事件对象
			function touchStart(event) {
				if (options.stopPropagation) event.stopPropagation();

				var // 获取浏览器 event 对象
					o = event.originalEvent,
					// 有改变的触控点集合
					touches = o.changedTouches;

				// 当触点集合长度为 0，则添加 move、end、cancel 事件监听
				if (getPointerLength() === 0) {
					$event.bind(eventsName[4], touchMove);
					$event.bind(eventsName[5], touchEnd);
					$event.bind(eventsName[6], touchEnd);
				}

				// 设置第一个触点信息
				setFirstPointerInfo(touches[0].identifier);

				// 迭代所有有改变的触控点集合
				for (var i = 0, j = touches.length; i < j; i++) {
					// 如果列表中不存在此触控点或此点已被删除，则进行以下操作	
					if (!pointer[touches[i].identifier] || pointer[touches[i].identifier].del) {
						// 建立一个新触控点
						pointer[touches[i].identifier] = new Pointer(touches[i].identifier, touches[i]);
					}

					// 执行 downHandler 回调
					downHandler(event, touches[i].identifier);
				}
			}
			// touchmove 事件触发函数
			// event[eventObject]: 事件对象
			function touchMove(event) {
				if (options.stopPropagation) event.stopPropagation();
				// 阻止浏览器事件
				event.preventDefault();

				var // 获取浏览器 event 对象
					o = event.originalEvent,
					// 有改变的触控点集合
					touches = o.changedTouches;

				// 迭代所有有改变的触控点集合
				for (var i = 0, j = touches.length; i < j; i++) {
					// 如果列表中不存在此触控点或此点已被删除，则进行以下操作	
					if (pointer[touches[i].identifier]) {
						// 更新触控点信息
						pointer[touches[i].identifier].setMove(touches[i]);
					}

					// 执行 moveHandler 回调
					moveHandler(event, touches[i].identifier);
				}
			}
			// touchend 事件触发函数
			// event[eventObject]: 事件对象
			function touchEnd(event) {
				if (options.stopPropagation) event.stopPropagation();

				var // 获取浏览器 event 对象
					o = event.originalEvent,
					// 有改变的触控点集合
					touches = o.changedTouches;

				// 迭代全部触点
				for (var i = 0, j = touches.length; i < j; i++) {
					// 执行 upHandler 回调
					upHandler(event, touches[i].identifier);
					// 删除触点
					pointer[touches[i].identifier].del = true;
				}

				// 当触点集合为 0 时移除 move、end、cancel 事件监听
				if (getPointerLength() === 0) {
					$event.unbind(eventsName[4], touchMove);
					$event.unbind(eventsName[5], touchEnd);
					$event.unbind(eventsName[6], touchEnd);
				}
			}
			// mousedown 事件触发函数
			// event[eventObject]: 事件对象
			function mouseDown(event) {
				if (options.stopPropagation) event.stopPropagation();

				var // 获取浏览器 event 对象
					o = event.originalEvent;

				// 设置第一个触点
				setFirstPointerInfo(0);
				// 建立一个新触点
				pointer[0] = new Pointer(0, o);
				// 执行 downHandler 回调
				downHandler(event, 0);

				// 绑定 move 事件
				$dom.bind(eventsName[8], mouseMove);
				// 绑定 up 事件
				$dom.bind(eventsName[9], mouseUp);
			}
			// mousemove 事件触发函数
			// event[eventObject]: 事件对象
			function mouseMove(event) {
				if (options.stopPropagation) event.stopPropagation();

				// 停止冒泡
				event.stopPropagation();

				var // 获取浏览器 event 对象
					o = event.originalEvent;

				if (!pointer[0]) return;
				pointer[0].setMove(o);

				// 执行 moveHandler 回调
				moveHandler(event, 0);
			}
			// mouseout 事件触发函数
			// event[eventObject]: 事件对象
			function mouseUp(event) {
				if (options.stopPropagation) event.stopPropagation();

				if (!pointer[0]) return;
				// 执行 upHandler 回调
				upHandler(event, 0);
				// 删除触点(避免意外删除)
				if (pointer[0] !== undefined && pointer[0].del === false) pointer[0].del = true;

				// 绑定 move 事件
				$dom.unbind(eventsName[8], mouseMove);
				// 绑定 up 事件
				$dom.unbind(eventsName[9], mouseUp);

			}

			// #endregion

			// #region 事件处理

			// 按下处理
			// id[int]: 触点ID
			function downHandler(event, id) {
				isParentsScrolling = false;
				// 当元素外层对象的全部集合中，存在某个对象是 scroll 控件，且此 scroll 正在滚动中，则判定 tap 与 press 不成立
				var $parents = $element.parents(), pLen = $parents.length, i = 0;
				for (; i < pLen; i++) if ($parents.eq(i).attr(prefixLibName + 'scroll-running') === '1') { isParentsScrolling = true; break; }

				// 执行 down 回调
				callbacks.down.call($element, id);
			}
			// 移动处理
			// id[int]: 触点 ID
			function moveHandler(event, id) {
				var move = pointer[id].getMoveLength();
				event.preventDefault();
				callbacks.pan.call($element, move, id);
			}
			// 弹起处理
			// id[int]: 触点 ID
			function upHandler(event, id) {
				var // 释放前的触点个数
					beforeUpPointsLength = null,
					// 第一次触点按下到释放的间隔
					interval = null,
					// 获取触点移动长度
					move = pointer[id].getMoveLength(),
					// 获取触点移动绝对长度
					absMove = { x: Math.abs(move.x), y: Math.abs(move.y) };

				// 此处用于判断是否 touchend 结束后而自动引发的 mousedown，如是自动引发则此次 mousedown 不生效
				if (lastUpEvent) if (getTime() - lastUpEvent.time < 500
					&& lastUpEvent.type === 'touchend'
					&& event.type === 'mouseup') { return; }
				// 记录最后一个弹起点
				lastUpEvent = { time: getTime(), type: event.type };

				// 如果抬起的是第一次按压的触点
				if (first.id === id) { interval = new Date() - first.time; first.id = null; first.time = null; }

				// 确定是否为第一次触碰点的弹起操作
				if (interval) {
					// 如果x或y方向移动距离不超过 POINTER_EVENT_VALIDLENGTH
					if (absMove.x < POINTER_EVENT_VALIDLENGTH && absMove.y < POINTER_EVENT_VALIDLENGTH) {
						// 如果外层滚动条未滚动
						if (!isParentsScrolling) {
							// 检测是否 tap 方式
							// 存在一个按压时间，且时间小于 options.tapMaxTime
							if (interval < options.tapMaxTime) {
								callbacks.tap.call($element);
							}
							else {
								callbacks.press.call($element);
							}
						}
					}

					// 当移动距离超过 POINTER_EVENT_VALIDLENGTH 且 x 方向移动距离大于 y 方向且时间小于 options.swipeMaxTime
					// 则执行左右滑动回调
					if (absMove.x >= POINTER_EVENT_VALIDLENGTH && absMove.x >= absMove.y
						&& interval < options.swipeMaxTime) {
						if (move.x < 0) {
							event.preventDefault();
							callbacks.swipeLeft.call($element);
						}
						else {
							event.preventDefault();
							callbacks.swipeRight.call($element);
						}
					}
					// 当移动距离超过 POINTER_EVENT_VALIDLENGTH 且 y 方向移动距离大于 x 方向且时间小于 options.swipeMaxTime
					// 则执行上下滑动回调
					if (absMove.y >= POINTER_EVENT_VALIDLENGTH && absMove.y >= absMove.x
						&& interval < options.swipeMaxTime) {
						if (move.y < 0) {
							event.preventDefault();
							callbacks.swipeTop.call($element);
						}
						else {
							event.preventDefault();
							callbacks.swipeBottom.call($element);
						}
					}
				}

				// 执行 up 回调
				callbacks.up.call($element, id);

				// 清除无效触点
				removeInvalidPointer();
			}

			// #endregion

			// #region 事件绑定与解绑

			// 事件处理
			// isBind[bool]: 绑定事件 / 解除事件
			function eventHandler(isBind) {
				if (support.pointer || support.msPointer) { // Pointer 触控点
					if (isBind) $event.bind(eventsName[0], pointerDown);
					else $event.unbind(eventsName[0], pointerDown);
				}
				else { // 鼠标
					if (isBind) {
						$event.bind(eventsName[3], touchStart);
						$event.bind(eventsName[7], mouseDown);
					} else {
						$event.unbind(eventsName[3], touchStart);
						$event.unbind(eventsName[7], mouseDown);
					}
				}

				if (isBind) setTouchAction($event, true);
				else setTouchAction($event, false);
			}
			// 绑定事件
			function bindEvent() {
				if (!state) {
					state = true;
					eventHandler(true);
				}
			}
			// 移除事件
			function unbindEvent() {
				if (state) {
					state = false;
					eventHandler(false);
				}
			}

			// #endregion

			// #region 初始化 

			// 初始化
			(function init() {
				bindEvent();

				// 让默认的 a、img 标签取消其拖拽功能
				var $cancelDraggable = $element.find('a, img');
				$cancelDraggable.bind('dragstart', function (event) { event.preventDefault(); });
			}());

			// #endregion

			// #region 返回

			// 返回
			return {
				bind: bindEvent,
				unbind: unbindEvent
			}

			// #endregion

		}

		// #endregion

		// #region 初始化

		// 初始化
		(function init() {
			setOptions(options, userOptions);
			eachJQElements($elements, function ($each) {
				events.push(event($each));
			});
		}());

		// #endregion

		// #region 返回

		// 公开成员方法
		eventObj = {
			setPan: setPan,
			setTap: setTap,
			setPress: setPress,
			setSwipeLeft: setSwipeLeft,
			setSwipeRight: setSwipeRight,
			setSwipeTop: setSwipeTop,
			setSwipeBottom: setSwipeBottom,
			setDown: setDown,
			setUp: setUp,
			on: on,
			off: off
		};
		// 返回事件对象
		return eventObj

		// #endregion

	}
	// ud2 库的鼠标滚轮事件对象
	// 用于鼠标滚轮方式操作元素的事件处理
	// $elements[string, jQuery]: jQuery 对象或可生成 jQuery 对象的字符串
	// userOptions[object]: 用户参数
	// return[eventMouseWheel] => 返回一个事件公开方法对象
	var eventMouseWheel = function ($elements, userOptions) {

		// #region 私有字段

		var // 事件对象
			eventObj = {},
			// 默认选项
			options = {},
			// 回调函数
			callbacks = {
				// 滚动
				scroll: $.noop,
				// 向下
				down: $.noop,
				// 向上
				up: $.noop
			},
			// 事件名称
			MOUSEWHEEL_NAME = 'DOMMouseScroll mousewheel',
			// 事件对象集合
			events = [];

		// #endregion

		// #region 设置回调方法

		// 设置拖动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(move[int]) 
		//   move: 此回调函数拥有一个参数 move，用于时时返回鼠标滚轮触发的方向
		//		   1: 向下 -1: 向上
		// return[object]: 当前事件对象，方便链式调用
		function setScroll(fn) { callbacks.scroll = fn; return eventObj; }
		// 设置拖动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// return[object]: 当前事件对象，方便链式调用
		function setDown(fn) { callbacks.down = fn; return eventObj; }
		// 设置拖动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// return[object]: 当前事件对象，方便链式调用
		function setUp(fn) { callbacks.up = fn; return eventObj; }

		// #endregion

		// #region 设置事件绑定与解绑

		// 事件绑定
		function on() {
			events.forEach(function () {
				arguments[0].bind();
			});
		}
		// 事件解绑
		function off() {
			events.forEach(function () {
				arguments[0].unbind();
			});
		}

		// #endregion

		// #region 事件对象

		// 通过 $element 对象一个事件监听对象
		// $element[jQuery]: jQuery 对象
		function event($element) {

			// #region 私有字段

			var // 事件承载对象
				$event = $element,
				// 事件状态 
				// true: 绑定 false: 解绑
				state = false;

			// #endregion

			// #region 事件回调

			// mouseWheel 事件触发函数
			// event: eventObject => 事件对象
			function mouseWheel(event) {
				// 停止冒泡
				event.stopPropagation();
				// 阻止浏览器事件
				event.preventDefault();

				var // 获取浏览器 event 对象
					o = event.originalEvent,
					// 计算滚轮方式 
					// move:1 向下 move:-1 向上
					move = o.deltaY / 100 || o.wheelDelta / -120 || (Math.abs(o.detail) > 2 ? o.detail / 3 : o.detail) || 0;

				// 执行 move 的事件回调
				callbacks.scroll.call($element, move);
				// 判断滚轮向上还是向下
				if (move > 0) {
					// 执行 down 的事件回调
					callbacks.down.call($element);
				} else {
					// 执行 up 的事件回调
					callbacks.up.call($element);
				}
			}

			// #endregion

			// #region 事件绑定与解绑

			// 绑定事件
			function bindEvent() {
				if (!state) {
					state = true;
					$event.bind(MOUSEWHEEL_NAME, mouseWheel);
				}
			}
			// 解绑事件
			function unbindEvent() {
				if (state) {
					state = false;
					$event.unbind(MOUSEWHEEL_NAME, mouseWheel);
				}
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				bindEvent();
			}());

			// #endregion

			// #region 返回

			// 返回
			return {
				bind: bindEvent,
				unbind: unbindEvent
			}

			// #endregion
		}

		// #endregion

		// #region 初始化

		// 初始化
		(function init() {
			setOptions(options, userOptions);
			eachJQElements($elements, function ($each) {
				events.push(event($each));
			});
		}());

		// #endregion

		// #region 返回

		// 公开成员方法
		eventObj = {
			setScroll: setScroll,
			setDown: setDown,
			setUp: setUp,
			on: on,
			off: off
		};
		// 返回事件对象
		return eventObj;

		// #endregion

	};

	// #endregion

	var controls = (function () {
		// 建立控件对象
		var obj = {};

		// 返回控件对象
		return obj;
	}());


	// 公开方法
	controls.event = event;
	controls.eventMouseWheel = eventMouseWheel;
	// 返回控件
	return controls;

}(window, jQuery));