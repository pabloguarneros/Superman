(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){'use strict';var _magicSdk=require('magic-sdk');var m=new _magicSdk.Magic('pk_live_5AB8B9F6899198DC');},{"magic-sdk":52}],2:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var provider_1=require("@magic-sdk/provider");exports.Extension=provider_1.Extension;exports.SDKError=provider_1.MagicSDKError;exports.ExtensionError=provider_1.MagicExtensionError;exports.ExtensionWarning=provider_1.MagicExtensionWarning;exports.RPCError=provider_1.MagicRPCError;exports.SDKWarning=provider_1.MagicSDKWarning;exports.isPromiEvent=provider_1.isPromiEvent;tslib_1.__exportStar(require("@magic-sdk/types"),exports);},{"@magic-sdk/provider":9,"@magic-sdk/types":46,"tslib":55}],3:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var type_guards_1=require("../util/type-guards");var get_payload_id_1=require("../util/get-payload-id");var payloadPreprocessedSymbol=Symbol('Payload pre-processed by Magic SDK');function markPayloadAsPreprocessed(payload){Object.defineProperty(payload,payloadPreprocessedSymbol,{value:true,enumerable:false,});return payload;}
function isPayloadPreprocessed(payload){return!!payload[payloadPreprocessedSymbol];}
function standardizeJsonRpcRequestPayload(payload){var _a,_b,_c;if(!isPayloadPreprocessed(payload)){payload.jsonrpc=(_a=payload.jsonrpc)!==null&&_a!==void 0?_a:'2.0';payload.id=get_payload_id_1.getPayloadId();payload.method=(_b=payload.method)!==null&&_b!==void 0?_b:'noop';payload.params=(_c=payload.params)!==null&&_c!==void 0?_c:[];markPayloadAsPreprocessed(payload);}
return payload;}
exports.standardizeJsonRpcRequestPayload=standardizeJsonRpcRequestPayload;function createJsonRpcRequestPayload(method,params){if(params===void 0){params=[];}
return markPayloadAsPreprocessed({params:params,method:method,jsonrpc:'2.0',id:get_payload_id_1.getPayloadId(),});}
exports.createJsonRpcRequestPayload=createJsonRpcRequestPayload;var JsonRpcResponse=(function(){function JsonRpcResponse(responseOrPayload){if(responseOrPayload instanceof JsonRpcResponse){this._jsonrpc=responseOrPayload.payload.jsonrpc;this._id=responseOrPayload.payload.id;this._result=responseOrPayload.payload.result;this._error=responseOrPayload.payload.error;}
else if(type_guards_1.isJsonRpcResponsePayload(responseOrPayload)){this._jsonrpc=responseOrPayload.jsonrpc;this._id=responseOrPayload.id;this._result=responseOrPayload.result;this._error=responseOrPayload.error;}
else{this._jsonrpc=responseOrPayload.jsonrpc;this._id=responseOrPayload.id;this._result=undefined;this._error=undefined;}}
JsonRpcResponse.prototype.applyError=function(error){this._error=error;return this;};JsonRpcResponse.prototype.applyResult=function(result){this._result=result;return this;};Object.defineProperty(JsonRpcResponse.prototype,"hasError",{get:function(){return typeof this._error!=='undefined'&&this._error!==null;},enumerable:true,configurable:true});Object.defineProperty(JsonRpcResponse.prototype,"hasResult",{get:function(){return typeof this._result!=='undefined';},enumerable:true,configurable:true});Object.defineProperty(JsonRpcResponse.prototype,"payload",{get:function(){return{jsonrpc:this._jsonrpc,id:this._id,result:this._result,error:this._error,};},enumerable:true,configurable:true});return JsonRpcResponse;}());exports.JsonRpcResponse=JsonRpcResponse;},{"../util/get-payload-id":17,"../util/type-guards":21}],4:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var types_1=require("@magic-sdk/types");var json_rpc_1=require("./json-rpc");var promise_tools_1=require("../util/promise-tools");function getRequestPayloadFromBatch(requestPayload,id){return id&&Array.isArray(requestPayload)?requestPayload.find(function(p){return p.id===id;}):requestPayload;}
function standardizeResponse(requestPayload,event){var _a;var id=(_a=event.data.response)===null||_a===void 0?void 0:_a.id;var requestPayloadResolved=getRequestPayloadFromBatch(requestPayload,id);if(id&&requestPayloadResolved){var response=new json_rpc_1.JsonRpcResponse(requestPayloadResolved).applyResult(event.data.response.result).applyError(event.data.response.error);return{id:id,response:response};}
return{};}
var PayloadTransport=(function(){function PayloadTransport(endpoint,parameters){this.endpoint=endpoint;this.parameters=parameters;this.messageHandlers=new Set();this.init();}
PayloadTransport.prototype.post=function(overlay,msgType,payload){return tslib_1.__awaiter(this,void 0,void 0,function(){var _this=this;return tslib_1.__generator(this,function(_a){return[2,promise_tools_1.createPromise(function(resolve){return tslib_1.__awaiter(_this,void 0,void 0,function(){var batchData,batchIds,acknowledgeResponse,removeResponseListener;return tslib_1.__generator(this,function(_a){switch(_a.label){case 0:return[4,overlay.ready];case 1:_a.sent();batchData=[];batchIds=Array.isArray(payload)?payload.map(function(p){return p.id;}):[];return[4,overlay.postMessage({msgType:msgType+"-"+this.parameters,payload:payload})];case 2:_a.sent();acknowledgeResponse=function(removeEventListener){return function(event){var _a=standardizeResponse(payload,event),id=_a.id,response=_a.response;if(id&&response&&Array.isArray(payload)&&batchIds.includes(id)){batchData.push(response);if(batchData.length===payload.length){removeEventListener();resolve(batchData);}}
else if(id&&response&&!Array.isArray(payload)&&id===payload.id){removeEventListener();resolve(response);}};};removeResponseListener=this.on(types_1.MagicIncomingWindowMessage.MAGIC_HANDLE_RESPONSE,acknowledgeResponse(function(){return removeResponseListener();}));return[2];}});});})];});});};PayloadTransport.prototype.on=function(msgType,handler){var _this=this;var boundHandler=handler.bind(window);var listener=function(event){if(event.data.msgType===msgType+"-"+_this.parameters)
boundHandler(event);};this.messageHandlers.add(listener);return function(){return _this.messageHandlers.delete(listener);};};return PayloadTransport;}());exports.PayloadTransport=PayloadTransport;},{"../util/promise-tools":19,"./json-rpc":3,"@magic-sdk/types":46,"tslib":55}],5:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.SDKEnvironment={};function createSDK(SDKBaseCtor,environment){Object.assign(exports.SDKEnvironment,environment);return SDKBaseCtor;}
exports.createSDK=createSDK;exports.sdkNameToEnvName={'magic-sdk':'magic-sdk','@magic-sdk/react-native':'magic-sdk-rn',};},{}],6:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var types_1=require("@magic-sdk/types");var type_guards_1=require("../util/type-guards");var sdk_environment_1=require("./sdk-environment");var MagicSDKError=(function(_super){tslib_1.__extends(MagicSDKError,_super);function MagicSDKError(code,rawMessage){var _this=_super.call(this,"Magic SDK Error: ["+code+"] "+rawMessage)||this;_this.code=code;_this.rawMessage=rawMessage;_this.__proto__=Error;Object.setPrototypeOf(_this,MagicSDKError.prototype);return _this;}
return MagicSDKError;}(Error));exports.MagicSDKError=MagicSDKError;var MagicRPCError=(function(_super){tslib_1.__extends(MagicRPCError,_super);function MagicRPCError(sourceError){var _this=_super.call(this)||this;_this.__proto__=Error;var codeNormalized=Number(sourceError===null||sourceError===void 0?void 0:sourceError.code);_this.rawMessage=(sourceError===null||sourceError===void 0?void 0:sourceError.message)||'Internal error';_this.code=type_guards_1.isJsonRpcErrorCode(codeNormalized)?codeNormalized:types_1.RPCErrorCode.InternalError;_this.message="Magic RPC Error: ["+_this.code+"] "+_this.rawMessage;Object.setPrototypeOf(_this,MagicRPCError.prototype);return _this;}
return MagicRPCError;}(Error));exports.MagicRPCError=MagicRPCError;var MagicSDKWarning=(function(){function MagicSDKWarning(code,rawMessage){this.code=code;this.rawMessage=rawMessage;this.message="Magic SDK Warning: ["+code+"] "+rawMessage;}
MagicSDKWarning.prototype.log=function(){console.warn(this.message);};return MagicSDKWarning;}());exports.MagicSDKWarning=MagicSDKWarning;var MagicExtensionError=(function(_super){tslib_1.__extends(MagicExtensionError,_super);function MagicExtensionError(ext,code,rawMessage,data){var _this=_super.call(this,"Magic Extension Error ("+ext.name+"): ["+code+"] "+rawMessage)||this;_this.code=code;_this.rawMessage=rawMessage;_this.data=data;_this.__proto__=Error;Object.setPrototypeOf(_this,MagicExtensionError.prototype);return _this;}
return MagicExtensionError;}(Error));exports.MagicExtensionError=MagicExtensionError;var MagicExtensionWarning=(function(){function MagicExtensionWarning(ext,code,rawMessage){this.code=code;this.rawMessage=rawMessage;this.message="Magic Extension Warning ("+ext.name+"): ["+code+"] "+rawMessage;}
MagicExtensionWarning.prototype.log=function(){console.warn(this.message);};return MagicExtensionWarning;}());exports.MagicExtensionWarning=MagicExtensionWarning;function createMissingApiKeyError(){return new MagicSDKError(types_1.SDKErrorCode.MissingApiKey,'Please provide an API key that you acquired from the Magic developer dashboard.');}
exports.createMissingApiKeyError=createMissingApiKeyError;function createModalNotReadyError(){return new MagicSDKError(types_1.SDKErrorCode.ModalNotReady,'Modal is not ready.');}
exports.createModalNotReadyError=createModalNotReadyError;function createMalformedResponseError(){return new MagicSDKError(types_1.SDKErrorCode.MalformedResponse,'Response from the Magic iframe is malformed.');}
exports.createMalformedResponseError=createMalformedResponseError;function createExtensionNotInitializedError(member){return new MagicSDKError(types_1.SDKErrorCode.ExtensionNotInitialized,"Extensions must be initialized with a Magic SDK instance before `Extension."+member+"` can be accessed. Do not invoke `Extension."+member+"` inside an extension constructor.");}
exports.createExtensionNotInitializedError=createExtensionNotInitializedError;function createIncompatibleExtensionsError(extensions){var msg="Some extensions are incompatible with `"+sdk_environment_1.SDKEnvironment.sdkName+"@"+sdk_environment_1.SDKEnvironment.version+"`:";extensions.filter(function(ext){return typeof ext.compat!=='undefined'&&ext.compat!==null;}).forEach(function(ext){var compat=ext.compat[sdk_environment_1.SDKEnvironment.sdkName];if(typeof compat==='string'){msg+="\n  - Extension `"+ext.name+"` supports version(s) `"+compat+"`";}
else if(!compat){msg+="\n  - Extension `"+ext.name+"` does not support "+sdk_environment_1.SDKEnvironment.platform+" environments.";}});return new MagicSDKError(types_1.SDKErrorCode.IncompatibleExtensions,msg);}
exports.createIncompatibleExtensionsError=createIncompatibleExtensionsError;function createInvalidArgumentError(options){var ordinalSuffix=function(i){var iAdjusted=i+1;var j=iAdjusted%10;var k=iAdjusted%100;if(j===1&&k!==11)
return iAdjusted+"st";if(j===2&&k!==12)
return iAdjusted+"nd";if(j===3&&k!==13)
return iAdjusted+"rd";return iAdjusted+"th";};return new MagicSDKError(types_1.SDKErrorCode.InvalidArgument,"Invalid "+ordinalSuffix(options.argument)+" argument given to `"+options.procedure+"`.\n"+
("  Expected: `"+options.expected+"`\n")+
("  Received: `"+options.received+"`"));}
exports.createInvalidArgumentError=createInvalidArgumentError;function createDuplicateIframeWarning(){return new MagicSDKWarning(types_1.SDKWarningCode.DuplicateIframe,'Duplicate iframes found.');}
exports.createDuplicateIframeWarning=createDuplicateIframeWarning;function createSynchronousWeb3MethodWarning(){return new MagicSDKWarning(types_1.SDKWarningCode.SyncWeb3Method,'Non-async web3 methods are deprecated in web3 > 1.0 and are not supported by the Magic web3 provider. Please use an async method instead.');}
exports.createSynchronousWeb3MethodWarning=createSynchronousWeb3MethodWarning;function createReactNativeEndpointConfigurationWarning(){return new MagicSDKWarning(types_1.SDKWarningCode.ReactNativeEndpointConfiguration,"CUSTOM DOMAINS ARE NOT SUPPORTED WHEN USING MAGIC SDK WITH REACT NATIVE! The `endpoint` parameter SHOULD NOT be provided. The Magic `<iframe>` is automatically wrapped by a WebView pointed at `"+sdk_environment_1.SDKEnvironment.defaultEndpoint+"`. Changing this default behavior will lead to unexpected results and potentially security-threatening bugs.");}
exports.createReactNativeEndpointConfigurationWarning=createReactNativeEndpointConfigurationWarning;function createDeprecationWarning(options){var method=options.method,removalVersions=options.removalVersions,useInstead=options.useInstead;var removalVersion=removalVersions[sdk_environment_1.SDKEnvironment.sdkName];var useInsteadSuffix=useInstead?" Use `"+useInstead+"` instead.":'';var message="`"+method+"` will be removed from `"+sdk_environment_1.SDKEnvironment.sdkName+"` in version `"+removalVersion+"`."+useInsteadSuffix;return new MagicSDKWarning(types_1.SDKWarningCode.DeprecationNotice,message);}
exports.createDeprecationWarning=createDeprecationWarning;},{"../util/type-guards":21,"./sdk-environment":5,"@magic-sdk/types":46,"tslib":55}],7:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var satisfies_1=tslib_1.__importDefault(require("semver/functions/satisfies"));var base64_json_1=require("../util/base64-json");var sdk_exceptions_1=require("./sdk-exceptions");var auth_1=require("../modules/auth");var user_1=require("../modules/user");var rpc_provider_1=require("../modules/rpc-provider");var url_1=require("../util/url");var base_extension_1=require("../modules/base-extension");var type_guards_1=require("../util/type-guards");var sdk_environment_1=require("./sdk-environment");function checkExtensionCompat(ext){if(ext.compat){if(sdk_environment_1.SDKEnvironment.sdkName==='magic-sdk'){return typeof ext.compat['magic-sdk']==='string'?satisfies_1.default(sdk_environment_1.SDKEnvironment.version,ext.compat['magic-sdk']):!!ext.compat['magic-sdk'];}
if(sdk_environment_1.SDKEnvironment.sdkName==='@magic-sdk/react-native'){return typeof ext.compat['@magic-sdk/react-native']==='string'?satisfies_1.default(sdk_environment_1.SDKEnvironment.version,ext.compat['@magic-sdk/react-native']):!!ext.compat['@magic-sdk/react-native'];}}
return true;}
function prepareExtensions(options){var _this=this;var _a;var extensions=(_a=options===null||options===void 0?void 0:options.extensions)!==null&&_a!==void 0?_a:[];var extConfig={};var incompatibleExtensions=[];if(Array.isArray(extensions)){extensions.forEach(function(ext){if(checkExtensionCompat(ext)){ext.init(_this);_this[ext.name]=ext;if(ext instanceof base_extension_1.Extension.Internal){if(!type_guards_1.isEmpty(ext.config))
extConfig[ext.name]=ext.config;}}
else{incompatibleExtensions.push(ext);}});}
else{Object.keys(extensions).forEach(function(name){if(checkExtensionCompat(extensions[name])){extensions[name].init(_this);var ext=extensions[name];_this[name]=ext;if(ext instanceof base_extension_1.Extension.Internal){if(!type_guards_1.isEmpty(ext.config))
extConfig[extensions[name].name]=ext.config;}}
else{incompatibleExtensions.push(extensions[name]);}});}
if(incompatibleExtensions.length){throw sdk_exceptions_1.createIncompatibleExtensionsError(incompatibleExtensions);}
return extConfig;}
var SDKBase=(function(){function SDKBase(apiKey,options){var _a;this.apiKey=apiKey;if(!apiKey)
throw sdk_exceptions_1.createMissingApiKeyError();if(sdk_environment_1.SDKEnvironment.platform==='react-native'&&(options===null||options===void 0?void 0:options.endpoint)){sdk_exceptions_1.createReactNativeEndpointConfigurationWarning().log();}
var defaultEndpoint=sdk_environment_1.SDKEnvironment.defaultEndpoint,version=sdk_environment_1.SDKEnvironment.version;this.testMode=!!(options===null||options===void 0?void 0:options.testMode);this.endpoint=url_1.createURL((_a=options===null||options===void 0?void 0:options.endpoint)!==null&&_a!==void 0?_a:defaultEndpoint).origin;this.auth=new auth_1.AuthModule(this);this.user=new user_1.UserModule(this);this.rpcProvider=new rpc_provider_1.RPCProviderModule(this);var extConfig=prepareExtensions.call(this,options);this.parameters=base64_json_1.encodeJSON({API_KEY:this.apiKey,DOMAIN_ORIGIN:window.location?window.location.origin:'',ETH_NETWORK:options===null||options===void 0?void 0:options.network,host:url_1.createURL(this.endpoint).host,sdk:sdk_environment_1.sdkNameToEnvName[sdk_environment_1.SDKEnvironment.sdkName],version:version,ext:type_guards_1.isEmpty(extConfig)?undefined:extConfig,locale:(options===null||options===void 0?void 0:options.locale)||'en_US',});}
Object.defineProperty(SDKBase.prototype,"transport",{get:function(){if(!SDKBase.__transports__.has(this.parameters)){SDKBase.__transports__.set(this.parameters,new sdk_environment_1.SDKEnvironment.PayloadTransport(this.endpoint,this.parameters));}
return SDKBase.__transports__.get(this.parameters);},enumerable:true,configurable:true});Object.defineProperty(SDKBase.prototype,"overlay",{get:function(){if(!SDKBase.__overlays__.has(this.parameters)){var controller=new sdk_environment_1.SDKEnvironment.ViewController(this.transport);SDKBase.__overlays__.set(this.parameters,controller);}
return SDKBase.__overlays__.get(this.parameters);},enumerable:true,configurable:true});SDKBase.prototype.preload=function(){return tslib_1.__awaiter(this,void 0,void 0,function(){return tslib_1.__generator(this,function(_a){switch(_a.label){case 0:return[4,this.overlay.ready];case 1:_a.sent();return[2];}});});};SDKBase.__transports__=new Map();SDKBase.__overlays__=new Map();return SDKBase;}());exports.SDKBase=SDKBase;},{"../modules/auth":10,"../modules/base-extension":11,"../modules/rpc-provider":13,"../modules/user":14,"../util/base64-json":15,"../util/type-guards":21,"../util/url":22,"./sdk-environment":5,"./sdk-exceptions":6,"semver/functions/satisfies":35,"tslib":55}],8:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var types_1=require("@magic-sdk/types");var ViewController=(function(){function ViewController(transport){this.transport=transport;this.endpoint=transport.endpoint;this.parameters=transport.parameters;this.ready=this.waitForReady();if(this.init)
this.init();this.listen();}
ViewController.prototype.waitForReady=function(){var _this=this;return new Promise(function(resolve){_this.transport.on(types_1.MagicIncomingWindowMessage.MAGIC_OVERLAY_READY,function(){return resolve();});});};ViewController.prototype.listen=function(){var _this=this;this.transport.on(types_1.MagicIncomingWindowMessage.MAGIC_HIDE_OVERLAY,function(){_this.hideOverlay();});this.transport.on(types_1.MagicIncomingWindowMessage.MAGIC_SHOW_OVERLAY,function(){_this.showOverlay();});};return ViewController;}());exports.ViewController=ViewController;},{"@magic-sdk/types":46}],9:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var sdk_1=require("./core/sdk");exports.SDKBase=sdk_1.SDKBase;var sdk_environment_1=require("./core/sdk-environment");exports.createSDK=sdk_environment_1.createSDK;var payload_transport_1=require("./core/payload-transport");exports.PayloadTransport=payload_transport_1.PayloadTransport;var view_controller_1=require("./core/view-controller");exports.ViewController=view_controller_1.ViewController;tslib_1.__exportStar(require("./core/sdk-exceptions"),exports);var base_extension_1=require("./modules/base-extension");exports.Extension=base_extension_1.Extension;tslib_1.__exportStar(require("./util"),exports);},{"./core/payload-transport":4,"./core/sdk":7,"./core/sdk-environment":5,"./core/sdk-exceptions":6,"./core/view-controller":8,"./modules/base-extension":11,"./util":18,"tslib":55}],10:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var types_1=require("@magic-sdk/types");var base_module_1=require("./base-module");var json_rpc_1=require("../core/json-rpc");var sdk_environment_1=require("../core/sdk-environment");var AuthModule=(function(_super){tslib_1.__extends(AuthModule,_super);function AuthModule(){return _super!==null&&_super.apply(this,arguments)||this;}
AuthModule.prototype.loginWithMagicLink=function(configuration){var email=configuration.email,_a=configuration.showUI,showUI=_a===void 0?true:_a,redirectURI=configuration.redirectURI;var requestPayload=json_rpc_1.createJsonRpcRequestPayload(this.sdk.testMode?types_1.MagicPayloadMethod.LoginWithMagicLinkTestMode:types_1.MagicPayloadMethod.LoginWithMagicLink,[{email:email,showUI:showUI,redirectURI:redirectURI}]);return this.request(requestPayload);};AuthModule.prototype.loginWithCredential=function(credentialOrQueryString){var credentialResolved=credentialOrQueryString!==null&&credentialOrQueryString!==void 0?credentialOrQueryString:'';if(!credentialOrQueryString&&sdk_environment_1.SDKEnvironment.platform==='web'){credentialResolved=window.location.search;var urlWithoutQuery=window.location.origin+window.location.pathname;window.history.replaceState(null,'',urlWithoutQuery);}
var requestPayload=json_rpc_1.createJsonRpcRequestPayload(this.sdk.testMode?types_1.MagicPayloadMethod.LoginWithCredentialTestMode:types_1.MagicPayloadMethod.LoginWithCredential,[credentialResolved]);return this.request(requestPayload);};return AuthModule;}(base_module_1.BaseModule));exports.AuthModule=AuthModule;},{"../core/json-rpc":3,"../core/sdk-environment":5,"./base-module":12,"@magic-sdk/types":46,"tslib":55}],11:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var json_rpc_1=require("../core/json-rpc");var base_module_1=require("./base-module");var sdk_exceptions_1=require("../core/sdk-exceptions");var util_1=require("../util");var sdkAccessFields=['request','transport','overlay','sdk'];function getPrototypeChain(instance){var currentProto=Object.getPrototypeOf(instance);var protos=[currentProto];while(currentProto!==base_module_1.BaseModule.prototype){currentProto=Object.getPrototypeOf(currentProto);protos.push(currentProto);}
return protos;}
var BaseExtension=(function(_super){tslib_1.__extends(BaseExtension,_super);function BaseExtension(){var _this=_super.call(this,undefined)||this;_this.__sdk_access_field_descriptors__=new Map();_this.__is_initialized__=false;_this.utils={createPromiEvent:util_1.createPromiEvent,isPromiEvent:util_1.isPromiEvent,encodeJSON:util_1.encodeJSON,decodeJSON:util_1.decodeJSON,createJsonRpcRequestPayload:json_rpc_1.createJsonRpcRequestPayload,standardizeJsonRpcRequestPayload:json_rpc_1.standardizeJsonRpcRequestPayload,storage:util_1.storage,};var allSources=tslib_1.__spread([_this],getPrototypeChain(_this));sdkAccessFields.forEach(function(prop){var allDescriptors=allSources.map(function(source){return Object.getOwnPropertyDescriptor(source,prop);});var sourceIndex=allDescriptors.findIndex(function(x){return!!x;});var isPrototypeField=sourceIndex>0;var descriptor=allDescriptors[sourceIndex];if(descriptor){_this.__sdk_access_field_descriptors__.set(prop,{descriptor:descriptor,isPrototypeField:isPrototypeField});Object.defineProperty(_this,prop,{configurable:true,get:function(){throw sdk_exceptions_1.createExtensionNotInitializedError(prop);},});}});return _this;}
BaseExtension.prototype.init=function(sdk){var _this=this;if(this.__is_initialized__)
return;sdkAccessFields.forEach(function(prop){if(_this.__sdk_access_field_descriptors__.has(prop)){var _a=_this.__sdk_access_field_descriptors__.get(prop),descriptor=_a.descriptor,isPrototypeField=_a.isPrototypeField;if(isPrototypeField){delete _this[prop];}
else{Object.defineProperty(_this,prop,descriptor);}}});this.sdk=sdk;this.__is_initialized__=true;};BaseExtension.prototype.createDeprecationWarning=function(options){var method=options.method,removalVersion=options.removalVersion,useInstead=options.useInstead;var useInsteadSuffix=useInstead?" Use `"+useInstead+"` instead.":'';var message="`"+method+"` will be removed from this Extension in version `"+removalVersion+"`."+useInsteadSuffix;return new sdk_exceptions_1.MagicExtensionWarning(this,'DEPRECATION_NOTICE',message);};BaseExtension.prototype.createWarning=function(code,message){return new sdk_exceptions_1.MagicExtensionWarning(this,code,message);};BaseExtension.prototype.createError=function(code,message,data){return new sdk_exceptions_1.MagicExtensionError(this,code,message,data);};return BaseExtension;}(base_module_1.BaseModule));var InternalExtension=(function(_super){tslib_1.__extends(InternalExtension,_super);function InternalExtension(){return _super!==null&&_super.apply(this,arguments)||this;}
return InternalExtension;}(BaseExtension));var Extension=(function(_super){tslib_1.__extends(Extension,_super);function Extension(){return _super!==null&&_super.apply(this,arguments)||this;}
Extension.Internal=InternalExtension;return Extension;}(BaseExtension));exports.Extension=Extension;},{"../core/json-rpc":3,"../core/sdk-exceptions":6,"../util":18,"./base-module":12,"tslib":55}],12:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var types_1=require("@magic-sdk/types");var sdk_exceptions_1=require("../core/sdk-exceptions");var json_rpc_1=require("../core/json-rpc");var promise_tools_1=require("../util/promise-tools");var BaseModule=(function(){function BaseModule(sdk){this.sdk=sdk;}
Object.defineProperty(BaseModule.prototype,"transport",{get:function(){return this.sdk.transport;},enumerable:true,configurable:true});Object.defineProperty(BaseModule.prototype,"overlay",{get:function(){return this.sdk.overlay;},enumerable:true,configurable:true});BaseModule.prototype.request=function(payload){var responsePromise=this.transport.post(this.overlay,types_1.MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST,json_rpc_1.standardizeJsonRpcRequestPayload(payload));var promiEvent=promise_tools_1.createPromiEvent(function(resolve,reject){responsePromise.then(function(res){cleanupEvents();if(res.hasError)
reject(new sdk_exceptions_1.MagicRPCError(res.payload.error));else if(res.hasResult)
resolve(res.payload.result);else
throw sdk_exceptions_1.createMalformedResponseError();}).catch(function(err){cleanupEvents();reject(err);});});var cleanupEvents=this.transport.on(types_1.MagicIncomingWindowMessage.MAGIC_HANDLE_EVENT,function(evt){var _a;var response=evt.data.response;if(response.id===payload.id&&((_a=response.result)===null||_a===void 0?void 0:_a.event)){var _b=response.result,event_1=_b.event,_c=_b.params,params=_c===void 0?[]:_c;promiEvent.emit.apply(promiEvent,tslib_1.__spread([event_1],params));}});return promiEvent;};return BaseModule;}());exports.BaseModule=BaseModule;},{"../core/json-rpc":3,"../core/sdk-exceptions":6,"../util/promise-tools":19,"@magic-sdk/types":46,"tslib":55}],13:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var types_1=require("@magic-sdk/types");var base_module_1=require("./base-module");var sdk_exceptions_1=require("../core/sdk-exceptions");var json_rpc_1=require("../core/json-rpc");var events_1=require("../util/events");var _a=events_1.createTypedEmitter(),createBoundEmitterMethod=_a.createBoundEmitterMethod,createChainingEmitterMethod=_a.createChainingEmitterMethod;var RPCProviderModule=(function(_super){tslib_1.__extends(RPCProviderModule,_super);function RPCProviderModule(){var _this=_super!==null&&_super.apply(this,arguments)||this;_this.isMagic=true;_this.on=createChainingEmitterMethod('on',_this);_this.once=createChainingEmitterMethod('once',_this);_this.addListener=createChainingEmitterMethod('addListener',_this);_this.off=createChainingEmitterMethod('off',_this);_this.removeListener=createChainingEmitterMethod('removeListener',_this);_this.removeAllListeners=createChainingEmitterMethod('removeAllListeners',_this);_this.emit=createBoundEmitterMethod('emit');_this.eventNames=createBoundEmitterMethod('eventNames');_this.listeners=createBoundEmitterMethod('listeners');_this.listenerCount=createBoundEmitterMethod('listenerCount');return _this;}
RPCProviderModule.prototype.sendAsync=function(payload,onRequestComplete){var _this=this;if(!onRequestComplete){throw sdk_exceptions_1.createInvalidArgumentError({procedure:'Magic.rpcProvider.sendAsync',argument:1,expected:'function',received:onRequestComplete===null?'null':typeof onRequestComplete,});}
if(Array.isArray(payload)){this.transport.post(this.overlay,types_1.MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST,payload.map(function(p){var standardizedPayload=json_rpc_1.standardizeJsonRpcRequestPayload(p);_this.prefixPayloadMethodForTestMode(standardizedPayload);return standardizedPayload;})).then(function(batchResponse){onRequestComplete(null,batchResponse.map(function(response){return(tslib_1.__assign(tslib_1.__assign({},response.payload),{error:response.hasError?new sdk_exceptions_1.MagicRPCError(response.payload.error):null}));}));});}
else{var finalPayload=json_rpc_1.standardizeJsonRpcRequestPayload(payload);this.prefixPayloadMethodForTestMode(finalPayload);this.transport.post(this.overlay,types_1.MagicOutgoingWindowMessage.MAGIC_HANDLE_REQUEST,finalPayload).then(function(response){onRequestComplete(response.hasError?new sdk_exceptions_1.MagicRPCError(response.payload.error):null,response.payload);});}};RPCProviderModule.prototype.send=function(payloadOrMethod,onRequestCompleteOrParams){if(typeof payloadOrMethod==='string'){var payload=json_rpc_1.createJsonRpcRequestPayload(payloadOrMethod,Array.isArray(onRequestCompleteOrParams)?onRequestCompleteOrParams:[]);return this.request(payload);}
if(Array.isArray(payloadOrMethod)||!!onRequestCompleteOrParams){this.sendAsync(payloadOrMethod,onRequestCompleteOrParams);return;}
var warning=sdk_exceptions_1.createSynchronousWeb3MethodWarning();warning.log();return new json_rpc_1.JsonRpcResponse(payloadOrMethod).applyError({code:-32603,message:warning.rawMessage,}).payload;};RPCProviderModule.prototype.enable=function(){var requestPayload=json_rpc_1.createJsonRpcRequestPayload('eth_accounts');return this.request(requestPayload);};RPCProviderModule.prototype.request=function(payload){this.prefixPayloadMethodForTestMode(payload);return _super.prototype.request.call(this,payload);};RPCProviderModule.prototype.prefixPayloadMethodForTestMode=function(payload){var testModePrefix='testMode/eth/';if(this.sdk.testMode){payload.method=""+testModePrefix+payload.method;}};return RPCProviderModule;}(base_module_1.BaseModule));exports.RPCProviderModule=RPCProviderModule;},{"../core/json-rpc":3,"../core/sdk-exceptions":6,"../util/events":16,"./base-module":12,"@magic-sdk/types":46,"tslib":55}],14:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var types_1=require("@magic-sdk/types");var base_module_1=require("./base-module");var json_rpc_1=require("../core/json-rpc");var UserModule=(function(_super){tslib_1.__extends(UserModule,_super);function UserModule(){return _super!==null&&_super.apply(this,arguments)||this;}
UserModule.prototype.getIdToken=function(configuration){var requestPayload=json_rpc_1.createJsonRpcRequestPayload(this.sdk.testMode?types_1.MagicPayloadMethod.GetIdTokenTestMode:types_1.MagicPayloadMethod.GetIdToken,[configuration]);return this.request(requestPayload);};UserModule.prototype.generateIdToken=function(configuration){var requestPayload=json_rpc_1.createJsonRpcRequestPayload(this.sdk.testMode?types_1.MagicPayloadMethod.GenerateIdTokenTestMode:types_1.MagicPayloadMethod.GenerateIdToken,[configuration]);return this.request(requestPayload);};UserModule.prototype.getMetadata=function(){var requestPayload=json_rpc_1.createJsonRpcRequestPayload(this.sdk.testMode?types_1.MagicPayloadMethod.GetMetadataTestMode:types_1.MagicPayloadMethod.GetMetadata);return this.request(requestPayload);};UserModule.prototype.updateEmail=function(configuration){var email=configuration.email,_a=configuration.showUI,showUI=_a===void 0?true:_a;var requestPayload=json_rpc_1.createJsonRpcRequestPayload(this.sdk.testMode?types_1.MagicPayloadMethod.UpdateEmailTestMode:types_1.MagicPayloadMethod.UpdateEmail,[{email:email,showUI:showUI}]);return this.request(requestPayload);};UserModule.prototype.isLoggedIn=function(){var requestPayload=json_rpc_1.createJsonRpcRequestPayload(this.sdk.testMode?types_1.MagicPayloadMethod.IsLoggedInTestMode:types_1.MagicPayloadMethod.IsLoggedIn);return this.request(requestPayload);};UserModule.prototype.logout=function(){var requestPayload=json_rpc_1.createJsonRpcRequestPayload(this.sdk.testMode?types_1.MagicPayloadMethod.LogoutTestMode:types_1.MagicPayloadMethod.Logout);return this.request(requestPayload);};return UserModule;}(base_module_1.BaseModule));exports.UserModule=UserModule;},{"../core/json-rpc":3,"./base-module":12,"@magic-sdk/types":46,"tslib":55}],15:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});function percentToByte(p){return String.fromCharCode(parseInt(p.slice(1),16));}
function byteToPercent(b){return"%"+("00"+b.charCodeAt(0).toString(16)).slice(-2);}
function btoaUTF8(str){return btoa(encodeURIComponent(str).replace(/%[0-9A-F]{2}/g,percentToByte));}
function atobUTF8(str){return decodeURIComponent(Array.from(atob(str),byteToPercent).join(''));}
function encodeJSON(options){return btoaUTF8(JSON.stringify(options));}
exports.encodeJSON=encodeJSON;function decodeJSON(queryString){return JSON.parse(atobUTF8(queryString));}
exports.decodeJSON=decodeJSON;},{}],16:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var eventemitter3_1=tslib_1.__importDefault(require("eventemitter3"));var TypedEmitter=(function(_super){tslib_1.__extends(TypedEmitter,_super);function TypedEmitter(){return _super!==null&&_super.apply(this,arguments)||this;}
return TypedEmitter;}(eventemitter3_1.default));exports.TypedEmitter=TypedEmitter;function createTypedEmitter(){var emitter=new TypedEmitter();var createChainingEmitterMethod=function(method,source){return function(){var args=[];for(var _i=0;_i<arguments.length;_i++){args[_i]=arguments[_i];}
emitter[method].apply(emitter,args);return source;};};var createBoundEmitterMethod=function(method){return function(){var args=[];for(var _i=0;_i<arguments.length;_i++){args[_i]=arguments[_i];}
return emitter[method].apply(emitter,args);};};return{emitter:emitter,createChainingEmitterMethod:createChainingEmitterMethod,createBoundEmitterMethod:createBoundEmitterMethod,};}
exports.createTypedEmitter=createTypedEmitter;},{"eventemitter3":48,"tslib":55}],17:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");function createIntGenerator(){var index;return tslib_1.__generator(this,function(_a){switch(_a.label){case 0:index=0;_a.label=1;case 1:if(!true)return[3,5];if(!(index<Number.MAX_SAFE_INTEGER))return[3,3];return[4,++index];case 2:_a.sent();return[3,4];case 3:index=0;_a.label=4;case 4:return[3,1];case 5:return[2];}});}
var intGenerator=createIntGenerator();function getPayloadId(){return intGenerator.next().value;}
exports.getPayloadId=getPayloadId;},{"tslib":55}],18:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");tslib_1.__exportStar(require("./get-payload-id"),exports);tslib_1.__exportStar(require("./promise-tools"),exports);tslib_1.__exportStar(require("./base64-json"),exports);tslib_1.__exportStar(require("./type-guards"),exports);tslib_1.__exportStar(require("./events"),exports);tslib_1.__exportStar(require("./url"),exports);exports.storage=tslib_1.__importStar(require("./storage"));},{"./base64-json":15,"./events":16,"./get-payload-id":17,"./promise-tools":19,"./storage":20,"./type-guards":21,"./url":22,"tslib":55}],19:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var events_1=require("./events");var promiEventBrand=Symbol('isPromiEvent');function isPromiEvent(value){return!!value[promiEventBrand];}
exports.isPromiEvent=isPromiEvent;function createPromiEvent(executor){var promise=createPromise(executor);var _a=events_1.createTypedEmitter(),createBoundEmitterMethod=_a.createBoundEmitterMethod,createChainingEmitterMethod=_a.createChainingEmitterMethod;var thenSymbol=Symbol('Promise.then');var catchSymbol=Symbol('Promise.catch');var finallySymbol=Symbol('Promise.finally');var createChainingPromiseMethod=function(method,source){return function(){var args=[];for(var _i=0;_i<arguments.length;_i++){args[_i]=arguments[_i];}
var nextPromise=source[method].apply(source,args);return promiEvent(nextPromise);};};var promiEvent=function(source){var _a;return Object.assign(source,(_a={},_a[promiEventBrand]=true,_a[thenSymbol]=source[thenSymbol]||source.then,_a[catchSymbol]=source[catchSymbol]||source.catch,_a[finallySymbol]=source[finallySymbol]||source.finally,_a.then=createChainingPromiseMethod(thenSymbol,source),_a.catch=createChainingPromiseMethod(catchSymbol,source),_a.finally=createChainingPromiseMethod(finallySymbol,source),_a.on=createChainingEmitterMethod('on',source),_a.once=createChainingEmitterMethod('once',source),_a.addListener=createChainingEmitterMethod('addListener',source),_a.off=createChainingEmitterMethod('off',source),_a.removeListener=createChainingEmitterMethod('removeListener',source),_a.removeAllListeners=createChainingEmitterMethod('removeAllListeners',source),_a.emit=createBoundEmitterMethod('emit'),_a.eventNames=createBoundEmitterMethod('eventNames'),_a.listeners=createBoundEmitterMethod('listeners'),_a.listenerCount=createBoundEmitterMethod('listenerCount'),_a));};var result=promiEvent(promise.then(function(resolved){result.emit('done',resolved);result.emit('settled');return resolved;},function(err){result.emit('error',err);result.emit('settled');throw err;}));return result;}
exports.createPromiEvent=createPromiEvent;function createPromise(executor){return new Promise(function(resolve,reject){var result=executor(resolve,reject);Promise.resolve(result).catch(reject);});}
exports.createPromise=createPromise;},{"./events":16}],20:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var sdk_environment_1=require("../core/sdk-environment");var lf;function proxyLocalForageMethod(method){var _this=this;return function(){var args=[];for(var _i=0;_i<arguments.length;_i++){args[_i]=arguments[_i];}
return tslib_1.__awaiter(_this,void 0,void 0,function(){return tslib_1.__generator(this,function(_a){switch(_a.label){case 0:if(!!lf)return[3,2];return[4,sdk_environment_1.SDKEnvironment.configureStorage()];case 1:lf=_a.sent();_a.label=2;case 2:return[4,lf.ready()];case 3:_a.sent();return[2,lf[method].apply(lf,tslib_1.__spread(args))];}});});};}
exports.getItem=proxyLocalForageMethod('getItem');exports.setItem=proxyLocalForageMethod('setItem');exports.removeItem=proxyLocalForageMethod('removeItem');exports.clear=proxyLocalForageMethod('clear');exports.length=proxyLocalForageMethod('length');exports.key=proxyLocalForageMethod('key');exports.keys=proxyLocalForageMethod('keys');exports.iterate=proxyLocalForageMethod('iterate');},{"../core/sdk-environment":5,"tslib":55}],21:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var types_1=require("@magic-sdk/types");function isUndefined(value){return typeof value==='undefined';}
function isNull(value){return value===null;}
function isNil(value){return isNull(value)||isUndefined(value);}
function isJsonRpcRequestPayload(value){if(isNil(value))
return false;return(!isUndefined(value.jsonrpc)&&!isUndefined(value.id)&&!isUndefined(value.method)&&!isUndefined(value.params));}
exports.isJsonRpcRequestPayload=isJsonRpcRequestPayload;function isJsonRpcResponsePayload(value){if(isNil(value))
return false;return(!isUndefined(value.jsonrpc)&&!isUndefined(value.id)&&(!isUndefined(value.result)||!isUndefined(value.error)));}
exports.isJsonRpcResponsePayload=isJsonRpcResponsePayload;function isMagicPayloadMethod(value){if(isNil(value))
return false;return typeof value==='string'&&Object.values(types_1.MagicPayloadMethod).includes(value);}
exports.isMagicPayloadMethod=isMagicPayloadMethod;function isJsonRpcErrorCode(value){if(isNil(value))
return false;return typeof value==='number'&&Object.values(types_1.RPCErrorCode).includes(value);}
exports.isJsonRpcErrorCode=isJsonRpcErrorCode;function isEmpty(value){if(!value)
return true;for(var key in value){if(Object.hasOwnProperty.call(value,key)){return false;}}
return true;}
exports.isEmpty=isEmpty;},{"@magic-sdk/types":46}],22:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});function createURL(url,base){return base?new URL(url,base):new URL(url);}
exports.createURL=createURL;},{}],23:[function(require,module,exports){'use strict'
const Yallist=require('yallist')
const MAX=Symbol('max')
const LENGTH=Symbol('length')
const LENGTH_CALCULATOR=Symbol('lengthCalculator')
const ALLOW_STALE=Symbol('allowStale')
const MAX_AGE=Symbol('maxAge')
const DISPOSE=Symbol('dispose')
const NO_DISPOSE_ON_SET=Symbol('noDisposeOnSet')
const LRU_LIST=Symbol('lruList')
const CACHE=Symbol('cache')
const UPDATE_AGE_ON_GET=Symbol('updateAgeOnGet')
const naiveLength=()=>1
class LRUCache{constructor(options){if(typeof options==='number')
options={max:options}
if(!options)
options={}
if(options.max&&(typeof options.max!=='number'||options.max<0))
throw new TypeError('max must be a non-negative number')
const max=this[MAX]=options.max||Infinity
const lc=options.length||naiveLength
this[LENGTH_CALCULATOR]=(typeof lc!=='function')?naiveLength:lc
this[ALLOW_STALE]=options.stale||false
if(options.maxAge&&typeof options.maxAge!=='number')
throw new TypeError('maxAge must be a number')
this[MAX_AGE]=options.maxAge||0
this[DISPOSE]=options.dispose
this[NO_DISPOSE_ON_SET]=options.noDisposeOnSet||false
this[UPDATE_AGE_ON_GET]=options.updateAgeOnGet||false
this.reset()}
set max(mL){if(typeof mL!=='number'||mL<0)
throw new TypeError('max must be a non-negative number')
this[MAX]=mL||Infinity
trim(this)}
get max(){return this[MAX]}
set allowStale(allowStale){this[ALLOW_STALE]=!!allowStale}
get allowStale(){return this[ALLOW_STALE]}
set maxAge(mA){if(typeof mA!=='number')
throw new TypeError('maxAge must be a non-negative number')
this[MAX_AGE]=mA
trim(this)}
get maxAge(){return this[MAX_AGE]}
set lengthCalculator(lC){if(typeof lC!=='function')
lC=naiveLength
if(lC!==this[LENGTH_CALCULATOR]){this[LENGTH_CALCULATOR]=lC
this[LENGTH]=0
this[LRU_LIST].forEach(hit=>{hit.length=this[LENGTH_CALCULATOR](hit.value,hit.key)
this[LENGTH]+=hit.length})}
trim(this)}
get lengthCalculator(){return this[LENGTH_CALCULATOR]}
get length(){return this[LENGTH]}
get itemCount(){return this[LRU_LIST].length}
rforEach(fn,thisp){thisp=thisp||this
for(let walker=this[LRU_LIST].tail;walker!==null;){const prev=walker.prev
forEachStep(this,fn,walker,thisp)
walker=prev}}
forEach(fn,thisp){thisp=thisp||this
for(let walker=this[LRU_LIST].head;walker!==null;){const next=walker.next
forEachStep(this,fn,walker,thisp)
walker=next}}
keys(){return this[LRU_LIST].toArray().map(k=>k.key)}
values(){return this[LRU_LIST].toArray().map(k=>k.value)}
reset(){if(this[DISPOSE]&&this[LRU_LIST]&&this[LRU_LIST].length){this[LRU_LIST].forEach(hit=>this[DISPOSE](hit.key,hit.value))}
this[CACHE]=new Map()
this[LRU_LIST]=new Yallist()
this[LENGTH]=0}
dump(){return this[LRU_LIST].map(hit=>isStale(this,hit)?false:{k:hit.key,v:hit.value,e:hit.now+(hit.maxAge||0)}).toArray().filter(h=>h)}
dumpLru(){return this[LRU_LIST]}
set(key,value,maxAge){maxAge=maxAge||this[MAX_AGE]
if(maxAge&&typeof maxAge!=='number')
throw new TypeError('maxAge must be a number')
const now=maxAge?Date.now():0
const len=this[LENGTH_CALCULATOR](value,key)
if(this[CACHE].has(key)){if(len>this[MAX]){del(this,this[CACHE].get(key))
return false}
const node=this[CACHE].get(key)
const item=node.value
if(this[DISPOSE]){if(!this[NO_DISPOSE_ON_SET])
this[DISPOSE](key,item.value)}
item.now=now
item.maxAge=maxAge
item.value=value
this[LENGTH]+=len-item.length
item.length=len
this.get(key)
trim(this)
return true}
const hit=new Entry(key,value,len,now,maxAge)
if(hit.length>this[MAX]){if(this[DISPOSE])
this[DISPOSE](key,value)
return false}
this[LENGTH]+=hit.length
this[LRU_LIST].unshift(hit)
this[CACHE].set(key,this[LRU_LIST].head)
trim(this)
return true}
has(key){if(!this[CACHE].has(key))return false
const hit=this[CACHE].get(key).value
return!isStale(this,hit)}
get(key){return get(this,key,true)}
peek(key){return get(this,key,false)}
pop(){const node=this[LRU_LIST].tail
if(!node)
return null
del(this,node)
return node.value}
del(key){del(this,this[CACHE].get(key))}
load(arr){this.reset()
const now=Date.now()
for(let l=arr.length-1;l>=0;l--){const hit=arr[l]
const expiresAt=hit.e||0
if(expiresAt===0)
this.set(hit.k,hit.v)
else{const maxAge=expiresAt-now
if(maxAge>0){this.set(hit.k,hit.v,maxAge)}}}}
prune(){this[CACHE].forEach((value,key)=>get(this,key,false))}}
const get=(self,key,doUse)=>{const node=self[CACHE].get(key)
if(node){const hit=node.value
if(isStale(self,hit)){del(self,node)
if(!self[ALLOW_STALE])
return undefined}else{if(doUse){if(self[UPDATE_AGE_ON_GET])
node.value.now=Date.now()
self[LRU_LIST].unshiftNode(node)}}
return hit.value}}
const isStale=(self,hit)=>{if(!hit||(!hit.maxAge&&!self[MAX_AGE]))
return false
const diff=Date.now()-hit.now
return hit.maxAge?diff>hit.maxAge:self[MAX_AGE]&&(diff>self[MAX_AGE])}
const trim=self=>{if(self[LENGTH]>self[MAX]){for(let walker=self[LRU_LIST].tail;self[LENGTH]>self[MAX]&&walker!==null;){const prev=walker.prev
del(self,walker)
walker=prev}}}
const del=(self,node)=>{if(node){const hit=node.value
if(self[DISPOSE])
self[DISPOSE](hit.key,hit.value)
self[LENGTH]-=hit.length
self[CACHE].delete(hit.key)
self[LRU_LIST].removeNode(node)}}
class Entry{constructor(key,value,length,now,maxAge){this.key=key
this.value=value
this.length=length
this.now=now
this.maxAge=maxAge||0}}
const forEachStep=(self,fn,node,thisp)=>{let hit=node.value
if(isStale(self,hit)){del(self,node)
if(!self[ALLOW_STALE])
hit=undefined}
if(hit)
fn.call(thisp,hit.value,hit.key,self)}
module.exports=LRUCache},{"yallist":42}],24:[function(require,module,exports){const ANY=Symbol('SemVer ANY')
class Comparator{static get ANY(){return ANY}
constructor(comp,options){options=parseOptions(options)
if(comp instanceof Comparator){if(comp.loose===!!options.loose){return comp}else{comp=comp.value}}
debug('comparator',comp,options)
this.options=options
this.loose=!!options.loose
this.parse(comp)
if(this.semver===ANY){this.value=''}else{this.value=this.operator+this.semver.version}
debug('comp',this)}
parse(comp){const r=this.options.loose?re[t.COMPARATORLOOSE]:re[t.COMPARATOR]
const m=comp.match(r)
if(!m){throw new TypeError(`Invalid comparator: ${comp}`)}
this.operator=m[1]!==undefined?m[1]:''
if(this.operator==='='){this.operator=''}
if(!m[2]){this.semver=ANY}else{this.semver=new SemVer(m[2],this.options.loose)}}
toString(){return this.value}
test(version){debug('Comparator.test',version,this.options.loose)
if(this.semver===ANY||version===ANY){return true}
if(typeof version==='string'){try{version=new SemVer(version,this.options)}catch(er){return false}}
return cmp(version,this.operator,this.semver,this.options)}
intersects(comp,options){if(!(comp instanceof Comparator)){throw new TypeError('a Comparator is required')}
if(!options||typeof options!=='object'){options={loose:!!options,includePrerelease:false}}
if(this.operator===''){if(this.value===''){return true}
return new Range(comp.value,options).test(this.value)}else if(comp.operator===''){if(comp.value===''){return true}
return new Range(this.value,options).test(comp.semver)}
const sameDirectionIncreasing=(this.operator==='>='||this.operator==='>')&&(comp.operator==='>='||comp.operator==='>')
const sameDirectionDecreasing=(this.operator==='<='||this.operator==='<')&&(comp.operator==='<='||comp.operator==='<')
const sameSemVer=this.semver.version===comp.semver.version
const differentDirectionsInclusive=(this.operator==='>='||this.operator==='<=')&&(comp.operator==='>='||comp.operator==='<=')
const oppositeDirectionsLessThan=cmp(this.semver,'<',comp.semver,options)&&(this.operator==='>='||this.operator==='>')&&(comp.operator==='<='||comp.operator==='<')
const oppositeDirectionsGreaterThan=cmp(this.semver,'>',comp.semver,options)&&(this.operator==='<='||this.operator==='<')&&(comp.operator==='>='||comp.operator==='>')
return(sameDirectionIncreasing||sameDirectionDecreasing||(sameSemVer&&differentDirectionsInclusive)||oppositeDirectionsLessThan||oppositeDirectionsGreaterThan)}}
module.exports=Comparator
const parseOptions=require('../internal/parse-options')
const{re,t}=require('../internal/re')
const cmp=require('../functions/cmp')
const debug=require('../internal/debug')
const SemVer=require('./semver')
const Range=require('./range')},{"../functions/cmp":27,"../internal/debug":37,"../internal/parse-options":39,"../internal/re":40,"./range":25,"./semver":26}],25:[function(require,module,exports){class Range{constructor(range,options){options=parseOptions(options)
if(range instanceof Range){if(range.loose===!!options.loose&&range.includePrerelease===!!options.includePrerelease){return range}else{return new Range(range.raw,options)}}
if(range instanceof Comparator){this.raw=range.value
this.set=[[range]]
this.format()
return this}
this.options=options
this.loose=!!options.loose
this.includePrerelease=!!options.includePrerelease
this.raw=range
this.set=range.split(/\s*\|\|\s*/).map(range=>this.parseRange(range.trim())).filter(c=>c.length)
if(!this.set.length){throw new TypeError(`Invalid SemVer Range: ${range}`)}
if(this.set.length>1){const first=this.set[0]
this.set=this.set.filter(c=>!isNullSet(c[0]))
if(this.set.length===0)
this.set=[first]
else if(this.set.length>1){for(const c of this.set){if(c.length===1&&isAny(c[0])){this.set=[c]
break}}}}
this.format()}
format(){this.range=this.set.map((comps)=>{return comps.join(' ').trim()}).join('||').trim()
return this.range}
toString(){return this.range}
parseRange(range){range=range.trim()
const memoOpts=Object.keys(this.options).join(',')
const memoKey=`parseRange:${memoOpts}:${range}`
const cached=cache.get(memoKey)
if(cached)
return cached
const loose=this.options.loose
const hr=loose?re[t.HYPHENRANGELOOSE]:re[t.HYPHENRANGE]
range=range.replace(hr,hyphenReplace(this.options.includePrerelease))
debug('hyphen replace',range)
range=range.replace(re[t.COMPARATORTRIM],comparatorTrimReplace)
debug('comparator trim',range,re[t.COMPARATORTRIM])
range=range.replace(re[t.TILDETRIM],tildeTrimReplace)
range=range.replace(re[t.CARETTRIM],caretTrimReplace)
range=range.split(/\s+/).join(' ')
const compRe=loose?re[t.COMPARATORLOOSE]:re[t.COMPARATOR]
const rangeList=range.split(' ').map(comp=>parseComparator(comp,this.options)).join(' ').split(/\s+/).map(comp=>replaceGTE0(comp,this.options)).filter(this.options.loose?comp=>!!comp.match(compRe):()=>true).map(comp=>new Comparator(comp,this.options))
const l=rangeList.length
const rangeMap=new Map()
for(const comp of rangeList){if(isNullSet(comp))
return[comp]
rangeMap.set(comp.value,comp)}
if(rangeMap.size>1&&rangeMap.has(''))
rangeMap.delete('')
const result=[...rangeMap.values()]
cache.set(memoKey,result)
return result}
intersects(range,options){if(!(range instanceof Range)){throw new TypeError('a Range is required')}
return this.set.some((thisComparators)=>{return(isSatisfiable(thisComparators,options)&&range.set.some((rangeComparators)=>{return(isSatisfiable(rangeComparators,options)&&thisComparators.every((thisComparator)=>{return rangeComparators.every((rangeComparator)=>{return thisComparator.intersects(rangeComparator,options)})}))}))})}
test(version){if(!version){return false}
if(typeof version==='string'){try{version=new SemVer(version,this.options)}catch(er){return false}}
for(let i=0;i<this.set.length;i++){if(testSet(this.set[i],version,this.options)){return true}}
return false}}
module.exports=Range
const LRU=require('lru-cache')
const cache=new LRU({max:1000})
const parseOptions=require('../internal/parse-options')
const Comparator=require('./comparator')
const debug=require('../internal/debug')
const SemVer=require('./semver')
const{re,t,comparatorTrimReplace,tildeTrimReplace,caretTrimReplace}=require('../internal/re')
const isNullSet=c=>c.value==='<0.0.0-0'
const isAny=c=>c.value===''
const isSatisfiable=(comparators,options)=>{let result=true
const remainingComparators=comparators.slice()
let testComparator=remainingComparators.pop()
while(result&&remainingComparators.length){result=remainingComparators.every((otherComparator)=>{return testComparator.intersects(otherComparator,options)})
testComparator=remainingComparators.pop()}
return result}
const parseComparator=(comp,options)=>{debug('comp',comp,options)
comp=replaceCarets(comp,options)
debug('caret',comp)
comp=replaceTildes(comp,options)
debug('tildes',comp)
comp=replaceXRanges(comp,options)
debug('xrange',comp)
comp=replaceStars(comp,options)
debug('stars',comp)
return comp}
const isX=id=>!id||id.toLowerCase()==='x'||id==='*'
const replaceTildes=(comp,options)=>comp.trim().split(/\s+/).map((comp)=>{return replaceTilde(comp,options)}).join(' ')
const replaceTilde=(comp,options)=>{const r=options.loose?re[t.TILDELOOSE]:re[t.TILDE]
return comp.replace(r,(_,M,m,p,pr)=>{debug('tilde',comp,_,M,m,p,pr)
let ret
if(isX(M)){ret=''}else if(isX(m)){ret=`>=${M}.0.0 <${+M + 1}.0.0-0`}else if(isX(p)){ret=`>=${M}.${m}.0 <${M}.${+m + 1}.0-0`}else if(pr){debug('replaceTilde pr',pr)
ret=`>=${M}.${m}.${p}-${pr
      } <${M}.${+m + 1}.0-0`}else{ret=`>=${M}.${m}.${p
      } <${M}.${+m + 1}.0-0`}
debug('tilde return',ret)
return ret})}
const replaceCarets=(comp,options)=>comp.trim().split(/\s+/).map((comp)=>{return replaceCaret(comp,options)}).join(' ')
const replaceCaret=(comp,options)=>{debug('caret',comp,options)
const r=options.loose?re[t.CARETLOOSE]:re[t.CARET]
const z=options.includePrerelease?'-0':''
return comp.replace(r,(_,M,m,p,pr)=>{debug('caret',comp,_,M,m,p,pr)
let ret
if(isX(M)){ret=''}else if(isX(m)){ret=`>=${M}.0.0${z} <${+M + 1}.0.0-0`}else if(isX(p)){if(M==='0'){ret=`>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`}else{ret=`>=${M}.${m}.0${z} <${+M + 1}.0.0-0`}}else if(pr){debug('replaceCaret pr',pr)
if(M==='0'){if(m==='0'){ret=`>=${M}.${m}.${p}-${pr
          } <${M}.${m}.${+p + 1}-0`}else{ret=`>=${M}.${m}.${p}-${pr
          } <${M}.${+m + 1}.0-0`}}else{ret=`>=${M}.${m}.${p}-${pr
        } <${+M + 1}.0.0-0`}}else{debug('no pr')
if(M==='0'){if(m==='0'){ret=`>=${M}.${m}.${p
          }${z} <${M}.${m}.${+p + 1}-0`}else{ret=`>=${M}.${m}.${p
          }${z} <${M}.${+m + 1}.0-0`}}else{ret=`>=${M}.${m}.${p
        } <${+M + 1}.0.0-0`}}
debug('caret return',ret)
return ret})}
const replaceXRanges=(comp,options)=>{debug('replaceXRanges',comp,options)
return comp.split(/\s+/).map((comp)=>{return replaceXRange(comp,options)}).join(' ')}
const replaceXRange=(comp,options)=>{comp=comp.trim()
const r=options.loose?re[t.XRANGELOOSE]:re[t.XRANGE]
return comp.replace(r,(ret,gtlt,M,m,p,pr)=>{debug('xRange',comp,ret,gtlt,M,m,p,pr)
const xM=isX(M)
const xm=xM||isX(m)
const xp=xm||isX(p)
const anyX=xp
if(gtlt==='='&&anyX){gtlt=''}
pr=options.includePrerelease?'-0':''
if(xM){if(gtlt==='>'||gtlt==='<'){ret='<0.0.0-0'}else{ret='*'}}else if(gtlt&&anyX){if(xm){m=0}
p=0
if(gtlt==='>'){gtlt='>='
if(xm){M=+M+1
m=0
p=0}else{m=+m+1
p=0}}else if(gtlt==='<='){gtlt='<'
if(xm){M=+M+1}else{m=+m+1}}
if(gtlt==='<')
pr='-0'
ret=`${gtlt + M}.${m}.${p}${pr}`}else if(xm){ret=`>=${M}.0.0${pr} <${+M + 1}.0.0-0`}else if(xp){ret=`>=${M}.${m}.0${pr
      } <${M}.${+m + 1}.0-0`}
debug('xRange return',ret)
return ret})}
const replaceStars=(comp,options)=>{debug('replaceStars',comp,options)
return comp.trim().replace(re[t.STAR],'')}
const replaceGTE0=(comp,options)=>{debug('replaceGTE0',comp,options)
return comp.trim().replace(re[options.includePrerelease?t.GTE0PRE:t.GTE0],'')}
const hyphenReplace=incPr=>($0,from,fM,fm,fp,fpr,fb,to,tM,tm,tp,tpr,tb)=>{if(isX(fM)){from=''}else if(isX(fm)){from=`>=${fM}.0.0${incPr ? '-0' : ''}`}else if(isX(fp)){from=`>=${fM}.${fm}.0${incPr ? '-0' : ''}`}else if(fpr){from=`>=${from}`}else{from=`>=${from}${incPr ? '-0' : ''}`}
if(isX(tM)){to=''}else if(isX(tm)){to=`<${+tM + 1}.0.0-0`}else if(isX(tp)){to=`<${tM}.${+tm + 1}.0-0`}else if(tpr){to=`<=${tM}.${tm}.${tp}-${tpr}`}else if(incPr){to=`<${tM}.${tm}.${+tp + 1}-0`}else{to=`<=${to}`}
return(`${from} ${to}`).trim()}
const testSet=(set,version,options)=>{for(let i=0;i<set.length;i++){if(!set[i].test(version)){return false}}
if(version.prerelease.length&&!options.includePrerelease){for(let i=0;i<set.length;i++){debug(set[i].semver)
if(set[i].semver===Comparator.ANY){continue}
if(set[i].semver.prerelease.length>0){const allowed=set[i].semver
if(allowed.major===version.major&&allowed.minor===version.minor&&allowed.patch===version.patch){return true}}}
return false}
return true}},{"../internal/debug":37,"../internal/parse-options":39,"../internal/re":40,"./comparator":24,"./semver":26,"lru-cache":23}],26:[function(require,module,exports){const debug=require('../internal/debug')
const{MAX_LENGTH,MAX_SAFE_INTEGER}=require('../internal/constants')
const{re,t}=require('../internal/re')
const parseOptions=require('../internal/parse-options')
const{compareIdentifiers}=require('../internal/identifiers')
class SemVer{constructor(version,options){options=parseOptions(options)
if(version instanceof SemVer){if(version.loose===!!options.loose&&version.includePrerelease===!!options.includePrerelease){return version}else{version=version.version}}else if(typeof version!=='string'){throw new TypeError(`Invalid Version: ${version}`)}
if(version.length>MAX_LENGTH){throw new TypeError(`version is longer than ${MAX_LENGTH} characters`)}
debug('SemVer',version,options)
this.options=options
this.loose=!!options.loose
this.includePrerelease=!!options.includePrerelease
const m=version.trim().match(options.loose?re[t.LOOSE]:re[t.FULL])
if(!m){throw new TypeError(`Invalid Version: ${version}`)}
this.raw=version
this.major=+m[1]
this.minor=+m[2]
this.patch=+m[3]
if(this.major>MAX_SAFE_INTEGER||this.major<0){throw new TypeError('Invalid major version')}
if(this.minor>MAX_SAFE_INTEGER||this.minor<0){throw new TypeError('Invalid minor version')}
if(this.patch>MAX_SAFE_INTEGER||this.patch<0){throw new TypeError('Invalid patch version')}
if(!m[4]){this.prerelease=[]}else{this.prerelease=m[4].split('.').map((id)=>{if(/^[0-9]+$/.test(id)){const num=+id
if(num>=0&&num<MAX_SAFE_INTEGER){return num}}
return id})}
this.build=m[5]?m[5].split('.'):[]
this.format()}
format(){this.version=`${this.major}.${this.minor}.${this.patch}`
if(this.prerelease.length){this.version+=`-${this.prerelease.join('.')}`}
return this.version}
toString(){return this.version}
compare(other){debug('SemVer.compare',this.version,this.options,other)
if(!(other instanceof SemVer)){if(typeof other==='string'&&other===this.version){return 0}
other=new SemVer(other,this.options)}
if(other.version===this.version){return 0}
return this.compareMain(other)||this.comparePre(other)}
compareMain(other){if(!(other instanceof SemVer)){other=new SemVer(other,this.options)}
return(compareIdentifiers(this.major,other.major)||compareIdentifiers(this.minor,other.minor)||compareIdentifiers(this.patch,other.patch))}
comparePre(other){if(!(other instanceof SemVer)){other=new SemVer(other,this.options)}
if(this.prerelease.length&&!other.prerelease.length){return-1}else if(!this.prerelease.length&&other.prerelease.length){return 1}else if(!this.prerelease.length&&!other.prerelease.length){return 0}
let i=0
do{const a=this.prerelease[i]
const b=other.prerelease[i]
debug('prerelease compare',i,a,b)
if(a===undefined&&b===undefined){return 0}else if(b===undefined){return 1}else if(a===undefined){return-1}else if(a===b){continue}else{return compareIdentifiers(a,b)}}while(++i)}
compareBuild(other){if(!(other instanceof SemVer)){other=new SemVer(other,this.options)}
let i=0
do{const a=this.build[i]
const b=other.build[i]
debug('prerelease compare',i,a,b)
if(a===undefined&&b===undefined){return 0}else if(b===undefined){return 1}else if(a===undefined){return-1}else if(a===b){continue}else{return compareIdentifiers(a,b)}}while(++i)}
inc(release,identifier){switch(release){case'premajor':this.prerelease.length=0
this.patch=0
this.minor=0
this.major++
this.inc('pre',identifier)
break
case'preminor':this.prerelease.length=0
this.patch=0
this.minor++
this.inc('pre',identifier)
break
case'prepatch':this.prerelease.length=0
this.inc('patch',identifier)
this.inc('pre',identifier)
break
case'prerelease':if(this.prerelease.length===0){this.inc('patch',identifier)}
this.inc('pre',identifier)
break
case'major':if(this.minor!==0||this.patch!==0||this.prerelease.length===0){this.major++}
this.minor=0
this.patch=0
this.prerelease=[]
break
case'minor':if(this.patch!==0||this.prerelease.length===0){this.minor++}
this.patch=0
this.prerelease=[]
break
case'patch':if(this.prerelease.length===0){this.patch++}
this.prerelease=[]
break
case'pre':if(this.prerelease.length===0){this.prerelease=[0]}else{let i=this.prerelease.length
while(--i>=0){if(typeof this.prerelease[i]==='number'){this.prerelease[i]++
i=-2}}
if(i===-1){this.prerelease.push(0)}}
if(identifier){if(this.prerelease[0]===identifier){if(isNaN(this.prerelease[1])){this.prerelease=[identifier,0]}}else{this.prerelease=[identifier,0]}}
break
default:throw new Error(`invalid increment argument: ${release}`)}
this.format()
this.raw=this.version
return this}}
module.exports=SemVer},{"../internal/constants":36,"../internal/debug":37,"../internal/identifiers":38,"../internal/parse-options":39,"../internal/re":40}],27:[function(require,module,exports){const eq=require('./eq')
const neq=require('./neq')
const gt=require('./gt')
const gte=require('./gte')
const lt=require('./lt')
const lte=require('./lte')
const cmp=(a,op,b,loose)=>{switch(op){case'===':if(typeof a==='object')
a=a.version
if(typeof b==='object')
b=b.version
return a===b
case'!==':if(typeof a==='object')
a=a.version
if(typeof b==='object')
b=b.version
return a!==b
case'':case'=':case'==':return eq(a,b,loose)
case'!=':return neq(a,b,loose)
case'>':return gt(a,b,loose)
case'>=':return gte(a,b,loose)
case'<':return lt(a,b,loose)
case'<=':return lte(a,b,loose)
default:throw new TypeError(`Invalid operator: ${op}`)}}
module.exports=cmp},{"./eq":29,"./gt":30,"./gte":31,"./lt":32,"./lte":33,"./neq":34}],28:[function(require,module,exports){const SemVer=require('../classes/semver')
const compare=(a,b,loose)=>new SemVer(a,loose).compare(new SemVer(b,loose))
module.exports=compare},{"../classes/semver":26}],29:[function(require,module,exports){const compare=require('./compare')
const eq=(a,b,loose)=>compare(a,b,loose)===0
module.exports=eq},{"./compare":28}],30:[function(require,module,exports){const compare=require('./compare')
const gt=(a,b,loose)=>compare(a,b,loose)>0
module.exports=gt},{"./compare":28}],31:[function(require,module,exports){const compare=require('./compare')
const gte=(a,b,loose)=>compare(a,b,loose)>=0
module.exports=gte},{"./compare":28}],32:[function(require,module,exports){const compare=require('./compare')
const lt=(a,b,loose)=>compare(a,b,loose)<0
module.exports=lt},{"./compare":28}],33:[function(require,module,exports){const compare=require('./compare')
const lte=(a,b,loose)=>compare(a,b,loose)<=0
module.exports=lte},{"./compare":28}],34:[function(require,module,exports){const compare=require('./compare')
const neq=(a,b,loose)=>compare(a,b,loose)!==0
module.exports=neq},{"./compare":28}],35:[function(require,module,exports){const Range=require('../classes/range')
const satisfies=(version,range,options)=>{try{range=new Range(range,options)}catch(er){return false}
return range.test(version)}
module.exports=satisfies},{"../classes/range":25}],36:[function(require,module,exports){const SEMVER_SPEC_VERSION='2.0.0'
const MAX_LENGTH=256
const MAX_SAFE_INTEGER=Number.MAX_SAFE_INTEGER||9007199254740991
const MAX_SAFE_COMPONENT_LENGTH=16
module.exports={SEMVER_SPEC_VERSION,MAX_LENGTH,MAX_SAFE_INTEGER,MAX_SAFE_COMPONENT_LENGTH}},{}],37:[function(require,module,exports){(function(process){(function(){const debug=(typeof process==='object'&&process.env&&process.env.NODE_DEBUG&&/\bsemver\b/i.test(process.env.NODE_DEBUG))?(...args)=>console.error('SEMVER',...args):()=>{}
module.exports=debug}).call(this)}).call(this,require('_process'))},{"_process":54}],38:[function(require,module,exports){const numeric=/^[0-9]+$/
const compareIdentifiers=(a,b)=>{const anum=numeric.test(a)
const bnum=numeric.test(b)
if(anum&&bnum){a=+a
b=+b}
return a===b?0:(anum&&!bnum)?-1:(bnum&&!anum)?1:a<b?-1:1}
const rcompareIdentifiers=(a,b)=>compareIdentifiers(b,a)
module.exports={compareIdentifiers,rcompareIdentifiers}},{}],39:[function(require,module,exports){const opts=['includePrerelease','loose','rtl']
const parseOptions=options=>!options?{}:typeof options!=='object'?{loose:true}:opts.filter(k=>options[k]).reduce((options,k)=>{options[k]=true
return options},{})
module.exports=parseOptions},{}],40:[function(require,module,exports){const{MAX_SAFE_COMPONENT_LENGTH}=require('./constants')
const debug=require('./debug')
exports=module.exports={}
const re=exports.re=[]
const src=exports.src=[]
const t=exports.t={}
let R=0
const createToken=(name,value,isGlobal)=>{const index=R++
debug(index,value)
t[name]=index
src[index]=value
re[index]=new RegExp(value,isGlobal?'g':undefined)}
createToken('NUMERICIDENTIFIER','0|[1-9]\\d*')
createToken('NUMERICIDENTIFIERLOOSE','[0-9]+')
createToken('NONNUMERICIDENTIFIER','\\d*[a-zA-Z-][a-zA-Z0-9-]*')
createToken('MAINVERSION',`(${src[t.NUMERICIDENTIFIER]})\\.`+`(${src[t.NUMERICIDENTIFIER]})\\.`+`(${src[t.NUMERICIDENTIFIER]})`)
createToken('MAINVERSIONLOOSE',`(${src[t.NUMERICIDENTIFIERLOOSE]})\\.`+`(${src[t.NUMERICIDENTIFIERLOOSE]})\\.`+`(${src[t.NUMERICIDENTIFIERLOOSE]})`)
createToken('PRERELEASEIDENTIFIER',`(?:${src[t.NUMERICIDENTIFIER]
}|${src[t.NONNUMERICIDENTIFIER]})`)
createToken('PRERELEASEIDENTIFIERLOOSE',`(?:${src[t.NUMERICIDENTIFIERLOOSE]
}|${src[t.NONNUMERICIDENTIFIER]})`)
createToken('PRERELEASE',`(?:-(${src[t.PRERELEASEIDENTIFIER]
}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`)
createToken('PRERELEASELOOSE',`(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`)
createToken('BUILDIDENTIFIER','[0-9A-Za-z-]+')
createToken('BUILD',`(?:\\+(${src[t.BUILDIDENTIFIER]
}(?:\\.${src[t.BUILDIDENTIFIER]})*))`)
createToken('FULLPLAIN',`v?${src[t.MAINVERSION]
}${src[t.PRERELEASE]}?${
  src[t.BUILD]}?`)
createToken('FULL',`^${src[t.FULLPLAIN]}$`)
createToken('LOOSEPLAIN',`[v=\\s]*${src[t.MAINVERSIONLOOSE]
}${src[t.PRERELEASELOOSE]}?${
  src[t.BUILD]}?`)
createToken('LOOSE',`^${src[t.LOOSEPLAIN]}$`)
createToken('GTLT','((?:<|>)?=?)')
createToken('XRANGEIDENTIFIERLOOSE',`${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`)
createToken('XRANGEIDENTIFIER',`${src[t.NUMERICIDENTIFIER]}|x|X|\\*`)
createToken('XRANGEPLAIN',`[v=\\s]*(${src[t.XRANGEIDENTIFIER]})`+`(?:\\.(${src[t.XRANGEIDENTIFIER]})`+`(?:\\.(${src[t.XRANGEIDENTIFIER]})`+`(?:${src[t.PRERELEASE]})?${
                     src[t.BUILD]}?`+`)?)?`)
createToken('XRANGEPLAINLOOSE',`[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})`+`(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})`+`(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})`+`(?:${src[t.PRERELEASELOOSE]})?${
                          src[t.BUILD]}?`+`)?)?`)
createToken('XRANGE',`^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`)
createToken('XRANGELOOSE',`^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`)
createToken('COERCE',`${'(^|[^\\d])' +
              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})`+`(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`+`(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`+`(?:$|[^\\d])`)
createToken('COERCERTL',src[t.COERCE],true)
createToken('LONETILDE','(?:~>?)')
createToken('TILDETRIM',`(\\s*)${src[t.LONETILDE]}\\s+`,true)
exports.tildeTrimReplace='$1~'
createToken('TILDE',`^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`)
createToken('TILDELOOSE',`^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`)
createToken('LONECARET','(?:\\^)')
createToken('CARETTRIM',`(\\s*)${src[t.LONECARET]}\\s+`,true)
exports.caretTrimReplace='$1^'
createToken('CARET',`^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`)
createToken('CARETLOOSE',`^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`)
createToken('COMPARATORLOOSE',`^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`)
createToken('COMPARATOR',`^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`)
createToken('COMPARATORTRIM',`(\\s*)${src[t.GTLT]
}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`,true)
exports.comparatorTrimReplace='$1$2$3'
createToken('HYPHENRANGE',`^\\s*(${src[t.XRANGEPLAIN]})`+`\\s+-\\s+`+`(${src[t.XRANGEPLAIN]})`+`\\s*$`)
createToken('HYPHENRANGELOOSE',`^\\s*(${src[t.XRANGEPLAINLOOSE]})`+`\\s+-\\s+`+`(${src[t.XRANGEPLAINLOOSE]})`+`\\s*$`)
createToken('STAR','(<|>)?=?\\s*\\*')
createToken('GTE0','^\\s*>=\\s*0\.0\.0\\s*$')
createToken('GTE0PRE','^\\s*>=\\s*0\.0\.0-0\\s*$')},{"./constants":36,"./debug":37}],41:[function(require,module,exports){'use strict'
module.exports=function(Yallist){Yallist.prototype[Symbol.iterator]=function*(){for(let walker=this.head;walker;walker=walker.next){yield walker.value}}}},{}],42:[function(require,module,exports){'use strict'
module.exports=Yallist
Yallist.Node=Node
Yallist.create=Yallist
function Yallist(list){var self=this
if(!(self instanceof Yallist)){self=new Yallist()}
self.tail=null
self.head=null
self.length=0
if(list&&typeof list.forEach==='function'){list.forEach(function(item){self.push(item)})}else if(arguments.length>0){for(var i=0,l=arguments.length;i<l;i++){self.push(arguments[i])}}
return self}
Yallist.prototype.removeNode=function(node){if(node.list!==this){throw new Error('removing node which does not belong to this list')}
var next=node.next
var prev=node.prev
if(next){next.prev=prev}
if(prev){prev.next=next}
if(node===this.head){this.head=next}
if(node===this.tail){this.tail=prev}
node.list.length--
node.next=null
node.prev=null
node.list=null
return next}
Yallist.prototype.unshiftNode=function(node){if(node===this.head){return}
if(node.list){node.list.removeNode(node)}
var head=this.head
node.list=this
node.next=head
if(head){head.prev=node}
this.head=node
if(!this.tail){this.tail=node}
this.length++}
Yallist.prototype.pushNode=function(node){if(node===this.tail){return}
if(node.list){node.list.removeNode(node)}
var tail=this.tail
node.list=this
node.prev=tail
if(tail){tail.next=node}
this.tail=node
if(!this.head){this.head=node}
this.length++}
Yallist.prototype.push=function(){for(var i=0,l=arguments.length;i<l;i++){push(this,arguments[i])}
return this.length}
Yallist.prototype.unshift=function(){for(var i=0,l=arguments.length;i<l;i++){unshift(this,arguments[i])}
return this.length}
Yallist.prototype.pop=function(){if(!this.tail){return undefined}
var res=this.tail.value
this.tail=this.tail.prev
if(this.tail){this.tail.next=null}else{this.head=null}
this.length--
return res}
Yallist.prototype.shift=function(){if(!this.head){return undefined}
var res=this.head.value
this.head=this.head.next
if(this.head){this.head.prev=null}else{this.tail=null}
this.length--
return res}
Yallist.prototype.forEach=function(fn,thisp){thisp=thisp||this
for(var walker=this.head,i=0;walker!==null;i++){fn.call(thisp,walker.value,i,this)
walker=walker.next}}
Yallist.prototype.forEachReverse=function(fn,thisp){thisp=thisp||this
for(var walker=this.tail,i=this.length-1;walker!==null;i--){fn.call(thisp,walker.value,i,this)
walker=walker.prev}}
Yallist.prototype.get=function(n){for(var i=0,walker=this.head;walker!==null&&i<n;i++){walker=walker.next}
if(i===n&&walker!==null){return walker.value}}
Yallist.prototype.getReverse=function(n){for(var i=0,walker=this.tail;walker!==null&&i<n;i++){walker=walker.prev}
if(i===n&&walker!==null){return walker.value}}
Yallist.prototype.map=function(fn,thisp){thisp=thisp||this
var res=new Yallist()
for(var walker=this.head;walker!==null;){res.push(fn.call(thisp,walker.value,this))
walker=walker.next}
return res}
Yallist.prototype.mapReverse=function(fn,thisp){thisp=thisp||this
var res=new Yallist()
for(var walker=this.tail;walker!==null;){res.push(fn.call(thisp,walker.value,this))
walker=walker.prev}
return res}
Yallist.prototype.reduce=function(fn,initial){var acc
var walker=this.head
if(arguments.length>1){acc=initial}else if(this.head){walker=this.head.next
acc=this.head.value}else{throw new TypeError('Reduce of empty list with no initial value')}
for(var i=0;walker!==null;i++){acc=fn(acc,walker.value,i)
walker=walker.next}
return acc}
Yallist.prototype.reduceReverse=function(fn,initial){var acc
var walker=this.tail
if(arguments.length>1){acc=initial}else if(this.tail){walker=this.tail.prev
acc=this.tail.value}else{throw new TypeError('Reduce of empty list with no initial value')}
for(var i=this.length-1;walker!==null;i--){acc=fn(acc,walker.value,i)
walker=walker.prev}
return acc}
Yallist.prototype.toArray=function(){var arr=new Array(this.length)
for(var i=0,walker=this.head;walker!==null;i++){arr[i]=walker.value
walker=walker.next}
return arr}
Yallist.prototype.toArrayReverse=function(){var arr=new Array(this.length)
for(var i=0,walker=this.tail;walker!==null;i++){arr[i]=walker.value
walker=walker.prev}
return arr}
Yallist.prototype.slice=function(from,to){to=to||this.length
if(to<0){to+=this.length}
from=from||0
if(from<0){from+=this.length}
var ret=new Yallist()
if(to<from||to<0){return ret}
if(from<0){from=0}
if(to>this.length){to=this.length}
for(var i=0,walker=this.head;walker!==null&&i<from;i++){walker=walker.next}
for(;walker!==null&&i<to;i++,walker=walker.next){ret.push(walker.value)}
return ret}
Yallist.prototype.sliceReverse=function(from,to){to=to||this.length
if(to<0){to+=this.length}
from=from||0
if(from<0){from+=this.length}
var ret=new Yallist()
if(to<from||to<0){return ret}
if(from<0){from=0}
if(to>this.length){to=this.length}
for(var i=this.length,walker=this.tail;walker!==null&&i>to;i--){walker=walker.prev}
for(;walker!==null&&i>from;i--,walker=walker.prev){ret.push(walker.value)}
return ret}
Yallist.prototype.splice=function(start,deleteCount,...nodes){if(start>this.length){start=this.length-1}
if(start<0){start=this.length+start;}
for(var i=0,walker=this.head;walker!==null&&i<start;i++){walker=walker.next}
var ret=[]
for(var i=0;walker&&i<deleteCount;i++){ret.push(walker.value)
walker=this.removeNode(walker)}
if(walker===null){walker=this.tail}
if(walker!==this.head&&walker!==this.tail){walker=walker.prev}
for(var i=0;i<nodes.length;i++){walker=insert(this,walker,nodes[i])}
return ret;}
Yallist.prototype.reverse=function(){var head=this.head
var tail=this.tail
for(var walker=head;walker!==null;walker=walker.prev){var p=walker.prev
walker.prev=walker.next
walker.next=p}
this.head=tail
this.tail=head
return this}
function insert(self,node,value){var inserted=node===self.head?new Node(value,null,node,self):new Node(value,node,node.next,self)
if(inserted.next===null){self.tail=inserted}
if(inserted.prev===null){self.head=inserted}
self.length++
return inserted}
function push(self,item){self.tail=new Node(item,self.tail,null,self)
if(!self.head){self.head=self.tail}
self.length++}
function unshift(self,item){self.head=new Node(item,null,self.head,self)
if(!self.tail){self.tail=self.head}
self.length++}
function Node(value,prev,next,list){if(!(this instanceof Node)){return new Node(value,prev,next,list)}
this.list=list
this.value=value
if(prev){prev.next=this
this.prev=prev}else{this.prev=null}
if(next){next.prev=this
this.next=next}else{this.next=null}}
try{require('./iterator.js')(Yallist)}catch(er){}},{"./iterator.js":41}],43:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var SDKErrorCode;(function(SDKErrorCode){SDKErrorCode["MissingApiKey"]="MISSING_API_KEY";SDKErrorCode["ModalNotReady"]="MODAL_NOT_READY";SDKErrorCode["MalformedResponse"]="MALFORMED_RESPONSE";SDKErrorCode["InvalidArgument"]="INVALID_ARGUMENT";SDKErrorCode["ExtensionNotInitialized"]="EXTENSION_NOT_INITIALIZED";SDKErrorCode["IncompatibleExtensions"]="INCOMPATIBLE_EXTENSIONS";})(SDKErrorCode=exports.SDKErrorCode||(exports.SDKErrorCode={}));var SDKWarningCode;(function(SDKWarningCode){SDKWarningCode["SyncWeb3Method"]="SYNC_WEB3_METHOD";SDKWarningCode["DuplicateIframe"]="DUPLICATE_IFRAME";SDKWarningCode["ReactNativeEndpointConfiguration"]="REACT_NATIVE_ENDPOINT_CONFIGURATION";SDKWarningCode["DeprecationNotice"]="DEPRECATION_NOTICE";})(SDKWarningCode=exports.SDKWarningCode||(exports.SDKWarningCode={}));var RPCErrorCode;(function(RPCErrorCode){RPCErrorCode[RPCErrorCode["ParseError"]=-32700]="ParseError";RPCErrorCode[RPCErrorCode["InvalidRequest"]=-32600]="InvalidRequest";RPCErrorCode[RPCErrorCode["MethodNotFound"]=-32601]="MethodNotFound";RPCErrorCode[RPCErrorCode["InvalidParams"]=-32602]="InvalidParams";RPCErrorCode[RPCErrorCode["InternalError"]=-32603]="InternalError";RPCErrorCode[RPCErrorCode["MagicLinkFailedVerification"]=-10000]="MagicLinkFailedVerification";RPCErrorCode[RPCErrorCode["MagicLinkExpired"]=-10001]="MagicLinkExpired";RPCErrorCode[RPCErrorCode["MagicLinkRateLimited"]=-10002]="MagicLinkRateLimited";RPCErrorCode[RPCErrorCode["MagicLinkInvalidRedirectURL"]=-10006]="MagicLinkInvalidRedirectURL";RPCErrorCode[RPCErrorCode["UserAlreadyLoggedIn"]=-10003]="UserAlreadyLoggedIn";RPCErrorCode[RPCErrorCode["UpdateEmailFailed"]=-10004]="UpdateEmailFailed";RPCErrorCode[RPCErrorCode["UserRequestEditEmail"]=-10005]="UserRequestEditEmail";RPCErrorCode[RPCErrorCode["InactiveRecipient"]=-10010]="InactiveRecipient";})(RPCErrorCode=exports.RPCErrorCode||(exports.RPCErrorCode={}));},{}],44:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var MagicPayloadMethod;(function(MagicPayloadMethod){MagicPayloadMethod["LoginWithMagicLink"]="magic_auth_login_with_magic_link";MagicPayloadMethod["LoginWithCredential"]="magic_auth_login_with_credential";MagicPayloadMethod["GetIdToken"]="magic_auth_get_id_token";MagicPayloadMethod["GenerateIdToken"]="magic_auth_generate_id_token";MagicPayloadMethod["GetMetadata"]="magic_auth_get_metadata";MagicPayloadMethod["IsLoggedIn"]="magic_auth_is_logged_in";MagicPayloadMethod["Logout"]="magic_auth_logout";MagicPayloadMethod["UpdateEmail"]="magic_auth_update_email";MagicPayloadMethod["LoginWithMagicLinkTestMode"]="magic_login_with_magic_link_testing_mode";MagicPayloadMethod["LoginWithCredentialTestMode"]="magic_auth_login_with_credential_testing_mode";MagicPayloadMethod["GetIdTokenTestMode"]="magic_auth_get_id_token_testing_mode";MagicPayloadMethod["GenerateIdTokenTestMode"]="magic_auth_generate_id_token_testing_mode";MagicPayloadMethod["GetMetadataTestMode"]="magic_auth_get_metadata_testing_mode";MagicPayloadMethod["IsLoggedInTestMode"]="magic_auth_is_logged_in_testing_mode";MagicPayloadMethod["LogoutTestMode"]="magic_auth_logout_testing_mode";MagicPayloadMethod["UpdateEmailTestMode"]="magic_auth_update_email_testing_mode";})(MagicPayloadMethod=exports.MagicPayloadMethod||(exports.MagicPayloadMethod={}));},{}],45:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var MagicIncomingWindowMessage;(function(MagicIncomingWindowMessage){MagicIncomingWindowMessage["MAGIC_HANDLE_RESPONSE"]="MAGIC_HANDLE_RESPONSE";MagicIncomingWindowMessage["MAGIC_OVERLAY_READY"]="MAGIC_OVERLAY_READY";MagicIncomingWindowMessage["MAGIC_SHOW_OVERLAY"]="MAGIC_SHOW_OVERLAY";MagicIncomingWindowMessage["MAGIC_HIDE_OVERLAY"]="MAGIC_HIDE_OVERLAY";MagicIncomingWindowMessage["MAGIC_HANDLE_EVENT"]="MAGIC_HANDLE_EVENT";})(MagicIncomingWindowMessage=exports.MagicIncomingWindowMessage||(exports.MagicIncomingWindowMessage={}));var MagicOutgoingWindowMessage;(function(MagicOutgoingWindowMessage){MagicOutgoingWindowMessage["MAGIC_HANDLE_REQUEST"]="MAGIC_HANDLE_REQUEST";})(MagicOutgoingWindowMessage=exports.MagicOutgoingWindowMessage||(exports.MagicOutgoingWindowMessage={}));},{}],46:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");tslib_1.__exportStar(require("./core/json-rpc-types"),exports);tslib_1.__exportStar(require("./core/message-types"),exports);tslib_1.__exportStar(require("./core/exception-types"),exports);tslib_1.__exportStar(require("./modules/rpc-provider-types"),exports);},{"./core/exception-types":43,"./core/json-rpc-types":44,"./core/message-types":45,"./modules/rpc-provider-types":47,"tslib":55}],47:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var EthChainType;(function(EthChainType){EthChainType["Harmony"]="HARMONY";})(EthChainType=exports.EthChainType||(exports.EthChainType={}));},{}],48:[function(require,module,exports){'use strict';var has=Object.prototype.hasOwnProperty,prefix='~';function Events(){}
if(Object.create){Events.prototype=Object.create(null);if(!new Events().__proto__)prefix=false;}
function EE(fn,context,once){this.fn=fn;this.context=context;this.once=once||false;}
function addListener(emitter,event,fn,context,once){if(typeof fn!=='function'){throw new TypeError('The listener must be a function');}
var listener=new EE(fn,context||emitter,once),evt=prefix?prefix+event:event;if(!emitter._events[evt])emitter._events[evt]=listener,emitter._eventsCount++;else if(!emitter._events[evt].fn)emitter._events[evt].push(listener);else emitter._events[evt]=[emitter._events[evt],listener];return emitter;}
function clearEvent(emitter,evt){if(--emitter._eventsCount===0)emitter._events=new Events();else delete emitter._events[evt];}
function EventEmitter(){this._events=new Events();this._eventsCount=0;}
EventEmitter.prototype.eventNames=function eventNames(){var names=[],events,name;if(this._eventsCount===0)return names;for(name in(events=this._events)){if(has.call(events,name))names.push(prefix?name.slice(1):name);}
if(Object.getOwnPropertySymbols){return names.concat(Object.getOwnPropertySymbols(events));}
return names;};EventEmitter.prototype.listeners=function listeners(event){var evt=prefix?prefix+event:event,handlers=this._events[evt];if(!handlers)return[];if(handlers.fn)return[handlers.fn];for(var i=0,l=handlers.length,ee=new Array(l);i<l;i++){ee[i]=handlers[i].fn;}
return ee;};EventEmitter.prototype.listenerCount=function listenerCount(event){var evt=prefix?prefix+event:event,listeners=this._events[evt];if(!listeners)return 0;if(listeners.fn)return 1;return listeners.length;};EventEmitter.prototype.emit=function emit(event,a1,a2,a3,a4,a5){var evt=prefix?prefix+event:event;if(!this._events[evt])return false;var listeners=this._events[evt],len=arguments.length,args,i;if(listeners.fn){if(listeners.once)this.removeListener(event,listeners.fn,undefined,true);switch(len){case 1:return listeners.fn.call(listeners.context),true;case 2:return listeners.fn.call(listeners.context,a1),true;case 3:return listeners.fn.call(listeners.context,a1,a2),true;case 4:return listeners.fn.call(listeners.context,a1,a2,a3),true;case 5:return listeners.fn.call(listeners.context,a1,a2,a3,a4),true;case 6:return listeners.fn.call(listeners.context,a1,a2,a3,a4,a5),true;}
for(i=1,args=new Array(len-1);i<len;i++){args[i-1]=arguments[i];}
listeners.fn.apply(listeners.context,args);}else{var length=listeners.length,j;for(i=0;i<length;i++){if(listeners[i].once)this.removeListener(event,listeners[i].fn,undefined,true);switch(len){case 1:listeners[i].fn.call(listeners[i].context);break;case 2:listeners[i].fn.call(listeners[i].context,a1);break;case 3:listeners[i].fn.call(listeners[i].context,a1,a2);break;case 4:listeners[i].fn.call(listeners[i].context,a1,a2,a3);break;default:if(!args)for(j=1,args=new Array(len-1);j<len;j++){args[j-1]=arguments[j];}
listeners[i].fn.apply(listeners[i].context,args);}}}
return true;};EventEmitter.prototype.on=function on(event,fn,context){return addListener(this,event,fn,context,false);};EventEmitter.prototype.once=function once(event,fn,context){return addListener(this,event,fn,context,true);};EventEmitter.prototype.removeListener=function removeListener(event,fn,context,once){var evt=prefix?prefix+event:event;if(!this._events[evt])return this;if(!fn){clearEvent(this,evt);return this;}
var listeners=this._events[evt];if(listeners.fn){if(listeners.fn===fn&&(!once||listeners.once)&&(!context||listeners.context===context)){clearEvent(this,evt);}}else{for(var i=0,events=[],length=listeners.length;i<length;i++){if(listeners[i].fn!==fn||(once&&!listeners[i].once)||(context&&listeners[i].context!==context)){events.push(listeners[i]);}}
if(events.length)this._events[evt]=events.length===1?events[0]:events;else clearEvent(this,evt);}
return this;};EventEmitter.prototype.removeAllListeners=function removeAllListeners(event){var evt;if(event){evt=prefix?prefix+event:event;if(this._events[evt])clearEvent(this,evt);}else{this._events=new Events();this._eventsCount=0;}
return this;};EventEmitter.prototype.off=EventEmitter.prototype.removeListener;EventEmitter.prototype.addListener=EventEmitter.prototype.on;EventEmitter.prefixed=prefix;EventEmitter.EventEmitter=EventEmitter;if('undefined'!==typeof module){module.exports=EventEmitter;}},{}],49:[function(require,module,exports){/*!
MIT License

Copyright (c) 2018 Arturas Molcanovas <a.molcanovas@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/(function(global,factory){typeof exports==='object'&&typeof module!=='undefined'?factory(exports):typeof define==='function'&&define.amd?define('localforage-driver-memory',['exports'],factory):factory(global.LocalforageDriverMemory={});}(typeof self!=='undefined'?self:this,function(exports){'use strict';var _driver='localforage-driver-memory';/*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */function __values(o){var m=typeof Symbol==="function"&&o[Symbol.iterator],i=0;if(m)return m.call(o);return{next:function(){if(o&&i>=o.length)o=void 0;return{value:o&&o[i++],done:!o};}};}/*!
    MIT License

    Copyright (c) 2018 Arturas Molcanovas <a.molcanovas@gmail.com>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

    */
function createBlob(parts,properties){parts=parts||[];properties=properties||{};try{return new Blob(parts,properties);}
catch(e){if(e.name!=='TypeError'){throw e;}
var Builder=typeof BlobBuilder!=='undefined'?BlobBuilder:typeof MSBlobBuilder!=='undefined'?MSBlobBuilder:typeof MozBlobBuilder!=='undefined'?MozBlobBuilder:WebKitBlobBuilder;var builder=new Builder();for(var i=0;i<parts.length;i+=1){builder.append(parts[i]);}
return builder.getBlob(properties.type);}}
var BLOB_TYPE_PREFIX_REGEX=/^~~local_forage_type~([^~]+)~/;var SERIALIZED_MARKER_LENGTH="__lfsc__:".length;var TYPE_SERIALIZED_MARKER_LENGTH=SERIALIZED_MARKER_LENGTH+"arbf".length;var toString=Object.prototype.toString;function stringToBuffer(serializedString){var bufferLength=serializedString.length*0.75;var len=serializedString.length;if(serializedString[serializedString.length-1]==='='){bufferLength--;if(serializedString[serializedString.length-2]==='='){bufferLength--;}}
var buffer=new ArrayBuffer(bufferLength);var bytes=new Uint8Array(buffer);for(var i=0,p=0;i<len;i+=4){var encoded1="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(serializedString[i]);var encoded2="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(serializedString[i+1]);var encoded3="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(serializedString[i+2]);var encoded4="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(serializedString[i+3]);bytes[p++]=(encoded1<<2)|(encoded2>>4);bytes[p++]=((encoded2&15)<<4)|(encoded3>>2);bytes[p++]=((encoded3&3)<<6)|(encoded4&63);}
return buffer;}
function bufferToString(buffer){var bytes=new Uint8Array(buffer);var base64String='';for(var i=0;i<bytes.length;i+=3){base64String+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[bytes[i]>>2];base64String+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[((bytes[i]&3)<<4)|(bytes[i+1]>>4)];base64String+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[((bytes[i+1]&15)<<2)|(bytes[i+2]>>6)];base64String+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[bytes[i+2]&63];}
if(bytes.length%3===2){base64String=base64String.substring(0,base64String.length-1)+'=';}
else if(bytes.length%3===1){base64String=base64String.substring(0,base64String.length-2)+'==';}
return base64String;}
function serialize(value,callback){var valueType='';if(value){valueType=toString.call(value);}
if(value&&(valueType==='[object ArrayBuffer]'||(value.buffer&&toString.call(value.buffer)==='[object ArrayBuffer]'))){var buffer=void 0;var marker="__lfsc__:";if(value instanceof ArrayBuffer){buffer=value;marker+="arbf";}
else{buffer=value.buffer;if(valueType==='[object Int8Array]'){marker+="si08";}
else if(valueType==='[object Uint8Array]'){marker+="ui08";}
else if(valueType==='[object Uint8ClampedArray]'){marker+="uic8";}
else if(valueType==='[object Int16Array]'){marker+="si16";}
else if(valueType==='[object Uint16Array]'){marker+="ur16";}
else if(valueType==='[object Int32Array]'){marker+="si32";}
else if(valueType==='[object Uint32Array]'){marker+="ui32";}
else if(valueType==='[object Float32Array]'){marker+="fl32";}
else if(valueType==='[object Float64Array]'){marker+="fl64";}
else{callback(new Error('Failed to get type for BinaryArray'));}}
callback(marker+bufferToString(buffer));}
else if(valueType==='[object Blob]'){var fileReader=new FileReader();fileReader.onload=function(){var str="~~local_forage_type~"+value.type+"~"+bufferToString(this.result);callback("__lfsc__:"+"blob"+str);};fileReader.readAsArrayBuffer(value);}
else{try{callback(JSON.stringify(value));}
catch(e){console.error('Couldn\'t convert value into a JSON string: ',value);callback(null,e);}}}
function deserialize(value){if(value.substring(0,SERIALIZED_MARKER_LENGTH)!=="__lfsc__:"){return JSON.parse(value);}
var serializedString=value.substring(TYPE_SERIALIZED_MARKER_LENGTH);var type=value.substring(SERIALIZED_MARKER_LENGTH,TYPE_SERIALIZED_MARKER_LENGTH);var blobType;if(type==="blob"&&BLOB_TYPE_PREFIX_REGEX.test(serializedString)){var matcher=serializedString.match(BLOB_TYPE_PREFIX_REGEX);blobType=matcher[1];serializedString=serializedString.substring(matcher[0].length);}
var buffer=stringToBuffer(serializedString);switch(type){case"arbf":return buffer;case"blob":return createBlob([buffer],{type:blobType});case"si08":return new Int8Array(buffer);case"ui08":return new Uint8Array(buffer);case"uic8":return new Uint8ClampedArray(buffer);case"si16":return new Int16Array(buffer);case"ur16":return new Uint16Array(buffer);case"si32":return new Int32Array(buffer);case"ui32":return new Uint32Array(buffer);case"fl32":return new Float32Array(buffer);case"fl64":return new Float64Array(buffer);default:throw new Error('Unkown type: '+type);}}
function clone(obj){var e_1,_a;if(obj===null||typeof(obj)!=='object'||'isActiveClone'in obj){return obj;}
var temp=obj instanceof Date?new Date(obj):(obj.constructor());try{for(var _b=__values(Object.keys(obj)),_c=_b.next();!_c.done;_c=_b.next()){var key=_c.value;if(Object.prototype.hasOwnProperty.call(obj,key)){obj['isActiveClone']=null;temp[key]=clone(obj[key]);delete obj['isActiveClone'];}}}
catch(e_1_1){e_1={error:e_1_1};}
finally{try{if(_c&&!_c.done&&(_a=_b.return))_a.call(_b);}
finally{if(e_1)throw e_1.error;}}
return temp;}
function getKeyPrefix(options,defaultConfig){return(options.name||defaultConfig.name)+"/"+(options.storeName||defaultConfig.storeName)+"/";}
function executeCallback(promise,callback){if(callback){promise.then(function(result){callback(null,result);},function(error){callback(error);});}}
function getCallback(){var _args=[];for(var _i=0;_i<arguments.length;_i++){_args[_i]=arguments[_i];}
if(arguments.length&&typeof arguments[arguments.length-1]==='function'){return arguments[arguments.length-1];}}
function dropInstanceCommon(options,callback){var _this=this;callback=getCallback.apply(this,arguments);options=(typeof options!=='function'&&options)||{};if(!options.name){var currentConfig=this.config();options.name=options.name||currentConfig.name;options.storeName=options.storeName||currentConfig.storeName;}
var promise;if(!options.name){promise=Promise.reject('Invalid arguments');}
else{promise=new Promise(function(resolve){if(!options.storeName){resolve(options.name+"/");}
else{resolve(getKeyPrefix(options,_this._defaultConfig));}});}
return{promise:promise,callback:callback};}
function normaliseKey(key){if(typeof key!=='string'){console.warn(key+" used as a key, but it is not a string.");key=String(key);}
return key;}
var serialiser={bufferToString:bufferToString,deserialize:deserialize,serialize:serialize,stringToBuffer:stringToBuffer};var stores={};var Store=(function(){function Store(kp){this.kp=kp;this.data={};}
Store.resolve=function(kp){if(!stores[kp]){stores[kp]=new Store(kp);}
return stores[kp];};Store.prototype.clear=function(){this.data={};};Store.prototype.drop=function(){this.clear();delete stores[this.kp];};Store.prototype.get=function(key){return this.data[key];};Store.prototype.key=function(idx){return this.keys()[idx];};Store.prototype.keys=function(){return Object.keys(this.data);};Store.prototype.rm=function(k){delete this.data[k];};Store.prototype.set=function(k,v){this.data[k]=v;};return Store;}());function _initStorage(options){var opts=options?clone(options):{};var kp=getKeyPrefix(opts,this._defaultConfig);var store=Store.resolve(kp);this._dbInfo=opts;this._dbInfo.serializer=serialiser;this._dbInfo.keyPrefix=kp;this._dbInfo.mStore=store;return Promise.resolve();}
function clear(callback){var _this=this;var promise=this.ready().then(function(){_this._dbInfo.mStore.clear();});executeCallback(promise,callback);return promise;}
function dropInstance(_options,_cb){var _a=dropInstanceCommon.apply(this,arguments),promise=_a.promise,callback=_a.callback;var outPromise=promise.then(function(keyPrefix){Store.resolve(keyPrefix).drop();});executeCallback(outPromise,callback);return promise;}
function getItem(key$,callback){var _this=this;key$=normaliseKey(key$);var promise=this.ready().then(function(){var result=_this._dbInfo.mStore.get(key$);return result==null?null:_this._dbInfo.serializer.deserialize(result);});executeCallback(promise,callback);return promise;}
function iterate(iterator,callback){var _this=this;var promise=this.ready().then(function(){var store=_this._dbInfo.mStore;var keys=store.keys();for(var i=0;i<keys.length;i++){var value=store.get(keys[i]);if(value){value=_this._dbInfo.serializer.deserialize(value);}
value=iterator(value,keys[i],i+1);if(value!==undefined){return value;}}});executeCallback(promise,callback);return promise;}
function key(idx,callback){var _this=this;var promise=this.ready().then(function(){var result;try{result=_this._dbInfo.mStore.key(idx);if(result===undefined){result=null;}}
catch(_a){result=null;}
return result;});executeCallback(promise,callback);return promise;}
function keys(callback){var _this=this;var promise=this.ready().then(function(){return _this._dbInfo.mStore.keys();});executeCallback(promise,callback);return promise;}
function length(callback){var promise=this.keys().then(function(keys$){return keys$.length;});executeCallback(promise,callback);return promise;}
function removeItem(key$,callback){var _this=this;key$=normaliseKey(key$);var promise=this.ready().then(function(){_this._dbInfo.mStore.rm(key$);});executeCallback(promise,callback);return promise;}
function setItem(key$,value,callback){var _this=this;key$=normaliseKey(key$);var promise=this.ready().then(function(){if(value===undefined){value=null;}
var originalValue=value;return new Promise(function(resolve,reject){_this._dbInfo.serializer.serialize(value,function(value$,error){if(error){reject(error);}
else{try{_this._dbInfo.mStore.set(key$,value$);resolve(originalValue);}
catch(e){reject(e);}}});});});executeCallback(promise,callback);return promise;}
var _support=true;exports._support=_support;exports._driver=_driver;exports._initStorage=_initStorage;exports.clear=clear;exports.dropInstance=dropInstance;exports.getItem=getItem;exports.iterate=iterate;exports.key=key;exports.keys=keys;exports.length=length;exports.removeItem=removeItem;exports.setItem=setItem;Object.defineProperty(exports,'__esModule',{value:true});}));},{}],50:[function(require,module,exports){(function(global){(function(){/*!
    localForage -- Offline Storage, Improved
    Version 1.9.0
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.localforage=f()}})(function(){var define,module,exports;return(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw(f.code="MODULE_NOT_FOUND",f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){(function(global){'use strict';var Mutation=global.MutationObserver||global.WebKitMutationObserver;var scheduleDrain;{if(Mutation){var called=0;var observer=new Mutation(nextTick);var element=global.document.createTextNode('');observer.observe(element,{characterData:true});scheduleDrain=function(){element.data=(called=++called%2);};}else if(!global.setImmediate&&typeof global.MessageChannel!=='undefined'){var channel=new global.MessageChannel();channel.port1.onmessage=nextTick;scheduleDrain=function(){channel.port2.postMessage(0);};}else if('document'in global&&'onreadystatechange'in global.document.createElement('script')){scheduleDrain=function(){var scriptEl=global.document.createElement('script');scriptEl.onreadystatechange=function(){nextTick();scriptEl.onreadystatechange=null;scriptEl.parentNode.removeChild(scriptEl);scriptEl=null;};global.document.documentElement.appendChild(scriptEl);};}else{scheduleDrain=function(){setTimeout(nextTick,0);};}}
var draining;var queue=[];function nextTick(){draining=true;var i,oldQueue;var len=queue.length;while(len){oldQueue=queue;queue=[];i=-1;while(++i<len){oldQueue[i]();}
len=queue.length;}
draining=false;}
module.exports=immediate;function immediate(task){if(queue.push(task)===1&&!draining){scheduleDrain();}}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],2:[function(_dereq_,module,exports){'use strict';var immediate=_dereq_(1);function INTERNAL(){}
var handlers={};var REJECTED=['REJECTED'];var FULFILLED=['FULFILLED'];var PENDING=['PENDING'];module.exports=Promise;function Promise(resolver){if(typeof resolver!=='function'){throw new TypeError('resolver must be a function');}
this.state=PENDING;this.queue=[];this.outcome=void 0;if(resolver!==INTERNAL){safelyResolveThenable(this,resolver);}}
Promise.prototype["catch"]=function(onRejected){return this.then(null,onRejected);};Promise.prototype.then=function(onFulfilled,onRejected){if(typeof onFulfilled!=='function'&&this.state===FULFILLED||typeof onRejected!=='function'&&this.state===REJECTED){return this;}
var promise=new this.constructor(INTERNAL);if(this.state!==PENDING){var resolver=this.state===FULFILLED?onFulfilled:onRejected;unwrap(promise,resolver,this.outcome);}else{this.queue.push(new QueueItem(promise,onFulfilled,onRejected));}
return promise;};function QueueItem(promise,onFulfilled,onRejected){this.promise=promise;if(typeof onFulfilled==='function'){this.onFulfilled=onFulfilled;this.callFulfilled=this.otherCallFulfilled;}
if(typeof onRejected==='function'){this.onRejected=onRejected;this.callRejected=this.otherCallRejected;}}
QueueItem.prototype.callFulfilled=function(value){handlers.resolve(this.promise,value);};QueueItem.prototype.otherCallFulfilled=function(value){unwrap(this.promise,this.onFulfilled,value);};QueueItem.prototype.callRejected=function(value){handlers.reject(this.promise,value);};QueueItem.prototype.otherCallRejected=function(value){unwrap(this.promise,this.onRejected,value);};function unwrap(promise,func,value){immediate(function(){var returnValue;try{returnValue=func(value);}catch(e){return handlers.reject(promise,e);}
if(returnValue===promise){handlers.reject(promise,new TypeError('Cannot resolve promise with itself'));}else{handlers.resolve(promise,returnValue);}});}
handlers.resolve=function(self,value){var result=tryCatch(getThen,value);if(result.status==='error'){return handlers.reject(self,result.value);}
var thenable=result.value;if(thenable){safelyResolveThenable(self,thenable);}else{self.state=FULFILLED;self.outcome=value;var i=-1;var len=self.queue.length;while(++i<len){self.queue[i].callFulfilled(value);}}
return self;};handlers.reject=function(self,error){self.state=REJECTED;self.outcome=error;var i=-1;var len=self.queue.length;while(++i<len){self.queue[i].callRejected(error);}
return self;};function getThen(obj){var then=obj&&obj.then;if(obj&&(typeof obj==='object'||typeof obj==='function')&&typeof then==='function'){return function appyThen(){then.apply(obj,arguments);};}}
function safelyResolveThenable(self,thenable){var called=false;function onError(value){if(called){return;}
called=true;handlers.reject(self,value);}
function onSuccess(value){if(called){return;}
called=true;handlers.resolve(self,value);}
function tryToUnwrap(){thenable(onSuccess,onError);}
var result=tryCatch(tryToUnwrap);if(result.status==='error'){onError(result.value);}}
function tryCatch(func,value){var out={};try{out.value=func(value);out.status='success';}catch(e){out.status='error';out.value=e;}
return out;}
Promise.resolve=resolve;function resolve(value){if(value instanceof this){return value;}
return handlers.resolve(new this(INTERNAL),value);}
Promise.reject=reject;function reject(reason){var promise=new this(INTERNAL);return handlers.reject(promise,reason);}
Promise.all=all;function all(iterable){var self=this;if(Object.prototype.toString.call(iterable)!=='[object Array]'){return this.reject(new TypeError('must be an array'));}
var len=iterable.length;var called=false;if(!len){return this.resolve([]);}
var values=new Array(len);var resolved=0;var i=-1;var promise=new this(INTERNAL);while(++i<len){allResolver(iterable[i],i);}
return promise;function allResolver(value,i){self.resolve(value).then(resolveFromAll,function(error){if(!called){called=true;handlers.reject(promise,error);}});function resolveFromAll(outValue){values[i]=outValue;if(++resolved===len&&!called){called=true;handlers.resolve(promise,values);}}}}
Promise.race=race;function race(iterable){var self=this;if(Object.prototype.toString.call(iterable)!=='[object Array]'){return this.reject(new TypeError('must be an array'));}
var len=iterable.length;var called=false;if(!len){return this.resolve([]);}
var i=-1;var promise=new this(INTERNAL);while(++i<len){resolver(iterable[i]);}
return promise;function resolver(value){self.resolve(value).then(function(response){if(!called){called=true;handlers.resolve(promise,response);}},function(error){if(!called){called=true;handlers.reject(promise,error);}});}}},{"1":1}],3:[function(_dereq_,module,exports){(function(global){'use strict';if(typeof global.Promise!=='function'){global.Promise=_dereq_(2);}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"2":2}],4:[function(_dereq_,module,exports){'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}
function getIDB(){try{if(typeof indexedDB!=='undefined'){return indexedDB;}
if(typeof webkitIndexedDB!=='undefined'){return webkitIndexedDB;}
if(typeof mozIndexedDB!=='undefined'){return mozIndexedDB;}
if(typeof OIndexedDB!=='undefined'){return OIndexedDB;}
if(typeof msIndexedDB!=='undefined'){return msIndexedDB;}}catch(e){return;}}
var idb=getIDB();function isIndexedDBValid(){try{if(!idb||!idb.open){return false;}
var isSafari=typeof openDatabase!=='undefined'&&/(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent)&&!/Chrome/.test(navigator.userAgent)&&!/BlackBerry/.test(navigator.platform);var hasFetch=typeof fetch==='function'&&fetch.toString().indexOf('[native code')!==-1;return(!isSafari||hasFetch)&&typeof indexedDB!=='undefined'&&typeof IDBKeyRange!=='undefined';}catch(e){return false;}}
function createBlob(parts,properties){parts=parts||[];properties=properties||{};try{return new Blob(parts,properties);}catch(e){if(e.name!=='TypeError'){throw e;}
var Builder=typeof BlobBuilder!=='undefined'?BlobBuilder:typeof MSBlobBuilder!=='undefined'?MSBlobBuilder:typeof MozBlobBuilder!=='undefined'?MozBlobBuilder:WebKitBlobBuilder;var builder=new Builder();for(var i=0;i<parts.length;i+=1){builder.append(parts[i]);}
return builder.getBlob(properties.type);}}
if(typeof Promise==='undefined'){_dereq_(3);}
var Promise$1=Promise;function executeCallback(promise,callback){if(callback){promise.then(function(result){callback(null,result);},function(error){callback(error);});}}
function executeTwoCallbacks(promise,callback,errorCallback){if(typeof callback==='function'){promise.then(callback);}
if(typeof errorCallback==='function'){promise["catch"](errorCallback);}}
function normalizeKey(key){if(typeof key!=='string'){console.warn(key+' used as a key, but it is not a string.');key=String(key);}
return key;}
function getCallback(){if(arguments.length&&typeof arguments[arguments.length-1]==='function'){return arguments[arguments.length-1];}}
var DETECT_BLOB_SUPPORT_STORE='local-forage-detect-blob-support';var supportsBlobs=void 0;var dbContexts={};var toString=Object.prototype.toString;var READ_ONLY='readonly';var READ_WRITE='readwrite';function _binStringToArrayBuffer(bin){var length=bin.length;var buf=new ArrayBuffer(length);var arr=new Uint8Array(buf);for(var i=0;i<length;i++){arr[i]=bin.charCodeAt(i);}
return buf;}
function _checkBlobSupportWithoutCaching(idb){return new Promise$1(function(resolve){var txn=idb.transaction(DETECT_BLOB_SUPPORT_STORE,READ_WRITE);var blob=createBlob(['']);txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob,'key');txn.onabort=function(e){e.preventDefault();e.stopPropagation();resolve(false);};txn.oncomplete=function(){var matchedChrome=navigator.userAgent.match(/Chrome\/(\d+)/);var matchedEdge=navigator.userAgent.match(/Edge\//);resolve(matchedEdge||!matchedChrome||parseInt(matchedChrome[1],10)>=43);};})["catch"](function(){return false;});}
function _checkBlobSupport(idb){if(typeof supportsBlobs==='boolean'){return Promise$1.resolve(supportsBlobs);}
return _checkBlobSupportWithoutCaching(idb).then(function(value){supportsBlobs=value;return supportsBlobs;});}
function _deferReadiness(dbInfo){var dbContext=dbContexts[dbInfo.name];var deferredOperation={};deferredOperation.promise=new Promise$1(function(resolve,reject){deferredOperation.resolve=resolve;deferredOperation.reject=reject;});dbContext.deferredOperations.push(deferredOperation);if(!dbContext.dbReady){dbContext.dbReady=deferredOperation.promise;}else{dbContext.dbReady=dbContext.dbReady.then(function(){return deferredOperation.promise;});}}
function _advanceReadiness(dbInfo){var dbContext=dbContexts[dbInfo.name];var deferredOperation=dbContext.deferredOperations.pop();if(deferredOperation){deferredOperation.resolve();return deferredOperation.promise;}}
function _rejectReadiness(dbInfo,err){var dbContext=dbContexts[dbInfo.name];var deferredOperation=dbContext.deferredOperations.pop();if(deferredOperation){deferredOperation.reject(err);return deferredOperation.promise;}}
function _getConnection(dbInfo,upgradeNeeded){return new Promise$1(function(resolve,reject){dbContexts[dbInfo.name]=dbContexts[dbInfo.name]||createDbContext();if(dbInfo.db){if(upgradeNeeded){_deferReadiness(dbInfo);dbInfo.db.close();}else{return resolve(dbInfo.db);}}
var dbArgs=[dbInfo.name];if(upgradeNeeded){dbArgs.push(dbInfo.version);}
var openreq=idb.open.apply(idb,dbArgs);if(upgradeNeeded){openreq.onupgradeneeded=function(e){var db=openreq.result;try{db.createObjectStore(dbInfo.storeName);if(e.oldVersion<=1){db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);}}catch(ex){if(ex.name==='ConstraintError'){console.warn('The database "'+dbInfo.name+'"'+' has been upgraded from version '+e.oldVersion+' to version '+e.newVersion+', but the storage "'+dbInfo.storeName+'" already exists.');}else{throw ex;}}};}
openreq.onerror=function(e){e.preventDefault();reject(openreq.error);};openreq.onsuccess=function(){resolve(openreq.result);_advanceReadiness(dbInfo);};});}
function _getOriginalConnection(dbInfo){return _getConnection(dbInfo,false);}
function _getUpgradedConnection(dbInfo){return _getConnection(dbInfo,true);}
function _isUpgradeNeeded(dbInfo,defaultVersion){if(!dbInfo.db){return true;}
var isNewStore=!dbInfo.db.objectStoreNames.contains(dbInfo.storeName);var isDowngrade=dbInfo.version<dbInfo.db.version;var isUpgrade=dbInfo.version>dbInfo.db.version;if(isDowngrade){if(dbInfo.version!==defaultVersion){console.warn('The database "'+dbInfo.name+'"'+" can't be downgraded from version "+dbInfo.db.version+' to version '+dbInfo.version+'.');}
dbInfo.version=dbInfo.db.version;}
if(isUpgrade||isNewStore){if(isNewStore){var incVersion=dbInfo.db.version+1;if(incVersion>dbInfo.version){dbInfo.version=incVersion;}}
return true;}
return false;}
function _encodeBlob(blob){return new Promise$1(function(resolve,reject){var reader=new FileReader();reader.onerror=reject;reader.onloadend=function(e){var base64=btoa(e.target.result||'');resolve({__local_forage_encoded_blob:true,data:base64,type:blob.type});};reader.readAsBinaryString(blob);});}
function _decodeBlob(encodedBlob){var arrayBuff=_binStringToArrayBuffer(atob(encodedBlob.data));return createBlob([arrayBuff],{type:encodedBlob.type});}
function _isEncodedBlob(value){return value&&value.__local_forage_encoded_blob;}
function _fullyReady(callback){var self=this;var promise=self._initReady().then(function(){var dbContext=dbContexts[self._dbInfo.name];if(dbContext&&dbContext.dbReady){return dbContext.dbReady;}});executeTwoCallbacks(promise,callback,callback);return promise;}
function _tryReconnect(dbInfo){_deferReadiness(dbInfo);var dbContext=dbContexts[dbInfo.name];var forages=dbContext.forages;for(var i=0;i<forages.length;i++){var forage=forages[i];if(forage._dbInfo.db){forage._dbInfo.db.close();forage._dbInfo.db=null;}}
dbInfo.db=null;return _getOriginalConnection(dbInfo).then(function(db){dbInfo.db=db;if(_isUpgradeNeeded(dbInfo)){return _getUpgradedConnection(dbInfo);}
return db;}).then(function(db){dbInfo.db=dbContext.db=db;for(var i=0;i<forages.length;i++){forages[i]._dbInfo.db=db;}})["catch"](function(err){_rejectReadiness(dbInfo,err);throw err;});}
function createTransaction(dbInfo,mode,callback,retries){if(retries===undefined){retries=1;}
try{var tx=dbInfo.db.transaction(dbInfo.storeName,mode);callback(null,tx);}catch(err){if(retries>0&&(!dbInfo.db||err.name==='InvalidStateError'||err.name==='NotFoundError')){return Promise$1.resolve().then(function(){if(!dbInfo.db||err.name==='NotFoundError'&&!dbInfo.db.objectStoreNames.contains(dbInfo.storeName)&&dbInfo.version<=dbInfo.db.version){if(dbInfo.db){dbInfo.version=dbInfo.db.version+1;}
return _getUpgradedConnection(dbInfo);}}).then(function(){return _tryReconnect(dbInfo).then(function(){createTransaction(dbInfo,mode,callback,retries-1);});})["catch"](callback);}
callback(err);}}
function createDbContext(){return{forages:[],db:null,dbReady:null,deferredOperations:[]};}
function _initStorage(options){var self=this;var dbInfo={db:null};if(options){for(var i in options){dbInfo[i]=options[i];}}
var dbContext=dbContexts[dbInfo.name];if(!dbContext){dbContext=createDbContext();dbContexts[dbInfo.name]=dbContext;}
dbContext.forages.push(self);if(!self._initReady){self._initReady=self.ready;self.ready=_fullyReady;}
var initPromises=[];function ignoreErrors(){return Promise$1.resolve();}
for(var j=0;j<dbContext.forages.length;j++){var forage=dbContext.forages[j];if(forage!==self){initPromises.push(forage._initReady()["catch"](ignoreErrors));}}
var forages=dbContext.forages.slice(0);return Promise$1.all(initPromises).then(function(){dbInfo.db=dbContext.db;return _getOriginalConnection(dbInfo);}).then(function(db){dbInfo.db=db;if(_isUpgradeNeeded(dbInfo,self._defaultConfig.version)){return _getUpgradedConnection(dbInfo);}
return db;}).then(function(db){dbInfo.db=dbContext.db=db;self._dbInfo=dbInfo;for(var k=0;k<forages.length;k++){var forage=forages[k];if(forage!==self){forage._dbInfo.db=dbInfo.db;forage._dbInfo.version=dbInfo.version;}}});}
function getItem(key,callback){var self=this;key=normalizeKey(key);var promise=new Promise$1(function(resolve,reject){self.ready().then(function(){createTransaction(self._dbInfo,READ_ONLY,function(err,transaction){if(err){return reject(err);}
try{var store=transaction.objectStore(self._dbInfo.storeName);var req=store.get(key);req.onsuccess=function(){var value=req.result;if(value===undefined){value=null;}
if(_isEncodedBlob(value)){value=_decodeBlob(value);}
resolve(value);};req.onerror=function(){reject(req.error);};}catch(e){reject(e);}});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function iterate(iterator,callback){var self=this;var promise=new Promise$1(function(resolve,reject){self.ready().then(function(){createTransaction(self._dbInfo,READ_ONLY,function(err,transaction){if(err){return reject(err);}
try{var store=transaction.objectStore(self._dbInfo.storeName);var req=store.openCursor();var iterationNumber=1;req.onsuccess=function(){var cursor=req.result;if(cursor){var value=cursor.value;if(_isEncodedBlob(value)){value=_decodeBlob(value);}
var result=iterator(value,cursor.key,iterationNumber++);if(result!==void 0){resolve(result);}else{cursor["continue"]();}}else{resolve();}};req.onerror=function(){reject(req.error);};}catch(e){reject(e);}});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function setItem(key,value,callback){var self=this;key=normalizeKey(key);var promise=new Promise$1(function(resolve,reject){var dbInfo;self.ready().then(function(){dbInfo=self._dbInfo;if(toString.call(value)==='[object Blob]'){return _checkBlobSupport(dbInfo.db).then(function(blobSupport){if(blobSupport){return value;}
return _encodeBlob(value);});}
return value;}).then(function(value){createTransaction(self._dbInfo,READ_WRITE,function(err,transaction){if(err){return reject(err);}
try{var store=transaction.objectStore(self._dbInfo.storeName);if(value===null){value=undefined;}
var req=store.put(value,key);transaction.oncomplete=function(){if(value===undefined){value=null;}
resolve(value);};transaction.onabort=transaction.onerror=function(){var err=req.error?req.error:req.transaction.error;reject(err);};}catch(e){reject(e);}});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function removeItem(key,callback){var self=this;key=normalizeKey(key);var promise=new Promise$1(function(resolve,reject){self.ready().then(function(){createTransaction(self._dbInfo,READ_WRITE,function(err,transaction){if(err){return reject(err);}
try{var store=transaction.objectStore(self._dbInfo.storeName);var req=store["delete"](key);transaction.oncomplete=function(){resolve();};transaction.onerror=function(){reject(req.error);};transaction.onabort=function(){var err=req.error?req.error:req.transaction.error;reject(err);};}catch(e){reject(e);}});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function clear(callback){var self=this;var promise=new Promise$1(function(resolve,reject){self.ready().then(function(){createTransaction(self._dbInfo,READ_WRITE,function(err,transaction){if(err){return reject(err);}
try{var store=transaction.objectStore(self._dbInfo.storeName);var req=store.clear();transaction.oncomplete=function(){resolve();};transaction.onabort=transaction.onerror=function(){var err=req.error?req.error:req.transaction.error;reject(err);};}catch(e){reject(e);}});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function length(callback){var self=this;var promise=new Promise$1(function(resolve,reject){self.ready().then(function(){createTransaction(self._dbInfo,READ_ONLY,function(err,transaction){if(err){return reject(err);}
try{var store=transaction.objectStore(self._dbInfo.storeName);var req=store.count();req.onsuccess=function(){resolve(req.result);};req.onerror=function(){reject(req.error);};}catch(e){reject(e);}});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function key(n,callback){var self=this;var promise=new Promise$1(function(resolve,reject){if(n<0){resolve(null);return;}
self.ready().then(function(){createTransaction(self._dbInfo,READ_ONLY,function(err,transaction){if(err){return reject(err);}
try{var store=transaction.objectStore(self._dbInfo.storeName);var advanced=false;var req=store.openKeyCursor();req.onsuccess=function(){var cursor=req.result;if(!cursor){resolve(null);return;}
if(n===0){resolve(cursor.key);}else{if(!advanced){advanced=true;cursor.advance(n);}else{resolve(cursor.key);}}};req.onerror=function(){reject(req.error);};}catch(e){reject(e);}});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function keys(callback){var self=this;var promise=new Promise$1(function(resolve,reject){self.ready().then(function(){createTransaction(self._dbInfo,READ_ONLY,function(err,transaction){if(err){return reject(err);}
try{var store=transaction.objectStore(self._dbInfo.storeName);var req=store.openKeyCursor();var keys=[];req.onsuccess=function(){var cursor=req.result;if(!cursor){resolve(keys);return;}
keys.push(cursor.key);cursor["continue"]();};req.onerror=function(){reject(req.error);};}catch(e){reject(e);}});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function dropInstance(options,callback){callback=getCallback.apply(this,arguments);var currentConfig=this.config();options=typeof options!=='function'&&options||{};if(!options.name){options.name=options.name||currentConfig.name;options.storeName=options.storeName||currentConfig.storeName;}
var self=this;var promise;if(!options.name){promise=Promise$1.reject('Invalid arguments');}else{var isCurrentDb=options.name===currentConfig.name&&self._dbInfo.db;var dbPromise=isCurrentDb?Promise$1.resolve(self._dbInfo.db):_getOriginalConnection(options).then(function(db){var dbContext=dbContexts[options.name];var forages=dbContext.forages;dbContext.db=db;for(var i=0;i<forages.length;i++){forages[i]._dbInfo.db=db;}
return db;});if(!options.storeName){promise=dbPromise.then(function(db){_deferReadiness(options);var dbContext=dbContexts[options.name];var forages=dbContext.forages;db.close();for(var i=0;i<forages.length;i++){var forage=forages[i];forage._dbInfo.db=null;}
var dropDBPromise=new Promise$1(function(resolve,reject){var req=idb.deleteDatabase(options.name);req.onerror=req.onblocked=function(err){var db=req.result;if(db){db.close();}
reject(err);};req.onsuccess=function(){var db=req.result;if(db){db.close();}
resolve(db);};});return dropDBPromise.then(function(db){dbContext.db=db;for(var i=0;i<forages.length;i++){var _forage=forages[i];_advanceReadiness(_forage._dbInfo);}})["catch"](function(err){(_rejectReadiness(options,err)||Promise$1.resolve())["catch"](function(){});throw err;});});}else{promise=dbPromise.then(function(db){if(!db.objectStoreNames.contains(options.storeName)){return;}
var newVersion=db.version+1;_deferReadiness(options);var dbContext=dbContexts[options.name];var forages=dbContext.forages;db.close();for(var i=0;i<forages.length;i++){var forage=forages[i];forage._dbInfo.db=null;forage._dbInfo.version=newVersion;}
var dropObjectPromise=new Promise$1(function(resolve,reject){var req=idb.open(options.name,newVersion);req.onerror=function(err){var db=req.result;db.close();reject(err);};req.onupgradeneeded=function(){var db=req.result;db.deleteObjectStore(options.storeName);};req.onsuccess=function(){var db=req.result;db.close();resolve(db);};});return dropObjectPromise.then(function(db){dbContext.db=db;for(var j=0;j<forages.length;j++){var _forage2=forages[j];_forage2._dbInfo.db=db;_advanceReadiness(_forage2._dbInfo);}})["catch"](function(err){(_rejectReadiness(options,err)||Promise$1.resolve())["catch"](function(){});throw err;});});}}
executeCallback(promise,callback);return promise;}
var asyncStorage={_driver:'asyncStorage',_initStorage:_initStorage,_support:isIndexedDBValid(),iterate:iterate,getItem:getItem,setItem:setItem,removeItem:removeItem,clear:clear,length:length,key:key,keys:keys,dropInstance:dropInstance};function isWebSQLValid(){return typeof openDatabase==='function';}
var BASE_CHARS='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';var BLOB_TYPE_PREFIX='~~local_forage_type~';var BLOB_TYPE_PREFIX_REGEX=/^~~local_forage_type~([^~]+)~/;var SERIALIZED_MARKER='__lfsc__:';var SERIALIZED_MARKER_LENGTH=SERIALIZED_MARKER.length;var TYPE_ARRAYBUFFER='arbf';var TYPE_BLOB='blob';var TYPE_INT8ARRAY='si08';var TYPE_UINT8ARRAY='ui08';var TYPE_UINT8CLAMPEDARRAY='uic8';var TYPE_INT16ARRAY='si16';var TYPE_INT32ARRAY='si32';var TYPE_UINT16ARRAY='ur16';var TYPE_UINT32ARRAY='ui32';var TYPE_FLOAT32ARRAY='fl32';var TYPE_FLOAT64ARRAY='fl64';var TYPE_SERIALIZED_MARKER_LENGTH=SERIALIZED_MARKER_LENGTH+TYPE_ARRAYBUFFER.length;var toString$1=Object.prototype.toString;function stringToBuffer(serializedString){var bufferLength=serializedString.length*0.75;var len=serializedString.length;var i;var p=0;var encoded1,encoded2,encoded3,encoded4;if(serializedString[serializedString.length-1]==='='){bufferLength--;if(serializedString[serializedString.length-2]==='='){bufferLength--;}}
var buffer=new ArrayBuffer(bufferLength);var bytes=new Uint8Array(buffer);for(i=0;i<len;i+=4){encoded1=BASE_CHARS.indexOf(serializedString[i]);encoded2=BASE_CHARS.indexOf(serializedString[i+1]);encoded3=BASE_CHARS.indexOf(serializedString[i+2]);encoded4=BASE_CHARS.indexOf(serializedString[i+3]);bytes[p++]=encoded1<<2|encoded2>>4;bytes[p++]=(encoded2&15)<<4|encoded3>>2;bytes[p++]=(encoded3&3)<<6|encoded4&63;}
return buffer;}
function bufferToString(buffer){var bytes=new Uint8Array(buffer);var base64String='';var i;for(i=0;i<bytes.length;i+=3){base64String+=BASE_CHARS[bytes[i]>>2];base64String+=BASE_CHARS[(bytes[i]&3)<<4|bytes[i+1]>>4];base64String+=BASE_CHARS[(bytes[i+1]&15)<<2|bytes[i+2]>>6];base64String+=BASE_CHARS[bytes[i+2]&63];}
if(bytes.length%3===2){base64String=base64String.substring(0,base64String.length-1)+'=';}else if(bytes.length%3===1){base64String=base64String.substring(0,base64String.length-2)+'==';}
return base64String;}
function serialize(value,callback){var valueType='';if(value){valueType=toString$1.call(value);}
if(value&&(valueType==='[object ArrayBuffer]'||value.buffer&&toString$1.call(value.buffer)==='[object ArrayBuffer]')){var buffer;var marker=SERIALIZED_MARKER;if(value instanceof ArrayBuffer){buffer=value;marker+=TYPE_ARRAYBUFFER;}else{buffer=value.buffer;if(valueType==='[object Int8Array]'){marker+=TYPE_INT8ARRAY;}else if(valueType==='[object Uint8Array]'){marker+=TYPE_UINT8ARRAY;}else if(valueType==='[object Uint8ClampedArray]'){marker+=TYPE_UINT8CLAMPEDARRAY;}else if(valueType==='[object Int16Array]'){marker+=TYPE_INT16ARRAY;}else if(valueType==='[object Uint16Array]'){marker+=TYPE_UINT16ARRAY;}else if(valueType==='[object Int32Array]'){marker+=TYPE_INT32ARRAY;}else if(valueType==='[object Uint32Array]'){marker+=TYPE_UINT32ARRAY;}else if(valueType==='[object Float32Array]'){marker+=TYPE_FLOAT32ARRAY;}else if(valueType==='[object Float64Array]'){marker+=TYPE_FLOAT64ARRAY;}else{callback(new Error('Failed to get type for BinaryArray'));}}
callback(marker+bufferToString(buffer));}else if(valueType==='[object Blob]'){var fileReader=new FileReader();fileReader.onload=function(){var str=BLOB_TYPE_PREFIX+value.type+'~'+bufferToString(this.result);callback(SERIALIZED_MARKER+TYPE_BLOB+str);};fileReader.readAsArrayBuffer(value);}else{try{callback(JSON.stringify(value));}catch(e){console.error("Couldn't convert value into a JSON string: ",value);callback(null,e);}}}
function deserialize(value){if(value.substring(0,SERIALIZED_MARKER_LENGTH)!==SERIALIZED_MARKER){return JSON.parse(value);}
var serializedString=value.substring(TYPE_SERIALIZED_MARKER_LENGTH);var type=value.substring(SERIALIZED_MARKER_LENGTH,TYPE_SERIALIZED_MARKER_LENGTH);var blobType;if(type===TYPE_BLOB&&BLOB_TYPE_PREFIX_REGEX.test(serializedString)){var matcher=serializedString.match(BLOB_TYPE_PREFIX_REGEX);blobType=matcher[1];serializedString=serializedString.substring(matcher[0].length);}
var buffer=stringToBuffer(serializedString);switch(type){case TYPE_ARRAYBUFFER:return buffer;case TYPE_BLOB:return createBlob([buffer],{type:blobType});case TYPE_INT8ARRAY:return new Int8Array(buffer);case TYPE_UINT8ARRAY:return new Uint8Array(buffer);case TYPE_UINT8CLAMPEDARRAY:return new Uint8ClampedArray(buffer);case TYPE_INT16ARRAY:return new Int16Array(buffer);case TYPE_UINT16ARRAY:return new Uint16Array(buffer);case TYPE_INT32ARRAY:return new Int32Array(buffer);case TYPE_UINT32ARRAY:return new Uint32Array(buffer);case TYPE_FLOAT32ARRAY:return new Float32Array(buffer);case TYPE_FLOAT64ARRAY:return new Float64Array(buffer);default:throw new Error('Unkown type: '+type);}}
var localforageSerializer={serialize:serialize,deserialize:deserialize,stringToBuffer:stringToBuffer,bufferToString:bufferToString};function createDbTable(t,dbInfo,callback,errorCallback){t.executeSql('CREATE TABLE IF NOT EXISTS '+dbInfo.storeName+' '+'(id INTEGER PRIMARY KEY, key unique, value)',[],callback,errorCallback);}
function _initStorage$1(options){var self=this;var dbInfo={db:null};if(options){for(var i in options){dbInfo[i]=typeof options[i]!=='string'?options[i].toString():options[i];}}
var dbInfoPromise=new Promise$1(function(resolve,reject){try{dbInfo.db=openDatabase(dbInfo.name,String(dbInfo.version),dbInfo.description,dbInfo.size);}catch(e){return reject(e);}
dbInfo.db.transaction(function(t){createDbTable(t,dbInfo,function(){self._dbInfo=dbInfo;resolve();},function(t,error){reject(error);});},reject);});dbInfo.serializer=localforageSerializer;return dbInfoPromise;}
function tryExecuteSql(t,dbInfo,sqlStatement,args,callback,errorCallback){t.executeSql(sqlStatement,args,callback,function(t,error){if(error.code===error.SYNTAX_ERR){t.executeSql('SELECT name FROM sqlite_master '+"WHERE type='table' AND name = ?",[dbInfo.storeName],function(t,results){if(!results.rows.length){createDbTable(t,dbInfo,function(){t.executeSql(sqlStatement,args,callback,errorCallback);},errorCallback);}else{errorCallback(t,error);}},errorCallback);}else{errorCallback(t,error);}},errorCallback);}
function getItem$1(key,callback){var self=this;key=normalizeKey(key);var promise=new Promise$1(function(resolve,reject){self.ready().then(function(){var dbInfo=self._dbInfo;dbInfo.db.transaction(function(t){tryExecuteSql(t,dbInfo,'SELECT * FROM '+dbInfo.storeName+' WHERE key = ? LIMIT 1',[key],function(t,results){var result=results.rows.length?results.rows.item(0).value:null;if(result){result=dbInfo.serializer.deserialize(result);}
resolve(result);},function(t,error){reject(error);});});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function iterate$1(iterator,callback){var self=this;var promise=new Promise$1(function(resolve,reject){self.ready().then(function(){var dbInfo=self._dbInfo;dbInfo.db.transaction(function(t){tryExecuteSql(t,dbInfo,'SELECT * FROM '+dbInfo.storeName,[],function(t,results){var rows=results.rows;var length=rows.length;for(var i=0;i<length;i++){var item=rows.item(i);var result=item.value;if(result){result=dbInfo.serializer.deserialize(result);}
result=iterator(result,item.key,i+1);if(result!==void 0){resolve(result);return;}}
resolve();},function(t,error){reject(error);});});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function _setItem(key,value,callback,retriesLeft){var self=this;key=normalizeKey(key);var promise=new Promise$1(function(resolve,reject){self.ready().then(function(){if(value===undefined){value=null;}
var originalValue=value;var dbInfo=self._dbInfo;dbInfo.serializer.serialize(value,function(value,error){if(error){reject(error);}else{dbInfo.db.transaction(function(t){tryExecuteSql(t,dbInfo,'INSERT OR REPLACE INTO '+dbInfo.storeName+' '+'(key, value) VALUES (?, ?)',[key,value],function(){resolve(originalValue);},function(t,error){reject(error);});},function(sqlError){if(sqlError.code===sqlError.QUOTA_ERR){if(retriesLeft>0){resolve(_setItem.apply(self,[key,originalValue,callback,retriesLeft-1]));return;}
reject(sqlError);}});}});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function setItem$1(key,value,callback){return _setItem.apply(this,[key,value,callback,1]);}
function removeItem$1(key,callback){var self=this;key=normalizeKey(key);var promise=new Promise$1(function(resolve,reject){self.ready().then(function(){var dbInfo=self._dbInfo;dbInfo.db.transaction(function(t){tryExecuteSql(t,dbInfo,'DELETE FROM '+dbInfo.storeName+' WHERE key = ?',[key],function(){resolve();},function(t,error){reject(error);});});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function clear$1(callback){var self=this;var promise=new Promise$1(function(resolve,reject){self.ready().then(function(){var dbInfo=self._dbInfo;dbInfo.db.transaction(function(t){tryExecuteSql(t,dbInfo,'DELETE FROM '+dbInfo.storeName,[],function(){resolve();},function(t,error){reject(error);});});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function length$1(callback){var self=this;var promise=new Promise$1(function(resolve,reject){self.ready().then(function(){var dbInfo=self._dbInfo;dbInfo.db.transaction(function(t){tryExecuteSql(t,dbInfo,'SELECT COUNT(key) as c FROM '+dbInfo.storeName,[],function(t,results){var result=results.rows.item(0).c;resolve(result);},function(t,error){reject(error);});});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function key$1(n,callback){var self=this;var promise=new Promise$1(function(resolve,reject){self.ready().then(function(){var dbInfo=self._dbInfo;dbInfo.db.transaction(function(t){tryExecuteSql(t,dbInfo,'SELECT key FROM '+dbInfo.storeName+' WHERE id = ? LIMIT 1',[n+1],function(t,results){var result=results.rows.length?results.rows.item(0).key:null;resolve(result);},function(t,error){reject(error);});});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function keys$1(callback){var self=this;var promise=new Promise$1(function(resolve,reject){self.ready().then(function(){var dbInfo=self._dbInfo;dbInfo.db.transaction(function(t){tryExecuteSql(t,dbInfo,'SELECT key FROM '+dbInfo.storeName,[],function(t,results){var keys=[];for(var i=0;i<results.rows.length;i++){keys.push(results.rows.item(i).key);}
resolve(keys);},function(t,error){reject(error);});});})["catch"](reject);});executeCallback(promise,callback);return promise;}
function getAllStoreNames(db){return new Promise$1(function(resolve,reject){db.transaction(function(t){t.executeSql('SELECT name FROM sqlite_master '+"WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'",[],function(t,results){var storeNames=[];for(var i=0;i<results.rows.length;i++){storeNames.push(results.rows.item(i).name);}
resolve({db:db,storeNames:storeNames});},function(t,error){reject(error);});},function(sqlError){reject(sqlError);});});}
function dropInstance$1(options,callback){callback=getCallback.apply(this,arguments);var currentConfig=this.config();options=typeof options!=='function'&&options||{};if(!options.name){options.name=options.name||currentConfig.name;options.storeName=options.storeName||currentConfig.storeName;}
var self=this;var promise;if(!options.name){promise=Promise$1.reject('Invalid arguments');}else{promise=new Promise$1(function(resolve){var db;if(options.name===currentConfig.name){db=self._dbInfo.db;}else{db=openDatabase(options.name,'','',0);}
if(!options.storeName){resolve(getAllStoreNames(db));}else{resolve({db:db,storeNames:[options.storeName]});}}).then(function(operationInfo){return new Promise$1(function(resolve,reject){operationInfo.db.transaction(function(t){function dropTable(storeName){return new Promise$1(function(resolve,reject){t.executeSql('DROP TABLE IF EXISTS '+storeName,[],function(){resolve();},function(t,error){reject(error);});});}
var operations=[];for(var i=0,len=operationInfo.storeNames.length;i<len;i++){operations.push(dropTable(operationInfo.storeNames[i]));}
Promise$1.all(operations).then(function(){resolve();})["catch"](function(e){reject(e);});},function(sqlError){reject(sqlError);});});});}
executeCallback(promise,callback);return promise;}
var webSQLStorage={_driver:'webSQLStorage',_initStorage:_initStorage$1,_support:isWebSQLValid(),iterate:iterate$1,getItem:getItem$1,setItem:setItem$1,removeItem:removeItem$1,clear:clear$1,length:length$1,key:key$1,keys:keys$1,dropInstance:dropInstance$1};function isLocalStorageValid(){try{return typeof localStorage!=='undefined'&&'setItem'in localStorage&&!!localStorage.setItem;}catch(e){return false;}}
function _getKeyPrefix(options,defaultConfig){var keyPrefix=options.name+'/';if(options.storeName!==defaultConfig.storeName){keyPrefix+=options.storeName+'/';}
return keyPrefix;}
function checkIfLocalStorageThrows(){var localStorageTestKey='_localforage_support_test';try{localStorage.setItem(localStorageTestKey,true);localStorage.removeItem(localStorageTestKey);return false;}catch(e){return true;}}
function _isLocalStorageUsable(){return!checkIfLocalStorageThrows()||localStorage.length>0;}
function _initStorage$2(options){var self=this;var dbInfo={};if(options){for(var i in options){dbInfo[i]=options[i];}}
dbInfo.keyPrefix=_getKeyPrefix(options,self._defaultConfig);if(!_isLocalStorageUsable()){return Promise$1.reject();}
self._dbInfo=dbInfo;dbInfo.serializer=localforageSerializer;return Promise$1.resolve();}
function clear$2(callback){var self=this;var promise=self.ready().then(function(){var keyPrefix=self._dbInfo.keyPrefix;for(var i=localStorage.length-1;i>=0;i--){var key=localStorage.key(i);if(key.indexOf(keyPrefix)===0){localStorage.removeItem(key);}}});executeCallback(promise,callback);return promise;}
function getItem$2(key,callback){var self=this;key=normalizeKey(key);var promise=self.ready().then(function(){var dbInfo=self._dbInfo;var result=localStorage.getItem(dbInfo.keyPrefix+key);if(result){result=dbInfo.serializer.deserialize(result);}
return result;});executeCallback(promise,callback);return promise;}
function iterate$2(iterator,callback){var self=this;var promise=self.ready().then(function(){var dbInfo=self._dbInfo;var keyPrefix=dbInfo.keyPrefix;var keyPrefixLength=keyPrefix.length;var length=localStorage.length;var iterationNumber=1;for(var i=0;i<length;i++){var key=localStorage.key(i);if(key.indexOf(keyPrefix)!==0){continue;}
var value=localStorage.getItem(key);if(value){value=dbInfo.serializer.deserialize(value);}
value=iterator(value,key.substring(keyPrefixLength),iterationNumber++);if(value!==void 0){return value;}}});executeCallback(promise,callback);return promise;}
function key$2(n,callback){var self=this;var promise=self.ready().then(function(){var dbInfo=self._dbInfo;var result;try{result=localStorage.key(n);}catch(error){result=null;}
if(result){result=result.substring(dbInfo.keyPrefix.length);}
return result;});executeCallback(promise,callback);return promise;}
function keys$2(callback){var self=this;var promise=self.ready().then(function(){var dbInfo=self._dbInfo;var length=localStorage.length;var keys=[];for(var i=0;i<length;i++){var itemKey=localStorage.key(i);if(itemKey.indexOf(dbInfo.keyPrefix)===0){keys.push(itemKey.substring(dbInfo.keyPrefix.length));}}
return keys;});executeCallback(promise,callback);return promise;}
function length$2(callback){var self=this;var promise=self.keys().then(function(keys){return keys.length;});executeCallback(promise,callback);return promise;}
function removeItem$2(key,callback){var self=this;key=normalizeKey(key);var promise=self.ready().then(function(){var dbInfo=self._dbInfo;localStorage.removeItem(dbInfo.keyPrefix+key);});executeCallback(promise,callback);return promise;}
function setItem$2(key,value,callback){var self=this;key=normalizeKey(key);var promise=self.ready().then(function(){if(value===undefined){value=null;}
var originalValue=value;return new Promise$1(function(resolve,reject){var dbInfo=self._dbInfo;dbInfo.serializer.serialize(value,function(value,error){if(error){reject(error);}else{try{localStorage.setItem(dbInfo.keyPrefix+key,value);resolve(originalValue);}catch(e){if(e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED'){reject(e);}
reject(e);}}});});});executeCallback(promise,callback);return promise;}
function dropInstance$2(options,callback){callback=getCallback.apply(this,arguments);options=typeof options!=='function'&&options||{};if(!options.name){var currentConfig=this.config();options.name=options.name||currentConfig.name;options.storeName=options.storeName||currentConfig.storeName;}
var self=this;var promise;if(!options.name){promise=Promise$1.reject('Invalid arguments');}else{promise=new Promise$1(function(resolve){if(!options.storeName){resolve(options.name+'/');}else{resolve(_getKeyPrefix(options,self._defaultConfig));}}).then(function(keyPrefix){for(var i=localStorage.length-1;i>=0;i--){var key=localStorage.key(i);if(key.indexOf(keyPrefix)===0){localStorage.removeItem(key);}}});}
executeCallback(promise,callback);return promise;}
var localStorageWrapper={_driver:'localStorageWrapper',_initStorage:_initStorage$2,_support:isLocalStorageValid(),iterate:iterate$2,getItem:getItem$2,setItem:setItem$2,removeItem:removeItem$2,clear:clear$2,length:length$2,key:key$2,keys:keys$2,dropInstance:dropInstance$2};var sameValue=function sameValue(x,y){return x===y||typeof x==='number'&&typeof y==='number'&&isNaN(x)&&isNaN(y);};var includes=function includes(array,searchElement){var len=array.length;var i=0;while(i<len){if(sameValue(array[i],searchElement)){return true;}
i++;}
return false;};var isArray=Array.isArray||function(arg){return Object.prototype.toString.call(arg)==='[object Array]';};var DefinedDrivers={};var DriverSupport={};var DefaultDrivers={INDEXEDDB:asyncStorage,WEBSQL:webSQLStorage,LOCALSTORAGE:localStorageWrapper};var DefaultDriverOrder=[DefaultDrivers.INDEXEDDB._driver,DefaultDrivers.WEBSQL._driver,DefaultDrivers.LOCALSTORAGE._driver];var OptionalDriverMethods=['dropInstance'];var LibraryMethods=['clear','getItem','iterate','key','keys','length','removeItem','setItem'].concat(OptionalDriverMethods);var DefaultConfig={description:'',driver:DefaultDriverOrder.slice(),name:'localforage',size:4980736,storeName:'keyvaluepairs',version:1.0};function callWhenReady(localForageInstance,libraryMethod){localForageInstance[libraryMethod]=function(){var _args=arguments;return localForageInstance.ready().then(function(){return localForageInstance[libraryMethod].apply(localForageInstance,_args);});};}
function extend(){for(var i=1;i<arguments.length;i++){var arg=arguments[i];if(arg){for(var _key in arg){if(arg.hasOwnProperty(_key)){if(isArray(arg[_key])){arguments[0][_key]=arg[_key].slice();}else{arguments[0][_key]=arg[_key];}}}}}
return arguments[0];}
var LocalForage=function(){function LocalForage(options){_classCallCheck(this,LocalForage);for(var driverTypeKey in DefaultDrivers){if(DefaultDrivers.hasOwnProperty(driverTypeKey)){var driver=DefaultDrivers[driverTypeKey];var driverName=driver._driver;this[driverTypeKey]=driverName;if(!DefinedDrivers[driverName]){this.defineDriver(driver);}}}
this._defaultConfig=extend({},DefaultConfig);this._config=extend({},this._defaultConfig,options);this._driverSet=null;this._initDriver=null;this._ready=false;this._dbInfo=null;this._wrapLibraryMethodsWithReady();this.setDriver(this._config.driver)["catch"](function(){});}
LocalForage.prototype.config=function config(options){if((typeof options==='undefined'?'undefined':_typeof(options))==='object'){if(this._ready){return new Error("Can't call config() after localforage "+'has been used.');}
for(var i in options){if(i==='storeName'){options[i]=options[i].replace(/\W/g,'_');}
if(i==='version'&&typeof options[i]!=='number'){return new Error('Database version must be a number.');}
this._config[i]=options[i];}
if('driver'in options&&options.driver){return this.setDriver(this._config.driver);}
return true;}else if(typeof options==='string'){return this._config[options];}else{return this._config;}};LocalForage.prototype.defineDriver=function defineDriver(driverObject,callback,errorCallback){var promise=new Promise$1(function(resolve,reject){try{var driverName=driverObject._driver;var complianceError=new Error('Custom driver not compliant; see '+'https://mozilla.github.io/localForage/#definedriver');if(!driverObject._driver){reject(complianceError);return;}
var driverMethods=LibraryMethods.concat('_initStorage');for(var i=0,len=driverMethods.length;i<len;i++){var driverMethodName=driverMethods[i];var isRequired=!includes(OptionalDriverMethods,driverMethodName);if((isRequired||driverObject[driverMethodName])&&typeof driverObject[driverMethodName]!=='function'){reject(complianceError);return;}}
var configureMissingMethods=function configureMissingMethods(){var methodNotImplementedFactory=function methodNotImplementedFactory(methodName){return function(){var error=new Error('Method '+methodName+' is not implemented by the current driver');var promise=Promise$1.reject(error);executeCallback(promise,arguments[arguments.length-1]);return promise;};};for(var _i=0,_len=OptionalDriverMethods.length;_i<_len;_i++){var optionalDriverMethod=OptionalDriverMethods[_i];if(!driverObject[optionalDriverMethod]){driverObject[optionalDriverMethod]=methodNotImplementedFactory(optionalDriverMethod);}}};configureMissingMethods();var setDriverSupport=function setDriverSupport(support){if(DefinedDrivers[driverName]){console.info('Redefining LocalForage driver: '+driverName);}
DefinedDrivers[driverName]=driverObject;DriverSupport[driverName]=support;resolve();};if('_support'in driverObject){if(driverObject._support&&typeof driverObject._support==='function'){driverObject._support().then(setDriverSupport,reject);}else{setDriverSupport(!!driverObject._support);}}else{setDriverSupport(true);}}catch(e){reject(e);}});executeTwoCallbacks(promise,callback,errorCallback);return promise;};LocalForage.prototype.driver=function driver(){return this._driver||null;};LocalForage.prototype.getDriver=function getDriver(driverName,callback,errorCallback){var getDriverPromise=DefinedDrivers[driverName]?Promise$1.resolve(DefinedDrivers[driverName]):Promise$1.reject(new Error('Driver not found.'));executeTwoCallbacks(getDriverPromise,callback,errorCallback);return getDriverPromise;};LocalForage.prototype.getSerializer=function getSerializer(callback){var serializerPromise=Promise$1.resolve(localforageSerializer);executeTwoCallbacks(serializerPromise,callback);return serializerPromise;};LocalForage.prototype.ready=function ready(callback){var self=this;var promise=self._driverSet.then(function(){if(self._ready===null){self._ready=self._initDriver();}
return self._ready;});executeTwoCallbacks(promise,callback,callback);return promise;};LocalForage.prototype.setDriver=function setDriver(drivers,callback,errorCallback){var self=this;if(!isArray(drivers)){drivers=[drivers];}
var supportedDrivers=this._getSupportedDrivers(drivers);function setDriverToConfig(){self._config.driver=self.driver();}
function extendSelfWithDriver(driver){self._extend(driver);setDriverToConfig();self._ready=self._initStorage(self._config);return self._ready;}
function initDriver(supportedDrivers){return function(){var currentDriverIndex=0;function driverPromiseLoop(){while(currentDriverIndex<supportedDrivers.length){var driverName=supportedDrivers[currentDriverIndex];currentDriverIndex++;self._dbInfo=null;self._ready=null;return self.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);}
setDriverToConfig();var error=new Error('No available storage method found.');self._driverSet=Promise$1.reject(error);return self._driverSet;}
return driverPromiseLoop();};}
var oldDriverSetDone=this._driverSet!==null?this._driverSet["catch"](function(){return Promise$1.resolve();}):Promise$1.resolve();this._driverSet=oldDriverSetDone.then(function(){var driverName=supportedDrivers[0];self._dbInfo=null;self._ready=null;return self.getDriver(driverName).then(function(driver){self._driver=driver._driver;setDriverToConfig();self._wrapLibraryMethodsWithReady();self._initDriver=initDriver(supportedDrivers);});})["catch"](function(){setDriverToConfig();var error=new Error('No available storage method found.');self._driverSet=Promise$1.reject(error);return self._driverSet;});executeTwoCallbacks(this._driverSet,callback,errorCallback);return this._driverSet;};LocalForage.prototype.supports=function supports(driverName){return!!DriverSupport[driverName];};LocalForage.prototype._extend=function _extend(libraryMethodsAndProperties){extend(this,libraryMethodsAndProperties);};LocalForage.prototype._getSupportedDrivers=function _getSupportedDrivers(drivers){var supportedDrivers=[];for(var i=0,len=drivers.length;i<len;i++){var driverName=drivers[i];if(this.supports(driverName)){supportedDrivers.push(driverName);}}
return supportedDrivers;};LocalForage.prototype._wrapLibraryMethodsWithReady=function _wrapLibraryMethodsWithReady(){for(var i=0,len=LibraryMethods.length;i<len;i++){callWhenReady(this,LibraryMethods[i]);}};LocalForage.prototype.createInstance=function createInstance(options){return new LocalForage(options);};return LocalForage;}();var localforage_js=new LocalForage();module.exports=localforage_js;},{"3":3}]},{},[4])(4)});}).call(this)}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],51:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var provider_1=require("@magic-sdk/provider");var overlayStyles={display:'none',position:'fixed',top:'0',right:'0',width:'100%',height:'100%',borderRadius:'0',border:'none',zIndex:'2147483647',};function applyOverlayStyles(elem){var e_1,_a;try{for(var _b=tslib_1.__values(Object.entries(overlayStyles)),_c=_b.next();!_c.done;_c=_b.next()){var _d=tslib_1.__read(_c.value,2),cssProperty=_d[0],value=_d[1];elem.style[cssProperty]=value;}}
catch(e_1_1){e_1={error:e_1_1};}
finally{try{if(_c&&!_c.done&&(_a=_b.return))_a.call(_b);}
finally{if(e_1)throw e_1.error;}}}
function checkForSameSrcInstances(parameters){var iframes=[].slice.call(document.querySelectorAll('.magic-iframe'));return Boolean(iframes.find(function(iframe){return iframe.src.includes(parameters);}));}
var IframeController=(function(_super){tslib_1.__extends(IframeController,_super);function IframeController(){var _this=_super!==null&&_super.apply(this,arguments)||this;_this.activeElement=null;return _this;}
IframeController.prototype.init=function(){var _this=this;this.iframe=new Promise(function(resolve){var onload=function(){if(!checkForSameSrcInstances(encodeURIComponent(_this.parameters))){var iframe=document.createElement('iframe');iframe.classList.add('magic-iframe');iframe.dataset.magicIframeLabel=provider_1.createURL(_this.endpoint).host;iframe.title='Secure Modal';iframe.src=provider_1.createURL("/send?params="+encodeURIComponent(_this.parameters),_this.endpoint).href;applyOverlayStyles(iframe);document.body.appendChild(iframe);resolve(iframe);}
else{provider_1.createDuplicateIframeWarning().log();}};if(['loaded','interactive','complete'].includes(document.readyState)){onload();}
else{window.addEventListener('load',onload,false);}});};IframeController.prototype.showOverlay=function(){return tslib_1.__awaiter(this,void 0,void 0,function(){var iframe;return tslib_1.__generator(this,function(_a){switch(_a.label){case 0:return[4,this.iframe];case 1:iframe=_a.sent();iframe.style.display='block';this.activeElement=document.activeElement;iframe.focus();return[2];}});});};IframeController.prototype.hideOverlay=function(){var _a;return tslib_1.__awaiter(this,void 0,void 0,function(){var iframe;return tslib_1.__generator(this,function(_b){switch(_b.label){case 0:return[4,this.iframe];case 1:iframe=_b.sent();iframe.style.display='none';if((_a=this.activeElement)===null||_a===void 0?void 0:_a.focus)
this.activeElement.focus();this.activeElement=null;return[2];}});});};IframeController.prototype.postMessage=function(data){return tslib_1.__awaiter(this,void 0,void 0,function(){var iframe;return tslib_1.__generator(this,function(_a){switch(_a.label){case 0:return[4,this.iframe];case 1:iframe=_a.sent();if(iframe&&iframe.contentWindow){iframe.contentWindow.postMessage(data,this.endpoint);}
else{throw provider_1.createModalNotReadyError();}
return[2];}});});};return IframeController;}(provider_1.ViewController));exports.IframeController=IframeController;},{"@magic-sdk/provider":9,"tslib":55}],52:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var provider_1=require("@magic-sdk/provider");var localforage_1=tslib_1.__importDefault(require("localforage"));var memoryDriver=tslib_1.__importStar(require("localforage-driver-memory"));var iframe_controller_1=require("./iframe-controller");var web_transport_1=require("./web-transport");tslib_1.__exportStar(require("@magic-sdk/commons"),exports);exports.Magic=provider_1.createSDK(provider_1.SDKBase,{platform:'web',sdkName:'magic-sdk',version:'4.3.0',defaultEndpoint:'https://auth.magic.link/',ViewController:iframe_controller_1.IframeController,PayloadTransport:web_transport_1.WebTransport,configureStorage:function(){return tslib_1.__awaiter(void 0,void 0,void 0,function(){var lf;return tslib_1.__generator(this,function(_a){switch(_a.label){case 0:lf=localforage_1.default.createInstance({name:'MagicAuthLocalStorageDB',storeName:'MagicAuthLocalStorage',});return[4,lf.defineDriver(memoryDriver)];case 1:_a.sent();return[4,lf.setDriver([localforage_1.default.INDEXEDDB,localforage_1.default.LOCALSTORAGE,memoryDriver._driver])];case 2:_a.sent();return[2,lf];}});});},});},{"./iframe-controller":51,"./web-transport":53,"@magic-sdk/commons":2,"@magic-sdk/provider":9,"localforage":50,"localforage-driver-memory":49,"tslib":55}],53:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});var tslib_1=require("tslib");var provider_1=require("@magic-sdk/provider");var WebTransport=(function(_super){tslib_1.__extends(WebTransport,_super);function WebTransport(){return _super!==null&&_super.apply(this,arguments)||this;}
WebTransport.prototype.init=function(){var _this=this;window.addEventListener('message',function(event){var e_1,_a;var _b;if(event.origin===_this.endpoint){if(event.data&&event.data.msgType&&_this.messageHandlers.size){event.data.response=(_b=event.data.response)!==null&&_b!==void 0?_b:{};try{for(var _c=tslib_1.__values(_this.messageHandlers.values()),_d=_c.next();!_d.done;_d=_c.next()){var handler=_d.value;handler(event);}}
catch(e_1_1){e_1={error:e_1_1};}
finally{try{if(_d&&!_d.done&&(_a=_c.return))_a.call(_c);}
finally{if(e_1)throw e_1.error;}}}}});};return WebTransport;}(provider_1.PayloadTransport));exports.WebTransport=WebTransport;},{"@magic-sdk/provider":9,"tslib":55}],54:[function(require,module,exports){var process=module.exports={};var cachedSetTimeout;var cachedClearTimeout;function defaultSetTimout(){throw new Error('setTimeout has not been defined');}
function defaultClearTimeout(){throw new Error('clearTimeout has not been defined');}
(function(){try{if(typeof setTimeout==='function'){cachedSetTimeout=setTimeout;}else{cachedSetTimeout=defaultSetTimout;}}catch(e){cachedSetTimeout=defaultSetTimout;}
try{if(typeof clearTimeout==='function'){cachedClearTimeout=clearTimeout;}else{cachedClearTimeout=defaultClearTimeout;}}catch(e){cachedClearTimeout=defaultClearTimeout;}}())
function runTimeout(fun){if(cachedSetTimeout===setTimeout){return setTimeout(fun,0);}
if((cachedSetTimeout===defaultSetTimout||!cachedSetTimeout)&&setTimeout){cachedSetTimeout=setTimeout;return setTimeout(fun,0);}
try{return cachedSetTimeout(fun,0);}catch(e){try{return cachedSetTimeout.call(null,fun,0);}catch(e){return cachedSetTimeout.call(this,fun,0);}}}
function runClearTimeout(marker){if(cachedClearTimeout===clearTimeout){return clearTimeout(marker);}
if((cachedClearTimeout===defaultClearTimeout||!cachedClearTimeout)&&clearTimeout){cachedClearTimeout=clearTimeout;return clearTimeout(marker);}
try{return cachedClearTimeout(marker);}catch(e){try{return cachedClearTimeout.call(null,marker);}catch(e){return cachedClearTimeout.call(this,marker);}}}
var queue=[];var draining=false;var currentQueue;var queueIndex=-1;function cleanUpNextTick(){if(!draining||!currentQueue){return;}
draining=false;if(currentQueue.length){queue=currentQueue.concat(queue);}else{queueIndex=-1;}
if(queue.length){drainQueue();}}
function drainQueue(){if(draining){return;}
var timeout=runTimeout(cleanUpNextTick);draining=true;var len=queue.length;while(len){currentQueue=queue;queue=[];while(++queueIndex<len){if(currentQueue){currentQueue[queueIndex].run();}}
queueIndex=-1;len=queue.length;}
currentQueue=null;draining=false;runClearTimeout(timeout);}
process.nextTick=function(fun){var args=new Array(arguments.length-1);if(arguments.length>1){for(var i=1;i<arguments.length;i++){args[i-1]=arguments[i];}}
queue.push(new Item(fun,args));if(queue.length===1&&!draining){runTimeout(drainQueue);}};function Item(fun,array){this.fun=fun;this.array=array;}
Item.prototype.run=function(){this.fun.apply(null,this.array);};process.title='browser';process.browser=true;process.env={};process.argv=[];process.version='';process.versions={};function noop(){}
process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.prependListener=noop;process.prependOnceListener=noop;process.listeners=function(name){return[]}
process.binding=function(name){throw new Error('process.binding is not supported');};process.cwd=function(){return'/'};process.chdir=function(dir){throw new Error('process.chdir is not supported');};process.umask=function(){return 0;};},{}],55:[function(require,module,exports){(function(global){(function(){/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */var __extends;var __assign;var __rest;var __decorate;var __param;var __metadata;var __awaiter;var __generator;var __exportStar;var __values;var __read;var __spread;var __spreadArrays;var __spreadArray;var __await;var __asyncGenerator;var __asyncDelegator;var __asyncValues;var __makeTemplateObject;var __importStar;var __importDefault;var __classPrivateFieldGet;var __classPrivateFieldSet;var __createBinding;(function(factory){var root=typeof global==="object"?global:typeof self==="object"?self:typeof this==="object"?this:{};if(typeof define==="function"&&define.amd){define("tslib",["exports"],function(exports){factory(createExporter(root,createExporter(exports)));});}
else if(typeof module==="object"&&typeof module.exports==="object"){factory(createExporter(root,createExporter(module.exports)));}
else{factory(createExporter(root));}
function createExporter(exports,previous){if(exports!==root){if(typeof Object.create==="function"){Object.defineProperty(exports,"__esModule",{value:true});}
else{exports.__esModule=true;}}
return function(id,v){return exports[id]=previous?previous(id,v):v;};}})
(function(exporter){var extendStatics=Object.setPrototypeOf||({__proto__:[]}instanceof Array&&function(d,b){d.__proto__=b;})||function(d,b){for(var p in b)if(Object.prototype.hasOwnProperty.call(b,p))d[p]=b[p];};__extends=function(d,b){if(typeof b!=="function"&&b!==null)
throw new TypeError("Class extends value "+String(b)+" is not a constructor or null");extendStatics(d,b);function __(){this.constructor=d;}
d.prototype=b===null?Object.create(b):(__.prototype=b.prototype,new __());};__assign=Object.assign||function(t){for(var s,i=1,n=arguments.length;i<n;i++){s=arguments[i];for(var p in s)if(Object.prototype.hasOwnProperty.call(s,p))t[p]=s[p];}
return t;};__rest=function(s,e){var t={};for(var p in s)if(Object.prototype.hasOwnProperty.call(s,p)&&e.indexOf(p)<0)
t[p]=s[p];if(s!=null&&typeof Object.getOwnPropertySymbols==="function")
for(var i=0,p=Object.getOwnPropertySymbols(s);i<p.length;i++){if(e.indexOf(p[i])<0&&Object.prototype.propertyIsEnumerable.call(s,p[i]))
t[p[i]]=s[p[i]];}
return t;};__decorate=function(decorators,target,key,desc){var c=arguments.length,r=c<3?target:desc===null?desc=Object.getOwnPropertyDescriptor(target,key):desc,d;if(typeof Reflect==="object"&&typeof Reflect.decorate==="function")r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)if(d=decorators[i])r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r;return c>3&&r&&Object.defineProperty(target,key,r),r;};__param=function(paramIndex,decorator){return function(target,key){decorator(target,key,paramIndex);}};__metadata=function(metadataKey,metadataValue){if(typeof Reflect==="object"&&typeof Reflect.metadata==="function")return Reflect.metadata(metadataKey,metadataValue);};__awaiter=function(thisArg,_arguments,P,generator){function adopt(value){return value instanceof P?value:new P(function(resolve){resolve(value);});}
return new(P||(P=Promise))(function(resolve,reject){function fulfilled(value){try{step(generator.next(value));}catch(e){reject(e);}}
function rejected(value){try{step(generator["throw"](value));}catch(e){reject(e);}}
function step(result){result.done?resolve(result.value):adopt(result.value).then(fulfilled,rejected);}
step((generator=generator.apply(thisArg,_arguments||[])).next());});};__generator=function(thisArg,body){var _={label:0,sent:function(){if(t[0]&1)throw t[1];return t[1];},trys:[],ops:[]},f,y,t,g;return g={next:verb(0),"throw":verb(1),"return":verb(2)},typeof Symbol==="function"&&(g[Symbol.iterator]=function(){return this;}),g;function verb(n){return function(v){return step([n,v]);};}
function step(op){if(f)throw new TypeError("Generator is already executing.");while(_)try{if(f=1,y&&(t=op[0]&2?y["return"]:op[0]?y["throw"]||((t=y["return"])&&t.call(y),0):y.next)&&!(t=t.call(y,op[1])).done)return t;if(y=0,t)op=[op[0]&2,t.value];switch(op[0]){case 0:case 1:t=op;break;case 4:_.label++;return{value:op[1],done:false};case 5:_.label++;y=op[1];op=[0];continue;case 7:op=_.ops.pop();_.trys.pop();continue;default:if(!(t=_.trys,t=t.length>0&&t[t.length-1])&&(op[0]===6||op[0]===2)){_=0;continue;}
if(op[0]===3&&(!t||(op[1]>t[0]&&op[1]<t[3]))){_.label=op[1];break;}
if(op[0]===6&&_.label<t[1]){_.label=t[1];t=op;break;}
if(t&&_.label<t[2]){_.label=t[2];_.ops.push(op);break;}
if(t[2])_.ops.pop();_.trys.pop();continue;}
op=body.call(thisArg,_);}catch(e){op=[6,e];y=0;}finally{f=t=0;}
if(op[0]&5)throw op[1];return{value:op[0]?op[1]:void 0,done:true};}};__exportStar=function(m,o){for(var p in m)if(p!=="default"&&!Object.prototype.hasOwnProperty.call(o,p))__createBinding(o,m,p);};__createBinding=Object.create?(function(o,m,k,k2){if(k2===undefined)k2=k;Object.defineProperty(o,k2,{enumerable:true,get:function(){return m[k];}});}):(function(o,m,k,k2){if(k2===undefined)k2=k;o[k2]=m[k];});__values=function(o){var s=typeof Symbol==="function"&&Symbol.iterator,m=s&&o[s],i=0;if(m)return m.call(o);if(o&&typeof o.length==="number")return{next:function(){if(o&&i>=o.length)o=void 0;return{value:o&&o[i++],done:!o};}};throw new TypeError(s?"Object is not iterable.":"Symbol.iterator is not defined.");};__read=function(o,n){var m=typeof Symbol==="function"&&o[Symbol.iterator];if(!m)return o;var i=m.call(o),r,ar=[],e;try{while((n===void 0||n-->0)&&!(r=i.next()).done)ar.push(r.value);}
catch(error){e={error:error};}
finally{try{if(r&&!r.done&&(m=i["return"]))m.call(i);}
finally{if(e)throw e.error;}}
return ar;};__spread=function(){for(var ar=[],i=0;i<arguments.length;i++)
ar=ar.concat(__read(arguments[i]));return ar;};__spreadArrays=function(){for(var s=0,i=0,il=arguments.length;i<il;i++)s+=arguments[i].length;for(var r=Array(s),k=0,i=0;i<il;i++)
for(var a=arguments[i],j=0,jl=a.length;j<jl;j++,k++)
r[k]=a[j];return r;};__spreadArray=function(to,from){for(var i=0,il=from.length,j=to.length;i<il;i++,j++)
to[j]=from[i];return to;};__await=function(v){return this instanceof __await?(this.v=v,this):new __await(v);};__asyncGenerator=function(thisArg,_arguments,generator){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var g=generator.apply(thisArg,_arguments||[]),i,q=[];return i={},verb("next"),verb("throw"),verb("return"),i[Symbol.asyncIterator]=function(){return this;},i;function verb(n){if(g[n])i[n]=function(v){return new Promise(function(a,b){q.push([n,v,a,b])>1||resume(n,v);});};}
function resume(n,v){try{step(g[n](v));}catch(e){settle(q[0][3],e);}}
function step(r){r.value instanceof __await?Promise.resolve(r.value.v).then(fulfill,reject):settle(q[0][2],r);}
function fulfill(value){resume("next",value);}
function reject(value){resume("throw",value);}
function settle(f,v){if(f(v),q.shift(),q.length)resume(q[0][0],q[0][1]);}};__asyncDelegator=function(o){var i,p;return i={},verb("next"),verb("throw",function(e){throw e;}),verb("return"),i[Symbol.iterator]=function(){return this;},i;function verb(n,f){i[n]=o[n]?function(v){return(p=!p)?{value:__await(o[n](v)),done:n==="return"}:f?f(v):v;}:f;}};__asyncValues=function(o){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var m=o[Symbol.asyncIterator],i;return m?m.call(o):(o=typeof __values==="function"?__values(o):o[Symbol.iterator](),i={},verb("next"),verb("throw"),verb("return"),i[Symbol.asyncIterator]=function(){return this;},i);function verb(n){i[n]=o[n]&&function(v){return new Promise(function(resolve,reject){v=o[n](v),settle(resolve,reject,v.done,v.value);});};}
function settle(resolve,reject,d,v){Promise.resolve(v).then(function(v){resolve({value:v,done:d});},reject);}};__makeTemplateObject=function(cooked,raw){if(Object.defineProperty){Object.defineProperty(cooked,"raw",{value:raw});}else{cooked.raw=raw;}
return cooked;};var __setModuleDefault=Object.create?(function(o,v){Object.defineProperty(o,"default",{enumerable:true,value:v});}):function(o,v){o["default"]=v;};__importStar=function(mod){if(mod&&mod.__esModule)return mod;var result={};if(mod!=null)for(var k in mod)if(k!=="default"&&Object.prototype.hasOwnProperty.call(mod,k))__createBinding(result,mod,k);__setModuleDefault(result,mod);return result;};__importDefault=function(mod){return(mod&&mod.__esModule)?mod:{"default":mod};};__classPrivateFieldGet=function(receiver,state,kind,f){if(kind==="a"&&!f)throw new TypeError("Private accessor was defined without a getter");if(typeof state==="function"?receiver!==state||!f:!state.has(receiver))throw new TypeError("Cannot read private member from an object whose class did not declare it");return kind==="m"?f:kind==="a"?f.call(receiver):f?f.value:state.get(receiver);};__classPrivateFieldSet=function(receiver,state,value,kind,f){if(kind==="m")throw new TypeError("Private method is not writable");if(kind==="a"&&!f)throw new TypeError("Private accessor was defined without a setter");if(typeof state==="function"?receiver!==state||!f:!state.has(receiver))throw new TypeError("Cannot write private member to an object whose class did not declare it");return(kind==="a"?f.call(receiver,value):f?f.value=value:state.set(receiver,value)),value;};exporter("__extends",__extends);exporter("__assign",__assign);exporter("__rest",__rest);exporter("__decorate",__decorate);exporter("__param",__param);exporter("__metadata",__metadata);exporter("__awaiter",__awaiter);exporter("__generator",__generator);exporter("__exportStar",__exportStar);exporter("__createBinding",__createBinding);exporter("__values",__values);exporter("__read",__read);exporter("__spread",__spread);exporter("__spreadArrays",__spreadArrays);exporter("__spreadArray",__spreadArray);exporter("__await",__await);exporter("__asyncGenerator",__asyncGenerator);exporter("__asyncDelegator",__asyncDelegator);exporter("__asyncValues",__asyncValues);exporter("__makeTemplateObject",__makeTemplateObject);exporter("__importStar",__importStar);exporter("__importDefault",__importDefault);exporter("__classPrivateFieldGet",__classPrivateFieldGet);exporter("__classPrivateFieldSet",__classPrivateFieldSet);});}).call(this)}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}]},{},[1]);;