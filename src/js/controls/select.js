/// <reference path="../ud2.js" />

// 选择控件
ud2.libExtend(function (inn, ud2) {
	'use strict';

	inn.controlCreater('select', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = inn.className(cls),
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
		inn.creater('group', function () {

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
							$group.attr(cn('disabled'), 'true');
							if (j = options.length, j !== 0) {
								for (i = 0; i < j; i++) groupObj.select.valOption(options[i], 0);
							}
						}
						else {
							$group.removeAttr(cn('disabled'));
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
				if (len === 1 && ud2.type.isObject(argObj)) {
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
				$group = inn.jqe[0].clone()
					.attr('title', label)
					.addClass(cn('group'));
				// 设置禁用状态
				if (isDisabled) $group.attr(cn('disabled'), 'true');
			}());

			// 返回
			return ud2.extend(groupObj, {
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
		inn.creater('option', function () {

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
					$option.attr(cn('value'), value);
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
						$option.addClass('on');
					}
					else {
						isSelected = false;
						$option.removeClass('on');
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
						$option.attr(cn('disabled'), 'true');
						if (isSelected) {
							// 此项顺序不可调换
							if (optionObj.select !== null) optionObj.select.valOption(optionObj, false);
						}
					}
					else {
						isDisabled = false;
						$option.removeAttr(cn('disabled'));
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
				if (len === 1 && ud2.type.isObject(argObj)) {
					label = argObj.label;
					value = argObj.value;
					isDisabled = !!argObj.isDisabled;
					isSelected = !isDisabled && !!argObj.isSelected;
				}
				else {
					label = args[0];
					value = args[1];
					isDisabled = !!args[2];
					isSelected = !isDisabled && !!args[3];
				}
				// 未传递参数时，给定默认值
				label = String(label) || '未命名选项';
				if (value !== null) value = String(value);
				// 创建选项内容元素
				$option = inn.jqe[2].clone()
					.html(label)
					.attr('title', label)
					.attr(cn('value'), value)
					.addClass(cn('option'));
				// 设置禁用状态
				if (isDisabled) $option.attr(cn('disabled'), 'true');
				// 设置选中状态
				if (isSelected) selectedOperate(true);

				// 设置选项对象事件
				ud2.event($option).setTap(function () {
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
			return ud2.extend(optionObj, {
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
					isMultiple = inn.boolCheck(options.multiple, false);
					// 初始化空列表占位文本
					emptyText = options.emptyText || '当前列表未包含任何项';
					// 初始化开启菜单是否移动到选中项
					isMoveSelected = inn.boolCheck(options.moveSelected, false);

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
					open: inn.noop,
					// 关闭回调
					close: inn.noop,
					// 值改变
					change: inn.noop
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
				getContent().attr(cn('empty'), emptyText);
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
						disabled = !!($group.attr('disabled') !== void 0 && $group.attr('disabled') !== 'false'
							|| $group.attr(cn('disabled')) !== void 0 && $group.attr(cn('disabled')) !== 'false');
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
						attrVal = $options.eq(i).attr('value'),
						attrPrivateVal = $options.eq(i).attr(cn('value')),
						val = attrPrivateVal === void 0
							? attrVal === void 0 ? null : attrVal
							: attrPrivateVal,
						disabled = !!($options.eq(i).attr('disabled') !== void 0 && $options.eq(i).attr('disabled') !== 'false'
							|| $options.eq(i).attr(cn('disabled')) !== void 0 && $options.eq(i).attr(cn('disabled')) !== 'false'),
						selected = !!($options.eq(i).attr('selected') !== void 0 && $options.eq(i).attr('selected') !== 'false'
							|| $options.eq(i).attr(cn('selected')) !== void 0 && $options.eq(i).attr(cn('selected')) !== 'false');
					console.log(attrVal, attrPrivateVal, val);

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
				if (ud2.type.isString(text)) {
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
				if (ud2.type.isString(text)) {
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
					$select.addClass('on').focus();
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
					$select.removeClass('on');

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
					if (ud2.type.isArray(arr)) {
						arr = arr.map(function (a) { return a === null ? a : String(a); });
						for (i = optionValueCollection.length - 1; i >= 0; i--) valOption(optionValueCollection[i], false);
						for (i = 0; i < optionCollection.length; i++) {
							if (!optionCollection[i].disabled()
								&& (!optionCollection[i].group || optionCollection[i].group && !optionCollection[i].group.disabled())
								&& arr.indexOf(optionCollection[i].val()) !== -1) valOption(optionCollection[i]);
						}
					}
					else {
						return val(inn.argsToArray(arguments));
					}
					return control.public;
				}
				else {
					for (i = 0; i < optionValueCollection.length; i++) valArr.push(optionValueCollection[i].val());
					$value.val(valArr.join(','));
					return isMultiple ? valArr : valArr[0] !== null ? valArr[0] : null;
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
							$btn.removeAttr(cn('value')).html(placeholder);
						}
						else {
							$btn.attr(cn('value'), true).html(optionValueCollection.length + '个项目');
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
							$btn.removeAttr(cn('value')).html(placeholder);
						}
						else {
							option.selected(1);
							optionValueCollection.push(option);
							$btn.attr(cn('value'), true).html(option.label());
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
				ud2.event($box).setTap(toggle);
				$tab.on(inn.an.event[17], open);
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
				listScroll = ud2.scroll($list, {
					barState: 0, isScrollMode: true,
					barColor: 'rgba(0,0,0,.2)',
					barColorOn: 'rgba(0,0,0,.4)'
				});
				getContent().attr(cn('empty'), emptyText);

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
				ud2.extend(control.public, {
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

});