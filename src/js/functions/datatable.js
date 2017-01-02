/// <reference path="../ud2.js" />

// 开关控件
ud2.libExtend(function (inn, ud2) {
	'use strict';
	
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

	// #region 私有方法

	// 将传入的表格强制转换为二维数组
	// table[jQuery, string, object]: 待转换值
	// return[array]: 转换后的二维数组
	function convertTableToArray(table) {
		var $table = inn.convertToJQ(table),
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
					datagrid = inn.prefix + 'datagrid-',
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

	// #endregion

	// #region 静态方法

	// 通过数据值获取对应的数据值类型
	// value[*]: 数据值
	// return[ud2.datatable.dataType]: 返回数据值类型
	function getDataTypeByValue(value) {
		switch (true) {
			case ud2.type.isString(value): { return dataType.string; }
			case ud2.type.isNumber(value): { return dataType.number; }
			case ud2.type.isBoolean(value): { return dataType.boolean; }
			case ud2.type.isDatetime(value): { return dataType.datetime; }
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
					if (!ud2.type.isString(value)) value = String(value);
					break;
				}
				case dataType.number: {
					if (!ud2.type.isNumber(value)) value = Number(value);
					if (isNaN(value)) value = null;
					break;
				}
				case dataType.boolean: {
					if (!ud2.type.isBoolean(value)) value = Boolean(value);
					break;
				}
				case dataType.datetime: {
					if (!ud2.type.isDatetime(value)) value = new Date(value);
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
		function titleOperate(text) {
			if (text === void 0) {
				return title;
			}
			else {
				if (text !== null) title = String(text);
				else title = null;
				return columnObj;
			}
		}
		// 操作列的默认值类型
		// () 获取当前列的默认值类型
		// - return[ud2.datatable.dataType]: 返回当前列的默认值类型
		// (mode) 设置当前列的默认值类型，设置该类型会影响到当前所有单元格对象的值类型
		// - mode[ud2.datatable.dataType]: 设置当前列的默认值类型
		// - return[column]: 返回数据列对象
		function dataTypeOperate(mode) {
			if (mode === void 0) {
				return valueType;
			}
			else {
				if (!dataType[mode]) mode = null;
				valueType = mode;
				cellCollection.forEach(function (cellObj) { cellObj.dataType(valueType); });
				return columnObj;
			}
		}

		// 初始化
		(function init() {
			// 获取参数
			if (options && !ud2.type.isObject(options)) {
				titleOperate(options);
			}
			else {
				!options && (options = {});
				titleOperate(!options.title ? null : options.title);
				dataTypeOperate(options.type);
			}
		}());

		// 返回
		return ud2.extend(columnObj, {
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
			if (!ud2.type.isArray(cells)) cells = [];
			for (i = 0, l = cells.length; i < l; i++) {
				c = cells[i];
				if (ud2.type.isObject(c)) {
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
			if (options && ud2.type.isArray(options)) {
				initCell(options);
			}
			else {
				!options && (options = {});
				initCell(options.cells);
			}
		}());

		// 返回
		return ud2.extend(rowObj, {
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
		function valueOperate(val) {
			if (val === void 0) {
				return value;
			}
			else {
				value = convertValueByDataType(val, valueType);
				return cellObj;
			}
		}
		// 操作值类型
		// () 获取当前值的数据类型
		// - return[ud2.datatable.dataType]: 返回当前值的数据类型
		// (mode) 设置当前值的数据类型
		// - mode[ud2.datatable.dataType]: 待设置的值的数据类型
		// - return[cell]: 返回单元格对象
		function dataTypeOperate(mode) {
			if (mode === void 0) {
				return valueType;
			}
			else {
				if (!dataType[mode]) mode = null;
				valueType = mode;
				valueOperate(value);
				return cellObj;
			}
		}
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
			if (options && !ud2.type.isObject(options)) {
				value = options;
			}
			else {
				if (!ud2.type.isObject(options)) options = {};
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
				// ~~方法、数组值将会转换为空值
				value = options.value === void 0
					|| ud2.type.isArray(options.value) || ud2.type.isFunction(options.value) ? null : options.value;
			}

			// 当值类型存在，则将值强制转换为复合类型的值
			// 若值类型不存在，则检测当前值所属的类型，并指定为值类型
			if (valueType) {
				valueOperate(value);
			}
			else {
				// ~~对未设置数据类型的单元格标记为null，并采用string类型 getDataTypeByValue(value);
				valueType = null;
			}
		}());

		// 返回
		return ud2.extend(cellObj, {
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
	var constructor = inn.creater('datatable', function (userOptions) {

		// #region 私有字段

		var // 数据表对象
			dtObj = {},
			// 数据表选项
			columns, rows, id,
			// 默认项
			options = inn.options({
				columns: [],
				rows: []
			}, userOptions, function (options) {
				// 初始化ID
				id = options.id || inn.createControlID();
				// 初始化列参数
				if (!ud2.type.isArray(options.columns)) columns = [];
				else columns = options.columns;
				// 初始化行参数
				if (!ud2.type.isArray(options.rows)) rows = [];
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
					c = cell({ row: rowCollection[i], column: cl, type: cl.dataType() });
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
				// 更改类型
				r.cells[i].dataType(columnCollection[i].dataType());
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
			if (ud2.type.isNaturalNumber(whichColumn)) {
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
			if (ud2.type.isNaturalNumber(whichRow)) {
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
				case ud2.type.isArray(datas): {
					i = 0;
					l = datas.length;
					for (; i < l; i++) {
						if (ud2.type.isArray(datas[i]) || ud2.type.isObject(datas[i])) rowAdd(datas[i]);
					}
					break;
				}
				case ud2.type.isObject(datas) && datas.type === 'datatable': {
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

		// [*debug*]
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
			// [*debug*]
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

});