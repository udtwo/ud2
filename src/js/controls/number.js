/// <reference path="../ud2.js" />

// 数字控件
ud2.libExtend(function (inn, ud2) {
	'use strict';

	inn.controlCreater('number', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = inn.className(cls);

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // 步长, 步长位数, 最小值, 最大值, 值
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
					change: inn.noop
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
					$tempL = inn.jqe[0].clone().addClass(cn('view')).html(tInput),
					$tempR = inn.jqe[0].clone().addClass(cn('view')).html(tInput),
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
				ud2.event($prev).setTap(prev);
				ud2.event($next).setTap(next);
				ud2.eventMouseWheel($value).setDown(next).setUp(prev);
				eventKeyObj = ud2.eventKeyShortcut({ autoOn: false })
					.add(ud2.key.UP, prev)
					.add(ud2.key.DOWN, next)
					.add(ud2.key.ENTER, function () { $value.blur(); });

				$value.on(inn.an.event[17], function () {
					eventKeyObj.on();
					ud2.callbacks.autoClose.fire($number);
					$number.addClass('on');
				}).blur(function () {
					eventKeyObj.off();
					setValue($value.val());
					$number.removeClass('on');
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
			return ud2.extend(control.public, {
				val: val,
				setChange: setChange
			});

			// #endregion

		};

	});

});