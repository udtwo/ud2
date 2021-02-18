/// <reference path="../ud2.js" />

// 滚动条控件及滚动事件
// 用于为元素生成滚动条及滚动事件
// elements[string, jQuery]: jQuery 对象或可生成 jQuery 对象的字符串
// userOptions[object]: 用户参数
// - (?) recountByResize[bool]: 设置浏览器尺寸发生改变时是否重新计算滚动区域
// - (?) barState[number]: 滚动条显示方式
// - (?) hasHorizontal[bool]: 是否开启横滚动条
// - (?) hasVertical[bool]: 是否开启竖滚动条
// - (?) barSize[number]: 滚动条尺寸
// - (?) barSizeOn[number]: 滚动态鼠标滑入时尺寸
// - (?) barMinLength[number]: 滚动条最小长度
// - (?) barOffset[number]: 滚动条偏移量
// - (?) barColor[rgb, rgba]: 滚动条颜色
// - (?) barColorOn[rgb, rgba]: 滚动条当鼠标滑入时的颜色
// - (?) barColorDown[rgb, rgba]: 滚动条当鼠标按下时的颜色
// - (?) barBorderRadiusState[bool]: 滚动条是否为圆角
// - (?) mouseWheelLength[number]: 滚轮滚动长度
// - (?) isTouchMode[bool]: 是否开启触摸来控制滚动区域
// - (?) isMouseNoTouchMode[bool]: 是否开启鼠标操作时关闭TouchMode功能
// - (?) isMouseWheelMode[bool]: 是否开启滚轮来控制滚动区域
// - (?) isScrollMode: 是否开启通过滚动条来控制滚动区域
// - (?) isSlowMovning: 是否缓动
// return[scroll] => 返回一个滚动条控件
ud2.libExtend(function (inn, ud2) {
	'use strict';

	inn.creater('scroll', function (elements, userOptions) {

		// #region 私有字段

		var // 滚动对象
			scrollObj = {},
			cls = inn.prefix + 'scroll',
			cn = inn.className(cls),
			// 滚动选项
			recountByResize, barState, barSize, barSizeOn, barMinLength, barOffset, barColor, barColorOn, barColorDown,
			barBorderRadiusState, hasHorizontal, hasVertical, isMouseWheelMode, isTouchMode, isMouseNoTouchMode,
			isScrollMode, mouseWheelLength, isSlowMovning, bounce = false,
			// 默认项
			options = inn.options({
				// 设置浏览器尺寸发生改变时是否重新计算滚动区域
				// 如果设置此值为true，则浏览器发生orientationchange与resize事件时，滚动区域重新计算
				recountByResize: false,
				// 滚动条显示方式
				// 0: 默认  1: 永久显示  2: 永久消失
				barState: 0,
				// 开启横滚动条
				hasHorizontal: false,
				// 开启竖滚动条
				hasVertical: true,
				// 滚动条尺寸
				barSize: 6,
				// 滚动条鼠标滑入时尺寸
				barSizeOn: 8,
				// 滚动条最小长度
				barMinLength: 30,
				// 滚动条偏移量
				barOffset: 1,
				// 滚动条颜色
				barColor: 'rgba(0,0,0,.3)',
				// 滚动条当鼠标滑入时的颜色
				barColorOn: 'rgba(0,0,0,.45)',
				// 滚动条当鼠标按下时的颜色
				barColorDown: 'rgba(0,0,0,.6)',
				// 滚动条是否为圆角
				barBorderRadiusState: true,
				// 滚轮滚动长度
				mouseWheelLength: 'normal',
				// 是否开启触摸来控制滚动区域
				isTouchMode: true,
				// 是否开启自动判断鼠标操作时关闭TouchMode功能
				// 用于鼠标操作滚动容器时，无法进行内容容器滚动，这样可以让鼠标操作内容容器内部元素
				isMouseNoTouchMode: false,
				// 是否开启滚轮来控制滚动区域
				isMouseWheelMode: true,
				// 是否开启通过滚动条来控制滚动区域
				isScrollMode: false,
				// 缓动
				isSlowMovning: true
			}, userOptions, function (options) {
				recountByResize = options.recountByResize;
				barState = options.barState;
				barSize = options.barSize;
				barSizeOn = options.barSizeOn;
				barMinLength = options.barMinLength;
				barOffset = options.barOffset;
				barColor = options.barColor;
				barColorOn = options.barColorOn;
				barColorDown = options.barColorDown;
				barBorderRadiusState = options.barBorderRadiusState;
				hasHorizontal = options.hasHorizontal;
				hasVertical = options.hasVertical;
				isMouseWheelMode = options.isMouseWheelMode;
				isTouchMode = options.isTouchMode;
				isMouseNoTouchMode = options.isMouseNoTouchMode;
				isScrollMode = options.isScrollMode;
				mouseWheelLength = options.mouseWheelLength;
				isSlowMovning = options.isSlowMovning;

				// 判断传入的鼠标滚轮滚动长度是否符合要求
				if (mouseWheelLength !== 'normal') {
					mouseWheelLength = !ud2.type.isNaturalNumber(mouseWheelLength) ? 'normal' : parseInt(mouseWheelLength);
				}
			}),
			// 滚动对象
			$scroll = inn.convertToJQ(elements),
			// 滚动包裹容器
			$wrapper = inn.jqe[0].clone().addClass(cn('wrapper')),
			// 横滚动条
			$barHorizontal = inn.jqe[0].clone().addClass(cn('bar')),
			// 竖滚动条
			$barVertical = $barHorizontal.clone(),
			// 缓动
			easing = {
				quadratic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				circular: 'cubic-bezier(0.1, 0.57, 0.1, 1)'
			},
			// 主运动触点数据对象
			mainPointer = {
				// 触点ID
				id: null,
				// 新触点开始时间戳
				start: 0,
				// 旧触点结束时间戳
				end: 0,
				// 是否移动标记
				moved: false,
				// 触点开始移动记录点
				startMove: {
					x: 0,
					y: 0
				},
				// 触点上次的移动距离
				lastMove: {
					x: 0,
					y: 0
				}
			},
			// 是否正在滚动
			isScrolling = false,
			// 是否跟随
			isOplock = false,
			// 当滚动完成时执行强制停止回调定时器
			scrollEndTimer = null,
			// 触摸启动最小长度
			touchStartMinLength = 10,
			// 记录鼠标是否在滚动条区域中按下滚动条，并拖拽操作
			mouseInScroll = false,
			// 记录鼠标是否在滚动容器中
			mouseInBox = false,
			// 滚动对象数据
			scrollData = {
				// 外层盒子高度
				h: 0,
				// 带有内边距的盒子高度
				ih: 0,
				// 盒子的可滚动高度
				sh: 0,
				// 外层盒子宽度
				w: 0,
				// 带有内边距的盒子宽度
				iw: 0,
				// 盒子的可滚动宽度
				sw: 0,
				// 盒子当前移动的距离
				now: {
					x: 0,
					y: 0
				},
				// 当前是否处于触点移动中
				isMoved: false
			},
			// 滚动条对象数据
			barData = {
				// 滚动条高度
				h: 0,
				// 最大滚动高度
				mh: 0,
				// 可滚动高度
				sh: 0,
				// 滚动条宽度
				w: 0,
				// 最大滚动宽度
				mw: 0,
				// 可滚动宽度
				sw: 0,
				// 定时器
				timer: null
			},
			// 此对象的跟随对象
			followers = [],
			// 滚动对象名称
			SCROLL_NAME = 'scroll',
			// 滚动状态标记属性
			ATTRNAME_IS_SCROLL = cn('runing');

		// #endregion

		// #region 私有方法

		// 重新计算滚动对象及外层对象高度，且初始化滚动条数据
		function getScrollData() {
			var // 外层盒子高度
				wrapperHeight = 0,
				// 滚动条高度
				scrollHeight = 0,
				// 滚动条高度
				barHeight = 0,
				// 最大滚动槽高度
				maxScrollBarHeight = 0,
				// 外层盒子宽度
				wrapperWidth = 0,
				// 滚动条宽度
				scrollWidth = 0,
				// 滚动条宽度
				barWidth = 0,
				// 最大滚动槽宽度
				maxScrollBarWidth = 0,
				// 尺寸
				size;

			// 如果开启竖滚动条
			if (hasVertical) {
				// 获取外层对象高度
				wrapperHeight = $wrapper.height();
				scrollHeight = $scroll.height();

				// 保存高度数据到滚动对象数据中
				scrollData.h = scrollHeight;
				scrollData.ih = $scroll.innerHeight();
				scrollData.sh = wrapperHeight - scrollHeight;
				if (scrollData.now.y < -scrollData.sh) scrollData.now.y = -scrollData.sh;

				// 最大滚动高度
				maxScrollBarHeight = scrollData.ih - 2 * barOffset;

				// 计算滚动条高度
				if (scrollHeight !== 0) {
					size = scrollData.sh / (scrollData.ih * 5);
					size = 1 - (size > 1 ? 1 : size);
					barHeight = maxScrollBarHeight * size;
					barHeight = barHeight < barMinLength ? barMinLength : barHeight;
					barHeight = barHeight > maxScrollBarHeight ? maxScrollBarHeight : barHeight;

					barData.h = barHeight;
					barData.mh = maxScrollBarHeight;
					barData.sh = maxScrollBarHeight - barHeight;

					$barVertical.height(barHeight);
				}
			}
			// 如果开启横滚动条
			if (hasHorizontal) {
				// 获取外层对象宽度
				wrapperWidth = $wrapper.width();
				scrollWidth = $scroll.width();

				// 保存宽度数据到滚动对象数据中
				scrollData.w = scrollWidth;
				scrollData.iw = $scroll.innerWidth();
				scrollData.sw = wrapperWidth - scrollWidth;
				if (scrollData.now.x < -scrollData.sw) scrollData.now.x = -scrollData.sw;

				// 最大滚动宽度
				maxScrollBarWidth = scrollData.iw - 2 * barOffset;

				// 计算滚动条宽度
				if (scrollWidth !== 0) {
					size = scrollData.sw / (scrollData.iw * 5);
					size = 1 - (size > 1 ? 1 : size);
					barWidth = maxScrollBarWidth * size;
					barWidth = barWidth < barMinLength ? barMinLength : barWidth;
					barWidth = barWidth > maxScrollBarWidth ? maxScrollBarWidth : barWidth;

					barData.w = barWidth;
					barData.mw = maxScrollBarWidth;
					barData.sw = maxScrollBarWidth - barWidth;

					$barHorizontal.width(barWidth);
				}
			}
		}
		// 获取当前移动位置
		// return[point]: 移动位置对象
		function getPosition() {
			var x, y;
			var matrix = $wrapper.css('transform');
			// 通过矩阵获取当前滚动位置
			matrix = matrix.split(')')[0].split(', ');
			x = Math.round(+(matrix[12] || matrix[4]));
			y = Math.round(+(matrix[13] || matrix[5]));
			return {
				x: x,
				y: y
			};
		}
		// 设置当前滚动状态
		// state[bool]: 是否正在滚动 true: 滚动 false: 未滚动
		function setScrollingState(state) {
			if (isScrolling !== state) {
				isScrolling = state;
				$scroll.attr(ATTRNAME_IS_SCROLL, state ? 1 : 0);
			}
		}
		// 坐标转换
		// 通过滚动容器坐标运算滚动条坐标
		// direction[bool]: 方向 false: x方向 true: y方向
		// position[number]: 坐标
		function getBarPositionByScrollPosition(position, direction) {
			var dir = direction ? 'sh' : 'sw';
			if (scrollData[dir] === 0 || barData[dir] === 0) {
				return 0;
			} else {
				return position / scrollData[dir] * barData[dir];
			}
		}
		// 坐标转换
		// 通过滚动条坐标运算滚动容器坐标
		// direction[bool]: 方向 false: x方向 true: y方向
		// position[number]: 坐标
		function getScrollPositionByBarPosition(position, direction) {
			var dir = direction ? 'sh' : 'sw';
			if (scrollData[dir] === 0 || barData[dir] === 0) {
				return 0;
			} else {
				return position / barData[dir] * scrollData[dir];
			}
		}
		// 开启滚动条
		function barOpen() {
			if (barState === 0) {
				if (barData.timer) window.clearTimeout(barData.timer);
				$barHorizontal.stop().fadeIn(200);
				$barVertical.stop().fadeIn(200);
			}
		}
		// 关闭滚动条
		function barClose() {
			if (barState === 0) {
				if (!mouseInBox && !mouseInScroll && !isScrolling) {
					if (barData.timer) window.clearTimeout(barData.timer);
					barData.timer = window.setTimeout(function () {
						$barHorizontal.stop().fadeOut(400);
						$barVertical.stop().fadeOut(400);
					}, 800);
				}
			}
		}
		// 计算滚动缓停的位移和时间
		// current[number]: 当前滚动位置
		// start[number]: 滚动开始时的位置
		// time[number]: 滚动用时
		// wrapper[number]: 滚动对象的高度
		// scroll[number]: 视窗对象的高度
		// (?) deceleration[number]: 减速
		function momentum(current, start, time, wrapper, scroll, deceleration) {
			var distance = current - start,
				speed = Math.abs(distance) / time,
				destination,
				duration;

			wrapper = -wrapper;
			scroll = scroll || 0;
			deceleration = deceleration || 0.0005;
			destination = current + speed * speed / (2 * deceleration) * (distance < 0 ? -1 : 1);
			duration = speed / deceleration;

			if (destination < wrapper) {
				destination = scroll ? wrapper - scroll / 2.5 * (speed / 8) : wrapper;
				distance = Math.abs(destination - current);
				duration = distance / speed;
			} else if (destination > 0) {
				destination = scroll ? scroll / 2.5 * (speed / 8) : 0;
				distance = Math.abs(current) + destination;
				duration = distance / speed;
			}

			return {
				destination: Math.round(destination),
				duration: duration
			};
		}
		// 执行滚动动画
		// x[number]: 滚动到 X 坐标
		// y[number]: 滚动到 Y 坐标
		// time[number]: 滚动用时
		// e[easingObject]: 缓动
		function translateMove(x, y, time, e) {
			var i, len;

			// 设置动画时长
			time = time || 0;
			// 设置 $wrapper 的过渡动画
			e = e || easing.circular;

			if (x > 0) x = 0;
			if (y > 0) y = 0;
			if (y < -scrollData.sh) y = -scrollData.sh;
			if (x < -scrollData.sw) x = -scrollData.sw;

			// 使用过渡动画实现滚动
			translateTimingFunction(e);
			translateTime(time);
			$wrapper.css('transform', 'translate(' + x + 'px, ' + y + 'px)' + (ud2.support.perspective ? ' translateZ(0)' : ''));
			if (hasVertical) $barVertical.css('transform', 'translate(0, ' + getBarPositionByScrollPosition(-y, 1) + 'px)' + (ud2.support.perspective ? ' translateZ(0)' : ''));
			if (hasHorizontal) $barHorizontal.css('transform', 'translate(' + getBarPositionByScrollPosition(-x, 0) + 'px, 0)' + (ud2.support.perspective ? ' translateZ(0)' : ''));
			scrollData.now = {
				x: x,
				y: y
			};

			len = followers.length;
			if (len !== 0) {
				for (i = 0; i < len; i++) {
					followers[i].move(-x, -y, time);
				}
			}
		}
		// 设置滚动动画的缓动
		// e[easingObject]: 缓动
		function translateTimingFunction(e) {
			$wrapper.css('transition-timing-function', e);
			$barVertical.css('transition-timing-function', e + ', ease-out, ease-out, ease-out');
			$barHorizontal.css('transition-timing-function', e + ', ease-out, ease-out, ease-out');
		}
		// 设置滚动动画的用时 
		// time[number]: 滚动用时
		function translateTime(time) {
			var t = parseInt(time);
			$wrapper.css('transition-duration', t + 'ms');
			$barVertical.css('transition-duration', t + 'ms, 300ms, 300ms, 300ms');
			$barHorizontal.css('transition-duration', t + 'ms, 300ms, 300ms, 300ms');

			// 当滚动完成时强制停止
			// 由于transition-end在部分浏览器中时间不准确，这里的定时器方式替代了transition-end
			if (t !== 0) {
				if (scrollEndTimer) {
					window.clearTimeout(scrollEndTimer);
				}
				scrollEndTimer = window.setTimeout(function () {
					translateMove(scrollData.now.x, scrollData.now.y, 0);
					setScrollingState(false);
					barClose();
				}, t);
			} else {
				setScrollingState(false);
				barClose();
			}
		}
		// 更新跟随控件位置
		function followerPosition() {
			if (followers.length > 0)
				for (var i in followers) followers[i].recountPosition();
		}

		// #endregion

		// #region 公共方法

		// 重计算滚动条滚动位置
		// (?) time[number]: 滚动条重置动画时间
		// return[ud2.scroll]: 返回该控件对象
		function recountPosition(time) {
			time = parseInt(time) || 0;
			getScrollData();
			translateMove(scrollData.now.x, scrollData.now.y, time);

			return scrollObj;
		}
		// 获取滚动条内容区域对象
		// return[jQuery]: 返回内容区域对象
		function getContent() {
			return $wrapper;
		}
		// 移动滚动条
		// x[number]: 滚动到 X 坐标
		// y[number]: 滚动到 Y 坐标
		// time[number]: 滚动用时
		// return[ud2.scroll]: 返回该控件对象
		function move(x, y, time) {
			time = time || 0;
			translateMove(-x, -y, time);
			return scrollObj;
		}
		// 跟随状态操作
		// () 获取跟随状态
		// - return[bool]: 返回当前是否被跟随
		// (state) 设置跟随状态
		// - state[bool]: 是否被跟随
		// - return[ud2.scroll]: 返回该控件对象
		function oplock(state) {
			if (state !== void 0) {
				isOplock = !!state;
				return scrollObj;
			} else {
				return isOplock;
			}
		}
		// 绑定一个scroll控件跟随此控件
		// scroll[scroll]: 待绑定的scroll控件
		// return[ud2.scroll]: 返回该控件对象
		function followerBind(scroll) {
			if (ud2.type.isObject(scroll) && scroll.type && scroll.type === SCROLL_NAME) {
				followers.push(scroll);
			}
			return scrollObj;
		}
		// 解绑一个scroll控件跟随此控件
		// scroll[scroll]: 待解绑的scroll控件
		// return[ud2.scroll]: 返回该控件对象
		function followerUnbind(scroll) {
			var index;
			if (ud2.type.isObject(scroll) && scroll.type && scroll.type === SCROLL_NAME) {
				index = followers.indexOf(scroll);
				if (index > -1) {
					followers.splice(index, 1);
				}
			}
			return scrollObj;
		}

		// #endregion

		// #region 事件处理对象和相关方法

		// 触点按下时触发的事件
		function pointerDown(e) {
			if (isMouseNoTouchMode && e.type === inn.an.event[8] || isOplock) return;
			followerPosition();
			getScrollData();
			barOpen();

			var pos = getPosition();
			translateMove(pos.x, pos.y);

			mainPointer.moved = false;
			mainPointer.start = ud2.time();
			mainPointer.startMove = {
				x: scrollData.now.x,
				y: scrollData.now.y
			};
			mainPointer.lastMove = {
				x: 0,
				y: 0
			};
		}
		// 触点移动时触发的事件
		// move[moveObject]: 移动数据对象
		function pointerMove(move, e) {
			if (isMouseNoTouchMode && e.type === inn.an.event[9] || isOplock) return;

			var // 本次触点移动的时间标记
				timeStamp = ud2.time(),
				// 从触点按下到当前函数触发时的移动长度
				x = move.x,
				y = move.y,
				// 从触点按下到当前函数触发时的绝对长度
				absX = Math.abs(x),
				absY = Math.abs(y),
				// 移动增量
				deltaX = x - mainPointer.lastMove.x,
				deltaY = y - mainPointer.lastMove.y,
				// 移动长度
				newX = 0,
				newY = 0;

			// 设置当前滚动状态为滚动中
			barOpen();
			// 记录最后 move 方法移动的坐标点
			mainPointer.lastMove = {
				x: x,
				y: y
			};

			// 设置移动启动长度
			if (timeStamp - mainPointer.end > 300 &&
				absX < touchStartMinLength &&
				absY < touchStartMinLength) return;

			// 标记启动
			if (!mainPointer.moved) mainPointer.moved = true;

			// 计算移动距离
			if (hasVertical) newY = deltaY + scrollData.now.y;
			if (hasHorizontal) newX = deltaX + scrollData.now.x;
			if (deltaX !== 0 || deltaY !== 0) translateMove(newX, newY);

			// 重置启动点
			if (timeStamp - mainPointer.start >= 300) {
				mainPointer.start = timeStamp;
				mainPointer.startMove.x = newX;
				mainPointer.startMove.y = newY;
			}
		}
		// 触点抬起时触发的事件
		function pointerUp(e) {
			if (isMouseNoTouchMode && e.type === inn.an.event[10]
				|| isMouseNoTouchMode && e.type === inn.an.event[13]
				|| isOplock) return;

			var // 当前坐标
				x = scrollData.now.x,
				y = scrollData.now.y,
				// 移动长度
				newX = x,
				newY = y,
				// 动量
				momentumX = null,
				momentumY = null,
				// 时长
				duration = ud2.time() - mainPointer.start,
				// 运动时间
				time = 0,
				// 缓动
				e;

			// 触点结束时刻
			mainPointer.end = ud2.time();

			// 如无运动关闭滚动条
			barClose();

			// 如果未移动直接跳出
			if (!mainPointer.moved || !isSlowMovning) return;

			// 当延迟小于300ms则进行延迟滚动特效
			if (duration < 300) {
				var timeX = 0,
					timeY = 0;
				if (hasVertical) {
					momentumY = momentum(y, mainPointer.startMove.y, duration, scrollData.sh,
						bounce ? scrollData.h : 0);
					newY = momentumY.destination;
					timeY = momentumY.duration;
				}
				if (hasHorizontal) {
					momentumX = momentum(x, mainPointer.startMove.x, duration, scrollData.sw,
						bounce ? scrollData.w : 0);
					newX = momentumX.destination;
					timeX = momentumX.duration;
				}

				time = Math.max(timeX, timeY);
			}

			// 当坐标确定发生移动则执行滚动动画
			if (newX !== x || newY !== y) {
				barOpen();
				setScrollingState(true);
				translateMove(newX, newY, time);
			}
		}
		// 鼠标滚轮发生滚动时触发的事件
		// move[number]: 滚轮滚动方向及长度
		function mouseWheel(move) {
			var x = scrollData.now.x,
				y = scrollData.now.y,
				time = 300,
				moveLen = mouseWheelLength;

			followerPosition();
			getScrollData();

			// 判断移动距离
			if (moveLen === 'normal') moveLen = Math.round(scrollData.h);
			move > 0 ? y -= moveLen : y += moveLen;

			if (y > 0 || y < -scrollData.sh) {
				setScrollingState(false);
			} else {
				barOpen();
				setScrollingState(true);
			}
			translateMove(x, y, time);
		}
		// 滚动条被按下时触发的事件
		function scrollDown() {
			this.move = 0;
			mouseInScroll = true;
			barOpen();
			followerPosition();
		}
		// 滚动条被释放时触发的事件
		function scrollUp() {
			mouseInScroll = false;
			barClose();
		}
		// 滚动条被按下并拖拽时触发的事件
		// move[number]: 滚动条滚动方向及长度
		// direction[bool]: 滚动方向
		function scrollMove(move, direction) {
			var x = direction ? scrollData.now.x : getScrollPositionByBarPosition(-(move.x - this.move), 0) + scrollData.now.x,
				y = direction ? getScrollPositionByBarPosition(-(move.y - this.move), 1) + scrollData.now.y : scrollData.now.y;

			if (direction) {
				this.move = move.y;
			} else {
				this.move = move.x;
			}

			translateMove(x, y);
		}

		// 鼠标操作滚动条事件绑定
		// 用于检测鼠标当前对滚动条进行的具体操作，从而产生不同滚动条的视觉效果
		function bindScrollMouseEvent($me) {
			var // 鼠标按下标识   鼠标移入标识
				isDown = false,
				isEnter = false,
				// 判断滚动条是水平或垂直滚动条
				isWH = $me === $barHorizontal ? 'height' : 'width';

			function leave(e) {
				e.stopPropagation();

				isDown = false;
				if (!isEnter) {
					$me.css('background', barColor).css(isWH, barSize);
					if (barBorderRadiusState) $me.css('border-radius', barSize / 2);
				} else $me.css('background', barColorOn);
				inn.dom().off(inn.an.event[24], leave);
			}

			$me.on(inn.an.event[12], function () {
				isEnter = true;
				$me.css('background', barColorOn).css(isWH, barSizeOn);
				if (barBorderRadiusState) $me.css('border-radius', barSizeOn / 2);
			}).on(inn.an.event[13], function () {
				isEnter = false;
				if (!isDown) {
					$me.css('background', barColor).css(isWH, barSize);
					if (barBorderRadiusState) $me.css('border-radius', barSize / 2);
				}
			}).on(inn.an.event[8], function () {
				isDown = true;
				$me.css('background', barColorDown);
				inn.dom().on(inn.an.event[24], leave);
			});

		}
		// 事件绑定
		function bindEvent() {

			// 绑定屏幕尺寸变化的事件
			if (recountByResize) ud2.callbacks.pageResize.add(recountPosition);

			// 鼠标在滑入滑出滚动区域时滚动条的显示处理
			if (barState === 0) {
				$scroll.on(inn.an.event[12], function () {
					getScrollData();
					mouseInBox = true;
					barOpen();
				}).on([inn.an.event[13], inn.an.event[6]].join(' '), function () {
					mouseInBox = false;
					barClose();
				});
			}
			if (barState === 1) {
				$scroll.on(inn.an.event[12], function () {
					getScrollData();
					mouseInBox = true;
				});
				$scroll.on([inn.an.event[13], inn.an.event[6]].join(' '), function () {
					mouseInBox = false;
				});
			}

			// 绑定事件
			if (isTouchMode) {
				ud2.event($scroll, { stopPropagation: true })
					.setDown(pointerDown)
					.setUp(pointerUp)
					.setPan(pointerMove);
			}
			if (isMouseWheelMode) {
				ud2.eventMouseWheel($scroll).setScroll(mouseWheel);
			}
			if (isScrollMode) {
				bindScrollMouseEvent($barVertical);
				bindScrollMouseEvent($barHorizontal);

				// 通过滚动条滑动来控制当前容器的移动距离
				ud2.event($barVertical, { stopPropagation: true })
					.setPan(function (move) { scrollMove.call(this, move, 1); })
					.setDown(scrollDown)
					.setUp(scrollUp);
				ud2.event($barHorizontal, { stopPropagation: true })
					.setPan(function (move) { scrollMove.call(this, move, 0); })
					.setDown(scrollDown)
					.setUp(scrollUp);
			}
		}

		// #endregion

		// #region 初始化

		// 初始化
		(function init() {
			var i, l = $scroll.length;

			// 超过一个元素时，则生成多个控件
			if (l > 1) {
				for (i = 1; i < l; i++) ud2.scroll($scroll.eq(i), userOptions);
				$scroll = $scroll.eq(0);
			}

			// 对象内部集合
			var $child = $scroll.contents();
			// 如果内部对象集合长度为0(说明$scroll内容为空)，则把$wrapper元素插入到$scroll内
			// 否则用$wrapper包裹所有内部对象，得到最新的包裹对象并提交给$wrapper
			if ($child.length === 0) {
				$scroll.append($wrapper);
			} else {
				$child.wrapAll($wrapper);
				$wrapper = $scroll.children(cn('wrapper', 1));
			}

			// 延续scroll盒的padding值
			// 让外盒的padding来模拟scroll盒的padding
			// (!HACK) 此处当$wrapper.css('padding')获取值的时候，EDGE浏览器获取的值为空
			// 进而分别试用top/bottom/left/right来获取padding值
			$wrapper.css('padding',
				$scroll.css('padding-top') +
				' ' + $scroll.css('padding-right') +
				' ' + $scroll.css('padding-bottom') +
				' ' + $scroll.css('padding-left'));

			// 对$scroll添加.ud2-scroll类(滚动条基础样式)
			$scroll.addClass(cls);

			// 添加滚动条并设置尺寸
			if (hasVertical) {
				$scroll.prepend($barVertical);
				$wrapper.css({
					'height': 'auto',
					'min-height': '100%'
				});
			}
			if (hasHorizontal) {
				$scroll.prepend($barHorizontal);
				$wrapper.css({
					'width': 'auto',
					'min-width': '100%'
				});
			}
			$barVertical.css({
				'top': barOffset,
				'right': barOffset,
				'width': barSize,
				'background': barColor
			});
			$barHorizontal.css({
				'left': barOffset,
				'bottom': barOffset,
				'height': barSize,
				'background': barColor
			});
			if (barBorderRadiusState) {
				$barVertical.css('border-radius', barSize / 2);
				$barHorizontal.css('border-radius', barSize / 2);
			}
			if (barState === 1) {
				$barVertical.css('display', 'block');
				$barHorizontal.css('display', 'block');
			}

			// 获取scroll的数据值
			getScrollData();
			// 绑定事件
			bindEvent();
		}());

		// #endregion

		// #region 返回

		// 返回
		return ud2.extend(scrollObj, {
			type: SCROLL_NAME,
			move: move,
			oplock: oplock,
			followerBind: followerBind,
			followerUnbind: followerUnbind,
			recountPosition: recountPosition,
			getContent: getContent
		});

		// #endregion

	});

});