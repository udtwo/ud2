/// <reference path="../ud2.js" />

// 日期选择控件
ud2.libExtend(function (inn, ud2) {
	'use strict';

	inn.controlCreater('date', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = inn.className(cls),
			// 提示字符串
			STR_TIPS = ['上一年', '下一年', '上个月', '下个月', '前12年', '后12年', '年份选择', '返回日期选择'],
			// 星期字符串
			STR_WEEK = ['日', '一', '二', '三', '四', '五', '六'],
			// 月份字符串
			STR_MONTH = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
			// 月份天数
			STR_DATE = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
			// 当前时间
			TIME = ud2.time();

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // 初始化默认文本  预格式化公式  日期值
				placeholder, format, dateValue,
				// 获取用户自定义项
				options = control.getOptions(['placeholder', 'format', 'value'], function (options) {
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
					now: new Date(TIME.valueOf()),
					// 用户在控件上当前选择的时间
					select: new Date(TIME.valueOf()),
					// 控件值格式化后的时间
					value: null
				},
				// 控件结构
				template = '<input type="text" placeholder="' + placeholder + '" maxlength="20" class="ud2-ctrl-textbox" />'
					+ '<span class="ud2-ctrl-power"><i class="ico ico-calendar" /><i class="ico ico-solid-cancel" /></span>'
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
				// 列表控件
				$list = $date.children(cn('list', 1)),
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
				ud2.event($toolsBtn.eq(0)).setTap(function () {
					dataDate.select.setFullYear(dataDate.select.getFullYear() - 1);
					dateHtmlCreate();
				});
				ud2.event($toolsBtn.eq(3)).setTap(function () {
					dataDate.select.setFullYear(dataDate.select.getFullYear() + 1);
					dateHtmlCreate();
				});
				ud2.event($toolsBtn.eq(1)).setTap(function () {
					dataDate.select.setMonth(dataDate.select.getMonth() - 1);
					dateHtmlCreate();
				});
				ud2.event($toolsBtn.eq(2)).setTap(function () {
					dataDate.select.setMonth(dataDate.select.getMonth() + 1);
					dateHtmlCreate();
				});
				// 全部日期按钮处理方法
				ud2.event($textDate).setTap(function () {
					$listDate.slideUp(300);
					$listYM.slideDown(300);
					ymHtmlCreate();
				});
				// 今日按钮与清空按钮处理方法
				ud2.event($todayBtn).setTap(function () {
					dataDate.setDateValue(dataDate.now.getFullYear(), dataDate.now.getMonth(), dataDate.now.getDate());
					dataDate.selectReset();
					close(1);
				});
				ud2.event($emptyBtn).setTap(function () {
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

				ud2.event($html.find('[' + cn('date') + ']')).setTap(function () {
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

				ud2.event($toolsBtn.eq(0)).setTap(function () {
					dataDate.select.setFullYear(dataDate.select.getFullYear() - 12);
					ymHtmlCreate();
				});
				ud2.event($toolsBtn.eq(1)).setTap(function () {
					dataDate.select.setFullYear(dataDate.select.getFullYear() + 12);
					ymHtmlCreate();
				});
				ud2.event($bottomBtn.eq(0)).setTap(function () {
					$listDate.slideDown(300);
					$listYM.slideUp(300);
					dateHtmlCreate();
				});

				ud2.event($textYM).setTap(function () {
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

				ud2.event($html.find(yearSelector)).setTap(function () {
					dataDate.select.setFullYear(this.attr(yearAttr));
					$html.find(yearSelector).removeAttr(nowAttr);
					this.attr(nowAttr, '');
				});

				ud2.event($html.find(monthSelector)).setTap(function () {
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
					$date.addClass('on');
					$power.addClass(inn.prefix + 'ctrl-power-on');
					$listDate.show();
					$listYM.hide();

					eventKeyObj.on();
					resize(inn.win().width());
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
					$date.removeClass('on');
					$power.removeClass(inn.prefix + 'ctrl-power-on');

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

			// 尺寸重置回调
			function resize(winWidth) {
				var c, w;
				if (!isOpen) return;
				$list.css('left', -1);
				w = parseInt($list.offset().left) + parseInt($list.outerWidth()) - 1;
				c = winWidth - w - 2;
				$list.css('left', c < -1 ? c : -1);
			}
			// 事件绑定
			function bindEvent() {
				ud2.event($power).setTap(toggle);
				eventKeyObj = ud2.eventKeyShortcut({ autoOn: false })
					.add(ud2.key.ENTER, function () { $value.blur(); close(); })
					.add(ud2.key.LEFT, function () { if (dataDate.value !== null) convertDate(dataDate.value.setDate(dataDate.value.getDate() - 1)); })
					.add(ud2.key.RIGHT, function () { if (dataDate.value !== null) convertDate(dataDate.value.setDate(dataDate.value.getDate() + 1)); })
					.add(ud2.key.UP, function () { if (dataDate.value !== null) convertDate(dataDate.value.setDate(dataDate.value.getDate() - 7)); })
					.add(ud2.key.DOWN, function () { if (dataDate.value !== null) convertDate(dataDate.value.setDate(dataDate.value.getDate() + 7)); });

				$value.on('focus', open);
				ud2.callbacks.pageResize.add(resize);
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

			return ud2.extend(control.public, {
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

});