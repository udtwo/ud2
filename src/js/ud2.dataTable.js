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
		collection = [];
	
	// 公开属性
	constructor.collection = collection;

})();