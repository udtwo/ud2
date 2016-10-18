/// <reference path="ud2.js" />

// 数据表控件
(function () {

	var // 生成器
		// name[string]: 数据表名称
		constructor = ud2.creater('dataTable', function (name) {

			var // 列对象集合
				columns = [],
				// 行对象集合
				rows = [],
				// 数据表对象
				dtObj = {};

			// 初始化
			(function init() {
				// 初始化数据表名
				name = name || '';
				// 向集合添加当前控件
				collection.push(dtObj);
				// 将数据表对象放入集合
				if (name) collection[name] = dtObj;
			})();

			// 返回数据表对象
			return ud2.extend(dtObj, {
				// 列对象集合
				columns: columns,
				// 行对象集合
				rows: rows
			});

		}),
		// 数据表集合
		collection = [],
		// 数据表类型
		type = {
			string: 'string',
			number: 'number',
			boolean: 'boolean',
			datetime: 'datetime'
		};

	// 表示数据表列的架构 
	ud2.creater('column', function (options) {

		!options && (options = {});

		var // 列对象
			columnObj = {},
			// 数据列类型
			dataType = options.dataType || type.string,
			// 是否允许为空
			allowNull = options.allowNull === void 0 ? true : !!options.allowNull,
			// 是否为自动编号
			autoIncrement = options.autoIncrement || false,
			// 如果是自动编号，种子为1
			autoIncrementSeed = options.autoIncrementSeed || 1,
			// 如果是自动编号，步长为1
			autoIncrementStep = options.autoIncrementStep || 1,
			// 列的默认值
			defaultValue = options.defaultValue || null,
			// 列是否为只读列
			readonly = options.readonly || false,
			// 列类型如果是字符串类型，设置此值为其最大长度
			maxLength = options.maxLength || -1;

		// 获取或设置数据类型
		// () 获取数据类型
		// - return[string]: 返回当前的数据类型
		// (text) 设置数据类型
		// - text[string]: 设置数据类型
		// - return[ud2.dataTable]: 返回该控件对象
		var typeOperater = ud2.propertier(function () {
			return dataType;
		}, function (text) {
			if (text && type[text]) dataType = type[text];
			return columnObj;
		});
		// 获取或设置是否允许为空
		// () 获取是否允许为空
		// - return[string]: 返回当前的数据类型
		// (isAllowNull) 设置是否允许为空
		// - isAllowNull[string]: 设置当前的数据类型
		// - return[ud2.dataTable]: 返回该控件对象
		var allowNullOperater = ud2.propertier(function () {
			return allowNull;
		}, function (isAllowNull) {
			allowNull = !!isAllowNull;
			return columnObj;
		});
		// 获取或设置是否为只读列
		// () 获取是否为只读列
		// - return[string]: 返回当前是否为只读列
		// (isReadonly) 设置是否为只读列
		// - isAllowNull[string]: 设置当前列是否为只读列
		// - return[ud2.dataTable]: 返回该控件对象
		var readonlyOperater = ud2.propertier(function () {
			return readonly;
		}, function (isReadonly) {
			readonly = !!isReadonly;
			return columnObj;
		});

		// 返回
		return ud2.extend(columnObj, {
			type: typeOperater,
			allowNull: allowNullOperater,
			readonly: readonlyOperater
		});

	}, constructor);
	
	// 标识数据表行的架构
	ud2.creater('row', function () {

	}, constructor);
	
	// 公开属性
	constructor.type = type;
	constructor.collection = collection;

})();