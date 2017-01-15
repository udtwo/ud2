/// <reference path="../ud2.js" />

// 范围控件
ud2.libExtend(function (inn, ud2) {
	'use strict';

	inn.controlCreater('range', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = inn.className(cls);

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // 双手柄, 步长, 步长位数, 最小值, 最大值, 左值, 右值
				both, step, stepDigit, min, max, valueLeft, valueRight,
				// 获取用户自定义项
				options = control.getOptions([
					['both', 'isBoth'], 'min', 'max', 'value', 'step'
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
					both = inn.boolCheck(options.both, false);
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
				$left = inn.jqe[2].clone().addClass(cn('hand')),
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
					open: inn.noop,
					// 关闭回调
					close: inn.noop,
					// 值改变
					change: inn.noop
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
					$range.addClass('on');
					$power.addClass(inn.prefix + 'ctrl-power-on');

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
					$range.removeClass('on');
					$power.removeClass(inn.prefix + 'ctrl-power-on');

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
						ud2.type.isArray(v) ? v.join(',') : v);
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
				ud2.callbacks.autoClose.fire($range);
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
				ud2.event($power).setTap(toggle);
				ud2.event($left, { stopPropagation: true }).setDown(updateHandleInfoSize).setPan(leftMove).setUp(leftUp);
				ud2.event($right, { stopPropagation: true }).setDown(updateHandleInfoSize).setPan(rightMove).setUp(rightUp);
				eventKeyObj = ud2.eventKeyShortcut({ autoOn: false }).add(ud2.key.ENTER, function () { $value.blur(); });
				// 页面尺寸发生改变时，重新计算手柄位置
				ud2.callbacks.pageResize.add(function () {
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
			return ud2.extend(control.public, {
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

});