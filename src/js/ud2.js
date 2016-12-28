/// <reference path="../../vendor/js/jquery.js" />

if (typeof jQuery === 'undefined') throw new Error('ud2库需要JQuery支持');
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
		// 库属性前缀
		prefixLibName = libName + '-',
		// 样式属性前缀集合
		// 有效集合 {1-4}
		prefixStyles = ' -webkit- -moz- -o- -ms- '.split(' '),

		// 正则表达式
		// 日期正则表达式
		// 可以匹配xxxx(-|.|/)x{1,2}(-|.|/)x{1,2}
		REGEX_DATE = /^(?:[12]\d{3}([\.\-\/])(?:(?:0?[13578]|1[02])\1(?:0?[1-9]|[12]\d|3[01])|(?:0?[469]|11)\1(?:0?[1-9]|[12]\d|30)|0?2\1(?:0?[1-9]|1\d|2[0-8]))$|[12]\d(?:[02468][048]|[13579][26])([\.\-\/])(?:(?:0?[13578]|1[02])\2(?:0?[1-9]|[12]\d|3[01])|(?:0?[469]|11)\2(?:0?[1-9]|[12]\d|30)|0?2\2(?:0?[1-9]|1\d|2[0-9])))$/,
		// 邮箱正则表达式
		REGEX_MAIL = /^([\w-\.]+)@(([\w-]+\.)+)([a-zA-Z]{2,4})$/,
		// 手机号码正则表达式
		REGEX_PHONE = /^[1][3458][0-9]{9}$/,
		// 身份证正则表达式
		// 此表达式未添加地区判断与补位运算
		REGEX_IDENTITYCARD = /^(11|12|13|14|15|21|22|23|31|32|33|34|35|36|37|41|42|43|44|45|46|50|51|52|53|54|61|62|63|64|65|71|81|82|97|98|99)[0-9]{4}((?:19|20)?(?:[0-9]{2}(?:(?:0[13578]|1[12])(?:0[1-9]|[12][0-9]|3[01])|(?:0[469]|11)(?:0[1-9]|[12][0-9]|30)|02(?:0[1-9]|1[0-9]|2[0-8]))|(?:[02468][048]|[13579][26])0229)[0-9]{3}[\dxX])$/,
		// 登录名正则表达式
		REGEX_LOGINNAME = /^[a-zA-Z][a-zA-Z0-9]+$/,
		// 百分数正则表达式
		REGEX_PERCENT = /^(100|([0-9]|[1-9][0-9])(\.[0-9]+)?)%$/,
		// 非负数正则表达式
		REGEX_NONNEGATIVE = /^([0-9]|[1-9][0-9]+)(\.[0-9]+)?$/,

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
		KEY_DOWN = 'keydown',
		KEY_PRESS = 'keypress',
		KEY_UP = 'keyup',
		FOCUS = 'focus',
		BLUR = 'blur',
		CLICK = 'click',
		// 触碰事件组合
		EVENT_DOWN = [POINTER_DOWN, TOUCH_START, MOUSE_DOWN].join(' '),
		// 定位常量
		POS_CENTER = 'center', POS_FULL = 'fullscreen',
		POS_TOPLEFT = 'top-left', POS_TOPRIGHT = 'top-right',
		POS_BOTTOMLEFT = 'bottom-left', POS_BOTTOMRIGHT = 'bottom-right',
		POS_TOPCENTER = 'top-center', POS_BOTTOMCENTER = 'bottom-center',
		// 样式常量
		CSS_ON = 'on', CSS_EMPTY = 'empty', CSS_VALUE = 'value',
		CSS_DISABLED = 'disabled', CSS_SELECTED = 'selected', CSS_CHECKED = 'checked',
		// 键盘编码
		KEYCODE = {
			'A': 65, 'B': 66, 'C': 67, 'D': 68, 'E': 69, 'F': 70, 'G': 71,
			'H': 72, 'I': 73, 'J': 74, 'K': 75, 'L': 76, 'M': 77, 'N': 78,
			'O': 79, 'P': 80, 'Q': 81, 'R': 82, 'S': 83, 'T': 84,
			'U': 85, 'V': 86, 'W': 87, 'X': 88, 'Y': 89, 'Z': 90,
			'LEFT': 37, 'UP': 38, 'RIGHT': 39, 'DOWN': 40,
			'KEY0': 48, 'KEY1': 49, 'KEY2': 50, 'KEY3': 51, 'KEY4': 52, 'KEY5': 53,
			'KEY6': 54, 'KEY7': 55, 'KEY8': 56, 'KEY9': 57, '`': 192, 'BACK': 8,
			'NUM0': 96, 'NUM1': 97, 'NUM2': 98, 'NUM3': 99, 'NUM4': 100,
			'NUM5': 101, 'NUM6': 102, 'NUM7': 103, 'NUM8': 104, 'NUM9': 105,
			'ENTER': 13, 'NUM+': 107, 'NUM-': 109, 'NUM*': 106, 'NUM/': 111,
			'-': 189, '=': 187, ',': 188, '.': 190, '/': 191, '\\': 220,
			'SHIFT': 16, 'CTRL': 17, 'ALT': 18, 'CAPS': 20, 'TAB': 9,
			'[': 219, ']': 221, ';': 186, '\'': 222,
			'F1': 112, 'F2': 113, 'F3': 114, 'F4': 115, 'F5': 116, 'F6': 117,
			'F7': 118, 'F8': 119, 'F9': 120, 'F10': 121, 'F11': 122, 'F12': 123
		},
		// 状态名称
		STATE_NAME = ['normal', 'info', 'success', 'warning', 'danger'],
		// 样式名称
		STYLE_NAME = ['simple', 'standard', 'custom'],
		// 定位默认长度
		NORMAL_LENGTH = 12,

		// 用于克隆的空jQuery对象
		$div = $('<div />'),
		$a = $('<a />'),
		$span = $('<span />'),

		// 空方法
		fnNoop = function () { },

		// 用于转换abcDef到abc-def模式的正则表达式
		attrTranslateRegex = /(^[a-z0-9]{1,}|[A-Z][a-z0-9]{0,})/g,
		// 用于存放通过属性名称转换后得到的结果的数组
		// 目的是为了减少正则匹配的调用，以便减少不必要的系统资源损失
		attrTranslateGroup = {},

		// 标记页面是否加载完成
		pageLoaded = false,
		// 回调对象
		callbacks = {
			// 页面完成加载时的回调对象
			pageReady: $.Callbacks(),
			// 页面尺寸改变时的回调对象
			pageResize: $.Callbacks(),
			// 控件完全关闭的回调对象
			ctrlClose: $.Callbacks(),
			// 文档发生按键按下的回调对象
			keyDown: $.Callbacks(),
			// 文档发生按键抬起的回调对象
			keyUp: $.Callbacks()
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
				return {}.toString.call(obj) === '[object ' + type + ']';
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
		// 判断传入参数是否为一个布尔值boolean 
		// typeValue[object]: 判断变量
		// return[bool]: 返回一个布尔值，此布尔值表示传入的typeValue参数是否为布尔值
		function isBoolean(typeValue) {
			return isType("Boolean")(typeValue);
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
		// 判断传入参数是否为一个时间对象
		// typeValue[object]: 判断变量
		// return[bool]: 返回一个布尔值，此布尔值标识传入的typeValue参数是否为时间对象
		function isDatetime(typeValue) {
			return typeValue instanceof Date;
		}
		// 返回对象
		return {
			isType: isType,
			isObject: isObject,
			isFunction: isFunction,
			isString: isString,
			isBoolean: isBoolean,
			isNumber: isNumber,
			isDatetime: isDatetime,
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
			return type.isNaturalNumber(value) ? +value : 0;
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
			return REGEX_PHONE.test(text);
		}
		// 检测字符串是否符合邮箱规范
		// text[string]: 待检测的字符串
		// return[bool]: 是否符合邮箱规范
		function isMail(text) {
			text = textTypeHandler(text);
			return REGEX_MAIL.test(text);
		}
		// 检测字符串是否符合日期规范
		// text[string]: 待检测的字符串
		// return[bool]: 是否符合日期规范
		function isDate(text) {
			text = textTypeHandler(text);
			return REGEX_DATE.test(text);
		}

		// 检测字符串是否符合用户名规范
		// text[string]: 待检测的字符串
		// return[bool]: 是否符合用户名规范
		function isLoginName(text) {
			text = textTypeHandler(text);
			return REGEX_LOGINNAME.test(text);
		}
		// 检测字符串是否符合身份证规范
		// text[string]: 待检测的字符串
		// return[bool]: 是否符合身份证号规范
		function isIdentityCard(text) {
			text = textTypeHandler(text);
			text = text.toUpperCase();
			if (REGEX_IDENTITYCARD.test(text)) {
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
			u = window.navigator.userAgent, ipod, ipad, iphone, mac;

		// 判断是否为IPAD
		ipad = u.match(/ipad/i);
		support.ipad = ipad && ipad[0].toLowerCase() === 'ipad',
		// 判断是否为IPHONE
		iphone = u.match(/iphone/i);
		support.iphone = iphone && iphone[0].toLowerCase() === 'iphone',
		// 判断似乎否为手持设备
		ipod = u.match(/ipod/i);
		support.ipod = ipod && ipod[0].toLowerCase() === 'ipod',
		// 判断是否为MAC
		mac = u.match(/macintosh/i);
		support.mac = mac && mac[0].toLowerCase() === 'macintosh',
		// 判断是否为Safari浏览器
		support.safari = ipad || iphone || mac;
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
	// 对象合并
	// 将两个对象依次合并，并返回合并后的新对象
	// objA[object]: 第一个待合并的对象
	// objB[object]: 第二个待合并的对象
	// return[object]: 返回合并后的新对象
	function mergeObjects(objA, objB) {
		var merge = {};
		extendObjects(merge, objA);
		extendObjects(merge, objB);
		return merge;
	}
	// 对象克隆
	// 将传入对象克隆一个新对象，并返回
	// source[object]: 待克隆的对象
	// return[object]: 返回克隆后的新对象
	function cloneObjects(source) {
		return extendObjects({}, source);
	}
	// 属性设计器
	// getter[function]: 设置getter处理方法
	// setter[function]: 设置setter处理方法
	// return[function]: 属性设计器所返回的属性处理方法
	function propertier(getter, setter) {
		return function () {
			var args = arguments, len = args.length;
			if (len === 0 && getter) {
				return getter.apply(this, args);
			}
			else if (setter) {
				return setter.apply(this, args);
			}
		};
	}
	// 获取当前屏幕状态
	// return[number]: 返回当前的屏幕状态
	// - 0: phone screen
	// - 1: small screen
	// - 2: middle screen
	// - 3: large screen
	function deviceScreenState() {
		var state = window.getComputedStyle(window.document.documentElement, '::before').getPropertyValue('content').replace(/(\"|\')/g, '');
		switch (state) {
			case 'p': return 0;
			case 's': return 1;
			case 'm': return 2;
			case 'l': return 3;
		}
	}

	// #endregion

	// #region ud2 库私有方法


	var // 为未命名控件生成ud2-id属性值
		// 生成的id从编号0开始顺延
		createControlID = (function () {

			var // ID种子    子元素种子
				idSeed = 0, subSeed = 0;

			return function (subSeedName) {
				if (subSeedName) {
					return prefixLibName + subSeedName + '-' + subSeed++;
				}
				else {
					return prefixLibName + idSeed++;
				}
			};

		}()),
		// 获取className的短写法
		// cls[string]: 控件当前的类名
		// return[function]: 返回当前控件用于生成className的方法
		getClassName = function (cls) {
			return function cn(str, point) {
				str = str || '';
				point = point === void 0 ? false : point;
				return (point ? '.' : '') + cls + '-' + str;
			};
		};

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

		function getOption(name) {
			var opt, i, l;
			if (type.isArray(name)) {
				i = 0; l = name.length;
				for (; i < l; i++) {
					opt = getOption(name[i]);
					if (opt !== void 0) return opt;
				}
			}
			else {
				name = String(name);
				opt = control.userOptions[name];
				if (opt === void 0) opt = control.getOriginAttr(name, 1);
				if (opt === void 0) opt = control.getOriginAttr(name);
				return opt;
			}
		}

		if (len === 2) {
			arr = args[0];
			callbacks = args[1];
			if (type.isArray(arr) && type.isFunction(callbacks)) {
				options = {};

				arr.forEach(function (name) {
					options[type.isArray(name) ? name[0] : name] = getOption(name);
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
	// 通过参数获取坐标值
	// val[array, object, string, number]: 待转换的值
	// bX[number]: 转换不成功时默认的x值
	// bY[number]: 转换不成功时默认的y值
	// return[object]: 转换后的坐标值
	function getCoordinate(val, bX, bY) {
		if (type.isArray(val) && val.length === 2) {
			val = {
				x: val[0], y: val[1]
			};
		}
		else if (type.isObject(val)) {
			val = {
				x: val.x || val.width || val.w, y: val.y || val.height || val.h
			};
		}
		else if (type.isString(val)) {
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
		else if (type.isNumber(val)) {
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
	// 参数转数组
	// args[arguments]: 待转换的参数
	function argsToArray(args) {
		return Array.prototype.slice.call(args);
	}
	// 将传入参数强制转换为jQuery对象
	// jq[jQuery, string, object]: 待转换值
	// return[jQuery]: 转换后的jQuery对象
	function convertToJQ(jq) {
		if (!type.isJQuery(jq)) jq = $(jq);
		return jq;
	}
	// 将传入的表格强制转换为二维数组
	// table[jQuery, string, object]: 待转换值
	// return[array]: 转换后的二维数组
	function convertTableToArray(table) {
		var $table = convertToJQ(table),
			$tr = $table.find('tr'), $td = $table.find('td'), datas = [];

		// !! 解决colspan与rowspan的问题，目前的解决方式采用复制单元格的值
		$td.filter('[colspan]').each(function () {
			var $me = $(this), cs = parseInt($me.attr('colspan')),
				i, l;

			$me.removeAttr('colspan');
			if (cs > 1) {
				for (i = 0, l = cs - 1; i < l; i++) {
					$me.after($me.clone());
				}
			}
		});
		$td.filter('[rowspan]').each(function () {
			var $me = $(this), rs = parseInt($me.attr('rowspan')),
				i, l, index, pIndex, $p;

			$me.removeAttr('rowspan');
			if (rs > 1) {
				for (i = 0, l = rs - 1; i < l; i++) {
					$p = $me.parent();
					pIndex = $p.index();
					index = $me.index();
					if (index === 0) {
						$tr.eq(pIndex + i + 1).prepend($me.clone());
					}
					else {
						$tr.eq(pIndex + i + 1).children().eq(index - 1).after($me.clone());
					}
				}
			}
		});

		// 获取数据
		$tr.each(function () {
			var d = [], parentNodeName = $tr.parent().prop('nodeName').toLowerCase();
			$(this).children().each(function () {
				var $td = $(this),
					datagrid = prefixLibName + 'datagrid-',
					dataType = $td.attr(datagrid + 'data-type'),
					cellType, cellAlign, cellWidth, cellMode,
					opt = {};

				opt.value = $td.html();
				if (dataType) opt.type = dataType;
				if (parentNodeName === 'thead') {
					cellType = $td.attr(datagrid + 'cell-data-type');
					cellAlign = $td.attr(datagrid + 'cell-align');
					cellWidth = $td.attr(datagrid + 'cell-width');
					cellMode = $td.attr(datagrid + 'cell-mode');
					if (cellType) opt.cellType = cellType;
					if (cellAlign) opt.cellAlign = cellAlign;
					if (cellWidth) opt.cellWidth = cellWidth;
					if (cellMode) opt.cellMode = cellMode;
				}

				d.push(opt);
			});
			datas.push(d);
		});
		return datas;
	}

	// 生成控件可支持的样式枚举
	// [...string]: 可支持的样式名称
	function createStyle() {
		var arr = arguments, len = arr.length, i = 0, style = {};
		for (; i < len; i++) {
			style[arguments[i]] = arguments[i];
		}
		return style;
	}
	// 属性值的布尔检测
	// val[object]: 待检测的值
	// defaultVal[bool]: 默认为是或否
	// return[bool]: 返回检测后的状态
	function attrBoolCheck(val, defaultVal) {
		if (val === void 0) {
			return defaultVal;
		}
		else {
			if (val === 'true' || val === '1') return true;
			else if (val === 'false' || val === '0') return false;
			return !!val;
		}
	}
	// 获取属性值
	// $element[jQuery]: 待检测的元素
	// attrName[string]: 待检测的属性名
	// prefixName[string]: 属性名前缀
	// defaultVal[bool]: 当不存在值时给定的默认值
	// return[string]: 返回获取到的属性值
	function attrValue($element, attrName, prefixName, defaultVal) {
		var val;
		$element = convertToJQ($element);
		val = $element.attr(attrName);
		if (val === void 0 && prefixName) val = $element.attr(prefixName + '-' + attrName);
		if (val === void 0) val = defaultVal;
		return val;
	}

	// #endregion

	// #region ud2 库事件

	// 用于触摸笔、触碰、鼠标等方式操作元素的事件处理
	// elements[string, jQuery]: jQuery对象或可生成jQuery对象的字符串
	// userOptions[object]: 用户参数
	// - (?) stopPropagation[bool]: 是否阻止事件向外冒泡，默认为false
	// - (?) tapMaxTime[number]: tap的最大时间间隔，默认值为300(ms)
	// - (?) swipeMaxTime[number]: number的最大时间间隔，默认值为500(ms)
	// - (?) pointerValidLength[number]: 触点tap、press事件有效长度
	// return[event]: 返回一个事件公开方法对象
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
				pointerValidLength: 10
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
		function setPan(fn) {
			callbacks.pan = fn;
			return eventObj;
		}
		// 设置短按回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setTap(fn) {
			callbacks.tap = fn;
			return eventObj;
		}
		// 设置长按回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setPress(fn) {
			callbacks.press = fn;
			return eventObj;
		}
		// 设置快速左滑动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setSwipeLeft(fn) {
			callbacks.swipeLeft = fn;
			return eventObj;
		}
		// 设置快速右滑动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setSwipeRight(fn) {
			callbacks.swipeRight = fn;
			return eventObj;
		}
		// 设置快速上滑动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setSwipeTop(fn) {
			callbacks.swipeTop = fn;
			return eventObj;
		}
		// 设置快速下滑动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setSwipeBottom(fn) {
			callbacks.swipeBottom = fn;
			return eventObj;
		}
		// 设置触点按下时的回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setDown(fn) {
			callbacks.down = fn;
			return eventObj;
		}
		// 设置触点抬起时的回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// - fn(eventObj)
		//   eventObj[eventObj]: 事件event对象
		// return[event]: 当前事件对象，方便链式调用
		function setUp(fn) {
			callbacks.up = fn;
			return eventObj;
		}

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
			// ?? 取消此方法的使用，原使用在 ??#1处
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

			function preventHandler(event) {
				var $target = $(event.target), targetName = $target.prop('tagName').toLowerCase();
				if (targetName !== 'input' && targetName !== 'textarea') {
					event.preventDefault();
				}
			}

			// pointerDown事件触发函数
			// event[eventObject]: 事件对象
			function pointerDown(event) {
				preventHandler(event);
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
				event.preventDefault();
				if (stopPropagation) event.stopPropagation();

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
				preventHandler(event);
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
				// 阻止浏览器事件
				event.preventDefault();
				if (stopPropagation) event.stopPropagation();

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
				event.preventDefault();
				if (stopPropagation) event.stopPropagation();


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
				for (; i < pLen; i++) if (parents.eq(i).attr(prefixLibName + 'scroll-runing') === '1') {
					isParentsScrolling = true; break;
				}

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
					absMove = {
						x: Math.abs(move.x), y: Math.abs(move.y)
					};

				// 如果抬起的是第一次按压的触点
				if (first.id === id) {
					interval = new Date() - first.time; first.id = null; first.time = null;
				}

				// 确定是否为第一次触碰点的弹起操作
				if (interval) {
					// 如果x或y方向移动距离不超过pointerValidLength
					if (absMove.x < pointerValidLength && absMove.y < pointerValidLength) {
						// 如果外层滚动条未滚动
						if (!isParentsScrolling) {
							// 检测是否tap方式
							// 存在一个按压时间，且时间小于tapMaxTime
							if (interval < tapMaxTime) {
								// ??#1 temporaryMask();
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
						'-ms-touch-action': 'none',
						'touch-action': 'none'
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
						'touch-action': 'auto'
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
	// elements[string, jQuery]: jQuery对象或可生成jQuery对象的字符串
	// return[eventMouseWheel]: 返回一个事件公开方法对象
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
		function setScroll(fn) {
			callbacks.scroll = fn;
			return eventObj;
		}
		// 设置拖动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// return[object]: 当前事件对象，方便链式调用
		function setDown(fn) {
			callbacks.down = fn;
			return eventObj;
		}
		// 设置拖动回调函数
		// 所回调的函数 this 指向事件触发的 jQuery 对象
		// fn[function]: 回调函数
		// return[object]: 当前事件对象，方便链式调用
		function setUp(fn) {
			callbacks.up = fn;
			return eventObj;
		}

		// #endregion

		// #region 事件处理对象和相关方法

		// 通过 origin 对象一个事件监听对象
		// origin[jQuery]: jQuery 对象
		function event(origin) {

			// #region 私有字段

			var // 事件状态 
				// true: 绑定 false: 解绑
				bindingState = false;

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
				if (!bindingState) {
					bindingState = true;
					origin.on(MOUSEWHEEL_NAME, mouseWheel);
				}
			}
			// 解绑事件
			function eventUnbind() {
				if (bindingState) {
					bindingState = false;
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
	// 用于快捷键绑定的事件处理
	// userOptions[object]: 用户参数
	// - (?) autoOn[bool]: 是否默认开启事件，默认为true
	// return[event]: 返回一个事件公开方法对象
	var eventKeyShortcut = function (userOptions) {

		// #region 私有字段

		var // 事件对象
			eventObj = {},
			// 默认开启
			autoOn,
			// 默认项
			options = getOptions({
				// 默认开启
				autoOn: true
			}, userOptions, function (options) {
				autoOn = options.autoOn;
			}),
			// 快捷键组
			keyGroup = {},
			// 连接字符串
			JOINSTR = '\uFF00',
			// 绑定状态
			bindingState = false;

		// #endregion

		// #region 公共方法

		// 添加快捷键
		function add(keyCode, callbacks, keyOptions) {
			var isCtrl = !keyOptions || keyOptions && keyOptions.isCtrl === void 0 ? 0 : keyOptions.isCtrl ? 1 : 0,
				isAlt = !keyOptions || keyOptions && keyOptions.isAlt === void 0 ? 0 : keyOptions.isAlt ? 1 : 0,
				isShift = !keyOptions || keyOptions && keyOptions.isShift === void 0 ? 0 : keyOptions.isShift ? 1 : 0,
				name = [keyCode, isCtrl, isAlt, isShift].join(JOINSTR);
			if (!keyGroup[name]) keyGroup[name] = callbacks;
			return eventObj;
		}
		// 移除快捷键
		function remove(keyCode, callbacks, keyOptions) {
			var isCtrl = !keyOptions || keyOptions && keyOptions.isCtrl === void 0 ? 0 : keyOptions.isCtrl ? 1 : 0,
				isAlt = !keyOptions || keyOptions && keyOptions.isAlt === void 0 ? 0 : keyOptions.isAlt ? 1 : 0,
				isShift = !keyOptions || keyOptions && keyOptions.isShift === void 0 ? 0 : keyOptions.isShift ? 1 : 0,
				name = [keyCode, isCtrl, isAlt, isShift].join(JOINSTR);
			if (keyGroup[name]) delete keyGroup[name];
			return eventObj;
		}

		// #endregion

		// #region 事件处理

		// 键盘按下事件
		function keyDown(event) {
			for (var i in keyGroup) {
				if (i === [event.keyCode, event.ctrlKey ? 1 : 0, event.altKey ? 1 : 0, event.shiftKey ? 1 : 0].join(JOINSTR)) {
					event.preventDefault();
					break;
				}
			}
		}
		// 键盘抬起事件
		function keyUp(event) {
			for (var i in keyGroup) {
				if (i === [event.keyCode, event.ctrlKey ? 1 : 0, event.altKey ? 1 : 0, event.shiftKey ? 1 : 0].join(JOINSTR)) {
					keyGroup[i]();
					break;
				}
			}
		}
		// 事件绑定
		function eventBind() {
			if (!bindingState) {
				bindingState = true;
				callbacks.keyDown.add(keyDown);
				callbacks.keyUp.add(keyUp);
			}
		}
		// 事件解绑
		function eventUnbind() {
			if (bindingState) {
				bindingState = false;
				callbacks.keyDown.remove(keyDown);
				callbacks.keyUp.remove(keyUp);
			}
		}

		// #endregion

		// #region 初始化

		// 初始化
		(function init() {
			if (autoOn) eventBind();
		}());

		// #endregion

		// #region 返回

		// 返回
		return extendObjects(eventObj, {
			add: add,
			remove: remove,
			on: eventBind,
			off: eventUnbind
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
			// 默认图标
			ico = ['', '\ued20', '\ued1e', '\ued21', '\ued1f'],
			// 迭代变量
			i = 0, len = stylesName.length;
		for (; i < len; i++) styles[stylesName[i]] = {
			name: stylesName[i], no: i, ico: ico[i]
		};
		return styles;
	}());
	// ud2库颜色对象
	var color = (function () {
		var // 颜色对象
			colors = {},
			// 颜色样式名称集合
			stylesName = ['red', 'orange', 'green', 'blue', 'yellow', 'teal', 'pink', 'violet', 'purple', 'brown', 'dark', 'grey', 'white'],
			// 迭代变量
			i = 0, len = stylesName.length;
		for (; i < len; i++) colors[stylesName[i]] = {
			name: 'c-' + stylesName[i], id: stylesName[i]
		};
		return colors;
	}());

	// ud2库公开对象
	// 此对象默认会成为window的属性
	var ud2 = (function () {
		var // 库公共对象
			ud2 = {
				// 初始化全部未初始化的控件
				// 在页面初始化完成后，会自动调用此方法
				createAllControl: function () {
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
				},
				// 库已准备完成时的回调方法
				ready: function (fn) {
					if (type.isFunction(fn)) {
						if (pageLoaded) fn();
						else callbacks.pageReady.add(fn);
					}
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
						return this;
					},
					// 将控件插入到目标元素内部的起始位置
					prependTo: function (jq) {
						insertContext(jq, function ($) {
							$.last().prepend(control.current);
						});
						return this;
					},
					// 将控件插入到目标元素的前面，作为其兄弟元素
					insertBefore: function (jq) {
						insertContext(jq, function ($) {
							$.last().before(control.current);
						});
						return this;
					},
					// 将控件插入到目标元素的后面，作为其兄弟元素
					insertAfter: function (jq) {
						insertContext(jq, function ($) {
							$.last().after(control.current);
						});
						return this;
					},
					// 控件样式
					style: styleHandler,
					// 获取控件对应的jQuery对象
					getCurrent: function () {
						return control.current;
					}
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
							attrTranslateGroup[name] = (name.match(attrTranslateRegex).join('-')).toString().toLowerCase();
						}
						return attrTranslateGroup[name];
					})();

					var attr = isNative ? name : collection.className + '-' + name;
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
				autoClose: fnNoop,
				// 控件移除
				remove: function () {
					var index = this.public.collection.indexOf(this), i;
					callbacks.ctrlClose.remove(autoClose);
					this.public.collection.splice(index, 1);
					delete this.public.collection[this.public.id];
					for (i in this.public) delete this.public[i];
					for (i in this) delete this[i];
				}
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
			if (jq.ud2) { jq = jq.getCurrent(); }
			else { jq = convertToJQ(jq); }
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
		// 控件样式操作
		// () 获取控件样式
		// - return[ud2.style.*]: 返回控件样式对象
		// (whichStyle) 设置控件样式
		// - whichStyle[ud2.style.*]: 控件样式对象
		// - return[control]: 返回当前控件对象
		function styleHandler(whichStyle) {
			if (whichStyle !== void 0) {
				for (var i in style) {
					control.style === style[i] && control.current.removeClass(style[i].name);
				}
				control.style = whichStyle;
				control.current.addClass(whichStyle.name);
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
	// ud2库扩展对象创建器
	// name[string]: 将创建出的对象绑定在库的名为name属性上
	// callbacks[function]: 创建完成后所执行的回调函数
	// (?) parent[object]: 如存在，将绑定到该对象的name属性上，而非ud2
	// return[object]: 返回创建完成的库扩展对象
	var creater = function (name, createHandler, parent) {
		// 强制createHandler的类型为function
		if (!type.isFunction(createHandler)) createHandler = fnNoop;

		function constructor() {
			return createHandler.apply(constructor, arguments);
		}

		// 将create方法绑定到扩展对象
		constructor.create = createHandler;
		// 向库或parent中公开
		if (!parent) {
			ud2[name] = constructor;
		}
		else {
			parent[name] = constructor;
		}

		// 返回创建后的对象
		return constructor;

	};
	// 创建一个控件类
	// name[string]: 控件类名称
	// callbacks[function]: 创建回调，用于对控件的初始化操作
	// return[function]: 创建控件的构造函数 
	var controlCreater = function (name, callbacks) {

		var // 获取一个空控件集合对象
			ctrlCollection = controlCollection(name),
			// 创建一个库扩展对象
			constructor = creater(name, function create() {
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
					case 0: {
						return create.call(constructor, void 0, void 0, {});
					}
					case 1: {
						if (type.isString(args[0]))
							return create.call(constructor, args[0], void 0, void 0);
						if (type.isJQuery(args[0]))
							return create.call(constructor, void 0, args[0], void 0);
						if (type.isObject(args[0]))
							return create.call(constructor, void 0, void 0, args[0]);
						return create.call(constructor);
					}
					case 2: {
						if (type.isString(args[0]) && (type.isJQuery(args[1]) || type.isString(args[1])))
							return create.call(constructor, args[0], args[1], void 0);
						if (type.isString(args[0]) && type.isObject(args[1]))
							return create.call(constructor, args[0], void 0, args[1]);
						if (type.isJQuery(args[0]) && type.isObject(args[1]))
							return create.call(constructor, void 0, args[0], args[1]);
						break;
					}
					case 3: {
						// !! 对id未进行重复性判断
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
			});

		// 执行创建控件回调，初始化控件
		callbacks(ctrlCollection, constructor);
		// 将控件绑定在ud2对象上
		if (ctrlCollection.name !== ctrlCollection.ctrlName) ud2[ctrlCollection.ctrlName] = constructor;

		// 公开属性
		constructor.collection = ctrlCollection.public;
		// 返回构造函数
		return constructor;

	};

	// 遮罩层
	var backmask = (function () {

		var // 遮罩对象
			backmaskObj = {},
			// 遮罩层内容对象
			$backmask = $('<div class="' + prefixLibName + 'backmask"></div>'),
			// 调用者
			callerCollection = [],
			// 开启状态
			openState = false;

		// 添加调用者
		function callerAdd(caller) {
			if (callerCollection.indexOf(caller) === -1) {
				callerCollection.push(caller);
				return true;
			}
			return false;
		}
		// 移除调用者
		function callerRemove(caller) {
			var index = callerCollection.indexOf(caller);
			if (index > -1) {
				callerCollection.splice(index, 1);
				return true;
			}
			return false;
		}

		// 开启遮罩层
		// caller[object]: 调用遮罩层的对象
		function open(caller) {
			if (callerAdd(caller)) $backmask.addClass(CSS_ON);
			return backmaskObj;
		}
		// 关闭遮罩层
		// caller[object]: 调用遮罩层的对象
		function close(caller) {
			if (callerRemove(caller) && !callerCollection.length) $backmask.removeClass(CSS_ON);
			return backmaskObj;
		}

		// 初始化
		(function init() {
			callbacks.pageReady.add(function () {
				$body.append($backmask);
			});
		}());

		// 返回
		return extendObjects(backmaskObj, {
			open: open,
			close: close
		});

	}());

	// #endregion

	// #region ud2 功能组件

	// 数据表功能组件
	var datatable = (function () {

		// #region 私有字段

		var // 数据表集合
			collection = [],
			// 数据类型
			dataType = {
				string: 'string', // 未知类型时的默认类型
				number: 'number',
				boolean: 'boolean',
				datetime: 'datetime'
			},
			// 类型常量
			TYPE_CELL = 'cell', TYPE_ROW = 'row', TYPE_COLUMN = 'column';

		// #endregion

		// #region 静态方法

		// 通过数据值获取对应的数据值类型
		// value[*]: 数据值
		// return[ud2.datatable.dataType]: 返回数据值类型
		function getDataTypeByValue(value) {
			switch (true) {
				case type.isString(value): { return dataType.string; }
				case type.isNumber(value): { return dataType.number; }
				case type.isBoolean(value): { return dataType.boolean; }
				case type.isDatetime(value): { return dataType.datetime; }
				default: { return dataType.string; }
			}
		}
		// 通过数据类型强制转换数据值，使数据值符合当前数据类型
		// value[*]: 数据值
		// valueType[ud2.datatable.dataType]: 数据值类型
		// return[*]: 返回转换后的数据值
		function convertValueByDataType(value, valueType) {
			if (value !== null) {
				switch (valueType) {
					case dataType.string: {
						if (!type.isString(value)) value = String(value);
						break;
					}
					case dataType.number: {
						if (!type.isNumber(value)) value = Number(value);
						if (isNaN(value)) value = null;
						break;
					}
					case dataType.boolean: {
						if (!type.isBoolean(value)) value = Boolean(value);
						break;
					}
					case dataType.datetime: {
						if (!type.isDatetime(value)) value = new Date(value);
						if (isNaN(value.valueOf())) value = null;
						break;
					}
					default: {
						return convertValueByDataType(value, dataType.string);
					}
				}
			}
			return value;
		}

		// #endregion

		// #region 内部对象

		// 数据列初始化
		// (title) 通过标题创建数据列
		// - title[string]: 数据列标题
		// (options) 通过参数对象创建数据列
		// - title[string]: 数据列标题
		// - type[ud2.datatable.dataType]: 值的数据类型
		// return[column]: 返回创建的数据列对象
		var column = function (options) {

			var // 列对象
				columnObj = { type: TYPE_COLUMN },
				// 列标题
				title,
				// 列的默认值类型，无指令类型为null，而非单元格默认的string类型
				valueType,
				// 单元格对象集合
				cellCollection = [];

			// 操作列标题
			// () 获取当前列标题
			// - return[string]: 返回当前列标题
			// (text) 设置当前列标题
			// - text[string]: 待设置的列标题
			// - return[column]: 返回数据列对象
			var titleOperate = propertier(function () {
				return title;
			}, function (text) {
				if (text !== null) title = String(text);
				else title = null;
				return columnObj;
			});
			// 操作列的默认值类型
			// () 获取当前列的默认值类型
			// - return[ud2.datatable.dataType]: 返回当前列的默认值类型
			// (mode) 设置当前列的默认值类型，设置该类型会影响到当前所有单元格对象的值类型
			// - mode[ud2.datatable.dataType]: 设置当前列的默认值类型
			// - return[column]: 返回数据列对象
			var dataTypeOperate = propertier(function () {
				return valueType;
			}, function (mode) {
				var i = 0, l = cellCollection.length;
				if (!dataType[mode]) mode = null;
				valueType = mode;
				for (; i < l; i++) cellCollection[i].dataType(valueType);
				return columnObj;
			});

			// 初始化
			(function init() {
				// 获取参数
				if (options && !type.isObject(options)) {
					titleOperate(options);
				}
				else {
					!options && (options = {});
					titleOperate(!options.title ? null : options.title);
					dataTypeOperate(options.type);
				}
			}());

			// 返回
			return extendObjects(columnObj, {
				cells: cellCollection,
				title: titleOperate,
				dataType: dataTypeOperate
			});

		};
		// 数据行初始化
		// (valueArr) 通过单元格对象或值的集合创建数据行
		// - valueArr[array]: 单元格对象或值的集合
		// (options) 通过参数对象创建数据行
		// - cells[array]: 单元格对象或值的集合
		// return[row]: 返回创建的数据行对象
		var row = function (options) {

			var // 行对象
				rowObj = { type: TYPE_ROW },
				// 单元格对象集合
				cellCollection = [];

			// 初始化单元格
			function initCell(cells) {
				var i, l, c;
				if (!type.isArray(cells)) cells = [];
				for (i = 0, l = cells.length; i < l; i++) {
					c = cells[i];
					if (type.isObject(c)) {
						if (c.type !== TYPE_CELL) c = cell(c);
						c.bindRow(rowObj);
						cellCollection.push(c);
					}
					else {
						cellCollection.push(cell({ value: c, row: rowObj }));
					}
				}
			}

			// 初始化
			(function init() {
				var cells,
					i, l, c;
				// 获取参数并初始化单元格
				if (options && type.isArray(options)) {
					initCell(options);
				}
				else {
					!options && (options = {});
					initCell(options.cells);
				}
			}());

			// 返回
			return extendObjects(rowObj, {
				cells: cellCollection
			});

		};
		// 数据单元格初始化
		// (value) 通过值创建单元格
		// - value[*]: 单元格的值
		// (options) 通过参数对象创建单元格
		// - value[*]: 单元格的值
		// - type[ud2.datatable.dataType]: 值的数据类型
		// return[cell]: 返回创建的单元格对象
		var cell = function (options) {
			var // 单元格对象
				cellObj = { type: TYPE_CELL, column: null, row: null },
				// 值   值数据类型
				value, valueType;

			// 操作当前值
			// () 获取当前值
			// - return[*]: 返回当前值
			// (val) 设置当前值为指定值
			// - val[*]: 待设置的值
			// - return[cell]: 返回单元格对象
			var valueOperate = propertier(function () {
				return value;
			}, function (val) {
				value = convertValueByDataType(val, valueType);
				return cellObj;
			});
			// 操作值类型
			// () 获取当前值的数据类型
			// - return[ud2.datatable.dataType]: 返回当前值的数据类型
			// (mode) 设置当前值的数据类型
			// - mode[ud2.datatable.dataType]: 待设置的值的数据类型
			// - return[cell]: 返回单元格对象
			var dataTypeOperate = propertier(function () {
				return valueType;
			}, function (mode) {
				if (!dataType[mode]) mode = null;
				valueType = mode;
				valueOperate(value);
				return cellObj;
			});
			// 绑定行对象
			// return[cell]: 返回单元格对象
			function bindRow(row) {
				if (row && row.type === TYPE_ROW && cellObj.row === null) {
					cellObj.row = row;
				}
				return cellObj;
			}
			// 绑定列对象
			// return[cell]: 返回单元格对象
			function bindColumn(column) {
				if (column && column.type === TYPE_COLUMN && cellObj.column === null) {
					cellObj.column = column;
				}
				return cellObj;
			}

			// 初始化
			(function init() {
				// 获取参数
				// 初始化类型和值
				// 当options为非对象参数，将options当作value参数执行
				// 否则按对象参数方式执行
				if (options && !type.isObject(options)) {
					value = options;
				}
				else {
					if (!type.isObject(options)) options = {};
					// 绑定行列对象
					cellObj.column = options.column || null;
					cellObj.row = options.row || null;
					// 绑定其他属性
					if (options.cellType) cellObj.cellType = options.cellType;
					if (options.cellAlign) cellObj.cellAlign = options.cellAlign;
					if (options.cellWidth) cellObj.cellWidth = options.cellWidth;
					if (options.cellMode) cellObj.cellMode = options.cellMode;

					// 获取数据值类型
					valueType = options.type;
					// !! 目前数组值和函数值在此解决，未支持数组值和函数值
					value = options.value === void 0
						|| type.isArray(options.value) || type.isFunction(options.value) ? null : options.value;
				}

				// 当值类型存在，则将值强制转换为复合类型的值
				// 若值类型不存在，则检测当前值所属的类型，并指定为值类型
				if (valueType) {
					valueOperate(value);
				}
				else {
					valueType = null; // !!! 对未设置数据类型的单元格标记为null，并采用string类型 getDataTypeByValue(value);
				}
			}());

			// 返回
			return extendObjects(cellObj, {
				val: valueOperate,
				dataType: dataTypeOperate,
				bindRow: bindRow,
				bindColumn: bindColumn
			});

		};

		// #endregion

		// #region 数据表构造方法

		// 数据表初始化
		// options[object]: 参数对象
		// - id[string]: 数据表ID(名称)
		// - columns[array]: 列对象集合
		//   - {title, type}: 列对象参数对象
		// - rows[array]: 行对象集合
		//   - []: 每一个数组对应一个行数据
		//     - <*>: 单元格的值
		//     - <object>: 单元格参数对象
		var constructor = creater('datatable', function (userOptions) {

			// #region 私有字段

			var // 数据表对象
				dtObj = {},
				// 数据表选项
				columns, rows, id,
				// 默认项
				options = getOptions({
					columns: [],
					rows: []
				}, userOptions, function (options) {
					// 初始化ID
					id = options.id || createControlID();
					// 初始化列参数
					if (!type.isArray(options.columns)) columns = [];
					else columns = options.columns;
					// 初始化行参数
					if (!type.isArray(options.rows)) rows = [];
					else rows = options.rows;
				}),
				// 行对象集合
				rowCollection = [],
				// 列对象集合
				columnCollection = [];

			// #endregion

			// #region 私有方法

			// 初始化行和列
			function initColumnsAndRows(columns, rows) {
				var i, l;
				// 获取列对象
				for (i = 0, l = columns.length; i < l; i++) columnAdd(columns[i]);
				// 获取行对象
				for (i = 0, l = rows.length; i < l; i++) rowAdd(rows[i]);
			}

			// #endregion

			// #region 公共方法

			// 添加数据列
			// (title) 通过标题创建数据列
			// - title[string]: 数据列标题
			// (options) 通过参数对象创建数据列
			// - title[string]: 数据列标题
			// - type[ud2.datatable.dataType]: 值的数据类型
			// return[ud2.datatable]: 返回该控件对象
			function columnAdd(options) {
				var cl = column(options), c;
				columnCollection.push(cl);
				// 在有数据情况下添加列，则补全其他行中的列单元格
				if (rowCollection.length > 0) {
					for (var i in rowCollection) {
						c = cell({ row: rowCollection[i], column: cl });
						cl.cells.push(c);
						rowCollection[i].cells.push(c);
					}
				}
				return dtObj;
			}
			// 添加数据行
			// (valueArr) 通过单元格对象或值的集合创建数据行
			// - valueArr[array]: 单元格对象或值的集合
			// (options) 通过参数对象创建数据行
			// - cells[array]: 单元格对象或值的集合
			// return[ud2.datatable]: 返回该控件对象
			function rowAdd(options) {
				var r = row(options),
					i = 0, rl = r.cells.length, cl = columnCollection.length, ct;

				// 加入单元格对象
				for (; i < rl; i++) {
					if (!columnCollection[i]) columnAdd();
					columnCollection[i].cells.push(r.cells[i]);
					r.cells[i].bindColumn(columnCollection[i]);
				}
				// 如果数据列的数量大于行中添加的单元格数量，则补全当前行中的单元格
				if (cl > rl) {
					for (; i < cl; i++) {
						ct = cell({ row: r, column: columnCollection[i] });
						r.cells.push(ct);
						columnCollection[i].cells.push(ct);
					}
				}
				// 向数据行中添加此行对象
				rowCollection.push(r);

				// 当传入的行数据中的列数量不统一时，进行单元格数据补全
				// 此项发生在本次添加的行中单元格的列数超过原数据行中的单元格数量
				completionCells();

				return dtObj;
			}
			// 移除数据列
			// (index) 通过数据列集合的索引号删除列
			// - index[number]: 数据列集合索引号
			// (columnObj) 通过数据列对象来删除列
			// - columnObj[column]: 数据列对象
			// return[ud2.datatable]: 返回该控件对象
			function columnRemove(whichColumn) {
				var index, r;
				if (type.isNaturalNumber(whichColumn)) {
					if (columnCollection[whichColumn]) {
						columnCollection.splice(whichColumn, 1);
						for (r = rowCollection.length - 1; r >= 0; r--) {
							rowCollection[r].cells.splice(whichColumn, 1);
							if (rowCollection[r].cells.length === 0) rowCollection.splice(r, 1);
						}
					}
				}
				else if (whichColumn && whichColumn.type === TYPE_COLUMN) {
					index = columnCollection.indexOf(whichColumn);
					if (index !== -1) return columnRemove(index);
				}
				return dtObj;
			}
			// 移除数据行
			// (index) 通过数据行集合的索引号删除行
			// - index[number]: 数据行集合索引号
			// (rowObj) 通过数据行对象来删除行
			// - rowObj[row]: 数据行对象
			// return[ud2.datatable]: 返回该控件对象
			function rowRemove(whichRow) {
				var index, r;
				if (type.isNaturalNumber(whichRow)) {
					if (rowCollection[whichRow]) {
						rowCollection.splice(whichRow, 1);
						for (r in columnCollection) columnCollection[r].cells.splice(whichRow, 1);
					}
				}
				else if (whichRow && whichRow.type === TYPE_ROW) {
					index = rowCollection.indexOf(whichRow);
					if (index !== -1) return rowRemove(index);
				}
				return dtObj;
			}
			// 数据填装
			// 1. 可以通过table元素的jQuery对象填装数据
			//    或通过table元素的字符串填装数据 
			//    或通过二维数组填装数据
			// 2. 可以将传入数据表(datatable)填装到此数据表中
			//    在用传入数据表填装内容时，会受到当前数据表的列参数限制
			// 填装数据会先清空旧数据
			function dataFill(datas) {
				var i, l;
				dataEmpty();
				switch (true) {
					case type.isArray(datas): {
						i = 0;
						l = datas.length;
						for (; i < l; i++) {
							if (type.isArray(datas[i]) || type.isObject(datas[i])) rowAdd(datas[i]);
						}
						break;
					}
					case type.isObject(datas) && datas.type === 'datatable': {
						datas.rows.forEach(function (row) {
							var arrRow = [];
							i = 0;
							l = Math.min(row.cells.length, columnCollection.length);
							for (; i < l; i++) arrRow.push({ value: row.cells[i].val(), type: columnCollection[i].dataType() });
							rowAdd(arrRow);
						});
						break;
					}
					default: {
						return dataFill(convertTableToArray(datas));
					}
				}
				return dtObj;
			}
			// 数据清空
			// return[ud2.datatable]: 返回该控件对象
			function dataEmpty() {
				var i = 0, l = rowCollection.length;
				for (; i < l; i++) rowRemove(0);
				return dtObj;
			}
			// 单元格数据补全
			function completionCells() {
				var // 行中字段最大数目 for循环的最大数目变动次数
					max = 0, changeMax = 0,
					// 循环i 循环j 补充量 行数 当前行的字段数量 单元格
					i, j, m, l = rowCollection.length, rcl, ct;

				for (i = 0; i < l; i++) {
					if (max !== rowCollection[i].cells.length) changeMax++;
					if (max < rowCollection[i].cells.length) {
						max = rowCollection[i].cells.length;
					}
				}

				if (changeMax > 1) {
					for (i = 0; i < l; i++) {
						rcl = rowCollection[i].cells.length;
						if (max > rcl) for (j = 0, m = max - rcl; j < m; j++) {
							ct = cell({ row: rowCollection[i], column: columnCollection[rcl + j] });
							rowCollection[i].cells.push(ct);
							columnCollection[rcl + j].cells.push(ct);
						}
					}
				}
			}
			
			// [*用于调试*]
			// 在控制台输出当前数据表的值和类型
			function debug() {
				var de = [], r = 0, m = 0, rl, ml, c;
				for (rl = rowCollection.length; r < rl; r++) {
					de[r] = [];
					for (m = 0, ml = rowCollection[r].cells.length; m < ml; m++) {	
						c = rowCollection[r].cells[m];
						de[r][m] = '[' + c.dataType() + '],' + c.val();
					}
				}
				console.table(de);
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 初始化行和列
				initColumnsAndRows(columns, rows);

				// 向集合添加当前控件
				collection.push(dtObj);
				// 将数据表对象放入集合
				if (id) collection[id] = dtObj;
			})();

			// #endregion

			// #region 返回

			// 返回数据表对象
			return ud2.extend(dtObj, {
				type: 'datatable',
				columns: columnCollection,
				rows: rowCollection,
				columnAdd: columnAdd,
				columnRemove: columnRemove,
				rowAdd: rowAdd,
				rowRemove: rowRemove,
				completion: completionCells,
				dataFill: dataFill,
				dataEmpty: dataEmpty,

				debug: debug
			});

			// #endregion

		});
		// 绑定数据类型对象到数据表控件
		constructor.dataType = dataType;
		// 绑定控件集合到数据表控件
		constructor.collection = collection;
		// 通过值获取值所对应的数据类型
		constructor.getDataType = getDataTypeByValue;
		// 将传入值的类型强制转换为传入的数据类型
		constructor.convertValue = convertValueByDataType;

		// #endregion

		// #region 返回

		// 返回构造器
		return constructor;

		// #endregion

	}());

	// #endregion

	// #region ud2 内容控件

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
			scrollObj = {}, cls = prefixLibName + 'scroll', cn = getClassName(cls),
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

				// 判断传入的鼠标滚轮滚动长度是否符合要求
				if (mouseWheelLength !== 'normal') {
					mouseWheelLength = !type.isNaturalNumber(mouseWheelLength) ? 'normal' : parseInt(mouseWheelLength);
				}
			}),
			// 滚动对象
			$scroll = convertToJQ(elements),
			// 滚动包裹容器
			$wrapper = $div.clone().addClass(cn('wrapper')),
			// 横滚动条
			$barHorizontal = $div.clone().addClass(cn('bar')),
			// 竖滚动条
			$barVertical = $barHorizontal.clone(),
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
				startMove: {
					x: 0, y: 0
				},
				// 触点上次的移动距离
				lastMove: {
					x: 0, y: 0
				}
			},
			// 是否正在滚动
			isScrolling = false,
			// 是否跟随
			isOplock = false,
			// 当滚动完成时执行强制停止回调定时器
			scrollEndTimer = null,
			// 触摸启动最小长度
			touchStartMinLength = 10,
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
				now: {
					x: 0, y: 0
				},
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
			ATTRNAME_IS_SCROLL = cn('runing');

		// #endregion

		// #region 私有方法

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
			return {
				x: x, y: y
			};
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
			scrollData.now = {
				x: x, y: y
			};

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
				if (scrollEndTimer) {
					window.clearTimeout(scrollEndTimer);
				}
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
		// 更新跟随控件位置
		function followerPosition() {
			if (followers.length > 0) for (var i in followers) followers[i].recountPosition();
		}

		// #endregion

		// #region 公共方法

		// 重计算滚动条滚动位置
		// (?) time[number]: 滚动条重置动画时间
		function recountPosition(time) {
			time = parseInt(time) || 0;
			getScrollData();
			translateMove(scrollData.now.x, scrollData.now.y, time);

			return scrollObj;
		}
		// 获取滚动条内容区域对象
		// return[jQuery]: 返回内容区域对象
		function getContent() {
			return $wrapper;
		}
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
		// 跟随状态操作
		// () 获取跟随状态
		// - return[bool]: 返回当前是否被跟随
		// (state) 设置跟随状态
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
			followerPosition();
			getScrollData();
			barOpen();

			var pos = getPosition();
			translateMove(pos.x, pos.y);

			mainPointer.moved = false;
			mainPointer.start = getTime();
			mainPointer.startMove = {
				x: scrollData.now.x, y: scrollData.now.y
			};
			mainPointer.lastMove = {
				x: 0, y: 0
			};
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
			mainPointer.lastMove = {
				x: x, y: y
			};

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
				moveLen = mouseWheelLength;

			followerPosition();
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
			followerPosition();
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
			if (options.barState === 1) {
				$scroll.on(MOUSE_ENTER, function () {
					getScrollData();
					mouseInBox = true;
				});
				$scroll.on([MOUSE_LEAVE, TOUCH_END].join(' '), function () {
					mouseInBox = false;
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
			var i, l = $scroll.length;

			// 超过一个元素时，则生成多个控件
			if (l > 1) {
				for (i = 1; i < l; i++) ud2.scroll($scroll.eq(i), userOptions);
				$scroll = $scroll.eq(0);
			}

			// 对象内部集合
			var $child = $scroll.contents();
			// 如果内部对象集合长度为0(说明$scroll内容为空)，则把$wrapper元素插入到$scroll内
			// 否则用$wrapper包裹所有内部对象，得到最新的包裹对象并提交给$wrapper
			if ($child.length === 0) {
				$scroll.append($wrapper);
			} else {
				$child.wrapAll($wrapper);
				$wrapper = $scroll.children(cn('wrapper', 1));
			}

			// 延续scroll盒的padding值
			// 让外盒的padding来模拟scroll盒的padding
			// (!HACK) 此处当$wrapper.css('padding')获取值的时候，EDGE浏览器获取的值为空
			// 进而分别试用top/bottom/left/right来获取padding值
			$wrapper.css('padding',
				$scroll.css('padding-top')
				+ ' ' + $scroll.css('padding-right')
				+ ' ' + $scroll.css('padding-bottom')
				+ ' ' + $scroll.css('padding-left'));

			// 对$scroll添加.ud2-scroll类(滚动条基础样式)
			$scroll.addClass(cls);

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
				$barVertical.css('display', 'block');
				$barHorizontal.css('display', 'block');
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
			followerUnbind: followerUnbind,
			recountPosition: recountPosition,
			getContent: getContent
		});

		// #endregion

	};

	// 选项卡组控件
	controlCreater('tabs', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = getClassName(cls),
			// 内容对象模版
			$contentTemplate = $div.clone().addClass(cn('content')),
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
		creater('page', function () {

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

			// 将值强制转换为符合pageType的类型的值
			// 默认值为ud2.tabs.pageType.html(0)
			// return[ud2.tabs.pageType]: pageType的类型的值
			function convertPageType(val) {
				if (val && val.type === 1 || type.isString(val) && val === 'url' || val === 1) return 1;
				if (val && val.type === 0 || type.isString(val) && val === 'html' || val === 0) return 0;
				return 0;
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
						$tab.addClass(CSS_ON);
						$content.addClass(CSS_ON);
						$tabLink.addClass(CSS_ON);
					}
					else {
						$tab.removeClass(CSS_ON);
						$content.removeClass(CSS_ON);
						$tabLink.removeClass(CSS_ON);
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

				if (len === 1 && type.isObject(argObj = args[0])) {
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

				pageType = convertPageType(pageType);
				name = name || createControlID(TYPE_PAGE_NAME);
				title = title || '未命名选项卡';
				details = details || (pageType === 1 ? 'about:blank' : '');
				btnClose = attrBoolCheck(btnClose, true);

				// 生成选项和描述内容对象
				$tab = $div.clone().addClass(cn('tab')).attr('title', title).append($span.clone().html(title));
				$tabLink = $div.clone().addClass(cn('menu-item')).attr('title', title).append($span.clone().html(title));
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
						break;
					}
				}

				// 通过此项设置让safari中的iframe正常滚动
				if (ud2.support.safari) {
					$content.css({
						'-webkit-overflow-scrolling': 'touch',
						'overflow-y': 'scroll'
					});
				}

			}());

			// 返回
			return extendObjects(pageObj, {
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

			var // 是否有菜单工具 布局方式 选项卡可滚动 选项卡自动移动 目录自动移动  高度     主题
				isMenu, layout, isTabScroll, isTabAutoMove, isMenuAutoMove, height, theme,
				// 获取用户自定义项
				options = control.getOptions([
					'layout', ['menu', 'isMenu'], 'height', 'theme',
					['tabScroll', 'isTabScroll'],
					['tabAutoMove', 'isTabAutoMove'],
					['menuAutoMove', 'isMenuAutoMove']
				], function (options) {
					// 初始化是否可以关闭
					isMenu = attrBoolCheck(options.menu, true);
					// 初始化选项卡是否可以滚动
					isTabScroll = attrBoolCheck(options.tabScroll, true);
					// 初始化选项卡是否可以自动移动
					isTabAutoMove = attrBoolCheck(options.tabAutoMove, true);
					// 初始化目录项是否可以自动移动
					isMenuAutoMove = attrBoolCheck(options.menuAutoMove, true);
					// 初始化是否自动填满父层
					height = options.height || null;
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
				$menuScroll = $('<div class="' + cn('menu-list') + ' empty" ' + cn(CSS_EMPTY) + '="这里是空的"><div class="' + cn('menu-inner') + '" /></div>'),
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
					change: fnNoop
				};

			// #endregion

			// #region 私有方法

			// 设置列表方向
			// direction[ud2.select.direction]: 方向值
			function setLayout(layoutNo) {
				// 移除旧CSS属性
				if(layout === 0) $tabs.removeClass(cn('top'));
				if (layout === 1) $tabs.removeClass(cn('bottom'));
				if (layout === 2) $tabs.removeClass(cn('left'));
				if (layout === 3) $tabs.removeClass(cn('right'));

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
					pageCollection.forEach(function (element) {
						if (layout === 0 || layout === 1)
							element.size = element.getTab().outerWidth();
						else
							element.size = element.getTab().outerHeight();
						scrollSize += element.size;
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
					type = attrValue(p, 'page-type', cls);
					name = attrValue(p, 'page-name', cls);
					title = attrValue(p, 'page-title', cls);
					content = p.html();
					btnClose = attrValue(p, 'page-btn-close', cls, 1);
					openState = attrBoolCheck(attrValue(p, 'page-open', cls, 0), 0);
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
					if (REGEX_PERCENT.test(h) || REGEX_NONNEGATIVE.test(h) || h === 'auto') {
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
					if (layout === 0 || layout === 1) size = page.getTab().width();
					else size = page.getTab().height();
					// 对尺寸整数化
					size = Math.ceil(size);
					if (layout === 0 || layout === 1) page.getTab().css('width', size);
					else page.getTab().css('height', size);
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
						$menuScroll.removeClass(CSS_EMPTY);
					}

					// 绑定事件
					e = $().add(page.getTab().children('span'));
					ce = $().add(page.getTab().find('i'));
					if (isMenu) {
						e = e.add(page.getTabLink().children('span'));
						ce = ce.add(page.getTabLink().find('i'));
					}
					page.event = event(e).setTap(function () { pageOpen(page); menuClose(); });
					page.closeEvent = event(ce).setTap(function () { pageRemove(page); });
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
						$menuScroll.addClass(CSS_EMPTY);
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
				$menu.removeClass(CSS_ON);
			}
			// 目录开关
			function menuToggle() {
				$menu.toggleClass(CSS_ON);
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

					tabBoxScroll = scroll($tabScroll, scrollOptions);
				}

				// 目录菜单
				if (isMenu) {
					event($menuBtn).setTap(menuToggle);
					menuBoxScroll = scroll($menuScroll, { barSize: 3, barColor: '#d5d5d5' });
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
			return extendObjects(control.public, {
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
	// 页码控件
	controlCreater('page', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = getClassName(cls);

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
					isMenu = attrBoolCheck(options.menu, true);
					// 初始化图标显示状态
					isIco = attrBoolCheck(options.ico, true);
					// 初始化文本显示状态
					isText = attrBoolCheck(options.text, true);
					// 当小图标与文本都隐藏时，默认显示文本
					if (!isIco && !isText) isText = true;
					// 初始化动态布局模式
					relayout = attrBoolCheck(options.relayout, true);
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
					change: fnNoop
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
				eventNum = event($num).setTap(function () {
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
				event($btns).setTap(function () {
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
					callbacks.pageResize.add(resize);
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
			return extendObjects(control.public, {
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
	// 数据网格控件
	controlCreater('datagrid', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = getClassName(cls),
			// CSS常量
			STR_LEFT = cn('left'), STR_CENTER = cn('center'), STR_RIGHT = cn('right'), STR_GRID = cn('grid'),
			STR_HEADER = cn('header'), STR_CONTENT = cn('content'), STR_FOOTER = cn('footer'),
			STR_CLS_ROW = cn('row', 1),
			// 回调常量
			RD = 'rowDeselected', RS = 'rowSelected',
			// 单元格对齐方式
			cellAlign = {
				// 左对齐
				left: 0,
				// 居中对齐
				center: 1,
				// 右对齐
				right: 2
			},
			// 列的排版模式
			columnMode = {
				// 默认排版
				normal: 0,
				// 响应排版
				flex: 1,
				// 左侧固定排版
				left: 2,
				// 右侧固定排版
				right: 3
			},
			// 数据列初始化默认参数
			columnDefaultOptions = {
				// 列标题
				title: '',
				// 单元格的数据类型
				type: null,
				// 当前宽度 number(px) | auto
				width: 120,
				// 单元格的最小宽度，通过flex压缩不能小于此宽度
				minWidth: 50,
				// 0 normal 1 flex 2 left 3 right
				mode: 1,
				// 是否可编辑
				edit: false,
				// 是否可排序
				sort: false,
				// 0 左侧 1 剧中 2 右侧
				align: 0
			},
			// 数据行初始化默认参数
			rowDefaultOptions = {

			};

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // elements数据源、jQuery数据源 或二维数组数据
				// 数据    头部数据    底部数据
				datas, datasHeader, datasFooter, 
				// 列参数对象集合 行参数对象集合 列默认参数 行默认参数    单元格高度 控件高度  鼠标滑上背景改变颜色 鼠标滑上时的背景颜色
				columnsInfo, rowsInfo, columnDefault, rowDefault, cellHeight, height, isHover, hoverColor,
				// 是否开启选中行 是否支持行多选    空容器占位文本 当前已选择的行序号集合
				isSelected, isSelectedMultiple, emptyText, selectedRows = [],
				// 获取用户自定义项
				options = control.getOptions([
					'datas', 'datasFooter', 'columns', 'columnDefault',
					'cellHeight', 'height', ['hover', 'isHover'], 'hoverColor',
					[CSS_SELECTED, 'isSelected'], ['selectedMultiple', 'isSelectedMultiple'],
					'emptyText'
				], function (options) {
					// 初始化单元格高度
					cellHeight = parseInt(options.cellHeight) || 34;
					// 初始化控件高度
					// 值为null，则取css高度
					height = options.height || null;
					// 初始化是否开启鼠标滑上背景改变颜色
					isHover = attrBoolCheck(options.hover, true);
					// 初始化鼠标滑上时的背景颜色
					hoverColor = options.hoverColor || '#EDF7FF';
					// 初始化选中行
					isSelected = attrBoolCheck(options.selected, false);
					// 初始化多选
					isSelectedMultiple = attrBoolCheck(options.selectedMultiple, true);
					// 初始化替换文本
					emptyText = options.emptyText || '此处没有任何数据';

					// 初始化传入数据
					initDatas(options.datas, options.datasFooter);
					// 初始化列默认对象
					initColumnDefault(options.columnDefault);
					// 初始化列对象
					initColumns(options.columns);
					// 初始化行对象
					initRows();
					// 初始化补全单元格
					initCompletionCells();
				}),
				// 控件结构
				template = '<div class="' + STR_LEFT + '">'
					+ '<div class="' + STR_HEADER + '"><div class="' + STR_GRID + '" /></div>'
					+ '<div class="' + STR_CONTENT + '"><div class="' + STR_GRID + '" /></div>'
					+ '<div class="' + STR_FOOTER + '"><div class="' + STR_GRID + '" /></div></div>'
					+ '<div class="' + STR_RIGHT + '">'
					+ '<div class="' + STR_HEADER + '"><div class="' + STR_GRID + '" /></div>'
					+ '<div class="' + STR_CONTENT + '"><div class="' + STR_GRID + '" /></div>'
					+ '<div class="' + STR_FOOTER + '"><div class="' + STR_GRID + '" /></div></div>'
					+ '<div class="' + STR_CENTER + '">'
					+ '<div class="' + STR_HEADER + '"><div class="' + STR_GRID + '" /></div>'
					+ '<div class="' + STR_CONTENT + '"><div class="' + STR_GRID + '" /></div>'
					+ '<div class="' + STR_FOOTER + '"><div class="' + STR_GRID + '" /></div></div>'
					+ '<div class="' +cn(CSS_EMPTY) + '"><div>' + emptyText + '</div></div>',
				// 获取初始化的控件对象
				current = control.current,
				// 控件对象
				$datagrid = current.html(template),
				// 区域容器
				$area = $datagrid.children(),
				// 空容器
				$noRow = $area.last(),
				// 左侧fixed容器
				$left = $area.eq(0),
				$leftArea = $left.children(),
				$leftHeader = $leftArea.eq(0),
				$leftContent = $leftArea.eq(1),
				$leftFooter = $leftArea.eq(2),
				$leftHeaderGrid = $leftHeader.children(),
				$leftContentGrid = $leftContent.children(),
				$leftFooterGrid = $leftFooter.children(),
				// 右侧fixed容器
				$right = $area.eq(1),
				$rightArea = $right.children(),
				$rightHeader = $rightArea.eq(0),
				$rightContent = $rightArea.eq(1),
				$rightFooter = $rightArea.eq(2),
				$rightHeaderGrid = $rightHeader.children(),
				$rightContentGrid = $rightContent.children(),
				$rightFooterGrid = $rightFooter.children(),
				// 主容器
				$center = $area.eq(2),
				$centerArea = $center.children(),
				$centerHeader = $centerArea.eq(0),
				$centerContent = $centerArea.eq(1),
				$centerFooter = $centerArea.eq(2),
				$centerHeaderGrid = $centerHeader.children(),
				$centerContentGrid = $centerContent.children(),
				$centerFooterGrid = $centerFooter.children(),
				// 按左中右添加容器集合
				// 集合内顺序为 0:content 1:header 2:footer 对应创建网格的mode参数
				leftGrid = [$leftContentGrid, $leftHeaderGrid, $leftFooterGrid],
				centerGrid = [$centerContentGrid, $centerHeaderGrid, $centerFooterGrid],
				rightGrid = [$rightContentGrid, $rightHeaderGrid, $rightFooterGrid],
				// 空行，用于克隆
				$emptyRow = $div.clone().addClass(cn('row')),
				// 空单元格，用于克隆
				$emptyCell = $div.clone().addClass(cn('cell')),
				// 滚动条控件	
				leftScroll, rightScroll, topScroll, bottomScroll, contentScroll,
				// 是否全部选中
				isAllSelected = false,
				// 控件回调
				controlCallbacks = {
					rowSelected: fnNoop,
					rowDeselected: fnNoop
				};

			// #endregion

			// #region 私有方法

			// 初始化传入数据
			// optionsData[array, string, jQuery]: options.data 传入数据参数
			function initDatas(optionsDatas, optionsDatasFooter) {
				var // 传入的数据是否符合jQuery对象
					isJQ = true,
					// 头部主体及底部容器
					$h, $b, $f,
					// 迭代变量
					i, j;

				datas = optionsDatas;

				// 如果传入参数为字符串或jQuery对象，则强制按照符合jQuery标准获取jQuery对象，并通过此对象创建数据表
				// 由jQuery对象创建数据表时，会将thead、tbody、tfoot分成三个数据表，分别存入datasHeader、datas、datasFooter
				// 否则传入的参数如果是二维数组或其他参数，则直接按照dataFill方法推入数据表中处理
				// 如果参数不存在，但存在control.origin元素时，则将此元素按照jQuery对象创建数据表的方式处理
				if (datas) {
					if (type.isString(datas) || type.isJQuery(datas)) {
						datas = convertToJQ(datas);
					}
					else {
						datas = datatable().dataFill(datas);
						isJQ = false;
					}
				}
				else if (control.origin) datas = convertToJQ(control.origin);
				else datas = datatable();
				// jQuery对象创建数据表时的处理方式
				if (isJQ) {
					$h = datas.find('thead');
					$b = datas.find('tbody');
					$f = datas.find('tfoot');
					datasHeader = datatable().dataFill($h);
					datas = datatable().dataFill($b);
					datasFooter = datatable().dataFill($f);
				}
				// 是否存在底部数据
				if (optionsDatasFooter) {
					datasFooter = datatable().dataFill(optionsDatasFooter);
				}
				// 底部数据是否存在行
				// 如果存在行，且底部数据行中的列数少于列参数的个数，则补全单元格
				if (datasFooter && datasFooter.columns.length < datas.columns.length) {
					for (i = 0, j = datas.columns.length - datasFooter.columns.length; i < j; i++) datasFooter.columnAdd();
				}
			}
			// 初始化列默认参数对象
			// optionColumnDefault[object]: options.columnDefault 传入列初始化默认参数
			function initColumnDefault(optionsColumnDefault) {
				columnDefault = columnDefaultOptions;
				if (type.isObject(optionsColumnDefault)) columnDefault = mergeObjects(columnDefault, optionsColumnDefault);
			}
			// 初始化列
			// optionsColumns[array]: options.columns 传入列参数
			function initColumns(optionsColumns) {
				var isHeader = datasHeader || null,
					// 数据列数
					// 列数采取传入数据时，所有数据行中最大的单元格数量(或列参数数量)的最大值
					dcl, len = Math.max(datas.columns.length, datasHeader ? datasHeader.columns.length: 1,
						datasFooter ? datasFooter.columns.length : 0,
						optionsColumns ? optionsColumns.length : 0),
					// 迭代变量
					i, l, icol, hop;

				// 将传入参数赋值给列参数集合
				columnsInfo = optionsColumns;

				// 将已传入的数据列参数对象加入到数据列参数组中
				if (!type.isArray(columnsInfo)) columnsInfo = [];
				for (i = 0; i < len; i++) {
					hop = datasHeader && datasHeader.rows[0] && datasHeader.rows[0].cells[i];
					if (!type.isObject(columnsInfo[i])) columnsInfo[i] = {};
					icol = columnsInfo[i] = mergeObjects(columnDefault, columnsInfo[i]);
					icol.title = datas.columns[i] && datas.columns[i].title() || hop && hop.val() || icol.title;
					icol.type = datas.columns[i] && datas.columns[i].dataType() || hop && hop.cellType || icol.type;
					icol.align = hop && hop.cellAlign || icol.align;
					icol.model = hop && hop.cellMode || icol.mode;
					icol.width = parseInt(hop && hop.cellWidth) || icol.width;
					if (icol.minWidth > icol.width && icol.mode === 1) icol.width = icol.minWidth;
					icol.align = (function () {
						switch (icol.align) {
							case 1: case '1': case 'center': { return 'center'; }
							case 2: case '2': case 'right': { return 'right'; }
							default: case 0: case '0': case 'left': { return 'left'; }
						}
					}());
					icol.mode = (function () {
						switch (icol.model) {
							case 1: case '1': case 'flex': { return 1; }
							case 2: case '2': case 'left': { return 2; }
							case 3: case '3': case 'rigth': { return 3; }
							default: case 0: case '0': case 'normal': { return 0; }
						}
					}());
				}
			}
			// 补全单元格，并更新单元格类型
			// 此方法的目的是为了处理传入的列参数与单元格数量不匹配时，补全单元格
			function initCompletionCells() {
				var isFooter = !!datasFooter,
					dtColLen = datas.columns.length,
					colLen = columnsInfo.length,
					dtFooterColLen,
					i = 0, j = 0;

				if (dtColLen < colLen) {
					for (; i < colLen - dtColLen; i++) {
						datas.columnAdd();
					}
				}
				if (isFooter) {
					dtFooterColLen = datasFooter.columns.length;
					for (; j < colLen - dtFooterColLen; j++) {
						datasFooter.columnAdd();
					}
				}

				// 更新单元格数据类型
				initCellDataType();
			}
			// 初始化行
			function initRows(optionsRows) {
				// 将传入参数赋值给行参数集合
				rowsInfo = optionsRows;

				// 将已传入的数据行参数对象加入到数据行参数组中
				if (!type.isArray(rowsInfo)) rowsInfo = [];

				// 创建内部对象缓存数组
				rowsInfo.header = [];
				rowsInfo.content = [];
				rowsInfo.footer = [];
			}
			// 初始化单元格数据类型
			function initCellDataType() {
				datas.columns.forEach(function (col, i) {
					if (columnsInfo[i]) col.dataType(columnsInfo[i].type);
				});
			}

			// 更新尺寸样式
			function updateWidthStyles() {
				var g = gridWidthCount(),
					wl = g.l, wc = g.c, wr = g.r,
					fl = datasFooter && datasFooter.rows.length || 0;

				$left.css({ width: wl });
				$leftHeaderGrid.css({ width: wl });
				$leftContentGrid.css({ width: wl });

				$center.css({ left: wl, right: wr });
				$centerHeaderGrid.css({ width: wc });
				$centerContentGrid.css({ width: wc - 1 });

				$right.css({ width: wr });
				$rightHeaderGrid.css({ width: wr });
				$rightContentGrid.css({ width: wr });

				if (fl > 0) {
					$leftFooterGrid.css({ width: wl });
					$centerFooterGrid.css({ width: wc });
					$rightFooterGrid.css({ width: wr });
				}
			}
			// 更新高度样式
			function updateHeightStyles() {
				var fl = datasFooter && datasFooter.rows.length || 0, fh = cellHeight * fl,
					h = { height: cellHeight },
					t = { top: cellHeight },
					b = { bottom: fh },
					e = { height: fh, bottom: 0 };

				// 设置高度
				heightOperate(height);
				
				$datagrid.css('line-height', cellHeight - 2 + 'px');

				$leftHeader.css(h);
				$leftContent.css(t);
				$centerHeader.css(h);
				$centerContent.css(t);
				$rightHeader.css(h);
				$rightContent.css(t);

				$leftHeaderGrid.css({ height: cellHeight });
				$leftContentGrid.css({ height: cellHeight * datas.rows.length });

				$centerHeaderGrid.css({ height: cellHeight });
				$centerContentGrid.css({ height: cellHeight * datas.rows.length - 1 });

				$rightHeaderGrid.css({ height: cellHeight });
				$rightContentGrid.css({ height: cellHeight * datas.rows.length });

				$noRow.css({ top: cellHeight });

				if (fl) {
					$leftContent.css(b);
					$leftFooter.css(e);
					$leftFooterGrid.css({ height: fh });

					$centerContent.css(b);
					$centerFooter.css(e);
					$centerFooterGrid.css({ height: fh });

					$rightContent.css(b);
					$rightFooter.css(e);
					$rightFooterGrid.css({ height: fh });

					$noRow.css({ bottom: fh });
				}
			}
			// 更新全部单元格样式
			function updateAllCellSizeStyles() {
				var fl = datasFooter && datasFooter.rows.length || 0;
				gridFlexCount();
				// 更新每个单元格样式
				updateCellSizeStyles(datasHeader, rowsInfo.header);
				updateCellSizeStyles(datas, rowsInfo.content);
				if (fl) updateCellSizeStyles(datasFooter, rowsInfo.footer);
			}
			// 更新单元格样式
			function updateCellSizeStyles(dt, arr) {
				var // 迭代变量
					isHeader = arr === rowsInfo.header,
					i = 0, l = isHeader ? 1 : dt.rows.length;

				for (; i < l; i++) {
					columnsInfo.forEach(function (ci, index) {
						arr[i].public.cells[index].getContent().css({
							width: ci.widthNow,
							left: ci.cellLeft,
							height: cellHeight
						});
					});
				}
			}
			// 更新初始化
			function updateInit() {
				if (datas.rows.length === 0) $noRow.addClass(CSS_ON);
				else $noRow.removeClass(CSS_ON);

				updateWidthStyles();
				updateHeightStyles();
				updateAllCellSizeStyles();
			}

			// grid容器计算列宽度和偏移量
			function gridWidthCount() {
				var // 宽度累计
					wc = 0, wl = 0, wr = 0;

				// 如果包含checked列，默认左列宽加38
				if (isSelected) wl += 38;
				// 获取列的宽度
				columnsInfo.forEach(function (obj) {
					obj.widthNow = obj.width;
					switch (obj.mode) {
						case 0: case 1: { wc += obj.widthNow; break; }
						case 2: { obj.cellLeft = wl; wl += obj.widthNow; break; }
						case 3: { obj.cellLeft = wr; wr += obj.widthNow; break; }
					}
				});

				columnsInfo.gridSize = { l: wl, c: wc, r: wr };
				return columnsInfo.gridSize;
			}
			// grid弹性列计算
			function gridFlexCount() {
				var topWidth = $centerContent.width(),
					// 自适应的单元格  自适应宽度汇总 固定宽度汇总 单元格平分份数
					flexCell = [], fw = 0, nw = 0, fp,
					// 居左统计
					cl = 0;

				// 获取弹性单元格
				columnsInfo.forEach(function (obj) {
					if (obj.mode === 1) {
						fw += obj.width;
						flexCell.push(obj);
					}
					else if (obj.mode === 0) {
						nw += obj.width;
					}
				});
				// 计算弹性单元格的宽度
				fp = (topWidth - nw) / fw;
				fw = 0;
				flexCell.forEach(function (obj) {
					var gw = fp * obj.width, mw = obj.minWidth;
					if (gw < mw) gw = mw;
					obj.widthNow = gw;
					fw += gw;
				});
				// 计算列的定位
				columnsInfo.forEach(function (obj) {
					if (obj.mode === 0 || obj.mode === 1) {
						obj.cellLeft = cl;
						cl += obj.widthNow;
					}
				});
				// 重新设置主内容区域grid容器宽度
				$centerContentGrid.css('width', fw + nw);
			}
			// 创建网格元素
			function createElements() {
				// 创建全部元素
				createTableElements(datasHeader, 1);
				createTableElements(datas);
				if (datasFooter && datasFooter.rows.length) createTableElements(datasFooter, 2);
			}
			// 创建网格内的全部行和单元格
			// dt[ud2.datatable]: 数据对象
			// mode[number]: 行类型 0:content 1:header 2:footer
			function createTableElements(dt, mode) {
				var i = 0, l;
				// 初始化行类型
				mode = mode || 0;
				// 获取行数，如果是header，则视为1行
				l = mode === 1 ? 1 : dt.rows.length;

				// 迭代创建行元素
				for (; i < l; i++) {
					createRowElements(dt, mode);
				}
			}
			// 创建一个行，并创建行内的全部单元格，插入到网格
			// dt[ud2.datatable]: 数据对象
			// mode[number]: 行类型 0:content 1:header 2:footer
			function createRowElements(dt, mode) {
				var $rl, $rc, $rr, $check, realHeight, arr, nowIndex, ca = [];

				// 初始化行类型
				mode = mode || 0;
				// 获取行对象
				if (mode === 0) arr = rowsInfo.content;
				if (mode === 1) arr = rowsInfo.header;
				if (mode === 2) arr = rowsInfo.footer;
				nowIndex = arr.length;

				// 创建行的空容器，用于装载单元格
				$rl = $emptyRow.clone().appendTo(leftGrid[mode]).css('top', nowIndex * cellHeight);
				$rc = $emptyRow.clone().appendTo(centerGrid[mode]).css('top', nowIndex * cellHeight);
				$rr = $emptyRow.clone().appendTo(rightGrid[mode]).css('top', nowIndex * cellHeight);
				// 创建行参数对象
				arr[nowIndex] = { $: { left: $rl, center: $rc, right: $rr }, public: { cells: ca } };
				// 判断是否开启选中行，如果开启选中行，则在行中添加一个checkbox来控制行的选中状态
				if (isSelected && (mode && nowIndex === 0 || !mode)) {
					$check = $emptyCell.clone().addClass('checkbox').css({ textAlign: 'center', width: 38 });
					$check.html('<input type="checkbox" class="check" />').appendTo($rl);
					if (mode) {
						// 如果是header，则视为1行
						realHeight = mode === 1 ? cellHeight : datasFooter.rows.length * cellHeight;
						$check.css({ 'height': realHeight, 'line-height': realHeight - 2 + 'px' });
					}
					if (!isSelectedMultiple && mode) {
						$check.addClass('disabled');
					}

					// 绑定checkbox单元格
					arr[nowIndex].$.check = $check.children();
					// 绑定事件
					arr[nowIndex].checkEvent = event($check).setTap(function () {
						if (mode) {
							rowSelectedAll();
						}
						else {
							rowSelected.call(this, arr[nowIndex]);
						}
					});
				}
				// 迭代列，将该行的全部单元格，按照列参数初始化，并插入到指定的行容器中
				columnsInfo.forEach(function (ci, j) {
					var dtCell = dt && dt.rows[nowIndex].cells[j] || null,
						content = mode === 1 ? ci.title : dtCell.val(), $cell;
					$cell = $emptyCell.clone().html(content).attr('title', content);
					// 按照列的模式，将单元格插入到指定的行容器中
					switch (ci.mode) {
						case 0: case 1: { $cell.appendTo($rc); break; }
						case 2: { $cell.appendTo($rl); break; }
						case 3: { $cell.appendTo($rr); break; }
					}

					ca[j] = {
						getContent: function () { return $cell; }
					};
				});
			}
			// 行选中操作事件回调
			function rowSelected(ro) {
				var isHave = selectedRows.indexOf(ro), len = selectedRows.length;

				if (isHave === -1) {
					// 非多选，取消默认选中的
					if (!isSelectedMultiple && len > 0) {
						selectedRows[0].$.check.removeAttr(CSS_CHECKED);
						selectedRows.splice(0, 1);
						controlCallbacks[RD].call(control.public, ro.public);
					}
					ro.$.check.attr(CSS_CHECKED, CSS_CHECKED);
					selectedRows.push(ro);

					if (isSelectedMultiple && len + 1 === rowsInfo.content.length) setAllSelectedState(true);
				}
				else {
					ro.$.check.removeAttr(CSS_CHECKED);
					selectedRows.splice(isHave, 1);

					if (isAllSelected) setAllSelectedState(false);
				}
				controlCallbacks[isHave > -1 ? RD : RS].call(control.public, ro.public);
			}
			// 行全选操作事件回调
			function rowSelectedAll() {
				var // 发生改变的对象集合 当前操作选中与否的状态
					ca = [], sc = isAllSelected;
				if (rowsInfo.content.length === 0 || !isSelectedMultiple) return;
				if (sc) {
					setAllSelectedState(false);
					selectedRows.forEach(function (ro) {
						ro.$.check.removeAttr(CSS_CHECKED);
						ca.push(ro.public);
					});
					selectedRows.splice(0, selectedRows.length);
				}
				else {
					setAllSelectedState(true);
					rowsInfo.content.forEach(function (ro) {
						if (selectedRows.indexOf(ro) === -1) {
							ro.$.check.attr(CSS_CHECKED, CSS_CHECKED);
							selectedRows.push(ro);
							ca.push(ro.public);
						}
					});
				}
				controlCallbacks[sc ? RD : RS].call(control.public, ca);
			}
			// 设置全选状态
			// state[bool]: 状态
			function setAllSelectedState(state) {
				if (state) {
					isAllSelected = true;
					rowsInfo.header[0].$.check.attr(CSS_CHECKED, CSS_CHECKED);
					rowsInfo.footer[0].$.check.attr(CSS_CHECKED, CSS_CHECKED);
				}
				else {
					isAllSelected = false;
					rowsInfo.header[0].$.check.removeAttr(CSS_CHECKED);
					rowsInfo.footer[0].$.check.removeAttr(CSS_CHECKED);
				}
			}

			// 移除全部数据和相关元素
			function removeContentElements() {
				var i = 0, j = 0,
					c = rowsInfo.content, l = c.length, sl;
				
				// 清空已选择项目
				if (isSelected) {
					sl = selectedRows.length;
					if (isAllSelected) setAllSelectedState(false);
					if (sl > 0) {
						for (; j < sl; j++) {
							rowSelected(selectedRows[i]);
						}
					}
					selectedRows.splice(0, sl);
				}
				// 关闭所有行相关事件
				for (; i < l; i++) c[i].checkEvent.off();
				// 清空容器
				datas.dataEmpty();
				$leftContentGrid.empty();
				$centerContentGrid.empty();
				$rightContentGrid.empty();

				// 移除全部的行数据对象
				rowsInfo.content.splice(0, l);
			}

			// #endregion	

			// #region 公共方法

			// 操作控件高度
			// () 获取当前控件高度
			// - return[number]: 返回控件的高度
			// (h) 设置控件高度
			// - h[number, string]: 设置的高度值，可以是数字或字符形式的百分数
			// - return[ud2.datagrid]: 返回该控件对象
			function heightOperate(h) {
				if (h === void 0) {
					return $datagrid.height();
				}
				else {
					if (REGEX_PERCENT.test(h) || REGEX_NONNEGATIVE.test(h)) {
						$datagrid.css('height', h);
						height = h;
					}
					return control.public;
				}
			}
			// 利用传入的数据源进行数据填充
			// - ds[ud2.datatable, array, string]: 数据源
			// - return[ud2.datagrid]: 返回该控件对象
			function dataFill(ds) {
				// 移除原数据
				removeContentElements();

				// 如果传入数据是数据表则直接填装
				// 否则，先通过参数实例化数据表，并进行填装
				if (ds && ds.type === 'datatable') {
					datas.dataFill(ds);
				} else {
					return dataFill(datatable().dataFill(ds));
				}

				// 创建单元格
				createTableElements(datas);
				// 更新样式信息
				updateInit();

				return control.public;
			}

			// #endregion

			// #region 回调方法

			// 设置行选中时的回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.page]: 返回该控件对象
			function setRowSelected(fn) {
				controlCallbacks.rowSelected = fn;
				return control.public;
			}
			// 设置行取消选中时的回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.page]: 返回该控件对象
			function setRowDeselected(fn) {
				controlCallbacks.rowDeselected = fn;
				return control.public;
			}

			// #endregion

			// #region 事件处理

			// 窗口尺寸改变处理
			function resize() {
				updateAllCellSizeStyles();
			}
			// 绑定hover效果
			function hoverEvent() {
				if (!isHover) return;
				// 绑定hover效果相关事件
				$datagrid.on([MOUSE_ENTER, MOUSE_LEAVE].join(' '), STR_CLS_ROW, function (event) {
					var $me = $(this), type = event.type, index, css;
					if ($me.parents(cn('content', 1)).length > 0) {
						index = $me.index();
						css = { 'background-color': type === MOUSE_ENTER ? hoverColor : '' };
						$leftContentGrid.children(STR_CLS_ROW).eq(index).children().css(css);
						$centerContentGrid.children(STR_CLS_ROW).eq(index).children().css(css);
						$rightContentGrid.children(STR_CLS_ROW).eq(index).children().css(css);
					}
				});
			}
			// 事件绑定
			function bindEvent() {
				var // 内容滚动条参数
					contentScrollOption = {
						barState: 0,
						barColor: 'rgba(60, 60, 60, .3)',
						barColorOn: 'rgba(60, 60, 60, .6)',
						barSize: 5,
						hasVertical: true,
						hasHorizontal: true,
						isScrollMode: true,
						recountByResize: true
					},
					// 两侧滚动条参数
					lrScrollOption = {
						barState: 2,
						hasHorizontal: false,
						hasVertical: true,
						isTouchMode: false,
						isMouseWheelMode: false,
						isScrollMode: false
					},
					// 首尾滚动条参数
					tbScrollOption = {
						barState: 2,
						hasHorizontal: true,
						hasVertical: false,
						isTouchMode: false,
						isMouseWheelMode: false,
						isScrollMode: false
					};

				// 创建滚动条
				contentScroll = scroll($centerContent, contentScrollOption);
				leftScroll = scroll($leftContent, lrScrollOption);
				rightScroll = scroll($rightContent, lrScrollOption);
				topScroll = scroll($centerHeader, tbScrollOption);
				bottomScroll = scroll($centerFooter, tbScrollOption);
				contentScroll
					.followerBind(leftScroll)
					.followerBind(rightScroll)
					.followerBind(topScroll)
					.followerBind(bottomScroll);

				// 绑定窗口尺寸改变回调
				callbacks.pageResize.add(resize);

				// 绑定hover效果
				hoverEvent();
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 创建元素
				createElements();
				updateInit();

				// 控件初始化
				if (control.origin.length) {
					control.origin.after($datagrid);
					control.origin.remove();
					control.transferStyles();
					updateInit();
				}

				// 事件绑定
				bindEvent();
			}());

			// #endregion

			// #region 重写父方法

			// 重写父方法
			var oldAppendTo = control.public.appendTo;
			var oldPrependTo = control.public.prependTo;
			var oldInsertAfter = control.public.insertAfter;
			var oldInsertBefore = control.public.insertBefore;
			function appendTo() {
				oldAppendTo.apply(control.public, arguments);
				updateInit();
				return control.public;
			}
			function prependTo() {
				oldPrependTo.apply(control.public, arguments);
				updateInit();
				return control.public;
			}
			function insertAfter() {
				oldInsertAfter.apply(control.public, arguments);
				updateInit();
				return control.public;
			}
			function insertBefore() {
				oldInsertBefore.apply(control.public, arguments);
				updateInit();
				return control.public;
			}

			// #endregion

			// #region 返回

			// 返回
			return extendObjects(control.public, {
				appendTo: appendTo,
				prependTo: prependTo,
				insertAfter: insertAfter,
				insertBefore: insertBefore,
				height: heightOperate,
				setRowSelected: setRowSelected,
				setRowDeselected: setRowDeselected,
				dataFill: dataFill,
				datas: datas
			});

			// #endregion

		};
		// 单元格对齐方式
		constructor.align = cellAlign;
		// 列的排版模式
		constructor.mode = columnMode;

	});

	// #endregion

	// #region ud2 控件

	// 对话框控件
	controlCreater('dialog', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = getClassName(cls),
			// 对话框基础内容对象
			$dialogBaseContent = $('<div class="' + cn('built') + '"><table><tr><td></td></tr></table></div>'),
			// 对话框基础页脚内容对象
			$dialogBaseFooter = $('<div class="' + cn('footer') + '"><a class="btn">确 定</a><a class="btn">取 消</a></div>');

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

			if (len === 1 && type.isObject(options[0])) {
				title = options[0].title || '';
				content = options[0].content || '';
				ico = options[0].ico;
				icoStyle = options[0].icoStyle;
				sendFn = options[0].sendFn;
				cancelFn = options[0].cancelFn;
			}
			else {
				// 会话标题与内容
				title = options[0] || '';
				content = options[1] || '';

				if (len === 3) {
					if (type.isFunction(options[2])) { // sendFn
						sendFn = options[2];
					}
					else { // icoStyle
						icoStyle = options[2];
					}
				}

				if (len === 4) {
					if (type.isFunction(options[2]) && type.isFunction(options[3])) {
						sendFn = options[2];
						cancelFn = options[3];
					}
					else if (type.isObject(options[2]) && type.isFunction(options[3])) {
						icoStyle = options[2];
						sendFn = options[3];
					}
					else {
						ico = options[2];
						icoStyle = options[3];
					}
				}

				if (len === 5) {
					if (type.isObject(options[2]) && type.isFunction(options[3]) && type.isFunction(options[4])) {
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
			sendFn = type.isFunction(sendFn) ? sendFn : fnNoop;
			cancelFn = type.isFunction(cancelFn) ? cancelFn : fnNoop;
			return fn(title, content, ico, icoStyle, sendFn, cancelFn);
		}
		// 对话框CSS样式重写
		function dialogRewriteCSS($content, $base, $footer, ico, icoStyle) {
			var $td = $base.find('td');
			if (ico !== void 0) {
				$td.before('<td><i class="ico fc-' + icoStyle.name + '">' + ico + '</i></td>');

			}
			else if (icoStyle !== void 0 && icoStyle.name !== 'normal') {
				$td.before('<td><i class="ico fc-' + icoStyle.name + '">' + icoStyle.ico + '</i></td>');
			}
			$content.css('bottom', '3em').append($base).after($footer);
		}
		// 对话框事件绑定
		function dialogBindEvent(dialog, $event, eventObj, sendFn, cancelFn, $input) {
			if (eventObj.send) {
				eventObj.send = event($event.eq(0)).setTap(function () {
					if (dialog.getAnimateState()) return;
					if (sendFn) sendFn($input && $input.val());
					eventObj.send.off();
					dialog.remove();
				});
			}

			if (eventObj.cancel) {
				eventObj.cancel = event($event.eq(1)).setTap(function () {
					if (dialog.getAnimateState()) return;
					if (cancelFn) cancelFn($input && $input.val());
					eventObj.cancel.off();
					dialog.remove();
				});
			}
		}

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // 尺寸 位置     标题    内容     关闭按钮
				size, position, title, content, btnClose,
				// 获取用户自定义项
				options = control.getOptions([
					'size', 'position', 'title', 'content', ['btnClose', 'isBtnClose']
				], function (options) {
					// 初始化标题及内容
					title = options.title || '未定义标题';
					content = options.content || null;

					// 初始化尺寸
					size = getCoordinate(options.size, 400, 300);
					// 初始化位置
					position = options.position;
					position = position === void 0 ? POS_CENTER : position;
					setPosition(position);

					// 初始化关闭按钮状态
					btnClose = attrBoolCheck(options.btnClose, true);
				}),
				// 控件结构
				template = '<div class="' + cn('header') + '">' + title + '</div>'
					+ '<div class="' + cn('body') + '"></div>'
					+ '<a class="' + cn('close') + ' ico">&#xed1f;</a>',
				// 获取初始化的控件对象
				current = control.current,
				// 控件对象
				$dialog = current.html(template),
				// 控件头部对象
				$header = $dialog.children('div').eq(0),
				// 控件内容对象
				$content = $dialog.children('div').eq(1),
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
					open: fnNoop,
					// 关闭回调
					close: fnNoop
				};

			// #endregion

			// #region 私有方法

			// 设置位置
			// pos[object, string, number]: 位置参数
			function setPosition(pos) {
				switch (pos) {
					case POS_CENTER: case '0': { position = POS_CENTER; break; }
					case POS_FULL: case '1': case 'full': { position = POS_FULL; break; }
					case POS_TOPLEFT: case '2': case 'topLeft': { position = POS_TOPLEFT; break; }
					case POS_TOPRIGHT: case '3': case 'topRight': { position = POS_TOPRIGHT; break; }
					case POS_BOTTOMLEFT: case '4': case 'bottomLeft': { position = POS_BOTTOMLEFT; break; }
					case POS_BOTTOMRIGHT: case '5': case 'bottomRight': { position = POS_BOTTOMRIGHT; break; }
					default: { position = getCoordinate(position, NORMAL_LENGTH, NORMAL_LENGTH); break; }
				}
			}

			// #endregion

			// #region 公共方法

			// 获取对话框内容对象
			// return[jquery]: 返回对话框内容对象
			function getContent() {
				return $content;
			}
			// 获取对话框处于动画状态
			// return[bool]: 返回对话框是否在动画进行中
			function getAnimateState() {
				return animateLock;
			}
			// 对话框开启
			// return[ud2.dialog]: 返回该控件对象
			function open() {
				if (!openState && !animateLock) {
					openState = true;
					animateLock = true;
					backmask.open(control.public);
					window.setTimeout(function () { $dialog.addClass(CSS_ON); }, 10);
					window.setTimeout(function () { animateLock = false; }, 310);
					controlCallbacks.open.call(control.public);
				}
				return control.public;
			}
			// 对话框关闭
			// return[ud2.dialog]: 返回该控件对象
			function close() {
				if (openState && !animateLock) {
					openState = false;
					animateLock = true;
					backmask.close(control.public);
					window.setTimeout(function () { $dialog.removeClass(CSS_ON); }, 10);
					window.setTimeout(function () { animateLock = false; }, 310);
					controlCallbacks.close.call(control.public);
				}
				return control.public;
			}
			// 对话框移除
			function remove() {
				if (openState || animateLock) {
					if (openState) close();
					window.setTimeout(remove, 310);
					return;
				}

				$dialog.remove();
				eventObj.off();
				control.remove();
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
				var dialogCSS = {};

				// 修改样式
				if (position !== POS_FULL) {
					dialogCSS.width = size.x;
					dialogCSS.height = size.y;
				}
				if (position === POS_TOPLEFT) {
					dialogCSS.top = NORMAL_LENGTH; dialogCSS.left = NORMAL_LENGTH;
				}
				else if (position === POS_TOPRIGHT) {
					dialogCSS.top = NORMAL_LENGTH; dialogCSS.right = NORMAL_LENGTH;
				}
				else if (position === POS_BOTTOMLEFT) {
					dialogCSS.bottom = NORMAL_LENGTH; dialogCSS.left = NORMAL_LENGTH;
				}
				else if (position === POS_BOTTOMRIGHT) { dialogCSS.bottom = NORMAL_LENGTH; dialogCSS.right = NORMAL_LENGTH; }
				else if (position === POS_FULL) { dialogCSS.top = NORMAL_LENGTH; dialogCSS.bottom = NORMAL_LENGTH; dialogCSS.left = NORMAL_LENGTH; dialogCSS.right = NORMAL_LENGTH; }
				else if (position === POS_CENTER) { dialogCSS.top = '50%'; dialogCSS.left = '50%'; dialogCSS.marginLeft = -size.x / 2; dialogCSS.marginTop = -size.y / 2; }
				else {
					dialogCSS.top = position.y; dialogCSS.left = position.x;
				}
				$dialog.css(dialogCSS);

				// 关闭按钮
				if (!btnClose) {
					$close.detach();
				}

				// 内容初始化
				if (control.origin.length) {
					$content.append(control.origin);
				}
				else {
					$content.append(content);
				}

				// 放置到文档中
				$body.append($dialog);
			}
			// 事件绑定
			function bindEvent() {
				eventObj = event($close).setTap(close);
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
			return extendObjects(control.public, {
				getContent: getContent,
				getAnimateState: getAnimateState,
				open: open,
				close: close,
				remove: remove,
				setOpen: setOpen,
				setClose: setClose
			});

			// #endregion

		};
		// 对话框位置
		constructor.position = {
			center: POS_CENTER,
			full: POS_FULL,
			topLeft: POS_TOPLEFT,
			topRight: POS_TOPRIGHT,
			bottomLeft: POS_BOTTOMLEFT,
			bottomRight: POS_BOTTOMRIGHT
		};
		// 弹出对话框
		constructor.alert = function () {

			// 解析传入参数
			return dialogArgs.call(this, argsToArray(arguments), function (title, content, ico, icoStyle, sendFn) {

				var // 对话框对象
					dialog = constructor({ title: title, size: [300, 220], btnClose: false }),
					// 对话框内容对象
					$content = dialog.getContent(),
					// 弹出内容的默认架构
					$base = $dialogBaseContent.clone(),
					// 对话框页脚内容
					$footer = $dialogBaseFooter.clone(),
					// 事件对象
					eventObj = {
						send: 1
					};

				// 初始化
				(function init() {
					dialogRewriteCSS($content, $base, $footer, ico, icoStyle);
					dialogBindEvent(dialog, $footer.children('a'), eventObj, sendFn);

					$base.find('td:last').append(content);
					$footer.find('a:last').remove();

					dialog.open();
				}());

			});

		};
		// 确认对话框
		constructor.confirm = function () {

			// 解析传入参数
			return dialogArgs.call(this, argsToArray(arguments), function (title, content, ico, icoStyle, sendFn, cancelFn) {
				var // 对话框对象
					dialog = constructor({ title: title, size: [300, 220], btnClose: false }),
					// 对话框内容对象
					$content = dialog.getContent(),
					// 弹出内容的默认架构
					$base = $dialogBaseContent.clone(),
					// 对话框页脚内容
					$footer = $dialogBaseFooter.clone(),
					// 事件对象
					eventObj = {
						send: 1, cancel: 1
					};

				// 初始化
				(function init() {
					dialogRewriteCSS($content, $base, $footer, ico, icoStyle);
					dialogBindEvent(dialog, $footer.children('a'), eventObj, sendFn, cancelFn);

					$base.find('td:last').append(content);

					dialog.open();
				}());

			});

		};
		// 提问对话框
		constructor.prompt = function () {

			// 解析传入参数
			return dialogArgs.call(this, argsToArray(arguments), function (title, content, ico, icoStyle, sendFn, cancelFn) {
				var // 对话框对象
					dialog = constructor({ title: title, size: [300, 220], btnClose: false }),
					// 对话框内容对象
					$content = dialog.getContent(),
					// 弹出内容的默认架构
					$base = $dialogBaseContent.clone(),
					// 对话框页脚内容
					$footer = $dialogBaseFooter.clone(),
					// 输入框内容对象
					$input = $('<input type="text" class="textbox" />'),
					// 事件对象
					eventObj = {
						send: 1, cancel: 1
					};

				// 初始化
				(function init() {
					dialogRewriteCSS($content, $base, $footer, ico, icoStyle);
					dialogBindEvent(dialog, $footer.children('a'), eventObj, sendFn, cancelFn, $input);

					$base.find('td:last').append(content).append($input);

					dialog.open();
				}());

			});

		};

	});
	// 浮动消息控件
	controlCreater('message', function (collection, constructor) {

		var // className存于变量
			cls = collection.className,
			// 漂浮消息集合，装载处于显示状态的漂浮消息
			showBox = {};

		// 建立集合
		showBox[POS_TOPLEFT] = [];
		showBox[POS_TOPCENTER] = [];
		showBox[POS_TOPRIGHT] = [];
		showBox[POS_BOTTOMLEFT] = [];
		showBox[POS_BOTTOMCENTER] = [];
		showBox[POS_BOTTOMRIGHT] = [];

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
					autoSwitch = attrBoolCheck(options.autoSwitch, true);
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
					btnClose = attrBoolCheck(options.btnClose, true);
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
				$close = $a.clone().addClass('message-close'),
				// 显示状态
				isOpen = false,
				// 关闭定时器
				closeTimer = null,
				// 关闭按钮事件对象
				eventClose,
				// 回调	
				controlCallbacks = {
					// 开启回调
					open: fnNoop,
					// 关闭回调
					close: fnNoop
				};

			// #endregion

			// 设置位置
			// pos[object, string, number]: 位置参数
			function setPosition(pos) {
				switch (pos) {
					case POS_TOPLEFT: case 'topLeft': case '1': case 1: { position = POS_TOPLEFT; break; }
					case POS_TOPRIGHT: case 'topRight': case '2': case 2: { position = POS_TOPRIGHT; break; }
					case POS_BOTTOMCENTER: case 'bottomCenter': case '3': case 3: { position = POS_BOTTOMCENTER; break; }
					case POS_BOTTOMLEFT: case 'bottomLeft': case '4': case 4: { position = POS_BOTTOMLEFT; break; }
					case POS_BOTTOMRIGHT: case 'bottomRight': case '5': case 5: { position = POS_BOTTOMRIGHT; break; }
					default: case POS_TOPCENTER: case 'topCenter': case '0': case 0: { position = POS_TOPCENTER; break; }
				}
			}

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

					tb = NORMAL_LENGTH + len * (h + NORMAL_LENGTH);
					switch (position) {
						case POS_TOPCENTER: { css = { top: tb, left: '50%', marginLeft: -w / 2 }; break; }
						case POS_TOPLEFT: { css = { top: tb, left: NORMAL_LENGTH }; break; }
						case POS_TOPRIGHT: { css = { top: tb, right: NORMAL_LENGTH }; break; }
						case POS_BOTTOMCENTER: { css = { bottom: tb, left: '50%', marginLeft: -w / 2 }; break; }
						case POS_BOTTOMLEFT: { css = { bottom: tb, left: NORMAL_LENGTH }; break; }
						case POS_BOTTOMRIGHT: {
							css = { bottom: tb, right: NORMAL_LENGTH }; break;
						}
					}

					control.public.data = { tb: tb };
					$message.css(css).addClass(CSS_ON);
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
						topNow = top - h - NORMAL_LENGTH;
						showBox[position][i].data.tb = topNow;
						if (position === POS_TOPLEFT || position === POS_TOPRIGHT || position === POS_TOPCENTER) {
							showBox[position][i].getContent().css('top', topNow);
						}
						else {
							showBox[position][i].getContent().css('bottom', topNow);
						}
					}

					showBox[position].splice(index, 1);
					$message.removeClass(CSS_ON);
					controlCallbacks.close.call(control.public);
				}

				return control.public;
			}
			// 移除浮动消息控件
			function remove() {
				if (isOpen) {
					close();
					window.setTimeout(remove, 305);
					return;
				}
				$message.remove();
				eventClose.off();
				callbacks.pageResize.remove(resize);
				control.remove();
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

			// 窗口尺寸发生改变时，重置宽度
			function resize() {
				if (isOpen && (position === POS_TOPCENTER || position === POS_BOTTOMCENTER)) {
					$message.css('marginLeft', -$message.outerWidth() / 2);
				}
			}
			// 事件处理
			function bindEvent() {
				eventClose = event($close).setTap(function () { remove(); });
				callbacks.pageResize.add(resize);
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 向文档中添加控件
				$message.addClass('message');
				$body.append($message);

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
			return extendObjects(control.public, {
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
			topCenter: POS_TOPCENTER,
			topLeft: POS_TOPLEFT,
			topRight: POS_TOPRIGHT,
			bottomCenter: POS_BOTTOMCENTER,
			bottomLeft: POS_BOTTOMLEFT,
			bottomRight: POS_BOTTOMRIGHT
		};
		// 信息浮动消息控件
		constructor.info = function (text) {
			constructor({ message: text, style: style.info });
		};
		// 警告浮动消息控件
		constructor.warning = function (text) {
			constructor({ message: text, style: style.warning });
		};
		// 成功浮动消息控件
		constructor.success = function (text) {
			constructor({ message: text, style: style.success });
		};
		// 危险浮动消息控件
		constructor.danger = function (text) {
			constructor({ message: text, style: style.danger });
		};
	});

	// 开关控件
	controlCreater('switch', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = getClassName(cls);

		collection.init = function (control) {

			// #region 私有字段

			var // 默认值(1:开启, 0:关闭) 是否禁用 开关颜色
				value, isDisabled, color,
				// 获取用户自定义项
				options = control.getOptions([CSS_VALUE, [CSS_DISABLED, 'isDisabled'], 'color'], function (options) {
					// 默认值
					value = parseInt(options.value) === 1 ? 1 : 0;
					// 默认是否禁用
					isDisabled = attrBoolCheck(options.disabled, false);
					// 默认颜色
					color = options.color || '';
				}),
				// 控件结构
				template = '<input type="checkbox" /><input type="hidden" />',
				// 获取初始化的控件对象
				current = control.current,
				// 控件对象
				$switch = current.html(template),
				// 值对象
				$value = $switch.children('[type="hidden"]'),
				// 索引功能对象
				$tab = $switch.children('[type="checkbox"]'),
				// 回调方法
				controlCallbacks = {
					// 开启时回调
					open: fnNoop,
					// 关闭时回调
					close: fnNoop,
					// 改变时回调
					change: fnNoop
				};

			// #endregion

			// #region 私有方法

			// 设置控件值，并更新显示属性
			// v[number]: 控件值
			function setValue(v) {
				if (value !== v) {
					value = v;
					$value.val(value);
					// 设置回调
					controlCallbacks.change.call(control.public, value);
					if (value === 1) controlCallbacks.open.call(control.public);
					else controlCallbacks.close.call(control.public);
				}
			}

			// #endregion

			// #region 公共方法

			// 控件值操作
			// () 获取控件值
			// - return[string]: 返回控件值
			// (v) 设置控件值
			// - v[number, bool]: 设置控件的值
			// - return[ud2.switch]: 返回该控件对象
			function val(v) {
				if (v !== void 0) {
					if (!v) close(); else open();
					return control.public;
				}
				else {
					return value;
				}
			}
			// 禁用状态操作
			// () 获取当前的禁用状态
			// - return[bool]: 返回当前的禁用状态
			// (state) 设置禁用状态
			// - state[bool]: 设置当前的禁用状态
			// - return[ud2.switch]: 返回该选项组对象
			function disabledOperate(state) {
				var i, j;
				if (state !== void 0) {
					if (isDisabled !== state) {
						isDisabled = !!state;
						if (state) {
							$switch.attr(cn(CSS_DISABLED), 'true');
						}
						else {
							$switch.removeAttr(cn(CSS_DISABLED));
						}
					}
					return control.public;
				}
				else {
					return isDisabled;
				}
			}
			// 设置开关为开启状态
			// return[ud2.switch]: 返回选项控件
			function open() {
				if (!value) {
					$switch.addClass(CSS_CHECKED);
					setValue(1);
				}
				return control.public;
			}
			// 设置开关为关闭状态
			// return[ud2.switch]: 返回选项控件
			function close() {
				if (value) {
					$switch.removeClass(CSS_CHECKED);
					setValue(0);
				}
				return control.public;
			}
			// 改变当前开关的开启与关闭状态
			// return[ud2.switch]: 返回选项控件
			function toggle() {
				if (value) close();
				else open();
				return control.public;
			}

			// #endregion

			// #region 回调方法

			// 设置开启回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setOpen(fn) {
				controlCallbacks.open = fn;
				return control.public;
			}
			// 设置关闭回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setClose(fn) {
				controlCallbacks.close = fn;
				return control.public;
			}
			// 设置值改变回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[range]: 当前事件对象，方便链式调用
			function setChange(fn) {
				controlCallbacks.change = fn;
				return control.public;
			}

			// #endregion

			// #region 事件处理

			function bindEvent() {
				event($switch).setTap(function () {
					if (!isDisabled) {
						toggle();
					}
				});
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 控件初始化
				if (control.origin.length) {
					control.origin.after($switch);
					control.origin.remove();
					control.transferStyles();
					control.transferAttrs({ accept: $tab, attrReg: 'tabindex' });
					control.transferAttrs({ accept: $value, attrReg: 'name' });
				}

				// 添加样式
				if (color !== '') $switch.addClass(color.name ? color.name : color);
				// 默认开启情况
				if (value === 1) $switch.addClass(CSS_CHECKED);
				$value.val(value);
				// 设置默认禁用状态
				if (isDisabled) $switch.attr(cn(CSS_DISABLED), true);

				// 事件绑定
				bindEvent();
			}());

			// #endregion

			// #region 返回

			// 返回
			return extendObjects(control.public, {
				val: val,
				disabled: disabledOperate,
				open: open,
				close: close,
				toggle: toggle,
				setOpen: setOpen,
				setClose: setClose,
				setChange: setChange
			});

			// #endregion

		};

	});

	// 选择控件
	controlCreater('select', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = getClassName(cls),
			// 替代文本常量
			TYPE_SELECT = 'select', TYPE_GROUP = TYPE_SELECT + '.group', TYPE_OPTION = TYPE_SELECT + '.option';

		// 选项组对象
		// (object) 通过对象参数，创建一个菜单控件选项组对象
		// - name[string]: 组名称
		// - isDisabled[bool]: 是否禁用
		// (name, isDisabled) 创建一个菜单控件选项组对象
		// - name[string]: 组名称
		// - isDisabled[bool]: 是否禁用
		// return[ud2.select.group]: 返回选项组对象
		creater('group', function () {

			var // 参数集合        参数长度
				args = arguments, len = args.length,
				// 组标记  禁用状态  组内选项集合
				label, isDisabled, options = [],
				// 选项组对象
				groupObj = { select: null },
				// 参数对象 选项内容对象
				argObj = args[0], $group;

			// 标记操作
			// () 获取选项组标记内容
			// - return[string]: 返回选项组标记内容
			// (text) 设置选项组标记内容
			// - text[string]: 待更改的选项组标记内容
			// - return[ud2.select.group]: 返回该选项组对象
			function labelOperate(text) {
				if (text !== void 0) {
					label = String(text);
					$group.attr('title', label);
					return groupObj;
				}
				else {
					return label;
				}
			}
			// 禁用状态操作
			// () 获取当前的禁用状态
			// - return[bool]: 返回当前的禁用状态
			// (state) 设置禁用状态
			// - state[bool]: 设置当前的禁用状态
			// - return[ud2.select.group]: 返回该选项组对象
			function disabledOperate(state) {
				var i, j;
				if (state !== void 0) {
					if (isDisabled !== state) {
						isDisabled = !!state;
						if (state) {
							$group.attr(cn(CSS_DISABLED), 'true');
							if (j = options.length, j !== 0) {
								for (i = 0; i < j; i++) groupObj.select.valOption(options[i], 0);
							}
						}
						else {
							$group.removeAttr(cn(CSS_DISABLED));
						}
					}
					return groupObj;
				}
				else {
					return isDisabled;
				}
			}
			// 将选项组对象添加到选项控件中
			// select[ud2.select]: 待添入的选项控件
			// return[ud2.select.group]: 返回该选项组对象
			function selectIn(whichSelect) {
				if (whichSelect && whichSelect.type === TYPE_SELECT
					&& !groupObj.select) {
					whichSelect.groupAdd(groupObj);
				}
				return groupObj;
			}
			// 将选项控件从选项组对象中移除
			// return[ud2.select.group]: 返回该选项组对象
			function selectOut() {
				if (groupObj.select) {
					groupObj.select.groupRemove(groupObj);
				}
				return groupObj;
			}
			// 向选项组中添加选项对象
			// whichOption[ud2.select.option]: 待添加的选项对象
			// return[ud2.select.group]: 返回该选项组对象
			function optionAdd(whichOption) {
				// 判断传入option的类型是否符合
				if (whichOption && whichOption.type === TYPE_OPTION
					&& !whichOption.group) {
					// 如果组对象被禁用，则默认取消被选中选项的选中状态
					if (isDisabled && whichOption.selected()) whichOption.selected(0);

					// 绑定选项与组的关系
					whichOption.group = groupObj;
					options.push(whichOption);
					$group.append(whichOption.getContent());
					// 如果组已绑定到选项控件中，绑定与选项控件的关系
					if (groupObj.select) whichOption.selectIn(groupObj.select);
				}
				return groupObj;
			}
			// 向选项组中移除选项对象
			// whichOption[ud2.select.option]: 待移除的选项对象
			// return[ud2.select.group]: 返回该选项组对象
			function optionRemove(whichOption) {
				var isHave;
				// 判断传入option的类型是否符合
				if (whichOption && whichOption.type === TYPE_OPTION
					&& whichOption.group === groupObj) {
					// 解绑与组的关系
					isHave = options.indexOf(whichOption);
					if (isHave > -1) {
						options.splice(isHave, 1);
						whichOption.group = null;
						whichOption.getContent().detach();

						// 如果组已绑定到选项控件中，解绑与选项控件的关系
						if (whichOption.select) whichOption.selectOut();
					}
				}
				return groupObj;
			}
			// 获取选项组内容对象
			// return[jQuery]: 返回选项组内容对象
			function getContent() {
				return $group;
			}

			// 初始化
			(function init() {
				// 判断传参方式，并初始化组对象
				if (len === 1 && type.isObject(argObj)) {
					label = argObj.label;
					isDisabled = !!argObj.isDisabled;
				}
				else {
					label = args[0] || '未命名选项组';
					isDisabled = !!args[1];
				}
				// 未传递参数时，给定默认值
				label = String(label);
				// 创建选项组内容元素
				$group = $div.clone()
					.attr('title', label)
					.addClass(cn('group'));
				// 设置禁用状态
				if (isDisabled) $group.attr(cn(CSS_DISABLED), 'true');
			}());

			// 返回
			return extendObjects(groupObj, {
				type: 'select.group',
				options: options,
				getContent: getContent,
				label: labelOperate,
				disabled: disabledOperate,
				optionAdd: optionAdd,
				optionRemove: optionRemove,
				selectIn: selectIn,
				selectOut: selectOut
			});

		}, constructor);
		// 选项对象
		// (object) 通过对象参数，创建一个菜单控件选项对象
		// - name[string]: 选项名称
		// - value[string]: 选项值
		// - isDisabled[bool]: 是否禁用
		// - isSelected[bool]: 是否选中
		// (name, value, isDisabled, isSelected) 创建一个菜单控件选项对象
		// - name[string]: 选项名称
		// - value[string]: 选项值
		// - isDisabled[bool]: 是否禁用
		// - isSelected[bool]: 是否选中
		// return[ud2.select.option]: 返回选项对象
		creater('option', function () {

			var // 参数集合        参数长度
				args = arguments, len = args.length,
				// 选项标记 选项值 是否禁用 是否选中
				label, value, isDisabled, isSelected,
				// 选项对象 
				optionObj = { group: null, select: null },
				// 参数对象 选项内容对象
				argObj = args[0], $option;

			// 标记操作
			// () 获取选项标记内容
			// - return[string]: 返回选项组标记内容
			// (text) 设置选项组标记内容
			// - text[string]: 待更改的选项组标记内容
			// - return[ud2.select.option]: 返回该选项对象
			function labelOperate(text) {
				if (text !== void 0) {
					label = String(text);
					$option.html(label).attr('title', label);
					return optionObj;
				}
				else {
					return label;
				}
			}
			// 值操作
			// () 获取选项值
			// - return[string]: 返回选项值
			// (text) 设置选项值
			// - text[string]: 待更改的选项值
			// - return[ud2.select.option]: 返回该选项对象
			function valueOperate(text) {
				if (text !== void 0) {
					value = String(text);
					$option.attr(cn(CSS_VALUE), value);
					return optionObj;
				}
				else {
					return value;
				}
			}
			// 选中状态操作
			// () 获取当前的选中状态
			// - return[bool]: 返回当前的选中状态
			// (state) 设置选中状态
			// - state[bool]: 设置当前的选中状态
			// - return[ud2.select.option]: 返回该选项对象
			function selectedOperate(state) {
				if (state !== void 0) {
					// 判断可以选中的条件
					if (state && !isDisabled
						&& (optionObj.group === null || optionObj.group !== null && !optionObj.group.disabled())) {
						isSelected = true;
						$option.addClass(CSS_ON);
					}
					else {
						isSelected = false;
						$option.removeClass(CSS_ON);
					}
					return optionObj;
				}
				else {
					return isSelected;
				}
			}
			// 禁用状态操作
			// () 获取当前的禁用状态
			// - return[bool]: 返回当前的禁用状态
			// (state) 设置禁用状态
			// - state[bool]: 设置当前的禁用状态
			// - return[ud2.select.option]: 返回该选项对象
			function disabledOperate(state) {
				if (state !== void 0) {
					state = !!state;
					// 判断禁用情况
					if (state) {
						isDisabled = true;
						$option.attr(cn(CSS_DISABLED), 'true');
						if (isSelected) {
							// 此项顺序不可调换
							if (optionObj.select !== null) optionObj.select.valOption(optionObj, false);
						}
					}
					else {
						isDisabled = false;
						$option.removeAttr(cn(CSS_DISABLED));
					}
					return optionObj;
				}
				else {
					return isDisabled;
				}
			}
			// 将选项对象添加到选项组对象中
			// select[ud2.select.group]: 待添入的选项组对象
			// return[ud2.select.option]: 返回该选项对象
			function groupIn(whichGroup) {
				// 判断传入的选项组对象是否符合
				if (whichGroup && whichGroup.type === TYPE_GROUP
					&& !optionObj.group && !optionObj.select) {
					whichGroup.optionAdd(optionObj);
				}
				return optionObj;
			}
			// 将选项对象从选项组中移除
			// return[ud2.select.option]: 返回该选项对象
			function groupOut() {
				// 判断是否存在组
				if (optionObj.group) {
					optionObj.group.optionRemove(optionObj);
				}
				return optionObj;
			}
			// 向选项控件中添加选项对象
			// whichSelect[ud2.select]: 待添入的选项控件
			// return[ud2.select.option]: 返回该选项对象
			function selectIn(whichSelect) {
				// 检测传入参数的数据类型是否符合，且当前选项对象是否未绑定选项控件对象
				if (whichSelect && whichSelect.type === TYPE_SELECT
					&& !optionObj.select) {
					whichSelect.optionAdd(optionObj);
				}
				return optionObj;
			}
			// 向选项控件中移除选项对象
			// return[ud2.select.option]: 返回该选项对象
			function selectOut() {
				// 判断是否存在选项控件
				if (optionObj.select) {
					optionObj.select.optionRemove(optionObj);
				}
				return optionObj;
			}

			// 获取选项内容对象
			// return[jQuery]: 返回选项组内容对象
			function getContent() {
				return $option;
			}

			// 初始化
			(function init() {
				// 判断传参方式，并初始化选项对象
				if (len === 1 && type.isObject(argObj)) {
					label = argObj.label;
					value = argObj.value;
					isDisabled = !!argObj.isDisabled;
					isSelected = !isDisabled && !!argObj.isSelected;
				}
				else {
					label = args[0] || '未命名选项';
					value = args[1];
					isDisabled = !!args[2];
					isSelected = !isDisabled && !!args[3];
				}
				// 未传递参数时，给定默认值
				label = String(label);
				value = String(value) || label;
				// 创建选项内容元素
				$option = $a.clone()
					.html(label)
					.attr('title', label)
					.attr(cn(CSS_VALUE), value)
					.addClass(cn('option'));
				// 设置禁用状态
				if (isDisabled) $option.attr(cn(CSS_DISABLED), 'true');
				// 设置选中状态
				if (isSelected) selectedOperate(true);

				// 设置选项对象事件
				event($option).setTap(function () {
					if (!optionObj.disabled()
						&& (!optionObj.group || optionObj.group && !optionObj.group.disabled())) {
						if (optionObj.select) {
							optionObj.select.valOption(optionObj);
							if (!optionObj.select.multiple()) optionObj.select.close();
						}
					}
				});
			}());

			// 返回
			return extendObjects(optionObj, {
				type: 'select.option',
				getContent: getContent,
				label: labelOperate,
				val: valueOperate,
				selected: selectedOperate,
				disabled: disabledOperate,
				groupIn: groupIn,
				groupOut: groupOut,
				selectIn: selectIn,
				selectOut: selectOut
			});

		}, constructor);
		// 选项列表方向
		constructor.direction = {
			// 向上
			up: 1,
			// 向下
			down: 0
		};

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // 最大高度(em), 控件默认文本, 多选, 菜单方向 空列表占位文本 开启菜单是否移动到选中项
				maxHeight, placeholder, isMultiple, dir, emptyText, isMoveSelected,
				// 选项
				options = control.getOptions([
					'maxheight', 'placeholder',
					['multiple', 'isMultiple'],
					'dir', 'emptyText', ['moveSelected', 'isMoveSelected']
				], function (options) {
					// 初始化最大高度
					maxHeight = parseInt(options.maxheight);
					if (isNaN(maxHeight) || maxHeight === 0) maxHeight = 20;
					// 初始化默认文本
					placeholder = options.placeholder || '请选择以下项目';
					// 初始化是否多选
					isMultiple = attrBoolCheck(options.multiple, false);
					// 初始化空列表占位文本
					emptyText = options.emptyText || '当前列表未包含任何项';
					// 初始化开启菜单是否移动到选中项
					isMoveSelected = attrBoolCheck(options.moveSelected, false);

					// 初始化菜单方向
					// 在init时，检测值是否符合要求
					dir = options.dir;
				}),
				// 控件结构
				template = '<div class="' + cn('put') + '"><a class="' + cn('btn') + '" /><i class="ud2-ctrl-arrow" /></div>'
					+ '<div class="' + cn('list') + '" />'
					+ '<input type="checkbox" /><input type="hidden" />',
				// 获取初始化的控件对象
				current = control.current,
				// 控件对象
				$select = current.html(template),
				// 列表对象
				$list = $select.children('div:last'),
				// 显示容器对象
				$box = $select.children('div:first'),
				// 菜单按钮对象
				$btn = $box.children('a'),
				// 索引功能对象
				$tab = $select.children('[type="checkbox"]'),
				// 值对象
				$value = $select.children('[type="hidden"]'),
				// 标记控件是否处于开启状态
				isOpen = false,
				// 列表滚动条
				listScroll,
				// 组集合
				groupCollection = [],
				// 无组选项集合
				optionNoGroupCollection = [],
				// 选项集合
				optionCollection = [],
				// 被选作值的选项集合
				optionValueCollection = [],
				// 回调方法
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

			// 设置列表方向
			// direction[ud2.select.direction]: 方向值
			function setListDir(direction) {
				switch (direction) {
					case 'up':
					case '1':
					case 1: {
						dir = 1;
						$select.removeClass(cn('dir-down')).addClass(cn('dir-up'));
						break;
					}
					default:
					case 'down':
					case '0':
					case 0: {
						dir = 0;
						$select.removeClass(cn('dir-up')).addClass(cn('dir-down'));
						break;
					}
				}
			}
			// 设置控件的默认文本
			// text[string]: 待设置的文本
			function setPlaceholder(text) {
				placeholder = text;
				$btn.html(placeholder);
			}
			// 设置控件的空列表占位文本
			// text[string]: 待设置的文本
			function setEmptyText(text) {
				emptyText = text;
				getContent().attr(cn(CSS_EMPTY), emptyText);
			}
			// 解析原选项控件内的全部组对象
			function analysisGroups() {
				if (!control.origin.length) return;

				var groupsSelector = 'optgroup, [' + cn('optgroup') + ']',
					$groups = control.origin.children(groupsSelector);
				analysisOptions();
				for (var i = 0, l = $groups.length, group; i < l; i++) {
					var $group = $groups.eq(i),
						name = $group.attr('label') || $group.attr(cn('label')) || '',
						disabled = !!($group.attr(CSS_DISABLED) !== void 0 && $group.attr(CSS_DISABLED) !== 'false'
							|| $group.attr(cn(CSS_DISABLED)) !== void 0 && $group.attr(cn(CSS_DISABLED)) !== 'false');
					group = constructor.group(name, disabled);
					groupAdd(group);
					analysisOptions(group, $group);
				}
			}
			// 解析原选项控件内的全部选项对象
			// group[ud2.select.group]: 待解析的选项组对象
			// $group[jQuery]: 待解析的选项组内容对象
			function analysisOptions(group, $group) {
				var noGroup = group === void 0,
					optionsSelector = 'option, [' + cn('option') + ']',
					$options = noGroup ? control.origin.children(optionsSelector) : $group.children(optionsSelector);

				for (var i = 0, l = $options.length, option; i < l; i++) {
					var $select = $options.eq(i),
						name = $options.eq(i).html(),
						val = $options.eq(i).val() || $options.eq(i).attr(CSS_VALUE) || $options.eq(i).attr(cn(CSS_VALUE)),
						disabled = !!($options.eq(i).attr(CSS_DISABLED) !== void 0 && $options.eq(i).attr(CSS_DISABLED) !== 'false'
							|| $options.eq(i).attr(cn(CSS_DISABLED)) !== void 0 && $options.eq(i).attr(cn(CSS_DISABLED)) !== 'false'),
						selected = !!($options.eq(i).attr(CSS_SELECTED) !== void 0 && $options.eq(i).attr(CSS_SELECTED) !== 'false'
							|| $options.eq(i).attr(cn(CSS_SELECTED)) !== void 0 && $options.eq(i).attr(cn(CSS_SELECTED)) !== 'false');

					option = constructor.option(name, val, disabled, selected);
					if (noGroup) {
						optionAdd(option);
					}
					else {
						group.optionAdd(option);
					}
				}
			}
			// 将列表移动到已选项目处
			function moveToSelected() {
				if (optionValueCollection[0]) {
					var y;
					y = optionValueCollection[0].getContent().position().top;
					listScroll.move(0, y, 0);
				}
			}

			// #endregion

			// #region 公共方法

			// 重计算高度
			// return[ud2.select]: 返回该控件对象
			function recountHeight() {
				var optionLen = optionCollection.length,
					labelLen = groupCollection.length,
					overHeight = 0;
				overHeight = optionLen * 2.5 + labelLen * 2;
				overHeight = overHeight > maxHeight ? maxHeight : overHeight;
				$list.css('height', (overHeight === 0 ? 2 : overHeight) + 'em');
				listScroll.recountPosition();
				return control.public;
			}
			// 默认文本操作
			// () 获取默认文本
			// - return[string]: 返回当前的默认文本
			// (text) 设置默认文本
			// - text[string]: 设置默认文本
			// - return[ud2.select]: 返回该控件对象
			function placeholderOperate(text) {
				if (type.isString(text)) {
					setPlaceholder(text);
					return control.public;
				}
				else {
					return placeholder;
				}
			}
			// 空列表占位文本操作
			// () 获取空列表占位文本
			// - return[string]: 返回当前的空列表占位文本
			// (text) 设置空列表占位文本
			// - text[string]: 设置空列表占位文本
			// - return[ud2.select]: 返回该控件对象
			function emptyTextOperate(text) {
				if (type.isString(text)) {
					setEmptyText(text);
					return control.public;
				}
				else {
					return emptyText;
				}
			}
			// 列表方向操作
			// () 获取列表方向
			// - return[string]: 方向状态码
			// (direction) 设置列表方向
			// - direction[ud2.select.direction]: 方向状态
			// - return[ud2.select]: 返回该控件对象
			function directionOperate(direction) {
				if (direction !== void 0) {
					setListDir(direction);
					return control.public;
				}
				else {
					return dir;
				}
			}
			// 控件选择方式操作
			// () 获取控件选择方式
			// - return[bool]: true为多选，false为单选
			// (state) 设置控件选择方式
			// - state[bool]: true为多选，false为单选
			// - return[ud2.select]: 返回该控件对象
			function multipleOperate(state) {
				var i, j;
				if (state !== void 0) {
					state = !!state;
					if (state !== isMultiple) {
						isMultiple = state;
						j = optionValueCollection.length;
						if (j > 1 && !isMultiple) {
							for (i = 0; i < j - 1; i++) {
								optionValueCollection[0].selected(0);
								optionValueCollection.splice(0, 1);
							}
						}
						if (j > 0) {
							if (isMultiple) {
								$btn.html('1个项目');
							}
							else {
								$btn.html(optionValueCollection[0].label());
							}
						}
						controlCallbacks.change.call(control.public, val());
					}

					return control.public;
				}
				else {
					return isMultiple;
				}
			}
			// 打开控件
			// return[ud2.select]: 返回该控件
			function open() {
				if (!isOpen) {
					isOpen = true;
					$select.addClass(CSS_ON).focus();
					recountHeight();
					if (isMoveSelected) moveToSelected();

					controlCallbacks.open.call(control.public);
				}
				return control.public;
			}
			// 关闭控件
			// return[ud2.select]: 返回该控件
			function close() {
				if (isOpen) {
					isOpen = false;
					$select.removeClass(CSS_ON);

					controlCallbacks.close.call(control.public);
				}
				return control.public;
			}
			// 开关控件
			// return[ud2.select]: 返回该控件
			function toggle() {
				if (isOpen) {
					close();
				} else {
					open();
				}
				return control.public;
			}
			// 获取选项控件内容对象
			// return[jQuery]: 返回选项组内容对象
			function getContent() {
				return listScroll.getContent();
			}

			// 控件值操作
			// () 获取控件值
			// - return[string]: 返回控件值
			// (arr) 设置控件值
			// - arr[array, string]: 控件值
			// - return[ud2.select]: 返回该控件对象
			function val(arr) {
				var i, valArr = [];
				if (arr !== void 0) {
					if (type.isArray(arr)) {
						arr = arr.map(function (a) { return a === null ? a : String(a); });
						for (i = optionValueCollection.length - 1; i >= 0; i--) valOption(optionValueCollection[i], false);
						for (i = 0; i < optionCollection.length; i++) {
							if (!optionCollection[i].disabled()
								&& (!optionCollection[i].group || optionCollection[i].group && !optionCollection[i].group.disabled())
								&& arr.indexOf(optionCollection[i].val()) !== -1) valOption(optionCollection[i]);
						}
					}
					else {
						return val(argsToArray(arguments));
					}
					return control.public;
				}
				else {
					for (i = 0; i < optionValueCollection.length; i++) valArr.push(optionValueCollection[i].val());
					$value.val(valArr.join(','));
					return isMultiple ? valArr : valArr[0] ? valArr[0] : null;
				}
			}
			// 控件值对象集合操作
			// () 获取控件值对象集合
			// - return[array]: 返回控件值对象集合
			// (option) 设置或取消选项对象为控件值对象
			// - option[ud2.select.option]: 待设置和取消的选项对象
			// - return[ud2.select]: 返回该控件对象
			// (option, isSelected) 强制设置或取消选项对象为控件值对象
			// - option[ud2.select.option]: 待设置和取消的选项对象
			// - isSelected: 强制设置true或取消false
			// - return[ud2.select]: 返回该控件对象
			function valOption(option, isSelected) {
				var isHave, isSelectedExist = isSelected !== void 0;
				if (option && option.type && option.type === TYPE_OPTION) {
					// 获取选项对象在选项控件中的序列位置
					isHave = optionCollection.indexOf(option);
					// 判断是否存在于选项控件中，不存在则直接跳出
					if (isHave === -1) return control.public;
					// 获取当前选项对象是否已经被选上
					isHave = optionValueCollection.indexOf(option);
					// 判断选项控件是否为多选
					if (isMultiple) {
						if (isSelectedExist
							&& (isSelected && isHave > -1 || !isSelected && isHave === -1)) return control.public;

						if ((!isSelectedExist || isSelectedExist && !isSelected)
							&& isHave > -1) {
							option.selected(0);
							optionValueCollection.splice(isHave, 1);
						}
						else if ((!isSelectedExist || isSelectedExist && isSelected)
							&& isHave === -1) {
							option.selected(1);
							optionValueCollection.push(option);
						}

						if (optionValueCollection.length === 0) {
							$btn.removeAttr(cn(CSS_VALUE)).html(placeholder);
						}
						else {
							$btn.attr(cn(CSS_VALUE), true).html(optionValueCollection.length + '个项目');
						}
					}
					else {
						if (isHave > -1 && (!isSelectedExist || isSelectedExist && isSelected)
							|| isHave === -1 && isSelectedExist && !isSelected) return control.public;

						if (optionValueCollection[0]) {
							optionValueCollection[0].selected(0);
							optionValueCollection.splice(0, 1);
						}

						// 如果强制取消选中
						if (isHave > -1 && isSelectedExist && !isSelected) {
							$btn.removeAttr(cn(CSS_VALUE)).html(placeholder);
						}
						else {
							option.selected(1);
							optionValueCollection.push(option);
							$btn.attr(cn(CSS_VALUE), true).html(option.label());
						}
					}

					controlCallbacks.change.call(control.public, val());
					return control.public;
				}
				else {
					return optionValueCollection;
				}
			}

			// 选项组添加
			// group[ud2.select.group]: 待添加的选项组对象
			// return[ud2.select]: 返回该控件对象
			function groupAdd(group) {
				var i, j;
				// 判断传入group的类型是否符合
				if (group && group.type === TYPE_GROUP
					&& !group.select) {
					// 绑定关系
					group.select = control.public;
					groupCollection.push(group);
					listScroll.getContent().append(group.getContent());
					// 如存在option，则加入option
					if (j = group.options.length, j !== 0) {
						for (i = 0; i < j; i++) {
							group.options[i].selectIn(control.public);
						}
					}
				}
				return control.public;
			}
			// 选项组移除
			// group[ud2.select.group]: 待移除的选项组对象
			// return[ud2.select]: 返回该控件对象
			function groupRemove(group) {
				var i, l;
				// 判断传入group的类型是否符合
				if (group && group.type === TYPE_GROUP
					&& group.select === control.public) {
					l = group.options.length;
					// 解绑选项对象与选项控件的关系
					if (l > 0) {
						for (i = 0; i < l; i++) {
							// 如果选项已被选中，则取消选中
							if (group.options[i].selected()) {
								// 取消选项集合中的已选状态
								valOption(group.options[i], false);
								// 恢复本对象原本的已选状态
								group.options[i].selected(1);
							}
							// 删除与选项控件的关系
							optionCollection.splice(optionCollection.indexOf(group.options[i]), 1);
							group.options[i].select = null;
						}
					}

					// 解绑选项对象与组对象的关系
					groupCollection.splice(groupCollection.indexOf(group), 1);
					group.select = null;
					group.getContent().detach();
				}
				return control.public;
			}
			// 选项添加
			// option[ud2.select.option]: 待添加的选项对象
			// return[ud2.select]: 返回该控件对象
			function optionAdd(option) {
				var len;

				// 判断传入option的类型是否符合
				if (option && option.type === TYPE_OPTION
					&& !option.select) {
					// 如果是默认分组下，绑定到选项控件的默认分组，且将选项内容对象加入到控件中
					// 如果是在选项组下，则只绑定选项对象与选项控件的关系
					if (!option.group) {
						option.select = control.public;
						optionCollection.push(option);
						optionNoGroupCollection.push(option);
						len = optionNoGroupCollection.length;
						if (len === 1) {
							listScroll.getContent().prepend(option.getContent());
						}
						else {
							optionNoGroupCollection[len - 2].getContent().after(option.getContent());
						}
					}
					else {
						option.select = control.public;
						optionCollection.push(option);
					}

					// 如果该选项状态为已选中，则在选项控件中，选中此对象
					if (option.selected()) valOption(option);
				}
				return control.public;
			}
			// 选项移除
			// option[ud2.select.option]: 待移除的选项对象
			// return[ud2.select]: 返回该控件对象
			function optionRemove(option) {
				// 判断传入option的类型是否符合
				if (option && option.type === TYPE_OPTION
					&& option.select === control.public) {
					// 如果在默认组，则清除默认组的option
					if (!option.group) optionNoGroupCollection.splice(optionNoGroupCollection.indexOf(option), 1);
					// 如果选项已被选中，则取消选中
					if (option.selected()) {
						// 取消选项集合中的已选状态
						valOption(option, false);
						// 恢复本对象原本的已选状态
						option.selected(1);
					}
					// 删除与选项控件的关系
					optionCollection.splice(optionCollection.indexOf(option), 1);
					option.select = null;
					option.getContent().detach();

					// 如果存在组，则清除组
					if (option.group) option.groupOut();
				}
				return control.public;
			}

			// #endregion

			// #region 回调方法

			// 设置开启回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.select]: 返回该控件对象
			function setOpen(fn) {
				controlCallbacks.open = fn;
				return control.public;
			}
			// 设置关闭回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.select]: 返回该控件对象
			function setClose(fn) {
				controlCallbacks.close = fn;
				return control.public;
			}
			// 设置开启回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.select]: 返回该控件对象
			function setChange(fn) {
				controlCallbacks.change = fn;
				return control.public;
			}

			// #endregion

			// #region 事件处理

			// 事件绑定
			function bindEvent() {
				event($box).setTap(toggle);
				$tab.on(FOCUS, function () {
					callbacks.ctrlClose.fire($select);
					open();
				});
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 控件初始化
				if (control.origin.length) {
					control.origin.after($select);
					control.origin.remove();
					control.transferStyles();
					control.transferAttrs({ accept: $tab, attrReg: 'tabindex' });
					control.transferAttrs({ accept: $value, attrReg: 'name' });
				}

				// 设置控件列表方向
				setListDir(dir);
				setPlaceholder(placeholder);

				// 开启滚动条
				listScroll = scroll($list, {
					barState: 0, isScrollMode: true,
					barColor: 'rgba(0,0,0,.2)',
					barColorOn: 'rgba(0,0,0,.4)'
				});
				getContent().attr(cn(CSS_EMPTY), emptyText);

				// 设置自动关闭方法
				control.autoClose = close;
				// 事件绑定
				bindEvent();

				// 更新返回对象
				updateControlPublic();
				// 解析对象
				analysisGroups();

			}());

			// #endregion

			// #region 返回

			// 更新返回对象
			function updateControlPublic() {
				extendObjects(control.public, {
					getContent: getContent,
					placeholder: placeholderOperate,
					emptyText: emptyTextOperate,
					direction: directionOperate,
					multiple: multipleOperate,
					groups: groupCollection,
					options: optionCollection,
					optionsByValue: optionValueCollection,
					optionsDefault: optionNoGroupCollection,
					groupAdd: groupAdd,
					groupRemove: groupRemove,
					optionAdd: optionAdd,
					optionRemove: optionRemove,
					val: val,
					valOption: valOption,
					open: open,
					close: close,
					toggle: toggle,
					setOpen: setOpen,
					setClose: setClose,
					setChange: setChange
				});
			}
			// 返回
			return control.public;

			// #endregion

		};

	});
	// 数字控件
	controlCreater('number', function (collection) {

		var // className存于变量
			cls = collection.className, cn = getClassName(cls);

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // 步长, 步长位数, 最小值, 最大值, 值
				step, stepDigit, min, max, value,
				// 获取用户自定义项
				options = control.getOptions(['step', 'min', 'max', CSS_VALUE], function (options) {
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
				template = '<a class="' + cn('ico') + ' ud2-ctrl-ico">&#xe106;</a>'
					+ '<div class="' + cn('move') + '"><input type="text" value="0" class="ud2-ctrl-textbox" /></div>'
					+ '<a class="' + cn('ico') + ' ud2-ctrl-ico">&#xe107;</a>',
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
				// 键盘快捷事件
				eventKeyObj,
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
					|| !isNext && value - step < min) {
					lock = false; return;
				}

				var // 临时容器标签
					tInput = '<input class="ud2-ctrl-textbox" />',
					// 建立临时容器
					$tempL = $div.clone().addClass(cn('view')).html(tInput),
					$tempR = $div.clone().addClass(cn('view')).html(tInput),
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

			// 控件值操作
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
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[number]: 当前事件对象，方便链式调用
			function setChange(fn) {
				controlCallbacks.change = fn;
				return control.public;
			}

			// #endregion

			// #region 事件处理

			// 事件绑定
			function bindEvent() {
				event($prev).setTap(prev);
				event($next).setTap(next);
				eventMouseWheel($value).setDown(next).setUp(prev);
				eventKeyObj = eventKeyShortcut({ autoOn: false })
					.add(KEYCODE.UP, prev)
					.add(KEYCODE.DOWN, next)
					.add(KEYCODE.ENTER, function () { $value.blur(); });

				$value.focus(function () {
					eventKeyObj.on();
					callbacks.ctrlClose.fire($number);
					$number.addClass(CSS_ON);
				}).blur(function () {
					eventKeyObj.off();
					setValue($value.val());
					$number.removeClass(CSS_ON);
				});
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 控件初始化
				if (control.origin.length) {
					control.origin.after($number);
					control.origin.remove();
					control.transferStyles();
					control.transferAttrs({ accept: $value, attrReg: 'name|tabindex' });
				}
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
	controlCreater('range', function (collection) {

		var // className存于变量
			cls = collection.className, cn = getClassName(cls);

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // 双手柄, 步长, 步长位数, 最小值, 最大值, 左值, 右值
				both, step, stepDigit, min, max, valueLeft, valueRight,
				// 获取用户自定义项
				options = control.getOptions([
					['both', 'isBoth'], 'min', 'max', CSS_VALUE, 'step'
				], function (options) {
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
					both = attrBoolCheck(options.both, false);
					// 数据处理
					if (min > max) max = min;

					// 获取步长位数
					if (step.toString().indexOf('.') > -1) stepDigit = step.toString().split('.')[1].length;
					else stepDigit = 0;
				}),
				// 控件结构
				template = '<input type="text" maxlength="20" class="ud2-ctrl-textbox" />'
					+ '<div class="ud2-ctrl-power"><i class="ico ico-range-x"></i><i class="ico ico-solid-cancel"></i></div>'
					+ '<div class="' + cn('list') + '"><div class="' + cn('end') + '" /><div class="' + cn('back') + '" /></div>',
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
				$left = $a.clone().addClass(cn('hand')),
				// 右侧拖拽手柄
				$right = $left.clone(),
				// 按钮背景
				$back = $list.find(cn('back', 1)),
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
				// 键盘快捷事件
				eventKeyObj,
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
				if (!both) {
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
					$range.addClass(CSS_ON);
					$power.addClass(prefixLibName + 'ctrl-power-on');

					eventKeyObj.on();
					controlCallbacks.open.call(control.public);
				}

				return control.public;
			}
			// 关闭控件
			// return[ud2.range]: 返回选项控件
			function close() {
				if (isOpen) {
					isOpen = false;
					$range.removeClass(CSS_ON);
					$power.removeClass(prefixLibName + 'ctrl-power-on');

					eventKeyObj.off();
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
			// 控件值操作
			// () 获取控件值
			// - return[number]: 返回控件值
			// - return[array]: 返回双控件值
			// (v) 设置控件值
			// - v[number, string, array]: 控件值
			// - return[ud2.range]: 返回该控件对象
			// (v, r) 设置控件值
			// - v[number]: 控件1值
			// - r[number]: 控件2值
			// - return[ud2.range]: 返回该控件对象
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
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.range]: 当前事件对象，方便链式调用
			function setOpen(fn) {
				controlCallbacks.open = fn;
				return control.public;
			}
			// 设置关闭回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.range]: 当前事件对象，方便链式调用
			function setClose(fn) {
				controlCallbacks.close = fn;
				return control.public;
			}
			// 设置值改变回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.range]: 当前事件对象，方便链式调用
			function setChange(fn) {
				controlCallbacks.change = fn;
				return control.public;
			}

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
				eventKeyObj = eventKeyShortcut({ autoOn: false }).add(KEYCODE.ENTER, function () { $value.blur(); });
				// 页面尺寸发生改变时，重新计算手柄位置
				callbacks.pageResize.add(function () {
					updateHandleInfoSize();
					setValue(valueLeft, valueRight);
				});
				$value.on('focus', inputFocus).on('blur', inputBlur);
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 手柄显示
				$back.after($left);
				if (both) $back.after($right);

				// 控件初始化
				if (control.origin.length) {
					control.origin.after($range);
					control.origin.remove();
					control.transferStyles();
					control.transferAttrs({ accept: $value, attrReg: 'name|tabindex' });
				}

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
				open: open,
				close: close,
				toggle: toggle,
				setOpen: setOpen,
				setClose: setClose,
				setChange: setChange
			});

			// #endregion

		};

	});
	// 日期选择控件
	controlCreater('date', function (collection) {

		var // className存于变量
			cls = collection.className, cn = getClassName(cls),
			// 提示字符串
			STR_TIPS = ['上一年', '下一年', '上个月', '下个月', '前12年', '后12年', '年份选择', '返回日期选择'],
			// 星期字符串
			STR_WEEK = ['日', '一', '二', '三', '四', '五', '六'],
			// 月份字符串
			STR_MONTH = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
			// 月份天数
			STR_DATE = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
			// 当前时间
			TIME = new Date();

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // 初始化默认文本  预格式化公式  日期值
				placeholder, format, dateValue,
				// 获取用户自定义项
				options = control.getOptions(['placeholder', 'format', CSS_VALUE], function (options) {
					// 初始化默认文本
					placeholder = options.placeholder || '请选择日期';
					// 初始化格式化选项
					format = options.format || 'yyyy/MM/dd';
					// 初始化日期值
					dateValue = options.value || null;
				}),
				// 日期数据对象
				dataDate = {
					// 补位运算
					// text[string]: 补位前日期
					// return[string]: 返回补位后的结果
					seats: function (text) {
						return (text.toString().length === 1 ? '0' : '') + text;
					},
					// 设置控件日期数据的 toString 方法
					// return[string]: 输出符合格式要求的日期字符串
					toString: function () {
						var f = format
							.replace(/[Yy]{4}/, this.value.getFullYear())
							.replace(/[Yy]{2}/, this.value.getFullYear() - 2000)
							.replace(/[Mm]{2}/, this.seats(this.value.getMonth() + 1))
							.replace(/[Mm]/, this.value.getMonth() + 1)
							.replace(/[Dd]{2}/, this.seats(this.value.getDate()))
							.replace(/[Dd]/, this.value.getDate());
						return f;
					},
					// 设置控件日期数据对象的值
					// y[string]: 年份
					// M[string]: 月份(1-12)
					// d[string]: 日期(1-31)
					setDateValue: function (y, m, d) {
						var oldValue = dateValue;

						if (y instanceof Date) {
							this.value = new Date(y.getTime());
							dateValue = this.toString();
						}
						else if (arguments.length === 3) {
							this.value = new Date(y, m, d);
							dateValue = this.toString();
						}
						else {
							this.value = null;
							dateValue = '';
						}
						$value.val(dateValue);

						if (oldValue !== dateValue) {
							controlCallbacks.change.call(control.public, dateValue);
						}
					},
					// 重置选择时间
					selectReset: function () {
						this.select = new Date(this.value ? this.value.getTime() : this.now.getTime());
						dateHtmlCreate();
					},
					// 系统当前时间
					now: new Date(TIME.getTime()),
					// 用户在控件上当前选择的时间
					select: new Date(TIME.getTime()),
					// 控件值格式化后的时间
					value: null
				},
				// 控件结构
				template = '<input type="text" placeholder="' + placeholder + '" maxlength="20" class="ud2-ctrl-textbox" />'
					+ '<span class="ud2-ctrl-power"><i class="ico ico-calendar"></i><i class="ico ico-solid-cancel"></i></span>'
					+ '<div class="' + cn('list') + '">'

					// 日期列表
					+ '<div class="' + cn('datelist') + '"><div class="' + cn('tools') + '">'
					+ '<div class="' + cn('tools-left') + '"><a class="ico" title="' + STR_TIPS[0] + '">&#xec00;</a><a class="ico" title="' + STR_TIPS[2] + '">&#xec01;</a></div>'
					+ '<div class="' + cn('tools-right') + '"><a class="ico" title="' + STR_TIPS[3] + '">&#xec02;</a><a class="ico" title="' + STR_TIPS[1] + '">&#xec03;</a></div>'
					+ '<div class="' + cn('tools-text') + '" title="' + STR_TIPS[6] + '">- 年 - 月</div>'
					+ '</div><table /><div class="' + cn('btns') + '"><button class="btn sm" tabindex="-1">今日</button> <button class="btn sm" tabindex="-1">清空</button></div></div>'
					// 时间列表
					+ '<div class="' + cn('ymlist') + '"><div class="' + cn('tools') + '">'
					+ '<div class="' + cn('tools-left') + '"><a class="ico" title="' + STR_TIPS[4] + '">&#xec00;</a></div>'
					+ '<div class="' + cn('tools-right') + '"><a class="ico" title="' + STR_TIPS[5] + '">&#xec03;</a></div>'
					+ '<div class="' + cn('tools-text') + '" title="' + STR_TIPS[7] + '">年份 / 月份</div>'
					+ '</div><table /><div class="' + cn('btns') + '"><button class="btn sm" tabindex="-1">确定</button></div></div>'

					+ '</div>',
				// 获取初始化的控件对象
				current = control.current,
				// 控件对象
				$date = current.html(template),
				// 输入控件
				$value = $date.children('input'),
				// 开关容器
				$power = $value.next(),
				// 日期容器
				$listDate = $date.find(cn('datelist', 1)),
				// 年份月份容器
				$listYM = $date.find(cn('ymlist', 1)),
				// 日期文本容器 
				$textDate = $date.find(cn('tools-text', 1)),
				// 年月文本容器
				$textYM = $listYM.find(cn('tools-text', 1)),
				// 今日按钮
				$todayBtn = $listDate.find(cn('btns button:eq(0)', 1)),
				// 清空按钮
				$emptyBtn = $listDate.find(cn('btns button:eq(1)', 1)),
				// 标记控件是否处于开启状态
				isOpen = false,
				// 键盘快捷事件
				eventKeyObj,
				// 回调函数
				controlCallbacks = {
					// 开启回调
					open: $.noop,
					// 关闭回调
					close: $.noop,
					// 值改变
					change: $.noop
				};

			// #endregion

			// #region 私有方法

			// 通过format转换日期到值
			// text[string]: 将字符串转换为日期
			function convertDate(text) {
				var // 格式化正则生成器
					// no[number(0-5)]: 通过编号确定获取的值
					formatRegCreate = function (no) {
						var // 待转换的正则表达式
							regStr = format
								.replace(/([\\\^\$\*\+\?\{\}\(\)\.\-\=\[\]])/g, "\\$1")
								.replace(/[Yy]{4}/, no === 0 ? '(\[0-9]{4})' : '\[0-9]{4}')
								.replace(/[Yy]{2}/, no === 1 ? '(\[0-9]{2})' : '\[0-9]{2}')
								.replace(/[Mm]{2}/, no === 2 ? '(0[1-9]|[1][012])' : '(?:0[1-9]|[1][012])')
								.replace(/[Mm]/, no === 3 ? '(1[012]|[1-9])' : '(?:1[012]|[1-9])')
								.replace(/[Dd]{2}/, no === 4 ? '(0[1-9]|[12][0-9]|3[01])' : '(?:0[1-9]|[12][0-9]|3[01])')
								.replace(/[Dd]/, no === 5 ? '([12][0-9]|3[01]|[1-9])' : '(?:[12][0-9]|3[01]|[1-9])');
						return new RegExp(regStr);
					},
					// 获取年，月，日值
					// no[number(0-2)]: 通过编号确定获取的值
					getYTDValue = function (no) {
						var // 正则表达式所获取值
							regValue;
						regValue = formatRegCreate(no * 2).exec(text);
						regValue = regValue && regValue[1];
						if (!regValue) {
							regValue = formatRegCreate(no * 2 + 1).exec(text);
							regValue = regValue && regValue[1];
						}
						return parseInt(regValue);
					},
					// 存储通过正则对当前控件值进行格式化后获取的年月日值
					y, m, d;

				if (text) {
					if (formatRegCreate().test(text)) {
						y = getYTDValue(0) || dataDate.now.getFullYear();
						m = getYTDValue(1) || 1;
						d = getYTDValue(2) || 1;
						if (y < 100) y += 2000;
					}
					else {
						// 可转换日期
						var date = new Date(text);
						if (!isNaN(date)) {
							y = date.getFullYear();
							m = date.getMonth() + 1;
							d = date.getDate();
						} else {
							y = dataDate.now.getFullYear();
							m = dataDate.now.getMonth() + 1;
							d = dataDate.now.getDate();
						}
					}

					dataDate.setDateValue(y, m - 1, d);
					dataDate.selectReset();
				}
				else {
					dataDate.setDateValue();
					dataDate.selectReset();
				}
			}
			// 日期初始化
			function dateInit() {
				var // 工具按钮
					$toolsBtn = $date.find(cn('tools a', 1));

				dateHtmlCreate();
				// 菜单按钮处理方法
				event($toolsBtn.eq(0)).setTap(function () {
					dataDate.select.setFullYear(dataDate.select.getFullYear() - 1);
					dateHtmlCreate();
				});
				event($toolsBtn.eq(3)).setTap(function () {
					dataDate.select.setFullYear(dataDate.select.getFullYear() + 1);
					dateHtmlCreate();
				});
				event($toolsBtn.eq(1)).setTap(function () {
					dataDate.select.setMonth(dataDate.select.getMonth() - 1);
					dateHtmlCreate();
				});
				event($toolsBtn.eq(2)).setTap(function () {
					dataDate.select.setMonth(dataDate.select.getMonth() + 1);
					dateHtmlCreate();
				});
				// 全部日期按钮处理方法
				event($textDate).setTap(function () {
					$listDate.slideUp(300);
					$listYM.slideDown(300);
					ymHtmlCreate();
				});
				// 今日按钮与清空按钮处理方法
				event($todayBtn).setTap(function () {
					dataDate.setDateValue(dataDate.now.getFullYear(), dataDate.now.getMonth(), dataDate.now.getDate());
					dataDate.selectReset();
					close(1);
				});
				event($emptyBtn).setTap(function () {
					dataDate.setDateValue();
					dataDate.selectReset();
					close(1);
				});
			}
			// 日期 HTML 生成
			function dateHtmlCreate() {
				var // HTML 容器
					$html = $listDate.children('table'),
					// 文本容器 
					$text = $listDate.find(cn('tools-text', 1)),
					// 存储 HTML
					html = [],
					// 闰年
					isLeapYear = dataDate.select.getFullYear() % 4 === 0,
					// 上个月
					lastMonth = dataDate.select.getMonth() - 1 < 0 ? 11 : dataDate.select.getMonth() - 1,
					// 本月天数
					monthDateNum = STR_DATE[dataDate.select.getMonth()],
					// 上个月天数
					lastMonthDateNum = STR_DATE[lastMonth],
					// 星期
					week = new Date(dataDate.select.getFullYear(), dataDate.select.getMonth(), 1).getDay(),
					// 迭代用变量	
					i, j, k;

				// 在文本容器内显示时间
				$text.html(dataDate.select.getFullYear() + ' 年 ' + (dataDate.select.getMonth() + 1) + ' 月');

				// 闰年
				if (isLeapYear && dataDate.select.getMonth() === 1) monthDateNum = 29;
				if (isLeapYear && dataDate.select.getMonth() === 2) lastMonthDateNum = 29;

				// 生成 HTML
				html.push('<tr>');
				for (i in STR_WEEK) html.push('<th>' + STR_WEEK[i] + '</th>');
				html.push('</tr><tr>');

				for (i = 0, j = -1, k = 0; i < 42; i++) {
					if (i < week) {
						j++;
						html.push('<td class="', cn('nomonth'), '">', lastMonthDateNum - week + i + 1, '</td>');
					} else {
						if (i - j <= monthDateNum) {
							html.push('<td class="',
								(i + 1) % 7 === 0 || (i + 1) % 7 === 1 ? cn('weekend') : '', '" ',
								cn('date'), '="', i - j, '" ',
								// 显示当前日期
								dataDate.select.getFullYear() === dataDate.now.getFullYear()
									&& dataDate.select.getMonth() === dataDate.now.getMonth()
									&& dataDate.now.getDate() === i - j
									? cn('today ') : '',
								// 显示选择日期
								dataDate.value && dataDate.select.getFullYear() === dataDate.value.getFullYear()
									&& dataDate.select.getMonth() === dataDate.value.getMonth()
									&& dataDate.value.getDate() === i - j
									? cn('now ') : '',
								'>', i - j, '</td>');
						}
						else {
							k++;
							html.push('<td class="', cn('nomonth'), '">', k, '</td>');
						}
					}
					if ((i + 1) % 7 === 0) {
						html.push('</tr><tr>');
					}
				}

				$html.children().remove();
				$html.append(html.join(''));

				event($html.find('[' + cn('date') + ']')).setTap(function () {
					dataDate.setDateValue(dataDate.select.getFullYear(),
						dataDate.select.getMonth(), this.attr(cn('date')));
					$value.blur();
					close(1);
				});
			}
			// 年份月份初始化
			function ymInit() {
				var // 工具按钮
					$toolsBtn = $listYM.find(cn('tools a', 1)),
					// 底部按钮
					$bottomBtn = $listYM.find(cn('btns button', 1));

				ymHtmlCreate();

				event($toolsBtn.eq(0)).setTap(function () {
					dataDate.select.setFullYear(dataDate.select.getFullYear() - 12);
					ymHtmlCreate();
				});
				event($toolsBtn.eq(1)).setTap(function () {
					dataDate.select.setFullYear(dataDate.select.getFullYear() + 12);
					ymHtmlCreate();
				});
				event($bottomBtn.eq(0)).setTap(function () {
					$listDate.slideDown(300);
					$listYM.slideUp(300);
					dateHtmlCreate();
				});

				event($textYM).setTap(function () {
					$listDate.slideDown(300);
					$listYM.slideUp(300);
					dateHtmlCreate();
				});
			}
			// 年份月份 HTML 生成
			function ymHtmlCreate() {
				var $html = $listYM.children('table'),
					html = [], yearFirst = 0,
					yearAttr = cn('year'), yearSelector = '[' + yearAttr + ']',
					monthAttr = cn('month'), monthSelector = '[' + monthAttr + ']',
					nowAttr = cn('now'), i;

				yearFirst = dataDate.select.getFullYear() % 12 === 0
					? dataDate.select.getFullYear() - 11
					: parseInt(dataDate.select.getFullYear() / 12) * 12 + 1;

				html.push('<tr><td>');
				for (i = 0; i < 12; i++) {
					html.push('<div ',
						cn('year'), '="', yearFirst + i, '" ',
						// 显示选择日期
						dataDate.select.getFullYear() === yearFirst + i ? nowAttr : '',
						'>', yearFirst + i, '</div>');
				}
				html.push('</td><td>');
				for (i = 0; i < 12; i++) {
					html.push('<div ',
						cn('month'), '="', i, '" ',
						// 显示选择日期
						dataDate.select.getMonth() === i ? nowAttr : '',
						'>', STR_MONTH[i], '</div>');
				}
				html.push('</td></tr>');
				$html.children().remove();
				$html.append(html.join(''));

				event($html.find(yearSelector)).setTap(function () {
					dataDate.select.setFullYear(this.attr(yearAttr));
					$html.find(yearSelector).removeAttr(nowAttr);
					this.attr(nowAttr, '');
				});

				event($html.find(monthSelector)).setTap(function () {
					dataDate.select.setMonth(this.attr(monthAttr));
					$html.find(monthSelector).removeAttr(nowAttr);
					this.attr(nowAttr, '');
				});
			}
			// 设置控件的默认文本
			// text[string]: 待设置的文本
			function setPlaceholder(text) {
				placeholder = text;
				$value.attr('placeholder', placeholder);
			}
			// 设置控件的预格式化公式
			// text[string]: 待设置的预格式化公式
			function setFormat(text) {
				format = text;
				dataDate.setDateValue(dataDate.value);
			}

			// #endregion

			// #region 公共方法

			// 默认文本操作
			// () 获取默认文本
			// - return[string]: 返回当前的默认文本
			// (text) 设置默认文本
			// - text[string]: 设置默认文本
			// - return[ud2.select]: 返回该控件对象
			function placeholderOperate(text) {
				if (type.isString(text)) {
					setPlaceholder(text);
					return control.public;
				}
				else {
					return placeholder;
				}
			}
			// 预格式化公式操作
			// () 获取预格式化公式
			// - return[string]: 返回当前的预格式化公式
			// (text) 设置预格式化公式
			// - text[string]: 设置预格式化公式
			// - return[ud2.select]: 返回该控件对象
			function formatOperate(text) {
				if (type.isString(text)) {
					setFormat(text);
					return control.public;
				}
				else {
					return format;
				}
			}
			// 开启控件
			// return[ud2.date]: 返回该控件对象
			function open() {
				if (!isOpen) {
					isOpen = true;
					$date.addClass(CSS_ON);
					$power.addClass(prefixLibName + 'ctrl-power-on');
					$listDate.show();
					$listYM.hide();

					eventKeyObj.on();
					controlCallbacks.open.call(control.public);
				}
				return control.public;
			}
			// 关闭控件
			// (?) noUpdate[bool]: 不进行值检测
			// return[ud2.date]: 返回该控件对象
			function close(noUpdate) {
				var val;
				if (isOpen) {
					isOpen = false;
					$date.removeClass(CSS_ON);
					$power.removeClass(prefixLibName + 'ctrl-power-on');

					if (!noUpdate) {
						val = $value.val();
						if (val === '') convertDate();
						else convertDate(val);
					}

					dateHtmlCreate();
					eventKeyObj.off();
					controlCallbacks.close.call(control.public);
				}
				return control.public;
			}
			// 开关控件
			// return[ud2.date]: 返回该控件对象
			function toggle() {
				if (!isOpen) {
					open();
				} else {
					close();
				}
				return control.public;
			}
			// 控件值操作
			// () 获取控件值
			// - return[string]: 返回控件值
			// (v) 设置控件值
			// - return[ud2.date]: 返回该控件对象
			function val(v) {
				if (v !== void 0) {
					convertDate(v);
					return control.public;
				}
				else {
					return dateValue;
				}
			}

			// #endregion

			// #region 回调方法

			// 设置开启回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.date]: 返回日期控件
			function setOpen(fn) {
				controlCallbacks.open = fn;
				return control.public;
			}
			// 设置关闭回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.date]: 返回日期控件
			function setClose(fn) {
				controlCallbacks.close = fn;
				return control.public;
			}
			// 设置开启回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.date]: 返回日期控件
			function setChange(fn) {
				controlCallbacks.change = fn;
				return control.public;
			}

			// #endregion

			// #region 事件处理

			// 输入框获取焦点事件回调
			function inputFocus() {
				callbacks.ctrlClose.fire($date);
				open();
			}
			// 事件绑定
			function bindEvent() {
				event($power).setTap(toggle);
				eventKeyObj = eventKeyShortcut({ autoOn: false })
					.add(KEYCODE.ENTER, function () { $value.blur(); close(); })
					.add(KEYCODE.LEFT, function () {
						if (dataDate.value !== null) convertDate(dataDate.value.setDate(dataDate.value.getDate() - 1));
					})
					.add(KEYCODE.RIGHT, function () {
						if (dataDate.value !== null) convertDate(dataDate.value.setDate(dataDate.value.getDate() + 1));
					})
					.add(KEYCODE.UP, function () {
						if (dataDate.value !== null) convertDate(dataDate.value.setDate(dataDate.value.getDate() - 7));
					})
					.add(KEYCODE.DOWN, function () {
						if (dataDate.value !== null) convertDate(dataDate.value.setDate(dataDate.value.getDate() + 7));
					});

				$value.on('focus', inputFocus);
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 控件初始化
				if (control.origin.length) {
					control.origin.after($date);
					control.origin.remove();
					control.transferStyles();
					control.transferAttrs({ accept: $value, attrReg: 'name|tabindex' });
				}
				// 设置自动关闭方法
				control.autoClose = close;

				// 格式化控件值
				convertDate(dateValue);

				// 对日期容器与年月份容器初始化
				dateInit();
				ymInit();

				// 事件绑定
				bindEvent();
			}());

			// #endregion

			// #region 返回

			return extendObjects(control.public, {
				placeholder: placeholderOperate,
				format: formatOperate,
				val: val,
				open: open,
				close: close,
				toggle: toggle,
				setOpen: setOpen,
				setClose: setClose,
				setChange: setChange
			});

			// #endregion

		};

	});

	// 文件上传控件
	controlCreater('file', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = getClassName(cls),
			// 错误常量
			ERR_LENGTH = 'length-error', ERR_TYPE = 'type-error', ERR_SIZE = 'size-error',
			ERR_REPEAT = 'repeat-error', ERR_SERVER = 'server-error', ERR_SERVER_RETURN = 'server-return-error',
			// 生成控件类型
			styles = createStyle(STYLE_NAME[0], STYLE_NAME[1], STYLE_NAME[2]);

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
					rename = attrBoolCheck(options.rename, true);
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
					if (!styles[style]) style = STYLE_NAME[2];
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
				fileAdd = convertToJQ(fileAdd);
				event(fileAdd, { stopPropagation: true }).setTap(function () {
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
				fileRemove = convertToJQ(fileRemove);
				event(fileRemove, { stopPropagation: true }).setTap(function () {
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
				fileUpload = convertToJQ(fileUpload);
				event(fileUpload, { stopPropagation: true }).setTap(function () {
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
				fileClear = convertToJQ(fileClear);
				event(fileClear, { stopPropagation: true }).setTap(function () {
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
				if (style === STYLE_NAME[1]) return constructor.standard(control.public);

			}());

			// #endregion

			// #region 返回

			// 更新返回对象
			function updateControlPublic() {
				extendObjects(control.public, {
					style: extendObjects(fileStyle, {
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
					$boxInput.on(EVENT_DOWN, function (event) {
						event.preventDefault();
						$(this).select();
					}).on(BLUR, function () {
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

				$default = $div.clone().addClass(cn('full'));
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
			$dom.on(EVENT_DOWN, function (event) {
				var typeName = 'ctrlCloseEvent', type = event.type, domType = $dom.data(typeName);
				if (!domType || type === domType) {
					$dom.data(typeName, type);
					callbacks.ctrlClose.fire(event.target);
				}
				if (type === 'mousedown') $dom.data(typeName, null);
			});

			// 默认事件处理
			// 消息关闭事件处理
			$dom.on(EVENT_DOWN, '.message:not([ud2]) .message-close', function () {
				$(this).parent().remove();
			});
		});

		// 窗口尺寸改变事件
		$win.on('resize orientationchange', function () {
			callbacks.pageResize.fire();
		});
		// 文档发生按键抬起的回调对象
		$dom.on('keydown', function (event) {
			callbacks.keyDown.fire(event, event.keyCode, event.ctrlKey, event.altKey, event.shiftKey);
		}).on('keyup', function (event) {
			callbacks.keyUp.fire(event, event.keyCode, event.ctrlKey, event.altKey, event.shiftKey);
		});

		// 当页面读取完成时，创建全部控件
		callbacks.pageReady.add(ud2.createAllControl);
	}());

	// 返回控件
	return extendObjects(ud2, {
		// 对象扩展方法
		extend: extendObjects,
		merge: mergeObjects,
		clone: cloneObjects,
		propertier: propertier,
		deviceScreenState: deviceScreenState,
		creater: creater,
		controlCreater: controlCreater,
		// 公共支持情况及类型处理
		type: type,
		convert: convert,
		form: form,
		support: support,
		// 公开库基础样式
		style: style,
		color: color,
		// 公共对象
		common: {
			// 键盘代码
			key: KEYCODE,
			// 正则表达式
			regex: {
				date: REGEX_DATE,
				mail: REGEX_MAIL,
				phone: REGEX_PHONE,
				identityCard: REGEX_IDENTITYCARD,
				loginName: REGEX_LOGINNAME,
				percent: REGEX_PERCENT,
				nonNegative: REGEX_NONNEGATIVE
			}
		},
		// 公开库事件
		event: event,
		eventMouseWheel: eventMouseWheel,
		eventKeyShortcut: eventKeyShortcut,
		scroll: scroll
	});

	// #endregion

}(window, jQuery));
