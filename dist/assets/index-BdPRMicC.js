var cd=Object.defineProperty;var dd=(e,t,n)=>t in e?cd(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var mt=(e,t,n)=>dd(e,typeof t!="symbol"?t+"":t,n);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();function pd(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var Da={exports:{}},Ci={},$a={exports:{}},B={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var gr=Symbol.for("react.element"),fd=Symbol.for("react.portal"),md=Symbol.for("react.fragment"),hd=Symbol.for("react.strict_mode"),gd=Symbol.for("react.profiler"),vd=Symbol.for("react.provider"),yd=Symbol.for("react.context"),xd=Symbol.for("react.forward_ref"),wd=Symbol.for("react.suspense"),kd=Symbol.for("react.memo"),Sd=Symbol.for("react.lazy"),go=Symbol.iterator;function jd(e){return e===null||typeof e!="object"?null:(e=go&&e[go]||e["@@iterator"],typeof e=="function"?e:null)}var Ua={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Va=Object.assign,Ba={};function bn(e,t,n){this.props=e,this.context=t,this.refs=Ba,this.updater=n||Ua}bn.prototype.isReactComponent={};bn.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};bn.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Ha(){}Ha.prototype=bn.prototype;function yl(e,t,n){this.props=e,this.context=t,this.refs=Ba,this.updater=n||Ua}var xl=yl.prototype=new Ha;xl.constructor=yl;Va(xl,bn.prototype);xl.isPureReactComponent=!0;var vo=Array.isArray,Wa=Object.prototype.hasOwnProperty,wl={current:null},Qa={key:!0,ref:!0,__self:!0,__source:!0};function Ga(e,t,n){var r,i={},s=null,o=null;if(t!=null)for(r in t.ref!==void 0&&(o=t.ref),t.key!==void 0&&(s=""+t.key),t)Wa.call(t,r)&&!Qa.hasOwnProperty(r)&&(i[r]=t[r]);var a=arguments.length-2;if(a===1)i.children=n;else if(1<a){for(var u=Array(a),d=0;d<a;d++)u[d]=arguments[d+2];i.children=u}if(e&&e.defaultProps)for(r in a=e.defaultProps,a)i[r]===void 0&&(i[r]=a[r]);return{$$typeof:gr,type:e,key:s,ref:o,props:i,_owner:wl.current}}function Nd(e,t){return{$$typeof:gr,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function kl(e){return typeof e=="object"&&e!==null&&e.$$typeof===gr}function Cd(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var yo=/\/+/g;function Vi(e,t){return typeof e=="object"&&e!==null&&e.key!=null?Cd(""+e.key):t.toString(36)}function Ar(e,t,n,r,i){var s=typeof e;(s==="undefined"||s==="boolean")&&(e=null);var o=!1;if(e===null)o=!0;else switch(s){case"string":case"number":o=!0;break;case"object":switch(e.$$typeof){case gr:case fd:o=!0}}if(o)return o=e,i=i(o),e=r===""?"."+Vi(o,0):r,vo(i)?(n="",e!=null&&(n=e.replace(yo,"$&/")+"/"),Ar(i,t,n,"",function(d){return d})):i!=null&&(kl(i)&&(i=Nd(i,n+(!i.key||o&&o.key===i.key?"":(""+i.key).replace(yo,"$&/")+"/")+e)),t.push(i)),1;if(o=0,r=r===""?".":r+":",vo(e))for(var a=0;a<e.length;a++){s=e[a];var u=r+Vi(s,a);o+=Ar(s,t,n,u,i)}else if(u=jd(e),typeof u=="function")for(e=u.call(e),a=0;!(s=e.next()).done;)s=s.value,u=r+Vi(s,a++),o+=Ar(s,t,n,u,i);else if(s==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return o}function kr(e,t,n){if(e==null)return e;var r=[],i=0;return Ar(e,r,"","",function(s){return t.call(n,s,i++)}),r}function zd(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var je={current:null},Dr={transition:null},Ed={ReactCurrentDispatcher:je,ReactCurrentBatchConfig:Dr,ReactCurrentOwner:wl};function Ka(){throw Error("act(...) is not supported in production builds of React.")}B.Children={map:kr,forEach:function(e,t,n){kr(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return kr(e,function(){t++}),t},toArray:function(e){return kr(e,function(t){return t})||[]},only:function(e){if(!kl(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};B.Component=bn;B.Fragment=md;B.Profiler=gd;B.PureComponent=yl;B.StrictMode=hd;B.Suspense=wd;B.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Ed;B.act=Ka;B.cloneElement=function(e,t,n){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var r=Va({},e.props),i=e.key,s=e.ref,o=e._owner;if(t!=null){if(t.ref!==void 0&&(s=t.ref,o=wl.current),t.key!==void 0&&(i=""+t.key),e.type&&e.type.defaultProps)var a=e.type.defaultProps;for(u in t)Wa.call(t,u)&&!Qa.hasOwnProperty(u)&&(r[u]=t[u]===void 0&&a!==void 0?a[u]:t[u])}var u=arguments.length-2;if(u===1)r.children=n;else if(1<u){a=Array(u);for(var d=0;d<u;d++)a[d]=arguments[d+2];r.children=a}return{$$typeof:gr,type:e.type,key:i,ref:s,props:r,_owner:o}};B.createContext=function(e){return e={$$typeof:yd,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:vd,_context:e},e.Consumer=e};B.createElement=Ga;B.createFactory=function(e){var t=Ga.bind(null,e);return t.type=e,t};B.createRef=function(){return{current:null}};B.forwardRef=function(e){return{$$typeof:xd,render:e}};B.isValidElement=kl;B.lazy=function(e){return{$$typeof:Sd,_payload:{_status:-1,_result:e},_init:zd}};B.memo=function(e,t){return{$$typeof:kd,type:e,compare:t===void 0?null:t}};B.startTransition=function(e){var t=Dr.transition;Dr.transition={};try{e()}finally{Dr.transition=t}};B.unstable_act=Ka;B.useCallback=function(e,t){return je.current.useCallback(e,t)};B.useContext=function(e){return je.current.useContext(e)};B.useDebugValue=function(){};B.useDeferredValue=function(e){return je.current.useDeferredValue(e)};B.useEffect=function(e,t){return je.current.useEffect(e,t)};B.useId=function(){return je.current.useId()};B.useImperativeHandle=function(e,t,n){return je.current.useImperativeHandle(e,t,n)};B.useInsertionEffect=function(e,t){return je.current.useInsertionEffect(e,t)};B.useLayoutEffect=function(e,t){return je.current.useLayoutEffect(e,t)};B.useMemo=function(e,t){return je.current.useMemo(e,t)};B.useReducer=function(e,t,n){return je.current.useReducer(e,t,n)};B.useRef=function(e){return je.current.useRef(e)};B.useState=function(e){return je.current.useState(e)};B.useSyncExternalStore=function(e,t,n){return je.current.useSyncExternalStore(e,t,n)};B.useTransition=function(){return je.current.useTransition()};B.version="18.3.1";$a.exports=B;var A=$a.exports;const bd=pd(A);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Td=A,Pd=Symbol.for("react.element"),Ld=Symbol.for("react.fragment"),_d=Object.prototype.hasOwnProperty,Md=Td.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Id={key:!0,ref:!0,__self:!0,__source:!0};function Ya(e,t,n){var r,i={},s=null,o=null;n!==void 0&&(s=""+n),t.key!==void 0&&(s=""+t.key),t.ref!==void 0&&(o=t.ref);for(r in t)_d.call(t,r)&&!Id.hasOwnProperty(r)&&(i[r]=t[r]);if(e&&e.defaultProps)for(r in t=e.defaultProps,t)i[r]===void 0&&(i[r]=t[r]);return{$$typeof:Pd,type:e,key:s,ref:o,props:i,_owner:Md.current}}Ci.Fragment=Ld;Ci.jsx=Ya;Ci.jsxs=Ya;Da.exports=Ci;var l=Da.exports,gs={},qa={exports:{}},Ie={},Xa={exports:{}},Ja={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(e){function t(N,v){var f=N.length;N.push(v);e:for(;0<f;){var S=f-1>>>1,_=N[S];if(0<i(_,v))N[S]=v,N[f]=_,f=S;else break e}}function n(N){return N.length===0?null:N[0]}function r(N){if(N.length===0)return null;var v=N[0],f=N.pop();if(f!==v){N[0]=f;e:for(var S=0,_=N.length,E=_>>>1;S<E;){var R=2*(S+1)-1,H=N[R],V=R+1,Q=N[V];if(0>i(H,f))V<_&&0>i(Q,H)?(N[S]=Q,N[V]=f,S=V):(N[S]=H,N[R]=f,S=R);else if(V<_&&0>i(Q,f))N[S]=Q,N[V]=f,S=V;else break e}}return v}function i(N,v){var f=N.sortIndex-v.sortIndex;return f!==0?f:N.id-v.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;e.unstable_now=function(){return s.now()}}else{var o=Date,a=o.now();e.unstable_now=function(){return o.now()-a}}var u=[],d=[],x=1,h=null,g=3,w=!1,k=!1,j=!1,M=typeof setTimeout=="function"?setTimeout:null,p=typeof clearTimeout=="function"?clearTimeout:null,c=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function m(N){for(var v=n(d);v!==null;){if(v.callback===null)r(d);else if(v.startTime<=N)r(d),v.sortIndex=v.expirationTime,t(u,v);else break;v=n(d)}}function y(N){if(j=!1,m(N),!k)if(n(u)!==null)k=!0,ge(C);else{var v=n(d);v!==null&&b(y,v.startTime-N)}}function C(N,v){k=!1,j&&(j=!1,p(z),z=-1),w=!0;var f=g;try{for(m(v),h=n(u);h!==null&&(!(h.expirationTime>v)||N&&!W());){var S=h.callback;if(typeof S=="function"){h.callback=null,g=h.priorityLevel;var _=S(h.expirationTime<=v);v=e.unstable_now(),typeof _=="function"?h.callback=_:h===n(u)&&r(u),m(v)}else r(u);h=n(u)}if(h!==null)var E=!0;else{var R=n(d);R!==null&&b(y,R.startTime-v),E=!1}return E}finally{h=null,g=f,w=!1}}var P=!1,L=null,z=-1,O=5,I=-1;function W(){return!(e.unstable_now()-I<O)}function D(){if(L!==null){var N=e.unstable_now();I=N;var v=!0;try{v=L(!0,N)}finally{v?U():(P=!1,L=null)}}else P=!1}var U;if(typeof c=="function")U=function(){c(D)};else if(typeof MessageChannel<"u"){var te=new MessageChannel,K=te.port2;te.port1.onmessage=D,U=function(){K.postMessage(null)}}else U=function(){M(D,0)};function ge(N){L=N,P||(P=!0,U())}function b(N,v){z=M(function(){N(e.unstable_now())},v)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(N){N.callback=null},e.unstable_continueExecution=function(){k||w||(k=!0,ge(C))},e.unstable_forceFrameRate=function(N){0>N||125<N?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):O=0<N?Math.floor(1e3/N):5},e.unstable_getCurrentPriorityLevel=function(){return g},e.unstable_getFirstCallbackNode=function(){return n(u)},e.unstable_next=function(N){switch(g){case 1:case 2:case 3:var v=3;break;default:v=g}var f=g;g=v;try{return N()}finally{g=f}},e.unstable_pauseExecution=function(){},e.unstable_requestPaint=function(){},e.unstable_runWithPriority=function(N,v){switch(N){case 1:case 2:case 3:case 4:case 5:break;default:N=3}var f=g;g=N;try{return v()}finally{g=f}},e.unstable_scheduleCallback=function(N,v,f){var S=e.unstable_now();switch(typeof f=="object"&&f!==null?(f=f.delay,f=typeof f=="number"&&0<f?S+f:S):f=S,N){case 1:var _=-1;break;case 2:_=250;break;case 5:_=1073741823;break;case 4:_=1e4;break;default:_=5e3}return _=f+_,N={id:x++,callback:v,priorityLevel:N,startTime:f,expirationTime:_,sortIndex:-1},f>S?(N.sortIndex=f,t(d,N),n(u)===null&&N===n(d)&&(j?(p(z),z=-1):j=!0,b(y,f-S))):(N.sortIndex=_,t(u,N),k||w||(k=!0,ge(C))),N},e.unstable_shouldYield=W,e.unstable_wrapCallback=function(N){var v=g;return function(){var f=g;g=v;try{return N.apply(this,arguments)}finally{g=f}}}})(Ja);Xa.exports=Ja;var Rd=Xa.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Od=A,Me=Rd;function T(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var Za=new Set,Zn={};function Yt(e,t){wn(e,t),wn(e+"Capture",t)}function wn(e,t){for(Zn[e]=t,e=0;e<t.length;e++)Za.add(t[e])}var at=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),vs=Object.prototype.hasOwnProperty,Fd=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,xo={},wo={};function Ad(e){return vs.call(wo,e)?!0:vs.call(xo,e)?!1:Fd.test(e)?wo[e]=!0:(xo[e]=!0,!1)}function Dd(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function $d(e,t,n,r){if(t===null||typeof t>"u"||Dd(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function Ne(e,t,n,r,i,s,o){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=i,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=s,this.removeEmptyString=o}var he={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){he[e]=new Ne(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];he[t]=new Ne(t,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){he[e]=new Ne(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){he[e]=new Ne(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){he[e]=new Ne(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){he[e]=new Ne(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){he[e]=new Ne(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){he[e]=new Ne(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){he[e]=new Ne(e,5,!1,e.toLowerCase(),null,!1,!1)});var Sl=/[\-:]([a-z])/g;function jl(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(Sl,jl);he[t]=new Ne(t,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(Sl,jl);he[t]=new Ne(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(Sl,jl);he[t]=new Ne(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){he[e]=new Ne(e,1,!1,e.toLowerCase(),null,!1,!1)});he.xlinkHref=new Ne("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){he[e]=new Ne(e,1,!1,e.toLowerCase(),null,!0,!0)});function Nl(e,t,n,r){var i=he.hasOwnProperty(t)?he[t]:null;(i!==null?i.type!==0:r||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&($d(t,n,i,r)&&(n=null),r||i===null?Ad(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):i.mustUseProperty?e[i.propertyName]=n===null?i.type===3?!1:"":n:(t=i.attributeName,r=i.attributeNamespace,n===null?e.removeAttribute(t):(i=i.type,n=i===3||i===4&&n===!0?"":""+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}var pt=Od.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Sr=Symbol.for("react.element"),Zt=Symbol.for("react.portal"),en=Symbol.for("react.fragment"),Cl=Symbol.for("react.strict_mode"),ys=Symbol.for("react.profiler"),eu=Symbol.for("react.provider"),tu=Symbol.for("react.context"),zl=Symbol.for("react.forward_ref"),xs=Symbol.for("react.suspense"),ws=Symbol.for("react.suspense_list"),El=Symbol.for("react.memo"),gt=Symbol.for("react.lazy"),nu=Symbol.for("react.offscreen"),ko=Symbol.iterator;function Ln(e){return e===null||typeof e!="object"?null:(e=ko&&e[ko]||e["@@iterator"],typeof e=="function"?e:null)}var ie=Object.assign,Bi;function Dn(e){if(Bi===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);Bi=t&&t[1]||""}return`
`+Bi+e}var Hi=!1;function Wi(e,t){if(!e||Hi)return"";Hi=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(d){var r=d}Reflect.construct(e,[],t)}else{try{t.call()}catch(d){r=d}e.call(t.prototype)}else{try{throw Error()}catch(d){r=d}e()}}catch(d){if(d&&r&&typeof d.stack=="string"){for(var i=d.stack.split(`
`),s=r.stack.split(`
`),o=i.length-1,a=s.length-1;1<=o&&0<=a&&i[o]!==s[a];)a--;for(;1<=o&&0<=a;o--,a--)if(i[o]!==s[a]){if(o!==1||a!==1)do if(o--,a--,0>a||i[o]!==s[a]){var u=`
`+i[o].replace(" at new "," at ");return e.displayName&&u.includes("<anonymous>")&&(u=u.replace("<anonymous>",e.displayName)),u}while(1<=o&&0<=a);break}}}finally{Hi=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?Dn(e):""}function Ud(e){switch(e.tag){case 5:return Dn(e.type);case 16:return Dn("Lazy");case 13:return Dn("Suspense");case 19:return Dn("SuspenseList");case 0:case 2:case 15:return e=Wi(e.type,!1),e;case 11:return e=Wi(e.type.render,!1),e;case 1:return e=Wi(e.type,!0),e;default:return""}}function ks(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case en:return"Fragment";case Zt:return"Portal";case ys:return"Profiler";case Cl:return"StrictMode";case xs:return"Suspense";case ws:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case tu:return(e.displayName||"Context")+".Consumer";case eu:return(e._context.displayName||"Context")+".Provider";case zl:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case El:return t=e.displayName||null,t!==null?t:ks(e.type)||"Memo";case gt:t=e._payload,e=e._init;try{return ks(e(t))}catch{}}return null}function Vd(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return ks(t);case 8:return t===Cl?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function Lt(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function ru(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Bd(e){var t=ru(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var i=n.get,s=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(o){r=""+o,s.call(this,o)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(o){r=""+o},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function jr(e){e._valueTracker||(e._valueTracker=Bd(e))}function iu(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r="";return e&&(r=ru(e)?e.checked?"true":"false":e.value),e=r,e!==n?(t.setValue(e),!0):!1}function Xr(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function Ss(e,t){var n=t.checked;return ie({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function So(e,t){var n=t.defaultValue==null?"":t.defaultValue,r=t.checked!=null?t.checked:t.defaultChecked;n=Lt(t.value!=null?t.value:n),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function su(e,t){t=t.checked,t!=null&&Nl(e,"checked",t,!1)}function js(e,t){su(e,t);var n=Lt(t.value),r=t.type;if(n!=null)r==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?Ns(e,t.type,n):t.hasOwnProperty("defaultValue")&&Ns(e,t.type,Lt(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function jo(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var r=t.type;if(!(r!=="submit"&&r!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function Ns(e,t,n){(t!=="number"||Xr(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var $n=Array.isArray;function pn(e,t,n,r){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t["$"+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty("$"+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&r&&(e[n].defaultSelected=!0)}else{for(n=""+Lt(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,r&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function Cs(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(T(91));return ie({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function No(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(T(92));if($n(n)){if(1<n.length)throw Error(T(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:Lt(n)}}function lu(e,t){var n=Lt(t.value),r=Lt(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=""+r)}function Co(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function ou(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function zs(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?ou(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var Nr,au=function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,r,i){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,i)})}:e}(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(Nr=Nr||document.createElement("div"),Nr.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=Nr.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function er(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Bn={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Hd=["Webkit","ms","Moz","O"];Object.keys(Bn).forEach(function(e){Hd.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),Bn[t]=Bn[e]})});function uu(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||Bn.hasOwnProperty(e)&&Bn[e]?(""+t).trim():t+"px"}function cu(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var r=n.indexOf("--")===0,i=uu(n,t[n],r);n==="float"&&(n="cssFloat"),r?e.setProperty(n,i):e[n]=i}}var Wd=ie({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Es(e,t){if(t){if(Wd[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(T(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(T(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(T(61))}if(t.style!=null&&typeof t.style!="object")throw Error(T(62))}}function bs(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Ts=null;function bl(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Ps=null,fn=null,mn=null;function zo(e){if(e=xr(e)){if(typeof Ps!="function")throw Error(T(280));var t=e.stateNode;t&&(t=Pi(t),Ps(e.stateNode,e.type,t))}}function du(e){fn?mn?mn.push(e):mn=[e]:fn=e}function pu(){if(fn){var e=fn,t=mn;if(mn=fn=null,zo(e),t)for(e=0;e<t.length;e++)zo(t[e])}}function fu(e,t){return e(t)}function mu(){}var Qi=!1;function hu(e,t,n){if(Qi)return e(t,n);Qi=!0;try{return fu(e,t,n)}finally{Qi=!1,(fn!==null||mn!==null)&&(mu(),pu())}}function tr(e,t){var n=e.stateNode;if(n===null)return null;var r=Pi(n);if(r===null)return null;n=r[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(T(231,t,typeof n));return n}var Ls=!1;if(at)try{var _n={};Object.defineProperty(_n,"passive",{get:function(){Ls=!0}}),window.addEventListener("test",_n,_n),window.removeEventListener("test",_n,_n)}catch{Ls=!1}function Qd(e,t,n,r,i,s,o,a,u){var d=Array.prototype.slice.call(arguments,3);try{t.apply(n,d)}catch(x){this.onError(x)}}var Hn=!1,Jr=null,Zr=!1,_s=null,Gd={onError:function(e){Hn=!0,Jr=e}};function Kd(e,t,n,r,i,s,o,a,u){Hn=!1,Jr=null,Qd.apply(Gd,arguments)}function Yd(e,t,n,r,i,s,o,a,u){if(Kd.apply(this,arguments),Hn){if(Hn){var d=Jr;Hn=!1,Jr=null}else throw Error(T(198));Zr||(Zr=!0,_s=d)}}function qt(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function gu(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Eo(e){if(qt(e)!==e)throw Error(T(188))}function qd(e){var t=e.alternate;if(!t){if(t=qt(e),t===null)throw Error(T(188));return t!==e?null:e}for(var n=e,r=t;;){var i=n.return;if(i===null)break;var s=i.alternate;if(s===null){if(r=i.return,r!==null){n=r;continue}break}if(i.child===s.child){for(s=i.child;s;){if(s===n)return Eo(i),e;if(s===r)return Eo(i),t;s=s.sibling}throw Error(T(188))}if(n.return!==r.return)n=i,r=s;else{for(var o=!1,a=i.child;a;){if(a===n){o=!0,n=i,r=s;break}if(a===r){o=!0,r=i,n=s;break}a=a.sibling}if(!o){for(a=s.child;a;){if(a===n){o=!0,n=s,r=i;break}if(a===r){o=!0,r=s,n=i;break}a=a.sibling}if(!o)throw Error(T(189))}}if(n.alternate!==r)throw Error(T(190))}if(n.tag!==3)throw Error(T(188));return n.stateNode.current===n?e:t}function vu(e){return e=qd(e),e!==null?yu(e):null}function yu(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=yu(e);if(t!==null)return t;e=e.sibling}return null}var xu=Me.unstable_scheduleCallback,bo=Me.unstable_cancelCallback,Xd=Me.unstable_shouldYield,Jd=Me.unstable_requestPaint,le=Me.unstable_now,Zd=Me.unstable_getCurrentPriorityLevel,Tl=Me.unstable_ImmediatePriority,wu=Me.unstable_UserBlockingPriority,ei=Me.unstable_NormalPriority,ep=Me.unstable_LowPriority,ku=Me.unstable_IdlePriority,zi=null,Ze=null;function tp(e){if(Ze&&typeof Ze.onCommitFiberRoot=="function")try{Ze.onCommitFiberRoot(zi,e,void 0,(e.current.flags&128)===128)}catch{}}var Ge=Math.clz32?Math.clz32:ip,np=Math.log,rp=Math.LN2;function ip(e){return e>>>=0,e===0?32:31-(np(e)/rp|0)|0}var Cr=64,zr=4194304;function Un(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function ti(e,t){var n=e.pendingLanes;if(n===0)return 0;var r=0,i=e.suspendedLanes,s=e.pingedLanes,o=n&268435455;if(o!==0){var a=o&~i;a!==0?r=Un(a):(s&=o,s!==0&&(r=Un(s)))}else o=n&~i,o!==0?r=Un(o):s!==0&&(r=Un(s));if(r===0)return 0;if(t!==0&&t!==r&&!(t&i)&&(i=r&-r,s=t&-t,i>=s||i===16&&(s&4194240)!==0))return t;if(r&4&&(r|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=r;0<t;)n=31-Ge(t),i=1<<n,r|=e[n],t&=~i;return r}function sp(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function lp(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,i=e.expirationTimes,s=e.pendingLanes;0<s;){var o=31-Ge(s),a=1<<o,u=i[o];u===-1?(!(a&n)||a&r)&&(i[o]=sp(a,t)):u<=t&&(e.expiredLanes|=a),s&=~a}}function Ms(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function Su(){var e=Cr;return Cr<<=1,!(Cr&4194240)&&(Cr=64),e}function Gi(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function vr(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-Ge(t),e[t]=n}function op(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<n;){var i=31-Ge(n),s=1<<i;t[i]=0,r[i]=-1,e[i]=-1,n&=~s}}function Pl(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-Ge(n),i=1<<r;i&t|e[r]&t&&(e[r]|=t),n&=~i}}var Y=0;function ju(e){return e&=-e,1<e?4<e?e&268435455?16:536870912:4:1}var Nu,Ll,Cu,zu,Eu,Is=!1,Er=[],St=null,jt=null,Nt=null,nr=new Map,rr=new Map,yt=[],ap="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function To(e,t){switch(e){case"focusin":case"focusout":St=null;break;case"dragenter":case"dragleave":jt=null;break;case"mouseover":case"mouseout":Nt=null;break;case"pointerover":case"pointerout":nr.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":rr.delete(t.pointerId)}}function Mn(e,t,n,r,i,s){return e===null||e.nativeEvent!==s?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:s,targetContainers:[i]},t!==null&&(t=xr(t),t!==null&&Ll(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function up(e,t,n,r,i){switch(t){case"focusin":return St=Mn(St,e,t,n,r,i),!0;case"dragenter":return jt=Mn(jt,e,t,n,r,i),!0;case"mouseover":return Nt=Mn(Nt,e,t,n,r,i),!0;case"pointerover":var s=i.pointerId;return nr.set(s,Mn(nr.get(s)||null,e,t,n,r,i)),!0;case"gotpointercapture":return s=i.pointerId,rr.set(s,Mn(rr.get(s)||null,e,t,n,r,i)),!0}return!1}function bu(e){var t=Dt(e.target);if(t!==null){var n=qt(t);if(n!==null){if(t=n.tag,t===13){if(t=gu(n),t!==null){e.blockedOn=t,Eu(e.priority,function(){Cu(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function $r(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=Rs(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);Ts=r,n.target.dispatchEvent(r),Ts=null}else return t=xr(n),t!==null&&Ll(t),e.blockedOn=n,!1;t.shift()}return!0}function Po(e,t,n){$r(e)&&n.delete(t)}function cp(){Is=!1,St!==null&&$r(St)&&(St=null),jt!==null&&$r(jt)&&(jt=null),Nt!==null&&$r(Nt)&&(Nt=null),nr.forEach(Po),rr.forEach(Po)}function In(e,t){e.blockedOn===t&&(e.blockedOn=null,Is||(Is=!0,Me.unstable_scheduleCallback(Me.unstable_NormalPriority,cp)))}function ir(e){function t(i){return In(i,e)}if(0<Er.length){In(Er[0],e);for(var n=1;n<Er.length;n++){var r=Er[n];r.blockedOn===e&&(r.blockedOn=null)}}for(St!==null&&In(St,e),jt!==null&&In(jt,e),Nt!==null&&In(Nt,e),nr.forEach(t),rr.forEach(t),n=0;n<yt.length;n++)r=yt[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<yt.length&&(n=yt[0],n.blockedOn===null);)bu(n),n.blockedOn===null&&yt.shift()}var hn=pt.ReactCurrentBatchConfig,ni=!0;function dp(e,t,n,r){var i=Y,s=hn.transition;hn.transition=null;try{Y=1,_l(e,t,n,r)}finally{Y=i,hn.transition=s}}function pp(e,t,n,r){var i=Y,s=hn.transition;hn.transition=null;try{Y=4,_l(e,t,n,r)}finally{Y=i,hn.transition=s}}function _l(e,t,n,r){if(ni){var i=Rs(e,t,n,r);if(i===null)rs(e,t,r,ri,n),To(e,r);else if(up(i,e,t,n,r))r.stopPropagation();else if(To(e,r),t&4&&-1<ap.indexOf(e)){for(;i!==null;){var s=xr(i);if(s!==null&&Nu(s),s=Rs(e,t,n,r),s===null&&rs(e,t,r,ri,n),s===i)break;i=s}i!==null&&r.stopPropagation()}else rs(e,t,r,null,n)}}var ri=null;function Rs(e,t,n,r){if(ri=null,e=bl(r),e=Dt(e),e!==null)if(t=qt(e),t===null)e=null;else if(n=t.tag,n===13){if(e=gu(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return ri=e,null}function Tu(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Zd()){case Tl:return 1;case wu:return 4;case ei:case ep:return 16;case ku:return 536870912;default:return 16}default:return 16}}var wt=null,Ml=null,Ur=null;function Pu(){if(Ur)return Ur;var e,t=Ml,n=t.length,r,i="value"in wt?wt.value:wt.textContent,s=i.length;for(e=0;e<n&&t[e]===i[e];e++);var o=n-e;for(r=1;r<=o&&t[n-r]===i[s-r];r++);return Ur=i.slice(e,1<r?1-r:void 0)}function Vr(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function br(){return!0}function Lo(){return!1}function Re(e){function t(n,r,i,s,o){this._reactName=n,this._targetInst=i,this.type=r,this.nativeEvent=s,this.target=o,this.currentTarget=null;for(var a in e)e.hasOwnProperty(a)&&(n=e[a],this[a]=n?n(s):s[a]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?br:Lo,this.isPropagationStopped=Lo,this}return ie(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=br)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=br)},persist:function(){},isPersistent:br}),t}var Tn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Il=Re(Tn),yr=ie({},Tn,{view:0,detail:0}),fp=Re(yr),Ki,Yi,Rn,Ei=ie({},yr,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Rl,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Rn&&(Rn&&e.type==="mousemove"?(Ki=e.screenX-Rn.screenX,Yi=e.screenY-Rn.screenY):Yi=Ki=0,Rn=e),Ki)},movementY:function(e){return"movementY"in e?e.movementY:Yi}}),_o=Re(Ei),mp=ie({},Ei,{dataTransfer:0}),hp=Re(mp),gp=ie({},yr,{relatedTarget:0}),qi=Re(gp),vp=ie({},Tn,{animationName:0,elapsedTime:0,pseudoElement:0}),yp=Re(vp),xp=ie({},Tn,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),wp=Re(xp),kp=ie({},Tn,{data:0}),Mo=Re(kp),Sp={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},jp={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Np={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Cp(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Np[e])?!!t[e]:!1}function Rl(){return Cp}var zp=ie({},yr,{key:function(e){if(e.key){var t=Sp[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Vr(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?jp[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Rl,charCode:function(e){return e.type==="keypress"?Vr(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Vr(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Ep=Re(zp),bp=ie({},Ei,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Io=Re(bp),Tp=ie({},yr,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Rl}),Pp=Re(Tp),Lp=ie({},Tn,{propertyName:0,elapsedTime:0,pseudoElement:0}),_p=Re(Lp),Mp=ie({},Ei,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),Ip=Re(Mp),Rp=[9,13,27,32],Ol=at&&"CompositionEvent"in window,Wn=null;at&&"documentMode"in document&&(Wn=document.documentMode);var Op=at&&"TextEvent"in window&&!Wn,Lu=at&&(!Ol||Wn&&8<Wn&&11>=Wn),Ro=" ",Oo=!1;function _u(e,t){switch(e){case"keyup":return Rp.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Mu(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var tn=!1;function Fp(e,t){switch(e){case"compositionend":return Mu(t);case"keypress":return t.which!==32?null:(Oo=!0,Ro);case"textInput":return e=t.data,e===Ro&&Oo?null:e;default:return null}}function Ap(e,t){if(tn)return e==="compositionend"||!Ol&&_u(e,t)?(e=Pu(),Ur=Ml=wt=null,tn=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Lu&&t.locale!=="ko"?null:t.data;default:return null}}var Dp={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Fo(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!Dp[e.type]:t==="textarea"}function Iu(e,t,n,r){du(r),t=ii(t,"onChange"),0<t.length&&(n=new Il("onChange","change",null,n,r),e.push({event:n,listeners:t}))}var Qn=null,sr=null;function $p(e){Wu(e,0)}function bi(e){var t=sn(e);if(iu(t))return e}function Up(e,t){if(e==="change")return t}var Ru=!1;if(at){var Xi;if(at){var Ji="oninput"in document;if(!Ji){var Ao=document.createElement("div");Ao.setAttribute("oninput","return;"),Ji=typeof Ao.oninput=="function"}Xi=Ji}else Xi=!1;Ru=Xi&&(!document.documentMode||9<document.documentMode)}function Do(){Qn&&(Qn.detachEvent("onpropertychange",Ou),sr=Qn=null)}function Ou(e){if(e.propertyName==="value"&&bi(sr)){var t=[];Iu(t,sr,e,bl(e)),hu($p,t)}}function Vp(e,t,n){e==="focusin"?(Do(),Qn=t,sr=n,Qn.attachEvent("onpropertychange",Ou)):e==="focusout"&&Do()}function Bp(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return bi(sr)}function Hp(e,t){if(e==="click")return bi(t)}function Wp(e,t){if(e==="input"||e==="change")return bi(t)}function Qp(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Ye=typeof Object.is=="function"?Object.is:Qp;function lr(e,t){if(Ye(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!vs.call(t,i)||!Ye(e[i],t[i]))return!1}return!0}function $o(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Uo(e,t){var n=$o(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=$o(n)}}function Fu(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Fu(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Au(){for(var e=window,t=Xr();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=Xr(e.document)}return t}function Fl(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function Gp(e){var t=Au(),n=e.focusedElem,r=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&Fu(n.ownerDocument.documentElement,n)){if(r!==null&&Fl(n)){if(t=r.start,e=r.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var i=n.textContent.length,s=Math.min(r.start,i);r=r.end===void 0?s:Math.min(r.end,i),!e.extend&&s>r&&(i=r,r=s,s=i),i=Uo(n,s);var o=Uo(n,r);i&&o&&(e.rangeCount!==1||e.anchorNode!==i.node||e.anchorOffset!==i.offset||e.focusNode!==o.node||e.focusOffset!==o.offset)&&(t=t.createRange(),t.setStart(i.node,i.offset),e.removeAllRanges(),s>r?(e.addRange(t),e.extend(o.node,o.offset)):(t.setEnd(o.node,o.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var Kp=at&&"documentMode"in document&&11>=document.documentMode,nn=null,Os=null,Gn=null,Fs=!1;function Vo(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Fs||nn==null||nn!==Xr(r)||(r=nn,"selectionStart"in r&&Fl(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Gn&&lr(Gn,r)||(Gn=r,r=ii(Os,"onSelect"),0<r.length&&(t=new Il("onSelect","select",null,t,n),e.push({event:t,listeners:r}),t.target=nn)))}function Tr(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var rn={animationend:Tr("Animation","AnimationEnd"),animationiteration:Tr("Animation","AnimationIteration"),animationstart:Tr("Animation","AnimationStart"),transitionend:Tr("Transition","TransitionEnd")},Zi={},Du={};at&&(Du=document.createElement("div").style,"AnimationEvent"in window||(delete rn.animationend.animation,delete rn.animationiteration.animation,delete rn.animationstart.animation),"TransitionEvent"in window||delete rn.transitionend.transition);function Ti(e){if(Zi[e])return Zi[e];if(!rn[e])return e;var t=rn[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Du)return Zi[e]=t[n];return e}var $u=Ti("animationend"),Uu=Ti("animationiteration"),Vu=Ti("animationstart"),Bu=Ti("transitionend"),Hu=new Map,Bo="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Mt(e,t){Hu.set(e,t),Yt(t,[e])}for(var es=0;es<Bo.length;es++){var ts=Bo[es],Yp=ts.toLowerCase(),qp=ts[0].toUpperCase()+ts.slice(1);Mt(Yp,"on"+qp)}Mt($u,"onAnimationEnd");Mt(Uu,"onAnimationIteration");Mt(Vu,"onAnimationStart");Mt("dblclick","onDoubleClick");Mt("focusin","onFocus");Mt("focusout","onBlur");Mt(Bu,"onTransitionEnd");wn("onMouseEnter",["mouseout","mouseover"]);wn("onMouseLeave",["mouseout","mouseover"]);wn("onPointerEnter",["pointerout","pointerover"]);wn("onPointerLeave",["pointerout","pointerover"]);Yt("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Yt("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Yt("onBeforeInput",["compositionend","keypress","textInput","paste"]);Yt("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Yt("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Yt("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Vn="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),Xp=new Set("cancel close invalid load scroll toggle".split(" ").concat(Vn));function Ho(e,t,n){var r=e.type||"unknown-event";e.currentTarget=n,Yd(r,t,void 0,e),e.currentTarget=null}function Wu(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var r=e[n],i=r.event;r=r.listeners;e:{var s=void 0;if(t)for(var o=r.length-1;0<=o;o--){var a=r[o],u=a.instance,d=a.currentTarget;if(a=a.listener,u!==s&&i.isPropagationStopped())break e;Ho(i,a,d),s=u}else for(o=0;o<r.length;o++){if(a=r[o],u=a.instance,d=a.currentTarget,a=a.listener,u!==s&&i.isPropagationStopped())break e;Ho(i,a,d),s=u}}}if(Zr)throw e=_s,Zr=!1,_s=null,e}function X(e,t){var n=t[Vs];n===void 0&&(n=t[Vs]=new Set);var r=e+"__bubble";n.has(r)||(Qu(t,e,2,!1),n.add(r))}function ns(e,t,n){var r=0;t&&(r|=4),Qu(n,e,r,t)}var Pr="_reactListening"+Math.random().toString(36).slice(2);function or(e){if(!e[Pr]){e[Pr]=!0,Za.forEach(function(n){n!=="selectionchange"&&(Xp.has(n)||ns(n,!1,e),ns(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Pr]||(t[Pr]=!0,ns("selectionchange",!1,t))}}function Qu(e,t,n,r){switch(Tu(t)){case 1:var i=dp;break;case 4:i=pp;break;default:i=_l}n=i.bind(null,t,n,e),i=void 0,!Ls||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(i=!0),r?i!==void 0?e.addEventListener(t,n,{capture:!0,passive:i}):e.addEventListener(t,n,!0):i!==void 0?e.addEventListener(t,n,{passive:i}):e.addEventListener(t,n,!1)}function rs(e,t,n,r,i){var s=r;if(!(t&1)&&!(t&2)&&r!==null)e:for(;;){if(r===null)return;var o=r.tag;if(o===3||o===4){var a=r.stateNode.containerInfo;if(a===i||a.nodeType===8&&a.parentNode===i)break;if(o===4)for(o=r.return;o!==null;){var u=o.tag;if((u===3||u===4)&&(u=o.stateNode.containerInfo,u===i||u.nodeType===8&&u.parentNode===i))return;o=o.return}for(;a!==null;){if(o=Dt(a),o===null)return;if(u=o.tag,u===5||u===6){r=s=o;continue e}a=a.parentNode}}r=r.return}hu(function(){var d=s,x=bl(n),h=[];e:{var g=Hu.get(e);if(g!==void 0){var w=Il,k=e;switch(e){case"keypress":if(Vr(n)===0)break e;case"keydown":case"keyup":w=Ep;break;case"focusin":k="focus",w=qi;break;case"focusout":k="blur",w=qi;break;case"beforeblur":case"afterblur":w=qi;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":w=_o;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":w=hp;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":w=Pp;break;case $u:case Uu:case Vu:w=yp;break;case Bu:w=_p;break;case"scroll":w=fp;break;case"wheel":w=Ip;break;case"copy":case"cut":case"paste":w=wp;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":w=Io}var j=(t&4)!==0,M=!j&&e==="scroll",p=j?g!==null?g+"Capture":null:g;j=[];for(var c=d,m;c!==null;){m=c;var y=m.stateNode;if(m.tag===5&&y!==null&&(m=y,p!==null&&(y=tr(c,p),y!=null&&j.push(ar(c,y,m)))),M)break;c=c.return}0<j.length&&(g=new w(g,k,null,n,x),h.push({event:g,listeners:j}))}}if(!(t&7)){e:{if(g=e==="mouseover"||e==="pointerover",w=e==="mouseout"||e==="pointerout",g&&n!==Ts&&(k=n.relatedTarget||n.fromElement)&&(Dt(k)||k[ut]))break e;if((w||g)&&(g=x.window===x?x:(g=x.ownerDocument)?g.defaultView||g.parentWindow:window,w?(k=n.relatedTarget||n.toElement,w=d,k=k?Dt(k):null,k!==null&&(M=qt(k),k!==M||k.tag!==5&&k.tag!==6)&&(k=null)):(w=null,k=d),w!==k)){if(j=_o,y="onMouseLeave",p="onMouseEnter",c="mouse",(e==="pointerout"||e==="pointerover")&&(j=Io,y="onPointerLeave",p="onPointerEnter",c="pointer"),M=w==null?g:sn(w),m=k==null?g:sn(k),g=new j(y,c+"leave",w,n,x),g.target=M,g.relatedTarget=m,y=null,Dt(x)===d&&(j=new j(p,c+"enter",k,n,x),j.target=m,j.relatedTarget=M,y=j),M=y,w&&k)t:{for(j=w,p=k,c=0,m=j;m;m=Xt(m))c++;for(m=0,y=p;y;y=Xt(y))m++;for(;0<c-m;)j=Xt(j),c--;for(;0<m-c;)p=Xt(p),m--;for(;c--;){if(j===p||p!==null&&j===p.alternate)break t;j=Xt(j),p=Xt(p)}j=null}else j=null;w!==null&&Wo(h,g,w,j,!1),k!==null&&M!==null&&Wo(h,M,k,j,!0)}}e:{if(g=d?sn(d):window,w=g.nodeName&&g.nodeName.toLowerCase(),w==="select"||w==="input"&&g.type==="file")var C=Up;else if(Fo(g))if(Ru)C=Wp;else{C=Bp;var P=Vp}else(w=g.nodeName)&&w.toLowerCase()==="input"&&(g.type==="checkbox"||g.type==="radio")&&(C=Hp);if(C&&(C=C(e,d))){Iu(h,C,n,x);break e}P&&P(e,g,d),e==="focusout"&&(P=g._wrapperState)&&P.controlled&&g.type==="number"&&Ns(g,"number",g.value)}switch(P=d?sn(d):window,e){case"focusin":(Fo(P)||P.contentEditable==="true")&&(nn=P,Os=d,Gn=null);break;case"focusout":Gn=Os=nn=null;break;case"mousedown":Fs=!0;break;case"contextmenu":case"mouseup":case"dragend":Fs=!1,Vo(h,n,x);break;case"selectionchange":if(Kp)break;case"keydown":case"keyup":Vo(h,n,x)}var L;if(Ol)e:{switch(e){case"compositionstart":var z="onCompositionStart";break e;case"compositionend":z="onCompositionEnd";break e;case"compositionupdate":z="onCompositionUpdate";break e}z=void 0}else tn?_u(e,n)&&(z="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(z="onCompositionStart");z&&(Lu&&n.locale!=="ko"&&(tn||z!=="onCompositionStart"?z==="onCompositionEnd"&&tn&&(L=Pu()):(wt=x,Ml="value"in wt?wt.value:wt.textContent,tn=!0)),P=ii(d,z),0<P.length&&(z=new Mo(z,e,null,n,x),h.push({event:z,listeners:P}),L?z.data=L:(L=Mu(n),L!==null&&(z.data=L)))),(L=Op?Fp(e,n):Ap(e,n))&&(d=ii(d,"onBeforeInput"),0<d.length&&(x=new Mo("onBeforeInput","beforeinput",null,n,x),h.push({event:x,listeners:d}),x.data=L))}Wu(h,t)})}function ar(e,t,n){return{instance:e,listener:t,currentTarget:n}}function ii(e,t){for(var n=t+"Capture",r=[];e!==null;){var i=e,s=i.stateNode;i.tag===5&&s!==null&&(i=s,s=tr(e,n),s!=null&&r.unshift(ar(e,s,i)),s=tr(e,t),s!=null&&r.push(ar(e,s,i))),e=e.return}return r}function Xt(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function Wo(e,t,n,r,i){for(var s=t._reactName,o=[];n!==null&&n!==r;){var a=n,u=a.alternate,d=a.stateNode;if(u!==null&&u===r)break;a.tag===5&&d!==null&&(a=d,i?(u=tr(n,s),u!=null&&o.unshift(ar(n,u,a))):i||(u=tr(n,s),u!=null&&o.push(ar(n,u,a)))),n=n.return}o.length!==0&&e.push({event:t,listeners:o})}var Jp=/\r\n?/g,Zp=/\u0000|\uFFFD/g;function Qo(e){return(typeof e=="string"?e:""+e).replace(Jp,`
`).replace(Zp,"")}function Lr(e,t,n){if(t=Qo(t),Qo(e)!==t&&n)throw Error(T(425))}function si(){}var As=null,Ds=null;function $s(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Us=typeof setTimeout=="function"?setTimeout:void 0,ef=typeof clearTimeout=="function"?clearTimeout:void 0,Go=typeof Promise=="function"?Promise:void 0,tf=typeof queueMicrotask=="function"?queueMicrotask:typeof Go<"u"?function(e){return Go.resolve(null).then(e).catch(nf)}:Us;function nf(e){setTimeout(function(){throw e})}function is(e,t){var n=t,r=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(r===0){e.removeChild(i),ir(t);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=i}while(n);ir(t)}function Ct(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function Ko(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var Pn=Math.random().toString(36).slice(2),Je="__reactFiber$"+Pn,ur="__reactProps$"+Pn,ut="__reactContainer$"+Pn,Vs="__reactEvents$"+Pn,rf="__reactListeners$"+Pn,sf="__reactHandles$"+Pn;function Dt(e){var t=e[Je];if(t)return t;for(var n=e.parentNode;n;){if(t=n[ut]||n[Je]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=Ko(e);e!==null;){if(n=e[Je])return n;e=Ko(e)}return t}e=n,n=e.parentNode}return null}function xr(e){return e=e[Je]||e[ut],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function sn(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(T(33))}function Pi(e){return e[ur]||null}var Bs=[],ln=-1;function It(e){return{current:e}}function J(e){0>ln||(e.current=Bs[ln],Bs[ln]=null,ln--)}function q(e,t){ln++,Bs[ln]=e.current,e.current=t}var _t={},we=It(_t),Ee=It(!1),Ht=_t;function kn(e,t){var n=e.type.contextTypes;if(!n)return _t;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var i={},s;for(s in n)i[s]=t[s];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=i),i}function be(e){return e=e.childContextTypes,e!=null}function li(){J(Ee),J(we)}function Yo(e,t,n){if(we.current!==_t)throw Error(T(168));q(we,t),q(Ee,n)}function Gu(e,t,n){var r=e.stateNode;if(t=t.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var i in r)if(!(i in t))throw Error(T(108,Vd(e)||"Unknown",i));return ie({},n,r)}function oi(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||_t,Ht=we.current,q(we,e),q(Ee,Ee.current),!0}function qo(e,t,n){var r=e.stateNode;if(!r)throw Error(T(169));n?(e=Gu(e,t,Ht),r.__reactInternalMemoizedMergedChildContext=e,J(Ee),J(we),q(we,e)):J(Ee),q(Ee,n)}var it=null,Li=!1,ss=!1;function Ku(e){it===null?it=[e]:it.push(e)}function lf(e){Li=!0,Ku(e)}function Rt(){if(!ss&&it!==null){ss=!0;var e=0,t=Y;try{var n=it;for(Y=1;e<n.length;e++){var r=n[e];do r=r(!0);while(r!==null)}it=null,Li=!1}catch(i){throw it!==null&&(it=it.slice(e+1)),xu(Tl,Rt),i}finally{Y=t,ss=!1}}return null}var on=[],an=0,ai=null,ui=0,Oe=[],Fe=0,Wt=null,st=1,lt="";function Ft(e,t){on[an++]=ui,on[an++]=ai,ai=e,ui=t}function Yu(e,t,n){Oe[Fe++]=st,Oe[Fe++]=lt,Oe[Fe++]=Wt,Wt=e;var r=st;e=lt;var i=32-Ge(r)-1;r&=~(1<<i),n+=1;var s=32-Ge(t)+i;if(30<s){var o=i-i%5;s=(r&(1<<o)-1).toString(32),r>>=o,i-=o,st=1<<32-Ge(t)+i|n<<i|r,lt=s+e}else st=1<<s|n<<i|r,lt=e}function Al(e){e.return!==null&&(Ft(e,1),Yu(e,1,0))}function Dl(e){for(;e===ai;)ai=on[--an],on[an]=null,ui=on[--an],on[an]=null;for(;e===Wt;)Wt=Oe[--Fe],Oe[Fe]=null,lt=Oe[--Fe],Oe[Fe]=null,st=Oe[--Fe],Oe[Fe]=null}var _e=null,Le=null,ee=!1,Qe=null;function qu(e,t){var n=Ae(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function Xo(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,_e=e,Le=Ct(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,_e=e,Le=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=Wt!==null?{id:st,overflow:lt}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=Ae(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,_e=e,Le=null,!0):!1;default:return!1}}function Hs(e){return(e.mode&1)!==0&&(e.flags&128)===0}function Ws(e){if(ee){var t=Le;if(t){var n=t;if(!Xo(e,t)){if(Hs(e))throw Error(T(418));t=Ct(n.nextSibling);var r=_e;t&&Xo(e,t)?qu(r,n):(e.flags=e.flags&-4097|2,ee=!1,_e=e)}}else{if(Hs(e))throw Error(T(418));e.flags=e.flags&-4097|2,ee=!1,_e=e}}}function Jo(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;_e=e}function _r(e){if(e!==_e)return!1;if(!ee)return Jo(e),ee=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!$s(e.type,e.memoizedProps)),t&&(t=Le)){if(Hs(e))throw Xu(),Error(T(418));for(;t;)qu(e,t),t=Ct(t.nextSibling)}if(Jo(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(T(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){Le=Ct(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}Le=null}}else Le=_e?Ct(e.stateNode.nextSibling):null;return!0}function Xu(){for(var e=Le;e;)e=Ct(e.nextSibling)}function Sn(){Le=_e=null,ee=!1}function $l(e){Qe===null?Qe=[e]:Qe.push(e)}var of=pt.ReactCurrentBatchConfig;function On(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(T(309));var r=n.stateNode}if(!r)throw Error(T(147,e));var i=r,s=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===s?t.ref:(t=function(o){var a=i.refs;o===null?delete a[s]:a[s]=o},t._stringRef=s,t)}if(typeof e!="string")throw Error(T(284));if(!n._owner)throw Error(T(290,e))}return e}function Mr(e,t){throw e=Object.prototype.toString.call(t),Error(T(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function Zo(e){var t=e._init;return t(e._payload)}function Ju(e){function t(p,c){if(e){var m=p.deletions;m===null?(p.deletions=[c],p.flags|=16):m.push(c)}}function n(p,c){if(!e)return null;for(;c!==null;)t(p,c),c=c.sibling;return null}function r(p,c){for(p=new Map;c!==null;)c.key!==null?p.set(c.key,c):p.set(c.index,c),c=c.sibling;return p}function i(p,c){return p=Tt(p,c),p.index=0,p.sibling=null,p}function s(p,c,m){return p.index=m,e?(m=p.alternate,m!==null?(m=m.index,m<c?(p.flags|=2,c):m):(p.flags|=2,c)):(p.flags|=1048576,c)}function o(p){return e&&p.alternate===null&&(p.flags|=2),p}function a(p,c,m,y){return c===null||c.tag!==6?(c=ps(m,p.mode,y),c.return=p,c):(c=i(c,m),c.return=p,c)}function u(p,c,m,y){var C=m.type;return C===en?x(p,c,m.props.children,y,m.key):c!==null&&(c.elementType===C||typeof C=="object"&&C!==null&&C.$$typeof===gt&&Zo(C)===c.type)?(y=i(c,m.props),y.ref=On(p,c,m),y.return=p,y):(y=Yr(m.type,m.key,m.props,null,p.mode,y),y.ref=On(p,c,m),y.return=p,y)}function d(p,c,m,y){return c===null||c.tag!==4||c.stateNode.containerInfo!==m.containerInfo||c.stateNode.implementation!==m.implementation?(c=fs(m,p.mode,y),c.return=p,c):(c=i(c,m.children||[]),c.return=p,c)}function x(p,c,m,y,C){return c===null||c.tag!==7?(c=Bt(m,p.mode,y,C),c.return=p,c):(c=i(c,m),c.return=p,c)}function h(p,c,m){if(typeof c=="string"&&c!==""||typeof c=="number")return c=ps(""+c,p.mode,m),c.return=p,c;if(typeof c=="object"&&c!==null){switch(c.$$typeof){case Sr:return m=Yr(c.type,c.key,c.props,null,p.mode,m),m.ref=On(p,null,c),m.return=p,m;case Zt:return c=fs(c,p.mode,m),c.return=p,c;case gt:var y=c._init;return h(p,y(c._payload),m)}if($n(c)||Ln(c))return c=Bt(c,p.mode,m,null),c.return=p,c;Mr(p,c)}return null}function g(p,c,m,y){var C=c!==null?c.key:null;if(typeof m=="string"&&m!==""||typeof m=="number")return C!==null?null:a(p,c,""+m,y);if(typeof m=="object"&&m!==null){switch(m.$$typeof){case Sr:return m.key===C?u(p,c,m,y):null;case Zt:return m.key===C?d(p,c,m,y):null;case gt:return C=m._init,g(p,c,C(m._payload),y)}if($n(m)||Ln(m))return C!==null?null:x(p,c,m,y,null);Mr(p,m)}return null}function w(p,c,m,y,C){if(typeof y=="string"&&y!==""||typeof y=="number")return p=p.get(m)||null,a(c,p,""+y,C);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Sr:return p=p.get(y.key===null?m:y.key)||null,u(c,p,y,C);case Zt:return p=p.get(y.key===null?m:y.key)||null,d(c,p,y,C);case gt:var P=y._init;return w(p,c,m,P(y._payload),C)}if($n(y)||Ln(y))return p=p.get(m)||null,x(c,p,y,C,null);Mr(c,y)}return null}function k(p,c,m,y){for(var C=null,P=null,L=c,z=c=0,O=null;L!==null&&z<m.length;z++){L.index>z?(O=L,L=null):O=L.sibling;var I=g(p,L,m[z],y);if(I===null){L===null&&(L=O);break}e&&L&&I.alternate===null&&t(p,L),c=s(I,c,z),P===null?C=I:P.sibling=I,P=I,L=O}if(z===m.length)return n(p,L),ee&&Ft(p,z),C;if(L===null){for(;z<m.length;z++)L=h(p,m[z],y),L!==null&&(c=s(L,c,z),P===null?C=L:P.sibling=L,P=L);return ee&&Ft(p,z),C}for(L=r(p,L);z<m.length;z++)O=w(L,p,z,m[z],y),O!==null&&(e&&O.alternate!==null&&L.delete(O.key===null?z:O.key),c=s(O,c,z),P===null?C=O:P.sibling=O,P=O);return e&&L.forEach(function(W){return t(p,W)}),ee&&Ft(p,z),C}function j(p,c,m,y){var C=Ln(m);if(typeof C!="function")throw Error(T(150));if(m=C.call(m),m==null)throw Error(T(151));for(var P=C=null,L=c,z=c=0,O=null,I=m.next();L!==null&&!I.done;z++,I=m.next()){L.index>z?(O=L,L=null):O=L.sibling;var W=g(p,L,I.value,y);if(W===null){L===null&&(L=O);break}e&&L&&W.alternate===null&&t(p,L),c=s(W,c,z),P===null?C=W:P.sibling=W,P=W,L=O}if(I.done)return n(p,L),ee&&Ft(p,z),C;if(L===null){for(;!I.done;z++,I=m.next())I=h(p,I.value,y),I!==null&&(c=s(I,c,z),P===null?C=I:P.sibling=I,P=I);return ee&&Ft(p,z),C}for(L=r(p,L);!I.done;z++,I=m.next())I=w(L,p,z,I.value,y),I!==null&&(e&&I.alternate!==null&&L.delete(I.key===null?z:I.key),c=s(I,c,z),P===null?C=I:P.sibling=I,P=I);return e&&L.forEach(function(D){return t(p,D)}),ee&&Ft(p,z),C}function M(p,c,m,y){if(typeof m=="object"&&m!==null&&m.type===en&&m.key===null&&(m=m.props.children),typeof m=="object"&&m!==null){switch(m.$$typeof){case Sr:e:{for(var C=m.key,P=c;P!==null;){if(P.key===C){if(C=m.type,C===en){if(P.tag===7){n(p,P.sibling),c=i(P,m.props.children),c.return=p,p=c;break e}}else if(P.elementType===C||typeof C=="object"&&C!==null&&C.$$typeof===gt&&Zo(C)===P.type){n(p,P.sibling),c=i(P,m.props),c.ref=On(p,P,m),c.return=p,p=c;break e}n(p,P);break}else t(p,P);P=P.sibling}m.type===en?(c=Bt(m.props.children,p.mode,y,m.key),c.return=p,p=c):(y=Yr(m.type,m.key,m.props,null,p.mode,y),y.ref=On(p,c,m),y.return=p,p=y)}return o(p);case Zt:e:{for(P=m.key;c!==null;){if(c.key===P)if(c.tag===4&&c.stateNode.containerInfo===m.containerInfo&&c.stateNode.implementation===m.implementation){n(p,c.sibling),c=i(c,m.children||[]),c.return=p,p=c;break e}else{n(p,c);break}else t(p,c);c=c.sibling}c=fs(m,p.mode,y),c.return=p,p=c}return o(p);case gt:return P=m._init,M(p,c,P(m._payload),y)}if($n(m))return k(p,c,m,y);if(Ln(m))return j(p,c,m,y);Mr(p,m)}return typeof m=="string"&&m!==""||typeof m=="number"?(m=""+m,c!==null&&c.tag===6?(n(p,c.sibling),c=i(c,m),c.return=p,p=c):(n(p,c),c=ps(m,p.mode,y),c.return=p,p=c),o(p)):n(p,c)}return M}var jn=Ju(!0),Zu=Ju(!1),ci=It(null),di=null,un=null,Ul=null;function Vl(){Ul=un=di=null}function Bl(e){var t=ci.current;J(ci),e._currentValue=t}function Qs(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,r!==null&&(r.childLanes|=t)):r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t),e===n)break;e=e.return}}function gn(e,t){di=e,Ul=un=null,e=e.dependencies,e!==null&&e.firstContext!==null&&(e.lanes&t&&(ze=!0),e.firstContext=null)}function $e(e){var t=e._currentValue;if(Ul!==e)if(e={context:e,memoizedValue:t,next:null},un===null){if(di===null)throw Error(T(308));un=e,di.dependencies={lanes:0,firstContext:e}}else un=un.next=e;return t}var $t=null;function Hl(e){$t===null?$t=[e]:$t.push(e)}function ec(e,t,n,r){var i=t.interleaved;return i===null?(n.next=n,Hl(t)):(n.next=i.next,i.next=n),t.interleaved=n,ct(e,r)}function ct(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var vt=!1;function Wl(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function tc(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function ot(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function zt(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,G&2){var i=r.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),r.pending=t,ct(e,n)}return i=r.interleaved,i===null?(t.next=t,Hl(r)):(t.next=i.next,i.next=t),r.interleaved=t,ct(e,n)}function Br(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Pl(e,n)}}function ea(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var o={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?i=s=o:s=s.next=o,n=n.next}while(n!==null);s===null?i=s=t:s=s.next=t}else i=s=t;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:s,shared:r.shared,effects:r.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function pi(e,t,n,r){var i=e.updateQueue;vt=!1;var s=i.firstBaseUpdate,o=i.lastBaseUpdate,a=i.shared.pending;if(a!==null){i.shared.pending=null;var u=a,d=u.next;u.next=null,o===null?s=d:o.next=d,o=u;var x=e.alternate;x!==null&&(x=x.updateQueue,a=x.lastBaseUpdate,a!==o&&(a===null?x.firstBaseUpdate=d:a.next=d,x.lastBaseUpdate=u))}if(s!==null){var h=i.baseState;o=0,x=d=u=null,a=s;do{var g=a.lane,w=a.eventTime;if((r&g)===g){x!==null&&(x=x.next={eventTime:w,lane:0,tag:a.tag,payload:a.payload,callback:a.callback,next:null});e:{var k=e,j=a;switch(g=t,w=n,j.tag){case 1:if(k=j.payload,typeof k=="function"){h=k.call(w,h,g);break e}h=k;break e;case 3:k.flags=k.flags&-65537|128;case 0:if(k=j.payload,g=typeof k=="function"?k.call(w,h,g):k,g==null)break e;h=ie({},h,g);break e;case 2:vt=!0}}a.callback!==null&&a.lane!==0&&(e.flags|=64,g=i.effects,g===null?i.effects=[a]:g.push(a))}else w={eventTime:w,lane:g,tag:a.tag,payload:a.payload,callback:a.callback,next:null},x===null?(d=x=w,u=h):x=x.next=w,o|=g;if(a=a.next,a===null){if(a=i.shared.pending,a===null)break;g=a,a=g.next,g.next=null,i.lastBaseUpdate=g,i.shared.pending=null}}while(!0);if(x===null&&(u=h),i.baseState=u,i.firstBaseUpdate=d,i.lastBaseUpdate=x,t=i.shared.interleaved,t!==null){i=t;do o|=i.lane,i=i.next;while(i!==t)}else s===null&&(i.shared.lanes=0);Gt|=o,e.lanes=o,e.memoizedState=h}}function ta(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],i=r.callback;if(i!==null){if(r.callback=null,r=n,typeof i!="function")throw Error(T(191,i));i.call(r)}}}var wr={},et=It(wr),cr=It(wr),dr=It(wr);function Ut(e){if(e===wr)throw Error(T(174));return e}function Ql(e,t){switch(q(dr,t),q(cr,e),q(et,wr),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:zs(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=zs(t,e)}J(et),q(et,t)}function Nn(){J(et),J(cr),J(dr)}function nc(e){Ut(dr.current);var t=Ut(et.current),n=zs(t,e.type);t!==n&&(q(cr,e),q(et,n))}function Gl(e){cr.current===e&&(J(et),J(cr))}var ne=It(0);function fi(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var ls=[];function Kl(){for(var e=0;e<ls.length;e++)ls[e]._workInProgressVersionPrimary=null;ls.length=0}var Hr=pt.ReactCurrentDispatcher,os=pt.ReactCurrentBatchConfig,Qt=0,re=null,ae=null,ce=null,mi=!1,Kn=!1,pr=0,af=0;function ve(){throw Error(T(321))}function Yl(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Ye(e[n],t[n]))return!1;return!0}function ql(e,t,n,r,i,s){if(Qt=s,re=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Hr.current=e===null||e.memoizedState===null?pf:ff,e=n(r,i),Kn){s=0;do{if(Kn=!1,pr=0,25<=s)throw Error(T(301));s+=1,ce=ae=null,t.updateQueue=null,Hr.current=mf,e=n(r,i)}while(Kn)}if(Hr.current=hi,t=ae!==null&&ae.next!==null,Qt=0,ce=ae=re=null,mi=!1,t)throw Error(T(300));return e}function Xl(){var e=pr!==0;return pr=0,e}function Xe(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return ce===null?re.memoizedState=ce=e:ce=ce.next=e,ce}function Ue(){if(ae===null){var e=re.alternate;e=e!==null?e.memoizedState:null}else e=ae.next;var t=ce===null?re.memoizedState:ce.next;if(t!==null)ce=t,ae=e;else{if(e===null)throw Error(T(310));ae=e,e={memoizedState:ae.memoizedState,baseState:ae.baseState,baseQueue:ae.baseQueue,queue:ae.queue,next:null},ce===null?re.memoizedState=ce=e:ce=ce.next=e}return ce}function fr(e,t){return typeof t=="function"?t(e):t}function as(e){var t=Ue(),n=t.queue;if(n===null)throw Error(T(311));n.lastRenderedReducer=e;var r=ae,i=r.baseQueue,s=n.pending;if(s!==null){if(i!==null){var o=i.next;i.next=s.next,s.next=o}r.baseQueue=i=s,n.pending=null}if(i!==null){s=i.next,r=r.baseState;var a=o=null,u=null,d=s;do{var x=d.lane;if((Qt&x)===x)u!==null&&(u=u.next={lane:0,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null}),r=d.hasEagerState?d.eagerState:e(r,d.action);else{var h={lane:x,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null};u===null?(a=u=h,o=r):u=u.next=h,re.lanes|=x,Gt|=x}d=d.next}while(d!==null&&d!==s);u===null?o=r:u.next=a,Ye(r,t.memoizedState)||(ze=!0),t.memoizedState=r,t.baseState=o,t.baseQueue=u,n.lastRenderedState=r}if(e=n.interleaved,e!==null){i=e;do s=i.lane,re.lanes|=s,Gt|=s,i=i.next;while(i!==e)}else i===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function us(e){var t=Ue(),n=t.queue;if(n===null)throw Error(T(311));n.lastRenderedReducer=e;var r=n.dispatch,i=n.pending,s=t.memoizedState;if(i!==null){n.pending=null;var o=i=i.next;do s=e(s,o.action),o=o.next;while(o!==i);Ye(s,t.memoizedState)||(ze=!0),t.memoizedState=s,t.baseQueue===null&&(t.baseState=s),n.lastRenderedState=s}return[s,r]}function rc(){}function ic(e,t){var n=re,r=Ue(),i=t(),s=!Ye(r.memoizedState,i);if(s&&(r.memoizedState=i,ze=!0),r=r.queue,Jl(oc.bind(null,n,r,e),[e]),r.getSnapshot!==t||s||ce!==null&&ce.memoizedState.tag&1){if(n.flags|=2048,mr(9,lc.bind(null,n,r,i,t),void 0,null),de===null)throw Error(T(349));Qt&30||sc(n,t,i)}return i}function sc(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=re.updateQueue,t===null?(t={lastEffect:null,stores:null},re.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function lc(e,t,n,r){t.value=n,t.getSnapshot=r,ac(t)&&uc(e)}function oc(e,t,n){return n(function(){ac(t)&&uc(e)})}function ac(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Ye(e,n)}catch{return!0}}function uc(e){var t=ct(e,1);t!==null&&Ke(t,e,1,-1)}function na(e){var t=Xe();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:fr,lastRenderedState:e},t.queue=e,e=e.dispatch=df.bind(null,re,e),[t.memoizedState,e]}function mr(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=re.updateQueue,t===null?(t={lastEffect:null,stores:null},re.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}function cc(){return Ue().memoizedState}function Wr(e,t,n,r){var i=Xe();re.flags|=e,i.memoizedState=mr(1|t,n,void 0,r===void 0?null:r)}function _i(e,t,n,r){var i=Ue();r=r===void 0?null:r;var s=void 0;if(ae!==null){var o=ae.memoizedState;if(s=o.destroy,r!==null&&Yl(r,o.deps)){i.memoizedState=mr(t,n,s,r);return}}re.flags|=e,i.memoizedState=mr(1|t,n,s,r)}function ra(e,t){return Wr(8390656,8,e,t)}function Jl(e,t){return _i(2048,8,e,t)}function dc(e,t){return _i(4,2,e,t)}function pc(e,t){return _i(4,4,e,t)}function fc(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function mc(e,t,n){return n=n!=null?n.concat([e]):null,_i(4,4,fc.bind(null,t,e),n)}function Zl(){}function hc(e,t){var n=Ue();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&Yl(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function gc(e,t){var n=Ue();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&Yl(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}function vc(e,t,n){return Qt&21?(Ye(n,t)||(n=Su(),re.lanes|=n,Gt|=n,e.baseState=!0),t):(e.baseState&&(e.baseState=!1,ze=!0),e.memoizedState=n)}function uf(e,t){var n=Y;Y=n!==0&&4>n?n:4,e(!0);var r=os.transition;os.transition={};try{e(!1),t()}finally{Y=n,os.transition=r}}function yc(){return Ue().memoizedState}function cf(e,t,n){var r=bt(e);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},xc(e))wc(t,n);else if(n=ec(e,t,n,r),n!==null){var i=Se();Ke(n,e,r,i),kc(n,t,r)}}function df(e,t,n){var r=bt(e),i={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(xc(e))wc(t,i);else{var s=e.alternate;if(e.lanes===0&&(s===null||s.lanes===0)&&(s=t.lastRenderedReducer,s!==null))try{var o=t.lastRenderedState,a=s(o,n);if(i.hasEagerState=!0,i.eagerState=a,Ye(a,o)){var u=t.interleaved;u===null?(i.next=i,Hl(t)):(i.next=u.next,u.next=i),t.interleaved=i;return}}catch{}finally{}n=ec(e,t,i,r),n!==null&&(i=Se(),Ke(n,e,r,i),kc(n,t,r))}}function xc(e){var t=e.alternate;return e===re||t!==null&&t===re}function wc(e,t){Kn=mi=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function kc(e,t,n){if(n&4194240){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Pl(e,n)}}var hi={readContext:$e,useCallback:ve,useContext:ve,useEffect:ve,useImperativeHandle:ve,useInsertionEffect:ve,useLayoutEffect:ve,useMemo:ve,useReducer:ve,useRef:ve,useState:ve,useDebugValue:ve,useDeferredValue:ve,useTransition:ve,useMutableSource:ve,useSyncExternalStore:ve,useId:ve,unstable_isNewReconciler:!1},pf={readContext:$e,useCallback:function(e,t){return Xe().memoizedState=[e,t===void 0?null:t],e},useContext:$e,useEffect:ra,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,Wr(4194308,4,fc.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Wr(4194308,4,e,t)},useInsertionEffect:function(e,t){return Wr(4,2,e,t)},useMemo:function(e,t){var n=Xe();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var r=Xe();return t=n!==void 0?n(t):t,r.memoizedState=r.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},r.queue=e,e=e.dispatch=cf.bind(null,re,e),[r.memoizedState,e]},useRef:function(e){var t=Xe();return e={current:e},t.memoizedState=e},useState:na,useDebugValue:Zl,useDeferredValue:function(e){return Xe().memoizedState=e},useTransition:function(){var e=na(!1),t=e[0];return e=uf.bind(null,e[1]),Xe().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var r=re,i=Xe();if(ee){if(n===void 0)throw Error(T(407));n=n()}else{if(n=t(),de===null)throw Error(T(349));Qt&30||sc(r,t,n)}i.memoizedState=n;var s={value:n,getSnapshot:t};return i.queue=s,ra(oc.bind(null,r,s,e),[e]),r.flags|=2048,mr(9,lc.bind(null,r,s,n,t),void 0,null),n},useId:function(){var e=Xe(),t=de.identifierPrefix;if(ee){var n=lt,r=st;n=(r&~(1<<32-Ge(r)-1)).toString(32)+n,t=":"+t+"R"+n,n=pr++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=af++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},ff={readContext:$e,useCallback:hc,useContext:$e,useEffect:Jl,useImperativeHandle:mc,useInsertionEffect:dc,useLayoutEffect:pc,useMemo:gc,useReducer:as,useRef:cc,useState:function(){return as(fr)},useDebugValue:Zl,useDeferredValue:function(e){var t=Ue();return vc(t,ae.memoizedState,e)},useTransition:function(){var e=as(fr)[0],t=Ue().memoizedState;return[e,t]},useMutableSource:rc,useSyncExternalStore:ic,useId:yc,unstable_isNewReconciler:!1},mf={readContext:$e,useCallback:hc,useContext:$e,useEffect:Jl,useImperativeHandle:mc,useInsertionEffect:dc,useLayoutEffect:pc,useMemo:gc,useReducer:us,useRef:cc,useState:function(){return us(fr)},useDebugValue:Zl,useDeferredValue:function(e){var t=Ue();return ae===null?t.memoizedState=e:vc(t,ae.memoizedState,e)},useTransition:function(){var e=us(fr)[0],t=Ue().memoizedState;return[e,t]},useMutableSource:rc,useSyncExternalStore:ic,useId:yc,unstable_isNewReconciler:!1};function He(e,t){if(e&&e.defaultProps){t=ie({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function Gs(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:ie({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Mi={isMounted:function(e){return(e=e._reactInternals)?qt(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var r=Se(),i=bt(e),s=ot(r,i);s.payload=t,n!=null&&(s.callback=n),t=zt(e,s,i),t!==null&&(Ke(t,e,i,r),Br(t,e,i))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=Se(),i=bt(e),s=ot(r,i);s.tag=1,s.payload=t,n!=null&&(s.callback=n),t=zt(e,s,i),t!==null&&(Ke(t,e,i,r),Br(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=Se(),r=bt(e),i=ot(n,r);i.tag=2,t!=null&&(i.callback=t),t=zt(e,i,r),t!==null&&(Ke(t,e,r,n),Br(t,e,r))}};function ia(e,t,n,r,i,s,o){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,s,o):t.prototype&&t.prototype.isPureReactComponent?!lr(n,r)||!lr(i,s):!0}function Sc(e,t,n){var r=!1,i=_t,s=t.contextType;return typeof s=="object"&&s!==null?s=$e(s):(i=be(t)?Ht:we.current,r=t.contextTypes,s=(r=r!=null)?kn(e,i):_t),t=new t(n,s),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=Mi,e.stateNode=t,t._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=i,e.__reactInternalMemoizedMaskedChildContext=s),t}function sa(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Mi.enqueueReplaceState(t,t.state,null)}function Ks(e,t,n,r){var i=e.stateNode;i.props=n,i.state=e.memoizedState,i.refs={},Wl(e);var s=t.contextType;typeof s=="object"&&s!==null?i.context=$e(s):(s=be(t)?Ht:we.current,i.context=kn(e,s)),i.state=e.memoizedState,s=t.getDerivedStateFromProps,typeof s=="function"&&(Gs(e,t,s,n),i.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(t=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),t!==i.state&&Mi.enqueueReplaceState(i,i.state,null),pi(e,n,i,r),i.state=e.memoizedState),typeof i.componentDidMount=="function"&&(e.flags|=4194308)}function Cn(e,t){try{var n="",r=t;do n+=Ud(r),r=r.return;while(r);var i=n}catch(s){i=`
Error generating stack: `+s.message+`
`+s.stack}return{value:e,source:t,stack:i,digest:null}}function cs(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function Ys(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var hf=typeof WeakMap=="function"?WeakMap:Map;function jc(e,t,n){n=ot(-1,n),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){vi||(vi=!0,sl=r),Ys(e,t)},n}function Nc(e,t,n){n=ot(-1,n),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var i=t.value;n.payload=function(){return r(i)},n.callback=function(){Ys(e,t)}}var s=e.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){Ys(e,t),typeof r!="function"&&(Et===null?Et=new Set([this]):Et.add(this));var o=t.stack;this.componentDidCatch(t.value,{componentStack:o!==null?o:""})}),n}function la(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new hf;var i=new Set;r.set(t,i)}else i=r.get(t),i===void 0&&(i=new Set,r.set(t,i));i.has(n)||(i.add(n),e=Tf.bind(null,e,t,n),t.then(e,e))}function oa(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function aa(e,t,n,r,i){return e.mode&1?(e.flags|=65536,e.lanes=i,e):(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=ot(-1,1),t.tag=2,zt(n,t,1))),n.lanes|=1),e)}var gf=pt.ReactCurrentOwner,ze=!1;function ke(e,t,n,r){t.child=e===null?Zu(t,null,n,r):jn(t,e.child,n,r)}function ua(e,t,n,r,i){n=n.render;var s=t.ref;return gn(t,i),r=ql(e,t,n,r,s,i),n=Xl(),e!==null&&!ze?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~i,dt(e,t,i)):(ee&&n&&Al(t),t.flags|=1,ke(e,t,r,i),t.child)}function ca(e,t,n,r,i){if(e===null){var s=n.type;return typeof s=="function"&&!oo(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=s,Cc(e,t,s,r,i)):(e=Yr(n.type,null,r,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(s=e.child,!(e.lanes&i)){var o=s.memoizedProps;if(n=n.compare,n=n!==null?n:lr,n(o,r)&&e.ref===t.ref)return dt(e,t,i)}return t.flags|=1,e=Tt(s,r),e.ref=t.ref,e.return=t,t.child=e}function Cc(e,t,n,r,i){if(e!==null){var s=e.memoizedProps;if(lr(s,r)&&e.ref===t.ref)if(ze=!1,t.pendingProps=r=s,(e.lanes&i)!==0)e.flags&131072&&(ze=!0);else return t.lanes=e.lanes,dt(e,t,i)}return qs(e,t,n,r,i)}function zc(e,t,n){var r=t.pendingProps,i=r.children,s=e!==null?e.memoizedState:null;if(r.mode==="hidden")if(!(t.mode&1))t.memoizedState={baseLanes:0,cachePool:null,transitions:null},q(dn,Pe),Pe|=n;else{if(!(n&1073741824))return e=s!==null?s.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,q(dn,Pe),Pe|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=s!==null?s.baseLanes:n,q(dn,Pe),Pe|=r}else s!==null?(r=s.baseLanes|n,t.memoizedState=null):r=n,q(dn,Pe),Pe|=r;return ke(e,t,i,n),t.child}function Ec(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function qs(e,t,n,r,i){var s=be(n)?Ht:we.current;return s=kn(t,s),gn(t,i),n=ql(e,t,n,r,s,i),r=Xl(),e!==null&&!ze?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~i,dt(e,t,i)):(ee&&r&&Al(t),t.flags|=1,ke(e,t,n,i),t.child)}function da(e,t,n,r,i){if(be(n)){var s=!0;oi(t)}else s=!1;if(gn(t,i),t.stateNode===null)Qr(e,t),Sc(t,n,r),Ks(t,n,r,i),r=!0;else if(e===null){var o=t.stateNode,a=t.memoizedProps;o.props=a;var u=o.context,d=n.contextType;typeof d=="object"&&d!==null?d=$e(d):(d=be(n)?Ht:we.current,d=kn(t,d));var x=n.getDerivedStateFromProps,h=typeof x=="function"||typeof o.getSnapshotBeforeUpdate=="function";h||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(a!==r||u!==d)&&sa(t,o,r,d),vt=!1;var g=t.memoizedState;o.state=g,pi(t,r,o,i),u=t.memoizedState,a!==r||g!==u||Ee.current||vt?(typeof x=="function"&&(Gs(t,n,x,r),u=t.memoizedState),(a=vt||ia(t,n,a,r,g,u,d))?(h||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount=="function"&&(t.flags|=4194308)):(typeof o.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=u),o.props=r,o.state=u,o.context=d,r=a):(typeof o.componentDidMount=="function"&&(t.flags|=4194308),r=!1)}else{o=t.stateNode,tc(e,t),a=t.memoizedProps,d=t.type===t.elementType?a:He(t.type,a),o.props=d,h=t.pendingProps,g=o.context,u=n.contextType,typeof u=="object"&&u!==null?u=$e(u):(u=be(n)?Ht:we.current,u=kn(t,u));var w=n.getDerivedStateFromProps;(x=typeof w=="function"||typeof o.getSnapshotBeforeUpdate=="function")||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(a!==h||g!==u)&&sa(t,o,r,u),vt=!1,g=t.memoizedState,o.state=g,pi(t,r,o,i);var k=t.memoizedState;a!==h||g!==k||Ee.current||vt?(typeof w=="function"&&(Gs(t,n,w,r),k=t.memoizedState),(d=vt||ia(t,n,d,r,g,k,u)||!1)?(x||typeof o.UNSAFE_componentWillUpdate!="function"&&typeof o.componentWillUpdate!="function"||(typeof o.componentWillUpdate=="function"&&o.componentWillUpdate(r,k,u),typeof o.UNSAFE_componentWillUpdate=="function"&&o.UNSAFE_componentWillUpdate(r,k,u)),typeof o.componentDidUpdate=="function"&&(t.flags|=4),typeof o.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof o.componentDidUpdate!="function"||a===e.memoizedProps&&g===e.memoizedState||(t.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||a===e.memoizedProps&&g===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=k),o.props=r,o.state=k,o.context=u,r=d):(typeof o.componentDidUpdate!="function"||a===e.memoizedProps&&g===e.memoizedState||(t.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||a===e.memoizedProps&&g===e.memoizedState||(t.flags|=1024),r=!1)}return Xs(e,t,n,r,s,i)}function Xs(e,t,n,r,i,s){Ec(e,t);var o=(t.flags&128)!==0;if(!r&&!o)return i&&qo(t,n,!1),dt(e,t,s);r=t.stateNode,gf.current=t;var a=o&&typeof n.getDerivedStateFromError!="function"?null:r.render();return t.flags|=1,e!==null&&o?(t.child=jn(t,e.child,null,s),t.child=jn(t,null,a,s)):ke(e,t,a,s),t.memoizedState=r.state,i&&qo(t,n,!0),t.child}function bc(e){var t=e.stateNode;t.pendingContext?Yo(e,t.pendingContext,t.pendingContext!==t.context):t.context&&Yo(e,t.context,!1),Ql(e,t.containerInfo)}function pa(e,t,n,r,i){return Sn(),$l(i),t.flags|=256,ke(e,t,n,r),t.child}var Js={dehydrated:null,treeContext:null,retryLane:0};function Zs(e){return{baseLanes:e,cachePool:null,transitions:null}}function Tc(e,t,n){var r=t.pendingProps,i=ne.current,s=!1,o=(t.flags&128)!==0,a;if((a=o)||(a=e!==null&&e.memoizedState===null?!1:(i&2)!==0),a?(s=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(i|=1),q(ne,i&1),e===null)return Ws(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?(t.mode&1?e.data==="$!"?t.lanes=8:t.lanes=1073741824:t.lanes=1,null):(o=r.children,e=r.fallback,s?(r=t.mode,s=t.child,o={mode:"hidden",children:o},!(r&1)&&s!==null?(s.childLanes=0,s.pendingProps=o):s=Oi(o,r,0,null),e=Bt(e,r,n,null),s.return=t,e.return=t,s.sibling=e,t.child=s,t.child.memoizedState=Zs(n),t.memoizedState=Js,e):eo(t,o));if(i=e.memoizedState,i!==null&&(a=i.dehydrated,a!==null))return vf(e,t,o,r,a,i,n);if(s){s=r.fallback,o=t.mode,i=e.child,a=i.sibling;var u={mode:"hidden",children:r.children};return!(o&1)&&t.child!==i?(r=t.child,r.childLanes=0,r.pendingProps=u,t.deletions=null):(r=Tt(i,u),r.subtreeFlags=i.subtreeFlags&14680064),a!==null?s=Tt(a,s):(s=Bt(s,o,n,null),s.flags|=2),s.return=t,r.return=t,r.sibling=s,t.child=r,r=s,s=t.child,o=e.child.memoizedState,o=o===null?Zs(n):{baseLanes:o.baseLanes|n,cachePool:null,transitions:o.transitions},s.memoizedState=o,s.childLanes=e.childLanes&~n,t.memoizedState=Js,r}return s=e.child,e=s.sibling,r=Tt(s,{mode:"visible",children:r.children}),!(t.mode&1)&&(r.lanes=n),r.return=t,r.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=r,t.memoizedState=null,r}function eo(e,t){return t=Oi({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function Ir(e,t,n,r){return r!==null&&$l(r),jn(t,e.child,null,n),e=eo(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function vf(e,t,n,r,i,s,o){if(n)return t.flags&256?(t.flags&=-257,r=cs(Error(T(422))),Ir(e,t,o,r)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(s=r.fallback,i=t.mode,r=Oi({mode:"visible",children:r.children},i,0,null),s=Bt(s,i,o,null),s.flags|=2,r.return=t,s.return=t,r.sibling=s,t.child=r,t.mode&1&&jn(t,e.child,null,o),t.child.memoizedState=Zs(o),t.memoizedState=Js,s);if(!(t.mode&1))return Ir(e,t,o,null);if(i.data==="$!"){if(r=i.nextSibling&&i.nextSibling.dataset,r)var a=r.dgst;return r=a,s=Error(T(419)),r=cs(s,r,void 0),Ir(e,t,o,r)}if(a=(o&e.childLanes)!==0,ze||a){if(r=de,r!==null){switch(o&-o){case 4:i=2;break;case 16:i=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:i=32;break;case 536870912:i=268435456;break;default:i=0}i=i&(r.suspendedLanes|o)?0:i,i!==0&&i!==s.retryLane&&(s.retryLane=i,ct(e,i),Ke(r,e,i,-1))}return lo(),r=cs(Error(T(421))),Ir(e,t,o,r)}return i.data==="$?"?(t.flags|=128,t.child=e.child,t=Pf.bind(null,e),i._reactRetry=t,null):(e=s.treeContext,Le=Ct(i.nextSibling),_e=t,ee=!0,Qe=null,e!==null&&(Oe[Fe++]=st,Oe[Fe++]=lt,Oe[Fe++]=Wt,st=e.id,lt=e.overflow,Wt=t),t=eo(t,r.children),t.flags|=4096,t)}function fa(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),Qs(e.return,t,n)}function ds(e,t,n,r,i){var s=e.memoizedState;s===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i}:(s.isBackwards=t,s.rendering=null,s.renderingStartTime=0,s.last=r,s.tail=n,s.tailMode=i)}function Pc(e,t,n){var r=t.pendingProps,i=r.revealOrder,s=r.tail;if(ke(e,t,r.children,n),r=ne.current,r&2)r=r&1|2,t.flags|=128;else{if(e!==null&&e.flags&128)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&fa(e,n,t);else if(e.tag===19)fa(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(q(ne,r),!(t.mode&1))t.memoizedState=null;else switch(i){case"forwards":for(n=t.child,i=null;n!==null;)e=n.alternate,e!==null&&fi(e)===null&&(i=n),n=n.sibling;n=i,n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),ds(t,!1,i,n,s);break;case"backwards":for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&fi(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}ds(t,!0,n,null,s);break;case"together":ds(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function Qr(e,t){!(t.mode&1)&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function dt(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Gt|=t.lanes,!(n&t.childLanes))return null;if(e!==null&&t.child!==e.child)throw Error(T(153));if(t.child!==null){for(e=t.child,n=Tt(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=Tt(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function yf(e,t,n){switch(t.tag){case 3:bc(t),Sn();break;case 5:nc(t);break;case 1:be(t.type)&&oi(t);break;case 4:Ql(t,t.stateNode.containerInfo);break;case 10:var r=t.type._context,i=t.memoizedProps.value;q(ci,r._currentValue),r._currentValue=i;break;case 13:if(r=t.memoizedState,r!==null)return r.dehydrated!==null?(q(ne,ne.current&1),t.flags|=128,null):n&t.child.childLanes?Tc(e,t,n):(q(ne,ne.current&1),e=dt(e,t,n),e!==null?e.sibling:null);q(ne,ne.current&1);break;case 19:if(r=(n&t.childLanes)!==0,e.flags&128){if(r)return Pc(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),q(ne,ne.current),r)break;return null;case 22:case 23:return t.lanes=0,zc(e,t,n)}return dt(e,t,n)}var Lc,el,_c,Mc;Lc=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};el=function(){};_c=function(e,t,n,r){var i=e.memoizedProps;if(i!==r){e=t.stateNode,Ut(et.current);var s=null;switch(n){case"input":i=Ss(e,i),r=Ss(e,r),s=[];break;case"select":i=ie({},i,{value:void 0}),r=ie({},r,{value:void 0}),s=[];break;case"textarea":i=Cs(e,i),r=Cs(e,r),s=[];break;default:typeof i.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=si)}Es(n,r);var o;n=null;for(d in i)if(!r.hasOwnProperty(d)&&i.hasOwnProperty(d)&&i[d]!=null)if(d==="style"){var a=i[d];for(o in a)a.hasOwnProperty(o)&&(n||(n={}),n[o]="")}else d!=="dangerouslySetInnerHTML"&&d!=="children"&&d!=="suppressContentEditableWarning"&&d!=="suppressHydrationWarning"&&d!=="autoFocus"&&(Zn.hasOwnProperty(d)?s||(s=[]):(s=s||[]).push(d,null));for(d in r){var u=r[d];if(a=i!=null?i[d]:void 0,r.hasOwnProperty(d)&&u!==a&&(u!=null||a!=null))if(d==="style")if(a){for(o in a)!a.hasOwnProperty(o)||u&&u.hasOwnProperty(o)||(n||(n={}),n[o]="");for(o in u)u.hasOwnProperty(o)&&a[o]!==u[o]&&(n||(n={}),n[o]=u[o])}else n||(s||(s=[]),s.push(d,n)),n=u;else d==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,a=a?a.__html:void 0,u!=null&&a!==u&&(s=s||[]).push(d,u)):d==="children"?typeof u!="string"&&typeof u!="number"||(s=s||[]).push(d,""+u):d!=="suppressContentEditableWarning"&&d!=="suppressHydrationWarning"&&(Zn.hasOwnProperty(d)?(u!=null&&d==="onScroll"&&X("scroll",e),s||a===u||(s=[])):(s=s||[]).push(d,u))}n&&(s=s||[]).push("style",n);var d=s;(t.updateQueue=d)&&(t.flags|=4)}};Mc=function(e,t,n,r){n!==r&&(t.flags|=4)};function Fn(e,t){if(!ee)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function ye(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&14680064,r|=i.flags&14680064,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function xf(e,t,n){var r=t.pendingProps;switch(Dl(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return ye(t),null;case 1:return be(t.type)&&li(),ye(t),null;case 3:return r=t.stateNode,Nn(),J(Ee),J(we),Kl(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(_r(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Qe!==null&&(al(Qe),Qe=null))),el(e,t),ye(t),null;case 5:Gl(t);var i=Ut(dr.current);if(n=t.type,e!==null&&t.stateNode!=null)_c(e,t,n,r,i),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!r){if(t.stateNode===null)throw Error(T(166));return ye(t),null}if(e=Ut(et.current),_r(t)){r=t.stateNode,n=t.type;var s=t.memoizedProps;switch(r[Je]=t,r[ur]=s,e=(t.mode&1)!==0,n){case"dialog":X("cancel",r),X("close",r);break;case"iframe":case"object":case"embed":X("load",r);break;case"video":case"audio":for(i=0;i<Vn.length;i++)X(Vn[i],r);break;case"source":X("error",r);break;case"img":case"image":case"link":X("error",r),X("load",r);break;case"details":X("toggle",r);break;case"input":So(r,s),X("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!s.multiple},X("invalid",r);break;case"textarea":No(r,s),X("invalid",r)}Es(n,s),i=null;for(var o in s)if(s.hasOwnProperty(o)){var a=s[o];o==="children"?typeof a=="string"?r.textContent!==a&&(s.suppressHydrationWarning!==!0&&Lr(r.textContent,a,e),i=["children",a]):typeof a=="number"&&r.textContent!==""+a&&(s.suppressHydrationWarning!==!0&&Lr(r.textContent,a,e),i=["children",""+a]):Zn.hasOwnProperty(o)&&a!=null&&o==="onScroll"&&X("scroll",r)}switch(n){case"input":jr(r),jo(r,s,!0);break;case"textarea":jr(r),Co(r);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(r.onclick=si)}r=i,t.updateQueue=r,r!==null&&(t.flags|=4)}else{o=i.nodeType===9?i:i.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=ou(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=o.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=o.createElement(n,{is:r.is}):(e=o.createElement(n),n==="select"&&(o=e,r.multiple?o.multiple=!0:r.size&&(o.size=r.size))):e=o.createElementNS(e,n),e[Je]=t,e[ur]=r,Lc(e,t,!1,!1),t.stateNode=e;e:{switch(o=bs(n,r),n){case"dialog":X("cancel",e),X("close",e),i=r;break;case"iframe":case"object":case"embed":X("load",e),i=r;break;case"video":case"audio":for(i=0;i<Vn.length;i++)X(Vn[i],e);i=r;break;case"source":X("error",e),i=r;break;case"img":case"image":case"link":X("error",e),X("load",e),i=r;break;case"details":X("toggle",e),i=r;break;case"input":So(e,r),i=Ss(e,r),X("invalid",e);break;case"option":i=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},i=ie({},r,{value:void 0}),X("invalid",e);break;case"textarea":No(e,r),i=Cs(e,r),X("invalid",e);break;default:i=r}Es(n,i),a=i;for(s in a)if(a.hasOwnProperty(s)){var u=a[s];s==="style"?cu(e,u):s==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,u!=null&&au(e,u)):s==="children"?typeof u=="string"?(n!=="textarea"||u!=="")&&er(e,u):typeof u=="number"&&er(e,""+u):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(Zn.hasOwnProperty(s)?u!=null&&s==="onScroll"&&X("scroll",e):u!=null&&Nl(e,s,u,o))}switch(n){case"input":jr(e),jo(e,r,!1);break;case"textarea":jr(e),Co(e);break;case"option":r.value!=null&&e.setAttribute("value",""+Lt(r.value));break;case"select":e.multiple=!!r.multiple,s=r.value,s!=null?pn(e,!!r.multiple,s,!1):r.defaultValue!=null&&pn(e,!!r.multiple,r.defaultValue,!0);break;default:typeof i.onClick=="function"&&(e.onclick=si)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return ye(t),null;case 6:if(e&&t.stateNode!=null)Mc(e,t,e.memoizedProps,r);else{if(typeof r!="string"&&t.stateNode===null)throw Error(T(166));if(n=Ut(dr.current),Ut(et.current),_r(t)){if(r=t.stateNode,n=t.memoizedProps,r[Je]=t,(s=r.nodeValue!==n)&&(e=_e,e!==null))switch(e.tag){case 3:Lr(r.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&Lr(r.nodeValue,n,(e.mode&1)!==0)}s&&(t.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[Je]=t,t.stateNode=r}return ye(t),null;case 13:if(J(ne),r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(ee&&Le!==null&&t.mode&1&&!(t.flags&128))Xu(),Sn(),t.flags|=98560,s=!1;else if(s=_r(t),r!==null&&r.dehydrated!==null){if(e===null){if(!s)throw Error(T(318));if(s=t.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(T(317));s[Je]=t}else Sn(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;ye(t),s=!1}else Qe!==null&&(al(Qe),Qe=null),s=!0;if(!s)return t.flags&65536?t:null}return t.flags&128?(t.lanes=n,t):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(t.child.flags|=8192,t.mode&1&&(e===null||ne.current&1?ue===0&&(ue=3):lo())),t.updateQueue!==null&&(t.flags|=4),ye(t),null);case 4:return Nn(),el(e,t),e===null&&or(t.stateNode.containerInfo),ye(t),null;case 10:return Bl(t.type._context),ye(t),null;case 17:return be(t.type)&&li(),ye(t),null;case 19:if(J(ne),s=t.memoizedState,s===null)return ye(t),null;if(r=(t.flags&128)!==0,o=s.rendering,o===null)if(r)Fn(s,!1);else{if(ue!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(o=fi(e),o!==null){for(t.flags|=128,Fn(s,!1),r=o.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),t.subtreeFlags=0,r=n,n=t.child;n!==null;)s=n,e=r,s.flags&=14680066,o=s.alternate,o===null?(s.childLanes=0,s.lanes=e,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=o.childLanes,s.lanes=o.lanes,s.child=o.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=o.memoizedProps,s.memoizedState=o.memoizedState,s.updateQueue=o.updateQueue,s.type=o.type,e=o.dependencies,s.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return q(ne,ne.current&1|2),t.child}e=e.sibling}s.tail!==null&&le()>zn&&(t.flags|=128,r=!0,Fn(s,!1),t.lanes=4194304)}else{if(!r)if(e=fi(o),e!==null){if(t.flags|=128,r=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),Fn(s,!0),s.tail===null&&s.tailMode==="hidden"&&!o.alternate&&!ee)return ye(t),null}else 2*le()-s.renderingStartTime>zn&&n!==1073741824&&(t.flags|=128,r=!0,Fn(s,!1),t.lanes=4194304);s.isBackwards?(o.sibling=t.child,t.child=o):(n=s.last,n!==null?n.sibling=o:t.child=o,s.last=o)}return s.tail!==null?(t=s.tail,s.rendering=t,s.tail=t.sibling,s.renderingStartTime=le(),t.sibling=null,n=ne.current,q(ne,r?n&1|2:n&1),t):(ye(t),null);case 22:case 23:return so(),r=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(t.flags|=8192),r&&t.mode&1?Pe&1073741824&&(ye(t),t.subtreeFlags&6&&(t.flags|=8192)):ye(t),null;case 24:return null;case 25:return null}throw Error(T(156,t.tag))}function wf(e,t){switch(Dl(t),t.tag){case 1:return be(t.type)&&li(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Nn(),J(Ee),J(we),Kl(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 5:return Gl(t),null;case 13:if(J(ne),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(T(340));Sn()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return J(ne),null;case 4:return Nn(),null;case 10:return Bl(t.type._context),null;case 22:case 23:return so(),null;case 24:return null;default:return null}}var Rr=!1,xe=!1,kf=typeof WeakSet=="function"?WeakSet:Set,F=null;function cn(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){se(e,t,r)}else n.current=null}function tl(e,t,n){try{n()}catch(r){se(e,t,r)}}var ma=!1;function Sf(e,t){if(As=ni,e=Au(),Fl(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var i=r.anchorOffset,s=r.focusNode;r=r.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var o=0,a=-1,u=-1,d=0,x=0,h=e,g=null;t:for(;;){for(var w;h!==n||i!==0&&h.nodeType!==3||(a=o+i),h!==s||r!==0&&h.nodeType!==3||(u=o+r),h.nodeType===3&&(o+=h.nodeValue.length),(w=h.firstChild)!==null;)g=h,h=w;for(;;){if(h===e)break t;if(g===n&&++d===i&&(a=o),g===s&&++x===r&&(u=o),(w=h.nextSibling)!==null)break;h=g,g=h.parentNode}h=w}n=a===-1||u===-1?null:{start:a,end:u}}else n=null}n=n||{start:0,end:0}}else n=null;for(Ds={focusedElem:e,selectionRange:n},ni=!1,F=t;F!==null;)if(t=F,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,F=e;else for(;F!==null;){t=F;try{var k=t.alternate;if(t.flags&1024)switch(t.tag){case 0:case 11:case 15:break;case 1:if(k!==null){var j=k.memoizedProps,M=k.memoizedState,p=t.stateNode,c=p.getSnapshotBeforeUpdate(t.elementType===t.type?j:He(t.type,j),M);p.__reactInternalSnapshotBeforeUpdate=c}break;case 3:var m=t.stateNode.containerInfo;m.nodeType===1?m.textContent="":m.nodeType===9&&m.documentElement&&m.removeChild(m.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(T(163))}}catch(y){se(t,t.return,y)}if(e=t.sibling,e!==null){e.return=t.return,F=e;break}F=t.return}return k=ma,ma=!1,k}function Yn(e,t,n){var r=t.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var i=r=r.next;do{if((i.tag&e)===e){var s=i.destroy;i.destroy=void 0,s!==void 0&&tl(t,n,s)}i=i.next}while(i!==r)}}function Ii(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}function nl(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t=="function"?t(e):t.current=e}}function Ic(e){var t=e.alternate;t!==null&&(e.alternate=null,Ic(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[Je],delete t[ur],delete t[Vs],delete t[rf],delete t[sf])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function Rc(e){return e.tag===5||e.tag===3||e.tag===4}function ha(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Rc(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function rl(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=si));else if(r!==4&&(e=e.child,e!==null))for(rl(e,t,n),e=e.sibling;e!==null;)rl(e,t,n),e=e.sibling}function il(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(il(e,t,n),e=e.sibling;e!==null;)il(e,t,n),e=e.sibling}var fe=null,We=!1;function ht(e,t,n){for(n=n.child;n!==null;)Oc(e,t,n),n=n.sibling}function Oc(e,t,n){if(Ze&&typeof Ze.onCommitFiberUnmount=="function")try{Ze.onCommitFiberUnmount(zi,n)}catch{}switch(n.tag){case 5:xe||cn(n,t);case 6:var r=fe,i=We;fe=null,ht(e,t,n),fe=r,We=i,fe!==null&&(We?(e=fe,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):fe.removeChild(n.stateNode));break;case 18:fe!==null&&(We?(e=fe,n=n.stateNode,e.nodeType===8?is(e.parentNode,n):e.nodeType===1&&is(e,n),ir(e)):is(fe,n.stateNode));break;case 4:r=fe,i=We,fe=n.stateNode.containerInfo,We=!0,ht(e,t,n),fe=r,We=i;break;case 0:case 11:case 14:case 15:if(!xe&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){i=r=r.next;do{var s=i,o=s.destroy;s=s.tag,o!==void 0&&(s&2||s&4)&&tl(n,t,o),i=i.next}while(i!==r)}ht(e,t,n);break;case 1:if(!xe&&(cn(n,t),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(a){se(n,t,a)}ht(e,t,n);break;case 21:ht(e,t,n);break;case 22:n.mode&1?(xe=(r=xe)||n.memoizedState!==null,ht(e,t,n),xe=r):ht(e,t,n);break;default:ht(e,t,n)}}function ga(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new kf),t.forEach(function(r){var i=Lf.bind(null,e,r);n.has(r)||(n.add(r),r.then(i,i))})}}function Ve(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r];try{var s=e,o=t,a=o;e:for(;a!==null;){switch(a.tag){case 5:fe=a.stateNode,We=!1;break e;case 3:fe=a.stateNode.containerInfo,We=!0;break e;case 4:fe=a.stateNode.containerInfo,We=!0;break e}a=a.return}if(fe===null)throw Error(T(160));Oc(s,o,i),fe=null,We=!1;var u=i.alternate;u!==null&&(u.return=null),i.return=null}catch(d){se(i,t,d)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)Fc(t,e),t=t.sibling}function Fc(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(Ve(t,e),qe(e),r&4){try{Yn(3,e,e.return),Ii(3,e)}catch(j){se(e,e.return,j)}try{Yn(5,e,e.return)}catch(j){se(e,e.return,j)}}break;case 1:Ve(t,e),qe(e),r&512&&n!==null&&cn(n,n.return);break;case 5:if(Ve(t,e),qe(e),r&512&&n!==null&&cn(n,n.return),e.flags&32){var i=e.stateNode;try{er(i,"")}catch(j){se(e,e.return,j)}}if(r&4&&(i=e.stateNode,i!=null)){var s=e.memoizedProps,o=n!==null?n.memoizedProps:s,a=e.type,u=e.updateQueue;if(e.updateQueue=null,u!==null)try{a==="input"&&s.type==="radio"&&s.name!=null&&su(i,s),bs(a,o);var d=bs(a,s);for(o=0;o<u.length;o+=2){var x=u[o],h=u[o+1];x==="style"?cu(i,h):x==="dangerouslySetInnerHTML"?au(i,h):x==="children"?er(i,h):Nl(i,x,h,d)}switch(a){case"input":js(i,s);break;case"textarea":lu(i,s);break;case"select":var g=i._wrapperState.wasMultiple;i._wrapperState.wasMultiple=!!s.multiple;var w=s.value;w!=null?pn(i,!!s.multiple,w,!1):g!==!!s.multiple&&(s.defaultValue!=null?pn(i,!!s.multiple,s.defaultValue,!0):pn(i,!!s.multiple,s.multiple?[]:"",!1))}i[ur]=s}catch(j){se(e,e.return,j)}}break;case 6:if(Ve(t,e),qe(e),r&4){if(e.stateNode===null)throw Error(T(162));i=e.stateNode,s=e.memoizedProps;try{i.nodeValue=s}catch(j){se(e,e.return,j)}}break;case 3:if(Ve(t,e),qe(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{ir(t.containerInfo)}catch(j){se(e,e.return,j)}break;case 4:Ve(t,e),qe(e);break;case 13:Ve(t,e),qe(e),i=e.child,i.flags&8192&&(s=i.memoizedState!==null,i.stateNode.isHidden=s,!s||i.alternate!==null&&i.alternate.memoizedState!==null||(ro=le())),r&4&&ga(e);break;case 22:if(x=n!==null&&n.memoizedState!==null,e.mode&1?(xe=(d=xe)||x,Ve(t,e),xe=d):Ve(t,e),qe(e),r&8192){if(d=e.memoizedState!==null,(e.stateNode.isHidden=d)&&!x&&e.mode&1)for(F=e,x=e.child;x!==null;){for(h=F=x;F!==null;){switch(g=F,w=g.child,g.tag){case 0:case 11:case 14:case 15:Yn(4,g,g.return);break;case 1:cn(g,g.return);var k=g.stateNode;if(typeof k.componentWillUnmount=="function"){r=g,n=g.return;try{t=r,k.props=t.memoizedProps,k.state=t.memoizedState,k.componentWillUnmount()}catch(j){se(r,n,j)}}break;case 5:cn(g,g.return);break;case 22:if(g.memoizedState!==null){ya(h);continue}}w!==null?(w.return=g,F=w):ya(h)}x=x.sibling}e:for(x=null,h=e;;){if(h.tag===5){if(x===null){x=h;try{i=h.stateNode,d?(s=i.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(a=h.stateNode,u=h.memoizedProps.style,o=u!=null&&u.hasOwnProperty("display")?u.display:null,a.style.display=uu("display",o))}catch(j){se(e,e.return,j)}}}else if(h.tag===6){if(x===null)try{h.stateNode.nodeValue=d?"":h.memoizedProps}catch(j){se(e,e.return,j)}}else if((h.tag!==22&&h.tag!==23||h.memoizedState===null||h===e)&&h.child!==null){h.child.return=h,h=h.child;continue}if(h===e)break e;for(;h.sibling===null;){if(h.return===null||h.return===e)break e;x===h&&(x=null),h=h.return}x===h&&(x=null),h.sibling.return=h.return,h=h.sibling}}break;case 19:Ve(t,e),qe(e),r&4&&ga(e);break;case 21:break;default:Ve(t,e),qe(e)}}function qe(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(Rc(n)){var r=n;break e}n=n.return}throw Error(T(160))}switch(r.tag){case 5:var i=r.stateNode;r.flags&32&&(er(i,""),r.flags&=-33);var s=ha(e);il(e,s,i);break;case 3:case 4:var o=r.stateNode.containerInfo,a=ha(e);rl(e,a,o);break;default:throw Error(T(161))}}catch(u){se(e,e.return,u)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function jf(e,t,n){F=e,Ac(e)}function Ac(e,t,n){for(var r=(e.mode&1)!==0;F!==null;){var i=F,s=i.child;if(i.tag===22&&r){var o=i.memoizedState!==null||Rr;if(!o){var a=i.alternate,u=a!==null&&a.memoizedState!==null||xe;a=Rr;var d=xe;if(Rr=o,(xe=u)&&!d)for(F=i;F!==null;)o=F,u=o.child,o.tag===22&&o.memoizedState!==null?xa(i):u!==null?(u.return=o,F=u):xa(i);for(;s!==null;)F=s,Ac(s),s=s.sibling;F=i,Rr=a,xe=d}va(e)}else i.subtreeFlags&8772&&s!==null?(s.return=i,F=s):va(e)}}function va(e){for(;F!==null;){var t=F;if(t.flags&8772){var n=t.alternate;try{if(t.flags&8772)switch(t.tag){case 0:case 11:case 15:xe||Ii(5,t);break;case 1:var r=t.stateNode;if(t.flags&4&&!xe)if(n===null)r.componentDidMount();else{var i=t.elementType===t.type?n.memoizedProps:He(t.type,n.memoizedProps);r.componentDidUpdate(i,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var s=t.updateQueue;s!==null&&ta(t,s,r);break;case 3:var o=t.updateQueue;if(o!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}ta(t,o,n)}break;case 5:var a=t.stateNode;if(n===null&&t.flags&4){n=a;var u=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":u.autoFocus&&n.focus();break;case"img":u.src&&(n.src=u.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var d=t.alternate;if(d!==null){var x=d.memoizedState;if(x!==null){var h=x.dehydrated;h!==null&&ir(h)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(T(163))}xe||t.flags&512&&nl(t)}catch(g){se(t,t.return,g)}}if(t===e){F=null;break}if(n=t.sibling,n!==null){n.return=t.return,F=n;break}F=t.return}}function ya(e){for(;F!==null;){var t=F;if(t===e){F=null;break}var n=t.sibling;if(n!==null){n.return=t.return,F=n;break}F=t.return}}function xa(e){for(;F!==null;){var t=F;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{Ii(4,t)}catch(u){se(t,n,u)}break;case 1:var r=t.stateNode;if(typeof r.componentDidMount=="function"){var i=t.return;try{r.componentDidMount()}catch(u){se(t,i,u)}}var s=t.return;try{nl(t)}catch(u){se(t,s,u)}break;case 5:var o=t.return;try{nl(t)}catch(u){se(t,o,u)}}}catch(u){se(t,t.return,u)}if(t===e){F=null;break}var a=t.sibling;if(a!==null){a.return=t.return,F=a;break}F=t.return}}var Nf=Math.ceil,gi=pt.ReactCurrentDispatcher,to=pt.ReactCurrentOwner,De=pt.ReactCurrentBatchConfig,G=0,de=null,oe=null,me=0,Pe=0,dn=It(0),ue=0,hr=null,Gt=0,Ri=0,no=0,qn=null,Ce=null,ro=0,zn=1/0,rt=null,vi=!1,sl=null,Et=null,Or=!1,kt=null,yi=0,Xn=0,ll=null,Gr=-1,Kr=0;function Se(){return G&6?le():Gr!==-1?Gr:Gr=le()}function bt(e){return e.mode&1?G&2&&me!==0?me&-me:of.transition!==null?(Kr===0&&(Kr=Su()),Kr):(e=Y,e!==0||(e=window.event,e=e===void 0?16:Tu(e.type)),e):1}function Ke(e,t,n,r){if(50<Xn)throw Xn=0,ll=null,Error(T(185));vr(e,n,r),(!(G&2)||e!==de)&&(e===de&&(!(G&2)&&(Ri|=n),ue===4&&xt(e,me)),Te(e,r),n===1&&G===0&&!(t.mode&1)&&(zn=le()+500,Li&&Rt()))}function Te(e,t){var n=e.callbackNode;lp(e,t);var r=ti(e,e===de?me:0);if(r===0)n!==null&&bo(n),e.callbackNode=null,e.callbackPriority=0;else if(t=r&-r,e.callbackPriority!==t){if(n!=null&&bo(n),t===1)e.tag===0?lf(wa.bind(null,e)):Ku(wa.bind(null,e)),tf(function(){!(G&6)&&Rt()}),n=null;else{switch(ju(r)){case 1:n=Tl;break;case 4:n=wu;break;case 16:n=ei;break;case 536870912:n=ku;break;default:n=ei}n=Qc(n,Dc.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function Dc(e,t){if(Gr=-1,Kr=0,G&6)throw Error(T(327));var n=e.callbackNode;if(vn()&&e.callbackNode!==n)return null;var r=ti(e,e===de?me:0);if(r===0)return null;if(r&30||r&e.expiredLanes||t)t=xi(e,r);else{t=r;var i=G;G|=2;var s=Uc();(de!==e||me!==t)&&(rt=null,zn=le()+500,Vt(e,t));do try{Ef();break}catch(a){$c(e,a)}while(!0);Vl(),gi.current=s,G=i,oe!==null?t=0:(de=null,me=0,t=ue)}if(t!==0){if(t===2&&(i=Ms(e),i!==0&&(r=i,t=ol(e,i))),t===1)throw n=hr,Vt(e,0),xt(e,r),Te(e,le()),n;if(t===6)xt(e,r);else{if(i=e.current.alternate,!(r&30)&&!Cf(i)&&(t=xi(e,r),t===2&&(s=Ms(e),s!==0&&(r=s,t=ol(e,s))),t===1))throw n=hr,Vt(e,0),xt(e,r),Te(e,le()),n;switch(e.finishedWork=i,e.finishedLanes=r,t){case 0:case 1:throw Error(T(345));case 2:At(e,Ce,rt);break;case 3:if(xt(e,r),(r&130023424)===r&&(t=ro+500-le(),10<t)){if(ti(e,0)!==0)break;if(i=e.suspendedLanes,(i&r)!==r){Se(),e.pingedLanes|=e.suspendedLanes&i;break}e.timeoutHandle=Us(At.bind(null,e,Ce,rt),t);break}At(e,Ce,rt);break;case 4:if(xt(e,r),(r&4194240)===r)break;for(t=e.eventTimes,i=-1;0<r;){var o=31-Ge(r);s=1<<o,o=t[o],o>i&&(i=o),r&=~s}if(r=i,r=le()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*Nf(r/1960))-r,10<r){e.timeoutHandle=Us(At.bind(null,e,Ce,rt),r);break}At(e,Ce,rt);break;case 5:At(e,Ce,rt);break;default:throw Error(T(329))}}}return Te(e,le()),e.callbackNode===n?Dc.bind(null,e):null}function ol(e,t){var n=qn;return e.current.memoizedState.isDehydrated&&(Vt(e,t).flags|=256),e=xi(e,t),e!==2&&(t=Ce,Ce=n,t!==null&&al(t)),e}function al(e){Ce===null?Ce=e:Ce.push.apply(Ce,e)}function Cf(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var i=n[r],s=i.getSnapshot;i=i.value;try{if(!Ye(s(),i))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function xt(e,t){for(t&=~no,t&=~Ri,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-Ge(t),r=1<<n;e[n]=-1,t&=~r}}function wa(e){if(G&6)throw Error(T(327));vn();var t=ti(e,0);if(!(t&1))return Te(e,le()),null;var n=xi(e,t);if(e.tag!==0&&n===2){var r=Ms(e);r!==0&&(t=r,n=ol(e,r))}if(n===1)throw n=hr,Vt(e,0),xt(e,t),Te(e,le()),n;if(n===6)throw Error(T(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,At(e,Ce,rt),Te(e,le()),null}function io(e,t){var n=G;G|=1;try{return e(t)}finally{G=n,G===0&&(zn=le()+500,Li&&Rt())}}function Kt(e){kt!==null&&kt.tag===0&&!(G&6)&&vn();var t=G;G|=1;var n=De.transition,r=Y;try{if(De.transition=null,Y=1,e)return e()}finally{Y=r,De.transition=n,G=t,!(G&6)&&Rt()}}function so(){Pe=dn.current,J(dn)}function Vt(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,ef(n)),oe!==null)for(n=oe.return;n!==null;){var r=n;switch(Dl(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&li();break;case 3:Nn(),J(Ee),J(we),Kl();break;case 5:Gl(r);break;case 4:Nn();break;case 13:J(ne);break;case 19:J(ne);break;case 10:Bl(r.type._context);break;case 22:case 23:so()}n=n.return}if(de=e,oe=e=Tt(e.current,null),me=Pe=t,ue=0,hr=null,no=Ri=Gt=0,Ce=qn=null,$t!==null){for(t=0;t<$t.length;t++)if(n=$t[t],r=n.interleaved,r!==null){n.interleaved=null;var i=r.next,s=n.pending;if(s!==null){var o=s.next;s.next=i,r.next=o}n.pending=r}$t=null}return e}function $c(e,t){do{var n=oe;try{if(Vl(),Hr.current=hi,mi){for(var r=re.memoizedState;r!==null;){var i=r.queue;i!==null&&(i.pending=null),r=r.next}mi=!1}if(Qt=0,ce=ae=re=null,Kn=!1,pr=0,to.current=null,n===null||n.return===null){ue=1,hr=t,oe=null;break}e:{var s=e,o=n.return,a=n,u=t;if(t=me,a.flags|=32768,u!==null&&typeof u=="object"&&typeof u.then=="function"){var d=u,x=a,h=x.tag;if(!(x.mode&1)&&(h===0||h===11||h===15)){var g=x.alternate;g?(x.updateQueue=g.updateQueue,x.memoizedState=g.memoizedState,x.lanes=g.lanes):(x.updateQueue=null,x.memoizedState=null)}var w=oa(o);if(w!==null){w.flags&=-257,aa(w,o,a,s,t),w.mode&1&&la(s,d,t),t=w,u=d;var k=t.updateQueue;if(k===null){var j=new Set;j.add(u),t.updateQueue=j}else k.add(u);break e}else{if(!(t&1)){la(s,d,t),lo();break e}u=Error(T(426))}}else if(ee&&a.mode&1){var M=oa(o);if(M!==null){!(M.flags&65536)&&(M.flags|=256),aa(M,o,a,s,t),$l(Cn(u,a));break e}}s=u=Cn(u,a),ue!==4&&(ue=2),qn===null?qn=[s]:qn.push(s),s=o;do{switch(s.tag){case 3:s.flags|=65536,t&=-t,s.lanes|=t;var p=jc(s,u,t);ea(s,p);break e;case 1:a=u;var c=s.type,m=s.stateNode;if(!(s.flags&128)&&(typeof c.getDerivedStateFromError=="function"||m!==null&&typeof m.componentDidCatch=="function"&&(Et===null||!Et.has(m)))){s.flags|=65536,t&=-t,s.lanes|=t;var y=Nc(s,a,t);ea(s,y);break e}}s=s.return}while(s!==null)}Bc(n)}catch(C){t=C,oe===n&&n!==null&&(oe=n=n.return);continue}break}while(!0)}function Uc(){var e=gi.current;return gi.current=hi,e===null?hi:e}function lo(){(ue===0||ue===3||ue===2)&&(ue=4),de===null||!(Gt&268435455)&&!(Ri&268435455)||xt(de,me)}function xi(e,t){var n=G;G|=2;var r=Uc();(de!==e||me!==t)&&(rt=null,Vt(e,t));do try{zf();break}catch(i){$c(e,i)}while(!0);if(Vl(),G=n,gi.current=r,oe!==null)throw Error(T(261));return de=null,me=0,ue}function zf(){for(;oe!==null;)Vc(oe)}function Ef(){for(;oe!==null&&!Xd();)Vc(oe)}function Vc(e){var t=Wc(e.alternate,e,Pe);e.memoizedProps=e.pendingProps,t===null?Bc(e):oe=t,to.current=null}function Bc(e){var t=e;do{var n=t.alternate;if(e=t.return,t.flags&32768){if(n=wf(n,t),n!==null){n.flags&=32767,oe=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{ue=6,oe=null;return}}else if(n=xf(n,t,Pe),n!==null){oe=n;return}if(t=t.sibling,t!==null){oe=t;return}oe=t=e}while(t!==null);ue===0&&(ue=5)}function At(e,t,n){var r=Y,i=De.transition;try{De.transition=null,Y=1,bf(e,t,n,r)}finally{De.transition=i,Y=r}return null}function bf(e,t,n,r){do vn();while(kt!==null);if(G&6)throw Error(T(327));n=e.finishedWork;var i=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(T(177));e.callbackNode=null,e.callbackPriority=0;var s=n.lanes|n.childLanes;if(op(e,s),e===de&&(oe=de=null,me=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||Or||(Or=!0,Qc(ei,function(){return vn(),null})),s=(n.flags&15990)!==0,n.subtreeFlags&15990||s){s=De.transition,De.transition=null;var o=Y;Y=1;var a=G;G|=4,to.current=null,Sf(e,n),Fc(n,e),Gp(Ds),ni=!!As,Ds=As=null,e.current=n,jf(n),Jd(),G=a,Y=o,De.transition=s}else e.current=n;if(Or&&(Or=!1,kt=e,yi=i),s=e.pendingLanes,s===0&&(Et=null),tp(n.stateNode),Te(e,le()),t!==null)for(r=e.onRecoverableError,n=0;n<t.length;n++)i=t[n],r(i.value,{componentStack:i.stack,digest:i.digest});if(vi)throw vi=!1,e=sl,sl=null,e;return yi&1&&e.tag!==0&&vn(),s=e.pendingLanes,s&1?e===ll?Xn++:(Xn=0,ll=e):Xn=0,Rt(),null}function vn(){if(kt!==null){var e=ju(yi),t=De.transition,n=Y;try{if(De.transition=null,Y=16>e?16:e,kt===null)var r=!1;else{if(e=kt,kt=null,yi=0,G&6)throw Error(T(331));var i=G;for(G|=4,F=e.current;F!==null;){var s=F,o=s.child;if(F.flags&16){var a=s.deletions;if(a!==null){for(var u=0;u<a.length;u++){var d=a[u];for(F=d;F!==null;){var x=F;switch(x.tag){case 0:case 11:case 15:Yn(8,x,s)}var h=x.child;if(h!==null)h.return=x,F=h;else for(;F!==null;){x=F;var g=x.sibling,w=x.return;if(Ic(x),x===d){F=null;break}if(g!==null){g.return=w,F=g;break}F=w}}}var k=s.alternate;if(k!==null){var j=k.child;if(j!==null){k.child=null;do{var M=j.sibling;j.sibling=null,j=M}while(j!==null)}}F=s}}if(s.subtreeFlags&2064&&o!==null)o.return=s,F=o;else e:for(;F!==null;){if(s=F,s.flags&2048)switch(s.tag){case 0:case 11:case 15:Yn(9,s,s.return)}var p=s.sibling;if(p!==null){p.return=s.return,F=p;break e}F=s.return}}var c=e.current;for(F=c;F!==null;){o=F;var m=o.child;if(o.subtreeFlags&2064&&m!==null)m.return=o,F=m;else e:for(o=c;F!==null;){if(a=F,a.flags&2048)try{switch(a.tag){case 0:case 11:case 15:Ii(9,a)}}catch(C){se(a,a.return,C)}if(a===o){F=null;break e}var y=a.sibling;if(y!==null){y.return=a.return,F=y;break e}F=a.return}}if(G=i,Rt(),Ze&&typeof Ze.onPostCommitFiberRoot=="function")try{Ze.onPostCommitFiberRoot(zi,e)}catch{}r=!0}return r}finally{Y=n,De.transition=t}}return!1}function ka(e,t,n){t=Cn(n,t),t=jc(e,t,1),e=zt(e,t,1),t=Se(),e!==null&&(vr(e,1,t),Te(e,t))}function se(e,t,n){if(e.tag===3)ka(e,e,n);else for(;t!==null;){if(t.tag===3){ka(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(Et===null||!Et.has(r))){e=Cn(n,e),e=Nc(t,e,1),t=zt(t,e,1),e=Se(),t!==null&&(vr(t,1,e),Te(t,e));break}}t=t.return}}function Tf(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),t=Se(),e.pingedLanes|=e.suspendedLanes&n,de===e&&(me&n)===n&&(ue===4||ue===3&&(me&130023424)===me&&500>le()-ro?Vt(e,0):no|=n),Te(e,t)}function Hc(e,t){t===0&&(e.mode&1?(t=zr,zr<<=1,!(zr&130023424)&&(zr=4194304)):t=1);var n=Se();e=ct(e,t),e!==null&&(vr(e,t,n),Te(e,n))}function Pf(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),Hc(e,n)}function Lf(e,t){var n=0;switch(e.tag){case 13:var r=e.stateNode,i=e.memoizedState;i!==null&&(n=i.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(T(314))}r!==null&&r.delete(t),Hc(e,n)}var Wc;Wc=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||Ee.current)ze=!0;else{if(!(e.lanes&n)&&!(t.flags&128))return ze=!1,yf(e,t,n);ze=!!(e.flags&131072)}else ze=!1,ee&&t.flags&1048576&&Yu(t,ui,t.index);switch(t.lanes=0,t.tag){case 2:var r=t.type;Qr(e,t),e=t.pendingProps;var i=kn(t,we.current);gn(t,n),i=ql(null,t,r,e,i,n);var s=Xl();return t.flags|=1,typeof i=="object"&&i!==null&&typeof i.render=="function"&&i.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,be(r)?(s=!0,oi(t)):s=!1,t.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,Wl(t),i.updater=Mi,t.stateNode=i,i._reactInternals=t,Ks(t,r,e,n),t=Xs(null,t,r,!0,s,n)):(t.tag=0,ee&&s&&Al(t),ke(null,t,i,n),t=t.child),t;case 16:r=t.elementType;e:{switch(Qr(e,t),e=t.pendingProps,i=r._init,r=i(r._payload),t.type=r,i=t.tag=Mf(r),e=He(r,e),i){case 0:t=qs(null,t,r,e,n);break e;case 1:t=da(null,t,r,e,n);break e;case 11:t=ua(null,t,r,e,n);break e;case 14:t=ca(null,t,r,He(r.type,e),n);break e}throw Error(T(306,r,""))}return t;case 0:return r=t.type,i=t.pendingProps,i=t.elementType===r?i:He(r,i),qs(e,t,r,i,n);case 1:return r=t.type,i=t.pendingProps,i=t.elementType===r?i:He(r,i),da(e,t,r,i,n);case 3:e:{if(bc(t),e===null)throw Error(T(387));r=t.pendingProps,s=t.memoizedState,i=s.element,tc(e,t),pi(t,r,null,n);var o=t.memoizedState;if(r=o.element,s.isDehydrated)if(s={element:r,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},t.updateQueue.baseState=s,t.memoizedState=s,t.flags&256){i=Cn(Error(T(423)),t),t=pa(e,t,r,n,i);break e}else if(r!==i){i=Cn(Error(T(424)),t),t=pa(e,t,r,n,i);break e}else for(Le=Ct(t.stateNode.containerInfo.firstChild),_e=t,ee=!0,Qe=null,n=Zu(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Sn(),r===i){t=dt(e,t,n);break e}ke(e,t,r,n)}t=t.child}return t;case 5:return nc(t),e===null&&Ws(t),r=t.type,i=t.pendingProps,s=e!==null?e.memoizedProps:null,o=i.children,$s(r,i)?o=null:s!==null&&$s(r,s)&&(t.flags|=32),Ec(e,t),ke(e,t,o,n),t.child;case 6:return e===null&&Ws(t),null;case 13:return Tc(e,t,n);case 4:return Ql(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=jn(t,null,r,n):ke(e,t,r,n),t.child;case 11:return r=t.type,i=t.pendingProps,i=t.elementType===r?i:He(r,i),ua(e,t,r,i,n);case 7:return ke(e,t,t.pendingProps,n),t.child;case 8:return ke(e,t,t.pendingProps.children,n),t.child;case 12:return ke(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(r=t.type._context,i=t.pendingProps,s=t.memoizedProps,o=i.value,q(ci,r._currentValue),r._currentValue=o,s!==null)if(Ye(s.value,o)){if(s.children===i.children&&!Ee.current){t=dt(e,t,n);break e}}else for(s=t.child,s!==null&&(s.return=t);s!==null;){var a=s.dependencies;if(a!==null){o=s.child;for(var u=a.firstContext;u!==null;){if(u.context===r){if(s.tag===1){u=ot(-1,n&-n),u.tag=2;var d=s.updateQueue;if(d!==null){d=d.shared;var x=d.pending;x===null?u.next=u:(u.next=x.next,x.next=u),d.pending=u}}s.lanes|=n,u=s.alternate,u!==null&&(u.lanes|=n),Qs(s.return,n,t),a.lanes|=n;break}u=u.next}}else if(s.tag===10)o=s.type===t.type?null:s.child;else if(s.tag===18){if(o=s.return,o===null)throw Error(T(341));o.lanes|=n,a=o.alternate,a!==null&&(a.lanes|=n),Qs(o,n,t),o=s.sibling}else o=s.child;if(o!==null)o.return=s;else for(o=s;o!==null;){if(o===t){o=null;break}if(s=o.sibling,s!==null){s.return=o.return,o=s;break}o=o.return}s=o}ke(e,t,i.children,n),t=t.child}return t;case 9:return i=t.type,r=t.pendingProps.children,gn(t,n),i=$e(i),r=r(i),t.flags|=1,ke(e,t,r,n),t.child;case 14:return r=t.type,i=He(r,t.pendingProps),i=He(r.type,i),ca(e,t,r,i,n);case 15:return Cc(e,t,t.type,t.pendingProps,n);case 17:return r=t.type,i=t.pendingProps,i=t.elementType===r?i:He(r,i),Qr(e,t),t.tag=1,be(r)?(e=!0,oi(t)):e=!1,gn(t,n),Sc(t,r,i),Ks(t,r,i,n),Xs(null,t,r,!0,e,n);case 19:return Pc(e,t,n);case 22:return zc(e,t,n)}throw Error(T(156,t.tag))};function Qc(e,t){return xu(e,t)}function _f(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Ae(e,t,n,r){return new _f(e,t,n,r)}function oo(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Mf(e){if(typeof e=="function")return oo(e)?1:0;if(e!=null){if(e=e.$$typeof,e===zl)return 11;if(e===El)return 14}return 2}function Tt(e,t){var n=e.alternate;return n===null?(n=Ae(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function Yr(e,t,n,r,i,s){var o=2;if(r=e,typeof e=="function")oo(e)&&(o=1);else if(typeof e=="string")o=5;else e:switch(e){case en:return Bt(n.children,i,s,t);case Cl:o=8,i|=8;break;case ys:return e=Ae(12,n,t,i|2),e.elementType=ys,e.lanes=s,e;case xs:return e=Ae(13,n,t,i),e.elementType=xs,e.lanes=s,e;case ws:return e=Ae(19,n,t,i),e.elementType=ws,e.lanes=s,e;case nu:return Oi(n,i,s,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case eu:o=10;break e;case tu:o=9;break e;case zl:o=11;break e;case El:o=14;break e;case gt:o=16,r=null;break e}throw Error(T(130,e==null?e:typeof e,""))}return t=Ae(o,n,t,i),t.elementType=e,t.type=r,t.lanes=s,t}function Bt(e,t,n,r){return e=Ae(7,e,r,t),e.lanes=n,e}function Oi(e,t,n,r){return e=Ae(22,e,r,t),e.elementType=nu,e.lanes=n,e.stateNode={isHidden:!1},e}function ps(e,t,n){return e=Ae(6,e,null,t),e.lanes=n,e}function fs(e,t,n){return t=Ae(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function If(e,t,n,r,i){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Gi(0),this.expirationTimes=Gi(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Gi(0),this.identifierPrefix=r,this.onRecoverableError=i,this.mutableSourceEagerHydrationData=null}function ao(e,t,n,r,i,s,o,a,u){return e=new If(e,t,n,a,u),t===1?(t=1,s===!0&&(t|=8)):t=0,s=Ae(3,null,null,t),e.current=s,s.stateNode=e,s.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},Wl(s),e}function Rf(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Zt,key:r==null?null:""+r,children:e,containerInfo:t,implementation:n}}function Gc(e){if(!e)return _t;e=e._reactInternals;e:{if(qt(e)!==e||e.tag!==1)throw Error(T(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(be(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(T(171))}if(e.tag===1){var n=e.type;if(be(n))return Gu(e,n,t)}return t}function Kc(e,t,n,r,i,s,o,a,u){return e=ao(n,r,!0,e,i,s,o,a,u),e.context=Gc(null),n=e.current,r=Se(),i=bt(n),s=ot(r,i),s.callback=t??null,zt(n,s,i),e.current.lanes=i,vr(e,i,r),Te(e,r),e}function Fi(e,t,n,r){var i=t.current,s=Se(),o=bt(i);return n=Gc(n),t.context===null?t.context=n:t.pendingContext=n,t=ot(s,o),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),e=zt(i,t,o),e!==null&&(Ke(e,i,o,s),Br(e,i,o)),o}function wi(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function Sa(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function uo(e,t){Sa(e,t),(e=e.alternate)&&Sa(e,t)}function Of(){return null}var Yc=typeof reportError=="function"?reportError:function(e){console.error(e)};function co(e){this._internalRoot=e}Ai.prototype.render=co.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(T(409));Fi(e,t,null,null)};Ai.prototype.unmount=co.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;Kt(function(){Fi(null,e,null,null)}),t[ut]=null}};function Ai(e){this._internalRoot=e}Ai.prototype.unstable_scheduleHydration=function(e){if(e){var t=zu();e={blockedOn:null,target:e,priority:t};for(var n=0;n<yt.length&&t!==0&&t<yt[n].priority;n++);yt.splice(n,0,e),n===0&&bu(e)}};function po(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Di(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function ja(){}function Ff(e,t,n,r,i){if(i){if(typeof r=="function"){var s=r;r=function(){var d=wi(o);s.call(d)}}var o=Kc(t,r,e,0,null,!1,!1,"",ja);return e._reactRootContainer=o,e[ut]=o.current,or(e.nodeType===8?e.parentNode:e),Kt(),o}for(;i=e.lastChild;)e.removeChild(i);if(typeof r=="function"){var a=r;r=function(){var d=wi(u);a.call(d)}}var u=ao(e,0,!1,null,null,!1,!1,"",ja);return e._reactRootContainer=u,e[ut]=u.current,or(e.nodeType===8?e.parentNode:e),Kt(function(){Fi(t,u,n,r)}),u}function $i(e,t,n,r,i){var s=n._reactRootContainer;if(s){var o=s;if(typeof i=="function"){var a=i;i=function(){var u=wi(o);a.call(u)}}Fi(t,o,e,i)}else o=Ff(n,t,e,i,r);return wi(o)}Nu=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=Un(t.pendingLanes);n!==0&&(Pl(t,n|1),Te(t,le()),!(G&6)&&(zn=le()+500,Rt()))}break;case 13:Kt(function(){var r=ct(e,1);if(r!==null){var i=Se();Ke(r,e,1,i)}}),uo(e,1)}};Ll=function(e){if(e.tag===13){var t=ct(e,134217728);if(t!==null){var n=Se();Ke(t,e,134217728,n)}uo(e,134217728)}};Cu=function(e){if(e.tag===13){var t=bt(e),n=ct(e,t);if(n!==null){var r=Se();Ke(n,e,t,r)}uo(e,t)}};zu=function(){return Y};Eu=function(e,t){var n=Y;try{return Y=e,t()}finally{Y=n}};Ps=function(e,t,n){switch(t){case"input":if(js(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var i=Pi(r);if(!i)throw Error(T(90));iu(r),js(r,i)}}}break;case"textarea":lu(e,n);break;case"select":t=n.value,t!=null&&pn(e,!!n.multiple,t,!1)}};fu=io;mu=Kt;var Af={usingClientEntryPoint:!1,Events:[xr,sn,Pi,du,pu,io]},An={findFiberByHostInstance:Dt,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Df={bundleType:An.bundleType,version:An.version,rendererPackageName:An.rendererPackageName,rendererConfig:An.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:pt.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=vu(e),e===null?null:e.stateNode},findFiberByHostInstance:An.findFiberByHostInstance||Of,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Fr=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Fr.isDisabled&&Fr.supportsFiber)try{zi=Fr.inject(Df),Ze=Fr}catch{}}Ie.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Af;Ie.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!po(t))throw Error(T(200));return Rf(e,t,null,n)};Ie.createRoot=function(e,t){if(!po(e))throw Error(T(299));var n=!1,r="",i=Yc;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onRecoverableError!==void 0&&(i=t.onRecoverableError)),t=ao(e,1,!1,null,null,n,!1,r,i),e[ut]=t.current,or(e.nodeType===8?e.parentNode:e),new co(t)};Ie.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(T(188)):(e=Object.keys(e).join(","),Error(T(268,e)));return e=vu(t),e=e===null?null:e.stateNode,e};Ie.flushSync=function(e){return Kt(e)};Ie.hydrate=function(e,t,n){if(!Di(t))throw Error(T(200));return $i(null,e,t,!0,n)};Ie.hydrateRoot=function(e,t,n){if(!po(e))throw Error(T(405));var r=n!=null&&n.hydratedSources||null,i=!1,s="",o=Yc;if(n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(o=n.onRecoverableError)),t=Kc(t,null,e,1,n??null,i,!1,s,o),e[ut]=t.current,or(e),r)for(e=0;e<r.length;e++)n=r[e],i=n._getVersion,i=i(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,i]:t.mutableSourceEagerHydrationData.push(n,i);return new Ai(t)};Ie.render=function(e,t,n){if(!Di(t))throw Error(T(200));return $i(null,e,t,!1,n)};Ie.unmountComponentAtNode=function(e){if(!Di(e))throw Error(T(40));return e._reactRootContainer?(Kt(function(){$i(null,null,e,!1,function(){e._reactRootContainer=null,e[ut]=null})}),!0):!1};Ie.unstable_batchedUpdates=io;Ie.unstable_renderSubtreeIntoContainer=function(e,t,n,r){if(!Di(n))throw Error(T(200));if(e==null||e._reactInternals===void 0)throw Error(T(38));return $i(e,t,n,!1,r)};Ie.version="18.3.1-next-f1338f8080-20240426";function qc(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(qc)}catch(e){console.error(e)}}qc(),qa.exports=Ie;var $f=qa.exports,Na=$f;gs.createRoot=Na.createRoot,gs.hydrateRoot=Na.hydrateRoot;const ul="gourmet_craft_recipes_v1",Xc="gourmet_craft_shopping_v1",Jc="gourmet_craft_theme_v1",Zc="gourmet_craft_gemini_key_v1",Jn=[{id:"seed-1",title:"Creamy Truffle & Wild Mushroom Tagliatelle",description:"Rich, velvet truffle cream pasta cooked al dente, topped with sautéed wild mushrooms and aged Parmigiano-Reggiano.",category:"Main",prepTime:15,cookTime:20,servings:4,image:"https://images.unsplash.com/photo-1621996346565-e3d5d6281318?auto=format&fit=crop&w=1000&q=80",sourceName:"Gourmet Kitchen",sourceUrl:"https://cookmate.online/example/truffle-pasta",isFavorite:!0,createdAt:new Date().toISOString(),tags:["Italian","Pasta","Vegetarian","Quick Dinner"],ingredientSections:[{id:"sec-pasta-1",title:"For the Fresh Tagliatelle Pasta",items:[{id:"ing-1",amount:400,unit:"g",name:"Fresh Tagliatelle Pasta"},{id:"ing-2",amount:4,unit:"l",name:"Water"},{id:"ing-3",amount:2,unit:"tbsp",name:"Sea Salt",notes:"for pasta water"}]},{id:"sec-sauce-1",title:"For the Truffle Cream Sauce",items:[{id:"ing-4",amount:3,unit:"tbsp",name:"Unsalted Butter"},{id:"ing-5",amount:300,unit:"g",name:"Wild Mushrooms",notes:"chanterelles & cremini, sliced"},{id:"ing-6",amount:3,unit:"cloves",name:"Garlic",notes:"minced"},{id:"ing-7",amount:200,unit:"ml",name:"Heavy Cream"},{id:"ing-8",amount:2,unit:"tbsp",name:"Black Truffle Oil"},{id:"ing-9",amount:80,unit:"g",name:"Parmigiano-Reggiano",notes:"freshly grated"},{id:"ing-10",amount:.5,unit:"tsp",name:"Freshly Ground Black Pepper"}]},{id:"sec-garnish-1",title:"For the Garnish & Serving",items:[{id:"ing-11",amount:2,unit:"tbsp",name:"Fresh Parsley",notes:"chopped"},{id:"ing-12",amount:20,unit:"g",name:"Shaved Black Truffle",notes:"optional"}]}],instructions:[{id:"st-1",stepNumber:1,text:"Bring a large pot of salted water to a rolling boil.",timerMinutes:8},{id:"st-2",stepNumber:2,text:"Melt butter in a skillet over medium-high heat. Add sliced wild mushrooms and sauté until golden brown (approx 6 mins). Add garlic and cook for another minute.",timerMinutes:7},{id:"st-3",stepNumber:3,text:"Pour in heavy cream and lower heat to simmer. Stir in freshly grated Parmigiano-Reggiano until melted and thick.",timerMinutes:4},{id:"st-4",stepNumber:4,text:"Cook fresh Tagliatelle pasta in boiling water for 3-4 minutes until al dente. Reserve 1/2 cup pasta water, then drain pasta.",timerMinutes:4},{id:"st-5",stepNumber:5,text:"Toss pasta into truffle cream sauce with a splash of pasta water. Drizzle black truffle oil and top with chopped fresh parsley and shaved truffle.",timerMinutes:2}]},{id:"seed-2",title:"Artisanal Wood-Fired Margherita Pizza",description:"Classic Neapolitan pizza with slow-fermented dough, San Marzano tomato sauce, fresh buffalo mozzarella, and aromatic basil leaves.",category:"Main",prepTime:25,cookTime:12,servings:2,image:"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80",sourceName:"Neapolitan Tradition",isFavorite:!0,createdAt:new Date().toISOString(),tags:["Baking","Italian","Pizza","Comfort Food"],ingredientSections:[{id:"sec-dough-2",title:"For the Pizza Dough (2 balls)",items:[{id:"ing-21",amount:350,unit:"g",name:"Tipo 00 Flour"},{id:"ing-22",amount:230,unit:"ml",name:"Lukewarm Water"},{id:"ing-23",amount:1,unit:"tsp",name:"Active Dry Yeast"},{id:"ing-24",amount:1.5,unit:"tsp",name:"Fine Sea Salt"}]},{id:"sec-sauce-2",title:"For the San Marzano Tomato Sauce",items:[{id:"ing-25",amount:250,unit:"g",name:"San Marzano Whole Peeled Tomatoes"},{id:"ing-26",amount:1,unit:"clove",name:"Garlic",notes:"crushed"},{id:"ing-27",amount:1,unit:"tbsp",name:"Extra Virgin Olive Oil"},{id:"ing-28",amount:.5,unit:"tsp",name:"Dried Oregano"}]},{id:"sec-toppings-2",title:"For the Cheese & Toppings",items:[{id:"ing-29",amount:200,unit:"g",name:"Fresh Buffalo Mozzarella",notes:"torn & drained"},{id:"ing-30",amount:10,unit:"leaves",name:"Fresh Basil"},{id:"ing-31",amount:2,unit:"tbsp",name:"Extra Virgin Olive Oil"}]}],instructions:[{id:"st-21",stepNumber:1,text:"Dissolve yeast in warm water. Mix flour and salt, then pour yeast water and knead for 10 minutes into a smooth dough ball. Let rise for 2 hours.",timerMinutes:120},{id:"st-22",stepNumber:2,text:"Hand-crush San Marzano tomatoes with crushed garlic, olive oil, oregano, and salt to create raw tomato sauce."},{id:"st-23",stepNumber:3,text:"Preheat oven with pizza stone to maximum temperature (250°C / 480°F).",timerMinutes:30},{id:"st-24",stepNumber:4,text:"Stretch dough into two 10-inch rounds. Spread tomato sauce evenly, arrange mozzarella pieces."},{id:"st-25",stepNumber:5,text:"Bake for 8-10 minutes until crust is charred and cheese bubbles. Garnish with fresh basil and olive oil.",timerMinutes:10}]},{id:"seed-3",title:"Berry Parfait with Honey Granola",description:"Refreshing layered Greek yogurt parfait with roasted almond oat granola and wild berries.",category:"Breakfast",prepTime:10,cookTime:0,servings:2,image:"https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1000&q=80",sourceName:"Healthy Morning",isFavorite:!1,createdAt:new Date().toISOString(),tags:["Breakfast","Quick","Healthy","Vegetarian"],ingredientSections:[{id:"sec-base-3",title:"For the Yogurt Base",items:[{id:"ing-31",amount:300,unit:"g",name:"Greek Yogurt"},{id:"ing-32",amount:2,unit:"tbsp",name:"Wildflower Honey"},{id:"ing-33",amount:.5,unit:"tsp",name:"Vanilla Extract"}]},{id:"sec-fruit-3",title:"For the Berry Compote & Crunch",items:[{id:"ing-34",amount:150,unit:"g",name:"Mixed Fresh Berries",notes:"strawberries & blueberries"},{id:"ing-35",amount:100,unit:"g",name:"Honey Almond Granola"},{id:"ing-36",amount:1,unit:"tbsp",name:"Chia Seeds"}]}],instructions:[{id:"st-31",stepNumber:1,text:"Whisk Greek yogurt, wildflower honey, and vanilla extract together in a bowl."},{id:"st-32",stepNumber:2,text:"In glasses, alternate layers of honey yogurt, granola, and fresh mixed berries."},{id:"st-33",stepNumber:3,text:"Top with chia seeds and serve immediately."}]}],Uf=()=>{try{const e=localStorage.getItem(ul);return e?JSON.parse(e):(localStorage.setItem(ul,JSON.stringify(Jn)),Jn)}catch(e){return console.error("Error loading recipes from localStorage",e),Jn}},Jt=e=>{try{localStorage.setItem(ul,JSON.stringify(e))}catch(t){console.error("Error saving recipes to localStorage",t)}},Vf=()=>{try{const e=localStorage.getItem(Xc);return e?JSON.parse(e):[]}catch{return[]}},Ca=e=>{try{localStorage.setItem(Xc,JSON.stringify(e))}catch(t){console.error("Error saving shopping list to localStorage",t)}},Bf=()=>localStorage.getItem(Jc)||"dark",Hf=e=>{localStorage.setItem(Jc,e)},cl=()=>localStorage.getItem(Zc)||"",Wf=e=>{localStorage.setItem(Zc,e)};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Qf={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gf=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),$=(e,t)=>{const n=A.forwardRef(({color:r="currentColor",size:i=24,strokeWidth:s=2,absoluteStrokeWidth:o,className:a="",children:u,...d},x)=>A.createElement("svg",{ref:x,...Qf,width:i,height:i,stroke:r,strokeWidth:o?Number(s)*24/Number(i):s,className:["lucide",`lucide-${Gf(e)}`,a].join(" "),...d},[...t.map(([h,g])=>A.createElement(h,g)),...Array.isArray(u)?u:[u]]));return n.displayName=`${e}`,n};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kf=$("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const za=$("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yf=$("CheckCircle2",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dl=$("CheckSquare",[["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}],["path",{d:"M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",key:"1jnkn4"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pl=$("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qf=$("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xf=$("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jf=$("Clipboard",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fo=$("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ea=$("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zf=$("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const em=$("Flame",[["path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",key:"96xj49"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tm=$("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mo=$("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nm=$("Key",[["circle",{cx:"7.5",cy:"15.5",r:"5.5",key:"yqb3hr"}],["path",{d:"m21 2-9.6 9.6",key:"1j0ho8"}],["path",{d:"m15.5 7.5 3 3L22 7l-3-3",key:"1rn1fs"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const En=$("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ms=$("Loader2",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rm=$("MicOff",[["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}],["path",{d:"M18.89 13.23A7.12 7.12 0 0 0 19 12v-2",key:"80xlxr"}],["path",{d:"M5 10v2a7 7 0 0 0 12 5",key:"p2k8kg"}],["path",{d:"M15 9.34V5a3 3 0 0 0-5.68-1.33",key:"1gzdoj"}],["path",{d:"M9 9v3a3 3 0 0 0 5.12 2.12",key:"r2i35w"}],["line",{x1:"12",x2:"12",y1:"19",y2:"22",key:"x3vr5v"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const im=$("Mic",[["path",{d:"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z",key:"131961"}],["path",{d:"M19 10v2a7 7 0 0 1-14 0v-2",key:"1vc78b"}],["line",{x1:"12",x2:"12",y1:"19",y2:"22",key:"x3vr5v"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fl=$("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sm=$("Pause",[["rect",{width:"4",height:"16",x:"6",y:"4",key:"iffhe4"}],["rect",{width:"4",height:"16",x:"14",y:"4",key:"sjin7j"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ed=$("Play",[["polygon",{points:"5 3 19 12 5 21 5 3",key:"191637"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ba=$("PlusCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M8 12h8",key:"1wcyev"}],["path",{d:"M12 8v8",key:"napkw2"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qr=$("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lm=$("Printer",[["polyline",{points:"6 9 6 2 18 2 18 9",key:"1306q4"}],["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["rect",{width:"12",height:"8",x:"6",y:"14",key:"5ipwut"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const om=$("RefreshCcw",[["path",{d:"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"14sxne"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16",key:"1hlbsb"}],["path",{d:"M16 16h5v5",key:"ccwih5"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const am=$("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const um=$("RotateCcw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cm=$("Save",[["path",{d:"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z",key:"1owoqh"}],["polyline",{points:"17 21 17 13 7 13 7 21",key:"1md35c"}],["polyline",{points:"7 3 7 8 15 8",key:"8nz8an"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dm=$("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const td=$("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ki=$("ShoppingBag",[["path",{d:"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z",key:"hou9p0"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M16 10a4 4 0 0 1-8 0",key:"1ltviw"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pm=$("SlidersHorizontal",[["line",{x1:"21",x2:"14",y1:"4",y2:"4",key:"obuewd"}],["line",{x1:"10",x2:"3",y1:"4",y2:"4",key:"1q6298"}],["line",{x1:"21",x2:"12",y1:"12",y2:"12",key:"1iu8h1"}],["line",{x1:"8",x2:"3",y1:"12",y2:"12",key:"ntss68"}],["line",{x1:"21",x2:"16",y1:"20",y2:"20",key:"14d8ph"}],["line",{x1:"12",x2:"3",y1:"20",y2:"20",key:"m0wm8r"}],["line",{x1:"14",x2:"14",y1:"2",y2:"6",key:"14e1ph"}],["line",{x1:"8",x2:"8",y1:"10",y2:"14",key:"1i6ji0"}],["line",{x1:"16",x2:"16",y1:"18",y2:"22",key:"1lctlv"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pt=$("Sparkles",[["path",{d:"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z",key:"17u4zn"}],["path",{d:"M5 3v4",key:"bklmnn"}],["path",{d:"M19 17v4",key:"iiml17"}],["path",{d:"M3 5h4",key:"nem4j1"}],["path",{d:"M17 19h4",key:"lbex7p"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fm=$("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z",key:"1lpok0"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ml=$("Square",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hl=$("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nd=$("Timer",[["line",{x1:"10",x2:"14",y1:"2",y2:"2",key:"14vaq8"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11",key:"17fdiu"}],["circle",{cx:"12",cy:"14",r:"8",key:"1e1u0o"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Si=$("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rd=$("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ji=$("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ta=$("UtensilsCrossed",[["path",{d:"m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8",key:"n7qcjb"}],["path",{d:"M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7",key:"d0u48b"}],["path",{d:"m2.1 21.8 6.4-6.3",key:"yn04lh"}],["path",{d:"m19 5-7 7",key:"194lzd"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mm=$("Utensils",[["path",{d:"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2",key:"cjf0a3"}],["path",{d:"M7 2v20",key:"1473qp"}],["path",{d:"M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7",key:"1ogz0v"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pa=$("Volume2",[["polygon",{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5",key:"16drj5"}],["path",{d:"M15.54 8.46a5 5 0 0 1 0 7.07",key:"ltjumu"}],["path",{d:"M19.07 4.93a10 10 0 0 1 0 14.14",key:"1kegas"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const La=$("VolumeX",[["polygon",{points:"11 5 6 9 2 9 2 15 6 15 11 19 11 5",key:"16drj5"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15",key:"1ewh16"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15",key:"5ykzw1"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ni=$("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),hm=({currentTab:e,setCurrentTab:t,searchQuery:n,setSearchQuery:r,onOpenAddModal:i,onOpenImportModal:s,theme:o,toggleTheme:a})=>l.jsxs(l.Fragment,{children:[l.jsx("header",{className:"navbar-header",children:l.jsxs("div",{className:"navbar-container",children:[l.jsxs("div",{className:"brand",onClick:()=>t("recipes"),children:[l.jsx("div",{className:"brand-icon",children:l.jsx(Ta,{size:24,color:"#ffffff"})}),l.jsxs("span",{className:"brand-name",children:["Gourmet",l.jsx("span",{className:"brand-highlight",children:"Craft"})]})]}),l.jsxs("div",{className:"search-box",children:[l.jsx(dm,{size:18,className:"search-icon"}),l.jsx("input",{type:"text",placeholder:"Search recipes, ingredients, or parts...",value:n,onChange:u=>r(u.target.value),className:"search-input"})]}),l.jsxs("div",{className:"nav-actions",children:[l.jsxs("button",{className:"btn btn-outline btn-sm",onClick:s,children:[l.jsx(Pt,{size:16}),l.jsx("span",{children:"Import Recipe"})]}),l.jsxs("button",{className:"btn btn-primary btn-sm",onClick:i,children:[l.jsx(ba,{size:16}),l.jsx("span",{children:"New Recipe"})]}),l.jsx("button",{className:"btn btn-secondary btn-icon",onClick:a,title:"Toggle Dark/Light Mode",children:o==="dark"?l.jsx(hl,{size:18}):l.jsx(fl,{size:18})})]})]})}),l.jsxs("nav",{className:"mobile-bottom-nav",children:[l.jsxs("button",{className:`mobile-nav-item ${e==="recipes"?"active":""}`,onClick:()=>t("recipes"),children:[l.jsx(Ta,{size:20}),l.jsx("span",{children:"Recipes"})]}),l.jsxs("button",{className:"mobile-nav-item highlight",onClick:s,children:[l.jsx(Pt,{size:22}),l.jsx("span",{children:"Import"})]}),l.jsxs("button",{className:"mobile-nav-item",onClick:i,children:[l.jsx(ba,{size:22}),l.jsx("span",{children:"Add"})]}),l.jsxs("button",{className:`mobile-nav-item ${e==="shopping"?"active":""}`,onClick:()=>t("shopping"),children:[l.jsx(ki,{size:20}),l.jsx("span",{children:"Shopping"})]}),l.jsxs("button",{className:`mobile-nav-item ${e==="settings"?"active":""}`,onClick:()=>t("settings"),children:[l.jsx(td,{size:20}),l.jsx("span",{children:"Settings"})]})]}),l.jsx("style",{children:`
        .navbar-header {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(12px);
        }
        .navbar-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.85rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          user-select: none;
        }
        .brand-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px var(--accent-glow);
        }
        .brand-name {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-main);
        }
        .brand-highlight {
          color: var(--accent-primary);
        }
        .search-box {
          position: relative;
          flex: 1;
          max-width: 480px;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }
        .search-input {
          width: 100%;
          padding: 0.6rem 1rem 0.6rem 2.75rem;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          color: var(--text-main);
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .search-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .mobile-bottom-nav {
          display: none;
        }

        @media (max-width: 767px) {
          .nav-actions .btn span {
            display: none;
          }
          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 70px;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border-color);
            align-items: center;
            justify-content: space-around;
            z-index: 900;
            box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.3);
          }
          .mobile-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.25rem;
            background: none;
            border: none;
            color: var(--text-muted);
            font-size: 0.72rem;
            font-weight: 500;
            cursor: pointer;
            width: 20%;
            height: 100%;
          }
          .mobile-nav-item.active {
            color: var(--accent-primary);
          }
          .mobile-nav-item.highlight {
            color: #ffffff;
            background: var(--accent-gradient);
            border-radius: var(--radius-full);
            width: 48px;
            height: 48px;
            margin-bottom: 14px;
            box-shadow: 0 4px 14px var(--accent-glow);
          }
          .mobile-nav-item.highlight span {
            display: none;
          }
        }
      `})]}),gm=({recipe:e,onSelect:t,onToggleFavorite:n})=>{const r=e.ingredientSections?e.ingredientSections.length:1,i=e.ingredientSections?e.ingredientSections.reduce((s,o)=>s+o.items.length,0):0;return l.jsxs("div",{className:"card recipe-card card-hover",onClick:()=>t(e),children:[l.jsxs("div",{className:"card-image-wrapper",children:[l.jsx("img",{src:e.image||"https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1000&q=80",alt:e.title,className:"card-image",loading:"lazy"}),l.jsxs("div",{className:"card-overlay",children:[l.jsx("span",{className:"badge category-badge",children:e.category}),l.jsx("button",{className:`favorite-btn ${e.isFavorite?"active":""}`,onClick:s=>n(e.id,s),title:e.isFavorite?"Remove from Favorites":"Add to Favorites",children:l.jsx(mo,{size:18,fill:e.isFavorite?"#ef4444":"none",color:e.isFavorite?"#ef4444":"#ffffff"})})]})]}),l.jsxs("div",{className:"card-content",children:[l.jsx("h3",{className:"card-title",children:e.title}),l.jsx("p",{className:"card-description",children:e.description}),l.jsxs("div",{className:"card-meta",children:[l.jsxs("div",{className:"meta-item",title:"Prep & Cook Time",children:[l.jsx(fo,{size:15}),l.jsxs("span",{children:[e.prepTime+e.cookTime," mins"]})]}),l.jsxs("div",{className:"meta-item",title:"Base Portion Count",children:[l.jsx(ji,{size:15}),l.jsxs("span",{children:[e.servings," portions"]})]}),l.jsxs("div",{className:"meta-item",title:"Ingredient Parts",children:[l.jsx(En,{size:15}),l.jsxs("span",{children:[r," ",r===1?"part":"parts"," (",i," items)"]})]})]})]}),l.jsx("style",{children:`
        .recipe-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .card-image-wrapper {
          position: relative;
          width: 100%;
          padding-top: 60%; /* 16:9 - 4:3 aspect ratio */
          overflow: hidden;
          background: var(--bg-input);
        }
        .card-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .recipe-card:hover .card-image {
          transform: scale(1.05);
        }
        .card-overlay {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          right: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 2;
        }
        .category-badge {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(8px);
        }
        .favorite-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-full);
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .favorite-btn:hover {
          transform: scale(1.1);
          background: rgba(0, 0, 0, 0.7);
        }
        .card-content {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.4rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-description {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .card-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.85rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
          font-size: 0.78rem;
          color: var(--text-dim);
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
      `})]})},vm=["All","Favorites","Main","Appetizer","Dessert","Baking","Breakfast","Beverage","Side","Sauce"],ym=({recipes:e,searchQuery:t,onSelectRecipe:n,onToggleFavorite:r,onOpenImportModal:i})=>{const[s,o]=A.useState("All"),[a,u]=A.useState("newest"),x=[...e.filter(h=>{var g,w,k,j;if(s==="Favorites"){if(!h.isFavorite)return!1}else if(s!=="All"&&h.category!==s)return!1;if(t.trim()){const M=t.toLowerCase().trim(),p=h.title.toLowerCase().includes(M),c=(g=h.description)==null?void 0:g.toLowerCase().includes(M),m=(w=h.category)==null?void 0:w.toLowerCase().includes(M),y=(k=h.tags)==null?void 0:k.some(P=>P.toLowerCase().includes(M)),C=(j=h.ingredientSections)==null?void 0:j.some(P=>P.title.toLowerCase().includes(M)||P.items.some(L=>L.name.toLowerCase().includes(M)));return p||c||m||y||C}return!0})].sort((h,g)=>a==="title"?h.title.localeCompare(g.title):a==="time"?h.prepTime+h.cookTime-(g.prepTime+g.cookTime):new Date(g.createdAt).getTime()-new Date(h.createdAt).getTime());return l.jsxs("div",{className:"recipe-list-container",children:[l.jsxs("div",{className:"filter-bar",children:[l.jsx("div",{className:"category-scroll",children:vm.map(h=>l.jsxs("button",{className:`category-pill ${s===h?"active":""}`,onClick:()=>o(h),children:[h==="Favorites"&&l.jsx(mo,{size:14,className:"pill-icon"}),h]},h))}),l.jsxs("div",{className:"sort-controls",children:[l.jsx(pm,{size:15,color:"var(--text-dim)"}),l.jsxs("select",{value:a,onChange:h=>u(h.target.value),className:"sort-select",children:[l.jsx("option",{value:"newest",children:"Sort by: Newest"}),l.jsx("option",{value:"title",children:"Sort by: Name (A-Z)"}),l.jsx("option",{value:"time",children:"Sort by: Quickest Time"})]})]})]}),x.length>0?l.jsx("div",{className:"recipe-grid",children:x.map(h=>l.jsx(gm,{recipe:h,onSelect:n,onToggleFavorite:r},h.id))}):l.jsxs("div",{className:"empty-state card",children:[l.jsx("div",{className:"empty-icon",children:l.jsx(mm,{size:48,color:"var(--accent-primary)"})}),l.jsx("h3",{children:"No Recipes Found"}),l.jsx("p",{children:t?`No recipes matching "${t}". Try a different term or clear search.`:"Your recipe book is empty for this category. Import a recipe or add your own!"}),l.jsx("div",{className:"empty-actions",children:l.jsxs("button",{className:"btn btn-primary",onClick:i,children:[l.jsx(Pt,{size:18}),l.jsx("span",{children:"Import Recipe (URL / Photo)"})]})})]}),l.jsx("style",{children:`
        .recipe-list-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .category-scroll {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        .category-scroll::-webkit-scrollbar {
          display: none;
        }
        .category-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 1rem;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.88rem;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .category-pill:hover {
          background: var(--bg-card-hover);
          color: var(--text-main);
        }
        .category-pill.active {
          background: var(--accent-primary);
          color: #ffffff;
          border-color: var(--accent-primary);
          box-shadow: 0 4px 12px var(--accent-glow);
        }
        .pill-icon {
          fill: currentColor;
        }
        .sort-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .sort-select {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
        }
        .recipe-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .empty-state {
          padding: 3.5rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .empty-icon {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-full);
          background: var(--badge-bg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .empty-actions {
          margin-top: 0.5rem;
        }
      `})]})},xm=[{keywords:["water","milk","cream","heavy cream","whipping cream","buttermilk","half and half"],type:"liquid",gramsPerCup:240,mlPerCup:240},{keywords:["oil","olive oil","vegetable oil","canola oil","coconut oil","sunflower oil","sesame oil"],type:"liquid",gramsPerCup:218,mlPerCup:240},{keywords:["sauce","tomato sauce","pizza sauce","marinara","broth","stock","vinegar","wine","juice"],type:"liquid",gramsPerCup:240,mlPerCup:250},{keywords:["honey","maple syrup","syrup","molasses","corn syrup"],type:"liquid",gramsPerCup:340,mlPerCup:240},{keywords:["flour","all-purpose flour","bread flour","whole wheat flour","cake flour","tipo 00","baking flour"],type:"solid",gramsPerCup:125},{keywords:["cocoa powder","cacao powder"],type:"solid",gramsPerCup:100},{keywords:["powdered sugar","confectioners sugar","icing sugar"],type:"solid",gramsPerCup:120},{keywords:["cornstarch","tapioca starch","arrowroot"],type:"solid",gramsPerCup:128},{keywords:["granulated sugar","white sugar","sugar","caster sugar"],type:"solid",gramsPerCup:200},{keywords:["brown sugar","light brown sugar","dark brown sugar"],type:"solid",gramsPerCup:220},{keywords:["butter","unsalted butter","salted butter","margarine","shortening","ghee"],type:"solid",gramsPerCup:227},{keywords:["greek yogurt","yogurt","sour cream","ricotta","mascarpone"],type:"solid",gramsPerCup:240},{keywords:["mozzarella","cheddar","parmesan","shredded cheese","cheese","parmigiano-reggiano","gouda","swiss"],type:"solid",gramsPerCup:115},{keywords:["oats","rolled oats","quick oats"],type:"solid",gramsPerCup:90},{keywords:["rice","white rice","brown rice","arborio rice","quinoa","breadcrumbs","panko"],type:"solid",gramsPerCup:185},{keywords:["walnuts","pecans","almonds","cashews","peanuts","chopped nuts","hazelnuts"],type:"solid",gramsPerCup:120},{keywords:["chocolate chips","chocolate morsels","chocolate"],type:"solid",gramsPerCup:170},{keywords:["blueberries","strawberries","raspberries","blackberries","berries"],type:"solid",gramsPerCup:150},{keywords:["mushrooms","wild mushrooms","cremini"],type:"solid",gramsPerCup:90}];function gl(e){if(!e)return"";let t=e.replace(/(\d+)\s*°?\s*F\s*[\/\(]\s*(\d+)\s*°?\s*C\)?/gi,"$2°C");return t=t.replace(/(\d+)\s*°\s*F\b/gi,(n,r)=>{const i=parseInt(r,10);return`${Math.round((i-32)*5/9)}°C`}),t}function id(e,t,n){if(!e||!t)return{amount:e,unit:t};const r=t.toLowerCase().trim(),i=n.toLowerCase().trim();if(!["cup","cups","tbsp","tablespoon","tablespoons","tsp","teaspoon","teaspoons","oz","ounce","ounces","lb","lbs","pound","pounds"].includes(r))return{amount:e,unit:t};const s=xm.find(o=>o.keywords.some(a=>i.includes(a)));if(r==="cup"||r==="cups"){if(s)if(s.type==="liquid"){const a=s.mlPerCup||240;return{amount:Math.round(e*a),unit:"ml"}}else return{amount:Math.round(e*s.gramsPerCup),unit:"g"};return/water|milk|cream|oil|sauce|juice|vinegar|broth|syrup|honey|liquid/i.test(i)?{amount:Math.round(e*240),unit:"ml"}:{amount:Math.round(e*150),unit:"g"}}if(r==="tbsp"||r==="tablespoon"||r==="tablespoons"){if(s){if(s.type==="liquid")return{amount:Math.round(e*15),unit:"ml"};{const a=s.gramsPerCup/16,u=e*a;return{amount:Math.round(u),unit:"g"}}}return/water|milk|cream|oil|sauce|juice|vinegar|broth|syrup|honey/i.test(i)?{amount:Math.round(e*15),unit:"ml"}:{amount:Math.round(e*15),unit:"g"}}if(r==="tsp"||r==="teaspoon"||r==="teaspoons"){if(s&&s.type==="solid"){const o=s.gramsPerCup/48;return{amount:Math.round(e*o)||5,unit:"g"}}return{amount:Math.round(e*5),unit:"ml"}}return r==="oz"||r==="ounce"||r==="ounces"?/water|milk|cream|oil|sauce|juice|vinegar|broth|syrup|fl oz/i.test(i)?{amount:Math.round(e*29.57),unit:"ml"}:{amount:Math.round(e*28.35),unit:"g"}:r==="lb"||r==="lbs"||r==="pound"||r==="pounds"?{amount:Math.round(e*453.59),unit:"g"}:{amount:e,unit:t}}function wm(e){var x;let t=gl(e).trim(),n;const r=t.match(/\((?:[\w\/\.\–-]*\/)?([\d\.\–-]+)\s*(g|kg|ml|l)\)/i);if(r){const h=r[1].split("–")[0].split("-")[0],g=parseFloat(h)||1,w=r[2].toLowerCase();let k=t.replace(/\([\s\S]*?\)/g,"").replace(/^[\d\/\.\s-]+(?:and|to)?\s*[\d\/\.\s-]*\s*(?:cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|lbs?|packets?|can|g|kg|ml|l)?\s*/gi,"").replace(/^(?:to\s+[\d\/\.\s-]+\s*(?:cups?|tbsp|tsp|g|kg|ml|l)?\s*)/gi,"").replace(/^[-*•\s]+/,"").replace(/\s+/g," ").trim();if(k.includes(",")){const j=k.split(",");k=j[0].trim(),n=j.slice(1).join(",").trim()}return{amount:g,unit:w,name:k,notes:n}}t=t.replace(/(\d+)\s+and\s+(\d+\/\d+)/gi,"$1 $2");const i=/^([\d\/\.\s-]+)?\s*(tablespoons?|tablespoon|tbsp|teaspoons?|teaspoon|tsp|cups?|cup|grams?|gram|g|kg|milliliters?|ml|liters?|l|ounces?|oz|pounds?|lbs?|lb|cloves?|clove|pinches|pinch|handfuls?|handful|slices?|slice|packets?|packet|cans?|can|pieces?|piece|pcs)?\s+(.+)$/i,s=t.replace(/^[-*•\s]+/,"").match(i);let o=1,a="",u=t;if(s){const h=(x=s[1])==null?void 0:x.trim();if(h)if(h.includes("/"))if(h.includes(" ")){const g=h.split(" "),w=parseFloat(g[0])||0,[k,j]=g[1].split("/");o=w+parseFloat(k)/parseFloat(j)}else{const[g,w]=h.split("/");o=parseFloat(g)/parseFloat(w)}else o=parseFloat(h)||1;if(a=s[2]?s[2].toLowerCase():"",u=s[3]||t,u=u.replace(/\([\s\S]*?\)/g,"").trim(),u.includes(",")){const g=u.split(",");u=g[0].trim(),n=g.slice(1).join(",").trim()}}const d=id(o,a,u);return{amount:d.amount,unit:d.unit,name:u,notes:n}}function km(e){if(!e||e===0)return"";const t=Math.floor(e),n=e-t;let r="";return Math.abs(n-.25)<.05?r="¼":Math.abs(n-.33)<.05?r="⅓":Math.abs(n-.5)<.05?r="½":Math.abs(n-.66)<.05?r="⅔":Math.abs(n-.75)<.05&&(r="¾"),r?t>0?`${t} ${r}`:r:parseFloat(e.toFixed(2)).toString()}function _a(e,t,n,r=""){if(!e||!t)return{amount:e,unit:t};const i=t.toLowerCase().trim();if(n==="metric"){if(["cup","cups","tbsp","tsp","oz","lbs"].includes(i)){const s=id(e,t,r);return{amount:s.amount,unit:s.unit}}}else if(n==="imperial"){if(i==="g")return{amount:parseFloat((e*.035274).toFixed(1)),unit:"oz"};if(i==="kg")return{amount:parseFloat((e*2.20462).toFixed(1)),unit:"lbs"};if(i==="ml")return{amount:parseFloat((e*.00422675).toFixed(2)),unit:"cups"};if(i==="l")return{amount:parseFloat((e*4.22675).toFixed(2)),unit:"cups"}}return{amount:e,unit:t}}const Sm=({recipe:e,onBack:t,onEdit:n,onDelete:r,onToggleFavorite:i,onStartCookMode:s,onAddToShoppingList:o})=>{var P,L;const[a,u]=A.useState(e.servings||4),[d,x]=A.useState("metric"),[h,g]=A.useState({}),[w,k]=A.useState({}),[j,M]=A.useState(null),p=a/(e.servings||1),c=z=>{g(O=>({...O,[z]:!O[z]}))},m=z=>{k(O=>({...O,[z]:!O[z]}))},y=(z,O)=>{M({stepId:z,secondsLeft:O*60})},C=()=>{const z=[];e.ingredientSections.forEach(O=>{O.items.forEach(I=>{const W=I.amount*p,D=_a(W,I.unit,d,I.name);z.push({id:`shop-${Math.random().toString(36).substr(2,7)}`,name:I.name,amount:D.amount,unit:D.unit,recipeTitle:e.title,sectionTitle:O.title,checked:!1,category:e.category})})}),o(z)};return l.jsxs("div",{className:"recipe-detail-container",children:[l.jsxs("div",{className:"detail-nav",children:[l.jsxs("button",{className:"btn btn-secondary btn-sm",onClick:t,children:[l.jsx(Kf,{size:16}),l.jsx("span",{children:"Back to Recipes"})]}),l.jsxs("div",{className:"detail-nav-actions",children:[l.jsxs("button",{className:"btn btn-secondary btn-sm",onClick:()=>n(e),children:[l.jsx(fm,{size:16}),l.jsx("span",{children:"Edit"})]}),l.jsxs("button",{className:"btn btn-outline btn-sm danger",onClick:()=>r(e.id),children:[l.jsx(Si,{size:16}),l.jsx("span",{children:"Delete"})]})]})]}),l.jsxs("div",{className:"hero-card card",children:[l.jsxs("div",{className:"hero-image-container",children:[l.jsx("img",{src:e.image,alt:e.title,className:"hero-image"}),l.jsx("div",{className:"hero-overlay-gradient"}),l.jsxs("div",{className:"hero-badge-group",children:[l.jsx("span",{className:"badge category-badge",children:e.category}),l.jsx("button",{className:`favorite-btn ${e.isFavorite?"active":""}`,onClick:z=>i(e.id,z),children:l.jsx(mo,{size:20,fill:e.isFavorite?"#ef4444":"none",color:e.isFavorite?"#ef4444":"#ffffff"})})]})]}),l.jsxs("div",{className:"hero-content",children:[l.jsx("h1",{className:"hero-title",children:e.title}),l.jsx("p",{className:"hero-description",children:e.description}),l.jsxs("div",{className:"hero-stats",children:[l.jsxs("div",{className:"stat-card",children:[l.jsx(fo,{size:20,color:"var(--accent-primary)"}),l.jsxs("div",{className:"stat-info",children:[l.jsx("span",{className:"stat-label",children:"Total Time"}),l.jsxs("span",{className:"stat-val",children:[e.prepTime+e.cookTime," mins"]})]})]}),l.jsxs("div",{className:"stat-card",children:[l.jsx(em,{size:20,color:"#f97316"}),l.jsxs("div",{className:"stat-info",children:[l.jsx("span",{className:"stat-label",children:"Prep / Cook"}),l.jsxs("span",{className:"stat-val",children:[e.prepTime,"m / ",e.cookTime,"m"]})]})]}),l.jsxs("div",{className:"stat-card highlight",children:[l.jsx(ji,{size:20,color:"var(--accent-primary)"}),l.jsxs("div",{className:"stat-info",children:[l.jsx("span",{className:"stat-label",children:"Portions"}),l.jsxs("span",{className:"stat-val",children:[a," servings"]})]})]})]}),l.jsxs("div",{className:"hero-cta-bar",children:[l.jsxs("button",{className:"btn btn-primary btn-cook-mode",onClick:()=>s(e,a),children:[l.jsx(ed,{size:20,fill:"#ffffff"}),l.jsx("span",{children:"Start Cook Mode"})]}),e.sourceUrl&&l.jsxs("a",{href:e.sourceUrl,target:"_blank",rel:"noreferrer",className:"btn btn-secondary btn-sm",children:[l.jsx(Zf,{size:16}),l.jsx("span",{children:"Source Link"})]})]})]})]}),l.jsxs("div",{className:"detail-body-grid",children:[l.jsxs("div",{className:"ingredients-column card",children:[l.jsxs("div",{className:"column-header",children:[l.jsxs("div",{className:"column-title-group",children:[l.jsx(En,{size:22,color:"var(--accent-primary)"}),l.jsxs("h2",{children:["Ingredients ",l.jsxs("span",{className:"parts-tag",children:["(",((P=e.ingredientSections)==null?void 0:P.length)||1," parts)"]})]})]}),l.jsxs("button",{className:"btn btn-outline btn-sm",onClick:C,children:[l.jsx(ki,{size:15}),l.jsx("span",{children:"Add to List"})]})]}),l.jsxs("div",{className:"portion-scaler-box",children:[l.jsxs("div",{className:"scaler-label",children:[l.jsx(ji,{size:16}),l.jsx("span",{children:"Portions / Servings:"})]}),l.jsxs("div",{className:"scaler-controls",children:[l.jsx("button",{className:"scaler-btn",onClick:()=>u(Math.max(1,a-1)),children:"-"}),l.jsx("input",{type:"number",min:"1",max:"50",value:a,onChange:z=>u(Math.max(1,parseInt(z.target.value)||1)),className:"scaler-input"}),l.jsx("button",{className:"scaler-btn",onClick:()=>u(a+1),children:"+"})]}),a!==e.servings&&l.jsxs("button",{className:"reset-scaler-btn",onClick:()=>u(e.servings),title:`Reset to original ${e.servings} portions`,children:[l.jsx(am,{size:14})," Reset (",e.servings,")"]})]}),l.jsx("div",{className:"sections-container",children:e.ingredientSections&&e.ingredientSections.map(z=>l.jsxs("div",{className:"ingredient-section",children:[l.jsxs("h3",{className:"section-title",children:[l.jsx("span",{className:"title-bullet"}),z.title]}),l.jsx("ul",{className:"ingredient-list",children:z.items.map(O=>{const I=!!h[O.id],W=O.amount*p,D=_a(W,O.unit,d,O.name),U=km(D.amount);return l.jsxs("li",{className:`ingredient-item ${I?"checked":""}`,onClick:()=>c(O.id),children:[l.jsx("div",{className:"check-box",children:I?l.jsx(dl,{size:18,color:"var(--accent-primary)"}):l.jsx(ml,{size:18,color:"var(--text-dim)"})}),l.jsxs("div",{className:"item-details",children:[l.jsxs("span",{className:"item-amount",children:[U," ",D.unit]}),l.jsx("span",{className:"item-name",children:O.name}),O.notes&&l.jsxs("span",{className:"item-notes",children:["(",O.notes,")"]})]})]},O.id)})})]},z.id))})]}),l.jsxs("div",{className:"instructions-column card",children:[l.jsxs("div",{className:"column-header",children:[l.jsx("h2",{children:"Step-by-Step Method"}),l.jsxs("span",{className:"badge badge-secondary",children:[((L=e.instructions)==null?void 0:L.length)||0," Steps"]})]}),l.jsx("div",{className:"steps-container",children:e.instructions&&e.instructions.map(z=>{const O=!!w[z.id];return l.jsxs("div",{className:`step-card ${O?"completed":""}`,children:[l.jsxs("div",{className:"step-header",onClick:()=>m(z.id),children:[l.jsx("span",{className:"step-num",children:z.stepNumber}),l.jsx("div",{className:"step-check",children:O?l.jsx(dl,{size:20,color:"var(--accent-primary)"}):l.jsx(ml,{size:20,color:"var(--text-dim)"})})]}),l.jsxs("div",{className:"step-content",children:[l.jsx("p",{className:"step-text",children:z.text}),z.timerMinutes&&l.jsx("div",{className:"step-timer-row",children:l.jsxs("button",{className:"btn btn-outline btn-sm timer-btn",onClick:()=>y(z.id,z.timerMinutes),children:[l.jsx(nd,{size:15}),l.jsxs("span",{children:["Start ",z.timerMinutes," min Timer"]})]})})]})]},z.id)})})]})]}),l.jsx("style",{children:`
        .recipe-detail-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .detail-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .detail-nav-actions {
          display: flex;
          gap: 0.5rem;
        }
        .btn-outline.danger {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.4);
        }
        .btn-outline.danger:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
        }
        .hero-card {
          display: grid;
          grid-template-columns: 1fr;
          overflow: hidden;
        }
        @media (min-width: 800px) {
          .hero-card {
            grid-template-columns: 420px 1fr;
          }
        }
        .hero-image-container {
          position: relative;
          min-height: 280px;
          background: var(--bg-input);
        }
        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero-overlay-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%);
        }
        .hero-badge-group {
          position: absolute;
          top: 1rem;
          left: 1rem;
          right: 1rem;
          display: flex;
          justify-content: space-between;
        }
        .hero-content {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .hero-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 0.5rem;
        }
        .hero-description {
          color: var(--text-muted);
          font-size: 1rem;
          margin-bottom: 1.5rem;
        }
        .hero-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }
        .stat-card.highlight {
          border-color: var(--accent-primary);
          background: var(--badge-bg);
        }
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          font-size: 0.72rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat-val {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-main);
        }
        .hero-cta-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .btn-cook-mode {
          padding: 0.85rem 1.75rem;
          font-size: 1.05rem;
        }
        .detail-body-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 900px) {
          .detail-body-grid {
            grid-template-columns: 420px 1fr;
          }
        }
        .ingredients-column, .instructions-column {
          padding: 1.5rem;
        }
        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 1.25rem;
        }
        .column-title-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .parts-tag {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 400;
        }
        .portion-scaler-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .scaler-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .scaler-controls {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .scaler-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          font-weight: 700;
          cursor: pointer;
        }
        .scaler-btn:hover {
          background: var(--accent-primary);
          color: #ffffff;
        }
        .scaler-input {
          width: 48px;
          height: 32px;
          text-align: center;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-main);
          font-weight: 700;
        }
        .reset-scaler-btn {
          background: none;
          border: none;
          color: var(--accent-primary);
          font-size: 0.78rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        .sections-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .ingredient-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .section-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .title-bullet {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--accent-primary);
        }
        .ingredient-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .ingredient-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-md);
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .ingredient-item:hover {
          background: var(--bg-card-hover);
        }
        .ingredient-item.checked {
          opacity: 0.5;
          text-decoration: line-through;
        }
        .check-box {
          margin-top: 2px;
        }
        .item-details {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
          font-size: 0.92rem;
        }
        .item-amount {
          font-weight: 700;
          color: var(--accent-primary);
        }
        .item-name {
          color: var(--text-main);
        }
        .item-notes {
          color: var(--text-dim);
          font-size: 0.82rem;
        }
        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .step-card {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          transition: border-color 0.2s ease;
        }
        .step-card.completed {
          opacity: 0.6;
          border-color: var(--border-color);
        }
        .step-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .step-num {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: var(--accent-primary);
          color: #ffffff;
          font-family: var(--font-heading);
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }
        .step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .step-text {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text-main);
        }
        .timer-btn {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }
      `})]})},jm=["Main","Appetizer","Dessert","Baking","Breakfast","Beverage","Side","Sauce"],Nm=({initialRecipe:e,onSave:t,onClose:n})=>{const[r,i]=A.useState((e==null?void 0:e.title)||""),[s,o]=A.useState((e==null?void 0:e.description)||""),[a,u]=A.useState((e==null?void 0:e.category)||"Main"),[d,x]=A.useState((e==null?void 0:e.prepTime)||15),[h,g]=A.useState((e==null?void 0:e.cookTime)||20),[w,k]=A.useState((e==null?void 0:e.servings)||4),[j,M]=A.useState((e==null?void 0:e.image)||"https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1000&q=80"),[p,c]=A.useState(e!=null&&e.tags?e.tags.join(", "):""),[m,y]=A.useState(e!=null&&e.ingredientSections&&e.ingredientSections.length>0?e.ingredientSections:[{id:"sec-init-1",title:"Main Ingredients",items:[{id:"ing-init-1",amount:400,unit:"g",name:"Main Ingredient Name",notes:""}]}]),[C,P]=A.useState(e!=null&&e.instructions&&e.instructions.length>0?e.instructions:[{id:"st-init-1",stepNumber:1,text:"First step instructions here.",timerMinutes:5}]),L=()=>{y(b=>[...b,{id:`sec-${Date.now()}`,title:`Section ${b.length+1} (e.g. For the Sauce)`,items:[{id:`ing-${Date.now()}`,amount:1,unit:"tbsp",name:"",notes:""}]}])},z=(b,N)=>{y(v=>v.map(f=>f.id===b?{...f,title:N}:f))},O=b=>{m.length<=1||y(N=>N.filter(v=>v.id!==b))},I=b=>{y(N=>N.map(v=>v.id===b?{...v,items:[...v.items,{id:`ing-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,amount:1,unit:"",name:"",notes:""}]}:v))},W=(b,N,v,f)=>{y(S=>S.map(_=>_.id===b?{..._,items:_.items.map(E=>E.id===N?{...E,[v]:f}:E)}:_))},D=(b,N)=>{y(v=>v.map(f=>f.id===b?{...f,items:f.items.filter(S=>S.id!==N)}:f))},U=()=>{P(b=>[...b,{id:`st-${Date.now()}`,stepNumber:b.length+1,text:"",timerMinutes:void 0}])},te=(b,N,v)=>{P(f=>f.map(S=>S.id===b?{...S,[N]:v}:S))},K=b=>{P(N=>N.filter(f=>f.id!==b).map((f,S)=>({...f,stepNumber:S+1})))},ge=b=>{if(b.preventDefault(),!r.trim())return;const N=p.split(",").map(f=>f.trim()).filter(Boolean),v={id:(e==null?void 0:e.id)||`recipe-${Date.now()}`,title:r.trim(),description:s.trim(),category:a,prepTime:Number(d)||0,cookTime:Number(h)||0,servings:Number(w)||4,image:j,ingredientSections:m,instructions:C,tags:N,isFavorite:(e==null?void 0:e.isFavorite)||!1,createdAt:(e==null?void 0:e.createdAt)||new Date().toISOString()};t(v)};return l.jsxs("div",{className:"modal-overlay",children:[l.jsxs("div",{className:"modal-content recipe-form-modal",children:[l.jsxs("div",{className:"modal-header",children:[l.jsx("h2",{children:e!=null&&e.id?"Edit Recipe":"Create New Recipe"}),l.jsx("button",{className:"btn btn-secondary btn-icon",onClick:n,children:l.jsx(Ni,{size:20})})]}),l.jsxs("form",{onSubmit:ge,className:"modal-body form-body",children:[l.jsxs("div",{className:"form-section",children:[l.jsx("h3",{children:"General Details"}),l.jsxs("div",{className:"input-group",children:[l.jsx("label",{className:"input-label",children:"Recipe Title *"}),l.jsx("input",{type:"text",required:!0,placeholder:"e.g. Creamy Truffle & Wild Mushroom Tagliatelle",value:r,onChange:b=>i(b.target.value),className:"input-field"})]}),l.jsxs("div",{className:"form-row grid-2",children:[l.jsxs("div",{className:"input-group",children:[l.jsx("label",{className:"input-label",children:"Category"}),l.jsx("select",{value:a,onChange:b=>u(b.target.value),className:"select-field",children:jm.map(b=>l.jsx("option",{value:b,children:b},b))})]}),l.jsxs("div",{className:"input-group",children:[l.jsx("label",{className:"input-label",children:"Base Servings / Portions *"}),l.jsx("input",{type:"number",min:"1",max:"100",required:!0,value:w,onChange:b=>k(parseInt(b.target.value)||1),className:"input-field"})]})]}),l.jsxs("div",{className:"form-row grid-2",children:[l.jsxs("div",{className:"input-group",children:[l.jsx("label",{className:"input-label",children:"Prep Time (mins)"}),l.jsx("input",{type:"number",min:"0",value:d,onChange:b=>x(parseInt(b.target.value)||0),className:"input-field"})]}),l.jsxs("div",{className:"input-group",children:[l.jsx("label",{className:"input-label",children:"Cook Time (mins)"}),l.jsx("input",{type:"number",min:"0",value:h,onChange:b=>g(parseInt(b.target.value)||0),className:"input-field"})]})]}),l.jsxs("div",{className:"input-group",children:[l.jsx("label",{className:"input-label",children:"Image URL"}),l.jsx("input",{type:"text",placeholder:"https://images.unsplash.com/...",value:j,onChange:b=>M(b.target.value),className:"input-field"})]}),l.jsxs("div",{className:"input-group",children:[l.jsx("label",{className:"input-label",children:"Description"}),l.jsx("textarea",{placeholder:"Short mouth-watering description...",value:s,onChange:b=>o(b.target.value),className:"textarea-field"})]})]}),l.jsxs("div",{className:"form-section",children:[l.jsxs("div",{className:"section-header-row",children:[l.jsxs("h3",{children:[l.jsx(En,{size:18,color:"var(--accent-primary)"})," Ingredients Split by Part/Section"]}),l.jsxs("button",{type:"button",className:"btn btn-secondary btn-sm",onClick:L,children:[l.jsx(qr,{size:16}),l.jsx("span",{children:"Add Part / Section"})]})]}),m.map((b,N)=>l.jsxs("div",{className:"section-editor-card",children:[l.jsxs("div",{className:"section-title-row",children:[l.jsx("input",{type:"text",placeholder:"Section Name (e.g. For the Sauce)",value:b.title,onChange:v=>z(b.id,v.target.value),className:"input-field section-title-input"}),m.length>1&&l.jsx("button",{type:"button",className:"btn btn-outline btn-icon danger",onClick:()=>O(b.id),title:"Remove Section",children:l.jsx(Si,{size:16})})]}),l.jsxs("div",{className:"items-list-editor",children:[b.items.map(v=>l.jsxs("div",{className:"item-row",children:[l.jsx("input",{type:"number",step:"any",placeholder:"Qty",value:v.amount||"",onChange:f=>W(b.id,v.id,"amount",parseFloat(f.target.value)||0),className:"input-field item-qty"}),l.jsx("input",{type:"text",placeholder:"Unit (g, ml, tbsp)",value:v.unit,onChange:f=>W(b.id,v.id,"unit",f.target.value),className:"input-field item-unit"}),l.jsx("input",{type:"text",placeholder:"Ingredient Name",value:v.name,onChange:f=>W(b.id,v.id,"name",f.target.value),className:"input-field item-name"}),l.jsx("input",{type:"text",placeholder:"Notes (diced, cold)",value:v.notes||"",onChange:f=>W(b.id,v.id,"notes",f.target.value),className:"input-field item-notes"}),l.jsx("button",{type:"button",className:"btn btn-outline btn-icon danger",onClick:()=>D(b.id,v.id),children:l.jsx(Ni,{size:14})})]},v.id)),l.jsxs("button",{type:"button",className:"btn btn-outline btn-sm add-item-btn",onClick:()=>I(b.id),children:[l.jsx(qr,{size:14}),l.jsxs("span",{children:["Add Ingredient to ",b.title||"Section"]})]})]})]},b.id))]}),l.jsxs("div",{className:"form-section",children:[l.jsxs("div",{className:"section-header-row",children:[l.jsx("h3",{children:"Method / Instruction Steps"}),l.jsxs("button",{type:"button",className:"btn btn-secondary btn-sm",onClick:U,children:[l.jsx(qr,{size:16}),l.jsx("span",{children:"Add Step"})]})]}),l.jsx("div",{className:"steps-editor-list",children:C.map((b,N)=>l.jsxs("div",{className:"step-editor-row",children:[l.jsx("span",{className:"step-badge",children:b.stepNumber}),l.jsx("textarea",{placeholder:`Describe Step ${b.stepNumber}...`,value:b.text,onChange:v=>te(b.id,"text",v.target.value),className:"textarea-field step-text-input"}),l.jsxs("div",{className:"step-timer-input",children:[l.jsx(fo,{size:14}),l.jsx("input",{type:"number",placeholder:"Timer (m)",value:b.timerMinutes||"",onChange:v=>te(b.id,"timerMinutes",parseInt(v.target.value)||void 0),className:"input-field"})]}),l.jsx("button",{type:"button",className:"btn btn-outline btn-icon danger",onClick:()=>K(b.id),children:l.jsx(Si,{size:16})})]},b.id))})]}),l.jsxs("div",{className:"modal-footer",children:[l.jsx("button",{type:"button",className:"btn btn-secondary",onClick:n,children:"Cancel"}),l.jsxs("button",{type:"submit",className:"btn btn-primary",children:[l.jsx(cm,{size:18}),l.jsx("span",{children:"Save Recipe"})]})]})]})]}),l.jsx("style",{children:`
        .recipe-form-modal {
          max-width: 820px;
        }
        .form-body {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-color);
        }
        .form-section h3 {
          font-size: 1.1rem;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .section-editor-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .section-title-row {
          display: flex;
          gap: 0.5rem;
        }
        .section-title-input {
          font-weight: 700;
          color: var(--accent-primary);
        }
        .items-list-editor {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .item-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .item-qty { width: 75px; }
        .item-unit { width: 110px; }
        .item-name { flex: 2; }
        .item-notes { flex: 1; }
        .add-item-btn {
          align-self: flex-start;
          margin-top: 0.25rem;
        }
        .steps-editor-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .step-editor-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .step-badge {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          background: var(--accent-primary);
          color: #ffffff;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 4px;
        }
        .step-text-input {
          flex: 1;
          min-height: 60px;
        }
        .step-timer-input {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          width: 110px;
        }
      `})]})};var Cm={exports:{}};(function(e){var t=function(n){var r=Object.prototype,i=r.hasOwnProperty,s=Object.defineProperty||function(v,f,S){v[f]=S.value},o,a=typeof Symbol=="function"?Symbol:{},u=a.iterator||"@@iterator",d=a.asyncIterator||"@@asyncIterator",x=a.toStringTag||"@@toStringTag";function h(v,f,S){return Object.defineProperty(v,f,{value:S,enumerable:!0,configurable:!0,writable:!0}),v[f]}try{h({},"")}catch{h=function(f,S,_){return f[S]=_}}function g(v,f,S,_){var E=f&&f.prototype instanceof m?f:m,R=Object.create(E.prototype),H=new ge(_||[]);return s(R,"_invoke",{value:D(v,S,H)}),R}n.wrap=g;function w(v,f,S){try{return{type:"normal",arg:v.call(f,S)}}catch(_){return{type:"throw",arg:_}}}var k="suspendedStart",j="suspendedYield",M="executing",p="completed",c={};function m(){}function y(){}function C(){}var P={};h(P,u,function(){return this});var L=Object.getPrototypeOf,z=L&&L(L(b([])));z&&z!==r&&i.call(z,u)&&(P=z);var O=C.prototype=m.prototype=Object.create(P);y.prototype=C,s(O,"constructor",{value:C,configurable:!0}),s(C,"constructor",{value:y,configurable:!0}),y.displayName=h(C,x,"GeneratorFunction");function I(v){["next","throw","return"].forEach(function(f){h(v,f,function(S){return this._invoke(f,S)})})}n.isGeneratorFunction=function(v){var f=typeof v=="function"&&v.constructor;return f?f===y||(f.displayName||f.name)==="GeneratorFunction":!1},n.mark=function(v){return Object.setPrototypeOf?Object.setPrototypeOf(v,C):(v.__proto__=C,h(v,x,"GeneratorFunction")),v.prototype=Object.create(O),v},n.awrap=function(v){return{__await:v}};function W(v,f){function S(R,H,V,Q){var Z=w(v[R],v,H);if(Z.type==="throw")Q(Z.arg);else{var ft=Z.arg,tt=ft.value;return tt&&typeof tt=="object"&&i.call(tt,"__await")?f.resolve(tt.__await).then(function(nt){S("next",nt,V,Q)},function(nt){S("throw",nt,V,Q)}):f.resolve(tt).then(function(nt){ft.value=nt,V(ft)},function(nt){return S("throw",nt,V,Q)})}}var _;function E(R,H){function V(){return new f(function(Q,Z){S(R,H,Q,Z)})}return _=_?_.then(V,V):V()}s(this,"_invoke",{value:E})}I(W.prototype),h(W.prototype,d,function(){return this}),n.AsyncIterator=W,n.async=function(v,f,S,_,E){E===void 0&&(E=Promise);var R=new W(g(v,f,S,_),E);return n.isGeneratorFunction(f)?R:R.next().then(function(H){return H.done?H.value:R.next()})};function D(v,f,S){var _=k;return function(R,H){if(_===M)throw new Error("Generator is already running");if(_===p){if(R==="throw")throw H;return N()}for(S.method=R,S.arg=H;;){var V=S.delegate;if(V){var Q=U(V,S);if(Q){if(Q===c)continue;return Q}}if(S.method==="next")S.sent=S._sent=S.arg;else if(S.method==="throw"){if(_===k)throw _=p,S.arg;S.dispatchException(S.arg)}else S.method==="return"&&S.abrupt("return",S.arg);_=M;var Z=w(v,f,S);if(Z.type==="normal"){if(_=S.done?p:j,Z.arg===c)continue;return{value:Z.arg,done:S.done}}else Z.type==="throw"&&(_=p,S.method="throw",S.arg=Z.arg)}}}function U(v,f){var S=f.method,_=v.iterator[S];if(_===o)return f.delegate=null,S==="throw"&&v.iterator.return&&(f.method="return",f.arg=o,U(v,f),f.method==="throw")||S!=="return"&&(f.method="throw",f.arg=new TypeError("The iterator does not provide a '"+S+"' method")),c;var E=w(_,v.iterator,f.arg);if(E.type==="throw")return f.method="throw",f.arg=E.arg,f.delegate=null,c;var R=E.arg;if(!R)return f.method="throw",f.arg=new TypeError("iterator result is not an object"),f.delegate=null,c;if(R.done)f[v.resultName]=R.value,f.next=v.nextLoc,f.method!=="return"&&(f.method="next",f.arg=o);else return R;return f.delegate=null,c}I(O),h(O,x,"Generator"),h(O,u,function(){return this}),h(O,"toString",function(){return"[object Generator]"});function te(v){var f={tryLoc:v[0]};1 in v&&(f.catchLoc=v[1]),2 in v&&(f.finallyLoc=v[2],f.afterLoc=v[3]),this.tryEntries.push(f)}function K(v){var f=v.completion||{};f.type="normal",delete f.arg,v.completion=f}function ge(v){this.tryEntries=[{tryLoc:"root"}],v.forEach(te,this),this.reset(!0)}n.keys=function(v){var f=Object(v),S=[];for(var _ in f)S.push(_);return S.reverse(),function E(){for(;S.length;){var R=S.pop();if(R in f)return E.value=R,E.done=!1,E}return E.done=!0,E}};function b(v){if(v){var f=v[u];if(f)return f.call(v);if(typeof v.next=="function")return v;if(!isNaN(v.length)){var S=-1,_=function E(){for(;++S<v.length;)if(i.call(v,S))return E.value=v[S],E.done=!1,E;return E.value=o,E.done=!0,E};return _.next=_}}return{next:N}}n.values=b;function N(){return{value:o,done:!0}}return ge.prototype={constructor:ge,reset:function(v){if(this.prev=0,this.next=0,this.sent=this._sent=o,this.done=!1,this.delegate=null,this.method="next",this.arg=o,this.tryEntries.forEach(K),!v)for(var f in this)f.charAt(0)==="t"&&i.call(this,f)&&!isNaN(+f.slice(1))&&(this[f]=o)},stop:function(){this.done=!0;var v=this.tryEntries[0],f=v.completion;if(f.type==="throw")throw f.arg;return this.rval},dispatchException:function(v){if(this.done)throw v;var f=this;function S(Q,Z){return R.type="throw",R.arg=v,f.next=Q,Z&&(f.method="next",f.arg=o),!!Z}for(var _=this.tryEntries.length-1;_>=0;--_){var E=this.tryEntries[_],R=E.completion;if(E.tryLoc==="root")return S("end");if(E.tryLoc<=this.prev){var H=i.call(E,"catchLoc"),V=i.call(E,"finallyLoc");if(H&&V){if(this.prev<E.catchLoc)return S(E.catchLoc,!0);if(this.prev<E.finallyLoc)return S(E.finallyLoc)}else if(H){if(this.prev<E.catchLoc)return S(E.catchLoc,!0)}else if(V){if(this.prev<E.finallyLoc)return S(E.finallyLoc)}else throw new Error("try statement without catch or finally")}}},abrupt:function(v,f){for(var S=this.tryEntries.length-1;S>=0;--S){var _=this.tryEntries[S];if(_.tryLoc<=this.prev&&i.call(_,"finallyLoc")&&this.prev<_.finallyLoc){var E=_;break}}E&&(v==="break"||v==="continue")&&E.tryLoc<=f&&f<=E.finallyLoc&&(E=null);var R=E?E.completion:{};return R.type=v,R.arg=f,E?(this.method="next",this.next=E.finallyLoc,c):this.complete(R)},complete:function(v,f){if(v.type==="throw")throw v.arg;return v.type==="break"||v.type==="continue"?this.next=v.arg:v.type==="return"?(this.rval=this.arg=v.arg,this.method="return",this.next="end"):v.type==="normal"&&f&&(this.next=f),c},finish:function(v){for(var f=this.tryEntries.length-1;f>=0;--f){var S=this.tryEntries[f];if(S.finallyLoc===v)return this.complete(S.completion,S.afterLoc),K(S),c}},catch:function(v){for(var f=this.tryEntries.length-1;f>=0;--f){var S=this.tryEntries[f];if(S.tryLoc===v){var _=S.completion;if(_.type==="throw"){var E=_.arg;K(S)}return E}}throw new Error("illegal catch attempt")},delegateYield:function(v,f,S){return this.delegate={iterator:b(v),resultName:f,nextLoc:S},this.method==="next"&&(this.arg=o),c}},n}(e.exports);try{regeneratorRuntime=t}catch{typeof globalThis=="object"?globalThis.regeneratorRuntime=t:Function("r","regeneratorRuntime = r")(t)}})(Cm);var sd=(e,t)=>`${e}-${t}-${Math.random().toString(16).slice(3,8)}`;const zm=sd;let Ma=0;var Em=({id:e,action:t,payload:n={}})=>{let r=e;return typeof r>"u"&&(r=zm("Job",Ma),Ma+=1),{id:r,action:t,payload:n}},Ui={};let ho=!1;Ui.logging=ho;Ui.setLogging=e=>{ho=e};Ui.log=(...e)=>ho?console.log.apply(void 0,e):null;function bm(e){throw new Error('Could not dynamically require "'+e+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}function Tm(){return!!(typeof window<"u"&&typeof window.process=="object"&&window.process.type==="renderer"||typeof process<"u"&&typeof process.versions=="object"&&process.versions.electron||typeof navigator=="object"&&typeof navigator.userAgent=="string"&&navigator.userAgent.indexOf("Electron")>=0)}var Pm=Tm;const Lm=Pm;var _m=e=>{const t={};return typeof WorkerGlobalScope<"u"?t.type="webworker":Lm()?t.type="electron":typeof document=="object"?t.type="browser":typeof process=="object"&&typeof bm=="function"&&(t.type="node"),typeof e>"u"?t:t[e]};const Mm=_m("type")==="browser",Im=Mm?e=>new URL(e,window.location.href).href:e=>e;var Rm=e=>{const t={...e};return["corePath","workerPath","langPath"].forEach(n=>{e[n]&&(t[n]=Im(t[n]))}),t},Om=e=>{const t=[],n=[],r=[],i=[],s=[];return e.blocks&&e.blocks.forEach(o=>{o.paragraphs.forEach(a=>{a.lines.forEach(u=>{u.words.forEach(d=>{d.symbols.forEach(x=>{s.push({...x,page:e,block:o,paragraph:a,line:u,word:d})}),i.push({...d,page:e,block:o,paragraph:a,line:u})}),r.push({...u,page:e,block:o,paragraph:a})}),n.push({...a,page:e,block:o})}),t.push({...o,page:e})}),{...e,blocks:t,paragraphs:n,lines:r,words:i,symbols:s}},Fm={TESSERACT_ONLY:0,LSTM_ONLY:1,TESSERACT_LSTM_COMBINED:2,DEFAULT:3};const Am="5.1.1",Dm={version:Am};var $m={workerBlobURL:!0,logger:()=>{}};const Um=Dm.version,Vm=$m;var Bm={...Vm,workerPath:`https://cdn.jsdelivr.net/npm/tesseract.js@v${Um}/dist/worker.min.js`},Hm=({workerPath:e,workerBlobURL:t})=>{let n;if(Blob&&URL&&t){const r=new Blob([`importScripts("${e}");`],{type:"application/javascript"});n=new Worker(URL.createObjectURL(r))}else n=new Worker(e);return n},Wm=e=>{e.terminate()},Qm=(e,t)=>{e.onmessage=({data:n})=>{t(n)}},Gm=async(e,t)=>{e.postMessage(t)};const hs=e=>new Promise((t,n)=>{const r=new FileReader;r.onload=()=>{t(r.result)},r.onerror=({target:{error:{code:i}}})=>{n(Error(`File could not be read! Code=${i}`))},r.readAsArrayBuffer(e)}),vl=async e=>{let t=e;if(typeof e>"u")return"undefined";if(typeof e=="string")/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(e)?t=atob(e.split(",")[1]).split("").map(n=>n.charCodeAt(0)):t=await(await fetch(e)).arrayBuffer();else if(typeof HTMLElement<"u"&&e instanceof HTMLElement)e.tagName==="IMG"&&(t=await vl(e.src)),e.tagName==="VIDEO"&&(t=await vl(e.poster)),e.tagName==="CANVAS"&&await new Promise(n=>{e.toBlob(async r=>{t=await hs(r),n()})});else if(typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas){const n=await e.convertToBlob();t=await hs(n)}else(e instanceof File||e instanceof Blob)&&(t=await hs(e));return new Uint8Array(t)};var Km=vl;const Ym=Bm,qm=Hm,Xm=Wm,Jm=Qm,Zm=Gm,eh=Km;var th={defaultOptions:Ym,spawnWorker:qm,terminateWorker:Xm,onMessage:Jm,send:Zm,loadImage:eh};const nh=Rm,rh=Om,Be=Em,{log:Ia}=Ui,ih=sd,Ot=Fm,{defaultOptions:sh,spawnWorker:lh,terminateWorker:oh,onMessage:ah,loadImage:Ra,send:uh}=th;let Oa=0;var ld=async(e="eng",t=Ot.LSTM_ONLY,n={},r={})=>{const i=ih("Worker",Oa),{logger:s,errorHandler:o,...a}=nh({...sh,...n}),u={},d={},x=typeof e=="string"?e.split("+"):e;let h=t,g=r;const w=[Ot.DEFAULT,Ot.LSTM_ONLY].includes(t)&&!a.legacyCore;let k,j;const M=new Promise((E,R)=>{j=E,k=R}),p=E=>{k(E.message)};let c=lh(a);c.onerror=p,Oa+=1;const m=(E,R)=>{u[E]=R},y=(E,R)=>{d[E]=R},C=({id:E,action:R,payload:H})=>new Promise((V,Q)=>{Ia(`[${i}]: Start ${E}, action=${R}`);const Z=`${R}-${E}`;m(Z,V),y(Z,Q),uh(c,{workerId:i,jobId:E,action:R,payload:H})}),P=()=>console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)"),L=E=>C(Be({id:E,action:"load",payload:{options:{lstmOnly:w,corePath:a.corePath,logging:a.logging}}})),z=(E,R,H)=>C(Be({id:H,action:"FS",payload:{method:"writeFile",args:[E,R]}})),O=(E,R)=>C(Be({id:R,action:"FS",payload:{method:"readFile",args:[E,{encoding:"utf8"}]}})),I=(E,R)=>C(Be({id:R,action:"FS",payload:{method:"unlink",args:[E]}})),W=(E,R,H)=>C(Be({id:H,action:"FS",payload:{method:E,args:R}})),D=()=>console.warn("`loadLanguage` is depreciated and should be removed from code (workers now come with language pre-loaded)"),U=(E,R)=>C(Be({id:R,action:"loadLanguage",payload:{langs:E,options:{langPath:a.langPath,dataPath:a.dataPath,cachePath:a.cachePath,cacheMethod:a.cacheMethod,gzip:a.gzip,lstmOnly:[Ot.DEFAULT,Ot.LSTM_ONLY].includes(h)&&!a.legacyLang}}})),te=()=>console.warn("`initialize` is depreciated and should be removed from code (workers now come pre-initialized)"),K=(E,R,H,V)=>C(Be({id:V,action:"initialize",payload:{langs:E,oem:R,config:H}})),ge=(E="eng",R,H,V)=>{if(w&&[Ot.TESSERACT_ONLY,Ot.TESSERACT_LSTM_COMBINED].includes(R))throw Error("Legacy model requested but code missing.");const Q=R||h;h=Q;const Z=H||g;g=Z;const tt=(typeof E=="string"?E.split("+"):E).filter(nt=>!x.includes(nt));return x.push(...tt),tt.length>0?U(tt,V).then(()=>K(E,Q,Z,V)):K(E,Q,Z,V)},b=(E={},R)=>C(Be({id:R,action:"setParameters",payload:{params:E}})),N=async(E,R={},H={blocks:!0,text:!0,hocr:!0,tsv:!0},V)=>C(Be({id:V,action:"recognize",payload:{image:await Ra(E),options:R,output:H}})),v=(E="Tesseract OCR Result",R=!1,H)=>(console.log("`getPDF` function is depreciated. `recognize` option `savePDF` should be used instead."),C(Be({id:H,action:"getPDF",payload:{title:E,textonly:R}}))),f=async(E,R)=>{if(w)throw Error("`worker.detect` requires Legacy model, which was not loaded.");return C(Be({id:R,action:"detect",payload:{image:await Ra(E)}}))},S=async()=>(c!==null&&(oh(c),c=null),Promise.resolve());ah(c,({workerId:E,jobId:R,status:H,action:V,data:Q})=>{const Z=`${V}-${R}`;if(H==="resolve"){Ia(`[${E}]: Complete ${R}`);let ft=Q;V==="recognize"?ft=rh(Q):V==="getPDF"&&(ft=Array.from({...Q,length:Object.keys(Q).length})),u[Z]({jobId:R,data:ft})}else if(H==="reject")if(d[Z](Q),V==="load"&&k(Q),o)o(Q);else throw Error(Q);else H==="progress"&&s({...Q,userJobId:R})});const _={id:i,worker:c,setResolve:m,setReject:y,load:P,writeText:z,readText:O,removeFile:I,FS:W,loadLanguage:D,initialize:te,reinitialize:ge,setParameters:b,recognize:N,getPDF:v,detect:f,terminate:S};return L().then(()=>U(e)).then(()=>K(e,t,r)).then(()=>j(_)).catch(()=>{}),M};const od=ld,ch=async(e,t,n)=>{const r=await od(t,1,n);return r.recognize(e).finally(async()=>{await r.terminate()})},dh=async(e,t)=>{const n=await od("osd",0,t);return n.detect(e).finally(async()=>{await n.terminate()})};var ph={recognize:ch,detect:dh};const fh=ld,mh=ph;var hh={createWorker:fh,...mh};function yn(e){return e?e.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&#8217;/g,"'").replace(/&#8211;/g,"-").replace(/&#8212;/g,"-").replace(/&frasl;/g,"/").replace(/½/g," 1/2 ").replace(/⅓/g," 1/3 ").replace(/⅔/g," 2/3 ").replace(/¼/g," 1/4 ").replace(/¾/g," 3/4 ").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim():""}function Fa(e){if(!e)return 0;const t=e.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);if(!t)return 0;const n=parseInt(t[1]||"0",10),r=parseInt(t[2]||"0",10);return n*60+r}function ad(e){const t=wm(e);return{id:`ing-parsed-${Math.random().toString(36).substr(2,9)}`,amount:t.amount,unit:t.unit,name:t.name,notes:t.notes}}function gh(e){const t=[];function n(r){if(!r)return;if(typeof r=="string"){const s=gl(yn(r));s.length>2&&t.push(s);return}if(Array.isArray(r)){r.forEach(n);return}if(r["@type"]==="HowToSection"||Array.isArray(r.itemListElement)){r.itemListElement&&n(r.itemListElement);return}const i=r.text||r.name||r.description||"";if(typeof i=="string"){const s=gl(yn(i));s.length>2&&t.push(s)}}return n(e),t.map((r,i)=>{let s;const o=r.match(/(?:bake|cook|boil|simmer|roast|rest|chill|leave|rise|heat)\s+(?:for\s+)?(\d+)\s*(?:min|mins|minutes|hour|hours)/i);if(o){const a=parseInt(o[1],10);s=r.toLowerCase().includes("hour")?a*60:a}return{id:`st-parsed-${i+1}`,stepNumber:i+1,text:r,timerMinutes:s}})}function xn(e){const t=e.split(`
`).map(g=>yn(g)).filter(Boolean);let n="Imported Recipe",r="",i=4,s=15,o=25;const a=[];let u={id:"sec-main",title:"Ingredients",items:[]};const d=[];let x=!1,h=1;for(let g=0;g<t.length;g++){const w=t[g];if(g===0&&w.length<90&&!w.match(/ingredient|instruction|method|step|servings/i)){n=w;continue}const k=w.match(/(?:serves|servings|yield|portions):\s*(\d+)/i);if(k){i=parseInt(k[1],10);continue}const j=w.match(/(?:prep|cook|total)\s*time:\s*(\d+)\s*(?:min|mins|minutes)?/i);if(j){const p=parseInt(j[1],10);w.toLowerCase().includes("prep")?s=p:o=p;continue}if((w.match(/^(?:for the|for|part\s*\d+:?|section\s*\d+:?|[\w\s]+ingredients?:?)$/i)||w.endsWith(":")&&!w.match(/prep|cook|servings|instructions|steps|method/i))&&!x){u.items.length>0&&a.push(u),u={id:`sec-${Math.random().toString(36).substr(2,7)}`,title:w.replace(":","").trim(),items:[]};continue}if(w.match(/^(?:instructions|method|directions|steps|preparation):?/i)){x=!0,u.items.length>0&&a.push(u);continue}if(x){const p=w.replace(/^(?:\d+[\.\)]|step\s*\d+:?)\s*/i,"").trim();if(p.length>3){let c;const m=p.match(/(?:bake|cook|boil|simmer|roast|rest|chill|leave)\s+(?:for\s+)?(\d+)\s*(?:min|mins|minutes)/i);m&&(c=parseInt(m[1],10)),d.push({id:`st-parsed-${h}`,stepNumber:h++,text:p,timerMinutes:c})}}else w.length>2&&u.items.push(ad(w))}return u.items.length>0&&!a.includes(u)&&a.push(u),a.length===0&&a.push({id:"sec-default",title:"Ingredients",items:[{id:"ing-1",amount:1,unit:"tbsp",name:"Sample Ingredient"}]}),d.length===0&&d.push({id:"st-1",stepNumber:1,text:"Follow cooking instructions as per recipe source."}),{title:n,description:r,servings:i,prepTime:s,cookTime:o,ingredientSections:a,instructions:d,category:"Main",tags:["Imported"],image:"https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1000&q=80"}}async function vh(e,t){try{t&&t(10,"Initializing OCR Engine...");const n=await hh.createWorker("eng");t&&t(40,"Scanning & Extracting Text from Image...");const r=await n.recognize(e);t&&t(85,"Analyzing Recipe Parts & Ingredients...");const i=r.data.text;return await n.terminate(),t&&t(100,"Parsing Complete!"),xn(i)}catch(n){throw console.error("OCR Parsing Error:",n),new Error("Failed to extract text from photo. Please try a clearer image or paste text manually.")}}function ud(e,t){var n;try{const r=/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;let i;for(;(i=r.exec(e))!==null;){const s=i[1].trim();try{const o=JSON.parse(s),a=d=>{if(!d)return null;if(Array.isArray(d)){for(const x of d){const h=a(x);if(h)return h}return null}return d["@type"]==="Recipe"||Array.isArray(d["@type"])&&d["@type"].includes("Recipe")?d:d["@graph"]?a(d["@graph"]):null},u=a(o);if(u){const d=yn(u.name||"Imported Recipe"),x=yn(u.description||"");let h=4;if(u.recipeYield){const m=Array.isArray(u.recipeYield)?u.recipeYield[0]:u.recipeYield,y=String(m).match(/\d+/);y&&(h=parseInt(y[0],10))}const g=Fa(u.prepTime)||15,w=Fa(u.cookTime)||20;let k="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80";u.image&&(typeof u.image=="string"?k=u.image:Array.isArray(u.image)?k=typeof u.image[0]=="string"?u.image[0]:((n=u.image[0])==null?void 0:n.url)||k:u.image.url&&(k=u.image.url));const j=u.recipeIngredient||[],M=[];let p={id:"sec-1",title:"Ingredients",items:[]};j.forEach(m=>{const y=yn(m);y.endsWith(":")||y.toLowerCase().startsWith("for the")||y.toLowerCase().startsWith("part")?(p.items.length>0&&M.push(p),p={id:`sec-${Math.random().toString(36).substr(2,6)}`,title:y.replace(":","").trim(),items:[]}):p.items.push(ad(y))}),p.items.length>0&&!M.includes(p)&&M.push(p);const c=gh(u.recipeInstructions||[]);return{title:d,description:x,servings:h,prepTime:g,cookTime:w,image:k,sourceUrl:t,ingredientSections:M,instructions:c.length>0?c:[{id:"st-1",stepNumber:1,text:"Follow instructions as per recipe source."}],category:"Main",tags:["Web Import"]}}}catch{}}return xn(e)}catch(r){return console.error("HTML parsing error:",r),null}}async function yh(e){const t=[r=>`https://corsproxy.io/?${encodeURIComponent(r)}`,r=>`https://api.allorigins.win/raw?url=${encodeURIComponent(r)}`,r=>`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(r)}`];let n="";for(const r of t)try{const i=r(e),s=await fetch(i);if(s.ok){const o=await s.text();if(o&&o.length>500){n=o;break}}}catch{}if(n){const r=ud(n,e);if(r)return r}throw new Error('Unable to automatically fetch URL due to website CORS restrictions. Please switch to the "Paste HTML/Text" option below to parse instantly!')}async function Aa(e,t,n=!1){var r,i,s,o,a;if(!t)return xn(e);try{const u=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${t}`,d=`
Analyze this recipe content and respond ONLY with a JSON object matching this schema:
{
  "title": "Recipe Title",
  "description": "Short description",
  "category": "Main" | "Appetizer" | "Dessert" | "Baking" | "Breakfast" | "Beverage" | "Side" | "Sauce",
  "servings": 4,
  "prepTime": 15,
  "cookTime": 25,
  "ingredientSections": [
    {
      "id": "sec-1",
      "title": "For the Pasta",
      "items": [
        { "id": "ing-1", "amount": 400, "unit": "g", "name": "Tagliatelle", "notes": "al dente" }
      ]
    }
  ],
  "instructions": [
    { "id": "st-1", "stepNumber": 1, "text": "Step description", "timerMinutes": 10 }
  ]
}
    `,x=n?[{parts:[{text:d},{inline_data:{mime_type:"image/jpeg",data:e.replace(/^data:image\/\w+;base64,/,"")}}]}]:[{parts:[{text:`${d}

Recipe Source Content:
${e}`}]}],h=await fetch(u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:x})});if(!h.ok)throw new Error(`Gemini API returned status ${h.status}`);const k=(((a=(o=(s=(i=(r=(await h.json()).candidates)==null?void 0:r[0])==null?void 0:i.content)==null?void 0:s.parts)==null?void 0:o[0])==null?void 0:a.text)||"").match(/\{[\s\S]*\}/);return k?JSON.parse(k[0]):xn(e)}catch(u){return console.error("Gemini API parse failed, falling back to client parser",u),xn(e)}}const xh=({onImportComplete:e,onClose:t})=>{var W,D,U,te,K,ge;const[n,r]=A.useState("url"),[i,s]=A.useState(""),[o,a]=A.useState(""),[u,d]=A.useState(null),[x,h]=A.useState(null),[g,w]=A.useState(!1),[k,j]=A.useState(""),[M,p]=A.useState(0),[c,m]=A.useState(""),[y,C]=A.useState(null),P=async b=>{if(b.preventDefault(),!!i.trim()){w(!0),m(""),j("Fetching & Extracting JSON-LD Recipe Data...");try{const N=cl();let v;N?v=await Aa(i,N,!1):v=await yh(i),C(v)}catch(N){m(N.message||"Failed to parse URL.")}finally{w(!1)}}},L=async b=>{var N,v;if(b.preventDefault(),!!o.trim()){w(!0),m(""),j("Parsing HTML & Text Content...");try{let f=ud(o,i||"Pasted Recipe");(!f||((N=f.ingredientSections)==null?void 0:N.length)===0&&((v=f.instructions)==null?void 0:v.length)===0)&&(f=xn(o)),C(f)}catch{m("Failed to parse pasted text.")}finally{w(!1)}}},z=b=>{if(b.target.files&&b.target.files[0]){const N=b.target.files[0];d(N);const v=new FileReader;v.onloadend=()=>{h(v.result)},v.readAsDataURL(N)}},O=async()=>{if(u){w(!0),m(""),p(10),j("Starting OCR Scanner...");try{const b=cl();let N;b&&x?N=await Aa(x,b,!0):N=await vh(u,(v,f)=>{p(v),j(f)}),x&&(N.image=x),C(N)}catch(b){m(b.message||"OCR parsing failed.")}finally{w(!1)}}},I=()=>{if(!y)return;const b={id:`imported-${Date.now()}`,title:y.title||"Imported Recipe",description:y.description||"Imported using GourmetCraft Parser.",category:y.category||"Main",prepTime:y.prepTime||15,cookTime:y.cookTime||20,servings:y.servings||4,image:y.image||"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80",sourceUrl:y.sourceUrl||(n==="url"?i:void 0),ingredientSections:y.ingredientSections||[],instructions:y.instructions||[],tags:y.tags||["Imported"],isFavorite:!1,createdAt:new Date().toISOString()};e(b)};return l.jsxs("div",{className:"modal-overlay",children:[l.jsxs("div",{className:"modal-content import-modal",children:[l.jsxs("div",{className:"modal-header",children:[l.jsxs("div",{className:"import-modal-title",children:[l.jsx(Pt,{size:22,color:"var(--accent-primary)"}),l.jsx("h2",{children:"Import Recipe"})]}),l.jsx("button",{className:"btn btn-secondary btn-icon",onClick:t,children:l.jsx(Ni,{size:20})})]}),l.jsxs("div",{className:"modal-body",children:[l.jsxs("div",{className:"import-tabs",children:[l.jsxs("button",{className:`import-tab ${n==="url"?"active":""}`,onClick:()=>{r("url"),C(null),m("")},children:[l.jsx(tm,{size:18}),l.jsx("span",{children:"Web URL"})]}),l.jsxs("button",{className:`import-tab ${n==="paste"?"active":""}`,onClick:()=>{r("paste"),C(null),m("")},children:[l.jsx(Jf,{size:18}),l.jsx("span",{children:"Paste HTML / Text"})]}),l.jsxs("button",{className:`import-tab ${n==="photo"?"active":""}`,onClick:()=>{r("photo"),C(null),m("")},children:[l.jsx(za,{size:18}),l.jsx("span",{children:"Photo / OCR"})]})]}),n==="url"&&!y&&l.jsxs("form",{onSubmit:P,className:"tab-content",children:[l.jsx("p",{className:"tab-hint",children:"Paste a recipe link from websites like Sally's Baking Addiction, Cookmate, BBC Good Food, AllRecipes, or any blog."}),l.jsxs("div",{className:"input-group",children:[l.jsx("label",{className:"input-label",children:"Recipe Web URL"}),l.jsx("input",{type:"url",required:!0,placeholder:"https://sallysbakingaddiction.com/homemade-pizza-crust-recipe/",value:i,onChange:b=>s(b.target.value),className:"input-field"})]}),l.jsxs("div",{className:"sample-urls",children:[l.jsx("span",{className:"sample-label",children:"Try recipe link:"}),l.jsx("button",{type:"button",className:"sample-btn",onClick:()=>s("https://sallysbakingaddiction.com/homemade-pizza-crust-recipe/"),children:"Sally's Homemade Pizza Dough"})]}),g?l.jsxs("div",{className:"loading-box card",children:[l.jsx(ms,{size:32,className:"spin-icon",color:"var(--accent-primary)"}),l.jsx("p",{children:k})]}):l.jsxs("button",{type:"submit",className:"btn btn-primary w-full",children:[l.jsx(Pt,{size:18}),l.jsx("span",{children:"Parse Web Recipe"})]})]}),n==="paste"&&!y&&l.jsxs("form",{onSubmit:L,className:"tab-content",children:[l.jsx("p",{className:"tab-hint",children:"Paste copied webpage HTML or recipe text directly. Supports standard schema tags and recipe parts!"}),l.jsxs("div",{className:"input-group",children:[l.jsx("label",{className:"input-label",children:"Recipe HTML or Text Content"}),l.jsx("textarea",{required:!0,placeholder:"Paste copied text or HTML from website here...",value:o,onChange:b=>a(b.target.value),className:"textarea-field paste-area"})]}),g?l.jsxs("div",{className:"loading-box card",children:[l.jsx(ms,{size:32,className:"spin-icon",color:"var(--accent-primary)"}),l.jsx("p",{children:k})]}):l.jsxs("button",{type:"submit",className:"btn btn-primary w-full",children:[l.jsx(Pt,{size:18}),l.jsx("span",{children:"Parse Pasted Content"})]})]}),n==="photo"&&!y&&l.jsxs("div",{className:"tab-content",children:[l.jsx("p",{className:"tab-hint",children:"Upload a clear photo or screenshot of a cookbook page or recipe card."}),l.jsx("div",{className:"file-dropzone card",children:x?l.jsxs("div",{className:"image-preview-container",children:[l.jsx("img",{src:x,alt:"Recipe Preview",className:"uploaded-preview"}),l.jsx("button",{type:"button",className:"btn btn-secondary btn-sm change-img-btn",onClick:()=>{d(null),h(null)},children:"Change Photo"})]}):l.jsxs("label",{className:"dropzone-label",children:[l.jsx(rd,{size:40,color:"var(--accent-primary)"}),l.jsx("span",{className:"dropzone-title",children:"Click or Drop Photo Here"}),l.jsx("span",{className:"dropzone-sub",children:"Supports JPG, PNG, WEBP"}),l.jsx("input",{type:"file",accept:"image/*",onChange:z,className:"file-input-hidden"})]})}),g?l.jsxs("div",{className:"loading-box card",children:[l.jsx(ms,{size:32,className:"spin-icon",color:"var(--accent-primary)"}),l.jsx("p",{children:k}),l.jsx("div",{className:"progress-bar",children:l.jsx("div",{className:"progress-fill",style:{width:`${M}%`}})})]}):l.jsxs("button",{type:"button",disabled:!u,onClick:O,className:"btn btn-primary w-full",children:[l.jsx(za,{size:18}),l.jsx("span",{children:"Scan & Parse Photo (OCR)"})]})]}),c&&l.jsxs("div",{className:"error-box",children:[l.jsx("p",{children:c}),n==="url"&&l.jsx("button",{type:"button",className:"btn btn-secondary btn-sm switch-tab-btn",onClick:()=>{r("paste"),m("")},children:"Switch to Paste HTML / Text Mode"})]}),y&&l.jsxs("div",{className:"parsed-preview-box card",children:[l.jsxs("div",{className:"preview-header",children:[l.jsx(pl,{size:20,color:"#10b981"}),l.jsx("h3",{children:"Recipe Parsed Successfully!"})]}),l.jsxs("div",{className:"preview-body",children:[l.jsxs("div",{className:"preview-title-row",children:[l.jsx("h4",{children:y.title}),l.jsxs("span",{className:"badge",children:[y.servings," portions"]})]}),l.jsx("p",{className:"preview-desc",children:y.description}),l.jsxs("div",{className:"preview-sections",children:[l.jsxs("h5",{children:[l.jsx(En,{size:16,color:"var(--accent-primary)"})," Detected Ingredient Parts (",((W=y.ingredientSections)==null?void 0:W.length)||0,"):"]}),(D=y.ingredientSections)==null?void 0:D.map(b=>l.jsxs("div",{className:"preview-sec-item",children:[l.jsxs("strong",{children:[b.title,":"]}),l.jsxs("span",{children:[" ",b.items.map(N=>`${N.amount} ${N.unit} ${N.name}`).join(", ")]})]},b.id))]}),l.jsxs("div",{className:"preview-steps",children:[l.jsxs("h5",{children:["Detected Steps (",((U=y.instructions)==null?void 0:U.length)||0,"):"]}),l.jsxs("ol",{className:"preview-steps-list",children:[(te=y.instructions)==null?void 0:te.slice(0,4).map(b=>l.jsxs("li",{children:[b.text.slice(0,100),"..."]},b.id)),(((K=y.instructions)==null?void 0:K.length)||0)>4&&l.jsxs("li",{className:"more-steps",children:["+ ",(((ge=y.instructions)==null?void 0:ge.length)||0)-4," more steps"]})]})]})]}),l.jsxs("div",{className:"preview-actions",children:[l.jsx("button",{className:"btn btn-secondary",onClick:()=>C(null),children:"Re-parse"}),l.jsxs("button",{className:"btn btn-primary",onClick:I,children:[l.jsx(pl,{size:18}),l.jsx("span",{children:"Save to My Recipes"})]})]})]})]})]}),l.jsx("style",{children:`
        .import-modal {
          max-width: 660px;
        }
        .import-modal-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .import-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          background: var(--bg-primary);
          padding: 0.35rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }
        .import-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.6rem 0.85rem;
          border: none;
          background: none;
          color: var(--text-muted);
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.88rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .import-tab.active {
          background: var(--bg-card);
          color: var(--accent-primary);
          box-shadow: var(--shadow-sm);
        }
        .tab-content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .tab-hint {
          font-size: 0.88rem;
          color: var(--text-muted);
        }
        .paste-area {
          min-height: 160px;
        }
        .sample-urls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }
        .sample-label {
          color: var(--text-dim);
        }
        .sample-btn {
          background: var(--badge-bg);
          color: var(--accent-primary);
          border: 1px solid var(--border-color);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          font-size: 0.8rem;
        }
        .file-dropzone {
          border: 2px dashed var(--border-color);
          padding: 2rem 1.5rem;
          text-align: center;
          cursor: pointer;
          position: relative;
        }
        .file-input-hidden {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .dropzone-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .dropzone-title {
          font-weight: 700;
          color: var(--text-main);
        }
        .dropzone-sub {
          font-size: 0.8rem;
          color: var(--text-dim);
        }
        .image-preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .uploaded-preview {
          max-height: 200px;
          border-radius: var(--radius-md);
          object-fit: cover;
        }
        .w-full {
          width: 100%;
        }
        .loading-box {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .progress-bar {
          width: 100%;
          height: 6px;
          background: var(--bg-input);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--accent-gradient);
          transition: width 0.3s ease;
        }
        .error-box {
          padding: 0.85rem 1rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .switch-tab-btn {
          align-self: flex-start;
        }
        .parsed-preview-box {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .preview-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
        }
        .preview-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .preview-sections {
          margin-top: 0.75rem;
          font-size: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .preview-sec-item {
          background: var(--bg-primary);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
        }
        .preview-steps {
          margin-top: 0.75rem;
          font-size: 0.85rem;
        }
        .preview-steps-list {
          padding-left: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-top: 0.35rem;
        }
        .more-steps {
          font-style: italic;
          color: var(--text-dim);
          list-style: none;
        }
        .preview-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
      `})]})};class wh{constructor(){mt(this,"recognition",null);mt(this,"isListening",!1);mt(this,"isSpeakingActive",!1);mt(this,"restartTimeout",null);mt(this,"onCommandCallback",null);mt(this,"onStatusCallback",null);mt(this,"selectedVoiceURI",null);this.initSpeechRecognition(),this.initVoices()}initSpeechRecognition(){const t=window.SpeechRecognition||window.webkitSpeechRecognition;t&&(this.recognition=new t,this.recognition.continuous=!1,this.recognition.interimResults=!1,this.recognition.lang="en-US",this.recognition.onresult=n=>{const r=n.results.length-1,i=n.results[r][0].transcript.toLowerCase().trim();this.onStatusCallback&&this.onStatusCallback(`Heard: "${i}"`),this.parseCommand(i)},this.recognition.onerror=n=>{console.warn("Speech recognition status:",n.error),(n.error==="not-allowed"||n.error==="service-not-allowed")&&(this.isListening=!1,this.onStatusCallback&&this.onStatusCallback("Microphone access denied"))},this.recognition.onend=()=>{this.isListening&&!this.isSpeakingActive&&(clearTimeout(this.restartTimeout),this.restartTimeout=setTimeout(()=>{if(this.isListening&&!this.isSpeakingActive)try{this.recognition.start()}catch{}},500))})}initVoices(){typeof window>"u"||!("speechSynthesis"in window)||window.speechSynthesis.onvoiceschanged!==void 0&&(window.speechSynthesis.onvoiceschanged=()=>{})}getNaturalVoices(){return typeof window>"u"||!("speechSynthesis"in window)?[]:window.speechSynthesis.getVoices().filter(t=>t.lang.startsWith("en"))}setCustomVoice(t){this.selectedVoiceURI=t}getSelectedVoiceName(){const t=this.getNaturalVoices();if(this.selectedVoiceURI){const n=t.find(r=>r.voiceURI===this.selectedVoiceURI);if(n)return n.name}return"Default System Voice"}isSupported(){return typeof window<"u"&&"speechSynthesis"in window}isSpeaking(){return typeof window<"u"&&"speechSynthesis"in window&&window.speechSynthesis.speaking}startListening(t,n){if(!this.recognition){n&&n("Voice recognition not supported in this browser");return}this.onCommandCallback=t,this.onStatusCallback=n||null,this.isListening=!0,clearTimeout(this.restartTimeout);try{this.recognition.start(),this.onStatusCallback&&this.onStatusCallback("Listening for voice commands...")}catch{}}stopListening(){if(this.isListening=!1,clearTimeout(this.restartTimeout),this.recognition)try{this.recognition.stop()}catch{}this.onStatusCallback&&this.onStatusCallback("Voice assistant paused")}parseCommand(t){this.onCommandCallback&&(t.includes("next")||t.includes("forward")?this.onCommandCallback("next",t):t.includes("previous")||t.includes("back")?this.onCommandCallback("previous",t):t.includes("repeat")||t.includes("read step")||t.includes("read step aloud")||t.includes("say step")||t.includes("speak")?this.onCommandCallback("repeat",t):t.includes("start timer")||t.includes("set timer")||t.includes("run timer")||t.includes("timer start")?this.onCommandCallback("start_timer",t):t.includes("pause timer")||t.includes("stop timer")?this.onCommandCallback("pause_timer",t):t.includes("reset timer")||t.includes("restart timer")?this.onCommandCallback("reset_timer",t):t.includes("ingredient")||t.includes("ingredients")||t.includes("show ingredient")||t.includes("view ingredient")?this.onCommandCallback("toggle_ingredients",t):(t.includes("complete")||t.includes("mark complete")||t.includes("done")||t.includes("finished"))&&this.onCommandCallback("mark_complete",t))}humanizeCulinaryText(t){return t?t.replace(/\b(\d+)\s*g\b/gi,"$1 grams").replace(/\b(\d+)\s*ml\b/gi,"$1 milliliters").replace(/\b(\d+)\s*kg\b/gi,"$1 kilograms").replace(/\b(\d+)\s*l\b/gi,"$1 liters").replace(/\b(\d+)\s*tsp\b/gi,"$1 teaspoons").replace(/\b(\d+)\s*tbsp\b/gi,"$1 tablespoons").replace(/\b(\d+)\s*mins?\b/gi,"$1 minutes").replace(/°C/g," degrees Celsius").replace(/°F/g," degrees Fahrenheit").replace(/[\/\\]/g," or ").replace(/\s+/g," ").trim():""}speak(t,n){if(typeof window>"u"||!("speechSynthesis"in window))return;const r=this.humanizeCulinaryText(t);if(r){if(this.isSpeakingActive=!0,this.recognition)try{this.recognition.stop()}catch{}try{window.speechSynthesis.cancel(),window.speechSynthesis.paused&&window.speechSynthesis.resume();const i=new SpeechSynthesisUtterance(r);if(i.lang="en-US",i.rate=.95,i.pitch=1,i.volume=1,this.selectedVoiceURI){const a=window.speechSynthesis.getVoices().find(u=>u.voiceURI===this.selectedVoiceURI);a&&(i.voice=a)}const s=()=>{this.isSpeakingActive=!1,n&&n(),this.isListening&&this.recognition&&(clearTimeout(this.restartTimeout),this.restartTimeout=setTimeout(()=>{if(this.isListening&&!this.isSpeakingActive)try{this.recognition.start()}catch{}},400))};i.onend=s,i.onerror=o=>{console.warn("Speech utterance error:",o),s()},window.speechSynthesis.speak(i)}catch(i){console.error("Speech synthesis direct call failed:",i),this.isSpeakingActive=!1,n&&n()}}}stopSpeaking(){if(this.isSpeakingActive=!1,typeof window<"u"&&"speechSynthesis"in window)try{window.speechSynthesis.cancel()}catch{}}}const pe=new wh,kh=({recipe:e,initialServings:t,onClose:n})=>{var v;const[r,i]=A.useState(0),[s,o]=A.useState(t||e.servings||4),[a,u]=A.useState(!1),[d,x]=A.useState({}),[h,g]=A.useState(!1),[w,k]=A.useState(!1),[j,M]=A.useState(!1),[p,c]=A.useState(""),[m,y]=A.useState(""),[C,P]=A.useState(null),[L,z]=A.useState(!1),O=e.instructions||[],I=O[r],W=s/(e.servings||1),D=()=>{if(j||pe.isSpeaking())pe.stopSpeaking(),M(!1);else{if(!I)return;const f=`Step ${I.stepNumber}. ${I.text}`;M(!0),pe.speak(f,()=>M(!1))}};A.useEffect(()=>{if(w&&I&&r>0){if(!I)return;const f=`Step ${I.stepNumber}. ${I.text}`;M(!0),pe.speak(f,()=>M(!1))}},[r]),A.useEffect(()=>()=>{pe.stopListening(),pe.stopSpeaking()},[]),A.useEffect(()=>{let f=null;return L&&C!==null&&C>0?f=setInterval(()=>{P(S=>S!==null&&S>0?S-1:0)},1e3):C===0&&(z(!1),pe.speak("Timer finished!")),()=>clearInterval(f)},[L,C]),A.useEffect(()=>{I!=null&&I.timerMinutes?(P(I.timerMinutes*60),z(!1)):(P(null),z(!1))},[r]);const U=(f,S)=>{switch(y(`Recognized: "${S}"`),setTimeout(()=>y(""),3e3),f){case"next":r<O.length-1&&i(_=>_+1);break;case"previous":r>0&&i(_=>_-1);break;case"repeat":D();break;case"start_timer":z(!0),pe.speak("Timer started");break;case"pause_timer":z(!1),pe.speak("Timer paused");break;case"reset_timer":z(!1),I!=null&&I.timerMinutes&&P(I.timerMinutes*60),pe.speak("Timer reset");break;case"toggle_ingredients":u(_=>!_);break;case"mark_complete":x(_=>({..._,[r]:!0})),pe.speak("Step marked complete");break}},te=()=>{h?(pe.stopListening(),g(!1),c("Voice Assistant Turned Off")):(pe.startListening(U,f=>c(f)),g(!0),pe.speak("Voice assistant ready. Say next step, set timer, or repeat."))},K=f=>{x(S=>({...S,[f]:!S[f]}))},ge=()=>{r<O.length-1&&i(f=>f+1)},b=()=>{r>0&&i(f=>f-1)},N=f=>{const S=Math.floor(f/60),_=f%60;return`${S.toString().padStart(2,"0")}:${_.toString().padStart(2,"0")}`};return l.jsxs("div",{className:"cook-mode-overlay",children:[l.jsxs("div",{className:"cook-mode-topbar",children:[l.jsxs("div",{className:"cook-mode-title-info",children:[l.jsx("span",{className:"cook-mode-badge",children:"COOK MODE"}),l.jsx("h2",{className:"cook-mode-recipe-title",children:e.title})]}),l.jsxs("div",{className:"cook-mode-top-actions",children:[l.jsxs("button",{className:`btn btn-sm voice-toggle-btn ${h?"active":""}`,onClick:te,title:h?"Voice Assistant Active (Click to Turn Off)":"Turn On Hands-free Voice Assistant",children:[h?l.jsx(im,{size:18,className:"mic-pulse"}):l.jsx(rm,{size:18}),l.jsx("span",{children:h?"Voice ON":"Voice OFF"})]}),l.jsxs("button",{className:`btn btn-secondary btn-sm ${j?"speaking active":""}`,onClick:D,title:j?"Stop Speaking":"Read Current Step Aloud",children:[j?l.jsx(La,{size:18,color:"#ef4444"}):l.jsx(Pa,{size:18}),l.jsx("span",{children:j?"Stop":"Read Step"})]}),l.jsxs("div",{className:"cook-mode-scaler",children:[l.jsx(ji,{size:16,color:"var(--accent-primary)"}),l.jsx("button",{className:"cook-scale-btn",onClick:()=>o(Math.max(1,s-1)),children:"-"}),l.jsxs("span",{className:"cook-scale-val",children:[s," portions"]}),l.jsx("button",{className:"cook-scale-btn",onClick:()=>o(s+1),children:"+"})]}),l.jsxs("button",{className:`btn btn-secondary btn-sm ${a?"active":""}`,onClick:()=>u(!a),children:[l.jsx(En,{size:16}),l.jsx("span",{children:a?"Hide Ingredients":"View Ingredients"})]}),l.jsx("button",{className:"btn btn-secondary btn-icon",onClick:n,title:"Exit Cook Mode",children:l.jsx(Ni,{size:22})})]})]}),h&&l.jsxs("div",{className:"voice-status-bar",children:[l.jsxs("div",{className:"voice-indicator",children:[l.jsx("span",{className:"mic-wave"}),l.jsxs("span",{children:["Listening for commands: ",l.jsx("strong",{children:'"Next Step"'}),", ",l.jsx("strong",{children:'"Set Timer"'}),", ",l.jsx("strong",{children:'"Repeat"'}),", ",l.jsx("strong",{children:'"Mark Complete"'})]})]}),l.jsxs("div",{className:"voice-controls-right",children:[l.jsxs("div",{className:"voice-selector-box",children:[l.jsx("span",{className:"voice-label",children:"Voice:"}),l.jsxs("select",{className:"voice-select",onChange:f=>pe.setCustomVoice(f.target.value),defaultValue:"",children:[l.jsx("option",{value:"",children:pe.getSelectedVoiceName()}),pe.getNaturalVoices().map(f=>l.jsxs("option",{value:f.voiceURI,children:[f.name," (",f.lang,")"]},f.voiceURI))]})]}),m&&l.jsxs("div",{className:"voice-feedback-badge",children:[l.jsx(Pt,{size:14}),l.jsx("span",{children:m})]})]})]}),l.jsxs("div",{className:"cook-mode-body",children:[a&&l.jsxs("div",{className:"cook-ingredients-drawer card",children:[l.jsxs("div",{className:"drawer-header",children:[l.jsxs("h3",{children:[l.jsx(En,{size:18,color:"var(--accent-primary)"})," Ingredients Reference"]}),l.jsxs("span",{className:"badge",children:[s," Portions"]})]}),l.jsx("div",{className:"drawer-sections",children:(v=e.ingredientSections)==null?void 0:v.map(f=>l.jsxs("div",{className:"drawer-sec",children:[l.jsx("h4",{className:"drawer-sec-title",children:f.title}),l.jsx("ul",{className:"drawer-ing-list",children:f.items.map(S=>{const _=(S.amount||0)*W;return l.jsxs("li",{className:"drawer-ing-item",children:[l.jsxs("span",{className:"drawer-ing-amt",children:[parseFloat(_.toFixed(2))," ",S.unit]}),l.jsx("span",{children:S.name})]},S.id)})})]},f.id))})]}),l.jsxs("div",{className:"cook-step-spotlight",children:[I?l.jsxs("div",{className:"step-card-active card",children:[l.jsxs("div",{className:"step-top-row",children:[l.jsxs("span",{className:"step-giant-number",children:["Step ",I.stepNumber," of ",O.length]}),l.jsxs("div",{className:"step-actions-group",children:[l.jsxs("button",{className:`btn btn-outline btn-sm speak-step-btn ${j?"active":""}`,onClick:D,title:j?"Stop Speaking":"Speak Step Aloud",children:[j?l.jsx(La,{size:16,color:"#ef4444"}):l.jsx(Pa,{size:16}),l.jsx("span",{children:j?"Stop":"Speak"})]}),l.jsxs("button",{className:`step-check-btn ${d[r]?"done":""}`,onClick:()=>K(r),children:[l.jsx(Yf,{size:22}),l.jsx("span",{children:d[r]?"Completed":"Mark Complete"})]})]})]}),l.jsx("div",{className:"step-main-text",children:l.jsx("p",{children:I.text})}),C!==null&&l.jsxs("div",{className:"cook-timer-box card",children:[l.jsxs("div",{className:"timer-display",children:[l.jsx(nd,{size:28,color:"var(--accent-primary)"}),l.jsx("span",{className:"timer-clock",children:N(C)})]}),l.jsxs("div",{className:"timer-controls",children:[L?l.jsxs("button",{className:"btn btn-secondary btn-sm",onClick:()=>z(!1),children:[l.jsx(sm,{size:16})," Pause"]}):l.jsxs("button",{className:"btn btn-primary btn-sm",onClick:()=>z(!0),children:[l.jsx(ed,{size:16,fill:"#ffffff"})," Start Timer"]}),l.jsxs("button",{className:"btn btn-outline btn-sm",onClick:()=>{z(!1),P((I.timerMinutes||5)*60)},children:[l.jsx(um,{size:16})," Reset"]})]})]})]}):l.jsx("div",{className:"step-card-active card",children:l.jsx("h2",{children:"You're all done! Bon Appétit! 🍕"})}),l.jsxs("div",{className:"cook-step-nav",children:[l.jsxs("button",{className:"btn btn-secondary btn-nav-step",disabled:r===0,onClick:b,children:[l.jsx(qf,{size:22}),l.jsx("span",{children:"Previous Step"})]}),l.jsx("div",{className:"step-dots",children:O.map((f,S)=>l.jsx("span",{className:`dot ${S===r?"active":""} ${d[S]?"completed":""}`,onClick:()=>i(S)},f.id))}),l.jsxs("button",{className:"btn btn-primary btn-nav-step",disabled:r>=O.length-1,onClick:ge,children:[l.jsx("span",{children:"Next Step"}),l.jsx(Xf,{size:22})]})]})]})]}),l.jsx("style",{children:`
        .cook-mode-overlay {
          position: fixed;
          inset: 0;
          background: #090a0f;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          color: #f3f4f6;
          animation: fadeIn 0.25s ease;
        }
        .cook-mode-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.5rem;
          background: #12151e;
          border-bottom: 1px solid #232838;
        }
        .cook-mode-title-info {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .cook-mode-badge {
          background: var(--accent-gradient);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.72rem;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          letter-spacing: 0.05em;
        }
        .cook-mode-recipe-title {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .cook-mode-top-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .voice-toggle-btn {
          background: #1a1e2b;
          border: 1px solid #2e3548;
          color: #9ca3af;
        }
        .voice-toggle-btn.active {
          background: var(--accent-primary);
          color: #ffffff;
          border-color: var(--accent-primary);
          box-shadow: 0 0 12px var(--accent-glow);
        }
        .mic-pulse {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .voice-status-bar {
          background: #181d2c;
          border-bottom: 1px solid #2e3548;
          padding: 0.45rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
          color: var(--accent-primary);
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .voice-controls-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .voice-selector-box {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .voice-label {
          color: var(--text-dim);
          font-weight: 600;
          font-size: 0.78rem;
        }
        .voice-select {
          background: #12151e;
          border: 1px solid #2e3548;
          color: #ffffff;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-size: 0.78rem;
          outline: none;
          cursor: pointer;
          max-width: 200px;
        }
        .voice-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .mic-wave {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .voice-feedback-badge {
          background: var(--badge-bg);
          color: var(--accent-primary);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-weight: 600;
        }
        .cook-mode-scaler {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #1a1e2b;
          border: 1px solid #2e3548;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
        }
        .cook-scale-btn {
          width: 24px;
          height: 24px;
          background: #282f42;
          border: none;
          color: #ffffff;
          border-radius: 4px;
          font-weight: 700;
          cursor: pointer;
        }
        .cook-scale-val {
          font-weight: 700;
          color: var(--accent-primary);
        }
        .cook-mode-body {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }
        .cook-ingredients-drawer {
          width: 320px;
          background: #141722;
          border-right: 1px solid #232838;
          padding: 1.25rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-radius: 0;
        }
        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .drawer-sections {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .drawer-sec-title {
          font-size: 0.92rem;
          color: var(--accent-primary);
          margin-bottom: 0.5rem;
        }
        .drawer-ing-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.88rem;
        }
        .drawer-ing-item {
          display: flex;
          gap: 0.5rem;
          padding: 0.35rem 0.5rem;
          background: #1c202e;
          border-radius: 6px;
        }
        .drawer-ing-amt {
          font-weight: 700;
          color: var(--accent-primary);
        }
        .cook-step-spotlight {
          flex: 1;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
        }
        .step-card-active {
          padding: 2.5rem;
          background: #141722;
          border: 1px solid #282f42;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .step-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .step-giant-number {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--accent-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .step-actions-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .step-check-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #1d2232;
          border: 1px solid #2e3548;
          color: #9ca3af;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          font-size: 0.85rem;
        }
        .step-check-btn.done {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border-color: #10b981;
        }
        .step-main-text p {
          font-size: 1.5rem;
          line-height: 1.6;
          font-weight: 500;
          color: #f3f4f6;
        }
        .cook-timer-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: #1c202e;
          border: 1px solid #2e3548;
        }
        .timer-display {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .timer-clock {
          font-family: monospace;
          font-size: 2rem;
          font-weight: 800;
          color: var(--accent-primary);
        }
        .timer-controls {
          display: flex;
          gap: 0.5rem;
        }
        .cook-step-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1.5rem;
        }
        .btn-nav-step {
          padding: 0.85rem 1.75rem;
          font-size: 1rem;
        }
        .step-dots {
          display: flex;
          gap: 0.5rem;
        }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: var(--radius-full);
          background: #282f42;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .dot.active {
          background: var(--accent-primary);
          transform: scale(1.3);
        }
        .dot.completed {
          background: #10b981;
        }
      `})]})},Sh=({items:e,onUpdateItems:t})=>{const[n,r]=A.useState(""),[i,s]=A.useState("1"),[o,a]=A.useState(""),u=k=>{const j=e.map(M=>M.id===k?{...M,checked:!M.checked}:M);t(j)},d=k=>{if(k.preventDefault(),!n.trim())return;const j={id:`shop-custom-${Date.now()}`,name:n.trim(),amount:parseFloat(i)||1,unit:o.trim(),recipeTitle:"Custom Item",checked:!1,category:"Pantry"};t([...e,j]),r(""),s("1"),a("")},x=()=>{t(e.filter(k=>!k.checked))},h=()=>{confirm("Clear entire shopping list?")&&t([])},g=()=>{window.print()},w={};return e.forEach(k=>{const j=k.category||"Other";w[j]||(w[j]=[]),w[j].push(k)}),l.jsxs("div",{className:"shopping-container",children:[l.jsxs("div",{className:"shopping-header card",children:[l.jsxs("div",{className:"shopping-title-box",children:[l.jsx("div",{className:"shopping-icon",children:l.jsx(ki,{size:24,color:"#ffffff"})}),l.jsxs("div",{children:[l.jsx("h2",{children:"Grocery Shopping List"}),l.jsxs("p",{className:"shopping-sub",children:[e.filter(k=>k.checked).length," of ",e.length," items checked"]})]})]}),l.jsxs("div",{className:"shopping-actions",children:[l.jsxs("button",{className:"btn btn-secondary btn-sm",onClick:g,children:[l.jsx(lm,{size:16}),l.jsx("span",{children:"Print List"})]}),l.jsxs("button",{className:"btn btn-outline btn-sm danger",onClick:x,children:[l.jsx(Si,{size:16}),l.jsx("span",{children:"Clear Checked"})]}),l.jsx("button",{className:"btn btn-outline btn-sm danger",onClick:h,children:l.jsx("span",{children:"Clear All"})})]})]}),l.jsxs("form",{onSubmit:d,className:"add-item-form card",children:[l.jsx("input",{type:"text",placeholder:"Add custom item (e.g. Olive Oil, Garlic)",value:n,onChange:k=>r(k.target.value),className:"input-field item-name-input"}),l.jsx("input",{type:"number",step:"any",placeholder:"Qty",value:i,onChange:k=>s(k.target.value),className:"input-field item-qty-input"}),l.jsx("input",{type:"text",placeholder:"Unit (g, bottle)",value:o,onChange:k=>a(k.target.value),className:"input-field item-unit-input"}),l.jsxs("button",{type:"submit",className:"btn btn-primary",children:[l.jsx(qr,{size:18}),l.jsx("span",{children:"Add"})]})]}),Object.keys(w).length>0?l.jsx("div",{className:"shopping-groups",children:Object.entries(w).map(([k,j])=>l.jsxs("div",{className:"category-group card",children:[l.jsxs("h3",{className:"cat-group-title",children:[k," (",j.length,")"]}),l.jsx("ul",{className:"shopping-items-list",children:j.map(M=>l.jsxs("li",{className:`shopping-item ${M.checked?"checked":""}`,onClick:()=>u(M.id),children:[l.jsx("div",{className:"item-checkbox",children:M.checked?l.jsx(dl,{size:20,color:"var(--accent-primary)"}):l.jsx(ml,{size:20,color:"var(--text-dim)"})}),l.jsxs("div",{className:"item-text",children:[l.jsxs("span",{className:"item-qty-badge",children:[M.amount," ",M.unit]}),l.jsx("span",{className:"item-name-text",children:M.name}),M.recipeTitle&&l.jsxs("span",{className:"item-recipe-tag",children:["from ",M.recipeTitle]})]})]},M.id))})]},k))}):l.jsxs("div",{className:"empty-shopping card",children:[l.jsx(ki,{size:48,color:"var(--text-dim)"}),l.jsx("h3",{children:"Your Shopping List is Empty"}),l.jsx("p",{children:'Go to your recipes and click "Add to List" or add custom grocery items above.'})]}),l.jsx("style",{children:`
        .shopping-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .shopping-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .shopping-title-box {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .shopping-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px var(--accent-glow);
        }
        .shopping-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
        }
        .shopping-actions {
          display: flex;
          gap: 0.5rem;
        }
        .add-item-form {
          padding: 1rem;
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .item-name-input { flex: 3; min-width: 180px; }
        .item-qty-input { width: 80px; }
        .item-unit-input { width: 120px; }
        .shopping-groups {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .category-group {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .cat-group-title {
          font-size: 1.05rem;
          color: var(--accent-primary);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }
        .shopping-items-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .shopping-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .shopping-item:hover {
          background: var(--bg-card-hover);
        }
        .shopping-item.checked {
          opacity: 0.5;
          text-decoration: line-through;
        }
        .item-text {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
          font-size: 0.95rem;
        }
        .item-qty-badge {
          font-weight: 700;
          color: var(--accent-primary);
        }
        .item-name-text {
          color: var(--text-main);
        }
        .item-recipe-tag {
          font-size: 0.78rem;
          color: var(--text-dim);
          background: var(--badge-bg);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
        }
        .empty-shopping {
          padding: 3rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
      `})]})},jh=({recipes:e,onImportBackup:t,onResetSeed:n,theme:r,toggleTheme:i})=>{const[s,o]=A.useState(cl()),[a,u]=A.useState(!1),d=g=>{g.preventDefault(),Wf(s.trim()),u(!0),setTimeout(()=>u(!1),2500)},x=()=>{const g="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(e,null,2)),w=document.createElement("a");w.setAttribute("href",g),w.setAttribute("download",`gourmet_craft_recipes_backup_${new Date().toISOString().slice(0,10)}.json`),document.body.appendChild(w),w.click(),w.remove()},h=g=>{if(g.target.files&&g.target.files[0]){const w=g.target.files[0],k=new FileReader;k.onload=j=>{var M;try{const p=JSON.parse((M=j.target)==null?void 0:M.result);Array.isArray(p)?(t(p),alert(`Successfully restored ${p.length} recipes!`)):alert("Invalid backup JSON format.")}catch{alert("Error parsing backup JSON file.")}},k.readAsText(w)}};return l.jsxs("div",{className:"settings-container",children:[l.jsx("div",{className:"settings-header card",children:l.jsxs("div",{className:"header-icon-title",children:[l.jsx("div",{className:"icon-box",children:l.jsx(td,{size:24,color:"#ffffff"})}),l.jsxs("div",{children:[l.jsx("h2",{children:"App Settings & Backup"}),l.jsx("p",{className:"sub-text",children:"Customize your preferences and backup your recipe library."})]})]})}),l.jsxs("div",{className:"settings-grid",children:[l.jsxs("div",{className:"settings-card card",children:[l.jsxs("div",{className:"card-sec-header",children:[r==="dark"?l.jsx(fl,{size:20,color:"var(--accent-primary)"}):l.jsx(hl,{size:20,color:"var(--accent-primary)"}),l.jsx("h3",{children:"Appearance"})]}),l.jsxs("div",{className:"setting-row",children:[l.jsxs("div",{children:[l.jsx("span",{className:"setting-name",children:"Theme Mode"}),l.jsx("p",{className:"setting-desc",children:"Switch between dark mode and warm gourmet light mode."})]}),l.jsxs("button",{className:"btn btn-secondary",onClick:i,children:[r==="dark"?l.jsx(hl,{size:18}):l.jsx(fl,{size:18}),l.jsx("span",{children:r==="dark"?"Light Mode":"Dark Mode"})]})]})]}),l.jsxs("div",{className:"settings-card card",children:[l.jsxs("div",{className:"card-sec-header",children:[l.jsx(Ea,{size:20,color:"var(--accent-primary)"}),l.jsx("h3",{children:"Backup & Export"})]}),l.jsxs("div",{className:"setting-row",children:[l.jsxs("div",{children:[l.jsx("span",{className:"setting-name",children:"Export Recipe Library (JSON)"}),l.jsxs("p",{className:"setting-desc",children:["Save a backup file of all your ",e.length," recipes."]})]}),l.jsxs("button",{className:"btn btn-primary btn-sm",onClick:x,children:[l.jsx(Ea,{size:16}),l.jsx("span",{children:"Export JSON"})]})]}),l.jsxs("div",{className:"setting-row",children:[l.jsxs("div",{children:[l.jsx("span",{className:"setting-name",children:"Restore Backup"}),l.jsx("p",{className:"setting-desc",children:"Import recipes from a Cookmate or GourmetCraft JSON file."})]}),l.jsxs("label",{className:"btn btn-secondary btn-sm file-label",children:[l.jsx(rd,{size:16}),l.jsx("span",{children:"Import JSON"}),l.jsx("input",{type:"file",accept:".json",onChange:h,className:"hidden-file-input"})]})]}),l.jsxs("div",{className:"setting-row",children:[l.jsxs("div",{children:[l.jsx("span",{className:"setting-name",children:"Reset Sample Recipes"}),l.jsx("p",{className:"setting-desc",children:"Restore original sample recipes with multi-part ingredients."})]}),l.jsxs("button",{className:"btn btn-outline btn-sm danger",onClick:()=>{confirm("Reset to sample recipes?")&&n()},children:[l.jsx(om,{size:16}),l.jsx("span",{children:"Reset"})]})]})]}),l.jsxs("div",{className:"settings-card card",children:[l.jsxs("div",{className:"card-sec-header",children:[l.jsx(Pt,{size:20,color:"var(--accent-primary)"}),l.jsx("h3",{children:"Advanced Gemini AI Integration (Optional)"})]}),l.jsxs("form",{onSubmit:d,className:"api-key-form",children:[l.jsx("p",{className:"setting-desc",children:"Provide your optional Gemini API key to unlock zero-shot vision OCR and intelligent web URL recipe parsing."}),l.jsxs("div",{className:"input-group",children:[l.jsx("label",{className:"input-label",children:"Gemini API Key"}),l.jsxs("div",{className:"input-with-icon",children:[l.jsx(nm,{size:18,className:"key-icon"}),l.jsx("input",{type:"password",placeholder:"AIzaSy...",value:s,onChange:g=>o(g.target.value),className:"input-field key-input"})]})]}),l.jsxs("button",{type:"submit",className:"btn btn-secondary btn-sm",children:[a?l.jsx(pl,{size:16,color:"#10b981"}):null,l.jsx("span",{children:a?"API Key Saved!":"Save Key"})]})]})]})]}),l.jsx("style",{children:`
        .settings-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .settings-header {
          padding: 1.5rem;
        }
        .header-icon-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .icon-box {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sub-text {
          color: var(--text-muted);
          font-size: 0.88rem;
        }
        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .settings-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .card-sec-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }
        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .setting-name {
          font-weight: 700;
          color: var(--text-main);
        }
        .setting-desc {
          font-size: 0.84rem;
          color: var(--text-muted);
        }
        .file-label {
          position: relative;
          cursor: pointer;
        }
        .hidden-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .api-key-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .input-with-icon {
          position: relative;
        }
        .key-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }
        .key-input {
          padding-left: 2.75rem;
        }
      `})]})};function Nh(){const[e,t]=A.useState([]),[n,r]=A.useState([]),[i,s]=A.useState(null),[o,a]=A.useState("recipes"),[u,d]=A.useState(""),[x,h]=A.useState(!1),[g,w]=A.useState(null),[k,j]=A.useState(!1),[M,p]=A.useState(null),[c,m]=A.useState("dark");A.useEffect(()=>{const D=Uf();t(D);const U=Vf();r(U);const te=Bf();m(te),document.documentElement.setAttribute("data-theme",te)},[]);const y=()=>{const D=c==="dark"?"light":"dark";m(D),Hf(D),document.documentElement.setAttribute("data-theme",D)},C=D=>{let U;e.some(K=>K.id===D.id)?U=e.map(K=>K.id===D.id?D:K):U=[D,...e],t(U),Jt(U),i&&i.id===D.id&&s(D),h(!1),w(null)},P=D=>{if(confirm("Are you sure you want to delete this recipe?")){const U=e.filter(te=>te.id!==D);t(U),Jt(U),i&&i.id===D&&s(null)}},L=(D,U)=>{U.stopPropagation();const te=e.map(K=>K.id===D?{...K,isFavorite:!K.isFavorite}:K);t(te),Jt(te),i&&i.id===D&&s(K=>K?{...K,isFavorite:!K.isFavorite}:null)},z=D=>{const U=[D,...e];t(U),Jt(U),j(!1),s(D),a("recipes")},O=D=>{r(D),Ca(D)},I=D=>{const U=[...n,...D];r(U),Ca(U),alert(`Added ${D.length} ingredients to your Shopping List!`)},W=()=>{t(Jn),Jt(Jn),s(null)};return l.jsxs("div",{className:"app-container",children:[l.jsx(hm,{currentTab:o,setCurrentTab:D=>{a(D),s(null)},searchQuery:u,setSearchQuery:d,onOpenAddModal:()=>{w(null),h(!0)},onOpenImportModal:()=>j(!0),theme:c,toggleTheme:y}),l.jsxs("main",{className:"main-content",children:[o==="recipes"&&(i?l.jsx(Sm,{recipe:i,onBack:()=>s(null),onEdit:D=>{w(D),h(!0)},onDelete:P,onToggleFavorite:L,onStartCookMode:(D,U)=>p({recipe:D,servings:U}),onAddToShoppingList:I}):l.jsx(ym,{recipes:e,searchQuery:u,onSelectRecipe:D=>s(D),onToggleFavorite:L,onOpenImportModal:()=>j(!0)})),o==="shopping"&&l.jsx(Sh,{items:n,onUpdateItems:O}),o==="settings"&&l.jsx(jh,{recipes:e,onImportBackup:D=>{t(D),Jt(D)},onResetSeed:W,theme:c,toggleTheme:y})]}),x&&l.jsx(Nm,{initialRecipe:g||void 0,onSave:C,onClose:()=>{h(!1),w(null)}}),k&&l.jsx(xh,{onImportComplete:z,onClose:()=>j(!1)}),M&&l.jsx(kh,{recipe:M.recipe,initialServings:M.servings,onClose:()=>p(null)})]})}gs.createRoot(document.getElementById("root")).render(l.jsx(bd.StrictMode,{children:l.jsx(Nh,{})}));
