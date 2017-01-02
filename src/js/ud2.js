/// <reference path="../../vendor/js/jquery.js" />

if (typeof jQuery === 'undefined') throw new Error('ud2库需要JQuery支持');
(function (window, $) {
	'use strict';

	// #region 字段

	var // 常用页面元素对象
		document = window.document,
		$win = $(window), $dom = $(document), $body,

		// 库名称
		libName = 'ud2',
		// 库前缀
		prefixLibName = libName + '-',
		// internal对象，用于调用内部字段及方法
		internal = {},
		// ud2对象，公开对象
		ud2 = {},
		// 正则表达式	
		regex = {
			// 日期正则表达式
			// 可以匹配xxxx(-|.|/)x{1,2}(-|.|/)x{1,2}
			date: /^(?:[12]\d{3}([\.\-\/])(?:(?:0?[13578]|1[02])\1(?:0?[1-9]|[12]\d|3[01])|(?:0?[469]|11)\1(?:0?[1-9]|[12]\d|30)|0?2\1(?:0?[1-9]|1\d|2[0-8]))$|[12]\d(?:[02468][048]|[13579][26])([\.\-\/])(?:(?:0?[13578]|1[02])\2(?:0?[1-9]|[12]\d|3[01])|(?:0?[469]|11)\2(?:0?[1-9]|[12]\d|30)|0?2\2(?:0?[1-9]|1\d|2[0-9])))$/,
			// 邮箱正则表达式
			mail: /^([\w-\.]+)@(([\w-]+\.)+)([a-zA-Z]{2,4})$/,
			// 国内手机号码正则表达式
			phone: /^[1][34578][0-9]{9}$/,
			// 身份证正则表达式
			// 此表达式未添加地区判断与补位运算
			idCard: /^(11|12|13|14|15|21|22|23|31|32|33|34|35|36|37|41|42|43|44|45|46|50|51|52|53|54|61|62|63|64|65|71|81|82|97|98|99)[0-9]{4}((?:19|20)?(?:[0-9]{2}(?:(?:0[13578]|1[12])(?:0[1-9]|[12][0-9]|3[01])|(?:0[469]|11)(?:0[1-9]|[12][0-9]|30)|02(?:0[1-9]|1[0-9]|2[0-8]))|(?:[02468][048]|[13579][26])0229)[0-9]{3}[\dxX])$/,
			// 登录名正则表达式
			loginName: /^[a-zA-Z][a-zA-Z0-9]+$/,
			// 百分数正则表达式
			percent: /^(100|([0-9]|[1-9][0-9])(\.[0-9]+)?)%$/,
			// 非负数正则表达式
			nonNegative: /^([0-9]|[1-9][0-9]+)(\.[0-9]+)?$/,
			// 非负整数(自然数)正则表达式
			naturalNumber: /^([1-9]\d+|[0-9])$/
		},
		// 类型检测
		type = {
			// 判断参数类型isType(TypeName)(Value)
			// type[object]: 判断的参数类型 例如Function、Array...
			// return[function]: 返回一个方法，此方法来判断传入的Value参数是否为TypeName类型
			isType: function (type) {
				return function (obj) {
					return {}.toString.call(obj) === '[object ' + type + ']';
				};
			},
			// 判断传入参数是否为一个对象Object
			// typeValue[object]: 判断变量
			// return[bool]: 返回一个布尔值，此布尔值表示传入的typeValue参数是否为对象
			isObject: function (typeValue) {
				return type.isType("Object")(typeValue);
			},
			// 判断传入参数是否为一个方法Function
			// typeValue[object]: 判断变量
			// return[bool]: 返回一个布尔值，此布尔值表示传入的typeValue参数是否为方法
			isFunction: function (typeValue) {
				return type.isType("Function")(typeValue);
			},
			// 判断传入参数是否为一个字符串String 
			// typeValue[object]: 判断变量
			// return[bool]: 返回一个布尔值，此布尔值表示传入的typeValue参数是否为字符串
			isString: function (typeValue) {
				return type.isType("String")(typeValue);
			},
			// 判断传入参数是否为一个布尔值boolean 
			// typeValue[object]: 判断变量
			// return[bool]: 返回一个布尔值，此布尔值表示传入的typeValue参数是否为布尔值
			isBoolean: function (typeValue) {
				return type.isType("Boolean")(typeValue);
			},
			// 判断传入参数是否为一个数字Number
			// typeValue[object]: 判断变量
			// return[bool]: 返回一个布尔值，此布尔值表示传入的typeValue参数是否为数字
			isNumber: function (typeValue) {
				return type.isType("Number")(typeValue);
			},
			// 判断传入参数是否为一个非负整数
			// typeValue[object]: 判断变量
			// return[bool]: 返回一个布尔值，此布尔值表示传入的typeValue参数是否为自然数
			isNaturalNumber: function (typeValue) {
				return regex.naturalNumber.test(typeValue);
			},
			// 判断传入参数是否为一个jQuery对象
			// typeValue[object]: 判断变量
			// return[bool]: 返回一个布尔值，此布尔值标识传入的typeValue参数是否为jQuery对象
			isJQuery: function (typeValue) {
				return typeValue instanceof $;
			},
			// 判断传入参数是否为一个数组对象
			// typeValue[object]: 判断变量
			// return[bool]: 返回一个布尔值，此布尔值标识传入的typeValue参数是否为数组对象
			isArray: function (typeValue) {
				return Array.isArray(typeValue);
			},
			// 判断传入参数是否为一个时间对象
			// typeValue[object]: 判断变量
			// return[bool]: 返回一个布尔值，此布尔值标识传入的typeValue参数是否为时间对象
			isDatetime: function (typeValue) {
				return typeValue instanceof Date;
			}
		},
		// 浏览器支持情况
		support = (function () {
			var div = document.createElement('div'),
				u = window.navigator.userAgent, ipod, ipad, iphone, mac, apple;

			return {
				// 判断是否为IPAD
				ipad: !!u.match(/ipad/i),
				// 判断是否为IPHONE
				iphone: !!u.match(/iphone/i),
				// 判断似乎否为手持设备
				ipod: !!u.match(/ipod/i),
				// 判断是否为MAC
				mac: !!u.match(/macintosh/i),
				// 判断是否为苹果平台
				apple: !!u.match(/(ipad|iphone|ipod|macintosh)/i),
				// 判断是否为安卓平台
				andjroid: u.indexOf('Android') > -1,
				// 判断是否为移动终端
				mobile: !!u.match(/mobile|mobi|mini/i),
				// 判断是否支持Touch触摸事件
				touch: 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch,
				// 判断是否支持Pointer事件
				pointer: window.navigator.pointerEnabled,
				// 判断是否支持MSPointer事件(IE10)
				msPointer: window.navigator.msPointerEnabled,
				// 判断是否支持[CSS]touchAction(msTouchAction)
				touchAction: div.style.touchAction !== void 0 || div.style.msTouchAction !== void 0 || false,
				// 判断是否支持[CSS]prespective
				perspective: div.style.perspective !== void 0
					|| div.style.msPerspective !== void 0
					|| div.style.mozPerspective !== void 0
					|| div.style.webkitPerspective !== void 0
					|| false,
				// 判断是否支持[CSS]transition
				transition: div.style.transition !== void 0
					|| div.style.msTransition !== void 0
					|| div.style.mozTransition !== void 0
					|| div.style.webkitTransition !== void 0
					|| false,
				// 判断是否支持[CSS]animation
				animation: div.style.animation !== void 0
					|| div.style.msAnimation !== void 0
					|| div.style.mozAnimation !== void 0
					|| div.style.webkitAnimation !== void 0
					|| false
			};
		}()),
		// 表单检测
		form = (function () {
			// 强制设定text类型为string
			function textTypeHandler(text) {
				if (!text) return '';
				return String(text);
			}

			return {
				// 检测字符串是否符合长度规定
				// text[string]: 待检测的字符串
				// (text, length) 监测字符串是否符合 length 长度规范
				// - length[number]: 长度
				// (text, length, maxLength) 监测字符串是否符合 length - maxLength 区间
				// - length[number]: 最小长度
				// - maxLength[number]: 最大长度
				// return[bool]: 是否符合长度规定
				isLength: function (text, length, maxLength) {
					text = textTypeHandler(text);
					length = length || Number.MAX_VALUE;
					// 判断是否符合最小值和最大值的长度
					if (maxLength !== void 0) {
						if (maxLength < length) maxLength = length;
						return text.length <= maxLength && text.length >= length;
					}
					else {
						return text.length === length;
					}
				},
				// 检测字符串是否符合最小长度规定
				// text[string]: 待检测的字符串
				// length[number]: 最小长度
				// return[bool]: 是否符合长度规定
				isMinLength: function (text, length) {
					text = textTypeHandler(text);
					length = length || 0;
					return text.length >= length;
				},
				// 检测字符串是否符合最大长度规定
				// text[string]: 待检测的字符串
				// length[number]: 最大长度
				// return[bool]: 是否符合长度规定
				isMaxLength: function (text, length) {
					text = textTypeHandler(text);
					length = length || Number.MAX_VALUE;
					return text.length <= length;
				},
				// 检测字符串是否符合手机号规范
				// text[string]: 待检测的字符串
				// return[bool]: 是否符合手机号规范
				isPhone: function (text) {
					text = textTypeHandler(text);
					return regex.phone.test(text);
				},
				// 检测字符串是否符合邮箱规范
				// text[string]: 待检测的字符串
				// return[bool]: 是否符合邮箱规范
				isMail: function (text) {
					text = textTypeHandler(text);
					return regex.mail.test(text);
				},
				// 检测字符串是否符合日期规范
				// text[string]: 待检测的字符串
				// return[bool]: 是否符合日期规范
				isDate: function (text) {
					text = textTypeHandler(text);
					return regex.date.test(text);
				},
				// 检测字符串是否符合用户名规范
				// text[string]: 待检测的字符串
				// return[bool]: 是否符合用户名规范
				isLoginName: function (text) {
					text = textTypeHandler(text);
					return regex.loginName.test(text);
				},
				// 检测字符串是否符合身份证规范
				// text[string]: 待检测的字符串
				// return[bool]: 是否符合身份证号规范
				isIDCard: function () {
					text = textTypeHandler(text);
					text = text.toUpperCase();
					if (regex.idCard.test(text)) {
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
			};
		}()),
		// 样式
		style = (function () {
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
		}()),
		// 颜色
		color = (function () {
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
		}()),
		// 回调
		callbacks = {
			// 页面完成加载时的回调对象
			pageReady: $.Callbacks(),
			// 页面尺寸改变时的回调对象
			pageResize: $.Callbacks(),
			// 控件完全关闭的回调对象
			autoClose: $.Callbacks(),
			// 文档发生按键按下时的回调对象
			keyDown: $.Callbacks(),
			// 文档发生按键抬起时的回调对象
			keyUp: $.Callbacks()
		},
		
		// 位置名称组合
		anPos = ['center', 'full-screen', 'top-left', 'top-right', 'top-center', 'bottom-left', 'bottom-right', 'bottom-center'],
		// 事件名称组合
		anEvent = (function(){
			var arr = [support.pointer ? 'pointerdown' : 'MSPointerDown',
					support.pointer ? 'pointermove' : 'MSPointerMove',
					support.pointer ? 'pointerup' : 'MSPointerUp',
					support.pointer ? 'pointercancel' : 'MSPointerCancel',
					'touchstart', 'touchmove', 'touchend', 'touchcancel',
					'mousedown', 'mousemove', 'mouseup', 'mouseout',
					'mouseenter', 'mouseleave', 'keydown', 'keypress', 'keyup',
					'focus', 'blur', 'click'];

			arr[20] = [arr[0], arr[4], arr[8]].join(' ');
			return arr;
		}()),
		// 键盘编码
		keyCode = {
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

		// 常用元素组合(jquery elements)
		jqe = [$('<div />'), $('<span />'), $('<a />')],
		// 用于转换abcDef到abc-def模式的正则表达式
		attrTranslateRegex = /(^[a-z0-9]{1,}|[A-Z][a-z0-9]{0,})/g,
		// 用于存放通过属性名称转换后得到的结果的数组
		// 目的是为了减少正则匹配的调用，以便减少不必要的系统资源损失
		attrTranslateGroup = {},

		// 种子
		seed = {},
		// 空方法
		noop = function () { },
		// 窗口发生尺寸改变时延迟回调时间
		resizeDelayTime = 120,
		// 窗口发生尺寸改变时
		resizeDelayTimer,
		// 返回页面是否加载完成
		pageLoaded = false;

	// #endregion

	// #region 私有方法

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
	// return[string]: 返回控件对象名称
	function getControlNameByName(name) {
		var nameArr = name.split('-'), i = 1, l = nameArr.length;
		if (l > 1) for (; i < l; i++)
			if (nameArr[i].length > 0) {
				nameArr[i] = nameArr[i].substr(0, 1).toUpperCase() + nameArr[i].substr(1);
			}
		return nameArr.join('');
	}
	// 获取当前时间
	// return[date]: 返回当前时间
	function getTime() {
		return Date.now && Date.now() || new Date().getTime();
	}

	// #endregion

	// #region 内部方法

	// 为未命名控件生成id，也可以为子控件生成子控件id
	// 生成的id从编号0开始顺延
	// (?) seedName[string]: 如果生成子控件id，传入子控件名称，否则为空
	// return[string]: 返回生成的控件id
	function createControlID(seedName) {
		if (!seedName) seedName = 'id';
		if (!seed[seedName]) seed[seedName] = 0;
		return seedName === 'id'
			? prefixLibName + seed[seedName]++
			: prefixLibName + seedName + '-' + seed[seedName]++;
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
	// 生成带有库或控件前缀的css类名
	// cls[string]: 控件当前的css类名
	// return[function]: 返回一个方法用来生成指定的css类名
	// - (str, point)
	//   - str[string]: 用于组合类名的后缀
	//   - (?) point[bool]: 是否在前缀前加'.'，一般用于children、find等后代元素查询方法
	function getClassName(cls) {
		return function cn(str, point) {
			str = str || '';
			point = point === void 0 ? false : point;
			return (point ? '.' : '') + cls + '-' + str;
		};
	}
	// 获取属性值
	// $element[jQuery]: 待检测的元素
	// attrName[string]: 待检测的属性名
	// prefixName[string]: 属性名前缀
	// defaultVal[bool]: 当不存在值时给定的默认值
	// return[string]: 返回获取到的属性值
	function getAttrValue($element, attrName, prefixName, defaultVal) {
		var val;
		$element = convertToJQ($element);
		val = $element.attr(attrName);
		if (val === void 0 && prefixName) val = $element.attr(prefixName + '-' + attrName);
		if (val === void 0) val = defaultVal;
		return val;
	}
	// 将传入参数强制转换为jQuery对象
	// jq[jQuery, string, object]: 待转换值
	// return[jQuery]: 转换后的jQuery对象
	function convertToJQ(jq) {
		if (!type.isJQuery(jq)) jq = $(jq);
		return jq;
	}
	// 布尔值检测
	// val[object]: 待检测的值
	// defaultVal[bool]: 默认为是或否
	// return[bool]: 返回检测后的状态
	function boolCheck(val, defaultVal) {
		if (val === void 0) {
			return defaultVal;
		}
		else {
			if (val === 'true' || val === '1') return true;
			else if (val === 'false' || val === '0') return false;
			return !!val;
		}
	}
	// 参数转数组
	// args[arguments]: 待转换的参数
	function argsToArray(args) {
		return Array.prototype.slice.call(args);
	}
	// 遮罩层
	function backmask() {
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
			if (callerAdd(caller)) $backmask.addClass('on');
			return backmaskObj;
		}
		// 关闭遮罩层
		// caller[object]: 调用遮罩层的对象
		function close(caller) {
			if (callerRemove(caller) && !callerCollection.length) $backmask.removeClass('on');
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

	// #endregion

	// #region 公共方法
	
	// 对象扩展
	// 将扩展对象属性添加到原对象中
	// origin[object]: 原对象
	// source[object]: 扩展对象
	// return[object]: 返回扩展后的原对象
	function extendObjects(origin, source) {
		if (!type.isObject(origin)) origin = {};
		if (!type.isObject(source)) source = {};
		for (var i in source) origin[i] = source[i];
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

	// #region 控件相关方法

	// 迭代创建控件
	// $controls[jquery]: 待创建控件的jquery对象
	function createControl($controls) {
		// 迭代元素
		$controls.each(function () {
			var // 获取当前元素
				$this = $(this), lazySign = libName + '-lazy';

			// 遇懒加载属性，生成库属性
			if ($this.attr(lazySign)) $this.attr(libName, $this.attr(lazySign));

			getNames($this).forEach(function (item, index) {
				var // 通过控件类型名称获取控件对象名称
					controlName = getControlNameByName(item),
					// 获取此空间是否被创建
					isCreated = $this.attr(prefixLibName + item + '-ready'),
					// 控件ID
					id = $this.attr(prefixLibName + 'id') || null;

				if (!isCreated) {
					if (id) ud2[controlName].create(id, $this);
					else ud2[controlName].create($this);
				}
			});
		});
	}
	// 初始化全部未初始化的控件
	// 在页面初始化完成后，会自动调用此方法
	// 标记 ud2='control-name'
	function createAllControl() {
		createControl($('[' + libName + ']'));
	}
	// 初始化全部懒加载控件
	// 懒加载标记 ud2-lazy='control-name'
	function createLazyControl() {
		createControl($('[' + libName + '-lazy]'));
	}
	// 设置库准备完成时的回调方法
	// fn[function]: 准备完成后执行的回调方法
	function libReady(fn) {
		if (type.isFunction(fn)) {
			if (pageLoaded) fn();
			else callbacks.pageReady.add(fn);
		}
	}

	// 控件基础对象
	// 生成的全部控件是由此继承而来
	// type[string]: 控件类型
	function control(controlType) {
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
				current: jqe[0].clone(),
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
				autoClose: noop,
				// 控件移除
				remove: function () {
					var index = this.public.collection.indexOf(this), i;
					callbacks.autoClose.remove(autoClose);
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
			callbacks = callbacks || noop;
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
		callbacks.autoClose.add(autoClose);

		// 返回控件对象
		return control;
	}
	// 控件对象集合基类
	// 生成的全部控件对象集合是由此继承而来
	// name[string]: 控件名称
	function controlCollection(name) {
		var // 控件集合对象
			collection = {
				// 控件集合对象公开对象
				public: [],
				// 控件集合初始化函数
				init: noop,
				// 控件集合名称
				name: name,
				// 控件对象名称
				ctrlName: getControlNameByName(name),
				// 控件默认样式类
				className: prefixLibName + name
			};
		// 返回集合组
		return collection;
	}
	// ud2库扩展对象创建器
	// name[string]: 将创建出的对象绑定在库的名为name属性上
	// callbacks[function]: 创建完成后所执行的回调函数
	// (?) parent[object]: 如存在，将绑定到该对象的name属性上，而非ud2
	// return[object]: 返回创建完成的库扩展对象
	function creater(name, createHandler, baseObject) {
		// 强制createHandler的类型为function
		if (!type.isFunction(createHandler)) createHandler = noop;

		function constructor() {
			return createHandler.apply(constructor, arguments);
		}

		// 将create方法绑定到扩展对象
		constructor.create = createHandler;
		// 向库或baseObject中公开
		if (!baseObject) {
			ud2[name] = constructor;
		}
		else {
			baseObject[name] = constructor;
		}

		// 返回创建后的对象
		return constructor;
	}
	// 创建一个控件类
	// name[string]: 控件类名称
	// callbacks[function]: 创建回调，用于对控件的初始化操作
	// return[function]: 创建控件的构造函数 
	function controlCreater(name, callbacks) {
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
	}

	// 库扩展
	// callbacks[function]: 回调方法
	function libExtend(callbacks) {
		callbacks(internal, ud2);
	}

	// #endregion

	// #region 事件

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
				pan: noop,
				// 短按，通过tapMaxTime来界定短按与长按
				tap: noop,
				// 长按
				press: noop,
				// 快速左滑动，通过swpieMaxTime来界定快速滑动与否
				swipeLeft: noop,
				// 快速右滑动
				swipeRight: noop,
				// 快速上滑动
				swipeTop: noop,
				// 快速下滑动
				swipeBottom: noop,
				// 按下
				down: noop,
				// 抬起
				up: noop
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

			var // 触点集合
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
					$dom.on(anEvent[1], pointerMove);
					// 绑定up事件
					$dom.on(anEvent[2], pointerUp);
					// 绑定cancel事件
					$dom.on(anEvent[3], pointerUp);
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
					$dom.off(anEvent[1], pointerMove);
					$dom.off(anEvent[2], pointerUp);
					$dom.off(anEvent[3], pointerUp);
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
						origin.on(anEvent[5], touchMove);
						origin.on(anEvent[6], touchEnd);
						origin.on(anEvent[7], touchEnd);
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
					$dom.on(anEvent[9], mouseMove);
					// 绑定up事件
					$dom.on(anEvent[10], mouseUp);
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
					origin.off(anEvent[5], touchMove);
					origin.off(anEvent[6], touchEnd);
					origin.off(anEvent[7], touchEnd);
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
				$dom.off(anEvent[9], mouseMove);
				// 解绑up事件
				$dom.off(anEvent[10], mouseUp);
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
						origin.on(anEvent[0], pointerDown);
					}
					else {
						origin.on(anEvent[4] + ' ' + anEvent[8], eventStart);
					}

					origin.css({
						'-ms-touch-action': 'none',
						'touch-action': 'none'
					});
				} else {
					if (pointer) {
						origin.off(anEvent[0], pointerDown);
					} else {
						origin.off(anEvent[4] + ' ' + anEvent[8], eventStart);
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
				scroll: noop,
				// 向下
				down: noop,
				// 向上
				up: noop
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

	// #region 初始化

	// 初始化
	(function init() {
		// 当文档加载完成时的回调方法
		$dom.ready(function () {
			// 获取 body 对象
			$body = $('body');
			// 如果是 Safari 浏览器则为 body 添加 touchstart 事件监听
			// 用途是解决 :hover :active 等伪类选择器延迟的问题
			if (support.apple) document.body.addEventListener(anEvent[4], $.noop);
			// 执行 PageReady 的回调函数
			callbacks.pageReady.fire();
			// 网页加载完成标记
			pageLoaded = true;

			// 当用户触碰屏幕且未触碰任何有价值(无效触碰)控件时，执行页面触碰按下的事件回调
			// 用途是解决部分控件当触碰控件外时执行相应回调方法
			$dom.on(anEvent[20], function (event) {
				var typeName = 'ctrlCloseEvent', type = event.type, domType = $dom.data(typeName);
				if (!domType || type === domType) {
					$dom.data(typeName, type);
					callbacks.autoClose.fire(event.target);
				}
				if (type === anEvent[8]) $dom.data(typeName, null);
			});

			// 默认事件处理
			// 消息关闭事件处理
			$dom.on(anEvent[20], '.message:not([ud2]) .message-close', function () {
				$(this).parent().remove();
			});
		});

		// 窗口尺寸改变事件
		$win.on('resize orientationchange', function () {
			if (resizeDelayTimer) window.clearTimeout(resizeDelayTimer);
			resizeDelayTimer = window.setTimeout(function () {
				var w = $win.width(), h = $win.height();
				callbacks.pageResize.fire(w, h);
			}, resizeDelayTime);
		});
		// 文档发生按键抬起的回调对象
		$dom.on(anEvent[14], function (event) {
			callbacks.keyDown.fire(event, event.keyCode, event.ctrlKey, event.altKey, event.shiftKey);
		}).on(anEvent[16], function (event) {
			callbacks.keyUp.fire(event, event.keyCode, event.ctrlKey, event.altKey, event.shiftKey);
		});

		// 当页面读取完成时，创建全部控件
		callbacks.pageReady.add(createAllControl);
	}());

	// #endregion

	// #region 生成内部和外部调用对象

	// 扩展internal对象
	extendObjects(internal, {
		// 类库公共前缀
		prefix: prefixLibName,
		// 用于克隆对象
		jqe: jqe,
		// 名称组合(array names)
		an: {
			pos: anPos,
			event: anEvent
		},
		// 空操作方法
		noop: noop,
		// 遮罩层对象
		backmask: backmask(),
		// 内部方法
		win: function () { return $win; },
		body: function () { return $body; },
		argsToArray: argsToArray,
		attrValue: getAttrValue,
		boolCheck: boolCheck,
		options: getOptions,
		createStyle: createStyle,
		// 控件内部方法
		creater: creater,
		createControlID: createControlID,
		controlCreater: controlCreater,
		convertToJQ: convertToJQ,
		className: getClassName
	});
	// 向window公开ud2
	window[libName] = extendObjects(ud2, {
		libExtend: libExtend,
		callbacks: callbacks,
		// 扩展公共方法
		extend: extendObjects,
		merge: mergeObjects,
		clone: cloneObjects,
		propertier: propertier,
		deviceScreenState: deviceScreenState,
		time: getTime,
		// 扩展公共对象
		regex: regex,
		type: type,
		support: support,
		form: form,
		color: color,
		style: style,
		key: keyCode,
		// 控件公共方法
		createAllControl: createAllControl,
		createLazyControl: createLazyControl,
		ready: libReady,
		// 事件
		event: event,
		eventMouseWheel: eventMouseWheel,
		eventKeyShortcut: eventKeyShortcut
	});

	// #endregion

}(window, jQuery));