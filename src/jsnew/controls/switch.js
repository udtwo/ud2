/// <reference path="../ud2.js" />

ud2.libExtend(function (inn) {
	'use strict';

	// 开关控件
	inn.controlCreater('switch', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = inn.className(cls);

		collection.init = function (control) {

			// #region 私有字段

			var // 默认值(1:开启, 0:关闭) 是否禁用 开关颜色
				value, isDisabled, color,
				// 获取用户自定义项
				options = control.getOptions(['value', ['disabled', 'isDisabled'], 'color'], function (options) {
					// 默认值
					value = parseInt(options.value) === 1 ? 1 : 0;
					// 默认是否禁用
					isDisabled = (options.disabled, false);
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
					open: inn.noop,
					// 关闭时回调
					close: inn.noop,
					// 改变时回调
					change: inn.noop
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
							$switch.attr(cn('disabled'), 'true');
						}
						else {
							$switch.removeAttr(cn('disabled'));
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
					$switch.addClass('checked');
					setValue(1);
				}
				return control.public;
			}
			// 设置开关为关闭状态
			// return[ud2.switch]: 返回选项控件
			function close() {
				if (value) {
					$switch.removeClass('checked');
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
				ud2.event($switch).setTap(function () {
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
				if (value === 1) $switch.addClass('checked');
				$value.val(value);
				// 设置默认禁用状态
				if (isDisabled) $switch.attr(cn('disabled'), true);

				// 事件绑定
				bindEvent();
			}());

			// #endregion

			// #region 返回

			// 返回
			return ud2.extend(control.public, {
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
});