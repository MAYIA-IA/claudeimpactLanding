import{t as e}from"./chunk-CFjPhJqf.js";var t=e(((e,t)=>{(function(n,r){typeof e==`object`&&typeof t==`object`?t.exports=r():typeof define==`function`&&define.amd?define([],r):typeof e==`object`?e.Websandbox=r():n.Websandbox=r()})(self,()=>(()=>{var e={466:(e=>{e.exports=`/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

// UNUSED EXPORTS: default

;// ./lib/object-path.ts
const PATH_REG = /([.[\\]:;'"\\s])/;
function escapePathPart(pathPart) {
    if (!PATH_REG.test(pathPart)) {
        return pathPart;
    }
    const escaped = pathPart.replace(new RegExp(PATH_REG.source, 'g'), '\\\\$1');
    return \`["\${escaped}"]\`;
}
function unescapePathPart(pathPart) {
    return pathPart.replace(/^\\["/, '').replace(/"]$/, '').replace(/\\\\/, '');
}
function splitPath(path) {
    const result = [];
    let lastEnd = 0;
    for (let i = 0; i < path.length; i++) {
        const char = path[i];
        if (PATH_REG.test(char) && path[i - 1] !== '\\\\') {
            result.push(path.substring(lastEnd, i));
            lastEnd = i + 1;
        }
    }
    result.push(path.substring(lastEnd, path.length));
    return result.filter(pathPart => !!pathPart).map(pathPart => pathPart.replace(/\\\\/g, ''));
}
/**
 * Extracts object property value by given path. Supports nested and array values: 'foo[0].bar'
 * @param {Object} object source object
 * @param {string} path path to value
 * @return {any | null} value by given path
 * */
function propertyByPath(object, path) {
    return splitPath(path).reduce((acc, pathPart) => {
        if (acc) {
            return acc[pathPart];
        }
        return null;
    }, object);
}

;// ./lib/connection.ts

const TYPE_MESSAGE = 'message';
const TYPE_RESPONSE = 'response';
const TYPE_SET_INTERFACE = 'set-interface';
const TYPE_SERVICE_MESSAGE = 'service-message';
// @ts-expect-error this is IE11 obsolete check. It is not typed
const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
const defaultOptions = {
    //Will not affect IE11 because there sandboxed iframe has not 'null' origin
    //but base URL of iframe's src
    allowedSenderOrigin: undefined
};
class Connection {
    constructor(postMessage, registerOnMessageListener, options = {}) {
        this.remote = {};
        this.serviceMethods = {};
        this.localApi = {};
        this.callbacks = {};
        this._resolveRemoteMethodsPromise = null;
        this.options = Object.assign(Object.assign({}, defaultOptions), options);
        //Random number between 0 and 100000
        this.incrementalID = Math.floor(Math.random() * 100000);
        this.postMessage = postMessage;
        this.remoteMethodsWaitPromise = new Promise(resolve => {
            this._resolveRemoteMethodsPromise = resolve;
        });
        registerOnMessageListener((e) => this.onMessageListener(e));
    }
    /**
       * Listens to remote messages. Calls local method if it is called outside or call stored callback if it is response.
       * @param e - onMessage event
       */
    onMessageListener(e) {
        const data = e.data;
        const { allowedSenderOrigin } = this.options;
        if (allowedSenderOrigin && e.origin !== allowedSenderOrigin && !isIE11) {
            return;
        }
        if (data.type === TYPE_RESPONSE) {
            this.popCallback(data.callId, data.success, data.result);
        }
        else if (data.type === TYPE_MESSAGE) {
            this
                .callLocalApi(data.methodName, data.arguments)
                .then(res => this.responseOtherSide(data.callId, res))
                .catch(err => this.responseOtherSide(data.callId, err, false));
        }
        else if (data.type === TYPE_SET_INTERFACE) {
            this.setInterface(data.apiMethods);
            this.responseOtherSide(data.callId);
        }
        else if (data.type === TYPE_SERVICE_MESSAGE) {
            this
                .callLocalServiceMethod(data.methodName, data.arguments)
                .then(res => this.responseOtherSide(data.callId, res))
                .catch(err => this.responseOtherSide(data.callId, err, false));
        }
    }
    postMessageToOtherSide(dataToPost) {
        this.postMessage(dataToPost, '*');
    }
    /**
       * Sets remote interface methods
       * @param remote - hash with keys of remote API methods. Values is ignored
       */
    setInterface(remoteMethods) {
        var _a;
        this.remote = {};
        remoteMethods.forEach((key) => {
            // If key is nested, we need to create nested structure
            const parts = splitPath(key);
            let current = this.remote;
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!current[part] || typeof current[part] !== 'object') {
                    current[part] = {};
                }
                current = current[part];
            }
            current[parts[parts.length - 1]] = this.createMethodWrapper(key);
        });
        (_a = this._resolveRemoteMethodsPromise) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    getMethodsFromInterface(api) {
        return Object.keys(api).reduce((acc, key) => {
            if (typeof api[key] === 'object') {
                acc.push(...this.getMethodsFromInterface(api[key]).map(subKey => \`\${key}.\${subKey}\`));
            }
            else {
                acc.push(key);
            }
            return acc;
        }, []);
    }
    setLocalApi(api) {
        return new Promise((resolve, reject) => {
            const id = this.registerCallback(resolve, reject);
            this.postMessageToOtherSide({
                callId: id,
                apiMethods: this.getMethodsFromInterface(api),
                type: TYPE_SET_INTERFACE
            });
        }).then(() => this.localApi = api);
    }
    setServiceMethods(api) {
        this.serviceMethods = api;
    }
    /**
       * Calls local method
       * @param methodName
       * @param args
       * @returns {Promise.<*>|string}
       */
    callLocalApi(methodName, args) {
        const method = propertyByPath(this.localApi, methodName);
        if (!method) {
            throw new Error(\`Local method "\${methodName}" is not registered\`);
        }
        return Promise.resolve(method.call(this, ...args));
    }
    /**
       * Calls local method registered as "service method"
       * @param methodName
       * @param args
       * @returns {Promise.<*>}
       */
    callLocalServiceMethod(methodName, args) {
        const method = propertyByPath(this.serviceMethods, methodName);
        if (!method) {
            throw new Error(\`Service method \${methodName} is not registered\`);
        }
        return Promise.resolve(method.call(this, ...args));
    }
    /**
       * Wraps remote method with callback storing code
       * @param methodName - method to wrap
       * @returns {Function} - function to call as remote API interface
       */
    createMethodWrapper(methodName) {
        return (...args) => {
            return this.callRemoteMethod(methodName, ...args);
        };
    }
    /**
       * Calls other side with arguments provided
       * @param id
       * @param methodName
       * @param args
       */
    callRemoteMethod(methodName, ...args) {
        return new Promise((resolve, reject) => {
            const id = this.registerCallback(resolve, reject);
            this.postMessageToOtherSide({
                callId: id,
                methodName: methodName,
                type: TYPE_MESSAGE,
                arguments: args
            });
        });
    }
    /**
       * Calls remote service method
       * @param methodName
       * @param args
       * @returns {*}
       */
    callRemoteServiceMethod(methodName, ...args) {
        return new Promise((resolve, reject) => {
            const id = this.registerCallback(resolve, reject);
            this.postMessageToOtherSide({
                callId: id,
                methodName: methodName,
                type: TYPE_SERVICE_MESSAGE,
                arguments: args
            });
        });
    }
    /**
       * Respond to remote call
       * @param id - remote call ID
       * @param result - result to pass to calling function
       */
    responseOtherSide(id, result, success = true) {
        if (result instanceof Error) {
            // Error could be non-serializable, so we copy properties manually
            result = [...Object.keys(result), 'message'].reduce((acc, it) => {
                acc[it] = result[it];
                return acc;
            }, {});
        }
        const doPost = () => this.postMessage({
            callId: id,
            type: TYPE_RESPONSE,
            success,
            result
        }, '*');
        try {
            doPost();
        }
        catch (err) {
            console.error('Failed to post response, recovering...', err); // eslint-disable-line no-console
            if (err instanceof DOMException) {
                result = JSON.parse(JSON.stringify(result));
                doPost();
            }
        }
    }
    /*
       * Stores callbacks to call later when remote call will be answered
       */
    registerCallback(successCallback, failureCallback) {
        const id = (++this.incrementalID).toString();
        this.callbacks[id] = { successCallback, failureCallback };
        return id;
    }
    /**
       * Calls and delete stored callback
       * @param id - call id
       * @param success - was call successful
       * @param result - result of remote call
       */
    popCallback(id, success, result) {
        const callback = this.callbacks[id];
        if (!callback) {
            return;
        }
        if (success) {
            callback.successCallback(result);
        }
        else {
            callback.failureCallback(result);
        }
        delete this.callbacks[id];
    }
}
/* harmony default export */ const connection = (Connection);

;// ./node_modules/ts-loader/index.js??ruleSet[1].rules[0]!./lib/frame.ts

class Frame {
    constructor() {
        this.connection = new connection(window.parent.postMessage.bind(window.parent), listener => {
            const sourceCheckListener = (event) => {
                if (event.source !== window.parent) {
                    return;
                }
                return listener(event);
            };
            window.addEventListener('message', sourceCheckListener);
        });
        this.connection.setServiceMethods({
            runCode: (code) => this.runCode(code),
            importScript: (path) => this.importScript(path),
            injectStyle: (style) => this.injectStyle(style),
            importStyle: (path) => this.importStyle(path)
        });
        this.connection.callRemoteServiceMethod('iframeInitialized');
    }
    /**
       * Creates script tag with passed code and attaches it. Runs synchronous
       * @param code
       */
    runCode(code) {
        const scriptTag = document.createElement('script');
        scriptTag.innerHTML = code;
        document.getElementsByTagName('head')[0].appendChild(scriptTag);
    }
    importScript(scriptUrl) {
        const scriptTag = document.createElement('script');
        scriptTag.src = scriptUrl;
        document.getElementsByTagName('head')[0].appendChild(scriptTag);
        return new Promise(resolve => scriptTag.onload = () => resolve());
    }
    injectStyle(style) {
        const styleTag = document.createElement('style');
        styleTag.innerHTML = style;
        document.getElementsByTagName('head')[0].appendChild(styleTag);
    }
    importStyle(styleUrl) {
        const linkTag = document.createElement('link');
        linkTag.rel = 'stylesheet';
        linkTag.href = styleUrl;
        document.getElementsByTagName('head')[0].appendChild(linkTag);
    }
}
// @ts-expect-error we explicitly export library to global namespace because
const Websandbox = window.Websandbox || new Frame();
// @ts-expect-error we explicitly export library to global namespace because
// Webpack won't do it for us when this file is loaded via code-loader
window.Websandbox = Websandbox;
/* harmony default export */ const ts_loader_ruleSet_1_rules_0_lib_frame = ((/* unused pure expression or super */ null && (Websandbox)));

/******/ })()
;
//# sourceMappingURL=compile-loader-file-name.js.map`})},t={};function n(r){var i=t[r];if(i!==void 0)return i.exports;var a=t[r]={exports:{}};return e[r](a,a.exports,n),a.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{typeof Symbol<`u`&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:`Module`}),Object.defineProperty(e,`__esModule`,{value:!0})};var r={};return(()=>{n.r(r),n.d(r,{BaseOptions:()=>h,default:()=>_});let e=/([.[\]:;'"\s])/;function t(t){let n=[],r=0;for(let i=0;i<t.length;i++){let a=t[i];e.test(a)&&t[i-1]!==`\\`&&(n.push(t.substring(r,i)),r=i+1)}return n.push(t.substring(r,t.length)),n.filter(e=>!!e).map(e=>e.replace(/\\/g,``))}function i(e,n){return t(n).reduce((e,t)=>e?e[t]:null,e)}let a=`message`,o=`response`,s=`set-interface`,c=`service-message`,l=!!window.MSInputMethodContext&&!!document.documentMode,u={allowedSenderOrigin:void 0};class d{constructor(e,t,n={}){this.remote={},this.serviceMethods={},this.localApi={},this.callbacks={},this._resolveRemoteMethodsPromise=null,this.options=Object.assign(Object.assign({},u),n),this.incrementalID=Math.floor(Math.random()*1e5),this.postMessage=e,this.remoteMethodsWaitPromise=new Promise(e=>{this._resolveRemoteMethodsPromise=e}),t(e=>this.onMessageListener(e))}onMessageListener(e){let t=e.data,{allowedSenderOrigin:n}=this.options;n&&e.origin!==n&&!l||(t.type===o?this.popCallback(t.callId,t.success,t.result):t.type===a?this.callLocalApi(t.methodName,t.arguments).then(e=>this.responseOtherSide(t.callId,e)).catch(e=>this.responseOtherSide(t.callId,e,!1)):t.type===s?(this.setInterface(t.apiMethods),this.responseOtherSide(t.callId)):t.type===c&&this.callLocalServiceMethod(t.methodName,t.arguments).then(e=>this.responseOtherSide(t.callId,e)).catch(e=>this.responseOtherSide(t.callId,e,!1)))}postMessageToOtherSide(e){this.postMessage(e,`*`)}setInterface(e){var n;this.remote={},e.forEach(e=>{let n=t(e),r=this.remote;for(let e=0;e<n.length-1;e++){let t=n[e];(!r[t]||typeof r[t]!=`object`)&&(r[t]={}),r=r[t]}r[n[n.length-1]]=this.createMethodWrapper(e)}),(n=this._resolveRemoteMethodsPromise)==null||n.call(this)}getMethodsFromInterface(e){return Object.keys(e).reduce((t,n)=>(typeof e[n]==`object`?t.push(...this.getMethodsFromInterface(e[n]).map(e=>`${n}.${e}`)):t.push(n),t),[])}setLocalApi(e){return new Promise((t,n)=>{let r=this.registerCallback(t,n);this.postMessageToOtherSide({callId:r,apiMethods:this.getMethodsFromInterface(e),type:s})}).then(()=>this.localApi=e)}setServiceMethods(e){this.serviceMethods=e}callLocalApi(e,t){let n=i(this.localApi,e);if(!n)throw Error(`Local method "${e}" is not registered`);return Promise.resolve(n.call(this,...t))}callLocalServiceMethod(e,t){let n=i(this.serviceMethods,e);if(!n)throw Error(`Service method ${e} is not registered`);return Promise.resolve(n.call(this,...t))}createMethodWrapper(e){return(...t)=>this.callRemoteMethod(e,...t)}callRemoteMethod(e,...t){return new Promise((n,r)=>{let i=this.registerCallback(n,r);this.postMessageToOtherSide({callId:i,methodName:e,type:a,arguments:t})})}callRemoteServiceMethod(e,...t){return new Promise((n,r)=>{let i=this.registerCallback(n,r);this.postMessageToOtherSide({callId:i,methodName:e,type:c,arguments:t})})}responseOtherSide(e,t,n=!0){t instanceof Error&&(t=[...Object.keys(t),`message`].reduce((e,n)=>(e[n]=t[n],e),{}));let r=()=>this.postMessage({callId:e,type:o,success:n,result:t},`*`);try{r()}catch(e){console.error(`Failed to post response, recovering...`,e),e instanceof DOMException&&(t=JSON.parse(JSON.stringify(t)),r())}}registerCallback(e,t){let n=(++this.incrementalID).toString();return this.callbacks[n]={successCallback:e,failureCallback:t},n}popCallback(e,t,n){let r=this.callbacks[e];r&&(t?r.successCallback(n):r.failureCallback(n),delete this.callbacks[e])}}let f=d;var p=n(466),m=n.n(p);let h={frameContainer:`body`,frameClassName:`websandbox__frame`,frameSrc:null,frameContent:`
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body></body>
</html>
  `,codeToRunBeforeInit:null,initialStyles:null,baseUrl:null,allowPointerLock:!1,allowFullScreen:!1,sandboxAdditionalAttributes:``};class g{static create(e,t={}){return new g(e,t)}constructor(e,t){this.connection=null,this.removeMessageListener=()=>{},this.validateOptions(t),this.options=Object.assign(Object.assign({},h),t),this.iframe=this.createIframe(),this.promise=new Promise(t=>{this.connection=new f(this.iframe.contentWindow.postMessage.bind(this.iframe.contentWindow),e=>{let t=t=>{if(t.source===this.iframe.contentWindow)return e(t)};window.addEventListener(`message`,t),this.removeMessageListener=()=>window.removeEventListener(`message`,t)},{allowedSenderOrigin:`null`}),this.connection.setServiceMethods({iframeInitialized:()=>this.connection.setLocalApi(e).then(()=>t(this))})})}validateOptions(e){if(e.frameSrc&&(e.frameContent||e.initialStyles||e.baseUrl||e.codeToRunBeforeInit))throw Error(`You can not set both "frameSrc" and any of frameContent,initialStyles,baseUrl,codeToRunBeforeInit options`);if(`frameContent`in e&&!e.frameContent?.includes(`<head>`))throw Error(`Websandbox: iFrame content must have "<head>" tag.`)}_prepareFrameContent(e){let t=e.frameContent??``;return e.codeToRunBeforeInit&&(t=t.replace(`<head>`,`<head>\n<script>${e.codeToRunBeforeInit}<\/script>`)??``),t=t.replace(`<head>`,`<head>\n<script>${m()}<\/script>`)??``,e.initialStyles&&(t=t.replace(`</head>`,`<style>${e.initialStyles}</style>\n</head>`)),e.baseUrl&&(t=t.replace(`<head>`,`<head>\n<base target="_parent" href="${e.baseUrl}"/>`)),t}createIframe(){let e=this.options.frameContainer,t=typeof e==`string`?document.querySelector(e):e;if(!t)throw Error(`Websandbox: Cannot find container for sandbox `+t);let n=document.createElement(`iframe`);return n.sandbox=`allow-scripts ${this.options.sandboxAdditionalAttributes}`,n.allow=`${this.options.allowAdditionalAttributes}`,n.className=this.options.frameClassName??``,this.options.allowFullScreen&&(n.allowFullscreen=!0),this.options.frameSrc?(n.src=this.options.frameSrc,t.appendChild(n),n):(n.setAttribute(`srcdoc`,this._prepareFrameContent(this.options)),t.appendChild(n),n)}destroy(){this.iframe.remove(),this.removeMessageListener()}_runCode(e){return this.connection.callRemoteServiceMethod(`runCode`,e)}_runFunction(e){return this._runCode(`(${e.toString()})()`)}run(e){return e.name?this._runFunction(e):this._runCode(e)}importScript(e){return this.connection.callRemoteServiceMethod(`importScript`,e)}injectStyle(e){return this.connection.callRemoteServiceMethod(`injectStyle`,e)}}let _=g})(),r})())}));export default t();