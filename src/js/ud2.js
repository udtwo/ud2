/// <reference path="../../vendor/js/jquery.js" />

if (typeof $ === 'undefined') throw new Error('ud2库需要JQuery支持');
var ud2 = (function (window, $) {
	"use strict";

	// #region 库变量

	var // 页面的 document 对象
		document = window.document,
		// window 的 jQuery 对象
		$win = $(window),
		// document 的 jQuery 对象
		$dom = $(document),
		// body 对象
		// 在 init 回调中创建
		$body,

		// 库名称
		libName = 'ud2',
		// 连接符
		joinStr = '-',
		// 数据属性前缀
		prefixData = 'data-',
		// 库属性前缀
		prefixLibName = libName + joinStr,
		// 样式属性前缀集合
		// 有效集合 {1-4}
		prefixStyles = ' -webkit- -moz- -o- -ms- '.split(' '),

		// 动画函数
		animateFrame = window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function (callbacks) { window.setTimeout(callbacks, 1000 / 60); },
		// 正则表达式
		regex = {
			// 日期正则表达式
			// 可以匹配xxxx(-|.|/)x{1,2}(-|.|/)x{1,2}
			date: /^(?:[12]\d{3}([\.\-\/])(?:(?:0?[13578]|1[02])\1(?:0?[1-9]|[12]\d|3[01])|(?:0?[469]|11)\1(?:0?[1-9]|[12]\d|30)|0?2\1(?:0?[1-9]|1\d|2[0-8]))$|[12]\d(?:[02468][048]|[13579][26])([\.\-\/])(?:(?:0?[13578]|1[02])\2(?:0?[1-9]|[12]\d|3[01])|(?:0?[469]|11)\2(?:0?[1-9]|[12]\d|30)|0?2\2(?:0?[1-9]|1\d|2[0-9])))$/,
			// 邮箱正则表达式
			mail: /^([\w-\.]+)@(([\w-]+\.)+)([a-zA-Z]{2,4})$/,
			// 手机号码正则表达式
			phone: /^[1][3458][0-9]{9}$/,
			// 身份证正则表达式
			// 此表达式未添加地区判断与补位运算
			identityCard: /^(11|12|13|14|15|21|22|23|31|32|33|34|35|36|37|41|42|43|44|45|46|50|51|52|53|54|61|62|63|64|65|71|81|82|97|98|99)[0-9]{4}((?:19|20)?(?:[0-9]{2}(?:(?:0[13578]|1[12])(?:0[1-9]|[12][0-9]|3[01])|(?:0[469]|11)(?:0[1-9]|[12][0-9]|30)|02(?:0[1-9]|1[0-9]|2[0-8]))|(?:[02468][048]|[13579][26])0229)[0-9]{3}[\dxX])$/,
			// 登录名正则表达式
			loginName: /^[a-zA-Z][a-zA-Z0-9]+$/
		},
		// 当前时间
		getTime = Date.now || function getTime() { return new Date().getTime(); },

		// 是否支持触点pointer
		pointerEnabled = window.navigator.pointerEnabled,
		// 触点常量
		POINTER_DOWN = pointerEnabled ? 'pointerdown' : 'MSPointerDown',
		POINTER_MOVE = pointerEnabled ? 'pointermove' : 'MSPointerMove',
		POINTER_UP = pointerEnabled ? 'pointerup' : 'MSPointerUp',
		POINTER_CANCEL = pointerEnabled ? 'pointercancel' : 'MSPointerCancel',
		TOUCH_START = 'touchstart',
		TOUCH_MOVE = 'touchmove',
		TOUCH_END = 'touchend',
		TOUCH_CANCEL = 'touchcancel',
		MOUSE_DOWN = 'mousedown',
		MOUSE_MOVE = 'mousemove',
		MOUSE_UP = 'mouseup',
		MOUSE_OUT = 'mouseout',
		MOUSE_ENTER = 'mouseenter',
		MOUSE_LEAVE = 'mouseleave',
		CLICK = 'click',
		// 触碰事件组合
		EVENT_DOWN = [POINTER_DOWN, TOUCH_START, MOUSE_DOWN].join(' '),
		// 触碰事件
		// EVENT_DOWN = [POINTER_DOWN, TOUCH_START, MOUSE_DOWN].join(' '),
		// 状态名称
		STATE_NAME = ['normal', 'info', 'success', 'warning', 'danger'],

		// 用于克隆的空jQuery对象
		$div = $('<div />'),
		$a = $('<a />'),

		// 空方法
		fnNoop = function () { },
		// 返回false的空方法
		fnFalse = function () { return false; },

		// 用于转换abcDef到abc-def模式的正则表达式
		attrTranslateRegex = /(^[a-z0-9]{1,}|[A-Z][a-z0-9]{0,})/g,
		// 用于存放通过属性名称转换后得到的结果的数组
		// 目的是为了减少正则匹配的调用，以便减少不必要的系统资源损失
		attrTranslateGroup = [],

		// 标记页面是否加载完成
		pageLoaded = false,
		// 回调对象
		callbacks = {
			// 页面完成加载时的回调对象
			pageReady: $.Callbacks(),
			// 页面尺寸改变时的回调对象
			pageResize: $.Callbacks(),
			// 控件完全关闭的回调对象
			ctrlClose: $.Callbacks()
		};

	// #endregion

	// #region ud2 函数库

	// 库类型检测对象
	var type = (function () {
		// 判断参数类型isType(TypeName)(Value)
		// type[object]: 判断的参数类型 例如Function、Array...
		// return[function]: 返回一个方法，此方法来判断传入的Value参数是否为TypeName类型
		function isType(type) {
			return function (obj) {
				return {}.toString.call(obj) === "[object " + type + "]";
			};
		}
		// 判断传入参数是否为一个对象Object
		// typeValue[object]: 判断变量
		// return[bool]: 返回一个布尔值，此布尔值表示传入的typeValue参数是否为对象
		function isObject(typeValue) {
			return isType("Object")(typeValue);
		}
		// 判断传入参数是否为一个方法Function
		// typeValue[object]: 判断变量
		// return[bool]: 返回一个布尔值，此布尔值表示传入的typeValue参数是否为方法
		function isFunction(typeValue) {
			return isType("Function")(typeValue);
		}
		// 判断传入参数是否为一个字符串String 
		// typeValue[object]: 判断变量
		// return[bool]: 返回一个布尔值，此布尔值表示传入的typeValue参数是否为字符串
		function isString(typeValue) {
			return isType("String")(typeValue);
		}
		// 判断传入参数是否为一个数字Number
		// typeValue[object]: 判断变量
		// return[bool]: 返回一个布尔值，此布尔值表示传入的typeValue参数是否为数字
		function isNumber(typeValue) {
			return isType("Number")(typeValue);
		}
		// 判断传入参数是否为一个自然数[非负整数](Natural Number)
		// typeValue[object]: 判断变量
		// return[bool]: 返回一个布尔值，此布尔值表示传入的typeValue参数是否为自然数
		function isNaturalNumber(typeValue) {
			return /^([1-9]\d+|[0-9])$/.test(typeValue);
		}
		// 判断传入参数是否为一个jQuery对象
		// typeValue[object]: 判断变量
		// return[bool]: 返回一个布尔值，此布尔值标识传入的typeValue参数是否为jQuery对象
		function isJQuery(typeValue) {
			return typeValue instanceof $;
		}
		// 判断传入参数是否为一个数组对象
		// typeValue[object]: 判断变量
		// return[bool]: 返回一个布尔值，此布尔值标识传入的typeValue参数是否为数组对象
		function isArray(typeValue) {
			return Array.isArray(typeValue);
		}
		// 返回对象
		return {
			isType: isType,
			isObject: isObject,
			isFunction: isFunction,
			isString: isString,
			isNumber: isNumber,
			isNaturalNumber: isNaturalNumber,
			isJQuery: isJQuery,
			isArray: isArray
		};
	}());
	// 库强制转换对象
	var convert = (function () {
		// 强制转换传入参数成为一个自然数[非负整数](Natural Number)
		// 当不满足转换条件时，返回一个0
		// value[object]: 转换变量
		// return[number(0-∞)]: 返回一个自然数
		function toNaturalNumber(value) {
			return isNaturalNumber(value) ? +value : 0;
		}

		// 返回对象
		return {
			toNaturalNumber: toNaturalNumber
		};
	}());
	// 库表单检测对象
	var form = (function () {
		// 强制设定 text 类型为 string
		function textTypeHandler(text) {
			return type.isString(text) ? text : '';
		}

		// 检测字符串是否符合长度规定
		// text[string]: 待检测的字符串
		// (text, length) 监测字符串是否符合 length 长度规范
		// - length[number]: 长度
		// (text, length, maxLength) 监测字符串是否符合 length - maxLength 区间
		// - length[number]: 最小长度
		// - maxLength[number]: 最大长度
		// return[bool]: 是否符合长度规定
		function isLength(text, length, maxLength) {
			text = textTypeHandler(text);
			length = length || Number.MAX_VALUE;
			if (typeof maxLength !== 'undefined') { // 判断是否符合最小值和最大值的长度
				if (maxLength < length) maxLength = length;
				return text.length <= maxLength && text.length >= length;
			}
			else { // 判断是否符合规定长度
				return text.length === length;
			}
		}
		// 检测字符串是否符合最小长度规定
		// text[string]: 待检测的字符串
		// length[number]: 最小长度
		// return[bool]: 是否符合长度规定
		function isMinLength(text, length) {
			text = textTypeHandler(text);
			length = length || 0;
			return text.length >= length;
		}
		// 检测字符串是否符合最大长度规定
		// text[string]: 待检测的字符串
		// length[number]: 最大长度
		// return[bool]: 是否符合长度规定
		function isMaxLength(text, length) {
			text = textTypeHandler(text);
			length = length || Number.MAX_VALUE;
			return text.length <= length;
		}
		// 检测字符串是否符合手机号规范
		// text[string]: 待检测的字符串
		// return[bool]: 是否符合手机号规范
		function isPhone(text) {
			text = textTypeHandler(text);
			return regex.phone.test(text);
		}
		// 检测字符串是否符合邮箱规范
		// text[string]: 待检测的字符串
		// return[bool]: 是否符合邮箱规范
		function isMail(text) {
			text = textTypeHandler(text);
			return regex.mail.test(text);
		}
		// 检测字符串是否符合日期规范
		// text[string]: 待检测的字符串
		// return[bool]: 是否符合日期规范
		function isDate(text) {
			text = textTypeHandler(text);
			return regex.date.test(text);
		}

		// 检测字符串是否符合用户名规范
		// text[string]: 待检测的字符串
		// return[bool]: 是否符合用户名规范
		function isLoginName(text) {
			text = textTypeHandler(text);
			return regex.loginName.test(text);
		}
		// 检测字符串是否符合身份证规范
		// text[string]: 待检测的字符串
		// return[bool]: 是否符合身份证号规范
		function isIdentityCard(text) {
			text = textTypeHandler(text);
			text = text.toUpperCase();
			if (regex.identityCard.test(text)) {
				if (text.length === 18) {
					var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
						parity = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'],
						code = text.split(''),
						sum = 0;
					for (var i = 0; i < 17; i++) {
						sum += code[i] * factor[i];
					}

					var last = parity[sum % 11];
					if (last !== code[17]) return false;
				}

				return true;
			}
			return false;
		}

		// 返回
		return {
			isLength: isLength,
			isMinLength: isMinLength,
			isMaxLength: isMaxLength,
			isPhone: isPhone,
			isMail: isMail,
			isDate: isDate,
			isLoginName: isLoginName,
			isIdentityCard: isIdentityCard
		};
	}());
	// 浏览器支持情况
	var support = (function () {
		var // 支持情况对象
			support = {},
			// 创建一个空的div元素
			div = document.createElement('div'),
			// 获取userAgent
			u = window.navigator.userAgent;

		// 判断是否为Safari浏览器
		support.safari = /constructor/i.test(window.HTMLElement);
		// 判断是否为移动终端
		support.mobile = !!u.match(/mobile|mobi|mini/i);
		// 判断是否为Android平台
		support.android = u.indexOf('Android') > -1;
		// 判断是否支持Touch触摸事件
		support.touch = 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch;
		// 判断是否支持Pointer事件
		support.pointer = pointerEnabled;
		// 判断是否支持MSPointer事件(IE10)
		support.msPointer = window.navigator.msPointerEnabled;
		// 判断是否支持[CSS]touchAction(msTouchAction)
		support.touchAction = div.style.touchAction !== void 0 || div.style.msTouchAction !== void 0 || false;
		// 判断是否支持[CSS]prespective
		support.perspective = div.style.perspective !== void 0 ||
			div.style.msPerspective !== void 0 ||
			div.style.mozPerspective !== void 0 ||
			div.style.webkitPerspective !== void 0 ||
			false;
		// 判断是否支持[CSS]transition
		support.transition =
			div.style.transition !== void 0 ||
			div.style.msTransition !== void 0 ||
			div.style.mozTransition !== void 0 ||
			div.style.webkitTransition !== void 0 ||
			div.style.oTransition !== void 0 ||
			false;
		// 判断是否支持[CSS]animation
		support.animation =
			div.style.animation !== void 0 ||
			div.style.mozAnimation !== void 0 ||
			div.style.webkitAnimation !== void 0 ||
			div.style.oAnimation !== void 0 ||
			false;

		return support;
	}());

	// #endregion

	// #region ud2 库私有方法

	// 对象扩展
	// 将扩展对象属性添加到原对象中
	// origin[object]: 原对象
	// source[object]: 扩展对象
	// return[object]: 返回扩展后的原对象
	function extendObjects(origin, source) {
		if (!type.isObject(origin)) origin = {};
		if (!type.isObject(source)) source = {};
		for (var i in source) {
			origin[i] = source[i];
		}
		return origin;
	}
	// 获取控件自定义项
	// 调用此方法须通过call、apply方法传入control对象或调用对象
	// (optNameArr, callbacks) 通过属性名数组，获取数组内的全部名称对应的属性，获取数序为control.userOptions、ud2-前缀元素属性、元素属性
	// - optNameArr[array]: 属性名数组，确定待获取的全部属性名称
	// - callbacks[fn]: 回调方法，获取全部属性后的数据处理
	// (options, userOptions, callbacks) 通过默认属性和用户自定义属性，获取合并厚的属性值
	// - options[object]: 默认属性
	// - userOptions[object]: 用户自定义属性
	// - callbacks[fn]: 回调方法，获取全部属性后的数据处理
	function getOptions() {
		var args = arguments, len = args.length, control = this,
			options, userOptions, arr, callbacks;
		if (len === 2) {
			arr = args[0];
			callbacks = args[1];

			if (type.isArray(arr) && type.isFunction(callbacks)) {
				options = {};
				arr.forEach(function (name) {
					options[name] = control.userOptions[name] || control.getOriginAttr(name, 1) || control.getOriginAttr(name);
				});
				callbacks(options);
				return options;
			}
		}
		else if (len === 3) {
			options = args[0];
			userOptions = args[1] || {};
			callbacks = args[2];

			if (type.isObject(options) && type.isObject(userOptions) && type.isFunction(callbacks)) {
				options = extendObjects(options, userOptions);
				callbacks(options);
				return options;
			}
		}
		return {};
	}
	// 获取元素绑定的控件名称集合
	// 此功能用于获取jQuery元素绑定的控件名称集合
	// $element[jQuery]: jQuery对象
	// return[Array]: jQuery对象的控件名称集合
	function getNames($element) {
		var // 原控件名称集合
			ud2Old = ($element.attr(libName) || '').split(' '),
			// 创建一个新的集合用于控件名称过滤
			ud2Arr = [];

		// 迭代控件名称集合过滤掉不存在的属性
		ud2Old.forEach(function (item) {
			if (item.length !== 0) ud2Arr.push(item);
		});

		// 返回集合
		return ud2Arr;
	}
	// 通过控件标准名称获取控件在集合对象中的名称(控件对象名称)
	// name[string]: 控件标准名称
	// return[string]: 控件对象名称
	function getControlNameByName(name) {
		var nameArr = name.split('-'), i = 1, l = nameArr.length;
		if (l > 1) for (; i < l; i++)
			if (nameArr[i].length > 0) {
				nameArr[i] = nameArr[i].substr(0, 1).toUpperCase() + nameArr[i].substr(1);
			}
		return nameArr.join('');
	}
	// 将传入参数强制转换为jQuery对象
	// jq[jQuery, string, object]: 待转换值
	// return[jQuery]: 转换后的jQuery对象
	function convertToJQ(jq) {
		if (!type.isJQuery(jq)) jq = $(jq);
		return jq;
	}

	// #endregion

	// #region ud2 库事件

	// 用于触摸笔、触碰、鼠标等方式操作元素的事件处理
	// elements[string, jQuery]: jQuery 对象或可生成 jQuery 对象的字符串
	// userOptions[object]: 用户参数
	// - (?) stopPropagation[bool]: 是否阻止事件向外冒泡，默认为false
	// - (?) tapMaxTime[number]: tap的最大时间间隔，默认值为300(ms)
	// - (?) swipeMaxTime[number]: number的最大时间间隔，默认值为500(ms)
	// - (?) pointerValidLength[number]: 触点tap、press事件有效长度
	// return[event] => 返回一个事件公开方法对象
	var event = function (elements, userOptions) {

		// #region 私有字段

		var // 事件对象
			eventObj = {},
			// 事件选项
			stopPropagation, tapMaxTime, swipeMaxTime, pointerValidLength,
			// 默认项
			options = getOptions({
				// 阻止冒泡
				stopPropagation: false,
				// tap的最大时间间隔，超出时间间隔则视为press
				tapMaxTime: 300,
				// swipe的最大时间间隔
				swipeMaxTime: 500,
				// 触点tap、press事件有效长度
				pointerValidLength: 5
			}, userOptions, function (options) {
				stopPropagation = options.stopPropagation;
				tapMaxTime = options.tapMaxTime;
				swipeMaxTime = options.swipeMaxTime;
				pointerValidLength = options.pointerValidLength;
			}),
			// 回调函数
			callbacks = {
				// 拖动
				pan: fnNoop,
				// 短按，通过tapMaxTime来界定短按与长按
				tap: fnNoop,
				// 长按
				press: fnNoop,
				// 快速左滑动，通过swpieMaxTime来界定快速滑动与否
				swipeLeft: fnNoop,
				// 快速右滑动
				swipeRight: fnNoop,
				// 快速上滑动
				swipeTop: fnNoop,
				// 快速下滑动
				swipeBottom: fnNoop,
				// 按下
				down: fnNoop,
				// 抬起
				up: fnNoop
			},
			// 事件对象集合
			events = [];

		// #endregion

		// #region 事件回调方法

		// 设置拖动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(move, eventObj) 
		//   eventObj[eventObj]: 事件event对象
		//   move[object]: 移动偏移量 { x, y }
		// return[event]: 当前事件对象，方便链式调用
		function setPan(fn) { callbacks.pan = fn; return eventObj; }
		// 设置短按回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setTap(fn) { callbacks.tap = fn; return eventObj; }
		// 设置长按回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setPress(fn) { callbacks.press = fn; return eventObj; }
		// 设置快速左滑动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setSwipeLeft(fn) { callbacks.swipeLeft = fn; return eventObj; }
		// 设置快速右滑动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setSwipeRight(fn) { callbacks.swipeRight = fn; return eventObj; }
		// 设置快速上滑动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setSwipeTop(fn) { callbacks.swipeTop = fn; return eventObj; }
		// 设置快速下滑动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setSwipeBottom(fn) { callbacks.swipeBottom = fn; return eventObj; }
		// 设置触点按下时的回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setDown(fn) { callbacks.down = fn; return eventObj; }
		// 设置触点抬起时的回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setUp(fn) { callbacks.up = fn; return eventObj; }

		// #endregion

		// #region 触点对象

		// 创建一个触点信息
		// 用来存储触点相关数据
		// id[string]: 系统触点 ID
		// event[eventObject]: 系统触点数据对象
		function pointer(id, event) {
			var // 按下时触点所在屏幕的X坐标
				screenX = event ? event.screenX : 0,
				// 按下时触点所在屏幕的Y坐标
				screenY = event ? event.screenY : 0,
				// 按下时计算滚轮数值时当前触碰点距离浏览器窗口左上角的X坐标
				pageX = event ? event.pageX : 0,
				// 按下时计算滚轮数值时当前触碰点距离浏览器窗口左上角的Y坐标
				pageY = event ? event.pageY : 0,
				// 按下时不计算滚轮数值时当前触碰点距离浏览器窗口左上角的X坐标
				clientX = event ? event.clientX : 0,
				// 按下时不计算滚轮数值时当前触碰点距离浏览器窗口左上角的Y坐标
				clientY = event ? event.clientY : 0,
				// 触点信息对象
				pointer = {
					// 触点是否删除状态
					del: false,
					// 触点系统ID
					id: id,
					// 按下时触点
					downScreenX: screenX,
					downScreenY: screenY,
					downPageX: pageX,
					downPageY: pageY,
					downClientX: clientX,
					downClientY: clientY,
					// 移动中触点
					moveScreenX: screenX,
					moveScreenY: screenY,
					movePageX: pageX,
					movePageY: pageY,
					moveClientX: clientX,
					moveClientY: clientY
				};

			// 设置移动后的点数据
			// event[eventObject]: 事件对象
			function setMove(event) {
				if (event) {
					event.screenX && (pointer.moveScreenX = event.screenX);
					event.screenY && (pointer.moveScreenY = event.screenY);
					event.pageX && (pointer.movePageX = event.pageX);
					event.pageY && (pointer.movePageY = event.pageY);
					event.clientX && (pointer.moveClientX = event.clientX);
					event.clientY && (pointer.moveClientY = event.clientY);
				}
			}
			// 获取触点移动的距离
			// return[object]: 移动距离
			function getMoveLength() {
				return {
					x: pointer.movePageX - pointer.downPageX,
					y: pointer.movePageY - pointer.downPageY
				};
			}

			// 返回
			return extendObjects(pointer, {
				setMove: setMove,
				getMoveLength: getMoveLength
			});
		}

		// #endregion

		// #region 事件处理对象与相关方法

		// 创建一个触点
		// 用来存储触点相关数据
		// id[string]: 系统触点ID
		// event[eventObject]: 系统触点数据对象
		function event(origin) {

			// #region 私有字段

			var // 事件名称
				eventsName = [
					POINTER_DOWN,         // 0
					POINTER_MOVE,         // 1
					POINTER_UP,           // 2
					POINTER_CANCEL,       // 3
					TOUCH_START,          // 4
					TOUCH_MOVE,           // 5
					TOUCH_END,            // 6
					TOUCH_CANCEL,         // 7
					MOUSE_DOWN,           // 8
					MOUSE_MOVE,           // 9
					MOUSE_UP,             // 10
					MOUSE_OUT             // 11
				],
				// 触点集合
				pointers = {},
				// 第一触点信息
				first = { id: null, time: null },
				// 外层存在scroll滚动控件则标记为true，否则标记为false
				isParentsScrolling = false,
				// 当前事件绑定状态
				bindingState = false;

			// #endregion

			// #region 私有方法

			// 设置第一个触点信息
			// id[number]: 触点ID
			function setFirstPointerInfo(id) {
				// 如果集合中的触控点个数不是0，则中断
				if (getPointersLength() !== 0) return;
				// 设置第一个触点信息
				first.id = id;
				first.time = getTime();
			}
			// 获取触点集合的长度
			function getPointersLength() {
				var // 创建计数种子
					seed = 0;
				// 迭代触点集合，如果触点集合中存在未删除触点，则计数种子递增
				for (var i in pointers) if (!pointers[i].del) seed++;
				// 返回计数
				return seed;
			}
			// 清除无效触点
			function removeInvalidPointers() {
				for (var i in pointers) {
					if (pointers[i].del) {
						delete pointers[i];
					}
				}
			}
			// 临时遮罩阻止touch穿透行为
			function temporaryMask() {
				if (!support.mobile) return;
				var $mask = $div.clone().css({
					'position': 'fixed',
					'top': 0, 'right': 0, 'left': 0, 'bottom': 0,
					'z-index': 999999999
				}), timer;

				$body.append($mask);
				$mask.on(TOUCH_START, function (event) {
					event.stopPropagation();
					event.preventDefault();
					return;
				}).on(CLICK, function (event) {
					event.stopPropagation();
					event.preventDefault();
					if (timer) window.clearTimeout(timer);
					$mask.remove();
				});
				timer = window.setTimeout(function () { $mask.remove(); }, 500);
			}

			// #endregion

			// #region 事件回调及处理

			// pointerDown事件触发函数
			// event[eventObject]: 事件对象
			function pointerDown(event) {
				if (stopPropagation) event.stopPropagation();

				var // 获取浏览器event对象
					o = event.originalEvent,
					// 当前触点ID
					pid = o.pointerId;

				// 设置第一触点
				setFirstPointerInfo(pid);

				// 查询集合中触点的个数，如果不存在触点，则绑定move，up事件
				if (getPointersLength() === 0) {
					// 绑定move事件
					$dom.on(eventsName[1], pointerMove);
					// 绑定up事件
					$dom.on(eventsName[2], pointerUp);
					// 绑定cancel事件
					$dom.on(eventsName[3], pointerUp);
				}

				// 如果列表中不存在此触点或此点已被删除，则进行以下操作		
				if (!pointers[pid] || pointers[pid].del) {
					// 建立一个新触点
					pointers[pid] = pointer(pid, o);
					// 执行downHandler回调
					downHandler(event, pid);
				}
			}
			// pointerMove事件触发函数
			// event[eventObject]: 事件对象
			function pointerMove(event) {
				if (stopPropagation) event.stopPropagation();
				event.preventDefault();

				var // 获取浏览器event对象
					o = event.originalEvent,
					// 当前触点ID
					pid = o.pointerId;

				// 如果集合中不存在此触点则跳出
				if (!pointers[pid]) return;
				pointers[pid].setMove(o);

				// 执行moveHandler回调
				moveHandler(event, pid);
			}
			// pointerUp事件触发函数
			// event[eventObject]: 事件对象
			function pointerUp(event) {
				if (stopPropagation) event.stopPropagation();

				var // 获取浏览器event对象
					o = event.originalEvent,
					// 当前触点ID
					pid = o.pointerId;

				// 如果集合中不存在此触点则跳出
				if (!pointers[pid]) return;
				// 执行upHandler回调
				upHandler(event, pid);
				// 删除触点
				pointers[pid].del = true;

				if (getPointersLength() === 0) {
					$dom.off(eventsName[1], pointerMove);
					$dom.off(eventsName[2], pointerUp);
					$dom.off(eventsName[3], pointerUp);
				}

			}
			// eventStart事件触发函数
			// event[eventObject]: 事件对象
			function eventStart(event) {
				if (stopPropagation) event.stopPropagation();

				var // 事件类型
					type = event.type,
					// 获取浏览器event对象
					o = event.originalEvent,
					// 有改变的触控点集合
					touches;

				if (type === 'touchstart') {
					touches = o.changedTouches;

					// 当触点集合长度为0，则添加move、end、cancel事件监听
					if (getPointersLength() === 0) {
						origin.on(eventsName[5], touchMove);
						origin.on(eventsName[6], touchEnd);
						origin.on(eventsName[7], touchEnd);
					}

					// 设置第一个触点信息
					setFirstPointerInfo(touches[0].identifier);

					// 迭代所有有改变的触控点集合
					for (var i = 0, j = touches.length; i < j; i++) {
						// 如果列表中不存在此触控点或此点已被删除，则进行以下操作	
						if (!pointers[touches[i].identifier] || pointers[touches[i].identifier].del) {
							// 建立一个新触控点
							pointers[touches[i].identifier] = pointer(touches[i].identifier, touches[i]);
						}

						// 执行downHandler回调
						downHandler(event, touches[i].identifier);
					}
				}
				else {
					// 设置第一个触点
					setFirstPointerInfo(0);
					// 建立一个新触点
					pointers[0] = pointer(0, o);
					// 执行downHandler回调
					downHandler(event, 0);

					// 绑定move事件
					$dom.on(eventsName[9], mouseMove);
					// 绑定up事件
					$dom.on(eventsName[10], mouseUp);
				}
			}
			// touchMove事件触发函数
			// event[eventObject]: 事件对象
			function touchMove(event) {
				if (stopPropagation) event.stopPropagation();
				// 阻止浏览器事件
				event.preventDefault();

				var // 获取浏览器event对象
					o = event.originalEvent,
					// 有改变的触控点集合
					touches = o.changedTouches;

				// 迭代所有有改变的触控点集合
				for (var i = 0, j = touches.length; i < j; i++) {
					// 如果列表中不存在此触控点或此点已被删除，则进行以下操作	
					if (pointers[touches[i].identifier]) {
						// 更新触控点信息
						pointers[touches[i].identifier].setMove(touches[i]);
					}

					// 执行 moveHandler 回调
					moveHandler(event, touches[i].identifier);
				}
			}
			// touchEnd事件触发函数
			// event[eventObject]: 事件对象
			function touchEnd(event) {
				if (stopPropagation) event.stopPropagation();

				var // 获取浏览器event对象
					o = event.originalEvent,
					// 有改变的触控点集合
					touches = o.changedTouches;

				// 迭代全部触点
				for (var i = 0, j = touches.length; i < j; i++) {
					// 执行 upHandler 回调
					upHandler(event, touches[i].identifier);
					// 删除触点
					pointers[touches[i].identifier].del = true;
				}

				// 当触点集合为0时移除move、end、cancel事件监听
				if (getPointersLength() === 0) {
					origin.off(eventsName[5], touchMove);
					origin.off(eventsName[6], touchEnd);
					origin.off(eventsName[7], touchEnd);
				}
			}
			// mouseMove事件触发函数
			// event[eventObject]: 事件对象
			function mouseMove(event) {
				if (stopPropagation) event.stopPropagation();

				// 停止冒泡
				event.stopPropagation();

				var // 获取浏览器event对象
					o = event.originalEvent;

				if (!pointers[0]) return;
				pointers[0].setMove(o);

				// 执行moveHandler回调
				moveHandler(event, 0);
			}
			// mouseUp事件触发函数
			// event[eventObject]: 事件对象
			function mouseUp(event) {
				if (stopPropagation) event.stopPropagation();

				if (!pointers[0]) return;
				// 执行upHandler回调
				upHandler(event, 0);
				// 删除触点(避免意外删除)
				if (pointers[0] !== undefined && pointers[0].del === false) pointers[0].del = true;

				// 解绑move事件
				$dom.off(eventsName[9], mouseMove);
				// 解绑up事件
				$dom.off(eventsName[10], mouseUp);
			}

			// 按下处理
			// id[number]: 触点ID
			function downHandler(event, id) {
				isParentsScrolling = false;
				// 当元素外层对象的全部集合中，存在某个对象是scroll控件，且此scroll正在滚动中，则判定tap与press不成立
				var parents = origin.parents(), pLen = parents.length, i = 0;
				for (; i < pLen; i++) if (parents.eq(i).attr(prefixLibName + 'scroll-runing') === '1') { isParentsScrolling = true; break; }

				// 执行down回调
				callbacks.down.call(origin, event);
			}
			// 移动处理
			// id[number]: 触点ID
			function moveHandler(event, id) {
				var move = pointers[id].getMoveLength();
				event.preventDefault();
				callbacks.pan.call(origin, move, event);
			}
			// 弹起处理
			// id[number]: 触点ID
			function upHandler(event, id) {
				var // 释放前的触点个数
					beforeUpPointsLength = null,
					// 第一次触点按下到释放的间隔
					interval = null,
					// 获取触点移动长度
					move = pointers[id].getMoveLength(),
					// 获取触点移动绝对长度
					absMove = { x: Math.abs(move.x), y: Math.abs(move.y) };


				// 如果抬起的是第一次按压的触点
				if (first.id === id) { interval = new Date() - first.time; first.id = null; first.time = null; }

				// 确定是否为第一次触碰点的弹起操作
				if (interval) {
					// 如果x或y方向移动距离不超过pointerValidLength
					if (absMove.x < pointerValidLength && absMove.y < pointerValidLength) {
						// 如果外层滚动条未滚动
						if (!isParentsScrolling) {
							// 检测是否tap方式
							// 存在一个按压时间，且时间小于tapMaxTime
							if (interval < tapMaxTime) {
								temporaryMask();
								callbacks.tap.call(origin, event);
							}
							else {
								callbacks.press.call(origin, event);
							}
						}
					}

					// 当移动距离超过pointerValidLength且x方向移动距离大于y方向且时间小于swipeMaxTime
					// 则执行左右滑动回调
					if (absMove.x >= pointerValidLength && absMove.x >= absMove.y
						&& interval < swipeMaxTime) {
						if (move.x < 0) {
							event.preventDefault();
							callbacks.swipeLeft.call(origin, event);
						}
						else {
							event.preventDefault();
							callbacks.swipeRight.call(origin, event);
						}
					}
					// 当移动距离超过pointerValidLength且y方向移动距离大于x方向且时间小于swipeMaxTime
					// 则执行上下滑动回调
					if (absMove.y >= pointerValidLength && absMove.y >= absMove.x
						&& interval < swipeMaxTime) {
						if (move.y < 0) {
							event.preventDefault();
							callbacks.swipeTop.call(origin, event);
						}
						else {
							event.preventDefault();
							callbacks.swipeBottom.call(origin, event);
						}
					}
				}

				// 执行up回调
				callbacks.up.call(origin, event);

				// 清除无效触点
				removeInvalidPointers();
			}

			// #endregion

			// #region 事件绑定与解绑

			// 事件绑定处理方法
			// isBind[bool]: 绑定事件(true)与解绑事件(false)
			function eventBingingHandler(isBind) {
				var pointer = support.pointer || support.msPointer;
				if (isBind) {
					if (pointer) {
						origin.on(eventsName[0], pointerDown);
					}
					else {
						origin.on(eventsName[4] + ' ' + eventsName[8], eventStart);
					}

					origin.css({
						// 清除触控效果
						'-ms-touch-action': 'none',
						'touch-action': 'none',
						// 关闭用户选择
						'-webkit-user-select': 'none',
						'-moz-user-select': 'none',
						'-ms-user-select': 'none',
						'user-select': 'none'
					});
				} else {
					if (pointer) {
						origin.off(eventsName[0], pointerDown);
					} else {
						origin.off(eventsName[4] + ' ' + eventsName[8], eventStart);
					}

					origin.css({
						// 取消清除触控效果
						'-ms-touch-action': 'auto',
						'touch-action': 'auto',
						// 开启用户选择
						'-webkit-user-select': 'text',
						'-moz-user-select': 'text',
						'-ms-user-select': 'text',
						'user-select': 'text'
					});
				}
			}
			// 绑定事件
			function eventBind() {
				if (!bindingState) {
					bindingState = true;
					eventBingingHandler(true);
				}
			}
			// 解绑事件
			function eventUnbind() {
				if (bindingState) {
					bindingState = false;
					eventBingingHandler(false);
				}
			}

			// #endregion

			// #region 初始化 

			// 初始化
			(function init() {
				eventBind();
			}());

			// #endregion

			// #region 返回

			// 返回
			return {
				bind: eventBind,
				unbind: eventUnbind
			};

			// #endregion

		}
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

		// #region 初始化

		// 初始化
		(function init() {
			convertToJQ(elements).each(function (i, origin) {
				events.push(event($(origin)));
			});
		}());

		// #endregion

		// #region 返回

		// 返回
		return extendObjects(eventObj, {
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
		});

		// #endregion

	};
	// 用于鼠标滚轮方式操作元素的事件处理
	// elements[string, jQuery]: jQuery 对象或可生成 jQuery 对象的字符串
	// return[eventMouseWheel] => 返回一个事件公开方法对象
	var eventMouseWheel = function (elements) {

		// #region 私有字段

		var // 事件对象
			eventObj = {},
			// 回调函数
			callbacks = {
				// 滚动
				scroll: fnNoop,
				// 向下
				down: fnNoop,
				// 向上
				up: fnNoop
			},
			// 事件名称
			MOUSEWHEEL_NAME = 'DOMMouseScroll mousewheel',
			// 事件对象集合
			events = [];

		// #endregion

		// #region 回调方法

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

		// #region 事件处理对象和相关方法

		// 通过 origin 对象一个事件监听对象
		// origin[jQuery]: jQuery 对象
		function event(origin) {

			// #region 私有字段

			var // 事件状态 
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
				callbacks.scroll.call(origin, move, event);
				// 判断滚轮向上还是向下
				if (move > 0) {
					// 执行 down 的事件回调
					callbacks.down.call(origin, event);
				} else {
					// 执行 up 的事件回调
					callbacks.up.call(origin, event);
				}
			}

			// #endregion

			// #region 事件绑定与解绑

			// 绑定事件
			function eventBind() {
				if (!state) {
					state = true;
					origin.on(MOUSEWHEEL_NAME, mouseWheel);
				}
			}
			// 解绑事件
			function eventUnbind() {
				if (state) {
					state = false;
					origin.off(MOUSEWHEEL_NAME, mouseWheel);
				}
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				eventBind();
			}());

			// #endregion

			// #region 返回

			// 返回
			return {
				bind: eventBind,
				unbind: eventUnbind
			};

			// #endregion

		}
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

		// #region 初始化

		// 初始化
		(function init() {
			convertToJQ(elements).each(function (i, origin) {
				events.push(event($(origin)));
			});
		}());

		// #endregion

		// #region 返回

		// 返回事件对象
		return extendObjects(eventObj, {
			setScroll: setScroll,
			setDown: setDown,
			setUp: setUp,
			on: on,
			off: off
		});

		// #endregion

	};
	// 滚动条控件及滚动事件
	// 用于为元素生成滚动条及滚动事件
	// elements[string, jQuery]: jQuery 对象或可生成 jQuery 对象的字符串
	// userOptions[object]: 用户参数
	// - (?) recountByResize[bool]: 设置浏览器尺寸发生改变时是否重新计算滚动区域
	// - (?) barState[number]: 滚动条显示方式
	// - (?) hasHorizontal[bool]: 是否开启横滚动条
	// - (?) hasVertical[bool]: 是否开启竖滚动条
	// - (?) barSize[number]: 滚动条尺寸
	// - (?) barMinLength[number]: 滚动条最小长度
	// - (?) barOffset[number]: 滚动条偏移量
	// - (?) barColor[rgb, rgba]: 滚动条颜色
	// - (?) barColorOn[rgb, rgba]: 滚动条当鼠标滑入时的颜色
	// - (?) barBorderRadiusState[bool]: 滚动条是否为圆角
	// - (?) mouseWheelLength[number]: 滚轮滚动长度
	// - (?) isTouchMode[bool]: 是否开启触摸来控制滚动区域
	// - (?) isMouseWheelMode[bool]: 是否开启滚轮来控制滚动区域
	// - (?) isScrollMode: 是否开启通过滚动条来控制滚动区域
	// - (?) isSlowMovning: 是否缓动
	// return[scroll] => 返回一个滚动条控件
	var scroll = function (elements, userOptions) {

		// #region 私有字段

		var // 滚动对象
			scrollObj = {},
			// 滚动选项
			recountByResize, barState, barSize, barMinLength, barOffset, barColor, barColorOn,
			barBorderRadiusState, hasHorizontal, hasVertical, isMouseWheelMode, isTouchMode,
			isScrollMode, mouseWheelLength, isSlowMovning,
			// 默认项
			options = getOptions({
				// 设置浏览器尺寸发生改变时是否重新计算滚动区域
				// 如果设置此值为true，则浏览器发生orientationchange与resize事件时，滚动区域重新计算
				recountByResize: false,
				// 滚动条显示方式
				// 0: 默认  1: 永久显示  2: 永久消失
				barState: 0,
				// 开启横滚动条
				hasHorizontal: false,
				// 开启竖滚动条
				hasVertical: true,
				// 滚动条尺寸
				barSize: 6,
				// 滚动条最小长度
				barMinLength: 30,
				// 滚动条偏移量
				barOffset: 1,
				// 滚动条颜色
				barColor: 'rgba(0,0,0,.4)',
				// 滚动条当鼠标滑入时的颜色
				barColorOn: 'rgba(0,0,0,.6)',
				// 滚动条是否为圆角
				barBorderRadiusState: true,
				// 滚轮滚动长度
				mouseWheelLength: 'normal',
				// 是否开启触摸来控制滚动区域
				isTouchMode: true,
				// 是否开启滚轮来控制滚动区域
				isMouseWheelMode: true,
				// 是否开启通过滚动条来控制滚动区域
				isScrollMode: false,
				// 缓动
				isSlowMovning: true
			}, userOptions, function (options) {
				recountByResize = options.recountByResize;
				barState = options.barState;
				barSize = options.barSize;
				barMinLength = options.barMinLength;
				barOffset = options.barOffset;
				barColor = options.barColor;
				barColorOn = options.barColorOn;
				barBorderRadiusState = options.barBorderRadiusState;
				hasHorizontal = options.hasHorizontal;
				hasVertical = options.hasVertical;
				isMouseWheelMode = options.isMouseWheelMode;
				isTouchMode = options.isTouchMode;
				isScrollMode = options.isScrollMode;
				mouseWheelLength = options.mouseWheelLength;
				isSlowMovning = options.isSlowMovning;
			}),
			// 滚动对象
			$scroll = convertToJQ(elements).eq(0),
			// 滚动包裹容器
			$wrapper = $div.clone().addClass(prefixLibName + 'scroll-wrapper'),
			// 横滚动条
			$barHorizontal = $div.clone().addClass(prefixLibName + 'scroll-bar'),
			// 竖滚动条
			$barVertical = $div.clone().addClass(prefixLibName + 'scroll-bar'),
			// 缓动
			easing = {
				quadratic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				circular: 'cubic-bezier(0.1, 0.57, 0.1, 1)'
			},
			// 主运动触点数据对象
			mainPointer = {
				// 触点ID
				id: null,
				// 新触点开始时间戳
				start: 0,
				// 旧触点结束时间戳
				end: 0,
				// 是否移动标记
				moved: false,
				// 触点开始移动记录点
				startMove: { x: 0, y: 0 },
				// 触点上次的移动距离
				lastMove: { x: 0, y: 0 }
			},
			// 是否正在滚动
			isScrolling = false,
			// 是否跟随
			isOplock = false,
			// 当滚动完成时执行强制停止回调定时器
			scrollEndTimer = null,
			// 触摸启动最小长度
			touchStartMinLength = 5,
			// 鼠标滚轮定时器
			// 用于阻止滚轮在边缘的多次滚动
			mouseWheelTimer = null,
			// 记录鼠标是否在滚动条区域中按下滚动条，并拖拽操作
			mouseInScroll = false,
			// 记录鼠标是否在滚动容器中
			mouseInBox = false,
			// 滚动对象数据
			scrollData = {
				// 外层盒子高度
				h: 0,
				// 带有内边距的盒子高度
				ih: 0,
				// 盒子的可滚动高度
				sh: 0,
				// 外层盒子宽度
				w: 0,
				// 带有内边距的盒子宽度
				iw: 0,
				// 盒子的可滚动宽度
				sw: 0,
				// 盒子当前移动的距离
				now: { x: 0, y: 0 },
				// 当前是否处于触点移动中
				isMoved: false
			},
			// 滚动条对象数据
			barData = {
				// 滚动条高度
				h: 0,
				// 最大滚动高度
				mh: 0,
				// 可滚动高度
				sh: 0,
				// 滚动条宽度
				w: 0,
				// 最大滚动宽度
				mw: 0,
				// 可滚动宽度
				sw: 0,
				// 定时器
				timer: null
			},
			// 此对象的跟随对象
			followers = [],
			// 滚动对象名称
			SCROLL_NAME = 'scroll',
			// 滚动状态标记属性
			ATTRNAME_IS_SCROLL = prefixLibName + 'scroll-runing';

		// #endregion

		// #region 私有方法

		// 重计算滚动条滚动位置
		function recountPosition() {
			getScrollData();
			translateMove(scrollData.now.x, scrollData.now.y);

			return scrollObj;
		}
		// 重新计算滚动对象及外层对象高度，且初始化滚动条数据
		function getScrollData() {
			var // 外层盒子高度
				wrapperHeight = 0,
				// 滚动条高度
				scrollHeight = 0,
				// 滚动条高度
				barHeight = 0,
				// 最大滚动槽高度
				maxScrollBarHeight = 0,
				// 外层盒子宽度
				wrapperWidth = 0,
				// 滚动条宽度
				scrollWidth = 0,
				// 滚动条宽度
				barWidth = 0,
				// 最大滚动槽宽度
				maxScrollBarWidth = 0,
				// 尺寸
				size;

			// 如果开启竖滚动条
			if (options.hasVertical) {
				// 获取外层对象高度
				wrapperHeight = $wrapper.height();
				scrollHeight = $scroll.height();

				// 保存高度数据到滚动对象数据中
				scrollData.h = scrollHeight;
				scrollData.ih = $scroll.innerHeight();
				scrollData.sh = wrapperHeight - scrollHeight;
				if (scrollData.now.y < -scrollData.sh) scrollData.now.y = -scrollData.sh;

				// 最大滚动高度
				maxScrollBarHeight = scrollData.ih - 2 * options.barOffset;

				// 计算滚动条高度
				if (scrollHeight !== 0) {
					size = scrollData.sh / (scrollData.ih * 5);
					size = 1 - (size > 1 ? 1 : size);
					barHeight = maxScrollBarHeight * size;
					barHeight = barHeight < options.barMinLength ? options.barMinLength : barHeight;
					barHeight = barHeight > maxScrollBarHeight ? maxScrollBarHeight : barHeight;

					barData.h = barHeight;
					barData.mh = maxScrollBarHeight;
					barData.sh = maxScrollBarHeight - barHeight;

					$barVertical.height(barHeight);
				}
			}
			// 如果开启横滚动条
			if (options.hasHorizontal) {
				// 获取外层对象宽度
				wrapperWidth = $wrapper.width();
				scrollWidth = $scroll.width();

				// 保存宽度数据到滚动对象数据中
				scrollData.w = scrollWidth;
				scrollData.iw = $scroll.innerWidth();
				scrollData.sw = wrapperWidth - scrollWidth;
				if (scrollData.now.x < -scrollData.sw) scrollData.now.x = -scrollData.sw;

				// 最大滚动宽度
				maxScrollBarWidth = scrollData.iw - 2 * options.barOffset;

				// 计算滚动条宽度
				if (scrollWidth !== 0) {
					size = scrollData.sw / (scrollData.iw * 5);
					size = 1 - (size > 1 ? 1 : size);
					barWidth = maxScrollBarWidth * size;
					barWidth = barWidth < options.barMinLength ? options.barMinLength : barWidth;
					barWidth = barWidth > maxScrollBarWidth ? maxScrollBarWidth : barWidth;

					barData.w = barWidth;
					barData.mw = maxScrollBarWidth;
					barData.sw = maxScrollBarWidth - barWidth;

					$barHorizontal.width(barWidth);
				}
			}
		}
		// 获取当前移动位置
		// return[point]: 移动位置对象
		function getPosition() {
			var x, y;
			var matrix = $wrapper.css('transform');
			// 通过矩阵获取当前滚动位置
			matrix = matrix.split(')')[0].split(', ');
			x = Math.round(+(matrix[12] || matrix[4]));
			y = Math.round(+(matrix[13] || matrix[5]));
			return { x: x, y: y };
		}
		// 设置当前滚动状态
		// state[bool]: 是否正在滚动 true: 滚动 false: 未滚动
		function setScrollingState(state) {
			if (isScrolling !== state) {
				isScrolling = state;
				$scroll.attr(ATTRNAME_IS_SCROLL, state ? 1 : 0);
			}
		}
		// 坐标转换
		// 通过滚动容器坐标运算滚动条坐标
		// direction[bool]: 方向 false: x方向 true: y方向
		// position[number]: 坐标
		function getBarPositionByScrollPosition(position, direction) {
			var dir = direction ? 'sh' : 'sw';
			if (scrollData[dir] === 0 || barData[dir] === 0) {
				return 0;
			} else {
				return position / scrollData[dir] * barData[dir];
			}
		}
		// 坐标转换
		// 通过滚动条坐标运算滚动容器坐标
		// direction[bool]: 方向 false: x方向 true: y方向
		// position[number]: 坐标
		function getScrollPositionByBarPosition(position, direction) {
			var dir = direction ? 'sh' : 'sw';
			if (scrollData[dir] === 0 || barData[dir] === 0) {
				return 0;
			} else {
				return position / barData[dir] * scrollData[dir];
			}
		}
		// 开启滚动条
		function barOpen() {
			if (options.barState === 0) {
				if (barData.timer) window.clearTimeout(barData.timer);
				$barHorizontal.stop().fadeIn(200);
				$barVertical.stop().fadeIn(200);
			}
		}
		// 关闭滚动条
		function barClose() {
			if (options.barState === 0) {
				if (!mouseInBox && !mouseInScroll && !isScrolling) {
					if (barData.timer) window.clearTimeout(barData.timer);
					barData.timer = window.setTimeout(function () {
						$barHorizontal.stop().fadeOut(400);
						$barVertical.stop().fadeOut(400);
					}, 800);
				}
			}
		}
		// 计算滚动缓停的位移和时间
		// current[number]: 当前滚动位置
		// start[number]: 滚动开始时的位置
		// time[number]: 滚动用时
		// wrapper[number]: 滚动对象的高度
		// scroll[number]: 视窗对象的高度
		// (?) deceleration[number]: 减速
		function momentum(current, start, time, wrapper, scroll, deceleration) {
			var distance = current - start,
				speed = Math.abs(distance) / time,
				destination,
				duration;

			wrapper = -wrapper;
			scroll = scroll || 0;
			deceleration = deceleration || 0.0005;
			destination = current + speed * speed / (2 * deceleration) * (distance < 0 ? -1 : 1);
			duration = speed / deceleration;

			if (destination < wrapper) {
				destination = scroll ? wrapper - scroll / 2.5 * (speed / 8) : wrapper;
				distance = Math.abs(destination - current);
				duration = distance / speed;
			} else if (destination > 0) {
				destination = scroll ? scroll / 2.5 * (speed / 8) : 0;
				distance = Math.abs(current) + destination;
				duration = distance / speed;
			}

			return {
				destination: Math.round(destination),
				duration: duration
			};
		}
		// 执行滚动动画
		// x[number]: 滚动到 X 坐标
		// y[number]: 滚动到 Y 坐标
		// time[number]: 滚动用时
		// e[easingObject]: 缓动
		function translateMove(x, y, time, e) {
			var i, len;

			// 设置动画时长
			time = time || 0;
			// 设置 $wrapper 的过渡动画
			e = e || easing.circular;

			if (x > 0) x = 0;
			if (y > 0) y = 0;
			if (y < -scrollData.sh) y = -scrollData.sh;
			if (x < -scrollData.sw) x = -scrollData.sw;

			// 使用过渡动画实现滚动
			translateTimingFunction(e);
			translateTime(time);
			$wrapper.css('transform', 'translate(' + x + 'px, ' + y + 'px)' + (support.perspective ? ' translateZ(0)' : ''));
			if (options.hasVertical) $barVertical.css('transform', 'translate(0, ' + getBarPositionByScrollPosition(-y, 1) + 'px)' + (support.perspective ? ' translateZ(0)' : ''));
			if (options.hasHorizontal) $barHorizontal.css('transform', 'translate(' + getBarPositionByScrollPosition(-x, 0) + 'px, 0)' + (support.perspective ? ' translateZ(0)' : ''));
			scrollData.now = { x: x, y: y };

			len = followers.length;
			if (len !== 0) {
				for (i = 0; i < len; i++) {
					followers[i].move(-x, -y, time);
				}
			}
		}
		// 设置滚动动画的缓动
		// e[easingObject]: 缓动
		function translateTimingFunction(e) {
			$wrapper.css('transition-timing-function', e);
			$barVertical.css('transition-timing-function', e + ', ease-out, ease-out, ease-out');
			$barHorizontal.css('transition-timing-function', e + ', ease-out, ease-out, ease-out');
		}
		// 设置滚动动画的用时 
		// time[number]: 滚动用时
		function translateTime(time) {
			var t = parseInt(time);
			$wrapper.css('transition-duration', t + 'ms');
			$barVertical.css('transition-duration', t + 'ms, 300ms, 300ms, 300ms');
			$barHorizontal.css('transition-duration', t + 'ms, 300ms, 300ms, 300ms');

			// 当滚动完成时强制停止
			// 由于transition-end在部分浏览器中时间不准确，这里的定时器方式替代了transition-end
			if (t !== 0) {
				if (scrollEndTimer) { window.clearTimeout(scrollEndTimer); }
				scrollEndTimer = window.setTimeout(function () {
					translateMove(scrollData.now.x, scrollData.now.y, 0);
					setScrollingState(false);
					barClose();
				}, t);
			} else {
				setScrollingState(false);
				barClose();
			}
		}

		// #endregion

		// #region 公共方法

		// 移动滚动条
		// x[number]: 滚动到 X 坐标
		// y[number]: 滚动到 Y 坐标
		// time[number]: 滚动用时
		// return[scroll]: 返回滚动条对象
		function move(x, y, time) {
			time = time || 0;
			translateMove(-x, -y, time);
			return scrollObj;
		}
		// 获取或设置跟随状态
		// (): 获取跟随状态
		// - return[bool]: 返回当前是否被跟随
		// (state): 设置跟随状态
		// - state[bool]: 是否被跟随
		// - return[scroll]: 返回滚动对象
		function oplock(state) {
			if (state !== void 0) {
				isOplock = !!state;
				return scrollObj;
			}
			else {
				return isOplock;
			}
		}
		// 绑定一个scroll控件跟随此控件
		// scroll[scroll]: 待绑定的scroll控件
		// return[scroll]: 返回滚动对象
		function followerBind(scroll) {
			if (type.isObject(scroll) && scroll.type && scroll.type === SCROLL_NAME) {
				followers.push(scroll);
			}
			return scrollObj;
		}
		// 解绑一个scroll控件跟随此控件
		// scroll[scroll]: 待解绑的scroll控件
		// return[scroll]: 返回滚动对象
		function followerUnbind(scroll) {
			var index;
			if (type.isObject(scroll) && scroll.type && scroll.type === SCROLL_NAME) {
				index = followers.indexOf(scroll);
				if (index > -1) {
					followers.splice(index, 1);
				}
			}
			return scrollObj;
		}

		// #endregion
		
		// #region 事件处理对象和相关方法

		// 触点按下时触发的事件
		function pointerDown() {
			if (isOplock) return;
			getScrollData();
			barOpen();

			var pos = getPosition();
			translateMove(pos.x, pos.y);

			mainPointer.moved = false;
			mainPointer.start = getTime();
			mainPointer.startMove = { x: scrollData.now.x, y: scrollData.now.y };
			mainPointer.lastMove = { x: 0, y: 0 };
		}
		// 触点移动时触发的事件
		// move[moveObject]: 移动数据对象
		function pointerMove(move) {
			if (isOplock) return;

			var // 本次触点移动的时间标记
				timeStamp = getTime(),
				// 从触点按下到当前函数触发时的移动长度
				x = move.x, y = move.y,
				// 从触点按下到当前函数触发时的绝对长度
				absX = Math.abs(x), absY = Math.abs(y),
				// 移动增量
				deltaX = x - mainPointer.lastMove.x,
				deltaY = y - mainPointer.lastMove.y,
				// 移动长度
				newX = 0, newY = 0;

			// 设置当前滚动状态为滚动中
			barOpen();
			// 记录最后 move 方法移动的坐标点
			mainPointer.lastMove = { x: x, y: y };

			// 设置移动启动长度
			if (timeStamp - mainPointer.end > 300
				&& absX < touchStartMinLength
				&& absY < touchStartMinLength) return;

			// 标记启动
			if (!mainPointer.moved) mainPointer.moved = true;

			// 计算移动距离
			if (options.hasVertical) newY = deltaY + scrollData.now.y;
			if (options.hasHorizontal) newX = deltaX + scrollData.now.x;
			if (deltaX !== 0 || deltaY !== 0) translateMove(newX, newY);

			// 重置启动点
			if (timeStamp - mainPointer.start >= 300) {
				mainPointer.start = timeStamp;
				mainPointer.startMove.x = newX;
				mainPointer.startMove.y = newY;
			}
		}
		// 触点抬起时触发的事件
		function pointerUp() {
			if (isOplock) return;

			var // 当前坐标
				x = scrollData.now.x, y = scrollData.now.y,
				// 移动长度
				newX = x, newY = y,
				// 动量
				momentumX = null, momentumY = null,
				// 时长
				duration = getTime() - mainPointer.start,
				// 运动时间
				time = 0,
				// 缓动
				e;

			// 触点结束时刻
			mainPointer.end = getTime();

			// 如无运动关闭滚动条
			barClose();

			// 如果未移动直接跳出
			if (!mainPointer.moved || !options.isSlowMovning) return;

			// 当延迟小于300ms则进行延迟滚动特效
			if (duration < 300) {
				var timeX = 0, timeY = 0;
				if (options.hasVertical) {
					momentumY = momentum(y, mainPointer.startMove.y, duration, scrollData.sh,
					options.bounce ? scrollData.h : 0);
					newY = momentumY.destination;
					timeY = momentumY.duration;
				}
				if (options.hasHorizontal) {
					momentumX = momentum(x, mainPointer.startMove.x, duration, scrollData.sw,
					options.bounce ? scrollData.w : 0);
					newX = momentumX.destination;
					timeX = momentumX.duration;
				}

				time = Math.max(timeX, timeY);
			}

			// 当坐标确定发生移动则执行滚动动画
			if (newX !== x || newY !== y) {
				barOpen();
				setScrollingState(true);
				translateMove(newX, newY, time);
			}
		}
		// 鼠标滚轮发生滚动时触发的事件
		// move[number]: 滚轮滚动方向及长度
		function mouseWheel(move) {
			var x = scrollData.now.x,
				y = scrollData.now.y,
				time = 300,
				moveLen = options.mouseWheelLength;

			getScrollData();

			// 判断移动距离
			if (moveLen === 'normal') moveLen = Math.round(scrollData.h);
			move > 0 ? y -= moveLen : y += moveLen;

			if (y > 0 || y < -scrollData.sh) {
				setScrollingState(false);
			} else {
				barOpen();
				setScrollingState(true);
			}
			translateMove(x, y, time);
		}
		// 滚动条被按下时触发的事件
		function scrollDown() {
			this.move = 0;
			mouseInScroll = true;
			barOpen();
			$(this).css('background', options.barColorOn);
		}
		// 滚动条被释放时触发的事件
		function scrollUp() {
			mouseInScroll = false;
			barClose();
			$(this).css('background', options.barColor);
		}
		// 滚动条被按下并拖拽时触发的事件
		// move[number]: 滚动条滚动方向及长度
		// direction[bool]: 滚动方向
		function scrollMove(move, direction) {
			var x = direction
						? scrollData.now.x
						: getScrollPositionByBarPosition(-(move.x - this.move), 0) + scrollData.now.x,
				y = direction
						? getScrollPositionByBarPosition(-(move.y - this.move), 1) + scrollData.now.y
						: scrollData.now.y;

			if (direction) {
				this.move = move.y;
			} else {
				this.move = move.x;
			}

			translateMove(x, y);
		}
		// 事件绑定
		function bindEvent() {
			// 绑定屏幕尺寸变化的事件
			if (options.recountByResize) callbacks.pageResize.add(recountPosition);

			// 鼠标在滑入滑出滚动区域时滚动条的显示处理
			if (options.barState === 0) {
				$scroll.on(MOUSE_ENTER, function () {
					getScrollData();
					mouseInBox = true;
					barOpen();
				}).on([MOUSE_LEAVE, TOUCH_END].join(' '), function () {
					mouseInBox = false;
					barClose();
				});
			}

			// 绑定事件
			if (options.isTouchMode) {
				event($scroll, { stopPropagation: true })
					.setDown(pointerDown)
					.setUp(pointerUp)
					.setPan(pointerMove);
			}	
			if (options.isMouseWheelMode) {
				eventMouseWheel($scroll).setScroll(mouseWheel);
			}
			if (options.isScrollMode) {
				// 通过滚动条滑动来控制当前容器的移动距离
				event($barVertical, { stopPropagation: true })
					.setPan(function (move) { scrollMove.call(this, move, 1); })
					.setDown(scrollDown)
					.setUp(scrollUp);
				event($barHorizontal, { stopPropagation: true })
					.setPan(function (move) { scrollMove.call(this, move, 0); })
					.setDown(scrollDown)
					.setUp(scrollUp);
			}
		}

		// #endregion

		// #region 初始化

		// 初始化
		(function init() {
			// 判断传入的鼠标滚轮滚动长度是否符合要求
			if (mouseWheelLength !== 'normal' && !type.isNaturalNumber(mouseWheelLength))
				mouseWheelLength = 'normal';

			// 对象内部集合
			var $child = $scroll.contents();
			// 如果内部对象集合长度为0(说明$scroll内容为空)，则把$wrapper元素插入到$scroll内
			// 否则用$wrapper包裹所有内部对象，得到最新的包裹对象并提交给$wrapper
			if ($child.length === 0) {
				$scroll.append($wrapper);
			} else {
				$child.wrapAll($wrapper);
				$wrapper = $scroll.children('.' + prefixLibName + 'scroll-wrapper');
			}

			// 延续scroll盒的padding值
			// 让外盒的padding来模拟scroll盒的padding
			// HACK: 此处当$wrapper.css('padding')获取值的时候，EDGE浏览器获取的值为空
			// 进而分别试用top/bottom/left/right来获取padding值
			$wrapper.css('padding',
				$scroll.css('padding-top')
				+ ' ' + $scroll.css('padding-right')
				+ ' ' + $scroll.css('padding-bottom')
				+ ' ' + $scroll.css('padding-left'));

			// 对$scroll添加.ud2-scroll类(滚动条基础样式)
			$scroll.addClass('ud2-scroll');

			// 添加滚动条并设置尺寸
			if (hasVertical) {
				$scroll.prepend($barVertical);
				$wrapper.css({ 'height': 'auto', 'min-height': '100%' });
			}
			if (hasHorizontal) {
				$scroll.prepend($barHorizontal);
				$wrapper.css({ 'width': 'auto', 'min-width': '100%' });
			}
			$barVertical.css({ 'top': barOffset, 'right': barOffset, 'width': barSize, 'background': barColor });
			$barHorizontal.css({ 'left': barOffset, 'bottom': barOffset, 'height': barSize, 'background': barColor });
			if (barBorderRadiusState) {
				$barVertical.css('border-radius', barSize / 2);
				$barHorizontal.css('border-radius', barSize / 2);
			}
			if (barState === 1) {
				$barVertical.show();
				$barHorizontal.show();
			}

			// 获取scroll的数据值
			getScrollData();
			// 绑定事件
			bindEvent();
		}());

		// #endregion

		// #region 返回

		// 返回
		return extendObjects(scrollObj, {
			type: SCROLL_NAME,
			move: move,
			oplock: oplock,
			followerBind: followerBind,
			followerUnbind: followerUnbind
		});

		// #endregion

	};

	// #endregion

	// #region ud2 库公用控件

	// ud2库样式对象
	var style = (function () {
		var // 样式对象
				styles = {},
				// 样式名称集合
				stylesName = ['normal', 'info', 'success', 'warning', 'danger'],
				// 迭代变量
				i = 0, len = stylesName.length;
		for (; i < len; i++) styles[stylesName[i]] = { name: stylesName[i], no: i };
		return styles;
	}());

	// ud2库公开对象
	// 此对象默认会成为window的属性
	var ud2 = (function () {
		var // 库公共对象
			ud2 = {
				// 公开库事件
				event: event,
				eventMouseWheel: eventMouseWheel,
				scroll: scroll,
				// 公开库基础样式
				style: style,
				// 初始化全部未初始化的控件
				// 在页面初始化完成后，会自动调用此方法
				controlCreate: function () {
					var // 获取全部标记为控件的元素
						$ud2Controls = $('[' + libName + ']');

					// 迭代元素
					$ud2Controls.each(function () {
						var // 获取当前元素
							$this = $(this),
							// 获取控件类型
							typeNames = getNames($this);

						typeNames.forEach(function (item, index) {
							var // 通过控件类型名称获取控件对象名称
								controlName = getControlNameByName(item),
								// 获取此空间是否被创建
								isCreated = $this.attr(prefixLibName + item + '-ready'),
								// 控件ID
								id = $this.attr('ud2-id') || null;

							if (!isCreated) {
								if (id) ud2[controlName].create(id, $this);
								else ud2[controlName].create($this);
							}
						});
					});
				}
			};

		return ud2;
	}());

	// 控件基类
	// 生成的全部控件是由此继承而来
	// type[string]: 控件类型
	var control = function (controlType) {
		var // 获取控件生成的所在组
			collection = this,
			// 用户自定义项
			userOptions = {},
			// 控件对象
			control = {
				// 控件对象公开的属性或方法
				public: {
					// 表示当前控件为ud2控件
					ud2: true,
					// 控件所在集合对象 
					collection: collection.public,
					// 控件类型
					type: controlType,
					// 将控件插入到目标元素内部的末尾位置
					appendTo: function (jq) {
						insertContext(jq, function ($) {
							$.last().append(control.current);
						});
					},
					// 将控件插入到目标元素内部的起始位置
					prependTo: function (jq) {
						insertContext(jq, function ($) {
							$.last().prepend(control.current);
						});
					},
					// 将控件插入到目标元素的前面，作为其兄弟元素
					insertBefore: function (jq) {
						insertContext(jq, function ($) {
							$.last().before(control.current);
						});
					},
					// 将控件插入到目标元素的后面，作为其兄弟元素
					insertAfter: function (jq) {
						insertContext(jq, function ($) {
							$.last().after(control.current);
						});
					},
					// 获取或设置控件样式
					style: styleHandler
				},
				// 原生jQuery对象
				origin: null,
				// 控件jQuery对象
				current: $div.clone(),
				// 用户自定义项
				userOptions: userOptions,
				// 获取原生对象标签控件属性
				// name[string]: 标签控件属性
				// isNative[bool]: 是否为原生属性
				// return[string]: 返回标签控件属性值
				getOriginAttr: function (name, isNative) {
					// 获取新的属性名
					name = (function () {
						if (!attrTranslateGroup[name]) {
							attrTranslateGroup[name] = name.match(attrTranslateRegex).join(joinStr).toLowerCase();
						}
						return attrTranslateGroup[name];
					})();

					var attr = isNative ? name : collection.className + joinStr + name;
					return control.origin ? control.origin.attr(attr) : null;
				},
				// 获取控件自定义项
				// optNameArr[array]: 自定义项名称集合
				// callbacks[function]: 用于处理自定义项值的回调方法
				getOptions: function () {
					return getOptions.apply(this, arguments);
				},
				// 转移原标签的style、class属性到新控件的根标签
				// options[object]: 自定义选项
				// - {} 自定义选项 
				//   transfer[jQuery]: 原标签jQuery对象
				//   accept[jQuery]: 新控件根标签jQuery对象
				transferStyles: function (options) {
					transfer(options, function ($transfer, $accept) {
						// 把转移者的style属性和class属性全部转移给接收者
						$accept
							.attr("style", $transfer.attr("style"))
							.addClass($transfer.attr("class"));
						// 移除转移者的style属性和class属性
						$transfer
							.removeAttr("style")
							.removeClass();
					});
				},
				// 转移原标签的自定义属性到新控件的相应标签中
				// options[object]: 自定义选项
				// - {} 自定义选项 
				//   transfer[jQuery]: 原标签jQuery对象
				//   accept[jQuery]: 新控件根标签jQuery对象
				//   attrReg[string]: 自定义转移的属性名(组)
				transferAttrs: function (options) {
					transfer(options, function ($transfer, $accept, attrReg) {
						var // 原对象
							oldElement = $transfer.get(0),
							// 新对象
							newElement = $accept.get(0),
							// 属性长度
							len = oldElement ? oldElement.attributes.length : 0,
							// 匹配可转移的属性名
							reg = new RegExp('^(' + attrReg + ')'),
							// 迭代
							i = 0, j = 0, attr;

						// 迭代属性
						for (; i < len; i++) {
							attr = oldElement.attributes[j];
							if (reg.test(attr.name)) {
								newElement.setAttribute(attr.name, attr.value);
								oldElement.removeAttribute(attr.name);
							} else {
								j++;
							}
						}
					});
				},
				// 控件默认样式
				style: style.normal,
				// 控件自动关闭执行的方法
				autoClose: fnNoop
			};

		// 处理转移方法的参数
		// options[object]: 自定义选项
		// - {} 自定义选项 
		//   transfer[jQuery]: 原标签jQuery对象
		//   accept[jQuery]: 新控件根标签jQuery对象
		//   attrReg[string]: 自定义转移的属性名(组)
		// callbacks: 回调方法，执行具体转移的过程
		function transfer(options, callbacks) {
			options = options || {};
			options.transfer = options.transfer || control.origin || null;
			options.accept = options.accept || control.current || null;
			options.attrReg = options.attrReg || null;

			if (options.transfer && options.accept) callbacks(options.transfer, options.accept, options.attrReg);
		}
		// 将控件插入到页面的上下文中
		// jq[jQuery, string]: 控件摆放的相关元素
		// callbacks[function]: 回调方法，执行具体上下文过程
		function insertContext(jq, callbacks) {
			jq = convertToJQ(jq);
			callbacks = callbacks || fnNoop;
			callbacks(jq);
		}
		// 自动关闭方法
		// target[jQuery, string]: 事件目标
		function autoClose(target) {
			var $parents, i, len;
			target = convertToJQ(target);
			$parents = target.parents();
			if (target.get(0) === control.current.get(0)) return;
			for (i = 0, len = $parents.length; i < len; i++) if ($parents.eq(i).get(0) === control.current.get(0)) return;
			control.autoClose();
		}
		// 获取或设置控件样式
		// () 获取控件样式
		// - return[ud2.style.*]: 返回控件样式对象
		// (s) 设置控件样式
		// - s[ud2.style.*]: 控件样式对象
		// - return[control]: 返回当前控件对象
		function styleHandler(s) {
			if (s !== void 0) {
				for (var i in style) {
					control.style === style[i] && control.current.removeClass(style[i].name);
				}
				control.style = s;
				control.current.addClass(s.name);
				return control.public;
			}
			else {
				return control.style;
			}
		}

		// 自动关闭回调
		callbacks.ctrlClose.add(autoClose);

		// 返回控件对象
		return control;
	};
	// 控件对象集合基类
	// 生成的全部控件对象集合是由此继承而来
	var controlCollection = function (name) {
		var // 控件集合对象
			collection = {
				// 控件集合对象公开对象
				public: [],
				// 控件集合初始化函数
				init: fnNoop,
				// 控件集合名称
				name: name,
				// 控件对象名称
				ctrlName: getControlNameByName(name),
				// 控件默认样式类
				className: prefixLibName + name
			};
		// 返回集合组
		return collection;
	};

	// 为未命名控件生成ud2-id属性值
	// 生成的id从编号0开始顺延
	var createControlID = (function () {
		var id = 0;
		return function () {
			return prefixLibName + id++;
		};
	}());
	// 创建一个控件类
	// name[string]: 控件类名称
	// callbacks[function]: 创建回调，用于对控件的初始化操作
	// return[function]: 创建控件的构造函数 
	var createControl = function (name, callbacks) {
		var // 获取一个空控件集合对象
			ctrlCollection = controlCollection(name),
			// 用于创建控件的构造函数
			constructor = function () {
				return create.apply(constructor, arguments);
			},
			// 用于创建控件的方法
			// 只接受创建一个控件
			create = function () {
				var // 获取一个空控件对象
					ctrl = control.call(ctrlCollection, name),
					// 获取当前方法的参数集合
					args = arguments,
					// 获取参数数量
					len = args.length,
					// 控件公共属性
					id, origin, userOptions;

				// 检测长度
				switch (len) {
					// ()
					case 0: {
						return create.call(constructor, void 0, void 0, {});
					}
						// (ctrlID)、(origin)、(userOptions)
					case 1: {
						if (type.isString(args[0]))
							return create.call(constructor, args[0], void 0, void 0);
						if (type.isJQuery(args[0]))
							return create.call(constructor, void 0, args[0], void 0);
						if (type.isObject(args[0]))
							return create.call(constructor, void 0, void 0, args[0]);
						return create.call(constructor);
					}
						// (ctrlID, origin)、(ctrlID, userOptions)、(origin, userOptions)
					case 2: {
						if (type.isString(args[0]) && (type.isJQuery(args[1]) || type.isString(args[1])))
							return create.call(constructor, args[0], args[1], void 0);
						if (type.isString(args[0]) && type.isObject(args[1]))
							return create.call(constructor, args[0], void 0, args[1]);
						if (type.isJQuery(args[0]) && type.isObject(args[1]))
							return create.call(constructor, void 0, args[0], args[1]);
						break;
					}
						// (ctrlID, origin, userOptions)
					case 3: {
						id = type.isString(args[0]) && args[0].length > 0 ? args[0] : createControlID();
						// 如果传入的jQuery对象长度大于1，则默认选择第一个元素做为origin
						origin = convertToJQ(args[1]).first();
						userOptions = type.isObject(args[2]) ? args[2] : {};
						break;
					}
				}

				// 向控件扩展必要属性
				extendObjects(ctrl, { origin: origin, userOptions: userOptions });
				extendObjects(ctrl.public, { id: id });

				// 向集合添加当前控件
				ctrlCollection.public.push(ctrl.public);
				ctrlCollection.public[id] = ctrl.public;
				ctrl.current
					.attr(libName, name)
					.attr(libName + '-id', id)
					.attr(ctrlCollection.className + '-ready', true)
					.addClass(ctrlCollection.className);

				// 创建对象后，返回ctrl.public对象
				// 此处的ctrl.public对象内的属性为控件的公共属性
				return ctrlCollection.init(ctrl) || ctrl.public;
			};

		// 执行创建控件回调，初始化控件
		callbacks(ctrlCollection);

		// 将控件绑定在ud2对象上
		ud2[name] = constructor;
		if (ctrlCollection.name !== ctrlCollection.ctrlName) ud2[ctrlCollection.ctrlName] = constructor;
		// 公开属性
		constructor.create = create;
		constructor.collection = ctrlCollection.public;
		// 返回构造函数
		return constructor;
	};

	// #endregion

	// #region ud2 库表单控件

	// 数字控件
	createControl('number', function (collection) {

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // 获取样式类名
				className = collection.className,
				// 步长, 步长位数, 最小值, 最大值, 值
				step, stepDigit, min, max, value,
				// 获取用户自定义项
				options = control.getOptions(['step', 'min', 'max', 'value'], function (options) {
					// 处理步长
					step = parseFloat(options.step);
					if (isNaN(step) || step === 0) step = 1;
					// 处理最小值
					min = parseFloat(options.min);
					if (isNaN(min)) min = 0;
					// 处理最大值
					max = parseFloat(options.max);
					if (isNaN(max)) max = 100;
					// 处理值
					value = options.value;
					// 数据处理
					if (min > max) max = min;
					value = convertValue(value);
					// 处理小数点
					if (step.toString().indexOf('.') > -1) stepDigit = step.toString().split('.')[1].length;
					else stepDigit = 0;
				}),
				// 控件结构
				template = '<a class="' + className + '-ico">&#xe106;</a>'
					+ '<div class="' + className + '-move"><input type="text" value="0" class="ud2-ctrl-textbox" /></div>'
					+ '<a class="' + className + '-ico">&#xe107;</a>',
				// 获取初始化的控件对象
				current = control.current,
				// 控件对象
				$number = current.html(template),
				// 值对象
				$value = $number.find('input'),
				// 值递减按钮对象
				$prev = $number.children('a:first'),
				// 值递增按钮对象
				$next = $number.children('a:last'),
				// 移动容器对象
				$move = $prev.next(),
				// 动画锁
				lock = false,
				// 回调方法
				controlCallbacks = {
					// 当值发生改变时回调
					change: fnNoop
				};

			// #endregion

			// #region 私有方法

			// 强制转换value值，使value值符合范围区间，以及满足步长规则
			// value[number]: 待转换的value值
			// return[number]: 返回转换后的value值
			function convertValue(value) {
				value = parseFloat(value);
				if (isNaN(value) || value < min) value = min;
				if (value > max) value = max;
				value = Math.round((value - min) / step) * step + min;
				value = parseFloat(value.toFixed(stepDigit));
				if (value > max) value -= step;
				return value;
			}
			// 执行控件动画，对值递增或递减
			// isNext[bool]: 是否为递增动画
			// - true: 递增 false: 递减
			function animate(isNext) {
				// 判断是否上锁，没上锁则上锁并执行动画
				if (lock) return; lock = true;
				// 判断上下限
				if (isNext && value + step > max
					|| !isNext && value - step < min) { lock = false; return; }

				var // 临时容器标签
					tInput = '<input class="ud2-ctrl-textbox" />',
					// 建立临时容器
					$tempL = $div.clone().addClass(className + '-view').html(tInput),
					$tempR = $div.clone().addClass(className + '-view').html(tInput),
					// 获取父容器
					$parent = $value.parent(),
					// 用于存储动画容器
					$run = null;

				// 对值运算
				if (isNext) {
					value = parseFloat((value + step).toFixed(stepDigit));
				} else {
					value = parseFloat((value - step).toFixed(stepDigit));
				}

				// 加入临时容器
				$tempL.children().val(value);
				$tempR.children().val(value);
				$value.before($tempL);
				$value.after($tempR);

				$move.animate({
					'top': isNext ? '-100%' : '100%'
				}, 300, function () {
					lock = false;
					setValue(value);
					$move.css('top', 0);
					$tempL.remove();
					$tempR.remove();
				});
			}
			// 上一个数字
			function prev() {
				animate(0);
			}
			// 下一个数字
			function next() {
				animate(1);
			}
			// 设置控件值
			// () 获取默认值设置为控件值
			// (v) 设置控件值
			// - v[number]: 控件值
			function setValue(v) {
				if (v !== void 0) {
					value = convertValue(v);
					controlCallbacks.change.call(control.public, value);
				}
				else {
					value = convertValue(value);
				}
				$value.val(value);
			}

			// #endregion

			// #region 公共方法

			// 获取或设置控件值
			// () 获取控件值
			// - return[number]: 返回控件值
			// (v) 设置控件值
			// - v[number]: 控件值
			// - return[ud2.number]: 返回该控件对象
			function val(v) {
				if (v !== void 0) {
					setValue(v);
					return control.public;
				}
				else {
					return value;
				}
			}

			// #endregion

			// #region 回调方法

			// 设置值改变回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[number]: 当前事件对象，方便链式调用
			function setChange(fn) { controlCallbacks.change = fn; return control.public; }

			// #endregion

			// #region 事件处理

			// 事件绑定
			function bindEvent() {
				event($prev).setTap(prev);
				event($next).setTap(next);
				eventMouseWheel($value).setDown(next).setUp(prev);
				$value.keydown(function (event) {
					switch (event.keyCode) {
						case 13: { $value.blur(); break; }
						case 38: { event.preventDefault(); prev(); break; }
						case 40: { event.preventDefault(); next(); break; }
					}
				}).focus(function () {
					callbacks.ctrlClose.fire($number);
					$number.addClass('on');
				}).blur(function () {
					setValue($value.val());
					$number.removeClass('on');
				});
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 控件初始化
				control.origin.after($number);
				control.origin.remove();
				control.transferStyles();
				control.transferAttrs({ accept: $value, attrReg: 'name|tabindex' });
				setValue();

				// 事件绑定
				bindEvent();
			}());

			// #endregion

			// #region 返回

			// 返回
			return extendObjects(control.public, {
				val: val,
				setChange: setChange
			});

			// #endregion

		};

	});
	// 范围控件
	createControl('range', function (collection) {

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // 样式类名
				className = collection.className,
				// 双手柄, 步长, 步长位数, 最小值, 最大值, 左值, 右值
				both, step, stepDigit, min, max, valueLeft, valueRight,
				// 获取用户自定义项
				options = control.getOptions(['both', 'min', 'max', 'value', 'step'], function (options) {
					var v;
					// 处理步长
					step = parseFloat(options.step);
					if (isNaN(step) || step === 0) step = 1;
					// 处理最小值
					min = parseFloat(options.min);
					if (isNaN(min)) min = 0;
					// 处理最大值
					max = parseFloat(options.max);
					if (isNaN(max)) max = 100;
					// 处理值
					v = convertValue(options.value);
					valueLeft = v[0];
					valueRight = v[1];
					// 双手柄
					both = !options.both || options.both === 'false' ? false : true;
					// 数据处理
					if (min > max) max = min;

					// 获取步长位数
					if (step.toString().indexOf('.') > -1) stepDigit = step.toString().split('.')[1].length;
					else stepDigit = 0;
				}),
				// 控件结构
				template = '<input type="text" maxlength="20" class="ud2-ctrl-textbox" />'
					+ '<div class="ud2-ctrl-power"><i class="ico ico-range-x"></i><i class="ico ico-solid-cancel"></i></div>'
					+ '<div class="' + className + '-list"><div class="' + className + '-end" /><div class="' + className + '-back" /></div>',
				// 获取初始化的控件对象
				current = control.current,
				// 控件对象
				$range = current.html(template),
				// 输入控件
				$value = $range.children('input'),
				// 开关容器
				$power = $value.next(),
				// 列表容器
				$list = $power.next(),
				// 左侧拖拽手柄
				$left = $a.clone().addClass(className + '-hand'),
				// 右侧拖拽手柄
				$right = $a.clone().addClass(className + '-hand'),
				// 按钮背景
				$back = $list.find('.' + className + '-back'),
				// 处理信息数据
				handleInfo = {
					// 按钮的最大位移
					max: 0,
					// 按钮的外容器宽度
					bw: 0,
					// 按钮的宽度
					w: 0,
					// 左侧按钮当前位移
					nl: 0,
					// 右侧按钮当前位移
					nr: 0
				},
				// 开启标记
				isOpen = false,
				// 回调函数
				controlCallbacks = {
					// 开启回调
					open: fnNoop,
					// 关闭回调
					close: fnNoop,
					// 值改变
					change: fnNoop
				};

			// #endregion

			// #region 私有方法

			// 强制转换value值
			// value[string]: 旧值
			// return[array]: 左右新值
			function convertValue(value) {
				var valueLeft = null, valueRight = null;
				if (value !== void 0) value = ('' + value).split(','); else value = [0, 0];
				valueLeft = parseFloat(value[0]) || 0;
				valueRight = parseFloat(value[1]) || 0;
				return [valueLeft, valueRight];
			}
			// 更新处理信息控件值
			function updateHandleInfoValue() {
				handleInfo.nl = valueToPercent(valueLeft);
				if (both) handleInfo.nr = valueToPercent(valueRight);
			}
			// 更新处理信息尺寸
			function updateHandleInfoSize() {
				// 获取按钮宽度
				handleInfo.w = $left.outerWidth();
				// 计算出按钮的外容器宽度
				handleInfo.bw = $list.width(),
				// 计算出按钮的最大位移
				handleInfo.max = handleInfo.bw - handleInfo.w;
			}
			// 通过百分比来获取视觉坐标点
			// percent[number]: 百分比
			// return[number]: 视觉坐标点
			function percentToViewPos(percent) {
				return percent * handleInfo.max / handleInfo.bw * 100;
			}
			// 通过值量来获取该值所对应的百分比
			// value[number]: 当前值
			// return[number]: 该值对应的百分比
			function valueToPercent(value) {
				var move = (value - min) / (max - min);
				return move;
			}
			// 设置控件值，并更新显示属性
			// vl[number]: 控件的左侧值
			// vr[number]: 控件的右侧值
			function setValue(vl, vr) {
				var percentLeft, percentRight, inMin, inMax, valMin, valMax, val;
				// 判断当前值小于最小值或大于最大值
				if (vl < min) vl = min;
				if (vl > max) vl = max;
				// 让值存在于符合步长值集合中 (value = min + step * x);
				valueLeft = Math.round((vl - min) / step) * step + min;
				valueLeft = parseFloat(valueLeft.toFixed(stepDigit));
				if (valueLeft > max) valueLeft -= step;
				// 左侧手柄位置
				percentLeft = valueToPercent(valueLeft);
				$left.css('left', percentToViewPos(percentLeft) + '%');

				// 如果不是双手柄
				if (!options.both) {
					// 显示手柄和值
					$back.css('width', percentLeft * 100 + '%');
					$value.val(valueLeft);
					// 设置回调控件值
					val = valueLeft;
				}
				else {
					// 判断当前值小于最小值或大于最大值
					if (vr < min) vr = min;
					if (vr > max) vr = max;
					// 让值存在于符合步长值集合中 (value = min + step * x);
					valueRight = Math.round((vr - min) / step) * step + min;
					valueRight = parseFloat(valueRight.toFixed(stepDigit));
					if (valueRight > max) valueRight -= step;
					percentRight = valueToPercent(valueRight);
					$right.css({ 'left': percentToViewPos(percentRight) + '%' });

					// 显示手柄和值
					inMin = Math.min(percentLeft, percentRight);
					inMax = Math.max(percentLeft, percentRight);
					valMin = Math.min(valueLeft, valueRight);
					valMax = Math.max(valueLeft, valueRight);
					$left.css('z-index', valueLeft + 10000);
					$right.css('z-index', valueRight + 10000);
					$back.css({ 'left': inMin * 100 + '%', 'width': (inMax - inMin) * 100 + '%' });
					$value.val(valMin + ',' + valMax);
					// 设置回调控件值
					val = [valMin, valMax];
				}

				controlCallbacks.change.call(control.public, val);
			}

			// #endregion

			// #region 公共方法

			// 打开控件
			// return[ud2.range]: 返回选项控件
			function open() {
				if (!isOpen) {
					// 更新处理信息尺寸
					updateHandleInfoSize();
					if (!options.both) {
						setValue(valueLeft);
					} else {
						setValue(valueLeft, valueRight);
					}
					// 更新处理信息控件值
					updateHandleInfoValue();

					isOpen = true;
					$range.addClass('on');
					$power.addClass(prefixLibName + 'ctrl-power-on');

					controlCallbacks.open.call(control.public);
				}

				return control.public;
			}
			// 关闭控件
			// return[ud2.range]: 返回选项控件
			function close() {
				if (isOpen) {
					isOpen = false;
					$range.removeClass('on');
					$power.removeClass(prefixLibName + 'ctrl-power-on');

					controlCallbacks.close.call(control.public);
				}

				return control.public;
			}
			// 开关控件
			// return[ud2.range]: 返回选项控件
			function toggle() {
				if (isOpen) {
					close();
				} else {
					open();
				}
				return control.public;
			}
			// 获取或设置控件值
			// () 获取控件值
			// - return[number]: 返回控件值
			// - return[array]: 返回双控件值
			// (v) 设置控件值
			// - v[number, string, array]: 控件值
			// - return[ud2.number]: 返回该控件对象
			// (v, r) 设置控件值
			// - v[number]: 控件1值
			// - r[number]: 控件2值
			// - return[ud2.number]: 返回该控件对象
			function val(v, r) {
				if (v !== void 0) {
					v = convertValue(r !== void 0 ?
						[v, r].join(',') :
						type.isArray(v) ? v.join(',') : v);
					setValue(v[0], v[1]);
					return control.public;
				}
				else {
					if (!both) {
						return valueLeft;
					} else {
						var valMin = Math.min(valueLeft, valueRight),
							valMax = Math.max(valueLeft, valueRight);
						return [valMin, valMax];
					}
				}
			}

			// #endregion

			// #region 回调方法

			// 设置开启回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setOpen(fn) { controlCallbacks.open = fn; return control.public; }
			// 设置关闭回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setClose(fn) { controlCallbacks.close = fn; return control.public; }
			// 设置值改变回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[range]: 当前事件对象，方便链式调用
			function setChange(fn) { controlCallbacks.change = fn; return control.public; }

			// #endregion

			// #region 事件处理

			// 移动手柄移动计算当前值
			// now[number]: 移动前的手柄位置值
			// move[number]: 方向移动的大小
			// return[number]: 通过移动量计算出当前值
			function moveHandleToValue(now, move) {
				var // 当前移动量
					n = now * handleInfo.max + move,
					// 当前值
					v = null;

				if (n < 0) n = 0;
				if (n > handleInfo.max) n = handleInfo.max;
				v = parseFloat(((max - min) * n / handleInfo.max + min).toFixed(stepDigit));
				v = isNaN(v) ? min : v;
				return v;
			}
			// 左侧手柄移动事件
			// move[point]: 触点移动数据对象
			function leftMove(move) {
				if (!options.both) {
					setValue(moveHandleToValue(handleInfo.nl, move.x));
				}
				else {
					setValue(moveHandleToValue(handleInfo.nl, move.x), valueRight);
				}
			}
			// 左侧手柄触点抬起事件
			function leftUp() {
				handleInfo.nl = valueToPercent(valueLeft);
			}
			// 右侧手柄移动事件
			// move[point]: 触点移动数据对象
			function rightMove(move) {
				setValue(valueLeft, moveHandleToValue(handleInfo.nr, move.x));
			}
			// 右侧手柄触点抬起事件
			function rightUp() {
				handleInfo.nr = valueToPercent(valueRight);
			}
			// 输入框获取焦点
			function inputFocus() {
				callbacks.ctrlClose.fire($range);
				open();
			}
			// 输入框键盘按下事件
			// event[event]: 事件对象
			function inputKeyDown(event) {
				if (event.keyCode === 13) $value.blur();
			}
			// 输入框失去焦点事件
			function inputBlur() {
				var val = convertValue($value.val());
				updateHandleInfoSize();
				setValue(val[0], val[1]);
				updateHandleInfoValue();
			}
			// 事件绑定
			function bindEvent() {
				// 控件开关事件绑定
				event($power).setTap(toggle);
				event($left, { stopPropagation: true }).setDown(updateHandleInfoSize).setPan(leftMove).setUp(leftUp);
				event($right, { stopPropagation: true }).setDown(updateHandleInfoSize).setPan(rightMove).setUp(rightUp);
				// 页面尺寸发生改变时，重新计算手柄位置
				callbacks.pageResize.add(function () {
					updateHandleInfoSize();
					setValue(valueLeft, valueRight);
				});
				$value.on('focus', inputFocus).on('keydown', inputKeyDown).on('blur', inputBlur);
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 手柄显示
				$back.after($left);
				if (both) $back.after($right);

				// 控件初始化
				control.origin.after($range);
				control.origin.remove();
				control.transferStyles();
				control.transferAttrs({ accept: $value, attrReg: 'name|tabindex' });

				// 设置自动关闭方法
				control.autoClose = close;

				// 更新数据
				updateHandleInfoValue();
				updateHandleInfoSize();
				setValue(valueLeft, valueRight);

				// 事件绑定
				bindEvent();
			}());

			// #endregion

			// #region 返回

			// 返回
			return extendObjects(control.public, {
				val: val,
				setOpen: setOpen,
				setClose: setClose,
				setChange: setChange
			});

			// #endregion

		};

	});

	// #endregion 

	// #region ud2 初始化及返回参数

	// 初始化
	(function init() {
		// 当文档加载完成时的回调方法
		$dom.ready(function () {
			// 获取 body 对象
			$body = $('body');

			// 如果是 Safari 浏览器则为 body 添加 touchstart 事件监听
			// 用途是解决 :hover :active 等伪类选择器延迟的问题
			if (support.safari) document.body.addEventListener('touchstart', $.noop);
			// 执行 PageReady 的回调函数
			callbacks.pageReady.fire();
			// 网页加载完成标记
			pageLoaded = true;

			// 当用户触碰屏幕且未触碰任何有价值(无效触碰)控件时，执行页面触碰按下的事件回调
			// 用途是解决部分控件当触碰控件外时执行相应回调方法
			$dom.bind(EVENT_DOWN, function (event) {
				var typeName = 'ctrlCloseEvent', type = event.type, domType = $dom.data(typeName);
				if (!domType || type === domType) {
					$dom.data(typeName, type);
					callbacks.ctrlClose.fire(event.target);
				}
				if (type === 'mousedown') $dom.data(typeName, null);
			});
		});

		// 窗口尺寸改变事件
		$win.bind('resize orientationchange', function () {
			callbacks.pageResize.fire();
		});

		// 当页面读取完成时，创建全部控件
		callbacks.pageReady.add(ud2.controlCreate);
	}());

	//(function () {
	//	var oldAppend = $.fn.append;
	//	$.fn.append = function () {
	//		var args = arguments[0];
	//		if (args && args["ud2"]) {
	//			console.log('a')
	//			oldAppend.apply(this, args.current());
	//		}
	//	}
	//}());

	// 返回控件
	return extendObjects(ud2, {
		type: type
	});

	// #endregion

}(window, jQuery));
