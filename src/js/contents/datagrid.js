/// <reference path="../ud2.js" />

// 数据网格控件
// !! 暂时未考虑控件的执行效率，待提高效率的方式有，数据行懒加载(显示)
ud2.libExtend(function (inn, ud2) {
	'use strict';

	inn.controlCreater('datagrid', function (collection, constructor) {

		var // className存于变量
			cls = collection.className, cn = inn.className(cls),
			// CSS常量
			STR_LEFT = cn('left'), STR_CENTER = cn('center'), STR_RIGHT = cn('right'), STR_GRID = cn('grid'),
			STR_HEADER = cn('header'), STR_CONTENT = cn('content'), STR_FOOTER = cn('footer'),
			STR_CLS_ROW = cn('row', 1),
			// 回调常量
			RD = 'rowDeselected', RS = 'rowSelected',
			// 单元格对齐方式
			cellAlign = {
				// 左对齐
				left: 0,
				// 居中对齐
				center: 1,
				// 右对齐
				right: 2
			},
			// 列的排版模式
			columnMode = {
				// 默认排版
				normal: 0,
				// 响应排版
				flex: 1,
				// 左侧固定排版
				left: 2,
				// 右侧固定排版
				right: 3
			},
			// 数据列初始化默认参数
			columnDefaultOptions = {
				// 单元格的数据类型
				type: null,
				// 当前宽度 number(px) | auto
				width: 120,
				// 单元格的最小宽度，通过flex压缩不能小于此宽度
				minWidth: 50,
				// 0 normal   1 flex       2 left   3 right
				// 默认单元格  固定宽度单元格  左侧固定  右侧固定
				mode: 1,
				// 0 左侧 1 剧中 2 右侧
				align: 0
			},
			// 数据行初始化默认参数
			rowDefaultOptions = {

			};

		// 重写集合初始化方法
		collection.init = function (control) {

			// #region 私有字段

			var // elements数据源、jQuery数据源 或二维数组数据
				// 数据    头部数据    底部数据
				datas, datasHeader, datasFooter,
				// 列参数对象集合 行参数对象集合 列默认参数 行默认参数    单元格高度 控件高度  鼠标滑上背景改变颜色 鼠标滑上时的背景颜色
				columnsInfo, rowsInfo, columnDefault, rowDefault, cellHeight, height, isHover, hoverColor,
				// 是否开启选中行 是否支持行多选    空容器占位文本 当前已选择的行序号集合
				isSelected, isSelectedMultiple, emptyText, selectedRows = [],
				// 获取用户自定义项
				options = control.getOptions([
					'datas', 'datasHeader', 'datasFooter', 'columns', 'columnDefault',
					'cellHeight', 'height', ['hover', 'isHover'], 'hoverColor',
					['selected', 'isSelected'], ['selectedMultiple', 'isSelectedMultiple'],
					'emptyText'
				], function (options) {
					// 初始化单元格高度
					cellHeight = parseInt(options.cellHeight) || 34;
					// 初始化控件高度
					// 值为null，则取css高度
					height = options.height || null;
					// 初始化是否开启鼠标滑上背景改变颜色
					isHover = inn.boolCheck(options.hover, true);
					// 初始化鼠标滑上时的背景颜色
					hoverColor = options.hoverColorv || '#EDF7FF';
					// 初始化选中行
					isSelected = inn.boolCheck(options.selected, false);
					// 初始化多选
					isSelectedMultiple = inn.boolCheck(options.selectedMultiple, true);
					// 初始化替换文本
					emptyText = options.emptyText || '此处没有任何数据';

					// 初始化传入数据
					initDatas(options.datas, options.datasHeader, options.datasFooter);
					// 初始化列默认对象
					initColumnDefault(options.columnDefault);
					// 初始化列对象
					initColumns(options.columns);
					// 初始化行对象
					initRows();
					// 初始化补全单元格
					initCompletionCells();
				}),
				// 控件结构
				template = '<div class="' + STR_LEFT + '">'
					+ '<div class="' + STR_HEADER + '"><div class="' + STR_GRID + '" /></div>'
					+ '<div class="' + STR_CONTENT + '"><div class="' + STR_GRID + '" /></div>'
					+ '<div class="' + STR_FOOTER + '"><div class="' + STR_GRID + '" /></div></div>'
					+ '<div class="' + STR_RIGHT + '">'
					+ '<div class="' + STR_HEADER + '"><div class="' + STR_GRID + '" /></div>'
					+ '<div class="' + STR_CONTENT + '"><div class="' + STR_GRID + '" /></div>'
					+ '<div class="' + STR_FOOTER + '"><div class="' + STR_GRID + '" /></div></div>'
					+ '<div class="' + STR_CENTER + '">'
					+ '<div class="' + STR_HEADER + '"><div class="' + STR_GRID + '" /></div>'
					+ '<div class="' + STR_CONTENT + '"><div class="' + STR_GRID + '" /></div>'
					+ '<div class="' + STR_FOOTER + '"><div class="' + STR_GRID + '" /></div></div>'
					+ '<div class="' + cn('empty') + '"><div>' + emptyText + '</div></div>',
				// 获取初始化的控件对象
				current = control.current,
				// 控件对象
				$datagrid = current.html(template),
				// 区域容器
				$area = $datagrid.children(),
				// 空容器
				$noRow = $area.last(),
				// 左侧fixed容器
				$left = $area.eq(0),
				$leftArea = $left.children(),
				$leftHeader = $leftArea.eq(0),
				$leftContent = $leftArea.eq(1),
				$leftFooter = $leftArea.eq(2),
				$leftHeaderGrid = $leftHeader.children(),
				$leftContentGrid = $leftContent.children(),
				$leftFooterGrid = $leftFooter.children(),
				// 右侧fixed容器
				$right = $area.eq(1),
				$rightArea = $right.children(),
				$rightHeader = $rightArea.eq(0),
				$rightContent = $rightArea.eq(1),
				$rightFooter = $rightArea.eq(2),
				$rightHeaderGrid = $rightHeader.children(),
				$rightContentGrid = $rightContent.children(),
				$rightFooterGrid = $rightFooter.children(),
				// 主容器
				$center = $area.eq(2),
				$centerArea = $center.children(),
				$centerHeader = $centerArea.eq(0),
				$centerContent = $centerArea.eq(1),
				$centerFooter = $centerArea.eq(2),
				$centerHeaderGrid = $centerHeader.children(),
				$centerContentGrid = $centerContent.children(),
				$centerFooterGrid = $centerFooter.children(),
				// 按左中右添加容器集合
				// 集合内顺序为 0:content 1:header 2:footer 对应创建网格的mode参数
				leftGrid = [$leftContentGrid, $leftHeaderGrid, $leftFooterGrid],
				centerGrid = [$centerContentGrid, $centerHeaderGrid, $centerFooterGrid],
				rightGrid = [$rightContentGrid, $rightHeaderGrid, $rightFooterGrid],
				// 空行，用于克隆
				$emptyRow = inn.jqe[0].clone().addClass(cn('row')),
				// 空单元格，用于克隆
				$emptyCell = inn.jqe[0].clone().addClass(cn('cell')),
				// 滚动条控件	
				leftScroll, rightScroll, topScroll, bottomScroll, contentScroll,
				// 是否全部选中
				isAllSelected = false,
				// 控件回调
				controlCallbacks = {
					rowSelected: inn.noop,
					rowDeselected: inn.noop
				};

			// #endregion

			// #region 私有方法

			// 初始化传入数据
			// optionsData[array, string, jQuery]: options.data 传入数据参数
			function initDatas(optionsDatas, optionsDatasHeader, optionsDatasFooter) {
				var // 传入的数据是否符合jQuery对象
					isJQ = true,
					// 头部主体及底部容器
					$h, $b, $f,
					// 迭代变量
					i, j;

				datas = optionsDatas;
				// 如果传入参数为字符串或jQuery对象，则强制按照符合jQuery标准获取jQuery对象，并通过此对象创建数据表
				// 由jQuery对象创建数据表时，会将thead、tbody、tfoot分成三个数据表，分别存入datasHeader、datas、datasFooter
				// 否则传入的参数如果是二维数组或其他参数，则直接按照dataFill方法推入数据表中处理
				// 如果参数不存在，但存在control.origin元素时，则将此元素按照jQuery对象创建数据表的方式处理
				if (datas) {
					if (ud2.type.isString(datas) || ud2.type.isJQuery(datas)) {
						datas = inn.convertToJQ(datas);
					}
					else {
						datas = ud2.datatable().dataFill(datas);
						isJQ = false;
					}
				}
				else if (control.origin) {
					datas = inn.convertToJQ(control.origin);
				}
				else {
					datas = ud2.datatable();
					jsJQ = false;
				}

				// jQuery对象创建数据表时的处理方式
				if (isJQ) {
					control.origin = datas;
					$h = datas.find('thead');
					$b = datas.find('tbody');
					$f = datas.find('tfoot');
					datas = ud2.datatable().dataFill($b);
					if ($h.length) datasHeader = ud2.datatable().dataFill($h);
					if ($f.length) datasFooter = ud2.datatable().dataFill($f);
				}


				// 是否存在顶部数据
				if (optionsDatasHeader) {
					datasHeader = ud2.datatable().dataFill(optionsDatasHeader);
				}
				// 顶部数据是否存在行
				// 如果存在行，且顶部数据行中的列数少于列参数的个数，则补全单元格
				if (datasHeader && datasHeader.columns.length < datas.columns.length) {
					for (i = 0, j = datas.columns.length - datasHeader.columns.length; i < j; i++) datasHeader.columnAdd();
				}
				// 是否存在底部数据
				if (optionsDatasFooter) {
					datasFooter = ud2.datatable().dataFill(optionsDatasFooter);
				}
				// 底部数据是否存在行
				// 如果存在行，且底部数据行中的列数少于列参数的个数，则补全单元格
				if (datasFooter && datasFooter.columns.length < datas.columns.length) {
					for (i = 0, j = datas.columns.length - datasFooter.columns.length; i < j; i++) datasFooter.columnAdd();
				}
			}
			// 初始化列默认参数对象
			// optionColumnDefault[object]: options.columnDefault 传入列初始化默认参数
			function initColumnDefault(optionsColumnDefault) {
				columnDefault = columnDefaultOptions;
				if (ud2.type.isObject(optionsColumnDefault)) columnDefault = ud2.merge(columnDefault, optionsColumnDefault);
			}
			// 初始化列
			// optionsColumns[array]: options.columns 传入列参数
			function initColumns(optionsColumns) {
				var isHeader = datasHeader || null,
					// 数据列数
					// 列数采取传入数据时，所有数据行中最大的单元格数量(或列参数数量)的最大值
					dcl, len,
					// 迭代变量
					i, l, icol;

				// 存在col元素，则将col元素解析为列对象
				if ((!optionsColumns || !optionsColumns.length) && control.origin) {
					optionsColumns = [];
					control.origin.find('col').each(function (i, me) {
						me = $(me);
						var width = parseInt(me.attr(cn('width'))), minWidth = parseInt(me.attr(cn('min-width'))),
							mode = me.attr(cn('mode')), align = me.attr(cn('align')), type = me.attr(cn('type'));
						optionsColumns[i] = {};
						if (width) optionsColumns[i].width = width;
						if (minWidth) optionsColumns[i].minWidth = minWidth;
						if (mode) optionsColumns[i].mode = mode;
						if (align) optionsColumns[i].align = align;
						if (type) optionsColumns[i].type = type;
					});
				}

				len = Math.max(datas.columns.length,
					datasHeader ? datasHeader.columns.length : 0,
					datasFooter ? datasFooter.columns.length : 0,
					optionsColumns ? optionsColumns.length : 0);
				// 将传入参数赋值给列参数集合
				columnsInfo = optionsColumns;

				// 将已传入的数据列参数对象加入到数据列参数组中
				if (!ud2.type.isArray(columnsInfo)) columnsInfo = [];
				for (i = 0; i < len; i++) {
					if (!ud2.type.isObject(columnsInfo[i])) columnsInfo[i] = {};
					icol = columnsInfo[i] = ud2.merge(columnDefault, columnsInfo[i]);

					if (icol.minWidth > icol.width && icol.mode === 1) icol.width = icol.minWidth;
					icol.align = (function () {
						switch (icol.align) {
							case 1: case '1': case 'center': { return 'center'; }
							case 2: case '2': case 'right': { return 'right'; }
							default: case 0: case '0': case 'left': { return 'left'; }
						}
					}());
					icol.mode = (function () {
						switch (icol.mode) {
							case 1: case '1': case 'flex': { return 1; }
							case 2: case '2': case 'left': { return 2; }
							case 3: case '3': case 'rigth': { return 3; }
							default: case 0: case '0': case 'normal': { return 0; }
						}
					}());
				}
			}
			// 补全单元格，并更新单元格类型
			// 此方法的目的是为了处理传入的列参数与单元格数量不匹配时，补全单元格
			function initCompletionCells() {
				var isHeader = !!datasHeader,
					isFooter = !!datasFooter,
					dtColLen = datas.columns.length,
					colLen = columnsInfo.length,
					dtHeaderColLen, dtFooterColLen,
					i;

				if (dtColLen < colLen) {
					for (i = 0; i < colLen - dtColLen; i++) datas.columnAdd();
				}
				if (isHeader) {
					dtHeaderColLen = datasHeader.columns.length;
					for (i = 0; i < colLen - dtHeaderColLen; i++) datasHeader.columnAdd();
				}
				if (isFooter) {
					dtFooterColLen = datasFooter.columns.length;
					for (i = 0; i < colLen - dtFooterColLen; i++) datasFooter.columnAdd();
				}

				// 更新单元格数据类型
				initCellDataType();
			}
			// 初始化行
			function initRows(optionsRows) {
				// 将传入参数赋值给行参数集合
				rowsInfo = optionsRows;

				// 将已传入的数据行参数对象加入到数据行参数组中
				if (!ud2.type.isArray(rowsInfo)) rowsInfo = [];

				// 创建内部对象缓存数组
				rowsInfo.header = [];
				rowsInfo.content = [];
				rowsInfo.footer = [];
			}
			// 初始化单元格数据类型
			function initCellDataType() {
				datas.columns.forEach(function (col, i) {
					if (columnsInfo[i]) col.dataType(columnsInfo[i].type);
				});
			}

			// 更新尺寸样式
			function updateWidthStyles() {
				var g = gridWidthCount(),
					wl = g.l, wc = g.c, wr = g.r,
					fl = rowsInfo.footer.length;

				$left.css({ width: wl });
				$leftHeaderGrid.css({ width: wl });
				$leftContentGrid.css({ width: wl });

				$center.css({ left: wl - 1, right: wr > 0 ? wr - 2 : -1 });
				$centerHeaderGrid.css({ width: wc });
				$centerContentGrid.css({ width: wc - 1 });

				$right.css({ width: wr });
				$rightHeaderGrid.css({ width: wr });
				$rightContentGrid.css({ width: wr });

				if (fl > 0) {
					$leftFooterGrid.css({ width: wl });
					$centerFooterGrid.css({ width: wc });
					$rightFooterGrid.css({ width: wr });
				}
			}
			// 更新高度样式
			function updateHeightStyles() {
				var hl = rowsInfo.header.length * cellHeight,
					fl = rowsInfo.footer.length * cellHeight,
					h = { height: hl },
					t = { top: hl },
					b = { bottom: fl },
					e = { height: fl, bottom: 0 };

				// 设置高度
				heightOperate(height);

				$leftHeader.css(h);
				$leftContent.css(t);
				$centerHeader.css(h);
				$centerContent.css(t);
				$rightHeader.css(h);
				$rightContent.css(t);

				$leftHeaderGrid.css({ height: hl });
				$leftContentGrid.css({ height: cellHeight * rowsInfo.content.length });

				$centerHeaderGrid.css({ height: hl });
				$centerContentGrid.css({ height: cellHeight * rowsInfo.content.length - 1 });

				$rightHeaderGrid.css({ height: hl });
				$rightContentGrid.css({ height: cellHeight * rowsInfo.content.length });

				$noRow.css({ top: hl });

				if (fl) {
					$leftContent.css(b);
					$leftFooter.css(e);
					$leftFooterGrid.css({ height: fl });

					$centerContent.css(b);
					$centerFooter.css(e);
					$centerFooterGrid.css({ height: fl });

					$rightContent.css(b);
					$rightFooter.css(e);
					$rightFooterGrid.css({ height: fl });

					$noRow.css({ bottom: fl });
				}
			}
			// 更新全部单元格样式
			function updateAllCellSizeStyles() {
				var hl = rowsInfo.header.length || 0,
					fl = rowsInfo.footer.length || 0;
				gridFlexCount();
				// 更新每个单元格样式
				updateCellSizeStyles(rowsInfo.content);
				if (hl) updateCellSizeStyles(rowsInfo.header);
				if (fl) updateCellSizeStyles(rowsInfo.footer);
			}
			// 更新单元格样式
			function updateCellSizeStyles(arr) {
				var // 迭代变量
					i = 0, l = arr.length;

				for (; i < l; i++) {
					arr[i].$.left.css('height', cellHeight);
					arr[i].$.center.css('height', cellHeight);
					arr[i].$.right.css('height', cellHeight);
					columnsInfo.forEach(function (ci, index) {
						var cell = arr[i].public.cells[index], h, w = ci.widthNow, j, m = 0, z = 1;
						if (cell.merge) return;
						if (cell.rowspan) {
							z++;
							h = cellHeight * (cell.rowspan || 1);
						}
						else h = cellHeight;
						if (cell.colspan) {
							z++;
							for (j = cell.colspan - 1; j > 0; j--) { m++; w += columnsInfo[index + m] && columnsInfo[index + m].widthNow || 0; }
							cell.getContent().css('text-align', 'center');
						}

						cell.getContent().css({
							width: w,
							height: h,
							left: ci.cellLeft,
							lineHeight: h - 1 + 'px',
							zIndex: z
						});
					});
				}
			}
			// 更新初始化
			function updateInit() {
				if (rowsInfo.content.length === 0) $noRow.addClass('on');
				else $noRow.removeClass('on');

				updateWidthStyles();
				updateHeightStyles();
				updateAllCellSizeStyles();
			}

			// grid容器计算列宽度和偏移量
			function gridWidthCount() {
				var // 宽度累计
					wc = 0, wl = 0, wr = 0;

				// 如果包含checked列，默认左列宽加38
				if (isSelected) wl += 38;
				// 获取列的宽度
				columnsInfo.forEach(function (obj) {
					obj.widthNow = obj.width;
					switch (obj.mode) {
						case 0: case 1: { wc += obj.widthNow; break; }
						case 2: { obj.cellLeft = wl; wl += obj.widthNow; break; }
						case 3: { obj.cellLeft = wr; wr += obj.widthNow; break; }
					}
				});

				columnsInfo.gridSize = { l: wl, c: wc, r: wr };
				return columnsInfo.gridSize;
			}
			// grid弹性列计算
			function gridFlexCount() {
				var topWidth = $centerContent.width(),
					// 自适应的单元格  自适应宽度汇总 固定宽度汇总 单元格平分份数
					flexCell = [], fw = 0, nw = 0, fp,
					// 居左统计
					cl = 0;

				// 获取弹性单元格
				columnsInfo.forEach(function (obj) {
					if (obj.mode === 1) {
						fw += obj.width;
						flexCell.push(obj);
					}
					else if (obj.mode === 0) {
						nw += obj.width;
					}
				});
				// 计算弹性单元格的宽度
				fp = (topWidth - nw) / fw;
				fw = 0;
				flexCell.forEach(function (obj) {
					var gw = fp * obj.width, mw = obj.minWidth;
					if (gw < mw) gw = mw;
					obj.widthNow = gw;
					fw += gw;
				});
				// 计算列的定位
				columnsInfo.forEach(function (obj) {
					if (obj.mode === 0 || obj.mode === 1) {
						obj.cellLeft = cl;
						cl += obj.widthNow;
					}
				});
				// 重新设置主内容区域grid容器宽度
				$centerContentGrid.css('width', fw + nw);
			}
			// 创建网格元素
			function createElements() {
				// 创建全部元素
				createTableElements(datas);
				if (datasHeader && datasHeader.rows.length) createTableElements(datasHeader, 1);
				if (datasFooter && datasFooter.rows.length) createTableElements(datasFooter, 2);
			}
			// 创建网格内的全部行和单元格
			// dt[ud2.datatable]: 数据对象
			// mode[number]: 行类型 0:content 1:header 2:footer
			function createTableElements(dt, mode) {
				var i = 0, l,
					$rl, $rc, $rr, $check, realHeight, arr;
				// 初始化行类型
				mode = mode || 0;
				// 获取行数，如果是header，则视为1行
				l = dt.rows.length;
				// 获取行对象
				if (mode === 0) arr = rowsInfo.content;
				if (mode === 1) arr = rowsInfo.header;
				if (mode === 2) arr = rowsInfo.footer;

				// 迭代创建行元素
				for (; i < l; i++) (function () {
					var row;

					// 创建行的空容器，用于装载单元格
					$rl = $emptyRow.clone().appendTo(leftGrid[mode]);
					$rc = $emptyRow.clone().appendTo(centerGrid[mode]);
					$rr = $emptyRow.clone().appendTo(rightGrid[mode]);
					// 创建行参数对象
					row = { $: { left: $rl, center: $rc, right: $rr }, public: { cells: [] } };
					arr.push(row);
					// 判断是否开启选中行，如果开启选中行，则在行中添加一个checkbox来控制行的选中状态
					if (isSelected && (mode && i === 0 || !mode)) {
						$check = $emptyCell.clone().addClass('checkbox').css({ textAlign: 'center', width: 38 });
						$check.html('<input type="checkbox" class="check" />').appendTo($rl);
						if (mode) {
							realHeight = mode === 1
								? datasHeader.rows.length * cellHeight
								: datasFooter.rows.length * cellHeight;
							$check.css({ 'height': realHeight, 'line-height': realHeight - 2 + 'px' });
						}
						else {
							$check.css({ 'height': cellHeight, 'line-height': cellHeight - 3 + 'px' });
						}
						if (!isSelectedMultiple && mode) {
							$check.addClass('disabled');
						}

						// 绑定checkbox单元格
						row.$.check = $check.children();
						// 绑定事件
						row.checkEvent = ud2.event($check).setTap(function () {
							if (mode) {
								rowSelectedAll();
							}
							else {
								rowSelected.call(this, row);
							}
						});
					}
					// 迭代列，将该行的全部单元格，按照列参数初始化，并插入到指定的行容器中
					columnsInfo.forEach(function (ci, j) {
						var content = dt.rows[i].cells[j], $cell, cell, val;
						row.public.cells[j] = cell = {};
						// 如果单元格为被合并模式，则取消建立此单元格
						if (content.merge) {
							$cell = $emptyCell.clone();
						}
						else {
							// 建立单元格
							val = content.val();
							$cell = $emptyCell.clone().css({ textAlign: ci.align }).html(val).attr('title', val ? val.toString().replace(/<[^>]+>/g, '') : '');
						}
						// 按照列的模式，将单元格插入到指定的行容器中
						switch (ci.mode) {
							case 0: case 1: { $cell.appendTo($rc); break; }
							case 2: { $cell.appendTo($rl); break; }
							case 3: { $cell.appendTo($rr); break; }
						}
						// 设置单元格对象属性
						cell.getContent = function () { return $cell; };
						cell.val = content.val;
						if (content.colspan) cell.colspan = content.colspan;
						if (content.rowspan) cell.rowspan = content.rowspan;
						if (content.merge) cell.merge = content.merge;
					});
				}());
			}

			// 行选中操作事件回调
			function rowSelected(row) {
				var isHave = selectedRows.indexOf(row), len = selectedRows.length;

				if (isHave === -1) {
					// 非多选，取消默认选中的
					if (!isSelectedMultiple && len > 0) {
						selectedRows[0].$.check.removeAttr('checked');
						selectedRows.splice(0, 1);
						controlCallbacks[RD].call(control.public, row.public);
					}
					row.$.check.attr('checked', 'checked');
					selectedRows.push(row);

					if (isSelectedMultiple && len + 1 === rowsInfo.content.length) setAllSelectedState(true);
				}
				else {
					row.$.check.removeAttr('checked');
					selectedRows.splice(isHave, 1);

					if (isAllSelected) setAllSelectedState(false);
				}
				controlCallbacks[isHave > -1 ? RD : RS].call(control.public, row.public);
			}
			// 行全选操作事件回调
			function rowSelectedAll() {
				var // 发生改变的对象集合 当前操作选中与否的状态
					ca = [], sc = isAllSelected;
				if (rowsInfo.content.length === 0 || !isSelectedMultiple) return;
				if (sc) {
					setAllSelectedState(false);
					selectedRows.forEach(function (row) {
						row.$.check.removeAttr('checked');
						ca.push(row.public);
					});
					selectedRows.splice(0, selectedRows.length);
				}
				else {
					setAllSelectedState(true);
					rowsInfo.content.forEach(function (row) {
						if (selectedRows.indexOf(row) === -1) {
							row.$.check.attr('checked', 'checked');
							selectedRows.push(row);
							ca.push(row.public);
						}
					});
				}
				controlCallbacks[sc ? RD : RS].call(control.public, ca);
			}
			// 设置全选状态
			// state[bool]: 状态
			function setAllSelectedState(state) {
				if (state) {
					isAllSelected = true;
					rowsInfo.header[0].$.check.attr('checked', 'checked');
					if (rowsInfo.footer[0]) rowsInfo.footer[0].$.check.attr('checked', 'checked');
				}
				else {
					isAllSelected = false;
					rowsInfo.header[0].$.check.removeAttr('checked');
					if (rowsInfo.footer[0]) rowsInfo.footer[0].$.check.removeAttr('checked');
				}
			}

			// #endregion	

			// #region 公共方法

			// 操作控件高度
			// () 获取当前控件高度
			// - return[number]: 返回控件的高度
			// (h) 设置控件高度
			// - h[number, string]: 设置的高度值，可以是数字或字符形式的百分数
			// - return[ud2.datagrid]: 返回该控件对象
			function heightOperate(h) {
				if (h === void 0) {
					return $datagrid.height();
				}
				else {
					if (ud2.regex.percent.test(h) || ud2.regex.nonNegative.test(h)) {
						$datagrid.css('height', h);
						height = h;
					}
					return control.public;
				}
			}
			// 利用传入的数据源进行数据填充
			// ds[ud2.datatable, array]: 数据源
			// return[ud2.datagrid]: 返回该控件对象
			function dataFill(ds) {
				// 移除原数据
				dataEmpty();
				contentScroll.move(0, 0);

				// 如果传入数据是数据表则直接填装
				// 否则，先通过参数实例化数据表，并进行填装
				if (ds && ds.type === 'datatable') {
					datas.dataFill(ds);
				} else {
					return dataFill(ud2.datatable().dataFill(ds));
				}

				// 创建单元格
				createTableElements(datas);
				// 更新样式信息
				updateInit();

				return control.public;
			}
			// 数据行添加
			// ds[ud2.datatable, array]: 数据源
			// return[ud2.datagrid]: 返回该控件对象
			function dataRowAdd(ds) {
				var rowCellArr = [];

				if (ds && ds.type === 'datatable') {
					if (ds.rows[0]) {
						columnsInfo.forEach(function (ci, i) {
							if (ds.rows[0].cells[i]) {
								ds.rows[0].cells[i].dataType(ci.type);
							}
							else {
								ds.columnAdd({ type: ci.type });
							}
							rowCellArr[i] = ds.rows[0].cells[i].val();
						});
						// 向数据表中插入行
						// datas.rowAdd(rowCellArr);
						// 创建单元格
						createTableElements(ds);
						// 更新样式信息
						updateInit();

						// 当前为全选状态时，加入新行后，取消全选状态
						if (isAllSelected) setAllSelectedState(false);
					}
				}
				else if (ds !== void 0) {
					return dataRowAdd(ud2.datatable().rowAdd(ds));
				}

				return control.public;
			}
			// 获取已被选中的数据行
			// return[array]: 返回已被选中的数据行对象集合
			function dataRowSelected() {
				return selectedRows.map(function (r) { return r.public; });
			}
			// 数据行删除
			// row[ud2.datagrid.row, array]: 数据行对象
			// return[ud2.datagrid]: 返回该控件对象
			function dataRowRemove(row) {
				var del, cIndex, sIndex, i, l;

				if (ud2.type.isArray(row)) {
					for (i = 0, l = row.length; i < l; i++) dataRowRemove(row[i]);
				}
				else {
					del = rowsInfo.content.filter(function (r) { return r.public === row; });
					if (del.length) {
						if (isSelected) {
							sIndex = selectedRows.indexOf(del[0]);
							del[0].checkEvent.off();
							del[0].$.check.remove();
							selectedRows.splice(sIndex, 1);

							if (selectedRows.length === 0 && isAllSelected) setAllSelectedState(false);
						}

						cIndex = rowsInfo.content.indexOf(del[0]);
						del[0].$.left.remove();
						del[0].$.center.remove();
						del[0].$.right.remove();

						rowsInfo.content.splice(cIndex, 1);
					}
				}

				return control.public;
			}
			// 获取全部数据行
			// return[ud2.datagrid]: 返回该控件对象
			function dataAll() {
				return rowsInfo.content.map(function (r) { return r.public; });
			}

			// 移除全部数据和相关元素
			function dataEmpty() {
				var i = 0, j = 0,
					c = rowsInfo.content, l = c.length, sl;

				// 清空已选择项目
				if (isSelected) {
					sl = selectedRows.length;
					if (isAllSelected) setAllSelectedState(false);
					if (sl > 0) {
						for (; j < sl; j++) {
							rowSelected(selectedRows[i]);
						}
					}
					selectedRows.splice(0, sl);
					// 关闭所有行相关事件
					for (; i < l; i++) c[i].checkEvent.off();
				}

				// 清空容器
				// datas.dataEmpty();
				$leftContentGrid.empty();
				$centerContentGrid.empty();
				$rightContentGrid.empty();
				$noRow.addClass('on');

				// 移除全部的行数据对象
				rowsInfo.content.splice(0, l);
			}

			// #endregion

			// #region 回调方法

			// 设置行选中时的回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.page]: 返回该控件对象
			function setRowSelected(fn) {
				controlCallbacks.rowSelected = fn;
				return control.public;
			}
			// 设置行取消选中时的回调函数
			// 所回调的函数this指向事件触发的控件对象
			// fn[function]: 回调函数
			// return[ud2.page]: 返回该控件对象
			function setRowDeselected(fn) {
				controlCallbacks.rowDeselected = fn;
				return control.public;
			}

			// #endregion

			// #region 事件处理

			// 窗口尺寸改变处理
			function resize() {
				updateAllCellSizeStyles();
			}
			// 绑定hover效果
			function hoverEvent() {
				if (!isHover) return;
				// 绑定hover效果相关事件
				$datagrid.on([inn.an.event[12], inn.an.event[13]].join(' '), STR_CLS_ROW, function (event) {
					var $me = $(this), type = event.type, index, css;
					if ($me.parents(cn('content', 1)).length > 0) {
						index = $me.index();
						css = { 'background-color': type === inn.an.event[12] ? hoverColor : '' };
						$leftContentGrid.children(STR_CLS_ROW).eq(index).children().css(css);
						$centerContentGrid.children(STR_CLS_ROW).eq(index).children().css(css);
						$rightContentGrid.children(STR_CLS_ROW).eq(index).children().css(css);
					}
				});
			}
			// 事件绑定
			function bindEvent() {
				var // 内容滚动条参数
					contentScrollOption = {
						barState: 0,
						barColor: 'rgba(60, 60, 60, .3)',
						barColorOn: 'rgba(60, 60, 60, .6)',
						barSize: 5,
						hasVertical: true,
						hasHorizontal: true,
						isScrollMode: true,
						recountByResize: true
					},
					// 两侧滚动条参数
					lrScrollOption = {
						barState: 2,
						hasHorizontal: false,
						hasVertical: true,
						isTouchMode: false,
						isMouseWheelMode: false,
						isScrollMode: false
					},
					// 首尾滚动条参数
					tbScrollOption = {
						barState: 2,
						hasHorizontal: true,
						hasVertical: false,
						isTouchMode: false,
						isMouseWheelMode: false,
						isScrollMode: false
					};

				// 创建滚动条
				contentScroll = ud2.scroll($centerContent, contentScrollOption);
				leftScroll = ud2.scroll($leftContent, lrScrollOption);
				rightScroll = ud2.scroll($rightContent, lrScrollOption);
				topScroll = ud2.scroll($centerHeader, tbScrollOption);
				bottomScroll = ud2.scroll($centerFooter, tbScrollOption);
				contentScroll
					.followerBind(leftScroll)
					.followerBind(rightScroll)
					.followerBind(topScroll)
					.followerBind(bottomScroll);

				// 绑定窗口尺寸改变回调
				ud2.callbacks.pageResize.add(resize);

				// 绑定hover效果
				hoverEvent();
			}

			// #endregion

			// #region 初始化

			// 初始化
			(function init() {
				// 创建元素
				createElements();
				updateInit();

				// 控件初始化
				if (control.origin.length) {
					control.origin.after($datagrid);
					control.origin.remove();
					control.transferStyles();
					updateInit();
				}

				// 事件绑定
				bindEvent();
			}());

			// #endregion

			// #region 重写父方法

			// 重写父方法
			var oldAppendTo = control.public.appendTo;
			var oldPrependTo = control.public.prependTo;
			var oldInsertAfter = control.public.insertAfter;
			var oldInsertBefore = control.public.insertBefore;
			function appendTo() {
				oldAppendTo.apply(control.public, arguments);
				updateInit();
				return control.public;
			}
			function prependTo() {
				oldPrependTo.apply(control.public, arguments);
				updateInit();
				return control.public;
			}
			function insertAfter() {
				oldInsertAfter.apply(control.public, arguments);
				updateInit();
				return control.public;
			}
			function insertBefore() {
				oldInsertBefore.apply(control.public, arguments);
				updateInit();
				return control.public;
			}

			// #endregion

			// #region 返回

			// 返回
			return ud2.extend(control.public, {
				appendTo: appendTo,
				prependTo: prependTo,
				insertAfter: insertAfter,
				insertBefore: insertBefore,

				height: heightOperate,
				setRowSelected: setRowSelected,
				setRowDeselected: setRowDeselected,
				dataFill: dataFill,
				dataRowAdd: dataRowAdd,
				dataRowRemove: dataRowRemove,
				dataRowSelected: dataRowSelected,
				dataAll: dataAll,
				dataEmpty: dataEmpty
			});

			// #endregion

		};
		// 单元格对齐方式
		constructor.align = cellAlign;
		// 列的排版模式
		constructor.mode = columnMode;

	});

});