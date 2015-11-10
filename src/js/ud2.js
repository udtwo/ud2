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
		animateFrame = window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function (callback) { window.setTimeout(callback, 1000 / 60); },
		// 正则表达式
		regex = {
			// 日期正则表达式
			// 可以匹配 xxxx(-|.|/)x{1,2}(-|.|/)x{1,2}
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

		// 控件 GUID 生成
		ctrlGUID = (function () {
			var guid = 0;
			return {
				create: function () {
					return 'nonamed-' + (guid++);
				}
			};
		}()),
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
		MOUSE_ENTER = 'mouseenter',
		MOUSE_LEAVE = 'mouseleave',
		// 触碰事件
		EVENT_DOWN = [POINTER_DOWN, TOUCH_START, MOUSE_DOWN].join(' '),
		// 状态名称
		STATE_NAME = ['normal', 'info', 'success', 'warning', 'danger'],

		// 用于克隆的空 jQuery 对象
		$div = $('<div />'),
		$a = $('<a />'),

		// 返回 false 的空方法
		fnReturnFalse = function () { return false; },

		// 页面完成加载时的回调函数
		callbacksPageReady = $.Callbacks(),
		// 控件完全关闭的回调
		callbacksCtrlClose = $.Callbacks();

	// #endregion

	// #region ud2 函数库

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

	// 库类型检测对象
	var type = (function () {
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

		// 返回对象
		return {
			isType: isType,
			isObject: isObject,
			isFunction: isFunction,
			isString: isString,
			isNumber: isNumber,
			isNaturalNumber: isNaturalNumber,
			isJQuery: isJQuery
		}
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
						parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2],
					    code = text.split(''),
					    sum = 0;
					for (var i = 0; i < 17; i++) {
						sum += code[i] * factor[i];
					}

					var last = parity[sum % 11];
					if (last != code[17]) return false;
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

	// #endregion

	// #region ud2 库私有方法

	// 在生成新控件前进行传入参数的检测
	// 需要为此函数提供一个 this 指针指向地址，此 this 一般情况为指向一个控件集合
	// 内部已包含参数 jQuery 对象检测 chekcJQElements
	// 当传入的 jQuery 对象不是 1 时自动迭代多次控件的 create 方法
	// $elements[string, jQuery]: 待检测的变量
	// return[jQuery] => 返回每个检测后的 jQuery 对象
	// - 当 jQuery 的 length 不为 1 则迭代多次创建操作，且不返回任何值
	function checkCreateControls($elements) {
		// 对传入的 $elements 进行 jQuery 检测
		$elements = checkJQElements($elements);

		// 如果检测结果为空则生成一个空 $div 对象
		if ($elements.length === 0)
			return $div.clone();
		// 如果检测结果为一个则返回该 jQuery 对象
		if ($elements.length === 1) {
			return $elements.attr(prefixLibName + this.name + '-state')
			? undefined : $elements;
		}
		// 当长度大于 1 时，则迭代出发多次 create 方法
		var // 迭代长度
			len = $elements.length,
			// 迭代种子
			i = 0;

		// 迭代 create 方法
		for (; i < len; i++) this.create($elements.eq(i));
	}
	// 检测传入的参数是否为 jQuery 对象
	// 如果是字符串则通过字符串生成 jQuery 对象
	// 如果检测非 jQuery 对象或无法转换为 jQuery 对象则转换为空 jQuery 对象
	// $elements[string, jQuery]: jQuery 对象或可生成 jQuery 对象的字符串
	// return[jQuery]: 返回一个检测后的 jQuery 对象
	function checkJQElements($elements) {
		if (!$elements) $elements = $();
		if (type.isString($elements)) $elements = $($elements);
		if ($elements === window) $elements = $(window);
		if (!type.isJQuery($elements)) $elements = $();
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

	// 获取元素绑定的控件名称集合
	// 此功能用于获取 jQuery 元素绑定的控件名称集合
	// $element[jQuery]: jQuery 对象
	// return[Array]: jQuery 对象的控件名称集合
	function getName($element) {
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
	// 查询元素的控件名称集合中是否存在某个控件名称
	// 此功能用于查询 jQuery 元素是否存在某个控件名称
	// $element[jQuery]: jQuery 对象
	// name[string]: 控件名称
	// return[bool]: 是否存在某个控件名称
	function hasName($element, name) {
		var ud2Arr = getName($element);
		// 返回存在情况
		return ud2Arr.indexOf(name) > -1 ? true : false;
	}
	// 向元素控件名称集合中插入一个新的控件名称
	// 此功能用于向 jQuery 元素中插入一个新的控件名称
	// $element[jQuery]: jQuery 对象
	// name[string]: 控件名称
	function addName($element, name) {
		if (ud2[getControlNameByName(name)]) {
			if (!hasName($element, name)) {
				var ud2Arr = getName($element);
				ud2Arr.push(name);
				$element.attr(libName, ud2Arr.join(' '));
			}
		}
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

	// 设置 options 选项
	// options[optionObject]: 控件默认选项
	// userOptions[optionObject]: 用户设置默认选项
	function setOptions(options, userOptions) {
		if (type.isObject(userOptions)) {
			for (var i in userOptions) {
				if (options[i] !== undefined) {
					options[i] = userOptions[i];
				}
			}
		}
	}
	// 转移宿主的 style 属性和 class 属性
	// 此功能用于把旧宿主的 style 属性和 class 属性转移给新宿主
	// $transfor[jQuery]: 旧宿主 jQuery 对象
	// $accept[jQuery]: 新宿主 jQuery 对象
	function transferStyles($transfer, $accept) {
		// 把转移者的 style 属性和 class 属性全部转移给接收者
		$accept
			.attr("style", $transfer.attr("style"))
			.addClass($transfer.attr("class"));
		// 移除转移者的 style 属性和 class 属性
		$transfer
			.removeAttr("style")
			.removeClass();
	}
	// 转移宿主的可转移属性
	// 此功能用于把旧宿主的转移属性转移给新宿主
	// $transfor[jQuery]: 旧宿主 jQuery 对象
	// $accept[jQuery]: 新宿主 jQuery 对象
	function transferAttrs($transfer, $accept) {
		var // 旧宿主 element 对象
			element = $transfer.get(0),
			// 新宿主 element 对象
			newElement = $accept.get(0),
			// 旧宿主的属性长度
			len = element.attributes.length,
			// 正则表达式
			reg = /^(ud2-?|data\-|tabindex)/,
			// 循环变量
			i = 0, j = 0;

		for (; i < len; i++) {
			if (reg.test(element.attributes[j].name)) {
				var attr = element.attributes[j];
				newElement.setAttribute(attr.name, attr.value);
				element.removeAttribute(attr.name);
			} else {
				j++;
			}
		}
	}
	// 转移宿主的 name 属性
	// $transfor[jQuery]: 旧宿主 jQuery 对象
	// $accept[jQuery]: 新宿主 jQuery 对象
	function transferName($transfer, $accept) {
		var element = $transfer.get(0),
			newElement = $accept.get(0),
			attr = element.attributes['name'];

		if (attr !== undefined) {
			newElement.setAttribute(attr.name, attr.value);
			element.removeAttribute(attr.name);
		}
	}
	// 库功能 HTML 代码格式化
	// 用于识别文本的 {fn:num} 并生成相应的功能性质HTML代码
	function libHtmlFormat(txt) {
		var reg = /\{(?:(ico):([0-9a-z]{4}))\}/g, r;
		txt = txt.replace(reg, '<span class="$1">&#x$2;</span>');
		return txt;
	}
	// 库功能 HTML 代码移除
	// 用于识别文本的 {fn:num} 并移除此文本
	function libHtmlRemove(txt) {
		var reg = /\{(?:(ico):([0-9a-z]{4}))\}/g, r;
		txt = txt.replace(reg, '');
		return txt;
	}

	// #endregion

	// #region ud2 库事件

	// ud2 库的事件对象
	// 用于处理触摸笔、触碰、鼠标等方式操作元素的事件处理
	// $elements[string, jQuery]: jQuery 对象或可生成 jQuery 对象的字符串
	// userOptions[object]: 用户参数
	// - (?) stopPropagation[bool]: 是否阻止事件向外冒泡，默认为 false
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
				swipeMaxTime: 500,
				// 触点 TAP/PRESS 事件有效长度
				pointerValidLength: 5
			},
			// 回调函数
			callbacks = {
				// 拖动
				pan: $.noop,
				// 短按
				tap: $.noop,
				// 长按
				press: $.noop,
				// 快速左滑动
				swipeLeft: $.noop,
				// 快速右滑动
				swipeRight: $.noop,
				// 快速上滑动
				swipeTop: $.noop,
				// 快速下滑动
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

		// #region 回调方法

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

		// #region 事件绑定与解绑

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
				for (; i < pLen; i++) if ($parents.eq(i).attr(prefixLibName + 'scroll-runing') === '1') { isParentsScrolling = true; break; }

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
					// 如果x或y方向移动距离不超过 options.pointerValidLength
					if (absMove.x < options.pointerValidLength && absMove.y < options.pointerValidLength) {
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

					// 当移动距离超过 options.pointerValidLength 且 x 方向移动距离大于 y 方向且时间小于 options.swipeMaxTime
					// 则执行左右滑动回调
					if (absMove.x >= options.pointerValidLength && absMove.x >= absMove.y
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
					// 当移动距离超过 options.pointerValidLength 且 y 方向移动距离大于 x 方向且时间小于 options.swipeMaxTime
					// 则执行上下滑动回调
					if (absMove.y >= options.pointerValidLength && absMove.y >= absMove.x
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

		// #region 事件绑定与解绑

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

	// #region ud2 库公用控件

	// ud2 库公开对象
	// 此对象默认会成为 window 的 ud2 属性
	var ud2 = (function () {
		var // 样式
			style = {};
		// 迭代样式
		for (var i = 0; i < STATE_NAME.length; i++) style[STATE_NAME[i]] = i;

		// 初始化全部 ud2ui 控件
		// 用于初始化全部页面中未初始化的 ud2ui 控件
		// * pageReady 时会自动执行此方法
		function createAll() {
			var // 获取全部的标记控件
				$ud2Controls = $('[' + libName + ']');

			// 进行每一个控件对象创建
			function toCreate() {
				var // 获取当前控件
					$this = $(this),
					// 获取当前元素的控件名称集合
					typeName = getName($this);

				typeName.forEach(function (item, index) {
					var // 通过控件类型名称获取控件对象名称
						controlName = getControlNameByName(item),
						// 获取此控件是否被创建
						isCreated = $this.attr(prefixLibName + item + '-state');
					// 如果没有被创建则创建
					if (!isCreated) ud2[controlName].create($this);
				});
			}
			// 迭代标记控件创建控件对象
			$ud2Controls.each(toCreate);

			// 寻找页面全部标签控件
			// 迭代 ud2 对象
			for (var i in ud2) {
				// 选出为控件集合的属性，并执行此属性对应控件集合的 findDefaultElement 方法
				if (ud2[i] && ud2[i].isControlsGroup) ud2[i].findDocument();
			}
		}

		// 返回控件对象
		return {
			createAll: createAll,
			style: style
		};
	}());
	// 控件父对象
	// 生成的控件是由此对象继承而来
	// $element[jQuery]: jQuery 对象
	// return[control]: 默认的 ud2 控件
	var control = function ($element) {
		var // jQuery 对象，如果不包含任何元素则创建一个空 DIV
			$origin,
			// 控件自定义名称
			name,
			// 控件对象
			control = {};

		// 判断 $element 是否有效，并设定有效的 $element
		$origin = checkJQElements($element);
		// 当 $element 无效时，则创建一个空 $div 对象
		if ($origin.length === 0) $origin = $div.clone();
		// 当 $element 存在多个元素时，则返回第一个元素
		if ($origin.length > 1) $origin = $origin.eq(0);

		// 判断或生成控件自定义名称属性
		// 当 ud2-name 不存在时则自动在 guid 对象中创建
		name = $origin.attr(prefixLibName + 'name');
		if (!name) {
			name = ctrlGUID.create();
			$origin.attr(prefixLibName + 'name', name);
		}

		// 自动关闭方法
		// target[element]: 事件目标
		function autoClose(target) {
			var $target = type.isJQuery(target) ? target : $(target),
				$targetParents = $target.parents();
			if (control.$current) {
				if ($target.get(0) === control.$current.get(0)) return;
				for (var i = 0, len = $targetParents.length; i < len ; i++) {
					if ($targetParents.eq(i).get(0) === control.$current.get(0)) return;
				}

			}
			control.autoClose();
		}
		// 设定控件样式
		// style[ud2.style]: 控件样式
		function style(style) {
			var styleStr = ['', 'info', 'success', 'warning', 'danger'];
			if (control.style === ud2.style.info)
				control.$current.removeClass(styleStr[control.style]);
			if (control.style === ud2.style.success)
				control.$current.removeClass(styleStr[control.style]);
			if (control.style === ud2.style.warning)
				control.$current.removeClass(styleStr[control.style]);
			if (control.style === ud2.style.danger)
				control.$current.removeClass(styleStr[control.style]);
			control.style = style;
			control.$current.addClass(styleStr[style]);
		}

		// 控件样式
		control.style = ud2.style.normal;
		// 原 jQuery 对象
		control.$origin = $origin;
		// 当前 jQuery 对象
		control.$current = null;
		// 控件关闭
		control.autoClose = function () { };
		// 可公开的属性及方法
		control.public = {
			name: name,
			isUD2: true,
			style: style
		};

		// 增加关闭回调
		callbacksCtrlClose.add(autoClose);

		// 返回
		return control;
	};
	// 控件对象集合
	// 生成的控件对象集合是由此对象继承而来
	// name: string => 控件对象集合名称
	// return: controlsGroup => 一个控件对象空集合
	var controlGroup = function (name) {
		// 组对象
		var group = [];

		// 控件标准名称，通常为 css 类相关名
		group.name = type.isString(name) ? name : 'empty';
		// 控件对象名称，通常为 js 属性相关名
		group.controlName = getControlNameByName(name);
		// 标记此集合为控件集合
		group.isControlsGroup = true;

		// 寻找 document 文档中控件标签，并转换为控件的方法
		// 寻找未设置 ud2 但本身却应该转换为控件的标签并进行生成
		// 此处是一个空方法，此方法应该在不同的控件集合中改写不同的寻找方法
		group.findDocument = $.noop;
		// 控件初始化
		// 此处是一个空方法，此方法应该在不同的控件集合中改写不同的初始化方法
		// ctrl[control]: 控件对象
		// userOptions: 用户设置选项
		group.init = function (ctrl, userOptions) {
			return ctrl.public;
		};

		// 创建一个控件的默认执行父函数
		// 用于将控件添加至控件对象集合，建立控件唯一识别符
		// $elements[jQuery] => 要创建的指定jQuery对象
		// - 当元素长度大于 0 时，则迭代多次 create 方法
		// return[controls] => 返回要创建的控件对象信息
		group.create = function ($elements, userOptions) {
			// 检测传入的 $elements 对象
			$elements = checkCreateControls.call(this, $elements);
			if (!$elements) return;

			// 创建一个 control
			var ctrl = control($elements);

			// 将控件添入数组中
			this.push(ctrl.public);
			this[ctrl.public.name] = ctrl.public;

			// 将控件信息写入 jQuery 对象
			addName(ctrl.$origin, this.name);
			ctrl.$origin.attr(prefixLibName + this.name + '-state', true);

			this.init(ctrl, userOptions);

			// 初始化控件，并返回控件的信息
			return ctrl.public;
		};

		// 公开组对象
		ud2[group.name] = group;

		// 返回组对象
		return group;
	};
	// 滚动条控件
	// 用于为元素生成滚动条
	// $elements[string, jQuery]: jQuery 对象或可生成 jQuery 对象的字符串
	// userOptions[object]: 用户参数
	// return[scroll] => 返回一个滚动条控件
	var scroll = function ($elements, userOptions) {

		// #region 私有字段

		var // 滚动条对象
			scrollObj = {},
			// 选项
			options = {
				// 设置浏览器尺寸发生改变时是否重新计算滚动区域
				// 如果设置此值为 true，则浏览器发生 orientationchange 与 resize 事件时，滚动区域重新计算
				recountByResize: false,
				// 滚动条显示方式
				// 0: 默认  1: 永久显示  2: 永久消失
				barState: 0,
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
				// 滚动条圆角
				barBorderRadiusState: true,
				// 是否开启滚轮来控制滚动区域
				isMouseWheelMode: true,
				// 是否开启触摸来控制滚动区域
				isTouchMode: true,
				// 是否开启通过滚动条来控制滚动区域
				isScrollMode: false,
				// 滚轮滚动长度
				mousewheelLength: 'normal',
				// 开启横滚动条
				hasHorizontal: false,
				// 开启竖滚动条
				hasVertical: true,
				// 缓动
				slowMoving: true
			},
			// 记录鼠标是否在滚动条区域中按下滚动条，并拖拽操作
			mouseInScroll = false,
			// 记录鼠标是否在滚动容器中
			mouseInBox = false,
			// 滚动对象
			$scroll = checkJQElements($elements).eq(0),
			// 滚动包裹容器
			$wrapper = $div.clone().addClass(prefixLibName + 'scroll-wrapper'),
			// 横滚动条
			$barHorizontal = $div.clone().addClass(prefixLibName + 'scroll-bar'),
			// 竖滚动条
			$barVertical = $div.clone().addClass(prefixLibName + 'scroll-bar'),
			// 滚动状态标记属性
			ATTRNAME_IS_SCROLL = prefixLibName + 'scroll-runing',
			// 缓动
			easing = {
				quadratic: {
					css: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
					fn: function (s) { return s * (2 - s); }
				},
				circular: {
					css: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
					fn: function (s) { return Math.sqrt(1 - (--s * s)); }
				}
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
			// 鼠标滚轮数据对象
			mousewheel = {
				// 鼠标滚轮定时器
				// 用于阻止滚轮在边缘的多次滚动
				timer: null
			},
			// 是否正在滚动
			isScrolling = false,
			// 当滚动完成时执行强制停止回调定时器
			scrollEndTimer = null,
			// 触摸启动最小长度
			touchStartMinLength = 5,
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
			};

		// #endregion

		// #region 私有方法

		// 重新计算滚动对象及外层对象高度，且初始化滚动条数据
		function getScrollData() {
			// 如果开启竖滚动条
			if (options.hasVertical) {
				var // 外层盒子高度
					wrapperHeight = 0,
					// 滚动条高度
					barHeight = 0,
					// 最大滚动槽高度
					maxScrollBarHeight = 0;

				// 获取外层对象高度
				wrapperHeight = $wrapper.height();

				// 保存高度数据到滚动对象数据中
				scrollData.h = $scroll.height();
				scrollData.ih = $scroll.innerHeight();
				scrollData.sh = wrapperHeight - scrollData.h;
				if (scrollData.now.y < -scrollData.sh) scrollData.now.y = -scrollData.sh;

				// 最大滚动高度
				maxScrollBarHeight = scrollData.ih - 2 * options.barOffset;

				// 计算滚动条高度
				if (scrollData.h !== 0) {
					var size = scrollData.sh / (scrollData.ih * 5);
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
				var // 外层盒子宽度
					wrapperWidth = 0,
					// 滚动条宽度
					barWidth = 0,
					// 最大滚动槽宽度
					maxScrollBarWidth = 0;

				// 获取外层对象宽度
				wrapperWidth = $wrapper.width();
				// 保存宽度数据到滚动对象数据中
				scrollData.w = $scroll.width();
				scrollData.iw = $scroll.innerWidth();
				scrollData.sw = wrapperWidth - scrollData.w;
				if (scrollData.now.x < -scrollData.sw) scrollData.now.x = -scrollData.sw;

				// 最大滚动宽度
				maxScrollBarWidth = scrollData.iw - 2 * options.barOffset;

				// 计算滚动条宽度
				if (scrollData.w !== 0) {
					var size = scrollData.sw / (scrollData.iw * 5);
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
			if (support.transition) {
				var matrix = $wrapper.css('transform');
				matrix = matrix.split(')')[0].split(', ');
				x = Math.round(+(matrix[12] || matrix[4]));
				y = Math.round(+(matrix[13] || matrix[5]));
			} else {
				x = scrollData.now.x;
				y = scrollData.now.y;
			}
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
		// direction[bool]: 方向 false: x 方向 true: y 方向
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
		// direction[bool]: 方向 false: x 方向 true: y 方向
		// position[number]: 坐标
		function getScrollPositionByBarPosition(position, direction) {
			var dir = direction ? 'sh' : 'sw';
			if (scrollData[dir] === 0 || barData[dir] === 0) {
				return 0;
			} else {
				return position / barData[dir] * scrollData[dir];
			}
		}
		// 执行滚动动画
		// x[number]: 滚动到 X 坐标
		// y[number]: 滚动到 Y 坐标
		// time[number]: 滚动用时
		// e[easingObject]: 缓动
		function translateMove(x, y, time, e) {
			// 设置动画时长
			time = time || 0;
			// 设置 $wrapper 的过渡动画
			e = e || easing.circular;

			if (x > 0) x = 0;
			if (y > 0) y = 0;
			if (y < -scrollData.sh) y = -scrollData.sh;
			if (x < -scrollData.sw) x = -scrollData.sw;

			// 浏览器支持 transition 则使用过渡动画
			// 不支持则使用 jQuery 的 animate 动画
			if (support.transition) {
				translateTimingFunction(e.css);
				translateTime(time);
				$wrapper.css('transform', 'translate(' + x + 'px, ' + y + 'px)' + (support.perspective ? ' translateZ(0)' : ''));
				if (options.hasVertical) $barVertical.css('transform', 'translate(0, ' + getBarPositionByScrollPosition(-y, 1) + 'px)' + (support.perspective ? ' translateZ(0)' : ''));
				if (options.hasHorizontal) $barHorizontal.css('transform', 'translate(' + getBarPositionByScrollPosition(-x, 0) + 'px, 0)' + (support.perspective ? ' translateZ(0)' : ''));
				scrollData.now = { x: x, y: y };
			} else {
				if (time === 0) {
					$wrapper.css({ 'left': x, 'top': y });
					if (options.hasVertical) $barVertical.css('top', getBarPositionByScrollPosition(-y, 1) + 'px');
					if (options.hasHorizontal) $barHorizontal.css('left', getBarPositionByScrollPosition(-x, 0) + 'px');
					scrollData.now = { x: x, y: y };
				} else {
					animate(x, y, time, e.fn);
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
			// 由于 transition-end 在部分浏览器中时间不准确，这里的定时器方式替代了 transition-end
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
		// 兼容不支持 transition 时的滚动动画
		function animate(destX, destY, duration, easingFn) {
			var startX = scrollData.now.x,
				startY = scrollData.now.y,
				startTime = getTime(),
				destTime = startTime + duration;

			function step() {
				var now = getTime(), newX, newY, easing;

				if (now < destTime) {
					now = (now - startTime) / duration;
					easing = easingFn(now);
					newX = (destX - startX) * easing + startX;
					newY = (destY - startY) * easing + startY;
					scrollData.now = { x: newX, y: newY };
					$wrapper.css({ 'left': newX, 'top': newY });
					if (options.hasVertical) $barVertical.css('top', (-newY / scrollData.sh * barData.sh));
					if (options.hasHorizontal) $barHorizontal.css('left', (-newX / scrollData.sh * barData.sh));

					if (isScrolling) {
						animateFrame(step);
					}
				} else {
					isScrolling = false;
				}
			}

			isScrolling = true;
			step();
		}
		// 开启滚动条
		function barOpen() {
			if (options.barState === 0) {
				if (barData.timer) window.clearTimeout(barData.timer);
				if (support.transition) {
					$barHorizontal.stop().fadeIn(200);
					$barVertical.stop().fadeIn(200);
				}
				else {
					$barHorizontal.show();
					$barVertical.show();
				}
			}
		}
		// 关闭滚动条
		function barClose() {
			if (options.barState === 0) {
				if (!mouseInBox && !mouseInScroll && !isScrolling) {
					if (barData.timer) window.clearTimeout(barData.timer);
					barData.timer = window.setTimeout(function () {
						if (support.transition) {
							$barHorizontal.stop().fadeOut(500);
							$barVertical.stop().fadeOut(500);
						} else {
							$barHorizontal.hide();
							$barVertical.hide();
						}
					}, 1000);
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
			destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1);
			duration = speed / deceleration;

			if (destination < wrapper) {
				destination = scroll ? wrapper - (scroll / 2.5 * (speed / 8)) : wrapper;
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

		// #endregion

		// #region 公有方法

		// 获取滚动条的当前状态
		function getState() { return isScrolling; }
		// 重计算滚动条滚动位置
		function recountPosition() {
			getScrollData();
			translateMove(scrollData.now.x, scrollData.now.y);

			return scrollObj;
		}
		// 移动滚动条
		// x[number]: 滚动到 X 坐标
		// y[number]: 滚动到 Y 坐标
		// time[number]: 滚动用时
		// e[easingObject]: 缓动
		function move(x, y, time, e) {
			translateMove(-x, -y, time, e);
			return scrollObj;
		}

		// #endregion

		// #region 设置事件绑定与解绑

		// 触点按下时触发的事件
		function pointerDown() {
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
			if (!mainPointer.moved || !options.slowMoving) return;

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
				moveLen = options.mousewheelLength;

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
			if (options.recountByResize) $win.bind('resize orientationchange', recountPosition);

			// 鼠标在滑入滑出滚动区域时滚动条的显示处理
			if (options.barState === 0) {
				$scroll.bind(MOUSE_ENTER, function () {
					getScrollData();
					mouseInBox = true;
					barOpen();
				}).bind([MOUSE_LEAVE, TOUCH_END].join(' '), function () {
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
			// 设置初始选项
			setOptions(options, userOptions);
			// 判断传入的鼠标滚轮滚动长度是否符合要求
			if (options.mousewheelLength !== 'normal' && !isNaturalNumber(options.mousewheelLength))
				options.mousewheelLength = 'normal';

			// 对象内部集合
			var $child = $scroll.contents();
			// 如果内部对象集合长度为 0(说明 $scroll 内容为空)，则把 $wrapper 元素插入到 $scroll 内
			// 否则用 $wrapper 包裹所有内部对象，得到最新的包裹对象并提交给 $wrapper
			if ($child.length === 0) {
				$scroll.append($wrapper);
			} else {
				$child.wrapAll($wrapper);
				$wrapper = $scroll.children('.' + prefixLibName + 'scroll-wrapper');
			}

			// 延续 scroll 盒的 padding 值
			// 让外盒的 padding 来模拟 scroll 盒的 padding
			// HACK: 此处当 $wrapper.css('padding') 获取值的时候，EDGE 浏览器获取的值为空
			// 进而分别试用 top / bottom / left / right 来获取 padding 值
			$wrapper.css('padding',
				$scroll.css('padding-top')
				+ ' ' + $scroll.css('padding-right')
				+ ' ' + $scroll.css('padding-bottom')
				+ ' ' + $scroll.css('padding-left'));

			// 对 $scroll 添加 .ud2-scroll 类(滚动条基础样式)
			$scroll.addClass('ud2-scroll');

			// 添加滚动条并设置尺寸
			if (options.hasVertical) {
				$scroll.prepend($barVertical);
				$wrapper.css({ 'height': 'auto', 'min-height': '100%' });
			}
			if (options.hasHorizontal) {
				$scroll.prepend($barHorizontal);
				$wrapper.css({ 'width': 'auto', 'min-width': '100%' });
			}
			$barVertical.css({ 'top': options.barOffset, 'right': options.barOffset, 'width': options.barSize, 'background': options.barColor });
			$barHorizontal.css({ 'left': options.barOffset, 'bottom': options.barOffset, 'height': options.barSize, 'background': options.barColor });
			if (options.barBorderRadiusState) {
				$barVertical.css('border-radius', options.barSize / 2);
				$barHorizontal.css('border-radius', options.barSize / 2);
			}
			if (options.barState === 1) {
				$barVertical.show();
				$barHorizontal.show();
			}

			// 获取 scroll 的数据值
			getScrollData();
			// 绑定事件
			bindEvent();
		}());

		// #endregion

		// #region 返回

		// 公开方法
		scrollObj = {
			$content: $wrapper,
			move: move,
			getState: getState,
			recountPosition: recountPosition
		};
		// 返回
		return scrollObj;

		// #endregion

	};

	// #endregion

	// #region ud2 库控件

	// 信息控件
	// 用于生成信息提示
	// userOptions[object]: 用户参数
	// return[scroll] => 返回一个滚动条控件
	var message = function (text, ico, style) {
		var // 类名
			className = prefixLibName + 'message',
			// 信息对象
			$message = $([
				'<div class="ud2-message">',
				'<div class="ud2-message-text"></div>',
				'</div>'
			].join(''));

		ico = ico || '';
		style = style || ud2.style.normal;

		// 创建信息
		function create() {
			var $body = $('body');

			// 添入图标
			if (ico) {
				if (ico === 1) {
					$message.children().first().before('<i class="ico">&#xe687;</i>');
					$message.addClass(STATE_NAME[1]);
				}
				else if (ico === 2) {
					$message.children().first().before('<i class="ico">&#xe693;</i>');
					$message.addClass(STATE_NAME[2]);
				}
				else if (ico === 3) {
					$message.children().first().before('<i class="ico">&#xe698;</i>');
					$message.addClass(STATE_NAME[3]);
				}
				else if (ico === 4) {
					$message.children().first().before('<i class="ico">&#xe689;</i>');
					$message.addClass(STATE_NAME[4]);
				}
				else {
					$message.children().first().before('<i class="ico">' + ico + '</i>');
				}

				if (style && style !== 0) $message.addClass(STATE_NAME[style]);
			} 

			// 添入文本
			$message.children().last().html(text);

			// 添入元素
			$body.append($message);
			window.setTimeout(function () {
				$message.addClass(className + '-on');
			}, 100);
		}

		// 关闭信息
		function close() {
			$message.addClass(className + '-close');
			window.setTimeout(function () {
				$message.remove();
			}, 1000);
		}

		// 计算数组之和
		function countHeight(arr) {
			var sum = 0, i = 0, j = arr.length;
			for (; i < j; i++) {
				sum += arr[i];
			}
			return sum;
		}
		// 移动信息
		function siblingsMove() {
			var $msg = $('.' + className), height = [], padding = 10,
				i = $msg.length;

			// 循环所有信息控件，计算适合的 top 值
			for (; i > 0; i--) {
				var $this = $msg.eq(i - 1);
				$this.css('top', (height.length + 1) * padding + countHeight(height));
				height.push($this.outerHeight());
			}
		}

		// 初始化
		(function init() {
			create();
			siblingsMove();
			window.setTimeout(close, 5000);
		}());
	};

	// JS 选择控件集合
	// * 此控件会 remove 掉原宿主对象
	var select = (function (group) {

		// 重写 init 方法
		// 创建一个 JS 选择控件，此控件重写了原 HTML 的 select 控件
		// IMPORT: 对象或生成的对象必须为 select
		// ctrl[control]: control 对象
		// userOptions[object]: 用户参数
		// return[select]: 返回生成的控件对象
		group.init = function (ctrl, userOptions) {

			// #region 私有字段

			var // 样式类名
				className = prefixLibName + group.name,
				// 选项
				options = {
					// 最大高度，单位 em
					maxHeight: 20,
					// 默认文本
					autoText: ctrl.$origin.attr(className + '-text') || '请选择以下项目',
					// 是否为多选框
					isMultiple: !!ctrl.$origin.attr('multiple')
				},
				// 被选作值的选项集合
				arrValOptions = [],
				// 控件对象
				$select = $([
					'<div class="' + className + '">',
					'<div class="' + className + '-put"><a class="' + className + '-btn" /><i class="' + className + '-ico" /></div>',
					'<div class="' + className + '-list" />',
					'<input type="checkbox" /><input type="hidden" />',
					'</div>'
				].join('')),
				// 控件 list 容器 
				$selectList = $select.children('div:last'),
				// 控件 box 容器
				$selectBox = $select.children('div:first'),
				// 控件按钮
				$selectBtn = $selectBox.children('a'),
				// 控件 tabindex 功能插件
				$selectTabindex = $select.children('[type="checkbox"]'),
				// 控件隐藏值功能插件
				$selectValue = $select.children('[type="hidden"]'),
				// 空 option 对象
				$emptyOption = $a.clone(),
				// 控件滚动条
				selectScroll = null,
				// 标记是否处于开启状态
				isOpen = false,
				// 列表滚动条
				listScroll = null,
				// 回调函数
				callbacks = {
					// 开启回调
					open: $.noop,
					// 关闭回调
					close: $.noop,
					// 值改变
					changeVal: $.noop
				};

			// #endregion

			// #region 选项与组对象

			// 选项
			// name[string]: 选项名称
			// value[string]: 选项值
			// disabled[bool]: 是否为禁用状态
			// selected[bool]: 是否为选中状态
			// (?) group[group]: 选项是否存在于某个组中
			function Option(name, value, disabled, selected, group) {
				var that = this;
				this.group = group || null;
				this.name = name || '';
				this.value = value || '';
				this.disabled = disabled || false;
				this.selected = !this.disabled && (selected || false);
				this.createElement();
				if (this.selected) selectValue(this);

				Option.list.push(this);
				if (this.group) {
					this.group.addOption(this);
				} else {
					listScroll.$content.append(this.$element);
				}
			}
			// 选项集合
			Option.list = [];
			// 选项继承
			Option.prototype = {
				// 创建选项组元素
				createElement: function () {
					var $opt = $emptyOption.clone(), that = this;
					$opt.html(this.name)
						.attr('title', this.name)
						.attr(className + '-value', this.value)
						.addClass(className + '-option');

					if (this.group) $opt.addClass(className + '-ingroup');
					if (this.disabled || (this.group && this.group.disabled))
						$opt.attr(className + '-disabled', 'true');
					this.$element = $opt;
					event(this.$element).setTap(function () {
						selectValue(that);
					});
				},
				// 设置被选中元素
				setSelected: function (selected) {
					this.selected = selected;
					if (this.selected)
						this.$element.addClass(className + '-option-on')
					else
						this.$element.removeClass(className + '-option-on')
				},
				// 切换被选中元素
				toggleSelected: function (selected) {
					if (selected)
						this.setSelected(false);
					else
						this.setSelected(true);
				}
			};
			// 选项组
			// name[string]: 选项组名称
			// disabled[bool]: 被选中状态
			function Group(name, disabled) {
				var that = this;
				this.name = name || '';
				this.disabled = disabled || false;
				this.options = [];
				this.createElement();

				Group.list.push(this);
				listScroll.$content.append(this.$element);
			}
			// 选项组集合 
			Group.list = [];
			// 选项组继承
			Group.prototype = {
				// 创建选项组元素
				createElement: function () {
					var $group = $emptyOption.clone();
					$group.html(this.name)
						.attr('title', this.name)
						.addClass(className + '-group');
					this.$element = $group;
				},
				// 向组内添加一个选项
				// name[string]: 选项名称
				// value[string]: 选项值
				// disabled[bool]: 是否被禁用
				// selected[bool]: 是否被选中
				addOption: function (option) {
					if (option instanceof Option) {
						this.options.push(option);
						this.$element.after(option.$element);
					}
				}
			};

			// #endregion

			// #region 私有方法

			// 分析控件中的全部选项组
			function analysisGroups() {
				var $groups = ctrl.$origin.children('optgroup');
				analysisOptions();
				for (var i = 0, l = $groups.length, group; i < l; i++) {
					var $group = $groups.eq(i),
						name = $group.attr('label') || '',
						disabled = !!($group.attr('disabled') && $group.attr('disabled') !== 'false');
					group = new Group(name, disabled);
					analysisOptions(group, $group);
				}
			}
			// 分析控件中的全部选项
			// group[group]: 分析此组内的选项，如果未传入 group 则分析不包括在任何选项组内的选项
			// $group[jQuery]: 如果选项组存在，则传入一个选项组的 jQuery 对象
			function analysisOptions(group, $group) {
				var inGroup = group ? true : false,
					$options = group ? $group.children('option') : ctrl.$origin.children('option');

				for (var i = 0, l = $options.length; i < l ; i++) {
					var $select = $options.eq(i),
						name = $options.eq(i).html(),
						val = $options.eq(i).val(),
						disabled = !!($options.eq(i).attr('disabled') && $options.eq(i).attr('disabled') !== 'false'),
						selected = !!($options.eq(i).attr('selected') && $options.eq(i).attr('selected') !== 'false');

					if (inGroup) {
						new Option(name, val, disabled, selected, group);
					} else {
						new Option(name, val, disabled, selected);
					}
				}
			}
			// 设置控件的值
			// option[Option]: 控件选项
			function setValue(option) {
				var val = null;
				// 是否为多选
				if (options.isMultiple) {
					var // 是否已经持有值
						isHave = -1,
						// 返回值集合
						vs = [];

					// 迭代值集合对象
					for (var i in arrValOptions) if (arrValOptions[i] === option) { isHave = i; break; }
					// 判断此控件值是否曾被选择
					if (isHave > -1) {
						option.setSelected(false);
						// 如果曾被选择则移除
						arrValOptions.splice(isHave, 1);
					} else {
						option.setSelected(true);
						// 如果未被选择则加入
						arrValOptions.push(option);
					}

					// 迭代新值集合对象
					for (var i in arrValOptions) vs.push(arrValOptions[i].value);

					if (arrValOptions.length === 0) {
						$selectBtn.attr(className + '-value', null);
						$selectBtn.html(options.autoText);
					} else {
						$selectBtn.attr(className + '-value', true);
						$selectBtn.html(vs.length + '个项目');
					}

					val = vs;
					$selectValue.val(vs.join(','));
				} else {
					if (arrValOptions[0]) arrValOptions[0].setSelected(false);
					$selectBtn.attr(className + '-value', true);
					option.setSelected(true);
					arrValOptions[0] = option;
					$selectBtn.html(option.name);

					val = option.value;
					$selectValue.val(val);
				}

				callbacks.changeVal.call(ctrl.public, val);
			}

			// #endregion

			// #region 回调方法

			// 设置开启回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setOpen(fn) { callbacks.open = fn; return ctrl.public; }
			// 设置关闭回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setClose(fn) { callbacks.close = fn; return ctrl.public; }
			// 设置开启回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setChangeVal(fn) { callbacks.changeVal = fn; return ctrl.public; }

			// #endregion

			// #region 公有方法

			// 选择一个控件值
			// option[option]: 控件选项
			function selectValue(option) {
				if (option.disabled || (option.group && option.group.disabled)) return;
				setValue(option);
				if (!options.isMultiple) close();
			}
			// 设置控件的默认文本
			// text[string]: 默认文本
			// return[select]: 返回控件
			function setShowText(text) {
				var text = type.isString(text) ? text : options.autoText;
				options.autoText = text;
				$selectBtn.html(text);
				return ctrl.public;
			}
			// 打开控件
			// return[select]: 返回控件
			function open() {
				if (!isOpen) {
					isOpen = true;
					$select.addClass(className + '-on');
					recountHeight();

					callbacks.open.call(ctrl.public);
				}
				return ctrl.public;
			}
			// 关闭控件
			// return[select]: 返回控件
			function close() {
				if (isOpen) {
					isOpen = false;
					$select.removeClass(className + '-on');

					callbacks.close.call(ctrl.public);
				}
				return ctrl.public;
			}
			// 开关控件
			// 当控件开启时就关闭，否则就开启
			// return[select]: 返回控件
			function toggle() {
				if (isOpen) {
					close();
				} else {
					open();
				}
				return ctrl.public;
			}
			// 获取控件值
			// val[string(1), array(2)]: 返回控件值
			function val() {
				// 是否为多选
				if (options.isMultiple) {
					var // 返回值集合
						vs = [];
					// 迭代值集合，把值集合存在的返回值推入集合
					for (var i in arrValOptions) vs.push(arrValOptions[i].$element.attr(className + '-value'));
					// 返回值集合输出
					return vs;
				} else {
					// 值集合中的0号元素值输出
					return arrValOptions[0] ? arrValOptions[0].$element.attr(className + '-value') : '';
				}
			}
			// 重计算高度
			function recountHeight() {
				var optionLen = Option.list.length,
					labelLen = Group.list.length,
					overHeight = 0;

				overHeight = (optionLen * 2.5 + labelLen * 2);
				overHeight = overHeight > options.maxHeight ? options.maxHeight : overHeight;
				$selectList.css('height', overHeight + 'em');
				listScroll.recountPosition();
			}

			// #endregion

			// #region 事件绑定

			// 事件绑定
			function bindEvent() {
				var btnEvent = event($selectBox);
				btnEvent.setTap(toggle);

				$selectTabindex.bind('focus', function () {
					callbacksCtrlClose.fire($select);
					open();
				});
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 控件初始项
				ctrl.$current = $select;
				ctrl.autoClose = close;

				// 设置初始选项
				setOptions(options, userOptions);
				// 转移宿主属性
				transferStyles(ctrl.$origin, $select);
				transferAttrs(ctrl.$origin, $select);
				transferName(ctrl.$origin, $selectValue);

				// 开启滚动条
				listScroll = scroll($selectList, {
					barState: 0, isScrollMode: true,
					barColor: 'rgba(0,0,0,.2)',
					barColorOn: 'rgba(0,0,0,.4)'
				});

				// 显示默认文本
				setShowText();
				// 分析控件组和控件
				analysisGroups();
				// 把 $select 放入原标签后
				ctrl.$origin.after($select);
				// 移除原标签
				ctrl.$origin.remove();

				// 事件绑定
				bindEvent();
			}());

			// #endregion

			// #region 返回

			ctrl.public.open = open;
			ctrl.public.close = close;
			ctrl.public.toggle = toggle;
			ctrl.public.val = val;
			ctrl.public.setShowText = setShowText;
			ctrl.public.recountHeight = recountHeight;
			ctrl.public.setOpen = setOpen;
			ctrl.public.setClose = setClose;
			ctrl.public.setChangeVal = setChangeVal;
			return ctrl.public;

			// #endregion

		};

	}(controlGroup('select')));
	// JS 地区选择控件集合
	// * 此控件会 remove 掉原宿主对象
	var address = (function (group) {

		// 重写 init 方法
		// 创建一个 JS 地区选择控件
		// ctrl[control]: control 对象
		// userOptions[object]: 用户参数
		// return[address]: 返回生成的控件对象
		group.init = function (ctrl, userOptions) {

			// #region 私有属性

			var // 样式类名
				className = prefixLibName + group.name,
				// 选项
				options = {
					// 默认文本
					autoText: ctrl.$origin.attr(className + '-text') || '请选择城市信息',
					// 地址 JSON 数据位置
					json: ctrl.$origin.attr(className + '-json') || '/dist/json/address.json'
				},
				// 值集合对象
				arrValObjects = {
					province: null, city: null, area: null,
					provinceList: [], cityList: [], areaList: []
				},
				// 控件对象
				$address = $([
					'<div class="' + className + '"><a class="' + className + '-btn" />',
					'<div class="ud2-ctrl-power"><i class="ico">&#xe773;</i><i class="ico">&#xe689;</i></div>',
					'<div class="' + className + '-list">',
					'<div class="' + className + '-tabbox"><div class="' + className + '-tab">省份</div><div class="' + className + '-tab">城市</div><div class="' + className + '-tab">区县</div></div>',
					'<div class="' + className + '-areabox ' + className + '-load" /></div>',
					'<input type="checkbox" /><input type="hidden" />',
					'</div>'
				].join('')),
				// 控件 list 容器 
				$addressList = $address.children('div'),
				// 控件按钮
				$addressBtn = $address.children('a'),
				// 控件开关容器
				$addressPower = $addressBtn.next(),
				// 控件列表选项卡容器
				$addressListTab = $addressList.children('div:first'),
				// 控件列表内容容器
				$addressListContent = $addressList.children('div:last'),
				// 控件 tabindex 功能插件
				$addressTabindex = $address.children('[type="checkbox"]'),
				// 控件隐藏值插件
				$addressValue = $address.children('[type="hidden"]'),
				// 存储一个空的区域元素
				$emptyArea = $div.clone().addClass(className + '-area'),
				// 标记是否处于开启状态
				isOpen = false,
				// 延迟加载等待定时器
				delayTimer = null,
				// 回调函数
				callbacks = {
					// 开启回调
					open: $.noop,
					// 关闭回调
					close: $.noop,
					// 值改变
					changeVal: $.noop
				};

			// #endregion

			// #region 私有方法

			// 获取地区数据
			function getDatas() {
				if (!group.data) {
					$.ajax({
						'url': options.json,
						'method': 'get',
						'dataType': 'json'
					}).done(function (data) {
						group.data = data;
						$addressListContent.removeClass(className + '-load');
					})
				}
			}
			// 对展示行为初始化
			// no[number]: 设置当前的展示层级
			function showStart(no) {
				var tabChild = $addressListTab.children(),
					contentChild = $addressListContent.children();
				tabChild.removeClass(className + '-tab-on ' + className + '-tab-open');
				tabChild.eq(no).addClass(className + '-tab-on');
				tabChild.eq(0).addClass(className + '-tab-open');
				if (arrValObjects.province) tabChild.eq(1).addClass(className + '-tab-open');
				if (arrValObjects.city) tabChild.eq(2).addClass(className + '-tab-open');
				contentChild.detach();
			}
			// 展示省份
			function showProvince() {
				if (group.data) {
					showStart(0);
					for (var i in group.data) {
						var name = group.data[i].name;
						if (!arrValObjects.provinceList[name]) {
							arrValObjects.provinceList[name] = $emptyArea.clone().html(name);
							event(arrValObjects.provinceList[name]).setTap(function (i) {
								return function () {
									arrValObjects.province = group.data[i];
									arrValObjects.city = null;
									arrValObjects.area = null;
									showCity();
									setValue();
								}
							}(i));
						}

						if (arrValObjects.province && arrValObjects.province.name === name) {
							arrValObjects.provinceList[name].addClass(className + '-area-me');
						} else {
							arrValObjects.provinceList[name].removeClass(className + '-area-me');
						}
						$addressListContent.append(arrValObjects.provinceList[name]);
					}
				} else {
					if (delayTimer) {
						window.clearInterval(delayTimer);
						delayTimer = null;
					}
					delayTimer = window.setInterval(showProvince, 50);
				}
			}
			// 展示城市
			function showCity() {
				showStart(1);
				for (var i in arrValObjects.province.city) {
					var name = arrValObjects.province.city[i].name,
						fixName = arrValObjects.province.name + name;
					if (!arrValObjects.cityList[fixName]) {
						arrValObjects.cityList[fixName] = $emptyArea.clone().html(name);
						event(arrValObjects.cityList[fixName]).setTap(function (i) {
							return function () {
								arrValObjects.city = arrValObjects.province.city[i];
								arrValObjects.area = null;
								showArea();
								setValue();
							}
						}(i));
					}

					if (arrValObjects.city && arrValObjects.city.name === name) {
						arrValObjects.cityList[fixName].addClass(className + '-area-me');
					} else {
						arrValObjects.cityList[fixName].removeClass(className + '-area-me');
					}
					$addressListContent.append(arrValObjects.cityList[fixName]);
				}
			}
			// 展示地区
			function showArea() {
				showStart(2);
				for (var i in arrValObjects.city.area) {
					var name = arrValObjects.city.area[i],
						fixName = arrValObjects.province.name + arrValObjects.city.name + name;
					if (!arrValObjects.areaList[fixName]) {
						arrValObjects.areaList[fixName] = $emptyArea.clone().html(name);
						event(arrValObjects.areaList[fixName]).setTap(function (i) {
							return function () {
								arrValObjects.area = arrValObjects.city.area[i];
								setValue();
								close();
							}
						}(i));
					}

					if (arrValObjects.area && arrValObjects.area === name) {
						arrValObjects.areaList[fixName].addClass(className + '-area-me');
					} else {
						arrValObjects.areaList[fixName].removeClass(className + '-area-me');
					}
					$addressListContent.append(arrValObjects.areaList[fixName]);
				}
			}
			// 判断 tab 内的按钮跳转位置
			function tabShow() {
				var index = this.index();
				if (index === 0) showProvince();
				if (arrValObjects.province) {
					if (index === 1) showCity();
				}
				if (arrValObjects.province && arrValObjects.city) {
					if (index === 2) showArea();
				}
			}
			// 设定控件值
			function setValue() {
				var text = "",
					val = [];

				if (arrValObjects.province) {
					text += arrValObjects.province.name;

					if (arrValObjects.city) {
						text += '<span>/</span>' + arrValObjects.city.name;

						if (arrValObjects.area) {
							text += '<span>/</span>' + arrValObjects.area;
							val = [arrValObjects.province.name, arrValObjects.city.name, arrValObjects.area];
						}
					}

					$addressBtn.attr(className + '-value', true);
					$addressBtn.html(text);
				}
				else {
					$addressBtn.attr(className + '-value', null);
					$addressBtn.html(options.autoText);
				}

				$addressValue.val(val.join(','));
				callbacks.changeVal.call(ctrl.public, val);
			}

			// #endregion

			// #region 回调方法

			// 设置开启回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setOpen(fn) { callbacks.open = fn; return ctrl.public; }
			// 设置关闭回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setClose(fn) { callbacks.close = fn; return ctrl.public; }
			// 设置值改变回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[address]: 当前事件对象，方便链式调用
			function setChangeVal(fn) { callbacks.changeVal = fn; return ctrl.public; }

			// #endregion

			// #region 公共方法

			// 设置控件的默认文本
			// text[string]: 默认文本
			// return[address]: 返回控件
			function setShowText(text) {
				var text = type.isString(text) ? text : options.autoText;
				options.autoText = text;
				$addressBtn.html(text);
				return ctrl.public;
			}
			// 打开控件
			// return[address]: 返回控件
			function open() {
				if (!isOpen) {
					isOpen = true;
					$address.addClass(className + '-on');
					$addressPower.addClass(prefixLibName + 'ctrl-power-on');
					if (!arrValObjects.province) {
						showProvince();
					} else if (!arrValObjects.city) {
						showCity();
					} else {
						showArea();
					}

					callbacks.open.call(ctrl.public);
				}

				return ctrl.public;
			}
			// 关闭控件
			// return[address]: 返回控件
			function close() {
				if (isOpen) {
					// 存在延迟加载则删除延迟加载等待定时器
					if (delayTimer) {
						window.clearInterval(delayTimer);
						delayTimer = null;
					}

					if (arrValObjects.area === null) {
						arrValObjects.province = null;
						arrValObjects.city = null;
						setValue();
					}

					isOpen = false;
					$address.removeClass(className + '-on');
					$addressPower.removeClass(prefixLibName + 'ctrl-power-on');

					callbacks.close.call(ctrl.public);
				}

				return ctrl.public;
			}
			// 开关控件
			// 当控件开启时就关闭，否则就开启
			// return[address]: 返回控件
			function toggle() {
				if (isOpen) {
					close();
				} else {
					open();
				}
				return ctrl.public;
			}
			// 获取控件值
			// val[string]: 返回控件值
			function val() {
				var val = [];
				if (arrValObjects.province && arrValObjects.city && arrValObjects.area) {
					val.push(arrValObjects.province.name);
					val.push(arrValObjects.city.name);
					val.push(arrValObjects.area);
				}
				return val;
			}

			// #endregion

			// #region 事件处理

			// 事件绑定
			function bindEvent() {
				var btnEvent = event($addressBtn);
				btnEvent.setTap(toggle);
				var icoEvent = event($addressPower);
				icoEvent.setTap(toggle);
				var tabEvent = event($addressListTab.children());
				tabEvent.setTap(tabShow);

				$addressTabindex.bind('focus', function () {
					callbacksCtrlClose.fire($address);
					open();
				});
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 控件初始项
				ctrl.$current = $address;
				ctrl.autoClose = close;

				// 设置初始选项
				setOptions(options, userOptions);
				// 转移宿主属性
				transferStyles(ctrl.$origin, $address);
				transferAttrs(ctrl.$origin, $address);
				transferName(ctrl.$origin, $addressValue);

				// 获取地址数据
				getDatas();
				// 显示默认文本
				setShowText();
				// 把 $address 放入原标签后
				ctrl.$origin.after($address);
				// 移除原标签
				ctrl.$origin.remove();

				// 事件绑定
				bindEvent();
			}());

			// #endregion

			// #region 返回

			ctrl.public.open = open;
			ctrl.public.close = close;
			ctrl.public.toggle = toggle;
			ctrl.public.val = val;
			ctrl.public.setOpen = setOpen;
			ctrl.public.setClose = setClose;
			ctrl.public.setChangeVal = setChangeVal;
			return ctrl.public;

			// #endregion

		};

	}(controlGroup('address')));
	// JS 范围控件集合
	// * 此控件会 remove 掉原宿主对象
	var range = (function (group) {

		// 重写 init 方法
		// 创建一个 JS 范围控件
		// ctrl[control]: control 对象
		// userOptions[object]: 用户参数
		// return[range]: 返回生成的控件对象
		group.init = function (ctrl, userOptions) {

			// #region 私有字段

			var // 样式类名
				className = prefixLibName + group.name,
				// 选项
				options = {
					// 是否支持双手柄
					both: function () {
						var both = ctrl.$origin.attr(prefixLibName + group.name + '-both');
						return (!both || both === 'false') ? false : true;
					}(),
					// 步长
					step: ctrl.$origin.attr('step') || ctrl.$origin.attr(prefixLibName + group.name + '-step'),
					// 最小值
					min: ctrl.$origin.attr('min') || ctrl.$origin.attr(prefixLibName + group.name + '-min'),
					// 最大值
					max: ctrl.$origin.attr('max') || ctrl.$origin.attr(prefixLibName + group.name + '-max'),
					// 获取值
					value: ctrl.$origin.attr('value') || ctrl.$origin.attr(prefixLibName + group.name + '-value')
				},
				// 左右值
				valueLeft = 0, valueRight = 0,
				// 步长, 步长位数, 最小值, 最大值
				step = 0, stepDigit = 0, min = 0, max = 0,
				// 控件对象
				$range = $([
					'<div class="' + className + '">',
					'<input type="text" maxlength="20" class="ud2-ctrl-txtbox" />',
					'<div class="ud2-ctrl-power"><i class="ico">&#xe81b;</i><i class="ico">&#xe689;</i></div>',
					'<div class="' + className + '-list"><div class="' + className + '-end" /><div class="' + className + '-back" /></div>',
					'</div>'
				].join('')),
				// 控件输入框
				$rangeInput = $range.children('input'),
				// 控件开关容器
				$rangePower = $rangeInput.next(),
				// 控件 list 容器
				$rangeList = $rangePower.next(),
				// 第一个按钮
				$btnLeft = $a.clone().addClass(className + '-hand'),
				// 第二个按钮
				$btnRight = $a.clone().addClass(className + '-hand'),
				// 按钮背景
				$btnsBack = $rangeList.find('.' + className + '-back'),
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
				// 浮点运算常数
				DEBUG_NUM = 10000000,
				// 控件开关状态
				isOpen = false,
				// 回调函数
				callbacks = {
					// 开启回调
					open: $.noop,
					// 关闭回调
					close: $.noop,
					// 值改变
					changeVal: $.noop
				};

			// #endregion

			// #region 私有方法

			// 检测控件默认值，对于不符合要求的值替换为可用值
			function detectOptions() {
				var oldMin, oldMax, oldVal, oldLeftVal, oldRightVal, oldStep;
				// 获取步长
				oldStep = (function () {
					var step = options.step || 1;
					step = parseFloat(step);
					if (typeof step !== 'number' || isNaN(step) || step === 0) step = 1;
					return step;
				}());
				// 获取最小值
				oldMin = (function () {
					var min = options.min || 0;
					min = parseFloat(min);
					if (typeof min !== 'number' || isNaN(min)) min = 0;
					return min;
				}());
				// 获取最大值
				oldMax = (function () {
					var max = options.max || 100;
					max = parseFloat(max);
					if (typeof min !== 'number' || isNaN(max)) max = 100;
					return max;
				}());
				// 获取值
				oldVal = convertValue(options.value);
				oldLeftVal = oldVal[0];
				oldRightVal = oldVal[1];

				// 解决最小值大于最大值问题
				if (oldMin > oldMax) { oldMax = oldMin; }
				// 输出新数据
				step = oldStep;
				min = oldMin;
				max = oldMax;
				// 获取步长位数
				if (step.toString().indexOf('.') > -1) stepDigit = step.toString().split('.')[1].length;

				// 获取最大位移
				updateHandleInfoSize();
				// 设置值
				setValue(oldLeftVal, oldRightVal);
				// 更新处理信息数据值项
				updateHandleInfoValue();
			}
			// 更新处理信息数据值项
			function updateHandleInfoValue() {
				handleInfo.nl = valueToPercent(valueLeft);
				handleInfo.nr = valueToPercent(valueRight);
			}
			// 更新处理信息数据尺寸项
			function updateHandleInfoSize() {
				// 获取按钮宽度
				handleInfo.w = $btnLeft.outerWidth();
				// 计算出按钮的外容器宽度
				handleInfo.bw = $rangeList.width(),
				// 计算出按钮的最大位移
				handleInfo.max = handleInfo.bw - handleInfo.w;
			}
			// 设置控件值，并更新显示属性
			// valLeft[number]: 控件的左侧值
			// valRight[number]: 控件的右侧值
			function setValue(valLeft, valRight) {
				var percentLeft, percentRight, inMin, inMax, valMin, valMax, val;
				// 判断当前值小于最小值或大于最大值
				if (valLeft < min) valLeft = min;
				if (valLeft > max) valLeft = max;
				// 让值存在于符合步长值集合中 (value = min + step * x);
				valueLeft = Math.round((valLeft - min) / step) * (DEBUG_NUM * step) / DEBUG_NUM + min;
				//if (valueLeft < min) valueLeft = Math.ceil((valLeft - min) / step) * (DEBUG_NUM * step) / DEBUG_NUM + min;

				// 左侧手柄位置
				percentLeft = valueToPercent(valueLeft);
				$btnLeft.css('left', percentToViewPos(percentLeft) + '%');

				// 如果不是双手柄
				if (!options.both) {
					// 显示手柄和值
					$btnsBack.css('width', percentLeft * 100 + '%');
					$rangeInput.val(valueLeft);
					val = valueLeft;
				}
				else {
					// 判断当前值小于最小值或大于最大值
					if (valRight < min) valRight = min;
					if (valRight > max) valRight = max;
					// 让值存在于符合步长值集合中 (value = min + step * x);
					valueRight = Math.round((valRight - min) / step) * (DEBUG_NUM * step) / DEBUG_NUM + min;
					// if (valueRight < min) valueRight = Math.ceil((valRight - min) / step) * (DEBUG_NUM * step) / DEBUG_NUM + min;
					percentRight = valueToPercent(valueRight);
					$btnRight.css({ 'left': percentToViewPos(percentRight) + '%' });

					// 显示手柄和值
					inMin = Math.min(percentLeft, percentRight);
					inMax = Math.max(percentLeft, percentRight);
					valMin = Math.min(valueLeft, valueRight);
					valMax = Math.max(valueLeft, valueRight);
					$btnsBack.css({ 'left': inMin * 100 + '%', 'width': ((inMax - inMin) * 100) + '%' });
					$rangeInput.val(valMin + ',' + valMax);
					val = [valMin, valMax];
				}

				callbacks.changeVal.call(ctrl.public, val);
			}
			// 值转换
			// oldVal[string]: 旧值
			// return[array]: 左右新值
			function convertValue(oldVal) {
				var oldLeftVal = null, oldRightVal = null;
				if (oldVal) oldVal = oldVal.split(','); else oldVal = [0, 0];
				oldLeftVal = oldVal[0] || 0;
				oldLeftVal = oldLeftVal !== 0 ? (parseFloat(oldLeftVal) || 0) : oldLeftVal;
				oldRightVal = oldVal[1] || 0;
				oldRightVal = oldRightVal !== 0 ? (parseFloat(oldRightVal) || 0) : oldRightVal;
				return [oldLeftVal, oldRightVal];
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

			// #endregion

			// #region 回调方法

			// 设置开启回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setOpen(fn) { callbacks.open = fn; return ctrl.public; }
			// 设置关闭回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setClose(fn) { callbacks.close = fn; return ctrl.public; }
			// 设置值改变回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[range]: 当前事件对象，方便链式调用
			function setChangeVal(fn) { callbacks.changeVal = fn; return ctrl.public; }

			// #endregion

			// #region 公共方法

			// 打开控件
			// return[range]: 返回选项控件
			function open() {
				if (!isOpen) {
					// 更新处理信息数据
					updateHandleInfoSize();
					if (!options.both) {
						setValue(valueLeft);
					} else {
						setValue(valueLeft, valueRight);
					}
					updateHandleInfoValue();

					isOpen = true;
					$range.addClass(className + '-on');
					$rangePower.addClass(prefixLibName + 'ctrl-power-on');

					callbacks.open.call(ctrl.public);
				}

				return ctrl.public;
			}
			// 关闭控件
			// return[range]: 返回选项控件
			function close() {
				if (isOpen) {
					isOpen = false;
					$range.removeClass(className + '-on');
					$rangePower.removeClass(prefixLibName + 'ctrl-power-on');

					callbacks.close.call(ctrl.public);
				}

				return ctrl.public;
			}
			// 开关控件
			// return[range]: 返回选项控件
			function toggle() {
				if (isOpen) {
					close();
				} else {
					open();
				}
				return ctrl.public;
			}
			// 获取控件值
			// return[number(1), array(2)]: 返回控件值
			function val() {
				if (!options.both) {
					return valueLeft;
				} else {
					var valMin = Math.min(valueLeft, valueRight),
						valMax = Math.max(valueLeft, valueRight);
					return [valMin, valMax];
				}
			}

			// #endregion

			// #region 事件绑定

			// 输入框获取焦点
			function inputFocus() {
				callbacksCtrlClose.fire($range);
				open();
			}
			// 输入框键盘按下事件
			// event[event]: 事件对象
			function inputKeyDown(event) {
				if (event.keyCode === 13) $rangeInput.blur();
			}
			// 输入框失去焦点事件
			function inputBlur() {
				var val = convertValue($rangeInput.val());
				updateHandleInfoSize();
				setValue(val[0], val[1]);
				updateHandleInfoValue();
			}
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
				} else {
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
			// 事件绑定
			function bindEvent() {
				var // 左侧按钮事件对象
					btnLeftEvent = event($btnLeft),
					// 右侧按钮事件对象
					btnRightEvent = event($btnRight);

				event($rangePower).setTap(toggle);
				btnLeftEvent.setDown(updateHandleInfoSize).setPan(leftMove).setUp(leftUp);
				btnRightEvent.setDown(updateHandleInfoSize).setPan(rightMove).setUp(rightUp);
				$rangeInput.bind('focus', inputFocus).bind('keydown', inputKeyDown).bind('blur', inputBlur);
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 控件初始项
				ctrl.$current = $range;
				ctrl.autoClose = close;

				// 设置初始选项
				setOptions(options, userOptions);

				// 转移宿主属性
				transferStyles(ctrl.$origin, $range);
				transferAttrs(ctrl.$origin, $range);
				transferName(ctrl.$origin, $rangeInput);

				// 把$range放在原标签后
				ctrl.$origin.after($range);
				// 移除原标签
				ctrl.$origin.remove();
				// 置入按钮
				$btnsBack.after($btnLeft);
				if (options.both) $btnsBack.after($btnRight);

				// 检测控件默认值
				detectOptions();

				// 绑定事件
				bindEvent();
			}());

			// #endregion

			// #region 返回

			ctrl.public.val = val;
			ctrl.public.open = open;
			ctrl.public.close = close;
			ctrl.public.toggle = toggle;
			ctrl.public.setOpen = setOpen;
			ctrl.public.setClose = setClose;
			ctrl.public.setChangeVal = setChangeVal;
			return ctrl.public;

			// #endregion

		};

	}(controlGroup('range')));
	// JS 数字控件集合
	// * 此控件会 remove 掉原宿主对象
	var number = (function (group) {

		// 重写 init 方法
		// 创建一个 JS 数字控件
		// ctrl[control]: control 对象
		// userOptions[object]: 用户参数
		// return[number]: 返回生成的控件对象
		group.init = function (ctrl, userOptions) {

			// #region 私有字段

			var // 样式类名
				className = prefixLibName + group.name,
				// 默认值
				options = {
					// 步长
					step: function () {
						var step = ctrl.$origin.attr('step') || ctrl.$origin.attr(className + '-step') || 1;
						step = parseFloat(step);
						if (type.isNumber(step) || isNaN(step) || step === 0) step = 1;
						return step;
					}(),
					// 最小值
					min: function () {
						var min = ctrl.$origin.attr('min') || ctrl.$origin.attr(className + '-min') || 0;
						min = parseFloat(min);
						if (type.isNumber(step) || isNaN(min)) min = 0;
						return min;
					}(),
					// 最大值
					max: function () {
						var max = ctrl.$origin.attr('max') || ctrl.$origin.attr(className + '-max') || 100;
						max = parseFloat(max);
						if (type.isNumber(step) || isNaN(max)) max = 100;
						return max;
					}(),
					// 值
					value: ctrl.$origin.attr('value') || ctrl.$origin.attr(className + '-value') || 0
				},
				// 值, 步长, 最小值, 最大值
				value = 0, step = 0, min = 0, max = 0,
				// 控件对象
				$number = $([
					'<div class="' + className + '">',
					'<a class="' + className + '-ico">&#xe6b6;</a>',
					'<div class="' + className + '-move"><input type="text" value="0" class="ud2-ctrl-txtbox" /></div>',
					'<a class="' + className + '-ico">&#xe6b7;</a>',
					'</div>'
				].join('')),
				// 控件输入框
				$numberInput = $number.find('input'),
				// 控件上一个按钮
				$numberPrev = $number.children('a:first'),
				// 控件下一个按钮
				$numberNext = $number.children('a:last'),
				// 控件移动容器
				$move = $numberPrev.next(),
				// 浮点运算常数
				DEBUG_NUM = 10000000,
				// 动画锁
				lock = false,
				// 回调函数
				callbacks = {
					// 值改变
					changeVal: $.noop
				};

			// #endregion

			// #region 私有方法

			// 获取旧控件全部属性
			function detectOptions() {
				// 输出新数据
				step = options.step;
				min = options.min;
				max = options.max;
				// 解决最小值大于最大值问题
				if (min > max) { max = min; }
				value = convertValue(options.value);
				$numberInput.val(value);
			}
			// 强制转换 value 值
			// val[number]: 待转换的值
			// return[number]: 返回转换后的值
			function convertValue(val) {
				val = val || 0;
				val = parseFloat(val);
				if (typeof val !== 'number' || isNaN(val)) val = 0;
				if (val < min) val = min;
				if (val > max) val = max;
				val = Math.round((val - min) / step) * (DEBUG_NUM * step) / DEBUG_NUM + min;
				return val;
			}
			// 执行控件动画，对值递增或递减
			// isNext[bool]: 是否为递增动画
			// - true: 递增 false: 递减
			function animate(isNext) {
				// 判断是否上锁，没上锁则上锁并执行动画
				if (lock) return; lock = true;
				// 判断上下限
				if ((isNext && (value + step > max))
					|| (!isNext && (value - step < min))) { lock = false; return; }

				var // 建立临时容器
					$tempL = $div.clone().addClass(className + '-view').html('<input class="ud2-ctrl-txtbox" />'),
					$tempR = $div.clone().addClass(className + '-view').html('<input class="ud2-ctrl-txtbox" />'),
					// 获取父容器
					$parent = $numberInput.parent(),
					// 用于存储动画容器
					$run = null;

				// 对值运算
				if (isNext) {
					value = Math.round((value + step) * DEBUG_NUM) / DEBUG_NUM;
				} else {
					value = Math.round((value - step) * DEBUG_NUM) / DEBUG_NUM;
				}

				// 加入临时容器
				$tempL.children().val(value);
				$tempR.children().val(value);
				$numberInput.before($tempL);
				$numberInput.after($tempR);

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
			function setValue(val) {
				value = val;
				$numberInput.val(value);
				callbacks.changeVal.call(ctrl.public, value);
			}

			// #endregion

			// #region 回调方法

			// 设置值改变回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[number]: 当前事件对象，方便链式调用
			function setChangeVal(fn) { callbacks.changeVal = fn; return ctrl.public; }

			// #endregion

			// #region 公共方法

			// 获取空间值
			// return[number]: 控件当前值
			function val() {
				return value;
			}

			// #endregion

			// #region 事件绑定

			// 事件绑定
			function bindEvent() {
				event($numberPrev).setTap(prev);
				event($numberNext).setTap(next);
				$numberInput.keydown(function (event) {
					if (event.keyCode === 13) $numberInput.blur();
				}).focus(function () {
					callbacksCtrlClose.fire($number);
					$number.addClass(className + '-on');
				}).blur(function () {
					var v = convertValue($numberInput.val());
					setValue(v);
					$number.removeClass(className + '-on');
				});
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				ctrl.$current = $number;

				// 设置初始选项
				setOptions(options, userOptions);
				// 获取旧控件属性
				detectOptions();

				// 转移宿主属性
				transferStyles(ctrl.$origin, $number);
				transferAttrs(ctrl.$origin, $number);
				transferName(ctrl.$origin, $numberInput);

				// 把$number放在原标签后
				ctrl.$origin.after($number);
				// 移除原标签
				ctrl.$origin.remove();

				// 绑定事件
				bindEvent();
			}());

			// #endregion

			// #region 返回

			ctrl.public.val = val;
			ctrl.public.setChangeVal = setChangeVal;
			return ctrl.public;

			// #endregion

		};

	}(controlGroup('number')));
	// JS 日历控件集合
	// * 此控件会 remove 掉原宿主对象
	var calendar = (function (group) {

		// 重写 init 方法
		// 创建一个 JS 数字控件
		// ctrl[control]: control 对象
		// userOptions[object]: 用户参数
		// return[calendar]: 返回生成的控件对象
		group.init = function (ctrl, userOptions) {

			// #region 私有字段

			var // 样式类名
				className = prefixLibName + group.name,
				// 默认值
				options = {
					// 默认文本
					autoText: ctrl.$origin.attr('placeholder') || ctrl.$origin.attr(className + '-text') || '请选择日期',
					// 默认日期格式化
					format: ctrl.$origin.attr(prefixLibName + group.name + '-format') || 'yyyy/MM/dd',
					// 获取原控件日期数据
					date: ctrl.$origin.attr('value') || ctrl.$origin.attr(prefixLibName + group.name + '-value') || ''
				},
				// 本地日期
				localDate = new Date(),
				// 控件日期数据对象
				dateValue = {
					// 补位运算
					// text[string]: 补位前日期
					// return[string]: 返回补位后的结果
					seats: function(text){
						return (text.toString().length === 1 ? '0' : '') + text;
					},
					// 设置控件日期数据的 toString 方法
					// return[string]: 输出符合格式要求的日期字符串
					toString: function () {
						var format = options.format;
						format = format
							.replace(/y{4}/, this.time.getFullYear())
							.replace(/y{2}/, this.time.getFullYear() - 2000)
							.replace(/MM/, this.seats(this.time.getMonth() + 1))
							.replace(/M/, this.time.getMonth() + 1)
							.replace(/dd/, this.seats(this.time.getDate()))
							.replace(/d/, this.time.getDate());
						return format;
					},
					// 设置控件日期数据对象的值
					// y[string]: 年份
					// M[string]: 月份
					// d[string]: 日期
					setDateValue: function (y, M, d) {
						if (arguments.length === 3
							&& arguments[0] && arguments[1] && arguments[2]) {
							if (y.length === 2) y = '20' + y;
							y = parseInt(y);
							M = parseInt(M) - 1;
							d = parseInt(d);
							if (this.time.getFullYear() !== y
								|| this.time.getMonth() !== M
								|| this.time.getDate() !== d) {
								this.time = new Date(y, M, d);
								this.view();
								callbacks.changeVal.call(ctrl.public, this.toString());
							}
						}
					},
					// 显示控件时间
					view: function(){
						$calendarInput.val(this.toString());
					},
					// 控件时间值
					// 默认为系统时间
					time: localDate,
					// 系统当前时间
					now: localDate,
					// 选择时间
					select: localDate,
					// 重置选择时间
					selectReset: function () {
						this.select = new Date(this.time.getFullYear(), this.time.getMonth(), this.time.getDate());
						dateHtmlCreate();
					}
				},
				// 提示字符串
				tipsString = ['上一年', '下一年', '上个月', '下个月', '前12年', '后12年', '年份选择', '返回日期选择'],
				// 星期字符串
				weekString = ['日', '一', '二', '三', '四', '五', '六'],
				// 月份字符串
				monthString = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
				// 月份天数
				dateNum = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
				// 生成一个 calendar 的 jQuery 对象
				$calendar = $([
					'<div class="' + className + '">',
					'<input type="text" placeholder="' + options.autoText + '" maxlength="20" class="ud2-ctrl-txtbox" />',
					'<span class="ud2-ctrl-power"><i class="ico">&#xe634;</i><i class="ico">&#xe689;</i></span>',
					'<div class="' + className + '-list">',

					// 日期列表
					'<div class="' + className + '-datelist"><div class="ud2-calendar-tools">',
					'<div class="ud2-calendar-tools-left"><a class="ico ico-rotate-half" title="', tipsString[0], '">&#xe6f7;</a><a class="ico ico-rotate-half" title="', tipsString[2], '">&#xe6f1;</a></div>',
					'<div class="ud2-calendar-tools-right"><a class="ico" title="', tipsString[3], '">&#xe6f1;</a><a class="ico" title="', tipsString[1], '">&#xe6f7;</a></div>',
					'<div class="ud2-calendar-tools-text" title="', tipsString[6], '">-年 -月</div>',
					'</div><table /><div class="ud2-calendar-btns"><button class="btn sm" tabindex="-1">今日</button></div></div>',
					// 时间列表
					'<div class="' + className + '-ymlist"><div class="ud2-calendar-tools">',
					'<div class="ud2-calendar-tools-left"><a class="ico ico-rotate-half" title="', tipsString[4], '">&#xe6f7;</a></div>',
					'<div class="ud2-calendar-tools-right"><a class="ico" title="', tipsString[5], '">&#xe6f7;</a></div>',
					'<div class="ud2-calendar-tools-text" title="', tipsString[7], '">年份 / 月份</div>',
					'</div><table /><div class="ud2-calendar-btns"><button class="btn sm" tabindex="-1">确定</button></div></div>',

					'</div></div>'
				].join('')),
				// 控件隐藏值插件
				$calendarInput = $calendar.children('[type="text"]'),
				// 控件开关容器
				$calendarPower = $calendarInput.next(),
				// 控件日期容器
				$calendarDate = $calendar.find(['.', className, '-datelist'].join('')),
				// 控件年月容器
				$calendarYM = $calendar.find(['.', className, '-ymlist'].join('')),

				// 控件是否开启
				isOpen = false,
				// 回调函数
				callbacks = {
					// 开启回调
					open: $.noop,
					// 关闭回调
					close: $.noop,
					// 值改变
					changeVal: $.noop
				};

			// #endregion

			// #region 私有方法

			// 通过 format 转换日期
			// text[string]: 将字符串转换为日期
			function convertDate(text) {
				var format = options.format,
					formatDMY = /^dd?(-|\.|\/)MM?\1yy(?:yy)?$/,
					textCN = /^((?:\d{2}|\d{4})年|(?:\d{1,2})月|(?:\d{1,2})日){1,3}$/;

				if (textCN.test(text)) {
					// 年月日组合

					var d = /(\d{1,2})日/.exec(text),
						m = /(\d{1,2})月/.exec(text),
						y = /(\d{2}|\d{4})年/.exec(text);

					d = (d && d[1]) || '1';
					m = (m && m[1]) || '1';
					y = (y && y[1]) || dateValue.time.getFullYear().toString();
					dateValue.setDateValue(y, m, d);
				}
				else if (formatDMY.test(format)) {
					// dd.MM.yyyy dd-MM-yyyy dd/MM/yyyy
					// d.M.yy d-M-y d/M/y

					var spt = formatDMY.exec(format)[1],
						dArr = text.split(spt);
					dateValue.setDateValue(dArr[2], dArr[1], dArr[0]);
				}
				else if (format === 'yyyy-MM-dd') {
					// ISO 日期

					var dArr = text.split('-');
					dateValue.setDateValue(dArr[0], dArr[1], dArr[2]);
				}
				else {
					// 可转换日期

					var date = new Date(text);
					if (!isNaN(date)) {
						dateValue.setDateValue(date.getFullYear(), date.getMonth() + 1, date.getDate());
					} else {
						options.format = 'yyyy/MM/dd';
						dateValue.setDateValue(dateValue.time.getFullYear().toString(),
							(dateValue.time.getMonth() + 1).toString(),
							dateValue.time.getDate().toString());
					}
				}
			}
			// 日期初始化
			function dateInit() {
				var // 工具按钮
					$toolsBtn = $calendarDate.find(['.', className, '-tools a'].join('')),
					// 底部按钮
					$bottomBtn = $calendarDate.find(['.', className, '-btns button'].join('')),
					// 文本容器 
					$text = $calendarDate.find(['.', className, '-tools-text'].join(''));

				dateHtmlCreate();
				event($toolsBtn.eq(0)).setTap(function () {
					dateValue.select.setFullYear(dateValue.select.getFullYear() - 1);
					dateHtmlCreate();
				});
				event($toolsBtn.eq(3)).setTap(function () {
					dateValue.select.setFullYear(dateValue.select.getFullYear() + 1);
					dateHtmlCreate();
				});
				event($toolsBtn.eq(1)).setTap(function () {
					dateValue.select.setMonth(dateValue.select.getMonth() - 1);
					dateHtmlCreate();
				});
				event($toolsBtn.eq(2)).setTap(function () {
					dateValue.select.setMonth(dateValue.select.getMonth() + 1);
					dateHtmlCreate();
				});
				event($text).setTap(function () {
					$calendarDate.slideUp(300);
					$calendarYM.slideDown(300);
					ymHtmlCreate();
				});

				event($bottomBtn.eq(0)).setTap(function () {
					dateValue.setDateValue(dateValue.now.getFullYear(), dateValue.now.getMonth() + 1, dateValue.now.getDate());
					close(true);
				});
			}
			// 日期 HTML 生成
			function dateHtmlCreate() {
				var // HTML 容器
					$html = $calendarDate.children('table'),
					// 文本容器 
					$text = $calendarDate.find(['.', className, '-tools-text'].join('')),
					// 存储 HTML
					html = [],
					// 闰年
					isLeapYear = dateValue.select.getFullYear() % 4 === 0,
					// 上个月
					lastMonth = dateValue.select.getMonth() - 1 < 0 ? 11 : dateValue.select.getMonth() - 1,
					// 本月天数
					monthDateNum = dateNum[dateValue.select.getMonth()],
					// 上个月天数
					lastMonthDateNum = dateNum[lastMonth],
					// 星期
					week = new Date(dateValue.select.getFullYear(), dateValue.select.getMonth(), 1).getDay();

				// 在文本容器内显示时间
				$text.html(dateValue.select.getFullYear() + '年 ' + (dateValue.select.getMonth() + 1) + '月');

				// 闰年
				if (isLeapYear && dateValue.select.getMonth() === 1) monthDateNum = 29;
				if (isLeapYear && dateValue.select.getMonth() === 2) lastMonthDateNum = 29;

				// 生成 HTML
				html.push('<tr>');
				for (var i in weekString) html.push(['<th>', weekString[i], '</th>'].join(''));
				html.push('</tr><tr>');

				for (var i = 0, j = -1, k = 0; i < 42; i++) {
					if (i < week) {
						j++;
						html.push('<td class="', className, '-nomonth">', (lastMonthDateNum - week + i + 1), '</td>');
					} else {
						if (i - j <= monthDateNum) {
							html.push('<td class="',
								((i + 1) % 7 === 0 || (i + 1) % 7 === 1 ? className + '-weekend' : ''), '" ',
								className, '-date="', (i - j), '" ',
								// 显示当前日期
								(dateValue.select.getFullYear() === dateValue.now.getFullYear()
									&& dateValue.select.getMonth() === dateValue.now.getMonth()
									&& dateValue.now.getDate() === (i - j)
									? className + '-today ' : ''),
								// 显示选择日期
								(dateValue.select.getFullYear() === dateValue.time.getFullYear()
									&& dateValue.select.getMonth() === dateValue.time.getMonth()
									&& dateValue.time.getDate() === (i - j)
									? className + '-now ' : ''),
								'>', (i - j), '</td>');
						}
						else {
							k++;
							html.push('<td class="', className, '-nomonth">', k, '</td>');
						}
					}
					if ((i + 1) % 7 === 0) { html.push('</tr><tr>'); }
				}

				$html.children().remove();
				$html.append(html.join(''))

				event($html.find(['[', className, '-date]'].join(''))).setTap(function () {
					dateValue.setDateValue(dateValue.select.getFullYear(),
						dateValue.select.getMonth() + 1, this.attr(className + '-date'));
					dateValue.view();
					close(true);
				});
			}
			// 年份月份初始化
			function ymInit() {
				var // 工具按钮
					$toolsBtn = $calendarYM.find(['.', className, '-tools a'].join('')),
					// 底部按钮
					$bottomBtn = $calendarYM.find(['.', className, '-btns button'].join('')),
					// 文本容器 
					$text = $calendarYM.find(['.', className, '-tools-text'].join(''));

				ymHtmlCreate();

				event($toolsBtn.eq(0)).setTap(function () {
					dateValue.select.setFullYear(dateValue.select.getFullYear() - 12);
					ymHtmlCreate();
				});

				event($toolsBtn.eq(1)).setTap(function () {
					dateValue.select.setFullYear(dateValue.select.getFullYear() + 12);
					ymHtmlCreate();
				});

				event($bottomBtn.eq(0)).setTap(function () {
					$calendarDate.slideDown(300);
					$calendarYM.slideUp(300);
					dateHtmlCreate();
				});

				event($text).setTap(function () {
					$calendarDate.slideDown(300);
					$calendarYM.slideUp(300);
					dateHtmlCreate();
				});
			}
			// 年份月份 HTML 生成
			function ymHtmlCreate() {
				var $html = $calendarYM.children('table'),
					html = [], yearFirst = 0,
					yearAttr = className + '-year', yearSelector = ['[', yearAttr, ']'].join(''),
					monthAttr = className + '-month', monthSelector = ['[', monthAttr, ']'].join(''),
					nowAttr = className + '-now';

				yearFirst = dateValue.select.getFullYear() % 12 === 0
					? dateValue.select.getFullYear() - 11
					: parseInt(dateValue.select.getFullYear() / 12) * 12 + 1;

				html.push('<tr><td>');
				for (var i = 0; i < 12; i++) {
					html.push('<div ',
						className, '-year="', (yearFirst + i), '" ',
						// 显示选择日期
						(dateValue.select.getFullYear() === yearFirst + i ? nowAttr : ''),
						'>', (yearFirst + i), '</div>');
				}
				html.push('</td><td>');
				for (var i = 0; i < 12; i++) {
					html.push('<div ',
						className, '-month="', i, '" ',
						// 显示选择日期
						(dateValue.select.getMonth() === i ? nowAttr : ''),
						'>', monthString[i], '</div>');
				}
				html.push('</td></tr>')
				$html.children().remove();
				$html.append(html.join(''));

				event($html.find(yearSelector)).setTap(function () {
					dateValue.select.setFullYear(this.attr(yearAttr));
					$html.find(yearSelector).removeAttr(nowAttr);
					this.attr(nowAttr, '');
				});

				event($html.find(monthSelector)).setTap(function () {
					dateValue.select.setMonth(this.attr(monthAttr));
					$html.find(monthSelector).removeAttr(nowAttr);
					this.attr(nowAttr, '');
				});
			}

			// #endregion

			// #region 回调方法

			// 设置开启回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setOpen(fn) { callbacks.open = fn; return ctrl.public; }
			// 设置关闭回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setClose(fn) { callbacks.close = fn; return ctrl.public; }
			// 设置开启回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setChangeVal(fn) { callbacks.changeVal = fn; return ctrl.public; }

			// #endregion

			// #region 公共方法

			// 开启控件
			function open() {
				if (!isOpen) {
					isOpen = true;
					$calendar.addClass(className + '-on');
					$calendarPower.addClass(prefixLibName + 'ctrl-power-on');
					$calendarDate.show();
					$calendarYM.hide();

					callbacks.open.call(ctrl.public);
				}
				return ctrl.public;
			}
			// 关闭控件
			// (?) noUpdate[bool]: 不进行值更新
			function close(noUpdate) {
				if (isOpen) {
					isOpen = false;
					$calendar.removeClass(className + '-on');
					$calendarPower.removeClass(prefixLibName + 'ctrl-power-on');

					if (!noUpdate) {
						convertDate($calendarInput.val());
						dateValue.selectReset();
						dateValue.view();
					}

					dateHtmlCreate();
					callbacks.open.call(ctrl.public);
				}
				return ctrl.public;
			}
			// 开关控件
			function toggle() {
				if (!isOpen) {
					open();
				} else {
					close();
				}
				return ctrl.public;
			}

			// #endregion

			// #region 事件绑定

			// 输入框获取焦点事件回调
			function inputFocus() {
				callbacksCtrlClose.fire($calendar);
				open();
			}
			// 输出框键盘按下事件回调
			function inputKeyDown(event) {
				if (event.keyCode === 13) {
					close();
					$calendarInput.blur();
				}
			}
			// 事件绑定
			function bindEvent() {
				var icoEvent = event($calendarPower);
				icoEvent.setTap(toggle);

				$calendarInput
					.bind('focus', inputFocus)
					.bind('keydown', inputKeyDown);
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 控件初始项
				ctrl.$current = $calendar;
				ctrl.autoClose = close;

				// 设置初始选项
				setOptions(options, userOptions);

				// 获取原控件值并设置给新控件
				if (ctrl.$origin.val() !== '') {
					convertDate(ctrl.$origin.val());
					dateValue.selectReset();
				}

				// 转移宿主属性
				transferStyles(ctrl.$origin, $calendar);
				transferAttrs(ctrl.$origin, $calendar);
				transferName(ctrl.$origin, $calendarInput)

				// 把 $calendar 放在原标签后
				ctrl.$origin.after($calendar);
				// 移除原标签
				ctrl.$origin.remove();

				// 对日期容器与年月份容器初始化
				dateInit();
				ymInit();

				// 事件绑定
				bindEvent();
			}());

			// #endregion

			// #region 返回

			ctrl.public.open = open;
			ctrl.public.close = close;
			ctrl.public.toggle = toggle;
			ctrl.public.setOpen = setOpen;
			ctrl.public.setClose = setClose;
			ctrl.public.setChangeVal = setChangeVal;
			return ctrl.public;

			// #endregion
		};

	}(controlGroup('calendar')));
	// JS 文件上传控件集合
	// * 此控件会 remove 掉原宿主对象
	var file = (function (group) {

		// 重写 init 方法
		// 创建一个 JS 文件上传控件
		// ctrl[control]: control 对象
		// userOptions[object]: 用户参数
		// return[calendar]: 返回生成的控件对象
		group.init = function (ctrl, userOptions) {

			// #region 私有字段

			var // 样式类名
				className = prefixLibName + group.name,
				// 默认值
				options = {
					// 默认控件样式
					// full 富文件样式 | base 常规文件样式 | single 单文件样式 | custom 自定义样式
					type: (function () {
						var t = ctrl.$origin.attr(className + '-type');
						if (t !== 'full' && t !== 'base' && t !== 'single' && t !== 'custom') {
							t = 'full';
						}
						return t;
					}()),
					// 最大文件量
					// 默认为 20
					maxLength: parseInt(ctrl.$origin.attr(className + '-maxlength')) || 20,
					// 单个文件最大尺寸(KB)
					// 默认值为 2048KB
					// 值可以为 png, jpg, gif, txt, doc, docx, xls, xlsx, ppt, pptx, zip, rar, ett, wpt, dpt
					maxSize: parseInt(ctrl.$origin.attr(className + '-maxsize')) || 2048,
					// 是否启用文件重命名控制
					fileRename: (function () {
						var rename = ctrl.$origin.attr(className + '-rename');
						if (rename === 'true' || rename === '') rename = true;
						else rename = false;
						return rename;
					}()),
					// 文件过滤方案
					// 默认值为 all
					fileFilter: (function () {
						var filter = ctrl.$origin.attr(className + '-filter') || '',
							files = 'png|jpg|gif|bmp|svg|ico|html|js|cs|vb|css|less|scss|sass|mp3|mp4|wav|avi|ogg|mov|wmv|webm|flv|swf|txt|pdf|doc|docx|xls|xlsx|ppt|pptx|ett|wpt|dpt|rar|zip|iso',
							i = 0, len = 0;
						filter = (new RegExp("^((" + files + "),)*(" + files + ")$").test(filter)) ? filter : 'all';
						filter = filter === 'all' ? files.split('|') : filter.split(',');
						len = filter.length;
						for (; i < len; i++) filter[filter[i]] = filter[i];
						return filter;
					}()),
					// 处理 URL
					url: {
						// 文件提交
						upload: '',
						// 文件列表
						fileList: '',
						// 文件重命名
						fileRename: '',
						// 文件移除
						fileRemove: ''
					}
				},
				// 生成一个 file 的 jQuery 对象
				$file = $([
					'<div class="' + className + '">',
					'<input type="file" />',
					'</div>'
				].join('')),
				// 控件的文件输入框
				$fileInput = $file.children('input'),
				// 待上传的文件集合
				upfiles = [],
				// 控件状态
				// 0 未上传  1 上传中  2 已完成
				upState = 0,
				// 上传完成统计
				upCompleteNum = 0,
				// 上传失败统计
				upErrorNum = 0,
				// 文件操作功能函数
				fileFn = {
					// 文件添加
					fileAdd: $.noop,
					// 文件移出
					fileRemove: $.noop,
					// 文件上传
					fileUpload: $.noop,
					// 文件清空
					fileClear: $.noop,
					// 文件上传进度
					progress: $.noop,
					// 文件上传完成
					success: $.noop
				},
				// 回调函数
				callbacks = {
					// 发生错误
					error: function (errType, userArg) {
						switch (errType) {
							case 'repeat-error': message('您选择的文件数量已经超过最大个数限制，该限制为 ' + options.maxLength + ' 个', 4); break;
							case 'type-error': message('您选择的文件类型不符合要求，请您重新选择文件', 4); break;
							case 'size-error': message(['您选择的文件超出 ', options.maxSize, 'KB 限制，尺寸不符的文件：', errFile.join("、")], 4); break;
							case 'repeat-error': message(['您选择的文件已存在于列表中，重复的文件：', userArg.join("、")], 3); break;
							case 'server-error': message('您的文件 ' + userArg + ' 已被阻止，请检查您的文件', 4); break;
						}
					},
					// 上传完成
					complete: $.noop
				};

			// #endregion

			// #region 私有方法

			// 检测文件类型
			// files[file]: 选择文件集合
			// return[bool]: 返回类型检测状态  false 未通过检测  true 通过检测
			function filesTypeCheck(files) {
				var errNum = 0, ext, i = 0, len = files.length;

				// 迭代
				for (; i < len; i++) {
					// 当前文件扩展名
					ext = files[i].name.split('.');
					ext = ext[ext.length - 1].toLowerCase();
					if (!ext || options.fileFilter[ext] === undefined) { return false; }
				}

				return true;
			}
			// 文件处理并加入到待上传列表
			// files[file]: 选择文件集合
			function filesHandler(files) {
				var i = 0, len = files.length;
				if (len + upfiles.length > options.maxLength) {
					callbacks.error.call(ctrl.public, 'length-error');
				}
				else if (!filesTypeCheck(files)) {
					callbacks.error.call(ctrl.public, 'type-error');
				}
				else {
					var errFile = [], repeatFile = [], up = 0;
					for (; i < len; i++) {
						if (files[i].size > options.maxSize * 1024) {
							errFile.push(files[i].name);
						}
						else {
							if (upfiles.some(function (file) {
								return file.name === files[i].name 
									&& file.size === files[i].size;
							})) {
								repeatFile.push(files[i].name);
							} else {
								upfiles.push(files[i]);
								fileFn.fileAdd(files[i]);
								up++;
							}
						}
					}

					if (repeatFile.length > 0) {
						callbacks.error.call(ctrl.public, 'repeat-error', repeatFile);
					}

					if (errFile.length > 0) {
						callbacks.error.call(ctrl.public, 'size-error');
					}
				}
			}
			// 清除文件输入框的值
			function fileInputClear() {
				var $form;
				if ($fileInput.val() !== '') {
					if ($fileInput.parent().get(0).nodeName.toLowerCase() !== 'form') {
						$form = $('<form />');
						$fileInput.wrap($form);
					}
					$form = $fileInput.parent();
					$form.get(0).reset();
				}
			}
			// 文件输入框选择回调
			function fileInputChange() {
				filesHandler(this.files);
				fileInputClear();
			}

			// 控件 full 类型
			function fileTypeFull() {
				var // 无文件
					$fileEmpty = $([
						'<div class="', className, '-full-nofile">',
						'<button class="btn btn-blue btn-solid" ud2-file-add><i class="ico">&#xe617;</i> 添加文件</button><em>拖拽文件上传 / 长按CTRL键可多选上传</em>',
						'</div>'
					].join('')),
					// 拖拽文件
					$fileDrag = $([
						'<div class="', className, '-full-drag">请松开鼠标按钮，文件将进入待上传队列</div>'
					].join('')),
					// 图片列表
					$fileList = $([
						'<div class="', className, '-full-list">',
						'<div class="', className, '-full-add" ud2-file-add><div><i class="ico">&#xe683;</i><em>继续添加文件</em></div></div>',
						'</div>'
					].join('')),
					// 上传按钮
					$fileTools = $([
						'<div class="', className, '-full-tools"><button class="btn btn-solid">确定上传</button><button class="btn btn-solid">清空列表</button></div>'
					].join('')),
					// 控件添加按钮
					$fileAdd,
					// 上传完毕计数
					upEndNum = 0, upErrorNum = 0;

				// 上传状态显示
				function uploadStateView() {
					if (upEndNum === upfiles.length) {
						$fileTools.html('全部文件已上传完毕，共 ' + upEndNum + ' 个' + (upErrorNum !== 0 ? '，失败 ' + upErrorNum + ' 个' : ''));
					} else {
						$fileTools.html('已上传文件 ' + upEndNum + ' 个' + (upErrorNum !== 0 ? '，失败 ' + upErrorNum + ' 个' : ''));
					}
				}

				// 设置布局
				setLayout($fileList, className + "-full")
				// 为控件添加样式
				$fileList.after($fileEmpty).after($fileDrag).after($fileTools);

				// 寻找添加按钮并添加功能
				$fileAdd = $file.find(['[', className, '-add]'].join(''));
				bindFileAdd($fileAdd);
				bindUpload($fileTools.children().eq(0));
				bindClear($fileTools.children().eq(1));
				// 绑定处理方法
				bindFileAddFn(function (file) {
					var // 显示图片容器
						$box = $([
							'<div class="', className, '-full-figure">',
							'<div class="', className, '-full-img"><img ondragstart="return false;" /></div><div>', file.name, '</div>',
							'<div class="', className, '-full-close"></div><div class="', className, '-full-progress"></div></div>'
						].join('')),
						// 关闭按钮
						$boxClose = $box.children(':last'),
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
					bindFileRemove($boxClose, file);

					// 放入列表
					$fileList.prepend($box);
					window.setTimeout(function () { $box.addClass(className + '-full-figure-on'); }, 150);
				});
				bindFileRemoveFn(function (file) {
					var index = upfiles.indexOf(file);
					upfiles.splice(index, 1);
					file.element.removeClass(className + '-full-figure-on');
					window.setTimeout(function () { file.element.remove(); }, 100);
					if (upfiles.length === 0) {
						$fileEmpty.show();
						$fileList.hide();
						$fileTools.hide();
					}
				});		
				bindClearFn(function () {
					$fileList.children().not('[' + className + '-add]').remove();
					$fileEmpty.show();
					$fileList.hide();
					$fileTools.hide();
				});
				bindProgressFn(function (file, progress) {
					var $progress = file.element.find('.' + className + '-full-progress');
					$progress.css('width', progress + '%');
					$progress.html(progress + '%');
				});
				bindUploadFn(function () {
					$fileList.find('[' + className + '-add]').hide();
					$fileList.find('.' + className + '-full-close').hide();
					$fileTools.html('文件开始上传...');
				});
				bindSuccessFn(function (file) {
					upEndNum++;
					uploadStateView();
					file.element.addClass('success');
				});
				bindFailFn(function (file) {
					upEndNum++;
					upErrorNum++;
					uploadStateView();
					file.element.addClass('fail');
					callbacks.error.call(ctrl.public, 'server-error', file.name);
				});

				// 文件拖拽事件绑定
				$file.bind('dragenter', function () {
					if (upState !== 0) return;
					$file.addClass('ud2-file-full-dragenter');
				});
				$fileDrag
					.bind('dragleave', function () {
						if (upState !== 0) return;
						$file.removeClass('ud2-file-full-dragenter');
					})
					.bind('dragover', function (event) {
						if (upState !== 0) return;
						event.preventDefault();
						$file.addClass('ud2-file-full-dragenter');
					})
					.bind('drop', function (event) {
						if (upState !== 0) return;
						event.preventDefault();
						event = event.originalEvent;
						var files = (event.dataTransfer && event.dataTransfer.files)
							|| (event.target && event.target.files);
						filesHandler(files);
						$file.removeClass('ud2-file-full-dragenter');
				});		
			}
			// 控件类型初始化
			function fileTypeInit() {
				// 添加功能属性
				$fileInput.attr('multiple', 'multiple');
				// 类型工厂
				switch (options.type) {
					case 'full': {
						fileTypeFull();
						break;
					}
					case 'base': {
						break;
					}
					case 'single': {
						break;
					}
					case 'custom': {
						break;
					}
				}
			}
			// 控件 XML HTTP REQUEST 设置
			function xhrSetting(file) {
				var data = new FormData();
				data.append('file', file);

				$.ajax({
					'type': 'POST',
					'url': options.url.upload,
					'data': data,
					'contentType': false,
					'processData': false,
					'xhr': function () {
						var xhr = $.ajaxSettings.xhr();
						if (xhr.upload) {
							xhr.upload.addEventListener('progress', function (event) {
								var progress = parseInt((event.loaded / event.total) * 100);
								fileFn.progress(file, progress);
							}, false);
						}
						return xhr;
					}
				}).done(function () {
					upCompleteNum++;
					if (upCompleteNum === upfiles.length) callbacks.complete.call(ctrl.public);
					fileFn.success(file);
				}).fail(function () {
					upCompleteNum++;
					upErrorNum++;
					if (upCompleteNum === upfiles.length) callbacks.complete.call(ctrl.public);
					fileFn.fail(file);
				});
			}

			// #endregion

			// #region 回调方法

			// 设置文件选取错误回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setError(fn) { callbacks.error = fn; return ctrl.public; }
			// 设置上传完成回调函数
			// 所回调的函数 this 指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[select]: 当前事件对象，方便链式调用
			function setComplete(fn) { callbacks.complete = fn; return ctrl.public; }

			// #endregion

			// #region 公共方法

			// 设置控件布局
			// $layout[jQuery]: 布局对象
			// className[string]: 控件根元素样式
			function setLayout($layout, className) {
				if (className && type.isString(className)) $file.addClass(className);
				if (type.isJQuery($layout)) $file.append($layout);
				return ctrl.public;
			}

			// 为按钮绑定文件添加功能
			// $fileAdd[jQuery]: 添加按钮
			function bindFileAdd($fileAdd) {
				if (type.isJQuery($fileAdd)) {
					event($fileAdd, { stopPropagation: true }).setTap(function () {
						if (upState !== 0) return;
						$fileInput.trigger("click");
					});
				}
				return ctrl.public;
			}
			// 为按钮绑定文件删除功能
			// $fileClose[jQuery]: 删除按钮
			// file[file]: 待删除的文件
			function bindFileRemove($fileRemove, file) {
				if (type.isJQuery($fileRemove)) {
					event($fileRemove, { stopPropagation: true }).setTap(function () {
						if (upState !== 0) return;
						fileFn.fileRemove.call(this, file);
					});
				}
				return ctrl.public;
			}	
			// 为按钮绑定文件上传功能
			// $fileUpload[jQuery]: 上传按钮
			function bindUpload($fileUpload) {
				if (type.isJQuery($fileUpload)) {
					event($fileUpload, { stopPropagation: true }).setTap(function () {
						if (upState !== 0 || upfiles.length === 0) return;
						
						var data = new FormData(), i = 0, len = upfiles.length;
						for (; i < len; i++) xhrSetting(upfiles[i]);

						fileFn.fileUpload.call(this);
					});
				}
				return ctrl.public;
			}		
			// 为按钮绑定待文件清空功能
			// $fileClear[jQuery]: 清空按钮
			function bindClear($fileClear) {
				if (type.isJQuery($fileClear)) {
					event($fileClear, { stopPropagation: true }).setTap(function () {
						if (upState !== 0) return;
						upfiles.length = 0;

						fileFn.fileClear.call(this);
					});
				}
				return ctrl.public;
			}

			// 为文件添加功能绑定处理方法
			// fileAdd[function]: 处理方法
			function bindFileAddFn(fileAdd) {
				if (type.isFunction(fileAdd)) {
					fileFn.fileAdd = fileAdd;
				}
				return ctrl.public;
			}
			// 为文件删除功能绑定处理方法
			// fileRemove[function]: 处理方法
			function bindFileRemoveFn(fileRemove) {
				if (type.isFunction(fileRemove)) {
					fileFn.fileRemove = fileRemove;
				}
				return ctrl.public;
			}
			// 为文件上传功能绑定处理方法
			// upload[function]: 处理方法
			function bindUploadFn(upload) {
				if (type.isFunction(upload)) {
					fileFn.fileUpload = upload;
				}
				return ctrl.public;
			}
			// 为文件清空功能绑定处理方法
			// clear[function]: 处理方法
			function bindClearFn(clear) {
				if (type.isFunction(clear)) {
					fileFn.fileClear = clear;
				}
				return ctrl.public;
			}
			// 为文件进度函数功能绑定处理方法
			// progress[function]: 处理方法
			function bindProgressFn(progress) {
				if (type.isFunction(progress)) {
					fileFn.progress = progress;
				}
				return ctrl.public;
			}
			// 为文件完成功能绑定处理方法
			// success[function]: 处理方法
			function bindSuccessFn(success) {
				if (type.isFunction(success)) {
					fileFn.success = success;
				}
				return ctrl.public;
			}
			// 为文件失败功能绑定处理方法
			// fail[function]: 处理方法
			function bindFailFn(fail) {
				if (type.isFunction(fail)) {
					fileFn.fail = fail;
				}
				return ctrl.public;
			}

			// 设置处理文件添加的服务器路径
			function setUploadUrl(url) {
				options.url.upload = url;
				return ctrl.public;
			}

			// #endregion

			// #region 事件绑定

			// 事件绑定
			function bindEvent() {
				// 文件编辑回调
				$fileInput.bind('change', fileInputChange);
			}
			
			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 设置初始选项
				setOptions(options, userOptions);

				// 转移宿主属性
				transferStyles(ctrl.$origin, $file);
				transferAttrs(ctrl.$origin, $file);
				$fileInput.attr('accept', ctrl.$origin.attr('accept'));

				// 把 $calendar 放在原标签后
				ctrl.$origin.after($file);
				// 移除原标签
				ctrl.$origin.remove();
				// 控件类型初始化
				fileTypeInit();

				// 事件绑定
				bindEvent();
			}());

			// #endregion

			// #region 返回

			// 控件绑定对象
			ctrl.public.bind = {
				fileAddBtn: bindFileAdd,
				fileRemoveBtn: bindFileRemove,
				fileAddFn: bindFileAddFn,
				fileRemoveFn: bindFileRemoveFn,
				upload: bindUpload,
				uploadFn: bindUploadFn,
				clear: bindClear,
				clearFn: bindClearFn
			}
			ctrl.public.setUploadUrl = setUploadUrl;
			ctrl.public.setError = setError;
			ctrl.public.setComplete = setComplete;
			ctrl.public.upfiles = upfiles;
			return ctrl.public;

			// #endregion

		};

	}(controlGroup('file')));


	var table = (function (group) {

		// 重写 init 方法
		// 创建一个 JS 选择控件，此控件重写了原 HTML 的 table 控件
		// IMPORT: 对象或生成的对象必须为 table
		// ctrl[control]: control 对象
		// userOptions[object]: 用户参数
		// return[select]: 返回生成的控件对象
		group.init = function (ctrl, userOptions) {
			var // 样式类名
				className = prefixLibName + group.name,
				// 选项
				options = {
					// 默认表格列宽度
					colWidth: 200
				},
				// 表格外层容器
				$tableBox = $div.clone(),
				// 表格数据
				tableData = {
					thead: { row: [], col: [], cell: [] },
					tbody: { row: [], col: [], cell: [] },
					tfoot: { row: [], col: [], cell: [] }
				};

			// 表格行对象
			function Row(section) {
				this.section = section;
				this.cells = [];

				section.row.push(this);
			}
			Row.prototype = {
				addCell: function (cell) {
					this.cells.push(cell);
				}
			}

			// 表格列对象
			function Col(section, width) {
				this.section = section;
				this.cells = [];
				this.width = width || options.colWidth;

				section.col.push(this);
			}
			Col.prototype = {
				addCell: function (cell) {
					this.cells.push(cell);
				}
			}

			// 表格单元格对象
			function Cell(section, text, rowspan, colspan, merged, rowIndex, colIndex) {
				this.section = section;
				this.text = text;
				this.rowspan = rowspan;
				this.colspan = colspan;
				this.merged = merged || false;

				section.row[rowIndex].addCell(this);
				section.col[colIndex].addCell(this);
				section.cell.push(this);
			}


			// 分析表格行列
			function analysisRanks(section) {
				var $rows = section.$origin.children('tr'),
					$colCells = $rows.eq(0).children('td'),
					r = 0, c = 0, cs = 0, rs = 0;

				rs = $rows.length;
				$colCells.each(function (i) { cs += parseInt($(this).attr('colspan') || 1); });

				for (var i = 0; i < cs; i++) new Col(section);
				for (var i = 0; i < rs; i++) new Row(section);

				return { row: rs, col: cs };
			}

			// 分析节点
			function analysisSection(section) {
				var $trs = section.$origin.children('tr'), $tr, $tds, $td,
					ranks = analysisRanks(section), rule = [],
					cs, rs;

				for (var r = 0; r < ranks.row; r++) {
					for (var c = 0, cby = 0; c < ranks.col; c++, cby++) {
						var isRule = false;
						rule.forEach(function (item) {
							if (c >= item.start[1] && c <= item.start[1] + item.len[1]
								&& r >= item.start[0] && r <= item.start[0] + item.len[0]) {
								cby--;
								isRule = true;
								return;
							}
						});
						if (isRule) {
							new Cell(section, '', rs, cs, true, r, c);
						} else {
							$td = $trs.eq(r).children('td').eq(cby);
							cs = parseInt($td.attr('colspan') || 1);
							rs = parseInt($td.attr('rowspan') || 1);
							if (cs > 0 || rs > 0) rule.push({ start: [r, c], len: [rs - 1, cs - 1] });
							new Cell(section, $td.html(), rs, cs, false, r, c);
						}
					}
				}


			}
			// 分析表格
			function analysisTable() {
				var $thead = ctrl.$origin.children('thead'),
					$tbody = ctrl.$origin.children('tbody'),
					$tfoot = ctrl.$origin.children('tfoot');

				tableData.thead.$origin = $thead;
				tableData.thead.$origin.parent = tableData.thead;
				tableData.tbody.$origin = $tbody;
				tableData.tbody.$origin.parent = tableData.tbody;
				tableData.tfoot.$origin = $tfoot;
				tableData.tfoot.$origin.parent = tableData.tfoot;

				if (tableData.thead.$origin.length !== 0) analysisSection(tableData.thead);
				if (tableData.tbody.$origin.length !== 0) analysisSection(tableData.tbody);
				if (tableData.tfoot.$origin.length !== 0) analysisSection(tableData.tfoot);
			}

			function getScrollSize() {
				var p = document.createElement('p'),
					styles = {
						width: '100px',
						height: '100px',
						overflowY: 'scroll'
					}, i, scrollbarWidth;
				for (i in styles) p.style[i] = styles[i];
				document.body.appendChild(p);
				scrollbarWidth = p.offsetWidth - p.clientWidth;
				p.remove();
				return scrollbarWidth;
			}

			// 初始化
			(function init() {
				// 设置初始选项
				setOptions(options, userOptions);
				// 转移宿主属性
				transferStyles(ctrl.$origin, $tableBox);
				transferAttrs(ctrl.$origin, $tableBox);

				// 分析控件组和控件
				analysisTable();




				// 
				ctrl.$origin.after($tableBox);
				ctrl.$origin.remove();


				var $table = $('<table />');
				var $tr = $('<tr />');
				var $td = $('<td />');


			}());

			ctrl.public.thead = tableData.thead;
			ctrl.public.tbody = tableData.tbody;
			ctrl.public.tfoot = tableData.tfoot;

			// 返回
			return ctrl.public;
		};

	}(controlGroup('table')));

	// #endregion

	// #region ud2 初始化及返回参数

	// 初始化
	(function init() {
		// 当文档加载完成时的回调方法
		$dom.ready(function () {
			// 如果是 Safari 浏览器则为 body 添加 touchstart 事件监听
			// 用途是解决 :hover :active 等伪类选择器延迟的问题
			if (support.safari) document.body.addEventListener('touchstart', $.noop);
			// 执行 PageReady 的回调函数
			callbacksPageReady.fire();

			// 当用户触碰屏幕且未触碰任何有价值(无效触碰)控件时，执行页面触碰按下的事件回调
			// 用途是解决部分控件当触碰控件外时执行相应回调方法
			$dom.bind(EVENT_DOWN, function (event) {
				var typeName = 'ctrlCloseEvent', type = event.type, domType = $dom.data(typeName);
				if (!domType || type === domType) {
					$dom.data(typeName, type);
					callbacksCtrlClose.fire(event.target);
				}
				if (type === 'mousedown') $dom.data(typeName, null);
			});
		});

		// 把 ud2.createAll 方法添入页面加载完成回调函数中
		callbacksPageReady.add(ud2.createAll);
	}());

	// 公开对象函数库
	ud2.regex = regex;
	ud2.support = support;
	ud2.type = type;
	ud2.convert = convert;
	ud2.form = form;
	// 公开对象及方法
	ud2.animateFrame = animateFrame;
	ud2.event = event;
	ud2.eventMouseWheel = eventMouseWheel;
	ud2.ctrl = control;
	ud2.ctrlGroup = controlGroup;
	ud2.scroll = scroll;
	ud2.message = message;
	// 返回控件
	return ud2;

	// #endregion

}(window, jQuery));