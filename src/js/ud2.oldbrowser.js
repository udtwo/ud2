(function () {
	var // Object原型
		objectPrototype = Object.prototype,
		// Array原型
		arrayPrototype = Array.prototype,
		// Function原型
		functionPrototype = Function.prototype,
		// Array对象的slice方法，用于快捷调用
		slice = arrayPrototype.slice,
		// Function对象的call方法，用于快捷调用
		call = Function.prototype.call,
		// 强制转换为对象
		// val: ? => 待转换变量
		toObject = function (val) {
			if (val == null) {
				throw new TypeError('不能强制转换 ' + val + ' 为对象');
			}
			return Object(val);
		},
		// 强制转换为整型
		// num: number | ? => 待转换变量
		toInteger = function (num) {
			// 试图转换为数字
			num = +num;
			// 如果不是数字，则强制转换为0
			if (num !== num) {
				num = 0;
			}
				// 如果n不是0 且不是正负无穷
			else if (num !== 0 && num !== (1 / 0) && num !== -(1 / 0)) {
				// 正数向下取整，负数向上取整
				num = (num > 0 || -1) * Math.floor(Math.abs(num));
			}
			return num;
		},
		// 错误字符串
		errStr = {
			100: '参数应为function',
			101: '空数组执行reduce或reduceRight没有传入初始值'
		};

	// 空方法
	function empty() { }

	// ES5 Function.prototype.bind http://es5.github.io/#x15.3.4.5
	// 用于改变函数主体
	// (MSDN) 对给定函数创建具有与原始函数相同主体的绑定函数，在绑定函数中，'this'对象将解析为传入对象，绑定函数具有指定的初始参数
	// https://msdn.microsoft.com/zh-cn/library/ff841995
	// 如果Function对象原型中不存在bind方法则创建一个bind方法
	if (!functionPrototype.bind) {
		functionPrototype.bind = function (that) {
			var // 保存this变量
				target = this;

			// 传参不是function则报错(参数类型错误)
			if (typeof target !== 'function') throw new TypeError('bind方法的传入参数应为Function');

			var // 复制一个arguments，不包含传入的that参数
				args = slice.call(arguments, 1),
				// 绑定了所属对象的方法
				bound = function () {
					// 如果this属于bound的实例
					// slice.call([..]) 可用于快速复制(克隆)数组
					if (this instanceof bound) {
						var // 目标执行结果
							result = target.apply(this, args.concat(slice.call(arguments)));
						// 如果执行结果为对象则返回此结果
						if (Object(result) === result) return result;
						// 否则返回bound的this
						return this;
					} else {
						return target.apply(that, args.concat(slice.call(arguments)));
					}
				};

			// 如果原this存在原型，则复制此原型到bound中
			if (target.prototype) {
				empty.prototype = target.prototype;
				bound.prototype = new empty();
				empty.prototype = null;
			}

			// 返回绑定所属对象的方法
			return bound;
		}
	}

	var // Object对象的toString方法，用于快捷调用
		_toString = call.bind(objectPrototype.toString);

	// ES5 Array.isArray http://es5.github.com/#x15.4.3.2
	// 用于判断参数是否为数组
	if (!Array.isArray) {
		Array.isArray = function isArray(obj) {
			return _toString(obj) == "[object Array]";
		};
	}

	// ES5 Array.prototype.forEach http://es5.github.com/#x15.4.4.18 */
	// 用于数组的每一项都执行一次给定的函数
	// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
	if (!arrayPrototype.forEach) {
		arrayPrototype.forEach = function (callback /*, callbackBody */) {
			var // 将object赋值为调用forEach方法的数组
				object = toObject(this),
				// 获取数组的长度，且强制转换为正整数(toUint32)
				len = object.length >>> 0,
				// 迭代变量
				i = 0,
				// 回调主体
				callbackBody = arguments[1];

			// 判断回调函数是否类型正确
			if (_toString(callback) !== '[object Function]') throw new TypeError(errStr[100]);

			// 迭代数组
			while (i < len) {
				// 判断i是否存在于数组对象中
				if (i in object) callback.call(callbackBody, object[i], i, object);
				// 迭代变量递增
				i++;
			}
		};
	}

	// ES5 Array.prototype.map http://es5.github.com/#x15.4.4.19 */
	// 用于返回一个由原数组中的每个元素调用一个指定方法后的返回值组成的新数组
	// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map
	if (!arrayPrototype.map) {
		arrayPrototype.map = function (callback /*, callbackBody */) {
			var // 将object赋值为调用map方法的数组
				object = toObject(this),
				// 获取数组的长度，且强制转换为正整数(toUint32)
				len = object.length >>> 0,
				// 迭代变量
				i = 0,
				// 回调主体
				callbackBody = arguments[1],
				// 返回结果数组
				result;

			// 判断回调函数是否类型正确
			if (_toString(callback) !== '[object Function]') throw new TypeError(errStr[100]);

			// 创建一个返回数组
			result = Array(len);

			// 迭代数组
			while (i < len) {
				if (i in object) result[i] = callback.call(callbackBody, object[i], i, object);
				i++;
			}

			// 返回结果数组
			return result;
		}
	}

	// ES5 Array.prototype.filter http://es5.github.com/#x15.4.4.20 */
	// 用于利用所有通过指定函数测试的元素创建一个新的数组并返回
	// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
	if (!arrayPrototype.filter) {
		arrayPrototype.filter = function (callback /*, callbackBody */) {
			var // 将object赋值为调用map方法的数组
				object = toObject(this),
				// 获取数组的长度，且强制转换为正整数(toUint32)
				len = object.length >>> 0,
				// 回调主体
				callbackBody = arguments[1],
				// 结果数组
				result = [];

			// 判断回调函数是否类型正确
			if (_toString(callback) !== '[object Function]') throw new TypeError(errStr[100]);

			// 迭代数组
			for (var i = 0 ; i < len; i++) {
				if (i in object) {
					value = object[i];
					if (callback.call(callbackBody, value, i, object)) {
						result.push(value);
					}
				}
			}

			// 返回结果数组
			return result;
		}
	}

	// ES5 Array.prototype.every http://es5.github.com/#x15.4.4.16 */
	// 用于测试数组的所有元素是否都通过了指定函数的测试
	// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/every
	if (!arrayPrototype.every) {
		arrayPrototype.every = function (callback /*, callbackBody */) {
			var // 将object赋值为调用map方法的数组
				object = toObject(this),
				// 获取数组的长度，且强制转换为正整数(toUint32)
				len = object.length >>> 0,
				// 回调主体
				callbackBody = arguments[1];

			// 判断回调函数是否类型正确
			if (_toString(callback) !== '[object Function]') throw new TypeError(errStr[100]);

			// 迭代数组
			for (var i = 0 ; i < len; i++) {
				if (i in object && !callback.call(callbackBody, object[i], i, object)) return false;
			}
			return true;
		}
	}

	// ES5 Array.prototype.some http://es5.github.com/#x15.4.4.17 */
	// 用于测试数组中的某些元素是否通过了指定函数的测试
	// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/some
	if (!arrayPrototype.some) {
		arrayPrototype.some = function (callback /*, callbackBody */) {
			var // 将object赋值为调用map方法的数组
				object = toObject(this),
				// 获取数组的长度，且强制转换为正整数(toUint32)
				len = object.length >>> 0,
				// 回调主体
				callbackBody = arguments[1];

			// 判断回调函数是否类型正确
			if (_toString(callback) !== '[object Function]') throw new TypeError(errStr[100]);

			// 迭代数组
			for (var i = 0 ; i < len; i++) {
				if (i in object && callback.call(callbackBody, object[i], i, object)) return true;
			}
			return false;
		}
	}

	// ES5 Array.prototype.reduce http://es5.github.com/#x15.4.4.21 */
	// 用于接收一个函数作为累加器(accumulator)，数组中的每个值(从左到右)开始缩减，最终为一个值
	// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
	if (!arrayPrototype.reduce) {
		arrayPrototype.reduce = function (callback /*, initial*/) {
			var // 将object赋值为调用map方法的数组
				object = toObject(this),
				// 获取数组的长度，且强制转换为正整数(toUint32)
				len = object.length >>> 0;

			// 判断回调函数是否类型正确
			if (_toString(callback) !== '[object Function]') throw new TypeError(errStr[100]);
			// 判断数组长度为0且不存在initial参数则报错(没有传入初始值)
			if (!len && arguments.length === 1) throw new TypeError(errStr[101]);

			var // 迭代参数
				i = 0,
				// 是否传入了初始化值
				isInitial = false,
				// 保存每次迭代的返回值
				value;

			if (arguments.length > 1) {
				isInitial = true;
				value = arguments[1];
			}

			for (; i < len; ++i) {
				if (i in object) {
					if (isInitial) {
						value = callback(value, object[i], i, object);
					} else {
						value = object[i];
						isInitial = true;
					}
				}
			}

			if (!isInitial) throw new TypeError(errStr[101]);
			return value;
		}
	}

	// ES5 Array.prototype.reduceRight http://es5.github.com/#x15.4.4.22 */
	// 用于接受一个函数作为累加器（accumulator)，让每个值(从右到左)缩减为一个值
	// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight
	if (!arrayPrototype.reduceRight) {
		arrayPrototype.reduceRight = function (callback /*, initial*/) {
			var // 将object赋值为调用map方法的数组
				object = toObject(this),
				// 获取数组的长度，且强制转换为正整数(toUint32)
				len = object.length >>> 0;

			// 判断回调函数是否类型正确
			if (_toString(callback) !== '[object Function]') throw new TypeError(errStr[100]);
			// 判断数组长度为0且不存在initial参数则报错(没有传入初始值)
			if (!len && arguments.length === 1) throw new TypeError(errStr[101]);

			var // 迭代参数
				i = len - 1,
				// 保存每次迭代的返回值
				value;

			if (arguments.length > 1) {
				value = arguments[1];
			} else {
				while (i >= 0 && !i in object) i--;
				if (i < 0) throw new TypeError(errStr[101]);
				value = object[i--];
			}

			for (; i >= 0; i--) {
				if (i in object) {
					value = callback(value, object[i], i, object);
				}
			}
			return value;
		}
	}

	// ES5 Array.prototype.reduceRight http://es5.github.com/#x15.4.4.14 */
	// 用于返回根据给定元素找到的第一个索引值，否则返回-1
	// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
	if (!arrayPrototype.indexOf) {
		arrayPrototype.indexOf = function (search /*, from*/) {
			var // 将object赋值为调用map方法的数组
				object = toObject(this),
				// 获取数组的长度，且强制转换为正整数(toUint32)
				len = object.length >>> 0,
				// 索引号 
				i = 0;

			if (len === 0) return -1;
			if (arguments.length > 1) i = toInteger(arguments[1]);

			i = i >= 0 ? i : Math.max(0, len + i);
			for (; i < len; i++) {
				if (i in object && object[i] === search) return i;
			}
			return -1;
		}
	}

	// ES5 Array.prototype.reduceRight http://es5.github.com/#x15.4.4.15 */
	// 用于返回指定元素在数组中的最后一个的索引，如果不存在则返回 -1，从数组的后面向前查找，从 fromIndex 处开始
	// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf
	if (!arrayPrototype.lastIndexOf) {
		arrayPrototype.lastIndexOf = function (search /*, from*/) {
			var // 将object赋值为调用map方法的数组
				object = toObject(this),
				// 获取数组的长度，且强制转换为正整数(toUint32)
				len = object.length >>> 0,
				// 索引号 
				i = len - 1;

			if (len === 0) return -1;
			if (arguments.length > 1) i = Math.min(i, toInteger(arguments[1]));

			i = i >= 0 ? i : len - Math.abs(i);
			for (; i >= 0; i--) {
				if (i in object && search === object[i]) return i;
			}

			return -1;
		}
	}
}());