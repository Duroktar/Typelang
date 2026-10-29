var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../lsp/node_modules/vscode-languageserver/lib/common/utils/is.js
var require_is = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/utils/is.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.thenable = exports2.typedArray = exports2.stringArray = exports2.array = exports2.func = exports2.error = exports2.number = exports2.string = exports2.boolean = void 0;
    function boolean(value) {
      return value === true || value === false;
    }
    exports2.boolean = boolean;
    function string(value) {
      return typeof value === "string" || value instanceof String;
    }
    exports2.string = string;
    function number(value) {
      return typeof value === "number" || value instanceof Number;
    }
    exports2.number = number;
    function error(value) {
      return value instanceof Error;
    }
    exports2.error = error;
    function func(value) {
      return typeof value === "function";
    }
    exports2.func = func;
    function array(value) {
      return Array.isArray(value);
    }
    exports2.array = array;
    function stringArray(value) {
      return array(value) && value.every((elem) => string(elem));
    }
    exports2.stringArray = stringArray;
    function typedArray(value, check) {
      return Array.isArray(value) && value.every(check);
    }
    exports2.typedArray = typedArray;
    function thenable(value) {
      return value && func(value.then);
    }
    exports2.thenable = thenable;
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/common/is.js
var require_is2 = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/common/is.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.stringArray = exports2.array = exports2.func = exports2.error = exports2.number = exports2.string = exports2.boolean = void 0;
    function boolean(value) {
      return value === true || value === false;
    }
    exports2.boolean = boolean;
    function string(value) {
      return typeof value === "string" || value instanceof String;
    }
    exports2.string = string;
    function number(value) {
      return typeof value === "number" || value instanceof Number;
    }
    exports2.number = number;
    function error(value) {
      return value instanceof Error;
    }
    exports2.error = error;
    function func(value) {
      return typeof value === "function";
    }
    exports2.func = func;
    function array(value) {
      return Array.isArray(value);
    }
    exports2.array = array;
    function stringArray(value) {
      return array(value) && value.every((elem) => string(elem));
    }
    exports2.stringArray = stringArray;
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/common/messages.js
var require_messages = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/common/messages.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Message = exports2.NotificationType9 = exports2.NotificationType8 = exports2.NotificationType7 = exports2.NotificationType6 = exports2.NotificationType5 = exports2.NotificationType4 = exports2.NotificationType3 = exports2.NotificationType2 = exports2.NotificationType1 = exports2.NotificationType0 = exports2.NotificationType = exports2.RequestType9 = exports2.RequestType8 = exports2.RequestType7 = exports2.RequestType6 = exports2.RequestType5 = exports2.RequestType4 = exports2.RequestType3 = exports2.RequestType2 = exports2.RequestType1 = exports2.RequestType = exports2.RequestType0 = exports2.AbstractMessageSignature = exports2.ParameterStructures = exports2.ResponseError = exports2.ErrorCodes = void 0;
    var is = require_is2();
    var ErrorCodes;
    (function(ErrorCodes2) {
      ErrorCodes2.ParseError = -32700;
      ErrorCodes2.InvalidRequest = -32600;
      ErrorCodes2.MethodNotFound = -32601;
      ErrorCodes2.InvalidParams = -32602;
      ErrorCodes2.InternalError = -32603;
      ErrorCodes2.jsonrpcReservedErrorRangeStart = -32099;
      ErrorCodes2.serverErrorStart = -32099;
      ErrorCodes2.MessageWriteError = -32099;
      ErrorCodes2.MessageReadError = -32098;
      ErrorCodes2.PendingResponseRejected = -32097;
      ErrorCodes2.ConnectionInactive = -32096;
      ErrorCodes2.ServerNotInitialized = -32002;
      ErrorCodes2.UnknownErrorCode = -32001;
      ErrorCodes2.jsonrpcReservedErrorRangeEnd = -32e3;
      ErrorCodes2.serverErrorEnd = -32e3;
    })(ErrorCodes || (exports2.ErrorCodes = ErrorCodes = {}));
    var ResponseError = class _ResponseError extends Error {
      constructor(code2, message, data) {
        super(message);
        this.code = is.number(code2) ? code2 : ErrorCodes.UnknownErrorCode;
        this.data = data;
        Object.setPrototypeOf(this, _ResponseError.prototype);
      }
      toJson() {
        const result = {
          code: this.code,
          message: this.message
        };
        if (this.data !== void 0) {
          result.data = this.data;
        }
        return result;
      }
    };
    exports2.ResponseError = ResponseError;
    var ParameterStructures = class _ParameterStructures {
      constructor(kind) {
        this.kind = kind;
      }
      static is(value) {
        return value === _ParameterStructures.auto || value === _ParameterStructures.byName || value === _ParameterStructures.byPosition;
      }
      toString() {
        return this.kind;
      }
    };
    exports2.ParameterStructures = ParameterStructures;
    ParameterStructures.auto = new ParameterStructures("auto");
    ParameterStructures.byPosition = new ParameterStructures("byPosition");
    ParameterStructures.byName = new ParameterStructures("byName");
    var AbstractMessageSignature = class {
      constructor(method, numberOfParams) {
        this.method = method;
        this.numberOfParams = numberOfParams;
      }
      get parameterStructures() {
        return ParameterStructures.auto;
      }
    };
    exports2.AbstractMessageSignature = AbstractMessageSignature;
    var RequestType0 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 0);
      }
    };
    exports2.RequestType0 = RequestType0;
    var RequestType = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports2.RequestType = RequestType;
    var RequestType1 = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports2.RequestType1 = RequestType1;
    var RequestType2 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 2);
      }
    };
    exports2.RequestType2 = RequestType2;
    var RequestType3 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 3);
      }
    };
    exports2.RequestType3 = RequestType3;
    var RequestType4 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 4);
      }
    };
    exports2.RequestType4 = RequestType4;
    var RequestType5 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 5);
      }
    };
    exports2.RequestType5 = RequestType5;
    var RequestType6 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 6);
      }
    };
    exports2.RequestType6 = RequestType6;
    var RequestType7 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 7);
      }
    };
    exports2.RequestType7 = RequestType7;
    var RequestType8 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 8);
      }
    };
    exports2.RequestType8 = RequestType8;
    var RequestType9 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 9);
      }
    };
    exports2.RequestType9 = RequestType9;
    var NotificationType = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports2.NotificationType = NotificationType;
    var NotificationType0 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 0);
      }
    };
    exports2.NotificationType0 = NotificationType0;
    var NotificationType1 = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports2.NotificationType1 = NotificationType1;
    var NotificationType2 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 2);
      }
    };
    exports2.NotificationType2 = NotificationType2;
    var NotificationType3 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 3);
      }
    };
    exports2.NotificationType3 = NotificationType3;
    var NotificationType4 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 4);
      }
    };
    exports2.NotificationType4 = NotificationType4;
    var NotificationType5 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 5);
      }
    };
    exports2.NotificationType5 = NotificationType5;
    var NotificationType6 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 6);
      }
    };
    exports2.NotificationType6 = NotificationType6;
    var NotificationType7 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 7);
      }
    };
    exports2.NotificationType7 = NotificationType7;
    var NotificationType8 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 8);
      }
    };
    exports2.NotificationType8 = NotificationType8;
    var NotificationType9 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 9);
      }
    };
    exports2.NotificationType9 = NotificationType9;
    var Message;
    (function(Message2) {
      function isRequest(message) {
        const candidate = message;
        return candidate && is.string(candidate.method) && (is.string(candidate.id) || is.number(candidate.id));
      }
      Message2.isRequest = isRequest;
      function isNotification(message) {
        const candidate = message;
        return candidate && is.string(candidate.method) && message.id === void 0;
      }
      Message2.isNotification = isNotification;
      function isResponse(message) {
        const candidate = message;
        return candidate && (candidate.result !== void 0 || !!candidate.error) && (is.string(candidate.id) || is.number(candidate.id) || candidate.id === null);
      }
      Message2.isResponse = isResponse;
    })(Message || (exports2.Message = Message = {}));
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/common/linkedMap.js
var require_linkedMap = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/common/linkedMap.js"(exports2) {
    "use strict";
    var _a;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LRUCache = exports2.LinkedMap = exports2.Touch = void 0;
    var Touch;
    (function(Touch2) {
      Touch2.None = 0;
      Touch2.First = 1;
      Touch2.AsOld = Touch2.First;
      Touch2.Last = 2;
      Touch2.AsNew = Touch2.Last;
    })(Touch || (exports2.Touch = Touch = {}));
    var LinkedMap = class {
      constructor() {
        this[_a] = "LinkedMap";
        this._map = /* @__PURE__ */ new Map();
        this._head = void 0;
        this._tail = void 0;
        this._size = 0;
        this._state = 0;
      }
      clear() {
        this._map.clear();
        this._head = void 0;
        this._tail = void 0;
        this._size = 0;
        this._state++;
      }
      isEmpty() {
        return !this._head && !this._tail;
      }
      get size() {
        return this._size;
      }
      get first() {
        return this._head?.value;
      }
      get last() {
        return this._tail?.value;
      }
      has(key) {
        return this._map.has(key);
      }
      get(key, touch = Touch.None) {
        const item = this._map.get(key);
        if (!item) {
          return void 0;
        }
        if (touch !== Touch.None) {
          this.touch(item, touch);
        }
        return item.value;
      }
      set(key, value, touch = Touch.None) {
        let item = this._map.get(key);
        if (item) {
          item.value = value;
          if (touch !== Touch.None) {
            this.touch(item, touch);
          }
        } else {
          item = { key, value, next: void 0, previous: void 0 };
          switch (touch) {
            case Touch.None:
              this.addItemLast(item);
              break;
            case Touch.First:
              this.addItemFirst(item);
              break;
            case Touch.Last:
              this.addItemLast(item);
              break;
            default:
              this.addItemLast(item);
              break;
          }
          this._map.set(key, item);
          this._size++;
        }
        return this;
      }
      delete(key) {
        return !!this.remove(key);
      }
      remove(key) {
        const item = this._map.get(key);
        if (!item) {
          return void 0;
        }
        this._map.delete(key);
        this.removeItem(item);
        this._size--;
        return item.value;
      }
      shift() {
        if (!this._head && !this._tail) {
          return void 0;
        }
        if (!this._head || !this._tail) {
          throw new Error("Invalid list");
        }
        const item = this._head;
        this._map.delete(item.key);
        this.removeItem(item);
        this._size--;
        return item.value;
      }
      forEach(callbackfn, thisArg) {
        const state = this._state;
        let current = this._head;
        while (current) {
          if (thisArg) {
            callbackfn.bind(thisArg)(current.value, current.key, this);
          } else {
            callbackfn(current.value, current.key, this);
          }
          if (this._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          current = current.next;
        }
      }
      keys() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: current.key, done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      values() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: current.value, done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      entries() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: [current.key, current.value], done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      [(_a = Symbol.toStringTag, Symbol.iterator)]() {
        return this.entries();
      }
      trimOld(newSize) {
        if (newSize >= this.size) {
          return;
        }
        if (newSize === 0) {
          this.clear();
          return;
        }
        let current = this._head;
        let currentSize = this.size;
        while (current && currentSize > newSize) {
          this._map.delete(current.key);
          current = current.next;
          currentSize--;
        }
        this._head = current;
        this._size = currentSize;
        if (current) {
          current.previous = void 0;
        }
        this._state++;
      }
      addItemFirst(item) {
        if (!this._head && !this._tail) {
          this._tail = item;
        } else if (!this._head) {
          throw new Error("Invalid list");
        } else {
          item.next = this._head;
          this._head.previous = item;
        }
        this._head = item;
        this._state++;
      }
      addItemLast(item) {
        if (!this._head && !this._tail) {
          this._head = item;
        } else if (!this._tail) {
          throw new Error("Invalid list");
        } else {
          item.previous = this._tail;
          this._tail.next = item;
        }
        this._tail = item;
        this._state++;
      }
      removeItem(item) {
        if (item === this._head && item === this._tail) {
          this._head = void 0;
          this._tail = void 0;
        } else if (item === this._head) {
          if (!item.next) {
            throw new Error("Invalid list");
          }
          item.next.previous = void 0;
          this._head = item.next;
        } else if (item === this._tail) {
          if (!item.previous) {
            throw new Error("Invalid list");
          }
          item.previous.next = void 0;
          this._tail = item.previous;
        } else {
          const next = item.next;
          const previous = item.previous;
          if (!next || !previous) {
            throw new Error("Invalid list");
          }
          next.previous = previous;
          previous.next = next;
        }
        item.next = void 0;
        item.previous = void 0;
        this._state++;
      }
      touch(item, touch) {
        if (!this._head || !this._tail) {
          throw new Error("Invalid list");
        }
        if (touch !== Touch.First && touch !== Touch.Last) {
          return;
        }
        if (touch === Touch.First) {
          if (item === this._head) {
            return;
          }
          const next = item.next;
          const previous = item.previous;
          if (item === this._tail) {
            previous.next = void 0;
            this._tail = previous;
          } else {
            next.previous = previous;
            previous.next = next;
          }
          item.previous = void 0;
          item.next = this._head;
          this._head.previous = item;
          this._head = item;
          this._state++;
        } else if (touch === Touch.Last) {
          if (item === this._tail) {
            return;
          }
          const next = item.next;
          const previous = item.previous;
          if (item === this._head) {
            next.previous = void 0;
            this._head = next;
          } else {
            next.previous = previous;
            previous.next = next;
          }
          item.next = void 0;
          item.previous = this._tail;
          this._tail.next = item;
          this._tail = item;
          this._state++;
        }
      }
      toJSON() {
        const data = [];
        this.forEach((value, key) => {
          data.push([key, value]);
        });
        return data;
      }
      fromJSON(data) {
        this.clear();
        for (const [key, value] of data) {
          this.set(key, value);
        }
      }
    };
    exports2.LinkedMap = LinkedMap;
    var LRUCache = class extends LinkedMap {
      constructor(limit, ratio = 1) {
        super();
        this._limit = limit;
        this._ratio = Math.min(Math.max(0, ratio), 1);
      }
      get limit() {
        return this._limit;
      }
      set limit(limit) {
        this._limit = limit;
        this.checkTrim();
      }
      get ratio() {
        return this._ratio;
      }
      set ratio(ratio) {
        this._ratio = Math.min(Math.max(0, ratio), 1);
        this.checkTrim();
      }
      get(key, touch = Touch.AsNew) {
        return super.get(key, touch);
      }
      peek(key) {
        return super.get(key, Touch.None);
      }
      set(key, value) {
        super.set(key, value, Touch.Last);
        this.checkTrim();
        return this;
      }
      checkTrim() {
        if (this.size > this._limit) {
          this.trimOld(Math.round(this._limit * this._ratio));
        }
      }
    };
    exports2.LRUCache = LRUCache;
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/common/disposable.js
var require_disposable = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/common/disposable.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Disposable = void 0;
    var Disposable;
    (function(Disposable2) {
      function create(func) {
        return {
          dispose: func
        };
      }
      Disposable2.create = create;
    })(Disposable || (exports2.Disposable = Disposable = {}));
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/common/ral.js
var require_ral = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/common/ral.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var _ral;
    function RAL() {
      if (_ral === void 0) {
        throw new Error(`No runtime abstraction layer installed`);
      }
      return _ral;
    }
    (function(RAL2) {
      function install(ral) {
        if (ral === void 0) {
          throw new Error(`No runtime abstraction layer provided`);
        }
        _ral = ral;
      }
      RAL2.install = install;
    })(RAL || (RAL = {}));
    exports2.default = RAL;
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/common/events.js
var require_events = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/common/events.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Emitter = exports2.Event = void 0;
    var ral_1 = require_ral();
    var Event;
    (function(Event2) {
      const _disposable = { dispose() {
      } };
      Event2.None = function() {
        return _disposable;
      };
    })(Event || (exports2.Event = Event = {}));
    var CallbackList = class {
      add(callback, context = null, bucket) {
        if (!this._callbacks) {
          this._callbacks = [];
          this._contexts = [];
        }
        this._callbacks.push(callback);
        this._contexts.push(context);
        if (Array.isArray(bucket)) {
          bucket.push({ dispose: () => this.remove(callback, context) });
        }
      }
      remove(callback, context = null) {
        if (!this._callbacks) {
          return;
        }
        let foundCallbackWithDifferentContext = false;
        for (let i = 0, len = this._callbacks.length; i < len; i++) {
          if (this._callbacks[i] === callback) {
            if (this._contexts[i] === context) {
              this._callbacks.splice(i, 1);
              this._contexts.splice(i, 1);
              return;
            } else {
              foundCallbackWithDifferentContext = true;
            }
          }
        }
        if (foundCallbackWithDifferentContext) {
          throw new Error("When adding a listener with a context, you should remove it with the same context");
        }
      }
      invoke(...args) {
        if (!this._callbacks) {
          return [];
        }
        const ret = [], callbacks = this._callbacks.slice(0), contexts = this._contexts.slice(0);
        for (let i = 0, len = callbacks.length; i < len; i++) {
          try {
            ret.push(callbacks[i].apply(contexts[i], args));
          } catch (e) {
            (0, ral_1.default)().console.error(e);
          }
        }
        return ret;
      }
      isEmpty() {
        return !this._callbacks || this._callbacks.length === 0;
      }
      dispose() {
        this._callbacks = void 0;
        this._contexts = void 0;
      }
    };
    var Emitter = class _Emitter {
      constructor(_options) {
        this._options = _options;
      }
      /**
       * For the public to allow to subscribe
       * to events from this Emitter
       */
      get event() {
        if (!this._event) {
          this._event = (listener, thisArgs, disposables) => {
            if (!this._callbacks) {
              this._callbacks = new CallbackList();
            }
            if (this._options && this._options.onFirstListenerAdd && this._callbacks.isEmpty()) {
              this._options.onFirstListenerAdd(this);
            }
            this._callbacks.add(listener, thisArgs);
            const result = {
              dispose: () => {
                if (!this._callbacks) {
                  return;
                }
                this._callbacks.remove(listener, thisArgs);
                result.dispose = _Emitter._noop;
                if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
                  this._options.onLastListenerRemove(this);
                }
              }
            };
            if (Array.isArray(disposables)) {
              disposables.push(result);
            }
            return result;
          };
        }
        return this._event;
      }
      /**
       * To be kept private to fire an event to
       * subscribers
       */
      fire(event) {
        if (this._callbacks) {
          this._callbacks.invoke.call(this._callbacks, event);
        }
      }
      dispose() {
        if (this._callbacks) {
          this._callbacks.dispose();
          this._callbacks = void 0;
        }
      }
    };
    exports2.Emitter = Emitter;
    Emitter._noop = function() {
    };
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/common/cancellation.js
var require_cancellation = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/common/cancellation.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CancellationTokenSource = exports2.CancellationToken = void 0;
    var ral_1 = require_ral();
    var Is = require_is2();
    var events_1 = require_events();
    var CancellationToken;
    (function(CancellationToken2) {
      CancellationToken2.None = Object.freeze({
        isCancellationRequested: false,
        onCancellationRequested: events_1.Event.None
      });
      CancellationToken2.Cancelled = Object.freeze({
        isCancellationRequested: true,
        onCancellationRequested: events_1.Event.None
      });
      function is(value) {
        const candidate = value;
        return candidate && (candidate === CancellationToken2.None || candidate === CancellationToken2.Cancelled || Is.boolean(candidate.isCancellationRequested) && !!candidate.onCancellationRequested);
      }
      CancellationToken2.is = is;
    })(CancellationToken || (exports2.CancellationToken = CancellationToken = {}));
    var shortcutEvent = Object.freeze(function(callback, context) {
      const handle = (0, ral_1.default)().timer.setTimeout(callback.bind(context), 0);
      return { dispose() {
        handle.dispose();
      } };
    });
    var MutableToken = class {
      constructor() {
        this._isCancelled = false;
      }
      cancel() {
        if (!this._isCancelled) {
          this._isCancelled = true;
          if (this._emitter) {
            this._emitter.fire(void 0);
            this.dispose();
          }
        }
      }
      get isCancellationRequested() {
        return this._isCancelled;
      }
      get onCancellationRequested() {
        if (this._isCancelled) {
          return shortcutEvent;
        }
        if (!this._emitter) {
          this._emitter = new events_1.Emitter();
        }
        return this._emitter.event;
      }
      dispose() {
        if (this._emitter) {
          this._emitter.dispose();
          this._emitter = void 0;
        }
      }
    };
    var CancellationTokenSource = class {
      get token() {
        if (!this._token) {
          this._token = new MutableToken();
        }
        return this._token;
      }
      cancel() {
        if (!this._token) {
          this._token = CancellationToken.Cancelled;
        } else {
          this._token.cancel();
        }
      }
      dispose() {
        if (!this._token) {
          this._token = CancellationToken.None;
        } else if (this._token instanceof MutableToken) {
          this._token.dispose();
        }
      }
    };
    exports2.CancellationTokenSource = CancellationTokenSource;
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/common/sharedArrayCancellation.js
var require_sharedArrayCancellation = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/common/sharedArrayCancellation.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SharedArrayReceiverStrategy = exports2.SharedArraySenderStrategy = void 0;
    var cancellation_1 = require_cancellation();
    var CancellationState;
    (function(CancellationState2) {
      CancellationState2.Continue = 0;
      CancellationState2.Cancelled = 1;
    })(CancellationState || (CancellationState = {}));
    var SharedArraySenderStrategy = class {
      constructor() {
        this.buffers = /* @__PURE__ */ new Map();
      }
      enableCancellation(request) {
        if (request.id === null) {
          return;
        }
        const buffer = new SharedArrayBuffer(4);
        const data = new Int32Array(buffer, 0, 1);
        data[0] = CancellationState.Continue;
        this.buffers.set(request.id, buffer);
        request.$cancellationData = buffer;
      }
      async sendCancellation(_conn, id) {
        const buffer = this.buffers.get(id);
        if (buffer === void 0) {
          return;
        }
        const data = new Int32Array(buffer, 0, 1);
        Atomics.store(data, 0, CancellationState.Cancelled);
      }
      cleanup(id) {
        this.buffers.delete(id);
      }
      dispose() {
        this.buffers.clear();
      }
    };
    exports2.SharedArraySenderStrategy = SharedArraySenderStrategy;
    var SharedArrayBufferCancellationToken = class {
      constructor(buffer) {
        this.data = new Int32Array(buffer, 0, 1);
      }
      get isCancellationRequested() {
        return Atomics.load(this.data, 0) === CancellationState.Cancelled;
      }
      get onCancellationRequested() {
        throw new Error(`Cancellation over SharedArrayBuffer doesn't support cancellation events`);
      }
    };
    var SharedArrayBufferCancellationTokenSource = class {
      constructor(buffer) {
        this.token = new SharedArrayBufferCancellationToken(buffer);
      }
      cancel() {
      }
      dispose() {
      }
    };
    var SharedArrayReceiverStrategy = class {
      constructor() {
        this.kind = "request";
      }
      createCancellationTokenSource(request) {
        const buffer = request.$cancellationData;
        if (buffer === void 0) {
          return new cancellation_1.CancellationTokenSource();
        }
        return new SharedArrayBufferCancellationTokenSource(buffer);
      }
    };
    exports2.SharedArrayReceiverStrategy = SharedArrayReceiverStrategy;
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/common/semaphore.js
var require_semaphore = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/common/semaphore.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Semaphore = void 0;
    var ral_1 = require_ral();
    var Semaphore = class {
      constructor(capacity = 1) {
        if (capacity <= 0) {
          throw new Error("Capacity must be greater than 0");
        }
        this._capacity = capacity;
        this._active = 0;
        this._waiting = [];
      }
      lock(thunk) {
        return new Promise((resolve, reject) => {
          this._waiting.push({ thunk, resolve, reject });
          this.runNext();
        });
      }
      get active() {
        return this._active;
      }
      runNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
          return;
        }
        (0, ral_1.default)().timer.setImmediate(() => this.doRunNext());
      }
      doRunNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
          return;
        }
        const next = this._waiting.shift();
        this._active++;
        if (this._active > this._capacity) {
          throw new Error(`To many thunks active`);
        }
        try {
          const result = next.thunk();
          if (result instanceof Promise) {
            result.then((value) => {
              this._active--;
              next.resolve(value);
              this.runNext();
            }, (err) => {
              this._active--;
              next.reject(err);
              this.runNext();
            });
          } else {
            this._active--;
            next.resolve(result);
            this.runNext();
          }
        } catch (err) {
          this._active--;
          next.reject(err);
          this.runNext();
        }
      }
    };
    exports2.Semaphore = Semaphore;
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/common/messageReader.js
var require_messageReader = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/common/messageReader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReadableStreamMessageReader = exports2.AbstractMessageReader = exports2.MessageReader = void 0;
    var ral_1 = require_ral();
    var Is = require_is2();
    var events_1 = require_events();
    var semaphore_1 = require_semaphore();
    var MessageReader;
    (function(MessageReader2) {
      function is(value) {
        let candidate = value;
        return candidate && Is.func(candidate.listen) && Is.func(candidate.dispose) && Is.func(candidate.onError) && Is.func(candidate.onClose) && Is.func(candidate.onPartialMessage);
      }
      MessageReader2.is = is;
    })(MessageReader || (exports2.MessageReader = MessageReader = {}));
    var AbstractMessageReader = class {
      constructor() {
        this.errorEmitter = new events_1.Emitter();
        this.closeEmitter = new events_1.Emitter();
        this.partialMessageEmitter = new events_1.Emitter();
      }
      dispose() {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
      }
      get onError() {
        return this.errorEmitter.event;
      }
      fireError(error) {
        this.errorEmitter.fire(this.asError(error));
      }
      get onClose() {
        return this.closeEmitter.event;
      }
      fireClose() {
        this.closeEmitter.fire(void 0);
      }
      get onPartialMessage() {
        return this.partialMessageEmitter.event;
      }
      firePartialMessage(info) {
        this.partialMessageEmitter.fire(info);
      }
      asError(error) {
        if (error instanceof Error) {
          return error;
        } else {
          return new Error(`Reader received error. Reason: ${Is.string(error.message) ? error.message : "unknown"}`);
        }
      }
    };
    exports2.AbstractMessageReader = AbstractMessageReader;
    var ResolvedMessageReaderOptions;
    (function(ResolvedMessageReaderOptions2) {
      function fromOptions(options) {
        let charset;
        let result;
        let contentDecoder;
        const contentDecoders = /* @__PURE__ */ new Map();
        let contentTypeDecoder;
        const contentTypeDecoders = /* @__PURE__ */ new Map();
        if (options === void 0 || typeof options === "string") {
          charset = options ?? "utf-8";
        } else {
          charset = options.charset ?? "utf-8";
          if (options.contentDecoder !== void 0) {
            contentDecoder = options.contentDecoder;
            contentDecoders.set(contentDecoder.name, contentDecoder);
          }
          if (options.contentDecoders !== void 0) {
            for (const decoder of options.contentDecoders) {
              contentDecoders.set(decoder.name, decoder);
            }
          }
          if (options.contentTypeDecoder !== void 0) {
            contentTypeDecoder = options.contentTypeDecoder;
            contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
          }
          if (options.contentTypeDecoders !== void 0) {
            for (const decoder of options.contentTypeDecoders) {
              contentTypeDecoders.set(decoder.name, decoder);
            }
          }
        }
        if (contentTypeDecoder === void 0) {
          contentTypeDecoder = (0, ral_1.default)().applicationJson.decoder;
          contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
        }
        return { charset, contentDecoder, contentDecoders, contentTypeDecoder, contentTypeDecoders };
      }
      ResolvedMessageReaderOptions2.fromOptions = fromOptions;
    })(ResolvedMessageReaderOptions || (ResolvedMessageReaderOptions = {}));
    var ReadableStreamMessageReader = class extends AbstractMessageReader {
      constructor(readable, options) {
        super();
        this.readable = readable;
        this.options = ResolvedMessageReaderOptions.fromOptions(options);
        this.buffer = (0, ral_1.default)().messageBuffer.create(this.options.charset);
        this._partialMessageTimeout = 1e4;
        this.nextMessageLength = -1;
        this.messageToken = 0;
        this.readSemaphore = new semaphore_1.Semaphore(1);
      }
      set partialMessageTimeout(timeout) {
        this._partialMessageTimeout = timeout;
      }
      get partialMessageTimeout() {
        return this._partialMessageTimeout;
      }
      listen(callback) {
        this.nextMessageLength = -1;
        this.messageToken = 0;
        this.partialMessageTimer = void 0;
        this.callback = callback;
        const result = this.readable.onData((data) => {
          this.onData(data);
        });
        this.readable.onError((error) => this.fireError(error));
        this.readable.onClose(() => this.fireClose());
        return result;
      }
      onData(data) {
        try {
          this.buffer.append(data);
          while (true) {
            if (this.nextMessageLength === -1) {
              const headers = this.buffer.tryReadHeaders(true);
              if (!headers) {
                return;
              }
              const contentLength = headers.get("content-length");
              if (!contentLength) {
                this.fireError(new Error(`Header must provide a Content-Length property.
${JSON.stringify(Object.fromEntries(headers))}`));
                return;
              }
              const length = parseInt(contentLength);
              if (isNaN(length)) {
                this.fireError(new Error(`Content-Length value must be a number. Got ${contentLength}`));
                return;
              }
              this.nextMessageLength = length;
            }
            const body = this.buffer.tryReadBody(this.nextMessageLength);
            if (body === void 0) {
              this.setPartialMessageTimer();
              return;
            }
            this.clearPartialMessageTimer();
            this.nextMessageLength = -1;
            this.readSemaphore.lock(async () => {
              const bytes = this.options.contentDecoder !== void 0 ? await this.options.contentDecoder.decode(body) : body;
              const message = await this.options.contentTypeDecoder.decode(bytes, this.options);
              this.callback(message);
            }).catch((error) => {
              this.fireError(error);
            });
          }
        } catch (error) {
          this.fireError(error);
        }
      }
      clearPartialMessageTimer() {
        if (this.partialMessageTimer) {
          this.partialMessageTimer.dispose();
          this.partialMessageTimer = void 0;
        }
      }
      setPartialMessageTimer() {
        this.clearPartialMessageTimer();
        if (this._partialMessageTimeout <= 0) {
          return;
        }
        this.partialMessageTimer = (0, ral_1.default)().timer.setTimeout((token, timeout) => {
          this.partialMessageTimer = void 0;
          if (token === this.messageToken) {
            this.firePartialMessage({ messageToken: token, waitingTime: timeout });
            this.setPartialMessageTimer();
          }
        }, this._partialMessageTimeout, this.messageToken, this._partialMessageTimeout);
      }
    };
    exports2.ReadableStreamMessageReader = ReadableStreamMessageReader;
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/common/messageWriter.js
var require_messageWriter = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/common/messageWriter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WriteableStreamMessageWriter = exports2.AbstractMessageWriter = exports2.MessageWriter = void 0;
    var ral_1 = require_ral();
    var Is = require_is2();
    var semaphore_1 = require_semaphore();
    var events_1 = require_events();
    var ContentLength = "Content-Length: ";
    var CRLF = "\r\n";
    var MessageWriter;
    (function(MessageWriter2) {
      function is(value) {
        let candidate = value;
        return candidate && Is.func(candidate.dispose) && Is.func(candidate.onClose) && Is.func(candidate.onError) && Is.func(candidate.write);
      }
      MessageWriter2.is = is;
    })(MessageWriter || (exports2.MessageWriter = MessageWriter = {}));
    var AbstractMessageWriter = class {
      constructor() {
        this.errorEmitter = new events_1.Emitter();
        this.closeEmitter = new events_1.Emitter();
      }
      dispose() {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
      }
      get onError() {
        return this.errorEmitter.event;
      }
      fireError(error, message, count) {
        this.errorEmitter.fire([this.asError(error), message, count]);
      }
      get onClose() {
        return this.closeEmitter.event;
      }
      fireClose() {
        this.closeEmitter.fire(void 0);
      }
      asError(error) {
        if (error instanceof Error) {
          return error;
        } else {
          return new Error(`Writer received error. Reason: ${Is.string(error.message) ? error.message : "unknown"}`);
        }
      }
    };
    exports2.AbstractMessageWriter = AbstractMessageWriter;
    var ResolvedMessageWriterOptions;
    (function(ResolvedMessageWriterOptions2) {
      function fromOptions(options) {
        if (options === void 0 || typeof options === "string") {
          return { charset: options ?? "utf-8", contentTypeEncoder: (0, ral_1.default)().applicationJson.encoder };
        } else {
          return { charset: options.charset ?? "utf-8", contentEncoder: options.contentEncoder, contentTypeEncoder: options.contentTypeEncoder ?? (0, ral_1.default)().applicationJson.encoder };
        }
      }
      ResolvedMessageWriterOptions2.fromOptions = fromOptions;
    })(ResolvedMessageWriterOptions || (ResolvedMessageWriterOptions = {}));
    var WriteableStreamMessageWriter = class extends AbstractMessageWriter {
      constructor(writable, options) {
        super();
        this.writable = writable;
        this.options = ResolvedMessageWriterOptions.fromOptions(options);
        this.errorCount = 0;
        this.writeSemaphore = new semaphore_1.Semaphore(1);
        this.writable.onError((error) => this.fireError(error));
        this.writable.onClose(() => this.fireClose());
      }
      async write(msg) {
        return this.writeSemaphore.lock(async () => {
          const payload = this.options.contentTypeEncoder.encode(msg, this.options).then((buffer) => {
            if (this.options.contentEncoder !== void 0) {
              return this.options.contentEncoder.encode(buffer);
            } else {
              return buffer;
            }
          });
          return payload.then((buffer) => {
            const headers = [];
            headers.push(ContentLength, buffer.byteLength.toString(), CRLF);
            headers.push(CRLF);
            return this.doWrite(msg, headers, buffer);
          }, (error) => {
            this.fireError(error);
            throw error;
          });
        });
      }
      async doWrite(msg, headers, data) {
        try {
          await this.writable.write(headers.join(""), "ascii");
          return this.writable.write(data);
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
        this.writable.end();
      }
    };
    exports2.WriteableStreamMessageWriter = WriteableStreamMessageWriter;
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/common/messageBuffer.js
var require_messageBuffer = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/common/messageBuffer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AbstractMessageBuffer = void 0;
    var CR = 13;
    var LF = 10;
    var CRLF = "\r\n";
    var AbstractMessageBuffer = class {
      constructor(encoding = "utf-8") {
        this._encoding = encoding;
        this._chunks = [];
        this._totalLength = 0;
      }
      get encoding() {
        return this._encoding;
      }
      append(chunk) {
        const toAppend = typeof chunk === "string" ? this.fromString(chunk, this._encoding) : chunk;
        this._chunks.push(toAppend);
        this._totalLength += toAppend.byteLength;
      }
      tryReadHeaders(lowerCaseKeys = false) {
        if (this._chunks.length === 0) {
          return void 0;
        }
        let state = 0;
        let chunkIndex = 0;
        let offset = 0;
        let chunkBytesRead = 0;
        row: while (chunkIndex < this._chunks.length) {
          const chunk = this._chunks[chunkIndex];
          offset = 0;
          column: while (offset < chunk.length) {
            const value = chunk[offset];
            switch (value) {
              case CR:
                switch (state) {
                  case 0:
                    state = 1;
                    break;
                  case 2:
                    state = 3;
                    break;
                  default:
                    state = 0;
                }
                break;
              case LF:
                switch (state) {
                  case 1:
                    state = 2;
                    break;
                  case 3:
                    state = 4;
                    offset++;
                    break row;
                  default:
                    state = 0;
                }
                break;
              default:
                state = 0;
            }
            offset++;
          }
          chunkBytesRead += chunk.byteLength;
          chunkIndex++;
        }
        if (state !== 4) {
          return void 0;
        }
        const buffer = this._read(chunkBytesRead + offset);
        const result = /* @__PURE__ */ new Map();
        const headers = this.toString(buffer, "ascii").split(CRLF);
        if (headers.length < 2) {
          return result;
        }
        for (let i = 0; i < headers.length - 2; i++) {
          const header = headers[i];
          const index = header.indexOf(":");
          if (index === -1) {
            throw new Error(`Message header must separate key and value using ':'
${header}`);
          }
          const key = header.substr(0, index);
          const value = header.substr(index + 1).trim();
          result.set(lowerCaseKeys ? key.toLowerCase() : key, value);
        }
        return result;
      }
      tryReadBody(length) {
        if (this._totalLength < length) {
          return void 0;
        }
        return this._read(length);
      }
      get numberOfBytes() {
        return this._totalLength;
      }
      _read(byteCount) {
        if (byteCount === 0) {
          return this.emptyBuffer();
        }
        if (byteCount > this._totalLength) {
          throw new Error(`Cannot read so many bytes!`);
        }
        if (this._chunks[0].byteLength === byteCount) {
          const chunk = this._chunks[0];
          this._chunks.shift();
          this._totalLength -= byteCount;
          return this.asNative(chunk);
        }
        if (this._chunks[0].byteLength > byteCount) {
          const chunk = this._chunks[0];
          const result2 = this.asNative(chunk, byteCount);
          this._chunks[0] = chunk.slice(byteCount);
          this._totalLength -= byteCount;
          return result2;
        }
        const result = this.allocNative(byteCount);
        let resultOffset = 0;
        let chunkIndex = 0;
        while (byteCount > 0) {
          const chunk = this._chunks[chunkIndex];
          if (chunk.byteLength > byteCount) {
            const chunkPart = chunk.slice(0, byteCount);
            result.set(chunkPart, resultOffset);
            resultOffset += byteCount;
            this._chunks[chunkIndex] = chunk.slice(byteCount);
            this._totalLength -= byteCount;
            byteCount -= byteCount;
          } else {
            result.set(chunk, resultOffset);
            resultOffset += chunk.byteLength;
            this._chunks.shift();
            this._totalLength -= chunk.byteLength;
            byteCount -= chunk.byteLength;
          }
        }
        return result;
      }
    };
    exports2.AbstractMessageBuffer = AbstractMessageBuffer;
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/common/connection.js
var require_connection = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/common/connection.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createMessageConnection = exports2.ConnectionOptions = exports2.MessageStrategy = exports2.CancellationStrategy = exports2.CancellationSenderStrategy = exports2.CancellationReceiverStrategy = exports2.RequestCancellationReceiverStrategy = exports2.IdCancellationReceiverStrategy = exports2.ConnectionStrategy = exports2.ConnectionError = exports2.ConnectionErrors = exports2.LogTraceNotification = exports2.SetTraceNotification = exports2.TraceFormat = exports2.TraceValues = exports2.Trace = exports2.NullLogger = exports2.ProgressType = exports2.ProgressToken = void 0;
    var ral_1 = require_ral();
    var Is = require_is2();
    var messages_1 = require_messages();
    var linkedMap_1 = require_linkedMap();
    var events_1 = require_events();
    var cancellation_1 = require_cancellation();
    var CancelNotification;
    (function(CancelNotification2) {
      CancelNotification2.type = new messages_1.NotificationType("$/cancelRequest");
    })(CancelNotification || (CancelNotification = {}));
    var ProgressToken;
    (function(ProgressToken2) {
      function is(value) {
        return typeof value === "string" || typeof value === "number";
      }
      ProgressToken2.is = is;
    })(ProgressToken || (exports2.ProgressToken = ProgressToken = {}));
    var ProgressNotification;
    (function(ProgressNotification2) {
      ProgressNotification2.type = new messages_1.NotificationType("$/progress");
    })(ProgressNotification || (ProgressNotification = {}));
    var ProgressType = class {
      constructor() {
      }
    };
    exports2.ProgressType = ProgressType;
    var StarRequestHandler;
    (function(StarRequestHandler2) {
      function is(value) {
        return Is.func(value);
      }
      StarRequestHandler2.is = is;
    })(StarRequestHandler || (StarRequestHandler = {}));
    exports2.NullLogger = Object.freeze({
      error: () => {
      },
      warn: () => {
      },
      info: () => {
      },
      log: () => {
      }
    });
    var Trace;
    (function(Trace2) {
      Trace2[Trace2["Off"] = 0] = "Off";
      Trace2[Trace2["Messages"] = 1] = "Messages";
      Trace2[Trace2["Compact"] = 2] = "Compact";
      Trace2[Trace2["Verbose"] = 3] = "Verbose";
    })(Trace || (exports2.Trace = Trace = {}));
    var TraceValues;
    (function(TraceValues2) {
      TraceValues2.Off = "off";
      TraceValues2.Messages = "messages";
      TraceValues2.Compact = "compact";
      TraceValues2.Verbose = "verbose";
    })(TraceValues || (exports2.TraceValues = TraceValues = {}));
    (function(Trace2) {
      function fromString(value) {
        if (!Is.string(value)) {
          return Trace2.Off;
        }
        value = value.toLowerCase();
        switch (value) {
          case "off":
            return Trace2.Off;
          case "messages":
            return Trace2.Messages;
          case "compact":
            return Trace2.Compact;
          case "verbose":
            return Trace2.Verbose;
          default:
            return Trace2.Off;
        }
      }
      Trace2.fromString = fromString;
      function toString(value) {
        switch (value) {
          case Trace2.Off:
            return "off";
          case Trace2.Messages:
            return "messages";
          case Trace2.Compact:
            return "compact";
          case Trace2.Verbose:
            return "verbose";
          default:
            return "off";
        }
      }
      Trace2.toString = toString;
    })(Trace || (exports2.Trace = Trace = {}));
    var TraceFormat;
    (function(TraceFormat2) {
      TraceFormat2["Text"] = "text";
      TraceFormat2["JSON"] = "json";
    })(TraceFormat || (exports2.TraceFormat = TraceFormat = {}));
    (function(TraceFormat2) {
      function fromString(value) {
        if (!Is.string(value)) {
          return TraceFormat2.Text;
        }
        value = value.toLowerCase();
        if (value === "json") {
          return TraceFormat2.JSON;
        } else {
          return TraceFormat2.Text;
        }
      }
      TraceFormat2.fromString = fromString;
    })(TraceFormat || (exports2.TraceFormat = TraceFormat = {}));
    var SetTraceNotification;
    (function(SetTraceNotification2) {
      SetTraceNotification2.type = new messages_1.NotificationType("$/setTrace");
    })(SetTraceNotification || (exports2.SetTraceNotification = SetTraceNotification = {}));
    var LogTraceNotification;
    (function(LogTraceNotification2) {
      LogTraceNotification2.type = new messages_1.NotificationType("$/logTrace");
    })(LogTraceNotification || (exports2.LogTraceNotification = LogTraceNotification = {}));
    var ConnectionErrors;
    (function(ConnectionErrors2) {
      ConnectionErrors2[ConnectionErrors2["Closed"] = 1] = "Closed";
      ConnectionErrors2[ConnectionErrors2["Disposed"] = 2] = "Disposed";
      ConnectionErrors2[ConnectionErrors2["AlreadyListening"] = 3] = "AlreadyListening";
    })(ConnectionErrors || (exports2.ConnectionErrors = ConnectionErrors = {}));
    var ConnectionError = class _ConnectionError extends Error {
      constructor(code2, message) {
        super(message);
        this.code = code2;
        Object.setPrototypeOf(this, _ConnectionError.prototype);
      }
    };
    exports2.ConnectionError = ConnectionError;
    var ConnectionStrategy;
    (function(ConnectionStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.cancelUndispatched);
      }
      ConnectionStrategy2.is = is;
    })(ConnectionStrategy || (exports2.ConnectionStrategy = ConnectionStrategy = {}));
    var IdCancellationReceiverStrategy;
    (function(IdCancellationReceiverStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && (candidate.kind === void 0 || candidate.kind === "id") && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === void 0 || Is.func(candidate.dispose));
      }
      IdCancellationReceiverStrategy2.is = is;
    })(IdCancellationReceiverStrategy || (exports2.IdCancellationReceiverStrategy = IdCancellationReceiverStrategy = {}));
    var RequestCancellationReceiverStrategy;
    (function(RequestCancellationReceiverStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && candidate.kind === "request" && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === void 0 || Is.func(candidate.dispose));
      }
      RequestCancellationReceiverStrategy2.is = is;
    })(RequestCancellationReceiverStrategy || (exports2.RequestCancellationReceiverStrategy = RequestCancellationReceiverStrategy = {}));
    var CancellationReceiverStrategy;
    (function(CancellationReceiverStrategy2) {
      CancellationReceiverStrategy2.Message = Object.freeze({
        createCancellationTokenSource(_) {
          return new cancellation_1.CancellationTokenSource();
        }
      });
      function is(value) {
        return IdCancellationReceiverStrategy.is(value) || RequestCancellationReceiverStrategy.is(value);
      }
      CancellationReceiverStrategy2.is = is;
    })(CancellationReceiverStrategy || (exports2.CancellationReceiverStrategy = CancellationReceiverStrategy = {}));
    var CancellationSenderStrategy;
    (function(CancellationSenderStrategy2) {
      CancellationSenderStrategy2.Message = Object.freeze({
        sendCancellation(conn, id) {
          return conn.sendNotification(CancelNotification.type, { id });
        },
        cleanup(_) {
        }
      });
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.sendCancellation) && Is.func(candidate.cleanup);
      }
      CancellationSenderStrategy2.is = is;
    })(CancellationSenderStrategy || (exports2.CancellationSenderStrategy = CancellationSenderStrategy = {}));
    var CancellationStrategy;
    (function(CancellationStrategy2) {
      CancellationStrategy2.Message = Object.freeze({
        receiver: CancellationReceiverStrategy.Message,
        sender: CancellationSenderStrategy.Message
      });
      function is(value) {
        const candidate = value;
        return candidate && CancellationReceiverStrategy.is(candidate.receiver) && CancellationSenderStrategy.is(candidate.sender);
      }
      CancellationStrategy2.is = is;
    })(CancellationStrategy || (exports2.CancellationStrategy = CancellationStrategy = {}));
    var MessageStrategy;
    (function(MessageStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.handleMessage);
      }
      MessageStrategy2.is = is;
    })(MessageStrategy || (exports2.MessageStrategy = MessageStrategy = {}));
    var ConnectionOptions;
    (function(ConnectionOptions2) {
      function is(value) {
        const candidate = value;
        return candidate && (CancellationStrategy.is(candidate.cancellationStrategy) || ConnectionStrategy.is(candidate.connectionStrategy) || MessageStrategy.is(candidate.messageStrategy));
      }
      ConnectionOptions2.is = is;
    })(ConnectionOptions || (exports2.ConnectionOptions = ConnectionOptions = {}));
    var ConnectionState;
    (function(ConnectionState2) {
      ConnectionState2[ConnectionState2["New"] = 1] = "New";
      ConnectionState2[ConnectionState2["Listening"] = 2] = "Listening";
      ConnectionState2[ConnectionState2["Closed"] = 3] = "Closed";
      ConnectionState2[ConnectionState2["Disposed"] = 4] = "Disposed";
    })(ConnectionState || (ConnectionState = {}));
    function createMessageConnection(messageReader, messageWriter, _logger, options) {
      const logger = _logger !== void 0 ? _logger : exports2.NullLogger;
      let sequenceNumber = 0;
      let notificationSequenceNumber = 0;
      let unknownResponseSequenceNumber = 0;
      const version = "2.0";
      let starRequestHandler = void 0;
      const requestHandlers = /* @__PURE__ */ new Map();
      let starNotificationHandler = void 0;
      const notificationHandlers = /* @__PURE__ */ new Map();
      const progressHandlers = /* @__PURE__ */ new Map();
      let timer;
      let messageQueue = new linkedMap_1.LinkedMap();
      let responsePromises = /* @__PURE__ */ new Map();
      let knownCanceledRequests = /* @__PURE__ */ new Set();
      let requestTokens = /* @__PURE__ */ new Map();
      let trace = Trace.Off;
      let traceFormat = TraceFormat.Text;
      let tracer;
      let state = ConnectionState.New;
      const errorEmitter = new events_1.Emitter();
      const closeEmitter = new events_1.Emitter();
      const unhandledNotificationEmitter = new events_1.Emitter();
      const unhandledProgressEmitter = new events_1.Emitter();
      const disposeEmitter = new events_1.Emitter();
      const cancellationStrategy = options && options.cancellationStrategy ? options.cancellationStrategy : CancellationStrategy.Message;
      function createRequestQueueKey(id) {
        if (id === null) {
          throw new Error(`Can't send requests with id null since the response can't be correlated.`);
        }
        return "req-" + id.toString();
      }
      function createResponseQueueKey(id) {
        if (id === null) {
          return "res-unknown-" + (++unknownResponseSequenceNumber).toString();
        } else {
          return "res-" + id.toString();
        }
      }
      function createNotificationQueueKey() {
        return "not-" + (++notificationSequenceNumber).toString();
      }
      function addMessageToQueue(queue, message) {
        if (messages_1.Message.isRequest(message)) {
          queue.set(createRequestQueueKey(message.id), message);
        } else if (messages_1.Message.isResponse(message)) {
          queue.set(createResponseQueueKey(message.id), message);
        } else {
          queue.set(createNotificationQueueKey(), message);
        }
      }
      function cancelUndispatched(_message) {
        return void 0;
      }
      function isListening() {
        return state === ConnectionState.Listening;
      }
      function isClosed() {
        return state === ConnectionState.Closed;
      }
      function isDisposed() {
        return state === ConnectionState.Disposed;
      }
      function closeHandler() {
        if (state === ConnectionState.New || state === ConnectionState.Listening) {
          state = ConnectionState.Closed;
          closeEmitter.fire(void 0);
        }
      }
      function readErrorHandler(error) {
        errorEmitter.fire([error, void 0, void 0]);
      }
      function writeErrorHandler(data) {
        errorEmitter.fire(data);
      }
      messageReader.onClose(closeHandler);
      messageReader.onError(readErrorHandler);
      messageWriter.onClose(closeHandler);
      messageWriter.onError(writeErrorHandler);
      function triggerMessageQueue() {
        if (timer || messageQueue.size === 0) {
          return;
        }
        timer = (0, ral_1.default)().timer.setImmediate(() => {
          timer = void 0;
          processMessageQueue();
        });
      }
      function handleMessage(message) {
        if (messages_1.Message.isRequest(message)) {
          handleRequest(message);
        } else if (messages_1.Message.isNotification(message)) {
          handleNotification(message);
        } else if (messages_1.Message.isResponse(message)) {
          handleResponse(message);
        } else {
          handleInvalidMessage(message);
        }
      }
      function processMessageQueue() {
        if (messageQueue.size === 0) {
          return;
        }
        const message = messageQueue.shift();
        try {
          const messageStrategy = options?.messageStrategy;
          if (MessageStrategy.is(messageStrategy)) {
            messageStrategy.handleMessage(message, handleMessage);
          } else {
            handleMessage(message);
          }
        } finally {
          triggerMessageQueue();
        }
      }
      const callback = (message) => {
        try {
          if (messages_1.Message.isNotification(message) && message.method === CancelNotification.type.method) {
            const cancelId = message.params.id;
            const key = createRequestQueueKey(cancelId);
            const toCancel = messageQueue.get(key);
            if (messages_1.Message.isRequest(toCancel)) {
              const strategy = options?.connectionStrategy;
              const response = strategy && strategy.cancelUndispatched ? strategy.cancelUndispatched(toCancel, cancelUndispatched) : cancelUndispatched(toCancel);
              if (response && (response.error !== void 0 || response.result !== void 0)) {
                messageQueue.delete(key);
                requestTokens.delete(cancelId);
                response.id = toCancel.id;
                traceSendingResponse(response, message.method, Date.now());
                messageWriter.write(response).catch(() => logger.error(`Sending response for canceled message failed.`));
                return;
              }
            }
            const cancellationToken = requestTokens.get(cancelId);
            if (cancellationToken !== void 0) {
              cancellationToken.cancel();
              traceReceivedNotification(message);
              return;
            } else {
              knownCanceledRequests.add(cancelId);
            }
          }
          addMessageToQueue(messageQueue, message);
        } finally {
          triggerMessageQueue();
        }
      };
      function handleRequest(requestMessage) {
        if (isDisposed()) {
          return;
        }
        function reply(resultOrError, method, startTime2) {
          const message = {
            jsonrpc: version,
            id: requestMessage.id
          };
          if (resultOrError instanceof messages_1.ResponseError) {
            message.error = resultOrError.toJson();
          } else {
            message.result = resultOrError === void 0 ? null : resultOrError;
          }
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        function replyError(error, method, startTime2) {
          const message = {
            jsonrpc: version,
            id: requestMessage.id,
            error: error.toJson()
          };
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        function replySuccess(result, method, startTime2) {
          if (result === void 0) {
            result = null;
          }
          const message = {
            jsonrpc: version,
            id: requestMessage.id,
            result
          };
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        traceReceivedRequest(requestMessage);
        const element = requestHandlers.get(requestMessage.method);
        let type;
        let requestHandler;
        if (element) {
          type = element.type;
          requestHandler = element.handler;
        }
        const startTime = Date.now();
        if (requestHandler || starRequestHandler) {
          const tokenKey = requestMessage.id ?? String(Date.now());
          const cancellationSource = IdCancellationReceiverStrategy.is(cancellationStrategy.receiver) ? cancellationStrategy.receiver.createCancellationTokenSource(tokenKey) : cancellationStrategy.receiver.createCancellationTokenSource(requestMessage);
          if (requestMessage.id !== null && knownCanceledRequests.has(requestMessage.id)) {
            cancellationSource.cancel();
          }
          if (requestMessage.id !== null) {
            requestTokens.set(tokenKey, cancellationSource);
          }
          try {
            let handlerResult;
            if (requestHandler) {
              if (requestMessage.params === void 0) {
                if (type !== void 0 && type.numberOfParams !== 0) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines ${type.numberOfParams} params but received none.`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(cancellationSource.token);
              } else if (Array.isArray(requestMessage.params)) {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byName) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by name but received parameters by position`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(...requestMessage.params, cancellationSource.token);
              } else {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by position but received parameters by name`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(requestMessage.params, cancellationSource.token);
              }
            } else if (starRequestHandler) {
              handlerResult = starRequestHandler(requestMessage.method, requestMessage.params, cancellationSource.token);
            }
            const promise = handlerResult;
            if (!handlerResult) {
              requestTokens.delete(tokenKey);
              replySuccess(handlerResult, requestMessage.method, startTime);
            } else if (promise.then) {
              promise.then((resultOrError) => {
                requestTokens.delete(tokenKey);
                reply(resultOrError, requestMessage.method, startTime);
              }, (error) => {
                requestTokens.delete(tokenKey);
                if (error instanceof messages_1.ResponseError) {
                  replyError(error, requestMessage.method, startTime);
                } else if (error && Is.string(error.message)) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
                } else {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
                }
              });
            } else {
              requestTokens.delete(tokenKey);
              reply(handlerResult, requestMessage.method, startTime);
            }
          } catch (error) {
            requestTokens.delete(tokenKey);
            if (error instanceof messages_1.ResponseError) {
              reply(error, requestMessage.method, startTime);
            } else if (error && Is.string(error.message)) {
              replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
            } else {
              replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
            }
          }
        } else {
          replyError(new messages_1.ResponseError(messages_1.ErrorCodes.MethodNotFound, `Unhandled method ${requestMessage.method}`), requestMessage.method, startTime);
        }
      }
      function handleResponse(responseMessage) {
        if (isDisposed()) {
          return;
        }
        if (responseMessage.id === null) {
          if (responseMessage.error) {
            logger.error(`Received response message without id: Error is: 
${JSON.stringify(responseMessage.error, void 0, 4)}`);
          } else {
            logger.error(`Received response message without id. No further error information provided.`);
          }
        } else {
          const key = responseMessage.id;
          const responsePromise = responsePromises.get(key);
          traceReceivedResponse(responseMessage, responsePromise);
          if (responsePromise !== void 0) {
            responsePromises.delete(key);
            try {
              if (responseMessage.error) {
                const error = responseMessage.error;
                responsePromise.reject(new messages_1.ResponseError(error.code, error.message, error.data));
              } else if (responseMessage.result !== void 0) {
                responsePromise.resolve(responseMessage.result);
              } else {
                throw new Error("Should never happen.");
              }
            } catch (error) {
              if (error.message) {
                logger.error(`Response handler '${responsePromise.method}' failed with message: ${error.message}`);
              } else {
                logger.error(`Response handler '${responsePromise.method}' failed unexpectedly.`);
              }
            }
          }
        }
      }
      function handleNotification(message) {
        if (isDisposed()) {
          return;
        }
        let type = void 0;
        let notificationHandler;
        if (message.method === CancelNotification.type.method) {
          const cancelId = message.params.id;
          knownCanceledRequests.delete(cancelId);
          traceReceivedNotification(message);
          return;
        } else {
          const element = notificationHandlers.get(message.method);
          if (element) {
            notificationHandler = element.handler;
            type = element.type;
          }
        }
        if (notificationHandler || starNotificationHandler) {
          try {
            traceReceivedNotification(message);
            if (notificationHandler) {
              if (message.params === void 0) {
                if (type !== void 0) {
                  if (type.numberOfParams !== 0 && type.parameterStructures !== messages_1.ParameterStructures.byName) {
                    logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received none.`);
                  }
                }
                notificationHandler();
              } else if (Array.isArray(message.params)) {
                const params = message.params;
                if (message.method === ProgressNotification.type.method && params.length === 2 && ProgressToken.is(params[0])) {
                  notificationHandler({ token: params[0], value: params[1] });
                } else {
                  if (type !== void 0) {
                    if (type.parameterStructures === messages_1.ParameterStructures.byName) {
                      logger.error(`Notification ${message.method} defines parameters by name but received parameters by position`);
                    }
                    if (type.numberOfParams !== message.params.length) {
                      logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received ${params.length} arguments`);
                    }
                  }
                  notificationHandler(...params);
                }
              } else {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                  logger.error(`Notification ${message.method} defines parameters by position but received parameters by name`);
                }
                notificationHandler(message.params);
              }
            } else if (starNotificationHandler) {
              starNotificationHandler(message.method, message.params);
            }
          } catch (error) {
            if (error.message) {
              logger.error(`Notification handler '${message.method}' failed with message: ${error.message}`);
            } else {
              logger.error(`Notification handler '${message.method}' failed unexpectedly.`);
            }
          }
        } else {
          unhandledNotificationEmitter.fire(message);
        }
      }
      function handleInvalidMessage(message) {
        if (!message) {
          logger.error("Received empty message.");
          return;
        }
        logger.error(`Received message which is neither a response nor a notification message:
${JSON.stringify(message, null, 4)}`);
        const responseMessage = message;
        if (Is.string(responseMessage.id) || Is.number(responseMessage.id)) {
          const key = responseMessage.id;
          const responseHandler = responsePromises.get(key);
          if (responseHandler) {
            responseHandler.reject(new Error("The received response has neither a result nor an error property."));
          }
        }
      }
      function stringifyTrace(params) {
        if (params === void 0 || params === null) {
          return void 0;
        }
        switch (trace) {
          case Trace.Verbose:
            return JSON.stringify(params, null, 4);
          case Trace.Compact:
            return JSON.stringify(params);
          default:
            return void 0;
        }
      }
      function traceSendingRequest(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          }
          tracer.log(`Sending request '${message.method} - (${message.id})'.`, data);
        } else {
          logLSPMessage("send-request", message);
        }
      }
      function traceSendingNotification(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.params) {
              data = `Params: ${stringifyTrace(message.params)}

`;
            } else {
              data = "No parameters provided.\n\n";
            }
          }
          tracer.log(`Sending notification '${message.method}'.`, data);
        } else {
          logLSPMessage("send-notification", message);
        }
      }
      function traceSendingResponse(message, method, startTime) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.error && message.error.data) {
              data = `Error data: ${stringifyTrace(message.error.data)}

`;
            } else {
              if (message.result) {
                data = `Result: ${stringifyTrace(message.result)}

`;
              } else if (message.error === void 0) {
                data = "No result returned.\n\n";
              }
            }
          }
          tracer.log(`Sending response '${method} - (${message.id})'. Processing request took ${Date.now() - startTime}ms`, data);
        } else {
          logLSPMessage("send-response", message);
        }
      }
      function traceReceivedRequest(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          }
          tracer.log(`Received request '${message.method} - (${message.id})'.`, data);
        } else {
          logLSPMessage("receive-request", message);
        }
      }
      function traceReceivedNotification(message) {
        if (trace === Trace.Off || !tracer || message.method === LogTraceNotification.type.method) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.params) {
              data = `Params: ${stringifyTrace(message.params)}

`;
            } else {
              data = "No parameters provided.\n\n";
            }
          }
          tracer.log(`Received notification '${message.method}'.`, data);
        } else {
          logLSPMessage("receive-notification", message);
        }
      }
      function traceReceivedResponse(message, responsePromise) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.error && message.error.data) {
              data = `Error data: ${stringifyTrace(message.error.data)}

`;
            } else {
              if (message.result) {
                data = `Result: ${stringifyTrace(message.result)}

`;
              } else if (message.error === void 0) {
                data = "No result returned.\n\n";
              }
            }
          }
          if (responsePromise) {
            const error = message.error ? ` Request failed: ${message.error.message} (${message.error.code}).` : "";
            tracer.log(`Received response '${responsePromise.method} - (${message.id})' in ${Date.now() - responsePromise.timerStart}ms.${error}`, data);
          } else {
            tracer.log(`Received response ${message.id} without active response promise.`, data);
          }
        } else {
          logLSPMessage("receive-response", message);
        }
      }
      function logLSPMessage(type, message) {
        if (!tracer || trace === Trace.Off) {
          return;
        }
        const lspMessage = {
          isLSPMessage: true,
          type,
          message,
          timestamp: Date.now()
        };
        tracer.log(lspMessage);
      }
      function throwIfClosedOrDisposed() {
        if (isClosed()) {
          throw new ConnectionError(ConnectionErrors.Closed, "Connection is closed.");
        }
        if (isDisposed()) {
          throw new ConnectionError(ConnectionErrors.Disposed, "Connection is disposed.");
        }
      }
      function throwIfListening() {
        if (isListening()) {
          throw new ConnectionError(ConnectionErrors.AlreadyListening, "Connection is already listening");
        }
      }
      function throwIfNotListening() {
        if (!isListening()) {
          throw new Error("Call listen() first.");
        }
      }
      function undefinedToNull(param) {
        if (param === void 0) {
          return null;
        } else {
          return param;
        }
      }
      function nullToUndefined(param) {
        if (param === null) {
          return void 0;
        } else {
          return param;
        }
      }
      function isNamedParam(param) {
        return param !== void 0 && param !== null && !Array.isArray(param) && typeof param === "object";
      }
      function computeSingleParam(parameterStructures, param) {
        switch (parameterStructures) {
          case messages_1.ParameterStructures.auto:
            if (isNamedParam(param)) {
              return nullToUndefined(param);
            } else {
              return [undefinedToNull(param)];
            }
          case messages_1.ParameterStructures.byName:
            if (!isNamedParam(param)) {
              throw new Error(`Received parameters by name but param is not an object literal.`);
            }
            return nullToUndefined(param);
          case messages_1.ParameterStructures.byPosition:
            return [undefinedToNull(param)];
          default:
            throw new Error(`Unknown parameter structure ${parameterStructures.toString()}`);
        }
      }
      function computeMessageParams(type, params) {
        let result;
        const numberOfParams = type.numberOfParams;
        switch (numberOfParams) {
          case 0:
            result = void 0;
            break;
          case 1:
            result = computeSingleParam(type.parameterStructures, params[0]);
            break;
          default:
            result = [];
            for (let i = 0; i < params.length && i < numberOfParams; i++) {
              result.push(undefinedToNull(params[i]));
            }
            if (params.length < numberOfParams) {
              for (let i = params.length; i < numberOfParams; i++) {
                result.push(null);
              }
            }
            break;
        }
        return result;
      }
      const connection2 = {
        sendNotification: (type, ...args) => {
          throwIfClosedOrDisposed();
          let method;
          let messageParams;
          if (Is.string(type)) {
            method = type;
            const first = args[0];
            let paramStart = 0;
            let parameterStructures = messages_1.ParameterStructures.auto;
            if (messages_1.ParameterStructures.is(first)) {
              paramStart = 1;
              parameterStructures = first;
            }
            let paramEnd = args.length;
            const numberOfParams = paramEnd - paramStart;
            switch (numberOfParams) {
              case 0:
                messageParams = void 0;
                break;
              case 1:
                messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                break;
              default:
                if (parameterStructures === messages_1.ParameterStructures.byName) {
                  throw new Error(`Received ${numberOfParams} parameters for 'by Name' notification parameter structure.`);
                }
                messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
                break;
            }
          } else {
            const params = args;
            method = type.method;
            messageParams = computeMessageParams(type, params);
          }
          const notificationMessage = {
            jsonrpc: version,
            method,
            params: messageParams
          };
          traceSendingNotification(notificationMessage);
          return messageWriter.write(notificationMessage).catch((error) => {
            logger.error(`Sending notification failed.`);
            throw error;
          });
        },
        onNotification: (type, handler) => {
          throwIfClosedOrDisposed();
          let method;
          if (Is.func(type)) {
            starNotificationHandler = type;
          } else if (handler) {
            if (Is.string(type)) {
              method = type;
              notificationHandlers.set(type, { type: void 0, handler });
            } else {
              method = type.method;
              notificationHandlers.set(type.method, { type, handler });
            }
          }
          return {
            dispose: () => {
              if (method !== void 0) {
                notificationHandlers.delete(method);
              } else {
                starNotificationHandler = void 0;
              }
            }
          };
        },
        onProgress: (_type, token, handler) => {
          if (progressHandlers.has(token)) {
            throw new Error(`Progress handler for token ${token} already registered`);
          }
          progressHandlers.set(token, handler);
          return {
            dispose: () => {
              progressHandlers.delete(token);
            }
          };
        },
        sendProgress: (_type, token, value) => {
          return connection2.sendNotification(ProgressNotification.type, { token, value });
        },
        onUnhandledProgress: unhandledProgressEmitter.event,
        sendRequest: (type, ...args) => {
          throwIfClosedOrDisposed();
          throwIfNotListening();
          let method;
          let messageParams;
          let token = void 0;
          if (Is.string(type)) {
            method = type;
            const first = args[0];
            const last = args[args.length - 1];
            let paramStart = 0;
            let parameterStructures = messages_1.ParameterStructures.auto;
            if (messages_1.ParameterStructures.is(first)) {
              paramStart = 1;
              parameterStructures = first;
            }
            let paramEnd = args.length;
            if (cancellation_1.CancellationToken.is(last)) {
              paramEnd = paramEnd - 1;
              token = last;
            }
            const numberOfParams = paramEnd - paramStart;
            switch (numberOfParams) {
              case 0:
                messageParams = void 0;
                break;
              case 1:
                messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                break;
              default:
                if (parameterStructures === messages_1.ParameterStructures.byName) {
                  throw new Error(`Received ${numberOfParams} parameters for 'by Name' request parameter structure.`);
                }
                messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
                break;
            }
          } else {
            const params = args;
            method = type.method;
            messageParams = computeMessageParams(type, params);
            const numberOfParams = type.numberOfParams;
            token = cancellation_1.CancellationToken.is(params[numberOfParams]) ? params[numberOfParams] : void 0;
          }
          const id = sequenceNumber++;
          let disposable;
          if (token) {
            disposable = token.onCancellationRequested(() => {
              const p = cancellationStrategy.sender.sendCancellation(connection2, id);
              if (p === void 0) {
                logger.log(`Received no promise from cancellation strategy when cancelling id ${id}`);
                return Promise.resolve();
              } else {
                return p.catch(() => {
                  logger.log(`Sending cancellation messages for id ${id} failed`);
                });
              }
            });
          }
          const requestMessage = {
            jsonrpc: version,
            id,
            method,
            params: messageParams
          };
          traceSendingRequest(requestMessage);
          if (typeof cancellationStrategy.sender.enableCancellation === "function") {
            cancellationStrategy.sender.enableCancellation(requestMessage);
          }
          return new Promise(async (resolve, reject) => {
            const resolveWithCleanup = (r) => {
              resolve(r);
              cancellationStrategy.sender.cleanup(id);
              disposable?.dispose();
            };
            const rejectWithCleanup = (r) => {
              reject(r);
              cancellationStrategy.sender.cleanup(id);
              disposable?.dispose();
            };
            const responsePromise = { method, timerStart: Date.now(), resolve: resolveWithCleanup, reject: rejectWithCleanup };
            try {
              await messageWriter.write(requestMessage);
              responsePromises.set(id, responsePromise);
            } catch (error) {
              logger.error(`Sending request failed.`);
              responsePromise.reject(new messages_1.ResponseError(messages_1.ErrorCodes.MessageWriteError, error.message ? error.message : "Unknown reason"));
              throw error;
            }
          });
        },
        onRequest: (type, handler) => {
          throwIfClosedOrDisposed();
          let method = null;
          if (StarRequestHandler.is(type)) {
            method = void 0;
            starRequestHandler = type;
          } else if (Is.string(type)) {
            method = null;
            if (handler !== void 0) {
              method = type;
              requestHandlers.set(type, { handler, type: void 0 });
            }
          } else {
            if (handler !== void 0) {
              method = type.method;
              requestHandlers.set(type.method, { type, handler });
            }
          }
          return {
            dispose: () => {
              if (method === null) {
                return;
              }
              if (method !== void 0) {
                requestHandlers.delete(method);
              } else {
                starRequestHandler = void 0;
              }
            }
          };
        },
        hasPendingResponse: () => {
          return responsePromises.size > 0;
        },
        trace: async (_value, _tracer, sendNotificationOrTraceOptions) => {
          let _sendNotification = false;
          let _traceFormat = TraceFormat.Text;
          if (sendNotificationOrTraceOptions !== void 0) {
            if (Is.boolean(sendNotificationOrTraceOptions)) {
              _sendNotification = sendNotificationOrTraceOptions;
            } else {
              _sendNotification = sendNotificationOrTraceOptions.sendNotification || false;
              _traceFormat = sendNotificationOrTraceOptions.traceFormat || TraceFormat.Text;
            }
          }
          trace = _value;
          traceFormat = _traceFormat;
          if (trace === Trace.Off) {
            tracer = void 0;
          } else {
            tracer = _tracer;
          }
          if (_sendNotification && !isClosed() && !isDisposed()) {
            await connection2.sendNotification(SetTraceNotification.type, { value: Trace.toString(_value) });
          }
        },
        onError: errorEmitter.event,
        onClose: closeEmitter.event,
        onUnhandledNotification: unhandledNotificationEmitter.event,
        onDispose: disposeEmitter.event,
        end: () => {
          messageWriter.end();
        },
        dispose: () => {
          if (isDisposed()) {
            return;
          }
          state = ConnectionState.Disposed;
          disposeEmitter.fire(void 0);
          const error = new messages_1.ResponseError(messages_1.ErrorCodes.PendingResponseRejected, "Pending response rejected since connection got disposed");
          for (const promise of responsePromises.values()) {
            promise.reject(error);
          }
          responsePromises = /* @__PURE__ */ new Map();
          requestTokens = /* @__PURE__ */ new Map();
          knownCanceledRequests = /* @__PURE__ */ new Set();
          messageQueue = new linkedMap_1.LinkedMap();
          if (Is.func(messageWriter.dispose)) {
            messageWriter.dispose();
          }
          if (Is.func(messageReader.dispose)) {
            messageReader.dispose();
          }
        },
        listen: () => {
          throwIfClosedOrDisposed();
          throwIfListening();
          state = ConnectionState.Listening;
          messageReader.listen(callback);
        },
        inspect: () => {
          (0, ral_1.default)().console.log("inspect");
        }
      };
      connection2.onNotification(LogTraceNotification.type, (params) => {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        const verbose = trace === Trace.Verbose || trace === Trace.Compact;
        tracer.log(params.message, verbose ? params.verbose : void 0);
      });
      connection2.onNotification(ProgressNotification.type, (params) => {
        const handler = progressHandlers.get(params.token);
        if (handler) {
          handler(params.value);
        } else {
          unhandledProgressEmitter.fire(params);
        }
      });
      return connection2;
    }
    exports2.createMessageConnection = createMessageConnection;
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/common/api.js
var require_api = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/common/api.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProgressType = exports2.ProgressToken = exports2.createMessageConnection = exports2.NullLogger = exports2.ConnectionOptions = exports2.ConnectionStrategy = exports2.AbstractMessageBuffer = exports2.WriteableStreamMessageWriter = exports2.AbstractMessageWriter = exports2.MessageWriter = exports2.ReadableStreamMessageReader = exports2.AbstractMessageReader = exports2.MessageReader = exports2.SharedArrayReceiverStrategy = exports2.SharedArraySenderStrategy = exports2.CancellationToken = exports2.CancellationTokenSource = exports2.Emitter = exports2.Event = exports2.Disposable = exports2.LRUCache = exports2.Touch = exports2.LinkedMap = exports2.ParameterStructures = exports2.NotificationType9 = exports2.NotificationType8 = exports2.NotificationType7 = exports2.NotificationType6 = exports2.NotificationType5 = exports2.NotificationType4 = exports2.NotificationType3 = exports2.NotificationType2 = exports2.NotificationType1 = exports2.NotificationType0 = exports2.NotificationType = exports2.ErrorCodes = exports2.ResponseError = exports2.RequestType9 = exports2.RequestType8 = exports2.RequestType7 = exports2.RequestType6 = exports2.RequestType5 = exports2.RequestType4 = exports2.RequestType3 = exports2.RequestType2 = exports2.RequestType1 = exports2.RequestType0 = exports2.RequestType = exports2.Message = exports2.RAL = void 0;
    exports2.MessageStrategy = exports2.CancellationStrategy = exports2.CancellationSenderStrategy = exports2.CancellationReceiverStrategy = exports2.ConnectionError = exports2.ConnectionErrors = exports2.LogTraceNotification = exports2.SetTraceNotification = exports2.TraceFormat = exports2.TraceValues = exports2.Trace = void 0;
    var messages_1 = require_messages();
    Object.defineProperty(exports2, "Message", { enumerable: true, get: function() {
      return messages_1.Message;
    } });
    Object.defineProperty(exports2, "RequestType", { enumerable: true, get: function() {
      return messages_1.RequestType;
    } });
    Object.defineProperty(exports2, "RequestType0", { enumerable: true, get: function() {
      return messages_1.RequestType0;
    } });
    Object.defineProperty(exports2, "RequestType1", { enumerable: true, get: function() {
      return messages_1.RequestType1;
    } });
    Object.defineProperty(exports2, "RequestType2", { enumerable: true, get: function() {
      return messages_1.RequestType2;
    } });
    Object.defineProperty(exports2, "RequestType3", { enumerable: true, get: function() {
      return messages_1.RequestType3;
    } });
    Object.defineProperty(exports2, "RequestType4", { enumerable: true, get: function() {
      return messages_1.RequestType4;
    } });
    Object.defineProperty(exports2, "RequestType5", { enumerable: true, get: function() {
      return messages_1.RequestType5;
    } });
    Object.defineProperty(exports2, "RequestType6", { enumerable: true, get: function() {
      return messages_1.RequestType6;
    } });
    Object.defineProperty(exports2, "RequestType7", { enumerable: true, get: function() {
      return messages_1.RequestType7;
    } });
    Object.defineProperty(exports2, "RequestType8", { enumerable: true, get: function() {
      return messages_1.RequestType8;
    } });
    Object.defineProperty(exports2, "RequestType9", { enumerable: true, get: function() {
      return messages_1.RequestType9;
    } });
    Object.defineProperty(exports2, "ResponseError", { enumerable: true, get: function() {
      return messages_1.ResponseError;
    } });
    Object.defineProperty(exports2, "ErrorCodes", { enumerable: true, get: function() {
      return messages_1.ErrorCodes;
    } });
    Object.defineProperty(exports2, "NotificationType", { enumerable: true, get: function() {
      return messages_1.NotificationType;
    } });
    Object.defineProperty(exports2, "NotificationType0", { enumerable: true, get: function() {
      return messages_1.NotificationType0;
    } });
    Object.defineProperty(exports2, "NotificationType1", { enumerable: true, get: function() {
      return messages_1.NotificationType1;
    } });
    Object.defineProperty(exports2, "NotificationType2", { enumerable: true, get: function() {
      return messages_1.NotificationType2;
    } });
    Object.defineProperty(exports2, "NotificationType3", { enumerable: true, get: function() {
      return messages_1.NotificationType3;
    } });
    Object.defineProperty(exports2, "NotificationType4", { enumerable: true, get: function() {
      return messages_1.NotificationType4;
    } });
    Object.defineProperty(exports2, "NotificationType5", { enumerable: true, get: function() {
      return messages_1.NotificationType5;
    } });
    Object.defineProperty(exports2, "NotificationType6", { enumerable: true, get: function() {
      return messages_1.NotificationType6;
    } });
    Object.defineProperty(exports2, "NotificationType7", { enumerable: true, get: function() {
      return messages_1.NotificationType7;
    } });
    Object.defineProperty(exports2, "NotificationType8", { enumerable: true, get: function() {
      return messages_1.NotificationType8;
    } });
    Object.defineProperty(exports2, "NotificationType9", { enumerable: true, get: function() {
      return messages_1.NotificationType9;
    } });
    Object.defineProperty(exports2, "ParameterStructures", { enumerable: true, get: function() {
      return messages_1.ParameterStructures;
    } });
    var linkedMap_1 = require_linkedMap();
    Object.defineProperty(exports2, "LinkedMap", { enumerable: true, get: function() {
      return linkedMap_1.LinkedMap;
    } });
    Object.defineProperty(exports2, "LRUCache", { enumerable: true, get: function() {
      return linkedMap_1.LRUCache;
    } });
    Object.defineProperty(exports2, "Touch", { enumerable: true, get: function() {
      return linkedMap_1.Touch;
    } });
    var disposable_1 = require_disposable();
    Object.defineProperty(exports2, "Disposable", { enumerable: true, get: function() {
      return disposable_1.Disposable;
    } });
    var events_1 = require_events();
    Object.defineProperty(exports2, "Event", { enumerable: true, get: function() {
      return events_1.Event;
    } });
    Object.defineProperty(exports2, "Emitter", { enumerable: true, get: function() {
      return events_1.Emitter;
    } });
    var cancellation_1 = require_cancellation();
    Object.defineProperty(exports2, "CancellationTokenSource", { enumerable: true, get: function() {
      return cancellation_1.CancellationTokenSource;
    } });
    Object.defineProperty(exports2, "CancellationToken", { enumerable: true, get: function() {
      return cancellation_1.CancellationToken;
    } });
    var sharedArrayCancellation_1 = require_sharedArrayCancellation();
    Object.defineProperty(exports2, "SharedArraySenderStrategy", { enumerable: true, get: function() {
      return sharedArrayCancellation_1.SharedArraySenderStrategy;
    } });
    Object.defineProperty(exports2, "SharedArrayReceiverStrategy", { enumerable: true, get: function() {
      return sharedArrayCancellation_1.SharedArrayReceiverStrategy;
    } });
    var messageReader_1 = require_messageReader();
    Object.defineProperty(exports2, "MessageReader", { enumerable: true, get: function() {
      return messageReader_1.MessageReader;
    } });
    Object.defineProperty(exports2, "AbstractMessageReader", { enumerable: true, get: function() {
      return messageReader_1.AbstractMessageReader;
    } });
    Object.defineProperty(exports2, "ReadableStreamMessageReader", { enumerable: true, get: function() {
      return messageReader_1.ReadableStreamMessageReader;
    } });
    var messageWriter_1 = require_messageWriter();
    Object.defineProperty(exports2, "MessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.MessageWriter;
    } });
    Object.defineProperty(exports2, "AbstractMessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.AbstractMessageWriter;
    } });
    Object.defineProperty(exports2, "WriteableStreamMessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.WriteableStreamMessageWriter;
    } });
    var messageBuffer_1 = require_messageBuffer();
    Object.defineProperty(exports2, "AbstractMessageBuffer", { enumerable: true, get: function() {
      return messageBuffer_1.AbstractMessageBuffer;
    } });
    var connection_1 = require_connection();
    Object.defineProperty(exports2, "ConnectionStrategy", { enumerable: true, get: function() {
      return connection_1.ConnectionStrategy;
    } });
    Object.defineProperty(exports2, "ConnectionOptions", { enumerable: true, get: function() {
      return connection_1.ConnectionOptions;
    } });
    Object.defineProperty(exports2, "NullLogger", { enumerable: true, get: function() {
      return connection_1.NullLogger;
    } });
    Object.defineProperty(exports2, "createMessageConnection", { enumerable: true, get: function() {
      return connection_1.createMessageConnection;
    } });
    Object.defineProperty(exports2, "ProgressToken", { enumerable: true, get: function() {
      return connection_1.ProgressToken;
    } });
    Object.defineProperty(exports2, "ProgressType", { enumerable: true, get: function() {
      return connection_1.ProgressType;
    } });
    Object.defineProperty(exports2, "Trace", { enumerable: true, get: function() {
      return connection_1.Trace;
    } });
    Object.defineProperty(exports2, "TraceValues", { enumerable: true, get: function() {
      return connection_1.TraceValues;
    } });
    Object.defineProperty(exports2, "TraceFormat", { enumerable: true, get: function() {
      return connection_1.TraceFormat;
    } });
    Object.defineProperty(exports2, "SetTraceNotification", { enumerable: true, get: function() {
      return connection_1.SetTraceNotification;
    } });
    Object.defineProperty(exports2, "LogTraceNotification", { enumerable: true, get: function() {
      return connection_1.LogTraceNotification;
    } });
    Object.defineProperty(exports2, "ConnectionErrors", { enumerable: true, get: function() {
      return connection_1.ConnectionErrors;
    } });
    Object.defineProperty(exports2, "ConnectionError", { enumerable: true, get: function() {
      return connection_1.ConnectionError;
    } });
    Object.defineProperty(exports2, "CancellationReceiverStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationReceiverStrategy;
    } });
    Object.defineProperty(exports2, "CancellationSenderStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationSenderStrategy;
    } });
    Object.defineProperty(exports2, "CancellationStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationStrategy;
    } });
    Object.defineProperty(exports2, "MessageStrategy", { enumerable: true, get: function() {
      return connection_1.MessageStrategy;
    } });
    var ral_1 = require_ral();
    exports2.RAL = ral_1.default;
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/node/ril.js
var require_ril = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/node/ril.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var util_1 = require("util");
    var api_1 = require_api();
    var MessageBuffer = class _MessageBuffer extends api_1.AbstractMessageBuffer {
      constructor(encoding = "utf-8") {
        super(encoding);
      }
      emptyBuffer() {
        return _MessageBuffer.emptyBuffer;
      }
      fromString(value, encoding) {
        return Buffer.from(value, encoding);
      }
      toString(value, encoding) {
        if (value instanceof Buffer) {
          return value.toString(encoding);
        } else {
          return new util_1.TextDecoder(encoding).decode(value);
        }
      }
      asNative(buffer, length) {
        if (length === void 0) {
          return buffer instanceof Buffer ? buffer : Buffer.from(buffer);
        } else {
          return buffer instanceof Buffer ? buffer.slice(0, length) : Buffer.from(buffer, 0, length);
        }
      }
      allocNative(length) {
        return Buffer.allocUnsafe(length);
      }
    };
    MessageBuffer.emptyBuffer = Buffer.allocUnsafe(0);
    var ReadableStreamWrapper = class {
      constructor(stream) {
        this.stream = stream;
      }
      onClose(listener) {
        this.stream.on("close", listener);
        return api_1.Disposable.create(() => this.stream.off("close", listener));
      }
      onError(listener) {
        this.stream.on("error", listener);
        return api_1.Disposable.create(() => this.stream.off("error", listener));
      }
      onEnd(listener) {
        this.stream.on("end", listener);
        return api_1.Disposable.create(() => this.stream.off("end", listener));
      }
      onData(listener) {
        this.stream.on("data", listener);
        return api_1.Disposable.create(() => this.stream.off("data", listener));
      }
    };
    var WritableStreamWrapper = class {
      constructor(stream) {
        this.stream = stream;
      }
      onClose(listener) {
        this.stream.on("close", listener);
        return api_1.Disposable.create(() => this.stream.off("close", listener));
      }
      onError(listener) {
        this.stream.on("error", listener);
        return api_1.Disposable.create(() => this.stream.off("error", listener));
      }
      onEnd(listener) {
        this.stream.on("end", listener);
        return api_1.Disposable.create(() => this.stream.off("end", listener));
      }
      write(data, encoding) {
        return new Promise((resolve, reject) => {
          const callback = (error) => {
            if (error === void 0 || error === null) {
              resolve();
            } else {
              reject(error);
            }
          };
          if (typeof data === "string") {
            this.stream.write(data, encoding, callback);
          } else {
            this.stream.write(data, callback);
          }
        });
      }
      end() {
        this.stream.end();
      }
    };
    var _ril = Object.freeze({
      messageBuffer: Object.freeze({
        create: (encoding) => new MessageBuffer(encoding)
      }),
      applicationJson: Object.freeze({
        encoder: Object.freeze({
          name: "application/json",
          encode: (msg, options) => {
            try {
              return Promise.resolve(Buffer.from(JSON.stringify(msg, void 0, 0), options.charset));
            } catch (err) {
              return Promise.reject(err);
            }
          }
        }),
        decoder: Object.freeze({
          name: "application/json",
          decode: (buffer, options) => {
            try {
              if (buffer instanceof Buffer) {
                return Promise.resolve(JSON.parse(buffer.toString(options.charset)));
              } else {
                return Promise.resolve(JSON.parse(new util_1.TextDecoder(options.charset).decode(buffer)));
              }
            } catch (err) {
              return Promise.reject(err);
            }
          }
        })
      }),
      stream: Object.freeze({
        asReadableStream: (stream) => new ReadableStreamWrapper(stream),
        asWritableStream: (stream) => new WritableStreamWrapper(stream)
      }),
      console,
      timer: Object.freeze({
        setTimeout(callback, ms, ...args) {
          const handle = setTimeout(callback, ms, ...args);
          return { dispose: () => clearTimeout(handle) };
        },
        setImmediate(callback, ...args) {
          const handle = setImmediate(callback, ...args);
          return { dispose: () => clearImmediate(handle) };
        },
        setInterval(callback, ms, ...args) {
          const handle = setInterval(callback, ms, ...args);
          return { dispose: () => clearInterval(handle) };
        }
      })
    });
    function RIL() {
      return _ril;
    }
    (function(RIL2) {
      function install() {
        api_1.RAL.install(_ril);
      }
      RIL2.install = install;
    })(RIL || (RIL = {}));
    exports2.default = RIL;
  }
});

// ../lsp/node_modules/vscode-jsonrpc/lib/node/main.js
var require_main = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/lib/node/main.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createMessageConnection = exports2.createServerSocketTransport = exports2.createClientSocketTransport = exports2.createServerPipeTransport = exports2.createClientPipeTransport = exports2.generateRandomPipeName = exports2.StreamMessageWriter = exports2.StreamMessageReader = exports2.SocketMessageWriter = exports2.SocketMessageReader = exports2.PortMessageWriter = exports2.PortMessageReader = exports2.IPCMessageWriter = exports2.IPCMessageReader = void 0;
    var ril_1 = require_ril();
    ril_1.default.install();
    var path = require("path");
    var os = require("os");
    var crypto_1 = require("crypto");
    var net_1 = require("net");
    var api_1 = require_api();
    __exportStar(require_api(), exports2);
    var IPCMessageReader = class extends api_1.AbstractMessageReader {
      constructor(process2) {
        super();
        this.process = process2;
        let eventEmitter = this.process;
        eventEmitter.on("error", (error) => this.fireError(error));
        eventEmitter.on("close", () => this.fireClose());
      }
      listen(callback) {
        this.process.on("message", callback);
        return api_1.Disposable.create(() => this.process.off("message", callback));
      }
    };
    exports2.IPCMessageReader = IPCMessageReader;
    var IPCMessageWriter = class extends api_1.AbstractMessageWriter {
      constructor(process2) {
        super();
        this.process = process2;
        this.errorCount = 0;
        const eventEmitter = this.process;
        eventEmitter.on("error", (error) => this.fireError(error));
        eventEmitter.on("close", () => this.fireClose);
      }
      write(msg) {
        try {
          if (typeof this.process.send === "function") {
            this.process.send(msg, void 0, void 0, (error) => {
              if (error) {
                this.errorCount++;
                this.handleError(error, msg);
              } else {
                this.errorCount = 0;
              }
            });
          }
          return Promise.resolve();
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
      }
    };
    exports2.IPCMessageWriter = IPCMessageWriter;
    var PortMessageReader = class extends api_1.AbstractMessageReader {
      constructor(port) {
        super();
        this.onData = new api_1.Emitter();
        port.on("close", () => this.fireClose);
        port.on("error", (error) => this.fireError(error));
        port.on("message", (message) => {
          this.onData.fire(message);
        });
      }
      listen(callback) {
        return this.onData.event(callback);
      }
    };
    exports2.PortMessageReader = PortMessageReader;
    var PortMessageWriter = class extends api_1.AbstractMessageWriter {
      constructor(port) {
        super();
        this.port = port;
        this.errorCount = 0;
        port.on("close", () => this.fireClose());
        port.on("error", (error) => this.fireError(error));
      }
      write(msg) {
        try {
          this.port.postMessage(msg);
          return Promise.resolve();
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
      }
    };
    exports2.PortMessageWriter = PortMessageWriter;
    var SocketMessageReader = class extends api_1.ReadableStreamMessageReader {
      constructor(socket, encoding = "utf-8") {
        super((0, ril_1.default)().stream.asReadableStream(socket), encoding);
      }
    };
    exports2.SocketMessageReader = SocketMessageReader;
    var SocketMessageWriter = class extends api_1.WriteableStreamMessageWriter {
      constructor(socket, options) {
        super((0, ril_1.default)().stream.asWritableStream(socket), options);
        this.socket = socket;
      }
      dispose() {
        super.dispose();
        this.socket.destroy();
      }
    };
    exports2.SocketMessageWriter = SocketMessageWriter;
    var StreamMessageReader = class extends api_1.ReadableStreamMessageReader {
      constructor(readable, encoding) {
        super((0, ril_1.default)().stream.asReadableStream(readable), encoding);
      }
    };
    exports2.StreamMessageReader = StreamMessageReader;
    var StreamMessageWriter = class extends api_1.WriteableStreamMessageWriter {
      constructor(writable, options) {
        super((0, ril_1.default)().stream.asWritableStream(writable), options);
      }
    };
    exports2.StreamMessageWriter = StreamMessageWriter;
    var XDG_RUNTIME_DIR = process.env["XDG_RUNTIME_DIR"];
    var safeIpcPathLengths = /* @__PURE__ */ new Map([
      ["linux", 107],
      ["darwin", 103]
    ]);
    function generateRandomPipeName() {
      const randomSuffix = (0, crypto_1.randomBytes)(21).toString("hex");
      if (process.platform === "win32") {
        return `\\\\.\\pipe\\vscode-jsonrpc-${randomSuffix}-sock`;
      }
      let result;
      if (XDG_RUNTIME_DIR) {
        result = path.join(XDG_RUNTIME_DIR, `vscode-ipc-${randomSuffix}.sock`);
      } else {
        result = path.join(os.tmpdir(), `vscode-${randomSuffix}.sock`);
      }
      const limit = safeIpcPathLengths.get(process.platform);
      if (limit !== void 0 && result.length > limit) {
        (0, ril_1.default)().console.warn(`WARNING: IPC handle "${result}" is longer than ${limit} characters.`);
      }
      return result;
    }
    exports2.generateRandomPipeName = generateRandomPipeName;
    function createClientPipeTransport(pipeName, encoding = "utf-8") {
      let connectResolve;
      const connected = new Promise((resolve, _reject) => {
        connectResolve = resolve;
      });
      return new Promise((resolve, reject) => {
        let server = (0, net_1.createServer)((socket) => {
          server.close();
          connectResolve([
            new SocketMessageReader(socket, encoding),
            new SocketMessageWriter(socket, encoding)
          ]);
        });
        server.on("error", reject);
        server.listen(pipeName, () => {
          server.removeListener("error", reject);
          resolve({
            onConnected: () => {
              return connected;
            }
          });
        });
      });
    }
    exports2.createClientPipeTransport = createClientPipeTransport;
    function createServerPipeTransport(pipeName, encoding = "utf-8") {
      const socket = (0, net_1.createConnection)(pipeName);
      return [
        new SocketMessageReader(socket, encoding),
        new SocketMessageWriter(socket, encoding)
      ];
    }
    exports2.createServerPipeTransport = createServerPipeTransport;
    function createClientSocketTransport(port, encoding = "utf-8") {
      let connectResolve;
      const connected = new Promise((resolve, _reject) => {
        connectResolve = resolve;
      });
      return new Promise((resolve, reject) => {
        const server = (0, net_1.createServer)((socket) => {
          server.close();
          connectResolve([
            new SocketMessageReader(socket, encoding),
            new SocketMessageWriter(socket, encoding)
          ]);
        });
        server.on("error", reject);
        server.listen(port, "127.0.0.1", () => {
          server.removeListener("error", reject);
          resolve({
            onConnected: () => {
              return connected;
            }
          });
        });
      });
    }
    exports2.createClientSocketTransport = createClientSocketTransport;
    function createServerSocketTransport(port, encoding = "utf-8") {
      const socket = (0, net_1.createConnection)(port, "127.0.0.1");
      return [
        new SocketMessageReader(socket, encoding),
        new SocketMessageWriter(socket, encoding)
      ];
    }
    exports2.createServerSocketTransport = createServerSocketTransport;
    function isReadableStream(value) {
      const candidate = value;
      return candidate.read !== void 0 && candidate.addListener !== void 0;
    }
    function isWritableStream(value) {
      const candidate = value;
      return candidate.write !== void 0 && candidate.addListener !== void 0;
    }
    function createMessageConnection(input, output, logger, options) {
      if (!logger) {
        logger = api_1.NullLogger;
      }
      const reader = isReadableStream(input) ? new StreamMessageReader(input) : input;
      const writer = isWritableStream(output) ? new StreamMessageWriter(output) : output;
      if (api_1.ConnectionStrategy.is(options)) {
        options = { connectionStrategy: options };
      }
      return (0, api_1.createMessageConnection)(reader, writer, logger, options);
    }
    exports2.createMessageConnection = createMessageConnection;
  }
});

// ../lsp/node_modules/vscode-jsonrpc/node.js
var require_node = __commonJS({
  "../lsp/node_modules/vscode-jsonrpc/node.js"(exports2, module2) {
    "use strict";
    module2.exports = require_main();
  }
});

// ../lsp/node_modules/vscode-languageserver-types/lib/umd/main.js
var require_main2 = __commonJS({
  "../lsp/node_modules/vscode-languageserver-types/lib/umd/main.js"(exports2, module2) {
    (function(factory) {
      if (typeof module2 === "object" && typeof module2.exports === "object") {
        var v = factory(require, exports2);
        if (v !== void 0) module2.exports = v;
      } else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
      }
    })(function(require2, exports3) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", { value: true });
      exports3.TextDocument = exports3.EOL = exports3.WorkspaceFolder = exports3.InlineCompletionContext = exports3.SelectedCompletionInfo = exports3.InlineCompletionTriggerKind = exports3.InlineCompletionList = exports3.InlineCompletionItem = exports3.StringValue = exports3.InlayHint = exports3.InlayHintLabelPart = exports3.InlayHintKind = exports3.InlineValueContext = exports3.InlineValueEvaluatableExpression = exports3.InlineValueVariableLookup = exports3.InlineValueText = exports3.SemanticTokens = exports3.SemanticTokenModifiers = exports3.SemanticTokenTypes = exports3.SelectionRange = exports3.DocumentLink = exports3.FormattingOptions = exports3.CodeLens = exports3.CodeAction = exports3.CodeActionContext = exports3.CodeActionTriggerKind = exports3.CodeActionKind = exports3.DocumentSymbol = exports3.WorkspaceSymbol = exports3.SymbolInformation = exports3.SymbolTag = exports3.SymbolKind = exports3.DocumentHighlight = exports3.DocumentHighlightKind = exports3.SignatureInformation = exports3.ParameterInformation = exports3.Hover = exports3.MarkedString = exports3.CompletionList = exports3.CompletionItem = exports3.CompletionItemLabelDetails = exports3.InsertTextMode = exports3.InsertReplaceEdit = exports3.CompletionItemTag = exports3.InsertTextFormat = exports3.CompletionItemKind = exports3.MarkupContent = exports3.MarkupKind = exports3.TextDocumentItem = exports3.OptionalVersionedTextDocumentIdentifier = exports3.VersionedTextDocumentIdentifier = exports3.TextDocumentIdentifier = exports3.WorkspaceChange = exports3.WorkspaceEdit = exports3.DeleteFile = exports3.RenameFile = exports3.CreateFile = exports3.TextDocumentEdit = exports3.AnnotatedTextEdit = exports3.ChangeAnnotationIdentifier = exports3.ChangeAnnotation = exports3.TextEdit = exports3.Command = exports3.Diagnostic = exports3.CodeDescription = exports3.DiagnosticTag = exports3.DiagnosticSeverity = exports3.DiagnosticRelatedInformation = exports3.FoldingRange = exports3.FoldingRangeKind = exports3.ColorPresentation = exports3.ColorInformation = exports3.Color = exports3.LocationLink = exports3.Location = exports3.Range = exports3.Position = exports3.uinteger = exports3.integer = exports3.URI = exports3.DocumentUri = void 0;
      var DocumentUri;
      (function(DocumentUri2) {
        function is(value) {
          return typeof value === "string";
        }
        DocumentUri2.is = is;
      })(DocumentUri || (exports3.DocumentUri = DocumentUri = {}));
      var URI;
      (function(URI2) {
        function is(value) {
          return typeof value === "string";
        }
        URI2.is = is;
      })(URI || (exports3.URI = URI = {}));
      var integer;
      (function(integer2) {
        integer2.MIN_VALUE = -2147483648;
        integer2.MAX_VALUE = 2147483647;
        function is(value) {
          return typeof value === "number" && integer2.MIN_VALUE <= value && value <= integer2.MAX_VALUE;
        }
        integer2.is = is;
      })(integer || (exports3.integer = integer = {}));
      var uinteger;
      (function(uinteger2) {
        uinteger2.MIN_VALUE = 0;
        uinteger2.MAX_VALUE = 2147483647;
        function is(value) {
          return typeof value === "number" && uinteger2.MIN_VALUE <= value && value <= uinteger2.MAX_VALUE;
        }
        uinteger2.is = is;
      })(uinteger || (exports3.uinteger = uinteger = {}));
      var Position;
      (function(Position2) {
        function create(line, character) {
          if (line === Number.MAX_VALUE) {
            line = uinteger.MAX_VALUE;
          }
          if (character === Number.MAX_VALUE) {
            character = uinteger.MAX_VALUE;
          }
          return { line, character };
        }
        Position2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.uinteger(candidate.line) && Is.uinteger(candidate.character);
        }
        Position2.is = is;
      })(Position || (exports3.Position = Position = {}));
      var Range;
      (function(Range2) {
        function create(one, two, three, four) {
          if (Is.uinteger(one) && Is.uinteger(two) && Is.uinteger(three) && Is.uinteger(four)) {
            return { start: Position.create(one, two), end: Position.create(three, four) };
          } else if (Position.is(one) && Position.is(two)) {
            return { start: one, end: two };
          } else {
            throw new Error("Range#create called with invalid arguments[".concat(one, ", ").concat(two, ", ").concat(three, ", ").concat(four, "]"));
          }
        }
        Range2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Position.is(candidate.start) && Position.is(candidate.end);
        }
        Range2.is = is;
      })(Range || (exports3.Range = Range = {}));
      var Location2;
      (function(Location3) {
        function create(uri, range) {
          return { uri, range };
        }
        Location3.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Range.is(candidate.range) && (Is.string(candidate.uri) || Is.undefined(candidate.uri));
        }
        Location3.is = is;
      })(Location2 || (exports3.Location = Location2 = {}));
      var LocationLink;
      (function(LocationLink2) {
        function create(targetUri, targetRange, targetSelectionRange, originSelectionRange) {
          return { targetUri, targetRange, targetSelectionRange, originSelectionRange };
        }
        LocationLink2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Range.is(candidate.targetRange) && Is.string(candidate.targetUri) && Range.is(candidate.targetSelectionRange) && (Range.is(candidate.originSelectionRange) || Is.undefined(candidate.originSelectionRange));
        }
        LocationLink2.is = is;
      })(LocationLink || (exports3.LocationLink = LocationLink = {}));
      var Color;
      (function(Color2) {
        function create(red, green, blue, alpha) {
          return {
            red,
            green,
            blue,
            alpha
          };
        }
        Color2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.numberRange(candidate.red, 0, 1) && Is.numberRange(candidate.green, 0, 1) && Is.numberRange(candidate.blue, 0, 1) && Is.numberRange(candidate.alpha, 0, 1);
        }
        Color2.is = is;
      })(Color || (exports3.Color = Color = {}));
      var ColorInformation;
      (function(ColorInformation2) {
        function create(range, color) {
          return {
            range,
            color
          };
        }
        ColorInformation2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Range.is(candidate.range) && Color.is(candidate.color);
        }
        ColorInformation2.is = is;
      })(ColorInformation || (exports3.ColorInformation = ColorInformation = {}));
      var ColorPresentation;
      (function(ColorPresentation2) {
        function create(label, textEdit, additionalTextEdits) {
          return {
            label,
            textEdit,
            additionalTextEdits
          };
        }
        ColorPresentation2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.undefined(candidate.textEdit) || TextEdit.is(candidate)) && (Is.undefined(candidate.additionalTextEdits) || Is.typedArray(candidate.additionalTextEdits, TextEdit.is));
        }
        ColorPresentation2.is = is;
      })(ColorPresentation || (exports3.ColorPresentation = ColorPresentation = {}));
      var FoldingRangeKind;
      (function(FoldingRangeKind2) {
        FoldingRangeKind2.Comment = "comment";
        FoldingRangeKind2.Imports = "imports";
        FoldingRangeKind2.Region = "region";
      })(FoldingRangeKind || (exports3.FoldingRangeKind = FoldingRangeKind = {}));
      var FoldingRange;
      (function(FoldingRange2) {
        function create(startLine, endLine, startCharacter, endCharacter, kind, collapsedText) {
          var result = {
            startLine,
            endLine
          };
          if (Is.defined(startCharacter)) {
            result.startCharacter = startCharacter;
          }
          if (Is.defined(endCharacter)) {
            result.endCharacter = endCharacter;
          }
          if (Is.defined(kind)) {
            result.kind = kind;
          }
          if (Is.defined(collapsedText)) {
            result.collapsedText = collapsedText;
          }
          return result;
        }
        FoldingRange2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.uinteger(candidate.startLine) && Is.uinteger(candidate.startLine) && (Is.undefined(candidate.startCharacter) || Is.uinteger(candidate.startCharacter)) && (Is.undefined(candidate.endCharacter) || Is.uinteger(candidate.endCharacter)) && (Is.undefined(candidate.kind) || Is.string(candidate.kind));
        }
        FoldingRange2.is = is;
      })(FoldingRange || (exports3.FoldingRange = FoldingRange = {}));
      var DiagnosticRelatedInformation;
      (function(DiagnosticRelatedInformation2) {
        function create(location, message) {
          return {
            location,
            message
          };
        }
        DiagnosticRelatedInformation2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Location2.is(candidate.location) && Is.string(candidate.message);
        }
        DiagnosticRelatedInformation2.is = is;
      })(DiagnosticRelatedInformation || (exports3.DiagnosticRelatedInformation = DiagnosticRelatedInformation = {}));
      var DiagnosticSeverity2;
      (function(DiagnosticSeverity3) {
        DiagnosticSeverity3.Error = 1;
        DiagnosticSeverity3.Warning = 2;
        DiagnosticSeverity3.Information = 3;
        DiagnosticSeverity3.Hint = 4;
      })(DiagnosticSeverity2 || (exports3.DiagnosticSeverity = DiagnosticSeverity2 = {}));
      var DiagnosticTag;
      (function(DiagnosticTag2) {
        DiagnosticTag2.Unnecessary = 1;
        DiagnosticTag2.Deprecated = 2;
      })(DiagnosticTag || (exports3.DiagnosticTag = DiagnosticTag = {}));
      var CodeDescription;
      (function(CodeDescription2) {
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.string(candidate.href);
        }
        CodeDescription2.is = is;
      })(CodeDescription || (exports3.CodeDescription = CodeDescription = {}));
      var Diagnostic3;
      (function(Diagnostic4) {
        function create(range, message, severity, code2, source, relatedInformation) {
          var result = { range, message };
          if (Is.defined(severity)) {
            result.severity = severity;
          }
          if (Is.defined(code2)) {
            result.code = code2;
          }
          if (Is.defined(source)) {
            result.source = source;
          }
          if (Is.defined(relatedInformation)) {
            result.relatedInformation = relatedInformation;
          }
          return result;
        }
        Diagnostic4.create = create;
        function is(value) {
          var _a;
          var candidate = value;
          return Is.defined(candidate) && Range.is(candidate.range) && Is.string(candidate.message) && (Is.number(candidate.severity) || Is.undefined(candidate.severity)) && (Is.integer(candidate.code) || Is.string(candidate.code) || Is.undefined(candidate.code)) && (Is.undefined(candidate.codeDescription) || Is.string((_a = candidate.codeDescription) === null || _a === void 0 ? void 0 : _a.href)) && (Is.string(candidate.source) || Is.undefined(candidate.source)) && (Is.undefined(candidate.relatedInformation) || Is.typedArray(candidate.relatedInformation, DiagnosticRelatedInformation.is));
        }
        Diagnostic4.is = is;
      })(Diagnostic3 || (exports3.Diagnostic = Diagnostic3 = {}));
      var Command;
      (function(Command2) {
        function create(title, command) {
          var args = [];
          for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
          }
          var result = { title, command };
          if (Is.defined(args) && args.length > 0) {
            result.arguments = args;
          }
          return result;
        }
        Command2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.title) && Is.string(candidate.command);
        }
        Command2.is = is;
      })(Command || (exports3.Command = Command = {}));
      var TextEdit;
      (function(TextEdit2) {
        function replace(range, newText) {
          return { range, newText };
        }
        TextEdit2.replace = replace;
        function insert(position, newText) {
          return { range: { start: position, end: position }, newText };
        }
        TextEdit2.insert = insert;
        function del(range) {
          return { range, newText: "" };
        }
        TextEdit2.del = del;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.string(candidate.newText) && Range.is(candidate.range);
        }
        TextEdit2.is = is;
      })(TextEdit || (exports3.TextEdit = TextEdit = {}));
      var ChangeAnnotation;
      (function(ChangeAnnotation2) {
        function create(label, needsConfirmation, description) {
          var result = { label };
          if (needsConfirmation !== void 0) {
            result.needsConfirmation = needsConfirmation;
          }
          if (description !== void 0) {
            result.description = description;
          }
          return result;
        }
        ChangeAnnotation2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.boolean(candidate.needsConfirmation) || candidate.needsConfirmation === void 0) && (Is.string(candidate.description) || candidate.description === void 0);
        }
        ChangeAnnotation2.is = is;
      })(ChangeAnnotation || (exports3.ChangeAnnotation = ChangeAnnotation = {}));
      var ChangeAnnotationIdentifier;
      (function(ChangeAnnotationIdentifier2) {
        function is(value) {
          var candidate = value;
          return Is.string(candidate);
        }
        ChangeAnnotationIdentifier2.is = is;
      })(ChangeAnnotationIdentifier || (exports3.ChangeAnnotationIdentifier = ChangeAnnotationIdentifier = {}));
      var AnnotatedTextEdit;
      (function(AnnotatedTextEdit2) {
        function replace(range, newText, annotation) {
          return { range, newText, annotationId: annotation };
        }
        AnnotatedTextEdit2.replace = replace;
        function insert(position, newText, annotation) {
          return { range: { start: position, end: position }, newText, annotationId: annotation };
        }
        AnnotatedTextEdit2.insert = insert;
        function del(range, annotation) {
          return { range, newText: "", annotationId: annotation };
        }
        AnnotatedTextEdit2.del = del;
        function is(value) {
          var candidate = value;
          return TextEdit.is(candidate) && (ChangeAnnotation.is(candidate.annotationId) || ChangeAnnotationIdentifier.is(candidate.annotationId));
        }
        AnnotatedTextEdit2.is = is;
      })(AnnotatedTextEdit || (exports3.AnnotatedTextEdit = AnnotatedTextEdit = {}));
      var TextDocumentEdit;
      (function(TextDocumentEdit2) {
        function create(textDocument, edits) {
          return { textDocument, edits };
        }
        TextDocumentEdit2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && OptionalVersionedTextDocumentIdentifier.is(candidate.textDocument) && Array.isArray(candidate.edits);
        }
        TextDocumentEdit2.is = is;
      })(TextDocumentEdit || (exports3.TextDocumentEdit = TextDocumentEdit = {}));
      var CreateFile;
      (function(CreateFile2) {
        function create(uri, options, annotation) {
          var result = {
            kind: "create",
            uri
          };
          if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
            result.options = options;
          }
          if (annotation !== void 0) {
            result.annotationId = annotation;
          }
          return result;
        }
        CreateFile2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && candidate.kind === "create" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
        }
        CreateFile2.is = is;
      })(CreateFile || (exports3.CreateFile = CreateFile = {}));
      var RenameFile;
      (function(RenameFile2) {
        function create(oldUri, newUri, options, annotation) {
          var result = {
            kind: "rename",
            oldUri,
            newUri
          };
          if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
            result.options = options;
          }
          if (annotation !== void 0) {
            result.annotationId = annotation;
          }
          return result;
        }
        RenameFile2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && candidate.kind === "rename" && Is.string(candidate.oldUri) && Is.string(candidate.newUri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
        }
        RenameFile2.is = is;
      })(RenameFile || (exports3.RenameFile = RenameFile = {}));
      var DeleteFile;
      (function(DeleteFile2) {
        function create(uri, options, annotation) {
          var result = {
            kind: "delete",
            uri
          };
          if (options !== void 0 && (options.recursive !== void 0 || options.ignoreIfNotExists !== void 0)) {
            result.options = options;
          }
          if (annotation !== void 0) {
            result.annotationId = annotation;
          }
          return result;
        }
        DeleteFile2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && candidate.kind === "delete" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.recursive === void 0 || Is.boolean(candidate.options.recursive)) && (candidate.options.ignoreIfNotExists === void 0 || Is.boolean(candidate.options.ignoreIfNotExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
        }
        DeleteFile2.is = is;
      })(DeleteFile || (exports3.DeleteFile = DeleteFile = {}));
      var WorkspaceEdit;
      (function(WorkspaceEdit2) {
        function is(value) {
          var candidate = value;
          return candidate && (candidate.changes !== void 0 || candidate.documentChanges !== void 0) && (candidate.documentChanges === void 0 || candidate.documentChanges.every(function(change) {
            if (Is.string(change.kind)) {
              return CreateFile.is(change) || RenameFile.is(change) || DeleteFile.is(change);
            } else {
              return TextDocumentEdit.is(change);
            }
          }));
        }
        WorkspaceEdit2.is = is;
      })(WorkspaceEdit || (exports3.WorkspaceEdit = WorkspaceEdit = {}));
      var TextEditChangeImpl = (
        /** @class */
        (function() {
          function TextEditChangeImpl2(edits, changeAnnotations) {
            this.edits = edits;
            this.changeAnnotations = changeAnnotations;
          }
          TextEditChangeImpl2.prototype.insert = function(position, newText, annotation) {
            var edit;
            var id;
            if (annotation === void 0) {
              edit = TextEdit.insert(position, newText);
            } else if (ChangeAnnotationIdentifier.is(annotation)) {
              id = annotation;
              edit = AnnotatedTextEdit.insert(position, newText, annotation);
            } else {
              this.assertChangeAnnotations(this.changeAnnotations);
              id = this.changeAnnotations.manage(annotation);
              edit = AnnotatedTextEdit.insert(position, newText, id);
            }
            this.edits.push(edit);
            if (id !== void 0) {
              return id;
            }
          };
          TextEditChangeImpl2.prototype.replace = function(range, newText, annotation) {
            var edit;
            var id;
            if (annotation === void 0) {
              edit = TextEdit.replace(range, newText);
            } else if (ChangeAnnotationIdentifier.is(annotation)) {
              id = annotation;
              edit = AnnotatedTextEdit.replace(range, newText, annotation);
            } else {
              this.assertChangeAnnotations(this.changeAnnotations);
              id = this.changeAnnotations.manage(annotation);
              edit = AnnotatedTextEdit.replace(range, newText, id);
            }
            this.edits.push(edit);
            if (id !== void 0) {
              return id;
            }
          };
          TextEditChangeImpl2.prototype.delete = function(range, annotation) {
            var edit;
            var id;
            if (annotation === void 0) {
              edit = TextEdit.del(range);
            } else if (ChangeAnnotationIdentifier.is(annotation)) {
              id = annotation;
              edit = AnnotatedTextEdit.del(range, annotation);
            } else {
              this.assertChangeAnnotations(this.changeAnnotations);
              id = this.changeAnnotations.manage(annotation);
              edit = AnnotatedTextEdit.del(range, id);
            }
            this.edits.push(edit);
            if (id !== void 0) {
              return id;
            }
          };
          TextEditChangeImpl2.prototype.add = function(edit) {
            this.edits.push(edit);
          };
          TextEditChangeImpl2.prototype.all = function() {
            return this.edits;
          };
          TextEditChangeImpl2.prototype.clear = function() {
            this.edits.splice(0, this.edits.length);
          };
          TextEditChangeImpl2.prototype.assertChangeAnnotations = function(value) {
            if (value === void 0) {
              throw new Error("Text edit change is not configured to manage change annotations.");
            }
          };
          return TextEditChangeImpl2;
        })()
      );
      var ChangeAnnotations = (
        /** @class */
        (function() {
          function ChangeAnnotations2(annotations) {
            this._annotations = annotations === void 0 ? /* @__PURE__ */ Object.create(null) : annotations;
            this._counter = 0;
            this._size = 0;
          }
          ChangeAnnotations2.prototype.all = function() {
            return this._annotations;
          };
          Object.defineProperty(ChangeAnnotations2.prototype, "size", {
            get: function() {
              return this._size;
            },
            enumerable: false,
            configurable: true
          });
          ChangeAnnotations2.prototype.manage = function(idOrAnnotation, annotation) {
            var id;
            if (ChangeAnnotationIdentifier.is(idOrAnnotation)) {
              id = idOrAnnotation;
            } else {
              id = this.nextId();
              annotation = idOrAnnotation;
            }
            if (this._annotations[id] !== void 0) {
              throw new Error("Id ".concat(id, " is already in use."));
            }
            if (annotation === void 0) {
              throw new Error("No annotation provided for id ".concat(id));
            }
            this._annotations[id] = annotation;
            this._size++;
            return id;
          };
          ChangeAnnotations2.prototype.nextId = function() {
            this._counter++;
            return this._counter.toString();
          };
          return ChangeAnnotations2;
        })()
      );
      var WorkspaceChange = (
        /** @class */
        (function() {
          function WorkspaceChange2(workspaceEdit) {
            var _this = this;
            this._textEditChanges = /* @__PURE__ */ Object.create(null);
            if (workspaceEdit !== void 0) {
              this._workspaceEdit = workspaceEdit;
              if (workspaceEdit.documentChanges) {
                this._changeAnnotations = new ChangeAnnotations(workspaceEdit.changeAnnotations);
                workspaceEdit.changeAnnotations = this._changeAnnotations.all();
                workspaceEdit.documentChanges.forEach(function(change) {
                  if (TextDocumentEdit.is(change)) {
                    var textEditChange = new TextEditChangeImpl(change.edits, _this._changeAnnotations);
                    _this._textEditChanges[change.textDocument.uri] = textEditChange;
                  }
                });
              } else if (workspaceEdit.changes) {
                Object.keys(workspaceEdit.changes).forEach(function(key) {
                  var textEditChange = new TextEditChangeImpl(workspaceEdit.changes[key]);
                  _this._textEditChanges[key] = textEditChange;
                });
              }
            } else {
              this._workspaceEdit = {};
            }
          }
          Object.defineProperty(WorkspaceChange2.prototype, "edit", {
            /**
             * Returns the underlying {@link WorkspaceEdit} literal
             * use to be returned from a workspace edit operation like rename.
             */
            get: function() {
              this.initDocumentChanges();
              if (this._changeAnnotations !== void 0) {
                if (this._changeAnnotations.size === 0) {
                  this._workspaceEdit.changeAnnotations = void 0;
                } else {
                  this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
                }
              }
              return this._workspaceEdit;
            },
            enumerable: false,
            configurable: true
          });
          WorkspaceChange2.prototype.getTextEditChange = function(key) {
            if (OptionalVersionedTextDocumentIdentifier.is(key)) {
              this.initDocumentChanges();
              if (this._workspaceEdit.documentChanges === void 0) {
                throw new Error("Workspace edit is not configured for document changes.");
              }
              var textDocument = { uri: key.uri, version: key.version };
              var result = this._textEditChanges[textDocument.uri];
              if (!result) {
                var edits = [];
                var textDocumentEdit = {
                  textDocument,
                  edits
                };
                this._workspaceEdit.documentChanges.push(textDocumentEdit);
                result = new TextEditChangeImpl(edits, this._changeAnnotations);
                this._textEditChanges[textDocument.uri] = result;
              }
              return result;
            } else {
              this.initChanges();
              if (this._workspaceEdit.changes === void 0) {
                throw new Error("Workspace edit is not configured for normal text edit changes.");
              }
              var result = this._textEditChanges[key];
              if (!result) {
                var edits = [];
                this._workspaceEdit.changes[key] = edits;
                result = new TextEditChangeImpl(edits);
                this._textEditChanges[key] = result;
              }
              return result;
            }
          };
          WorkspaceChange2.prototype.initDocumentChanges = function() {
            if (this._workspaceEdit.documentChanges === void 0 && this._workspaceEdit.changes === void 0) {
              this._changeAnnotations = new ChangeAnnotations();
              this._workspaceEdit.documentChanges = [];
              this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
            }
          };
          WorkspaceChange2.prototype.initChanges = function() {
            if (this._workspaceEdit.documentChanges === void 0 && this._workspaceEdit.changes === void 0) {
              this._workspaceEdit.changes = /* @__PURE__ */ Object.create(null);
            }
          };
          WorkspaceChange2.prototype.createFile = function(uri, optionsOrAnnotation, options) {
            this.initDocumentChanges();
            if (this._workspaceEdit.documentChanges === void 0) {
              throw new Error("Workspace edit is not configured for document changes.");
            }
            var annotation;
            if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
              annotation = optionsOrAnnotation;
            } else {
              options = optionsOrAnnotation;
            }
            var operation;
            var id;
            if (annotation === void 0) {
              operation = CreateFile.create(uri, options);
            } else {
              id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
              operation = CreateFile.create(uri, options, id);
            }
            this._workspaceEdit.documentChanges.push(operation);
            if (id !== void 0) {
              return id;
            }
          };
          WorkspaceChange2.prototype.renameFile = function(oldUri, newUri, optionsOrAnnotation, options) {
            this.initDocumentChanges();
            if (this._workspaceEdit.documentChanges === void 0) {
              throw new Error("Workspace edit is not configured for document changes.");
            }
            var annotation;
            if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
              annotation = optionsOrAnnotation;
            } else {
              options = optionsOrAnnotation;
            }
            var operation;
            var id;
            if (annotation === void 0) {
              operation = RenameFile.create(oldUri, newUri, options);
            } else {
              id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
              operation = RenameFile.create(oldUri, newUri, options, id);
            }
            this._workspaceEdit.documentChanges.push(operation);
            if (id !== void 0) {
              return id;
            }
          };
          WorkspaceChange2.prototype.deleteFile = function(uri, optionsOrAnnotation, options) {
            this.initDocumentChanges();
            if (this._workspaceEdit.documentChanges === void 0) {
              throw new Error("Workspace edit is not configured for document changes.");
            }
            var annotation;
            if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
              annotation = optionsOrAnnotation;
            } else {
              options = optionsOrAnnotation;
            }
            var operation;
            var id;
            if (annotation === void 0) {
              operation = DeleteFile.create(uri, options);
            } else {
              id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
              operation = DeleteFile.create(uri, options, id);
            }
            this._workspaceEdit.documentChanges.push(operation);
            if (id !== void 0) {
              return id;
            }
          };
          return WorkspaceChange2;
        })()
      );
      exports3.WorkspaceChange = WorkspaceChange;
      var TextDocumentIdentifier;
      (function(TextDocumentIdentifier2) {
        function create(uri) {
          return { uri };
        }
        TextDocumentIdentifier2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri);
        }
        TextDocumentIdentifier2.is = is;
      })(TextDocumentIdentifier || (exports3.TextDocumentIdentifier = TextDocumentIdentifier = {}));
      var VersionedTextDocumentIdentifier;
      (function(VersionedTextDocumentIdentifier2) {
        function create(uri, version) {
          return { uri, version };
        }
        VersionedTextDocumentIdentifier2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri) && Is.integer(candidate.version);
        }
        VersionedTextDocumentIdentifier2.is = is;
      })(VersionedTextDocumentIdentifier || (exports3.VersionedTextDocumentIdentifier = VersionedTextDocumentIdentifier = {}));
      var OptionalVersionedTextDocumentIdentifier;
      (function(OptionalVersionedTextDocumentIdentifier2) {
        function create(uri, version) {
          return { uri, version };
        }
        OptionalVersionedTextDocumentIdentifier2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri) && (candidate.version === null || Is.integer(candidate.version));
        }
        OptionalVersionedTextDocumentIdentifier2.is = is;
      })(OptionalVersionedTextDocumentIdentifier || (exports3.OptionalVersionedTextDocumentIdentifier = OptionalVersionedTextDocumentIdentifier = {}));
      var TextDocumentItem;
      (function(TextDocumentItem2) {
        function create(uri, languageId, version, text) {
          return { uri, languageId, version, text };
        }
        TextDocumentItem2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri) && Is.string(candidate.languageId) && Is.integer(candidate.version) && Is.string(candidate.text);
        }
        TextDocumentItem2.is = is;
      })(TextDocumentItem || (exports3.TextDocumentItem = TextDocumentItem = {}));
      var MarkupKind2;
      (function(MarkupKind3) {
        MarkupKind3.PlainText = "plaintext";
        MarkupKind3.Markdown = "markdown";
        function is(value) {
          var candidate = value;
          return candidate === MarkupKind3.PlainText || candidate === MarkupKind3.Markdown;
        }
        MarkupKind3.is = is;
      })(MarkupKind2 || (exports3.MarkupKind = MarkupKind2 = {}));
      var MarkupContent;
      (function(MarkupContent2) {
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(value) && MarkupKind2.is(candidate.kind) && Is.string(candidate.value);
        }
        MarkupContent2.is = is;
      })(MarkupContent || (exports3.MarkupContent = MarkupContent = {}));
      var CompletionItemKind2;
      (function(CompletionItemKind3) {
        CompletionItemKind3.Text = 1;
        CompletionItemKind3.Method = 2;
        CompletionItemKind3.Function = 3;
        CompletionItemKind3.Constructor = 4;
        CompletionItemKind3.Field = 5;
        CompletionItemKind3.Variable = 6;
        CompletionItemKind3.Class = 7;
        CompletionItemKind3.Interface = 8;
        CompletionItemKind3.Module = 9;
        CompletionItemKind3.Property = 10;
        CompletionItemKind3.Unit = 11;
        CompletionItemKind3.Value = 12;
        CompletionItemKind3.Enum = 13;
        CompletionItemKind3.Keyword = 14;
        CompletionItemKind3.Snippet = 15;
        CompletionItemKind3.Color = 16;
        CompletionItemKind3.File = 17;
        CompletionItemKind3.Reference = 18;
        CompletionItemKind3.Folder = 19;
        CompletionItemKind3.EnumMember = 20;
        CompletionItemKind3.Constant = 21;
        CompletionItemKind3.Struct = 22;
        CompletionItemKind3.Event = 23;
        CompletionItemKind3.Operator = 24;
        CompletionItemKind3.TypeParameter = 25;
      })(CompletionItemKind2 || (exports3.CompletionItemKind = CompletionItemKind2 = {}));
      var InsertTextFormat;
      (function(InsertTextFormat2) {
        InsertTextFormat2.PlainText = 1;
        InsertTextFormat2.Snippet = 2;
      })(InsertTextFormat || (exports3.InsertTextFormat = InsertTextFormat = {}));
      var CompletionItemTag;
      (function(CompletionItemTag2) {
        CompletionItemTag2.Deprecated = 1;
      })(CompletionItemTag || (exports3.CompletionItemTag = CompletionItemTag = {}));
      var InsertReplaceEdit;
      (function(InsertReplaceEdit2) {
        function create(newText, insert, replace) {
          return { newText, insert, replace };
        }
        InsertReplaceEdit2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && Is.string(candidate.newText) && Range.is(candidate.insert) && Range.is(candidate.replace);
        }
        InsertReplaceEdit2.is = is;
      })(InsertReplaceEdit || (exports3.InsertReplaceEdit = InsertReplaceEdit = {}));
      var InsertTextMode;
      (function(InsertTextMode2) {
        InsertTextMode2.asIs = 1;
        InsertTextMode2.adjustIndentation = 2;
      })(InsertTextMode || (exports3.InsertTextMode = InsertTextMode = {}));
      var CompletionItemLabelDetails;
      (function(CompletionItemLabelDetails2) {
        function is(value) {
          var candidate = value;
          return candidate && (Is.string(candidate.detail) || candidate.detail === void 0) && (Is.string(candidate.description) || candidate.description === void 0);
        }
        CompletionItemLabelDetails2.is = is;
      })(CompletionItemLabelDetails || (exports3.CompletionItemLabelDetails = CompletionItemLabelDetails = {}));
      var CompletionItem;
      (function(CompletionItem2) {
        function create(label) {
          return { label };
        }
        CompletionItem2.create = create;
      })(CompletionItem || (exports3.CompletionItem = CompletionItem = {}));
      var CompletionList;
      (function(CompletionList2) {
        function create(items, isIncomplete) {
          return { items: items ? items : [], isIncomplete: !!isIncomplete };
        }
        CompletionList2.create = create;
      })(CompletionList || (exports3.CompletionList = CompletionList = {}));
      var MarkedString;
      (function(MarkedString2) {
        function fromPlainText(plainText) {
          return plainText.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
        }
        MarkedString2.fromPlainText = fromPlainText;
        function is(value) {
          var candidate = value;
          return Is.string(candidate) || Is.objectLiteral(candidate) && Is.string(candidate.language) && Is.string(candidate.value);
        }
        MarkedString2.is = is;
      })(MarkedString || (exports3.MarkedString = MarkedString = {}));
      var Hover2;
      (function(Hover3) {
        function is(value) {
          var candidate = value;
          return !!candidate && Is.objectLiteral(candidate) && (MarkupContent.is(candidate.contents) || MarkedString.is(candidate.contents) || Is.typedArray(candidate.contents, MarkedString.is)) && (value.range === void 0 || Range.is(value.range));
        }
        Hover3.is = is;
      })(Hover2 || (exports3.Hover = Hover2 = {}));
      var ParameterInformation;
      (function(ParameterInformation2) {
        function create(label, documentation) {
          return documentation ? { label, documentation } : { label };
        }
        ParameterInformation2.create = create;
      })(ParameterInformation || (exports3.ParameterInformation = ParameterInformation = {}));
      var SignatureInformation;
      (function(SignatureInformation2) {
        function create(label, documentation) {
          var parameters = [];
          for (var _i = 2; _i < arguments.length; _i++) {
            parameters[_i - 2] = arguments[_i];
          }
          var result = { label };
          if (Is.defined(documentation)) {
            result.documentation = documentation;
          }
          if (Is.defined(parameters)) {
            result.parameters = parameters;
          } else {
            result.parameters = [];
          }
          return result;
        }
        SignatureInformation2.create = create;
      })(SignatureInformation || (exports3.SignatureInformation = SignatureInformation = {}));
      var DocumentHighlightKind;
      (function(DocumentHighlightKind2) {
        DocumentHighlightKind2.Text = 1;
        DocumentHighlightKind2.Read = 2;
        DocumentHighlightKind2.Write = 3;
      })(DocumentHighlightKind || (exports3.DocumentHighlightKind = DocumentHighlightKind = {}));
      var DocumentHighlight;
      (function(DocumentHighlight2) {
        function create(range, kind) {
          var result = { range };
          if (Is.number(kind)) {
            result.kind = kind;
          }
          return result;
        }
        DocumentHighlight2.create = create;
      })(DocumentHighlight || (exports3.DocumentHighlight = DocumentHighlight = {}));
      var SymbolKind;
      (function(SymbolKind2) {
        SymbolKind2.File = 1;
        SymbolKind2.Module = 2;
        SymbolKind2.Namespace = 3;
        SymbolKind2.Package = 4;
        SymbolKind2.Class = 5;
        SymbolKind2.Method = 6;
        SymbolKind2.Property = 7;
        SymbolKind2.Field = 8;
        SymbolKind2.Constructor = 9;
        SymbolKind2.Enum = 10;
        SymbolKind2.Interface = 11;
        SymbolKind2.Function = 12;
        SymbolKind2.Variable = 13;
        SymbolKind2.Constant = 14;
        SymbolKind2.String = 15;
        SymbolKind2.Number = 16;
        SymbolKind2.Boolean = 17;
        SymbolKind2.Array = 18;
        SymbolKind2.Object = 19;
        SymbolKind2.Key = 20;
        SymbolKind2.Null = 21;
        SymbolKind2.EnumMember = 22;
        SymbolKind2.Struct = 23;
        SymbolKind2.Event = 24;
        SymbolKind2.Operator = 25;
        SymbolKind2.TypeParameter = 26;
      })(SymbolKind || (exports3.SymbolKind = SymbolKind = {}));
      var SymbolTag;
      (function(SymbolTag2) {
        SymbolTag2.Deprecated = 1;
      })(SymbolTag || (exports3.SymbolTag = SymbolTag = {}));
      var SymbolInformation;
      (function(SymbolInformation2) {
        function create(name, kind, range, uri, containerName) {
          var result = {
            name,
            kind,
            location: { uri, range }
          };
          if (containerName) {
            result.containerName = containerName;
          }
          return result;
        }
        SymbolInformation2.create = create;
      })(SymbolInformation || (exports3.SymbolInformation = SymbolInformation = {}));
      var WorkspaceSymbol;
      (function(WorkspaceSymbol2) {
        function create(name, kind, uri, range) {
          return range !== void 0 ? { name, kind, location: { uri, range } } : { name, kind, location: { uri } };
        }
        WorkspaceSymbol2.create = create;
      })(WorkspaceSymbol || (exports3.WorkspaceSymbol = WorkspaceSymbol = {}));
      var DocumentSymbol;
      (function(DocumentSymbol2) {
        function create(name, detail, kind, range, selectionRange, children) {
          var result = {
            name,
            detail,
            kind,
            range,
            selectionRange
          };
          if (children !== void 0) {
            result.children = children;
          }
          return result;
        }
        DocumentSymbol2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && Is.string(candidate.name) && Is.number(candidate.kind) && Range.is(candidate.range) && Range.is(candidate.selectionRange) && (candidate.detail === void 0 || Is.string(candidate.detail)) && (candidate.deprecated === void 0 || Is.boolean(candidate.deprecated)) && (candidate.children === void 0 || Array.isArray(candidate.children)) && (candidate.tags === void 0 || Array.isArray(candidate.tags));
        }
        DocumentSymbol2.is = is;
      })(DocumentSymbol || (exports3.DocumentSymbol = DocumentSymbol = {}));
      var CodeActionKind;
      (function(CodeActionKind2) {
        CodeActionKind2.Empty = "";
        CodeActionKind2.QuickFix = "quickfix";
        CodeActionKind2.Refactor = "refactor";
        CodeActionKind2.RefactorExtract = "refactor.extract";
        CodeActionKind2.RefactorInline = "refactor.inline";
        CodeActionKind2.RefactorRewrite = "refactor.rewrite";
        CodeActionKind2.Source = "source";
        CodeActionKind2.SourceOrganizeImports = "source.organizeImports";
        CodeActionKind2.SourceFixAll = "source.fixAll";
      })(CodeActionKind || (exports3.CodeActionKind = CodeActionKind = {}));
      var CodeActionTriggerKind;
      (function(CodeActionTriggerKind2) {
        CodeActionTriggerKind2.Invoked = 1;
        CodeActionTriggerKind2.Automatic = 2;
      })(CodeActionTriggerKind || (exports3.CodeActionTriggerKind = CodeActionTriggerKind = {}));
      var CodeActionContext;
      (function(CodeActionContext2) {
        function create(diagnostics, only, triggerKind) {
          var result = { diagnostics };
          if (only !== void 0 && only !== null) {
            result.only = only;
          }
          if (triggerKind !== void 0 && triggerKind !== null) {
            result.triggerKind = triggerKind;
          }
          return result;
        }
        CodeActionContext2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.typedArray(candidate.diagnostics, Diagnostic3.is) && (candidate.only === void 0 || Is.typedArray(candidate.only, Is.string)) && (candidate.triggerKind === void 0 || candidate.triggerKind === CodeActionTriggerKind.Invoked || candidate.triggerKind === CodeActionTriggerKind.Automatic);
        }
        CodeActionContext2.is = is;
      })(CodeActionContext || (exports3.CodeActionContext = CodeActionContext = {}));
      var CodeAction;
      (function(CodeAction2) {
        function create(title, kindOrCommandOrEdit, kind) {
          var result = { title };
          var checkKind = true;
          if (typeof kindOrCommandOrEdit === "string") {
            checkKind = false;
            result.kind = kindOrCommandOrEdit;
          } else if (Command.is(kindOrCommandOrEdit)) {
            result.command = kindOrCommandOrEdit;
          } else {
            result.edit = kindOrCommandOrEdit;
          }
          if (checkKind && kind !== void 0) {
            result.kind = kind;
          }
          return result;
        }
        CodeAction2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && Is.string(candidate.title) && (candidate.diagnostics === void 0 || Is.typedArray(candidate.diagnostics, Diagnostic3.is)) && (candidate.kind === void 0 || Is.string(candidate.kind)) && (candidate.edit !== void 0 || candidate.command !== void 0) && (candidate.command === void 0 || Command.is(candidate.command)) && (candidate.isPreferred === void 0 || Is.boolean(candidate.isPreferred)) && (candidate.edit === void 0 || WorkspaceEdit.is(candidate.edit));
        }
        CodeAction2.is = is;
      })(CodeAction || (exports3.CodeAction = CodeAction = {}));
      var CodeLens;
      (function(CodeLens2) {
        function create(range, data) {
          var result = { range };
          if (Is.defined(data)) {
            result.data = data;
          }
          return result;
        }
        CodeLens2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.command) || Command.is(candidate.command));
        }
        CodeLens2.is = is;
      })(CodeLens || (exports3.CodeLens = CodeLens = {}));
      var FormattingOptions;
      (function(FormattingOptions2) {
        function create(tabSize, insertSpaces) {
          return { tabSize, insertSpaces };
        }
        FormattingOptions2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.uinteger(candidate.tabSize) && Is.boolean(candidate.insertSpaces);
        }
        FormattingOptions2.is = is;
      })(FormattingOptions || (exports3.FormattingOptions = FormattingOptions = {}));
      var DocumentLink;
      (function(DocumentLink2) {
        function create(range, target, data) {
          return { range, target, data };
        }
        DocumentLink2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.target) || Is.string(candidate.target));
        }
        DocumentLink2.is = is;
      })(DocumentLink || (exports3.DocumentLink = DocumentLink = {}));
      var SelectionRange;
      (function(SelectionRange2) {
        function create(range, parent) {
          return { range, parent };
        }
        SelectionRange2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Range.is(candidate.range) && (candidate.parent === void 0 || SelectionRange2.is(candidate.parent));
        }
        SelectionRange2.is = is;
      })(SelectionRange || (exports3.SelectionRange = SelectionRange = {}));
      var SemanticTokenTypes;
      (function(SemanticTokenTypes2) {
        SemanticTokenTypes2["namespace"] = "namespace";
        SemanticTokenTypes2["type"] = "type";
        SemanticTokenTypes2["class"] = "class";
        SemanticTokenTypes2["enum"] = "enum";
        SemanticTokenTypes2["interface"] = "interface";
        SemanticTokenTypes2["struct"] = "struct";
        SemanticTokenTypes2["typeParameter"] = "typeParameter";
        SemanticTokenTypes2["parameter"] = "parameter";
        SemanticTokenTypes2["variable"] = "variable";
        SemanticTokenTypes2["property"] = "property";
        SemanticTokenTypes2["enumMember"] = "enumMember";
        SemanticTokenTypes2["event"] = "event";
        SemanticTokenTypes2["function"] = "function";
        SemanticTokenTypes2["method"] = "method";
        SemanticTokenTypes2["macro"] = "macro";
        SemanticTokenTypes2["keyword"] = "keyword";
        SemanticTokenTypes2["modifier"] = "modifier";
        SemanticTokenTypes2["comment"] = "comment";
        SemanticTokenTypes2["string"] = "string";
        SemanticTokenTypes2["number"] = "number";
        SemanticTokenTypes2["regexp"] = "regexp";
        SemanticTokenTypes2["operator"] = "operator";
        SemanticTokenTypes2["decorator"] = "decorator";
      })(SemanticTokenTypes || (exports3.SemanticTokenTypes = SemanticTokenTypes = {}));
      var SemanticTokenModifiers;
      (function(SemanticTokenModifiers2) {
        SemanticTokenModifiers2["declaration"] = "declaration";
        SemanticTokenModifiers2["definition"] = "definition";
        SemanticTokenModifiers2["readonly"] = "readonly";
        SemanticTokenModifiers2["static"] = "static";
        SemanticTokenModifiers2["deprecated"] = "deprecated";
        SemanticTokenModifiers2["abstract"] = "abstract";
        SemanticTokenModifiers2["async"] = "async";
        SemanticTokenModifiers2["modification"] = "modification";
        SemanticTokenModifiers2["documentation"] = "documentation";
        SemanticTokenModifiers2["defaultLibrary"] = "defaultLibrary";
      })(SemanticTokenModifiers || (exports3.SemanticTokenModifiers = SemanticTokenModifiers = {}));
      var SemanticTokens;
      (function(SemanticTokens2) {
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && (candidate.resultId === void 0 || typeof candidate.resultId === "string") && Array.isArray(candidate.data) && (candidate.data.length === 0 || typeof candidate.data[0] === "number");
        }
        SemanticTokens2.is = is;
      })(SemanticTokens || (exports3.SemanticTokens = SemanticTokens = {}));
      var InlineValueText;
      (function(InlineValueText2) {
        function create(range, text) {
          return { range, text };
        }
        InlineValueText2.create = create;
        function is(value) {
          var candidate = value;
          return candidate !== void 0 && candidate !== null && Range.is(candidate.range) && Is.string(candidate.text);
        }
        InlineValueText2.is = is;
      })(InlineValueText || (exports3.InlineValueText = InlineValueText = {}));
      var InlineValueVariableLookup;
      (function(InlineValueVariableLookup2) {
        function create(range, variableName, caseSensitiveLookup) {
          return { range, variableName, caseSensitiveLookup };
        }
        InlineValueVariableLookup2.create = create;
        function is(value) {
          var candidate = value;
          return candidate !== void 0 && candidate !== null && Range.is(candidate.range) && Is.boolean(candidate.caseSensitiveLookup) && (Is.string(candidate.variableName) || candidate.variableName === void 0);
        }
        InlineValueVariableLookup2.is = is;
      })(InlineValueVariableLookup || (exports3.InlineValueVariableLookup = InlineValueVariableLookup = {}));
      var InlineValueEvaluatableExpression;
      (function(InlineValueEvaluatableExpression2) {
        function create(range, expression) {
          return { range, expression };
        }
        InlineValueEvaluatableExpression2.create = create;
        function is(value) {
          var candidate = value;
          return candidate !== void 0 && candidate !== null && Range.is(candidate.range) && (Is.string(candidate.expression) || candidate.expression === void 0);
        }
        InlineValueEvaluatableExpression2.is = is;
      })(InlineValueEvaluatableExpression || (exports3.InlineValueEvaluatableExpression = InlineValueEvaluatableExpression = {}));
      var InlineValueContext;
      (function(InlineValueContext2) {
        function create(frameId, stoppedLocation) {
          return { frameId, stoppedLocation };
        }
        InlineValueContext2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Range.is(value.stoppedLocation);
        }
        InlineValueContext2.is = is;
      })(InlineValueContext || (exports3.InlineValueContext = InlineValueContext = {}));
      var InlayHintKind;
      (function(InlayHintKind2) {
        InlayHintKind2.Type = 1;
        InlayHintKind2.Parameter = 2;
        function is(value) {
          return value === 1 || value === 2;
        }
        InlayHintKind2.is = is;
      })(InlayHintKind || (exports3.InlayHintKind = InlayHintKind = {}));
      var InlayHintLabelPart;
      (function(InlayHintLabelPart2) {
        function create(value) {
          return { value };
        }
        InlayHintLabelPart2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && (candidate.tooltip === void 0 || Is.string(candidate.tooltip) || MarkupContent.is(candidate.tooltip)) && (candidate.location === void 0 || Location2.is(candidate.location)) && (candidate.command === void 0 || Command.is(candidate.command));
        }
        InlayHintLabelPart2.is = is;
      })(InlayHintLabelPart || (exports3.InlayHintLabelPart = InlayHintLabelPart = {}));
      var InlayHint;
      (function(InlayHint2) {
        function create(position, label, kind) {
          var result = { position, label };
          if (kind !== void 0) {
            result.kind = kind;
          }
          return result;
        }
        InlayHint2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Position.is(candidate.position) && (Is.string(candidate.label) || Is.typedArray(candidate.label, InlayHintLabelPart.is)) && (candidate.kind === void 0 || InlayHintKind.is(candidate.kind)) && candidate.textEdits === void 0 || Is.typedArray(candidate.textEdits, TextEdit.is) && (candidate.tooltip === void 0 || Is.string(candidate.tooltip) || MarkupContent.is(candidate.tooltip)) && (candidate.paddingLeft === void 0 || Is.boolean(candidate.paddingLeft)) && (candidate.paddingRight === void 0 || Is.boolean(candidate.paddingRight));
        }
        InlayHint2.is = is;
      })(InlayHint || (exports3.InlayHint = InlayHint = {}));
      var StringValue;
      (function(StringValue2) {
        function createSnippet(value) {
          return { kind: "snippet", value };
        }
        StringValue2.createSnippet = createSnippet;
      })(StringValue || (exports3.StringValue = StringValue = {}));
      var InlineCompletionItem;
      (function(InlineCompletionItem2) {
        function create(insertText, filterText, range, command) {
          return { insertText, filterText, range, command };
        }
        InlineCompletionItem2.create = create;
      })(InlineCompletionItem || (exports3.InlineCompletionItem = InlineCompletionItem = {}));
      var InlineCompletionList;
      (function(InlineCompletionList2) {
        function create(items) {
          return { items };
        }
        InlineCompletionList2.create = create;
      })(InlineCompletionList || (exports3.InlineCompletionList = InlineCompletionList = {}));
      var InlineCompletionTriggerKind;
      (function(InlineCompletionTriggerKind2) {
        InlineCompletionTriggerKind2.Invoked = 0;
        InlineCompletionTriggerKind2.Automatic = 1;
      })(InlineCompletionTriggerKind || (exports3.InlineCompletionTriggerKind = InlineCompletionTriggerKind = {}));
      var SelectedCompletionInfo;
      (function(SelectedCompletionInfo2) {
        function create(range, text) {
          return { range, text };
        }
        SelectedCompletionInfo2.create = create;
      })(SelectedCompletionInfo || (exports3.SelectedCompletionInfo = SelectedCompletionInfo = {}));
      var InlineCompletionContext;
      (function(InlineCompletionContext2) {
        function create(triggerKind, selectedCompletionInfo) {
          return { triggerKind, selectedCompletionInfo };
        }
        InlineCompletionContext2.create = create;
      })(InlineCompletionContext || (exports3.InlineCompletionContext = InlineCompletionContext = {}));
      var WorkspaceFolder;
      (function(WorkspaceFolder2) {
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && URI.is(candidate.uri) && Is.string(candidate.name);
        }
        WorkspaceFolder2.is = is;
      })(WorkspaceFolder || (exports3.WorkspaceFolder = WorkspaceFolder = {}));
      exports3.EOL = ["\n", "\r\n", "\r"];
      var TextDocument2;
      (function(TextDocument3) {
        function create(uri, languageId, version, content) {
          return new FullTextDocument2(uri, languageId, version, content);
        }
        TextDocument3.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri) && (Is.undefined(candidate.languageId) || Is.string(candidate.languageId)) && Is.uinteger(candidate.lineCount) && Is.func(candidate.getText) && Is.func(candidate.positionAt) && Is.func(candidate.offsetAt) ? true : false;
        }
        TextDocument3.is = is;
        function applyEdits(document2, edits) {
          var text = document2.getText();
          var sortedEdits = mergeSort2(edits, function(a, b) {
            var diff = a.range.start.line - b.range.start.line;
            if (diff === 0) {
              return a.range.start.character - b.range.start.character;
            }
            return diff;
          });
          var lastModifiedOffset = text.length;
          for (var i = sortedEdits.length - 1; i >= 0; i--) {
            var e = sortedEdits[i];
            var startOffset = document2.offsetAt(e.range.start);
            var endOffset = document2.offsetAt(e.range.end);
            if (endOffset <= lastModifiedOffset) {
              text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
            } else {
              throw new Error("Overlapping edit");
            }
            lastModifiedOffset = startOffset;
          }
          return text;
        }
        TextDocument3.applyEdits = applyEdits;
        function mergeSort2(data, compare) {
          if (data.length <= 1) {
            return data;
          }
          var p = data.length / 2 | 0;
          var left = data.slice(0, p);
          var right = data.slice(p);
          mergeSort2(left, compare);
          mergeSort2(right, compare);
          var leftIdx = 0;
          var rightIdx = 0;
          var i = 0;
          while (leftIdx < left.length && rightIdx < right.length) {
            var ret = compare(left[leftIdx], right[rightIdx]);
            if (ret <= 0) {
              data[i++] = left[leftIdx++];
            } else {
              data[i++] = right[rightIdx++];
            }
          }
          while (leftIdx < left.length) {
            data[i++] = left[leftIdx++];
          }
          while (rightIdx < right.length) {
            data[i++] = right[rightIdx++];
          }
          return data;
        }
      })(TextDocument2 || (exports3.TextDocument = TextDocument2 = {}));
      var FullTextDocument2 = (
        /** @class */
        (function() {
          function FullTextDocument3(uri, languageId, version, content) {
            this._uri = uri;
            this._languageId = languageId;
            this._version = version;
            this._content = content;
            this._lineOffsets = void 0;
          }
          Object.defineProperty(FullTextDocument3.prototype, "uri", {
            get: function() {
              return this._uri;
            },
            enumerable: false,
            configurable: true
          });
          Object.defineProperty(FullTextDocument3.prototype, "languageId", {
            get: function() {
              return this._languageId;
            },
            enumerable: false,
            configurable: true
          });
          Object.defineProperty(FullTextDocument3.prototype, "version", {
            get: function() {
              return this._version;
            },
            enumerable: false,
            configurable: true
          });
          FullTextDocument3.prototype.getText = function(range) {
            if (range) {
              var start = this.offsetAt(range.start);
              var end = this.offsetAt(range.end);
              return this._content.substring(start, end);
            }
            return this._content;
          };
          FullTextDocument3.prototype.update = function(event, version) {
            this._content = event.text;
            this._version = version;
            this._lineOffsets = void 0;
          };
          FullTextDocument3.prototype.getLineOffsets = function() {
            if (this._lineOffsets === void 0) {
              var lineOffsets = [];
              var text = this._content;
              var isLineStart = true;
              for (var i = 0; i < text.length; i++) {
                if (isLineStart) {
                  lineOffsets.push(i);
                  isLineStart = false;
                }
                var ch = text.charAt(i);
                isLineStart = ch === "\r" || ch === "\n";
                if (ch === "\r" && i + 1 < text.length && text.charAt(i + 1) === "\n") {
                  i++;
                }
              }
              if (isLineStart && text.length > 0) {
                lineOffsets.push(text.length);
              }
              this._lineOffsets = lineOffsets;
            }
            return this._lineOffsets;
          };
          FullTextDocument3.prototype.positionAt = function(offset) {
            offset = Math.max(Math.min(offset, this._content.length), 0);
            var lineOffsets = this.getLineOffsets();
            var low = 0, high = lineOffsets.length;
            if (high === 0) {
              return Position.create(0, offset);
            }
            while (low < high) {
              var mid = Math.floor((low + high) / 2);
              if (lineOffsets[mid] > offset) {
                high = mid;
              } else {
                low = mid + 1;
              }
            }
            var line = low - 1;
            return Position.create(line, offset - lineOffsets[line]);
          };
          FullTextDocument3.prototype.offsetAt = function(position) {
            var lineOffsets = this.getLineOffsets();
            if (position.line >= lineOffsets.length) {
              return this._content.length;
            } else if (position.line < 0) {
              return 0;
            }
            var lineOffset = lineOffsets[position.line];
            var nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
            return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
          };
          Object.defineProperty(FullTextDocument3.prototype, "lineCount", {
            get: function() {
              return this.getLineOffsets().length;
            },
            enumerable: false,
            configurable: true
          });
          return FullTextDocument3;
        })()
      );
      var Is;
      (function(Is2) {
        var toString = Object.prototype.toString;
        function defined(value) {
          return typeof value !== "undefined";
        }
        Is2.defined = defined;
        function undefined2(value) {
          return typeof value === "undefined";
        }
        Is2.undefined = undefined2;
        function boolean(value) {
          return value === true || value === false;
        }
        Is2.boolean = boolean;
        function string(value) {
          return toString.call(value) === "[object String]";
        }
        Is2.string = string;
        function number(value) {
          return toString.call(value) === "[object Number]";
        }
        Is2.number = number;
        function numberRange(value, min, max) {
          return toString.call(value) === "[object Number]" && min <= value && value <= max;
        }
        Is2.numberRange = numberRange;
        function integer2(value) {
          return toString.call(value) === "[object Number]" && -2147483648 <= value && value <= 2147483647;
        }
        Is2.integer = integer2;
        function uinteger2(value) {
          return toString.call(value) === "[object Number]" && 0 <= value && value <= 2147483647;
        }
        Is2.uinteger = uinteger2;
        function func(value) {
          return toString.call(value) === "[object Function]";
        }
        Is2.func = func;
        function objectLiteral(value) {
          return value !== null && typeof value === "object";
        }
        Is2.objectLiteral = objectLiteral;
        function typedArray(value, check) {
          return Array.isArray(value) && value.every(check);
        }
        Is2.typedArray = typedArray;
      })(Is || (Is = {}));
    });
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/messages.js
var require_messages2 = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/messages.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProtocolNotificationType = exports2.ProtocolNotificationType0 = exports2.ProtocolRequestType = exports2.ProtocolRequestType0 = exports2.RegistrationType = exports2.MessageDirection = void 0;
    var vscode_jsonrpc_1 = require_main();
    var MessageDirection;
    (function(MessageDirection2) {
      MessageDirection2["clientToServer"] = "clientToServer";
      MessageDirection2["serverToClient"] = "serverToClient";
      MessageDirection2["both"] = "both";
    })(MessageDirection || (exports2.MessageDirection = MessageDirection = {}));
    var RegistrationType = class {
      constructor(method) {
        this.method = method;
      }
    };
    exports2.RegistrationType = RegistrationType;
    var ProtocolRequestType0 = class extends vscode_jsonrpc_1.RequestType0 {
      constructor(method) {
        super(method);
      }
    };
    exports2.ProtocolRequestType0 = ProtocolRequestType0;
    var ProtocolRequestType = class extends vscode_jsonrpc_1.RequestType {
      constructor(method) {
        super(method, vscode_jsonrpc_1.ParameterStructures.byName);
      }
    };
    exports2.ProtocolRequestType = ProtocolRequestType;
    var ProtocolNotificationType0 = class extends vscode_jsonrpc_1.NotificationType0 {
      constructor(method) {
        super(method);
      }
    };
    exports2.ProtocolNotificationType0 = ProtocolNotificationType0;
    var ProtocolNotificationType = class extends vscode_jsonrpc_1.NotificationType {
      constructor(method) {
        super(method, vscode_jsonrpc_1.ParameterStructures.byName);
      }
    };
    exports2.ProtocolNotificationType = ProtocolNotificationType;
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/utils/is.js
var require_is3 = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/utils/is.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.objectLiteral = exports2.typedArray = exports2.stringArray = exports2.array = exports2.func = exports2.error = exports2.number = exports2.string = exports2.boolean = void 0;
    function boolean(value) {
      return value === true || value === false;
    }
    exports2.boolean = boolean;
    function string(value) {
      return typeof value === "string" || value instanceof String;
    }
    exports2.string = string;
    function number(value) {
      return typeof value === "number" || value instanceof Number;
    }
    exports2.number = number;
    function error(value) {
      return value instanceof Error;
    }
    exports2.error = error;
    function func(value) {
      return typeof value === "function";
    }
    exports2.func = func;
    function array(value) {
      return Array.isArray(value);
    }
    exports2.array = array;
    function stringArray(value) {
      return array(value) && value.every((elem) => string(elem));
    }
    exports2.stringArray = stringArray;
    function typedArray(value, check) {
      return Array.isArray(value) && value.every(check);
    }
    exports2.typedArray = typedArray;
    function objectLiteral(value) {
      return value !== null && typeof value === "object";
    }
    exports2.objectLiteral = objectLiteral;
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.implementation.js
var require_protocol_implementation = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.implementation.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ImplementationRequest = void 0;
    var messages_1 = require_messages2();
    var ImplementationRequest;
    (function(ImplementationRequest2) {
      ImplementationRequest2.method = "textDocument/implementation";
      ImplementationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ImplementationRequest2.type = new messages_1.ProtocolRequestType(ImplementationRequest2.method);
    })(ImplementationRequest || (exports2.ImplementationRequest = ImplementationRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.typeDefinition.js
var require_protocol_typeDefinition = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.typeDefinition.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeDefinitionRequest = void 0;
    var messages_1 = require_messages2();
    var TypeDefinitionRequest;
    (function(TypeDefinitionRequest2) {
      TypeDefinitionRequest2.method = "textDocument/typeDefinition";
      TypeDefinitionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeDefinitionRequest2.type = new messages_1.ProtocolRequestType(TypeDefinitionRequest2.method);
    })(TypeDefinitionRequest || (exports2.TypeDefinitionRequest = TypeDefinitionRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.workspaceFolder.js
var require_protocol_workspaceFolder = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.workspaceFolder.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DidChangeWorkspaceFoldersNotification = exports2.WorkspaceFoldersRequest = void 0;
    var messages_1 = require_messages2();
    var WorkspaceFoldersRequest;
    (function(WorkspaceFoldersRequest2) {
      WorkspaceFoldersRequest2.method = "workspace/workspaceFolders";
      WorkspaceFoldersRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      WorkspaceFoldersRequest2.type = new messages_1.ProtocolRequestType0(WorkspaceFoldersRequest2.method);
    })(WorkspaceFoldersRequest || (exports2.WorkspaceFoldersRequest = WorkspaceFoldersRequest = {}));
    var DidChangeWorkspaceFoldersNotification;
    (function(DidChangeWorkspaceFoldersNotification2) {
      DidChangeWorkspaceFoldersNotification2.method = "workspace/didChangeWorkspaceFolders";
      DidChangeWorkspaceFoldersNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeWorkspaceFoldersNotification2.type = new messages_1.ProtocolNotificationType(DidChangeWorkspaceFoldersNotification2.method);
    })(DidChangeWorkspaceFoldersNotification || (exports2.DidChangeWorkspaceFoldersNotification = DidChangeWorkspaceFoldersNotification = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.configuration.js
var require_protocol_configuration = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.configuration.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConfigurationRequest = void 0;
    var messages_1 = require_messages2();
    var ConfigurationRequest;
    (function(ConfigurationRequest2) {
      ConfigurationRequest2.method = "workspace/configuration";
      ConfigurationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ConfigurationRequest2.type = new messages_1.ProtocolRequestType(ConfigurationRequest2.method);
    })(ConfigurationRequest || (exports2.ConfigurationRequest = ConfigurationRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.colorProvider.js
var require_protocol_colorProvider = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.colorProvider.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ColorPresentationRequest = exports2.DocumentColorRequest = void 0;
    var messages_1 = require_messages2();
    var DocumentColorRequest;
    (function(DocumentColorRequest2) {
      DocumentColorRequest2.method = "textDocument/documentColor";
      DocumentColorRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentColorRequest2.type = new messages_1.ProtocolRequestType(DocumentColorRequest2.method);
    })(DocumentColorRequest || (exports2.DocumentColorRequest = DocumentColorRequest = {}));
    var ColorPresentationRequest;
    (function(ColorPresentationRequest2) {
      ColorPresentationRequest2.method = "textDocument/colorPresentation";
      ColorPresentationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ColorPresentationRequest2.type = new messages_1.ProtocolRequestType(ColorPresentationRequest2.method);
    })(ColorPresentationRequest || (exports2.ColorPresentationRequest = ColorPresentationRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.foldingRange.js
var require_protocol_foldingRange = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.foldingRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FoldingRangeRefreshRequest = exports2.FoldingRangeRequest = void 0;
    var messages_1 = require_messages2();
    var FoldingRangeRequest;
    (function(FoldingRangeRequest2) {
      FoldingRangeRequest2.method = "textDocument/foldingRange";
      FoldingRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      FoldingRangeRequest2.type = new messages_1.ProtocolRequestType(FoldingRangeRequest2.method);
    })(FoldingRangeRequest || (exports2.FoldingRangeRequest = FoldingRangeRequest = {}));
    var FoldingRangeRefreshRequest;
    (function(FoldingRangeRefreshRequest2) {
      FoldingRangeRefreshRequest2.method = `workspace/foldingRange/refresh`;
      FoldingRangeRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      FoldingRangeRefreshRequest2.type = new messages_1.ProtocolRequestType0(FoldingRangeRefreshRequest2.method);
    })(FoldingRangeRefreshRequest || (exports2.FoldingRangeRefreshRequest = FoldingRangeRefreshRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.declaration.js
var require_protocol_declaration = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.declaration.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DeclarationRequest = void 0;
    var messages_1 = require_messages2();
    var DeclarationRequest;
    (function(DeclarationRequest2) {
      DeclarationRequest2.method = "textDocument/declaration";
      DeclarationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DeclarationRequest2.type = new messages_1.ProtocolRequestType(DeclarationRequest2.method);
    })(DeclarationRequest || (exports2.DeclarationRequest = DeclarationRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.selectionRange.js
var require_protocol_selectionRange = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.selectionRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SelectionRangeRequest = void 0;
    var messages_1 = require_messages2();
    var SelectionRangeRequest;
    (function(SelectionRangeRequest2) {
      SelectionRangeRequest2.method = "textDocument/selectionRange";
      SelectionRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SelectionRangeRequest2.type = new messages_1.ProtocolRequestType(SelectionRangeRequest2.method);
    })(SelectionRangeRequest || (exports2.SelectionRangeRequest = SelectionRangeRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.progress.js
var require_protocol_progress = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.progress.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkDoneProgressCancelNotification = exports2.WorkDoneProgressCreateRequest = exports2.WorkDoneProgress = void 0;
    var vscode_jsonrpc_1 = require_main();
    var messages_1 = require_messages2();
    var WorkDoneProgress;
    (function(WorkDoneProgress2) {
      WorkDoneProgress2.type = new vscode_jsonrpc_1.ProgressType();
      function is(value) {
        return value === WorkDoneProgress2.type;
      }
      WorkDoneProgress2.is = is;
    })(WorkDoneProgress || (exports2.WorkDoneProgress = WorkDoneProgress = {}));
    var WorkDoneProgressCreateRequest;
    (function(WorkDoneProgressCreateRequest2) {
      WorkDoneProgressCreateRequest2.method = "window/workDoneProgress/create";
      WorkDoneProgressCreateRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      WorkDoneProgressCreateRequest2.type = new messages_1.ProtocolRequestType(WorkDoneProgressCreateRequest2.method);
    })(WorkDoneProgressCreateRequest || (exports2.WorkDoneProgressCreateRequest = WorkDoneProgressCreateRequest = {}));
    var WorkDoneProgressCancelNotification;
    (function(WorkDoneProgressCancelNotification2) {
      WorkDoneProgressCancelNotification2.method = "window/workDoneProgress/cancel";
      WorkDoneProgressCancelNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkDoneProgressCancelNotification2.type = new messages_1.ProtocolNotificationType(WorkDoneProgressCancelNotification2.method);
    })(WorkDoneProgressCancelNotification || (exports2.WorkDoneProgressCancelNotification = WorkDoneProgressCancelNotification = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.callHierarchy.js
var require_protocol_callHierarchy = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.callHierarchy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CallHierarchyOutgoingCallsRequest = exports2.CallHierarchyIncomingCallsRequest = exports2.CallHierarchyPrepareRequest = void 0;
    var messages_1 = require_messages2();
    var CallHierarchyPrepareRequest;
    (function(CallHierarchyPrepareRequest2) {
      CallHierarchyPrepareRequest2.method = "textDocument/prepareCallHierarchy";
      CallHierarchyPrepareRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CallHierarchyPrepareRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyPrepareRequest2.method);
    })(CallHierarchyPrepareRequest || (exports2.CallHierarchyPrepareRequest = CallHierarchyPrepareRequest = {}));
    var CallHierarchyIncomingCallsRequest;
    (function(CallHierarchyIncomingCallsRequest2) {
      CallHierarchyIncomingCallsRequest2.method = "callHierarchy/incomingCalls";
      CallHierarchyIncomingCallsRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CallHierarchyIncomingCallsRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyIncomingCallsRequest2.method);
    })(CallHierarchyIncomingCallsRequest || (exports2.CallHierarchyIncomingCallsRequest = CallHierarchyIncomingCallsRequest = {}));
    var CallHierarchyOutgoingCallsRequest;
    (function(CallHierarchyOutgoingCallsRequest2) {
      CallHierarchyOutgoingCallsRequest2.method = "callHierarchy/outgoingCalls";
      CallHierarchyOutgoingCallsRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CallHierarchyOutgoingCallsRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyOutgoingCallsRequest2.method);
    })(CallHierarchyOutgoingCallsRequest || (exports2.CallHierarchyOutgoingCallsRequest = CallHierarchyOutgoingCallsRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.semanticTokens.js
var require_protocol_semanticTokens = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.semanticTokens.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SemanticTokensRefreshRequest = exports2.SemanticTokensRangeRequest = exports2.SemanticTokensDeltaRequest = exports2.SemanticTokensRequest = exports2.SemanticTokensRegistrationType = exports2.TokenFormat = void 0;
    var messages_1 = require_messages2();
    var TokenFormat;
    (function(TokenFormat2) {
      TokenFormat2.Relative = "relative";
    })(TokenFormat || (exports2.TokenFormat = TokenFormat = {}));
    var SemanticTokensRegistrationType;
    (function(SemanticTokensRegistrationType2) {
      SemanticTokensRegistrationType2.method = "textDocument/semanticTokens";
      SemanticTokensRegistrationType2.type = new messages_1.RegistrationType(SemanticTokensRegistrationType2.method);
    })(SemanticTokensRegistrationType || (exports2.SemanticTokensRegistrationType = SemanticTokensRegistrationType = {}));
    var SemanticTokensRequest;
    (function(SemanticTokensRequest2) {
      SemanticTokensRequest2.method = "textDocument/semanticTokens/full";
      SemanticTokensRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SemanticTokensRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensRequest2.method);
      SemanticTokensRequest2.registrationMethod = SemanticTokensRegistrationType.method;
    })(SemanticTokensRequest || (exports2.SemanticTokensRequest = SemanticTokensRequest = {}));
    var SemanticTokensDeltaRequest;
    (function(SemanticTokensDeltaRequest2) {
      SemanticTokensDeltaRequest2.method = "textDocument/semanticTokens/full/delta";
      SemanticTokensDeltaRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SemanticTokensDeltaRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensDeltaRequest2.method);
      SemanticTokensDeltaRequest2.registrationMethod = SemanticTokensRegistrationType.method;
    })(SemanticTokensDeltaRequest || (exports2.SemanticTokensDeltaRequest = SemanticTokensDeltaRequest = {}));
    var SemanticTokensRangeRequest;
    (function(SemanticTokensRangeRequest2) {
      SemanticTokensRangeRequest2.method = "textDocument/semanticTokens/range";
      SemanticTokensRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SemanticTokensRangeRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensRangeRequest2.method);
      SemanticTokensRangeRequest2.registrationMethod = SemanticTokensRegistrationType.method;
    })(SemanticTokensRangeRequest || (exports2.SemanticTokensRangeRequest = SemanticTokensRangeRequest = {}));
    var SemanticTokensRefreshRequest;
    (function(SemanticTokensRefreshRequest2) {
      SemanticTokensRefreshRequest2.method = `workspace/semanticTokens/refresh`;
      SemanticTokensRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      SemanticTokensRefreshRequest2.type = new messages_1.ProtocolRequestType0(SemanticTokensRefreshRequest2.method);
    })(SemanticTokensRefreshRequest || (exports2.SemanticTokensRefreshRequest = SemanticTokensRefreshRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.showDocument.js
var require_protocol_showDocument = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.showDocument.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ShowDocumentRequest = void 0;
    var messages_1 = require_messages2();
    var ShowDocumentRequest;
    (function(ShowDocumentRequest2) {
      ShowDocumentRequest2.method = "window/showDocument";
      ShowDocumentRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ShowDocumentRequest2.type = new messages_1.ProtocolRequestType(ShowDocumentRequest2.method);
    })(ShowDocumentRequest || (exports2.ShowDocumentRequest = ShowDocumentRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.linkedEditingRange.js
var require_protocol_linkedEditingRange = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.linkedEditingRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LinkedEditingRangeRequest = void 0;
    var messages_1 = require_messages2();
    var LinkedEditingRangeRequest;
    (function(LinkedEditingRangeRequest2) {
      LinkedEditingRangeRequest2.method = "textDocument/linkedEditingRange";
      LinkedEditingRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      LinkedEditingRangeRequest2.type = new messages_1.ProtocolRequestType(LinkedEditingRangeRequest2.method);
    })(LinkedEditingRangeRequest || (exports2.LinkedEditingRangeRequest = LinkedEditingRangeRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.fileOperations.js
var require_protocol_fileOperations = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.fileOperations.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WillDeleteFilesRequest = exports2.DidDeleteFilesNotification = exports2.DidRenameFilesNotification = exports2.WillRenameFilesRequest = exports2.DidCreateFilesNotification = exports2.WillCreateFilesRequest = exports2.FileOperationPatternKind = void 0;
    var messages_1 = require_messages2();
    var FileOperationPatternKind;
    (function(FileOperationPatternKind2) {
      FileOperationPatternKind2.file = "file";
      FileOperationPatternKind2.folder = "folder";
    })(FileOperationPatternKind || (exports2.FileOperationPatternKind = FileOperationPatternKind = {}));
    var WillCreateFilesRequest;
    (function(WillCreateFilesRequest2) {
      WillCreateFilesRequest2.method = "workspace/willCreateFiles";
      WillCreateFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillCreateFilesRequest2.type = new messages_1.ProtocolRequestType(WillCreateFilesRequest2.method);
    })(WillCreateFilesRequest || (exports2.WillCreateFilesRequest = WillCreateFilesRequest = {}));
    var DidCreateFilesNotification;
    (function(DidCreateFilesNotification2) {
      DidCreateFilesNotification2.method = "workspace/didCreateFiles";
      DidCreateFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidCreateFilesNotification2.type = new messages_1.ProtocolNotificationType(DidCreateFilesNotification2.method);
    })(DidCreateFilesNotification || (exports2.DidCreateFilesNotification = DidCreateFilesNotification = {}));
    var WillRenameFilesRequest;
    (function(WillRenameFilesRequest2) {
      WillRenameFilesRequest2.method = "workspace/willRenameFiles";
      WillRenameFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillRenameFilesRequest2.type = new messages_1.ProtocolRequestType(WillRenameFilesRequest2.method);
    })(WillRenameFilesRequest || (exports2.WillRenameFilesRequest = WillRenameFilesRequest = {}));
    var DidRenameFilesNotification;
    (function(DidRenameFilesNotification2) {
      DidRenameFilesNotification2.method = "workspace/didRenameFiles";
      DidRenameFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidRenameFilesNotification2.type = new messages_1.ProtocolNotificationType(DidRenameFilesNotification2.method);
    })(DidRenameFilesNotification || (exports2.DidRenameFilesNotification = DidRenameFilesNotification = {}));
    var DidDeleteFilesNotification;
    (function(DidDeleteFilesNotification2) {
      DidDeleteFilesNotification2.method = "workspace/didDeleteFiles";
      DidDeleteFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidDeleteFilesNotification2.type = new messages_1.ProtocolNotificationType(DidDeleteFilesNotification2.method);
    })(DidDeleteFilesNotification || (exports2.DidDeleteFilesNotification = DidDeleteFilesNotification = {}));
    var WillDeleteFilesRequest;
    (function(WillDeleteFilesRequest2) {
      WillDeleteFilesRequest2.method = "workspace/willDeleteFiles";
      WillDeleteFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillDeleteFilesRequest2.type = new messages_1.ProtocolRequestType(WillDeleteFilesRequest2.method);
    })(WillDeleteFilesRequest || (exports2.WillDeleteFilesRequest = WillDeleteFilesRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.moniker.js
var require_protocol_moniker = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.moniker.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MonikerRequest = exports2.MonikerKind = exports2.UniquenessLevel = void 0;
    var messages_1 = require_messages2();
    var UniquenessLevel;
    (function(UniquenessLevel2) {
      UniquenessLevel2.document = "document";
      UniquenessLevel2.project = "project";
      UniquenessLevel2.group = "group";
      UniquenessLevel2.scheme = "scheme";
      UniquenessLevel2.global = "global";
    })(UniquenessLevel || (exports2.UniquenessLevel = UniquenessLevel = {}));
    var MonikerKind;
    (function(MonikerKind2) {
      MonikerKind2.$import = "import";
      MonikerKind2.$export = "export";
      MonikerKind2.local = "local";
    })(MonikerKind || (exports2.MonikerKind = MonikerKind = {}));
    var MonikerRequest;
    (function(MonikerRequest2) {
      MonikerRequest2.method = "textDocument/moniker";
      MonikerRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      MonikerRequest2.type = new messages_1.ProtocolRequestType(MonikerRequest2.method);
    })(MonikerRequest || (exports2.MonikerRequest = MonikerRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.typeHierarchy.js
var require_protocol_typeHierarchy = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.typeHierarchy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeHierarchySubtypesRequest = exports2.TypeHierarchySupertypesRequest = exports2.TypeHierarchyPrepareRequest = void 0;
    var messages_1 = require_messages2();
    var TypeHierarchyPrepareRequest;
    (function(TypeHierarchyPrepareRequest2) {
      TypeHierarchyPrepareRequest2.method = "textDocument/prepareTypeHierarchy";
      TypeHierarchyPrepareRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeHierarchyPrepareRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchyPrepareRequest2.method);
    })(TypeHierarchyPrepareRequest || (exports2.TypeHierarchyPrepareRequest = TypeHierarchyPrepareRequest = {}));
    var TypeHierarchySupertypesRequest;
    (function(TypeHierarchySupertypesRequest2) {
      TypeHierarchySupertypesRequest2.method = "typeHierarchy/supertypes";
      TypeHierarchySupertypesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeHierarchySupertypesRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchySupertypesRequest2.method);
    })(TypeHierarchySupertypesRequest || (exports2.TypeHierarchySupertypesRequest = TypeHierarchySupertypesRequest = {}));
    var TypeHierarchySubtypesRequest;
    (function(TypeHierarchySubtypesRequest2) {
      TypeHierarchySubtypesRequest2.method = "typeHierarchy/subtypes";
      TypeHierarchySubtypesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeHierarchySubtypesRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchySubtypesRequest2.method);
    })(TypeHierarchySubtypesRequest || (exports2.TypeHierarchySubtypesRequest = TypeHierarchySubtypesRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineValue.js
var require_protocol_inlineValue = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineValue.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlineValueRefreshRequest = exports2.InlineValueRequest = void 0;
    var messages_1 = require_messages2();
    var InlineValueRequest;
    (function(InlineValueRequest2) {
      InlineValueRequest2.method = "textDocument/inlineValue";
      InlineValueRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlineValueRequest2.type = new messages_1.ProtocolRequestType(InlineValueRequest2.method);
    })(InlineValueRequest || (exports2.InlineValueRequest = InlineValueRequest = {}));
    var InlineValueRefreshRequest;
    (function(InlineValueRefreshRequest2) {
      InlineValueRefreshRequest2.method = `workspace/inlineValue/refresh`;
      InlineValueRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      InlineValueRefreshRequest2.type = new messages_1.ProtocolRequestType0(InlineValueRefreshRequest2.method);
    })(InlineValueRefreshRequest || (exports2.InlineValueRefreshRequest = InlineValueRefreshRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.inlayHint.js
var require_protocol_inlayHint = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.inlayHint.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlayHintRefreshRequest = exports2.InlayHintResolveRequest = exports2.InlayHintRequest = void 0;
    var messages_1 = require_messages2();
    var InlayHintRequest;
    (function(InlayHintRequest2) {
      InlayHintRequest2.method = "textDocument/inlayHint";
      InlayHintRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlayHintRequest2.type = new messages_1.ProtocolRequestType(InlayHintRequest2.method);
    })(InlayHintRequest || (exports2.InlayHintRequest = InlayHintRequest = {}));
    var InlayHintResolveRequest;
    (function(InlayHintResolveRequest2) {
      InlayHintResolveRequest2.method = "inlayHint/resolve";
      InlayHintResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlayHintResolveRequest2.type = new messages_1.ProtocolRequestType(InlayHintResolveRequest2.method);
    })(InlayHintResolveRequest || (exports2.InlayHintResolveRequest = InlayHintResolveRequest = {}));
    var InlayHintRefreshRequest;
    (function(InlayHintRefreshRequest2) {
      InlayHintRefreshRequest2.method = `workspace/inlayHint/refresh`;
      InlayHintRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      InlayHintRefreshRequest2.type = new messages_1.ProtocolRequestType0(InlayHintRefreshRequest2.method);
    })(InlayHintRefreshRequest || (exports2.InlayHintRefreshRequest = InlayHintRefreshRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.diagnostic.js
var require_protocol_diagnostic = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.diagnostic.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DiagnosticRefreshRequest = exports2.WorkspaceDiagnosticRequest = exports2.DocumentDiagnosticRequest = exports2.DocumentDiagnosticReportKind = exports2.DiagnosticServerCancellationData = void 0;
    var vscode_jsonrpc_1 = require_main();
    var Is = require_is3();
    var messages_1 = require_messages2();
    var DiagnosticServerCancellationData;
    (function(DiagnosticServerCancellationData2) {
      function is(value) {
        const candidate = value;
        return candidate && Is.boolean(candidate.retriggerRequest);
      }
      DiagnosticServerCancellationData2.is = is;
    })(DiagnosticServerCancellationData || (exports2.DiagnosticServerCancellationData = DiagnosticServerCancellationData = {}));
    var DocumentDiagnosticReportKind;
    (function(DocumentDiagnosticReportKind2) {
      DocumentDiagnosticReportKind2.Full = "full";
      DocumentDiagnosticReportKind2.Unchanged = "unchanged";
    })(DocumentDiagnosticReportKind || (exports2.DocumentDiagnosticReportKind = DocumentDiagnosticReportKind = {}));
    var DocumentDiagnosticRequest;
    (function(DocumentDiagnosticRequest2) {
      DocumentDiagnosticRequest2.method = "textDocument/diagnostic";
      DocumentDiagnosticRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentDiagnosticRequest2.type = new messages_1.ProtocolRequestType(DocumentDiagnosticRequest2.method);
      DocumentDiagnosticRequest2.partialResult = new vscode_jsonrpc_1.ProgressType();
    })(DocumentDiagnosticRequest || (exports2.DocumentDiagnosticRequest = DocumentDiagnosticRequest = {}));
    var WorkspaceDiagnosticRequest;
    (function(WorkspaceDiagnosticRequest2) {
      WorkspaceDiagnosticRequest2.method = "workspace/diagnostic";
      WorkspaceDiagnosticRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkspaceDiagnosticRequest2.type = new messages_1.ProtocolRequestType(WorkspaceDiagnosticRequest2.method);
      WorkspaceDiagnosticRequest2.partialResult = new vscode_jsonrpc_1.ProgressType();
    })(WorkspaceDiagnosticRequest || (exports2.WorkspaceDiagnosticRequest = WorkspaceDiagnosticRequest = {}));
    var DiagnosticRefreshRequest;
    (function(DiagnosticRefreshRequest2) {
      DiagnosticRefreshRequest2.method = `workspace/diagnostic/refresh`;
      DiagnosticRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      DiagnosticRefreshRequest2.type = new messages_1.ProtocolRequestType0(DiagnosticRefreshRequest2.method);
    })(DiagnosticRefreshRequest || (exports2.DiagnosticRefreshRequest = DiagnosticRefreshRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.notebook.js
var require_protocol_notebook = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.notebook.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DidCloseNotebookDocumentNotification = exports2.DidSaveNotebookDocumentNotification = exports2.DidChangeNotebookDocumentNotification = exports2.NotebookCellArrayChange = exports2.DidOpenNotebookDocumentNotification = exports2.NotebookDocumentSyncRegistrationType = exports2.NotebookDocument = exports2.NotebookCell = exports2.ExecutionSummary = exports2.NotebookCellKind = void 0;
    var vscode_languageserver_types_1 = require_main2();
    var Is = require_is3();
    var messages_1 = require_messages2();
    var NotebookCellKind;
    (function(NotebookCellKind2) {
      NotebookCellKind2.Markup = 1;
      NotebookCellKind2.Code = 2;
      function is(value) {
        return value === 1 || value === 2;
      }
      NotebookCellKind2.is = is;
    })(NotebookCellKind || (exports2.NotebookCellKind = NotebookCellKind = {}));
    var ExecutionSummary;
    (function(ExecutionSummary2) {
      function create(executionOrder, success) {
        const result = { executionOrder };
        if (success === true || success === false) {
          result.success = success;
        }
        return result;
      }
      ExecutionSummary2.create = create;
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && vscode_languageserver_types_1.uinteger.is(candidate.executionOrder) && (candidate.success === void 0 || Is.boolean(candidate.success));
      }
      ExecutionSummary2.is = is;
      function equals(one, other) {
        if (one === other) {
          return true;
        }
        if (one === null || one === void 0 || other === null || other === void 0) {
          return false;
        }
        return one.executionOrder === other.executionOrder && one.success === other.success;
      }
      ExecutionSummary2.equals = equals;
    })(ExecutionSummary || (exports2.ExecutionSummary = ExecutionSummary = {}));
    var NotebookCell;
    (function(NotebookCell2) {
      function create(kind, document2) {
        return { kind, document: document2 };
      }
      NotebookCell2.create = create;
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && NotebookCellKind.is(candidate.kind) && vscode_languageserver_types_1.DocumentUri.is(candidate.document) && (candidate.metadata === void 0 || Is.objectLiteral(candidate.metadata));
      }
      NotebookCell2.is = is;
      function diff(one, two) {
        const result = /* @__PURE__ */ new Set();
        if (one.document !== two.document) {
          result.add("document");
        }
        if (one.kind !== two.kind) {
          result.add("kind");
        }
        if (one.executionSummary !== two.executionSummary) {
          result.add("executionSummary");
        }
        if ((one.metadata !== void 0 || two.metadata !== void 0) && !equalsMetadata(one.metadata, two.metadata)) {
          result.add("metadata");
        }
        if ((one.executionSummary !== void 0 || two.executionSummary !== void 0) && !ExecutionSummary.equals(one.executionSummary, two.executionSummary)) {
          result.add("executionSummary");
        }
        return result;
      }
      NotebookCell2.diff = diff;
      function equalsMetadata(one, other) {
        if (one === other) {
          return true;
        }
        if (one === null || one === void 0 || other === null || other === void 0) {
          return false;
        }
        if (typeof one !== typeof other) {
          return false;
        }
        if (typeof one !== "object") {
          return false;
        }
        const oneArray = Array.isArray(one);
        const otherArray = Array.isArray(other);
        if (oneArray !== otherArray) {
          return false;
        }
        if (oneArray && otherArray) {
          if (one.length !== other.length) {
            return false;
          }
          for (let i = 0; i < one.length; i++) {
            if (!equalsMetadata(one[i], other[i])) {
              return false;
            }
          }
        }
        if (Is.objectLiteral(one) && Is.objectLiteral(other)) {
          const oneKeys = Object.keys(one);
          const otherKeys = Object.keys(other);
          if (oneKeys.length !== otherKeys.length) {
            return false;
          }
          oneKeys.sort();
          otherKeys.sort();
          if (!equalsMetadata(oneKeys, otherKeys)) {
            return false;
          }
          for (let i = 0; i < oneKeys.length; i++) {
            const prop = oneKeys[i];
            if (!equalsMetadata(one[prop], other[prop])) {
              return false;
            }
          }
        }
        return true;
      }
    })(NotebookCell || (exports2.NotebookCell = NotebookCell = {}));
    var NotebookDocument;
    (function(NotebookDocument2) {
      function create(uri, notebookType, version, cells) {
        return { uri, notebookType, version, cells };
      }
      NotebookDocument2.create = create;
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.uri) && vscode_languageserver_types_1.integer.is(candidate.version) && Is.typedArray(candidate.cells, NotebookCell.is);
      }
      NotebookDocument2.is = is;
    })(NotebookDocument || (exports2.NotebookDocument = NotebookDocument = {}));
    var NotebookDocumentSyncRegistrationType;
    (function(NotebookDocumentSyncRegistrationType2) {
      NotebookDocumentSyncRegistrationType2.method = "notebookDocument/sync";
      NotebookDocumentSyncRegistrationType2.messageDirection = messages_1.MessageDirection.clientToServer;
      NotebookDocumentSyncRegistrationType2.type = new messages_1.RegistrationType(NotebookDocumentSyncRegistrationType2.method);
    })(NotebookDocumentSyncRegistrationType || (exports2.NotebookDocumentSyncRegistrationType = NotebookDocumentSyncRegistrationType = {}));
    var DidOpenNotebookDocumentNotification;
    (function(DidOpenNotebookDocumentNotification2) {
      DidOpenNotebookDocumentNotification2.method = "notebookDocument/didOpen";
      DidOpenNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidOpenNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidOpenNotebookDocumentNotification2.method);
      DidOpenNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(DidOpenNotebookDocumentNotification || (exports2.DidOpenNotebookDocumentNotification = DidOpenNotebookDocumentNotification = {}));
    var NotebookCellArrayChange;
    (function(NotebookCellArrayChange2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && vscode_languageserver_types_1.uinteger.is(candidate.start) && vscode_languageserver_types_1.uinteger.is(candidate.deleteCount) && (candidate.cells === void 0 || Is.typedArray(candidate.cells, NotebookCell.is));
      }
      NotebookCellArrayChange2.is = is;
      function create(start, deleteCount, cells) {
        const result = { start, deleteCount };
        if (cells !== void 0) {
          result.cells = cells;
        }
        return result;
      }
      NotebookCellArrayChange2.create = create;
    })(NotebookCellArrayChange || (exports2.NotebookCellArrayChange = NotebookCellArrayChange = {}));
    var DidChangeNotebookDocumentNotification;
    (function(DidChangeNotebookDocumentNotification2) {
      DidChangeNotebookDocumentNotification2.method = "notebookDocument/didChange";
      DidChangeNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidChangeNotebookDocumentNotification2.method);
      DidChangeNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(DidChangeNotebookDocumentNotification || (exports2.DidChangeNotebookDocumentNotification = DidChangeNotebookDocumentNotification = {}));
    var DidSaveNotebookDocumentNotification;
    (function(DidSaveNotebookDocumentNotification2) {
      DidSaveNotebookDocumentNotification2.method = "notebookDocument/didSave";
      DidSaveNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidSaveNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidSaveNotebookDocumentNotification2.method);
      DidSaveNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(DidSaveNotebookDocumentNotification || (exports2.DidSaveNotebookDocumentNotification = DidSaveNotebookDocumentNotification = {}));
    var DidCloseNotebookDocumentNotification;
    (function(DidCloseNotebookDocumentNotification2) {
      DidCloseNotebookDocumentNotification2.method = "notebookDocument/didClose";
      DidCloseNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidCloseNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidCloseNotebookDocumentNotification2.method);
      DidCloseNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(DidCloseNotebookDocumentNotification || (exports2.DidCloseNotebookDocumentNotification = DidCloseNotebookDocumentNotification = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineCompletion.js
var require_protocol_inlineCompletion = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineCompletion.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlineCompletionRequest = void 0;
    var messages_1 = require_messages2();
    var InlineCompletionRequest;
    (function(InlineCompletionRequest2) {
      InlineCompletionRequest2.method = "textDocument/inlineCompletion";
      InlineCompletionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlineCompletionRequest2.type = new messages_1.ProtocolRequestType(InlineCompletionRequest2.method);
    })(InlineCompletionRequest || (exports2.InlineCompletionRequest = InlineCompletionRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.js
var require_protocol = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/protocol.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkspaceSymbolRequest = exports2.CodeActionResolveRequest = exports2.CodeActionRequest = exports2.DocumentSymbolRequest = exports2.DocumentHighlightRequest = exports2.ReferencesRequest = exports2.DefinitionRequest = exports2.SignatureHelpRequest = exports2.SignatureHelpTriggerKind = exports2.HoverRequest = exports2.CompletionResolveRequest = exports2.CompletionRequest = exports2.CompletionTriggerKind = exports2.PublishDiagnosticsNotification = exports2.WatchKind = exports2.RelativePattern = exports2.FileChangeType = exports2.DidChangeWatchedFilesNotification = exports2.WillSaveTextDocumentWaitUntilRequest = exports2.WillSaveTextDocumentNotification = exports2.TextDocumentSaveReason = exports2.DidSaveTextDocumentNotification = exports2.DidCloseTextDocumentNotification = exports2.DidChangeTextDocumentNotification = exports2.TextDocumentContentChangeEvent = exports2.DidOpenTextDocumentNotification = exports2.TextDocumentSyncKind = exports2.TelemetryEventNotification = exports2.LogMessageNotification = exports2.ShowMessageRequest = exports2.ShowMessageNotification = exports2.MessageType = exports2.DidChangeConfigurationNotification = exports2.ExitNotification = exports2.ShutdownRequest = exports2.InitializedNotification = exports2.InitializeErrorCodes = exports2.InitializeRequest = exports2.WorkDoneProgressOptions = exports2.TextDocumentRegistrationOptions = exports2.StaticRegistrationOptions = exports2.PositionEncodingKind = exports2.FailureHandlingKind = exports2.ResourceOperationKind = exports2.UnregistrationRequest = exports2.RegistrationRequest = exports2.DocumentSelector = exports2.NotebookCellTextDocumentFilter = exports2.NotebookDocumentFilter = exports2.TextDocumentFilter = void 0;
    exports2.MonikerRequest = exports2.MonikerKind = exports2.UniquenessLevel = exports2.WillDeleteFilesRequest = exports2.DidDeleteFilesNotification = exports2.WillRenameFilesRequest = exports2.DidRenameFilesNotification = exports2.WillCreateFilesRequest = exports2.DidCreateFilesNotification = exports2.FileOperationPatternKind = exports2.LinkedEditingRangeRequest = exports2.ShowDocumentRequest = exports2.SemanticTokensRegistrationType = exports2.SemanticTokensRefreshRequest = exports2.SemanticTokensRangeRequest = exports2.SemanticTokensDeltaRequest = exports2.SemanticTokensRequest = exports2.TokenFormat = exports2.CallHierarchyPrepareRequest = exports2.CallHierarchyOutgoingCallsRequest = exports2.CallHierarchyIncomingCallsRequest = exports2.WorkDoneProgressCancelNotification = exports2.WorkDoneProgressCreateRequest = exports2.WorkDoneProgress = exports2.SelectionRangeRequest = exports2.DeclarationRequest = exports2.FoldingRangeRefreshRequest = exports2.FoldingRangeRequest = exports2.ColorPresentationRequest = exports2.DocumentColorRequest = exports2.ConfigurationRequest = exports2.DidChangeWorkspaceFoldersNotification = exports2.WorkspaceFoldersRequest = exports2.TypeDefinitionRequest = exports2.ImplementationRequest = exports2.ApplyWorkspaceEditRequest = exports2.ExecuteCommandRequest = exports2.PrepareRenameRequest = exports2.RenameRequest = exports2.PrepareSupportDefaultBehavior = exports2.DocumentOnTypeFormattingRequest = exports2.DocumentRangesFormattingRequest = exports2.DocumentRangeFormattingRequest = exports2.DocumentFormattingRequest = exports2.DocumentLinkResolveRequest = exports2.DocumentLinkRequest = exports2.CodeLensRefreshRequest = exports2.CodeLensResolveRequest = exports2.CodeLensRequest = exports2.WorkspaceSymbolResolveRequest = void 0;
    exports2.InlineCompletionRequest = exports2.DidCloseNotebookDocumentNotification = exports2.DidSaveNotebookDocumentNotification = exports2.DidChangeNotebookDocumentNotification = exports2.NotebookCellArrayChange = exports2.DidOpenNotebookDocumentNotification = exports2.NotebookDocumentSyncRegistrationType = exports2.NotebookDocument = exports2.NotebookCell = exports2.ExecutionSummary = exports2.NotebookCellKind = exports2.DiagnosticRefreshRequest = exports2.WorkspaceDiagnosticRequest = exports2.DocumentDiagnosticRequest = exports2.DocumentDiagnosticReportKind = exports2.DiagnosticServerCancellationData = exports2.InlayHintRefreshRequest = exports2.InlayHintResolveRequest = exports2.InlayHintRequest = exports2.InlineValueRefreshRequest = exports2.InlineValueRequest = exports2.TypeHierarchySupertypesRequest = exports2.TypeHierarchySubtypesRequest = exports2.TypeHierarchyPrepareRequest = void 0;
    var messages_1 = require_messages2();
    var vscode_languageserver_types_1 = require_main2();
    var Is = require_is3();
    var protocol_implementation_1 = require_protocol_implementation();
    Object.defineProperty(exports2, "ImplementationRequest", { enumerable: true, get: function() {
      return protocol_implementation_1.ImplementationRequest;
    } });
    var protocol_typeDefinition_1 = require_protocol_typeDefinition();
    Object.defineProperty(exports2, "TypeDefinitionRequest", { enumerable: true, get: function() {
      return protocol_typeDefinition_1.TypeDefinitionRequest;
    } });
    var protocol_workspaceFolder_1 = require_protocol_workspaceFolder();
    Object.defineProperty(exports2, "WorkspaceFoldersRequest", { enumerable: true, get: function() {
      return protocol_workspaceFolder_1.WorkspaceFoldersRequest;
    } });
    Object.defineProperty(exports2, "DidChangeWorkspaceFoldersNotification", { enumerable: true, get: function() {
      return protocol_workspaceFolder_1.DidChangeWorkspaceFoldersNotification;
    } });
    var protocol_configuration_1 = require_protocol_configuration();
    Object.defineProperty(exports2, "ConfigurationRequest", { enumerable: true, get: function() {
      return protocol_configuration_1.ConfigurationRequest;
    } });
    var protocol_colorProvider_1 = require_protocol_colorProvider();
    Object.defineProperty(exports2, "DocumentColorRequest", { enumerable: true, get: function() {
      return protocol_colorProvider_1.DocumentColorRequest;
    } });
    Object.defineProperty(exports2, "ColorPresentationRequest", { enumerable: true, get: function() {
      return protocol_colorProvider_1.ColorPresentationRequest;
    } });
    var protocol_foldingRange_1 = require_protocol_foldingRange();
    Object.defineProperty(exports2, "FoldingRangeRequest", { enumerable: true, get: function() {
      return protocol_foldingRange_1.FoldingRangeRequest;
    } });
    Object.defineProperty(exports2, "FoldingRangeRefreshRequest", { enumerable: true, get: function() {
      return protocol_foldingRange_1.FoldingRangeRefreshRequest;
    } });
    var protocol_declaration_1 = require_protocol_declaration();
    Object.defineProperty(exports2, "DeclarationRequest", { enumerable: true, get: function() {
      return protocol_declaration_1.DeclarationRequest;
    } });
    var protocol_selectionRange_1 = require_protocol_selectionRange();
    Object.defineProperty(exports2, "SelectionRangeRequest", { enumerable: true, get: function() {
      return protocol_selectionRange_1.SelectionRangeRequest;
    } });
    var protocol_progress_1 = require_protocol_progress();
    Object.defineProperty(exports2, "WorkDoneProgress", { enumerable: true, get: function() {
      return protocol_progress_1.WorkDoneProgress;
    } });
    Object.defineProperty(exports2, "WorkDoneProgressCreateRequest", { enumerable: true, get: function() {
      return protocol_progress_1.WorkDoneProgressCreateRequest;
    } });
    Object.defineProperty(exports2, "WorkDoneProgressCancelNotification", { enumerable: true, get: function() {
      return protocol_progress_1.WorkDoneProgressCancelNotification;
    } });
    var protocol_callHierarchy_1 = require_protocol_callHierarchy();
    Object.defineProperty(exports2, "CallHierarchyIncomingCallsRequest", { enumerable: true, get: function() {
      return protocol_callHierarchy_1.CallHierarchyIncomingCallsRequest;
    } });
    Object.defineProperty(exports2, "CallHierarchyOutgoingCallsRequest", { enumerable: true, get: function() {
      return protocol_callHierarchy_1.CallHierarchyOutgoingCallsRequest;
    } });
    Object.defineProperty(exports2, "CallHierarchyPrepareRequest", { enumerable: true, get: function() {
      return protocol_callHierarchy_1.CallHierarchyPrepareRequest;
    } });
    var protocol_semanticTokens_1 = require_protocol_semanticTokens();
    Object.defineProperty(exports2, "TokenFormat", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.TokenFormat;
    } });
    Object.defineProperty(exports2, "SemanticTokensRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRequest;
    } });
    Object.defineProperty(exports2, "SemanticTokensDeltaRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensDeltaRequest;
    } });
    Object.defineProperty(exports2, "SemanticTokensRangeRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRangeRequest;
    } });
    Object.defineProperty(exports2, "SemanticTokensRefreshRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRefreshRequest;
    } });
    Object.defineProperty(exports2, "SemanticTokensRegistrationType", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRegistrationType;
    } });
    var protocol_showDocument_1 = require_protocol_showDocument();
    Object.defineProperty(exports2, "ShowDocumentRequest", { enumerable: true, get: function() {
      return protocol_showDocument_1.ShowDocumentRequest;
    } });
    var protocol_linkedEditingRange_1 = require_protocol_linkedEditingRange();
    Object.defineProperty(exports2, "LinkedEditingRangeRequest", { enumerable: true, get: function() {
      return protocol_linkedEditingRange_1.LinkedEditingRangeRequest;
    } });
    var protocol_fileOperations_1 = require_protocol_fileOperations();
    Object.defineProperty(exports2, "FileOperationPatternKind", { enumerable: true, get: function() {
      return protocol_fileOperations_1.FileOperationPatternKind;
    } });
    Object.defineProperty(exports2, "DidCreateFilesNotification", { enumerable: true, get: function() {
      return protocol_fileOperations_1.DidCreateFilesNotification;
    } });
    Object.defineProperty(exports2, "WillCreateFilesRequest", { enumerable: true, get: function() {
      return protocol_fileOperations_1.WillCreateFilesRequest;
    } });
    Object.defineProperty(exports2, "DidRenameFilesNotification", { enumerable: true, get: function() {
      return protocol_fileOperations_1.DidRenameFilesNotification;
    } });
    Object.defineProperty(exports2, "WillRenameFilesRequest", { enumerable: true, get: function() {
      return protocol_fileOperations_1.WillRenameFilesRequest;
    } });
    Object.defineProperty(exports2, "DidDeleteFilesNotification", { enumerable: true, get: function() {
      return protocol_fileOperations_1.DidDeleteFilesNotification;
    } });
    Object.defineProperty(exports2, "WillDeleteFilesRequest", { enumerable: true, get: function() {
      return protocol_fileOperations_1.WillDeleteFilesRequest;
    } });
    var protocol_moniker_1 = require_protocol_moniker();
    Object.defineProperty(exports2, "UniquenessLevel", { enumerable: true, get: function() {
      return protocol_moniker_1.UniquenessLevel;
    } });
    Object.defineProperty(exports2, "MonikerKind", { enumerable: true, get: function() {
      return protocol_moniker_1.MonikerKind;
    } });
    Object.defineProperty(exports2, "MonikerRequest", { enumerable: true, get: function() {
      return protocol_moniker_1.MonikerRequest;
    } });
    var protocol_typeHierarchy_1 = require_protocol_typeHierarchy();
    Object.defineProperty(exports2, "TypeHierarchyPrepareRequest", { enumerable: true, get: function() {
      return protocol_typeHierarchy_1.TypeHierarchyPrepareRequest;
    } });
    Object.defineProperty(exports2, "TypeHierarchySubtypesRequest", { enumerable: true, get: function() {
      return protocol_typeHierarchy_1.TypeHierarchySubtypesRequest;
    } });
    Object.defineProperty(exports2, "TypeHierarchySupertypesRequest", { enumerable: true, get: function() {
      return protocol_typeHierarchy_1.TypeHierarchySupertypesRequest;
    } });
    var protocol_inlineValue_1 = require_protocol_inlineValue();
    Object.defineProperty(exports2, "InlineValueRequest", { enumerable: true, get: function() {
      return protocol_inlineValue_1.InlineValueRequest;
    } });
    Object.defineProperty(exports2, "InlineValueRefreshRequest", { enumerable: true, get: function() {
      return protocol_inlineValue_1.InlineValueRefreshRequest;
    } });
    var protocol_inlayHint_1 = require_protocol_inlayHint();
    Object.defineProperty(exports2, "InlayHintRequest", { enumerable: true, get: function() {
      return protocol_inlayHint_1.InlayHintRequest;
    } });
    Object.defineProperty(exports2, "InlayHintResolveRequest", { enumerable: true, get: function() {
      return protocol_inlayHint_1.InlayHintResolveRequest;
    } });
    Object.defineProperty(exports2, "InlayHintRefreshRequest", { enumerable: true, get: function() {
      return protocol_inlayHint_1.InlayHintRefreshRequest;
    } });
    var protocol_diagnostic_1 = require_protocol_diagnostic();
    Object.defineProperty(exports2, "DiagnosticServerCancellationData", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DiagnosticServerCancellationData;
    } });
    Object.defineProperty(exports2, "DocumentDiagnosticReportKind", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DocumentDiagnosticReportKind;
    } });
    Object.defineProperty(exports2, "DocumentDiagnosticRequest", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DocumentDiagnosticRequest;
    } });
    Object.defineProperty(exports2, "WorkspaceDiagnosticRequest", { enumerable: true, get: function() {
      return protocol_diagnostic_1.WorkspaceDiagnosticRequest;
    } });
    Object.defineProperty(exports2, "DiagnosticRefreshRequest", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DiagnosticRefreshRequest;
    } });
    var protocol_notebook_1 = require_protocol_notebook();
    Object.defineProperty(exports2, "NotebookCellKind", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookCellKind;
    } });
    Object.defineProperty(exports2, "ExecutionSummary", { enumerable: true, get: function() {
      return protocol_notebook_1.ExecutionSummary;
    } });
    Object.defineProperty(exports2, "NotebookCell", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookCell;
    } });
    Object.defineProperty(exports2, "NotebookDocument", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookDocument;
    } });
    Object.defineProperty(exports2, "NotebookDocumentSyncRegistrationType", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookDocumentSyncRegistrationType;
    } });
    Object.defineProperty(exports2, "DidOpenNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidOpenNotebookDocumentNotification;
    } });
    Object.defineProperty(exports2, "NotebookCellArrayChange", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookCellArrayChange;
    } });
    Object.defineProperty(exports2, "DidChangeNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidChangeNotebookDocumentNotification;
    } });
    Object.defineProperty(exports2, "DidSaveNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidSaveNotebookDocumentNotification;
    } });
    Object.defineProperty(exports2, "DidCloseNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidCloseNotebookDocumentNotification;
    } });
    var protocol_inlineCompletion_1 = require_protocol_inlineCompletion();
    Object.defineProperty(exports2, "InlineCompletionRequest", { enumerable: true, get: function() {
      return protocol_inlineCompletion_1.InlineCompletionRequest;
    } });
    var TextDocumentFilter;
    (function(TextDocumentFilter2) {
      function is(value) {
        const candidate = value;
        return Is.string(candidate) || (Is.string(candidate.language) || Is.string(candidate.scheme) || Is.string(candidate.pattern));
      }
      TextDocumentFilter2.is = is;
    })(TextDocumentFilter || (exports2.TextDocumentFilter = TextDocumentFilter = {}));
    var NotebookDocumentFilter;
    (function(NotebookDocumentFilter2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (Is.string(candidate.notebookType) || Is.string(candidate.scheme) || Is.string(candidate.pattern));
      }
      NotebookDocumentFilter2.is = is;
    })(NotebookDocumentFilter || (exports2.NotebookDocumentFilter = NotebookDocumentFilter = {}));
    var NotebookCellTextDocumentFilter;
    (function(NotebookCellTextDocumentFilter2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (Is.string(candidate.notebook) || NotebookDocumentFilter.is(candidate.notebook)) && (candidate.language === void 0 || Is.string(candidate.language));
      }
      NotebookCellTextDocumentFilter2.is = is;
    })(NotebookCellTextDocumentFilter || (exports2.NotebookCellTextDocumentFilter = NotebookCellTextDocumentFilter = {}));
    var DocumentSelector;
    (function(DocumentSelector2) {
      function is(value) {
        if (!Array.isArray(value)) {
          return false;
        }
        for (let elem of value) {
          if (!Is.string(elem) && !TextDocumentFilter.is(elem) && !NotebookCellTextDocumentFilter.is(elem)) {
            return false;
          }
        }
        return true;
      }
      DocumentSelector2.is = is;
    })(DocumentSelector || (exports2.DocumentSelector = DocumentSelector = {}));
    var RegistrationRequest;
    (function(RegistrationRequest2) {
      RegistrationRequest2.method = "client/registerCapability";
      RegistrationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      RegistrationRequest2.type = new messages_1.ProtocolRequestType(RegistrationRequest2.method);
    })(RegistrationRequest || (exports2.RegistrationRequest = RegistrationRequest = {}));
    var UnregistrationRequest;
    (function(UnregistrationRequest2) {
      UnregistrationRequest2.method = "client/unregisterCapability";
      UnregistrationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      UnregistrationRequest2.type = new messages_1.ProtocolRequestType(UnregistrationRequest2.method);
    })(UnregistrationRequest || (exports2.UnregistrationRequest = UnregistrationRequest = {}));
    var ResourceOperationKind;
    (function(ResourceOperationKind2) {
      ResourceOperationKind2.Create = "create";
      ResourceOperationKind2.Rename = "rename";
      ResourceOperationKind2.Delete = "delete";
    })(ResourceOperationKind || (exports2.ResourceOperationKind = ResourceOperationKind = {}));
    var FailureHandlingKind;
    (function(FailureHandlingKind2) {
      FailureHandlingKind2.Abort = "abort";
      FailureHandlingKind2.Transactional = "transactional";
      FailureHandlingKind2.TextOnlyTransactional = "textOnlyTransactional";
      FailureHandlingKind2.Undo = "undo";
    })(FailureHandlingKind || (exports2.FailureHandlingKind = FailureHandlingKind = {}));
    var PositionEncodingKind;
    (function(PositionEncodingKind2) {
      PositionEncodingKind2.UTF8 = "utf-8";
      PositionEncodingKind2.UTF16 = "utf-16";
      PositionEncodingKind2.UTF32 = "utf-32";
    })(PositionEncodingKind || (exports2.PositionEncodingKind = PositionEncodingKind = {}));
    var StaticRegistrationOptions;
    (function(StaticRegistrationOptions2) {
      function hasId(value) {
        const candidate = value;
        return candidate && Is.string(candidate.id) && candidate.id.length > 0;
      }
      StaticRegistrationOptions2.hasId = hasId;
    })(StaticRegistrationOptions || (exports2.StaticRegistrationOptions = StaticRegistrationOptions = {}));
    var TextDocumentRegistrationOptions;
    (function(TextDocumentRegistrationOptions2) {
      function is(value) {
        const candidate = value;
        return candidate && (candidate.documentSelector === null || DocumentSelector.is(candidate.documentSelector));
      }
      TextDocumentRegistrationOptions2.is = is;
    })(TextDocumentRegistrationOptions || (exports2.TextDocumentRegistrationOptions = TextDocumentRegistrationOptions = {}));
    var WorkDoneProgressOptions;
    (function(WorkDoneProgressOptions2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (candidate.workDoneProgress === void 0 || Is.boolean(candidate.workDoneProgress));
      }
      WorkDoneProgressOptions2.is = is;
      function hasWorkDoneProgress(value) {
        const candidate = value;
        return candidate && Is.boolean(candidate.workDoneProgress);
      }
      WorkDoneProgressOptions2.hasWorkDoneProgress = hasWorkDoneProgress;
    })(WorkDoneProgressOptions || (exports2.WorkDoneProgressOptions = WorkDoneProgressOptions = {}));
    var InitializeRequest;
    (function(InitializeRequest2) {
      InitializeRequest2.method = "initialize";
      InitializeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InitializeRequest2.type = new messages_1.ProtocolRequestType(InitializeRequest2.method);
    })(InitializeRequest || (exports2.InitializeRequest = InitializeRequest = {}));
    var InitializeErrorCodes;
    (function(InitializeErrorCodes2) {
      InitializeErrorCodes2.unknownProtocolVersion = 1;
    })(InitializeErrorCodes || (exports2.InitializeErrorCodes = InitializeErrorCodes = {}));
    var InitializedNotification;
    (function(InitializedNotification2) {
      InitializedNotification2.method = "initialized";
      InitializedNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      InitializedNotification2.type = new messages_1.ProtocolNotificationType(InitializedNotification2.method);
    })(InitializedNotification || (exports2.InitializedNotification = InitializedNotification = {}));
    var ShutdownRequest;
    (function(ShutdownRequest2) {
      ShutdownRequest2.method = "shutdown";
      ShutdownRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ShutdownRequest2.type = new messages_1.ProtocolRequestType0(ShutdownRequest2.method);
    })(ShutdownRequest || (exports2.ShutdownRequest = ShutdownRequest = {}));
    var ExitNotification;
    (function(ExitNotification2) {
      ExitNotification2.method = "exit";
      ExitNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      ExitNotification2.type = new messages_1.ProtocolNotificationType0(ExitNotification2.method);
    })(ExitNotification || (exports2.ExitNotification = ExitNotification = {}));
    var DidChangeConfigurationNotification2;
    (function(DidChangeConfigurationNotification3) {
      DidChangeConfigurationNotification3.method = "workspace/didChangeConfiguration";
      DidChangeConfigurationNotification3.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeConfigurationNotification3.type = new messages_1.ProtocolNotificationType(DidChangeConfigurationNotification3.method);
    })(DidChangeConfigurationNotification2 || (exports2.DidChangeConfigurationNotification = DidChangeConfigurationNotification2 = {}));
    var MessageType;
    (function(MessageType2) {
      MessageType2.Error = 1;
      MessageType2.Warning = 2;
      MessageType2.Info = 3;
      MessageType2.Log = 4;
      MessageType2.Debug = 5;
    })(MessageType || (exports2.MessageType = MessageType = {}));
    var ShowMessageNotification;
    (function(ShowMessageNotification2) {
      ShowMessageNotification2.method = "window/showMessage";
      ShowMessageNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      ShowMessageNotification2.type = new messages_1.ProtocolNotificationType(ShowMessageNotification2.method);
    })(ShowMessageNotification || (exports2.ShowMessageNotification = ShowMessageNotification = {}));
    var ShowMessageRequest;
    (function(ShowMessageRequest2) {
      ShowMessageRequest2.method = "window/showMessageRequest";
      ShowMessageRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ShowMessageRequest2.type = new messages_1.ProtocolRequestType(ShowMessageRequest2.method);
    })(ShowMessageRequest || (exports2.ShowMessageRequest = ShowMessageRequest = {}));
    var LogMessageNotification;
    (function(LogMessageNotification2) {
      LogMessageNotification2.method = "window/logMessage";
      LogMessageNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      LogMessageNotification2.type = new messages_1.ProtocolNotificationType(LogMessageNotification2.method);
    })(LogMessageNotification || (exports2.LogMessageNotification = LogMessageNotification = {}));
    var TelemetryEventNotification;
    (function(TelemetryEventNotification2) {
      TelemetryEventNotification2.method = "telemetry/event";
      TelemetryEventNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      TelemetryEventNotification2.type = new messages_1.ProtocolNotificationType(TelemetryEventNotification2.method);
    })(TelemetryEventNotification || (exports2.TelemetryEventNotification = TelemetryEventNotification = {}));
    var TextDocumentSyncKind;
    (function(TextDocumentSyncKind2) {
      TextDocumentSyncKind2.None = 0;
      TextDocumentSyncKind2.Full = 1;
      TextDocumentSyncKind2.Incremental = 2;
    })(TextDocumentSyncKind || (exports2.TextDocumentSyncKind = TextDocumentSyncKind = {}));
    var DidOpenTextDocumentNotification;
    (function(DidOpenTextDocumentNotification2) {
      DidOpenTextDocumentNotification2.method = "textDocument/didOpen";
      DidOpenTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidOpenTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidOpenTextDocumentNotification2.method);
    })(DidOpenTextDocumentNotification || (exports2.DidOpenTextDocumentNotification = DidOpenTextDocumentNotification = {}));
    var TextDocumentContentChangeEvent;
    (function(TextDocumentContentChangeEvent2) {
      function isIncremental(event) {
        let candidate = event;
        return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range !== void 0 && (candidate.rangeLength === void 0 || typeof candidate.rangeLength === "number");
      }
      TextDocumentContentChangeEvent2.isIncremental = isIncremental;
      function isFull(event) {
        let candidate = event;
        return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range === void 0 && candidate.rangeLength === void 0;
      }
      TextDocumentContentChangeEvent2.isFull = isFull;
    })(TextDocumentContentChangeEvent || (exports2.TextDocumentContentChangeEvent = TextDocumentContentChangeEvent = {}));
    var DidChangeTextDocumentNotification;
    (function(DidChangeTextDocumentNotification2) {
      DidChangeTextDocumentNotification2.method = "textDocument/didChange";
      DidChangeTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidChangeTextDocumentNotification2.method);
    })(DidChangeTextDocumentNotification || (exports2.DidChangeTextDocumentNotification = DidChangeTextDocumentNotification = {}));
    var DidCloseTextDocumentNotification;
    (function(DidCloseTextDocumentNotification2) {
      DidCloseTextDocumentNotification2.method = "textDocument/didClose";
      DidCloseTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidCloseTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidCloseTextDocumentNotification2.method);
    })(DidCloseTextDocumentNotification || (exports2.DidCloseTextDocumentNotification = DidCloseTextDocumentNotification = {}));
    var DidSaveTextDocumentNotification;
    (function(DidSaveTextDocumentNotification2) {
      DidSaveTextDocumentNotification2.method = "textDocument/didSave";
      DidSaveTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidSaveTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidSaveTextDocumentNotification2.method);
    })(DidSaveTextDocumentNotification || (exports2.DidSaveTextDocumentNotification = DidSaveTextDocumentNotification = {}));
    var TextDocumentSaveReason;
    (function(TextDocumentSaveReason2) {
      TextDocumentSaveReason2.Manual = 1;
      TextDocumentSaveReason2.AfterDelay = 2;
      TextDocumentSaveReason2.FocusOut = 3;
    })(TextDocumentSaveReason || (exports2.TextDocumentSaveReason = TextDocumentSaveReason = {}));
    var WillSaveTextDocumentNotification;
    (function(WillSaveTextDocumentNotification2) {
      WillSaveTextDocumentNotification2.method = "textDocument/willSave";
      WillSaveTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillSaveTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(WillSaveTextDocumentNotification2.method);
    })(WillSaveTextDocumentNotification || (exports2.WillSaveTextDocumentNotification = WillSaveTextDocumentNotification = {}));
    var WillSaveTextDocumentWaitUntilRequest;
    (function(WillSaveTextDocumentWaitUntilRequest2) {
      WillSaveTextDocumentWaitUntilRequest2.method = "textDocument/willSaveWaitUntil";
      WillSaveTextDocumentWaitUntilRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillSaveTextDocumentWaitUntilRequest2.type = new messages_1.ProtocolRequestType(WillSaveTextDocumentWaitUntilRequest2.method);
    })(WillSaveTextDocumentWaitUntilRequest || (exports2.WillSaveTextDocumentWaitUntilRequest = WillSaveTextDocumentWaitUntilRequest = {}));
    var DidChangeWatchedFilesNotification;
    (function(DidChangeWatchedFilesNotification2) {
      DidChangeWatchedFilesNotification2.method = "workspace/didChangeWatchedFiles";
      DidChangeWatchedFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeWatchedFilesNotification2.type = new messages_1.ProtocolNotificationType(DidChangeWatchedFilesNotification2.method);
    })(DidChangeWatchedFilesNotification || (exports2.DidChangeWatchedFilesNotification = DidChangeWatchedFilesNotification = {}));
    var FileChangeType;
    (function(FileChangeType2) {
      FileChangeType2.Created = 1;
      FileChangeType2.Changed = 2;
      FileChangeType2.Deleted = 3;
    })(FileChangeType || (exports2.FileChangeType = FileChangeType = {}));
    var RelativePattern;
    (function(RelativePattern2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (vscode_languageserver_types_1.URI.is(candidate.baseUri) || vscode_languageserver_types_1.WorkspaceFolder.is(candidate.baseUri)) && Is.string(candidate.pattern);
      }
      RelativePattern2.is = is;
    })(RelativePattern || (exports2.RelativePattern = RelativePattern = {}));
    var WatchKind;
    (function(WatchKind2) {
      WatchKind2.Create = 1;
      WatchKind2.Change = 2;
      WatchKind2.Delete = 4;
    })(WatchKind || (exports2.WatchKind = WatchKind = {}));
    var PublishDiagnosticsNotification;
    (function(PublishDiagnosticsNotification2) {
      PublishDiagnosticsNotification2.method = "textDocument/publishDiagnostics";
      PublishDiagnosticsNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      PublishDiagnosticsNotification2.type = new messages_1.ProtocolNotificationType(PublishDiagnosticsNotification2.method);
    })(PublishDiagnosticsNotification || (exports2.PublishDiagnosticsNotification = PublishDiagnosticsNotification = {}));
    var CompletionTriggerKind;
    (function(CompletionTriggerKind2) {
      CompletionTriggerKind2.Invoked = 1;
      CompletionTriggerKind2.TriggerCharacter = 2;
      CompletionTriggerKind2.TriggerForIncompleteCompletions = 3;
    })(CompletionTriggerKind || (exports2.CompletionTriggerKind = CompletionTriggerKind = {}));
    var CompletionRequest;
    (function(CompletionRequest2) {
      CompletionRequest2.method = "textDocument/completion";
      CompletionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CompletionRequest2.type = new messages_1.ProtocolRequestType(CompletionRequest2.method);
    })(CompletionRequest || (exports2.CompletionRequest = CompletionRequest = {}));
    var CompletionResolveRequest;
    (function(CompletionResolveRequest2) {
      CompletionResolveRequest2.method = "completionItem/resolve";
      CompletionResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CompletionResolveRequest2.type = new messages_1.ProtocolRequestType(CompletionResolveRequest2.method);
    })(CompletionResolveRequest || (exports2.CompletionResolveRequest = CompletionResolveRequest = {}));
    var HoverRequest;
    (function(HoverRequest2) {
      HoverRequest2.method = "textDocument/hover";
      HoverRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      HoverRequest2.type = new messages_1.ProtocolRequestType(HoverRequest2.method);
    })(HoverRequest || (exports2.HoverRequest = HoverRequest = {}));
    var SignatureHelpTriggerKind;
    (function(SignatureHelpTriggerKind2) {
      SignatureHelpTriggerKind2.Invoked = 1;
      SignatureHelpTriggerKind2.TriggerCharacter = 2;
      SignatureHelpTriggerKind2.ContentChange = 3;
    })(SignatureHelpTriggerKind || (exports2.SignatureHelpTriggerKind = SignatureHelpTriggerKind = {}));
    var SignatureHelpRequest;
    (function(SignatureHelpRequest2) {
      SignatureHelpRequest2.method = "textDocument/signatureHelp";
      SignatureHelpRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SignatureHelpRequest2.type = new messages_1.ProtocolRequestType(SignatureHelpRequest2.method);
    })(SignatureHelpRequest || (exports2.SignatureHelpRequest = SignatureHelpRequest = {}));
    var DefinitionRequest;
    (function(DefinitionRequest2) {
      DefinitionRequest2.method = "textDocument/definition";
      DefinitionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DefinitionRequest2.type = new messages_1.ProtocolRequestType(DefinitionRequest2.method);
    })(DefinitionRequest || (exports2.DefinitionRequest = DefinitionRequest = {}));
    var ReferencesRequest;
    (function(ReferencesRequest2) {
      ReferencesRequest2.method = "textDocument/references";
      ReferencesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ReferencesRequest2.type = new messages_1.ProtocolRequestType(ReferencesRequest2.method);
    })(ReferencesRequest || (exports2.ReferencesRequest = ReferencesRequest = {}));
    var DocumentHighlightRequest;
    (function(DocumentHighlightRequest2) {
      DocumentHighlightRequest2.method = "textDocument/documentHighlight";
      DocumentHighlightRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentHighlightRequest2.type = new messages_1.ProtocolRequestType(DocumentHighlightRequest2.method);
    })(DocumentHighlightRequest || (exports2.DocumentHighlightRequest = DocumentHighlightRequest = {}));
    var DocumentSymbolRequest;
    (function(DocumentSymbolRequest2) {
      DocumentSymbolRequest2.method = "textDocument/documentSymbol";
      DocumentSymbolRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentSymbolRequest2.type = new messages_1.ProtocolRequestType(DocumentSymbolRequest2.method);
    })(DocumentSymbolRequest || (exports2.DocumentSymbolRequest = DocumentSymbolRequest = {}));
    var CodeActionRequest;
    (function(CodeActionRequest2) {
      CodeActionRequest2.method = "textDocument/codeAction";
      CodeActionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeActionRequest2.type = new messages_1.ProtocolRequestType(CodeActionRequest2.method);
    })(CodeActionRequest || (exports2.CodeActionRequest = CodeActionRequest = {}));
    var CodeActionResolveRequest;
    (function(CodeActionResolveRequest2) {
      CodeActionResolveRequest2.method = "codeAction/resolve";
      CodeActionResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeActionResolveRequest2.type = new messages_1.ProtocolRequestType(CodeActionResolveRequest2.method);
    })(CodeActionResolveRequest || (exports2.CodeActionResolveRequest = CodeActionResolveRequest = {}));
    var WorkspaceSymbolRequest;
    (function(WorkspaceSymbolRequest2) {
      WorkspaceSymbolRequest2.method = "workspace/symbol";
      WorkspaceSymbolRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkspaceSymbolRequest2.type = new messages_1.ProtocolRequestType(WorkspaceSymbolRequest2.method);
    })(WorkspaceSymbolRequest || (exports2.WorkspaceSymbolRequest = WorkspaceSymbolRequest = {}));
    var WorkspaceSymbolResolveRequest;
    (function(WorkspaceSymbolResolveRequest2) {
      WorkspaceSymbolResolveRequest2.method = "workspaceSymbol/resolve";
      WorkspaceSymbolResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkspaceSymbolResolveRequest2.type = new messages_1.ProtocolRequestType(WorkspaceSymbolResolveRequest2.method);
    })(WorkspaceSymbolResolveRequest || (exports2.WorkspaceSymbolResolveRequest = WorkspaceSymbolResolveRequest = {}));
    var CodeLensRequest;
    (function(CodeLensRequest2) {
      CodeLensRequest2.method = "textDocument/codeLens";
      CodeLensRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeLensRequest2.type = new messages_1.ProtocolRequestType(CodeLensRequest2.method);
    })(CodeLensRequest || (exports2.CodeLensRequest = CodeLensRequest = {}));
    var CodeLensResolveRequest;
    (function(CodeLensResolveRequest2) {
      CodeLensResolveRequest2.method = "codeLens/resolve";
      CodeLensResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeLensResolveRequest2.type = new messages_1.ProtocolRequestType(CodeLensResolveRequest2.method);
    })(CodeLensResolveRequest || (exports2.CodeLensResolveRequest = CodeLensResolveRequest = {}));
    var CodeLensRefreshRequest;
    (function(CodeLensRefreshRequest2) {
      CodeLensRefreshRequest2.method = `workspace/codeLens/refresh`;
      CodeLensRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      CodeLensRefreshRequest2.type = new messages_1.ProtocolRequestType0(CodeLensRefreshRequest2.method);
    })(CodeLensRefreshRequest || (exports2.CodeLensRefreshRequest = CodeLensRefreshRequest = {}));
    var DocumentLinkRequest;
    (function(DocumentLinkRequest2) {
      DocumentLinkRequest2.method = "textDocument/documentLink";
      DocumentLinkRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentLinkRequest2.type = new messages_1.ProtocolRequestType(DocumentLinkRequest2.method);
    })(DocumentLinkRequest || (exports2.DocumentLinkRequest = DocumentLinkRequest = {}));
    var DocumentLinkResolveRequest;
    (function(DocumentLinkResolveRequest2) {
      DocumentLinkResolveRequest2.method = "documentLink/resolve";
      DocumentLinkResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentLinkResolveRequest2.type = new messages_1.ProtocolRequestType(DocumentLinkResolveRequest2.method);
    })(DocumentLinkResolveRequest || (exports2.DocumentLinkResolveRequest = DocumentLinkResolveRequest = {}));
    var DocumentFormattingRequest;
    (function(DocumentFormattingRequest2) {
      DocumentFormattingRequest2.method = "textDocument/formatting";
      DocumentFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentFormattingRequest2.method);
    })(DocumentFormattingRequest || (exports2.DocumentFormattingRequest = DocumentFormattingRequest = {}));
    var DocumentRangeFormattingRequest;
    (function(DocumentRangeFormattingRequest2) {
      DocumentRangeFormattingRequest2.method = "textDocument/rangeFormatting";
      DocumentRangeFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentRangeFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentRangeFormattingRequest2.method);
    })(DocumentRangeFormattingRequest || (exports2.DocumentRangeFormattingRequest = DocumentRangeFormattingRequest = {}));
    var DocumentRangesFormattingRequest;
    (function(DocumentRangesFormattingRequest2) {
      DocumentRangesFormattingRequest2.method = "textDocument/rangesFormatting";
      DocumentRangesFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentRangesFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentRangesFormattingRequest2.method);
    })(DocumentRangesFormattingRequest || (exports2.DocumentRangesFormattingRequest = DocumentRangesFormattingRequest = {}));
    var DocumentOnTypeFormattingRequest;
    (function(DocumentOnTypeFormattingRequest2) {
      DocumentOnTypeFormattingRequest2.method = "textDocument/onTypeFormatting";
      DocumentOnTypeFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentOnTypeFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentOnTypeFormattingRequest2.method);
    })(DocumentOnTypeFormattingRequest || (exports2.DocumentOnTypeFormattingRequest = DocumentOnTypeFormattingRequest = {}));
    var PrepareSupportDefaultBehavior;
    (function(PrepareSupportDefaultBehavior2) {
      PrepareSupportDefaultBehavior2.Identifier = 1;
    })(PrepareSupportDefaultBehavior || (exports2.PrepareSupportDefaultBehavior = PrepareSupportDefaultBehavior = {}));
    var RenameRequest;
    (function(RenameRequest2) {
      RenameRequest2.method = "textDocument/rename";
      RenameRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      RenameRequest2.type = new messages_1.ProtocolRequestType(RenameRequest2.method);
    })(RenameRequest || (exports2.RenameRequest = RenameRequest = {}));
    var PrepareRenameRequest;
    (function(PrepareRenameRequest2) {
      PrepareRenameRequest2.method = "textDocument/prepareRename";
      PrepareRenameRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      PrepareRenameRequest2.type = new messages_1.ProtocolRequestType(PrepareRenameRequest2.method);
    })(PrepareRenameRequest || (exports2.PrepareRenameRequest = PrepareRenameRequest = {}));
    var ExecuteCommandRequest;
    (function(ExecuteCommandRequest2) {
      ExecuteCommandRequest2.method = "workspace/executeCommand";
      ExecuteCommandRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ExecuteCommandRequest2.type = new messages_1.ProtocolRequestType(ExecuteCommandRequest2.method);
    })(ExecuteCommandRequest || (exports2.ExecuteCommandRequest = ExecuteCommandRequest = {}));
    var ApplyWorkspaceEditRequest;
    (function(ApplyWorkspaceEditRequest2) {
      ApplyWorkspaceEditRequest2.method = "workspace/applyEdit";
      ApplyWorkspaceEditRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ApplyWorkspaceEditRequest2.type = new messages_1.ProtocolRequestType("workspace/applyEdit");
    })(ApplyWorkspaceEditRequest || (exports2.ApplyWorkspaceEditRequest = ApplyWorkspaceEditRequest = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/connection.js
var require_connection2 = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/connection.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createProtocolConnection = void 0;
    var vscode_jsonrpc_1 = require_main();
    function createProtocolConnection(input, output, logger, options) {
      if (vscode_jsonrpc_1.ConnectionStrategy.is(options)) {
        options = { connectionStrategy: options };
      }
      return (0, vscode_jsonrpc_1.createMessageConnection)(input, output, logger, options);
    }
    exports2.createProtocolConnection = createProtocolConnection;
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/common/api.js
var require_api2 = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/common/api.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LSPErrorCodes = exports2.createProtocolConnection = void 0;
    __exportStar(require_main(), exports2);
    __exportStar(require_main2(), exports2);
    __exportStar(require_messages2(), exports2);
    __exportStar(require_protocol(), exports2);
    var connection_1 = require_connection2();
    Object.defineProperty(exports2, "createProtocolConnection", { enumerable: true, get: function() {
      return connection_1.createProtocolConnection;
    } });
    var LSPErrorCodes;
    (function(LSPErrorCodes2) {
      LSPErrorCodes2.lspReservedErrorRangeStart = -32899;
      LSPErrorCodes2.RequestFailed = -32803;
      LSPErrorCodes2.ServerCancelled = -32802;
      LSPErrorCodes2.ContentModified = -32801;
      LSPErrorCodes2.RequestCancelled = -32800;
      LSPErrorCodes2.lspReservedErrorRangeEnd = -32800;
    })(LSPErrorCodes || (exports2.LSPErrorCodes = LSPErrorCodes = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/lib/node/main.js
var require_main3 = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/lib/node/main.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createProtocolConnection = void 0;
    var node_1 = require_node();
    __exportStar(require_node(), exports2);
    __exportStar(require_api2(), exports2);
    function createProtocolConnection(input, output, logger, options) {
      return (0, node_1.createMessageConnection)(input, output, logger, options);
    }
    exports2.createProtocolConnection = createProtocolConnection;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/utils/uuid.js
var require_uuid = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/utils/uuid.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.generateUuid = exports2.parse = exports2.isUUID = exports2.v4 = exports2.empty = void 0;
    var ValueUUID = class {
      constructor(_value) {
        this._value = _value;
      }
      asHex() {
        return this._value;
      }
      equals(other) {
        return this.asHex() === other.asHex();
      }
    };
    var V4UUID = class _V4UUID extends ValueUUID {
      static _oneOf(array) {
        return array[Math.floor(array.length * Math.random())];
      }
      static _randomHex() {
        return _V4UUID._oneOf(_V4UUID._chars);
      }
      constructor() {
        super([
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          "-",
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          "-",
          "4",
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          "-",
          _V4UUID._oneOf(_V4UUID._timeHighBits),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          "-",
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex()
        ].join(""));
      }
    };
    V4UUID._chars = ["0", "1", "2", "3", "4", "5", "6", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    V4UUID._timeHighBits = ["8", "9", "a", "b"];
    exports2.empty = new ValueUUID("00000000-0000-0000-0000-000000000000");
    function v4() {
      return new V4UUID();
    }
    exports2.v4 = v4;
    var _UUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    function isUUID(value) {
      return _UUIDPattern.test(value);
    }
    exports2.isUUID = isUUID;
    function parse(value) {
      if (!isUUID(value)) {
        throw new Error("invalid uuid");
      }
      return new ValueUUID(value);
    }
    exports2.parse = parse;
    function generateUuid() {
      return v4().asHex();
    }
    exports2.generateUuid = generateUuid;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/progress.js
var require_progress = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/progress.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.attachPartialResult = exports2.ProgressFeature = exports2.attachWorkDone = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var uuid_1 = require_uuid();
    var WorkDoneProgressReporterImpl = class _WorkDoneProgressReporterImpl {
      constructor(_connection, _token) {
        this._connection = _connection;
        this._token = _token;
        _WorkDoneProgressReporterImpl.Instances.set(this._token, this);
      }
      begin(title, percentage, message, cancellable) {
        let param = {
          kind: "begin",
          title,
          percentage,
          message,
          cancellable
        };
        this._connection.sendProgress(vscode_languageserver_protocol_1.WorkDoneProgress.type, this._token, param);
      }
      report(arg0, arg1) {
        let param = {
          kind: "report"
        };
        if (typeof arg0 === "number") {
          param.percentage = arg0;
          if (arg1 !== void 0) {
            param.message = arg1;
          }
        } else {
          param.message = arg0;
        }
        this._connection.sendProgress(vscode_languageserver_protocol_1.WorkDoneProgress.type, this._token, param);
      }
      done() {
        _WorkDoneProgressReporterImpl.Instances.delete(this._token);
        this._connection.sendProgress(vscode_languageserver_protocol_1.WorkDoneProgress.type, this._token, { kind: "end" });
      }
    };
    WorkDoneProgressReporterImpl.Instances = /* @__PURE__ */ new Map();
    var WorkDoneProgressServerReporterImpl = class extends WorkDoneProgressReporterImpl {
      constructor(connection2, token) {
        super(connection2, token);
        this._source = new vscode_languageserver_protocol_1.CancellationTokenSource();
      }
      get token() {
        return this._source.token;
      }
      done() {
        this._source.dispose();
        super.done();
      }
      cancel() {
        this._source.cancel();
      }
    };
    var NullProgressReporter = class {
      constructor() {
      }
      begin() {
      }
      report() {
      }
      done() {
      }
    };
    var NullProgressServerReporter = class extends NullProgressReporter {
      constructor() {
        super();
        this._source = new vscode_languageserver_protocol_1.CancellationTokenSource();
      }
      get token() {
        return this._source.token;
      }
      done() {
        this._source.dispose();
      }
      cancel() {
        this._source.cancel();
      }
    };
    function attachWorkDone(connection2, params) {
      if (params === void 0 || params.workDoneToken === void 0) {
        return new NullProgressReporter();
      }
      const token = params.workDoneToken;
      delete params.workDoneToken;
      return new WorkDoneProgressReporterImpl(connection2, token);
    }
    exports2.attachWorkDone = attachWorkDone;
    var ProgressFeature = (Base) => {
      return class extends Base {
        constructor() {
          super();
          this._progressSupported = false;
        }
        initialize(capabilities) {
          super.initialize(capabilities);
          if (capabilities?.window?.workDoneProgress === true) {
            this._progressSupported = true;
            this.connection.onNotification(vscode_languageserver_protocol_1.WorkDoneProgressCancelNotification.type, (params) => {
              let progress = WorkDoneProgressReporterImpl.Instances.get(params.token);
              if (progress instanceof WorkDoneProgressServerReporterImpl || progress instanceof NullProgressServerReporter) {
                progress.cancel();
              }
            });
          }
        }
        attachWorkDoneProgress(token) {
          if (token === void 0) {
            return new NullProgressReporter();
          } else {
            return new WorkDoneProgressReporterImpl(this.connection, token);
          }
        }
        createWorkDoneProgress() {
          if (this._progressSupported) {
            const token = (0, uuid_1.generateUuid)();
            return this.connection.sendRequest(vscode_languageserver_protocol_1.WorkDoneProgressCreateRequest.type, { token }).then(() => {
              const result = new WorkDoneProgressServerReporterImpl(this.connection, token);
              return result;
            });
          } else {
            return Promise.resolve(new NullProgressServerReporter());
          }
        }
      };
    };
    exports2.ProgressFeature = ProgressFeature;
    var ResultProgress;
    (function(ResultProgress2) {
      ResultProgress2.type = new vscode_languageserver_protocol_1.ProgressType();
    })(ResultProgress || (ResultProgress = {}));
    var ResultProgressReporterImpl = class {
      constructor(_connection, _token) {
        this._connection = _connection;
        this._token = _token;
      }
      report(data) {
        this._connection.sendProgress(ResultProgress.type, this._token, data);
      }
    };
    function attachPartialResult(connection2, params) {
      if (params === void 0 || params.partialResultToken === void 0) {
        return void 0;
      }
      const token = params.partialResultToken;
      delete params.partialResultToken;
      return new ResultProgressReporterImpl(connection2, token);
    }
    exports2.attachPartialResult = attachPartialResult;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/configuration.js
var require_configuration = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/configuration.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConfigurationFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var Is = require_is();
    var ConfigurationFeature = (Base) => {
      return class extends Base {
        getConfiguration(arg) {
          if (!arg) {
            return this._getConfiguration({});
          } else if (Is.string(arg)) {
            return this._getConfiguration({ section: arg });
          } else {
            return this._getConfiguration(arg);
          }
        }
        _getConfiguration(arg) {
          let params = {
            items: Array.isArray(arg) ? arg : [arg]
          };
          return this.connection.sendRequest(vscode_languageserver_protocol_1.ConfigurationRequest.type, params).then((result) => {
            if (Array.isArray(result)) {
              return Array.isArray(arg) ? result : result[0];
            } else {
              return Array.isArray(arg) ? [] : null;
            }
          });
        }
      };
    };
    exports2.ConfigurationFeature = ConfigurationFeature;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/workspaceFolder.js
var require_workspaceFolder = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/workspaceFolder.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkspaceFoldersFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var WorkspaceFoldersFeature = (Base) => {
      return class extends Base {
        constructor() {
          super();
          this._notificationIsAutoRegistered = false;
        }
        initialize(capabilities) {
          super.initialize(capabilities);
          let workspaceCapabilities = capabilities.workspace;
          if (workspaceCapabilities && workspaceCapabilities.workspaceFolders) {
            this._onDidChangeWorkspaceFolders = new vscode_languageserver_protocol_1.Emitter();
            this.connection.onNotification(vscode_languageserver_protocol_1.DidChangeWorkspaceFoldersNotification.type, (params) => {
              this._onDidChangeWorkspaceFolders.fire(params.event);
            });
          }
        }
        fillServerCapabilities(capabilities) {
          super.fillServerCapabilities(capabilities);
          const changeNotifications = capabilities.workspace?.workspaceFolders?.changeNotifications;
          this._notificationIsAutoRegistered = changeNotifications === true || typeof changeNotifications === "string";
        }
        getWorkspaceFolders() {
          return this.connection.sendRequest(vscode_languageserver_protocol_1.WorkspaceFoldersRequest.type);
        }
        get onDidChangeWorkspaceFolders() {
          if (!this._onDidChangeWorkspaceFolders) {
            throw new Error("Client doesn't support sending workspace folder change events.");
          }
          if (!this._notificationIsAutoRegistered && !this._unregistration) {
            this._unregistration = this.connection.client.register(vscode_languageserver_protocol_1.DidChangeWorkspaceFoldersNotification.type);
          }
          return this._onDidChangeWorkspaceFolders.event;
        }
      };
    };
    exports2.WorkspaceFoldersFeature = WorkspaceFoldersFeature;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/callHierarchy.js
var require_callHierarchy = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/callHierarchy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CallHierarchyFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var CallHierarchyFeature = (Base) => {
      return class extends Base {
        get callHierarchy() {
          return {
            onPrepare: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.CallHierarchyPrepareRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), void 0);
              });
            },
            onIncomingCalls: (handler) => {
              const type = vscode_languageserver_protocol_1.CallHierarchyIncomingCallsRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            },
            onOutgoingCalls: (handler) => {
              const type = vscode_languageserver_protocol_1.CallHierarchyOutgoingCallsRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            }
          };
        }
      };
    };
    exports2.CallHierarchyFeature = CallHierarchyFeature;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/semanticTokens.js
var require_semanticTokens = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/semanticTokens.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SemanticTokensBuilder = exports2.SemanticTokensDiff = exports2.SemanticTokensFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var SemanticTokensFeature = (Base) => {
      return class extends Base {
        get semanticTokens() {
          return {
            refresh: () => {
              return this.connection.sendRequest(vscode_languageserver_protocol_1.SemanticTokensRefreshRequest.type);
            },
            on: (handler) => {
              const type = vscode_languageserver_protocol_1.SemanticTokensRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            },
            onDelta: (handler) => {
              const type = vscode_languageserver_protocol_1.SemanticTokensDeltaRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            },
            onRange: (handler) => {
              const type = vscode_languageserver_protocol_1.SemanticTokensRangeRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            }
          };
        }
      };
    };
    exports2.SemanticTokensFeature = SemanticTokensFeature;
    var SemanticTokensDiff = class {
      constructor(originalSequence, modifiedSequence) {
        this.originalSequence = originalSequence;
        this.modifiedSequence = modifiedSequence;
      }
      computeDiff() {
        const originalLength = this.originalSequence.length;
        const modifiedLength = this.modifiedSequence.length;
        let startIndex = 0;
        while (startIndex < modifiedLength && startIndex < originalLength && this.originalSequence[startIndex] === this.modifiedSequence[startIndex]) {
          startIndex++;
        }
        if (startIndex < modifiedLength && startIndex < originalLength) {
          let originalEndIndex = originalLength - 1;
          let modifiedEndIndex = modifiedLength - 1;
          while (originalEndIndex >= startIndex && modifiedEndIndex >= startIndex && this.originalSequence[originalEndIndex] === this.modifiedSequence[modifiedEndIndex]) {
            originalEndIndex--;
            modifiedEndIndex--;
          }
          if (originalEndIndex < startIndex || modifiedEndIndex < startIndex) {
            originalEndIndex++;
            modifiedEndIndex++;
          }
          const deleteCount = originalEndIndex - startIndex + 1;
          const newData = this.modifiedSequence.slice(startIndex, modifiedEndIndex + 1);
          if (newData.length === 1 && newData[0] === this.originalSequence[originalEndIndex]) {
            return [
              { start: startIndex, deleteCount: deleteCount - 1 }
            ];
          } else {
            return [
              { start: startIndex, deleteCount, data: newData }
            ];
          }
        } else if (startIndex < modifiedLength) {
          return [
            { start: startIndex, deleteCount: 0, data: this.modifiedSequence.slice(startIndex) }
          ];
        } else if (startIndex < originalLength) {
          return [
            { start: startIndex, deleteCount: originalLength - startIndex }
          ];
        } else {
          return [];
        }
      }
    };
    exports2.SemanticTokensDiff = SemanticTokensDiff;
    var SemanticTokensBuilder = class {
      constructor() {
        this._prevData = void 0;
        this.initialize();
      }
      initialize() {
        this._id = Date.now();
        this._prevLine = 0;
        this._prevChar = 0;
        this._data = [];
        this._dataLen = 0;
      }
      push(line, char, length, tokenType, tokenModifiers) {
        let pushLine = line;
        let pushChar = char;
        if (this._dataLen > 0) {
          pushLine -= this._prevLine;
          if (pushLine === 0) {
            pushChar -= this._prevChar;
          }
        }
        this._data[this._dataLen++] = pushLine;
        this._data[this._dataLen++] = pushChar;
        this._data[this._dataLen++] = length;
        this._data[this._dataLen++] = tokenType;
        this._data[this._dataLen++] = tokenModifiers;
        this._prevLine = line;
        this._prevChar = char;
      }
      get id() {
        return this._id.toString();
      }
      previousResult(id) {
        if (this.id === id) {
          this._prevData = this._data;
        }
        this.initialize();
      }
      build() {
        this._prevData = void 0;
        return {
          resultId: this.id,
          data: this._data
        };
      }
      canBuildEdits() {
        return this._prevData !== void 0;
      }
      buildEdits() {
        if (this._prevData !== void 0) {
          return {
            resultId: this.id,
            edits: new SemanticTokensDiff(this._prevData, this._data).computeDiff()
          };
        } else {
          return this.build();
        }
      }
    };
    exports2.SemanticTokensBuilder = SemanticTokensBuilder;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/showDocument.js
var require_showDocument = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/showDocument.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ShowDocumentFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var ShowDocumentFeature = (Base) => {
      return class extends Base {
        showDocument(params) {
          return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowDocumentRequest.type, params);
        }
      };
    };
    exports2.ShowDocumentFeature = ShowDocumentFeature;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/fileOperations.js
var require_fileOperations = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/fileOperations.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FileOperationsFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var FileOperationsFeature = (Base) => {
      return class extends Base {
        onDidCreateFiles(handler) {
          return this.connection.onNotification(vscode_languageserver_protocol_1.DidCreateFilesNotification.type, (params) => {
            handler(params);
          });
        }
        onDidRenameFiles(handler) {
          return this.connection.onNotification(vscode_languageserver_protocol_1.DidRenameFilesNotification.type, (params) => {
            handler(params);
          });
        }
        onDidDeleteFiles(handler) {
          return this.connection.onNotification(vscode_languageserver_protocol_1.DidDeleteFilesNotification.type, (params) => {
            handler(params);
          });
        }
        onWillCreateFiles(handler) {
          return this.connection.onRequest(vscode_languageserver_protocol_1.WillCreateFilesRequest.type, (params, cancel) => {
            return handler(params, cancel);
          });
        }
        onWillRenameFiles(handler) {
          return this.connection.onRequest(vscode_languageserver_protocol_1.WillRenameFilesRequest.type, (params, cancel) => {
            return handler(params, cancel);
          });
        }
        onWillDeleteFiles(handler) {
          return this.connection.onRequest(vscode_languageserver_protocol_1.WillDeleteFilesRequest.type, (params, cancel) => {
            return handler(params, cancel);
          });
        }
      };
    };
    exports2.FileOperationsFeature = FileOperationsFeature;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/linkedEditingRange.js
var require_linkedEditingRange = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/linkedEditingRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LinkedEditingRangeFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var LinkedEditingRangeFeature = (Base) => {
      return class extends Base {
        onLinkedEditingRange(handler) {
          return this.connection.onRequest(vscode_languageserver_protocol_1.LinkedEditingRangeRequest.type, (params, cancel) => {
            return handler(params, cancel, this.attachWorkDoneProgress(params), void 0);
          });
        }
      };
    };
    exports2.LinkedEditingRangeFeature = LinkedEditingRangeFeature;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/typeHierarchy.js
var require_typeHierarchy = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/typeHierarchy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeHierarchyFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var TypeHierarchyFeature = (Base) => {
      return class extends Base {
        get typeHierarchy() {
          return {
            onPrepare: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.TypeHierarchyPrepareRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), void 0);
              });
            },
            onSupertypes: (handler) => {
              const type = vscode_languageserver_protocol_1.TypeHierarchySupertypesRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            },
            onSubtypes: (handler) => {
              const type = vscode_languageserver_protocol_1.TypeHierarchySubtypesRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            }
          };
        }
      };
    };
    exports2.TypeHierarchyFeature = TypeHierarchyFeature;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/inlineValue.js
var require_inlineValue = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/inlineValue.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlineValueFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var InlineValueFeature = (Base) => {
      return class extends Base {
        get inlineValue() {
          return {
            refresh: () => {
              return this.connection.sendRequest(vscode_languageserver_protocol_1.InlineValueRefreshRequest.type);
            },
            on: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.InlineValueRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params));
              });
            }
          };
        }
      };
    };
    exports2.InlineValueFeature = InlineValueFeature;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/foldingRange.js
var require_foldingRange = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/foldingRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FoldingRangeFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var FoldingRangeFeature = (Base) => {
      return class extends Base {
        get foldingRange() {
          return {
            refresh: () => {
              return this.connection.sendRequest(vscode_languageserver_protocol_1.FoldingRangeRefreshRequest.type);
            },
            on: (handler) => {
              const type = vscode_languageserver_protocol_1.FoldingRangeRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            }
          };
        }
      };
    };
    exports2.FoldingRangeFeature = FoldingRangeFeature;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/inlayHint.js
var require_inlayHint = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/inlayHint.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlayHintFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var InlayHintFeature = (Base) => {
      return class extends Base {
        get inlayHint() {
          return {
            refresh: () => {
              return this.connection.sendRequest(vscode_languageserver_protocol_1.InlayHintRefreshRequest.type);
            },
            on: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.InlayHintRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params));
              });
            },
            resolve: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.InlayHintResolveRequest.type, (params, cancel) => {
                return handler(params, cancel);
              });
            }
          };
        }
      };
    };
    exports2.InlayHintFeature = InlayHintFeature;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/diagnostic.js
var require_diagnostic = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/diagnostic.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DiagnosticFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var DiagnosticFeature = (Base) => {
      return class extends Base {
        get diagnostics() {
          return {
            refresh: () => {
              return this.connection.sendRequest(vscode_languageserver_protocol_1.DiagnosticRefreshRequest.type);
            },
            on: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.DocumentDiagnosticRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(vscode_languageserver_protocol_1.DocumentDiagnosticRequest.partialResult, params));
              });
            },
            onWorkspace: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.WorkspaceDiagnosticRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(vscode_languageserver_protocol_1.WorkspaceDiagnosticRequest.partialResult, params));
              });
            }
          };
        }
      };
    };
    exports2.DiagnosticFeature = DiagnosticFeature;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/textDocuments.js
var require_textDocuments = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/textDocuments.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TextDocuments = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var TextDocuments2 = class {
      /**
       * Create a new text document manager.
       */
      constructor(configuration) {
        this._configuration = configuration;
        this._syncedDocuments = /* @__PURE__ */ new Map();
        this._onDidChangeContent = new vscode_languageserver_protocol_1.Emitter();
        this._onDidOpen = new vscode_languageserver_protocol_1.Emitter();
        this._onDidClose = new vscode_languageserver_protocol_1.Emitter();
        this._onDidSave = new vscode_languageserver_protocol_1.Emitter();
        this._onWillSave = new vscode_languageserver_protocol_1.Emitter();
      }
      /**
       * An event that fires when a text document managed by this manager
       * has been opened.
       */
      get onDidOpen() {
        return this._onDidOpen.event;
      }
      /**
       * An event that fires when a text document managed by this manager
       * has been opened or the content changes.
       */
      get onDidChangeContent() {
        return this._onDidChangeContent.event;
      }
      /**
       * An event that fires when a text document managed by this manager
       * will be saved.
       */
      get onWillSave() {
        return this._onWillSave.event;
      }
      /**
       * Sets a handler that will be called if a participant wants to provide
       * edits during a text document save.
       */
      onWillSaveWaitUntil(handler) {
        this._willSaveWaitUntil = handler;
      }
      /**
       * An event that fires when a text document managed by this manager
       * has been saved.
       */
      get onDidSave() {
        return this._onDidSave.event;
      }
      /**
       * An event that fires when a text document managed by this manager
       * has been closed.
       */
      get onDidClose() {
        return this._onDidClose.event;
      }
      /**
       * Returns the document for the given URI. Returns undefined if
       * the document is not managed by this instance.
       *
       * @param uri The text document's URI to retrieve.
       * @return the text document or `undefined`.
       */
      get(uri) {
        return this._syncedDocuments.get(uri);
      }
      /**
       * Returns all text documents managed by this instance.
       *
       * @return all text documents.
       */
      all() {
        return Array.from(this._syncedDocuments.values());
      }
      /**
       * Returns the URIs of all text documents managed by this instance.
       *
       * @return the URI's of all text documents.
       */
      keys() {
        return Array.from(this._syncedDocuments.keys());
      }
      /**
       * Listens for `low level` notification on the given connection to
       * update the text documents managed by this instance.
       *
       * Please note that the connection only provides handlers not an event model. Therefore
       * listening on a connection will overwrite the following handlers on a connection:
       * `onDidOpenTextDocument`, `onDidChangeTextDocument`, `onDidCloseTextDocument`,
       * `onWillSaveTextDocument`, `onWillSaveTextDocumentWaitUntil` and `onDidSaveTextDocument`.
       *
       * Use the corresponding events on the TextDocuments instance instead.
       *
       * @param connection The connection to listen on.
       */
      listen(connection2) {
        connection2.__textDocumentSync = vscode_languageserver_protocol_1.TextDocumentSyncKind.Incremental;
        const disposables = [];
        disposables.push(connection2.onDidOpenTextDocument((event) => {
          const td = event.textDocument;
          const document2 = this._configuration.create(td.uri, td.languageId, td.version, td.text);
          this._syncedDocuments.set(td.uri, document2);
          const toFire = Object.freeze({ document: document2 });
          this._onDidOpen.fire(toFire);
          this._onDidChangeContent.fire(toFire);
        }));
        disposables.push(connection2.onDidChangeTextDocument((event) => {
          const td = event.textDocument;
          const changes = event.contentChanges;
          if (changes.length === 0) {
            return;
          }
          const { version } = td;
          if (version === null || version === void 0) {
            throw new Error(`Received document change event for ${td.uri} without valid version identifier`);
          }
          let syncedDocument = this._syncedDocuments.get(td.uri);
          if (syncedDocument !== void 0) {
            syncedDocument = this._configuration.update(syncedDocument, changes, version);
            this._syncedDocuments.set(td.uri, syncedDocument);
            this._onDidChangeContent.fire(Object.freeze({ document: syncedDocument }));
          }
        }));
        disposables.push(connection2.onDidCloseTextDocument((event) => {
          let syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
          if (syncedDocument !== void 0) {
            this._syncedDocuments.delete(event.textDocument.uri);
            this._onDidClose.fire(Object.freeze({ document: syncedDocument }));
          }
        }));
        disposables.push(connection2.onWillSaveTextDocument((event) => {
          let syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
          if (syncedDocument !== void 0) {
            this._onWillSave.fire(Object.freeze({ document: syncedDocument, reason: event.reason }));
          }
        }));
        disposables.push(connection2.onWillSaveTextDocumentWaitUntil((event, token) => {
          let syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
          if (syncedDocument !== void 0 && this._willSaveWaitUntil) {
            return this._willSaveWaitUntil(Object.freeze({ document: syncedDocument, reason: event.reason }), token);
          } else {
            return [];
          }
        }));
        disposables.push(connection2.onDidSaveTextDocument((event) => {
          let syncedDocument = this._syncedDocuments.get(event.textDocument.uri);
          if (syncedDocument !== void 0) {
            this._onDidSave.fire(Object.freeze({ document: syncedDocument }));
          }
        }));
        return vscode_languageserver_protocol_1.Disposable.create(() => {
          disposables.forEach((disposable) => disposable.dispose());
        });
      }
    };
    exports2.TextDocuments = TextDocuments2;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/notebook.js
var require_notebook = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/notebook.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NotebookDocuments = exports2.NotebookSyncFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var textDocuments_1 = require_textDocuments();
    var NotebookSyncFeature = (Base) => {
      return class extends Base {
        get synchronization() {
          return {
            onDidOpenNotebookDocument: (handler) => {
              return this.connection.onNotification(vscode_languageserver_protocol_1.DidOpenNotebookDocumentNotification.type, (params) => {
                handler(params);
              });
            },
            onDidChangeNotebookDocument: (handler) => {
              return this.connection.onNotification(vscode_languageserver_protocol_1.DidChangeNotebookDocumentNotification.type, (params) => {
                handler(params);
              });
            },
            onDidSaveNotebookDocument: (handler) => {
              return this.connection.onNotification(vscode_languageserver_protocol_1.DidSaveNotebookDocumentNotification.type, (params) => {
                handler(params);
              });
            },
            onDidCloseNotebookDocument: (handler) => {
              return this.connection.onNotification(vscode_languageserver_protocol_1.DidCloseNotebookDocumentNotification.type, (params) => {
                handler(params);
              });
            }
          };
        }
      };
    };
    exports2.NotebookSyncFeature = NotebookSyncFeature;
    var CellTextDocumentConnection = class _CellTextDocumentConnection {
      onDidOpenTextDocument(handler) {
        this.openHandler = handler;
        return vscode_languageserver_protocol_1.Disposable.create(() => {
          this.openHandler = void 0;
        });
      }
      openTextDocument(params) {
        this.openHandler && this.openHandler(params);
      }
      onDidChangeTextDocument(handler) {
        this.changeHandler = handler;
        return vscode_languageserver_protocol_1.Disposable.create(() => {
          this.changeHandler = handler;
        });
      }
      changeTextDocument(params) {
        this.changeHandler && this.changeHandler(params);
      }
      onDidCloseTextDocument(handler) {
        this.closeHandler = handler;
        return vscode_languageserver_protocol_1.Disposable.create(() => {
          this.closeHandler = void 0;
        });
      }
      closeTextDocument(params) {
        this.closeHandler && this.closeHandler(params);
      }
      onWillSaveTextDocument() {
        return _CellTextDocumentConnection.NULL_DISPOSE;
      }
      onWillSaveTextDocumentWaitUntil() {
        return _CellTextDocumentConnection.NULL_DISPOSE;
      }
      onDidSaveTextDocument() {
        return _CellTextDocumentConnection.NULL_DISPOSE;
      }
    };
    CellTextDocumentConnection.NULL_DISPOSE = Object.freeze({ dispose: () => {
    } });
    var NotebookDocuments = class {
      constructor(configurationOrTextDocuments) {
        if (configurationOrTextDocuments instanceof textDocuments_1.TextDocuments) {
          this._cellTextDocuments = configurationOrTextDocuments;
        } else {
          this._cellTextDocuments = new textDocuments_1.TextDocuments(configurationOrTextDocuments);
        }
        this.notebookDocuments = /* @__PURE__ */ new Map();
        this.notebookCellMap = /* @__PURE__ */ new Map();
        this._onDidOpen = new vscode_languageserver_protocol_1.Emitter();
        this._onDidChange = new vscode_languageserver_protocol_1.Emitter();
        this._onDidSave = new vscode_languageserver_protocol_1.Emitter();
        this._onDidClose = new vscode_languageserver_protocol_1.Emitter();
      }
      get cellTextDocuments() {
        return this._cellTextDocuments;
      }
      getCellTextDocument(cell) {
        return this._cellTextDocuments.get(cell.document);
      }
      getNotebookDocument(uri) {
        return this.notebookDocuments.get(uri);
      }
      getNotebookCell(uri) {
        const value = this.notebookCellMap.get(uri);
        return value && value[0];
      }
      findNotebookDocumentForCell(cell) {
        const key = typeof cell === "string" ? cell : cell.document;
        const value = this.notebookCellMap.get(key);
        return value && value[1];
      }
      get onDidOpen() {
        return this._onDidOpen.event;
      }
      get onDidSave() {
        return this._onDidSave.event;
      }
      get onDidChange() {
        return this._onDidChange.event;
      }
      get onDidClose() {
        return this._onDidClose.event;
      }
      /**
       * Listens for `low level` notification on the given connection to
       * update the notebook documents managed by this instance.
       *
       * Please note that the connection only provides handlers not an event model. Therefore
       * listening on a connection will overwrite the following handlers on a connection:
       * `onDidOpenNotebookDocument`, `onDidChangeNotebookDocument`, `onDidSaveNotebookDocument`,
       *  and `onDidCloseNotebookDocument`.
       *
       * @param connection The connection to listen on.
       */
      listen(connection2) {
        const cellTextDocumentConnection = new CellTextDocumentConnection();
        const disposables = [];
        disposables.push(this.cellTextDocuments.listen(cellTextDocumentConnection));
        disposables.push(connection2.notebooks.synchronization.onDidOpenNotebookDocument((params) => {
          this.notebookDocuments.set(params.notebookDocument.uri, params.notebookDocument);
          for (const cellTextDocument of params.cellTextDocuments) {
            cellTextDocumentConnection.openTextDocument({ textDocument: cellTextDocument });
          }
          this.updateCellMap(params.notebookDocument);
          this._onDidOpen.fire(params.notebookDocument);
        }));
        disposables.push(connection2.notebooks.synchronization.onDidChangeNotebookDocument((params) => {
          const notebookDocument = this.notebookDocuments.get(params.notebookDocument.uri);
          if (notebookDocument === void 0) {
            return;
          }
          notebookDocument.version = params.notebookDocument.version;
          const oldMetadata = notebookDocument.metadata;
          let metadataChanged = false;
          const change = params.change;
          if (change.metadata !== void 0) {
            metadataChanged = true;
            notebookDocument.metadata = change.metadata;
          }
          const opened = [];
          const closed = [];
          const data = [];
          const text = [];
          if (change.cells !== void 0) {
            const changedCells = change.cells;
            if (changedCells.structure !== void 0) {
              const array = changedCells.structure.array;
              notebookDocument.cells.splice(array.start, array.deleteCount, ...array.cells !== void 0 ? array.cells : []);
              if (changedCells.structure.didOpen !== void 0) {
                for (const open of changedCells.structure.didOpen) {
                  cellTextDocumentConnection.openTextDocument({ textDocument: open });
                  opened.push(open.uri);
                }
              }
              if (changedCells.structure.didClose) {
                for (const close of changedCells.structure.didClose) {
                  cellTextDocumentConnection.closeTextDocument({ textDocument: close });
                  closed.push(close.uri);
                }
              }
            }
            if (changedCells.data !== void 0) {
              const cellUpdates = new Map(changedCells.data.map((cell) => [cell.document, cell]));
              for (let i = 0; i <= notebookDocument.cells.length; i++) {
                const change2 = cellUpdates.get(notebookDocument.cells[i].document);
                if (change2 !== void 0) {
                  const old = notebookDocument.cells.splice(i, 1, change2);
                  data.push({ old: old[0], new: change2 });
                  cellUpdates.delete(change2.document);
                  if (cellUpdates.size === 0) {
                    break;
                  }
                }
              }
            }
            if (changedCells.textContent !== void 0) {
              for (const cellTextDocument of changedCells.textContent) {
                cellTextDocumentConnection.changeTextDocument({ textDocument: cellTextDocument.document, contentChanges: cellTextDocument.changes });
                text.push(cellTextDocument.document.uri);
              }
            }
          }
          this.updateCellMap(notebookDocument);
          const changeEvent = { notebookDocument };
          if (metadataChanged) {
            changeEvent.metadata = { old: oldMetadata, new: notebookDocument.metadata };
          }
          const added = [];
          for (const open of opened) {
            added.push(this.getNotebookCell(open));
          }
          const removed = [];
          for (const close of closed) {
            removed.push(this.getNotebookCell(close));
          }
          const textContent = [];
          for (const change2 of text) {
            textContent.push(this.getNotebookCell(change2));
          }
          if (added.length > 0 || removed.length > 0 || data.length > 0 || textContent.length > 0) {
            changeEvent.cells = { added, removed, changed: { data, textContent } };
          }
          if (changeEvent.metadata !== void 0 || changeEvent.cells !== void 0) {
            this._onDidChange.fire(changeEvent);
          }
        }));
        disposables.push(connection2.notebooks.synchronization.onDidSaveNotebookDocument((params) => {
          const notebookDocument = this.notebookDocuments.get(params.notebookDocument.uri);
          if (notebookDocument === void 0) {
            return;
          }
          this._onDidSave.fire(notebookDocument);
        }));
        disposables.push(connection2.notebooks.synchronization.onDidCloseNotebookDocument((params) => {
          const notebookDocument = this.notebookDocuments.get(params.notebookDocument.uri);
          if (notebookDocument === void 0) {
            return;
          }
          this._onDidClose.fire(notebookDocument);
          for (const cellTextDocument of params.cellTextDocuments) {
            cellTextDocumentConnection.closeTextDocument({ textDocument: cellTextDocument });
          }
          this.notebookDocuments.delete(params.notebookDocument.uri);
          for (const cell of notebookDocument.cells) {
            this.notebookCellMap.delete(cell.document);
          }
        }));
        return vscode_languageserver_protocol_1.Disposable.create(() => {
          disposables.forEach((disposable) => disposable.dispose());
        });
      }
      updateCellMap(notebookDocument) {
        for (const cell of notebookDocument.cells) {
          this.notebookCellMap.set(cell.document, [cell, notebookDocument]);
        }
      }
    };
    exports2.NotebookDocuments = NotebookDocuments;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/moniker.js
var require_moniker = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/moniker.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MonikerFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var MonikerFeature = (Base) => {
      return class extends Base {
        get moniker() {
          return {
            on: (handler) => {
              const type = vscode_languageserver_protocol_1.MonikerRequest.type;
              return this.connection.onRequest(type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params), this.attachPartialResultProgress(type, params));
              });
            }
          };
        }
      };
    };
    exports2.MonikerFeature = MonikerFeature;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/server.js
var require_server = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/server.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createConnection = exports2.combineFeatures = exports2.combineNotebooksFeatures = exports2.combineLanguagesFeatures = exports2.combineWorkspaceFeatures = exports2.combineWindowFeatures = exports2.combineClientFeatures = exports2.combineTracerFeatures = exports2.combineTelemetryFeatures = exports2.combineConsoleFeatures = exports2._NotebooksImpl = exports2._LanguagesImpl = exports2.BulkUnregistration = exports2.BulkRegistration = exports2.ErrorMessageTracker = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var Is = require_is();
    var UUID = require_uuid();
    var progress_1 = require_progress();
    var configuration_1 = require_configuration();
    var workspaceFolder_1 = require_workspaceFolder();
    var callHierarchy_1 = require_callHierarchy();
    var semanticTokens_1 = require_semanticTokens();
    var showDocument_1 = require_showDocument();
    var fileOperations_1 = require_fileOperations();
    var linkedEditingRange_1 = require_linkedEditingRange();
    var typeHierarchy_1 = require_typeHierarchy();
    var inlineValue_1 = require_inlineValue();
    var foldingRange_1 = require_foldingRange();
    var inlayHint_1 = require_inlayHint();
    var diagnostic_1 = require_diagnostic();
    var notebook_1 = require_notebook();
    var moniker_1 = require_moniker();
    function null2Undefined(value) {
      if (value === null) {
        return void 0;
      }
      return value;
    }
    var ErrorMessageTracker = class {
      constructor() {
        this._messages = /* @__PURE__ */ Object.create(null);
      }
      /**
       * Add a message to the tracker.
       *
       * @param message The message to add.
       */
      add(message) {
        let count = this._messages[message];
        if (!count) {
          count = 0;
        }
        count++;
        this._messages[message] = count;
      }
      /**
       * Send all tracked messages to the connection's window.
       *
       * @param connection The connection established between client and server.
       */
      sendErrors(connection2) {
        Object.keys(this._messages).forEach((message) => {
          connection2.window.showErrorMessage(message);
        });
      }
    };
    exports2.ErrorMessageTracker = ErrorMessageTracker;
    var RemoteConsoleImpl = class {
      constructor() {
      }
      rawAttach(connection2) {
        this._rawConnection = connection2;
      }
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      fillServerCapabilities(_capabilities) {
      }
      initialize(_capabilities) {
      }
      error(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Error, message);
      }
      warn(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Warning, message);
      }
      info(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Info, message);
      }
      log(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Log, message);
      }
      debug(message) {
        this.send(vscode_languageserver_protocol_1.MessageType.Debug, message);
      }
      send(type, message) {
        if (this._rawConnection) {
          this._rawConnection.sendNotification(vscode_languageserver_protocol_1.LogMessageNotification.type, { type, message }).catch(() => {
            (0, vscode_languageserver_protocol_1.RAL)().console.error(`Sending log message failed`);
          });
        }
      }
    };
    var _RemoteWindowImpl = class {
      constructor() {
      }
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      initialize(_capabilities) {
      }
      fillServerCapabilities(_capabilities) {
      }
      showErrorMessage(message, ...actions) {
        let params = { type: vscode_languageserver_protocol_1.MessageType.Error, message, actions };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowMessageRequest.type, params).then(null2Undefined);
      }
      showWarningMessage(message, ...actions) {
        let params = { type: vscode_languageserver_protocol_1.MessageType.Warning, message, actions };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowMessageRequest.type, params).then(null2Undefined);
      }
      showInformationMessage(message, ...actions) {
        let params = { type: vscode_languageserver_protocol_1.MessageType.Info, message, actions };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.ShowMessageRequest.type, params).then(null2Undefined);
      }
    };
    var RemoteWindowImpl = (0, showDocument_1.ShowDocumentFeature)((0, progress_1.ProgressFeature)(_RemoteWindowImpl));
    var BulkRegistration;
    (function(BulkRegistration2) {
      function create() {
        return new BulkRegistrationImpl();
      }
      BulkRegistration2.create = create;
    })(BulkRegistration || (exports2.BulkRegistration = BulkRegistration = {}));
    var BulkRegistrationImpl = class {
      constructor() {
        this._registrations = [];
        this._registered = /* @__PURE__ */ new Set();
      }
      add(type, registerOptions) {
        const method = Is.string(type) ? type : type.method;
        if (this._registered.has(method)) {
          throw new Error(`${method} is already added to this registration`);
        }
        const id = UUID.generateUuid();
        this._registrations.push({
          id,
          method,
          registerOptions: registerOptions || {}
        });
        this._registered.add(method);
      }
      asRegistrationParams() {
        return {
          registrations: this._registrations
        };
      }
    };
    var BulkUnregistration;
    (function(BulkUnregistration2) {
      function create() {
        return new BulkUnregistrationImpl(void 0, []);
      }
      BulkUnregistration2.create = create;
    })(BulkUnregistration || (exports2.BulkUnregistration = BulkUnregistration = {}));
    var BulkUnregistrationImpl = class {
      constructor(_connection, unregistrations) {
        this._connection = _connection;
        this._unregistrations = /* @__PURE__ */ new Map();
        unregistrations.forEach((unregistration) => {
          this._unregistrations.set(unregistration.method, unregistration);
        });
      }
      get isAttached() {
        return !!this._connection;
      }
      attach(connection2) {
        this._connection = connection2;
      }
      add(unregistration) {
        this._unregistrations.set(unregistration.method, unregistration);
      }
      dispose() {
        let unregistrations = [];
        for (let unregistration of this._unregistrations.values()) {
          unregistrations.push(unregistration);
        }
        let params = {
          unregisterations: unregistrations
        };
        this._connection.sendRequest(vscode_languageserver_protocol_1.UnregistrationRequest.type, params).catch(() => {
          this._connection.console.info(`Bulk unregistration failed.`);
        });
      }
      disposeSingle(arg) {
        const method = Is.string(arg) ? arg : arg.method;
        const unregistration = this._unregistrations.get(method);
        if (!unregistration) {
          return false;
        }
        let params = {
          unregisterations: [unregistration]
        };
        this._connection.sendRequest(vscode_languageserver_protocol_1.UnregistrationRequest.type, params).then(() => {
          this._unregistrations.delete(method);
        }, (_error) => {
          this._connection.console.info(`Un-registering request handler for ${unregistration.id} failed.`);
        });
        return true;
      }
    };
    var RemoteClientImpl = class {
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      initialize(_capabilities) {
      }
      fillServerCapabilities(_capabilities) {
      }
      register(typeOrRegistrations, registerOptionsOrType, registerOptions) {
        if (typeOrRegistrations instanceof BulkRegistrationImpl) {
          return this.registerMany(typeOrRegistrations);
        } else if (typeOrRegistrations instanceof BulkUnregistrationImpl) {
          return this.registerSingle1(typeOrRegistrations, registerOptionsOrType, registerOptions);
        } else {
          return this.registerSingle2(typeOrRegistrations, registerOptionsOrType);
        }
      }
      registerSingle1(unregistration, type, registerOptions) {
        const method = Is.string(type) ? type : type.method;
        const id = UUID.generateUuid();
        let params = {
          registrations: [{ id, method, registerOptions: registerOptions || {} }]
        };
        if (!unregistration.isAttached) {
          unregistration.attach(this.connection);
        }
        return this.connection.sendRequest(vscode_languageserver_protocol_1.RegistrationRequest.type, params).then((_result) => {
          unregistration.add({ id, method });
          return unregistration;
        }, (_error) => {
          this.connection.console.info(`Registering request handler for ${method} failed.`);
          return Promise.reject(_error);
        });
      }
      registerSingle2(type, registerOptions) {
        const method = Is.string(type) ? type : type.method;
        const id = UUID.generateUuid();
        let params = {
          registrations: [{ id, method, registerOptions: registerOptions || {} }]
        };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.RegistrationRequest.type, params).then((_result) => {
          return vscode_languageserver_protocol_1.Disposable.create(() => {
            this.unregisterSingle(id, method).catch(() => {
              this.connection.console.info(`Un-registering capability with id ${id} failed.`);
            });
          });
        }, (_error) => {
          this.connection.console.info(`Registering request handler for ${method} failed.`);
          return Promise.reject(_error);
        });
      }
      unregisterSingle(id, method) {
        let params = {
          unregisterations: [{ id, method }]
        };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.UnregistrationRequest.type, params).catch(() => {
          this.connection.console.info(`Un-registering request handler for ${id} failed.`);
        });
      }
      registerMany(registrations) {
        let params = registrations.asRegistrationParams();
        return this.connection.sendRequest(vscode_languageserver_protocol_1.RegistrationRequest.type, params).then(() => {
          return new BulkUnregistrationImpl(this._connection, params.registrations.map((registration) => {
            return { id: registration.id, method: registration.method };
          }));
        }, (_error) => {
          this.connection.console.info(`Bulk registration failed.`);
          return Promise.reject(_error);
        });
      }
    };
    var _RemoteWorkspaceImpl = class {
      constructor() {
      }
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      initialize(_capabilities) {
      }
      fillServerCapabilities(_capabilities) {
      }
      applyEdit(paramOrEdit) {
        function isApplyWorkspaceEditParams(value) {
          return value && !!value.edit;
        }
        let params = isApplyWorkspaceEditParams(paramOrEdit) ? paramOrEdit : { edit: paramOrEdit };
        return this.connection.sendRequest(vscode_languageserver_protocol_1.ApplyWorkspaceEditRequest.type, params);
      }
    };
    var RemoteWorkspaceImpl = (0, fileOperations_1.FileOperationsFeature)((0, workspaceFolder_1.WorkspaceFoldersFeature)((0, configuration_1.ConfigurationFeature)(_RemoteWorkspaceImpl)));
    var TracerImpl = class {
      constructor() {
        this._trace = vscode_languageserver_protocol_1.Trace.Off;
      }
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      initialize(_capabilities) {
      }
      fillServerCapabilities(_capabilities) {
      }
      set trace(value) {
        this._trace = value;
      }
      log(message, verbose) {
        if (this._trace === vscode_languageserver_protocol_1.Trace.Off) {
          return;
        }
        this.connection.sendNotification(vscode_languageserver_protocol_1.LogTraceNotification.type, {
          message,
          verbose: this._trace === vscode_languageserver_protocol_1.Trace.Verbose ? verbose : void 0
        }).catch(() => {
        });
      }
    };
    var TelemetryImpl = class {
      constructor() {
      }
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      initialize(_capabilities) {
      }
      fillServerCapabilities(_capabilities) {
      }
      logEvent(data) {
        this.connection.sendNotification(vscode_languageserver_protocol_1.TelemetryEventNotification.type, data).catch(() => {
          this.connection.console.log(`Sending TelemetryEventNotification failed`);
        });
      }
    };
    var _LanguagesImpl = class {
      constructor() {
      }
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      initialize(_capabilities) {
      }
      fillServerCapabilities(_capabilities) {
      }
      attachWorkDoneProgress(params) {
        return (0, progress_1.attachWorkDone)(this.connection, params);
      }
      attachPartialResultProgress(_type, params) {
        return (0, progress_1.attachPartialResult)(this.connection, params);
      }
    };
    exports2._LanguagesImpl = _LanguagesImpl;
    var LanguagesImpl = (0, foldingRange_1.FoldingRangeFeature)((0, moniker_1.MonikerFeature)((0, diagnostic_1.DiagnosticFeature)((0, inlayHint_1.InlayHintFeature)((0, inlineValue_1.InlineValueFeature)((0, typeHierarchy_1.TypeHierarchyFeature)((0, linkedEditingRange_1.LinkedEditingRangeFeature)((0, semanticTokens_1.SemanticTokensFeature)((0, callHierarchy_1.CallHierarchyFeature)(_LanguagesImpl)))))))));
    var _NotebooksImpl = class {
      constructor() {
      }
      attach(connection2) {
        this._connection = connection2;
      }
      get connection() {
        if (!this._connection) {
          throw new Error("Remote is not attached to a connection yet.");
        }
        return this._connection;
      }
      initialize(_capabilities) {
      }
      fillServerCapabilities(_capabilities) {
      }
      attachWorkDoneProgress(params) {
        return (0, progress_1.attachWorkDone)(this.connection, params);
      }
      attachPartialResultProgress(_type, params) {
        return (0, progress_1.attachPartialResult)(this.connection, params);
      }
    };
    exports2._NotebooksImpl = _NotebooksImpl;
    var NotebooksImpl = (0, notebook_1.NotebookSyncFeature)(_NotebooksImpl);
    function combineConsoleFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineConsoleFeatures = combineConsoleFeatures;
    function combineTelemetryFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineTelemetryFeatures = combineTelemetryFeatures;
    function combineTracerFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineTracerFeatures = combineTracerFeatures;
    function combineClientFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineClientFeatures = combineClientFeatures;
    function combineWindowFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineWindowFeatures = combineWindowFeatures;
    function combineWorkspaceFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineWorkspaceFeatures = combineWorkspaceFeatures;
    function combineLanguagesFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineLanguagesFeatures = combineLanguagesFeatures;
    function combineNotebooksFeatures(one, two) {
      return function(Base) {
        return two(one(Base));
      };
    }
    exports2.combineNotebooksFeatures = combineNotebooksFeatures;
    function combineFeatures(one, two) {
      function combine(one2, two2, func) {
        if (one2 && two2) {
          return func(one2, two2);
        } else if (one2) {
          return one2;
        } else {
          return two2;
        }
      }
      let result = {
        __brand: "features",
        console: combine(one.console, two.console, combineConsoleFeatures),
        tracer: combine(one.tracer, two.tracer, combineTracerFeatures),
        telemetry: combine(one.telemetry, two.telemetry, combineTelemetryFeatures),
        client: combine(one.client, two.client, combineClientFeatures),
        window: combine(one.window, two.window, combineWindowFeatures),
        workspace: combine(one.workspace, two.workspace, combineWorkspaceFeatures),
        languages: combine(one.languages, two.languages, combineLanguagesFeatures),
        notebooks: combine(one.notebooks, two.notebooks, combineNotebooksFeatures)
      };
      return result;
    }
    exports2.combineFeatures = combineFeatures;
    function createConnection2(connectionFactory, watchDog, factories) {
      const logger = factories && factories.console ? new (factories.console(RemoteConsoleImpl))() : new RemoteConsoleImpl();
      const connection2 = connectionFactory(logger);
      logger.rawAttach(connection2);
      const tracer = factories && factories.tracer ? new (factories.tracer(TracerImpl))() : new TracerImpl();
      const telemetry = factories && factories.telemetry ? new (factories.telemetry(TelemetryImpl))() : new TelemetryImpl();
      const client = factories && factories.client ? new (factories.client(RemoteClientImpl))() : new RemoteClientImpl();
      const remoteWindow = factories && factories.window ? new (factories.window(RemoteWindowImpl))() : new RemoteWindowImpl();
      const workspace2 = factories && factories.workspace ? new (factories.workspace(RemoteWorkspaceImpl))() : new RemoteWorkspaceImpl();
      const languages = factories && factories.languages ? new (factories.languages(LanguagesImpl))() : new LanguagesImpl();
      const notebooks = factories && factories.notebooks ? new (factories.notebooks(NotebooksImpl))() : new NotebooksImpl();
      const allRemotes = [logger, tracer, telemetry, client, remoteWindow, workspace2, languages, notebooks];
      function asPromise(value) {
        if (value instanceof Promise) {
          return value;
        } else if (Is.thenable(value)) {
          return new Promise((resolve, reject) => {
            value.then((resolved) => resolve(resolved), (error) => reject(error));
          });
        } else {
          return Promise.resolve(value);
        }
      }
      let shutdownHandler = void 0;
      let initializeHandler = void 0;
      let exitHandler = void 0;
      let protocolConnection = {
        listen: () => connection2.listen(),
        sendRequest: (type, ...params) => connection2.sendRequest(Is.string(type) ? type : type.method, ...params),
        onRequest: (type, handler) => connection2.onRequest(type, handler),
        sendNotification: (type, param) => {
          const method = Is.string(type) ? type : type.method;
          return connection2.sendNotification(method, param);
        },
        onNotification: (type, handler) => connection2.onNotification(type, handler),
        onProgress: connection2.onProgress,
        sendProgress: connection2.sendProgress,
        onInitialize: (handler) => {
          initializeHandler = handler;
          return {
            dispose: () => {
              initializeHandler = void 0;
            }
          };
        },
        onInitialized: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.InitializedNotification.type, handler),
        onShutdown: (handler) => {
          shutdownHandler = handler;
          return {
            dispose: () => {
              shutdownHandler = void 0;
            }
          };
        },
        onExit: (handler) => {
          exitHandler = handler;
          return {
            dispose: () => {
              exitHandler = void 0;
            }
          };
        },
        get console() {
          return logger;
        },
        get telemetry() {
          return telemetry;
        },
        get tracer() {
          return tracer;
        },
        get client() {
          return client;
        },
        get window() {
          return remoteWindow;
        },
        get workspace() {
          return workspace2;
        },
        get languages() {
          return languages;
        },
        get notebooks() {
          return notebooks;
        },
        onDidChangeConfiguration: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.DidChangeConfigurationNotification.type, handler),
        onDidChangeWatchedFiles: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.DidChangeWatchedFilesNotification.type, handler),
        __textDocumentSync: void 0,
        onDidOpenTextDocument: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.DidOpenTextDocumentNotification.type, handler),
        onDidChangeTextDocument: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.DidChangeTextDocumentNotification.type, handler),
        onDidCloseTextDocument: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.DidCloseTextDocumentNotification.type, handler),
        onWillSaveTextDocument: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.WillSaveTextDocumentNotification.type, handler),
        onWillSaveTextDocumentWaitUntil: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.WillSaveTextDocumentWaitUntilRequest.type, handler),
        onDidSaveTextDocument: (handler) => connection2.onNotification(vscode_languageserver_protocol_1.DidSaveTextDocumentNotification.type, handler),
        sendDiagnostics: (params) => connection2.sendNotification(vscode_languageserver_protocol_1.PublishDiagnosticsNotification.type, params),
        onHover: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.HoverRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), void 0);
        }),
        onCompletion: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.CompletionRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onCompletionResolve: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.CompletionResolveRequest.type, handler),
        onSignatureHelp: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.SignatureHelpRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), void 0);
        }),
        onDeclaration: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DeclarationRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onDefinition: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DefinitionRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onTypeDefinition: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.TypeDefinitionRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onImplementation: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.ImplementationRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onReferences: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.ReferencesRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onDocumentHighlight: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentHighlightRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onDocumentSymbol: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentSymbolRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onWorkspaceSymbol: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.WorkspaceSymbolRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onWorkspaceSymbolResolve: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.WorkspaceSymbolResolveRequest.type, handler),
        onCodeAction: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.CodeActionRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onCodeActionResolve: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.CodeActionResolveRequest.type, (params, cancel) => {
          return handler(params, cancel);
        }),
        onCodeLens: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.CodeLensRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onCodeLensResolve: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.CodeLensResolveRequest.type, (params, cancel) => {
          return handler(params, cancel);
        }),
        onDocumentFormatting: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentFormattingRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), void 0);
        }),
        onDocumentRangeFormatting: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentRangeFormattingRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), void 0);
        }),
        onDocumentOnTypeFormatting: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentOnTypeFormattingRequest.type, (params, cancel) => {
          return handler(params, cancel);
        }),
        onRenameRequest: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.RenameRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), void 0);
        }),
        onPrepareRename: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.PrepareRenameRequest.type, (params, cancel) => {
          return handler(params, cancel);
        }),
        onDocumentLinks: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentLinkRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onDocumentLinkResolve: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentLinkResolveRequest.type, (params, cancel) => {
          return handler(params, cancel);
        }),
        onDocumentColor: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.DocumentColorRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onColorPresentation: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.ColorPresentationRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onFoldingRanges: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.FoldingRangeRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onSelectionRanges: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.SelectionRangeRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), (0, progress_1.attachPartialResult)(connection2, params));
        }),
        onExecuteCommand: (handler) => connection2.onRequest(vscode_languageserver_protocol_1.ExecuteCommandRequest.type, (params, cancel) => {
          return handler(params, cancel, (0, progress_1.attachWorkDone)(connection2, params), void 0);
        }),
        dispose: () => connection2.dispose()
      };
      for (let remote of allRemotes) {
        remote.attach(protocolConnection);
      }
      connection2.onRequest(vscode_languageserver_protocol_1.InitializeRequest.type, (params) => {
        watchDog.initialize(params);
        if (Is.string(params.trace)) {
          tracer.trace = vscode_languageserver_protocol_1.Trace.fromString(params.trace);
        }
        for (let remote of allRemotes) {
          remote.initialize(params.capabilities);
        }
        if (initializeHandler) {
          let result = initializeHandler(params, new vscode_languageserver_protocol_1.CancellationTokenSource().token, (0, progress_1.attachWorkDone)(connection2, params), void 0);
          return asPromise(result).then((value) => {
            if (value instanceof vscode_languageserver_protocol_1.ResponseError) {
              return value;
            }
            let result2 = value;
            if (!result2) {
              result2 = { capabilities: {} };
            }
            let capabilities = result2.capabilities;
            if (!capabilities) {
              capabilities = {};
              result2.capabilities = capabilities;
            }
            if (capabilities.textDocumentSync === void 0 || capabilities.textDocumentSync === null) {
              capabilities.textDocumentSync = Is.number(protocolConnection.__textDocumentSync) ? protocolConnection.__textDocumentSync : vscode_languageserver_protocol_1.TextDocumentSyncKind.None;
            } else if (!Is.number(capabilities.textDocumentSync) && !Is.number(capabilities.textDocumentSync.change)) {
              capabilities.textDocumentSync.change = Is.number(protocolConnection.__textDocumentSync) ? protocolConnection.__textDocumentSync : vscode_languageserver_protocol_1.TextDocumentSyncKind.None;
            }
            for (let remote of allRemotes) {
              remote.fillServerCapabilities(capabilities);
            }
            return result2;
          });
        } else {
          let result = { capabilities: { textDocumentSync: vscode_languageserver_protocol_1.TextDocumentSyncKind.None } };
          for (let remote of allRemotes) {
            remote.fillServerCapabilities(result.capabilities);
          }
          return result;
        }
      });
      connection2.onRequest(vscode_languageserver_protocol_1.ShutdownRequest.type, () => {
        watchDog.shutdownReceived = true;
        if (shutdownHandler) {
          return shutdownHandler(new vscode_languageserver_protocol_1.CancellationTokenSource().token);
        } else {
          return void 0;
        }
      });
      connection2.onNotification(vscode_languageserver_protocol_1.ExitNotification.type, () => {
        try {
          if (exitHandler) {
            exitHandler();
          }
        } finally {
          if (watchDog.shutdownReceived) {
            watchDog.exit(0);
          } else {
            watchDog.exit(1);
          }
        }
      });
      connection2.onNotification(vscode_languageserver_protocol_1.SetTraceNotification.type, (params) => {
        tracer.trace = vscode_languageserver_protocol_1.Trace.fromString(params.value);
      });
      return protocolConnection;
    }
    exports2.createConnection = createConnection2;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/node/files.js
var require_files = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/node/files.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.resolveModulePath = exports2.FileSystem = exports2.resolveGlobalYarnPath = exports2.resolveGlobalNodePath = exports2.resolve = exports2.uriToFilePath = void 0;
    var url = require("url");
    var path = require("path");
    var fs = require("fs");
    var child_process_1 = require("child_process");
    function uriToFilePath2(uri) {
      let parsed = url.parse(uri);
      if (parsed.protocol !== "file:" || !parsed.path) {
        return void 0;
      }
      let segments = parsed.path.split("/");
      for (var i = 0, len = segments.length; i < len; i++) {
        segments[i] = decodeURIComponent(segments[i]);
      }
      if (process.platform === "win32" && segments.length > 1) {
        let first = segments[0];
        let second = segments[1];
        if (first.length === 0 && second.length > 1 && second[1] === ":") {
          segments.shift();
        }
      }
      return path.normalize(segments.join("/"));
    }
    exports2.uriToFilePath = uriToFilePath2;
    function isWindows() {
      return process.platform === "win32";
    }
    function resolve(moduleName, nodePath, cwd, tracer) {
      const nodePathKey = "NODE_PATH";
      const app = [
        "var p = process;",
        "p.on('message',function(m){",
        "if(m.c==='e'){",
        "p.exit(0);",
        "}",
        "else if(m.c==='rs'){",
        "try{",
        "var r=require.resolve(m.a);",
        "p.send({c:'r',s:true,r:r});",
        "}",
        "catch(err){",
        "p.send({c:'r',s:false});",
        "}",
        "}",
        "});"
      ].join("");
      return new Promise((resolve2, reject) => {
        let env2 = process.env;
        let newEnv = /* @__PURE__ */ Object.create(null);
        Object.keys(env2).forEach((key) => newEnv[key] = env2[key]);
        if (nodePath && fs.existsSync(nodePath)) {
          if (newEnv[nodePathKey]) {
            newEnv[nodePathKey] = nodePath + path.delimiter + newEnv[nodePathKey];
          } else {
            newEnv[nodePathKey] = nodePath;
          }
          if (tracer) {
            tracer(`NODE_PATH value is: ${newEnv[nodePathKey]}`);
          }
        }
        newEnv["ELECTRON_RUN_AS_NODE"] = "1";
        try {
          let cp = (0, child_process_1.fork)("", [], {
            cwd,
            env: newEnv,
            execArgv: ["-e", app]
          });
          if (cp.pid === void 0) {
            reject(new Error(`Starting process to resolve node module  ${moduleName} failed`));
            return;
          }
          cp.on("error", (error) => {
            reject(error);
          });
          cp.on("message", (message2) => {
            if (message2.c === "r") {
              cp.send({ c: "e" });
              if (message2.s) {
                resolve2(message2.r);
              } else {
                reject(new Error(`Failed to resolve module: ${moduleName}`));
              }
            }
          });
          let message = {
            c: "rs",
            a: moduleName
          };
          cp.send(message);
        } catch (error) {
          reject(error);
        }
      });
    }
    exports2.resolve = resolve;
    function resolveGlobalNodePath(tracer) {
      let npmCommand = "npm";
      const env2 = /* @__PURE__ */ Object.create(null);
      Object.keys(process.env).forEach((key) => env2[key] = process.env[key]);
      env2["NO_UPDATE_NOTIFIER"] = "true";
      const options = {
        encoding: "utf8",
        env: env2
      };
      if (isWindows()) {
        npmCommand = "npm.cmd";
        options.shell = true;
      }
      let handler = () => {
      };
      try {
        process.on("SIGPIPE", handler);
        let stdout2 = (0, child_process_1.spawnSync)(npmCommand, ["config", "get", "prefix"], options).stdout;
        if (!stdout2) {
          if (tracer) {
            tracer(`'npm config get prefix' didn't return a value.`);
          }
          return void 0;
        }
        let prefix = stdout2.trim();
        if (tracer) {
          tracer(`'npm config get prefix' value is: ${prefix}`);
        }
        if (prefix.length > 0) {
          if (isWindows()) {
            return path.join(prefix, "node_modules");
          } else {
            return path.join(prefix, "lib", "node_modules");
          }
        }
        return void 0;
      } catch (err) {
        return void 0;
      } finally {
        process.removeListener("SIGPIPE", handler);
      }
    }
    exports2.resolveGlobalNodePath = resolveGlobalNodePath;
    function resolveGlobalYarnPath(tracer) {
      let yarnCommand = "yarn";
      let options = {
        encoding: "utf8"
      };
      if (isWindows()) {
        yarnCommand = "yarn.cmd";
        options.shell = true;
      }
      let handler = () => {
      };
      try {
        process.on("SIGPIPE", handler);
        let results = (0, child_process_1.spawnSync)(yarnCommand, ["global", "dir", "--json"], options);
        let stdout2 = results.stdout;
        if (!stdout2) {
          if (tracer) {
            tracer(`'yarn global dir' didn't return a value.`);
            if (results.stderr) {
              tracer(results.stderr);
            }
          }
          return void 0;
        }
        let lines = stdout2.trim().split(/\r?\n/);
        for (let line of lines) {
          try {
            let yarn = JSON.parse(line);
            if (yarn.type === "log") {
              return path.join(yarn.data, "node_modules");
            }
          } catch (e) {
          }
        }
        return void 0;
      } catch (err) {
        return void 0;
      } finally {
        process.removeListener("SIGPIPE", handler);
      }
    }
    exports2.resolveGlobalYarnPath = resolveGlobalYarnPath;
    var FileSystem;
    (function(FileSystem2) {
      let _isCaseSensitive = void 0;
      function isCaseSensitive() {
        if (_isCaseSensitive !== void 0) {
          return _isCaseSensitive;
        }
        if (process.platform === "win32") {
          _isCaseSensitive = false;
        } else {
          _isCaseSensitive = !fs.existsSync(__filename.toUpperCase()) || !fs.existsSync(__filename.toLowerCase());
        }
        return _isCaseSensitive;
      }
      FileSystem2.isCaseSensitive = isCaseSensitive;
      function isParent(parent, child) {
        if (isCaseSensitive()) {
          return path.normalize(child).indexOf(path.normalize(parent)) === 0;
        } else {
          return path.normalize(child).toLowerCase().indexOf(path.normalize(parent).toLowerCase()) === 0;
        }
      }
      FileSystem2.isParent = isParent;
    })(FileSystem || (exports2.FileSystem = FileSystem = {}));
    function resolveModulePath(workspaceRoot, moduleName, nodePath, tracer) {
      if (nodePath) {
        if (!path.isAbsolute(nodePath)) {
          nodePath = path.join(workspaceRoot, nodePath);
        }
        return resolve(moduleName, nodePath, nodePath, tracer).then((value) => {
          if (FileSystem.isParent(nodePath, value)) {
            return value;
          } else {
            return Promise.reject(new Error(`Failed to load ${moduleName} from node path location.`));
          }
        }).then(void 0, (_error) => {
          return resolve(moduleName, resolveGlobalNodePath(tracer), workspaceRoot, tracer);
        });
      } else {
        return resolve(moduleName, resolveGlobalNodePath(tracer), workspaceRoot, tracer);
      }
    }
    exports2.resolveModulePath = resolveModulePath;
  }
});

// ../lsp/node_modules/vscode-languageserver-protocol/node.js
var require_node2 = __commonJS({
  "../lsp/node_modules/vscode-languageserver-protocol/node.js"(exports2, module2) {
    "use strict";
    module2.exports = require_main3();
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/inlineCompletion.proposed.js
var require_inlineCompletion_proposed = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/inlineCompletion.proposed.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlineCompletionFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var InlineCompletionFeature = (Base) => {
      return class extends Base {
        get inlineCompletion() {
          return {
            on: (handler) => {
              return this.connection.onRequest(vscode_languageserver_protocol_1.InlineCompletionRequest.type, (params, cancel) => {
                return handler(params, cancel, this.attachWorkDoneProgress(params));
              });
            }
          };
        }
      };
    };
    exports2.InlineCompletionFeature = InlineCompletionFeature;
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/common/api.js
var require_api3 = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/common/api.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProposedFeatures = exports2.NotebookDocuments = exports2.TextDocuments = exports2.SemanticTokensBuilder = void 0;
    var semanticTokens_1 = require_semanticTokens();
    Object.defineProperty(exports2, "SemanticTokensBuilder", { enumerable: true, get: function() {
      return semanticTokens_1.SemanticTokensBuilder;
    } });
    var ic = require_inlineCompletion_proposed();
    __exportStar(require_main3(), exports2);
    var textDocuments_1 = require_textDocuments();
    Object.defineProperty(exports2, "TextDocuments", { enumerable: true, get: function() {
      return textDocuments_1.TextDocuments;
    } });
    var notebook_1 = require_notebook();
    Object.defineProperty(exports2, "NotebookDocuments", { enumerable: true, get: function() {
      return notebook_1.NotebookDocuments;
    } });
    __exportStar(require_server(), exports2);
    var ProposedFeatures2;
    (function(ProposedFeatures3) {
      ProposedFeatures3.all = {
        __brand: "features",
        languages: ic.InlineCompletionFeature
      };
    })(ProposedFeatures2 || (exports2.ProposedFeatures = ProposedFeatures2 = {}));
  }
});

// ../lsp/node_modules/vscode-languageserver/lib/node/main.js
var require_main4 = __commonJS({
  "../lsp/node_modules/vscode-languageserver/lib/node/main.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createConnection = exports2.Files = void 0;
    var node_util_1 = require("node:util");
    var Is = require_is();
    var server_1 = require_server();
    var fm = require_files();
    var node_1 = require_node2();
    __exportStar(require_node2(), exports2);
    __exportStar(require_api3(), exports2);
    var Files;
    (function(Files2) {
      Files2.uriToFilePath = fm.uriToFilePath;
      Files2.resolveGlobalNodePath = fm.resolveGlobalNodePath;
      Files2.resolveGlobalYarnPath = fm.resolveGlobalYarnPath;
      Files2.resolve = fm.resolve;
      Files2.resolveModulePath = fm.resolveModulePath;
    })(Files || (exports2.Files = Files = {}));
    var _protocolConnection;
    function endProtocolConnection() {
      if (_protocolConnection === void 0) {
        return;
      }
      try {
        _protocolConnection.end();
      } catch (_err) {
      }
    }
    var _shutdownReceived = false;
    var exitTimer = void 0;
    function setupExitTimer() {
      const argName = "--clientProcessId";
      function runTimer(value) {
        try {
          let processId = parseInt(value);
          if (!isNaN(processId)) {
            exitTimer = setInterval(() => {
              try {
                process.kill(processId, 0);
              } catch (ex) {
                endProtocolConnection();
                process.exit(_shutdownReceived ? 0 : 1);
              }
            }, 3e3);
          }
        } catch (e) {
        }
      }
      for (let i = 2; i < process.argv.length; i++) {
        let arg = process.argv[i];
        if (arg === argName && i + 1 < process.argv.length) {
          runTimer(process.argv[i + 1]);
          return;
        } else {
          let args = arg.split("=");
          if (args[0] === argName) {
            runTimer(args[1]);
          }
        }
      }
    }
    setupExitTimer();
    var watchDog = {
      initialize: (params) => {
        const processId = params.processId;
        if (Is.number(processId) && exitTimer === void 0) {
          setInterval(() => {
            try {
              process.kill(processId, 0);
            } catch (ex) {
              process.exit(_shutdownReceived ? 0 : 1);
            }
          }, 3e3);
        }
      },
      get shutdownReceived() {
        return _shutdownReceived;
      },
      set shutdownReceived(value) {
        _shutdownReceived = value;
      },
      exit: (code2) => {
        endProtocolConnection();
        process.exit(code2);
      }
    };
    function createConnection2(arg1, arg2, arg3, arg4) {
      let factories;
      let input;
      let output;
      let options;
      if (arg1 !== void 0 && arg1.__brand === "features") {
        factories = arg1;
        arg1 = arg2;
        arg2 = arg3;
        arg3 = arg4;
      }
      if (node_1.ConnectionStrategy.is(arg1) || node_1.ConnectionOptions.is(arg1)) {
        options = arg1;
      } else {
        input = arg1;
        output = arg2;
        options = arg3;
      }
      return _createConnection(input, output, options, factories);
    }
    exports2.createConnection = createConnection2;
    function _createConnection(input, output, options, factories) {
      let stdio = false;
      if (!input && !output && process.argv.length > 2) {
        let port = void 0;
        let pipeName = void 0;
        let argv = process.argv.slice(2);
        for (let i = 0; i < argv.length; i++) {
          let arg = argv[i];
          if (arg === "--node-ipc") {
            input = new node_1.IPCMessageReader(process);
            output = new node_1.IPCMessageWriter(process);
            break;
          } else if (arg === "--stdio") {
            stdio = true;
            input = process.stdin;
            output = process.stdout;
            break;
          } else if (arg === "--socket") {
            port = parseInt(argv[i + 1]);
            break;
          } else if (arg === "--pipe") {
            pipeName = argv[i + 1];
            break;
          } else {
            var args = arg.split("=");
            if (args[0] === "--socket") {
              port = parseInt(args[1]);
              break;
            } else if (args[0] === "--pipe") {
              pipeName = args[1];
              break;
            }
          }
        }
        if (port) {
          let transport = (0, node_1.createServerSocketTransport)(port);
          input = transport[0];
          output = transport[1];
        } else if (pipeName) {
          let transport = (0, node_1.createServerPipeTransport)(pipeName);
          input = transport[0];
          output = transport[1];
        }
      }
      var commandLineMessage = "Use arguments of createConnection or set command line parameters: '--node-ipc', '--stdio' or '--socket={number}'";
      if (!input) {
        throw new Error("Connection input stream is not set. " + commandLineMessage);
      }
      if (!output) {
        throw new Error("Connection output stream is not set. " + commandLineMessage);
      }
      if (Is.func(input.read) && Is.func(input.on)) {
        let inputStream = input;
        inputStream.on("end", () => {
          endProtocolConnection();
          process.exit(_shutdownReceived ? 0 : 1);
        });
        inputStream.on("close", () => {
          endProtocolConnection();
          process.exit(_shutdownReceived ? 0 : 1);
        });
      }
      const connectionFactory = (logger) => {
        const result = (0, node_1.createProtocolConnection)(input, output, logger, options);
        if (stdio) {
          patchConsole(logger);
        }
        return result;
      };
      return (0, server_1.createConnection)(connectionFactory, watchDog, factories);
    }
    function patchConsole(logger) {
      function serialize(args) {
        return args.map((arg) => typeof arg === "string" ? arg : (0, node_util_1.inspect)(arg)).join(" ");
      }
      const counters = /* @__PURE__ */ new Map();
      console.assert = function assert(assertion, ...args) {
        if (assertion) {
          return;
        }
        if (args.length === 0) {
          logger.error("Assertion failed");
        } else {
          const [message, ...rest] = args;
          logger.error(`Assertion failed: ${message} ${serialize(rest)}`);
        }
      };
      console.count = function count(label = "default") {
        const message = String(label);
        let counter = counters.get(message) ?? 0;
        counter += 1;
        counters.set(message, counter);
        logger.log(`${message}: ${message}`);
      };
      console.countReset = function countReset(label) {
        if (label === void 0) {
          counters.clear();
        } else {
          counters.delete(String(label));
        }
      };
      console.debug = function debug(...args) {
        logger.log(serialize(args));
      };
      console.dir = function dir(arg, options) {
        logger.log((0, node_util_1.inspect)(arg, options));
      };
      console.log = function log(...args) {
        logger.log(serialize(args));
      };
      console.error = function error(...args) {
        logger.error(serialize(args));
      };
      console.trace = function trace(...args) {
        const stack = new Error().stack.replace(/(.+\n){2}/, "");
        let message = "Trace";
        if (args.length !== 0) {
          message += `: ${serialize(args)}`;
        }
        logger.log(`${message}
${stack}`);
      };
      console.warn = function warn(...args) {
        logger.warn(serialize(args));
      };
    }
  }
});

// ../lsp/node_modules/vscode-languageserver/node.js
var require_node3 = __commonJS({
  "../lsp/node_modules/vscode-languageserver/node.js"(exports2, module2) {
    "use strict";
    module2.exports = require_main4();
  }
});

// ../lsp/src/server.ts
var import_node = __toESM(require_node3(), 1);

// ../lsp/node_modules/vscode-languageserver-textdocument/lib/esm/main.js
var FullTextDocument = class _FullTextDocument {
  constructor(uri, languageId, version, content) {
    this._uri = uri;
    this._languageId = languageId;
    this._version = version;
    this._content = content;
    this._lineOffsets = void 0;
  }
  get uri() {
    return this._uri;
  }
  get languageId() {
    return this._languageId;
  }
  get version() {
    return this._version;
  }
  getText(range) {
    if (range) {
      const start = this.offsetAt(range.start);
      const end = this.offsetAt(range.end);
      return this._content.substring(start, end);
    }
    return this._content;
  }
  update(changes, version) {
    for (const change of changes) {
      if (_FullTextDocument.isIncremental(change)) {
        const range = getWellformedRange(change.range);
        const startOffset = this.offsetAt(range.start);
        const endOffset = this.offsetAt(range.end);
        this._content = this._content.substring(0, startOffset) + change.text + this._content.substring(endOffset, this._content.length);
        const startLine = Math.max(range.start.line, 0);
        const endLine = Math.max(range.end.line, 0);
        let lineOffsets = this._lineOffsets;
        const addedLineOffsets = computeLineOffsets(change.text, false, startOffset);
        if (endLine - startLine === addedLineOffsets.length) {
          for (let i = 0, len = addedLineOffsets.length; i < len; i++) {
            lineOffsets[i + startLine + 1] = addedLineOffsets[i];
          }
        } else {
          if (addedLineOffsets.length < 1e4) {
            lineOffsets.splice(startLine + 1, endLine - startLine, ...addedLineOffsets);
          } else {
            this._lineOffsets = lineOffsets = lineOffsets.slice(0, startLine + 1).concat(addedLineOffsets, lineOffsets.slice(endLine + 1));
          }
        }
        const diff = change.text.length - (endOffset - startOffset);
        if (diff !== 0) {
          for (let i = startLine + 1 + addedLineOffsets.length, len = lineOffsets.length; i < len; i++) {
            lineOffsets[i] = lineOffsets[i] + diff;
          }
        }
      } else if (_FullTextDocument.isFull(change)) {
        this._content = change.text;
        this._lineOffsets = void 0;
      } else {
        throw new Error("Unknown change event received");
      }
    }
    this._version = version;
  }
  getLineOffsets() {
    if (this._lineOffsets === void 0) {
      this._lineOffsets = computeLineOffsets(this._content, true);
    }
    return this._lineOffsets;
  }
  positionAt(offset) {
    offset = Math.max(Math.min(offset, this._content.length), 0);
    const lineOffsets = this.getLineOffsets();
    let low = 0, high = lineOffsets.length;
    if (high === 0) {
      return { line: 0, character: offset };
    }
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (lineOffsets[mid] > offset) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    const line = low - 1;
    offset = this.ensureBeforeEOL(offset, lineOffsets[line]);
    return { line, character: offset - lineOffsets[line] };
  }
  offsetAt(position) {
    const lineOffsets = this.getLineOffsets();
    if (position.line >= lineOffsets.length) {
      return this._content.length;
    } else if (position.line < 0) {
      return 0;
    }
    const lineOffset = lineOffsets[position.line];
    if (position.character <= 0) {
      return lineOffset;
    }
    const nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
    const offset = Math.min(lineOffset + position.character, nextLineOffset);
    return this.ensureBeforeEOL(offset, lineOffset);
  }
  getLineRange(line) {
    const lineOffsets = this.getLineOffsets();
    if (line >= lineOffsets.length) {
      const lastLine = lineOffsets.length - 1;
      return { start: { line: lastLine, character: 0 }, end: { line: lastLine, character: this._content.length - lineOffsets[lastLine] } };
    } else if (line < 0) {
      return { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } };
    }
    const startOffset = lineOffsets[line];
    const nextLineOffset = line + 1 < lineOffsets.length ? lineOffsets[line + 1] : this._content.length;
    const endOffset = this.ensureBeforeEOL(nextLineOffset, startOffset);
    return { start: { line, character: 0 }, end: { line, character: endOffset - startOffset } };
  }
  getEOLCharacters(line) {
    const lineOffsets = this.getLineOffsets();
    if (line >= lineOffsets.length) {
      return "";
    } else if (line < 0) {
      return "";
    }
    const nextLineOffset = line + 1 < lineOffsets.length ? lineOffsets[line + 1] : this._content.length;
    const eolOffset = this.ensureBeforeEOL(nextLineOffset, lineOffsets[line]);
    return this._content.substring(eolOffset, nextLineOffset);
  }
  ensureBeforeEOL(offset, lineOffset) {
    while (offset > lineOffset && isEOL(this._content.charCodeAt(offset - 1))) {
      offset--;
    }
    return offset;
  }
  get lineCount() {
    return this.getLineOffsets().length;
  }
  static isIncremental(event) {
    const candidate = event;
    return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range !== void 0 && (candidate.rangeLength === void 0 || typeof candidate.rangeLength === "number");
  }
  static isFull(event) {
    const candidate = event;
    return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range === void 0 && candidate.rangeLength === void 0;
  }
};
var TextDocument;
(function(TextDocument2) {
  function create(uri, languageId, version, content) {
    return new FullTextDocument(uri, languageId, version, content);
  }
  TextDocument2.create = create;
  function update(document2, changes, version) {
    if (document2 instanceof FullTextDocument) {
      document2.update(changes, version);
      return document2;
    } else {
      throw new Error("TextDocument.update: document must be created by TextDocument.create");
    }
  }
  TextDocument2.update = update;
  function applyEdits(document2, edits) {
    const text = document2.getText();
    const sortedEdits = mergeSort(edits.map(getWellformedEdit), (a, b) => {
      const diff = a.range.start.line - b.range.start.line;
      if (diff === 0) {
        return a.range.start.character - b.range.start.character;
      }
      return diff;
    });
    let lastModifiedOffset = 0;
    const spans = [];
    for (const e of sortedEdits) {
      const startOffset = document2.offsetAt(e.range.start);
      if (startOffset < lastModifiedOffset) {
        throw new Error("Overlapping edit");
      } else if (startOffset > lastModifiedOffset) {
        spans.push(text.substring(lastModifiedOffset, startOffset));
      }
      if (e.newText.length) {
        spans.push(e.newText);
      }
      lastModifiedOffset = document2.offsetAt(e.range.end);
    }
    spans.push(text.substr(lastModifiedOffset));
    return spans.join("");
  }
  TextDocument2.applyEdits = applyEdits;
})(TextDocument || (TextDocument = {}));
function mergeSort(data, compare) {
  if (data.length <= 1) {
    return data;
  }
  const p = data.length / 2 | 0;
  const left = data.slice(0, p);
  const right = data.slice(p);
  mergeSort(left, compare);
  mergeSort(right, compare);
  let leftIdx = 0;
  let rightIdx = 0;
  let i = 0;
  while (leftIdx < left.length && rightIdx < right.length) {
    const ret = compare(left[leftIdx], right[rightIdx]);
    if (ret <= 0) {
      data[i++] = left[leftIdx++];
    } else {
      data[i++] = right[rightIdx++];
    }
  }
  while (leftIdx < left.length) {
    data[i++] = left[leftIdx++];
  }
  while (rightIdx < right.length) {
    data[i++] = right[rightIdx++];
  }
  return data;
}
function computeLineOffsets(text, isAtLineStart, textOffset = 0) {
  const result = isAtLineStart ? [textOffset] : [];
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    if (isEOL(ch)) {
      if (ch === 13 && i + 1 < text.length && text.charCodeAt(i + 1) === 10) {
        i++;
      }
      result.push(textOffset + i + 1);
    }
  }
  return result;
}
function isEOL(char) {
  return char === 13 || char === 10;
}
function getWellformedRange(range) {
  const start = range.start;
  const end = range.end;
  if (start.line > end.line || start.line === end.line && start.character > end.character) {
    return { start: end, end: start };
  }
  return range;
}
function getWellformedEdit(textEdit) {
  const range = getWellformedRange(textEdit.range);
  if (range !== textEdit.range) {
    return { newText: textEdit.newText, range };
  }
  return textEdit;
}

// ../lang/lexer.ts
var KEYWORDS = /* @__PURE__ */ new Set([
  "module",
  "export",
  "import",
  "extern",
  "as",
  "type",
  "function",
  "fn",
  "match",
  "if",
  "return",
  "else",
  "then",
  "mut",
  "true",
  "false",
  "let",
  "self",
  "for",
  "while",
  "switch",
  "case",
  "default",
  "in",
  "break",
  "continue",
  "do",
  "where",
  "pure"
]);
var Lexer = class {
  constructor(input) {
    this.pos = 0;
    this.line = 1;
    this.col = 1;
    this.input = input;
  }
  tokenize() {
    const tokens = [];
    while (this.pos < this.input.length) {
      this.skipWhitespaceAndComments();
      if (this.pos >= this.input.length) break;
      const startLine = this.line;
      const startCol = this.col;
      const ch = this.input[this.pos];
      if (/[a-zA-Z_]/.test(ch)) {
        const ident = this.readIdentifier();
        const loc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        if (KEYWORDS.has(ident)) {
          if (ident === "true" || ident === "false") {
            this.emit(tokens, { type: "BOOLEAN", value: ident, loc });
          } else {
            this.emit(tokens, { type: "KEYWORD", value: ident, loc });
          }
        } else {
          this.emit(tokens, { type: "IDENT", value: ident, loc });
        }
        continue;
      }
      if (/[0-9]/.test(ch)) {
        const num = this.readNumber();
        const loc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        this.emit(tokens, { type: "NUMBER", value: num, loc });
        continue;
      }
      if (ch === '"' || ch === "'") {
        const str = this.readString(ch);
        const loc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        this.emit(tokens, { type: "STRING", value: str, loc });
        continue;
      }
      const rest = this.input.slice(this.pos);
      if (rest.startsWith("...")) {
        this.advance(3);
        const loc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        this.emit(tokens, { type: "SYMBOL", value: "...", loc });
        continue;
      }
      if (rest.startsWith("..=")) {
        this.advance(3);
        const loc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        this.emit(tokens, { type: "SYMBOL", value: "..=", loc });
        continue;
      }
      if (rest.startsWith("..")) {
        this.advance(2);
        const loc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        this.emit(tokens, { type: "SYMBOL", value: "..", loc });
        continue;
      }
      if (rest.startsWith("=>") || rest.startsWith("->") || rest.startsWith("<-") || rest.startsWith("==") || rest.startsWith("!=") || rest.startsWith("<=") || rest.startsWith(">=") || rest.startsWith("&&") || rest.startsWith("||") || rest.startsWith("+=") || rest.startsWith("-=") || rest.startsWith("*=") || rest.startsWith("/=")) {
        const sym = rest.slice(0, 2);
        this.advance(2);
        const loc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        this.emit(tokens, { type: "SYMBOL", value: sym, loc });
        continue;
      }
      if ("{}()[]:;,.|?=+-*/%<>!".includes(ch)) {
        this.advance(1);
        const loc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        this.emit(tokens, { type: "SYMBOL", value: ch, loc });
        continue;
      }
      const lexErr = new Error(`Unexpected character '${ch}' at line ${this.line}, col ${this.col}`);
      lexErr.loc = { line: this.line, col: this.col, endLine: this.line, endCol: this.col + 1 };
      throw lexErr;
    }
    tokens.push({
      type: "EOF",
      value: "",
      loc: { line: this.line, col: this.col, endLine: this.line, endCol: this.col }
    });
    return tokens;
  }
  advance(n = 1) {
    for (let i = 0; i < n; i++) {
      if (this.pos < this.input.length) {
        if (this.input[this.pos] === "\n") {
          this.line++;
          this.col = 1;
        } else {
          this.col++;
        }
        this.pos++;
      }
    }
  }
  emit(tokens, token) {
    if (this.pendingDocComment) {
      token.docComment = this.pendingDocComment;
      this.pendingDocComment = void 0;
    }
    tokens.push(token);
  }
  appendDocComment(comment) {
    this.pendingDocComment = this.pendingDocComment ? `${this.pendingDocComment}
${comment}` : comment;
  }
  skipWhitespaceAndComments() {
    let newlinesSinceComment = 0;
    while (this.pos < this.input.length) {
      const ch = this.input[this.pos];
      if (/\s/.test(ch)) {
        if (ch === "\n") {
          newlinesSinceComment++;
          if (newlinesSinceComment > 1) this.pendingDocComment = void 0;
        }
        this.advance(1);
        continue;
      }
      if (ch === "/" && this.input[this.pos + 1] === "/") {
        const isDocComment = this.input[this.pos + 2] === "/" && this.input[this.pos + 3] !== "/";
        const commentStart = this.pos;
        this.advance(2);
        while (this.pos < this.input.length && this.input[this.pos] !== "\n") {
          this.advance(1);
        }
        if (isDocComment) this.appendDocComment(this.input.slice(commentStart + 3, this.pos).trimStart());
        newlinesSinceComment = 0;
        continue;
      }
      if (ch === "/" && this.input[this.pos + 1] === "*") {
        const commentStart = this.pos;
        const isDocComment = this.input[this.pos + 2] === "*" && this.input[this.pos + 3] !== "*";
        const commentLine = this.line;
        const commentCol = this.col;
        this.advance(2);
        let closed = false;
        while (this.pos < this.input.length - 1) {
          if (this.input[this.pos] === "*" && this.input[this.pos + 1] === "/") {
            this.advance(2);
            closed = true;
            break;
          }
          this.advance(1);
        }
        if (!closed) {
          const commentErr = new Error(`Unterminated block comment starting at line ${commentLine}, col ${commentCol}`);
          commentErr.loc = { line: commentLine, col: commentCol, endLine: this.line, endCol: this.col };
          throw commentErr;
        }
        if (isDocComment) this.appendDocComment(this.input.slice(commentStart, this.pos));
        newlinesSinceComment = 0;
        continue;
      }
      break;
    }
  }
  readIdentifier() {
    let start = this.pos;
    while (this.pos < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.pos])) {
      this.advance(1);
    }
    return this.input.slice(start, this.pos);
  }
  readNumber() {
    let start = this.pos;
    let hasDot = false;
    while (this.pos < this.input.length) {
      const ch = this.input[this.pos];
      if (/[0-9]/.test(ch)) {
        this.advance(1);
      } else if (ch === "." && !hasDot && /[0-9]/.test(this.input[this.pos + 1] || "")) {
        hasDot = true;
        this.advance(1);
      } else {
        break;
      }
    }
    return this.input.slice(start, this.pos);
  }
  readString(quote) {
    const startLine = this.line;
    const startCol = this.col;
    this.advance(1);
    let str = "";
    while (this.pos < this.input.length) {
      const ch = this.input[this.pos];
      if (ch === quote) {
        this.advance(1);
        return str;
      }
      if (ch === "\\") {
        this.advance(1);
        const next = this.input[this.pos];
        if (next === "n") str += "\n";
        else if (next === "t") str += "	";
        else if (next === "\\") str += "\\";
        else if (next === quote) str += quote;
        else str += next;
        this.advance(1);
      } else {
        str += ch;
        this.advance(1);
      }
    }
    const stringErr = new Error(`Unterminated string starting at line ${startLine}, col ${startCol}`);
    stringErr.loc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
    throw stringErr;
  }
};

// ../lang/ast.ts
function getTypeParamName(tp) {
  return typeof tp === "string" ? tp : tp.name;
}
function typeParamToString(tp) {
  if (typeof tp === "string") return tp;
  if (tp.raw) return tp.raw;
  if (tp.kindAnnotation) {
    return `${tp.name}: ${kindASTToString(tp.kindAnnotation)}`;
  }
  if (tp.arity && tp.arity > 0) {
    return `${tp.name}<${Array(tp.arity).fill("_").join(", ")}>`;
  }
  return tp.name;
}
function kindASTToString(k) {
  if (k.kind === "star") return "*";
  const fromStr = k.from.kind === "arrow" ? `(${kindASTToString(k.from)})` : kindASTToString(k.from);
  return `${fromStr} -> ${kindASTToString(k.to)}`;
}
function desugarDo(expr) {
  return desugarDoItems(expr.monad, expr.items, 0, expr.loc);
}
function desugarDoItems(monad, items, index, loc) {
  if (index >= items.length) {
    return { kind: "e_literal", value: null, loc };
  }
  const item = items[index];
  const isLast = index === items.length - 1;
  if (isLast) {
    if (item.kind === "do_return") {
      const callee = monad ? { kind: "e_field_access", object: monad, field: "pure", loc: item.loc } : { kind: "e_var", name: "pure", loc: item.loc };
      callee.isDoDesugared = true;
      callee.doOp = "pure";
      callee.doItem = item;
      callee.doMonad = monad;
      callee.doScopeLoc = loc;
      const callExpr = {
        kind: "e_call",
        callee,
        args: [item.expr],
        loc: item.loc
      };
      callExpr.isDoDesugared = true;
      callExpr.doOp = "pure";
      callExpr.doItem = item;
      callExpr.doMonad = monad;
      callExpr.doScopeLoc = loc;
      return monad || item.isPure ? callExpr : item.expr;
    }
    if (item.kind === "do_expr") {
      if (monad && item.expr.kind === "e_call" && item.expr.callee.kind === "e_var" && item.expr.callee.name === "pure") {
        const callee = { kind: "e_field_access", object: monad, field: "pure", loc: item.expr.loc };
        callee.isDoDesugared = true;
        callee.doOp = "pure";
        callee.doItem = item;
        callee.doMonad = monad;
        callee.doScopeLoc = loc;
        const callExpr = {
          kind: "e_call",
          callee,
          args: item.expr.args,
          loc: item.expr.loc
        };
        callExpr.isDoDesugared = true;
        callExpr.doOp = "pure";
        callExpr.doItem = item;
        callExpr.doMonad = monad;
        callExpr.doScopeLoc = loc;
        return callExpr;
      }
      return item.expr;
    }
    if (item.kind === "do_bind") {
      return item.expr;
    }
    if (item.kind === "do_let") {
      return {
        kind: "e_block",
        statements: [{
          kind: "s_let",
          name: item.name,
          isMut: item.isMut,
          typeAnnotation: item.typeAnnotation,
          init: item.init,
          loc: item.loc
        }],
        result: { kind: "e_var", name: item.name, loc: item.loc },
        loc: item.loc
      };
    }
  }
  const restExpr = desugarDoItems(monad, items, index + 1, loc);
  if (item.kind === "do_let") {
    return {
      kind: "e_block",
      statements: [{
        kind: "s_let",
        name: item.name,
        isMut: item.isMut,
        typeAnnotation: item.typeAnnotation,
        init: item.init,
        loc: item.loc
      }],
      result: restExpr,
      loc: item.loc
    };
  }
  if (item.kind === "do_bind") {
    let lambdaBody = restExpr;
    let paramName;
    if (item.pattern.kind === "p_var") {
      paramName = item.pattern.name;
    } else {
      paramName = `$m_val_${index}`;
      lambdaBody = {
        kind: "e_match",
        scrutinee: { kind: "e_var", name: paramName, loc: item.loc },
        arms: [{ pattern: item.pattern, body: restExpr, loc: item.loc }],
        loc: item.loc
      };
    }
    const lambda = {
      kind: "e_lambda",
      typeParams: [],
      params: [{ name: paramName, loc: item.pattern.kind === "p_var" && item.pattern.loc ? item.pattern.loc : item.loc }],
      body: lambdaBody,
      loc: item.loc
    };
    lambda.isDoBind = true;
    lambda.doVarName = paramName;
    lambda.doScopeLoc = loc;
    lambda.doItem = item;
    const callee = monad ? { kind: "e_field_access", object: monad, field: "flatMap", loc: item.loc } : { kind: "e_var", name: "flatMap", loc: item.loc };
    callee.isDoDesugared = true;
    callee.doOp = "flatMap";
    callee.doItem = item;
    callee.doMonad = monad;
    callee.doScopeLoc = loc;
    callee.doVarName = paramName;
    const callExpr = {
      kind: "e_call",
      callee,
      args: [item.expr, lambda],
      loc: item.loc
    };
    callExpr.isDoDesugared = true;
    callExpr.doOp = "flatMap";
    callExpr.doItem = item;
    callExpr.doMonad = monad;
    callExpr.doScopeLoc = loc;
    callExpr.doVarName = paramName;
    return callExpr;
  }
  if (item.kind === "do_expr") {
    const lambda = {
      kind: "e_lambda",
      typeParams: [],
      params: [{ name: `_unused_${index}`, loc: item.loc }],
      body: restExpr,
      loc: item.loc
    };
    lambda.isDoBind = true;
    lambda.doScopeLoc = loc;
    lambda.doItem = item;
    const callee = monad ? { kind: "e_field_access", object: monad, field: "flatMap", loc: item.loc } : { kind: "e_var", name: "flatMap", loc: item.loc };
    callee.isDoDesugared = true;
    callee.doOp = "flatMap";
    callee.doItem = item;
    callee.doMonad = monad;
    callee.doScopeLoc = loc;
    const callExpr = {
      kind: "e_call",
      callee,
      args: [item.expr, lambda],
      loc: item.loc
    };
    callExpr.isDoDesugared = true;
    callExpr.doOp = "flatMap";
    callExpr.doItem = item;
    callExpr.doMonad = monad;
    callExpr.doScopeLoc = loc;
    return callExpr;
  }
  if (item.kind === "do_return") {
    const callee = monad ? { kind: "e_field_access", object: monad, field: "pure", loc: item.loc } : { kind: "e_var", name: "pure", loc: item.loc };
    callee.isDoDesugared = true;
    callee.doOp = "pure";
    callee.doItem = item;
    callee.doMonad = monad;
    callee.doScopeLoc = loc;
    const callExpr = {
      kind: "e_call",
      callee,
      args: [item.expr],
      loc: item.loc
    };
    callExpr.isDoDesugared = true;
    callExpr.doOp = "pure";
    callExpr.doItem = item;
    callExpr.doMonad = monad;
    callExpr.doScopeLoc = loc;
    return monad || item.isPure ? callExpr : item.expr;
  }
  return restExpr;
}

// ../lang/parser.ts
var Parser = class {
  constructor(tokens) {
    this.pos = 0;
    this.tokens = tokens;
  }
  parseProgram(resilient = false) {
    const statements = [];
    while (!this.isAtEnd()) {
      if (resilient) {
        try {
          statements.push(this.parseStatement());
        } catch (e) {
          this.synchronize();
          if (this.isAtEnd()) break;
        }
      } else {
        statements.push(this.parseStatement());
      }
    }
    return { statements };
  }
  synchronize() {
    if (this.isAtEnd()) return;
    this.advance();
    while (!this.isAtEnd()) {
      const prev = this.previous();
      if (prev.type === "SYMBOL" && prev.value === ";") return;
      const peekType = this.peek().type;
      const peekVal = this.peek().value;
      if (peekType === "KEYWORD") {
        switch (peekVal) {
          case "let":
          case "function":
          case "type":
          case "module":
          case "import":
          case "export":
          case "match":
          case "if":
          case "for":
          case "while":
          case "return":
            return;
        }
      }
      this.advance();
    }
  }
  // ==================== HELPER METHODS ====================
  peek() {
    return this.tokens[this.pos];
  }
  previous() {
    return this.tokens[this.pos - 1];
  }
  isAtEnd() {
    return this.peek().type === "EOF";
  }
  check(type, value) {
    if (this.isAtEnd()) return false;
    const tok = this.peek();
    if (tok.type !== type) return false;
    if (value !== void 0 && tok.value !== value) return false;
    return true;
  }
  match(type, value) {
    if (this.check(type, value)) {
      this.advance();
      return true;
    }
    return false;
  }
  advance() {
    if (!this.isAtEnd()) this.pos++;
    return this.previous();
  }
  consume(type, value, message) {
    if (this.check(type, value)) {
      return this.advance();
    }
    const tok = this.peek();
    const err = new Error(
      message || `Expected '${value || type}' but got '${tok.value}' at line ${tok.loc.line}, col ${tok.loc.col}`
    );
    err.loc = tok.loc;
    throw err;
  }
  consumeIdentOrKeyword(message) {
    const tok = this.peek();
    if (tok.type === "IDENT" || tok.type === "KEYWORD") {
      this.advance();
      return tok.value;
    }
    const err = new Error(
      message || `Expected identifier but got '${tok.value}' at line ${tok.loc.line}, col ${tok.loc.col}`
    );
    err.loc = tok.loc;
    throw err;
  }
  // ==================== STATEMENTS & DECLARATIONS ====================
  parseStatement() {
    const leadingDocComment = this.peek().docComment;
    const isExported = this.match("KEYWORD", "export");
    const docComment = leadingDocComment || this.peek().docComment;
    if (this.check("KEYWORD", "extern")) {
      if (isExported) throw new Error("Cannot export an extern statement directly");
      return this.parseExternStatement();
    }
    if (this.check("KEYWORD", "import")) {
      if (isExported) throw new Error("Cannot export an import statement");
      return this.parseImportStatement();
    }
    if (this.check("KEYWORD", "module")) {
      return this.parseModuleStatement(isExported);
    }
    if (this.check("KEYWORD", "type")) {
      return this.parseTypeDeclaration(isExported, docComment);
    }
    if (this.check("KEYWORD", "function")) {
      return this.parseFunctionDeclaration(isExported, docComment);
    }
    if (this.check("KEYWORD", "let")) {
      return this.parseLetStatement(isExported, docComment);
    }
    if (isExported) throw new Error("Cannot export an expression statement");
    const expr = this.parseExpr();
    this.match("SYMBOL", ";");
    return { kind: "s_expr", expr, loc: expr.loc };
  }
  parseExternStatement() {
    const leadingDocComment = this.peek().docComment;
    const tok = this.consume("KEYWORD", "extern");
    if (this.check("KEYWORD", "module") || this.check("STRING")) {
      let moduleName = "";
      let moduleNameLoc;
      if (this.match("KEYWORD", "module")) {
        if (this.check("STRING")) {
          const strTok = this.advance();
          moduleName = strTok.value;
          moduleNameLoc = strTok.loc;
        } else {
          const idTok = this.peek();
          moduleName = this.consumeIdentOrKeyword("Expected module name after extern module");
          moduleNameLoc = idTok.loc;
        }
      } else if (this.check("STRING")) {
        const strTok = this.advance();
        moduleName = strTok.value;
        moduleNameLoc = strTok.loc;
      }
      let alias;
      let aliasLoc;
      if (this.match("KEYWORD", "as")) {
        const aliasTok = this.peek();
        alias = this.consumeIdentOrKeyword("Expected alias name after as");
        aliasLoc = aliasTok.loc;
      }
      this.consume("SYMBOL", "{", "Expected '{' to start extern module body");
      const functions = [];
      const types = [];
      const values = [];
      while (!this.check("SYMBOL", "}") && !this.isAtEnd()) {
        const itemDoc = this.peek().docComment;
        const itemExported = this.match("KEYWORD", "export");
        if (this.check("KEYWORD", "fn") || this.check("KEYWORD", "function")) {
          this.advance();
          functions.push(this.parseExternFunction(alias || moduleName, itemExported, itemDoc));
        } else if (this.check("KEYWORD", "type")) {
          this.advance();
          types.push(this.parseExternType(itemExported, itemDoc));
        } else if (this.check("KEYWORD", "let") || this.check("KEYWORD", "var") || this.check("KEYWORD", "const")) {
          this.advance();
          values.push(this.parseExternValue(alias || moduleName, itemExported, itemDoc));
        } else {
          this.advance();
        }
      }
      this.consume("SYMBOL", "}", "Expected '}' at end of extern module");
      return {
        kind: "s_extern_module",
        name: alias || moduleName,
        functions,
        types,
        values,
        docComment: leadingDocComment,
        loc: aliasLoc || moduleNameLoc || tok.loc
      };
    }
    if (this.match("KEYWORD", "fn") || this.match("KEYWORD", "function")) {
      const fn = this.parseExternFunction(void 0, void 0, leadingDocComment);
      return { ...fn, loc: fn.loc || tok.loc };
    }
    if (this.match("KEYWORD", "type")) {
      const t = this.parseExternType(void 0, leadingDocComment);
      return { ...t, loc: t.loc || tok.loc };
    }
    if (this.match("KEYWORD", "let") || this.match("KEYWORD", "const") || this.match("KEYWORD", "var")) {
      const v = this.parseExternValue(void 0, void 0, leadingDocComment);
      return { ...v, loc: v.loc || tok.loc };
    }
    throw new Error(`Unexpected token after 'extern' at line ${tok.loc.line}`);
  }
  // ==================== TYPE PARAMETER & KIND PARSING ====================
  parseTypeParams() {
    const typeParams = [];
    if (this.match("SYMBOL", "<")) {
      if (this.check("SYMBOL", ">")) {
        this.advance();
        return typeParams;
      }
      do {
        typeParams.push(this.parseSingleTypeParam());
      } while (this.match("SYMBOL", ","));
      this.consume("SYMBOL", ">", "Expected '>' after type parameters");
    }
    return typeParams;
  }
  parseSingleTypeParam() {
    const tok = this.peek();
    const name = this.consumeIdentOrKeyword("Expected type parameter name");
    if (this.match("SYMBOL", "<")) {
      let arity = 0;
      const innerParams = [];
      if (!this.check("SYMBOL", ">")) {
        do {
          arity++;
          if (this.check("IDENT") || this.check("KEYWORD")) {
            const innerTok = this.advance();
            if (innerTok.value === "_" || innerTok.value === "*") {
              innerParams.push("_");
            } else {
              let innerName = innerTok.value;
              if (this.match("SYMBOL", "<")) {
                this.consume("IDENT", "_");
                this.consume("SYMBOL", ">");
                innerName += "<_>";
              }
              innerParams.push(innerName);
            }
          } else if (this.match("SYMBOL", "*")) {
            innerParams.push("_");
          }
        } while (this.match("SYMBOL", ","));
      }
      this.consume("SYMBOL", ">", "Expected '>' after higher-order type parameter arguments");
      const raw = `${name}<${innerParams.join(", ")}>`;
      let kind = { kind: "star", loc: tok.loc };
      for (let i = 0; i < Math.max(1, arity); i++) {
        kind = { kind: "arrow", from: { kind: "star", loc: tok.loc }, to: kind, loc: tok.loc };
      }
      return {
        name,
        arity: Math.max(1, arity),
        kindAnnotation: kind,
        raw,
        loc: tok.loc
      };
    }
    if (this.match("SYMBOL", ":")) {
      const kind = this.parseKind();
      return {
        name,
        kindAnnotation: kind,
        raw: `${name}: ${kindASTToString(kind)}`,
        loc: tok.loc
      };
    }
    return {
      name,
      arity: 0,
      kindAnnotation: { kind: "star", loc: tok.loc },
      raw: name,
      loc: tok.loc
    };
  }
  parseKind() {
    let left;
    const tok = this.peek();
    if (this.match("SYMBOL", "(")) {
      left = this.parseKind();
      this.consume("SYMBOL", ")", "Expected ')' after kind in parentheses");
    } else if (this.match("SYMBOL", "*") || this.check("IDENT") && (this.peek().value === "Type" || this.peek().value === "*")) {
      if (this.check("IDENT")) this.advance();
      left = { kind: "star", loc: tok.loc };
    } else {
      left = { kind: "star", loc: tok.loc };
    }
    if (this.match("SYMBOL", "->") || this.match("SYMBOL", "=>")) {
      const right = this.parseKind();
      return { kind: "arrow", from: left, to: right, loc: tok.loc };
    }
    return left;
  }
  parseExternFunction(moduleName, isExported, docComment) {
    const fnNameTok = this.peek();
    const fnName = this.consumeIdentOrKeyword("Expected function name in extern declaration");
    const typeParams = this.parseTypeParams();
    this.consume("SYMBOL", "(", "Expected '(' for extern function parameters");
    const params = [];
    if (!this.check("SYMBOL", ")")) {
      do {
        const pTok = this.peek();
        const pName = this.consumeIdentOrKeyword("Expected parameter name");
        const isOptional = this.match("SYMBOL", "?");
        this.consume("SYMBOL", ":", "Expected ':' after parameter name");
        const pType = this.parseTypeAST();
        params.push({ name: pName, type: pType, isOptional, loc: pTok.loc });
      } while (this.match("SYMBOL", ","));
    }
    this.consume("SYMBOL", ")", "Expected ')' after parameters");
    let returnType = { kind: "base", name: "void" };
    if (this.match("SYMBOL", ":")) {
      returnType = this.parseTypeAST();
    }
    let jsSymbol;
    if (this.match("KEYWORD", "as")) {
      if (this.check("STRING")) {
        jsSymbol = this.advance().value;
      } else {
        jsSymbol = this.consumeIdentOrKeyword("Expected JS symbol name after as");
      }
    }
    this.match("SYMBOL", ";");
    return {
      kind: "s_extern_function",
      name: fnName,
      moduleName,
      typeParams,
      params,
      returnType,
      jsSymbol,
      isExported,
      docComment,
      loc: fnNameTok.loc
    };
  }
  parseExternType(isExported, docComment) {
    const typeNameTok = this.peek();
    const name = this.consumeIdentOrKeyword("Expected type name in extern type declaration");
    const typeParams = this.parseTypeParams();
    this.consume("SYMBOL", "=", "Expected '=' in extern type declaration");
    const type = this.parseTypeAST();
    this.match("SYMBOL", ";");
    return {
      kind: "s_extern_type",
      name,
      typeParams,
      type,
      isExported,
      docComment,
      loc: typeNameTok.loc
    };
  }
  parseExternValue(moduleName, isExported, docComment) {
    const valNameTok = this.peek();
    const name = this.consumeIdentOrKeyword("Expected value name in extern declaration");
    this.consume("SYMBOL", ":", "Expected ':' after value name");
    const type = this.parseTypeAST();
    let jsSymbol;
    if (this.match("KEYWORD", "as")) {
      if (this.check("STRING")) {
        jsSymbol = this.advance().value;
      } else {
        jsSymbol = this.consumeIdentOrKeyword("Expected JS symbol name after as");
      }
    }
    this.match("SYMBOL", ";");
    return {
      kind: "s_extern_value",
      name,
      moduleName,
      type,
      jsSymbol,
      isExported,
      docComment,
      loc: valNameTok.loc
    };
  }
  parseImportStatement() {
    const tok = this.consume("KEYWORD", "import");
    if (this.check("SYMBOL", "{")) {
      this.advance();
      const specifiers = [];
      if (this.match("SYMBOL", "*")) {
        specifiers.push({ name: "*", isAll: true });
      } else {
        do {
          const name = this.consumeIdentOrKeyword("Expected imported name");
          let alias2;
          if (this.match("KEYWORD", "as")) {
            alias2 = this.consumeIdentOrKeyword("Expected alias name");
          }
          specifiers.push({ name, alias: alias2 });
        } while (this.match("SYMBOL", ","));
      }
      this.consume("SYMBOL", "}", "Expected '}' after import specifiers");
      if (this.match("IDENT", "from") || this.match("KEYWORD", "from")) {
        let modName = "";
        if (this.check("STRING")) {
          modName = this.advance().value;
        } else {
          modName = this.consumeIdentOrKeyword("Expected module name after from");
        }
        this.match("SYMBOL", ";");
        return {
          kind: "s_import",
          modulePath: [modName],
          specifiers,
          loc: tok.loc
        };
      }
    }
    const firstToken = this.peek();
    let path = [];
    if (firstToken.type === "STRING") {
      path = [this.advance().value];
    } else {
      path = [this.consumeIdentOrKeyword("Expected module name in import")];
    }
    while (this.match("SYMBOL", ".")) {
      if (this.check("SYMBOL", "{")) {
        this.advance();
        const specifiers = [];
        if (this.match("SYMBOL", "*")) {
          specifiers.push({ name: "*", isAll: true });
        } else {
          do {
            const name = this.consumeIdentOrKeyword("Expected imported name");
            let alias2;
            if (this.match("KEYWORD", "as")) {
              alias2 = this.consumeIdentOrKeyword("Expected alias name");
            }
            specifiers.push({ name, alias: alias2 });
          } while (this.match("SYMBOL", ","));
        }
        this.consume("SYMBOL", "}", "Expected '}' after import specifiers");
        this.match("SYMBOL", ";");
        return {
          kind: "s_import",
          modulePath: path,
          specifiers,
          loc: tok.loc
        };
      }
      path.push(this.consumeIdentOrKeyword("Expected submodule identifier"));
    }
    let alias;
    if (this.match("KEYWORD", "as")) {
      alias = this.consumeIdentOrKeyword("Expected alias name");
    }
    this.match("SYMBOL", ";");
    return {
      kind: "s_import",
      modulePath: path,
      alias,
      loc: tok.loc
    };
  }
  parseModuleStatement(isExported) {
    const tok = this.consume("KEYWORD", "module");
    const name = this.consume("IDENT", void 0, "Expected module name").value;
    this.consume("SYMBOL", "{", "Expected '{' to start module body");
    const body = [];
    while (!this.check("SYMBOL", "}") && !this.isAtEnd()) {
      body.push(this.parseStatement());
    }
    this.consume("SYMBOL", "}", "Expected '}' at end of module");
    return {
      kind: "s_module",
      name,
      body,
      isExported,
      loc: tok.loc
    };
  }
  parseTypeDeclaration(isExported, docComment) {
    const tok = this.consume("KEYWORD", "type");
    const name = this.consume("IDENT", void 0, "Expected type name").value;
    const typeParams = this.parseTypeParams();
    this.consume("SYMBOL", "=", "Expected '=' in type declaration");
    if (this.check("SYMBOL", "|") || this.check("IDENT") && this.isConstructorStart()) {
      const constructors = this.parseGADTConstructors();
      this.match("SYMBOL", ";");
      return {
        kind: "s_gadt",
        decl: {
          kind: "gadt",
          name,
          typeParams,
          constructors,
          docComment: docComment || tok.docComment,
          isExported,
          loc: tok.loc
        },
        isExported,
        loc: tok.loc
      };
    }
    const type = this.parseTypeAST();
    this.match("SYMBOL", ";");
    return {
      kind: "s_type_alias",
      decl: {
        kind: "type_alias",
        name,
        typeParams,
        type,
        docComment: docComment || tok.docComment,
        isExported,
        loc: tok.loc
      },
      isExported,
      loc: tok.loc
    };
  }
  isConstructorStart() {
    const tok = this.peek();
    return tok.type === "IDENT" && /^[A-Z]/.test(tok.value);
  }
  parseGADTConstructors() {
    const constructors = [];
    this.match("SYMBOL", "|");
    do {
      const leadingDocComment = this.peek().docComment || this.previous().docComment;
      const ctorTok = this.consume("IDENT", void 0, "Expected constructor name");
      const name = ctorTok.value;
      let typeParams = [];
      let params = [];
      let returnType;
      if (this.match("SYMBOL", ":")) {
        typeParams = this.parseTypeParams();
        if (this.match("SYMBOL", "(")) {
          params = this.parseGADTConstructorParams();
          this.consume("SYMBOL", ")", "Expected ')' after constructor parameters");
          if (this.match("SYMBOL", "=>") || this.match("SYMBOL", ":")) {
            returnType = this.parseTypeAST();
          } else if (!this.check("SYMBOL", "|") && !this.check("SYMBOL", ";") && !this.isAtEnd()) {
            returnType = this.parseTypeAST();
          }
        } else {
          returnType = this.parseTypeAST();
        }
      } else {
        typeParams = this.parseTypeParams();
        if (this.match("SYMBOL", "(")) {
          params = this.parseGADTConstructorParams();
          this.consume("SYMBOL", ")", "Expected ')' after constructor parameters");
        }
        if (this.match("SYMBOL", ":") || this.match("SYMBOL", "=>")) {
          returnType = this.parseTypeAST();
        }
      }
      constructors.push({
        name,
        typeParams,
        params,
        returnType,
        docComment: leadingDocComment || ctorTok.docComment,
        loc: ctorTok.loc
      });
    } while (this.match("SYMBOL", "|"));
    return constructors;
  }
  parseGADTConstructorParams() {
    const params = [];
    if (this.check("SYMBOL", ")")) return params;
    do {
      const pTok = this.peek();
      const paramName = this.consumeIdentOrKeyword("Expected parameter name");
      this.consume("SYMBOL", ":", "Expected ':' after parameter name");
      const paramType = this.parseTypeAST();
      params.push({ name: paramName, type: paramType, loc: pTok.loc });
    } while (this.match("SYMBOL", ","));
    return params;
  }
  parseFunctionDeclaration(isExported, docComment) {
    const tok = this.consume("KEYWORD", "function");
    const name = this.consumeIdentOrKeyword("Expected function name");
    const typeParams = this.parseTypeParams();
    this.consume("SYMBOL", "(", "Expected '(' for function parameters");
    const params = [];
    if (!this.check("SYMBOL", ")")) {
      do {
        const pTok = this.peek();
        const pName = this.consumeIdentOrKeyword("Expected parameter name");
        this.consume("SYMBOL", ":", "Expected ':' for parameter type");
        const pType = this.parseTypeAST();
        params.push({ name: pName, type: pType, loc: pTok.loc });
      } while (this.match("SYMBOL", ","));
    }
    this.consume("SYMBOL", ")", "Expected ')' after parameters");
    let returnType = { kind: "base", name: "void" };
    if (this.match("SYMBOL", ":")) {
      returnType = this.parseTypeAST();
    }
    this.consume("SYMBOL", "{", "Expected '{' for function body");
    const body = this.parseBlockBody();
    let whereBindings;
    if (this.match("KEYWORD", "where")) {
      this.consume("SYMBOL", "{", "Expected '{' after where");
      whereBindings = [];
      while (!this.check("SYMBOL", "}") && !this.isAtEnd()) {
        whereBindings.push(this.parseStatement());
      }
      this.consume("SYMBOL", "}", "Expected '}' at end of where clause");
    }
    return {
      kind: "s_function",
      name,
      typeParams,
      params,
      returnType,
      body,
      whereBindings,
      isExported,
      docComment: docComment || tok.docComment,
      loc: tok.loc
    };
  }
  parseLetStatement(isExported, docComment) {
    const tok = this.consume("KEYWORD", "let");
    const isMut = this.match("KEYWORD", "mut");
    const name = this.consume("IDENT", void 0, "Expected variable name").value;
    let typeAnnotation;
    if (this.match("SYMBOL", ":")) {
      typeAnnotation = this.parseTypeAST();
    }
    this.consume("SYMBOL", "=", "Expected '=' in let declaration");
    const init = this.parseExpr();
    this.match("SYMBOL", ";");
    return {
      kind: "s_let",
      name,
      isMut,
      typeAnnotation,
      init,
      isExported,
      docComment: docComment || tok.docComment,
      loc: tok.loc
    };
  }
  // ==================== TYPES PARSER ====================
  parseTypeAST() {
    if (this.check("SYMBOL", "<")) {
      const loc = this.peek().loc;
      const typeParams = this.parseTypeParams();
      if (this.match("SYMBOL", "=>")) {
        const body = this.parseTypeAST();
        return {
          kind: "type_lambda",
          params: typeParams,
          body,
          loc
        };
      }
      this.consume("SYMBOL", "(", "Expected '(' for function type parameters");
      const params = this.parseFunctionTypeParams();
      this.consume("SYMBOL", ")", "Expected ')' after function type parameters");
      this.consume("SYMBOL", "=>", "Expected '=>' for function return type");
      const returnType = this.parseTypeAST();
      return {
        kind: "fun",
        typeParams,
        params,
        returnType,
        loc
      };
    }
    if (this.check("SYMBOL", "(")) {
      const savePos = this.pos;
      try {
        const loc = this.peek().loc;
        this.advance();
        const params = this.parseFunctionTypeParams();
        this.consume("SYMBOL", ")");
        if (this.match("SYMBOL", "=>")) {
          const returnType = this.parseTypeAST();
          return { kind: "fun", typeParams: [], params, returnType, loc };
        }
      } catch (e) {
        this.pos = savePos;
      }
    }
    let target = this.parsePrimaryType();
    while (this.match("SYMBOL", "<")) {
      const args = [];
      if (!this.check("SYMBOL", ">")) {
        do {
          args.push(this.parseTypeAST());
        } while (this.match("SYMBOL", ","));
      }
      this.consume("SYMBOL", ">", "Expected '>' after type arguments");
      target = { kind: "hkt_app", target, args, loc: target.loc };
    }
    while (this.check("SYMBOL", "[") && this.lookaheadSymbol("]")) {
      this.advance();
      this.advance();
      target = { kind: "app", name: "Array", args: [target], loc: target.loc };
    }
    return target;
  }
  parseFunctionTypeParams() {
    const params = [];
    if (this.check("SYMBOL", ")")) return params;
    do {
      if ((this.check("IDENT") || this.check("KEYWORD")) && this.lookaheadSymbol(":")) {
        const name = this.advance().value;
        this.consume("SYMBOL", ":");
        const type = this.parseTypeAST();
        params.push({ name, type });
      } else {
        const type = this.parseTypeAST();
        params.push({ type });
      }
    } while (this.match("SYMBOL", ","));
    return params;
  }
  lookaheadSymbol(sym) {
    if (this.pos + 1 < this.tokens.length) {
      return this.tokens[this.pos + 1].value === sym;
    }
    return false;
  }
  parsePrimaryType() {
    const tok = this.peek();
    if (this.match("SYMBOL", "(")) {
      const inner = this.parseTypeAST();
      this.consume("SYMBOL", ")", "Expected ')' after parenthesized type");
      return inner;
    }
    if (this.match("SYMBOL", "[")) {
      const elements = [];
      if (!this.check("SYMBOL", "]")) {
        do {
          elements.push(this.parseTypeAST());
        } while (this.match("SYMBOL", ","));
      }
      this.consume("SYMBOL", "]", "Expected ']' at end of tuple type");
      return { kind: "tuple", elements, loc: tok.loc };
    }
    if (this.match("SYMBOL", "{")) {
      const fields = [];
      if (!this.check("SYMBOL", "}")) {
        do {
          const isMut = this.match("KEYWORD", "mut");
          const name = this.consumeIdentOrKeyword("Expected record field name");
          const isOptional = this.match("SYMBOL", "?");
          this.consume("SYMBOL", ":", "Expected ':' after record field name");
          const type = this.parseTypeAST();
          fields.push({ name, type, isMut, isOptional });
        } while (this.match("SYMBOL", ",") || this.check("IDENT") || this.check("KEYWORD"));
      }
      this.consume("SYMBOL", "}", "Expected '}' at end of record type");
      return { kind: "record", fields, loc: tok.loc };
    }
    if (this.match("IDENT", "_") || this.match("SYMBOL", "*")) {
      return { kind: "var", name: "_", loc: tok.loc };
    }
    if (this.check("IDENT") || this.check("KEYWORD")) {
      const name = this.advance().value;
      if (["number", "boolean", "string", "void"].includes(name)) {
        return { kind: "base", name, loc: tok.loc };
      }
      if (this.match("SYMBOL", "<")) {
        const args = [];
        if (!this.check("SYMBOL", ">")) {
          do {
            args.push(this.parseTypeAST());
          } while (this.match("SYMBOL", ","));
        }
        this.consume("SYMBOL", ">", "Expected '>' after type arguments");
        return { kind: "app", name, args, loc: tok.loc };
      }
      if (/^[a-z_]/.test(name)) {
        return { kind: "var", name, loc: tok.loc };
      } else {
        return { kind: "app", name, args: [], loc: tok.loc };
      }
    }
    throw new Error(`Unexpected token '${tok.value}' in type signature at line ${tok.loc.line}, col ${tok.loc.col}`);
  }
  // ==================== EXPRESSION PARSER ====================
  parseExpr() {
    let expr = this.parseAssignment();
    if (this.match("KEYWORD", "where")) {
      this.consume("SYMBOL", "{", "Expected '{' after where");
      const bindings = [];
      while (!this.check("SYMBOL", "}") && !this.isAtEnd()) {
        bindings.push(this.parseStatement());
      }
      this.consume("SYMBOL", "}", "Expected '}' at end of where clause");
      expr = {
        kind: "e_where",
        expr,
        bindings,
        loc: expr.loc
      };
    }
    return expr;
  }
  parseAssignment() {
    const expr = this.parseTernary();
    if (this.match("SYMBOL", "=") || this.match("SYMBOL", "+=") || this.match("SYMBOL", "-=") || this.match("SYMBOL", "*=") || this.match("SYMBOL", "/=")) {
      const op = this.previous().value;
      const value = this.parseAssignment();
      return {
        kind: "e_assign",
        target: expr,
        value,
        op,
        loc: expr.loc
      };
    }
    return expr;
  }
  parseTernary() {
    const cond = this.parseLogicalOr();
    if (this.match("SYMBOL", "?")) {
      const thenExpr = this.parseExpr();
      this.consume("SYMBOL", ":", "Expected ':' in ternary expression");
      const elseExpr = this.parseExpr();
      return { kind: "e_if", cond, thenExpr, elseExpr, loc: cond.loc };
    }
    return cond;
  }
  parseLogicalOr() {
    let left = this.parseLogicalAnd();
    while (this.match("SYMBOL", "||")) {
      const right = this.parseLogicalAnd();
      left = { kind: "e_binary", op: "||", left, right, loc: left.loc };
    }
    return left;
  }
  parseLogicalAnd() {
    let left = this.parseEquality();
    while (this.match("SYMBOL", "&&")) {
      const right = this.parseEquality();
      left = { kind: "e_binary", op: "&&", left, right, loc: left.loc };
    }
    return left;
  }
  parseEquality() {
    let left = this.parseRelational();
    while (this.check("SYMBOL", "==") || this.check("SYMBOL", "!=")) {
      const op = this.advance().value;
      const right = this.parseRelational();
      left = { kind: "e_binary", op, left, right, loc: left.loc };
    }
    return left;
  }
  parseRelational() {
    let left = this.parseRange();
    while (this.check("SYMBOL", "<") || this.check("SYMBOL", "<=") || this.check("SYMBOL", ">") || this.check("SYMBOL", ">=")) {
      const op = this.advance().value;
      const right = this.parseRange();
      left = { kind: "e_binary", op, left, right, loc: left.loc };
    }
    return left;
  }
  parseRange() {
    let left = this.parseAdditive();
    if (this.check("SYMBOL", "..") || this.check("SYMBOL", "..=")) {
      const opTok = this.advance();
      const inclusive = opTok.value === "..=";
      const right = this.parseAdditive();
      return {
        kind: "e_range",
        start: left,
        end: right,
        inclusive,
        loc: left.loc
      };
    }
    return left;
  }
  parseAdditive() {
    let left = this.parseMultiplicative();
    while (this.check("SYMBOL", "+") || this.check("SYMBOL", "-")) {
      const op = this.advance().value;
      const right = this.parseMultiplicative();
      left = { kind: "e_binary", op, left, right, loc: left.loc };
    }
    return left;
  }
  parseMultiplicative() {
    let left = this.parseUnary();
    while (this.check("SYMBOL", "*") || this.check("SYMBOL", "/") || this.check("SYMBOL", "%")) {
      const op = this.advance().value;
      const right = this.parseUnary();
      left = { kind: "e_binary", op, left, right, loc: left.loc };
    }
    return left;
  }
  parseUnary() {
    if (this.check("SYMBOL", "!") || this.check("SYMBOL", "-")) {
      const tok = this.advance();
      const expr = this.parseUnary();
      return { kind: "e_unary", op: tok.value, expr, loc: tok.loc };
    }
    return this.parsePostfix();
  }
  parsePostfix() {
    let expr = this.parsePrimary();
    while (true) {
      if (this.match("SYMBOL", "(")) {
        const args = [];
        if (!this.check("SYMBOL", ")")) {
          do {
            args.push(this.parseExpr());
          } while (this.match("SYMBOL", ","));
        }
        this.consume("SYMBOL", ")", "Expected ')' after argument list");
        expr = { kind: "e_call", callee: expr, args, loc: expr.loc };
        continue;
      }
      if (this.match("SYMBOL", ".")) {
        const dotTok = this.previous();
        const nextTok = this.peek();
        const isNextOnSameLine = nextTok && nextTok.loc && nextTok.loc.line === dotTok.loc.line;
        const isStatementKeyword = nextTok && nextTok.type === "KEYWORD" && ["let", "function", "type", "module", "extern", "import", "export", "return"].includes(nextTok.value);
        if (isNextOnSameLine && !isStatementKeyword && (this.check("IDENT") || this.check("KEYWORD"))) {
          const nameTokValue = this.consumeIdentOrKeyword("Expected field or method identifier");
          if (this.match("SYMBOL", "(")) {
            const args = [];
            if (!this.check("SYMBOL", ")")) {
              do {
                args.push(this.parseExpr());
              } while (this.match("SYMBOL", ","));
            }
            this.consume("SYMBOL", ")", "Expected ')' after method arguments");
            expr = {
              kind: "e_method_call",
              object: expr,
              method: nameTokValue,
              args,
              loc: expr.loc
            };
          } else {
            expr = {
              kind: "e_field_access",
              object: expr,
              field: nameTokValue,
              loc: expr.loc
            };
          }
        } else {
          expr = {
            kind: "e_field_access",
            object: expr,
            field: "",
            loc: expr.loc
          };
        }
        continue;
      }
      if (this.check("SYMBOL", "[")) {
        const nextTok = this.peek();
        const prevTok = this.previous();
        if (nextTok.loc.line > prevTok.loc.line) {
          break;
        }
        this.advance();
        const index = this.parseExpr();
        this.consume("SYMBOL", "]", "Expected ']' after index");
        expr = { kind: "e_index", target: expr, index, loc: expr.loc };
        continue;
      }
      break;
    }
    return expr;
  }
  parsePrimary() {
    const tok = this.peek();
    if (this.match("NUMBER")) {
      return { kind: "e_literal", value: parseFloat(this.previous().value), loc: tok.loc };
    }
    if (this.match("STRING")) {
      return { kind: "e_literal", value: this.previous().value, loc: tok.loc };
    }
    if (this.match("BOOLEAN")) {
      return { kind: "e_literal", value: this.previous().value === "true", loc: tok.loc };
    }
    if (this.match("KEYWORD", "break")) {
      return { kind: "e_break", loc: tok.loc };
    }
    if (this.match("KEYWORD", "continue")) {
      return { kind: "e_continue", loc: tok.loc };
    }
    if (this.match("KEYWORD", "return")) {
      const tok2 = this.previous();
      let value = void 0;
      if (!this.check("SYMBOL", "}") && !this.check("SYMBOL", ";") && !this.isAtEnd()) {
        const nextTok = this.peek();
        if (nextTok.loc.line === tok2.loc.line) {
          if (nextTok.type !== "KEYWORD" || ["true", "false", "match", "if", "fn", "switch"].includes(nextTok.value)) {
            value = this.parseExpr();
          }
        }
      }
      return { kind: "e_return", value, loc: tok2.loc };
    }
    if (this.match("KEYWORD", "match")) {
      this.consume("SYMBOL", "(", "Expected '(' after 'match'");
      const scrutinee = this.parseExpr();
      this.consume("SYMBOL", ")", "Expected ')' after match scrutinee");
      this.consume("SYMBOL", "{", "Expected '{' to start match arms");
      const arms = [];
      let hasRest = false;
      while (!this.check("SYMBOL", "}") && !this.isAtEnd()) {
        if (this.match("SYMBOL", "...")) {
          hasRest = true;
          this.consume("SYMBOL", "=>", "Expected '=>' after '...'");
          const body2 = this.parseExpr();
          arms.push({
            pattern: { kind: "p_rest", loc: tok.loc },
            body: body2,
            loc: tok.loc
          });
          this.match("SYMBOL", ",");
          break;
        }
        const pattern = this.parsePattern();
        let nameAlias;
        if (this.match("KEYWORD", "as")) {
          nameAlias = this.consume("IDENT", void 0, "Expected binding name after 'as'").value;
        }
        let guard;
        if (this.match("KEYWORD", "if")) {
          guard = this.parseExpr();
        }
        const finalPattern = nameAlias ? { kind: "p_as", pattern, name: nameAlias, loc: pattern.loc } : pattern;
        this.consume("SYMBOL", "=>", "Expected '=>' in match arm");
        const body = this.parseExpr();
        arms.push({ pattern: finalPattern, guard, body, loc: pattern.loc });
        this.match("SYMBOL", ",");
      }
      this.consume("SYMBOL", "}", "Expected '}' at end of match");
      return { kind: "e_match", scrutinee, arms, hasRest, loc: tok.loc };
    }
    if (this.match("KEYWORD", "switch")) {
      let discriminant;
      if (this.check("SYMBOL", "(")) {
        this.advance();
        discriminant = this.parseExpr();
        this.consume("SYMBOL", ")", "Expected ')' after switch discriminant");
      } else {
        discriminant = this.parseExpr();
      }
      this.consume("SYMBOL", "{", "Expected '{' to start switch cases");
      const cases = [];
      let defaultCase;
      while (!this.check("SYMBOL", "}") && !this.isAtEnd()) {
        if (this.match("KEYWORD", "case")) {
          const caseValues = [];
          do {
            caseValues.push(this.parseExpr());
          } while (this.match("SYMBOL", ","));
          this.consume("SYMBOL", ":", "Expected ':' after case value");
          while (this.match("KEYWORD", "case")) {
            do {
              caseValues.push(this.parseExpr());
            } while (this.match("SYMBOL", ","));
            this.consume("SYMBOL", ":", "Expected ':' after case value");
          }
          const body = this.parseExpr();
          cases.push({ values: caseValues, value: caseValues[0], body });
        } else if (this.match("KEYWORD", "default")) {
          this.consume("SYMBOL", ":", "Expected ':' after default");
          defaultCase = this.parseExpr();
        } else {
          throw new Error(`Expected 'case' or 'default' in switch block at line ${this.peek().loc.line}, col ${this.peek().loc.col}`);
        }
      }
      this.consume("SYMBOL", "}", "Expected '}' to end switch block");
      return { kind: "e_switch", discriminant, cases, defaultCase, loc: tok.loc };
    }
    if (this.match("KEYWORD", "if")) {
      let cond;
      if (this.check("SYMBOL", "(")) {
        this.advance();
        cond = this.parseExpr();
        this.consume("SYMBOL", ")", "Expected ')' after if condition");
      } else {
        cond = this.parseExpr();
        this.match("KEYWORD", "then");
      }
      const thenExpr = this.parseExpr();
      let elseExpr;
      if (this.match("KEYWORD", "else")) {
        elseExpr = this.parseExpr();
      }
      return { kind: "e_if", cond, thenExpr, elseExpr, loc: tok.loc };
    }
    if (this.match("KEYWORD", "for") || this.match("IDENT", "for")) {
      const tok2 = this.previous();
      this.consume("SYMBOL", "(", "Expected '(' after 'for'");
      let init;
      if (this.check("KEYWORD", "let")) {
        init = this.parseLetStatement(false);
      } else if (!this.check("SYMBOL", ";")) {
        init = this.parseExpr();
        if (this.check("SYMBOL", ";")) this.advance();
      } else {
        this.consume("SYMBOL", ";");
      }
      let cond;
      if (!this.check("SYMBOL", ";")) {
        cond = this.parseExpr();
      }
      this.consume("SYMBOL", ";", "Expected ';' after for loop condition");
      let update;
      if (!this.check("SYMBOL", ")")) {
        update = this.parseExpr();
      }
      this.consume("SYMBOL", ")", "Expected ')' after for loop update");
      this.consume("SYMBOL", "{", "Expected '{' for loop body");
      const body = this.parseBlockBody(tok2.loc);
      return { kind: "e_for", init, cond, update, body, loc: tok2.loc };
    }
    if (this.match("KEYWORD", "while") || this.match("IDENT", "while")) {
      const tok2 = this.previous();
      let cond;
      if (this.check("SYMBOL", "(")) {
        this.advance();
        cond = this.parseExpr();
        this.consume("SYMBOL", ")", "Expected ')' after while condition");
      } else {
        cond = this.parseExpr();
      }
      this.consume("SYMBOL", "{", "Expected '{' for while body");
      const body = this.parseBlockBody(tok2.loc);
      return { kind: "e_while", cond, body, loc: tok2.loc };
    }
    if (this.match("KEYWORD", "do")) {
      let monad;
      if (this.match("SYMBOL", "(")) {
        monad = this.parseExpr();
        this.consume("SYMBOL", ")", "Expected ')' after do monad parameter");
      }
      this.consume("SYMBOL", "{", "Expected '{' to start do block");
      const items = [];
      while (!this.check("SYMBOL", "}") && !this.isAtEnd()) {
        items.push(this.parseDoItem());
      }
      const closeBrace = this.consume("SYMBOL", "}", "Expected '}' at end of do block");
      const endLoc = closeBrace?.loc || (items.length > 0 ? items[items.length - 1].loc : tok.loc);
      return {
        kind: "e_do",
        monad,
        items,
        loc: {
          line: tok.loc.line,
          col: tok.loc.col,
          endLine: endLoc?.endLine || endLoc?.line || tok.loc.line + 5e3,
          endCol: endLoc?.endCol || 999999
        }
      };
    }
    if (this.check("SYMBOL", "{") && !this.isRecordLiteralStart()) {
      this.advance();
      return this.parseBlockBody(tok.loc);
    }
    if (this.check("SYMBOL", "{")) {
      return this.parseRecordExpression();
    }
    if (this.check("SYMBOL", "<")) {
      const loc = this.peek().loc;
      const typeParams = this.parseTypeParams();
      this.consume("SYMBOL", "(", "Expected '(' for lambda parameters");
      const params = this.parseLambdaParams();
      this.consume("SYMBOL", ")", "Expected ')' after lambda parameters");
      let returnType;
      if (this.match("SYMBOL", ":")) {
        returnType = this.parseTypeAST();
      }
      this.consume("SYMBOL", "=>", "Expected '=>' in lambda expression");
      const body = this.parseExpr();
      return {
        kind: "e_lambda",
        typeParams,
        params,
        returnType,
        body,
        loc
      };
    }
    if (this.match("KEYWORD", "fn")) {
      const typeParams = this.parseTypeParams();
      this.consume("SYMBOL", "(", "Expected '(' for lambda parameters");
      const params = this.parseLambdaParams();
      this.consume("SYMBOL", ")", "Expected ')' after lambda parameters");
      let returnType;
      if (this.match("SYMBOL", ":")) {
        returnType = this.parseTypeAST();
      }
      let body;
      if (this.match("SYMBOL", "=>")) {
        body = this.parseExpr();
      } else if (this.check("SYMBOL", "{")) {
        this.advance();
        body = this.parseBlockBody(tok.loc);
      } else {
        throw new Error(`Expected '=>' or '{' for lambda body at line ${tok.loc.line}, col ${tok.loc.col}`);
      }
      return {
        kind: "e_lambda",
        typeParams,
        params,
        returnType,
        body,
        loc: tok.loc
      };
    }
    if (this.match("SYMBOL", "(")) {
      if (this.match("SYMBOL", ")")) {
        if (this.match("SYMBOL", "=>")) {
          const body = this.parseExpr();
          return { kind: "e_lambda", typeParams: [], params: [], body, loc: tok.loc };
        }
        return { kind: "e_literal", value: null, loc: tok.loc };
      }
      if (this.check("IDENT") && this.lookaheadSymbol(":")) {
        const params = this.parseLambdaParams();
        this.consume("SYMBOL", ")");
        let returnType;
        if (this.match("SYMBOL", ":")) {
          returnType = this.parseTypeAST();
        }
        this.consume("SYMBOL", "=>", "Expected '=>' in lambda expression");
        const body = this.parseExpr();
        return { kind: "e_lambda", typeParams: [], params, returnType, body, loc: tok.loc };
      }
      const firstExpr = this.parseExpr();
      if (this.match("SYMBOL", ",")) {
        const elements = [firstExpr];
        do {
          elements.push(this.parseExpr());
        } while (this.match("SYMBOL", ","));
        this.consume("SYMBOL", ")", "Expected ')' at end of tuple");
        return { kind: "e_tuple", elements, loc: tok.loc };
      }
      this.consume("SYMBOL", ")", "Expected ')' after expression");
      return firstExpr;
    }
    if (this.match("SYMBOL", "[")) {
      const elements = [];
      if (!this.check("SYMBOL", "]")) {
        const firstExpr = this.parseExpr();
        if (this.match("KEYWORD", "for")) {
          const param = this.consumeIdentOrKeyword("Expected identifier after 'for'");
          this.consume("KEYWORD", "in", "Expected 'in' after list comprehension param");
          const iterable = this.parseExpr();
          let condition;
          if (this.match("KEYWORD", "if")) {
            condition = this.parseExpr();
          }
          this.consume("SYMBOL", "]", "Expected ']' at end of list comprehension");
          return { kind: "e_list_comp", element: firstExpr, param, iterable, condition, loc: tok.loc };
        }
        elements.push(firstExpr);
        while (this.match("SYMBOL", ",")) {
          if (this.check("SYMBOL", "]")) break;
          elements.push(this.parseExpr());
        }
      }
      this.consume("SYMBOL", "]", "Expected ']' at end of tuple");
      if (elements.length === 1 && elements[0].kind === "e_range") {
        return elements[0];
      }
      return { kind: "e_tuple", elements, loc: tok.loc };
    }
    if (this.check("IDENT") || this.check("KEYWORD", "self") || this.check("KEYWORD", "pure")) {
      const name = this.advance().value;
      if (/^[A-Z]/.test(name) && this.match("SYMBOL", ".")) {
        const dotTok = this.previous();
        const nextTok = this.peek();
        const isNextOnSameLine = nextTok && nextTok.loc && nextTok.loc.line === dotTok.loc.line;
        const isStatementKeyword = nextTok && nextTok.type === "KEYWORD" && ["let", "function", "type", "module", "extern", "import", "export", "return"].includes(nextTok.value);
        const modulePath = [name];
        let fieldName = "";
        if (isNextOnSameLine && !isStatementKeyword && (this.check("IDENT") || this.check("KEYWORD"))) {
          fieldName = this.consumeIdentOrKeyword("Expected field or member name");
          while (/^[A-Z]/.test(fieldName) && this.match("SYMBOL", ".")) {
            modulePath.push(fieldName);
            if (this.check("IDENT") || this.check("KEYWORD")) {
              fieldName = this.consumeIdentOrKeyword("Expected field or member name");
            } else {
              fieldName = "";
              break;
            }
          }
        }
        return {
          kind: "e_var",
          name: fieldName,
          modulePath,
          loc: tok.loc
        };
      }
      return { kind: "e_var", name, loc: tok.loc };
    }
    if (!tok.loc) {
      throw new Error(`Unexpected token '${tok.value}' in expression at end of file`);
    }
    throw new Error(`Unexpected token '${tok.value}' in expression at line ${tok.loc.line}, col ${tok.loc.col}`);
  }
  parseDoItem() {
    const tok = this.peek();
    if (this.match("KEYWORD", "let")) {
      const isMut = this.match("KEYWORD", "mut");
      const name = this.consume("IDENT", void 0, "Expected variable name").value;
      let typeAnnotation;
      if (this.match("SYMBOL", ":")) {
        typeAnnotation = this.parseTypeAST();
      }
      this.consume("SYMBOL", "=", "Expected '=' in let declaration");
      const init = this.parseExpr();
      this.match("SYMBOL", ";");
      return {
        kind: "do_let",
        name,
        isMut,
        typeAnnotation,
        init,
        loc: {
          line: tok.loc.line,
          col: tok.loc.col,
          endLine: init.loc?.endLine || tok.loc.endLine,
          endCol: init.loc?.endCol || tok.loc.endCol
        }
      };
    }
    if (this.isDoBindAhead()) {
      const pattern = this.parsePattern();
      this.consume("SYMBOL", "<-", "Expected '<-' in monadic bind");
      const expr2 = this.parseExpr();
      this.match("SYMBOL", ";");
      return {
        kind: "do_bind",
        pattern,
        expr: expr2,
        loc: {
          line: pattern.loc?.line || tok.loc.line,
          col: pattern.loc?.col || tok.loc.col,
          endLine: expr2.loc?.endLine || pattern.loc?.endLine,
          endCol: expr2.loc?.endCol || pattern.loc?.endCol
        }
      };
    }
    if (this.match("KEYWORD", "pure")) {
      const expr2 = this.parseExpr();
      this.match("SYMBOL", ";");
      return {
        kind: "do_return",
        expr: expr2,
        isPure: true,
        loc: {
          line: tok.loc.line,
          col: tok.loc.col,
          endLine: expr2.loc?.endLine || tok.loc.endLine,
          endCol: expr2.loc?.endCol || tok.loc.endCol
        }
      };
    }
    if (this.match("KEYWORD", "return")) {
      const expr2 = this.parseExpr();
      this.match("SYMBOL", ";");
      return {
        kind: "do_return",
        expr: expr2,
        isPure: false,
        loc: {
          line: tok.loc.line,
          col: tok.loc.col,
          endLine: expr2.loc?.endLine || tok.loc.endLine,
          endCol: expr2.loc?.endCol || tok.loc.endCol
        }
      };
    }
    const expr = this.parseExpr();
    this.match("SYMBOL", ";");
    return {
      kind: "do_expr",
      expr,
      loc: expr.loc
    };
  }
  isDoBindAhead() {
    let i = this.pos;
    let parenDepth = 0;
    let braceDepth = 0;
    let bracketDepth = 0;
    while (i < this.tokens.length) {
      const t = this.tokens[i];
      if (t.type === "EOF") break;
      if (t.type === "SYMBOL") {
        if (t.value === "(") parenDepth++;
        else if (t.value === ")") parenDepth--;
        else if (t.value === "{") braceDepth++;
        else if (t.value === "}") {
          if (braceDepth === 0) break;
          braceDepth--;
        } else if (t.value === "[") bracketDepth++;
        else if (t.value === "]") bracketDepth--;
        else if (t.value === ";" && parenDepth === 0 && braceDepth === 0 && bracketDepth === 0) break;
        else if (t.value === "<-" && parenDepth === 0 && braceDepth === 0 && bracketDepth === 0) {
          return true;
        }
      }
      i++;
    }
    return false;
  }
  isRecordLiteralStart() {
    if (this.pos + 1 < this.tokens.length) {
      const next = this.tokens[this.pos + 1];
      if (next.value === "mut" || next.value === "...") return true;
      if (next.value === "}") return true;
      if ((next.type === "IDENT" || next.type === "KEYWORD") && this.pos + 2 < this.tokens.length) {
        const next2 = this.tokens[this.pos + 2];
        if (next2.value === ":") return true;
        if (next2.value === "(") {
          if (this.pos + 3 < this.tokens.length && this.tokens[this.pos + 3].value === "self") {
            return true;
          }
        }
        if (next2.value === ",") {
          return true;
        }
      }
    }
    return false;
  }
  parseRecordExpression() {
    const tok = this.consume("SYMBOL", "{");
    let base;
    const fields = [];
    const methods = [];
    if (!this.check("SYMBOL", "}")) {
      if (this.match("SYMBOL", "...")) {
        base = this.parseExpr();
        if (this.match("SYMBOL", ",")) {
        }
      }
      while (!this.check("SYMBOL", "}") && !this.isAtEnd()) {
        const isMut = this.match("KEYWORD", "mut");
        const name = this.consumeIdentOrKeyword("Expected field name");
        if (this.match("SYMBOL", "(")) {
          const selfParam = this.consumeIdentOrKeyword("Expected 'self' param name");
          const params = [];
          if (!this.check("SYMBOL", ")")) {
            do {
              const pName = this.consumeIdentOrKeyword("Expected parameter name");
              let pType;
              if (this.match("SYMBOL", ":")) {
                pType = this.parseTypeAST();
              }
              params.push({ name: pName, type: pType });
            } while (this.match("SYMBOL", ","));
          }
          this.consume("SYMBOL", ")", "Expected ')' after method parameters");
          let returnType;
          if (this.match("SYMBOL", ":")) {
            returnType = this.parseTypeAST();
          }
          this.consume("SYMBOL", "{", "Expected '{' for method body");
          const body = this.parseBlockBody();
          methods.push({ name, selfParam, params, returnType, body });
        } else {
          let value;
          if (this.match("SYMBOL", ":")) {
            value = this.parseExpr();
          } else {
            value = { kind: "e_var", name, loc: tok.loc };
          }
          fields.push({ name, value, isMut });
        }
        this.match("SYMBOL", ",");
      }
    }
    this.consume("SYMBOL", "}", "Expected '}' at end of record");
    if (base) {
      return { kind: "e_record_update", base, updates: fields, loc: tok.loc };
    }
    return { kind: "e_record", fields, methods, loc: tok.loc };
  }
  parseLambdaParams() {
    const params = [];
    if (this.check("SYMBOL", ")")) return params;
    do {
      const pTok = this.peek();
      const name = this.consumeIdentOrKeyword("Expected parameter name");
      let type;
      if (this.match("SYMBOL", ":")) {
        type = this.parseTypeAST();
      }
      params.push({ name, type, loc: pTok.loc });
    } while (this.match("SYMBOL", ","));
    return params;
  }
  parseBlockBody(loc) {
    const statements = [];
    let result;
    while (!this.check("SYMBOL", "}") && !this.isAtEnd()) {
      if (this.check("KEYWORD", "let") || this.check("KEYWORD", "function") || this.check("KEYWORD", "type") || this.check("KEYWORD", "import") || this.check("KEYWORD", "module") || this.check("KEYWORD", "extern") || this.check("KEYWORD", "export")) {
        statements.push(this.parseStatement());
      } else {
        const expr = this.parseExpr();
        if (this.check("SYMBOL", ";")) {
          this.advance();
          statements.push({ kind: "s_expr", expr, loc: expr.loc });
        } else if (this.check("SYMBOL", "}")) {
          result = expr;
        } else {
          statements.push({ kind: "s_expr", expr, loc: expr.loc });
        }
      }
    }
    this.consume("SYMBOL", "}", "Expected '}' at end of block");
    return { kind: "e_block", statements, result, loc };
  }
  // ==================== PATTERN PARSER ====================
  parsePattern() {
    const tok = this.peek();
    if (this.match("IDENT", "_")) {
      return { kind: "p_wildcard", loc: tok.loc };
    }
    if (this.match("NUMBER")) {
      return { kind: "p_literal", value: parseFloat(this.previous().value), loc: tok.loc };
    }
    if (this.match("STRING")) {
      return { kind: "p_literal", value: this.previous().value, loc: tok.loc };
    }
    if (this.match("BOOLEAN")) {
      return { kind: "p_literal", value: this.previous().value === "true", loc: tok.loc };
    }
    if (this.match("SYMBOL", "{")) {
      const fields = [];
      if (!this.check("SYMBOL", "}")) {
        do {
          const name = this.consume("IDENT", void 0, "Expected record field pattern name").value;
          let alias;
          let pattern;
          if (this.match("SYMBOL", ":")) {
            pattern = this.parsePattern();
          }
          fields.push({ name, alias, pattern });
        } while (this.match("SYMBOL", ","));
      }
      this.consume("SYMBOL", "}", "Expected '}' after record pattern");
      return { kind: "p_record", fields, loc: tok.loc };
    }
    if (this.match("SYMBOL", "[")) {
      const elements = [];
      if (!this.check("SYMBOL", "]")) {
        do {
          elements.push(this.parsePattern());
        } while (this.match("SYMBOL", ","));
      }
      this.consume("SYMBOL", "]", "Expected ']' after tuple pattern");
      return { kind: "p_tuple", elements, loc: tok.loc };
    }
    if (this.check("IDENT") || this.check("KEYWORD", "self")) {
      const name = this.advance().value;
      if (/^[A-Z]/.test(name)) {
        const args = [];
        if (this.match("SYMBOL", "(")) {
          if (!this.check("SYMBOL", ")")) {
            do {
              args.push(this.parsePattern());
            } while (this.match("SYMBOL", ","));
          }
          this.consume("SYMBOL", ")", "Expected ')' after constructor pattern arguments");
        }
        return { kind: "p_ctor", name, args, loc: tok.loc };
      }
      return { kind: "p_var", name, loc: tok.loc };
    }
    throw new Error(`Unexpected token '${tok.value}' in pattern at line ${tok.loc.line}, col ${tok.loc.col}`);
  }
};

// ../lang/docComments.ts
function normalizeDocComment(raw) {
  let text = raw.trim();
  if (text.startsWith("/**")) text = text.slice(3, text.endsWith("*/") ? -2 : void 0);
  return text.split(/\r?\n/).map((line) => line.replace(/^\s*\/\/\//, "").replace(/^\s*\*/, "").replace(/^\s+/, "").trimEnd()).join("\n").trim().split("\n");
}
function parseDocComment(raw) {
  if (!raw) return { description: "", tags: [] };
  const description = [];
  const tags = [];
  let activeTag;
  for (const line of normalizeDocComment(raw)) {
    const tagMatch = line.match(/^@([\w-]+)\b(?:\s+(.*))?$/);
    if (tagMatch) {
      const tag = tagMatch[1].toLowerCase();
      let value = (tagMatch[2] || "").trim();
      let name;
      if (tag === "param" || tag === "arg" || tag === "argument" || tag === "typeparam" || tag === "template") {
        value = value.replace(/^\{[^}]*\}\s*/, "");
        const nameMatch = value.match(/^(?:<([^>]+)>|\[([^\]=]+)(?:=[^\]]+)?\]|([^\s-]+))(?:\s+-?\s*)?(.*)$/);
        if (nameMatch) {
          name = nameMatch[1] || nameMatch[2] || nameMatch[3];
          value = nameMatch[4] || "";
        }
      }
      activeTag = { tag, name, description: value };
      tags.push(activeTag);
      continue;
    }
    if (activeTag) {
      activeTag.description = [activeTag.description, line.trim()].filter(Boolean).join("\n");
    } else {
      description.push(line);
    }
  }
  return { description: description.join("\n").trim(), tags };
}
function getParameterDoc(raw, name) {
  const aliases = /* @__PURE__ */ new Set(["param", "arg", "argument"]);
  return parseDocComment(raw).tags.find((tag) => aliases.has(tag.tag) && tag.name === name)?.description || void 0;
}
function renderDocComment(raw, parameterNames = []) {
  if (!raw) return void 0;
  const parsed = parseDocComment(raw);
  const sections = [];
  if (parsed.description) sections.push(parsed.description);
  const params = new Map(parsed.tags.filter((tag) => ["param", "arg", "argument"].includes(tag.tag) && tag.name).map((tag) => [tag.name, tag.description]));
  const documentedParams = parameterNames.filter((name) => params.has(name));
  if (documentedParams.length) {
    sections.push(`**Parameters**
${documentedParams.map((name) => `- \`${name}\`: ${params.get(name)}`).join("\n")}`);
  }
  const renderTag = (tag) => {
    switch (tag.tag) {
      case "return":
      case "returns":
        return tag.description ? `**Returns**
${tag.description}` : "";
      case "throws":
      case "exception":
        return `**Throws**${tag.name ? ` \`${tag.name}\`` : ""}${tag.description ? `
${tag.description}` : ""}`;
      case "example":
        return `**Example**

\`\`\`typelang
${tag.description}
\`\`\``;
      case "deprecated":
        return `> **Deprecated.** ${tag.description}`;
      case "since":
        return `*Since ${tag.description}*`;
      case "see":
        return `**See also:** ${tag.description}`;
      case "typeparam":
      case "template":
        return tag.name ? `- Type parameter \`${tag.name}\`: ${tag.description}` : "";
      default:
        return `**@${tag.tag}${tag.name ? ` ${tag.name}` : ""}**${tag.description ? `
${tag.description}` : ""}`;
    }
  };
  for (const tag of parsed.tags) {
    if (["param", "arg", "argument"].includes(tag.tag)) continue;
    const rendered = renderTag(tag);
    if (rendered) sections.push(rendered);
  }
  return sections.join("\n\n") || void 0;
}
function formatDocComment(raw) {
  return normalizeDocComment(raw).map((line) => `///${line ? ` ${line}` : ""}`).join("\n");
}

// ../lang/stdlibDocs.ts
var STDLIB_MODULES = [
  {
    id: "Option",
    name: "Option",
    category: "Monad",
    tagline: "Safe optional values without null or undefined exceptions",
    description: "The Option monad represents an optional value: every Option is either Some and contains a value, or None, and does not. It is the functional alternative to null/undefined pointers.",
    typeDefinition: `type Option<a> =
  | Some(val: a): Option<a>
  | None: Option<a>`,
    lawsDoc: {
      leftIdentity: "flatMap(pure(x), f)  ===  f(x)",
      rightIdentity: "flatMap(m, pure)  ===  m",
      associativity: "flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"
    },
    doNotationSnippet: `import Option.{ Some, None, getOrElse, map, filter }

let result = do(Option) {
  userId <- Some(42);
  user <- findUserById(userId);
  profile <- user.profile;
  pure profile.email;
}`,
    typeLangSource: `// Option Module Implementation in TypeLang
module Option {
  export function pure<a>(val: a): Option<a> {
    Some(val)
  }

  export function of<a>(val: a): Option<a> {
    Some(val)
  }

  export function isSome<a>(opt: Option<a>): boolean {
    match (opt) {
      Some(_) => true
      None => false
    }
  }

  export function isNone<a>(opt: Option<a>): boolean {
    match (opt) {
      Some(_) => false
      None => true
    }
  }

  export function getOrElse<a>(opt: Option<a>, defaultVal: a): a {
    match (opt) {
      Some(v) => v
      None => defaultVal
    }
  }

  export function orElse<a>(opt: Option<a>, altOpt: Option<a>): Option<a> {
    match (opt) {
      Some(_) => opt
      None => altOpt
    }
  }

  export function map<a, b>(opt: Option<a>, fn: (x: a) => b): Option<b> {
    match (opt) {
      Some(v) => Some(fn(v))
      None => None
    }
  }

  export function flatMap<a, b>(opt: Option<a>, fn: (x: a) => Option<b>): Option<b> {
    match (opt) {
      Some(v) => fn(v)
      None => None
    }
  }

  export function filter<a>(opt: Option<a>, pred: (x: a) => boolean): Option<a> {
    match (opt) {
      Some(v) => if (pred(v)) Some(v) else None
      None => None
    }
  }

  export function fold<a, b>(opt: Option<a>, defaultVal: b, fn: (x: a) => b): b {
    match (opt) {
      Some(v) => fn(v)
      None => defaultVal
    }
  }

  export function flatten<a>(opt: Option<Option<a>>): Option<a> {
    match (opt) {
      Some(inner) => inner
      None => None
    }
  }

  export function zip<a, b>(optA: Option<a>, optB: Option<b>): Option<(a, b)> {
    match (optA) {
      Some(a) => match (optB) {
        Some(b) => Some((a, b))
        None => None
      }
      None => None
    }
  }

  export function toResult<a, e>(opt: Option<a>, err: e): Result<a, e> {
    match (opt) {
      Some(v) => Ok(v)
      None => Err(err)
    }
  }

  export function contains<a>(opt: Option<a>, elem: a): boolean {
    match (opt) {
      Some(v) => v == elem
      None => false
    }
  }

  export function exists<a>(opt: Option<a>, pred: (x: a) => boolean): boolean {
    match (opt) {
      Some(v) => pred(v)
      None => false
    }
  }

  export function tap<a>(opt: Option<a>, fn: (x: a) => void): Option<a> {
    match (opt) {
      Some(v) => { fn(v); opt }
      None => None
    }
  }
}`,
    jsSource: `const $Some = (val) => Object.freeze({ $tag: "Some", val, $args: [val] });
const $None = Object.freeze({ $tag: "None", $args: [] });
const $Option = {
  Some: $Some,
  None: $None,
  pure: $Some,
  of: $Some,
  isSome: (opt) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some"),
  isNone: (opt) => Boolean(!opt || typeof opt !== "object" || opt.$tag === "None"),
  getOrElse: (opt, defaultVal) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt.val : defaultVal),
  map: (opt, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? $Some(fn(opt.val)) : $None),
  flatMap: (opt, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? fn(opt.val) : $None),
  filter: (opt, pred) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof pred === "function" && pred(opt.val) ? opt : $None),
  flatten: (opt) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt.val : $None),
  zip: (a, b) => (a && typeof a === "object" && a.$tag === "Some" && b && typeof b === "object" && b.$tag === "Some" ? $Some([a.val, b.val]) : $None),
  fromNullable: (v) => (v === null || v === undefined ? $None : $Some(v)),
  fold: (opt, defaultVal, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? fn(opt.val) : defaultVal),
  orElse: (opt, alt) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt : alt),
  toResult: (opt, err) => (opt && typeof opt === "object" && opt.$tag === "Some" ? $Ok(opt.val) : $Err(err)),
  contains: (opt, elem) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some" && opt.val === elem),
  exists: (opt, pred) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some" && typeof pred === "function" && pred(opt.val)),
  tap: (opt, fn) => { if (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function") fn(opt.val); return opt; }
};`,
    functions: [
      {
        name: "pure",
        signature: "pure<a>(val: a): Option<a>",
        description: "Lifts a pure value into an Option by wrapping it with Some(val).",
        typeLangImpl: "function pure<a>(val: a): Option<a> { Some(val) }",
        jsImpl: "(val) => $Some(val)",
        example: "let opt = Option.pure(42) // Some(42)"
      },
      {
        name: "map",
        signature: "map<a, b>(opt: Option<a>, fn: (x: a) => b): Option<b>",
        description: "Applies a function to the value inside Some, or returns None unchanged.",
        typeLangImpl: "function map<a, b>(opt: Option<a>, fn: (x: a) => b): Option<b> {\n  match (opt) {\n    Some(v) => Some(fn(v))\n    None => None\n  }\n}",
        jsImpl: '(opt, fn) => (opt?.$tag === "Some" ? $Some(fn(opt.val)) : $None)',
        example: "Option.map(Some(10), (x: number) => x * 2) // Some(20)"
      },
      {
        name: "flatMap",
        signature: "flatMap<a, b>(opt: Option<a>, fn: (x: a) => Option<b>): Option<b>",
        description: "Sequences two monadic Option computations, propagating None if either fails.",
        typeLangImpl: "function flatMap<a, b>(opt: Option<a>, fn: (x: a) => Option<b>): Option<b> {\n  match (opt) {\n    Some(v) => fn(v)\n    None => None\n  }\n}",
        jsImpl: '(opt, fn) => (opt?.$tag === "Some" ? fn(opt.val) : $None)',
        example: "Option.flatMap(Some(10), (x: number) => if (x > 5) Some(x) else None)"
      },
      {
        name: "getOrElse",
        signature: "getOrElse<a>(opt: Option<a>, defaultVal: a): a",
        description: "Extracts the value from Some, or returns defaultVal if None.",
        typeLangImpl: "function getOrElse<a>(opt: Option<a>, defaultVal: a): a {\n  match (opt) {\n    Some(v) => v\n    None => defaultVal\n  }\n}",
        jsImpl: '(opt, defaultVal) => (opt?.$tag === "Some" ? opt.val : defaultVal)',
        example: "Option.getOrElse(None, 100) // 100"
      },
      {
        name: "filter",
        signature: "filter<a>(opt: Option<a>, pred: (x: a) => boolean): Option<a>",
        description: "Retains the value if Some and pred(val) is true, otherwise returns None.",
        typeLangImpl: "function filter<a>(opt: Option<a>, pred: (x: a) => boolean): Option<a> {\n  match (opt) {\n    Some(v) => if (pred(v)) Some(v) else None\n    None => None\n  }\n}",
        jsImpl: '(opt, pred) => (opt?.$tag === "Some" && pred(opt.val) ? opt : $None)',
        example: "Option.filter(Some(12), (x: number) => x % 2 == 0) // Some(12)"
      },
      {
        name: "fold",
        signature: "fold<a, b>(opt: Option<a>, defaultVal: b, fn: (x: a) => b): b",
        description: "Applies fn if Some, or returns defaultVal if None.",
        typeLangImpl: "function fold<a, b>(opt: Option<a>, defaultVal: b, fn: (x: a) => b): b {\n  match (opt) {\n    Some(v) => fn(v)\n    None => defaultVal\n  }\n}",
        jsImpl: '(opt, defaultVal, fn) => (opt?.$tag === "Some" ? fn(opt.val) : defaultVal)',
        example: 'Option.fold(Some("hello"), 0, (s: string) => String.len(s)) // 5'
      }
    ]
  },
  {
    id: "Result",
    name: "Result",
    category: "Monad",
    tagline: "Railway-oriented error handling with explicit failure values",
    description: "Result is a type used for returning and propagating errors. It has two variants: Ok representing success and containing a value, and Err representing error and containing an error cause.",
    typeDefinition: `type Result<a, e> =
  | Ok(val: a): Result<a, e>
  | Err(err: e): Result<a, e>`,
    lawsDoc: {
      leftIdentity: "flatMap(pure(x), f)  ===  f(x)",
      rightIdentity: "flatMap(m, pure)  ===  m",
      associativity: "flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"
    },
    doNotationSnippet: `import Result.{ Ok, Err, map, mapError, getOrElse }

function safeCalculate(rawInput: string): Result<number, string> {
  do(Result) {
    num <- parseNumber(rawInput);
    positive <- if (num > 0) Ok(num) else Err("Number must be positive");
    reciprocal <- if (positive != 0) Ok(100 / positive) else Err("Division by zero");
    pure reciprocal * 2;
  }
}`,
    typeLangSource: `// Result Module Implementation in TypeLang
module Result {
  export function pure<a, e>(val: a): Result<a, e> {
    Ok(val)
  }

  export function of<a, e>(val: a): Result<a, e> {
    Ok(val)
  }

  export function isOk<a, e>(res: Result<a, e>): boolean {
    match (res) {
      Ok(_) => true
      Err(_) => false
    }
  }

  export function isErr<a, e>(res: Result<a, e>): boolean {
    match (res) {
      Ok(_) => false
      Err(_) => true
    }
  }

  export function getOrElse<a, e>(res: Result<a, e>, defaultVal: a): a {
    match (res) {
      Ok(v) => v
      Err(_) => defaultVal
    }
  }

  export function orElse<a, e>(res: Result<a, e>, altRes: Result<a, e>): Result<a, e> {
    match (res) {
      Ok(_) => res
      Err(_) => altRes
    }
  }

  export function map<a, b, e>(res: Result<a, e>, fn: (x: a) => b): Result<b, e> {
    match (res) {
      Ok(v) => Ok(fn(v))
      Err(err) => Err(err)
    }
  }

  export function mapError<a, e, e2>(res: Result<a, e>, fn: (err: e) => e2): Result<a, e2> {
    match (res) {
      Ok(v) => Ok(v)
      Err(err) => Err(fn(err))
    }
  }

  export function flatMap<a, b, e>(res: Result<a, e>, fn: (x: a) => Result<b, e>): Result<b, e> {
    match (res) {
      Ok(v) => fn(v)
      Err(err) => Err(err)
    }
  }

  export function fold<a, e, b>(res: Result<a, e>, onErr: (err: e) => b, onOk: (val: a) => b): b {
    match (res) {
      Ok(v) => onOk(v)
      Err(err) => onErr(err)
    }
  }

  export function toOption<a, e>(res: Result<a, e>): Option<a> {
    match (res) {
      Ok(v) => Some(v)
      Err(_) => None
    }
  }

  export function fromOption<a, e>(opt: Option<a>, err: e): Result<a, e> {
    match (opt) {
      Some(v) => Ok(v)
      None => Err(err)
    }
  }

  export function fromTry<a>(fn: () => a): Result<a, string> {
    // Wrapped with runtime try/catch
    Ok(fn())
  }
}`,
    jsSource: `const $Ok = (val) => Object.freeze({ $tag: "Ok", val, $args: [val] });
const $Err = (err) => Object.freeze({ $tag: "Err", err, $args: [err] });
const $Result = {
  Ok: $Ok,
  Err: $Err,
  pure: $Ok,
  of: $Ok,
  isOk: (res) => Boolean(res && typeof res === "object" && res.$tag === "Ok"),
  isErr: (res) => Boolean(!res || typeof res !== "object" || res.$tag === "Err"),
  getOrElse: (res, defaultVal) => (res && typeof res === "object" && res.$tag === "Ok" ? res.val : defaultVal),
  map: (res, fn) => (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function" ? $Ok(fn(res.val)) : res),
  mapError: (res, fn) => (res && typeof res === "object" && res.$tag === "Err" && typeof fn === "function" ? $Err(fn(res.err)) : res),
  flatMap: (res, fn) => (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function" ? fn(res.val) : res),
  flatten: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? res.val : res),
  toOption: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? $Some(res.val) : $None),
  fromOption: (opt, err) => (opt && typeof opt === "object" && opt.$tag === "Some" ? $Ok(opt.val) : $Err(err)),
  fold: (res, onErr, onOk) => (res && typeof res === "object" && res.$tag === "Ok" && typeof onOk === "function" ? onOk(res.val) : (typeof onErr === "function" ? onErr(res && res.$tag === "Err" ? res.err : res) : res)),
  orElse: (res, alt) => (res && typeof res === "object" && res.$tag === "Ok" ? res : alt),
  zip: (a, b) => (a && typeof a === "object" && a.$tag === "Ok" && b && typeof b === "object" && b.$tag === "Ok" ? $Ok([a.val, b.val]) : (a && a.$tag === "Err" ? a : b)),
  tap: (res, fn) => { if (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function") fn(res.val); return res; },
  fromTry: (fn) => { try { return $Ok(typeof fn === "function" ? fn() : fn); } catch(e) { return $Err(e?.message || String(e)); } }
};`,
    functions: [
      {
        name: "pure",
        signature: "pure<a, e>(val: a): Result<a, e>",
        description: "Lifts a successful value into a Result by wrapping with Ok(val).",
        typeLangImpl: "function pure<a, e>(val: a): Result<a, e> { Ok(val) }",
        jsImpl: "(val) => $Ok(val)",
        example: "let res = Result.pure(200) // Ok(200)"
      },
      {
        name: "map",
        signature: "map<a, b, e>(res: Result<a, e>, fn: (x: a) => b): Result<b, e>",
        description: "Transforms the successful Ok value, leaving Err untouched.",
        typeLangImpl: "function map<a, b, e>(res: Result<a, e>, fn: (x: a) => b): Result<b, e> {\n  match (res) {\n    Ok(v) => Ok(fn(v))\n    Err(e) => Err(e)\n  }\n}",
        jsImpl: '(res, fn) => (res?.$tag === "Ok" ? $Ok(fn(res.val)) : res)',
        example: "Result.map(Ok(10), (x: number) => x * 5) // Ok(50)"
      },
      {
        name: "mapError",
        signature: "mapError<a, e, e2>(res: Result<a, e>, fn: (err: e) => e2): Result<a, e2>",
        description: "Transforms the error inside Err, leaving Ok untouched.",
        typeLangImpl: "function mapError<a, e, e2>(res: Result<a, e>, fn: (err: e) => e2): Result<a, e2> {\n  match (res) {\n    Ok(v) => Ok(v)\n    Err(e) => Err(fn(e))\n  }\n}",
        jsImpl: '(res, fn) => (res?.$tag === "Err" ? $Err(fn(res.err)) : res)',
        example: 'Result.mapError(Err(404), (code: number) => concat("HTTP Error ", to_string(code)))'
      },
      {
        name: "flatMap",
        signature: "flatMap<a, b, e>(res: Result<a, e>, fn: (x: a) => Result<b, e>): Result<b, e>",
        description: "Sequences fallible operations. If Ok, calls fn with the value; if Err, stops early.",
        typeLangImpl: "function flatMap<a, b, e>(res: Result<a, e>, fn: (x: a) => Result<b, e>): Result<b, e> {\n  match (res) {\n    Ok(v) => fn(v)\n    Err(e) => Err(e)\n  }\n}",
        jsImpl: '(res, fn) => (res?.$tag === "Ok" ? fn(res.val) : res)',
        example: 'Result.flatMap(safeParse("10"), (n: number) => safeDivide(100, n))'
      },
      {
        name: "fold",
        signature: "fold<a, e, b>(res: Result<a, e>, onErr: (err: e) => b, onOk: (val: a) => b): b",
        description: "Folds a Result into a single output by handling both Ok and Err cases.",
        typeLangImpl: "function fold<a, e, b>(res: Result<a, e>, onErr: (err: e) => b, onOk: (val: a) => b): b {\n  match (res) {\n    Ok(v) => onOk(v)\n    Err(e) => onErr(e)\n  }\n}",
        jsImpl: '(res, onErr, onOk) => (res?.$tag === "Ok" ? onOk(res.val) : onErr(res.err))',
        example: "Result.fold(res, (err: string) => 0, (val: number) => val)"
      }
    ]
  },
  {
    id: "Either",
    name: "Either",
    category: "Monad",
    tagline: "Disjoint union representing two possible types (Left or Right)",
    description: "The Either type represents values with two possibilities: Left(a) or Right(b). By convention, Right is used to contain successful values, and Left contains error or auxiliary data.",
    typeDefinition: `type Either<l, r> =
  | Left(left: l): Either<l, r>
  | Right(right: r): Either<l, r>`,
    lawsDoc: {
      leftIdentity: "flatMap(pure(x), f)  ===  f(x)",
      rightIdentity: "flatMap(m, pure)  ===  m",
      associativity: "flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"
    },
    doNotationSnippet: `import Either.{ Left, Right, map, fold }

let computation = do(Either) {
  valA <- Right(10);
  valB <- Right(20);
  pure valA + valB;
}`,
    typeLangSource: `// Either Module Implementation in TypeLang
module Either {
  export function pure<l, r>(val: r): Either<l, r> {
    Right(val)
  }

  export function of<l, r>(val: r): Either<l, r> {
    Right(val)
  }

  export function left<l, r>(lVal: l): Either<l, r> {
    Left(lVal)
  }

  export function right<l, r>(rVal: r): Either<l, r> {
    Right(rVal)
  }

  export function isRight<l, r>(e: Either<l, r>): boolean {
    match (e) {
      Right(_) => true
      Left(_) => false
    }
  }

  export function isLeft<l, r>(e: Either<l, r>): boolean {
    match (e) {
      Right(_) => false
      Left(_) => true
    }
  }

  export function getOrElse<l, r>(e: Either<l, r>, defaultVal: r): r {
    match (e) {
      Right(v) => v
      Left(_) => defaultVal
    }
  }

  export function map<l, r, r2>(e: Either<l, r>, fn: (x: r) => r2): Either<l, r2> {
    match (e) {
      Right(v) => Right(fn(v))
      Left(lVal) => Left(lVal)
    }
  }

  export function mapLeft<l, r, l2>(e: Either<l, r>, fn: (err: l) => l2): Either<l2, r> {
    match (e) {
      Right(v) => Right(v)
      Left(lVal) => Left(fn(lVal))
    }
  }

  export function flatMap<l, r, r2>(e: Either<l, r>, fn: (x: r) => Either<l, r2>): Either<l, r2> {
    match (e) {
      Right(v) => fn(v)
      Left(lVal) => Left(lVal)
    }
  }

  export function fold<l, r, b>(e: Either<l, r>, onLeft: (l: l) => b, onRight: (r: r) => b): b {
    match (e) {
      Right(v) => onRight(v)
      Left(lVal) => onLeft(lVal)
    }
  }

  export function swap<l, r>(e: Either<l, r>): Either<r, l> {
    match (e) {
      Right(v) => Left(v)
      Left(lVal) => Right(lVal)
    }
  }
}`,
    jsSource: `const $Left = (left) => Object.freeze({ $tag: "Left", left, $args: [left] });
const $Right = (right) => Object.freeze({ $tag: "Right", right, $args: [right] });
const $Either = {
  Left: $Left,
  Right: $Right,
  pure: $Right,
  of: $Right,
  left: $Left,
  right: $Right,
  isLeft: (e) => Boolean(e && typeof e === "object" && e.$tag === "Left"),
  isRight: (e) => Boolean(e && typeof e === "object" && e.$tag === "Right"),
  getOrElse: (e, defaultVal) => (e && typeof e === "object" && e.$tag === "Right" ? e.right : defaultVal),
  map: (e, fn) => (e && typeof e === "object" && e.$tag === "Right" && typeof fn === "function" ? $Right(fn(e.right)) : e),
  mapLeft: (e, fn) => (e && typeof e === "object" && e.$tag === "Left" && typeof fn === "function" ? $Left(fn(e.left)) : e),
  flatMap: (e, fn) => (e && typeof e === "object" && e.$tag === "Right" && typeof fn === "function" ? fn(e.right) : e),
  fold: (e, onLeft, onRight) => (e && typeof e === "object" && e.$tag === "Right" && typeof onRight === "function" ? onRight(e.right) : (typeof onLeft === "function" ? onLeft(e && e.$tag === "Left" ? e.left : e) : e)),
  swap: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Left(e.right) : (e && e.$tag === "Left" ? $Right(e.left) : e)),
  toOption: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Some(e.right) : $None),
  toResult: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Ok(e.right) : $Err(e?.left)),
  fromResult: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? $Right(res.val) : $Left(res?.err))
};`,
    functions: [
      {
        name: "pure",
        signature: "pure<l, r>(val: r): Either<l, r>",
        description: "Lifts a value into Right(val).",
        typeLangImpl: "function pure<l, r>(val: r): Either<l, r> { Right(val) }",
        jsImpl: "(val) => $Right(val)",
        example: "Either.pure(42) // Right(42)"
      },
      {
        name: "swap",
        signature: "swap<l, r>(e: Either<l, r>): Either<r, l>",
        description: "Swaps Left to Right and Right to Left.",
        typeLangImpl: "function swap<l, r>(e: Either<l, r>): Either<r, l> {\n  match (e) {\n    Right(r) => Left(r)\n    Left(l) => Right(l)\n  }\n}",
        jsImpl: '(e) => (e.$tag === "Right" ? $Left(e.right) : $Right(e.left))',
        example: 'Either.swap(Left("err")) // Right("err")'
      }
    ]
  },
  {
    id: "Reader",
    name: "Reader",
    category: "Monad",
    tagline: "Dependency injection & environment propagation without global state",
    description: "The Reader monad represents a computation that can read values from a shared environment r, pass it implicitly, and compute a result a.",
    typeDefinition: `type Reader<r, a> = {
  run: (environment: r) => a
}`,
    lawsDoc: {
      leftIdentity: "flatMap(pure(x), f)  ===  f(x)",
      rightIdentity: "flatMap(m, pure)  ===  m",
      associativity: "flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"
    },
    doNotationSnippet: `import Reader.{ ask, asks, run, local }

type Config = { host: string, port: number }

let buildUrl = do(Reader) {
  cfg <- Reader.ask();
  pure concat("https://", concat(cfg.host, concat(":", to_string(cfg.port))));
}

let endpoint = Reader.run(buildUrl, { host: "localhost", port: 8080 })`,
    typeLangSource: `// Reader Module Implementation in TypeLang
module Reader {
  export function pure<r, a>(val: a): Reader<r, a> {
    { run: (_env: r) => val }
  }

  export function ask<r>(): Reader<r, r> {
    { run: (env: r) => env }
  }

  export function asks<r, a>(fn: (env: r) => a): Reader<r, a> {
    { run: (env: r) => fn(env) }
  }

  export function run<r, a>(reader: Reader<r, a>, environment: r): a {
    reader.run(environment)
  }

  export function map<r, a, b>(reader: Reader<r, a>, fn: (x: a) => b): Reader<r, b> {
    { run: (env: r) => fn(reader.run(env)) }
  }

  export function flatMap<r, a, b>(reader: Reader<r, a>, fn: (x: a) => Reader<r, b>): Reader<r, b> {
    { run: (env: r) => {
        let val = reader.run(env);
        let nextReader = fn(val);
        nextReader.run(env)
      }
    }
  }

  export function local<r, r2, a>(reader: Reader<r, a>, transformEnv: (env: r2) => r): Reader<r2, a> {
    { run: (env: r2) => reader.run(transformEnv(env)) }
  }
}`,
    jsSource: `const $wrapReader = (fn) => ({ $tag: "Reader", run: typeof fn === "function" ? fn : (_r) => fn });
const $Reader = {
  pure: (v) => $wrapReader((_r) => v),
  of: (v) => $wrapReader((_r) => v),
  ask: () => $wrapReader((r) => r),
  asks: (fn) => $wrapReader((r) => typeof fn === "function" ? fn(r) : r),
  run: (reader, env) => (reader && typeof reader.run === "function" ? reader.run(env) : reader),
  map: (reader, fn) => $wrapReader((r) => { const v = reader && typeof reader.run === "function" ? reader.run(r) : reader; return typeof fn === "function" ? fn(v) : v; }),
  flatMap: (reader, fn) => $wrapReader((r) => { const v = reader && typeof reader.run === "function" ? reader.run(r) : reader; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run(r) : next; }),
  local: (reader, transformEnv) => $wrapReader((r) => { const tr = typeof transformEnv === "function" ? transformEnv(r) : r; return reader && typeof reader.run === "function" ? reader.run(tr) : reader; })
};`,
    functions: [
      {
        name: "ask",
        signature: "ask<r>(): Reader<r, r>",
        description: "Retrieves the current ambient environment.",
        typeLangImpl: "function ask<r>(): Reader<r, r> { { run: (env: r) => env } }",
        jsImpl: "() => $wrapReader((r) => r)",
        example: "Reader.ask()"
      },
      {
        name: "asks",
        signature: "asks<r, a>(fn: (env: r) => a): Reader<r, a>",
        description: "Projects a property or function out of the environment.",
        typeLangImpl: "function asks<r, a>(fn: (env: r) => a): Reader<r, a> { { run: (env: r) => fn(env) } }",
        jsImpl: "(fn) => $wrapReader((r) => fn(r))",
        example: "Reader.asks((c: Config) => c.port)"
      },
      {
        name: "run",
        signature: "run<r, a>(reader: Reader<r, a>, environment: r): a",
        description: "Executes the Reader computation by supplying the environment.",
        typeLangImpl: "function run<r, a>(reader: Reader<r, a>, environment: r): a { reader.run(environment) }",
        jsImpl: "(reader, env) => reader.run(env)",
        example: 'Reader.run(myReader, { token: "abc" })'
      }
    ]
  },
  {
    id: "Writer",
    name: "Writer",
    category: "Monad",
    tagline: "Pure functional accumulator and audit trail logging",
    description: "The Writer monad allows accumulating an auxiliary log or monoid alongside a computed result, without mutating any global state.",
    typeDefinition: `type Writer<w, a> = {
  val: a,
  log: [w],
  run: () => (a, [w])
}`,
    lawsDoc: {
      leftIdentity: "flatMap(pure(x), f)  ===  f(x)",
      rightIdentity: "flatMap(m, pure)  ===  m",
      associativity: "flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"
    },
    doNotationSnippet: `import Writer.{ tell, run }

let loggedCompute = do(Writer) {
  _ <- Writer.tell("Parsing parameters");
  let val = 42;
  _ <- Writer.tell("Calculated master answer");
  pure val;
}

let result = Writer.run(loggedCompute)
let val = result[0]
let logs = result[1]`,
    typeLangSource: `// Writer Module Implementation in TypeLang
module Writer {
  export function pure<w, a>(val: a): Writer<w, a> {
    { val: val, log: [] }
  }

  export function tell<w>(entry: w): Writer<w, void> {
    { val: (), log: [entry] }
  }

  export function run<w, a>(writer: Writer<w, a>): (a, [w]) {
    (writer.val, writer.log)
  }

  export function value<w, a>(writer: Writer<w, a>): a {
    writer.val
  }

  export function log<w, a>(writer: Writer<w, a>): [w] {
    writer.log
  }

  export function map<w, a, b>(writer: Writer<w, a>, fn: (x: a) => b): Writer<w, b> {
    { val: fn(writer.val), log: writer.log }
  }

  export function flatMap<w, a, b>(writer: Writer<w, a>, fn: (x: a) => Writer<w, b>): Writer<w, b> {
    let next = fn(writer.val);
    { val: next.val, log: Array.concat(writer.log, next.log) }
  }
}`,
    jsSource: `const $wrapWriter = (val, log = []) => ({ $tag: "Writer", val, log: Array.isArray(log) ? log : [log], run: () => [val, Array.isArray(log) ? log : [log]] });
const $Writer = {
  pure: (v) => $wrapWriter(v, []),
  of: (v) => $wrapWriter(v, []),
  tell: (entry) => $wrapWriter(null, [entry]),
  run: (w) => (w && typeof w.run === "function" ? w.run() : [w?.val, w?.log || []]),
  value: (w) => (w ? w.val : null),
  log: (w) => (w && Array.isArray(w.log) ? w.log : []),
  map: (w, fn) => $wrapWriter(typeof fn === "function" ? fn(w?.val) : w?.val, w?.log || []),
  flatMap: (w, fn) => { const next = typeof fn === "function" ? fn(w?.val) : null; return $wrapWriter(next?.val, [...(w?.log || []), ...(next?.log || [])]); },
  listen: (w) => $wrapWriter([w?.val, w?.log || []], w?.log || [])
};`,
    functions: [
      {
        name: "tell",
        signature: "tell<w>(entry: w): Writer<w, void>",
        description: "Appends a single log entry into the Writer accumulator.",
        typeLangImpl: "function tell<w>(entry: w): Writer<w, void> { { val: (), log: [entry] } }",
        jsImpl: "(entry) => $wrapWriter(null, [entry])",
        example: 'Writer.tell("Step 1 done")'
      },
      {
        name: "run",
        signature: "run<w, a>(writer: Writer<w, a>): (a, [w])",
        description: "Executes the Writer computation and returns a tuple of (value, logs).",
        typeLangImpl: "function run<w, a>(writer: Writer<w, a>): (a, [w]) { (writer.val, writer.log) }",
        jsImpl: "(w) => [w.val, w.log]",
        example: "let res = Writer.run(w)"
      }
    ]
  },
  {
    id: "State",
    name: "State",
    category: "Monad",
    tagline: "Pure stateful computation without mutable variables",
    description: "The State monad models stateful computations as pure functions of type (s: State) => (result: a, nextState: s).",
    typeDefinition: `type State<s, a> = {
  run: (initialState: s) => (a, s)
}`,
    lawsDoc: {
      leftIdentity: "flatMap(pure(x), f)  ===  f(x)",
      rightIdentity: "flatMap(m, pure)  ===  m",
      associativity: "flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"
    },
    doNotationSnippet: `import State.{ get, set, modify, run }

let counterPipeline = do(State) {
  count <- State.get();
  _ <- State.set(count + 1);
  _ <- State.modify((s: number) => s * 10);
  pure count;
}

let result = State.run(counterPipeline, 5) // (5, 60)`,
    typeLangSource: `// State Module Implementation in TypeLang
module State {
  export function pure<s, a>(val: a): State<s, a> {
    { run: (s: s) => (val, s) }
  }

  export function get<s>(): State<s, s> {
    { run: (s: s) => (s, s) }
  }

  export function set<s>(newState: s): State<s, void> {
    { run: (_s: s) => ((), newState) }
  }

  export function modify<s>(fn: (s: s) => s): State<s, void> {
    { run: (s: s) => ((), fn(s)) }
  }

  export function run<s, a>(st: State<s, a>, initialState: s): (a, s) {
    st.run(initialState)
  }

  export function evalState<s, a>(st: State<s, a>, initialState: s): a {
    let r = st.run(initialState);
    r[0]
  }

  export function execState<s, a>(st: State<s, a>, initialState: s): s {
    let r = st.run(initialState);
    r[1]
  }

  export function map<s, a, b>(st: State<s, a>, fn: (x: a) => b): State<s, b> {
    { run: (s: s) => {
        let res = st.run(s);
        (fn(res[0]), res[1])
      }
    }
  }

  export function flatMap<s, a, b>(st: State<s, a>, fn: (x: a) => State<s, b>): State<s, b> {
    { run: (s: s) => {
        let res = st.run(s);
        let nextStateMonad = fn(res[0]);
        nextStateMonad.run(res[1])
      }
    }
  }
}`,
    jsSource: `const $wrapState = (fn) => ({ $tag: "State", run: typeof fn === "function" ? fn : (s) => [null, s] });
const $State = {
  pure: (v) => $wrapState((s) => [v, s]),
  of: (v) => $wrapState((s) => [v, s]),
  get: () => $wrapState((s) => [s, s]),
  set: (ns) => $wrapState((_s) => [null, ns]),
  modify: (fn) => $wrapState((s) => [null, typeof fn === "function" ? fn(s) : s]),
  run: (st, s) => (st && typeof st.run === "function" ? st.run(s) : [null, s]),
  evalState: (st, s) => { const r = st && typeof st.run === "function" ? st.run(s) : [null, s]; return Array.isArray(r) ? r[0] : r; },
  execState: (st, s) => { const r = st && typeof st.run === "function" ? st.run(s) : [null, s]; return Array.isArray(r) ? r[1] : r; },
  map: (st, fn) => $wrapState((s) => { const [v, ns] = st && typeof st.run === "function" ? st.run(s) : [null, s]; return [typeof fn === "function" ? fn(v) : v, ns]; }),
  flatMap: (st, fn) => $wrapState((s) => { const [v, ns] = st && typeof st.run === "function" ? st.run(s) : [null, s]; const next = typeof fn === "function" ? fn(v) : null; return next && typeof next.run === "function" ? next.run(ns) : [null, ns]; })
};`,
    functions: [
      {
        name: "get",
        signature: "get<s>(): State<s, s>",
        description: "Fetches the current state value.",
        typeLangImpl: "function get<s>(): State<s, s> { { run: (s: s) => (s, s) } }",
        jsImpl: "() => $wrapState((s) => [s, s])",
        example: "State.get()"
      },
      {
        name: "set",
        signature: "set<s>(newState: s): State<s, void>",
        description: "Replaces the existing state with newState.",
        typeLangImpl: "function set<s>(newState: s): State<s, void> { { run: (_s: s) => ((), newState) } }",
        jsImpl: "(ns) => $wrapState((_s) => [null, ns])",
        example: "State.set(100)"
      },
      {
        name: "modify",
        signature: "modify<s>(fn: (s: s) => s): State<s, void>",
        description: "Modifies the current state with a transition function fn.",
        typeLangImpl: "function modify<s>(fn: (s: s) => s): State<s, void> { { run: (s: s) => ((), fn(s)) } }",
        jsImpl: "(fn) => $wrapState((s) => [null, fn(s)])",
        example: "State.modify((s: number) => s + 1)"
      }
    ]
  },
  {
    id: "Task",
    name: "Task",
    category: "Monad",
    tagline: "Lazy and composable asynchronous computations",
    description: "The Task monad encapsulates lazy computations that produce a value when executed via Task.run().",
    typeDefinition: `type Task<a> = {
  run: () => a
}`,
    lawsDoc: {
      leftIdentity: "flatMap(pure(x), f)  ===  f(x)",
      rightIdentity: "flatMap(m, pure)  ===  m",
      associativity: "flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"
    },
    doNotationSnippet: `import Task.{ succeed, delay, run }

let asyncPipeline = do(Task) {
  raw <- Task.succeed(100);
  computed <- Task.delay(() => raw * 2);
  pure computed + 50;
}

let result = Task.run(asyncPipeline) // 250`,
    typeLangSource: `// Task Module Implementation in TypeLang
module Task {
  export function pure<a>(val: a): Task<a> {
    { run: () => val }
  }

  export function succeed<a>(val: a): Task<a> {
    { run: () => val }
  }

  export function delay<a>(fn: () => a): Task<a> {
    { run: fn }
  }

  export function run<a>(task: Task<a>): a {
    task.run()
  }

  export function map<a, b>(task: Task<a>, fn: (x: a) => b): Task<b> {
    { run: () => fn(task.run()) }
  }

  export function flatMap<a, b>(task: Task<a>, fn: (x: a) => Task<b>): Task<b> {
    { run: () => {
        let val = task.run();
        let nextTask = fn(val);
        nextTask.run()
      }
    }
  }
}`,
    jsSource: `const $wrapTask = (fn) => ({ $tag: "Task", run: typeof fn === "function" ? fn : () => fn });
const $Task = {
  pure: (v) => $wrapTask(() => v),
  of: (v) => $wrapTask(() => v),
  succeed: (v) => $wrapTask(() => v),
  delay: (fn) => $wrapTask(typeof fn === "function" ? fn : () => fn),
  run: (t) => (t && typeof t.run === "function" ? t.run() : t),
  map: (t, fn) => $wrapTask(() => { const v = t && typeof t.run === "function" ? t.run() : t; return typeof fn === "function" ? fn(v) : v; }),
  flatMap: (t, fn) => $wrapTask(() => { const v = t && typeof t.run === "function" ? t.run() : t; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run() : next; })
};`,
    functions: [
      {
        name: "succeed",
        signature: "succeed<a>(val: a): Task<a>",
        description: "Creates a Task that immediately resolves to val upon execution.",
        typeLangImpl: "function succeed<a>(val: a): Task<a> { { run: () => val } }",
        jsImpl: "(val) => $wrapTask(() => val)",
        example: 'Task.succeed("data")'
      },
      {
        name: "run",
        signature: "run<a>(task: Task<a>): a",
        description: "Executes the task computation and returns the computed result.",
        typeLangImpl: "function run<a>(task: Task<a>): a { task.run() }",
        jsImpl: "(task) => task.run()",
        example: "Task.run(t)"
      }
    ]
  },
  {
    id: "IO",
    name: "IO",
    category: "Monad",
    tagline: "Deferred input/output and referentially transparent side-effects",
    description: "The IO monad represents deferred I/O operations, ensuring pure functional code remains free of unmanaged side effects until IO.run() is invoked.",
    typeDefinition: `type IO<a> = {
  run: () => a
}`,
    lawsDoc: {
      leftIdentity: "flatMap(pure(x), f)  ===  f(x)",
      rightIdentity: "flatMap(m, pure)  ===  m",
      associativity: "flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"
    },
    doNotationSnippet: `import IO.{ println, delay, run }

let program = do(IO) {
  _ <- IO.println("Starting application...");
  time <- IO.delay(() => Date.now());
  _ <- IO.println(concat("Current timestamp: ", to_string(time)));
  pure 0;
}

IO.run(program)`,
    typeLangSource: `// IO Module Implementation in TypeLang
module IO {
  export function pure<a>(val: a): IO<a> {
    { run: () => val }
  }

  export function delay<a>(fn: () => a): IO<a> {
    { run: fn }
  }

  export function run<a>(io: IO<a>): a {
    io.run()
  }

  export function println(msg: string): IO<void> {
    { run: () => println(msg) }
  }

  export function map<a, b>(io: IO<a>, fn: (x: a) => b): IO<b> {
    { run: () => fn(io.run()) }
  }

  export function flatMap<a, b>(io: IO<a>, fn: (x: a) => IO<b>): IO<b> {
    { run: () => {
        let val = io.run();
        let nextIO = fn(val);
        nextIO.run()
      }
    }
  }
}`,
    jsSource: `const $wrapIO = (comp) => ({ $tag: "IO", run: typeof comp === "function" ? comp : () => comp });
const $IO = {
  pure: (v) => $wrapIO(() => v),
  of: (v) => $wrapIO(() => v),
  delay: (fn) => $wrapIO(typeof fn === "function" ? fn : () => fn),
  map: (io, fn) => $wrapIO(() => { const v = io && typeof io.run === "function" ? io.run() : io; return typeof fn === "function" ? fn(v) : v; }),
  flatMap: (io, fn) => $wrapIO(() => { const v = io && typeof io.run === "function" ? io.run() : io; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run() : next; }),
  run: (io) => (io && typeof io.run === "function" ? io.run() : io),
  println: (msg) => $wrapIO(() => console.log(String(msg)))
};`,
    functions: [
      {
        name: "println",
        signature: "println(msg: string): IO<void>",
        description: "Creates a deferred IO operation to print a string message to console.",
        typeLangImpl: "function println(msg: string): IO<void> { { run: () => println(msg) } }",
        jsImpl: "(msg) => $wrapIO(() => console.log(String(msg)))",
        example: 'IO.println("Hello World")'
      },
      {
        name: "run",
        signature: "run<a>(io: IO<a>): a",
        description: "Executes the IO action, performing all deferred side effects.",
        typeLangImpl: "function run<a>(io: IO<a>): a { io.run() }",
        jsImpl: "(io) => io.run()",
        example: "IO.run(action)"
      }
    ]
  },
  {
    id: "Array",
    name: "Array",
    category: "Core",
    tagline: "Standard array and list manipulation utilities",
    description: "High-performance collection methods for arrays including immutable transformation, mapping, filtering, reducing, slicing, and concatenating.",
    typeDefinition: `type Array<a> = [a]`,
    typeLangSource: `module Array {
  export extern function len<a>(arr: [a]): number
  export extern function map<a, b>(arr: [a], fn: (elem: a) => b): [b]
  export extern function filter<a>(arr: [a], pred: (elem: a) => boolean): [a]
  export extern function reduce<a, acc>(arr: [a], initial: acc, fn: (accumulator: acc, elem: a) => acc): acc
  export extern function push<a>(arr: [a], elem: a): [a]
  export extern function slice<a>(arr: [a], start: number, end: number): [a]
  export extern function concat<a>(a: [a], b: [a]): [a]
  export extern function join(arr: [string], separator: string): string
}`,
    jsSource: `const $Array = {
  len: (arr) => Array.isArray(arr) ? arr.length : 0,
  map: (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.map(fn) : [],
  filter: (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.filter(fn) : [],
  reduce: (arr, init, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.reduce(fn, init) : init,
  push: (arr, elem) => Array.isArray(arr) ? [...arr, elem] : [elem],
  slice: (arr, start, end) => Array.isArray(arr) ? arr.slice(start, end) : [],
  concat: (a, b) => Array.isArray(a) && Array.isArray(b) ? a.concat(b) : [],
  join: (arr, sep) => Array.isArray(arr) ? arr.join(sep) : ""
};`,
    functions: [
      {
        name: "len",
        signature: "len<a>(arr: [a]): number",
        description: "Returns the number of elements in an array.",
        typeLangImpl: "extern function len<a>(arr: [a]): number",
        jsImpl: "(arr) => arr.length",
        example: "Array.len([1, 2, 3]) // 3"
      },
      {
        name: "map",
        signature: "map<a, b>(arr: [a], fn: (x: a) => b): [b]",
        description: "Creates a new array by applying fn to every element.",
        typeLangImpl: "extern function map<a, b>(arr: [a], fn: (x: a) => b): [b]",
        jsImpl: "(arr, fn) => arr.map(fn)",
        example: "Array.map([1, 2, 3], (x: number) => x * 2)"
      },
      {
        name: "filter",
        signature: "filter<a>(arr: [a], pred: (x: a) => boolean): [a]",
        description: "Filters array elements matching predicate pred.",
        typeLangImpl: "extern function filter<a>(arr: [a], pred: (x: a) => boolean): [a]",
        jsImpl: "(arr, pred) => arr.filter(pred)",
        example: "Array.filter([1, 2, 3, 4], (x: number) => x % 2 == 0)"
      },
      {
        name: "reduce",
        signature: "reduce<a, acc>(arr: [a], init: acc, fn: (acc: acc, x: a) => acc): acc",
        description: "Reduces array to a single value using accumulator fn.",
        typeLangImpl: "extern function reduce<a, acc>(arr: [a], init: acc, fn: (acc: acc, x: a) => acc): acc",
        jsImpl: "(arr, init, fn) => arr.reduce(fn, init)",
        example: "Array.reduce([1, 2, 3], 0, (acc: number, x: number) => acc + x)"
      }
    ]
  },
  {
    id: "String",
    name: "String",
    category: "Core",
    tagline: "Text manipulation, parsing, and substring operations",
    description: "Standard string utilities for computing string length, extracting substrings, splitting by delimiters, and parsing numbers.",
    typeDefinition: `type String = string`,
    typeLangSource: `module String {
  export extern function len(s: string): number
  export extern function slice(s: string, start: number, end: number): string
  export extern function split(s: string, delimiter: string): [string]
  export extern function contains(s: string, substr: string): boolean
  export extern function parseInt(s: string): number
  export extern function parseFloat(s: string): number
}`,
    jsSource: `const $String = {
  len: (s) => String(s).length,
  slice: (s, start, end) => String(s).slice(start, end),
  split: (s, delim) => String(s).split(delim),
  contains: (s, sub) => String(s).includes(sub),
  parseInt: (s) => Number.parseInt(String(s), 10),
  parseFloat: (s) => Number.parseFloat(String(s))
};`,
    functions: [
      {
        name: "len",
        signature: "len(s: string): number",
        description: "Returns the character length of a string.",
        typeLangImpl: "extern function len(s: string): number",
        jsImpl: "(s) => String(s).length",
        example: 'String.len("hello") // 5'
      },
      {
        name: "split",
        signature: "split(s: string, delimiter: string): [string]",
        description: "Splits a string into a list of substrings separated by delimiter.",
        typeLangImpl: "extern function split(s: string, delimiter: string): [string]",
        jsImpl: "(s, delim) => String(s).split(delim)",
        example: 'String.split("a,b,c", ",") // ["a", "b", "c"]'
      },
      {
        name: "parseFloat",
        signature: "parseFloat(s: string): number",
        description: "Parses a string into a floating-point number.",
        typeLangImpl: "extern function parseFloat(s: string): number",
        jsImpl: "(s) => Number.parseFloat(String(s))",
        example: 'String.parseFloat("3.14159") // 3.14159'
      }
    ]
  },
  {
    id: "Math",
    name: "Math",
    category: "Core",
    tagline: "Standard mathematical and trigonometric functions",
    description: "Full suite of math operations: power, root, trigonometric functions, rounding, bitwise operations, and constants like PI.",
    typeDefinition: `module Math`,
    typeLangSource: `module Math {
  export extern function sqrt(x: number): number
  export extern function abs(x: number): number
  export extern function floor(x: number): number
  export extern function ceil(x: number): number
  export extern function round(x: number): number
  export extern function min(a: number, b: number): number
  export extern function max(a: number, b: number): number
  export extern function pow(base: number, exp: number): number
  export extern function random(): number
  export extern function cos(rad: number): number
  export extern function sin(rad: number): number
  export extern function atan2(y: number, x: number): number
  export extern function log(x: number): number
  export extern function bitwise_and(a: number, b: number): number
  export extern function bitwise_or(a: number, b: number): number
  export extern function bitwise_xor(a: number, b: number): number
  export extern function bitwise_not(x: number): number
  export extern function bitwise_shl(a: number, b: number): number
  export extern function bitwise_shr(a: number, b: number): number
  export let PI: number = 3.141592653589793
}`,
    jsSource: `const $Math = {
  sqrt: Math.sqrt,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
  random: Math.random,
  cos: Math.cos,
  sin: Math.sin,
  atan2: Math.atan2,
  log: Math.log,
  bitwise_and: (a, b) => Number(a) & Number(b),
  bitwise_or: (a, b) => Number(a) | Number(b),
  bitwise_xor: (a, b) => Number(a) ^ Number(b),
  bitwise_not: (x) => ~Number(x),
  bitwise_shl: (a, b) => Number(a) << Number(b),
  bitwise_shr: (a, b) => Number(a) >> Number(b),
  PI: Math.PI
};`,
    functions: [
      {
        name: "sqrt",
        signature: "sqrt(x: number): number",
        description: "Returns the square root of a number.",
        typeLangImpl: "extern function sqrt(x: number): number",
        jsImpl: "Math.sqrt",
        example: "Math.sqrt(16) // 4"
      },
      {
        name: "pow",
        signature: "pow(base: number, exp: number): number",
        description: "Returns base raised to the power of exp.",
        typeLangImpl: "extern function pow(base: number, exp: number): number",
        jsImpl: "Math.pow",
        example: "Math.pow(2, 8) // 256"
      },
      {
        name: "sin",
        signature: "sin(rad: number): number",
        description: "Returns the sine of an angle in radians.",
        typeLangImpl: "extern function sin(rad: number): number",
        jsImpl: "Math.sin",
        example: "Math.sin(Math.PI / 2) // 1"
      }
    ]
  },
  {
    id: "Setoid",
    name: "Setoid",
    category: "Algebraic",
    tagline: "Equivalence relation abstraction for deep structural equality comparison",
    description: "The Setoid abstraction represents data types with an equivalence relation satisfying reflexivity, symmetry, and transitivity.",
    typeDefinition: `type Setoid<a> = { equals: (x: a, y: a) => boolean }`,
    lawsDoc: {
      leftIdentity: "equals(a, a) === true (Reflexivity)",
      rightIdentity: "equals(a, b) === equals(b, a) (Symmetry)",
      associativity: "if equals(a, b) && equals(b, c) then equals(a, c) (Transitivity)"
    },
    typeLangSource: `module Setoid {
  export function equals<a, b>(a: a, b: b): boolean
  export function notEquals<a, b>(a: a, b: b): boolean
  export function fromEquals<a>(eqFn: (x: a, y: a) => boolean): Setoid<a>
  export function contramap<a, b>(s: Setoid<b>, fn: (x: a) => b): Setoid<a>
}`,
    jsSource: `const $Setoid = {
  equals: (a, b) => $deepEquals(a, b),
  notEquals: (a, b) => !$deepEquals(a, b),
  fromEquals: (eqFn) => ({ equals: eqFn }),
  contramap: (setoid, fn) => ({ equals: (x, y) => setoid.equals(fn(x), fn(y)) })
};`,
    functions: [
      {
        name: "equals",
        signature: "equals<a, b>(a: a, b: b): boolean",
        description: "Deep structural equality check across primitives, records, tuples, ADTs, and arrays.",
        typeLangImpl: "extern function equals<a, b>(a: a, b: b): boolean",
        jsImpl: "(a, b) => $deepEquals(a, b)",
        example: "Setoid.equals([1, 2, 3], [1, 2, 3]) // true"
      },
      {
        name: "notEquals",
        signature: "notEquals<a, b>(a: a, b: b): boolean",
        description: "Negated equality comparison check.",
        typeLangImpl: "extern function notEquals<a, b>(a: a, b: b): boolean",
        jsImpl: "(a, b) => !$deepEquals(a, b)",
        example: 'Setoid.notEquals("hello", "world") // true'
      },
      {
        name: "contramap",
        signature: "contramap<a, b>(setoid: Setoid<b>, fn: (x: a) => b): Setoid<a>",
        description: "Derives a Setoid<a> from a Setoid<b> and a mapping function f: a -> b.",
        typeLangImpl: "function contramap<a, b>(s: Setoid<b>, fn: (x: a) => b): Setoid<a>",
        jsImpl: "(setoid, fn) => ({ equals: (x, y) => setoid.equals(fn(x), fn(y)) })",
        example: "let byId = Setoid.contramap(Setoid, (user) => user.id)"
      }
    ]
  },
  {
    id: "Ord",
    name: "Ord",
    category: "Algebraic",
    tagline: "Total ordering and comparison abstraction for sorting, clamping, and bounds",
    description: "The Ord abstraction extends Setoid with total ordering relationships (Less, Equal, Greater).",
    typeDefinition: `type Ordering = Less | Equal | Greater
type Ord<a> = { compare: (x: a, y: a) => Ordering }`,
    typeLangSource: `module Ord {
  export function compare<a>(a: a, b: a): Ordering
  export function min<a>(a: a, b: a): a
  export function max<a>(a: a, b: a): a
  export function clamp<a>(val: a, minVal: a, maxVal: a): a
  export function between<a>(val: a, minVal: a, maxVal: a): boolean
  export function isLess<a>(a: a, b: a): boolean
  export function isGreater<a>(a: a, b: a): boolean
  export function isEqual<a>(a: a, b: a): boolean
  export function contramap<a, b>(ordB: Ord<b>, fn: (x: a) => b): Ord<a>
  export function reverse<a>(ord: Ord<a>): Ord<a>
}`,
    jsSource: `const $Ord = {
  compare: (a, b) => $compareVals(a, b),
  min: (a, b) => ($compareVals(a, b) === $OrderingLess ? a : b),
  max: (a, b) => ($compareVals(a, b) === $OrderingGreater ? a : b),
  clamp: (val, minVal, maxVal) => ($compareVals(val, minVal) === $OrderingLess ? minVal : ($compareVals(val, maxVal) === $OrderingGreater ? maxVal : val)),
  between: (val, minVal, maxVal) => ($compareVals(val, minVal) !== $OrderingLess && $compareVals(val, maxVal) !== $OrderingGreater),
  reverse: (ord) => ({ compare: (x, y) => ord.compare(y, x) })
};`,
    functions: [
      {
        name: "compare",
        signature: "compare<a>(a: a, b: a): Ordering",
        description: "Compares two values returning Less, Equal, or Greater.",
        typeLangImpl: "extern function compare<a>(a: a, b: a): Ordering",
        jsImpl: "(a, b) => $compareVals(a, b)",
        example: "Ord.compare(10, 20) // Less"
      },
      {
        name: "clamp",
        signature: "clamp<a>(val: a, minVal: a, maxVal: a): a",
        description: "Restricts a value within a lower and upper bound.",
        typeLangImpl: "function clamp<a>(val: a, minVal: a, maxVal: a): a",
        jsImpl: "(val, minVal, maxVal) => ...",
        example: "Ord.clamp(150, 0, 100) // 100"
      },
      {
        name: "between",
        signature: "between<a>(val: a, minVal: a, maxVal: a): boolean",
        description: "Checks whether a value is inclusively within bounds.",
        typeLangImpl: "function between<a>(val: a, minVal: a, maxVal: a): boolean",
        jsImpl: "(val, minVal, maxVal) => ...",
        example: "Ord.between(5, 1, 10) // true"
      }
    ]
  },
  {
    id: "Semigroup",
    name: "Semigroup",
    category: "Algebraic",
    tagline: "Associative binary combination operation abstraction",
    description: "A Semigroup is an algebraic structure with an associative binary operation `combine(a, b)`. Also accessible via alias `SemiGroup`.",
    typeDefinition: `type Semigroup<a> = { combine: (x: a, y: a) => a }`,
    lawsDoc: {
      leftIdentity: "",
      rightIdentity: "",
      associativity: "combine(combine(a, b), c) === combine(a, combine(b, c))"
    },
    typeLangSource: `module Semigroup {
  export function combine<a>(a: a, b: a): a
  export function concatAll<a>(list: Array<a>, fallback: a): a
  export function first<a>(): Semigroup<a>
  export function last<a>(): Semigroup<a>
  export function struct<a>(semigroups: a): Semigroup<a>
  export function dual<a>(s: Semigroup<a>): Semigroup<a>
}`,
    jsSource: `const $Semigroup = {
  combine: (a, b) => $combineSemigroup(a, b),
  concatAll: (list, fallback) => (list.length === 0 ? fallback : list.reduce($combineSemigroup)),
  dual: (s) => ({ combine: (a, b) => s.combine(b, a) })
};`,
    functions: [
      {
        name: "combine",
        signature: "combine<a>(a: a, b: a): a",
        description: "Combines two elements using structural or primitive semigroup addition/concatenation.",
        typeLangImpl: "extern function combine<a>(a: a, b: a): a",
        jsImpl: "(a, b) => $combineSemigroup(a, b)",
        example: 'Semigroup.combine("Hello ", "World") // "Hello World"'
      },
      {
        name: "concatAll",
        signature: "concatAll<a>(list: Array<a>, fallback: a): a",
        description: "Reduces an array of elements using the semigroup operation.",
        typeLangImpl: "function concatAll<a>(list: Array<a>, fallback: a): a",
        jsImpl: "(list, fallback) => list.reduce($combineSemigroup, fallback)",
        example: "Semigroup.concatAll([1, 2, 3, 4], 0) // 10"
      }
    ]
  },
  {
    id: "Monoid",
    name: "Monoid",
    category: "Algebraic",
    tagline: "Semigroup with an identity element (empty value)",
    description: "A Monoid is an associative semigroup equipped with a identity element `empty` such that `combine(empty, x) === x === combine(x, empty)`.",
    typeDefinition: `type Monoid<a> = { empty: () => a, combine: (x: a, y: a) => a }`,
    lawsDoc: {
      leftIdentity: "combine(empty(), x) === x",
      rightIdentity: "combine(x, empty()) === x",
      associativity: "combine(combine(a, b), c) === combine(a, combine(b, c))"
    },
    typeLangSource: `module Monoid {
  export function empty<a>(typeOrName: string): a
  export function combine<a>(a: a, b: a): a
  export function concatAll<a>(list: Array<a>, identity: a): a
  export const Sum: Monoid<number>
  export const Product: Monoid<number>
  export const String: Monoid<string>
  export const Array: Monoid<any>
  export const All: Monoid<boolean>
  export const Any: Monoid<boolean>
  export function struct<a>(monoids: a): Monoid<a>
}`,
    jsSource: `const $Monoid = {
  empty: (typeOrName) => $monoidEmptyMap[typeOrName],
  combine: $combineSemigroup,
  concatAll: (list, identity) => list.reduce($combineSemigroup, identity),
  Sum: { empty: () => 0, combine: (a, b) => a + b },
  Product: { empty: () => 1, combine: (a, b) => a * b },
  All: { empty: () => true, combine: (a, b) => a && b }
};`,
    functions: [
      {
        name: "concatAll",
        signature: "concatAll<a>(list: Array<a>, identity: a): a",
        description: "Aggregates a list of monoidal values, returning identity if list is empty.",
        typeLangImpl: "function concatAll<a>(list: Array<a>, identity: a): a",
        jsImpl: "(list, identity) => list.reduce($combineSemigroup, identity)",
        example: 'Monoid.concatAll(["a", "b", "c"], "") // "abc"'
      },
      {
        name: "struct",
        signature: "struct<a>(monoids: a): Monoid<a>",
        description: "Combines a record of monoids into a monoid for the record shape.",
        typeLangImpl: "function struct<a>(monoids: a): Monoid<a>",
        jsImpl: "(monoids) => ({ empty: ..., combine: ... })",
        example: "let StatsMonoid = Monoid.struct({ count: Monoid.Sum, label: Monoid.String })"
      }
    ]
  },
  {
    id: "Group",
    name: "Group",
    category: "Algebraic",
    tagline: "Monoid equipped with an inverse operation (invert / subtract)",
    description: "A Group extends a Monoid with an inverse operation `invert(x)` such that `combine(x, invert(x)) === empty()`.",
    typeDefinition: `type Group<a> = { empty: () => a, combine: (x: a, y: a) => a, invert: (x: a) => a }`,
    lawsDoc: {
      leftIdentity: "combine(empty(), x) === x",
      rightIdentity: "combine(x, empty()) === x",
      associativity: "combine(combine(a, b), c) === combine(a, combine(b, c))",
      inverse: "combine(x, invert(x)) === empty()"
    },
    typeLangSource: `module Group {
  export function invert<a>(a: a): a
  export function subtract<a>(a: a, b: a): a
  export const SumNumber: Group<number>
  export const ProductNonZero: Group<number>
}`,
    jsSource: `const $Group = {
  invert: (a) => (typeof a === "number" ? -a : a.invert()),
  subtract: (a, b) => a - b,
  SumNumber: { empty: () => 0, combine: (a, b) => a + b, invert: (a) => -a }
};`,
    functions: [
      {
        name: "invert",
        signature: "invert<a>(a: a): a",
        description: "Returns the inverse element of a group member.",
        typeLangImpl: "function invert<a>(a: a): a",
        jsImpl: '(a) => (typeof a === "number" ? -a : a.invert())',
        example: "Group.invert(42) // -42"
      },
      {
        name: "subtract",
        signature: "subtract<a>(a: a, b: a): a",
        description: "Subtracts b from a by combining a with the inverse of b.",
        typeLangImpl: "function subtract<a>(a: a, b: a): a",
        jsImpl: "(a, b) => a - b",
        example: "Group.subtract(100, 25) // 75"
      }
    ]
  },
  {
    id: "Functor",
    name: "Functor",
    category: "Algebraic",
    tagline: "Mapping interface for wrapped / parameterized container structures",
    description: "A Functor allows mapping functions over data wrapped in containers (Option, Result, Either, Array, Task, State, etc.).",
    typeDefinition: `type Functor<f> = { map: <a, b>(fa: f<a>, fn: (x: a) => b) => f<b> }`,
    lawsDoc: {
      leftIdentity: "map(fa, (x) => x) === fa (Identity)",
      associativity: "map(map(fa, f), g) === map(fa, (x) => g(f(x))) (Composition)"
    },
    typeLangSource: `module Functor {
  export function map<f, a, b>(fa: f<a>, fn: (x: a) => b): f<b>
  export function lift<f, a, b>(fn: (x: a) => b): (fa: f<a>) => f<b>
  export function as<f, a, b>(fa: f<a>, val: b): f<b>
  export function voidRight<f, a>(fa: f<a>): f<null>
  export function flap<f, a, b>(fab: f<(x: a) => b>, a: a): f<b>
}`,
    jsSource: `const $Functor = {
  map: $mapFunctor,
  lift: (fn) => (fa) => $mapFunctor(fa, fn),
  as: (fa, val) => $mapFunctor(fa, () => val)
};`,
    functions: [
      {
        name: "map",
        signature: "map<f, a, b>(fa: f<a>, fn: (x: a) => b): f<b>",
        description: "Applies a function to the inner value(s) of any functor object.",
        typeLangImpl: "extern function map<f, a, b>(fa: f<a>, fn: (x: a) => b): f<b>",
        jsImpl: "(fa, fn) => $mapFunctor(fa, fn)",
        example: "Functor.map(Some(5), (x) => x * 2) // Some(10)"
      },
      {
        name: "lift",
        signature: "lift<f, a, b>(fn: (x: a) => b): (fa: f<a>) => f<b>",
        description: "Lifts an un-wrapped function a -> b to a functor function f<a> -> f<b>.",
        typeLangImpl: "function lift<f, a, b>(fn: (x: a) => b): (fa: f<a>) => f<b>",
        jsImpl: "(fn) => (fa) => $mapFunctor(fa, fn)",
        example: "let doubleOpt = Functor.lift((x: number) => x * 2)"
      }
    ]
  },
  {
    id: "Contravariant",
    name: "Contravariant",
    category: "Algebraic",
    tagline: "Contravariant functor mapping inputs for consumer/predicate structures",
    description: "A Contravariant functor maps over function argument positions (inputs) rather than outputs (e.g. Predicate, Setoid, Ord, Encoder).",
    typeDefinition: `type Contravariant<f> = { contramap: <a, b>(fa: f<b>, fn: (x: a) => b) => f<a> }`,
    typeLangSource: `module Contravariant {
  export function contramap<f, a, b>(fa: f<b>, fn: (x: a) => b): f<a>
  export function cmap<f, a, b>(fa: f<b>, fn: (x: a) => b): f<a>
  export function predicate<a>(pred: (x: a) => boolean): any
}`,
    jsSource: `const $Contravariant = {
  contramap: (fa, fn) => (x) => fa(fn(x)),
  predicate: (pred) => ({ run: pred, cmap: (fn) => (x) => pred(fn(x)) })
};`,
    functions: [
      {
        name: "contramap",
        signature: "contramap<f, a, b>(fa: f<b>, fn: (x: a) => b): f<a>",
        description: "Pre-composes an input transformation function fn: a -> b onto a consumer/predicate f<b>.",
        typeLangImpl: "function contramap<f, a, b>(fa: f<b>, fn: (x: a) => b): f<a>",
        jsImpl: "(fa, fn) => (x) => fa(fn(x))",
        example: "let isEvenUser = Contravariant.contramap((n: number) => n % 2 == 0, (user) => user.age)"
      }
    ]
  },
  {
    id: "Applicative",
    name: "Applicative",
    category: "Algebraic",
    tagline: "Applicative functors with pure injection and curried function application (ap)",
    description: "Applicative functors allow applying wrapped functions to wrapped arguments independently and combining multiple effects.",
    typeDefinition: `type Applicative<f> = { pure: <a>(x: a) => f<a>, ap: <a, b>(ff: f<(x: a) => b>, fa: f<a>) => f<b> }`,
    lawsDoc: {
      leftIdentity: "ap(pure(f), pure(x)) === pure(f(x)) (Identity)",
      associativity: "ap(pure((f) => (x) => f(x)), fa) === fa"
    },
    typeLangSource: `module Applicative {
  export function pure<a>(val: a): Option<a>
  export function ap<f, a, b>(ff: f<(x: a) => b>, fa: f<a>): f<b>
  export function lift2<f, a, b, c>(fn: (x: a, y: b) => c, fa: f<a>, fb: f<b>): f<c>
  export function lift3<f, a, b, c, d>(fn: (x: a, y: b, z: c) => d, fa: f<a>, fb: f<b>, fc: f<c>): f<d>
  export function zip<f, a, b>(fa: f<a>, fb: f<b>): f<[a, b]>
}`,
    jsSource: `const $Applicative = {
  pure: $Some,
  ap: $apApplicative,
  lift2: (fn, fa, fb) => $apApplicative($mapFunctor(fa, (a) => (b) => fn(a, b)), fb),
  zip: (fa, fb) => $apApplicative($mapFunctor(fa, (a) => (b) => [a, b]), fb)
};`,
    functions: [
      {
        name: "ap",
        signature: "ap<f, a, b>(ff: f<(x: a) => b>, fa: f<a>): f<b>",
        description: "Applies a wrapped function ff to a wrapped value fa.",
        typeLangImpl: "extern function ap<f, a, b>(ff: f<(x: a) => b>, fa: f<a>): f<b>",
        jsImpl: "(ff, fa) => $apApplicative(ff, fa)",
        example: "Applicative.ap(Some((x) => x + 10), Some(5)) // Some(15)"
      },
      {
        name: "lift2",
        signature: "lift2<f, a, b, c>(fn: (x: a, y: b) => c, fa: f<a>, fb: f<b>): f<c>",
        description: "Lifts a binary function (a, b) -> c to operate over two applicative structures.",
        typeLangImpl: "function lift2<f, a, b, c>(fn: (x: a, y: b) => c, fa: f<a>, fb: f<b>): f<c>",
        jsImpl: "(fn, fa, fb) => ...",
        example: "Applicative.lift2((x, y) => x + y, Some(3), Some(4)) // Some(7)"
      }
    ]
  },
  {
    id: "Validation",
    name: "Validation",
    category: "Algebraic",
    tagline: "Error-accumulating Applicative structure for form & request validation",
    description: "Unlike Result/Either (which short-circuits on first error), Validation accumulates ALL errors using a semigroup list.",
    typeDefinition: `type Validation<a> = Valid(val: a) | Invalid(errs: Array<any>)`,
    typeLangSource: `module Validation {
  export function Valid<a>(val: a): Validation<a>
  export function Invalid<e>(errs: Array<e>): Validation<any>
  export function pure<a>(val: a): Validation<a>
  export function invalid<e>(err: e): Validation<any>
  export function isValid<a>(v: Validation<a>): boolean
  export function isInvalid<a>(v: Validation<a>): boolean
  export function map<a, b>(v: Validation<a>, fn: (x: a) => b): Validation<b>
  export function ap<a, b>(vf: Validation<(x: a) => b>, va: Validation<a>): Validation<b>
  export function accumulate<a, b, c>(v1: Validation<a>, v2: Validation<b>, fn: (x: a, y: b) => c): Validation<c>
  export function getOrElse<a>(v: Validation<a>, defaultVal: a): a
  export function toResult<a>(v: Validation<a>): Result<a, any>
}`,
    jsSource: `const $Validation = {
  Valid: $Valid,
  Invalid: $Invalid,
  pure: $Valid,
  invalid: (err) => $Invalid([err]),
  accumulate: (v1, v2, fn) => {
    if (v1.$tag === 'Valid' && v2.$tag === 'Valid') return $Valid(fn(v1.val, v2.val));
    return $Invalid([...(v1.errs || []), ...(v2.errs || [])]);
  }
};`,
    functions: [
      {
        name: "accumulate",
        signature: "accumulate<a, b, c>(v1: Validation<a>, v2: Validation<b>, fn: (x: a, y: b) => c): Validation<c>",
        description: "Combines two validations, gathering errors from both if invalid.",
        typeLangImpl: "function accumulate<a, b, c>(v1: Validation<a>, v2: Validation<b>, fn: (x: a, y: b) => c): Validation<c>",
        jsImpl: "(v1, v2, fn) => ...",
        example: 'Validation.accumulate(Invalid(["Name missing"]), Invalid(["Age must be positive"]), User)'
      }
    ]
  },
  {
    id: "Bifunctor",
    name: "Bifunctor",
    category: "Algebraic",
    tagline: "Mapping two covariant type parameters independently (Result, Either, Tuple)",
    description: "A Bifunctor is a container with two type parameters (e.g. Either<l, r>, Result<a, e>) allowing mapping both sides simultaneously via `bimap(fab, f, g)`.",
    typeDefinition: `type Bifunctor<f> = { bimap: <a, b, c, d>(fab: f<a, b>, f: (x: a) => c, g: (y: b) => d) => f<c, d> }`,
    typeLangSource: `module Bifunctor {
  export function bimap<f, a, b, c, d>(fab: f<a, b>, f: (x: a) => c, g: (y: b) => d): f<c, d>
}`,
    jsSource: `const $Bifunctor = {
  bimap: (fab, f, g) => (fab.$tag === "Ok" ? $Ok(g(fab.val)) : $Err(f(fab.err)))
};`,
    functions: [
      {
        name: "bimap",
        signature: "bimap<f, a, b, c, d>(fab: f<a, b>, f: (x: a) => c, g: (y: b) => d): f<c, d>",
        description: "Applies f to the left/error parameter and g to the right/value parameter.",
        typeLangImpl: "function bimap<f, a, b, c, d>(fab: f<a, b>, f: (x: a) => c, g: (y: b) => d): f<c, d>",
        jsImpl: "(fab, f, g) => ...",
        example: 'Bifunctor.bimap(Ok(10), (e) => "Error: " + e, (v) => v * 2) // Ok(20)'
      }
    ]
  },
  {
    id: "Profunctor",
    name: "Profunctor",
    category: "Algebraic",
    tagline: "Contravariant on input and covariant on output (Functions, Kleisli arrows)",
    description: "Profunctors map contravariantly over input positions and covariantly over output positions via `dimap(pab, f, g)`.",
    typeDefinition: `type Profunctor<p> = { dimap: <a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d) => p<c, d> }`,
    typeLangSource: `module Profunctor {
  export function dimap<p, a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d): p<c, d>
  export function promap<p, a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d): p<c, d>
}`,
    jsSource: `const $Profunctor = {
  dimap: (pab, f, g) => (x) => g(pab(f(x)))
};`,
    functions: [
      {
        name: "dimap",
        signature: "dimap<p, a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d): p<c, d>",
        description: "Transforms a function/arrow pab by pre-processing input with f and post-processing output with g.",
        typeLangImpl: "function dimap<p, a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d): p<c, d>",
        jsImpl: "(pab, f, g) => (x) => g(pab(f(x)))",
        example: 'Profunctor.dimap((n: number) => n * 2, (str) => String.parseInt(str), (num) => "Res: " + to_string(num))'
      }
    ]
  },
  {
    id: "Foldable",
    name: "Foldable",
    category: "Algebraic",
    tagline: "Data structure traversal and reduction into summary values or monoids",
    description: "Foldable structures can be collapsed into a single value using left fold or monoidal accumulation.",
    typeDefinition: `type Foldable<f> = { foldLeft: <a, b>(fa: f<a>, initial: b, fn: (acc: b, x: a) => b) => b }`,
    typeLangSource: `module Foldable {
  export function foldLeft<f, a, b>(fa: f<a>, initial: b, fn: (acc: b, x: a) => b): b
  export function foldMap<f, a, m>(fa: f<a>, monoid: Monoid<m>, fn: (x: a) => m): m
}`,
    jsSource: `const $Foldable = {
  foldLeft: (fa, initial, fn) => (Array.isArray(fa) ? fa.reduce(fn, initial) : initial),
  foldMap: (fa, monoid, fn) => fa.reduce((acc, x) => monoid.combine(acc, fn(x)), monoid.empty())
};`,
    functions: [
      {
        name: "foldLeft",
        signature: "foldLeft<f, a, b>(fa: f<a>, initial: b, fn: (acc: b, x: a) => b): b",
        description: "Reduces any foldable structure (Array, Option, Result) from left to right.",
        typeLangImpl: "function foldLeft<f, a, b>(fa: f<a>, initial: b, fn: (acc: b, x: a) => b): b",
        jsImpl: "(fa, initial, fn) => ...",
        example: "Foldable.foldLeft([1, 2, 3, 4], 0, (acc, x) => acc + x) // 10"
      },
      {
        name: "foldMap",
        signature: "foldMap<f, a, m>(fa: f<a>, monoid: Monoid<m>, fn: (x: a) => m): m",
        description: "Maps each element to a monoid and combines the results.",
        typeLangImpl: "function foldMap<f, a, m>(fa: f<a>, monoid: Monoid<m>, fn: (x: a) => m): m",
        jsImpl: "(fa, monoid, fn) => ...",
        example: 'Foldable.foldMap(["a", "b", "c"], Monoid.String, (x) => x + "!") // "a!b!c!"'
      }
    ]
  },
  {
    id: "DOM",
    name: "DOM",
    category: "Runtime",
    tagline: "Reactive Virtual DOM & Browser Rendering System",
    description: "Client-side web engine for mounting Virtual DOM components, interactive stateful UI, canvas 2D contexts, audio synthesis, and event listeners.",
    typeDefinition: `type VNode = { tag: string, props: any, children: [any], $vnode: boolean }`,
    typeLangSource: `module DOM {
  export extern function h(tag: string, props: any, children: [any]): VNode
  export extern function render(vnode: VNode, containerId: string): void
  export extern function getElementById(id: string): any
  export extern function createCanvas(id: string, width: number, height: number): any
  export extern function getAudioContext(): any
}`,
    jsSource: `const $DOM = {
  h: (tag, props, children) => ({ $vnode: true, tag, props: props || {}, children: Array.isArray(children) ? children : [children] }),
  render: (vnode, containerId) => { /* virtual dom reconciler */ },
  getElementById: (id) => typeof document !== 'undefined' ? document.getElementById(id) : null
};`,
    functions: [
      {
        name: "h",
        signature: "h(tag: string, props: any, children: [any]): VNode",
        description: "Creates a Virtual DOM node element.",
        typeLangImpl: "extern function h(tag: string, props: any, children: [any]): VNode",
        jsImpl: "(tag, props, children) => ({ $vnode: true, tag, props, children })",
        example: 'DOM.h("button", { onClick: () => count = count + 1 }, ["Click me"])'
      },
      {
        name: "render",
        signature: "render(vnode: VNode, containerId: string): void",
        description: "Mounts and reconciles a Virtual DOM root inside a container element.",
        typeLangImpl: "extern function render(vnode: VNode, containerId: string): void",
        jsImpl: "(vnode, containerId) => { /* DOM mount */ }",
        example: 'DOM.render(appView, "root")'
      }
    ]
  },
  {
    id: "Node",
    name: "Node",
    category: "Runtime",
    tagline: "Server-side Express microservice & filesystem runtime",
    description: "Server runtime providing HTTP server creation, routing, JSON response emission, asynchronous file read/write operations, and port listening.",
    typeDefinition: `module Node`,
    typeLangSource: `module Node {
  export extern function createServer(): any
  export extern function get(server: any, path: string, handler: (req: any, res: any) => void): void
  export extern function post(server: any, path: string, handler: (req: any, res: any) => void): void
  export extern function listen(server: any, port: number, callback: () => void): void
  export extern function readFile(path: string): string
  export extern function writeFile(path: string, content: string): void
  export extern function json(res: any, data: any): void
}`,
    jsSource: `const $Node = {
  createServer: () => ({ routes: [] }),
  readFile: (path) => "mock file content",
  writeFile: (path, content) => {},
  listen: (server, port, cb) => { if (typeof cb === 'function') cb(); }
};`,
    functions: [
      {
        name: "createServer",
        signature: "createServer(): any",
        description: "Instantiates a new HTTP microservice server instance.",
        typeLangImpl: "extern function createServer(): any",
        jsImpl: "() => ({ routes: [] })",
        example: "let app = Node.createServer()"
      },
      {
        name: "listen",
        signature: "listen(server: any, port: number, callback: () => void): void",
        description: "Starts the server listening on the specified port.",
        typeLangImpl: "extern function listen(server: any, port: number, callback: () => void): void",
        jsImpl: "(server, port, cb) => cb()",
        example: 'Node.listen(app, 3000, () => println("Server running on port 3000"))'
      }
    ]
  }
];
var ROOT_BUILTIN_DOC_COMMENTS = {
  print: `/**
 * Writes a value to standard output without appending a newline.
 * @param val The value to write.
 * @returns Nothing.
 */`,
  println: `/**
 * Writes a value to standard output followed by a newline.
 * @param val The value to write.
 * @returns Nothing.
 */`,
  to_string: `/**
 * Converts a value to its canonical string representation.
 * @param val The value to convert.
 * @returns The formatted string.
 */`,
  concat: `/**
 * Concatenates two strings in order.
 * @param a The first string.
 * @param b The string to append.
 * @returns The concatenated string.
 */`,
  requestAnimationFrame: `/**
 * Schedules a callback for the next animation frame in browser runtimes.
 * @param callback The function to invoke for the next frame.
 */`,
  setInterval: `/**
 * Repeatedly invokes a callback at the requested interval.
 * @param callback The function to invoke.
 * @param ms The delay between invocations, in milliseconds.
 * @returns A timer handle that can be passed to clearInterval.
 */`,
  clearInterval: `/**
 * Cancels a repeating timer created by setInterval.
 * @param handle The timer handle to cancel.
 */`,
  setTimeout: `/**
 * Schedules a callback to run once after a delay.
 * @param callback The function to invoke.
 * @param ms The delay before invocation, in milliseconds.
 * @returns A timer handle that can be passed to clearTimeout.
 */`,
  clearTimeout: `/**
 * Cancels a pending one-shot timer created by setTimeout.
 * @param handle The timer handle to cancel.
 */`
};
function getRootBuiltinDoc(name) {
  const raw = ROOT_BUILTIN_DOC_COMMENTS[name];
  return raw ? renderDocComment(raw) : void 0;
}
function getStdLibModuleDoc(moduleName) {
  const normalizedName = moduleName.toLowerCase();
  const module2 = STDLIB_MODULES.find((entry) => entry.id.toLowerCase() === normalizedName || entry.name.toLowerCase() === normalizedName);
  return module2?.description;
}
function getStdLibMemberDoc(moduleName, memberName, parameterNames = [], resultType) {
  const normalizedName = moduleName.toLowerCase();
  const module2 = STDLIB_MODULES.find((entry) => entry.id.toLowerCase() === normalizedName || entry.name.toLowerCase() === normalizedName);
  if (!module2) return void 0;
  const fn = module2.functions.find((entry) => entry.name === memberName);
  const operationDocs = {
    pure: "Lifts a plain value into the module\u2019s computational context.",
    of: "Constructs a value in the module\u2019s context.",
    map: "Transforms the value inside the context without changing the context itself.",
    flatMap: "Chains a context-producing transformation while preserving the module\u2019s sequencing rules.",
    filter: "Keeps the value only when it satisfies the supplied predicate.",
    fold: "Reduces the value to a result by selecting the appropriate branch or handler.",
    getOrElse: "Extracts the contained value, or returns the provided fallback.",
    flatten: "Removes one layer of nested context.",
    zip: "Combines two values while preserving the module\u2019s context semantics.",
    tap: "Runs a side-effecting callback and returns the original contextual value.",
    swap: "Exchanges the left and right cases of the value.",
    mapError: "Transforms the error channel while preserving a successful value.",
    fromOption: "Converts an optional value into this result type using the provided error.",
    toOption: "Converts this value to an Option, discarding error information when present.",
    run: "Executes the deferred computation with the supplied environment or state.",
    ask: "Reads the complete environment supplied to a Reader computation.",
    asks: "Projects a value from the Reader environment.",
    tell: "Appends a value to the Writer output.",
    listen: "Returns the computation result together with the output it produced.",
    get: "Reads the current state.",
    set: "Replaces the current state with the supplied value.",
    modify: "Updates the current state with a transformation function.",
    evalState: "Runs a state computation and returns only its result.",
    execState: "Runs a state computation and returns only its final state.",
    combine: "Combines two values using the algebraic instance\u2019s operation.",
    concatAll: "Combines a collection of values from left to right.",
    compare: "Compares two values and returns their ordering.",
    contramap: "Transforms inputs before passing them to the underlying operation.",
    bimap: "Transforms both sides of a two-parameter value.",
    dimap: "Transforms the input and output of a profunctor.",
    foldLeft: "Traverses a collection from left to right while carrying an accumulator.",
    foldMap: "Maps each element into a monoid and combines the results.",
    accumulate: "Combines multiple validations while accumulating all available errors.",
    ap: "Applies a function held in an applicative context to a contextual value.",
    lift2: "Lifts a two-argument function to operate on applicative values.",
    lift3: "Lifts a three-argument function to operate on applicative values.",
    isSome: "Returns whether the Option contains a value.",
    isNone: "Returns whether the Option is empty.",
    isOk: "Returns whether the Result represents success.",
    isErr: "Returns whether the Result represents failure.",
    isLeft: "Returns whether the Either contains a left value.",
    isRight: "Returns whether the Either contains a right value.",
    isValid: "Returns whether the Validation represents success.",
    isInvalid: "Returns whether the Validation contains errors.",
    min: "Returns the smaller of two ordered values.",
    max: "Returns the larger of two ordered values.",
    clamp: "Bounds a value to the inclusive minimum and maximum.",
    between: "Checks whether a value falls within the supplied bounds.",
    invert: "Returns the inverse of a value in the group.",
    subtract: "Combines a value with the inverse of another value.",
    stringify: "Serializes a value as JSON text.",
    parse: "Parses JSON text into a TypeLang value.",
    envGet: "Reads an environment variable by name.",
    readFile: "Reads text from a file path.",
    writeFile: "Writes text to a file path.",
    createApp: "Creates a new HTTP application instance.",
    getElementById: "Looks up a DOM element by its identifier.",
    createElement: "Creates a DOM element with the requested tag name.",
    setText: "Replaces an element\u2019s text content.",
    setHtml: "Replaces an element\u2019s HTML content.",
    setAttr: "Sets an attribute on a DOM element.",
    appendChild: "Appends a child node to a parent node.",
    addEventListener: "Registers a callback for a DOM event.",
    mount: "Mounts a virtual DOM tree into a browser container."
  };
  const description = fn?.description || operationDocs[memberName] || `Provides the ${memberName} operation for values in the ${moduleName} module.`;
  const example = fn?.example;
  const paramDescriptions = {
    arr: "The input array or collection.",
    opt: "The optional value to inspect or transform.",
    res: "The result value to inspect or transform.",
    fn: "The callback applied to the input value.",
    pred: "The predicate used to decide which values to keep.",
    elem: "The element to add or combine.",
    initial: "The initial accumulator value.",
    init: "The initial accumulator value.",
    acc: "The accumulated value passed to the next step.",
    accumulator: "The accumulated value passed to the next step.",
    x: "The value supplied to the callback.",
    value: "The value to process.",
    val: "The value to process.",
    defaultVal: "The fallback value used when no value is available.",
    callback: "The function invoked by this operation."
  };
  const signature = fn?.signature || "";
  const signatureStart = signature.indexOf("(");
  let signatureEnd = signatureStart;
  let depth = 0;
  for (; signatureEnd >= 0 && signatureEnd < signature.length; signatureEnd++) {
    if (signature[signatureEnd] === "(") depth++;
    if (signature[signatureEnd] === ")" && --depth === 0) break;
  }
  const parameterList = signatureStart >= 0 ? signature.slice(signatureStart + 1, signatureEnd) : "";
  const parameters = [];
  let nestedDepth = 0;
  let segmentStart = 0;
  for (let index = 0; index <= parameterList.length; index++) {
    const char = parameterList[index];
    if (char === "(" || char === "[" || char === "{") nestedDepth++;
    if (char === ")" || char === "]" || char === "}") nestedDepth--;
    if (char === "," && nestedDepth === 0 || index === parameterList.length) {
      const parameterName = parameterList.slice(segmentStart, index).split(":")[0].trim();
      if (parameterName) parameters.push(parameterName);
      segmentStart = index + 1;
    }
  }
  const names = parameters.length ? parameters : parameterNames;
  const parameterTags = names.map((name) => ` * @param ${name} ${paramDescriptions[name] || `The ${name} input used by this operation.`}`).join("\n");
  const returnText = (signatureEnd >= 0 && fn ? signature.slice(signatureEnd + 1).replace(/^\s*:\s*/, "").trim() : resultType) || "";
  const exampleTag = example ? ` * @example
 * ${example.replace(/\n/g, "\n * ")}
` : "";
  const raw = `/**
 * ${description.replace(/\n/g, "\n * ")}
${parameterTags ? `${parameterTags}
` : ""}${returnText ? ` * @returns The result of this operation (${returnText}).
` : ""}${exampleTag} */`;
  return renderDocComment(raw, names);
}

// ../lang/types.ts
var KIND_STAR = { kind: "star" };
function kindArrow(from, to) {
  return { kind: "arrow", from, to };
}
function makeKindN(arity) {
  let k = KIND_STAR;
  for (let i = 0; i < arity; i++) {
    k = kindArrow(KIND_STAR, k);
  }
  return k;
}
function kindArity(k) {
  let count = 0;
  let curr = k;
  while (curr.kind === "arrow") {
    count++;
    curr = curr.to;
  }
  return count;
}
var PRIM_NUMBER = { kind: "prim", name: "number" };
var PRIM_BOOLEAN = { kind: "prim", name: "boolean" };
var PRIM_STRING = { kind: "prim", name: "string" };
var PRIM_VOID = { kind: "prim", name: "void" };
var varCounter = 0;
function freshTypeVar(name, typeKind = KIND_STAR) {
  return {
    kind: "var",
    id: ++varCounter,
    name,
    typeKind
  };
}
function prune(type, visited = /* @__PURE__ */ new Set()) {
  if (type.kind === "var" && type.instance) {
    if (visited.has(type)) {
      return type;
    }
    visited.add(type);
    type.instance = prune(type.instance, visited);
    return type.instance;
  }
  if (type.kind === "hkt_app") {
    const ctor = prune(type.constructor, visited);
    const args = type.args.map((a) => prune(a, visited));
    if (ctor.kind === "cons") {
      if (ctor.name === "Array" || ctor.name === "list") {
        return { kind: "tup", elements: [args[0] || freshTypeVar("a")] };
      }
      return { kind: "cons", name: ctor.name, args: [...ctor.args, ...args] };
    }
    if (ctor.kind === "type_lambda") {
      const subst = /* @__PURE__ */ new Map();
      ctor.params.forEach((p, idx) => {
        if (args[idx]) subst.set(p, args[idx]);
      });
      return prune(substituteInType(ctor.body, subst), visited);
    }
    return { kind: "hkt_app", constructor: ctor, args };
  }
  return type;
}
function substituteInType(type, map, visited = /* @__PURE__ */ new Map()) {
  if (visited.has(type)) return visited.get(type);
  switch (type.kind) {
    case "var":
      if (type.name && map.has(type.name)) return map.get(type.name);
      if (type.instance) return substituteInType(type.instance, map, visited);
      return type;
    case "fun": {
      const newFun = { kind: "fun", params: [], returnType: PRIM_VOID };
      visited.set(type, newFun);
      newFun.params = type.params.map((p) => ({ ...p, type: substituteInType(p.type, map, visited) }));
      newFun.returnType = substituteInType(type.returnType, map, visited);
      return newFun;
    }
    case "rec": {
      const newRec = { kind: "rec", fields: [] };
      visited.set(type, newRec);
      newRec.fields = type.fields.map((f) => ({ ...f, type: substituteInType(f.type, map, visited) }));
      return newRec;
    }
    case "tup": {
      const newTup = { kind: "tup", elements: [] };
      visited.set(type, newTup);
      newTup.elements = type.elements.map((e) => substituteInType(e, map, visited));
      return newTup;
    }
    case "cons": {
      if (map.has(type.name) && type.args.length === 0) {
        return map.get(type.name);
      }
      if (map.has(type.name) && type.args.length > 0) {
        const target = map.get(type.name);
        const newArgs = type.args.map((a) => substituteInType(a, map, visited));
        if (target.kind === "cons") {
          return { kind: "cons", name: target.name, args: [...target.args, ...newArgs] };
        }
        return { kind: "hkt_app", constructor: target, args: newArgs };
      }
      return { kind: "cons", name: type.name, args: type.args.map((a) => substituteInType(a, map, visited)) };
    }
    case "hkt_app": {
      const newCtor = substituteInType(type.constructor, map, visited);
      const newArgs = type.args.map((a) => substituteInType(a, map, visited));
      return { kind: "hkt_app", constructor: newCtor, args: newArgs };
    }
    case "type_lambda": {
      const filteredMap = new Map(map);
      for (const p of type.params) filteredMap.delete(p);
      return { kind: "type_lambda", params: type.params, body: substituteInType(type.body, filteredMap, visited) };
    }
    case "poly": {
      const filteredMap = new Map(map);
      for (const q of type.quantifiers) filteredMap.delete(q);
      return { kind: "poly", quantifiers: type.quantifiers, quantifierKinds: type.quantifierKinds, type: substituteInType(type.type, filteredMap, visited) };
    }
    default:
      return type;
  }
}
function typeToString(t, visiting = /* @__PURE__ */ new Set()) {
  const type = prune(t);
  if (visiting.has(type)) {
    return "Self";
  }
  visiting.add(type);
  let result = "";
  switch (type.kind) {
    case "prim":
      result = type.name;
      break;
    case "var":
      result = type.instance ? typeToString(type.instance, visiting) : type.name || `'t${type.id}`;
      break;
    case "existential":
      result = `\u2203${type.name}_${type.id}`;
      break;
    case "poly": {
      const qStrings = type.quantifiers.map((q) => {
        if (type.quantifierKinds && type.quantifierKinds.has(q)) {
          const k = type.quantifierKinds.get(q);
          if (k.kind === "arrow") {
            const arity = kindArity(k);
            return `${q}<${Array(arity).fill("_").join(", ")}>`;
          }
        }
        return q;
      });
      result = `<${qStrings.join(", ")}>${typeToString(type.type, visiting)}`;
      break;
    }
    case "fun": {
      const params = type.params.map((p) => p.name ? `${p.name}: ${typeToString(p.type, visiting)}` : typeToString(p.type, visiting)).join(", ");
      result = `(${params}) => ${typeToString(type.returnType, visiting)}`;
      break;
    }
    case "rec": {
      const fields = type.fields.map((f) => `${f.isMut ? "mut " : ""}${f.name}${f.isOptional ? "?" : ""}: ${typeToString(f.type, visiting)}`).join(", ");
      result = `{ ${fields} }`;
      break;
    }
    case "tup":
      result = `[${type.elements.map((e) => typeToString(e, visiting)).join(", ")}]`;
      break;
    case "cons":
      result = type.args.length > 0 ? `${type.name}<${type.args.map((a) => typeToString(a, visiting)).join(", ")}>` : type.name;
      break;
    case "hkt_app": {
      const ctorStr = typeToString(type.constructor, visiting);
      const argsStr = type.args.map((a) => typeToString(a, visiting)).join(", ");
      result = `${ctorStr}<${argsStr}>`;
      break;
    }
    case "type_lambda":
      result = `\u03BB<${type.params.join(", ")}> => ${typeToString(type.body, visiting)}`;
      break;
  }
  visiting.delete(type);
  return result;
}

// ../lang/checker.ts
function astToKind(k) {
  if (!k) return KIND_STAR;
  if (k.kind === "star") return KIND_STAR;
  if (k.kind === "arrow") return kindArrow(astToKind(k.from), astToKind(k.to));
  return KIND_STAR;
}
function getTypeParamKind(tp) {
  if (typeof tp === "string") return KIND_STAR;
  if (tp.kindAnnotation) {
    return astToKind(tp.kindAnnotation);
  }
  if (tp.arity !== void 0 && tp.arity > 0) {
    return makeKindN(tp.arity);
  }
  return KIND_STAR;
}
function createTypeVarForParam(tp) {
  const name = getTypeParamName(tp);
  const kind = getTypeParamKind(tp);
  return freshTypeVar(name, kind);
}
function createScopedEnv(parent) {
  return {
    vars: parent ? new Map(parent.vars) : /* @__PURE__ */ new Map(),
    mutVars: parent ? new Set(parent.mutVars) : /* @__PURE__ */ new Set(),
    gadts: parent ? new Map(parent.gadts) : /* @__PURE__ */ new Map(),
    typeAliases: parent ? new Map(parent.typeAliases) : /* @__PURE__ */ new Map(),
    modules: parent ? new Map(parent.modules) : /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set(),
    parent,
    currentReturnType: parent?.currentReturnType,
    defLocs: parent && parent.defLocs ? new Map(parent.defLocs) : /* @__PURE__ */ new Map(),
    docs: parent?.docs ? new Map(parent.docs) : /* @__PURE__ */ new Map(),
    moduleDoc: parent?.moduleDoc
  };
}
function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase() ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        // deletion
        dp[i][j - 1] + 1,
        // insertion
        dp[i - 1][j - 1] + cost
        // substitution
      );
      if (i > 1 && j > 1 && s1[i - 1].toLowerCase() === s2[j - 2].toLowerCase() && s1[i - 2].toLowerCase() === s2[j - 1].toLowerCase()) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[m][n];
}
function findBestSuggestion(target, candidates, maxDist = 3) {
  let best = null;
  let bestDist = Infinity;
  for (const candidate of candidates) {
    if (candidate === target) continue;
    const dist = levenshteinDistance(target, candidate);
    const threshold = Math.min(maxDist, Math.max(1, Math.floor(target.length / 2) + 1));
    if (dist <= threshold && dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }
  return best;
}
function createInitialEnv() {
  const env2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set(),
    defLocs: /* @__PURE__ */ new Map(),
    docs: /* @__PURE__ */ new Map()
  };
  env2.vars.set("print", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: PRIM_VOID
    }
  });
  env2.vars.set("println", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: PRIM_VOID
    }
  });
  env2.vars.set("to_string", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: PRIM_STRING
    }
  });
  env2.vars.set("concat", {
    kind: "fun",
    params: [
      { name: "a", type: PRIM_STRING },
      { name: "b", type: PRIM_STRING }
    ],
    returnType: PRIM_STRING
  });
  env2.vars.set("parse_int", {
    kind: "fun",
    params: [{ name: "s", type: PRIM_STRING }],
    returnType: PRIM_NUMBER
  });
  env2.vars.set("parse_float", {
    kind: "fun",
    params: [{ name: "s", type: PRIM_STRING }],
    returnType: PRIM_NUMBER
  });
  env2.vars.set("time_now", {
    kind: "fun",
    params: [],
    returnType: PRIM_NUMBER
  });
  const mathEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  mathEnv2.vars.set("sqrt", { kind: "fun", params: [{ name: "x", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("abs", { kind: "fun", params: [{ name: "x", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("floor", { kind: "fun", params: [{ name: "x", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("ceil", { kind: "fun", params: [{ name: "x", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("round", { kind: "fun", params: [{ name: "x", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("min", { kind: "fun", params: [{ name: "a", type: PRIM_NUMBER }, { name: "b", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("max", { kind: "fun", params: [{ name: "a", type: PRIM_NUMBER }, { name: "b", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("pow", { kind: "fun", params: [{ name: "base", type: PRIM_NUMBER }, { name: "exp", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("random", { kind: "fun", params: [], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("cos", { kind: "fun", params: [{ name: "x", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("sin", { kind: "fun", params: [{ name: "x", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("atan2", { kind: "fun", params: [{ name: "y", type: PRIM_NUMBER }, { name: "x", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("log", { kind: "fun", params: [{ name: "x", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("bitwise_and", { kind: "fun", params: [{ name: "a", type: PRIM_NUMBER }, { name: "b", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("bitwise_or", { kind: "fun", params: [{ name: "a", type: PRIM_NUMBER }, { name: "b", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("bitwise_xor", { kind: "fun", params: [{ name: "a", type: PRIM_NUMBER }, { name: "b", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("bitwise_not", { kind: "fun", params: [{ name: "x", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("bitwise_shl", { kind: "fun", params: [{ name: "a", type: PRIM_NUMBER }, { name: "b", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("bitwise_shr", { kind: "fun", params: [{ name: "a", type: PRIM_NUMBER }, { name: "b", type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv2.vars.set("PI", PRIM_NUMBER);
  mathEnv2.vars.set("E", PRIM_NUMBER);
  for (const name of Array.from(mathEnv2.vars.keys())) mathEnv2.exports.add(name);
  env2.modules.set("Math", mathEnv2);
  const arrayEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  arrayEnv2.vars.set("len", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "arr", type: { kind: "tup", elements: [freshTypeVar("a")] } }],
      returnType: PRIM_NUMBER
    }
  });
  arrayEnv2.vars.set("map", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "arr", type: { kind: "tup", elements: [freshTypeVar("a")] } },
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }
      ],
      returnType: { kind: "tup", elements: [freshTypeVar("b")] }
    }
  });
  arrayEnv2.vars.set("filter", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [
        { name: "arr", type: { kind: "tup", elements: [freshTypeVar("a")] } },
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: PRIM_BOOLEAN } }
      ],
      returnType: { kind: "tup", elements: [freshTypeVar("a")] }
    }
  });
  arrayEnv2.vars.set("reduce", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "arr", type: { kind: "tup", elements: [freshTypeVar("a")] } },
        { name: "init", type: freshTypeVar("b") },
        {
          name: "fn",
          type: {
            kind: "fun",
            params: [
              { name: "acc", type: freshTypeVar("b") },
              { name: "elem", type: freshTypeVar("a") }
            ],
            returnType: freshTypeVar("b")
          }
        }
      ],
      returnType: freshTypeVar("b")
    }
  });
  arrayEnv2.vars.set("push", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [
        { name: "arr", type: { kind: "tup", elements: [freshTypeVar("a")] } },
        { name: "elem", type: freshTypeVar("a") }
      ],
      returnType: { kind: "tup", elements: [freshTypeVar("a")] }
    }
  });
  arrayEnv2.vars.set("slice", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [
        { name: "arr", type: { kind: "tup", elements: [freshTypeVar("a")] } },
        { name: "start", type: PRIM_NUMBER },
        { name: "end", type: PRIM_NUMBER }
      ],
      returnType: { kind: "tup", elements: [freshTypeVar("a")] }
    }
  });
  arrayEnv2.vars.set("concat", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [
        { name: "a", type: { kind: "tup", elements: [freshTypeVar("a")] } },
        { name: "b", type: { kind: "tup", elements: [freshTypeVar("a")] } }
      ],
      returnType: { kind: "tup", elements: [freshTypeVar("a")] }
    }
  });
  arrayEnv2.vars.set("join", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [
        { name: "arr", type: { kind: "tup", elements: [freshTypeVar("a")] } },
        { name: "sep", type: PRIM_STRING }
      ],
      returnType: PRIM_STRING
    }
  });
  for (const name of Array.from(arrayEnv2.vars.keys())) arrayEnv2.exports.add(name);
  env2.modules.set("Array", arrayEnv2);
  const stringEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  stringEnv2.vars.set("len", {
    kind: "fun",
    params: [{ name: "s", type: PRIM_STRING }],
    returnType: PRIM_NUMBER
  });
  stringEnv2.vars.set("slice", {
    kind: "fun",
    params: [
      { name: "s", type: PRIM_STRING },
      { name: "start", type: PRIM_NUMBER },
      { name: "end", type: PRIM_NUMBER }
    ],
    returnType: PRIM_STRING
  });
  stringEnv2.vars.set("split", {
    kind: "fun",
    params: [
      { name: "s", type: PRIM_STRING },
      { name: "delim", type: PRIM_STRING }
    ],
    returnType: { kind: "tup", elements: [PRIM_STRING] }
  });
  stringEnv2.vars.set("contains", {
    kind: "fun",
    params: [
      { name: "s", type: PRIM_STRING },
      { name: "sub", type: PRIM_STRING }
    ],
    returnType: PRIM_BOOLEAN
  });
  stringEnv2.vars.set("parseInt", {
    kind: "fun",
    params: [{ name: "s", type: PRIM_STRING }],
    returnType: PRIM_NUMBER
  });
  stringEnv2.vars.set("parseFloat", {
    kind: "fun",
    params: [{ name: "s", type: PRIM_STRING }],
    returnType: PRIM_NUMBER
  });
  for (const name of Array.from(stringEnv2.vars.keys())) stringEnv2.exports.add(name);
  env2.modules.set("String", stringEnv2);
  const optionEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  const optionGadt = {
    kind: "gadt",
    name: "Option",
    typeParams: [{ name: "a" }],
    constructors: [
      { name: "Some", typeParams: [], params: [{ name: "val", type: { kind: "var", name: "a" } }] },
      { name: "None", typeParams: [], params: [] }
    ]
  };
  optionEnv2.gadts.set("Option", optionGadt);
  env2.gadts.set("Option", optionGadt);
  const someType = {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("a")] }
    }
  };
  const noneType = {
    kind: "poly",
    quantifiers: ["a"],
    type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] }
  };
  env2.vars.set("Some", someType);
  env2.vars.set("None", noneType);
  optionEnv2.vars.set("Some", someType);
  optionEnv2.vars.set("None", noneType);
  optionEnv2.vars.set("pure", someType);
  optionEnv2.vars.set("of", someType);
  optionEnv2.vars.set("flatMap", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "opt", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        {
          name: "fn",
          type: {
            kind: "fun",
            params: [{ name: "x", type: freshTypeVar("a") }],
            returnType: { kind: "cons", name: "Option", args: [freshTypeVar("b")] }
          }
        }
      ],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("b")] }
    }
  });
  optionEnv2.vars.set("map", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "opt", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        {
          name: "fn",
          type: {
            kind: "fun",
            params: [{ name: "x", type: freshTypeVar("a") }],
            returnType: freshTypeVar("b")
          }
        }
      ],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("b")] }
    }
  });
  optionEnv2.vars.set("filter", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [
        { name: "opt", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        {
          name: "pred",
          type: {
            kind: "fun",
            params: [{ name: "x", type: freshTypeVar("a") }],
            returnType: PRIM_BOOLEAN
          }
        }
      ],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("a")] }
    }
  });
  optionEnv2.vars.set("getOrElse", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [
        { name: "opt", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        { name: "defaultVal", type: freshTypeVar("a") }
      ],
      returnType: freshTypeVar("a")
    }
  });
  optionEnv2.vars.set("isSome", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "opt", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } }],
      returnType: PRIM_BOOLEAN
    }
  });
  optionEnv2.vars.set("isNone", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "opt", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } }],
      returnType: PRIM_BOOLEAN
    }
  });
  optionEnv2.vars.set("flatten", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "opt", type: { kind: "cons", name: "Option", args: [{ kind: "cons", name: "Option", args: [freshTypeVar("a")] }] } }],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("a")] }
    }
  });
  optionEnv2.vars.set("zip", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "optA", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        { name: "optB", type: { kind: "cons", name: "Option", args: [freshTypeVar("b")] } }
      ],
      returnType: { kind: "cons", name: "Option", args: [{ kind: "tup", elements: [freshTypeVar("a"), freshTypeVar("b")] }] }
    }
  });
  optionEnv2.vars.set("fromNullable", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("a")] }
    }
  });
  optionEnv2.vars.set("fold", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "opt", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        { name: "defaultVal", type: freshTypeVar("b") },
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }
      ],
      returnType: freshTypeVar("b")
    }
  });
  optionEnv2.vars.set("orElse", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [
        { name: "opt", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        { name: "altOpt", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } }
      ],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("a")] }
    }
  });
  optionEnv2.vars.set("toResult", {
    kind: "poly",
    quantifiers: ["a", "e"],
    type: {
      kind: "fun",
      params: [
        { name: "opt", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        { name: "err", type: freshTypeVar("e") }
      ],
      returnType: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] }
    }
  });
  optionEnv2.vars.set("contains", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [
        { name: "opt", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        { name: "elem", type: freshTypeVar("a") }
      ],
      returnType: PRIM_BOOLEAN
    }
  });
  optionEnv2.vars.set("exists", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [
        { name: "opt", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        { name: "pred", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: PRIM_BOOLEAN } }
      ],
      returnType: PRIM_BOOLEAN
    }
  });
  optionEnv2.vars.set("tap", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "opt", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }
      ],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("a")] }
    }
  });
  for (const name of Array.from(optionEnv2.vars.keys())) optionEnv2.exports.add(name);
  env2.modules.set("Option", optionEnv2);
  const resultEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  const resultGadt = {
    kind: "gadt",
    name: "Result",
    typeParams: [{ name: "a" }, { name: "e" }],
    constructors: [
      { name: "Ok", typeParams: [], params: [{ name: "val", type: { kind: "var", name: "a" } }] },
      { name: "Err", typeParams: [], params: [{ name: "err", type: { kind: "var", name: "e" } }] }
    ]
  };
  resultEnv2.gadts.set("Result", resultGadt);
  env2.gadts.set("Result", resultGadt);
  const okType = {
    kind: "poly",
    quantifiers: ["a", "e"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] }
    }
  };
  const errType = {
    kind: "poly",
    quantifiers: ["a", "e"],
    type: {
      kind: "fun",
      params: [{ name: "err", type: freshTypeVar("e") }],
      returnType: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] }
    }
  };
  env2.vars.set("Ok", okType);
  env2.vars.set("Err", errType);
  resultEnv2.vars.set("Ok", okType);
  resultEnv2.vars.set("Err", errType);
  resultEnv2.vars.set("pure", okType);
  resultEnv2.vars.set("of", okType);
  resultEnv2.vars.set("flatMap", {
    kind: "poly",
    quantifiers: ["a", "b", "e"],
    type: {
      kind: "fun",
      params: [
        { name: "res", type: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] } },
        {
          name: "fn",
          type: {
            kind: "fun",
            params: [{ name: "x", type: freshTypeVar("a") }],
            returnType: { kind: "cons", name: "Result", args: [freshTypeVar("b"), freshTypeVar("e")] }
          }
        }
      ],
      returnType: { kind: "cons", name: "Result", args: [freshTypeVar("b"), freshTypeVar("e")] }
    }
  });
  resultEnv2.vars.set("map", {
    kind: "poly",
    quantifiers: ["a", "b", "e"],
    type: {
      kind: "fun",
      params: [
        { name: "res", type: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] } },
        {
          name: "fn",
          type: {
            kind: "fun",
            params: [{ name: "x", type: freshTypeVar("a") }],
            returnType: freshTypeVar("b")
          }
        }
      ],
      returnType: { kind: "cons", name: "Result", args: [freshTypeVar("b"), freshTypeVar("e")] }
    }
  });
  resultEnv2.vars.set("mapError", {
    kind: "poly",
    quantifiers: ["a", "e", "e2"],
    type: {
      kind: "fun",
      params: [
        { name: "res", type: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] } },
        {
          name: "fn",
          type: {
            kind: "fun",
            params: [{ name: "err", type: freshTypeVar("e") }],
            returnType: freshTypeVar("e2")
          }
        }
      ],
      returnType: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e2")] }
    }
  });
  resultEnv2.vars.set("getOrElse", {
    kind: "poly",
    quantifiers: ["a", "e"],
    type: {
      kind: "fun",
      params: [
        { name: "res", type: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] } },
        { name: "defaultVal", type: freshTypeVar("a") }
      ],
      returnType: freshTypeVar("a")
    }
  });
  resultEnv2.vars.set("isOk", {
    kind: "poly",
    quantifiers: ["a", "e"],
    type: {
      kind: "fun",
      params: [{ name: "res", type: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] } }],
      returnType: PRIM_BOOLEAN
    }
  });
  resultEnv2.vars.set("isErr", {
    kind: "poly",
    quantifiers: ["a", "e"],
    type: {
      kind: "fun",
      params: [{ name: "res", type: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] } }],
      returnType: PRIM_BOOLEAN
    }
  });
  resultEnv2.vars.set("flatten", {
    kind: "poly",
    quantifiers: ["a", "e"],
    type: {
      kind: "fun",
      params: [{ name: "res", type: { kind: "cons", name: "Result", args: [{ kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] }, freshTypeVar("e")] } }],
      returnType: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] }
    }
  });
  resultEnv2.vars.set("toOption", {
    kind: "poly",
    quantifiers: ["a", "e"],
    type: {
      kind: "fun",
      params: [{ name: "res", type: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] } }],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("a")] }
    }
  });
  resultEnv2.vars.set("fromOption", {
    kind: "poly",
    quantifiers: ["a", "e"],
    type: {
      kind: "fun",
      params: [
        { name: "opt", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        { name: "err", type: freshTypeVar("e") }
      ],
      returnType: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] }
    }
  });
  resultEnv2.vars.set("fold", {
    kind: "poly",
    quantifiers: ["a", "e", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "res", type: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] } },
        { name: "onErr", type: { kind: "fun", params: [{ name: "err", type: freshTypeVar("e") }], returnType: freshTypeVar("b") } },
        { name: "onOk", type: { kind: "fun", params: [{ name: "val", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }
      ],
      returnType: freshTypeVar("b")
    }
  });
  resultEnv2.vars.set("orElse", {
    kind: "poly",
    quantifiers: ["a", "e"],
    type: {
      kind: "fun",
      params: [
        { name: "res", type: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] } },
        { name: "altRes", type: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] } }
      ],
      returnType: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] }
    }
  });
  resultEnv2.vars.set("zip", {
    kind: "poly",
    quantifiers: ["a", "b", "e"],
    type: {
      kind: "fun",
      params: [
        { name: "resA", type: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] } },
        { name: "resB", type: { kind: "cons", name: "Result", args: [freshTypeVar("b"), freshTypeVar("e")] } }
      ],
      returnType: { kind: "cons", name: "Result", args: [{ kind: "tup", elements: [freshTypeVar("a"), freshTypeVar("b")] }, freshTypeVar("e")] }
    }
  });
  resultEnv2.vars.set("tap", {
    kind: "poly",
    quantifiers: ["a", "e", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "res", type: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] } },
        { name: "fn", type: { kind: "fun", params: [{ name: "val", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }
      ],
      returnType: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] }
    }
  });
  resultEnv2.vars.set("fromTry", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "fn", type: { kind: "fun", params: [], returnType: freshTypeVar("a") } }],
      returnType: { kind: "cons", name: "Result", args: [freshTypeVar("a"), PRIM_STRING] }
    }
  });
  for (const name of Array.from(resultEnv2.vars.keys())) resultEnv2.exports.add(name);
  env2.modules.set("Result", resultEnv2);
  const eitherEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  const eitherGadt = {
    kind: "gadt",
    name: "Either",
    typeParams: [{ name: "l" }, { name: "r" }],
    constructors: [
      { name: "Left", typeParams: [], params: [{ name: "left", type: { kind: "var", name: "l" } }] },
      { name: "Right", typeParams: [], params: [{ name: "right", type: { kind: "var", name: "r" } }] }
    ]
  };
  eitherEnv2.gadts.set("Either", eitherGadt);
  env2.gadts.set("Either", eitherGadt);
  const leftType = {
    kind: "poly",
    quantifiers: ["l", "r"],
    type: {
      kind: "fun",
      params: [{ name: "left", type: freshTypeVar("l") }],
      returnType: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r")] }
    }
  };
  const rightType = {
    kind: "poly",
    quantifiers: ["l", "r"],
    type: {
      kind: "fun",
      params: [{ name: "right", type: freshTypeVar("r") }],
      returnType: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r")] }
    }
  };
  env2.vars.set("Left", leftType);
  env2.vars.set("Right", rightType);
  eitherEnv2.vars.set("Left", leftType);
  eitherEnv2.vars.set("Right", rightType);
  eitherEnv2.vars.set("left", leftType);
  eitherEnv2.vars.set("right", rightType);
  eitherEnv2.vars.set("pure", rightType);
  eitherEnv2.vars.set("of", rightType);
  eitherEnv2.vars.set("isLeft", {
    kind: "poly",
    quantifiers: ["l", "r"],
    type: {
      kind: "fun",
      params: [{ name: "e", type: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r")] } }],
      returnType: PRIM_BOOLEAN
    }
  });
  eitherEnv2.vars.set("isRight", {
    kind: "poly",
    quantifiers: ["l", "r"],
    type: {
      kind: "fun",
      params: [{ name: "e", type: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r")] } }],
      returnType: PRIM_BOOLEAN
    }
  });
  eitherEnv2.vars.set("getOrElse", {
    kind: "poly",
    quantifiers: ["l", "r"],
    type: {
      kind: "fun",
      params: [
        { name: "e", type: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r")] } },
        { name: "defaultVal", type: freshTypeVar("r") }
      ],
      returnType: freshTypeVar("r")
    }
  });
  eitherEnv2.vars.set("map", {
    kind: "poly",
    quantifiers: ["l", "r", "r2"],
    type: {
      kind: "fun",
      params: [
        { name: "e", type: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r")] } },
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("r") }], returnType: freshTypeVar("r2") } }
      ],
      returnType: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r2")] }
    }
  });
  eitherEnv2.vars.set("mapLeft", {
    kind: "poly",
    quantifiers: ["l", "r", "l2"],
    type: {
      kind: "fun",
      params: [
        { name: "e", type: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r")] } },
        { name: "fn", type: { kind: "fun", params: [{ name: "err", type: freshTypeVar("l") }], returnType: freshTypeVar("l2") } }
      ],
      returnType: { kind: "cons", name: "Either", args: [freshTypeVar("l2"), freshTypeVar("r")] }
    }
  });
  eitherEnv2.vars.set("flatMap", {
    kind: "poly",
    quantifiers: ["l", "r", "r2"],
    type: {
      kind: "fun",
      params: [
        { name: "e", type: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r")] } },
        {
          name: "fn",
          type: {
            kind: "fun",
            params: [{ name: "x", type: freshTypeVar("r") }],
            returnType: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r2")] }
          }
        }
      ],
      returnType: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r2")] }
    }
  });
  eitherEnv2.vars.set("fold", {
    kind: "poly",
    quantifiers: ["l", "r", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "e", type: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r")] } },
        { name: "onLeft", type: { kind: "fun", params: [{ name: "l", type: freshTypeVar("l") }], returnType: freshTypeVar("b") } },
        { name: "onRight", type: { kind: "fun", params: [{ name: "r", type: freshTypeVar("r") }], returnType: freshTypeVar("b") } }
      ],
      returnType: freshTypeVar("b")
    }
  });
  eitherEnv2.vars.set("swap", {
    kind: "poly",
    quantifiers: ["l", "r"],
    type: {
      kind: "fun",
      params: [{ name: "e", type: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r")] } }],
      returnType: { kind: "cons", name: "Either", args: [freshTypeVar("r"), freshTypeVar("l")] }
    }
  });
  eitherEnv2.vars.set("toOption", {
    kind: "poly",
    quantifiers: ["l", "r"],
    type: {
      kind: "fun",
      params: [{ name: "e", type: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r")] } }],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("r")] }
    }
  });
  eitherEnv2.vars.set("toResult", {
    kind: "poly",
    quantifiers: ["l", "r"],
    type: {
      kind: "fun",
      params: [{ name: "e", type: { kind: "cons", name: "Either", args: [freshTypeVar("l"), freshTypeVar("r")] } }],
      returnType: { kind: "cons", name: "Result", args: [freshTypeVar("r"), freshTypeVar("l")] }
    }
  });
  eitherEnv2.vars.set("fromResult", {
    kind: "poly",
    quantifiers: ["a", "e"],
    type: {
      kind: "fun",
      params: [{ name: "res", type: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] } }],
      returnType: { kind: "cons", name: "Either", args: [freshTypeVar("e"), freshTypeVar("a")] }
    }
  });
  for (const name of Array.from(eitherEnv2.vars.keys())) eitherEnv2.exports.add(name);
  env2.modules.set("Either", eitherEnv2);
  const readerEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  const readerPureType = {
    kind: "poly",
    quantifiers: ["r", "a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: { kind: "cons", name: "Reader", args: [freshTypeVar("r"), freshTypeVar("a")] }
    }
  };
  readerEnv2.vars.set("pure", readerPureType);
  readerEnv2.vars.set("of", readerPureType);
  readerEnv2.vars.set("ask", {
    kind: "poly",
    quantifiers: ["r"],
    type: {
      kind: "fun",
      params: [],
      returnType: { kind: "cons", name: "Reader", args: [freshTypeVar("r"), freshTypeVar("r")] }
    }
  });
  readerEnv2.vars.set("asks", {
    kind: "poly",
    quantifiers: ["r", "a"],
    type: {
      kind: "fun",
      params: [{ name: "fn", type: { kind: "fun", params: [{ name: "env", type: freshTypeVar("r") }], returnType: freshTypeVar("a") } }],
      returnType: { kind: "cons", name: "Reader", args: [freshTypeVar("r"), freshTypeVar("a")] }
    }
  });
  readerEnv2.vars.set("run", {
    kind: "poly",
    quantifiers: ["r", "a"],
    type: {
      kind: "fun",
      params: [
        { name: "reader", type: { kind: "cons", name: "Reader", args: [freshTypeVar("r"), freshTypeVar("a")] } },
        { name: "environment", type: freshTypeVar("r") }
      ],
      returnType: freshTypeVar("a")
    }
  });
  readerEnv2.vars.set("map", {
    kind: "poly",
    quantifiers: ["r", "a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "reader", type: { kind: "cons", name: "Reader", args: [freshTypeVar("r"), freshTypeVar("a")] } },
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }
      ],
      returnType: { kind: "cons", name: "Reader", args: [freshTypeVar("r"), freshTypeVar("b")] }
    }
  });
  readerEnv2.vars.set("flatMap", {
    kind: "poly",
    quantifiers: ["r", "a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "reader", type: { kind: "cons", name: "Reader", args: [freshTypeVar("r"), freshTypeVar("a")] } },
        {
          name: "fn",
          type: {
            kind: "fun",
            params: [{ name: "x", type: freshTypeVar("a") }],
            returnType: { kind: "cons", name: "Reader", args: [freshTypeVar("r"), freshTypeVar("b")] }
          }
        }
      ],
      returnType: { kind: "cons", name: "Reader", args: [freshTypeVar("r"), freshTypeVar("b")] }
    }
  });
  readerEnv2.vars.set("local", {
    kind: "poly",
    quantifiers: ["r", "r2", "a"],
    type: {
      kind: "fun",
      params: [
        { name: "reader", type: { kind: "cons", name: "Reader", args: [freshTypeVar("r"), freshTypeVar("a")] } },
        { name: "transformEnv", type: { kind: "fun", params: [{ name: "env", type: freshTypeVar("r2") }], returnType: freshTypeVar("r") } }
      ],
      returnType: { kind: "cons", name: "Reader", args: [freshTypeVar("r2"), freshTypeVar("a")] }
    }
  });
  for (const name of Array.from(readerEnv2.vars.keys())) readerEnv2.exports.add(name);
  env2.modules.set("Reader", readerEnv2);
  const writerEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  const writerPureType = {
    kind: "poly",
    quantifiers: ["w", "a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: { kind: "cons", name: "Writer", args: [freshTypeVar("w"), freshTypeVar("a")] }
    }
  };
  writerEnv2.vars.set("pure", writerPureType);
  writerEnv2.vars.set("of", writerPureType);
  writerEnv2.vars.set("tell", {
    kind: "poly",
    quantifiers: ["w"],
    type: {
      kind: "fun",
      params: [{ name: "entry", type: freshTypeVar("w") }],
      returnType: { kind: "cons", name: "Writer", args: [freshTypeVar("w"), PRIM_VOID] }
    }
  });
  writerEnv2.vars.set("run", {
    kind: "poly",
    quantifiers: ["w", "a"],
    type: {
      kind: "fun",
      params: [{ name: "writer", type: { kind: "cons", name: "Writer", args: [freshTypeVar("w"), freshTypeVar("a")] } }],
      returnType: { kind: "tup", elements: [freshTypeVar("a"), { kind: "tup", elements: [freshTypeVar("w")] }] }
    }
  });
  writerEnv2.vars.set("value", {
    kind: "poly",
    quantifiers: ["w", "a"],
    type: {
      kind: "fun",
      params: [{ name: "writer", type: { kind: "cons", name: "Writer", args: [freshTypeVar("w"), freshTypeVar("a")] } }],
      returnType: freshTypeVar("a")
    }
  });
  writerEnv2.vars.set("log", {
    kind: "poly",
    quantifiers: ["w", "a"],
    type: {
      kind: "fun",
      params: [{ name: "writer", type: { kind: "cons", name: "Writer", args: [freshTypeVar("w"), freshTypeVar("a")] } }],
      returnType: { kind: "tup", elements: [freshTypeVar("w")] }
    }
  });
  writerEnv2.vars.set("map", {
    kind: "poly",
    quantifiers: ["w", "a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "writer", type: { kind: "cons", name: "Writer", args: [freshTypeVar("w"), freshTypeVar("a")] } },
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }
      ],
      returnType: { kind: "cons", name: "Writer", args: [freshTypeVar("w"), freshTypeVar("b")] }
    }
  });
  writerEnv2.vars.set("flatMap", {
    kind: "poly",
    quantifiers: ["w", "a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "writer", type: { kind: "cons", name: "Writer", args: [freshTypeVar("w"), freshTypeVar("a")] } },
        {
          name: "fn",
          type: {
            kind: "fun",
            params: [{ name: "x", type: freshTypeVar("a") }],
            returnType: { kind: "cons", name: "Writer", args: [freshTypeVar("w"), freshTypeVar("b")] }
          }
        }
      ],
      returnType: { kind: "cons", name: "Writer", args: [freshTypeVar("w"), freshTypeVar("b")] }
    }
  });
  writerEnv2.vars.set("listen", {
    kind: "poly",
    quantifiers: ["w", "a"],
    type: {
      kind: "fun",
      params: [{ name: "writer", type: { kind: "cons", name: "Writer", args: [freshTypeVar("w"), freshTypeVar("a")] } }],
      returnType: { kind: "cons", name: "Writer", args: [freshTypeVar("w"), { kind: "tup", elements: [freshTypeVar("a"), { kind: "tup", elements: [freshTypeVar("w")] }] }] }
    }
  });
  for (const name of Array.from(writerEnv2.vars.keys())) writerEnv2.exports.add(name);
  env2.modules.set("Writer", writerEnv2);
  const taskEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  const taskPureType = {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: { kind: "cons", name: "Task", args: [freshTypeVar("a")] }
    }
  };
  taskEnv2.vars.set("pure", taskPureType);
  taskEnv2.vars.set("of", taskPureType);
  taskEnv2.vars.set("succeed", taskPureType);
  taskEnv2.vars.set("delay", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "fn", type: { kind: "fun", params: [], returnType: freshTypeVar("a") } }],
      returnType: { kind: "cons", name: "Task", args: [freshTypeVar("a")] }
    }
  });
  taskEnv2.vars.set("run", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "task", type: { kind: "cons", name: "Task", args: [freshTypeVar("a")] } }],
      returnType: freshTypeVar("a")
    }
  });
  taskEnv2.vars.set("map", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "task", type: { kind: "cons", name: "Task", args: [freshTypeVar("a")] } },
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }
      ],
      returnType: { kind: "cons", name: "Task", args: [freshTypeVar("b")] }
    }
  });
  taskEnv2.vars.set("flatMap", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "task", type: { kind: "cons", name: "Task", args: [freshTypeVar("a")] } },
        {
          name: "fn",
          type: {
            kind: "fun",
            params: [{ name: "x", type: freshTypeVar("a") }],
            returnType: { kind: "cons", name: "Task", args: [freshTypeVar("b")] }
          }
        }
      ],
      returnType: { kind: "cons", name: "Task", args: [freshTypeVar("b")] }
    }
  });
  for (const name of Array.from(taskEnv2.vars.keys())) taskEnv2.exports.add(name);
  env2.modules.set("Task", taskEnv2);
  const ioEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  const ioPureType = {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: { kind: "cons", name: "IO", args: [freshTypeVar("a")] }
    }
  };
  ioEnv2.vars.set("pure", ioPureType);
  ioEnv2.vars.set("of", ioPureType);
  ioEnv2.vars.set("flatMap", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "io", type: { kind: "cons", name: "IO", args: [freshTypeVar("a")] } },
        {
          name: "fn",
          type: {
            kind: "fun",
            params: [{ name: "x", type: freshTypeVar("a") }],
            returnType: { kind: "cons", name: "IO", args: [freshTypeVar("b")] }
          }
        }
      ],
      returnType: { kind: "cons", name: "IO", args: [freshTypeVar("b")] }
    }
  });
  ioEnv2.vars.set("map", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "io", type: { kind: "cons", name: "IO", args: [freshTypeVar("a")] } },
        {
          name: "fn",
          type: {
            kind: "fun",
            params: [{ name: "x", type: freshTypeVar("a") }],
            returnType: freshTypeVar("b")
          }
        }
      ],
      returnType: { kind: "cons", name: "IO", args: [freshTypeVar("b")] }
    }
  });
  ioEnv2.vars.set("run", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "io", type: { kind: "cons", name: "IO", args: [freshTypeVar("a")] } }],
      returnType: freshTypeVar("a")
    }
  });
  ioEnv2.vars.set("delay", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "fn", type: { kind: "fun", params: [], returnType: freshTypeVar("a") } }],
      returnType: { kind: "cons", name: "IO", args: [freshTypeVar("a")] }
    }
  });
  ioEnv2.vars.set("println", {
    kind: "fun",
    params: [{ name: "msg", type: PRIM_STRING }],
    returnType: { kind: "cons", name: "IO", args: [PRIM_VOID] }
  });
  for (const name of Array.from(ioEnv2.vars.keys())) ioEnv2.exports.add(name);
  env2.modules.set("IO", ioEnv2);
  const stateEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  const statePureType = {
    kind: "poly",
    quantifiers: ["s", "a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: { kind: "cons", name: "State", args: [freshTypeVar("s"), freshTypeVar("a")] }
    }
  };
  stateEnv2.vars.set("pure", statePureType);
  stateEnv2.vars.set("of", statePureType);
  stateEnv2.vars.set("get", {
    kind: "poly",
    quantifiers: ["s"],
    type: {
      kind: "fun",
      params: [],
      returnType: { kind: "cons", name: "State", args: [freshTypeVar("s"), freshTypeVar("s")] }
    }
  });
  stateEnv2.vars.set("set", {
    kind: "poly",
    quantifiers: ["s"],
    type: {
      kind: "fun",
      params: [{ name: "newState", type: freshTypeVar("s") }],
      returnType: { kind: "cons", name: "State", args: [freshTypeVar("s"), PRIM_VOID] }
    }
  });
  stateEnv2.vars.set("modify", {
    kind: "poly",
    quantifiers: ["s"],
    type: {
      kind: "fun",
      params: [{ name: "fn", type: { kind: "fun", params: [{ name: "s", type: freshTypeVar("s") }], returnType: freshTypeVar("s") } }],
      returnType: { kind: "cons", name: "State", args: [freshTypeVar("s"), PRIM_VOID] }
    }
  });
  stateEnv2.vars.set("run", {
    kind: "poly",
    quantifiers: ["s", "a"],
    type: {
      kind: "fun",
      params: [
        { name: "st", type: { kind: "cons", name: "State", args: [freshTypeVar("s"), freshTypeVar("a")] } },
        { name: "initialState", type: freshTypeVar("s") }
      ],
      returnType: { kind: "tup", elements: [freshTypeVar("a"), freshTypeVar("s")] }
    }
  });
  stateEnv2.vars.set("evalState", {
    kind: "poly",
    quantifiers: ["s", "a"],
    type: {
      kind: "fun",
      params: [
        { name: "st", type: { kind: "cons", name: "State", args: [freshTypeVar("s"), freshTypeVar("a")] } },
        { name: "initialState", type: freshTypeVar("s") }
      ],
      returnType: freshTypeVar("a")
    }
  });
  stateEnv2.vars.set("execState", {
    kind: "poly",
    quantifiers: ["s", "a"],
    type: {
      kind: "fun",
      params: [
        { name: "st", type: { kind: "cons", name: "State", args: [freshTypeVar("s"), freshTypeVar("a")] } },
        { name: "initialState", type: freshTypeVar("s") }
      ],
      returnType: freshTypeVar("s")
    }
  });
  stateEnv2.vars.set("map", {
    kind: "poly",
    quantifiers: ["s", "a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "st", type: { kind: "cons", name: "State", args: [freshTypeVar("s"), freshTypeVar("a")] } },
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }
      ],
      returnType: { kind: "cons", name: "State", args: [freshTypeVar("s"), freshTypeVar("b")] }
    }
  });
  stateEnv2.vars.set("flatMap", {
    kind: "poly",
    quantifiers: ["s", "a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "st", type: { kind: "cons", name: "State", args: [freshTypeVar("s"), freshTypeVar("a")] } },
        {
          name: "fn",
          type: {
            kind: "fun",
            params: [{ name: "x", type: freshTypeVar("a") }],
            returnType: { kind: "cons", name: "State", args: [freshTypeVar("s"), freshTypeVar("b")] }
          }
        }
      ],
      returnType: { kind: "cons", name: "State", args: [freshTypeVar("s"), freshTypeVar("b")] }
    }
  });
  for (const name of Array.from(stateEnv2.vars.keys())) stateEnv2.exports.add(name);
  env2.modules.set("State", stateEnv2);
  const setoidEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  const setoidPoly = {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [{ name: "a", type: freshTypeVar("a") }, { name: "b", type: freshTypeVar("b") }],
      returnType: PRIM_BOOLEAN
    }
  };
  setoidEnv2.vars.set("equals", setoidPoly);
  setoidEnv2.vars.set("notEquals", setoidPoly);
  setoidEnv2.vars.set("fromEquals", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "eqFn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }, { name: "y", type: freshTypeVar("a") }], returnType: PRIM_BOOLEAN } }],
      returnType: freshTypeVar("a")
    }
  });
  setoidEnv2.vars.set("contramap", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [{ name: "setoid", type: freshTypeVar("b") }, { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }],
      returnType: freshTypeVar("a")
    }
  });
  for (const name of Array.from(setoidEnv2.vars.keys())) setoidEnv2.exports.add(name);
  env2.modules.set("Setoid", setoidEnv2);
  const ordEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  ordEnv2.vars.set("Less", { kind: "cons", name: "Ordering", args: [] });
  ordEnv2.vars.set("Equal", { kind: "cons", name: "Ordering", args: [] });
  ordEnv2.vars.set("Greater", { kind: "cons", name: "Ordering", args: [] });
  ordEnv2.vars.set("compare", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "a", type: freshTypeVar("a") }, { name: "b", type: freshTypeVar("a") }],
      returnType: { kind: "cons", name: "Ordering", args: [] }
    }
  });
  ordEnv2.vars.set("min", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "a", type: freshTypeVar("a") }, { name: "b", type: freshTypeVar("a") }],
      returnType: freshTypeVar("a")
    }
  });
  ordEnv2.vars.set("max", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "a", type: freshTypeVar("a") }, { name: "b", type: freshTypeVar("a") }],
      returnType: freshTypeVar("a")
    }
  });
  ordEnv2.vars.set("clamp", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }, { name: "minVal", type: freshTypeVar("a") }, { name: "maxVal", type: freshTypeVar("a") }],
      returnType: freshTypeVar("a")
    }
  });
  ordEnv2.vars.set("between", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }, { name: "minVal", type: freshTypeVar("a") }, { name: "maxVal", type: freshTypeVar("a") }],
      returnType: PRIM_BOOLEAN
    }
  });
  ordEnv2.vars.set("isLess", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "a", type: freshTypeVar("a") }, { name: "b", type: freshTypeVar("a") }],
      returnType: PRIM_BOOLEAN
    }
  });
  ordEnv2.vars.set("isGreater", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "a", type: freshTypeVar("a") }, { name: "b", type: freshTypeVar("a") }],
      returnType: PRIM_BOOLEAN
    }
  });
  ordEnv2.vars.set("isEqual", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "a", type: freshTypeVar("a") }, { name: "b", type: freshTypeVar("a") }],
      returnType: PRIM_BOOLEAN
    }
  });
  ordEnv2.vars.set("fromCompare", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "cmpFn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }, { name: "y", type: freshTypeVar("a") }], returnType: { kind: "cons", name: "Ordering", args: [] } } }],
      returnType: freshTypeVar("a")
    }
  });
  ordEnv2.vars.set("contramap", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [{ name: "ordB", type: freshTypeVar("b") }, { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }],
      returnType: freshTypeVar("a")
    }
  });
  ordEnv2.vars.set("reverse", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "ord", type: freshTypeVar("a") }],
      returnType: freshTypeVar("a")
    }
  });
  for (const name of Array.from(ordEnv2.vars.keys())) ordEnv2.exports.add(name);
  env2.modules.set("Ord", ordEnv2);
  const semigroupEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  semigroupEnv2.vars.set("combine", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "a", type: freshTypeVar("a") }, { name: "b", type: freshTypeVar("a") }],
      returnType: freshTypeVar("a")
    }
  });
  semigroupEnv2.vars.set("concatAll", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "list", type: { kind: "tup", elements: [freshTypeVar("a")] } }, { name: "fallback", type: freshTypeVar("a") }],
      returnType: freshTypeVar("a")
    }
  });
  semigroupEnv2.vars.set("first", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [],
      returnType: freshTypeVar("a")
    }
  });
  semigroupEnv2.vars.set("last", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [],
      returnType: freshTypeVar("a")
    }
  });
  semigroupEnv2.vars.set("struct", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "semigroups", type: freshTypeVar("a") }],
      returnType: freshTypeVar("a")
    }
  });
  semigroupEnv2.vars.set("dual", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "semigroup", type: freshTypeVar("a") }],
      returnType: freshTypeVar("a")
    }
  });
  for (const name of Array.from(semigroupEnv2.vars.keys())) semigroupEnv2.exports.add(name);
  env2.modules.set("Semigroup", semigroupEnv2);
  env2.modules.set("SemiGroup", semigroupEnv2);
  const monoidEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  monoidEnv2.vars.set("empty", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "typeOrName", type: PRIM_STRING }],
      returnType: freshTypeVar("a")
    }
  });
  monoidEnv2.vars.set("combine", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "a", type: freshTypeVar("a") }, { name: "b", type: freshTypeVar("a") }],
      returnType: freshTypeVar("a")
    }
  });
  monoidEnv2.vars.set("concatAll", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "list", type: { kind: "tup", elements: [freshTypeVar("a")] } }, { name: "identity", type: freshTypeVar("a") }],
      returnType: freshTypeVar("a")
    }
  });
  monoidEnv2.vars.set("Sum", freshTypeVar("a"));
  monoidEnv2.vars.set("Product", freshTypeVar("a"));
  monoidEnv2.vars.set("String", freshTypeVar("a"));
  monoidEnv2.vars.set("Array", freshTypeVar("a"));
  monoidEnv2.vars.set("All", freshTypeVar("a"));
  monoidEnv2.vars.set("Any", freshTypeVar("a"));
  monoidEnv2.vars.set("struct", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "monoids", type: freshTypeVar("a") }],
      returnType: freshTypeVar("a")
    }
  });
  for (const name of Array.from(monoidEnv2.vars.keys())) monoidEnv2.exports.add(name);
  env2.modules.set("Monoid", monoidEnv2);
  const groupEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  groupEnv2.vars.set("invert", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "a", type: freshTypeVar("a") }],
      returnType: freshTypeVar("a")
    }
  });
  groupEnv2.vars.set("subtract", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "a", type: freshTypeVar("a") }, { name: "b", type: freshTypeVar("a") }],
      returnType: freshTypeVar("a")
    }
  });
  groupEnv2.vars.set("SumNumber", freshTypeVar("a"));
  groupEnv2.vars.set("ProductNonZero", freshTypeVar("a"));
  for (const name of Array.from(groupEnv2.vars.keys())) groupEnv2.exports.add(name);
  env2.modules.set("Group", groupEnv2);
  const functorEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  functorEnv2.vars.set("map", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "fa", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }
      ],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("b")] }
    }
  });
  functorEnv2.vars.set("lift", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [{ name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }],
      returnType: { kind: "fun", params: [{ name: "fa", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } }], returnType: { kind: "cons", name: "Option", args: [freshTypeVar("b")] } }
    }
  });
  functorEnv2.vars.set("as", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [{ name: "fa", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } }, { name: "val", type: freshTypeVar("b") }],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("b")] }
    }
  });
  functorEnv2.vars.set("voidRight", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "fa", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } }],
      returnType: { kind: "cons", name: "Option", args: [PRIM_STRING] }
    }
  });
  functorEnv2.vars.set("flap", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [{ name: "fab", type: freshTypeVar("a") }, { name: "a", type: freshTypeVar("b") }],
      returnType: freshTypeVar("a")
    }
  });
  for (const name of Array.from(functorEnv2.vars.keys())) functorEnv2.exports.add(name);
  env2.modules.set("Functor", functorEnv2);
  const contravariantEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  contravariantEnv2.vars.set("contramap", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [{ name: "fa", type: { kind: "fun", params: [{ name: "y", type: freshTypeVar("b") }], returnType: PRIM_BOOLEAN } }, { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }],
      returnType: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: PRIM_BOOLEAN }
    }
  });
  contravariantEnv2.vars.set("cmap", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [{ name: "fa", type: { kind: "fun", params: [{ name: "y", type: freshTypeVar("b") }], returnType: PRIM_BOOLEAN } }, { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }],
      returnType: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: PRIM_BOOLEAN }
    }
  });
  contravariantEnv2.vars.set("predicate", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "pred", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: PRIM_BOOLEAN } }],
      returnType: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: PRIM_BOOLEAN }
    }
  });
  for (const name of Array.from(contravariantEnv2.vars.keys())) contravariantEnv2.exports.add(name);
  env2.modules.set("Contravariant", contravariantEnv2);
  const applicativeEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  applicativeEnv2.vars.set("pure", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("a")] }
    }
  });
  applicativeEnv2.vars.set("ap", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "ff", type: { kind: "cons", name: "Option", args: [{ kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") }] } },
        { name: "fa", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } }
      ],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("b")] }
    }
  });
  applicativeEnv2.vars.set("lift2", {
    kind: "poly",
    quantifiers: ["a", "b", "c"],
    type: {
      kind: "fun",
      params: [
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }, { name: "y", type: freshTypeVar("b") }], returnType: freshTypeVar("c") } },
        { name: "fa", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        { name: "fb", type: { kind: "cons", name: "Option", args: [freshTypeVar("b")] } }
      ],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("c")] }
    }
  });
  applicativeEnv2.vars.set("lift3", {
    kind: "poly",
    quantifiers: ["a", "b", "c", "d"],
    type: {
      kind: "fun",
      params: [
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }, { name: "y", type: freshTypeVar("b") }, { name: "z", type: freshTypeVar("c") }], returnType: freshTypeVar("d") } },
        { name: "fa", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        { name: "fb", type: { kind: "cons", name: "Option", args: [freshTypeVar("b")] } },
        { name: "fc", type: { kind: "cons", name: "Option", args: [freshTypeVar("c")] } }
      ],
      returnType: { kind: "cons", name: "Option", args: [freshTypeVar("d")] }
    }
  });
  applicativeEnv2.vars.set("zip", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "fa", type: { kind: "cons", name: "Option", args: [freshTypeVar("a")] } },
        { name: "fb", type: { kind: "cons", name: "Option", args: [freshTypeVar("b")] } }
      ],
      returnType: { kind: "cons", name: "Option", args: [{ kind: "tup", elements: [freshTypeVar("a"), freshTypeVar("b")] }] }
    }
  });
  for (const name of Array.from(applicativeEnv2.vars.keys())) applicativeEnv2.exports.add(name);
  env2.modules.set("Applicative", applicativeEnv2);
  const validationEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  validationEnv2.vars.set("Valid", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: { kind: "cons", name: "Validation", args: [freshTypeVar("a")] }
    }
  });
  validationEnv2.vars.set("Invalid", {
    kind: "poly",
    quantifiers: ["e"],
    type: {
      kind: "fun",
      params: [{ name: "errs", type: { kind: "tup", elements: [freshTypeVar("e")] } }],
      returnType: { kind: "cons", name: "Validation", args: [freshTypeVar("e")] }
    }
  });
  validationEnv2.vars.set("pure", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: { kind: "cons", name: "Validation", args: [freshTypeVar("a")] }
    }
  });
  validationEnv2.vars.set("invalid", {
    kind: "poly",
    quantifiers: ["e"],
    type: {
      kind: "fun",
      params: [{ name: "err", type: freshTypeVar("e") }],
      returnType: { kind: "cons", name: "Validation", args: [freshTypeVar("e")] }
    }
  });
  validationEnv2.vars.set("isValid", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "v", type: { kind: "cons", name: "Validation", args: [freshTypeVar("a")] } }],
      returnType: PRIM_BOOLEAN
    }
  });
  validationEnv2.vars.set("isInvalid", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "v", type: { kind: "cons", name: "Validation", args: [freshTypeVar("a")] } }],
      returnType: PRIM_BOOLEAN
    }
  });
  validationEnv2.vars.set("map", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "v", type: { kind: "cons", name: "Validation", args: [freshTypeVar("a")] } },
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }
      ],
      returnType: { kind: "cons", name: "Validation", args: [freshTypeVar("b")] }
    }
  });
  validationEnv2.vars.set("ap", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "vf", type: { kind: "cons", name: "Validation", args: [{ kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") }] } },
        { name: "va", type: { kind: "cons", name: "Validation", args: [freshTypeVar("a")] } }
      ],
      returnType: { kind: "cons", name: "Validation", args: [freshTypeVar("b")] }
    }
  });
  validationEnv2.vars.set("accumulate", {
    kind: "poly",
    quantifiers: ["a", "b", "c"],
    type: {
      kind: "fun",
      params: [
        { name: "v1", type: { kind: "cons", name: "Validation", args: [freshTypeVar("a")] } },
        { name: "v2", type: { kind: "cons", name: "Validation", args: [freshTypeVar("b")] } },
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }, { name: "y", type: freshTypeVar("b") }], returnType: freshTypeVar("c") } }
      ],
      returnType: { kind: "cons", name: "Validation", args: [freshTypeVar("c")] }
    }
  });
  validationEnv2.vars.set("getOrElse", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "v", type: { kind: "cons", name: "Validation", args: [freshTypeVar("a")] } }, { name: "defaultVal", type: freshTypeVar("a") }],
      returnType: freshTypeVar("a")
    }
  });
  validationEnv2.vars.set("toResult", {
    kind: "poly",
    quantifiers: ["a", "e"],
    type: {
      kind: "fun",
      params: [{ name: "v", type: { kind: "cons", name: "Validation", args: [freshTypeVar("a")] } }],
      returnType: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("e")] }
    }
  });
  for (const name of Array.from(validationEnv2.vars.keys())) validationEnv2.exports.add(name);
  env2.modules.set("Validation", validationEnv2);
  const bifunctorEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  bifunctorEnv2.vars.set("bimap", {
    kind: "poly",
    quantifiers: ["a", "b", "c", "d"],
    type: {
      kind: "fun",
      params: [
        { name: "fab", type: { kind: "cons", name: "Result", args: [freshTypeVar("a"), freshTypeVar("b")] } },
        { name: "f", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("b") }], returnType: freshTypeVar("d") } },
        { name: "g", type: { kind: "fun", params: [{ name: "y", type: freshTypeVar("a") }], returnType: freshTypeVar("c") } }
      ],
      returnType: { kind: "cons", name: "Result", args: [freshTypeVar("c"), freshTypeVar("d")] }
    }
  });
  for (const name of Array.from(bifunctorEnv2.vars.keys())) bifunctorEnv2.exports.add(name);
  env2.modules.set("Bifunctor", bifunctorEnv2);
  const profunctorEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  const profunctorDimap = {
    kind: "poly",
    quantifiers: ["a", "b", "c", "d"],
    type: {
      kind: "fun",
      params: [
        { name: "pab", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } },
        { name: "f", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("c") }], returnType: freshTypeVar("a") } },
        { name: "g", type: { kind: "fun", params: [{ name: "y", type: freshTypeVar("b") }], returnType: freshTypeVar("d") } }
      ],
      returnType: { kind: "fun", params: [{ name: "x", type: freshTypeVar("c") }], returnType: freshTypeVar("d") }
    }
  };
  profunctorEnv2.vars.set("dimap", profunctorDimap);
  profunctorEnv2.vars.set("promap", profunctorDimap);
  for (const name of Array.from(profunctorEnv2.vars.keys())) profunctorEnv2.exports.add(name);
  env2.modules.set("Profunctor", profunctorEnv2);
  const foldableEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  foldableEnv2.vars.set("foldLeft", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "fa", type: { kind: "tup", elements: [freshTypeVar("a")] } },
        { name: "initial", type: freshTypeVar("b") },
        { name: "fn", type: { kind: "fun", params: [{ name: "acc", type: freshTypeVar("b") }, { name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("b") } }
      ],
      returnType: freshTypeVar("b")
    }
  });
  foldableEnv2.vars.set("foldMap", {
    kind: "poly",
    quantifiers: ["a", "m"],
    type: {
      kind: "fun",
      params: [
        { name: "fa", type: { kind: "tup", elements: [freshTypeVar("a")] } },
        { name: "monoid", type: freshTypeVar("m") },
        { name: "fn", type: { kind: "fun", params: [{ name: "x", type: freshTypeVar("a") }], returnType: freshTypeVar("m") } }
      ],
      returnType: freshTypeVar("m")
    }
  });
  for (const name of Array.from(foldableEnv2.vars.keys())) foldableEnv2.exports.add(name);
  env2.modules.set("Foldable", foldableEnv2);
  const domEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  domEnv2.vars.set("getElementById", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "id", type: PRIM_STRING }],
      returnType: freshTypeVar("a")
    }
  });
  domEnv2.vars.set("createElement", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "tag", type: PRIM_STRING }],
      returnType: freshTypeVar("a")
    }
  });
  domEnv2.vars.set("setText", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [
        { name: "el", type: freshTypeVar("a") },
        { name: "text", type: PRIM_STRING }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("getValue", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "el", type: freshTypeVar("a") }],
      returnType: PRIM_STRING
    }
  });
  domEnv2.vars.set("setValue", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [
        { name: "el", type: freshTypeVar("a") },
        { name: "val", type: PRIM_STRING }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("focus", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "el", type: freshTypeVar("a") }],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("blur", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "el", type: freshTypeVar("a") }],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("setHtml", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [
        { name: "el", type: freshTypeVar("a") },
        { name: "html", type: PRIM_STRING }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("setAttr", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [
        { name: "el", type: freshTypeVar("a") },
        { name: "attr", type: PRIM_STRING },
        { name: "val", type: PRIM_STRING }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("appendChild", {
    kind: "poly",
    quantifiers: ["a", "b"],
    type: {
      kind: "fun",
      params: [
        { name: "parent", type: freshTypeVar("a") },
        { name: "child", type: freshTypeVar("b") }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("addEventListener", {
    kind: "poly",
    quantifiers: ["a", "e"],
    type: {
      kind: "fun",
      params: [
        { name: "el", type: freshTypeVar("a") },
        { name: "evt", type: PRIM_STRING },
        { name: "handler", type: { kind: "fun", params: [{ name: "e", type: freshTypeVar("e") }], returnType: PRIM_VOID } }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("h", {
    kind: "poly",
    quantifiers: ["p", "c", "v"],
    type: {
      kind: "fun",
      params: [
        { name: "tag", type: PRIM_STRING },
        { name: "props", type: freshTypeVar("p") },
        { name: "children", type: freshTypeVar("c") }
      ],
      returnType: freshTypeVar("v")
    }
  });
  domEnv2.vars.set("mount", {
    kind: "poly",
    quantifiers: ["c", "v"],
    type: {
      kind: "fun",
      params: [
        { name: "containerId", type: freshTypeVar("c") },
        { name: "vnode", type: freshTypeVar("v") }
      ],
      returnType: PRIM_VOID
    }
  });
  env2.vars.set("requestAnimationFrame", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "callback", type: { kind: "fun", params: [], returnType: PRIM_VOID } }
      ],
      returnType: PRIM_VOID
    }
  });
  env2.vars.set("setInterval", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "callback", type: { kind: "fun", params: [], returnType: PRIM_VOID } },
        { name: "ms", type: PRIM_NUMBER }
      ],
      returnType: PRIM_NUMBER
    }
  });
  env2.vars.set("clearInterval", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "handle", type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });
  env2.vars.set("setTimeout", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "callback", type: { kind: "fun", params: [], returnType: PRIM_VOID } },
        { name: "ms", type: PRIM_NUMBER }
      ],
      returnType: PRIM_NUMBER
    }
  });
  env2.vars.set("clearTimeout", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "handle", type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("eval", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "code", type: PRIM_STRING }],
      returnType: freshTypeVar("a")
    }
  });
  domEnv2.vars.set("log", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "val", type: freshTypeVar("a") }],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("initAudio", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("playCustomTone", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "freq", type: PRIM_NUMBER },
        { name: "waveType", type: PRIM_STRING },
        { name: "duration", type: PRIM_NUMBER },
        { name: "volume", type: PRIM_NUMBER },
        { name: "attack", type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("playNoise", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "duration", type: PRIM_NUMBER },
        { name: "volume", type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("playTone", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "freq", type: PRIM_NUMBER },
        { name: "duration", type: PRIM_NUMBER },
        { name: "waveType", type: PRIM_STRING },
        { name: "volume", type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("playRamp", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "startFreq", type: PRIM_NUMBER },
        { name: "endFreq", type: PRIM_NUMBER },
        { name: "duration", type: PRIM_NUMBER },
        { name: "waveType", type: PRIM_STRING },
        { name: "volume", type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("playSequence", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "notes", type: { kind: "tup", elements: [PRIM_NUMBER] } },
        { name: "noteDuration", type: PRIM_NUMBER },
        { name: "waveType", type: PRIM_STRING },
        { name: "volume", type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("startMusic", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "id", type: PRIM_STRING },
        { name: "notes", type: { kind: "tup", elements: [PRIM_NUMBER] } },
        { name: "intervalMs", type: PRIM_NUMBER },
        { name: "waveType", type: PRIM_STRING },
        { name: "volume", type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("stopMusic", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [{ name: "id", type: PRIM_STRING }],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("resumeAudio", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("confetti", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "count", type: PRIM_NUMBER },
        { name: "spread", type: PRIM_NUMBER },
        { name: "originY", type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("setInterval", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "callback", type: { kind: "fun", params: [], returnType: PRIM_VOID } },
        { name: "ms", type: PRIM_NUMBER }
      ],
      returnType: PRIM_NUMBER
    }
  });
  domEnv2.vars.set("clearInterval", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [{ name: "handle", type: PRIM_NUMBER }],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("setTimeout", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "callback", type: { kind: "fun", params: [], returnType: PRIM_VOID } },
        { name: "ms", type: PRIM_NUMBER }
      ],
      returnType: PRIM_NUMBER
    }
  });
  domEnv2.vars.set("clearTimeout", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [{ name: "handle", type: PRIM_NUMBER }],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("requestAnimationFrame", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "callback", type: { kind: "fun", params: [], returnType: PRIM_VOID } }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("storageGet", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [{ name: "key", type: PRIM_STRING }],
      returnType: PRIM_STRING
    }
  });
  domEnv2.vars.set("storageSet", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [
        { name: "key", type: PRIM_STRING },
        { name: "val", type: PRIM_STRING }
      ],
      returnType: PRIM_VOID
    }
  });
  domEnv2.vars.set("storageRemove", {
    kind: "poly",
    quantifiers: [],
    type: {
      kind: "fun",
      params: [{ name: "key", type: PRIM_STRING }],
      returnType: PRIM_VOID
    }
  });
  for (const name of Array.from(domEnv2.vars.keys())) domEnv2.exports.add(name);
  env2.modules.set("DOM", domEnv2);
  const nodeEnv2 = {
    vars: /* @__PURE__ */ new Map(),
    mutVars: /* @__PURE__ */ new Set(),
    gadts: /* @__PURE__ */ new Map(),
    typeAliases: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  nodeEnv2.vars.set("stringify", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "data", type: freshTypeVar("a") }],
      returnType: PRIM_STRING
    }
  });
  nodeEnv2.vars.set("parse", {
    kind: "poly",
    quantifiers: ["a"],
    type: {
      kind: "fun",
      params: [{ name: "jsonStr", type: PRIM_STRING }],
      returnType: freshTypeVar("a")
    }
  });
  nodeEnv2.vars.set("envGet", {
    kind: "fun",
    params: [{ name: "key", type: PRIM_STRING }],
    returnType: PRIM_STRING
  });
  nodeEnv2.vars.set("readFile", {
    kind: "fun",
    params: [{ name: "path", type: PRIM_STRING }],
    returnType: PRIM_STRING
  });
  nodeEnv2.vars.set("writeFile", {
    kind: "fun",
    params: [
      { name: "path", type: PRIM_STRING },
      { name: "content", type: PRIM_STRING }
    ],
    returnType: PRIM_VOID
  });
  nodeEnv2.vars.set("createApp", {
    kind: "poly",
    quantifiers: ["app"],
    type: {
      kind: "fun",
      params: [],
      returnType: freshTypeVar("app")
    }
  });
  nodeEnv2.vars.set("get", {
    kind: "poly",
    quantifiers: ["app", "req", "res"],
    type: {
      kind: "fun",
      params: [
        { name: "app", type: freshTypeVar("app") },
        { name: "path", type: PRIM_STRING },
        {
          name: "handler",
          type: {
            kind: "fun",
            params: [
              { name: "req", type: freshTypeVar("req") },
              { name: "res", type: freshTypeVar("res") }
            ],
            returnType: PRIM_VOID
          }
        }
      ],
      returnType: PRIM_VOID
    }
  });
  nodeEnv2.vars.set("post", {
    kind: "poly",
    quantifiers: ["app", "req", "res"],
    type: {
      kind: "fun",
      params: [
        { name: "app", type: freshTypeVar("app") },
        { name: "path", type: PRIM_STRING },
        {
          name: "handler",
          type: {
            kind: "fun",
            params: [
              { name: "req", type: freshTypeVar("req") },
              { name: "res", type: freshTypeVar("res") }
            ],
            returnType: PRIM_VOID
          }
        }
      ],
      returnType: PRIM_VOID
    }
  });
  nodeEnv2.vars.set("use", {
    kind: "poly",
    quantifiers: ["app", "req", "res"],
    type: {
      kind: "fun",
      params: [
        { name: "app", type: freshTypeVar("app") },
        {
          name: "middleware",
          type: {
            kind: "fun",
            params: [
              { name: "req", type: freshTypeVar("req") },
              { name: "res", type: freshTypeVar("res") },
              { name: "next", type: { kind: "fun", params: [], returnType: PRIM_VOID } }
            ],
            returnType: PRIM_VOID
          }
        }
      ],
      returnType: PRIM_VOID
    }
  });
  nodeEnv2.vars.set("listen", {
    kind: "poly",
    quantifiers: ["app", "server"],
    type: {
      kind: "fun",
      params: [
        { name: "app", type: freshTypeVar("app") },
        { name: "port", type: PRIM_NUMBER },
        {
          name: "callback",
          type: { kind: "fun", params: [], returnType: PRIM_VOID }
        }
      ],
      returnType: freshTypeVar("server")
    }
  });
  nodeEnv2.vars.set("send", {
    kind: "poly",
    quantifiers: ["res"],
    type: {
      kind: "fun",
      params: [
        { name: "res", type: freshTypeVar("res") },
        { name: "body", type: PRIM_STRING }
      ],
      returnType: PRIM_VOID
    }
  });
  nodeEnv2.vars.set("json", {
    kind: "poly",
    quantifiers: ["res", "data"],
    type: {
      kind: "fun",
      params: [
        { name: "res", type: freshTypeVar("res") },
        { name: "data", type: freshTypeVar("data") }
      ],
      returnType: PRIM_VOID
    }
  });
  nodeEnv2.vars.set("status", {
    kind: "poly",
    quantifiers: ["res"],
    type: {
      kind: "fun",
      params: [
        { name: "res", type: freshTypeVar("res") },
        { name: "statusCode", type: PRIM_NUMBER }
      ],
      returnType: freshTypeVar("res")
    }
  });
  nodeEnv2.vars.set("now", {
    kind: "fun",
    params: [],
    returnType: PRIM_NUMBER
  });
  for (const name of Array.from(nodeEnv2.vars.keys())) nodeEnv2.exports.add(name);
  env2.modules.set("Node", nodeEnv2);
  for (const [name] of env2.vars) {
    const doc = getRootBuiltinDoc(name);
    if (doc) env2.docs?.set(name, doc);
  }
  for (const [moduleName, moduleEnv] of env2.modules) {
    moduleEnv.docs = /* @__PURE__ */ new Map();
    moduleEnv.moduleDoc = getStdLibModuleDoc(moduleName);
    for (const [memberName, memberType] of moduleEnv.vars) {
      const callableType = memberType.kind === "poly" ? memberType.type : memberType;
      const parameterNames = callableType.kind === "fun" ? callableType.params.map((param, index) => param.name || `arg${index + 1}`) : [];
      const returnType = callableType.kind === "fun" ? typeToString(callableType.returnType) : void 0;
      const doc = getStdLibMemberDoc(moduleName, memberName, parameterNames, returnType);
      if (doc) {
        moduleEnv.docs.set(memberName, doc);
      }
    }
  }
  return env2;
}
var TypeChecker = class {
  constructor(options = {}) {
    this.diagnostics = [];
    this.symbols = [];
    this.recursionDepth = 0;
    this.maxRecursionDepth = 250;
    this.unifyDepth = 0;
    this.maxUnifyDepth = 250;
    this.astDepth = 0;
    this.maxAstDepth = 250;
    this.typeIdCounter = 0;
    this.unifyingPairs = /* @__PURE__ */ new Set();
    this.options = options;
  }
  registerSymbol(sym) {
    this.symbols.push(sym);
  }
  getOrAssignId(t) {
    if (!t._id) {
      t._id = ++this.typeIdCounter;
    }
    return t._id;
  }
  checkProgram(program) {
    this.recursionDepth = 0;
    this.unifyDepth = 0;
    this.astDepth = 0;
    this.symbols = [];
    const env2 = createInitialEnv();
    this.checkStatementList(program.statements, env2);
    return env2;
  }
  checkStatementList(statements, env2) {
    for (const stmt of statements) {
      if (stmt.kind === "s_type_alias") {
        const typeVarMap = /* @__PURE__ */ new Map();
        for (const tp of stmt.decl.typeParams) {
          const name = getTypeParamName(tp);
          typeVarMap.set(name, createTypeVarForParam(tp));
        }
        const targetType = this.astToType(stmt.decl.type, env2, typeVarMap);
        env2.typeAliases.set(stmt.decl.name, {
          typeParams: stmt.decl.typeParams,
          type: targetType
        });
        if (stmt.isExported) env2.exports.add(stmt.decl.name);
        this.registerSymbol({
          name: stmt.decl.name,
          type: targetType,
          kind: "type_alias",
          isExported: stmt.isExported,
          loc: stmt.decl.loc || stmt.loc,
          doc: renderDocComment(stmt.decl.docComment) || `Type Alias \`${stmt.decl.name}\``
        });
      } else if (stmt.kind === "s_gadt") {
        env2.gadts.set(stmt.decl.name, {
          name: stmt.decl.name,
          typeParams: stmt.decl.typeParams,
          constructors: stmt.decl.constructors
        });
        if (stmt.isExported) env2.exports.add(stmt.decl.name);
        this.registerSymbol({
          name: stmt.decl.name,
          type: { kind: "cons", name: stmt.decl.name, args: stmt.decl.typeParams.map((tp) => ({ kind: "var", id: 0, name: getTypeParamName(tp) })) },
          kind: "gadt",
          isExported: stmt.isExported,
          loc: stmt.decl.loc || stmt.loc,
          doc: renderDocComment(stmt.decl.docComment) || `GADT Type \`${stmt.decl.name}\``
        });
        for (const ctor of stmt.decl.constructors) {
          const ctorTypeMap = /* @__PURE__ */ new Map();
          const allTypeParams = [...stmt.decl.typeParams, ...ctor.typeParams];
          const allQuantifiers = [];
          const quantifierKinds = /* @__PURE__ */ new Map();
          for (const tp of allTypeParams) {
            const name = getTypeParamName(tp);
            const kind = getTypeParamKind(tp);
            allQuantifiers.push(name);
            quantifierKinds.set(name, kind);
            ctorTypeMap.set(name, createTypeVarForParam(tp));
          }
          const params = ctor.params.map((p) => ({
            name: p.name,
            type: this.astToType(p.type, env2, ctorTypeMap)
          }));
          let returnType;
          if (ctor.returnType) {
            returnType = this.astToType(ctor.returnType, env2, ctorTypeMap);
          } else {
            const args = stmt.decl.typeParams.map((tp) => ctorTypeMap.get(getTypeParamName(tp)) || createTypeVarForParam(tp));
            returnType = { kind: "cons", name: stmt.decl.name, args };
          }
          let fnType;
          if (ctor.params.length === 0) {
            fnType = returnType;
          } else {
            fnType = { kind: "fun", params, returnType };
          }
          if (allQuantifiers.length > 0) {
            fnType = { kind: "poly", quantifiers: allQuantifiers, quantifierKinds, type: fnType };
          }
          env2.vars.set(ctor.name, fnType);
          if (ctor.loc) env2.defLocs?.set(ctor.name, ctor.loc);
          if (stmt.isExported) env2.exports.add(ctor.name);
          this.registerSymbol({
            name: ctor.name,
            type: fnType,
            kind: "constructor",
            loc: ctor.loc,
            containerName: stmt.decl.name,
            doc: renderDocComment(ctor.docComment, ctor.params.map((param) => param.name)) || `GADT Constructor \`${ctor.name}\` for type \`${stmt.decl.name}\``
          });
        }
      }
    }
    for (const stmt of statements) {
      if (stmt.kind === "s_function") {
        const typeVarMap = /* @__PURE__ */ new Map();
        const quantifiers = [];
        const quantifierKinds = /* @__PURE__ */ new Map();
        for (const tp of stmt.typeParams) {
          const name = getTypeParamName(tp);
          const kind = getTypeParamKind(tp);
          quantifiers.push(name);
          quantifierKinds.set(name, kind);
          typeVarMap.set(name, createTypeVarForParam(tp));
        }
        const params = stmt.params.map((p) => ({
          name: p.name,
          type: this.astToType(p.type, env2, typeVarMap)
        }));
        const returnType = this.astToType(stmt.returnType, env2, typeVarMap);
        let funType = { kind: "fun", params, returnType };
        if (quantifiers.length > 0) {
          funType = { kind: "poly", quantifiers, quantifierKinds, type: funType };
        }
        env2.vars.set(stmt.name, funType);
        if (stmt.loc) env2.defLocs?.set(stmt.name, stmt.loc);
        if (stmt.isExported) env2.exports.add(stmt.name);
      }
    }
    for (const stmt of statements) {
      this.checkStatement(stmt, env2);
    }
  }
  // Convert TypeAST to internal Type
  astToType(ast, env2, typeVarMap = /* @__PURE__ */ new Map()) {
    this.astDepth++;
    if (this.astDepth > this.maxAstDepth) {
      this.addError(
        `Type error: Exceeded maximum recursion depth of ${this.maxAstDepth} while constructing recursive GADT type AST.`,
        void 0,
        "Type Checking"
      );
      this.astDepth--;
      return freshTypeVar("depth_exceeded");
    }
    try {
      return this.astToTypeInner(ast, env2, typeVarMap);
    } finally {
      this.astDepth--;
    }
  }
  astToTypeInner(ast, env2, typeVarMap = /* @__PURE__ */ new Map()) {
    switch (ast.kind) {
      case "base":
        switch (ast.name) {
          case "number":
            return PRIM_NUMBER;
          case "boolean":
            return PRIM_BOOLEAN;
          case "string":
            return PRIM_STRING;
          case "void":
            return PRIM_VOID;
        }
      case "var": {
        if (typeVarMap.has(ast.name)) {
          return typeVarMap.get(ast.name);
        }
        if (env2.typeAliases.has(ast.name)) {
          const alias = env2.typeAliases.get(ast.name);
          if (alias.typeParams.length === 0) return alias.type;
        }
        const v = freshTypeVar(ast.name);
        typeVarMap.set(ast.name, v);
        return v;
      }
      case "type_lambda": {
        const localMap = new Map(typeVarMap);
        const params = [];
        for (const tp of ast.params) {
          const name = getTypeParamName(tp);
          params.push(name);
          localMap.set(name, createTypeVarForParam(tp));
        }
        const body = this.astToType(ast.body, env2, localMap);
        return {
          kind: "type_lambda",
          params,
          body
        };
      }
      case "hkt_app": {
        const target = this.astToType(ast.target, env2, typeVarMap);
        const args = ast.args.map((a) => this.astToType(a, env2, typeVarMap));
        return prune({
          kind: "hkt_app",
          constructor: target,
          args
        });
      }
      case "fun": {
        const localMap = new Map(typeVarMap);
        const quantifiers = [];
        const quantifierKinds = /* @__PURE__ */ new Map();
        for (const tp of ast.typeParams) {
          const name = getTypeParamName(tp);
          const kind = getTypeParamKind(tp);
          quantifiers.push(name);
          quantifierKinds.set(name, kind);
          localMap.set(name, createTypeVarForParam(tp));
        }
        const params = ast.params.map((p) => ({
          name: p.name,
          type: this.astToType(p.type, env2, localMap)
        }));
        const returnType = this.astToType(ast.returnType, env2, localMap);
        const funType = { kind: "fun", params, returnType };
        if (quantifiers.length > 0) {
          return { kind: "poly", quantifiers, quantifierKinds, type: funType };
        }
        return funType;
      }
      case "record": {
        const fields = ast.fields.map((f) => ({
          name: f.name,
          type: this.astToType(f.type, env2, typeVarMap),
          isMut: f.isMut,
          isOptional: f.isOptional
        }));
        return { kind: "rec", fields };
      }
      case "tuple": {
        return {
          kind: "tup",
          elements: ast.elements.map((e) => this.astToType(e, env2, typeVarMap))
        };
      }
      case "app": {
        if (typeVarMap && typeVarMap.has(ast.name)) {
          const tv = typeVarMap.get(ast.name);
          if (!ast.args || ast.args.length === 0) {
            return tv;
          }
          return prune({
            kind: "hkt_app",
            constructor: tv,
            args: ast.args.map((a) => this.astToType(a, env2, typeVarMap))
          });
        }
        if (ast.name === "Array" || ast.name === "list") {
          const elemType = ast.args[0] ? this.astToType(ast.args[0], env2, typeVarMap) : freshTypeVar("a");
          return { kind: "tup", elements: [elemType] };
        }
        if (env2.typeAliases.has(ast.name)) {
          const alias = env2.typeAliases.get(ast.name);
          const argTypes = ast.args.map((a) => this.astToType(a, env2, typeVarMap));
          const aliasSubst = /* @__PURE__ */ new Map();
          alias.typeParams.forEach((tp, i) => {
            const name = getTypeParamName(tp);
            if (argTypes[i]) aliasSubst.set(name, argTypes[i]);
          });
          return this.substituteTypeParams(alias.type, aliasSubst);
        }
        return {
          kind: "cons",
          name: ast.name,
          args: ast.args.map((a) => this.astToType(a, env2, typeVarMap))
        };
      }
      case "forall": {
        const localMap = new Map(typeVarMap);
        const quantifiers = [];
        const quantifierKinds = /* @__PURE__ */ new Map();
        for (const tp of ast.typeParams) {
          const name = getTypeParamName(tp);
          const kind = getTypeParamKind(tp);
          quantifiers.push(name);
          quantifierKinds.set(name, kind);
          localMap.set(name, createTypeVarForParam(tp));
        }
        const inner = this.astToType(ast.type, env2, localMap);
        return { kind: "poly", quantifiers, quantifierKinds, type: inner };
      }
    }
  }
  substituteTypeParams(t, map, visited = /* @__PURE__ */ new Map()) {
    const type = t;
    if (visited.has(type)) {
      return visited.get(type);
    }
    switch (type.kind) {
      case "var":
        if (type.name && map.has(type.name)) return map.get(type.name);
        if (type.instance) return this.substituteTypeParams(type.instance, map, visited);
        return type;
      case "fun": {
        const newFun = { kind: "fun", params: [], returnType: PRIM_VOID };
        visited.set(type, newFun);
        newFun.params = type.params.map((p) => ({ ...p, type: this.substituteTypeParams(p.type, map, visited) }));
        newFun.returnType = this.substituteTypeParams(type.returnType, map, visited);
        return newFun;
      }
      case "rec": {
        const newRec = { kind: "rec", fields: [] };
        visited.set(type, newRec);
        newRec.fields = type.fields.map((f) => ({ ...f, type: this.substituteTypeParams(f.type, map, visited) }));
        return newRec;
      }
      case "tup": {
        const newTup = { kind: "tup", elements: [] };
        visited.set(type, newTup);
        newTup.elements = type.elements.map((e) => this.substituteTypeParams(e, map, visited));
        return newTup;
      }
      case "cons": {
        const newCons = { kind: "cons", name: type.name, args: [] };
        visited.set(type, newCons);
        newCons.args = type.args.map((a) => this.substituteTypeParams(a, map, visited));
        return newCons;
      }
      case "poly": {
        const newPoly = { kind: "poly", quantifiers: type.quantifiers, quantifierKinds: type.quantifierKinds, type: PRIM_VOID };
        visited.set(type, newPoly);
        const innerMap = new Map(map);
        for (const q of type.quantifiers) innerMap.delete(q);
        newPoly.type = this.substituteTypeParams(type.type, innerMap, visited);
        return newPoly;
      }
      case "hkt_app": {
        return prune({
          kind: "hkt_app",
          constructor: this.substituteTypeParams(type.constructor, map, visited),
          args: type.args.map((a) => this.substituteTypeParams(a, map, visited))
        });
      }
      case "type_lambda": {
        const newMap = new Map(map);
        for (const p of type.params) newMap.delete(p);
        return {
          kind: "type_lambda",
          params: type.params,
          body: this.substituteTypeParams(type.body, newMap, visited)
        };
      }
      default:
        return type;
    }
  }
  checkStatement(stmt, env2) {
    switch (stmt.kind) {
      case "s_let": {
        let type;
        if (stmt.typeAnnotation) {
          const annotated = this.astToType(stmt.typeAnnotation, env2);
          this.checkExpr(stmt.init, annotated, env2);
          type = annotated;
        } else {
          type = this.synthExpr(stmt.init, env2);
        }
        env2.vars.set(stmt.name, type);
        if (stmt.loc) env2.defLocs?.set(stmt.name, stmt.loc);
        if (stmt.isMut) {
          env2.mutVars.add(stmt.name);
        }
        if (stmt.isExported) env2.exports.add(stmt.name);
        const isLocal = !!env2.parent;
        this.registerSymbol({
          name: stmt.name,
          type,
          kind: isLocal ? "variable" : "variable",
          isMut: stmt.isMut,
          isExported: stmt.isExported,
          loc: stmt.loc,
          doc: renderDocComment(stmt.docComment) || (isLocal ? `${stmt.isMut ? "Mutable local" : "Local"} variable \`${stmt.name}\`` : `${stmt.isExported ? "Exported top-level" : "Top-level"} variable \`${stmt.name}\``)
        });
        break;
      }
      case "s_function": {
        const localEnv = createScopedEnv(env2);
        const typeVarMap = /* @__PURE__ */ new Map();
        const quantifiers = [];
        const quantifierKinds = /* @__PURE__ */ new Map();
        for (const tp of stmt.typeParams) {
          const name = getTypeParamName(tp);
          const kind = getTypeParamKind(tp);
          quantifiers.push(name);
          quantifierKinds.set(name, kind);
          typeVarMap.set(name, createTypeVarForParam(tp));
        }
        const params = stmt.params.map((p) => ({
          name: p.name,
          type: this.astToType(p.type, env2, typeVarMap),
          loc: p.loc
        }));
        for (const p of params) {
          localEnv.vars.set(p.name, p.type);
          if (p.loc) localEnv.defLocs?.set(p.name, p.loc);
          this.registerSymbol({
            name: p.name,
            type: p.type,
            kind: "parameter",
            loc: p.loc || stmt.loc,
            containerName: stmt.name,
            scopeRange: {
              startLine: stmt.loc?.line || 1,
              startCol: stmt.loc?.col || 1,
              endLine: stmt.body.loc?.endLine || (stmt.loc?.line ? stmt.loc.line + 5e3 : 999999),
              endCol: stmt.body.loc?.endCol || 999999
            },
            doc: getParameterDoc(stmt.docComment, p.name) || `Parameter \`${p.name}\` of function \`${stmt.name}\``
          });
        }
        const returnType = this.astToType(stmt.returnType, env2, typeVarMap);
        let funType = env2.vars.get(stmt.name) || { kind: "fun", params, returnType };
        localEnv.vars.set(stmt.name, funType);
        if (stmt.loc) {
          localEnv.defLocs?.set(stmt.name, stmt.loc);
          env2.defLocs?.set(stmt.name, stmt.loc);
        }
        localEnv.currentReturnType = returnType;
        this.registerSymbol({
          name: stmt.name,
          type: funType,
          kind: "function",
          isExported: stmt.isExported,
          loc: stmt.loc,
          doc: renderDocComment(stmt.docComment, stmt.params.map((param) => param.name)) || (stmt.isExported ? `Exported function \`${stmt.name}\`` : `Function \`${stmt.name}\``)
        });
        if (stmt.whereBindings && stmt.whereBindings.length > 0) {
          this.checkStatementList(stmt.whereBindings, localEnv);
        }
        this.checkExpr(stmt.body, returnType, localEnv);
        break;
      }
      case "s_gadt": {
        env2.gadts.set(stmt.decl.name, {
          name: stmt.decl.name,
          typeParams: stmt.decl.typeParams,
          constructors: stmt.decl.constructors
        });
        if (stmt.isExported) env2.exports.add(stmt.decl.name);
        if (stmt.loc) env2.defLocs?.set(stmt.decl.name, stmt.loc);
        this.registerSymbol({
          name: stmt.decl.name,
          type: { kind: "cons", name: stmt.decl.name, args: [] },
          kind: "gadt",
          loc: stmt.loc,
          doc: `GADT Type \`${stmt.decl.name}\``
        });
        for (const ctor of stmt.decl.constructors) {
          const ctorTypeMap = /* @__PURE__ */ new Map();
          const allTypeParams = [...stmt.decl.typeParams, ...ctor.typeParams];
          const allQuantifiers = [];
          const quantifierKinds = /* @__PURE__ */ new Map();
          for (const tp of allTypeParams) {
            const name = getTypeParamName(tp);
            const kind = getTypeParamKind(tp);
            allQuantifiers.push(name);
            quantifierKinds.set(name, kind);
            ctorTypeMap.set(name, createTypeVarForParam(tp));
          }
          const params = ctor.params.map((p) => ({
            name: p.name,
            type: this.astToType(p.type, env2, ctorTypeMap)
          }));
          let returnType;
          if (ctor.returnType) {
            returnType = this.astToType(ctor.returnType, env2, ctorTypeMap);
          } else {
            const args = stmt.decl.typeParams.map((tp) => ctorTypeMap.get(getTypeParamName(tp)) || createTypeVarForParam(tp));
            returnType = { kind: "cons", name: stmt.decl.name, args };
          }
          let fnType;
          if (ctor.params.length === 0) {
            fnType = returnType;
          } else {
            fnType = { kind: "fun", params, returnType };
          }
          if (allQuantifiers.length > 0) {
            fnType = { kind: "poly", quantifiers: allQuantifiers, quantifierKinds, type: fnType };
          }
          env2.vars.set(ctor.name, fnType);
          if (stmt.isExported) env2.exports.add(ctor.name);
        }
        break;
      }
      case "s_type_alias": {
        const typeVarMap = /* @__PURE__ */ new Map();
        for (const tp of stmt.decl.typeParams) {
          const name = getTypeParamName(tp);
          typeVarMap.set(name, createTypeVarForParam(tp));
        }
        const targetType = this.astToType(stmt.decl.type, env2, typeVarMap);
        env2.typeAliases.set(stmt.decl.name, {
          typeParams: stmt.decl.typeParams,
          type: targetType
        });
        if (stmt.isExported) env2.exports.add(stmt.decl.name);
        if (stmt.loc) env2.defLocs?.set(stmt.decl.name, stmt.loc);
        this.registerSymbol({
          name: stmt.decl.name,
          type: targetType,
          kind: "type_alias",
          loc: stmt.loc,
          doc: `Type Alias \`${stmt.decl.name}\``
        });
        break;
      }
      case "s_module": {
        const modEnv = createScopedEnv(env2);
        modEnv.exports = /* @__PURE__ */ new Set();
        modEnv.currentReturnType = void 0;
        env2.modules.set(stmt.name, modEnv);
        if (stmt.isExported) env2.exports.add(stmt.name);
        this.checkStatementList(stmt.body, modEnv);
        break;
      }
      case "s_extern_function": {
        const typeVarMap = /* @__PURE__ */ new Map();
        const quantifiers = [];
        const quantifierKinds = /* @__PURE__ */ new Map();
        for (const tp of stmt.typeParams) {
          const name = getTypeParamName(tp);
          const kind = getTypeParamKind(tp);
          quantifiers.push(name);
          quantifierKinds.set(name, kind);
          typeVarMap.set(name, createTypeVarForParam(tp));
        }
        const params = stmt.params.map((p) => ({
          name: p.name,
          type: this.astToType(p.type, env2, typeVarMap),
          loc: p.loc
        }));
        for (const p of params) {
          this.registerSymbol({
            name: p.name,
            type: p.type,
            kind: "parameter",
            containerName: stmt.name,
            loc: p.loc || stmt.loc,
            scopeRange: {
              startLine: stmt.loc?.line || 1,
              startCol: 1,
              endLine: stmt.loc?.line || 1,
              endCol: 999999
            },
            doc: `Parameter \`${p.name}\` of extern function \`${stmt.name}\``
          });
        }
        const returnType = this.astToType(stmt.returnType, env2, typeVarMap);
        let fnType = { kind: "fun", params, returnType };
        if (quantifiers.length > 0) {
          fnType = { kind: "poly", quantifiers, quantifierKinds, type: fnType };
        }
        env2.vars.set(stmt.name, fnType);
        if (stmt.isExported) env2.exports.add(stmt.name);
        this.registerSymbol({
          name: stmt.name,
          type: fnType,
          kind: "function",
          isExported: stmt.isExported,
          loc: stmt.loc,
          doc: stmt.docComment || `Extern function \`${stmt.name}\``
        });
        break;
      }
      case "s_extern_type": {
        const typeVarMap = /* @__PURE__ */ new Map();
        for (const tp of stmt.typeParams) {
          const name = getTypeParamName(tp);
          typeVarMap.set(name, createTypeVarForParam(tp));
        }
        const targetType = this.astToType(stmt.type, env2, typeVarMap);
        env2.typeAliases.set(stmt.name, {
          typeParams: stmt.typeParams,
          type: targetType
        });
        if (stmt.isExported) env2.exports.add(stmt.name);
        this.registerSymbol({
          name: stmt.name,
          type: targetType,
          kind: "type_alias",
          isExported: stmt.isExported,
          loc: stmt.loc,
          doc: stmt.docComment || `Extern type \`${stmt.name}\``
        });
        break;
      }
      case "s_extern_value": {
        const valType = this.astToType(stmt.type, env2);
        env2.vars.set(stmt.name, valType);
        if (stmt.isExported) env2.exports.add(stmt.name);
        this.registerSymbol({
          name: stmt.name,
          type: valType,
          kind: "variable",
          isExported: stmt.isExported,
          loc: stmt.loc,
          doc: stmt.docComment || `Extern value \`${stmt.name}\``
        });
        break;
      }
      case "s_extern_module": {
        const modEnv = createScopedEnv(env2);
        modEnv.exports = /* @__PURE__ */ new Set();
        if (stmt.docComment) modEnv.moduleDoc = stmt.docComment;
        this.registerSymbol({
          name: stmt.name,
          type: this.moduleEnvToType(modEnv),
          kind: "module",
          loc: stmt.loc,
          doc: stmt.docComment || `Extern module \`${stmt.name}\``
        });
        for (const t of stmt.types) {
          const typeVarMap = /* @__PURE__ */ new Map();
          for (const tp of t.typeParams) {
            const name = getTypeParamName(tp);
            typeVarMap.set(name, createTypeVarForParam(tp));
          }
          const targetType = this.astToType(t.type, modEnv, typeVarMap);
          modEnv.typeAliases.set(t.name, {
            typeParams: t.typeParams,
            type: targetType
          });
          modEnv.exports.add(t.name);
          if (t.loc) modEnv.defLocs?.set(t.name, t.loc);
          if (t.docComment) modEnv.docs?.set(t.name, t.docComment);
          this.registerSymbol({
            name: t.name,
            type: targetType,
            kind: "type_alias",
            containerName: stmt.name,
            loc: t.loc,
            doc: t.docComment || `Type alias \`${stmt.name}.${t.name}\``
          });
        }
        for (const v of stmt.values) {
          const valType = this.astToType(v.type, modEnv);
          modEnv.vars.set(v.name, valType);
          modEnv.exports.add(v.name);
          if (v.loc) modEnv.defLocs?.set(v.name, v.loc);
          if (v.docComment) modEnv.docs?.set(v.name, v.docComment);
          this.registerSymbol({
            name: v.name,
            type: valType,
            kind: "variable",
            containerName: stmt.name,
            loc: v.loc,
            doc: v.docComment || `Extern variable \`${stmt.name}.${v.name}\``
          });
        }
        for (const fn of stmt.functions) {
          const typeVarMap = /* @__PURE__ */ new Map();
          const quantifiers = [];
          const quantifierKinds = /* @__PURE__ */ new Map();
          for (const tp of fn.typeParams) {
            const name = getTypeParamName(tp);
            const kind = getTypeParamKind(tp);
            quantifiers.push(name);
            quantifierKinds.set(name, kind);
            typeVarMap.set(name, createTypeVarForParam(tp));
          }
          const params = fn.params.map((p) => ({
            name: p.name,
            type: this.astToType(p.type, modEnv, typeVarMap),
            loc: p.loc
          }));
          for (const p of params) {
            this.registerSymbol({
              name: p.name,
              type: p.type,
              kind: "parameter",
              containerName: fn.name,
              loc: p.loc || fn.loc,
              scopeRange: {
                startLine: fn.loc?.line || stmt.loc?.line || 1,
                startCol: 1,
                endLine: fn.loc?.line || stmt.loc?.line || 1,
                endCol: 999999
              },
              doc: `Parameter \`${p.name}\` of function \`${stmt.name}.${fn.name}\``
            });
          }
          const returnType = this.astToType(fn.returnType, modEnv, typeVarMap);
          let fnType = { kind: "fun", params, returnType };
          if (quantifiers.length > 0) {
            fnType = { kind: "poly", quantifiers, quantifierKinds, type: fnType };
          }
          modEnv.vars.set(fn.name, fnType);
          modEnv.exports.add(fn.name);
          if (fn.loc) modEnv.defLocs?.set(fn.name, fn.loc);
          if (fn.docComment) modEnv.docs?.set(fn.name, fn.docComment);
          this.registerSymbol({
            name: fn.name,
            type: fnType,
            kind: "function",
            containerName: stmt.name,
            loc: fn.loc,
            doc: fn.docComment || `Extern function \`${stmt.name}.${fn.name}\``
          });
        }
        const modType = this.moduleEnvToType(modEnv);
        env2.modules.set(stmt.name, modEnv);
        env2.vars.set(stmt.name, modType);
        if (stmt.loc) env2.defLocs?.set(stmt.name, stmt.loc);
        const cleanName = stmt.name.replace(/^npm:/, "").replace(/[^a-zA-Z0-9_]/g, "_");
        if (cleanName !== stmt.name) {
          env2.modules.set(cleanName, modEnv);
          env2.vars.set(cleanName, modType);
          if (stmt.loc) env2.defLocs?.set(cleanName, stmt.loc);
        }
        if (stmt.isExported) env2.exports.add(stmt.name);
        break;
      }
      case "s_import": {
        this.processImport(stmt, env2);
        break;
      }
      case "s_expr": {
        this.synthExpr(stmt.expr, env2);
        break;
      }
    }
  }
  processImport(stmt, env2) {
    let searchEnv = env2;
    let baseEnv = void 0;
    while (searchEnv) {
      if (searchEnv.modules.has(stmt.modulePath[0])) {
        baseEnv = searchEnv;
        break;
      }
      searchEnv = searchEnv.parent;
    }
    if (!baseEnv && this.options.resolveModule) {
      const moduleName = stmt.modulePath[0];
      const resolvedEnv = this.options.resolveModule(moduleName);
      if (resolvedEnv) {
        env2.modules.set(moduleName, resolvedEnv);
        baseEnv = env2;
      }
    }
    let current = baseEnv;
    for (const seg of stmt.modulePath) {
      if (!current) break;
      current = current.modules.get(seg);
    }
    if (!current) {
      const knownModules = [];
      let mEnv = env2;
      while (mEnv) {
        for (const k of Array.from(mEnv.modules.keys())) {
          if (!knownModules.includes(k)) knownModules.push(k);
        }
        mEnv = mEnv.parent;
      }
      const closest = findBestSuggestion(stmt.modulePath.join("."), knownModules);
      const suggestion = closest ? ` Did you mean '${closest}'?` : "";
      this.addError(`Module '${stmt.modulePath.join(".")}' not found.${suggestion}`, stmt.loc, "Undefined Symbol");
      return;
    }
    if (stmt.alias) {
      env2.modules.set(stmt.alias, current);
      return;
    }
    if (stmt.specifiers) {
      for (const spec of stmt.specifiers) {
        if (spec.isAll) {
          current.exports.forEach((expName) => {
            if (current.vars.has(expName)) env2.vars.set(expName, current.vars.get(expName));
            if (current.docs?.has(expName)) env2.docs?.set(expName, current.docs.get(expName));
            if (current.gadts.has(expName)) env2.gadts.set(expName, current.gadts.get(expName));
            if (current.typeAliases.has(expName)) env2.typeAliases.set(expName, current.typeAliases.get(expName));
          });
        } else {
          const importName = spec.name;
          const targetName = spec.alias || importName;
          let found = false;
          if (current.vars.has(importName)) {
            env2.vars.set(targetName, current.vars.get(importName));
            const doc = current.docs?.get(importName);
            if (doc) env2.docs?.set(targetName, doc);
            found = true;
          }
          if (current.gadts.has(importName)) {
            env2.gadts.set(targetName, current.gadts.get(importName));
            found = true;
          }
          if (current.typeAliases.has(importName)) {
            env2.typeAliases.set(targetName, current.typeAliases.get(importName));
            found = true;
          }
          if (!found) {
            const availableExports = Array.from(
              /* @__PURE__ */ new Set([...Array.from(current.exports), ...Array.from(current.vars.keys()), ...Array.from(current.gadts.keys()), ...Array.from(current.typeAliases.keys())])
            );
            const closest = findBestSuggestion(importName, availableExports);
            const suggestion = closest ? ` Did you mean '${closest}'?` : "";
            this.addError(
              `Export '${importName}' not found in module '${stmt.modulePath.join(".")}'.${suggestion}`,
              spec.loc || stmt.loc,
              "Undefined Symbol"
            );
          }
        }
      }
    } else {
      env2.modules.set(stmt.modulePath[stmt.modulePath.length - 1], current);
    }
  }
  // ==================== BIDIRECTIONAL SYNTH & CHECK ====================
  synthExpr(expr, env2) {
    this.recursionDepth++;
    if (this.recursionDepth > this.maxRecursionDepth) {
      this.addError(
        `Type error: Maximum recursion depth of ${this.maxRecursionDepth} exceeded during type inference/checking. Check for complex or infinitely recursive GADT types.`,
        expr.loc,
        "Type Checking"
      );
      this.recursionDepth--;
      return freshTypeVar("rec_exceeded");
    }
    try {
      return this.synthExprInner(expr, env2);
    } finally {
      this.recursionDepth--;
    }
  }
  synthExprInner(expr, env2) {
    switch (expr.kind) {
      case "e_literal": {
        if (typeof expr.value === "number") return PRIM_NUMBER;
        if (typeof expr.value === "boolean") return PRIM_BOOLEAN;
        if (typeof expr.value === "string") return PRIM_STRING;
        return PRIM_VOID;
      }
      case "e_var": {
        if (expr.modulePath && expr.modulePath.length > 0) {
          let searchEnv = env2;
          let baseEnv = void 0;
          while (searchEnv) {
            if (searchEnv.modules.has(expr.modulePath[0])) {
              baseEnv = searchEnv;
              break;
            }
            searchEnv = searchEnv.parent;
          }
          let modEnv = baseEnv;
          for (const seg of expr.modulePath) {
            modEnv = modEnv?.modules.get(seg);
          }
          if (modEnv) {
            if (!expr.name) {
              return freshTypeVar("__member__");
            }
            if (modEnv.vars.has(expr.name)) {
              const type = this.instantiate(modEnv.vars.get(expr.name));
              const foundLoc2 = modEnv.defLocs?.get(expr.name);
              if (expr.loc && foundLoc2) {
                this.registerSymbol({
                  name: expr.name,
                  type,
                  kind: "reference",
                  loc: expr.loc,
                  scopeRange: {
                    startLine: foundLoc2.line,
                    startCol: foundLoc2.col,
                    endLine: foundLoc2.endLine || foundLoc2.line,
                    endCol: foundLoc2.endCol || foundLoc2.col
                  }
                });
              }
              return type;
            }
            if (modEnv.modules.has(expr.name)) {
              const type = this.moduleEnvToType(modEnv.modules.get(expr.name));
              const foundLoc2 = modEnv.defLocs?.get(expr.name);
              if (expr.loc && foundLoc2) {
                this.registerSymbol({
                  name: expr.name,
                  type,
                  kind: "reference",
                  loc: expr.loc,
                  scopeRange: {
                    startLine: foundLoc2.line,
                    startCol: foundLoc2.col,
                    endLine: foundLoc2.endLine || foundLoc2.line,
                    endCol: foundLoc2.endCol || foundLoc2.col
                  }
                });
              }
              return type;
            }
            const candidateExports = Array.from(modEnv.exports);
            const closest = findBestSuggestion(expr.name, candidateExports);
            const suggestion = closest ? ` Did you mean '${expr.modulePath.join(".")}.${closest}'?` : "";
            this.addError(
              `Member '${expr.name}' not found in module '${expr.modulePath.join(".")}'.${suggestion}`,
              expr.loc,
              "Undefined Symbol",
              closest ? [{ title: `\u{1F4A1} Replace with '${closest}'`, targetLine: expr.loc?.line, replacementText: closest }] : void 0
            );
            return freshTypeVar(expr.name);
          }
        }
        let curr = env2;
        let foundLoc = void 0;
        let resolvedType = void 0;
        while (curr) {
          if (curr.vars.has(expr.name)) {
            resolvedType = this.instantiate(curr.vars.get(expr.name));
            foundLoc = curr.defLocs?.get(expr.name);
            break;
          }
          if (curr.modules.has(expr.name)) {
            resolvedType = this.moduleEnvToType(curr.modules.get(expr.name));
            foundLoc = curr.defLocs?.get(expr.name);
            break;
          }
          curr = curr.parent;
        }
        if (resolvedType) {
          if (expr.loc && foundLoc) {
            this.registerSymbol({
              name: expr.name,
              type: resolvedType,
              kind: "reference",
              loc: expr.loc,
              scopeRange: {
                startLine: foundLoc.line,
                startCol: foundLoc.col,
                endLine: foundLoc.endLine || foundLoc.line,
                endCol: foundLoc.endCol || foundLoc.col
              }
            });
          }
          return resolvedType;
        }
        if (expr.isDoDesugared || expr.doOp) {
          const doOp = expr.doOp || expr.name;
          if (doOp === "flatMap") {
            this.addError(
              `In 'do' notation: 'flatMap' function is not defined in scope. Monadic 'do' blocks desugar bindings like 'x <- expr' into 'flatMap(expr, (x) => ...)'. To use 'do' notation, define or import a 'flatMap' function for your monad type (e.g. Option, Result, IO, Promise).`,
              expr.loc,
              "Undefined Symbol",
              [
                {
                  title: "\u{1F4A1} Define Option flatMap: function flatMap<a, b>(opt: Option<a>, f: (x: a) => Option<b>): Option<b> { ... }",
                  actionKind: "add_let",
                  targetLine: Math.max(1, (expr.loc?.line || 1) - 1),
                  replacementText: `function flatMap<a, b>(opt: Option<a>, f: (x: a) => Option<b>): Option<b> {
  match (opt) {
    Some(v) => f(v)
    None => None
  }
}
`
                }
              ]
            );
            return freshTypeVar("flatMap");
          }
          if (doOp === "pure") {
            this.addError(
              `In 'do' notation: 'pure' function is not defined in scope. Monadic 'do' blocks desugar 'pure val' into 'pure(val)' to lift values into your monad. To use 'pure' in 'do' blocks, define or import a 'pure' function (e.g. function pure<a>(val: a): Option<a> { Some(val) }).`,
              expr.loc,
              "Undefined Symbol",
              [
                {
                  title: "\u{1F4A1} Define Option pure: function pure<a>(val: a): Option<a> { Some(val) }",
                  actionKind: "add_let",
                  targetLine: Math.max(1, (expr.loc?.line || 1) - 1),
                  replacementText: `function pure<a>(val: a): Option<a> {
  Some(val)
}
`
                }
              ]
            );
            return freshTypeVar("pure");
          }
        }
        const inScopeVars = [];
        let sCurr = env2;
        while (sCurr) {
          for (const k of Array.from(sCurr.vars.keys())) {
            if (!inScopeVars.includes(k)) inScopeVars.push(k);
          }
          for (const k of Array.from(sCurr.modules.keys())) {
            if (!inScopeVars.includes(k)) inScopeVars.push(k);
          }
          sCurr = sCurr.parent;
        }
        let moduleWithExactExport = null;
        let mCurr = env2;
        while (mCurr) {
          for (const [modName, mod] of Array.from(mCurr.modules.entries())) {
            if (mod.exports.has(expr.name)) {
              moduleWithExactExport = { modName, exportName: expr.name };
              break;
            }
          }
          if (moduleWithExactExport) break;
          mCurr = mCurr.parent;
        }
        if (moduleWithExactExport) {
          this.addError(
            `Undefined variable '${expr.name}'. Did you mean '${moduleWithExactExport.modName}.${moduleWithExactExport.exportName}' or 'import ${moduleWithExactExport.modName}.{ ${moduleWithExactExport.exportName} }'?`,
            expr.loc,
            "Undefined Symbol",
            [
              {
                title: `\u{1F4A1} Use '${moduleWithExactExport.modName}.${moduleWithExactExport.exportName}'`,
                actionKind: "wrap_expression",
                targetLine: expr.loc?.line,
                replacementText: `${moduleWithExactExport.modName}.${moduleWithExactExport.exportName}`
              },
              {
                title: `\u{1F4A1} Import '${moduleWithExactExport.exportName}' from ${moduleWithExactExport.modName}`,
                actionKind: "add_let",
                targetLine: 1,
                replacementText: `import ${moduleWithExactExport.modName}.{ ${moduleWithExactExport.exportName} };
`
              }
            ]
          );
          return freshTypeVar(expr.name);
        }
        const closestInScope = findBestSuggestion(expr.name, inScopeVars);
        if (closestInScope) {
          this.addError(
            `Undefined variable '${expr.name}'. Did you mean '${closestInScope}'?`,
            expr.loc,
            "Undefined Symbol",
            [{
              title: `\u{1F4A1} Replace with '${closestInScope}'`,
              actionKind: "replace_line",
              targetLine: expr.loc?.line,
              replacementText: closestInScope
            }]
          );
          return freshTypeVar(expr.name);
        }
        const allModuleExports = [];
        let amCurr = env2;
        while (amCurr) {
          for (const [modName, mod] of Array.from(amCurr.modules.entries())) {
            for (const exp of Array.from(mod.exports)) {
              allModuleExports.push({ modName, expName: exp });
            }
          }
          amCurr = amCurr.parent;
        }
        const exportNames = allModuleExports.map((m) => m.expName);
        const closestExport = findBestSuggestion(expr.name, exportNames);
        if (closestExport) {
          const match = allModuleExports.find((m) => m.expName === closestExport);
          const modName = match ? match.modName : "Math";
          this.addError(
            `Undefined variable '${expr.name}'. Did you mean '${modName}.${closestExport}'?`,
            expr.loc,
            "Undefined Symbol",
            [{
              title: `\u{1F4A1} Use '${modName}.${closestExport}'`,
              actionKind: "wrap_expression",
              targetLine: expr.loc?.line,
              replacementText: `${modName}.${closestExport}`
            }]
          );
          return freshTypeVar(expr.name);
        }
        this.addError(`Undefined variable '${expr.name}'`, expr.loc, "Undefined Symbol");
        return freshTypeVar(expr.name);
      }
      case "e_unary": {
        const sub = this.synthExpr(expr.expr, env2);
        if (expr.op === "-") {
          this.unify(sub, PRIM_NUMBER, expr.loc);
          return PRIM_NUMBER;
        }
        if (expr.op === "!") {
          this.unify(sub, PRIM_BOOLEAN, expr.loc);
          return PRIM_BOOLEAN;
        }
        return sub;
      }
      case "e_binary": {
        const left = this.synthExpr(expr.left, env2);
        const right = this.synthExpr(expr.right, env2);
        if (["+", "-", "*", "/", "%"].includes(expr.op)) {
          if (expr.op === "+" && (prune(left).kind === "prim" && left.name === "string")) {
            this.unify(right, PRIM_STRING, expr.loc);
            return PRIM_STRING;
          }
          this.unify(left, PRIM_NUMBER, expr.loc);
          this.unify(right, PRIM_NUMBER, expr.loc);
          return PRIM_NUMBER;
        }
        if (["==", "!="].includes(expr.op)) {
          this.unify(left, right, expr.loc);
          return PRIM_BOOLEAN;
        }
        if (["<", "<=", ">", ">="].includes(expr.op)) {
          this.unify(left, PRIM_NUMBER, expr.loc);
          this.unify(right, PRIM_NUMBER, expr.loc);
          return PRIM_BOOLEAN;
        }
        if (["&&", "||"].includes(expr.op)) {
          this.unify(left, PRIM_BOOLEAN, expr.loc);
          this.unify(right, PRIM_BOOLEAN, expr.loc);
          return PRIM_BOOLEAN;
        }
        return left;
      }
      case "e_assign": {
        if (expr.target.kind === "e_var") {
          let curr = env2;
          let foundVar = false;
          let isMutable = false;
          while (curr) {
            if (curr.vars.has(expr.target.name)) {
              foundVar = true;
              if (curr.mutVars.has(expr.target.name)) {
                isMutable = true;
              }
              break;
            }
            curr = curr.parent;
          }
          if (foundVar && !isMutable) {
            this.addError(
              `Cannot assign to immutable variable '${expr.target.name}'. Variable must be declared with 'let mut ${expr.target.name}' to allow reassignment.`,
              expr.loc || expr.target.loc,
              "Immutability Violation"
            );
          }
        } else if (expr.target.kind === "e_field_access") {
          const fieldTarget = expr.target;
          const objType = prune(this.synthExpr(fieldTarget.object, env2));
          if (objType.kind === "rec") {
            const field = objType.fields.find((f) => f.name === fieldTarget.field);
            if (field && !field.isMut) {
              this.addError(
                `Cannot mutate immutable record field '${fieldTarget.field}'. Declare field with 'mut ${fieldTarget.field}' in record definition.`,
                expr.loc || fieldTarget.loc,
                "Immutability Violation"
              );
            }
          }
        }
        const targetType = this.synthExpr(expr.target, env2);
        this.checkExpr(expr.value, targetType, env2);
        return PRIM_VOID;
      }
      case "e_call": {
        const calleeType = prune(this.synthExpr(expr.callee, env2));
        if (calleeType.kind === "poly") {
          const inst = this.instantiate(calleeType);
          return this.checkFunCall(inst, expr.args, env2, expr.loc);
        }
        if (calleeType.kind === "fun") {
          return this.checkFunCall(calleeType, expr.args, env2, expr.loc);
        }
        const ret = freshTypeVar("ret");
        const expectedFun = {
          kind: "fun",
          params: expr.args.map((a) => ({ type: this.synthExpr(a, env2) })),
          returnType: ret
        };
        this.unify(calleeType, expectedFun, expr.loc);
        return ret;
      }
      case "e_field_access": {
        const isDoDesugared = expr.isDoDesugared;
        const doOp = expr.doOp;
        const objType = prune(this.synthExpr(expr.object, env2));
        if (isDoDesugared && (doOp === "flatMap" || doOp === "pure" || expr.field === "flatMap" || expr.field === "pure")) {
          const monadName = expr.object.kind === "e_var" ? expr.object.name : "Monad";
          let foundField;
          if (objType.kind === "rec") {
            const f = objType.fields.find((field) => field.name === expr.field);
            if (f) foundField = f.type;
          }
          if (foundField) return foundField;
          if (expr.field === "flatMap") {
            this.addError(
              `In 'do(${monadName})' notation: '${monadName}' does not provide a 'flatMap' function. Monadic 'do(${monadName})' blocks desugar bindings like 'x <- expr' into '${monadName}.flatMap(expr, (x) => ...)'. Ensure '${monadName}' defines 'flatMap'.`,
              expr.loc,
              "Undefined Symbol"
            );
            return freshTypeVar("flatMap");
          } else if (expr.field === "pure") {
            this.addError(
              `In 'do(${monadName})' notation: '${monadName}' does not provide a 'pure' function. Monadic 'do(${monadName})' blocks desugar 'pure val' into '${monadName}.pure(val)'. Ensure '${monadName}' defines 'pure'.`,
              expr.loc,
              "Undefined Symbol"
            );
            return freshTypeVar("pure");
          }
        }
        if (objType.kind === "rec") {
          if (!expr.field) {
            return freshTypeVar("__field__");
          }
          const field = objType.fields.find((f) => f.name === expr.field);
          if (field) return field.type;
          const candidateFields = objType.fields.map((f) => f.name);
          const closest = findBestSuggestion(expr.field, candidateFields);
          const suggestion = closest ? ` Did you mean '${closest}'?` : "";
          this.addError(
            `Record field '${expr.field}' not found.${suggestion}`,
            expr.loc,
            "Undefined Symbol",
            closest ? [{ title: `\u{1F4A1} Replace with field '${closest}'`, targetLine: expr.loc?.line, replacementText: closest }] : void 0
          );
        }
        return freshTypeVar(expr.field);
      }
      case "e_index": {
        const targetType = prune(this.synthExpr(expr.target, env2));
        const indexType = this.synthExpr(expr.index, env2);
        this.unify(indexType, PRIM_NUMBER, expr.loc);
        if (targetType.kind === "tup") {
          if (expr.index.kind === "e_literal" && typeof expr.index.value === "number") {
            const idx = expr.index.value;
            if (idx >= 0 && idx < targetType.elements.length) {
              return targetType.elements[idx];
            }
          }
          if (targetType.elements.length > 0) return targetType.elements[0];
        }
        return freshTypeVar("elem");
      }
      case "e_method_call": {
        const objType = prune(this.synthExpr(expr.object, env2));
        if (objType.kind === "rec") {
          const field = objType.fields.find((f) => f.name === expr.method);
          if (field) {
            const rawType = prune(field.type);
            const funType = rawType.kind === "poly" ? this.instantiate(rawType) : rawType;
            if (funType.kind === "fun") {
              if (objType.isModule || funType.params.length === expr.args.length) {
                expr.isModuleMethod = true;
                return this.checkFunCall(funType, expr.args, env2, expr.loc);
              } else {
                const args = [expr.object, ...expr.args];
                return this.checkFunCall(funType, args, env2, expr.loc);
              }
            }
          }
        }
        const nativeMethods = [
          "push",
          "pop",
          "shift",
          "unshift",
          "splice",
          "slice",
          "indexOf",
          "lastIndexOf",
          "includes",
          "join",
          "concat",
          "map",
          "filter",
          "reduce",
          "forEach",
          "find",
          "findIndex",
          "trim",
          "toLowerCase",
          "toUpperCase",
          "replace",
          "replaceAll",
          "split",
          "charAt",
          "substring",
          "startsWith",
          "endsWith",
          "toString",
          "valueOf",
          "addEventListener",
          "removeEventListener",
          "getAttribute",
          "setAttribute",
          "getElementById",
          "querySelector",
          "querySelectorAll",
          "appendChild",
          "removeChild",
          "getContext",
          "getBoundingClientRect",
          "fill",
          "stroke",
          "beginPath",
          "closePath",
          "moveTo",
          "lineTo",
          "arc",
          "rect",
          "fillRect",
          "strokeRect",
          "clearRect",
          "fillText",
          "strokeText",
          "setLineDash",
          "getLineDash",
          "measureText",
          "clip",
          "createLinearGradient",
          "createRadialGradient",
          "createPattern",
          "drawImage",
          "addColorStop",
          "quadraticCurveTo",
          "bezierCurveTo",
          "ellipse",
          "arcTo",
          "save",
          "restore",
          "translate",
          "rotate",
          "scale",
          "preventDefault",
          "stopPropagation"
        ];
        if (nativeMethods.includes(expr.method)) {
          expr.args.forEach((a) => this.synthExpr(a, env2));
          expr.isModuleMethod = true;
          return freshTypeVar(expr.method + "_ret");
        }
        if (objType.kind === "rec") {
          const candidateMethods = objType.fields.filter((f) => {
            const t = prune(f.type);
            return t.kind === "fun" || t.kind === "poly";
          }).map((f) => f.name);
          const closest = findBestSuggestion(expr.method, candidateMethods);
          const suggestion = closest ? ` Did you mean '${closest}'?` : "";
          this.addError(
            `Method '${expr.method}' not found on object.${suggestion}`,
            expr.loc,
            "Undefined Symbol",
            closest ? [{ title: `\u{1F4A1} Replace with method '${closest}'`, targetLine: expr.loc?.line, replacementText: closest }] : void 0
          );
          return freshTypeVar(expr.method);
        }
        this.addError(`Method '${expr.method}' not found on non-record object`, expr.loc, "Undefined Symbol");
        return freshTypeVar(expr.method);
      }
      case "e_record": {
        const fields = expr.fields.map((f) => ({
          name: f.name,
          type: this.synthExpr(f.value, env2),
          isMut: f.isMut
        }));
        if (expr.methods) {
          for (const m of expr.methods) {
            const localEnv = createScopedEnv(env2);
            const recTypePlaceholder = { kind: "rec", fields };
            localEnv.vars.set(m.selfParam, recTypePlaceholder);
            const mParams = m.params.map((p) => ({
              name: p.name,
              type: p.type ? this.astToType(p.type, env2) : freshTypeVar(p.name)
            }));
            mParams.forEach((p) => localEnv.vars.set(p.name, p.type));
            const returnType = m.returnType ? this.astToType(m.returnType, env2) : PRIM_VOID;
            localEnv.currentReturnType = returnType;
            this.checkExpr(m.body, returnType, localEnv);
            fields.push({
              name: m.name,
              type: {
                kind: "fun",
                params: [{ name: m.selfParam, type: recTypePlaceholder }, ...mParams],
                returnType
              },
              isMut: false
            });
          }
        }
        const recType = { kind: "rec", fields };
        for (const f of fields) {
          if (f.type.kind === "fun" && f.type.params.length > 0) {
            f.type.params[0].type = recType;
          }
        }
        return recType;
      }
      case "e_record_update": {
        const baseType = prune(this.synthExpr(expr.base, env2));
        if (baseType.kind === "rec") {
          const updatedFields = [...baseType.fields];
          for (const u of expr.updates) {
            const valType = this.synthExpr(u.value, env2);
            const idx = updatedFields.findIndex((f) => f.name === u.name);
            if (idx >= 0) {
              this.unify(updatedFields[idx].type, valType, expr.loc);
            } else {
              updatedFields.push({ name: u.name, type: valType, isMut: u.isMut });
            }
          }
          return { kind: "rec", fields: updatedFields };
        }
        return baseType;
      }
      case "e_tuple": {
        return {
          kind: "tup",
          elements: expr.elements.map((e) => this.synthExpr(e, env2))
        };
      }
      case "e_lambda": {
        const localEnv = createScopedEnv(env2);
        const typeVarMap = /* @__PURE__ */ new Map();
        const quantifiers = [];
        const quantifierKinds = /* @__PURE__ */ new Map();
        for (const tp of expr.typeParams || []) {
          const name = getTypeParamName(tp);
          const kind = getTypeParamKind(tp);
          quantifiers.push(name);
          quantifierKinds.set(name, kind);
          typeVarMap.set(name, createTypeVarForParam(tp));
        }
        const params = expr.params.map((p) => ({
          name: p.name,
          type: p.type ? this.astToType(p.type, env2, typeVarMap) : freshTypeVar(p.name),
          loc: p.loc
        }));
        for (const p of params) {
          localEnv.vars.set(p.name, p.type);
          const isDoBind = expr.isDoBind;
          const doScope = expr.doScopeLoc;
          if (!p.name.startsWith("$m_val_")) {
            this.registerSymbol({
              name: p.name,
              type: p.type,
              kind: isDoBind ? "variable" : "parameter",
              loc: p.loc || expr.loc,
              containerName: isDoBind ? void 0 : "anonymous function",
              scopeRange: {
                startLine: p.loc?.line || expr.loc?.line || 1,
                startCol: 1,
                endLine: doScope?.endLine || expr.body.loc?.endLine || (expr.loc?.line ? expr.loc.line + 5e3 : 999999),
                endCol: doScope?.endCol || expr.body.loc?.endCol || 999999
              },
              doc: isDoBind ? `Local variable \`${p.name}\` bound in \`do\` block` : `Parameter \`${p.name}\` of anonymous function`
            });
          }
        }
        let returnType;
        if (expr.returnType) {
          returnType = this.astToType(expr.returnType, env2, typeVarMap);
          localEnv.currentReturnType = returnType;
          this.checkExpr(expr.body, returnType, localEnv);
        } else {
          const retVar = freshTypeVar("ret");
          localEnv.currentReturnType = retVar;
          returnType = this.synthExpr(expr.body, localEnv);
          this.unify(returnType, retVar, expr.loc);
        }
        const funType = { kind: "fun", params, returnType };
        if (quantifiers.length > 0) {
          return { kind: "poly", quantifiers, quantifierKinds, type: funType };
        }
        return funType;
      }
      case "e_if": {
        this.checkExpr(expr.cond, PRIM_BOOLEAN, env2);
        if (expr.elseExpr) {
          const thenType = this.synthExpr(expr.thenExpr, env2);
          this.checkExpr(expr.elseExpr, thenType, env2);
          return thenType;
        } else {
          this.synthExpr(expr.thenExpr, env2);
          return PRIM_VOID;
        }
      }
      case "e_block": {
        const localEnv = createScopedEnv(env2);
        this.checkStatementList(expr.statements, localEnv);
        if (expr.result) {
          return this.synthExpr(expr.result, localEnv);
        }
        return PRIM_VOID;
      }
      case "e_match": {
        const scrutineeType = this.synthExpr(expr.scrutinee, env2);
        return this.checkMatch(expr.arms, expr.hasRest, scrutineeType, void 0, env2, expr.loc);
      }
      case "e_switch": {
        const discriminantType = this.synthExpr(expr.discriminant, env2);
        let resultType = void 0;
        for (const c of expr.cases) {
          const caseVals = c.values && c.values.length > 0 ? c.values : [c.value];
          for (const val of caseVals) {
            const caseValueType = this.synthExpr(val, env2);
            this.unify(discriminantType, caseValueType, val.loc || expr.loc);
          }
          const bodyType = this.synthExpr(c.body, env2);
          if (!resultType) {
            resultType = bodyType;
          } else {
            this.unify(resultType, bodyType, c.body.loc || expr.loc);
          }
        }
        if (expr.defaultCase) {
          const defaultType = this.synthExpr(expr.defaultCase, env2);
          if (!resultType) {
            resultType = defaultType;
          } else {
            this.unify(resultType, defaultType, expr.defaultCase.loc || expr.loc);
          }
        }
        return resultType || PRIM_VOID;
      }
      case "e_list_comp": {
        const iterType = this.synthExpr(expr.iterable, env2);
        let elementType = freshTypeVar("a");
        const arrayType = { kind: "tup", elements: [elementType] };
        this.unify(iterType, arrayType, expr.loc);
        const localEnv = createScopedEnv(env2);
        localEnv.vars.set(expr.param, elementType);
        this.registerSymbol({
          name: expr.param,
          type: elementType,
          kind: "loop",
          loc: expr.loc,
          scopeRange: {
            startLine: expr.loc?.line || 1,
            startCol: expr.loc?.col || 1,
            endLine: expr.loc?.endLine || (expr.loc?.line ? expr.loc.line + 100 : 999999),
            endCol: expr.loc?.endCol || 999999
          },
          doc: `List comprehension element \`${expr.param}\``
        });
        if (expr.condition) {
          const condType = this.synthExpr(expr.condition, localEnv);
          this.unify(condType, PRIM_BOOLEAN, expr.condition.loc);
        }
        const resType = this.synthExpr(expr.element, localEnv);
        return { kind: "tup", elements: [resType] };
      }
      case "e_range": {
        this.checkExpr(expr.start, PRIM_NUMBER, env2);
        this.checkExpr(expr.end, PRIM_NUMBER, env2);
        return { kind: "tup", elements: [PRIM_NUMBER] };
      }
      case "e_for": {
        const localEnv = createScopedEnv(env2);
        if (expr.init) {
          if (expr.init.kind === "s_let") {
            this.checkStatement(expr.init, localEnv);
          } else if (expr.init.kind === "s_expr") {
            this.synthExpr(expr.init.expr, localEnv);
          } else if (expr.init.kind.startsWith("e_")) {
            this.synthExpr(expr.init, localEnv);
          }
        }
        if (expr.cond) {
          this.checkExpr(expr.cond, PRIM_BOOLEAN, localEnv);
        }
        if (expr.update) {
          this.synthExpr(expr.update, localEnv);
        }
        this.synthExpr(expr.body, localEnv);
        return PRIM_VOID;
      }
      case "e_while": {
        const localEnv = createScopedEnv(env2);
        this.checkExpr(expr.cond, PRIM_BOOLEAN, localEnv);
        this.synthExpr(expr.body, localEnv);
        return PRIM_VOID;
      }
      case "e_break":
      case "e_continue": {
        return PRIM_VOID;
      }
      case "e_return": {
        const expectedRet = env2.currentReturnType;
        if (!expectedRet) {
          this.addError(
            `A 'return' statement can only be used within a function body.`,
            expr.loc,
            "Control Flow"
          );
          return PRIM_VOID;
        }
        if (expr.value) {
          this.checkExpr(expr.value, expectedRet, env2);
          return expectedRet;
        } else {
          this.unify(PRIM_VOID, expectedRet, expr.loc);
          return PRIM_VOID;
        }
      }
      case "e_do": {
        const desugared = desugarDo(expr);
        return this.synthExpr(desugared, env2);
      }
      case "e_where": {
        const localEnv = createScopedEnv(env2);
        this.checkStatementList(expr.bindings, localEnv);
        return this.synthExpr(expr.expr, localEnv);
      }
    }
  }
  checkExpr(expr, expected, env2) {
    this.recursionDepth++;
    if (this.recursionDepth > this.maxRecursionDepth) {
      this.addError(
        `Type error: Maximum recursion depth of ${this.maxRecursionDepth} exceeded during type inference/checking. Check for complex or infinitely recursive GADT types.`,
        expr.loc,
        "Type Checking"
      );
      this.recursionDepth--;
      return;
    }
    try {
      this.checkExprInner(expr, expected, env2);
    } finally {
      this.recursionDepth--;
    }
  }
  checkExprInner(expr, expected, env2) {
    const expectedPruned = prune(expected);
    if (expr.kind === "e_do") {
      const desugared = desugarDo(expr);
      this.checkExpr(desugared, expectedPruned, env2);
      return;
    }
    if (expr.kind === "e_where") {
      const localEnv = createScopedEnv(env2);
      this.checkStatementList(expr.bindings, localEnv);
      this.checkExpr(expr.expr, expectedPruned, localEnv);
      return;
    }
    if (expr.kind === "e_lambda" && expectedPruned.kind === "fun") {
      const localEnv = createScopedEnv(env2);
      const isDoBind = expr.isDoBind;
      const doScope = expr.doScopeLoc;
      expr.params.forEach((p, i) => {
        const pType = expectedPruned.params[i]?.type || freshTypeVar(p.name);
        localEnv.vars.set(p.name, pType);
        if (!p.name.startsWith("$m_val_")) {
          this.registerSymbol({
            name: p.name,
            type: pType,
            kind: isDoBind ? "variable" : "parameter",
            loc: p.loc || expr.loc,
            containerName: isDoBind ? void 0 : "anonymous function",
            scopeRange: {
              startLine: p.loc?.line || expr.loc?.line || 1,
              startCol: 1,
              endLine: doScope?.endLine || expr.body.loc?.endLine || (expr.loc?.line ? expr.loc.line + 5e3 : 999999),
              endCol: doScope?.endCol || expr.body.loc?.endCol || 999999
            },
            doc: isDoBind ? `Local variable \`${p.name}\` bound in \`do\` block` : `Parameter \`${p.name}\` of anonymous function`
          });
        }
      });
      localEnv.currentReturnType = expectedPruned.returnType;
      this.checkExpr(expr.body, expectedPruned.returnType, localEnv);
      return;
    }
    if (expr.kind === "e_block") {
      const localEnv = createScopedEnv(env2);
      this.checkStatementList(expr.statements, localEnv);
      if (expr.result) {
        this.checkExpr(expr.result, expectedPruned, localEnv);
      }
      return;
    }
    if (expr.kind === "e_range") {
      const rangeType = this.synthExpr(expr, env2);
      this.unify(rangeType, expectedPruned, expr.loc);
      return;
    }
    if (expr.kind === "e_return") {
      const expectedRet = env2.currentReturnType || expectedPruned;
      if (expr.value) {
        this.checkExpr(expr.value, expectedRet, env2);
      } else {
        this.unify(PRIM_VOID, expectedRet, expr.loc);
      }
      return;
    }
    if (expr.kind === "e_match") {
      const scrutineeType = this.synthExpr(expr.scrutinee, env2);
      this.checkMatch(expr.arms, expr.hasRest, scrutineeType, expectedPruned, env2, expr.loc);
      return;
    }
    if (expr.kind === "e_var" && expectedPruned.kind === "poly") {
      let varType;
      let curr = env2;
      while (curr) {
        if (curr.vars.has(expr.name)) {
          varType = curr.vars.get(expr.name);
          break;
        }
        curr = curr.parent;
      }
      if (varType && varType.kind === "poly") {
        this.unify(varType, expectedPruned, expr.loc);
        return;
      }
    }
    const synthed = this.synthExpr(expr, env2);
    this.unify(synthed, expectedPruned, expr.loc);
  }
  checkFunCall(funType, args, env2, loc) {
    const fn = prune(funType);
    if (fn.kind === "poly") {
      const inst = this.instantiate(fn);
      return this.checkFunCall(inst, args, env2, loc);
    }
    if (fn.kind === "fun") {
      if (args.length !== fn.params.length) {
        this.addError(
          `Expected ${fn.params.length} arguments, but got ${args.length}`,
          loc,
          "Type Checking"
        );
      }
      fn.params.forEach((p, i) => {
        if (args[i]) {
          this.checkExpr(args[i], p.type, env2);
        }
      });
      return fn.returnType;
    }
    return freshTypeVar("ret");
  }
  freshCopy(type, map = /* @__PURE__ */ new Map(), visited = /* @__PURE__ */ new Map()) {
    const t = prune(type);
    if (visited.has(t)) {
      return visited.get(t);
    }
    switch (t.kind) {
      case "var": {
        if (!map.has(t.id)) {
          map.set(t.id, freshTypeVar(t.name));
        }
        return map.get(t.id);
      }
      case "fun": {
        const newFun = { kind: "fun", params: [], returnType: PRIM_VOID };
        visited.set(t, newFun);
        newFun.params = t.params.map((p) => ({ ...p, type: this.freshCopy(p.type, map, visited) }));
        newFun.returnType = this.freshCopy(t.returnType, map, visited);
        return newFun;
      }
      case "rec": {
        const newRec = { kind: "rec", fields: [] };
        visited.set(t, newRec);
        newRec.fields = t.fields.map((f) => ({ ...f, type: this.freshCopy(f.type, map, visited) }));
        return newRec;
      }
      case "tup": {
        const newTup = { kind: "tup", elements: [] };
        visited.set(t, newTup);
        newTup.elements = t.elements.map((e) => this.freshCopy(e, map, visited));
        return newTup;
      }
      case "cons": {
        const newCons = { kind: "cons", name: t.name, args: [] };
        visited.set(t, newCons);
        newCons.args = t.args.map((a) => this.freshCopy(a, map, visited));
        return newCons;
      }
      case "poly": {
        const newPoly = { kind: "poly", quantifiers: t.quantifiers, quantifierKinds: t.quantifierKinds, type: PRIM_VOID };
        visited.set(t, newPoly);
        newPoly.type = this.freshCopy(t.type, map, visited);
        return newPoly;
      }
      case "hkt_app": {
        return prune({
          kind: "hkt_app",
          constructor: this.freshCopy(t.constructor, map, visited),
          args: t.args.map((a) => this.freshCopy(a, map, visited))
        });
      }
      case "type_lambda": {
        return {
          kind: "type_lambda",
          params: t.params,
          body: this.freshCopy(t.body, map, visited)
        };
      }
      default:
        return t;
    }
  }
  freshCopyPair(t1, t2) {
    const map = /* @__PURE__ */ new Map();
    const c1 = this.freshCopy(t1, map);
    const c2 = t2 ? this.freshCopy(t2, map) : void 0;
    return [c1, c2];
  }
  // GADT Refinement & Match Arm Checker
  checkMatch(arms, hasRest, scrutineeType, expectedType, env2, loc) {
    const overallResultType = expectedType || freshTypeVar("arm_res");
    const scrutineePruned = prune(scrutineeType);
    this.checkExhaustiveness(arms, hasRest, scrutineePruned, env2, loc);
    for (const arm of arms) {
      const armEnv = createScopedEnv(env2);
      const [armScrutinee, armExpected] = this.freshCopyPair(scrutineePruned, expectedType);
      const targetExpected = armExpected || freshTypeVar("arm_res");
      this.bindPattern(arm.pattern, armScrutinee, armEnv);
      if (arm.guard) {
        this.checkExpr(arm.guard, PRIM_BOOLEAN, armEnv);
      }
      this.checkExpr(arm.body, targetExpected, armEnv);
      if (!expectedType) {
        this.unify(targetExpected, overallResultType, arm.loc);
      }
    }
    return overallResultType;
  }
  bindPattern(pat, targetType, env2) {
    const type = prune(targetType);
    switch (pat.kind) {
      case "p_var":
        env2.vars.set(pat.name, type);
        this.registerSymbol({
          name: pat.name,
          type,
          kind: "pattern",
          loc: pat.loc,
          doc: `Pattern variable \`${pat.name}\``
        });
        break;
      case "p_as":
        env2.vars.set(pat.name, type);
        this.registerSymbol({
          name: pat.name,
          type,
          kind: "pattern",
          loc: pat.loc,
          doc: `Pattern alias variable \`${pat.name}\``
        });
        this.bindPattern(pat.pattern, type, env2);
        break;
      case "p_ctor": {
        let ctorType = env2.vars.get(pat.name);
        if (ctorType) {
          const inst = this.instantiate(ctorType);
          if (inst.kind === "fun") {
            if (pat.args.length !== inst.params.length) {
              this.addError(
                `Constructor '${pat.name}' expects ${inst.params.length} arguments, but pattern has ${pat.args.length}`,
                pat.loc,
                "Pattern Match"
              );
            }
            this.unify(inst.returnType, type, pat.loc);
            pat.args.forEach((argPat, i) => {
              if (inst.params[i]) {
                this.bindPattern(argPat, inst.params[i].type, env2);
              } else {
                this.bindPattern(argPat, freshTypeVar(`arg${i}`), env2);
              }
            });
          } else {
            if (pat.args.length > 0) {
              this.addError(
                `Constructor '${pat.name}' expects 0 arguments, but pattern has ${pat.args.length}`,
                pat.loc,
                "Pattern Match"
              );
            }
            this.unify(inst, type, pat.loc);
          }
        } else {
          const allCtors = [];
          let gEnv = env2;
          while (gEnv) {
            for (const gadt of Array.from(gEnv.gadts.values())) {
              for (const c of gadt.constructors) {
                if (!allCtors.includes(c.name)) allCtors.push(c.name);
              }
            }
            gEnv = gEnv.parent;
          }
          const closest = findBestSuggestion(pat.name, allCtors);
          const suggestion = closest ? ` Did you mean '${closest}'?` : "";
          this.addError(
            `Unknown constructor '${pat.name}' in pattern match.${suggestion}`,
            pat.loc,
            "Pattern Match",
            closest ? [{ title: `\u{1F4A1} Replace with constructor '${closest}'`, targetLine: pat.loc?.line, replacementText: closest }] : void 0
          );
        }
        break;
      }
      case "p_record": {
        if (type.kind === "rec") {
          for (const f of pat.fields) {
            const targetField = type.fields.find((tf) => tf.name === f.name);
            if (targetField) {
              const fieldType = targetField.type;
              if (f.pattern) {
                this.bindPattern(f.pattern, fieldType, env2);
              } else {
                const varName = f.alias || f.name;
                env2.vars.set(varName, fieldType);
              }
            }
          }
        }
        break;
      }
      case "p_tuple": {
        if (type.kind === "tup") {
          pat.elements.forEach((elemPat, i) => {
            if (type.elements[i]) {
              this.bindPattern(elemPat, type.elements[i], env2);
            }
          });
        }
        break;
      }
      case "p_literal": {
        const litType = typeof pat.value === "number" ? PRIM_NUMBER : typeof pat.value === "string" ? PRIM_STRING : PRIM_BOOLEAN;
        this.unify(litType, type, pat.loc);
        break;
      }
    }
  }
  checkExhaustiveness(arms, hasRest, scrutineeType, env2, loc) {
    if (hasRest) return;
    const hasCatchAll = arms.some(
      (a) => a.pattern.kind === "p_wildcard" || a.pattern.kind === "p_var" || a.pattern.kind === "p_rest"
    );
    if (hasCatchAll) return;
    if (scrutineeType.kind === "cons") {
      let gEnv = env2;
      let gadtDecl;
      while (gEnv) {
        if (gEnv.gadts.has(scrutineeType.name)) {
          gadtDecl = gEnv.gadts.get(scrutineeType.name);
          break;
        }
        gEnv = gEnv.parent;
      }
      if (gadtDecl) {
        const coveredCtors = /* @__PURE__ */ new Set();
        for (const arm of arms) {
          if (arm.pattern.kind === "p_ctor") {
            coveredCtors.add(arm.pattern.name);
          }
        }
        const missing = gadtDecl.constructors.map((c) => c.name).filter((c) => !coveredCtors.has(c));
        if (missing.length > 0) {
          this.addError(
            `Non-exhaustive pattern match on type '${scrutineeType.name}'. Missing constructors: ${missing.join(", ")}`,
            loc,
            "Pattern Match",
            missing.map((m) => ({
              title: `\u{1F4A1} Add match arm for '${m}'`,
              actionKind: "add_match_arm",
              targetLine: (loc?.line || 1) + arms.length,
              replacementText: `  | ${m}(_) => { /* handle ${m} */ }
`
            }))
          );
        }
      }
    }
  }
  // Instantiate polymorphic type
  instantiate(type) {
    const t = prune(type);
    if (t.kind === "poly") {
      const map = /* @__PURE__ */ new Map();
      for (const q of t.quantifiers) {
        const k = t.quantifierKinds?.get(q) || KIND_STAR;
        map.set(q, freshTypeVar(q, k));
      }
      return this.substituteTypeParams(t.type, map);
    }
    return t;
  }
  occursIn(id, type, visited = /* @__PURE__ */ new Set()) {
    const t = prune(type);
    if (visited.has(t)) return false;
    visited.add(t);
    if (t.kind === "var") return t.id === id;
    if (t.kind === "fun") {
      return t.params.some((p) => this.occursIn(id, p.type, visited)) || this.occursIn(id, t.returnType, visited);
    }
    if (t.kind === "rec") {
      return t.fields.some((f) => this.occursIn(id, f.type, visited));
    }
    if (t.kind === "tup") {
      return t.elements.some((e) => this.occursIn(id, e, visited));
    }
    if (t.kind === "cons") {
      return t.args.some((a) => this.occursIn(id, a, visited));
    }
    if (t.kind === "poly") {
      return this.occursIn(id, t.type, visited);
    }
    if (t.kind === "hkt_app") {
      return this.occursIn(id, t.constructor, visited) || t.args.some((a) => this.occursIn(id, a, visited));
    }
    if (t.kind === "type_lambda") {
      return this.occursIn(id, t.body, visited);
    }
    return false;
  }
  // Unification Algorithm
  unify(t1, t2, loc) {
    this.unifyDepth++;
    if (this.unifyDepth > this.maxUnifyDepth) {
      this.addError(
        `Type error: Maximum unification depth of ${this.maxUnifyDepth} exceeded during type unification. Check for complex recursive GADT types.`,
        loc,
        "Type Unification"
      );
      this.unifyDepth--;
      return;
    }
    try {
      this.unifyInner(t1, t2, loc);
    } finally {
      this.unifyDepth--;
    }
  }
  unifyInner(t1, t2, loc) {
    const p1 = prune(t1);
    const p2 = prune(t2);
    if (p1 === p2) return;
    if (p1.kind === "poly" && p2.kind === "poly") {
      if (p1.quantifiers.length === p2.quantifiers.length) {
        const freshVars = p1.quantifiers.map((q) => freshTypeVar(q));
        const subst1 = /* @__PURE__ */ new Map();
        const subst2 = /* @__PURE__ */ new Map();
        p1.quantifiers.forEach((q, i) => {
          subst1.set(q, freshVars[i]);
          subst2.set(p2.quantifiers[i], freshVars[i]);
        });
        const p1BodySubst = this.substituteTypeParams(p1.type, subst1);
        const p2BodySubst = this.substituteTypeParams(p2.type, subst2);
        this.unify(p1BodySubst, p2BodySubst, loc);
        return;
      }
    }
    if (p1.kind === "poly") {
      this.unify(this.instantiate(p1), p2, loc);
      return;
    }
    if (p2.kind === "poly") {
      this.unify(p1, this.instantiate(p2), loc);
      return;
    }
    if (p1.kind === "var") {
      if (p2.kind === "var" && p1.id === p2.id) return;
      if (this.occursIn(p1.id, p2)) {
        this.addError(
          `Type error: Occurs check failed. Type variable '${p1.name || `'t${p1.id}`}' occurs within recursive type '${typeToString(p2)}', which would construct an infinite type.`,
          loc,
          "Type Unification"
        );
        return;
      }
      p1.instance = p2;
      return;
    }
    if (p2.kind === "var") {
      if (this.occursIn(p2.id, p1)) {
        this.addError(
          `Type error: Occurs check failed. Type variable '${p2.name || `'t${p2.id}`}' occurs within recursive type '${typeToString(p1)}', which would construct an infinite type.`,
          loc,
          "Type Unification"
        );
        return;
      }
      p2.instance = p1;
      return;
    }
    if (p1.kind === "prim" && p2.kind === "prim" && p1.name === p2.name) {
      return;
    }
    const pairKey = `${this.getOrAssignId(p1)}:${this.getOrAssignId(p2)}`;
    if (this.unifyingPairs.has(pairKey)) return;
    this.unifyingPairs.add(pairKey);
    try {
      if (p1.kind === "hkt_app" && p2.kind === "hkt_app") {
        this.unify(p1.constructor, p2.constructor, loc);
        p1.args.forEach((a, i) => {
          if (p2.args[i]) this.unify(a, p2.args[i], loc);
        });
        return;
      }
      if (p1.kind === "type_lambda" && p2.kind === "type_lambda") {
        if (p1.params.length === p2.params.length) {
          const subst = /* @__PURE__ */ new Map();
          p1.params.forEach((p, i) => {
            subst.set(p2.params[i], { kind: "var", id: 0, name: p });
          });
          const p2BodySubst = this.substituteTypeParams(p2.body, subst);
          this.unify(p1.body, p2BodySubst, loc);
          return;
        }
      }
      if (p1.kind === "hkt_app" && p2.kind === "cons") {
        const c1 = prune(p1.constructor);
        if (c1.kind === "var" && p1.args.length === p2.args.length) {
          c1.instance = {
            kind: "type_lambda",
            params: p1.args.map((_, i) => `$p${i}`),
            body: {
              kind: "cons",
              name: p2.name,
              args: p1.args.map((_, i) => ({ kind: "var", id: -100 - i, name: `$p${i}` }))
            }
          };
          p1.args.forEach((a, i) => {
            if (p2.args[i]) this.unify(a, p2.args[i], loc);
          });
          return;
        }
      }
      if (p2.kind === "hkt_app" && p1.kind === "cons") {
        const c2 = prune(p2.constructor);
        if (c2.kind === "var" && p2.args.length === p1.args.length) {
          c2.instance = {
            kind: "type_lambda",
            params: p2.args.map((_, i) => `$p${i}`),
            body: {
              kind: "cons",
              name: p1.name,
              args: p2.args.map((_, i) => ({ kind: "var", id: -100 - i, name: `$p${i}` }))
            }
          };
          p2.args.forEach((a, i) => {
            if (p1.args[i]) this.unify(a, p1.args[i], loc);
          });
          return;
        }
      }
      if (p1.kind === "cons" && p2.kind === "cons" && p1.name === p2.name) {
        p1.args.forEach((a, i) => {
          if (p2.args[i]) this.unify(a, p2.args[i], loc);
        });
        return;
      }
      if (p1.kind === "fun" && p2.kind === "fun") {
        p1.params.forEach((p, i) => {
          if (p2.params[i]) this.unify(p.type, p2.params[i].type, loc);
        });
        this.unify(p1.returnType, p2.returnType, loc);
        return;
      }
      if (p1.kind === "tup" && p2.kind === "tup") {
        if (p1.elements.length === 1 && p2.elements.length > 1) {
          p2.elements.forEach((e) => this.unify(p1.elements[0], e, loc));
          return;
        }
        if (p2.elements.length === 1 && p1.elements.length > 1) {
          p1.elements.forEach((e) => this.unify(e, p2.elements[0], loc));
          return;
        }
        p1.elements.forEach((e, i) => {
          if (p2.elements[i]) this.unify(e, p2.elements[i], loc);
        });
        return;
      }
      if (p1.kind === "rec" && p2.kind === "rec") {
        p2.fields.forEach((f) => {
          const match = p1.fields.find((f1) => f1.name === f.name);
          if (match) {
            this.unify(match.type, f.type, loc);
          } else {
            this.addError(
              `Record type mismatch: Missing required field '${f.name}' in record`,
              loc,
              "Type Unification"
            );
          }
        });
        return;
      }
      const mismatch = this.formatHumanizedTypeMismatch(p1, p2);
      this.addError(
        mismatch.message,
        loc,
        "Type Unification",
        mismatch.quickFixes
      );
    } finally {
      this.unifyingPairs.delete(pairKey);
    }
  }
  formatHumanizedTypeMismatch(p1, p2) {
    const str1 = typeToString(p1);
    const str2 = typeToString(p2);
    const base = `Type mismatch: cannot unify '${str1}' with '${str2}'`;
    if (str1 === "number" && str2 === "string") {
      return {
        message: `${base}. Expected a string, but received a number. Tip: Convert number to string using 'to_string(...)'.`,
        quickFixes: [{ title: "\u{1F4A1} Convert number using to_string(...)", actionKind: "wrap_expression" }]
      };
    }
    if (str1 === "string" && str2 === "number") {
      return {
        message: `${base}. Expected a number, but received a string. Tip: Parse with 'parse_int(...)' or remove quotes.`,
        quickFixes: [{ title: "\u{1F4A1} Parse string using parse_int(...)", actionKind: "wrap_expression" }]
      };
    }
    if (str1 === "boolean" && str2 === "number" || str1 === "number" && str2 === "boolean") {
      return {
        message: `${base}. Numbers and booleans cannot be implicitly coerced in TypeLang. Tip: Use comparison 'x != 0' for condition checks or 'if (b) 1 else 0'.`
      };
    }
    if (str1 === "boolean" && str2 === "string" || str1 === "string" && str2 === "boolean") {
      return {
        message: `${base}. Booleans and strings are incompatible types. Tip: Convert boolean using 'to_string(b)' or 'if (b) "true" else "false"'.`
      };
    }
    if ((p1.kind === "fun" || p1.kind === "poly") && (p2.kind === "prim" || p2.kind === "tup" || p2.kind === "rec")) {
      return {
        message: `${base}. Found a function definition or reference where a '${str2}' value was expected (did you forget to invoke it with '()'?).`
      };
    }
    if ((p2.kind === "fun" || p2.kind === "poly") && (p1.kind === "prim" || p1.kind === "tup" || p1.kind === "rec")) {
      return {
        message: `${base}. Expected a callable function '${str2}', but found a non-callable value of type '${str1}'.`
      };
    }
    if (p1.kind === "cons" && p2.kind === "prim") {
      return {
        message: `${base}. Expected a primitive '${str2}', but found algebraic data type '${str1}'. Tip: Use pattern matching 'match (val) { ... }' to extract the inner value.`
      };
    }
    if (p2.kind === "cons" && p1.kind === "prim") {
      const ctorName = p2.name === "Option" ? "Some" : p2.name === "Result" ? "Ok" : p2.name;
      return {
        message: `${base}. Expected algebraic data type '${str2}', but found primitive '${str1}'. Tip: Wrap value with constructor '${ctorName}(...)'.`
      };
    }
    if (p1.kind === "tup" && p2.kind === "prim") {
      return {
        message: `${base}. Expected a single '${str2}', but received an array/tuple '${str1}'. Tip: Access elements with '[0]' or iterate over the list.`
      };
    }
    if (p2.kind === "tup" && p1.kind === "prim") {
      return {
        message: `${base}. Expected an array/tuple '${str2}', but received a single '${str1}'. Tip: Wrap in array brackets '[...]'.`
      };
    }
    return { message: base };
  }
  addError(message, locOrLine, colOrCategory, quickFixes, labels) {
    let line = 1;
    let col = 1;
    let endLine;
    let endCol;
    let cat = "General";
    if (typeof locOrLine === "number") {
      line = locOrLine;
      col = typeof colOrCategory === "number" ? colOrCategory : 1;
    } else if (locOrLine && typeof locOrLine === "object") {
      line = locOrLine.line || 1;
      col = locOrLine.col || 1;
      endLine = locOrLine.endLine;
      endCol = locOrLine.endCol;
      if (typeof colOrCategory === "string") {
        cat = colOrCategory;
      }
    } else if (typeof colOrCategory === "string") {
      cat = colOrCategory;
    }
    this.diagnostics.push({
      severity: "error",
      message,
      line,
      col,
      endLine,
      endCol,
      category: cat,
      labels,
      quickFixes
    });
  }
  addWarning(message, locOrLine, colOrCategory, quickFixes, labels) {
    let line = 1;
    let col = 1;
    let endLine;
    let endCol;
    let cat = "General";
    if (typeof locOrLine === "number") {
      line = locOrLine;
      col = typeof colOrCategory === "number" ? colOrCategory : 1;
    } else if (locOrLine && typeof locOrLine === "object") {
      line = locOrLine.line || 1;
      col = locOrLine.col || 1;
      endLine = locOrLine.endLine;
      endCol = locOrLine.endCol;
      if (typeof colOrCategory === "string") {
        cat = colOrCategory;
      }
    } else if (typeof colOrCategory === "string") {
      cat = colOrCategory;
    }
    this.diagnostics.push({
      severity: "warning",
      message,
      line,
      col,
      endLine,
      endCol,
      category: cat,
      labels,
      quickFixes
    });
  }
  moduleEnvToType(modEnv) {
    const fields = [];
    modEnv.vars.forEach((v, k) => {
      fields.push({ name: k, type: v });
    });
    modEnv.modules.forEach((subm, k) => {
      fields.push({ name: k, type: this.moduleEnvToType(subm) });
    });
    return { kind: "rec", fields, isModule: true };
  }
};

// ../lang/evaluator.ts
var BreakSignal = class {
};
var ContinueSignal = class {
};
var ReturnSignal = class {
  constructor(value) {
    this.value = value;
  }
};
function createInitialRuntimeEnv(stdout) {
  const env = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  env.vars.set("print", (val) => {
    const str = formatValue(val);
    stdout.push(str);
    return null;
  });
  env.vars.set("println", (val) => {
    const str = formatValue(val);
    stdout.push(str + "\n");
    return null;
  });
  env.vars.set("to_string", (val) => {
    return formatValue(val);
  });
  env.vars.set("concat", (a, b) => {
    return String(a) + String(b);
  });
  env.vars.set("requestAnimationFrame", (callback) => {
    if (typeof requestAnimationFrame !== "undefined") {
      return requestAnimationFrame(callback);
    } else {
      return setTimeout(callback, 16);
    }
  });
  env.vars.set("setInterval", (callback, ms) => {
    if (typeof setInterval !== "undefined") {
      return setInterval(callback, Number(ms));
    }
    return 0;
  });
  env.vars.set("clearInterval", (handle) => {
    if (typeof clearInterval !== "undefined") {
      clearInterval(handle);
    }
  });
  env.vars.set("setTimeout", (callback, ms) => {
    if (typeof setTimeout !== "undefined") {
      return setTimeout(callback, Number(ms));
    }
    return 0;
  });
  env.vars.set("clearTimeout", (handle) => {
    if (typeof clearTimeout !== "undefined") {
      clearTimeout(handle);
    }
  });
  env.vars.set("parse_int", (s) => parseInt(String(s), 10));
  env.vars.set("parse_float", (s) => parseFloat(String(s)));
  env.vars.set("time_now", () => Date.now());
  const mathEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  mathEnv.vars.set("sqrt", (x) => Math.sqrt(Number(x)));
  mathEnv.vars.set("abs", (x) => Math.abs(Number(x)));
  mathEnv.vars.set("floor", (x) => Math.floor(Number(x)));
  mathEnv.vars.set("ceil", (x) => Math.ceil(Number(x)));
  mathEnv.vars.set("round", (x) => Math.round(Number(x)));
  mathEnv.vars.set("min", (a, b) => Math.min(Number(a), Number(b)));
  mathEnv.vars.set("max", (a, b) => Math.max(Number(a), Number(b)));
  mathEnv.vars.set("pow", (base, exp) => Math.pow(Number(base), Number(exp)));
  mathEnv.vars.set("random", () => Math.random());
  mathEnv.vars.set("cos", (x) => Math.cos(Number(x)));
  mathEnv.vars.set("sin", (x) => Math.sin(Number(x)));
  mathEnv.vars.set("atan2", (y, x) => Math.atan2(Number(y), Number(x)));
  mathEnv.vars.set("log", (x) => Math.log(Number(x)));
  mathEnv.vars.set("bitwise_and", (a, b) => Number(a) & Number(b));
  mathEnv.vars.set("bitwise_or", (a, b) => Number(a) | Number(b));
  mathEnv.vars.set("bitwise_xor", (a, b) => Number(a) ^ Number(b));
  mathEnv.vars.set("bitwise_not", (x) => ~Number(x));
  mathEnv.vars.set("bitwise_shl", (a, b) => Number(a) << Number(b));
  mathEnv.vars.set("bitwise_shr", (a, b) => Number(a) >> Number(b));
  mathEnv.vars.set("PI", Math.PI);
  for (const name of mathEnv.vars.keys()) mathEnv.exports.add(name);
  env.modules.set("Math", mathEnv);
  const arrayEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  arrayEnv.vars.set("len", (arr) => Array.isArray(arr) ? arr.length : 0);
  arrayEnv.vars.set(
    "map",
    (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.map((x) => fn(x)) : []
  );
  arrayEnv.vars.set(
    "filter",
    (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.filter((x) => Boolean(fn(x))) : []
  );
  arrayEnv.vars.set(
    "reduce",
    (arr, init, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.reduce((acc, x) => fn(acc, x), init) : init
  );
  arrayEnv.vars.set(
    "push",
    (arr, elem) => Array.isArray(arr) ? [...arr, elem] : [elem]
  );
  arrayEnv.vars.set(
    "slice",
    (arr, start, end) => Array.isArray(arr) ? arr.slice(start, end) : []
  );
  arrayEnv.vars.set(
    "concat",
    (a, b) => Array.isArray(a) && Array.isArray(b) ? a.concat(b) : []
  );
  arrayEnv.vars.set(
    "join",
    (arr, sep) => Array.isArray(arr) ? arr.map((x) => String(x)).join(String(sep)) : ""
  );
  for (const name of arrayEnv.vars.keys()) arrayEnv.exports.add(name);
  env.modules.set("Array", arrayEnv);
  const stringEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  stringEnv.vars.set("len", (s) => String(s).length);
  stringEnv.vars.set("slice", (s, start, end) => String(s).slice(start, end));
  stringEnv.vars.set("split", (s, delim) => String(s).split(String(delim)));
  stringEnv.vars.set("contains", (s, sub) => String(s).includes(String(sub)));
  stringEnv.vars.set("parseInt", (s) => parseInt(String(s), 10));
  stringEnv.vars.set("parseFloat", (s) => parseFloat(String(s)));
  for (const name of stringEnv.vars.keys()) stringEnv.exports.add(name);
  env.modules.set("String", stringEnv);
  const SomeCtor = (v) => ({ $tag: "Some", val: v, $args: [v] });
  const NoneVal = Object.freeze({ $tag: "None", $args: [] });
  env.vars.set("Some", SomeCtor);
  env.vars.set("None", NoneVal);
  const optionEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  optionEnv.vars.set("Some", SomeCtor);
  optionEnv.vars.set("None", NoneVal);
  optionEnv.vars.set("pure", (v) => SomeCtor(v));
  optionEnv.vars.set("of", (v) => SomeCtor(v));
  optionEnv.vars.set("isSome", (opt) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some"));
  optionEnv.vars.set("isNone", (opt) => Boolean(!opt || typeof opt !== "object" || opt.$tag === "None"));
  optionEnv.vars.set("getOrElse", (opt, defaultVal) => opt && typeof opt === "object" && opt.$tag === "Some" ? opt.val : defaultVal);
  optionEnv.vars.set("map", (opt, fn) => {
    if (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function") {
      return SomeCtor(fn(opt.val));
    }
    return NoneVal;
  });
  optionEnv.vars.set("flatMap", (opt, fn) => {
    if (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function") {
      return fn(opt.val);
    }
    return NoneVal;
  });
  optionEnv.vars.set("filter", (opt, pred) => {
    if (opt && typeof opt === "object" && opt.$tag === "Some" && typeof pred === "function") {
      return pred(opt.val) ? opt : NoneVal;
    }
    return NoneVal;
  });
  optionEnv.vars.set("flatten", (opt) => {
    if (opt && typeof opt === "object" && opt.$tag === "Some") return opt.val;
    return NoneVal;
  });
  optionEnv.vars.set("zip", (optA, optB) => {
    if (optA && typeof optA === "object" && optA.$tag === "Some" && optB && typeof optB === "object" && optB.$tag === "Some") {
      return SomeCtor([optA.val, optB.val]);
    }
    return NoneVal;
  });
  optionEnv.vars.set("fromNullable", (val) => val === null || val === void 0 ? NoneVal : SomeCtor(val));
  optionEnv.vars.set("fold", (opt, defaultVal, fn) => {
    if (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function") {
      return fn(opt.val);
    }
    return defaultVal;
  });
  optionEnv.vars.set("orElse", (opt, altOpt) => {
    if (opt && typeof opt === "object" && opt.$tag === "Some") return opt;
    return altOpt;
  });
  optionEnv.vars.set("toResult", (opt, errVal) => {
    if (opt && typeof opt === "object" && opt.$tag === "Some") return OkCtor(opt.val);
    return ErrCtor(errVal);
  });
  optionEnv.vars.set("contains", (opt, elem) => {
    return Boolean(opt && typeof opt === "object" && opt.$tag === "Some" && opt.val === elem);
  });
  optionEnv.vars.set("exists", (opt, pred) => {
    return Boolean(opt && typeof opt === "object" && opt.$tag === "Some" && typeof pred === "function" && pred(opt.val));
  });
  optionEnv.vars.set("tap", (opt, fn) => {
    if (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function") fn(opt.val);
    return opt;
  });
  for (const name of optionEnv.vars.keys()) optionEnv.exports.add(name);
  env.modules.set("Option", optionEnv);
  const OkCtor = (v) => ({ $tag: "Ok", val: v, $args: [v] });
  const ErrCtor = (e) => ({ $tag: "Err", err: e, $args: [e] });
  env.vars.set("Ok", OkCtor);
  env.vars.set("Err", ErrCtor);
  const resultEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  resultEnv.vars.set("Ok", OkCtor);
  resultEnv.vars.set("Err", ErrCtor);
  resultEnv.vars.set("pure", (v) => OkCtor(v));
  resultEnv.vars.set("of", (v) => OkCtor(v));
  resultEnv.vars.set("isOk", (res) => Boolean(res && typeof res === "object" && res.$tag === "Ok"));
  resultEnv.vars.set("isErr", (res) => Boolean(!res || typeof res !== "object" || res.$tag === "Err"));
  resultEnv.vars.set("getOrElse", (res, defaultVal) => res && typeof res === "object" && res.$tag === "Ok" ? res.val : defaultVal);
  resultEnv.vars.set("map", (res, fn) => {
    if (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function") {
      return OkCtor(fn(res.val));
    }
    return res;
  });
  resultEnv.vars.set("mapError", (res, fn) => {
    if (res && typeof res === "object" && res.$tag === "Err" && typeof fn === "function") {
      return ErrCtor(fn(res.err));
    }
    return res;
  });
  resultEnv.vars.set("flatMap", (res, fn) => {
    if (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function") {
      return fn(res.val);
    }
    return res;
  });
  resultEnv.vars.set("flatten", (res) => {
    if (res && typeof res === "object" && res.$tag === "Ok") return res.val;
    return res;
  });
  resultEnv.vars.set("toOption", (res) => {
    if (res && typeof res === "object" && res.$tag === "Ok") return SomeCtor(res.val);
    return NoneVal;
  });
  resultEnv.vars.set("fromOption", (opt, errVal) => {
    if (opt && typeof opt === "object" && opt.$tag === "Some") return OkCtor(opt.val);
    return ErrCtor(errVal);
  });
  resultEnv.vars.set("fold", (res, onErr, onOk) => {
    if (res && typeof res === "object" && res.$tag === "Ok" && typeof onOk === "function") {
      return onOk(res.val);
    }
    if (res && typeof res === "object" && res.$tag === "Err" && typeof onErr === "function") {
      return onErr(res.err);
    }
    return typeof onErr === "function" ? onErr(res) : res;
  });
  resultEnv.vars.set("orElse", (res, altRes) => {
    if (res && typeof res === "object" && res.$tag === "Ok") return res;
    return altRes;
  });
  resultEnv.vars.set("zip", (resA, resB) => {
    if (resA && typeof resA === "object" && resA.$tag === "Ok" && resB && typeof resB === "object" && resB.$tag === "Ok") {
      return OkCtor([resA.val, resB.val]);
    }
    if (resA && typeof resA === "object" && resA.$tag === "Err") return resA;
    return resB;
  });
  resultEnv.vars.set("tap", (res, fn) => {
    if (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function") fn(res.val);
    return res;
  });
  resultEnv.vars.set("fromTry", (fn) => {
    try {
      return OkCtor(typeof fn === "function" ? fn() : fn);
    } catch (e) {
      return ErrCtor(e?.message || String(e));
    }
  });
  for (const name of resultEnv.vars.keys()) resultEnv.exports.add(name);
  env.modules.set("Result", resultEnv);
  const LeftCtor = (l) => ({ $tag: "Left", left: l, $args: [l] });
  const RightCtor = (r) => ({ $tag: "Right", right: r, $args: [r] });
  env.vars.set("Left", LeftCtor);
  env.vars.set("Right", RightCtor);
  const eitherEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  eitherEnv.vars.set("Left", LeftCtor);
  eitherEnv.vars.set("Right", RightCtor);
  eitherEnv.vars.set("pure", (v) => RightCtor(v));
  eitherEnv.vars.set("of", (v) => RightCtor(v));
  eitherEnv.vars.set("right", (v) => RightCtor(v));
  eitherEnv.vars.set("left", (e) => LeftCtor(e));
  eitherEnv.vars.set("isRight", (e) => Boolean(e && typeof e === "object" && e.$tag === "Right"));
  eitherEnv.vars.set("isLeft", (e) => Boolean(!e || typeof e !== "object" || e.$tag === "Left"));
  eitherEnv.vars.set("getOrElse", (e, defaultVal) => e && typeof e === "object" && e.$tag === "Right" ? e.right : defaultVal);
  eitherEnv.vars.set("map", (e, fn) => {
    if (e && typeof e === "object" && e.$tag === "Right" && typeof fn === "function") {
      return RightCtor(fn(e.right));
    }
    return e;
  });
  eitherEnv.vars.set("mapLeft", (e, fn) => {
    if (e && typeof e === "object" && e.$tag === "Left" && typeof fn === "function") {
      return LeftCtor(fn(e.left));
    }
    return e;
  });
  eitherEnv.vars.set("flatMap", (e, fn) => {
    if (e && typeof e === "object" && e.$tag === "Right" && typeof fn === "function") {
      return fn(e.right);
    }
    return e;
  });
  eitherEnv.vars.set("fold", (e, onLeft, onRight) => {
    if (e && typeof e === "object" && e.$tag === "Right" && typeof onRight === "function") {
      return onRight(e.right);
    }
    if (e && typeof e === "object" && e.$tag === "Left" && typeof onLeft === "function") {
      return onLeft(e.left);
    }
    return typeof onLeft === "function" ? onLeft(e) : e;
  });
  eitherEnv.vars.set("swap", (e) => {
    if (e && typeof e === "object" && e.$tag === "Right") return LeftCtor(e.right);
    if (e && typeof e === "object" && e.$tag === "Left") return RightCtor(e.left);
    return e;
  });
  eitherEnv.vars.set("toOption", (e) => {
    if (e && typeof e === "object" && e.$tag === "Right") return SomeCtor(e.right);
    return NoneVal;
  });
  eitherEnv.vars.set("toResult", (e) => {
    if (e && typeof e === "object" && e.$tag === "Right") return OkCtor(e.right);
    return ErrCtor(e?.left);
  });
  eitherEnv.vars.set("fromResult", (res) => {
    if (res && typeof res === "object" && res.$tag === "Ok") return RightCtor(res.val);
    return LeftCtor(res?.err);
  });
  for (const name of eitherEnv.vars.keys()) eitherEnv.exports.add(name);
  env.modules.set("Either", eitherEnv);
  const wrapReader = (fn) => ({
    $tag: "Reader",
    run: typeof fn === "function" ? fn : (_r) => fn
  });
  const readerEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  readerEnv.vars.set("pure", (v) => wrapReader((_r) => v));
  readerEnv.vars.set("of", (v) => wrapReader((_r) => v));
  readerEnv.vars.set("ask", () => wrapReader((r) => r));
  readerEnv.vars.set("asks", (fn) => wrapReader((r) => typeof fn === "function" ? fn(r) : r));
  readerEnv.vars.set("run", (reader, environment) => reader && typeof reader.run === "function" ? reader.run(environment) : reader);
  readerEnv.vars.set("map", (reader, fn) => wrapReader((r) => {
    const val = reader && typeof reader.run === "function" ? reader.run(r) : reader;
    return typeof fn === "function" ? fn(val) : val;
  }));
  readerEnv.vars.set("flatMap", (reader, fn) => wrapReader((r) => {
    const val = reader && typeof reader.run === "function" ? reader.run(r) : reader;
    const nextReader = typeof fn === "function" ? fn(val) : val;
    return nextReader && typeof nextReader.run === "function" ? nextReader.run(r) : nextReader;
  }));
  readerEnv.vars.set("local", (reader, transformEnv) => wrapReader((r) => {
    const transformed = typeof transformEnv === "function" ? transformEnv(r) : r;
    return reader && typeof reader.run === "function" ? reader.run(transformed) : reader;
  }));
  for (const name of readerEnv.vars.keys()) readerEnv.exports.add(name);
  env.modules.set("Reader", readerEnv);
  const wrapWriter = (val, log = []) => ({
    $tag: "Writer",
    val,
    log: Array.isArray(log) ? log : [log],
    run: () => [val, Array.isArray(log) ? log : [log]]
  });
  const writerEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  writerEnv.vars.set("pure", (v) => wrapWriter(v, []));
  writerEnv.vars.set("of", (v) => wrapWriter(v, []));
  writerEnv.vars.set("tell", (entry) => wrapWriter(null, [entry]));
  writerEnv.vars.set("run", (writer) => writer && typeof writer.run === "function" ? writer.run() : [writer?.val, writer?.log || []]);
  writerEnv.vars.set("value", (writer) => writer ? writer.val : null);
  writerEnv.vars.set("log", (writer) => writer && Array.isArray(writer.log) ? writer.log : []);
  writerEnv.vars.set("map", (writer, fn) => {
    const v = writer?.val;
    const currentLog = Array.isArray(writer?.log) ? writer.log : [];
    return wrapWriter(typeof fn === "function" ? fn(v) : v, currentLog);
  });
  writerEnv.vars.set("flatMap", (writer, fn) => {
    const v = writer?.val;
    const currentLog = Array.isArray(writer?.log) ? writer.log : [];
    const nextWriter = typeof fn === "function" ? fn(v) : null;
    const nextLog = Array.isArray(nextWriter?.log) ? nextWriter.log : [];
    return wrapWriter(nextWriter?.val, [...currentLog, ...nextLog]);
  });
  writerEnv.vars.set("listen", (writer) => {
    const v = writer?.val;
    const currentLog = Array.isArray(writer?.log) ? writer.log : [];
    return wrapWriter([v, currentLog], currentLog);
  });
  for (const name of writerEnv.vars.keys()) writerEnv.exports.add(name);
  env.modules.set("Writer", writerEnv);
  const LessCtor = Object.freeze({ $tag: "Less", $args: [] });
  const EqualCtor = Object.freeze({ $tag: "Equal", $args: [] });
  const GreaterCtor = Object.freeze({ $tag: "Greater", $args: [] });
  env.vars.set("Less", LessCtor);
  env.vars.set("Equal", EqualCtor);
  env.vars.set("Greater", GreaterCtor);
  const deepEquals = (a, b) => {
    if (a === b) return true;
    if (a === null || a === void 0 || b === null || b === void 0) return a === b;
    if (typeof a !== typeof b) return false;
    if (typeof a === "object") {
      if (a.$tag && b.$tag) {
        if (a.$tag !== b.$tag) return false;
        if (a.val !== void 0 && b.val !== void 0) return deepEquals(a.val, b.val);
        if (a.err !== void 0 && b.err !== void 0) return deepEquals(a.err, b.err);
        if (a.left !== void 0 && b.left !== void 0) return deepEquals(a.left, b.left);
        if (a.right !== void 0 && b.right !== void 0) return deepEquals(a.right, b.right);
      }
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
          if (!deepEquals(a[i], b[i])) return false;
        }
        return true;
      }
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const k of keysA) {
        if (!deepEquals(a[k], b[k])) return false;
      }
      return true;
    }
    return false;
  };
  const setoidEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  setoidEnv.vars.set("equals", (a, b) => deepEquals(a, b));
  setoidEnv.vars.set("notEquals", (a, b) => !deepEquals(a, b));
  setoidEnv.vars.set("fromEquals", (fn) => ({ equals: fn }));
  setoidEnv.vars.set("contramap", (setoid, fn) => ({ equals: (x, y) => setoid && typeof setoid.equals === "function" ? setoid.equals(fn(x), fn(y)) : deepEquals(fn(x), fn(y)) }));
  for (const name of setoidEnv.vars.keys()) setoidEnv.exports.add(name);
  env.modules.set("Setoid", setoidEnv);
  const compareVals = (a, b) => {
    if (a === b) return EqualCtor;
    if (typeof a === "number" && typeof b === "number") {
      return a < b ? LessCtor : GreaterCtor;
    }
    if (typeof a === "string" && typeof b === "string") {
      return a < b ? LessCtor : a > b ? GreaterCtor : EqualCtor;
    }
    if (typeof a === "boolean" && typeof b === "boolean") {
      return a === b ? EqualCtor : !a && b ? LessCtor : GreaterCtor;
    }
    return String(a) < String(b) ? LessCtor : String(a) > String(b) ? GreaterCtor : EqualCtor;
  };
  const ordEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  ordEnv.vars.set("Less", LessCtor);
  ordEnv.vars.set("Equal", EqualCtor);
  ordEnv.vars.set("Greater", GreaterCtor);
  ordEnv.vars.set("compare", (a, b) => compareVals(a, b));
  ordEnv.vars.set("min", (a, b) => compareVals(a, b) === LessCtor ? a : b);
  ordEnv.vars.set("max", (a, b) => compareVals(a, b) === GreaterCtor ? a : b);
  ordEnv.vars.set("clamp", (val, minVal, maxVal) => {
    if (compareVals(val, minVal) === LessCtor) return minVal;
    if (compareVals(val, maxVal) === GreaterCtor) return maxVal;
    return val;
  });
  ordEnv.vars.set("between", (val, minVal, maxVal) => {
    return compareVals(val, minVal) !== LessCtor && compareVals(val, maxVal) !== GreaterCtor;
  });
  ordEnv.vars.set("isLess", (a, b) => compareVals(a, b) === LessCtor);
  ordEnv.vars.set("isGreater", (a, b) => compareVals(a, b) === GreaterCtor);
  ordEnv.vars.set("isEqual", (a, b) => compareVals(a, b) === EqualCtor);
  ordEnv.vars.set("fromCompare", (fn) => ({ compare: fn }));
  ordEnv.vars.set("contramap", (ordB, fn) => ({ compare: (x, y) => ordB && typeof ordB.compare === "function" ? ordB.compare(fn(x), fn(y)) : compareVals(fn(x), fn(y)) }));
  ordEnv.vars.set("reverse", (ord) => ({ compare: (x, y) => ord && typeof ord.compare === "function" ? ord.compare(y, x) : compareVals(y, x) }));
  for (const name of ordEnv.vars.keys()) ordEnv.exports.add(name);
  env.modules.set("Ord", ordEnv);
  const combineSemigroup = (a, b) => {
    if (typeof a === "number" && typeof b === "number") return a + b;
    if (typeof a === "string" && typeof b === "string") return a + b;
    if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];
    if (a && typeof a === "object" && a.$tag === "Some" && b && typeof b === "object" && b.$tag === "Some") {
      return SomeCtor(combineSemigroup(a.val, b.val));
    }
    if (a && typeof a === "object" && a.$tag === "Some") return a;
    if (b && typeof b === "object" && b.$tag === "Some") return b;
    if (a && typeof a === "object" && typeof a.combine === "function") return a.combine(b);
    return b;
  };
  const semigroupEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  semigroupEnv.vars.set("combine", (a, b) => combineSemigroup(a, b));
  semigroupEnv.vars.set("concatAll", (list, fallback) => {
    if (!Array.isArray(list) || list.length === 0) return fallback;
    return list.reduce((acc, curr) => combineSemigroup(acc, curr));
  });
  semigroupEnv.vars.set("combineAll", (list, fallback) => {
    if (!Array.isArray(list) || list.length === 0) return fallback;
    return list.reduce((acc, curr) => combineSemigroup(acc, curr));
  });
  semigroupEnv.vars.set("first", () => ({ combine: (a, _b) => a }));
  semigroupEnv.vars.set("last", () => ({ combine: (_a, b) => b }));
  semigroupEnv.vars.set("struct", (semigroups) => ({ combine: (a, b) => {
    const res = {};
    for (const k in semigroups) res[k] = semigroups[k].combine(a[k], b[k]);
    return res;
  } }));
  semigroupEnv.vars.set("dual", (s) => ({ combine: (a, b) => s && typeof s.combine === "function" ? s.combine(b, a) : combineSemigroup(b, a) }));
  for (const name of semigroupEnv.vars.keys()) semigroupEnv.exports.add(name);
  env.modules.set("Semigroup", semigroupEnv);
  env.modules.set("SemiGroup", semigroupEnv);
  const groupEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  groupEnv.vars.set("invert", (a) => typeof a === "number" ? -a : a && typeof a.invert === "function" ? a.invert() : a);
  groupEnv.vars.set("subtract", (a, b) => typeof a === "number" && typeof b === "number" ? a - b : combineSemigroup(a, groupEnv.vars.get("invert")(b)));
  groupEnv.vars.set("SumNumber", { empty: () => 0, combine: (a, b) => a + b, invert: (a) => -a });
  groupEnv.vars.set("ProductNonZero", { empty: () => 1, combine: (a, b) => a * b, invert: (a) => 1 / a });
  for (const name of groupEnv.vars.keys()) groupEnv.exports.add(name);
  env.modules.set("Group", groupEnv);
  const monoidEmptyMap = {
    Sum: 0,
    Product: 1,
    String: "",
    Array: [],
    All: true,
    Any: false
  };
  const monoidEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  monoidEnv.vars.set("empty", (typeOrName) => typeOrName in monoidEmptyMap ? monoidEmptyMap[typeOrName] : null);
  monoidEnv.vars.set("combine", (a, b) => combineSemigroup(a, b));
  monoidEnv.vars.set("concatAll", (list, identity) => {
    if (!Array.isArray(list) || list.length === 0) return identity;
    return list.reduce((acc, curr) => combineSemigroup(acc, curr), identity);
  });
  monoidEnv.vars.set("Sum", { empty: () => 0, combine: (a, b) => a + b });
  monoidEnv.vars.set("Product", { empty: () => 1, combine: (a, b) => a * b });
  monoidEnv.vars.set("String", { empty: () => "", combine: (a, b) => a + b });
  monoidEnv.vars.set("Array", { empty: () => [], combine: (a, b) => [...a, ...b] });
  monoidEnv.vars.set("All", { empty: () => true, combine: (a, b) => a && b });
  monoidEnv.vars.set("Any", { empty: () => false, combine: (a, b) => a || b });
  monoidEnv.vars.set("struct", (monoids) => ({ empty: () => {
    const res = {};
    for (const k in monoids) res[k] = monoids[k].empty();
    return res;
  }, combine: (a, b) => {
    const res = {};
    for (const k in monoids) res[k] = monoids[k].combine(a[k], b[k]);
    return res;
  } }));
  for (const name of monoidEnv.vars.keys()) monoidEnv.exports.add(name);
  env.modules.set("Monoid", monoidEnv);
  const mapFunctor = (fa, fn) => {
    if (fa && typeof fa === "object") {
      if (fa.$tag === "Some") return SomeCtor(fn(fa.val));
      if (fa.$tag === "None") return NoneVal;
      if (fa.$tag === "Ok") return OkCtor(fn(fa.val));
      if (fa.$tag === "Err") return fa;
      if (fa.$tag === "Right") return RightCtor(fn(fa.right));
      if (fa.$tag === "Left") return fa;
      if (fa.$tag === "Valid") return ValidCtor(fn(fa.val));
      if (fa.$tag === "Invalid") return fa;
      if (typeof fa.map === "function") return fa.map(fn);
    }
    if (Array.isArray(fa)) return fa.map(fn);
    return fa;
  };
  const functorEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  functorEnv.vars.set("map", (fa, fn) => mapFunctor(fa, fn));
  functorEnv.vars.set("lift", (fn) => (fa) => mapFunctor(fa, fn));
  functorEnv.vars.set("as", (fa, val) => mapFunctor(fa, () => val));
  functorEnv.vars.set("voidRight", (fa) => mapFunctor(fa, () => null));
  for (const name of functorEnv.vars.keys()) functorEnv.exports.add(name);
  env.modules.set("Functor", functorEnv);
  const contravariantEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  contravariantEnv.vars.set("cmap", (fa, fn) => {
    if (typeof fa === "function") return (x) => fa(fn(x));
    if (fa && typeof fa.cmap === "function") return fa.cmap(fn);
    if (fa && typeof fa.contramap === "function") return fa.contramap(fn);
    return (x) => fa(fn(x));
  });
  contravariantEnv.vars.set("contramap", (fa, fn) => {
    if (typeof fa === "function") return (x) => fa(fn(x));
    return (x) => fa(fn(x));
  });
  contravariantEnv.vars.set("predicate", (pred) => ({
    run: pred,
    cmap: (fn) => (x) => pred(fn(x))
  }));
  for (const name of contravariantEnv.vars.keys()) contravariantEnv.exports.add(name);
  env.modules.set("Contravariant", contravariantEnv);
  const apApplicative = (ff, fa) => {
    if (ff && typeof ff === "object" && fa && typeof fa === "object") {
      if (ff.$tag === "Some" && fa.$tag === "Some") return SomeCtor(ff.val(fa.val));
      if (ff.$tag === "None" || fa.$tag === "None") return NoneVal;
      if (ff.$tag === "Ok" && fa.$tag === "Ok") return OkCtor(ff.val(fa.val));
      if (ff.$tag === "Err") return ff;
      if (fa.$tag === "Err") return fa;
      if (ff.$tag === "Right" && fa.$tag === "Right") return RightCtor(ff.right(fa.right));
      if (ff.$tag === "Left") return ff;
      if (fa.$tag === "Left") return fa;
      if (ff.$tag === "Valid" && fa.$tag === "Valid") return ValidCtor(ff.val(fa.val));
      if (ff.$tag === "Invalid" && fa.$tag === "Invalid") return InvalidCtor([...ff.errs, ...fa.errs]);
      if (ff.$tag === "Invalid") return ff;
      if (fa.$tag === "Invalid") return fa;
    }
    if (Array.isArray(ff) && Array.isArray(fa)) {
      const res = [];
      for (const f of ff) {
        for (const a of fa) {
          if (typeof f === "function") res.push(f(a));
        }
      }
      return res;
    }
    return fa;
  };
  const applicativeEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  applicativeEnv.vars.set("pure", (v) => SomeCtor(v));
  applicativeEnv.vars.set("ap", (ff, fa) => apApplicative(ff, fa));
  applicativeEnv.vars.set("lift2", (fn, fa, fb) => {
    const curried = mapFunctor(fa, (a) => (b) => fn(a, b));
    return apApplicative(curried, fb);
  });
  applicativeEnv.vars.set("lift3", (fn, fa, fb, fc) => {
    const curried = mapFunctor(fa, (a) => (b) => (c) => fn(a, b, c));
    const step2 = apApplicative(curried, fb);
    return apApplicative(step2, fc);
  });
  applicativeEnv.vars.set("zip", (fa, fb) => {
    const fn = (a) => (b) => [a, b];
    const step1 = mapFunctor(fa, fn);
    return apApplicative(step1, fb);
  });
  for (const name of applicativeEnv.vars.keys()) applicativeEnv.exports.add(name);
  env.modules.set("Applicative", applicativeEnv);
  const ValidCtor = (v) => Object.freeze({ $tag: "Valid", val: v, $args: [v] });
  const InvalidCtor = (errs) => Object.freeze({ $tag: "Invalid", errs: Array.isArray(errs) ? errs : [errs], $args: [Array.isArray(errs) ? errs : [errs]] });
  env.vars.set("Valid", ValidCtor);
  env.vars.set("Invalid", InvalidCtor);
  const validationEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  validationEnv.vars.set("Valid", ValidCtor);
  validationEnv.vars.set("Invalid", InvalidCtor);
  validationEnv.vars.set("pure", (v) => ValidCtor(v));
  validationEnv.vars.set("invalid", (err) => InvalidCtor([err]));
  validationEnv.vars.set("isValid", (v) => Boolean(v && typeof v === "object" && v.$tag === "Valid"));
  validationEnv.vars.set("isInvalid", (v) => Boolean(v && typeof v === "object" && v.$tag === "Invalid"));
  validationEnv.vars.set("map", (v, fn) => {
    if (v && typeof v === "object" && v.$tag === "Valid" && typeof fn === "function") {
      return ValidCtor(fn(v.val));
    }
    return v;
  });
  validationEnv.vars.set("ap", (vf, va) => apApplicative(vf, va));
  validationEnv.vars.set("accumulate", (v1, v2, fn) => {
    if (v1 && v1.$tag === "Valid" && v2 && v2.$tag === "Valid" && typeof fn === "function") {
      return ValidCtor(fn(v1.val, v2.val));
    }
    const errs1 = v1 && v1.$tag === "Invalid" ? v1.errs : [];
    const errs2 = v2 && v2.$tag === "Invalid" ? v2.errs : [];
    return InvalidCtor([...errs1, ...errs2]);
  });
  validationEnv.vars.set("getOrElse", (v, defaultVal) => v && v.$tag === "Valid" ? v.val : defaultVal);
  validationEnv.vars.set("toResult", (v) => v && v.$tag === "Valid" ? OkCtor(v.val) : ErrCtor(v?.errs));
  for (const name of validationEnv.vars.keys()) validationEnv.exports.add(name);
  env.modules.set("Validation", validationEnv);
  const bifunctorEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  bifunctorEnv.vars.set("bimap", (fab, f, g) => {
    if (fab && typeof fab === "object") {
      if (fab.$tag === "Ok") return OkCtor(g(fab.val));
      if (fab.$tag === "Err") return ErrCtor(f(fab.err));
      if (fab.$tag === "Right") return RightCtor(g(fab.right));
      if (fab.$tag === "Left") return LeftCtor(f(fab.left));
      if (typeof fab.bimap === "function") return fab.bimap(f, g);
    }
    return fab;
  });
  for (const name of bifunctorEnv.vars.keys()) bifunctorEnv.exports.add(name);
  env.modules.set("Bifunctor", bifunctorEnv);
  const profunctorEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  const dimapFn = (pab, f, g) => {
    if (typeof pab === "function") return (x) => g(pab(f(x)));
    if (pab && typeof pab.dimap === "function") return pab.dimap(f, g);
    return (x) => g(pab(f(x)));
  };
  profunctorEnv.vars.set("dimap", dimapFn);
  profunctorEnv.vars.set("promap", dimapFn);
  for (const name of profunctorEnv.vars.keys()) profunctorEnv.exports.add(name);
  env.modules.set("Profunctor", profunctorEnv);
  const foldableEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  foldableEnv.vars.set("foldLeft", (fa, initial, fn) => {
    if (Array.isArray(fa)) return fa.reduce(fn, initial);
    if (fa && typeof fa === "object") {
      if (fa.$tag === "Some") return fn(initial, fa.val);
      if (fa.$tag === "None") return initial;
      if (fa.$tag === "Ok") return fn(initial, fa.val);
      if (fa.$tag === "Err") return initial;
      if (typeof fa.reduce === "function") return fa.reduce(fn, initial);
    }
    return initial;
  });
  foldableEnv.vars.set("foldMap", (fa, monoid, fn) => {
    const combine = typeof monoid === "object" && typeof monoid.combine === "function" ? monoid.combine : combineSemigroup;
    const empty = typeof monoid === "object" && typeof monoid.empty === "function" ? monoid.empty() : typeof monoid === "string" ? monoidEmptyMap[monoid] : null;
    if (Array.isArray(fa)) {
      return fa.reduce((acc, x) => combine(acc, fn(x)), empty);
    }
    if (fa && typeof fa === "object" && (fa.$tag === "Some" || fa.$tag === "Ok")) {
      return combine(empty, fn(fa.val));
    }
    return empty;
  });
  for (const name of foldableEnv.vars.keys()) foldableEnv.exports.add(name);
  env.modules.set("Foldable", foldableEnv);
  const wrapTask = (fn) => ({
    $tag: "Task",
    run: typeof fn === "function" ? fn : () => fn
  });
  const taskEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  taskEnv.vars.set("pure", (v) => wrapTask(() => v));
  taskEnv.vars.set("of", (v) => wrapTask(() => v));
  taskEnv.vars.set("succeed", (v) => wrapTask(() => v));
  taskEnv.vars.set("delay", (fn) => wrapTask(typeof fn === "function" ? fn : () => fn));
  taskEnv.vars.set("run", (task) => task && typeof task.run === "function" ? task.run() : task);
  taskEnv.vars.set("map", (task, fn) => wrapTask(() => {
    const val = task && typeof task.run === "function" ? task.run() : task;
    return typeof fn === "function" ? fn(val) : val;
  }));
  taskEnv.vars.set("flatMap", (task, fn) => wrapTask(() => {
    const val = task && typeof task.run === "function" ? task.run() : task;
    const nextTask = typeof fn === "function" ? fn(val) : val;
    return nextTask && typeof nextTask.run === "function" ? nextTask.run() : nextTask;
  }));
  for (const name of taskEnv.vars.keys()) taskEnv.exports.add(name);
  env.modules.set("Task", taskEnv);
  const wrapIO = (computation) => ({
    $tag: "IO",
    run: typeof computation === "function" ? computation : () => computation
  });
  const ioEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  ioEnv.vars.set("pure", (v) => wrapIO(() => v));
  ioEnv.vars.set("of", (v) => wrapIO(() => v));
  ioEnv.vars.set("delay", (fn) => wrapIO(typeof fn === "function" ? fn : () => fn));
  ioEnv.vars.set("map", (io, fn) => wrapIO(() => {
    const val = io && typeof io.run === "function" ? io.run() : io;
    return typeof fn === "function" ? fn(val) : val;
  }));
  ioEnv.vars.set("flatMap", (io, fn) => wrapIO(() => {
    const val = io && typeof io.run === "function" ? io.run() : io;
    const nextIO = typeof fn === "function" ? fn(val) : val;
    return nextIO && typeof nextIO.run === "function" ? nextIO.run() : nextIO;
  }));
  ioEnv.vars.set("run", (io) => io && typeof io.run === "function" ? io.run() : io);
  ioEnv.vars.set("println", (msg) => wrapIO(() => console.log(String(msg))));
  for (const name of ioEnv.vars.keys()) ioEnv.exports.add(name);
  env.modules.set("IO", ioEnv);
  const wrapState = (fn) => ({
    $tag: "State",
    run: typeof fn === "function" ? fn : (s) => [null, s]
  });
  const stateEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  stateEnv.vars.set("pure", (v) => wrapState((s) => [v, s]));
  stateEnv.vars.set("of", (v) => wrapState((s) => [v, s]));
  stateEnv.vars.set("get", () => wrapState((s) => [s, s]));
  stateEnv.vars.set("set", (newState) => wrapState((_s) => [null, newState]));
  stateEnv.vars.set("modify", (fn) => wrapState((s) => [null, typeof fn === "function" ? fn(s) : s]));
  stateEnv.vars.set("run", (st, s) => st && typeof st.run === "function" ? st.run(s) : [null, s]);
  stateEnv.vars.set("evalState", (st, s) => {
    const res = st && typeof st.run === "function" ? st.run(s) : [null, s];
    return Array.isArray(res) ? res[0] : res;
  });
  stateEnv.vars.set("execState", (st, s) => {
    const res = st && typeof st.run === "function" ? st.run(s) : [null, s];
    return Array.isArray(res) ? res[1] : res;
  });
  stateEnv.vars.set("map", (st, fn) => wrapState((s) => {
    const [val, nextS] = st && typeof st.run === "function" ? st.run(s) : [null, s];
    return [typeof fn === "function" ? fn(val) : val, nextS];
  }));
  stateEnv.vars.set("flatMap", (st, fn) => wrapState((s) => {
    const [val, nextS] = st && typeof st.run === "function" ? st.run(s) : [null, s];
    const nextSt = typeof fn === "function" ? fn(val) : null;
    return nextSt && typeof nextSt.run === "function" ? nextSt.run(nextS) : [null, nextS];
  }));
  for (const name of stateEnv.vars.keys()) stateEnv.exports.add(name);
  env.modules.set("State", stateEnv);
  const domEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  domEnv.vars.set("getElementById", (id) => {
    if (typeof document !== "undefined") return document.getElementById(String(id));
    return {
      id: String(id),
      textContent: "",
      innerHTML: "",
      value: "",
      getContext: () => ({
        fillRect: () => {
        },
        strokeRect: () => {
        },
        clearRect: () => {
        },
        beginPath: () => {
        },
        moveTo: () => {
        },
        lineTo: () => {
        },
        stroke: () => {
        },
        fill: () => {
        },
        arc: () => {
        },
        closePath: () => {
        },
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 1
      })
    };
  });
  domEnv.vars.set("createElement", (tag) => {
    if (typeof document !== "undefined") return document.createElement(String(tag));
    return { tag: String(tag), attrs: {}, children: [], textContent: "" };
  });
  domEnv.vars.set("setText", (el, text) => {
    if (el && "textContent" in el) el.textContent = String(text);
    return null;
  });
  domEnv.vars.set("getValue", (el) => {
    if (el && typeof el === "object" && "value" in el) return String(el.value);
    return "";
  });
  domEnv.vars.set("setValue", (el, val) => {
    if (el && typeof el === "object" && "value" in el) el.value = String(val);
    return null;
  });
  domEnv.vars.set("focus", (el) => {
    if (el && typeof el.focus === "function") el.focus();
    return null;
  });
  domEnv.vars.set("blur", (el) => {
    if (el && typeof el.blur === "function") el.blur();
    return null;
  });
  domEnv.vars.set("setHtml", (el, html) => {
    if (el && "innerHTML" in el) el.innerHTML = String(html);
    return null;
  });
  domEnv.vars.set("setAttr", (el, k, v) => {
    if (el && "setAttribute" in el) el.setAttribute(String(k), String(v));
    return null;
  });
  domEnv.vars.set("appendChild", (parent, child) => {
    if (parent && "appendChild" in parent && child) parent.appendChild(child);
    return null;
  });
  domEnv.vars.set("addEventListener", (el, evt, handler) => {
    if (el && "addEventListener" in el && typeof handler === "function") {
      el.addEventListener(String(evt), handler);
    }
    return null;
  });
  domEnv.vars.set("h", (tag, props = {}, children = []) => {
    return {
      $vnode: true,
      tag: String(tag),
      props: props || {},
      children: Array.isArray(children) ? children : [children]
    };
  });
  domEnv.vars.set("mount", (containerId, vnode) => {
    stdout.push(`[DOM Mount] Mounted Virtual DOM root into container #${typeof containerId === "string" ? containerId : "root"}
`);
    return null;
  });
  domEnv.vars.set("eval", (code) => {
    try {
      return eval(String(code));
    } catch {
      return null;
    }
  });
  domEnv.vars.set("log", (val) => {
    stdout.push(formatValue(val) + "\n");
    return null;
  });
  domEnv.vars.set("initAudio", () => null);
  domEnv.vars.set("playCustomTone", (_f, _w, _dur, _vol, _atk) => null);
  domEnv.vars.set("playNoise", (_dur, _vol) => null);
  domEnv.vars.set("playTone", (_freq, _dur, _type, _vol) => null);
  domEnv.vars.set("playRamp", (_sf, _ef, _dur, _type, _vol) => null);
  domEnv.vars.set("playSequence", (_notes, _dur, _type, _vol) => null);
  domEnv.vars.set("startMusic", (_id, _notes, _iv, _type, _vol) => null);
  domEnv.vars.set("stopMusic", (_id) => null);
  domEnv.vars.set("resumeAudio", () => null);
  domEnv.vars.set("confetti", (_count, _spread, _originY) => null);
  domEnv.vars.set("setInterval", (fn, ms) => typeof setInterval !== "undefined" ? setInterval(fn, ms) : 1);
  domEnv.vars.set("clearInterval", (id) => {
    if (typeof clearInterval !== "undefined") clearInterval(id);
    return null;
  });
  domEnv.vars.set("setTimeout", (fn, ms) => typeof setTimeout !== "undefined" ? setTimeout(fn, ms) : 1);
  domEnv.vars.set("clearTimeout", (id) => {
    if (typeof clearTimeout !== "undefined") clearTimeout(id);
    return null;
  });
  domEnv.vars.set("requestAnimationFrame", (fn) => {
    if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(fn);
    return null;
  });
  domEnv.vars.set("storageGet", (_k) => "");
  domEnv.vars.set("storageSet", (_k, _v) => null);
  domEnv.vars.set("storageRemove", (_k) => null);
  for (const name of domEnv.vars.keys()) domEnv.exports.add(name);
  env.modules.set("DOM", domEnv);
  const nodeEnv = {
    vars: /* @__PURE__ */ new Map(),
    modules: /* @__PURE__ */ new Map(),
    exports: /* @__PURE__ */ new Set()
  };
  nodeEnv.vars.set("stringify", (data) => {
    try {
      return JSON.stringify(data);
    } catch {
      return "{}";
    }
  });
  nodeEnv.vars.set("parse", (jsonStr) => {
    try {
      return JSON.parse(String(jsonStr));
    } catch {
      return null;
    }
  });
  nodeEnv.vars.set("envGet", (key) => {
    if (typeof process !== "undefined" && process.env) {
      return process.env[String(key)] || "";
    }
    return "";
  });
  nodeEnv.vars.set("readFile", (path) => {
    return `// Mock file content for ${path}`;
  });
  nodeEnv.vars.set("writeFile", (path, content) => {
    stdout.push(`[File System] Wrote ${String(content).length} bytes to ${path}
`);
    return null;
  });
  nodeEnv.vars.set("createApp", () => {
    return {
      _routes: [],
      _middlewares: [],
      name: "TypeLangExpressServer"
    };
  });
  nodeEnv.vars.set("get", (app, path, handler) => {
    if (app && app._routes) {
      app._routes.push({ method: "GET", path: String(path), handler });
    }
    return null;
  });
  nodeEnv.vars.set("post", (app, path, handler) => {
    if (app && app._routes) {
      app._routes.push({ method: "POST", path: String(path), handler });
    }
    return null;
  });
  nodeEnv.vars.set("use", (app, middleware) => {
    if (app && app._middlewares) {
      app._middlewares.push(middleware);
    }
    return null;
  });
  nodeEnv.vars.set("listen", (app, port, callback) => {
    stdout.push(`[Node Express] \u{1F680} Server running and listening on http://localhost:${port}
`);
    if (typeof callback === "function") {
      callback();
    }
    return {
      port: Number(port),
      close: () => {
        stdout.push(`[Node Express] Server on port ${port} closed
`);
      }
    };
  });
  nodeEnv.vars.set("send", (res, body) => {
    stdout.push(`[HTTP Response] ${body}
`);
    return null;
  });
  nodeEnv.vars.set("json", (res, data) => {
    const json = JSON.stringify(data);
    stdout.push(`[HTTP JSON Response] ${json}
`);
    return null;
  });
  nodeEnv.vars.set("status", (res, statusCode) => {
    if (res && typeof res === "object") {
      res.statusCode = statusCode;
    }
    return res || { statusCode };
  });
  nodeEnv.vars.set("now", () => Date.now());
  for (const name of nodeEnv.vars.keys()) nodeEnv.exports.add(name);
  env.modules.set("Node", nodeEnv);
  return env;
}
function formatValue(val, visited = /* @__PURE__ */ new Set()) {
  if (val === null || val === void 0) return "void";
  if (typeof val === "boolean" || typeof val === "number") return String(val);
  if (typeof val === "string") return val;
  if (typeof val === "function") return "<function>";
  if (typeof val === "object") {
    if (visited.has(val)) return "...";
    visited.add(val);
    if (val.$tag) {
      const keys = Object.keys(val).filter((k) => k !== "$tag");
      if (keys.length === 0) return val.$tag;
      const args = keys.map((k) => formatValue(val[k], visited)).join(", ");
      return `${val.$tag}(${args})`;
    }
    if (Array.isArray(val)) {
      return `[${val.map((v) => formatValue(v, visited)).join(", ")}]`;
    }
    const fields = Object.entries(val).filter(([k]) => typeof val[k] !== "function").map(([k, v]) => `${k}: ${formatValue(v, visited)}`).join(", ");
    return `{ ${fields} }`;
  }
  return String(val);
}
var Evaluator = class {
  constructor() {
    this.stdout = [];
    this.recursionDepth = 0;
    this.maxRecursionDepth = 500;
  }
  evalProgram(program) {
    const start = performance.now();
    this.stdout = [];
    this.recursionDepth = 0;
    const env2 = createInitialRuntimeEnv(this.stdout);
    let lastResult = null;
    for (const stmt of program.statements) {
      lastResult = this.evalStatement(stmt, env2);
    }
    const end = performance.now();
    return {
      stdout: this.stdout,
      result: lastResult,
      executionTimeMs: Math.round((end - start) * 100) / 100
    };
  }
  evalStatement(stmt, env2) {
    switch (stmt.kind) {
      case "s_let": {
        const val = this.evalExpr(stmt.init, env2);
        env2.vars.set(stmt.name, val);
        if (stmt.isExported) env2.exports.add(stmt.name);
        return val;
      }
      case "s_function": {
        const fn = (...args) => {
          const localEnv = {
            vars: /* @__PURE__ */ new Map(),
            modules: /* @__PURE__ */ new Map(),
            exports: /* @__PURE__ */ new Set(),
            parent: env2
          };
          if (stmt.whereBindings && stmt.whereBindings.length > 0) {
            for (const wStmt of stmt.whereBindings) {
              this.evalStatement(wStmt, localEnv);
            }
          }
          stmt.params.forEach((p, i) => {
            localEnv.vars.set(p.name, args[i]);
          });
          try {
            return this.evalExpr(stmt.body, localEnv);
          } catch (e) {
            if (e instanceof ReturnSignal) return e.value;
            throw e;
          }
        };
        env2.vars.set(stmt.name, fn);
        if (stmt.isExported) env2.exports.add(stmt.name);
        return fn;
      }
      case "s_gadt": {
        for (const ctor of stmt.decl.constructors) {
          if (ctor.params.length === 0) {
            env2.vars.set(ctor.name, { $tag: ctor.name });
          } else {
            const factory = (...args) => {
              const obj = { $tag: ctor.name };
              ctor.params.forEach((p, i) => {
                obj[p.name] = args[i];
              });
              return obj;
            };
            env2.vars.set(ctor.name, factory);
          }
          if (stmt.isExported) env2.exports.add(ctor.name);
        }
        return null;
      }
      case "s_type_alias": {
        return null;
      }
      case "s_module": {
        const modEnv = {
          vars: /* @__PURE__ */ new Map(),
          modules: /* @__PURE__ */ new Map(),
          exports: /* @__PURE__ */ new Set(),
          parent: env2
        };
        env2.modules.set(stmt.name, modEnv);
        if (stmt.isExported) env2.exports.add(stmt.name);
        for (const mStmt of stmt.body) {
          this.evalStatement(mStmt, modEnv);
        }
        return modEnv;
      }
      case "s_import": {
        this.processImport(stmt, env2);
        return null;
      }
      case "s_extern_module": {
        const modEnv = {
          vars: /* @__PURE__ */ new Map(),
          modules: /* @__PURE__ */ new Map(),
          exports: /* @__PURE__ */ new Set(),
          parent: env2
        };
        const jsModuleObj = {};
        for (const fn of stmt.functions) {
          const fnImpl = (...args) => {
            const globalObj = typeof globalThis !== "undefined" ? globalThis : {};
            const lib = globalObj[stmt.name] || (typeof window !== "undefined" ? window[stmt.name] : void 0);
            if (lib && typeof lib[fn.name] === "function") {
              return lib[fn.name](...args);
            }
            if (fn.name === "sum" && Array.isArray(args[0])) {
              return args[0].reduce((a, b) => Number(a) + Number(b), 0);
            }
            if (fn.name === "chunk" && Array.isArray(args[0])) {
              const arr = args[0], size = Number(args[1]) || 1;
              const res = [];
              for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
              return res;
            }
            return null;
          };
          modEnv.vars.set(fn.name, fnImpl);
          modEnv.exports.add(fn.name);
          jsModuleObj[fn.name] = fnImpl;
        }
        for (const v of stmt.values) {
          const globalObj = typeof globalThis !== "undefined" ? globalThis : {};
          const lib = globalObj[stmt.name];
          const val = lib && v.name in lib ? lib[v.name] : null;
          modEnv.vars.set(v.name, val);
          modEnv.exports.add(v.name);
          jsModuleObj[v.name] = val;
        }
        env2.modules.set(stmt.name, modEnv);
        env2.vars.set(stmt.name, jsModuleObj);
        const cleanName = stmt.name.replace(/^npm:/, "").replace(/[^a-zA-Z0-9_]/g, "_");
        if (cleanName !== stmt.name) {
          env2.modules.set(cleanName, modEnv);
          env2.vars.set(cleanName, jsModuleObj);
        }
        if (stmt.isExported) env2.exports.add(stmt.name);
        return modEnv;
      }
      case "s_extern_function": {
        const globalObj = typeof globalThis !== "undefined" ? globalThis : {};
        const fnImpl = (...args) => {
          if (typeof globalObj[stmt.name] === "function") {
            return globalObj[stmt.name](...args);
          }
          return null;
        };
        env2.vars.set(stmt.name, fnImpl);
        if (stmt.isExported) env2.exports.add(stmt.name);
        return fnImpl;
      }
      case "s_extern_value": {
        const globalObj = typeof globalThis !== "undefined" ? globalThis : {};
        const val = globalObj[stmt.name] ?? null;
        env2.vars.set(stmt.name, val);
        if (stmt.isExported) env2.exports.add(stmt.name);
        return val;
      }
      case "s_extern_type": {
        return null;
      }
      case "s_expr": {
        return this.evalExpr(stmt.expr, env2);
      }
    }
  }
  processImport(stmt, env2) {
    let searchEnv = env2;
    let baseEnv = void 0;
    while (searchEnv) {
      if (searchEnv.modules.has(stmt.modulePath[0])) {
        baseEnv = searchEnv;
        break;
      }
      searchEnv = searchEnv.parent;
    }
    let current = baseEnv;
    for (const seg of stmt.modulePath) {
      if (!current) break;
      current = current.modules.get(seg);
    }
    if (!current) return;
    if (stmt.alias) {
      env2.modules.set(stmt.alias, current);
      return;
    }
    if (stmt.specifiers) {
      for (const spec of stmt.specifiers) {
        if (spec.isAll) {
          current.exports.forEach((expName) => {
            if (current.vars.has(expName)) env2.vars.set(expName, current.vars.get(expName));
          });
        } else {
          const importName = spec.name;
          const targetName = spec.alias || importName;
          if (current.vars.has(importName)) {
            env2.vars.set(targetName, current.vars.get(importName));
          }
        }
      }
    } else {
      env2.modules.set(stmt.modulePath[stmt.modulePath.length - 1], current);
    }
  }
  evalExpr(expr, env2) {
    this.recursionDepth++;
    if (this.recursionDepth > this.maxRecursionDepth) {
      this.recursionDepth--;
      throw new Error(`Runtime Error: Maximum recursion depth of ${this.maxRecursionDepth} exceeded. Stack overflow or infinite recursion detected.`);
    }
    try {
      return this.evalExprInner(expr, env2);
    } finally {
      this.recursionDepth--;
    }
  }
  evalExprInner(expr, env2) {
    switch (expr.kind) {
      case "e_literal":
        return expr.value;
      case "e_var": {
        if (expr.modulePath && expr.modulePath.length > 0) {
          let searchEnv = env2;
          let baseEnv = void 0;
          while (searchEnv) {
            if (searchEnv.modules.has(expr.modulePath[0])) {
              baseEnv = searchEnv;
              break;
            }
            searchEnv = searchEnv.parent;
          }
          let modEnv = baseEnv;
          for (const seg of expr.modulePath) {
            modEnv = modEnv?.modules.get(seg);
          }
          if (modEnv) {
            if (modEnv.vars.has(expr.name)) {
              return modEnv.vars.get(expr.name);
            }
            if (modEnv.modules.has(expr.name)) {
              return this.moduleEnvToObject(modEnv.modules.get(expr.name));
            }
          }
        }
        let curr = env2;
        while (curr) {
          if (curr.vars.has(expr.name)) {
            return curr.vars.get(expr.name);
          }
          if (curr.modules.has(expr.name)) {
            return this.moduleEnvToObject(curr.modules.get(expr.name));
          }
          curr = curr.parent;
        }
        throw new Error(`Runtime Error: Undefined variable '${expr.name}'`);
      }
      case "e_unary": {
        const val = this.evalExpr(expr.expr, env2);
        if (expr.op === "-") return -val;
        if (expr.op === "!") return !val;
        return val;
      }
      case "e_binary": {
        const left = this.evalExpr(expr.left, env2);
        const right = this.evalExpr(expr.right, env2);
        switch (expr.op) {
          case "+":
            return left + right;
          case "-":
            return left - right;
          case "*":
            return left * right;
          case "/":
            return left / right;
          case "%":
            return left % right;
          case "==":
            return left === right;
          case "!=":
            return left !== right;
          case "<":
            return left < right;
          case "<=":
            return left <= right;
          case ">":
            return left > right;
          case ">=":
            return left >= right;
          case "&&":
            return Boolean(left && right);
          case "||":
            return Boolean(left || right);
        }
      }
      case "e_assign": {
        const val = this.evalExpr(expr.value, env2);
        if (expr.target.kind === "e_var") {
          const varName = expr.target.name;
          let curr = env2;
          while (curr) {
            if (curr.vars.has(varName)) {
              let curVal = curr.vars.get(varName);
              if (expr.op === "+=") curVal += val;
              else if (expr.op === "-=") curVal -= val;
              else if (expr.op === "*=") curVal *= val;
              else if (expr.op === "/=") curVal /= val;
              else curVal = val;
              curr.vars.set(varName, curVal);
              return curVal;
            }
            curr = curr.parent;
          }
          env2.vars.set(varName, val);
          return val;
        } else if (expr.target.kind === "e_field_access") {
          const obj = this.evalExpr(expr.target.object, env2);
          let curVal = obj[expr.target.field];
          if (expr.op === "+=") curVal += val;
          else if (expr.op === "-=") curVal -= val;
          else if (expr.op === "*=") curVal *= val;
          else if (expr.op === "/=") curVal /= val;
          else curVal = val;
          obj[expr.target.field] = curVal;
          return curVal;
        } else if (expr.target.kind === "e_index") {
          const target = this.evalExpr(expr.target.target, env2);
          const index = this.evalExpr(expr.target.index, env2);
          if (target !== null && target !== void 0) {
            let curVal = target[index];
            if (expr.op === "+=") curVal += val;
            else if (expr.op === "-=") curVal -= val;
            else if (expr.op === "*=") curVal *= val;
            else if (expr.op === "/=") curVal /= val;
            else curVal = val;
            target[index] = curVal;
            return curVal;
          }
        }
        return val;
      }
      case "e_call": {
        const callee = this.evalExpr(expr.callee, env2);
        const args = expr.args.map((a) => this.evalExpr(a, env2));
        if (typeof callee === "function") {
          return callee(...args);
        }
        throw new Error(`Runtime Error: Object is not a function`);
      }
      case "e_field_access": {
        const obj = this.evalExpr(expr.object, env2);
        if (obj !== null && obj !== void 0) {
          return obj[expr.field];
        }
        return void 0;
      }
      case "e_index": {
        const target = this.evalExpr(expr.target, env2);
        const index = this.evalExpr(expr.index, env2);
        if (target !== null && target !== void 0 && target[index] !== void 0) {
          return target[index];
        }
        return null;
      }
      case "e_method_call": {
        const obj = this.evalExpr(expr.object, env2);
        if (obj === null || obj === void 0) {
          throw new Error(`Runtime Error: Cannot call method '${expr.method}' on ${obj}`);
        }
        const method = obj[expr.method];
        const args = expr.args.map((a) => this.evalExpr(a, env2));
        if (typeof method === "function") {
          if (expr.isModuleMethod || Array.isArray(obj) || typeof obj === "string" || typeof obj === "number" || obj instanceof Map || obj instanceof Set) {
            return method.apply(obj, args);
          }
          if (method._isTypeLangMethod) {
            return method.call(obj, obj, ...args);
          }
          return method.apply(obj, args);
        }
        throw new Error(`Runtime Error: Method '${expr.method}' is not defined on target`);
      }
      case "e_record": {
        const record = {};
        for (const f of expr.fields) {
          record[f.name] = this.evalExpr(f.value, env2);
        }
        if (expr.methods) {
          for (const m of expr.methods) {
            const methodFn = (self, ...mArgs) => {
              const localEnv = {
                vars: /* @__PURE__ */ new Map(),
                modules: /* @__PURE__ */ new Map(),
                exports: /* @__PURE__ */ new Set(),
                parent: env2
              };
              localEnv.vars.set(m.selfParam, self);
              m.params.forEach((p, i) => {
                localEnv.vars.set(p.name, mArgs[i]);
              });
              return this.evalExpr(m.body, localEnv);
            };
            methodFn._isTypeLangMethod = true;
            record[m.name] = methodFn;
          }
        }
        return record;
      }
      case "e_record_update": {
        const base = this.evalExpr(expr.base, env2);
        const updated = { ...base };
        for (const u of expr.updates) {
          updated[u.name] = this.evalExpr(u.value, env2);
        }
        return updated;
      }
      case "e_tuple": {
        return expr.elements.map((e) => this.evalExpr(e, env2));
      }
      case "e_lambda": {
        return (...args) => {
          const localEnv = {
            vars: /* @__PURE__ */ new Map(),
            modules: /* @__PURE__ */ new Map(),
            exports: /* @__PURE__ */ new Set(),
            parent: env2
          };
          expr.params.forEach((p, i) => {
            localEnv.vars.set(p.name, args[i]);
          });
          return this.evalExpr(expr.body, localEnv);
        };
      }
      case "e_if": {
        const cond = this.evalExpr(expr.cond, env2);
        if (cond) {
          return this.evalExpr(expr.thenExpr, env2);
        } else if (expr.elseExpr) {
          return this.evalExpr(expr.elseExpr, env2);
        } else {
          return null;
        }
      }
      case "e_block": {
        const localEnv = {
          vars: /* @__PURE__ */ new Map(),
          modules: /* @__PURE__ */ new Map(),
          exports: /* @__PURE__ */ new Set(),
          parent: env2
        };
        let lastVal = null;
        for (const s of expr.statements) {
          lastVal = this.evalStatement(s, localEnv);
        }
        if (expr.result) {
          return this.evalExpr(expr.result, localEnv);
        }
        return lastVal;
      }
      case "e_switch": {
        const discr = this.evalExpr(expr.discriminant, env2);
        let matched = false;
        let fallthrough = false;
        for (const c of expr.cases) {
          const caseVals = c.values && c.values.length > 0 ? c.values : c.value ? [c.value] : [];
          let caseMatches = false;
          for (const v of caseVals) {
            const caseVal = this.evalExpr(v, env2);
            if (this.isValEqual(discr, caseVal)) {
              caseMatches = true;
              break;
            }
          }
          if (caseMatches || fallthrough) {
            matched = true;
            fallthrough = false;
            try {
              return this.evalExpr(c.body, env2);
            } catch (e) {
              if (e instanceof ContinueSignal) {
                fallthrough = true;
                continue;
              } else if (e instanceof BreakSignal) {
                return null;
              } else {
                throw e;
              }
            }
          }
        }
        if (expr.defaultCase && (!matched || fallthrough)) {
          return this.evalExpr(expr.defaultCase, env2);
        }
        return null;
      }
      case "e_range": {
        const startVal = this.evalExpr(expr.start, env2);
        const endVal = this.evalExpr(expr.end, env2);
        const start = Number(startVal);
        const end = Number(endVal);
        const result = [];
        if (start <= end) {
          const limit = expr.inclusive ? end : end - 1;
          for (let i = start; i <= limit; i++) {
            result.push(i);
          }
        } else {
          const limit = expr.inclusive ? end : end + 1;
          for (let i = start; i >= limit; i--) {
            result.push(i);
          }
        }
        return result;
      }
      case "e_list_comp": {
        const iterableVal = this.evalExpr(expr.iterable, env2);
        if (!Array.isArray(iterableVal)) {
          throw new Error(`Runtime Error: List comprehension iterable must be an array, got ${formatValue(iterableVal)}`);
        }
        const result = [];
        for (const item of iterableVal) {
          const itemEnv = {
            vars: new Map(env2.vars),
            modules: env2.modules,
            exports: env2.exports,
            parent: env2
          };
          itemEnv.vars.set(expr.param, item);
          if (expr.condition) {
            const condVal = this.evalExpr(expr.condition, itemEnv);
            if (!condVal) continue;
          }
          const elemVal = this.evalExpr(expr.element, itemEnv);
          result.push(elemVal);
        }
        return result;
      }
      case "e_match": {
        const val = this.evalExpr(expr.scrutinee, env2);
        for (const arm of expr.arms) {
          const armEnv = {
            vars: /* @__PURE__ */ new Map(),
            modules: /* @__PURE__ */ new Map(),
            exports: /* @__PURE__ */ new Set(),
            parent: env2
          };
          if (this.matchPattern(arm.pattern, val, armEnv)) {
            if (arm.guard) {
              const guardVal = this.evalExpr(arm.guard, armEnv);
              if (!guardVal) continue;
            }
            return this.evalExpr(arm.body, armEnv);
          }
        }
        throw new Error(`Runtime Error: Unhandled pattern match for value ${formatValue(val)}`);
      }
      case "e_for": {
        const localEnv = {
          vars: /* @__PURE__ */ new Map(),
          modules: /* @__PURE__ */ new Map(),
          exports: /* @__PURE__ */ new Set(),
          parent: env2
        };
        if (expr.init) {
          if (expr.init.kind === "s_let") {
            this.evalStatement(expr.init, localEnv);
          } else if (expr.init.kind === "s_expr") {
            this.evalExpr(expr.init.expr, localEnv);
          } else if (expr.init.kind.startsWith("e_")) {
            this.evalExpr(expr.init, localEnv);
          }
        }
        let iterations = 0;
        const maxLoopIterations = 1e6;
        while (expr.cond ? Boolean(this.evalExpr(expr.cond, localEnv)) : true) {
          iterations++;
          if (iterations > maxLoopIterations) {
            throw new Error(`Runtime Error: Loop exceeded maximum iteration count (${maxLoopIterations}). Infinite loop detected.`);
          }
          try {
            this.evalExpr(expr.body, localEnv);
          } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) {
            } else {
              throw e;
            }
          }
          if (expr.update) {
            this.evalExpr(expr.update, localEnv);
          }
        }
        return null;
      }
      case "e_while": {
        const localEnv = {
          vars: /* @__PURE__ */ new Map(),
          modules: /* @__PURE__ */ new Map(),
          exports: /* @__PURE__ */ new Set(),
          parent: env2
        };
        let iterations = 0;
        const maxLoopIterations = 1e6;
        while (Boolean(this.evalExpr(expr.cond, localEnv))) {
          iterations++;
          if (iterations > maxLoopIterations) {
            throw new Error(`Runtime Error: Loop exceeded maximum iteration count (${maxLoopIterations}). Infinite loop detected.`);
          }
          try {
            this.evalExpr(expr.body, localEnv);
          } catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        }
        return null;
      }
      case "e_break": {
        throw new BreakSignal();
      }
      case "e_continue": {
        throw new ContinueSignal();
      }
      case "e_return": {
        const val = expr.value ? this.evalExpr(expr.value, env2) : null;
        throw new ReturnSignal(val);
      }
      case "e_do": {
        const desugared = desugarDo(expr);
        return this.evalExpr(desugared, env2);
      }
      case "e_where": {
        const localEnv = {
          vars: /* @__PURE__ */ new Map(),
          modules: /* @__PURE__ */ new Map(),
          exports: /* @__PURE__ */ new Set(),
          parent: env2
        };
        for (const wStmt of expr.bindings) {
          this.evalStatement(wStmt, localEnv);
        }
        return this.evalExpr(expr.expr, localEnv);
      }
    }
  }
  matchPattern(pat, val, env2) {
    switch (pat.kind) {
      case "p_wildcard":
      case "p_rest":
        return true;
      case "p_var":
        env2.vars.set(pat.name, val);
        return true;
      case "p_literal":
        return pat.value === val;
      case "p_as":
        env2.vars.set(pat.name, val);
        return this.matchPattern(pat.pattern, val, env2);
      case "p_ctor": {
        if (val && typeof val === "object" && val.$tag === pat.name) {
          const keys = Object.keys(val).filter((k) => k !== "$tag");
          for (let i = 0; i < pat.args.length; i++) {
            const key = keys[i];
            if (!this.matchPattern(pat.args[i], val[key], env2)) {
              return false;
            }
          }
          return true;
        }
        return false;
      }
      case "p_record": {
        if (val && typeof val === "object") {
          for (const f of pat.fields) {
            const fieldVal = val[f.name];
            if (f.pattern) {
              if (!this.matchPattern(f.pattern, fieldVal, env2)) return false;
            } else {
              const varName = f.alias || f.name;
              env2.vars.set(varName, fieldVal);
            }
          }
          return true;
        }
        return false;
      }
      case "p_tuple": {
        if (Array.isArray(val)) {
          for (let i = 0; i < pat.elements.length; i++) {
            if (!this.matchPattern(pat.elements[i], val[i], env2)) return false;
          }
          return true;
        }
        return false;
      }
    }
  }
  isValEqual(a, b) {
    if (a === b) return true;
    if (a && b && typeof a === "object" && typeof b === "object") {
      if (a.$tag && b.$tag) {
        if (a.$tag !== b.$tag) return false;
        const keysA = Object.keys(a).filter((k) => k !== "$tag");
        const keysB = Object.keys(b).filter((k) => k !== "$tag");
        if (keysA.length !== keysB.length) return false;
        return keysA.every((k, i) => this.isValEqual(a[k], b[keysB[i]]));
      }
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((v, i) => this.isValEqual(v, b[i]));
      }
    }
    return false;
  }
  moduleEnvToObject(modEnv) {
    const obj = {};
    modEnv.vars.forEach((v, k) => {
      obj[k] = v;
    });
    modEnv.modules.forEach((subm, k) => {
      obj[k] = this.moduleEnvToObject(subm);
    });
    return obj;
  }
};

// ../lang/workspace.ts
var ProjectWorkspace = class {
  constructor(host) {
    this.moduleCache = /* @__PURE__ */ new Map();
    this.fileAstCache = /* @__PURE__ */ new Map();
    this.diagnostics = [];
    this.currentlyCompiling = /* @__PURE__ */ new Set();
    this.host = host;
  }
  /**
   * Resolves a module name to a physical file path using standard conventions.
   * e.g., "ScratchMath" -> "./ScratchMath.tl" or "./scratch_math.tl"
   */
  resolveModuleNameToFile(moduleName, currentDirPath) {
    const snakeCase = moduleName.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
    const candidates = [
      `${moduleName}.tl`,
      `${snakeCase}.tl`,
      `src/${moduleName}.tl`,
      `src/${snakeCase}.tl`
    ];
    for (const candidate of candidates) {
      const fullPath = this.host.resolvePath(currentDirPath, candidate);
      if (this.host.fileExists(fullPath)) {
        return fullPath;
      }
    }
    return null;
  }
  /**
   * Compiles and type-checks a specific file and returns its resulting TypeEnv.
   * Caches the result to prevent redundant parsing and handles circular dependencies.
   */
  checkFile(filePath) {
    if (this.moduleCache.has(filePath)) {
      return this.moduleCache.get(filePath);
    }
    if (this.currentlyCompiling.has(filePath)) {
      return null;
    }
    const source = this.host.readFile(filePath);
    if (source === null) {
      return null;
    }
    this.currentlyCompiling.add(filePath);
    const checker = new TypeChecker({
      resolveModule: (moduleName) => {
        const dir = this.host.dirname(filePath);
        const resolvedPath = this.resolveModuleNameToFile(moduleName, dir);
        if (resolvedPath) {
          return this.checkFile(resolvedPath);
        }
        return null;
      }
    });
    try {
      const lexer = new Lexer(source);
      const parser = new Parser(lexer.tokenize());
      const ast = parser.parseProgram();
      this.fileAstCache.set(filePath, ast);
      const env2 = checker.checkProgram(ast);
      this.diagnostics.push(...checker.diagnostics.map((d) => ({ ...d, file: filePath })));
      const finalEnv = this.extractModuleEnv(env2);
      this.moduleCache.set(filePath, finalEnv);
      this.currentlyCompiling.delete(filePath);
      return finalEnv;
    } catch (err) {
      this.currentlyCompiling.delete(filePath);
      return null;
    }
  }
  /**
   * If a file explicitly defines a `module X {}`, we want to return just that module.
   * Otherwise, if a file uses loose `export function`, the file itself acts as the module.
   */
  extractModuleEnv(env2) {
    if (env2.exports.size === 1) {
      const exportName = Array.from(env2.exports)[0];
      if (env2.modules.has(exportName)) {
        return env2.modules.get(exportName);
      }
    }
    const modEnv = { ...createInitialEnv(), exports: new Set(Array.from(env2.exports)) };
    for (const exp of Array.from(env2.exports)) {
      if (env2.vars.has(exp)) modEnv.vars.set(exp, env2.vars.get(exp));
      if (env2.typeAliases.has(exp)) modEnv.typeAliases.set(exp, env2.typeAliases.get(exp));
      if (env2.gadts.has(exp)) modEnv.gadts.set(exp, env2.gadts.get(exp));
      if (env2.modules.has(exp)) modEnv.modules.set(exp, env2.modules.get(exp));
    }
    return modEnv;
  }
  getFileAst(filePath) {
    return this.fileAstCache.get(filePath);
  }
  invalidateFile(filePath) {
    this.moduleCache.delete(filePath);
    this.fileAstCache.delete(filePath);
    this.diagnostics = this.diagnostics.filter((d) => d.file !== filePath);
  }
  clearCache() {
    this.moduleCache.clear();
    this.fileAstCache.clear();
    this.diagnostics = [];
  }
};
var NodeSystemHost = class {
  constructor(customFs, customPath) {
    this.fileOverlays = /* @__PURE__ */ new Map();
    this.fs = customFs;
    this.path = customPath;
  }
  getFs() {
    if (!this.fs && typeof require !== "undefined") {
      try {
        this.fs = require("fs");
      } catch {
      }
    }
    return this.fs;
  }
  getPath() {
    if (!this.path && typeof require !== "undefined") {
      try {
        this.path = require("path");
      } catch {
      }
    }
    return this.path;
  }
  setOverlay(filePath, content) {
    this.fileOverlays.set(filePath, content);
  }
  removeOverlay(filePath) {
    this.fileOverlays.delete(filePath);
  }
  readFile(filePath) {
    if (this.fileOverlays.has(filePath)) {
      return this.fileOverlays.get(filePath);
    }
    try {
      const fsModule = this.getFs();
      if (fsModule && fsModule.existsSync(filePath)) {
        return fsModule.readFileSync(filePath, "utf-8");
      }
    } catch {
    }
    return null;
  }
  fileExists(filePath) {
    if (this.fileOverlays.has(filePath)) {
      return true;
    }
    try {
      const fsModule = this.getFs();
      if (fsModule) {
        return fsModule.existsSync(filePath);
      }
    } catch {
    }
    return false;
  }
  resolvePath(basePath, relativePath) {
    try {
      const pathModule = this.getPath();
      if (pathModule) {
        return pathModule.resolve(basePath, relativePath);
      }
    } catch {
    }
    return relativePath;
  }
  dirname(filePath) {
    try {
      const pathModule = this.getPath();
      if (pathModule) {
        return pathModule.dirname(filePath);
      }
    } catch {
    }
    return ".";
  }
};

// ../lang/formatter.ts
var Formatter = class _Formatter {
  constructor() {
    this.indentLevel = 0;
  }
  indent() {
    return "  ".repeat(this.indentLevel);
  }
  format(code2) {
    try {
      const lexer = new Lexer(code2);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parseProgram();
      return this.formatProgram(ast);
    } catch {
      return this.fallbackFormat(code2);
    }
  }
  formatProgram(program) {
    const formattedStmts = program.statements.map((stmt) => this.formatStatement(stmt));
    return formattedStmts.join("\n\n").trim() + "\n";
  }
  formatStatement(stmt) {
    switch (stmt.kind) {
      case "s_let": {
        const mutStr = stmt.isMut ? "mut " : "";
        const typeStr = stmt.typeAnnotation ? `: ${this.formatType(stmt.typeAnnotation)}` : "";
        const initStr = this.formatExpr(stmt.init);
        const docPrefix = stmt.docComment ? `${formatDocComment(stmt.docComment).split("\n").map((line) => `${this.indent()}${line}`).join("\n")}
` : "";
        return `${docPrefix}${this.indent()}let ${mutStr}${stmt.name}${typeStr} = ${initStr}`;
      }
      case "s_function": {
        const exportPrefix = stmt.isExported ? "export " : "";
        const typeParams = stmt.typeParams && stmt.typeParams.length > 0 ? `<${stmt.typeParams.map((tp) => typeParamToString(tp)).join(", ")}>` : "";
        const params = stmt.params.map((p) => `${p.name}: ${this.formatType(p.type)}`).join(", ");
        const retType = stmt.returnType ? `: ${this.formatType(stmt.returnType)}` : "";
        this.indentLevel++;
        let bodyLines;
        if (stmt.body.kind === "e_block") {
          const stmts = stmt.body.statements.map((s) => this.formatStatement(s)).join("\n");
          const res = stmt.body.result ? `${this.indent()}${this.formatExpr(stmt.body.result)}` : "";
          bodyLines = [stmts, res].filter(Boolean).join("\n");
        } else {
          bodyLines = `${this.indent()}${this.formatExpr(stmt.body)}`;
        }
        this.indentLevel--;
        let whereClause = "";
        if (stmt.whereBindings && stmt.whereBindings.length > 0) {
          this.indentLevel++;
          const whereStmts = stmt.whereBindings.map((s) => this.formatStatement(s)).join("\n");
          this.indentLevel--;
          whereClause = ` where {
${whereStmts}
${this.indent()}}`;
        }
        const docPrefix = stmt.docComment ? `${formatDocComment(stmt.docComment).split("\n").map((line) => `${this.indent()}${line}`).join("\n")}
` : "";
        return `${docPrefix}${this.indent()}${exportPrefix}function ${stmt.name}${typeParams}(${params})${retType} {
${bodyLines}
${this.indent()}}${whereClause}`;
      }
      case "s_expr":
        return `${this.indent()}${this.formatExpr(stmt.expr)}`;
      case "s_type_alias":
        return this.formatDocPrefix(stmt.decl.docComment) + this.formatTypeAlias(stmt.decl);
      case "s_gadt":
        return this.formatDocPrefix(stmt.decl.docComment) + this.formatGadt(stmt.decl);
      case "s_module":
        return this.formatModule(stmt);
      case "s_extern_module": {
        this.indentLevel++;
        const funcs = stmt.functions.map((f) => this.formatExternFunction(f)).join("\n");
        const types = stmt.types.map((t) => this.formatExternType(t)).join("\n");
        const vals = stmt.values.map((v) => this.formatExternValue(v)).join("\n");
        const content = [funcs, types, vals].filter((c) => c.length > 0).join("\n");
        this.indentLevel--;
        return `${this.indent()}extern module ${stmt.name} {
${content}
${this.indent()}}`;
      }
      case "s_extern_function":
        return this.formatExternFunction(stmt);
      case "s_import": {
        const modPath = stmt.modulePath.join(".");
        if (stmt.specifiers && stmt.specifiers.length > 0) {
          const specs = stmt.specifiers.map((s) => s.alias ? `${s.name} as ${s.alias}` : s.name).join(", ");
          return `${this.indent()}import ${modPath}.{ ${specs} }`;
        }
        const aliasStr = stmt.alias ? ` as ${stmt.alias}` : "";
        return `${this.indent()}import ${modPath}${aliasStr}`;
      }
      default:
        return this.indent() + "// Statement";
    }
  }
  formatTypeAlias(decl) {
    const typeParams = decl.typeParams && decl.typeParams.length > 0 ? `<${decl.typeParams.map((tp) => typeParamToString(tp)).join(", ")}>` : "";
    const body = this.formatType(decl.type);
    return `${this.indent()}type ${decl.name}${typeParams} = ${body}`;
  }
  formatDocPrefix(raw) {
    return raw ? `${formatDocComment(raw).split("\n").map((line) => `${this.indent()}${line}`).join("\n")}
` : "";
  }
  formatGadt(gadt) {
    const typeParams = gadt.typeParams && gadt.typeParams.length > 0 ? `<${gadt.typeParams.map((tp) => typeParamToString(tp)).join(", ")}>` : "";
    this.indentLevel++;
    const ctors = gadt.constructors.map((c) => {
      const cTypeParams = c.typeParams && c.typeParams.length > 0 ? `<${c.typeParams.map((tp) => typeParamToString(tp)).join(", ")}>` : "";
      const params = c.params.length > 0 ? `(${c.params.map((p) => `${p.name}: ${this.formatType(p.type)}`).join(", ")})` : "";
      const retType = c.returnType ? `: ${this.formatType(c.returnType)}` : "";
      return `${this.formatDocPrefix(c.docComment)}${this.indent()}| ${c.name}${cTypeParams}${params}${retType}`;
    }).join("\n");
    this.indentLevel--;
    return `${this.indent()}type ${gadt.name}${typeParams} =
${ctors}`;
  }
  formatModule(mod) {
    const exportStr = mod.isExported ? "export " : "";
    this.indentLevel++;
    const body = mod.body.map((s) => this.formatStatement(s)).join("\n");
    this.indentLevel--;
    return `${this.indent()}${exportStr}module ${mod.name} {
${body}
${this.indent()}}`;
  }
  formatExternFunction(f) {
    const typeParams = f.typeParams && f.typeParams.length > 0 ? `<${f.typeParams.map((tp) => typeParamToString(tp)).join(", ")}>` : "";
    const params = f.params.map((p) => `${p.name}: ${this.formatType(p.type)}`).join(", ");
    return `${this.indent()}function ${f.name}${typeParams}(${params}): ${this.formatType(f.returnType)}`;
  }
  formatExternType(t) {
    const typeParams = t.typeParams && t.typeParams.length > 0 ? `<${t.typeParams.map((tp) => typeParamToString(tp)).join(", ")}>` : "";
    return `${this.indent()}type ${t.name}${typeParams} = ${this.formatType(t.type)}`;
  }
  formatExternValue(v) {
    return `${this.indent()}let ${v.name}: ${this.formatType(v.type)}`;
  }
  formatExpr(expr) {
    switch (expr.kind) {
      case "e_literal":
        return JSON.stringify(expr.value);
      case "e_var":
        return expr.modulePath ? `${expr.modulePath.join(".")}.${expr.name}` : expr.name;
      case "e_unary": {
        const inner = this.formatExpr(expr.expr);
        return `${expr.op}${inner}`;
      }
      case "e_binary": {
        let l = this.formatExpr(expr.left);
        let r = this.formatExpr(expr.right);
        const opPrec = (op) => {
          if (op === "||") return 1;
          if (op === "&&") return 2;
          if (["==", "!="].includes(op)) return 3;
          if (["<", "<=", ">", ">="].includes(op)) return 4;
          if (["+", "-"].includes(op)) return 5;
          if (["*", "/", "%"].includes(op)) return 6;
          return 0;
        };
        const currentPrec = opPrec(expr.op);
        if (expr.left.kind === "e_binary" && opPrec(expr.left.op) < currentPrec) {
          l = `(${l})`;
        }
        if (expr.right.kind === "e_binary" && opPrec(expr.right.op) <= currentPrec) {
          r = `(${r})`;
        }
        return `${l} ${expr.op} ${r}`;
      }
      case "e_call": {
        const fn = this.formatExpr(expr.callee);
        const args = expr.args.map((a) => this.formatExpr(a)).join(", ");
        return `${fn}(${args})`;
      }
      case "e_lambda": {
        const typeParams = expr.typeParams && expr.typeParams.length > 0 ? `<${expr.typeParams.join(", ")}>` : "";
        const params = expr.params.map((p) => p.type ? `${p.name}: ${this.formatType(p.type)}` : p.name).join(", ");
        const retType = expr.returnType ? `: ${this.formatType(expr.returnType)}` : "";
        if (expr.body.kind === "e_block") {
          return `fn${typeParams}(${params})${retType} ${this.formatExpr(expr.body)}`;
        }
        return `fn${typeParams}(${params})${retType} => ${this.formatExpr(expr.body)}`;
      }
      case "e_if": {
        const cond = this.formatExpr(expr.cond);
        const thenE = this.formatExpr(expr.thenExpr);
        if (expr.elseExpr) {
          const elseE = this.formatExpr(expr.elseExpr);
          return `if (${cond}) ${thenE} else ${elseE}`;
        }
        return `if (${cond}) ${thenE}`;
      }
      case "e_match": {
        const target = this.formatExpr(expr.scrutinee);
        this.indentLevel++;
        const arms = expr.arms.map((a) => {
          const pat = this.formatPattern(a.pattern);
          const guard = a.guard ? ` if (${this.formatExpr(a.guard)})` : "";
          const body = this.formatExpr(a.body);
          return `${this.indent()}${pat}${guard} => ${body}`;
        }).join("\n");
        this.indentLevel--;
        return `match (${target}) {
${arms}
${this.indent()}}`;
      }
      case "e_assign": {
        const target = this.formatExpr(expr.target);
        const val = this.formatExpr(expr.value);
        return `${target} = ${val}`;
      }
      case "e_record": {
        const fields = expr.fields.map((f) => `${f.isMut ? "mut " : ""}${f.name}: ${this.formatExpr(f.value)}`);
        const methods = (expr.methods || []).map((m) => {
          const params = m.params.map((p) => p.type ? `${p.name}: ${this.formatType(p.type)}` : p.name).join(", ");
          const ret = m.returnType ? `: ${this.formatType(m.returnType)}` : "";
          const body = this.formatExpr(m.body);
          return `${m.name}(${m.selfParam}${params ? ", " + params : ""})${ret} ${body}`;
        });
        const all = [...fields, ...methods];
        if (all.length === 0) return "{}";
        if (methods.length > 0) {
          return `{
  ${all.join(",\n  ")}
}`;
        }
        return `{ ${all.join(", ")} }`;
      }
      case "e_record_update": {
        const base = this.formatExpr(expr.base);
        const updates = expr.updates.map((u) => `${u.isMut ? "mut " : ""}${u.name}: ${this.formatExpr(u.value)}`).join(", ");
        return updates ? `{ ...${base}, ${updates} }` : `{ ...${base} }`;
      }
      case "e_method_call": {
        const obj = this.formatExpr(expr.object);
        const args = expr.args.map((a) => this.formatExpr(a)).join(", ");
        return `${obj}.${expr.method}(${args})`;
      }
      case "e_field_access": {
        return `${this.formatExpr(expr.object)}.${expr.field}`;
      }
      case "e_range": {
        const op = expr.inclusive ? "..=" : "..";
        return `${this.formatExpr(expr.start)}${op}${this.formatExpr(expr.end)}`;
      }
      case "e_tuple": {
        const elems = expr.elements.map((e) => this.formatExpr(e)).join(", ");
        return `[${elems}]`;
      }
      case "e_index": {
        return `${this.formatExpr(expr.target)}[${this.formatExpr(expr.index)}]`;
      }
      case "e_block": {
        if (expr.statements.length === 0 && expr.result) {
          return `{ ${this.formatExpr(expr.result)} }`;
        }
        if (expr.statements.length === 0 && !expr.result) {
          return `()`;
        }
        this.indentLevel++;
        const stmts = expr.statements.map((s) => this.formatStatement(s)).join("\n");
        const res = expr.result ? `${this.indent()}${this.formatExpr(expr.result)}` : "";
        this.indentLevel--;
        const content = [stmts, res].filter(Boolean).join("\n");
        return `{
${content}
${this.indent()}}`;
      }
      case "e_switch": {
        const discr = this.formatExpr(expr.discriminant);
        this.indentLevel++;
        const cases = expr.cases.map((c) => {
          const vals = c.values && c.values.length > 0 ? c.values : c.value ? [c.value] : [];
          const valStrs = vals.map((v) => this.formatExpr(v)).join(", ");
          const body = this.formatExpr(c.body);
          return `${this.indent()}case ${valStrs}:
${this.indent()}  ${body}`;
        }).join("\n");
        let defStr = "";
        if (expr.defaultCase) {
          const defBody = this.formatExpr(expr.defaultCase);
          defStr = `
${this.indent()}default:
${this.indent()}  ${defBody}`;
        }
        this.indentLevel--;
        return `switch (${discr}) {
${cases}${defStr}
${this.indent()}}`;
      }
      case "e_list_comp": {
        const elem = this.formatExpr(expr.element);
        const iter = this.formatExpr(expr.iterable);
        const cond = expr.condition ? ` if ${this.formatExpr(expr.condition)}` : "";
        return `[${elem} for ${expr.param} in ${iter}${cond}]`;
      }
      case "e_for": {
        let initStr = "";
        if (expr.init) {
          if (expr.init.kind.startsWith("s_")) {
            initStr = this.formatStatement(expr.init).trim();
          } else {
            initStr = this.formatExpr(expr.init);
          }
        }
        const condStr = expr.cond ? this.formatExpr(expr.cond) : "";
        const updStr = expr.update ? this.formatExpr(expr.update) : "";
        const bodyStr = this.formatExpr(expr.body);
        return `for (${initStr}; ${condStr}; ${updStr}) ${bodyStr}`;
      }
      case "e_while": {
        const condStr = this.formatExpr(expr.cond);
        const bodyStr = this.formatExpr(expr.body);
        return `while (${condStr}) ${bodyStr}`;
      }
      case "e_break":
        return "break";
      case "e_continue":
        return "continue";
      case "e_return":
        return expr.value ? `return ${this.formatExpr(expr.value)}` : "return";
      case "e_do": {
        this.indentLevel++;
        const items = expr.items.map((item) => {
          switch (item.kind) {
            case "do_bind":
              return `${this.indent()}${this.formatPattern(item.pattern)} <- ${this.formatExpr(item.expr)};`;
            case "do_let": {
              const mutStr = item.isMut ? "mut " : "";
              const typeStr = item.typeAnnotation ? `: ${this.formatType(item.typeAnnotation)}` : "";
              return `${this.indent()}let ${mutStr}${item.name}${typeStr} = ${this.formatExpr(item.init)};`;
            }
            case "do_expr":
              return `${this.indent()}${this.formatExpr(item.expr)};`;
            case "do_return":
              return `${this.indent()}${item.isPure ? "pure" : "return"} ${this.formatExpr(item.expr)};`;
          }
        }).join("\n");
        this.indentLevel--;
        const monadStr = expr.monad ? `(${this.formatExpr(expr.monad)})` : "";
        return `do${monadStr} {
${items}
${this.indent()}}`;
      }
      case "e_where": {
        this.indentLevel++;
        const bindings = expr.bindings.map((s) => this.formatStatement(s)).join("\n");
        this.indentLevel--;
        return `${this.formatExpr(expr.expr)} where {
${bindings}
${this.indent()}}`;
      }
      default:
        return "/* expr */";
    }
  }
  formatType(type) {
    switch (type.kind) {
      case "base":
        return type.name;
      case "var":
        return type.name;
      case "app": {
        if (type.name === "Array" && type.args.length === 1) {
          return `${this.formatType(type.args[0])}[]`;
        }
        if (type.args.length === 0) return type.name;
        const args = type.args.map((a) => this.formatType(a)).join(", ");
        return `${type.name}<${args}>`;
      }
      case "fun": {
        const typeParams = type.typeParams && type.typeParams.length > 0 ? `<${type.typeParams.map((tp) => typeParamToString(tp)).join(", ")}>` : "";
        const params = type.params.map((p) => p.name ? `${p.name}: ${this.formatType(p.type)}` : this.formatType(p.type)).join(", ");
        return `${typeParams}(${params}) => ${this.formatType(type.returnType)}`;
      }
      case "record": {
        const fields = type.fields.map((f) => `${f.isMut ? "mut " : ""}${f.name}: ${this.formatType(f.type)}`).join(", ");
        return `{ ${fields} }`;
      }
      case "tuple": {
        const elems = type.elements.map((e) => this.formatType(e)).join(", ");
        return `[${elems}]`;
      }
      case "forall": {
        return `<${type.typeParams.map((tp) => typeParamToString(tp)).join(", ")}>${this.formatType(type.type)}`;
      }
      case "type_lambda": {
        const params = type.params.map((p) => typeParamToString(p)).join(", ");
        return `\\${params} => ${this.formatType(type.body)}`;
      }
      case "hkt_app": {
        const ctor = this.formatType(type.target);
        const args = type.args.map((a) => this.formatType(a)).join(", ");
        return `${ctor}<${args}>`;
      }
    }
  }
  static formatTypeAST(type) {
    return new _Formatter().formatType(type);
  }
  formatPattern(pat) {
    switch (pat.kind) {
      case "p_var":
        return pat.name;
      case "p_literal":
        return JSON.stringify(pat.value);
      case "p_ctor": {
        if (pat.args.length === 0) return pat.name;
        const args = pat.args.map((a) => this.formatPattern(a)).join(", ");
        return `${pat.name}(${args})`;
      }
      case "p_record": {
        const fields = pat.fields.map((f) => `${f.name}: ${f.pattern ? this.formatPattern(f.pattern) : f.alias || f.name}`).join(", ");
        return `{ ${fields} }`;
      }
      case "p_tuple": {
        const elems = pat.elements.map((e) => this.formatPattern(e)).join(", ");
        return `[${elems}]`;
      }
      case "p_as": {
        return `${this.formatPattern(pat.pattern)} as ${pat.name}`;
      }
      case "p_wildcard":
        return "_";
      case "p_rest":
        return "...";
    }
  }
  fallbackFormat(code2) {
    const lines = code2.split("\n");
    let level = 0;
    const formattedLines = [];
    for (let line of lines) {
      let trimmed = line.trim();
      if (!trimmed) {
        formattedLines.push("");
        continue;
      }
      if (trimmed.startsWith("}") || trimmed.startsWith("]")) {
        level = Math.max(0, level - 1);
      }
      const indentStr = "  ".repeat(level);
      trimmed = trimmed.replace(/\s*=\s*/g, " = ").replace(/\s*=>\s*/g, " => ").replace(/\s*:\s*/g, ": ").replace(/\s*,\s*/g, ", ");
      formattedLines.push(indentStr + trimmed);
      if (trimmed.endsWith("{") || trimmed.endsWith("[")) {
        level++;
      }
    }
    return formattedLines.join("\n");
  }
};

// ../lang/lsp.ts
function formatHoverType(type, indent = 0, visiting = /* @__PURE__ */ new Set()) {
  const resolved = prune(type);
  if (visiting.has(resolved)) return "Self";
  visiting.add(resolved);
  const format = (nested) => formatHoverType(nested, indent + 1, visiting);
  let result;
  switch (resolved.kind) {
    case "prim":
      result = resolved.name;
      break;
    case "var":
      result = resolved.instance ? format(resolved.instance) : resolved.name || `'t${resolved.id}`;
      break;
    case "existential":
      result = `\u2203${resolved.name}_${resolved.id}`;
      break;
    case "poly": {
      const quantifiers = resolved.quantifiers.map((name) => {
        const kind = resolved.quantifierKinds?.get(name);
        return kind?.kind === "arrow" ? `${name}<${Array(kindArity(kind)).fill("_").join(", ")}>` : name;
      });
      result = `<${quantifiers.join(", ")}>${format(resolved.type)}`;
      break;
    }
    case "fun": {
      const params = resolved.params.map((param) => param.name ? `${param.name}: ${format(param.type)}` : format(param.type));
      result = `(${params.join(", ")}) => ${format(resolved.returnType)}`;
      break;
    }
    case "rec": {
      const fieldIndent = "  ".repeat(indent + 1);
      const fields = resolved.fields.map((field, index) => {
        const fieldType = prune(field.type);
        const isSelfMethod = fieldType.kind === "fun" && fieldType.params[0]?.name === "self" && prune(fieldType.params[0].type) === resolved;
        const typeText = isSelfMethod ? `${fieldType.params.slice(1).map((param) => param.name ? `${param.name}: ${format(param.type)}` : format(param.type)).join(", ")}): ${format(fieldType.returnType)}` : format(field.type);
        const fieldName = `${field.isMut ? "mut " : ""}${field.name}${field.isOptional ? "?" : ""}`;
        const rendered = isSelfMethod ? `${fieldName}(${typeText}` : `${fieldName}: ${typeText}`;
        return `${fieldIndent}${rendered}${index < resolved.fields.length - 1 ? "," : ""}`;
      });
      result = ` {
${fields.join("\n")}
${"  ".repeat(indent)}}`;
      break;
    }
    case "tup":
      result = `[${resolved.elements.map(format).join(", ")}]`;
      break;
    case "cons":
      result = resolved.args.length ? `${resolved.name}<${resolved.args.map(format).join(", ")}>` : resolved.name;
      break;
    case "hkt_app":
      result = `${format(resolved.constructor)}<${resolved.args.map(format).join(", ")}>`;
      break;
    case "type_lambda":
      result = `\u03BB<${resolved.params.join(", ")}> => ${format(resolved.body)}`;
      break;
  }
  visiting.delete(resolved);
  return result;
}
function appendGadtHover(contents, gadt) {
  const typeParams = gadt.typeParams.length ? `<${gadt.typeParams.map(typeParamToString).join(", ")}>` : "";
  const genericArgs = gadt.typeParams.length ? `<${gadt.typeParams.map(getTypeParamName).join(", ")}>` : "";
  contents.push(`\`\`\`typelang
type ${gadt.name}${typeParams}
\`\`\``);
  contents.push(`**Constructors**

\`\`\`typelang
${gadt.constructors.map((ctor) => {
    const ctorTypeParams = ctor.typeParams.length ? `<${ctor.typeParams.map(typeParamToString).join(", ")}>` : "";
    const params = ctor.params.map((param) => `${param.name}: ${Formatter.formatTypeAST(param.type)}`).join(", ");
    const args = params ? `(${params})` : "";
    const result = ctor.returnType ? Formatter.formatTypeAST(ctor.returnType) : `${gadt.name}${genericArgs}`;
    return `  ${ctor.name}${ctorTypeParams}${args}: ${result}`;
  }).join("\n")}
\`\`\``);
}
var BUILTIN_HOVER_DB = {
  print: {
    signature: "function print<T>(val: T): void",
    doc: "Prints a value to the standard output without adding a trailing newline."
  },
  println: {
    signature: "function println<T>(val: T): void",
    doc: "Prints a value to the standard output followed by a trailing newline."
  },
  to_string: {
    signature: "function to_string<T>(val: T): string",
    doc: "Converts any value (number, boolean, record, tuple) into its canonical string representation."
  },
  concat: {
    signature: "function concat(a: string, b: string): string",
    doc: "Concatenates two string values into a single string."
  },
  array_len: {
    signature: "function array_len<T>(arr: [T]): number",
    doc: "Returns the number of elements contained in an array or tuple."
  },
  array_map: {
    signature: "function array_map<A, B>(arr: [A], fn: (x: A) => B): [B]",
    doc: "Transforms each element in an array using a mapper function, returning a new array of transformed elements."
  },
  array_filter: {
    signature: "function array_filter<A>(arr: [A], predicate: (x: A) => boolean): [A]",
    doc: "Filters array elements matching a boolean predicate function."
  },
  array_reduce: {
    signature: "function array_reduce<A, B>(arr: [A], initial: B, reducer: (acc: B, elem: A) => B): B",
    doc: "Reduces an array to a single accumulated value using a reducer function."
  },
  array_push: {
    signature: "function array_push<A>(arr: [A], elem: A): [A]",
    doc: "Appends an element to the end of an array, returning a new array."
  },
  str_len: {
    signature: "function str_len(s: string): number",
    doc: "Returns the character length of a string."
  },
  str_slice: {
    signature: "function str_slice(s: string, start: number, end: number): string",
    doc: "Extracts a substring slice from index `start` up to (excluding) `end`."
  },
  str_split: {
    signature: "function str_split(s: string, delimiter: string): [string]",
    doc: "Splits a string by a delimiter into an array of string substrings."
  },
  str_contains: {
    signature: "function str_contains(s: string, substring: string): boolean",
    doc: "Checks if a string contains a given substring."
  },
  parse_int: {
    signature: "function parse_int(s: string): number",
    doc: "Parses an integer number from a string representation."
  },
  parse_float: {
    signature: "function parse_float(s: string): number",
    doc: "Parses a floating-point number from a string representation."
  },
  math_sqrt: {
    signature: "function math_sqrt(x: number): number",
    doc: "Returns the square root of a non-negative number."
  },
  math_abs: {
    signature: "function math_abs(x: number): number",
    doc: "Returns the absolute value of a number."
  },
  math_floor: {
    signature: "function math_floor(x: number): number",
    doc: "Rounds a floating point number down to the nearest integer."
  },
  math_ceil: {
    signature: "function math_ceil(x: number): number",
    doc: "Rounds a floating point number up to the nearest integer."
  },
  math_round: {
    signature: "function math_round(x: number): number",
    doc: "Rounds a number to the nearest integer."
  },
  math_min: {
    signature: "function math_min(a: number, b: number): number",
    doc: "Returns the minimum of two numbers."
  },
  math_max: {
    signature: "function math_max(a: number, b: number): number",
    doc: "Returns the maximum of two numbers."
  },
  math_pow: {
    signature: "function math_pow(base: number, exp: number): number",
    doc: "Calculates `base` raised to the power of `exp`."
  },
  math_random: {
    signature: "function math_random(): number",
    doc: "Generates a random floating-point number between 0 (inclusive) and 1 (exclusive)."
  },
  time_now: {
    signature: "function time_now(): number",
    doc: "Returns the current UNIX timestamp in milliseconds."
  },
  // Modular Math.* methods
  sqrt: {
    signature: "function Math.sqrt(x: number): number",
    doc: "Returns the square root of a non-negative number."
  },
  abs: {
    signature: "function Math.abs(x: number): number",
    doc: "Returns the absolute value of a number."
  },
  floor: {
    signature: "function Math.floor(x: number): number",
    doc: "Rounds a number down to the nearest integer."
  },
  ceil: {
    signature: "function Math.ceil(x: number): number",
    doc: "Rounds a number up to the nearest integer."
  },
  round: {
    signature: "function Math.round(x: number): number",
    doc: "Rounds a number to the nearest integer value."
  },
  min: {
    signature: "function Math.min(a: number, b: number): number",
    doc: "Returns the smaller of two numbers."
  },
  max: {
    signature: "function Math.max(a: number, b: number): number",
    doc: "Returns the greater of two numbers."
  },
  pow: {
    signature: "function Math.pow(base: number, exp: number): number",
    doc: "Returns `base` raised to the exponent `exp`."
  },
  random: {
    signature: "function Math.random(): number",
    doc: "Generates a pseudo-random number in the range `[0, 1)`."
  },
  // Modular Array.* methods
  len: {
    signature: "function Array.len<T>(arr: [T]): number | function String.len(s: string): number",
    doc: "Returns the length count of an array, tuple, or string."
  },
  map: {
    signature: "function Array.map<A, B>(arr: [A], fn: (x: A) => B): [B]",
    doc: "Applies a transforming function to each element of the array."
  },
  filter: {
    signature: "function Array.filter<A>(arr: [A], predicate: (x: A) => boolean): [A]",
    doc: "Returns a new array with all elements that satisfy the predicate function."
  },
  reduce: {
    signature: "function Array.reduce<A, B>(arr: [A], init: B, fn: (acc: B, elem: A) => B): B",
    doc: "Accumulates array values from left to right using a reducer callback."
  },
  push: {
    signature: "function Array.push<A>(arr: [A], elem: A): [A]",
    doc: "Returns a new array with the given element appended."
  },
  slice: {
    signature: "function Array.slice<A>(arr: [A], start: number, end: number): [A] | function String.slice(s: string, start: number, end: number): string",
    doc: "Extracts a subsection of an array or string from `start` up to `end`."
  },
  // Modular String.* methods
  split: {
    signature: "function String.split(s: string, delimiter: string): [string]",
    doc: "Divides a string into an ordered list of substrings separated by a delimiter."
  },
  contains: {
    signature: "function String.contains(s: string, substring: string): boolean",
    doc: "Determines whether the string contains the characters of a specified string."
  },
  parseInt: {
    signature: "function String.parseInt(s: string): number",
    doc: "Parses a string argument and returns an integer number."
  },
  parseFloat: {
    signature: "function String.parseFloat(s: string): number",
    doc: "Parses a string argument and returns a floating-point number."
  },
  // Modular DOM.* methods
  getElementById: {
    signature: "function DOM.getElementById<T>(id: string): T",
    doc: "Returns a reference to the element by its ID in the active DOM tree."
  },
  createElement: {
    signature: "function DOM.createElement<T>(tag: string): T",
    doc: "Creates the HTML element specified by tagName."
  },
  setText: {
    signature: "function DOM.setText<T>(el: T, text: string): void",
    doc: "Sets the text content of the specified DOM element."
  },
  setHtml: {
    signature: "function DOM.setHtml<T>(el: T, html: string): void",
    doc: "Sets the raw HTML markup content of the specified element."
  },
  setAttr: {
    signature: "function DOM.setAttr<T>(el: T, attr: string, val: string): void",
    doc: "Sets an attribute value on the target element."
  },
  appendChild: {
    signature: "function DOM.appendChild<P, C>(parent: P, child: C): void",
    doc: "Adds a node to the end of the list of children of a specified parent node."
  },
  addEventListener: {
    signature: "function DOM.addEventListener<T, E>(el: T, event: string, handler: (e: E) => void): void",
    doc: "Sets up a function that will be called whenever the specified event is delivered to the target."
  },
  h: {
    signature: "function DOM.h<P, C, V>(tag: string, props: P, children: C): V",
    doc: "Virtual DOM hyperscript builder for declarative UI components."
  },
  mount: {
    signature: "function DOM.mount<C, V>(containerId: C, vnode: V): void",
    doc: "Mounts a virtual DOM tree into a target container."
  },
  // Modular Node.* methods
  stringify: {
    signature: "function Node.stringify<T>(data: T): string",
    doc: "Converts a TypeLang object or record into a valid JSON string."
  },
  parse: {
    signature: "function Node.parse<T>(jsonStr: string): T",
    doc: "Parses a JSON string, constructing the TypeLang value or record described by the string."
  },
  envGet: {
    signature: "function Node.envGet(key: string): string",
    doc: "Retrieves an environment variable value by key name."
  },
  readFile: {
    signature: "function Node.readFile(path: string): string",
    doc: "Asynchronously or synchronously reads the entire contents of a file."
  },
  writeFile: {
    signature: "function Node.writeFile(path: string, content: string): void",
    doc: "Writes data to the specified file path, replacing the file if it already exists."
  },
  createApp: {
    signature: "function Node.createApp<App>(): App",
    doc: "Creates a new Express.js HTTP server instance."
  },
  get: {
    signature: "function Node.get<App, Req, Res>(app: App, path: string, handler: (req: Req, res: Res) => void): void",
    doc: "Routes HTTP GET requests to the specified path with the specified callback functions."
  },
  post: {
    signature: "function Node.post<App, Req, Res>(app: App, path: string, handler: (req: Req, res: Res) => void): void",
    doc: "Routes HTTP POST requests to the specified path with the specified callback functions."
  },
  listen: {
    signature: "function Node.listen<App>(app: App, port: number, onStart: () => void): void",
    doc: "Binds and listens for incoming HTTP connections on the specified host and port."
  }
};
var KEYWORD_HOVER_DB = {
  let: {
    title: "TypeLang Keyword: let",
    doc: "Binds an immutable value or variable. Use `let mut` to allow variable reassignment."
  },
  mut: {
    title: "TypeLang Keyword: mut",
    doc: "Marks a let variable binding or record field as mutable."
  },
  type: {
    title: "TypeLang Keyword: type",
    doc: "Declares a type alias or Generalized Algebraic Data Type (GADT)."
  },
  function: {
    title: "TypeLang Keyword: function",
    doc: "Defines a top-level typed function. Supports parametric polymorphism with `<T1, T2>`."
  },
  fn: {
    title: "TypeLang Keyword: fn",
    doc: "Defines an anonymous lambda function."
  },
  match: {
    title: "TypeLang Keyword: match",
    doc: "Pattern matches on values, GADT constructors, tuples, records, and literals with pattern guards."
  },
  module: {
    title: "TypeLang Keyword: module",
    doc: "Encapsulates types, functions, and let bindings within a named module scope."
  },
  export: {
    title: "TypeLang Keyword: export",
    doc: "Exports a symbol or module to make it accessible to external modules or consumers."
  },
  import: {
    title: "TypeLang Keyword: import",
    doc: "Imports exported symbols from a named module path."
  },
  pack: {
    title: "TypeLang Keyword: pack",
    doc: "Packs a concrete witness type and value into an existential type abstraction (`\u2203a. T`)."
  },
  unpack: {
    title: "TypeLang Keyword: unpack",
    doc: "Unpacks an existential container into a hidden type variable and value."
  },
  self: {
    title: "TypeLang Keyword: self",
    doc: "References the self record in recursive record type definitions."
  },
  do: {
    title: "TypeLang Keyword: do",
    doc: "Initiates a monadic do-notation block for sequencing monadic computations with `x <- expr` bind statements, `let` bindings, and `pure` returns."
  },
  where: {
    title: "TypeLang Keyword: where",
    doc: "Defines local bindings and auxiliary helper functions scoped to an expression or function declaration."
  },
  pure: {
    title: "TypeLang Keyword: pure",
    doc: "Lifts a value into a monadic context inside do notation blocks (`pure expr` or `return expr`)."
  },
  extern: {
    title: "TypeLang Keyword: extern",
    doc: "Declares an external foreign JavaScript interface binding without implementation body."
  },
  as: {
    title: "TypeLang Keyword: as",
    doc: "Aliases an imported module or renames an import specifier."
  },
  if: {
    title: "TypeLang Keyword: if",
    doc: "Evaluates a boolean condition and executes a conditional branch."
  },
  then: {
    title: "TypeLang Keyword: then",
    doc: "Introduces the true branch expression in a ternary or conditional form."
  },
  else: {
    title: "TypeLang Keyword: else",
    doc: "Introduces the alternative fallback branch when an if condition evaluates to false."
  },
  return: {
    title: "TypeLang Keyword: return",
    doc: "Returns a value from a function or early terminates execution."
  },
  for: {
    title: "TypeLang Keyword: for",
    doc: "Iterates across a numeric range or array collection."
  },
  while: {
    title: "TypeLang Keyword: while",
    doc: "Repeatedly executes a statement block while a boolean condition remains true."
  },
  switch: {
    title: "TypeLang Keyword: switch",
    doc: "Evaluates an expression against multiple case value branches with a default fallback."
  },
  case: {
    title: "TypeLang Keyword: case",
    doc: "Defines an arm variant condition within a switch statement."
  },
  default: {
    title: "TypeLang Keyword: default",
    doc: "Defines the catch-all fallback arm in a switch statement."
  },
  in: {
    title: "TypeLang Keyword: in",
    doc: "Specifies the target collection or iterable within a for loop."
  },
  break: {
    title: "TypeLang Keyword: break",
    doc: "Terminates loop execution immediately."
  },
  continue: {
    title: "TypeLang Keyword: continue",
    doc: "Skips the current loop iteration and advances to the next iteration."
  }
};
function getWordAtPosition(code2, line, col) {
  const lines = code2.split("\n");
  const lineIdx = line - 1;
  if (lineIdx < 0 || lineIdx >= lines.length) return null;
  const lineText = lines[lineIdx];
  const colIdx = col - 1;
  if (colIdx < 0 || colIdx > lineText.length) return null;
  let start = colIdx;
  while (start > 0 && /[a-zA-Z0-9_]/.test(lineText[start - 1])) {
    start--;
  }
  let end = colIdx;
  while (end < lineText.length && /[a-zA-Z0-9_]/.test(lineText[end])) {
    end++;
  }
  if (start >= end) return null;
  return lineText.substring(start, end);
}
function findMatchingSymbol(symbols, word, line, col) {
  if (!symbols || symbols.length === 0) return null;
  const exactMatches = symbols.filter((s) => {
    if (s.name !== word) return false;
    if (s.loc) {
      if (s.loc.line === line) {
        const startCol = s.loc.col;
        const endCol = s.loc.endCol || startCol + s.name.length;
        if (col >= startCol && col <= endCol) {
          return true;
        }
      }
    }
    return false;
  });
  if (exactMatches.length > 0) {
    return exactMatches[0];
  }
  const scopedMatches = symbols.filter((s) => {
    if (s.name !== word) return false;
    if (s.scopeRange) {
      const inLineRange = line >= s.scopeRange.startLine && line <= s.scopeRange.endLine;
      if (!inLineRange) return false;
      if (line === s.scopeRange.startLine && col < s.scopeRange.startCol) return false;
      if (line === s.scopeRange.endLine && col > s.scopeRange.endCol) return false;
      return true;
    }
    return false;
  });
  if (scopedMatches.length > 0) {
    scopedMatches.sort((a, b) => {
      const aSpan = (a.scopeRange.endLine - a.scopeRange.startLine) * 1e4 + (a.scopeRange.endCol - a.scopeRange.startCol);
      const bSpan = (b.scopeRange.endLine - b.scopeRange.startLine) * 1e4 + (b.scopeRange.endCol - b.scopeRange.startCol);
      return aSpan - bSpan;
    });
    return scopedMatches[0];
  }
  const nameMatches = symbols.filter((s) => s.name === word);
  if (nameMatches.length > 0) {
    nameMatches.sort((a, b) => {
      const aLine = a.loc?.line || 0;
      const bLine = b.loc?.line || 0;
      const aPrecedes = aLine <= line;
      const bPrecedes = bLine <= line;
      if (aPrecedes && !bPrecedes) return -1;
      if (!aPrecedes && bPrecedes) return 1;
      return Math.abs(line - aLine) - Math.abs(line - bLine);
    });
    return nameMatches[0];
  }
  return null;
}
function resolveReferenceSymbol(matchedSymbol, symbols) {
  if (matchedSymbol.kind === "reference") {
    let defSymbol;
    if (matchedSymbol.scopeRange) {
      defSymbol = symbols.find(
        (s) => s.name === matchedSymbol.name && s.kind !== "reference" && s.loc && s.loc.line === matchedSymbol.scopeRange.startLine && s.loc.col === matchedSymbol.scopeRange.startCol
      );
      if (!defSymbol) {
        defSymbol = symbols.find(
          (s) => s.name === matchedSymbol.name && s.kind !== "reference" && s.loc && s.loc.line === matchedSymbol.scopeRange.startLine
        );
      }
    }
    if (!defSymbol) {
      const candidates = symbols.filter(
        (s) => s.name === matchedSymbol.name && s.kind !== "reference" && s.loc
      );
      if (candidates.length > 0) {
        const refLine = matchedSymbol.loc?.line ?? Infinity;
        const preceding = candidates.filter((s) => s.loc.line <= refLine);
        defSymbol = preceding.length > 0 ? preceding[preceding.length - 1] : candidates[0];
      }
    }
    if (defSymbol) {
      return {
        ...matchedSymbol,
        kind: defSymbol.kind,
        doc: defSymbol.doc || matchedSymbol.doc,
        isExported: defSymbol.isExported ?? matchedSymbol.isExported,
        containerName: defSymbol.containerName ?? matchedSymbol.containerName,
        type: defSymbol.type || matchedSymbol.type
      };
    }
  }
  return matchedSymbol;
}
function getDefinitionLocation(code2, line, col) {
  const word = getWordAtPosition(code2, line, col);
  if (!word) return null;
  try {
    const lexer = new Lexer(code2);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parseProgram(true);
    const checker = new TypeChecker();
    checker.checkProgram(ast);
    const matchedSymbol = findMatchingSymbol(checker.symbols, word, line, col);
    if (matchedSymbol) {
      if (matchedSymbol.kind === "reference" && matchedSymbol.scopeRange) {
        return {
          line: matchedSymbol.scopeRange.startLine,
          col: matchedSymbol.scopeRange.startCol,
          endLine: matchedSymbol.scopeRange.endLine,
          endCol: matchedSymbol.scopeRange.endCol
        };
      } else if (matchedSymbol.loc) {
        return {
          line: matchedSymbol.loc.line,
          col: matchedSymbol.loc.col,
          endLine: matchedSymbol.loc.endLine || matchedSymbol.loc.line,
          endCol: matchedSymbol.loc.endCol || matchedSymbol.loc.col + word.length
        };
      }
    }
  } catch {
  }
  return null;
}
function getHoverInformation(code2, line, col) {
  const word = getWordAtPosition(code2, line, col);
  if (!word) return null;
  const contents = [];
  if (KEYWORD_HOVER_DB[word]) {
    const kw = KEYWORD_HOVER_DB[word];
    contents.push("**TypeLang Keyword**");
    contents.push(`\`\`\`typelang
${word}
\`\`\``);
    contents.push(kw.doc);
    return { contents, word };
  }
  try {
    const lexer = new Lexer(code2);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parseProgram(true);
    const checker = new TypeChecker();
    const env2 = checker.checkProgram(ast);
    const sourceLine = code2.split("\n")[line - 1] || "";
    const qualifier = sourceLine.slice(0, Math.max(0, col - 1)).match(/([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*(?:[A-Za-z_][A-Za-z0-9_]*)?$/)?.[1];
    if (qualifier) {
      const moduleEnv = env2.modules.get(qualifier);
      if (moduleEnv) {
        const memberType = moduleEnv.vars.get(word);
        if (memberType) {
          contents.push(`\`\`\`typelang
${qualifier}.${word}: ${typeToString(memberType)}
\`\`\``);
          contents.push(moduleEnv.docs?.get(word) || moduleEnv.moduleDoc || `Member of the \`${qualifier}\` module.`);
          return { contents, word };
        }
        const memberAlias = moduleEnv.typeAliases.get(word);
        if (memberAlias) {
          contents.push(`\`\`\`typelang
type ${qualifier}.${word} = ${typeToString(memberAlias.type)}
\`\`\``);
          contents.push(moduleEnv.docs?.get(word) || `Type alias of the \`${qualifier}\` module.`);
          return { contents, word };
        }
      }
    }
    let matchedSymbol = findMatchingSymbol(checker.symbols, word, line, col);
    if (matchedSymbol) {
      matchedSymbol = resolveReferenceSymbol(matchedSymbol, checker.symbols);
      if (matchedSymbol.kind === "gadt" && env2.gadts.has(word)) {
        appendGadtHover(contents, env2.gadts.get(word));
        if (matchedSymbol.doc) contents.push(matchedSymbol.doc);
        return { contents, word };
      }
      const typeStr = formatHoverType(matchedSymbol.type);
      if (matchedSymbol.kind === "parameter") {
        const container = matchedSymbol.containerName ? ` of \`${matchedSymbol.containerName}\`` : "";
        contents.push("```typelang\n(parameter) " + word + ": " + typeStr + "\n```");
        contents.push(`*Function parameter${container}*`);
      } else if (matchedSymbol.kind === "pattern") {
        contents.push("```typelang\n(pattern variable) " + word + ": " + typeStr + "\n```");
        contents.push("*Pattern-bound variable*");
      } else if (matchedSymbol.kind === "loop") {
        contents.push("```typelang\n(loop variable) " + word + ": " + typeStr + "\n```");
        contents.push("*Loop iteration variable*");
      } else if (matchedSymbol.kind === "variable") {
        const prefix = matchedSymbol.isMut ? "let mut" : "let";
        const container = matchedSymbol.containerName ? ` of \`${matchedSymbol.containerName}\`` : "";
        contents.push("```typelang\n" + prefix + " " + word + ": " + typeStr + "\n```");
        contents.push(container ? `*Member variable${container}*` : matchedSymbol.isExported ? "*Exported top-level variable*" : "*Local variable*");
      } else if (matchedSymbol.kind === "function") {
        const container = matchedSymbol.containerName ? ` of \`${matchedSymbol.containerName}\`` : "";
        contents.push("```typelang\nfunction " + word + ": " + typeStr + "\n```");
        contents.push(container ? `*Member function${container}*` : matchedSymbol.isExported ? "*Exported function*" : "*Function definition*");
      } else if (matchedSymbol.kind === "type_alias") {
        const container = matchedSymbol.containerName ? ` in \`${matchedSymbol.containerName}\`` : "";
        contents.push("```typelang\ntype " + word + " = " + typeStr + "\n```");
        contents.push(`*Type alias${container}*`);
      } else if (matchedSymbol.kind === "module") {
        contents.push("```typelang\nmodule " + word + "\n```");
        contents.push("*Module definition*");
      } else if (matchedSymbol.kind === "reference") {
        const isFun = matchedSymbol.type && (matchedSymbol.type.kind === "fun" || matchedSymbol.type.kind === "poly" && matchedSymbol.type.type.kind === "fun");
        if (isFun) {
          contents.push("```typelang\nfunction " + word + ": " + typeStr + "\n```");
          contents.push(matchedSymbol.isExported ? "*Exported function*" : "*Function*");
        } else {
          const prefix = matchedSymbol.isMut ? "let mut" : "let";
          contents.push("```typelang\n" + prefix + " " + word + ": " + typeStr + "\n```");
          contents.push(matchedSymbol.isExported ? "*Exported variable*" : "*Variable*");
        }
      } else {
        contents.push("```typelang\n" + matchedSymbol.kind + " " + word + ": " + typeStr + "\n```");
      }
      const docText = matchedSymbol.doc || env2.docs?.get(word) || getRootBuiltinDoc(word) || BUILTIN_HOVER_DB[word]?.doc;
      if (docText) {
        contents.push(docText);
      }
      return { contents, word };
    }
    if (env2.vars.has(word)) {
      const type = env2.vars.get(word);
      const typeStr = formatHoverType(type);
      contents.push("```typelang\nlet " + word + ": " + typeStr + "\n```");
      contents.push("*Inferred symbol type in global scope*");
      if (env2.docs?.has(word)) contents.push(env2.docs.get(word));
      return { contents, word };
    }
    if (env2.gadts.has(word)) {
      const gadt = env2.gadts.get(word);
      const params = gadt.typeParams.length > 0 ? `<${gadt.typeParams.map((tp) => typeParamToString(tp)).join(", ")}>` : "";
      contents.push("```typelang\ntype " + gadt.name + params + "\n```");
      contents.push(`**GADT Data Type** with ${gadt.constructors.length} constructor(s):`);
      gadt.constructors.forEach((c) => {
        contents.push(`- \`${c.name}\``);
      });
      return { contents, word };
    }
    for (const [gadtName, gadt] of env2.gadts.entries()) {
      const ctor = gadt.constructors.find((c) => c.name === word);
      if (ctor) {
        const params = ctor.params.map((p) => `${p.name}: ${Formatter.formatTypeAST(p.type)}`).join(", ");
        contents.push("```typelang\n" + ctor.name + "(" + params + "): " + gadtName + "\n```");
        contents.push(`*GADT Constructor for type \`${gadtName}\`*`);
        return { contents, word };
      }
    }
    if (env2.typeAliases.has(word)) {
      const alias = env2.typeAliases.get(word);
      const typeStr = typeToString(alias.type);
      const params = alias.typeParams.length > 0 ? `<${alias.typeParams.map((tp) => typeParamToString(tp)).join(", ")}>` : "";
      contents.push("```typelang\ntype " + word + params + " = " + typeStr + "\n```");
      contents.push(`*Type Alias Definition*`);
      return { contents, word };
    }
    if (env2.modules.has(word)) {
      const mod = env2.modules.get(word);
      contents.push("```typelang\nmodule " + word + "\n```");
      contents.push(`**Module Scope** containing ${mod.exports.size} exported member(s).`);
      if (mod.moduleDoc) contents.push(mod.moduleDoc);
      return { contents, word };
    }
  } catch {
  }
  if (["number", "boolean", "string", "void"].includes(word)) {
    contents.push(`\`\`\`typelang
primitive type ${word}
\`\`\``);
    contents.push(`Built-in primitive type.`);
    return { contents, word };
  }
  return null;
}
function getCompletionInformation(code2, line, col) {
  const lines = code2.split("\n");
  if (line < 1 || line > lines.length) return [];
  const lineText = lines[line - 1].substring(0, col - 1);
  const userModuleMatches = code2.matchAll(/\bmodule\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
  const discoveredUserModules = /* @__PURE__ */ new Set();
  for (const m of userModuleMatches) {
    discoveredUserModules.add(m[1]);
  }
  let ast = { statements: [] };
  try {
    const lexer = new Lexer(code2);
    const parser = new Parser(lexer.tokenize());
    ast = parser.parseProgram(true);
  } catch (e) {
    if (e && e.program) ast = e.program;
  }
  const checker = new TypeChecker();
  checker.addError = () => {
  };
  let env2;
  try {
    env2 = checker.checkProgram(ast);
  } catch {
    env2 = createInitialEnv();
  }
  function getModuleExports(modName) {
    const items = [];
    const seen = /* @__PURE__ */ new Set();
    const modEnv = env2.modules.get(modName);
    if (modEnv) {
      const exportNames = new Set(modEnv.exports);
      if (exportNames.size === 0) {
        for (const k of modEnv.vars.keys()) exportNames.add(k);
        for (const k of modEnv.gadts.keys()) exportNames.add(k);
        for (const k of modEnv.typeAliases.keys()) exportNames.add(k);
      }
      for (const name of exportNames) {
        if (seen.has(name)) continue;
        seen.add(name);
        const ty = modEnv.vars.get(name);
        let kind = "function";
        let detail = `member of ${modName}`;
        if (ty) {
          const isFun = ty.kind === "fun" || ty.kind === "poly" && ty.type.kind === "fun";
          kind = isFun ? "function" : "constant";
          detail = `${name}: ${typeToString(ty)}`;
        } else if (modEnv.gadts.has(name) || modEnv.typeAliases.has(name)) {
          kind = "type";
          detail = `type ${name}`;
        }
        let doc = modEnv.docs?.get(name) || BUILTIN_HOVER_DB[name]?.doc || BUILTIN_HOVER_DB[`${modName}.${name}`]?.doc;
        if (!doc) {
          const stdMod2 = STDLIB_MODULES.find((m) => m.name === modName);
          const stdFn = stdMod2?.functions.find((f) => f.name === name);
          if (stdFn) {
            doc = stdFn.description;
            if (!detail || detail.startsWith("member of")) detail = stdFn.signature;
          }
        }
        items.push({
          label: name,
          kind,
          detail,
          documentation: doc || `Exported ${kind} \`${name}\` from module \`${modName}\`.`,
          insertText: name
        });
      }
      for (const gName of modEnv.gadts.keys()) {
        if (!seen.has(gName)) {
          seen.add(gName);
          items.push({
            label: gName,
            kind: "type",
            detail: `type ${gName}`,
            documentation: `GADT type \`${gName}\` from module \`${modName}\`.`,
            insertText: gName
          });
        }
      }
      for (const tName of modEnv.typeAliases.keys()) {
        if (!seen.has(tName)) {
          seen.add(tName);
          items.push({
            label: tName,
            kind: "type",
            detail: `type ${tName}`,
            documentation: `Type alias \`${tName}\` from module \`${modName}\`.`,
            insertText: tName
          });
        }
      }
    }
    const stdMod = STDLIB_MODULES.find((m) => m.name === modName);
    if (stdMod) {
      for (const fn of stdMod.functions) {
        if (!seen.has(fn.name)) {
          seen.add(fn.name);
          items.push({
            label: fn.name,
            kind: "function",
            detail: fn.signature,
            documentation: fn.description,
            insertText: fn.name
          });
        }
      }
      if (modName === "Option") {
        if (!seen.has("Some")) items.push({ label: "Some", kind: "constructor", detail: "Some<a>(val: a): Option<a>", documentation: "Constructs an Option containing a value.", insertText: "Some" });
        if (!seen.has("None")) items.push({ label: "None", kind: "constructor", detail: "None: Option<a>", documentation: "Represents the empty Option variant.", insertText: "None" });
      } else if (modName === "Result") {
        if (!seen.has("Ok")) items.push({ label: "Ok", kind: "constructor", detail: "Ok<a, e>(val: a): Result<a, e>", documentation: "Constructs a success Result value.", insertText: "Ok" });
        if (!seen.has("Err")) items.push({ label: "Err", kind: "constructor", detail: "Err<a, e>(err: e): Result<a, e>", documentation: "Constructs an error Result value.", insertText: "Err" });
      } else if (modName === "Either") {
        if (!seen.has("Left")) items.push({ label: "Left", kind: "constructor", detail: "Left<l, r>(left: l): Either<l, r>", insertText: "Left" });
        if (!seen.has("Right")) items.push({ label: "Right", kind: "constructor", detail: "Right<l, r>(right: r): Either<l, r>", insertText: "Right" });
      } else if (modName === "Validation") {
        if (!seen.has("Valid")) items.push({ label: "Valid", kind: "constructor", detail: "Valid<a>(val: a): Validation<a>", insertText: "Valid" });
        if (!seen.has("Invalid")) items.push({ label: "Invalid", kind: "constructor", detail: "Invalid<a>(errs: [string]): Validation<a>", insertText: "Invalid" });
      }
    }
    return items;
  }
  function getAllModules() {
    const modules = [];
    const seen = /* @__PURE__ */ new Set();
    for (const stdMod of STDLIB_MODULES) {
      seen.add(stdMod.name);
      modules.push({
        label: stdMod.name,
        kind: "module",
        detail: `module ${stdMod.name} (${stdMod.category})`,
        documentation: `${stdMod.tagline}

${stdMod.description}`,
        insertText: stdMod.name
      });
    }
    for (const modName of env2.modules.keys()) {
      if (!seen.has(modName)) {
        seen.add(modName);
        modules.push({
          label: modName,
          kind: "module",
          detail: `module ${modName}`,
          documentation: env2.modules.get(modName)?.moduleDoc || `Module namespace \`${modName}\`.`,
          insertText: modName
        });
      }
    }
    for (const userMod of discoveredUserModules) {
      if (!seen.has(userMod)) {
        seen.add(userMod);
        modules.push({
          label: userMod,
          kind: "module",
          detail: `module ${userMod}`,
          documentation: `User-defined module \`${userMod}\`.`,
          insertText: userMod
        });
      }
    }
    return modules;
  }
  const fullTextBeforeCursor = lines.slice(0, line - 1).join("\n") + (line > 1 ? "\n" : "") + lineText;
  const importMembersMatch = fullTextBeforeCursor.match(/import\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\s*\.\s*\{([^}]*)$/);
  if (importMembersMatch) {
    const modName = importMembersMatch[1];
    const inner = importMembersMatch[2];
    const parts = inner.split(",");
    const currentPrefix = parts[parts.length - 1].trim().toLowerCase();
    const alreadyImported = new Set(parts.slice(0, -1).map((p) => p.trim()).filter(Boolean));
    const exports2 = getModuleExports(modName);
    const results2 = [];
    if (!alreadyImported.has("*") && ("*".startsWith(currentPrefix) || currentPrefix === "")) {
      results2.push({
        label: "*",
        kind: "keyword",
        detail: `Import all exports from ${modName}`,
        documentation: `Imports every exported member of \`${modName}\` into current scope.`,
        insertText: "*",
        filterText: "*",
        sortText: "0_*"
      });
    }
    for (const exp of exports2) {
      if (alreadyImported.has(exp.label)) continue;
      if (currentPrefix === "" || exp.label.toLowerCase().includes(currentPrefix)) {
        const isPrefix = exp.label.toLowerCase().startsWith(currentPrefix);
        results2.push({
          ...exp,
          filterText: exp.label,
          sortText: isPrefix ? `0_${exp.label}` : `1_${exp.label}`
        });
      }
    }
    return results2;
  }
  const importDotMatch = lineText.match(/import\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\.\s*([a-zA-Z0-9_{]*)$/);
  if (importDotMatch) {
    const modName = importDotMatch[1];
    const dotPrefix = importDotMatch[2].toLowerCase();
    const results2 = [
      {
        label: "{ ... }",
        kind: "snippet",
        detail: `Import specifiers from ${modName}`,
        insertText: "{ ${1:members} }",
        isSnippet: true,
        filterText: "{",
        documentation: `Selectively import members from \`${modName}\`.`,
        sortText: "0_0"
      },
      {
        label: "{ * }",
        kind: "snippet",
        detail: `Import all exports from ${modName}`,
        insertText: "{ * }",
        filterText: "{*",
        documentation: `Import every exported member of \`${modName}\`.`,
        sortText: "0_1"
      }
    ];
    const exports2 = getModuleExports(modName);
    for (const exp of exports2) {
      if (dotPrefix === "" || exp.label.toLowerCase().includes(dotPrefix) || `{ ${exp.label} }`.toLowerCase().includes(dotPrefix)) {
        const isPrefix = exp.label.toLowerCase().startsWith(dotPrefix);
        results2.push({
          ...exp,
          label: exp.label,
          detail: `import ${modName}.{ ${exp.label} }`,
          insertText: `{ ${exp.label} }`,
          filterText: exp.label,
          sortText: isPrefix ? `0_${exp.label}` : `1_${exp.label}`
        });
        results2.push({
          ...exp,
          label: `{ ${exp.label} }`,
          detail: `import ${modName}.{ ${exp.label} }`,
          insertText: `{ ${exp.label} }`,
          filterText: `{ ${exp.label} }`,
          sortText: isPrefix ? `0_z_${exp.label}` : `1_z_${exp.label}`
        });
      }
    }
    return results2;
  }
  const importModMatch = lineText.match(/import\s+([a-zA-Z0-9_]*)$/);
  if (importModMatch) {
    const modPrefix = importModMatch[1].toLowerCase();
    const allMods = getAllModules();
    const results2 = [];
    for (const mod of allMods) {
      if (modPrefix === "" || mod.label.toLowerCase().includes(modPrefix)) {
        const isPrefix = mod.label.toLowerCase().startsWith(modPrefix);
        results2.push({
          ...mod,
          filterText: mod.label,
          sortText: isPrefix ? `0_${mod.label}` : `1_${mod.label}`
        });
        results2.push({
          label: `${mod.label}.{ ... }`,
          kind: "snippet",
          detail: `import ${mod.label}.{ members }`,
          insertText: `${mod.label}.{ \${1:members} }`,
          isSnippet: true,
          filterText: `${mod.label} import`,
          documentation: `Import members from \`${mod.label}\`.

${mod.documentation || ""}`,
          sortText: isPrefix ? `0_${mod.label}_0` : `1_${mod.label}_0`
        });
        results2.push({
          label: `${mod.label}.{ * }`,
          kind: "snippet",
          detail: `import ${mod.label}.{ * }`,
          insertText: `${mod.label}.{ * }`,
          filterText: `${mod.label} *`,
          documentation: `Import all exports from \`${mod.label}\`.

${mod.documentation || ""}`,
          sortText: isPrefix ? `0_${mod.label}_1` : `1_${mod.label}_1`
        });
      }
    }
    return results2;
  }
  const importBracesMatch = lineText.match(/import\s*\{\s*([a-zA-Z0-9_]*)$/);
  if (importBracesMatch) {
    const bracePrefix = importBracesMatch[1].toLowerCase();
    const allMods = getAllModules();
    const results2 = [];
    for (const mod of allMods) {
      if (bracePrefix === "" || mod.label.toLowerCase().includes(bracePrefix)) {
        results2.push({
          label: `${mod.label}.{ ... }`,
          kind: "snippet",
          detail: `TypeLang uses: import ${mod.label}.{ members }`,
          insertText: `${mod.label}.{ \${1:members} }`,
          isSnippet: true,
          documentation: `In TypeLang, module imports follow \`import ${mod.label}.{ members }\` syntax.`,
          sortText: `0_${mod.label}`
        });
      }
    }
    return results2;
  }
  const dotMatch = lineText.match(/([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\s*\.\s*([a-zA-Z0-9_]*)$/);
  if (dotMatch) {
    const objectChain = dotMatch[1].split(".");
    const propPrefix = dotMatch[2].toLowerCase();
    const rootName = objectChain[0];
    if (env2.modules.has(rootName) || STDLIB_MODULES.some((m) => m.name === rootName) || discoveredUserModules.has(rootName)) {
      let currentModEnv = env2.modules.get(rootName);
      let currentModName = rootName;
      for (let i = 1; i < objectChain.length; i++) {
        const seg = objectChain[i];
        if (currentModEnv?.modules.has(seg)) {
          currentModEnv = currentModEnv.modules.get(seg);
          currentModName = seg;
        }
      }
      const exports2 = getModuleExports(currentModName);
      return exports2.filter((e) => propPrefix === "" || e.label.toLowerCase().includes(propPrefix)).map((e) => ({
        ...e,
        sortText: e.label.toLowerCase().startsWith(propPrefix) ? `0_${e.label}` : `1_${e.label}`
      }));
    }
    let sym = null;
    for (let i = checker.symbols.length - 1; i >= 0; i--) {
      if (checker.symbols[i].name === rootName) {
        sym = checker.symbols[i];
        break;
      }
    }
    if (!sym && env2.vars.has(rootName)) {
      sym = { name: rootName, type: env2.vars.get(rootName), kind: "variable" };
    }
    if (sym) {
      let currentType = prune(sym.type);
      for (let i = 1; i < objectChain.length; i++) {
        const prop = objectChain[i];
        if (currentType.kind === "rec") {
          const field = currentType.fields.find((f) => f.name === prop);
          if (!field) return [];
          currentType = prune(field.type);
        } else {
          return [];
        }
      }
      if (currentType.kind === "rec") {
        return currentType.fields.filter((f) => propPrefix === "" || f.name.toLowerCase().includes(propPrefix)).map((f) => {
          const isFun = f.type.kind === "fun";
          return {
            label: f.name,
            kind: isFun ? "method" : "property",
            detail: `${f.name}: ${typeToString(f.type)}`,
            documentation: `Record field \`${f.name}\``,
            insertText: f.name,
            sortText: f.name.toLowerCase().startsWith(propPrefix) ? `0_${f.name}` : `1_${f.name}`
          };
        });
      }
    }
    return [];
  }
  const identMatch = lineText.match(/([a-zA-Z_][a-zA-Z0-9_]*)$/);
  const prefix = identMatch ? identMatch[1].toLowerCase() : "";
  const results = [];
  const seenLabels = /* @__PURE__ */ new Set();
  const add = (item) => {
    if (!seenLabels.has(item.label)) {
      seenLabels.add(item.label);
      const lower = item.label.toLowerCase();
      if (prefix === "" || lower.includes(prefix)) {
        const isPrefixMatch = prefix !== "" && lower.startsWith(prefix);
        results.push({
          ...item,
          sortText: item.sortText || (isPrefixMatch ? `0_${item.label}` : `1_${item.label}`)
        });
      }
    }
  };
  for (const [varName, varType] of env2.vars.entries()) {
    if (varName.startsWith("__")) continue;
    const isFun = varType.kind === "fun" || varType.kind === "poly" && varType.type.kind === "fun";
    const doc = env2.docs?.get(varName) || getRootBuiltinDoc(varName) || BUILTIN_HOVER_DB[varName]?.doc;
    add({
      label: varName,
      kind: isFun ? "function" : "variable",
      detail: `${varName}: ${typeToString(varType)}`,
      documentation: doc || `In-scope ${isFun ? "function" : "variable"} \`${varName}\`.`,
      insertText: varName
    });
  }
  for (const [gName, gVal] of env2.gadts.entries()) {
    add({
      label: gName,
      kind: "type",
      detail: `type ${gName}`,
      documentation: `GADT type \`${gName}\`.`,
      insertText: gName
    });
    for (const ctor of gVal.constructors) {
      add({
        label: ctor.name,
        kind: "constructor",
        detail: `constructor ${ctor.name}`,
        documentation: `Constructor for GADT \`${gName}\`.`,
        insertText: ctor.name
      });
    }
  }
  for (const [tName] of env2.typeAliases.entries()) {
    add({
      label: tName,
      kind: "type",
      detail: `type ${tName}`,
      documentation: `Type alias \`${tName}\`.`,
      insertText: tName
    });
  }
  const rootBuiltins = [
    { label: "print", detail: "function print<T>(val: T): void", doc: "Prints a value to standard output without adding a trailing newline." },
    { label: "println", detail: "function println<T>(val: T): void", doc: "Prints a value to standard output followed by a trailing newline." },
    { label: "to_string", detail: "function to_string<T>(val: T): string", doc: "Converts any value (number, boolean, record, tuple) into its canonical string representation." },
    { label: "concat", detail: "function concat(a: string, b: string): string", doc: "Concatenates two string values into a single string." },
    { label: "requestAnimationFrame", detail: "function requestAnimationFrame(callback: () => void): void", doc: "Schedules a callback for the next animation frame in browser runtimes." },
    { label: "setInterval", detail: "function setInterval(callback: () => void, ms: number): number", doc: "Repeatedly invokes a callback at the requested millisecond interval." },
    { label: "clearInterval", detail: "function clearInterval(handle: number): void", doc: "Cancels a repeating timer created by setInterval." },
    { label: "setTimeout", detail: "function setTimeout(callback: () => void, ms: number): number", doc: "Schedules a callback to run once after a delay." },
    { label: "clearTimeout", detail: "function clearTimeout(handle: number): void", doc: "Cancels a pending one-shot timer created by setTimeout." },
    { label: "time_now", detail: "function time_now(): number", doc: "Returns the current UNIX timestamp in milliseconds." },
    { label: "parse_int", detail: "function parse_int(s: string): number", doc: "Parses an integer number from a string representation." },
    { label: "parse_float", detail: "function parse_float(s: string): number", doc: "Parses a floating-point number from a string representation." },
    { label: "math_sqrt", detail: "function math_sqrt(x: number): number", doc: "Returns the square root of a non-negative number." },
    { label: "math_abs", detail: "function math_abs(x: number): number", doc: "Returns the absolute value of a number." },
    { label: "math_floor", detail: "function math_floor(x: number): number", doc: "Rounds a floating point number down to the nearest integer." },
    { label: "math_ceil", detail: "function math_ceil(x: number): number", doc: "Rounds a floating point number up to the nearest integer." },
    { label: "math_round", detail: "function math_round(x: number): number", doc: "Rounds a number to the nearest integer." },
    { label: "math_min", detail: "function math_min(a: number, b: number): number", doc: "Returns the minimum of two numbers." },
    { label: "math_max", detail: "function math_max(a: number, b: number): number", doc: "Returns the maximum of two numbers." },
    { label: "math_pow", detail: "function math_pow(base: number, exp: number): number", doc: "Calculates base raised to the power of exp." },
    { label: "math_random", detail: "function math_random(): number", doc: "Generates a random floating-point number between 0 and 1." },
    { label: "str_len", detail: "function str_len(s: string): number", doc: "Returns the character length of a string." },
    { label: "str_slice", detail: "function str_slice(s: string, start: number, end: number): string", doc: "Extracts a substring slice." },
    { label: "str_split", detail: "function str_split(s: string, delimiter: string): [string]", doc: "Splits a string by a delimiter into an array of substrings." },
    { label: "str_contains", detail: "function str_contains(s: string, substring: string): boolean", doc: "Checks if a string contains a given substring." },
    { label: "array_len", detail: "function array_len<T>(arr: [T]): number", doc: "Returns the number of elements in an array." },
    { label: "array_map", detail: "function array_map<A, B>(arr: [A], fn: (x: A) => B): [B]", doc: "Transforms each element in an array using a mapper callback." },
    { label: "array_filter", detail: "function array_filter<A>(arr: [A], predicate: (x: A) => boolean): [A]", doc: "Filters array elements matching a boolean predicate." },
    { label: "array_reduce", detail: "function array_reduce<A, B>(arr: [A], initial: B, reducer: (acc: B, elem: A) => B): B", doc: "Reduces an array to a single accumulated value." },
    { label: "array_push", detail: "function array_push<A>(arr: [A], elem: A): [A]", doc: "Appends an element to the end of an array." },
    { label: "h", detail: "function h(tag: string, props: any, children: [any]): any", doc: "Creates a Virtual DOM node element with tag, properties/event handlers, and children." },
    { label: "mount", detail: "function mount(containerId: string, vnode: any): void", doc: "Mounts a TypeLang Virtual DOM tree into the specified DOM element container ID." },
    { label: "getElementById", detail: "function getElementById(id: string): any", doc: "Retrieves a DOM element handle by its HTML element ID." },
    { label: "createElement", detail: "function createElement(tag: string): any", doc: "Creates a new DOM element with the given HTML tag name." },
    { label: "playTone", detail: "function playTone(freq: number, duration: number, waveType: string, volume: number): void", doc: "Plays an audio tone through Web Audio API." },
    { label: "playRamp", detail: "function playRamp(startFreq: number, endFreq: number, duration: number, waveType: string, volume: number): void", doc: "Plays a frequency sweep/ramp sound." },
    { label: "playSequence", detail: "function playSequence(notes: [number], noteDuration: number, waveType: string, volume: number): void", doc: "Plays an ordered sequence of note frequencies." },
    { label: "confetti", detail: "function confetti(count: number, spread: number, originY: number): void", doc: "Triggers a colorful particle confetti celebration on screen." }
  ];
  for (const b of rootBuiltins) {
    add({
      label: b.label,
      kind: "function",
      detail: b.detail,
      documentation: b.doc,
      insertText: b.label,
      filterText: b.label
    });
  }
  for (const mod of getAllModules()) {
    add({
      ...mod,
      filterText: mod.label
    });
  }
  for (const stdMod of STDLIB_MODULES) {
    for (const fn of stdMod.functions) {
      const qualified = `${stdMod.name}.${fn.name}`;
      if (prefix === "" || qualified.toLowerCase().includes(prefix) || fn.name.toLowerCase().includes(prefix)) {
        add({
          label: qualified,
          kind: "function",
          detail: `${qualified}: ${fn.signature}`,
          documentation: fn.description,
          insertText: qualified,
          filterText: `${fn.name} ${qualified}`
        });
      }
    }
  }
  const constructors = [
    { label: "Some", detail: "Some<a>(val: a): Option<a>", doc: "Constructs an Option containing a value." },
    { label: "None", detail: "None: Option<a>", doc: "Represents an empty Option value." },
    { label: "Ok", detail: "Ok<a, e>(val: a): Result<a, e>", doc: "Constructs a success Result value." },
    { label: "Err", detail: "Err<a, e>(err: e): Result<a, e>", doc: "Constructs an error Result value." },
    { label: "Left", detail: "Left<l, r>(left: l): Either<l, r>", doc: "Constructs the Left variant of Either." },
    { label: "Right", detail: "Right<l, r>(right: r): Either<l, r>", doc: "Constructs the Right variant of Either." },
    { label: "Valid", detail: "Valid<a>(val: a): Validation<a>", doc: "Constructs a valid Validation value." },
    { label: "Invalid", detail: "Invalid<a>(errs: [string]): Validation<a>", doc: "Constructs an invalid Validation error accumulator." },
    { label: "true", detail: "boolean (literal true)", doc: "Boolean true constant value." },
    { label: "false", detail: "boolean (literal false)", doc: "Boolean false constant value." }
  ];
  for (const c of constructors) {
    add({
      label: c.label,
      kind: c.label === "true" || c.label === "false" ? "constant" : "constructor",
      detail: c.detail,
      documentation: c.doc,
      insertText: c.label
    });
  }
  const builtinTypes = [
    "number",
    "string",
    "boolean",
    "void",
    "any",
    "never",
    "unknown",
    "Option",
    "Result",
    "List",
    "Array",
    "Map",
    "Set",
    "Promise"
  ];
  for (const t of builtinTypes) {
    add({
      label: t,
      kind: "type",
      detail: `type ${t}`,
      documentation: `TypeLang type \`${t}\`.`,
      insertText: t
    });
  }
  for (let i = checker.symbols.length - 1; i >= 0; i--) {
    const s = checker.symbols[i];
    if (s.name && !s.name.startsWith("__")) {
      const isFun = s.type && (s.type.kind === "fun" || s.type.kind === "poly" && s.type.type.kind === "fun");
      add({
        label: s.name,
        kind: isFun ? "function" : s.kind === "constructor" ? "constructor" : s.kind === "gadt" ? "type" : "variable",
        detail: s.type ? `${s.name}: ${typeToString(s.type)}` : s.name,
        documentation: s.doc || `In-scope ${s.kind} \`${s.name}\``,
        insertText: s.name
      });
    }
  }
  const snippets = [
    {
      label: "import",
      kind: "snippet",
      detail: "import Module.{ members }",
      insertText: "import ${1:Module}.{ ${2:members} }",
      isSnippet: true,
      documentation: "Import exported members from a module"
    },
    {
      label: "let",
      kind: "snippet",
      detail: "let name = value",
      insertText: "let ${1:name} = ${2:value};",
      isSnippet: true,
      documentation: "Declare an immutable let variable binding"
    },
    {
      label: "let mut",
      kind: "snippet",
      detail: "let mut name = value",
      insertText: "let mut ${1:name} = ${2:value};",
      isSnippet: true,
      documentation: "Declare a mutable variable binding"
    },
    {
      label: "function",
      kind: "snippet",
      detail: "function name(param: type): returnType",
      insertText: "function ${1:name}(${2:param}: ${3:number}): ${4:void} {\n  $0\n}",
      isSnippet: true,
      documentation: "Define a function declaration"
    },
    {
      label: "type (GADT)",
      kind: "snippet",
      detail: "type GADT<a> = | Ctor(val: a): GADT<a>",
      insertText: "type ${1:Expr}<a> =\n  | ${2:Lit}(value: number): ${1:Expr}<number>\n  | ${3:Bool}(value: boolean): ${1:Expr}<boolean>",
      isSnippet: true,
      documentation: "Declare a Generalized Algebraic Data Type (GADT)"
    },
    {
      label: "match",
      kind: "snippet",
      detail: "match (expr) { Pattern => result }",
      insertText: "match (${1:expr}) {\n  ${2:Pattern} => ${3:result}\n  ... => ${4:fallback}\n}",
      isSnippet: true,
      documentation: "Exhaustive pattern match expression"
    },
    {
      label: "switch",
      kind: "snippet",
      detail: "switch (expr) { case val => result }",
      insertText: "switch (${1:expr}) {\n  case ${2:value} => ${3:result};\n  default => ${4:fallback};\n}",
      isSnippet: true,
      documentation: "Multi-branch switch statement"
    },
    {
      label: "module",
      kind: "snippet",
      detail: "module Name { export ... }",
      insertText: "module ${1:ModuleName} {\n  export function ${2:doWork}(): ${3:void} {\n    $0\n  }\n}",
      isSnippet: true,
      documentation: "Define a named module namespace with exports"
    },
    {
      label: "extern function",
      kind: "snippet",
      detail: "extern function name(param: type): returnType;",
      insertText: "extern function ${1:name}(${2:param}: ${3:string}): ${4:void};",
      isSnippet: true,
      documentation: "Declare a foreign JavaScript function interface binding"
    },
    {
      label: "if",
      kind: "snippet",
      detail: "if (condition) { ... }",
      insertText: "if (${1:condition}) {\n  $0\n}",
      isSnippet: true,
      documentation: "Conditional branch statement"
    },
    {
      label: "if else",
      kind: "snippet",
      detail: "if (condition) { ... } else { ... }",
      insertText: "if (${1:condition}) {\n  ${2:then}\n} else {\n  ${3:else}\n}",
      isSnippet: true,
      documentation: "Conditional if-else branch statement"
    },
    {
      label: "for",
      kind: "snippet",
      detail: "for (let mut i = 0; i < len; i = i + 1) { ... }",
      insertText: "for (let mut ${1:i} = 0; ${1:i} < ${2:len}; ${1:i} = ${1:i} + 1) {\n  $0\n}",
      isSnippet: true,
      documentation: "Standard iterative for-loop"
    },
    {
      label: "while",
      kind: "snippet",
      detail: "while (condition) { ... }",
      insertText: "while (${1:condition}) {\n  $0\n}",
      isSnippet: true,
      documentation: "Conditional while-loop"
    },
    {
      label: "do",
      kind: "snippet",
      detail: "do(Monad) { x <- comp; pure res }",
      insertText: "do {\n  ${1:x} <- ${2:computation};\n  pure ${3:result};\n}",
      isSnippet: true,
      documentation: "Monadic do-notation block with bind statements and pure return"
    },
    {
      label: "where",
      kind: "snippet",
      detail: "where { let helper = val }",
      insertText: "where {\n  let ${1:helper} = ${2:value};\n}",
      isSnippet: true,
      documentation: "Scoped auxiliary bindings and helper functions"
    },
    {
      label: "pure",
      kind: "keyword",
      detail: "pure value",
      insertText: "pure ${1:value}",
      isSnippet: true,
      documentation: "Lifts a pure value into the current monad"
    },
    {
      label: "return",
      kind: "keyword",
      detail: "return value;",
      insertText: "return ${1:value};",
      isSnippet: true,
      documentation: "Returns a value from a function"
    },
    {
      label: "export",
      kind: "keyword",
      detail: "export declaration",
      insertText: "export ",
      documentation: "Exports a symbol from the current module"
    }
  ];
  for (const snip of snippets) {
    add(snip);
  }
  return results;
}

// ../lang/ariadne.ts
var ANSI = {
  reset: "\x1B[0m",
  bold: "\x1B[1m",
  dim: "\x1B[2m",
  italic: "\x1B[3m",
  underline: "\x1B[4m",
  black: "\x1B[30m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m",
  brightBlack: "\x1B[90m",
  brightRed: "\x1B[91m",
  brightGreen: "\x1B[92m",
  brightYellow: "\x1B[93m",
  brightBlue: "\x1B[94m",
  brightMagenta: "\x1B[95m",
  brightCyan: "\x1B[96m",
  brightWhite: "\x1B[97m"
};
var COLOR_MAP = {
  red: ANSI.brightRed,
  brightRed: ANSI.brightRed,
  yellow: ANSI.brightYellow,
  brightYellow: ANSI.brightYellow,
  blue: ANSI.brightBlue,
  brightBlue: ANSI.brightBlue,
  cyan: ANSI.brightCyan,
  brightCyan: ANSI.brightCyan,
  green: ANSI.brightGreen,
  brightGreen: ANSI.brightGreen,
  magenta: ANSI.brightMagenta,
  brightMagenta: ANSI.brightMagenta,
  white: ANSI.brightWhite,
  brightWhite: ANSI.brightWhite,
  gray: ANSI.brightBlack,
  dim: ANSI.dim
};

// ../lsp/src/server.ts
var systemHost = new NodeSystemHost();
var workspace = new ProjectWorkspace(systemHost);
var connection = (0, import_node.createConnection)(import_node.ProposedFeatures.all);
var documents = new import_node.TextDocuments(TextDocument);
var hasConfigurationCapability = false;
var hasWorkspaceFolderCapability = false;
connection.onInitialize((params) => {
  const capabilities = params.capabilities;
  hasConfigurationCapability = !!(capabilities.general && capabilities.general.configuration);
  hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
  return {
    capabilities: {
      textDocumentSync: 1,
      // Full sync
      hoverProvider: true,
      definitionProvider: true,
      completionProvider: {
        resolveProvider: false,
        triggerCharacters: [".", "{", ":", "<", '"']
      }
    }
  };
});
connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    connection.client.register(
      import_node.DidChangeConfigurationNotification.type,
      void 0
    );
  }
});
connection.onDidChangeConfiguration((_change) => {
  documents.all().forEach(validateTextDocument);
});
documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});
documents.onDidClose((event) => {
  const filePath = uriToFilePath(event.document.uri);
  systemHost.removeOverlay(filePath);
  workspace.invalidateFile(filePath);
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});
function uriToFilePath(uri) {
  if (uri.startsWith("file://")) {
    try {
      return decodeURIComponent(uri.slice("file://".length));
    } catch {
      return uri.slice("file://".length);
    }
  }
  return uri;
}
async function validateTextDocument(textDocument) {
  const text = textDocument.getText();
  const filePath = uriToFilePath(textDocument.uri);
  const diagnostics = [];
  try {
    systemHost.setOverlay(filePath, text);
    workspace.invalidateFile(filePath);
    workspace.checkFile(filePath);
    const fileDiags = workspace.diagnostics.filter(
      (d) => !d.file || d.file === filePath
    );
    if (fileDiags.length > 0) {
      for (const diag of fileDiags) {
        diagnostics.push({
          severity: diag.severity === "warning" ? import_node.DiagnosticSeverity.Warning : diag.severity === "info" ? import_node.DiagnosticSeverity.Information : import_node.DiagnosticSeverity.Error,
          range: {
            start: {
              line: Math.max(0, diag.line - 1),
              character: Math.max(0, diag.col - 1)
            },
            end: {
              line: Math.max(0, (diag.endLine || diag.line) - 1),
              character: Math.max(0, (diag.endCol || diag.col + 1) - 1)
            }
          },
          message: diag.message,
          source: "typelang"
        });
      }
    } else {
      const lexer = new Lexer(text);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parseProgram();
      const checker = new TypeChecker();
      checker.checkProgram(ast);
      for (const diag of checker.diagnostics) {
        diagnostics.push({
          severity: diag.severity === "warning" ? import_node.DiagnosticSeverity.Warning : diag.severity === "info" ? import_node.DiagnosticSeverity.Information : import_node.DiagnosticSeverity.Error,
          range: {
            start: {
              line: Math.max(0, diag.line - 1),
              character: Math.max(0, diag.col - 1)
            },
            end: {
              line: Math.max(0, (diag.endLine || diag.line) - 1),
              character: Math.max(0, (diag.endCol || diag.col + 1) - 1)
            }
          },
          message: diag.message,
          source: "typelang"
        });
      }
    }
  } catch (err) {
    if (err && err.loc) {
      diagnostics.push({
        severity: import_node.DiagnosticSeverity.Error,
        range: {
          start: {
            line: Math.max(0, err.loc.line - 1),
            character: Math.max(0, err.loc.col - 1)
          },
          end: {
            line: Math.max(0, (err.loc.endLine || err.loc.line) - 1),
            character: Math.max(0, (err.loc.endCol || err.loc.col + 1) - 1)
          }
        },
        message: err.message || "Syntax error",
        source: "typelang"
      });
    } else {
      diagnostics.push({
        severity: import_node.DiagnosticSeverity.Error,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 1 }
        },
        message: err?.message || "Unexpected compiler error",
        source: "typelang"
      });
    }
  }
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}
connection.onHover((params) => {
  const document2 = documents.get(params.textDocument.uri);
  if (!document2) return null;
  const text = document2.getText();
  const line = params.position.line + 1;
  const col = params.position.character + 1;
  try {
    const info = getHoverInformation(text, line, col);
    if (!info || !info.contents || info.contents.length === 0) return null;
    const seen = /* @__PURE__ */ new Set();
    const uniqueContents = [];
    for (const item of info.contents) {
      const trimmed = (item || "").trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        uniqueContents.push(trimmed);
      }
    }
    if (uniqueContents.length === 0) return null;
    return {
      contents: {
        kind: import_node.MarkupKind.Markdown,
        value: uniqueContents.join("\n\n")
      }
    };
  } catch {
    return null;
  }
});
connection.onDefinition(
  (params) => {
    const document2 = documents.get(params.textDocument.uri);
    if (!document2) return null;
    const text = document2.getText();
    const line = params.position.line + 1;
    const col = params.position.character + 1;
    try {
      const defLoc = getDefinitionLocation(
        text,
        line,
        col
      );
      if (!defLoc) return null;
      return {
        uri: params.textDocument.uri,
        range: {
          start: {
            line: Math.max(0, defLoc.line - 1),
            character: Math.max(0, defLoc.col - 1)
          },
          end: {
            line: Math.max(0, (defLoc.endLine || defLoc.line) - 1),
            character: Math.max(0, (defLoc.endCol || defLoc.col) - 1)
          }
        }
      };
    } catch {
      return null;
    }
  }
);
connection.onCompletion(
  (params) => {
    const document2 = documents.get(params.textDocument.uri);
    if (!document2) return [];
    const text = document2.getText();
    const line = params.position.line + 1;
    const col = params.position.character + 1;
    try {
      const items = getCompletionInformation(
        text,
        line,
        col
      );
      if (items && items.length > 0) {
        return items.map((item) => ({
          label: item.label,
          kind: mapCompletionKind(item.kind),
          detail: item.detail,
          documentation: item.documentation,
          insertText: item.insertText || item.label,
          sortText: item.sortText,
          filterText: item.filterText
        }));
      }
    } catch {
    }
    return [];
  }
);
function mapCompletionKind(kind) {
  switch (kind) {
    case "function":
      return import_node.CompletionItemKind.Function;
    case "method":
      return import_node.CompletionItemKind.Method;
    case "variable":
      return import_node.CompletionItemKind.Variable;
    case "type":
      return import_node.CompletionItemKind.Class;
    case "module":
      return import_node.CompletionItemKind.Module;
    case "constructor":
      return import_node.CompletionItemKind.Constructor;
    case "snippet":
      return import_node.CompletionItemKind.Snippet;
    case "keyword":
      return import_node.CompletionItemKind.Keyword;
    case "property":
      return import_node.CompletionItemKind.Property;
    case "constant":
      return import_node.CompletionItemKind.Constant;
    default:
      return import_node.CompletionItemKind.Text;
  }
}
documents.listen(connection);
connection.listen();
