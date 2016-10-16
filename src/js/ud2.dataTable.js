/// <reference path="ud2.js" />

// 数据表控件
(function () {

	var // 数据表集合
		collection = [];

	// 用于创建数据表的构造函数
	function constructor() {
		return create.apply(constructor, arguments);
	}
	// 用于创建控件的方法
	// 只接受创建一个控件
	// ()
	// (tableName)
	function create(name) {

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
	}

	// 列对象 
	function column() {

		function constructor() {

		}
		
		function create() {

		}

		return constructor.apply(constructor, arguments);

	}
	
	// 将数据表绑定在ud2对象上
	ud2.dataTable = constructor;
	// 公开属性
	constructor.create = create;
	constructor.collection = collection;
	constructor.column = column;
})();