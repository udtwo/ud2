/*! ud2 - v0.0.0
 * (c) 2015 Peak(peak@udtwo.com) */
if("undefined"==typeof $)throw new Error("ud2库需要JQuery支持");var ud2=function(a,b){"use strict";function c(a){if(a=d(a),0===a.length)return L.clone();if(1===a.length)return a.attr(s+this.name+"-state")?void 0:a;for(var b=a.length,c=0;b>c;c++)this.create(a.eq(c))}function d(c){return c||(c=b()),Q.isString(c)&&(c=b(c)),c===a&&(c=b(a)),Q.isJQuery(c)||(c=b()),c}function e(a,c){a=d(a),a.each(function(){c(b(this))})}function f(a){var b=(a.attr(q)||"").split(" "),c=[];return b.forEach(function(a){0!==a.length&&c.push(a)}),c}function g(a,b){var c=f(a);return c.indexOf(b)>-1?!0:!1}function h(a,b){if(V[i(b)]&&!g(a,b)){var c=f(a);c.push(b),a.attr(q,c.join(" "))}}function i(a){var b=a.split("-"),c=1,d=b.length;if(d>1)for(;d>c;c++)b[c].length>0&&(b[c]=b[c].substr(0,1).toUpperCase()+b[c].substr(1));return b.join("")}function j(a,b){if(Q.isObject(b))for(var c in b)void 0!==a[c]&&(a[c]=b[c])}function k(a,b){b.attr("style",a.attr("style")).addClass(a.attr("class")),a.removeAttr("style").removeClass()}function l(a,b){for(var c=a.get(0),d=b.get(0),e=c.attributes.length,f=/^(ud2-?|data\-|tabindex)/,g=0,h=0;e>g;g++)if(f.test(c.attributes[h].name)){var i=c.attributes[h];d.setAttribute(i.name,i.value),c.removeAttribute(i.name)}else h++}function m(a,b){var c=a.get(0),d=b.get(0),e=c.attributes.name;void 0!==e&&(d.setAttribute(e.name,e.value),c.removeAttribute(e.name))}var n=a.document,o=b(a),p=b(n),q="ud2",r="-",s=[q,r].join(""),t=(" -webkit- -moz- -o- -ms- ".split(" "),function(){var b={},c=n.createElement("div");return b.safari=/constructor/i.test(a.HTMLElement),b.touch="ontouchstart"in a||a.DocumentTouch&&n instanceof DocumentTouch,b.pointer=a.navigator.pointerEnabled,b.msPointer=a.navigator.msPointerEnabled,b.touchAction=void 0!==c.style.touchAction||void 0!==c.style.msTouchAction||!1,b.perspective=void 0!==c.style.perspective||void 0!==c.style.msPerspective||void 0!==c.style.mozPerspective||void 0!==c.style.webkitPerspective||!1,b.transition=void 0!==c.style.transition||void 0!==c.style.msTransition||void 0!==c.style.mozTransition||void 0!==c.style.webkitTransition||void 0!==c.style.oTransition||!1,b.animation=void 0!==c.style.animation||void 0!==c.style.mozAnimation||void 0!==c.style.webkitAnimation||void 0!==c.style.oAnimation||!1,b}()),u=a.requestAnimationFrame||a.webkitRequestAnimationFrame||a.mozRequestAnimationFrame||a.oRequestAnimationFrame||a.msRequestAnimationFrame||function(b){a.setTimeout(b,1e3/60)},v={date:/^(?:[12]\d{3}([\.\-\/])(?:(?:0?[13578]|1[02])\1(?:0?[1-9]|[12]\d|3[01])|(?:0?[469]|11)\1(?:0?[1-9]|[12]\d|30)|0?2\1(?:0?[1-9]|1\d|2[0-8]))$|[12]\d(?:[02468][048]|[13579][26])([\.\-\/])(?:(?:0?[13578]|1[02])\2(?:0?[1-9]|[12]\d|3[01])|(?:0?[469]|11)\2(?:0?[1-9]|[12]\d|30)|0?2\2(?:0?[1-9]|1\d|2[0-9])))$/,mail:/^([\w-\.]+)@(([\w-]+\.)+)([a-zA-Z]{2,4})$/,phone:/^[1][3458][0-9]{9}$/,identityCard:/^(11|12|13|14|15|21|22|23|31|32|33|34|35|36|37|41|42|43|44|45|46|50|51|52|53|54|61|62|63|64|65|71|81|82|97|98|99)[0-9]{4}((?:19|20)?(?:[0-9]{2}(?:(?:0[13578]|1[12])(?:0[1-9]|[12][0-9]|3[01])|(?:0[469]|11)(?:0[1-9]|[12][0-9]|30)|02(?:0[1-9]|1[0-9]|2[0-8]))|(?:[02468][048]|[13579][26])0229)[0-9]{3}[\dxX])$/,loginName:/^[a-zA-Z][a-zA-Z0-9]+$/},w=function(){var a=0;return{create:function(){return"nonamed-"+a++}}}(),x=Date.now||function(){return(new Date).getTime()},y=t.pointer?"pointerdown":"MSPointerDown",z=t.pointer?"pointermove":"MSPointerMove",A=t.pointer?"pointerup":"MSPointerUp",B="touchstart",C="touchmove",D="touchend",E="touchcancel",F="mousedown",G="mousemove",H="mouseup",I="mouseout",J="mouseenter",K="mouseleave",L=b("<div />"),M=b("<a />"),N=function(){return!1},O=b.Callbacks(),P=b.Callbacks(),Q=function(){function a(a){return function(b){return{}.toString.call(b)==="[object "+a+"]"}}function c(b){return a("Object")(b)}function d(b){return a("Function")(b)}function e(b){return a("String")(b)}function f(b){return a("Number")(b)}function g(a){return/^([1-9]\d+|[0-9])$/.test(a)}function h(a){return a instanceof b}return{isType:a,isObject:c,isFunction:d,isString:e,isNumber:f,isNaturalNumber:g,isJQuery:h}}(),R=function(){function a(a){return isNaturalNumber(a)?+a:0}return{toNaturalNumber:a}}(),S=function(){function a(a){return Q.isString(a)?a:""}function b(b,c,d){return b=a(b),c=c||Number.MAX_VALUE,"undefined"!=typeof d?(c>d&&(d=c),b.length<=d&&b.length>=c):b.length===c}function c(b,c){return b=a(b),c=c||0,b.length>=c}function d(b,c){return b=a(b),c=c||Number.MAX_VALUE,b.length<=c}function e(b){return b=a(b),v.phone.test(b)}function f(b){return b=a(b),v.mail.test(b)}function g(b){return b=a(b),v.date.test(b)}function h(b){return b=a(b),v.loginName.test(b)}function i(b){if(b=a(b),b=b.toUpperCase(),v.identityCard.test(b)){if(18===b.length){for(var c=[7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2],d=[1,0,"X",9,8,7,6,5,4,3,2],e=b.split(""),f=0,g=0;17>g;g++)f+=e[g]*c[g];var h=d[f%11];if(h!=e[17])return!1}return!0}return!1}return{isLength:b,isMinLength:c,isMaxLength:d,isPhone:e,isMail:f,isDate:g,isLoginName:h,isIdentityCard:i}}(),T=function(a,c){function d(a,b){b?a.css({"-ms-touch-action":"none","touch-action":"none"}):a.css({"-ms-touch-action":"auto","touch-action":"auto"}),t.touchAction||(b?a.bind("selectstart",N):a.unbind("selectstart",N))}function f(a){return K.pan=a,w}function g(a){return K.tap=a,w}function h(a){return K.press=a,w}function i(a){return K.swipeLeft=a,w}function k(a){return K.swipeRight=a,w}function l(a){return K.swipeTop=a,w}function m(a){return K.swipeBottom=a,w}function n(a){return K.down=a,w}function o(a){return K.up=a,w}function q(){M.forEach(function(){arguments[0].bind()})}function r(){M.forEach(function(){arguments[0].unbind()})}function u(a,b){this.del=!1,this.id=a,this.downScreenX=b?b.screenX:0,this.downScreenY=b?b.screenY:0,this.downPageX=b?b.pageX:0,this.downPageY=b?b.pageY:0,this.downClientX=b?b.clientX:0,this.downClientY=b?b.clientY:0,this.moveScreenX=this.downScreenX,this.moveScreenY=this.downScreenY,this.movePageX=this.downPageX,this.movePageY=this.downPageY,this.moveClientX=this.downClientX,this.moveClientY=this.downClientY}function v(a){function b(a){0===c()&&(Q.id=a,Q.time=x())}function c(){var a=0;for(var b in P)P[b].del||a++;return a}function e(){for(var a in P)P[a].del&&delete P[a]}function f(a){J.stopPropagation&&a.stopPropagation();var d=a.originalEvent,e=d.pointerId;b(e),0===c()&&(p.bind(O[1],g),p.bind(O[2],h)),(!P[e]||P[e].del)&&(P[e]=new u(e,d),o(a,e))}function g(a){J.stopPropagation&&a.stopPropagation(),a.preventDefault();var b=a.originalEvent,c=b.pointerId;P[c]&&(P[c].setMove(b),q(a,c))}function h(a){J.stopPropagation&&a.stopPropagation();var b=a.originalEvent,d=b.pointerId;P[d]&&(r(a,d),P[d].del=!0,0===c()&&(p.unbind(O[1],g),p.unbind(O[2],h)))}function i(a){J.stopPropagation&&a.stopPropagation();var d=a.originalEvent,e=d.changedTouches;0===c()&&(N.bind(O[4],j),N.bind(O[5],k),N.bind(O[6],k)),b(e[0].identifier);for(var f=0,g=e.length;g>f;f++)(!P[e[f].identifier]||P[e[f].identifier].del)&&(P[e[f].identifier]=new u(e[f].identifier,e[f])),o(a,e[f].identifier)}function j(a){J.stopPropagation&&a.stopPropagation(),a.preventDefault();for(var b=a.originalEvent,c=b.changedTouches,d=0,e=c.length;e>d;d++)P[c[d].identifier]&&P[c[d].identifier].setMove(c[d]),q(a,c[d].identifier)}function k(a){J.stopPropagation&&a.stopPropagation();for(var b=a.originalEvent,d=b.changedTouches,e=0,f=d.length;f>e;e++)r(a,d[e].identifier),P[d[e].identifier].del=!0;0===c()&&(N.unbind(O[4],j),N.unbind(O[5],k),N.unbind(O[6],k))}function l(a){J.stopPropagation&&a.stopPropagation();var c=a.originalEvent;b(0),P[0]=new u(0,c),o(a,0),p.bind(O[8],m),p.bind(O[9],n)}function m(a){J.stopPropagation&&a.stopPropagation(),a.stopPropagation();var b=a.originalEvent;P[0]&&(P[0].setMove(b),q(a,0))}function n(a){J.stopPropagation&&a.stopPropagation(),P[0]&&(r(a,0),void 0!==P[0]&&P[0].del===!1&&(P[0].del=!0),p.unbind(O[8],m),p.unbind(O[9],n))}function o(b,c){R=!1;for(var d=a.parents(),e=d.length,f=0;e>f;f++)if("1"===d.eq(f).attr(s+"scroll-runing")){R=!0;break}K.down.call(a,c)}function q(b,c){var d=P[c].getMoveLength();b.preventDefault(),K.pan.call(a,d,c)}function r(b,c){var d=null,f=P[c].getMoveLength(),g={x:Math.abs(f.x),y:Math.abs(f.y)};L&&x()-L.time<500&&"touchend"===L.type&&"mouseup"===b.type||(L={time:x(),type:b.type},Q.id===c&&(d=new Date-Q.time,Q.id=null,Q.time=null),d&&(g.x<J.pointerValidLength&&g.y<J.pointerValidLength&&(R||(d<J.tapMaxTime?K.tap.call(a):K.press.call(a))),g.x>=J.pointerValidLength&&g.x>=g.y&&d<J.swipeMaxTime&&(f.x<0?(b.preventDefault(),K.swipeLeft.call(a)):(b.preventDefault(),K.swipeRight.call(a))),g.y>=J.pointerValidLength&&g.y>=g.x&&d<J.swipeMaxTime&&(f.y<0?(b.preventDefault(),K.swipeTop.call(a)):(b.preventDefault(),K.swipeBottom.call(a)))),K.up.call(a,c),e())}function v(a){t.pointer||t.msPointer?a?N.bind(O[0],f):N.unbind(O[0],f):a?(N.bind(O[3],i),N.bind(O[7],l)):(N.unbind(O[3],i),N.unbind(O[7],l)),a?d(N,!0):d(N,!1)}function w(){S||(S=!0,v(!0))}function M(){S&&(S=!1,v(!1))}var N=a,O=[y,z,A,B,C,D,E,F,G,H,I],P={},Q={id:null,time:null},R=!1,S=!1;return function(){w();var b=a.find("a, img");b.bind("dragstart",function(a){a.preventDefault()})}(),{bind:w,unbind:M}}var w={},J={stopPropagation:!1,tapMaxTime:300,swipeMaxTime:500,pointerValidLength:5},K={pan:b.noop,tap:b.noop,press:b.noop,swipeLeft:b.noop,swipeRight:b.noop,swipeTop:b.noop,swipeBottom:b.noop,down:b.noop,up:b.noop},L=null,M=[];return u.prototype.setMove=function(a){a&&a.screenX&&(this.moveScreenX=a.screenX),a&&a.screenY&&(this.moveScreenY=a.screenY),a&&a.pageX&&(this.movePageX=a.pageX),a&&a.pageY&&(this.movePageY=a.pageY),a&&a.clientX&&(this.moveClientX=a.clientX),a&&a.clientY&&(this.moveClientY=a.clientY)},u.prototype.getMoveLength=function(){return{x:this.movePageX-this.downPageX,y:this.movePageY-this.downPageY}},function(){j(J,c),e(a,function(a){M.push(v(a))})}(),w={setPan:f,setTap:g,setPress:h,setSwipeLeft:i,setSwipeRight:k,setSwipeTop:l,setSwipeBottom:m,setDown:n,setUp:o,on:q,off:r}},U=function(a,c){function d(a){return n.scroll=a,l}function f(a){return n.down=a,l}function g(a){return n.up=a,l}function h(){p.forEach(function(){arguments[0].bind()})}function i(){p.forEach(function(){arguments[0].unbind()})}function k(a){function b(b){b.stopPropagation(),b.preventDefault();var c=b.originalEvent,d=c.deltaY/100||c.wheelDelta/-120||(Math.abs(c.detail)>2?c.detail/3:c.detail)||0;n.scroll.call(a,d),d>0?n.down.call(a):n.up.call(a)}function c(){f||(f=!0,e.bind(o,b))}function d(){f&&(f=!1,e.unbind(o,b))}var e=a,f=!1;return function(){c()}(),{bind:c,unbind:d}}var l={},m={},n={scroll:b.noop,down:b.noop,up:b.noop},o="DOMMouseScroll mousewheel",p=[];return function(){j(m,c),e(a,function(a){p.push(k(a))})}(),l={setScroll:d,setDown:f,setUp:g,on:h,off:i}},V=function(){function a(){function a(){var a=b(this),c=f(a);c.forEach(function(b,c){var d=i(b),e=a.attr(s+b+"-state");e||V[d].create(a)})}var c=b("["+q+"]");c.each(a);for(var d in V)V[d]&&V[d].isControlsGroup&&V[d].findDocument()}return{createAll:a,style:{normal:0,info:1,success:2,warning:3,danger:4}}}(),W=function(a){function c(a){var c=Q.isJQuery(a)?a:b(a),d=c.parents();if(h.$current){if(c.get(0)===h.$current.get(0))return;for(var e=0,f=d.length;f>e;e++)if(d.eq(e).get(0)===h.$current.get(0))return}h.autoClose()}function e(a){var b=["","info","success","warning","danger"];h.style===V.style.info&&h.$current.removeClass(b[h.style]),h.style===V.style.success&&h.$current.removeClass(b[h.style]),h.style===V.style.warning&&h.$current.removeClass(b[h.style]),h.style===V.style.danger&&h.$current.removeClass(b[h.style]),h.style=a,h.$current.addClass(b[a])}var f,g,h={};return f=d(a),0===f.length&&(f=L.clone()),f.length>1&&(f=f.eq(0)),g=f.attr(s+"name"),g||(g=w.create(),f.attr(s+"name",g)),h.style=V.style.normal,h.$origin=f,h.$current=null,h.autoClose=function(){},h["public"]={name:g,isUD2:!0,style:e},P.add(c),h},X=function(a){var d=[];return d.name=Q.isString(a)?a:"empty",d.controlName=i(a),d.isControlsGroup=!0,d.findDocument=b.noop,d.init=function(a,b){return a["public"]},d.create=function(a,b){if(a=c.call(this,a)){var d=W(a);return this.push(d["public"]),this[d["public"].name]=d["public"],h(d.$origin,this.name),d.$origin.attr(s+this.name+"-state",!0),this.init(d,b),d["public"]}},V[d.name]=d,d},Y=function(c,e){function f(){if(N.hasVertical){var a=0,b=0,c=0;if(a=R.height(),aa.h=Q.height(),aa.ih=Q.innerHeight(),aa.sh=a-aa.h,aa.now.y<-aa.sh&&(aa.now.y=-aa.sh),c=aa.ih-2*N.barOffset,0!==aa.h){var d=aa.sh/(5*aa.ih);d=1-(d>1?1:d),b=c*d,b=b<N.barMinLength?N.barMinLength:b,b=b>c?c:b,ba.h=b,ba.mh=c,ba.sh=c-b,V.height(b)}}if(N.hasHorizontal){var e=0,f=0,g=0;if(e=R.width(),aa.w=Q.width(),aa.iw=Q.innerWidth(),aa.sw=e-aa.w,aa.now.x<-aa.sw&&(aa.now.x=-aa.sw),g=aa.iw-2*N.barOffset,0!==aa.w){var d=aa.sw/(5*aa.iw);d=1-(d>1?1:d),f=g*d,f=f<N.barMinLength?N.barMinLength:f,f=f>g?g:f,ba.w=f,ba.mw=g,ba.sw=g-f,S.width(f)}}}function g(){var a,b;if(t.transition){var c=R.css("transform");c=c.split(")")[0].split(", "),a=Math.round(+(c[12]||c[4])),b=Math.round(+(c[13]||c[5]))}else a=aa.now.x,b=aa.now.y;return{x:a,y:b}}function h(a){Z!==a&&(Z=a,Q.attr(W,a?1:0))}function i(a,b){var c=b?"sh":"sw";return 0===aa[c]||0===ba[c]?0:a/aa[c]*ba[c]}function k(a,b){var c=b?"sh":"sw";return 0===aa[c]||0===ba[c]?0:a/ba[c]*aa[c]}function l(a,b,c,d){c=c||0,d=d||X.circular,a>0&&(a=0),b>0&&(b=0),b<-aa.sh&&(b=-aa.sh),a<-aa.sw&&(a=-aa.sw),t.transition?(m(d.css),n(c),R.css("transform","translate("+a+"px, "+b+"px)"+(t.perspective?" translateZ(0)":"")),N.hasVertical&&V.css("transform","translate(0, "+i(-b,1)+"px)"+(t.perspective?" translateZ(0)":"")),N.hasHorizontal&&S.css("transform","translate("+i(-a,0)+"px, 0)"+(t.perspective?" translateZ(0)":"")),aa.now={x:a,y:b}):0===c?(R.css({left:a,top:b}),N.hasVertical&&V.css("top",i(-b,1)+"px"),N.hasHorizontal&&S.css("left",i(-a,0)+"px"),aa.now={x:a,y:b}):p(a,b,c,d.fn)}function m(a){R.css("transition-timing-function",a),V.css("transition-timing-function",a+", ease-out, ease-out, ease-out"),S.css("transition-timing-function",a+", ease-out, ease-out, ease-out")}function n(b){var c=parseInt(b);R.css("transition-duration",c+"ms"),V.css("transition-duration",c+"ms, 300ms, 300ms, 300ms"),S.css("transition-duration",c+"ms, 300ms, 300ms, 300ms"),0!==c?($&&a.clearTimeout($),$=a.setTimeout(function(){l(aa.now.x,aa.now.y,0),h(!1),r()},c)):(h(!1),r())}function p(a,b,c,d){function e(){var j,k,l,m=x();i>m?(m=(m-h)/c,l=d(m),j=(a-f)*l+f,k=(b-g)*l+g,aa.now={x:j,y:k},R.css({left:j,top:k}),N.hasVertical&&V.css("top",-k/aa.sh*ba.sh),N.hasHorizontal&&S.css("left",-j/aa.sh*ba.sh),Z&&u(e)):Z=!1}var f=aa.now.x,g=aa.now.y,h=x(),i=h+c;Z=!0,e()}function q(){0===N.barState&&(ba.timer&&a.clearTimeout(ba.timer),t.transition?(S.stop().fadeIn(200),V.stop().fadeIn(200)):(S.show(),V.show()))}function r(){0===N.barState&&(P||O||Z||(ba.timer&&a.clearTimeout(ba.timer),ba.timer=a.setTimeout(function(){t.transition?(S.stop().fadeOut(500),V.stop().fadeOut(500)):(S.hide(),V.hide())},1e3)))}function v(a,b,c,d,e,f){var g,h,i=a-b,j=Math.abs(i)/c;return d=-d,e=e||0,f=f||5e-4,g=a+j*j/(2*f)*(0>i?-1:1),h=j/f,d>g?(g=e?d-e/2.5*(j/8):d,i=Math.abs(g-a),h=i/j):g>0&&(g=e?e/2.5*(j/8):0,i=Math.abs(a)+g,h=i/j),{destination:Math.round(g),duration:h}}function w(){return Z}function y(){return f(),l(aa.now.x,aa.now.y),M}function z(a,b,c,d){return l(-a,-b,c,d),M}function A(){f(),q();var a=g();l(a.x,a.y),Y.moved=!1,Y.start=x(),Y.startMove={x:aa.now.x,y:aa.now.y},Y.lastMove={x:0,y:0}}function B(a){var b=x(),c=a.x,d=a.y,e=Math.abs(c),f=Math.abs(d),g=c-Y.lastMove.x,h=d-Y.lastMove.y,i=0,j=0;q(),Y.lastMove={x:c,y:d},b-Y.end>300&&_>e&&_>f||(Y.moved||(Y.moved=!0),N.hasVertical&&(j=h+aa.now.y),N.hasHorizontal&&(i=g+aa.now.x),(0!==g||0!==h)&&l(i,j),b-Y.start>=300&&(Y.start=b,Y.startMove.x=i,Y.startMove.y=j))}function C(){var a=aa.now.x,b=aa.now.y,c=a,d=b,e=null,f=null,g=x()-Y.start,i=0;if(Y.end=x(),r(),Y.moved&&N.slowMoving){if(300>g){var j=0,k=0;N.hasVertical&&(f=v(b,Y.startMove.y,g,aa.sh,N.bounce?aa.h:0),d=f.destination,k=f.duration),N.hasHorizontal&&(e=v(a,Y.startMove.x,g,aa.sw,N.bounce?aa.w:0),c=e.destination,j=e.duration),i=Math.max(j,k)}(c!==a||d!==b)&&(q(),h(!0),l(c,d,i))}}function E(a){var b=aa.now.x,c=aa.now.y,d=300,e=N.mousewheelLength;f(),"normal"===e&&(e=Math.round(aa.h)),a>0?c-=e:c+=e,c>0||c<-aa.sh?h(!1):(q(),h(!0)),l(b,c,d)}function F(){this.move=0,O=!0,q(),b(this).css("background",N.barColorOn)}function G(){O=!1,r(),b(this).css("background",N.barColor)}function H(a,b){var c=b?aa.now.x:k(-(a.x-this.move),0)+aa.now.x,d=b?k(-(a.y-this.move),1)+aa.now.y:aa.now.y;b?this.move=a.y:this.move=a.x,l(c,d)}function I(){N.recountByResize&&o.bind("resize orientationchange",y),0===N.barState&&Q.bind(J,function(){f(),P=!0,q()}).bind([K,D].join(" "),function(){P=!1,r()}),N.isTouchMode&&T(Q,{stopPropagation:!0}).setDown(A).setUp(C).setPan(B),N.isMouseWheelMode&&U(Q).setScroll(E),N.isScrollMode&&(T(V,{stopPropagation:!0}).setPan(function(a){H.call(this,a,1)}).setDown(F).setUp(G),T(S,{stopPropagation:!0}).setPan(function(a){H.call(this,a,0)}).setDown(F).setUp(G))}var M={},N={recountByResize:!1,barState:0,barSize:6,barMinLength:30,barOffset:1,barColor:"rgba(0,0,0,.4)",barColorOn:"rgba(0,0,0,.6)",barBorderRadiusState:!0,isMouseWheelMode:!0,isTouchMode:!0,isScrollMode:!1,mousewheelLength:"normal",hasHorizontal:!1,hasVertical:!0,slowMoving:!0},O=!1,P=!1,Q=d(c).eq(0),R=L.clone().addClass(s+"scroll-wrapper"),S=L.clone().addClass(s+"scroll-bar"),V=L.clone().addClass(s+"scroll-bar"),W=s+"scroll-runing",X={quadratic:{css:"cubic-bezier(0.25, 0.46, 0.45, 0.94)",fn:function(a){return a*(2-a)}},circular:{css:"cubic-bezier(0.1, 0.57, 0.1, 1)",fn:function(a){return Math.sqrt(1- --a*a)}}},Y={id:null,start:0,end:0,moved:!1,startMove:{x:0,y:0},lastMove:{x:0,y:0}},Z=!1,$=null,_=5,aa={h:0,ih:0,sh:0,w:0,iw:0,sw:0,now:{x:0,y:0},isMoved:!1},ba={h:0,mh:0,sh:0,w:0,mw:0,sw:0,timer:null};return function(){j(N,e),"normal"===N.mousewheelLength||isNaturalNumber(N.mousewheelLength)||(N.mousewheelLength="normal");var a=Q.contents();0===a.length?Q.append(R):(a.wrapAll(R),R=Q.children("."+s+"scroll-wrapper")),R.css("padding",Q.css("padding-top")+" "+Q.css("padding-right")+" "+Q.css("padding-bottom")+" "+Q.css("padding-left")),Q.addClass("ud2-scroll"),N.hasVertical&&(Q.prepend(V),R.css({height:"auto","min-height":"100%"})),N.hasHorizontal&&(Q.prepend(S),R.css({width:"auto","min-width":"100%"})),V.css({top:N.barOffset,right:N.barOffset,width:N.barSize,background:N.barColor}),S.css({left:N.barOffset,bottom:N.barOffset,height:N.barSize,background:N.barColor}),N.barBorderRadiusState&&(V.css("border-radius",N.barSize/2),S.css("border-radius",N.barSize/2)),1===N.barState&&(V.show(),S.show()),f(),I()}(),M={$content:R,move:z,getState:w,recountPosition:y}};(function(a){a.init=function(c,d){function e(a,b,c,d,f){this.group=f||null,this.name=a||"",this.value=b||"",this.disabled=c||!1,this.selected=!this.disabled&&(d||!1),this.createElement(),this.selected&&q(this),e.list.push(this),this.group?this.group.addOption(this):K.$content.append(this.$element)}function f(a,b){this.name=a||"",this.disabled=b||!1,this.options=[],this.createElement(),f.list.push(this),K.$content.append(this.$element)}function g(){var a=c.$origin.children("optgroup");h();for(var b,d=0,e=a.length;e>d;d++){var g=a.eq(d),i=g.attr("label")||"",j=!(!g.attr("disabled")||"false"===g.attr("disabled"));b=new f(i,j),h(b,g)}}function h(a,b){for(var d=a?!0:!1,f=a?b.children("option"):c.$origin.children("option"),g=0,h=f.length;h>g;g++){var i=(f.eq(g),f.eq(g).html()),j=f.eq(g).val(),k=!(!f.eq(g).attr("disabled")||"false"===f.eq(g).attr("disabled")),l=!(!f.eq(g).attr("selected")||"false"===f.eq(g).attr("selected"));d?new e(i,j,k,l,a):new e(i,j,k,l)}}function i(a){var b=null;if(A.isMultiple){var d=-1,e=[];for(var f in B)if(B[f]===a){d=f;break}d>-1?(a.setSelected(!1),B.splice(d,1)):(a.setSelected(!0),B.push(a));for(var f in B)e.push(B[f].value);0===B.length?(F.attr(z+"-value",null),F.html(A.autoText)):(F.attr(z+"-value",!0),F.html(e.length+"个项目")),b=e,H.val(e.join(","))}else B[0]&&B[0].setSelected(!1),F.attr(z+"-value",!0),a.setSelected(!0),B[0]=a,F.html(a.name),b=a.value,H.val(b);L.changeVal.call(c["public"],b)}function n(a){return L.open=a,c["public"]}function o(a){return L.close=a,c["public"]}function p(a){return L.changeVal=a,c["public"]}function q(a){a.disabled||a.group&&a.group.disabled||(i(a),A.isMultiple||u())}function r(a){var a=Q.isString(a)?a:A.autoText;return A.autoText=a,F.html(a),c["public"]}function t(){return J||(J=!0,C.addClass(z+"-on"),x(),L.open.call(c["public"])),c["public"]}function u(){return J&&(J=!1,C.removeClass(z+"-on"),L.close.call(c["public"])),c["public"]}function v(){return J?u():t(),c["public"]}function w(){if(A.isMultiple){var a=[];for(var b in B)a.push(B[b].$element.attr(z+"-value"));return a}return B[0]?B[0].$element.attr(z+"-value"):""}function x(){var a=e.list.length,b=f.list.length,c=0;c=2.5*a+2*b,c=c>A.maxHeight?A.maxHeight:c,D.css("height",c+"em"),K.recountPosition()}function y(){var a=T(E);a.setTap(v),G.bind("focus",function(){P.fire(C),t()})}var z=s+a.name,A={maxHeight:20,autoText:c.$origin.attr(z+"-text")||"请选择以下项目",isMultiple:!!c.$origin.attr("multiple")},B=[],C=b(['<div class="'+z+'">','<div class="'+z+'-put"><a class="'+z+'-btn" /><i class="'+z+'-ico" /></div>','<div class="'+z+'-list" />','<input type="checkbox" /><input type="hidden" />',"</div>"].join("")),D=C.children("div:last"),E=C.children("div:first"),F=E.children("a"),G=C.children('[type="checkbox"]'),H=C.children('[type="hidden"]'),I=M.clone(),J=!1,K=null,L={open:b.noop,close:b.noop,changeVal:b.noop};return e.list=[],e.prototype={createElement:function(){var a=I.clone(),b=this;a.html(this.name).attr("title",this.name).attr(z+"-value",this.value).addClass(z+"-option"),this.group&&a.addClass(z+"-ingroup"),(this.disabled||this.group&&this.group.disabled)&&a.attr(z+"-disabled","true"),this.$element=a,T(this.$element).setTap(function(){q(b)})},setSelected:function(a){this.selected=a,this.selected?this.$element.addClass(z+"-option-on"):this.$element.removeClass(z+"-option-on")},toggleSelected:function(a){a?this.setSelected(!1):this.setSelected(!0)}},f.list=[],f.prototype={createElement:function(){var a=I.clone();a.html(this.name).attr("title",this.name).addClass(z+"-group"),this.$element=a},addOption:function(a){a instanceof e&&(this.options.push(a),this.$element.after(a.$element))}},function(){c.$current=C,c.autoClose=u,j(A,d),k(c.$origin,C),l(c.$origin,C),m(c.$origin,H),K=Y(D,{barState:0,isScrollMode:!0,barColor:"rgba(0,0,0,.2)",barColorOn:"rgba(0,0,0,.4)"}),r(),g(),c.$origin.after(C),c.$origin.remove(),y()}(),c["public"].open=t,c["public"].close=u,c["public"].toggle=v,c["public"].val=w,c["public"].setShowText=r,c["public"].recountHeight=x,c["public"].setOpen=n,c["public"].setClose=o,c["public"].setChangeVal=p,c["public"]}})(X("select")),function(c){c.init=function(d,e){function f(){c.data||b.ajax({url:B.json,method:"get",dataType:"json"}).done(function(a){c.data=a,I.removeClass(A+"-load")})}function g(a){var b=H.children(),c=I.children();b.removeClass(A+"-tab-on "+A+"-tab-open"),b.eq(a).addClass(A+"-tab-on"),b.eq(0).addClass(A+"-tab-open"),C.province&&b.eq(1).addClass(A+"-tab-open"),C.city&&b.eq(2).addClass(A+"-tab-open"),c.detach()}function h(){if(c.data){g(0);for(var b in c.data){var d=c.data[b].name;C.provinceList[d]||(C.provinceList[d]=M.clone().html(d),T(C.provinceList[d]).setTap(function(a){return function(){C.province=c.data[a],C.city=null,C.area=null,i(),p()}}(b))),C.province&&C.province.name===d?C.provinceList[d].addClass(A+"-area-me"):C.provinceList[d].removeClass(A+"-area-me"),I.append(C.provinceList[d])}}else O&&(a.clearInterval(O),O=null),O=a.setInterval(h,50)}function i(){g(1);for(var a in C.province.city){var b=C.province.city[a].name,c=C.province.name+b;C.cityList[c]||(C.cityList[c]=M.clone().html(b),T(C.cityList[c]).setTap(function(a){return function(){C.city=C.province.city[a],C.area=null,n(),p()}}(a))),C.city&&C.city.name===b?C.cityList[c].addClass(A+"-area-me"):C.cityList[c].removeClass(A+"-area-me"),I.append(C.cityList[c])}}function n(){g(2);for(var a in C.city.area){var b=C.city.area[a],c=C.province.name+C.city.name+b;C.areaList[c]||(C.areaList[c]=M.clone().html(b),T(C.areaList[c]).setTap(function(a){return function(){C.area=C.city.area[a],p(),w()}}(a))),C.area&&C.area===b?C.areaList[c].addClass(A+"-area-me"):C.areaList[c].removeClass(A+"-area-me"),I.append(C.areaList[c])}}function o(){var a=this.index();0===a&&h(),C.province&&1===a&&i(),C.province&&C.city&&2===a&&n()}function p(){var a="",b=[];C.province?(a+=C.province.name,C.city&&(a+="<span>/</span>"+C.city.name,C.area&&(a+="<span>/</span>"+C.area,b=[C.province.name,C.city.name,C.area])),F.attr(A+"-value",!0),F.html(a)):(F.attr(A+"-value",null),F.html(B.autoText)),K.val(b.join(",")),R.changeVal.call(d["public"],b)}function q(a){return R.open=a,d["public"]}function r(a){return R.close=a,d["public"]}function t(a){return R.changeVal=a,d["public"]}function u(a){var a=Q.isString(a)?a:B.autoText;return B.autoText=a,F.html(a),d["public"]}function v(){return N||(N=!0,D.addClass(A+"-on"),G.addClass(s+"ctrl-power-on"),C.province?C.city?n():i():h(),R.open.call(d["public"])),d["public"]}function w(){return N&&(O&&(a.clearInterval(O),O=null),null===C.area&&(C.province=null,C.city=null,p()),N=!1,D.removeClass(A+"-on"),G.removeClass(s+"ctrl-power-on"),R.close.call(d["public"])),d["public"]}function x(){return N?w():v(),d["public"]}function y(){var a=[];return C.province&&C.city&&C.area&&(a.push(C.province.name),a.push(C.city.name),a.push(C.area)),a}function z(){var a=T(F);a.setTap(x);var b=T(G);b.setTap(x);var c=T(H.children());c.setTap(o),J.bind("focus",function(){P.fire(D),v()})}var A=s+c.name,B={autoText:d.$origin.attr(A+"-text")||"请选择城市信息",json:d.$origin.attr(A+"-json")||"/dist/json/address.json"},C={province:null,city:null,area:null,provinceList:[],cityList:[],areaList:[]},D=b(['<div class="'+A+'"><a class="'+A+'-btn" />','<div class="ud2-ctrl-power"><i class="ico">&#xe773;</i><i class="ico">&#xe689;</i></div>','<div class="'+A+'-list">','<div class="'+A+'-tabbox"><div class="'+A+'-tab">省份</div><div class="'+A+'-tab">城市</div><div class="'+A+'-tab">区县</div></div>','<div class="'+A+"-areabox "+A+'-load" /></div>','<input type="checkbox" /><input type="hidden" />',"</div>"].join("")),E=D.children("div"),F=D.children("a"),G=F.next(),H=E.children("div:first"),I=E.children("div:last"),J=D.children('[type="checkbox"]'),K=D.children('[type="hidden"]'),M=L.clone().addClass(A+"-area"),N=!1,O=null,R={open:b.noop,close:b.noop,changeVal:b.noop};return function(){d.$current=D,d.autoClose=w,j(B,e),k(d.$origin,D),l(d.$origin,D),m(d.$origin,K),f(),u(),d.$origin.after(D),d.$origin.remove(),z()}(),d["public"].open=v,d["public"].close=w,d["public"].toggle=x,d["public"].val=y,d["public"].setOpen=q,d["public"].setClose=r,d["public"].setChangeVal=t,d["public"]}}(X("address")),function(a){a.init=function(c,d){function e(){var a,b,c,d,e,j;j=function(){var a=H.step||1;return a=parseFloat(a),("number"!=typeof a||isNaN(a)||0===a)&&(a=1),a}(),a=function(){var a=H.min||0;return a=parseFloat(a),("number"!=typeof a||isNaN(a))&&(a=0),a}(),b=function(){var a=H.max||100;return a=parseFloat(a),("number"!=typeof N||isNaN(a))&&(a=100),a}(),c=i(H.value),d=c[0],e=c[1],a>b&&(b=a),K=j,N=a,O=b,K.toString().indexOf(".")>-1&&(L=K.toString().split(".")[1].length),g(),h(d,e),f()}function f(){Y.nl=o(I),Y.nr=o(J)}function g(){Y.w=V.outerWidth(),Y.bw=U.width(),Y.max=Y.bw-Y.w}function h(a,b){var d,e,f,g,h,i,j;N>a&&(a=N),a>O&&(a=O),I=Math.round((a-N)/K)*(Z*K)/Z+N,d=o(I),V.css("left",n(d)+"%"),H.both?(N>b&&(b=N),b>O&&(b=O),J=Math.round((b-N)/K)*(Z*K)/Z+N,e=o(J),W.css({left:n(e)+"%"}),f=Math.min(d,e),g=Math.max(d,e),h=Math.min(I,J),i=Math.max(I,J),X.css({left:100*f+"%",width:100*(g-f)+"%"}),R.val(h+","+i),j=[h,i]):(X.css("width",100*d+"%"),R.val(I),j=I),_.changeVal.call(c["public"],j)}function i(a){var b=null,c=null;return a=a?a.split(","):[0,0],b=a[0]||0,b=0!==b?parseFloat(b)||0:b,c=a[1]||0,c=0!==c?parseFloat(c)||0:c,[b,c]}function n(a){return a*Y.max/Y.bw*100}function o(a){var b=(a-N)/(O-N);return b}function p(a){return _.open=a,c["public"]}function q(a){return _.close=a,c["public"]}function r(a){return _.changeVal=a,c["public"]}function t(){return $||(g(),H.both?h(I,J):h(I),f(),$=!0,Q.addClass(G+"-on"),S.addClass(s+"ctrl-power-on"),_.open.call(c["public"])),c["public"]}function u(){return $&&($=!1,Q.removeClass(G+"-on"),S.removeClass(s+"ctrl-power-on"),_.close.call(c["public"])),c["public"]}function v(){return $?u():t(),c["public"]}function w(){if(H.both){var a=Math.min(I,J),b=Math.max(I,J);return[a,b]}return I}function x(){P.fire(Q),t()}function y(a){13===a.keyCode&&R.blur()}function z(){var a=i(R.val());g(),h(a[0],a[1]),f()}function A(a,b){var c=a*Y.max+b,d=null;return 0>c&&(c=0),c>Y.max&&(c=Y.max),d=parseFloat(((O-N)*c/Y.max+N).toFixed(L)),d=isNaN(d)?N:d}function B(a){H.both?h(A(Y.nl,a.x),J):h(A(Y.nl,a.x))}function C(){Y.nl=o(I)}function D(a){h(I,A(Y.nr,a.x))}function E(){Y.nr=o(J)}function F(){var a=T(V),b=T(W);T(S).setTap(v),a.setDown(g).setPan(B).setUp(C),b.setDown(g).setPan(D).setUp(E),R.bind("focus",x).bind("keydown",y).bind("blur",z)}var G=s+a.name,H={both:function(){var b=c.$origin.attr(s+a.name+"-both");return b&&"false"!==b?!0:!1}(),step:c.$origin.attr("step")||c.$origin.attr(s+a.name+"-step"),min:c.$origin.attr("min")||c.$origin.attr(s+a.name+"-min"),max:c.$origin.attr("max")||c.$origin.attr(s+a.name+"-max"),value:c.$origin.attr("value")||c.$origin.attr(s+a.name+"-value")},I=0,J=0,K=0,L=0,N=0,O=0,Q=b(['<div class="'+G+'">','<input type="text" maxlength="20" class="ud2-ctrl-txtbox" />','<div class="ud2-ctrl-power"><i class="ico">&#xe81b;</i><i class="ico">&#xe689;</i></div>','<div class="'+G+'-list"><div class="'+G+'-end" /><div class="'+G+'-back" /></div>',"</div>"].join("")),R=Q.children("input"),S=R.next(),U=S.next(),V=M.clone().addClass(G+"-hand"),W=M.clone().addClass(G+"-hand"),X=U.find("."+G+"-back"),Y={max:0,bw:0,w:0,nl:0,nr:0},Z=1e7,$=!1,_={open:b.noop,close:b.noop,changeVal:b.noop};return function(){c.$current=Q,c.autoClose=u,j(H,d),k(c.$origin,Q),l(c.$origin,Q),m(c.$origin,R),c.$origin.after(Q),c.$origin.remove(),X.after(V),H.both&&X.after(W),e(),F()}(),c["public"].val=w,c["public"].open=t,c["public"].close=u,c["public"].toggle=v,c["public"].setOpen=p,c["public"].setClose=q,c["public"].setChangeVal=r,c["public"]}}(X("range")),function(a){a.init=function(c,d){function e(){u=r.step,v=r.min,w=r.max,v>w&&(w=v),t=f(r.value),B.val(t)}function f(a){return a=a||0,a=parseFloat(a),("number"!=typeof a||isNaN(a))&&(a=0),v>a&&(a=v),a>w&&(a=w),a=Math.round((a-v)/u)*(C*u)/C+v}function g(a){if(!D){if(D=!0,a&&t+u>w||!a&&v>t-u)return void(D=!1);var b=L.clone().addClass(q+"-view").html('<input class="ud2-ctrl-txtbox" />'),c=L.clone().addClass(q+"-view").html('<input class="ud2-ctrl-txtbox" />');B.parent();t=a?Math.round((t+u)*C)/C:Math.round((t-u)*C)/C,b.children().val(t),c.children().val(t),B.before(b),B.after(c),A.animate({top:a?"-100%":"100%"},300,function(){D=!1,m(t),A.css("top",0),b.remove(),c.remove()})}}function h(){g(0)}function i(){g(1)}function m(a){t=a,B.val(t),E.changeVal.call(c["public"],t)}function n(a){return E.changeVal=a,c["public"]}function o(){return t}function p(){T(y).setTap(h),T(z).setTap(i),B.keydown(function(a){13===a.keyCode&&B.blur()}).focus(function(){P.fire(x),x.addClass(q+"-on")}).blur(function(){var a=f(B.val());m(a),x.removeClass(q+"-on")})}var q=s+a.name,r={step:function(){var a=c.$origin.attr("step")||c.$origin.attr(q+"-step")||1;return a=parseFloat(a),(Q.isNumber(a)||isNaN(a)||0===a)&&(a=1),a}(),min:function(){var a=c.$origin.attr("min")||c.$origin.attr(q+"-min")||0;return a=parseFloat(a),(Q.isNumber(u)||isNaN(a))&&(a=0),a}(),max:function(){var a=c.$origin.attr("max")||c.$origin.attr(q+"-max")||100;return a=parseFloat(a),(Q.isNumber(u)||isNaN(a))&&(a=100),a}(),value:c.$origin.attr("value")||c.$origin.attr(q+"-value")||0},t=0,u=0,v=0,w=0,x=b(['<div class="'+q+'">','<a class="'+q+'-ico">&#xe6b6;</a>','<div class="'+q+'-move"><input type="text" value="0" class="ud2-ctrl-txtbox" /></div>','<a class="'+q+'-ico">&#xe6b7;</a>',"</div>"].join("")),y=x.children("a:first"),z=x.children("a:last"),A=y.next(),B=x.find("input"),C=1e7,D=!1,E={
changeVal:b.noop};return function(){c.$current=x,j(r,d),e(),k(c.$origin,x),l(c.$origin,x),c.$origin.after(x),c.$origin.remove(),p()}(),c["public"].val=o,c["public"].setChangeVal=n,c["public"]}}(X("number")),function(a){a.init=function(c,d){function e(a){this.section=a,this.cells=[],a.row.push(this)}function f(a,b){this.section=a,this.cells=[],this.width=b||n.colWidth,a.col.push(this)}function g(a,b,c,d,e,f,g){this.section=a,this.text=b,this.rowspan=c,this.colspan=d,this.merged=e||!1,a.row[f].addCell(this),a.col[g].addCell(this),a.cell.push(this)}function h(a){var c=a.$origin.children("tr"),d=c.eq(0).children("td"),g=0,h=0;h=c.length,d.each(function(a){g+=parseInt(b(this).attr("colspan")||1)});for(var i=0;g>i;i++)new f(a);for(var i=0;h>i;i++)new e(a);return{row:h,col:g}}function i(a){for(var b,c,d,e=a.$origin.children("tr"),f=h(a),i=[],j=0;j<f.row;j++)for(var k=0,l=0;k<f.col;k++,l++){var m=!1;i.forEach(function(a){return k>=a.start[1]&&k<=a.start[1]+a.len[1]&&j>=a.start[0]&&j<=a.start[0]+a.len[0]?(l--,void(m=!0)):void 0}),m?new g(a,"",d,c,!0,j,k):(b=e.eq(j).children("td").eq(l),c=parseInt(b.attr("colspan")||1),d=parseInt(b.attr("rowspan")||1),(c>0||d>0)&&i.push({start:[j,k],len:[d-1,c-1]}),new g(a,b.html(),d,c,!1,j,k))}}function m(){var a=c.$origin.children("thead"),b=c.$origin.children("tbody"),d=c.$origin.children("tfoot");p.thead.$origin=a,p.thead.$origin.parent=p.thead,p.tbody.$origin=b,p.tbody.$origin.parent=p.tbody,p.tfoot.$origin=d,p.tfoot.$origin.parent=p.tfoot,0!==p.thead.$origin.length&&i(p.thead),0!==p.tbody.$origin.length&&i(p.tbody),0!==p.tfoot.$origin.length&&i(p.tfoot)}var n=(s+a.name,{colWidth:200}),o=L.clone(),p={thead:{row:[],col:[],cell:[]},tbody:{row:[],col:[],cell:[]},tfoot:{row:[],col:[],cell:[]}};return e.prototype={addCell:function(a){this.cells.push(a)}},f.prototype={addCell:function(a){this.cells.push(a)}},function(){j(n,d),k(c.$origin,o),l(c.$origin,o),m(),c.$origin.after(o),c.$origin.remove();b("<table />"),b("<tr />"),b("<td />")}(),c["public"].thead=p.thead,c["public"].tbody=p.tbody,c["public"].tfoot=p.tfoot,c["public"]}}(X("table"));return function(){p.ready(function(){t.safari&&n.body.addEventListener("touchstart",b.noop),O.fire(),p.bind([B,F].join(" "),function(a){P.fire(a.target)})}),O.add(V.createAll)}(),V.regex=v,V.support=t,V.type=Q,V.convert=R,V.form=S,V.animateFrame=u,V.event=T,V.eventMouseWheel=U,V.ctrl=W,V.ctrlGroup=X,V.scroll=Y,V}(window,jQuery);
/* lasted： 2015-11-04 10:09:37 */