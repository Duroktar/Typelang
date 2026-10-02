// TypeLang Generated Server Backend (Node.js Target)
"use strict";

// Core Language Primitives
const $print = (v) => { console.log(typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)); return null; };
const $println = (v) => { console.log(typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)); return null; };
const $to_string = (v) => typeof v === "object" && v !== null ? JSON.stringify(v) : String(v);
const $concat = (a, b) => String(a) + String(b);
class __BreakSignal {}
class __ContinueSignal {}
class __ReturnSignal { constructor(v) { this.value = v; } }

// Standard Library: Math Module
const $Math = {
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
  PI: Math.PI
};
const Math$sqrt = $Math.sqrt, Math$abs = $Math.abs, Math$floor = $Math.floor, Math$ceil = $Math.ceil;
const Math$round = $Math.round, Math$min = $Math.min, Math$max = $Math.max, Math$pow = $Math.pow, Math$random = $Math.random;
const Math$cos = $Math.cos, Math$sin = $Math.sin, Math$atan2 = $Math.atan2, Math$log = $Math.log, Math$PI = $Math.PI;

// Standard Library: Array Module
const $Array = {
  len: (arr) => Array.isArray(arr) ? arr.length : 0,
  map: (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.map(fn) : [],
  filter: (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.filter(fn) : [],
  reduce: (arr, init, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.reduce(fn, init) : init,
  push: (arr, elem) => Array.isArray(arr) ? [...arr, elem] : [elem],
  slice: (arr, start, end) => Array.isArray(arr) ? arr.slice(start, end) : [],
  concat: (a, b) => Array.isArray(a) && Array.isArray(b) ? a.concat(b) : []
};
const Array$len = $Array.len, Array$map = $Array.map, Array$filter = $Array.filter, Array$reduce = $Array.reduce;
const Array$push = $Array.push, Array$slice = $Array.slice, Array$concat = $Array.concat;

// Standard Library: String Module
const $String = {
  len: (s) => String(s).length,
  slice: (s, start, end) => String(s).slice(start, end),
  split: (s, delim) => String(s).split(delim),
  contains: (s, sub) => String(s).includes(sub),
  parseInt: (s) => Number.parseInt(String(s), 10),
  parseFloat: (s) => Number.parseFloat(String(s))
};
const String$len = $String.len, String$slice = $String.slice, String$split = $String.split, String$contains = $String.contains;
const String$parseInt = $String.parseInt, String$parseFloat = $String.parseFloat;

// Standard Library: DOM Module (Browser Target)
const $dom_render_vnode = (vnode) => {
  if (vnode === null || vnode === undefined) return document.createTextNode("");
  if (typeof vnode === "string" || typeof vnode === "number" || typeof vnode === "boolean") return document.createTextNode(String(vnode));
  if (Array.isArray(vnode)) {
    const frag = document.createDocumentFragment();
    for (const child of vnode) frag.appendChild($dom_render_vnode(child));
    return frag;
  }
  if (typeof Node !== "undefined" && vnode instanceof Node) return vnode;
  if (!vnode.$vnode) return document.createTextNode(typeof vnode === "object" ? JSON.stringify(vnode) : String(vnode));
  const isSvg = ["svg", "path", "circle", "rect", "line", "polyline", "polygon", "text", "g"].includes(vnode.tag);
  const el = isSvg
    ? document.createElementNS("http://www.w3.org/2000/svg", vnode.tag)
    : document.createElement(vnode.tag);
  if (vnode.props) {
    const props = (typeof vnode.props === "object" && vnode.props !== null) ? vnode.props : {};
    for (const [k, val] of Object.entries(props)) {
      if (k.startsWith("on") && typeof val === "function") {
        el.addEventListener(k.slice(2).toLowerCase(), val);
      } else if (k === "className" || k === "class") {
        if (isSvg) el.setAttribute("class", val);
        else el.className = val;
      } else if (k === "style") {
        if (typeof val === "object" && val !== null && el.style) {
          Object.assign(el.style, val);
        } else if (typeof val === "string" && el.style) {
          el.style.cssText = val;
        }
      } else if (k === "value" && el && ("value" in el)) {
        el.value = String(val);
      } else if (k === "checked" && el && ("checked" in el)) {
        el.checked = Boolean(val);
      } else if (el && typeof el.setAttribute === "function") {
        el.setAttribute(k, String(val));
      }
    }
  }
  if (vnode.children) {
    const childrenArr = Array.isArray(vnode.children) ? vnode.children : [vnode.children];
    for (const child of childrenArr) {
      if (child !== null && child !== undefined) {
        el.appendChild($dom_render_vnode(child));
      }
    }
  }
  return el;
};
const $DOM = {
  getElementById: (id) => {
    if (typeof $mountTarget !== "undefined" && $mountTarget) {
      if ($mountTarget.id === id) return $mountTarget;
      const inner = $mountTarget.querySelector("#" + id);
      if (inner) return inner;
    }
    return typeof document !== "undefined" ? document.getElementById(id) : null;
  },
  createElement: (tag) => typeof document !== "undefined" ? document.createElement(tag) : { tag, attrs: {}, children: [] },
  setText: (el, text) => { if (el && "textContent" in el) el.textContent = String(text); return null; },
  setHtml: (el, html) => { if (el && "innerHTML" in el) el.innerHTML = String(html); return null; },
  setAttr: (el, k, v) => { if (el && "setAttribute" in el) el.setAttribute(k, String(v)); return null; },
  appendChild: (parent, child) => { if (parent && "appendChild" in parent && child) parent.appendChild(child); return null; },
  addEventListener: (el, evt, handler) => { if (el && "addEventListener" in el) el.addEventListener(evt, handler); return null; },
  h: (tag, props = {}, children = []) => ({ $vnode: true, tag, props: props || {}, children: Array.isArray(children) ? children : [children] }),
  mount: (containerId, vnode) => {
    let root = null;
    if (typeof $mountTarget !== "undefined" && $mountTarget) {
      if (typeof containerId === "string") {
        if ($mountTarget.id === containerId) root = $mountTarget;
        else root = $mountTarget.querySelector("#" + containerId) || $mountTarget;
      } else {
        root = containerId;
      }
    }
    if (!root && typeof document !== "undefined") {
      root = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
    }
    if (root) {
      root.innerHTML = "";
      root.appendChild($dom_render_vnode(vnode));
    }
    return null;
  },
  eval: (code) => eval(code),
  log: (v) => { console.log(v); return null; }
};
const DOM$getElementById = $DOM.getElementById, DOM$createElement = $DOM.createElement, DOM$setText = $DOM.setText;
const DOM$setHtml = $DOM.setHtml, DOM$setAttr = $DOM.setAttr, DOM$appendChild = $DOM.appendChild, DOM$addEventListener = $DOM.addEventListener;
const DOM$h = $DOM.h, DOM$mount = $DOM.mount, DOM$eval = $DOM.eval, DOM$log = $DOM.log;

// Standard Library: Node.js / Universal Data Processing Module
const $node_req = (m) => { try { return typeof require !== "undefined" ? require(m) : null; } catch (_) { return null; } };
const fs = $node_req("fs");
const path = $node_req("path");
const http = $node_req("http");

const $Node = {
  envGet: (k) => (typeof process !== "undefined" && process.env ? process.env[k] || "" : ""),
  readFile: (p) => fs ? fs.readFileSync(p, "utf-8") : `// Mock file content for ${p}`,
  writeFile: (p, content) => { if (fs) fs.writeFileSync(p, content, "utf-8"); return null; },
  stringify: (data) => JSON.stringify(data),
  parse: (str) => JSON.parse(str),
  now: () => Date.now(),
  createApp: () => {
    const express = $node_req("express");
    if (express) {
      try { return express(); } catch (_) {}
    }
    const routes = [];
    const middlewares = [];
    const app = {
      use: (fn) => { middlewares.push(fn); return app; },
      get: (p, fn) => { routes.push({ method: "GET", path: p, fn }); return app; },
      post: (p, fn) => { routes.push({ method: "POST", path: p, fn }); return app; },
      listen: (port, cb) => {
        if (http) {
          const server = http.createServer((req, res) => {
            res.json = (data) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(data)); };
            res.status = (code) => { res.statusCode = code; return res; };
            res.send = (body) => { res.end(String(body)); };
            const matched = routes.find(r => r.method === req.method && r.path === req.url);
            if (matched) return matched.fn(req, res);
            res.statusCode = 404; res.end("Not Found");
          });
          server.listen(port, () => { if (cb) cb(); });
          return server;
        }
        console.log(`[Mock Server] Listening on port ${port}`);
        if (cb) cb();
        return { close: () => {} };
      }
    };
    return app;
  },
  get: (app, p, handler) => { if (app && app.get) app.get(p, handler); return null; },
  post: (app, p, handler) => { if (app && app.post) app.post(p, handler); return null; },
  use: (app, middleware) => { if (app && app.use) app.use(middleware); return null; },
  listen: (app, port, cb) => { console.log(`[Express Engine] Server listening on port ${port}`); if (cb) cb(); return { close: () => {} }; },
  send: (res, body) => { if (res && res.send) res.send(body); else if (res && res.end) res.end(body); return null; },
  json: (res, data) => { if (res && res.json) res.json(data); else if (res && res.end) res.end(JSON.stringify(data)); return null; },
  status: (res, code) => { if (res && res.status) return res.status(code); if (res) res.statusCode = code; return res; }
};
const Node$envGet = $Node.envGet, Node$readFile = $Node.readFile, Node$writeFile = $Node.writeFile;
const Node$stringify = $Node.stringify, Node$parse = $Node.parse, Node$now = $Node.now, Node$createApp = $Node.createApp;
const Node$get = $Node.get, Node$post = $Node.post, Node$use = $Node.use, Node$listen = $Node.listen;
const Node$send = $Node.send, Node$json = $Node.json, Node$status = $Node.status;

function findNumber(arr, target) {
  try {
  try { for (let i = 0; (i < 5); (i = (i + 1))) { try {
    ((i === target) ? (() => {
      return (function(){ throw new __ReturnSignal(true); })();
    })() : null);
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
  return (function(){ throw new __ReturnSignal(false); })();
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
findNumber([1, 2, 3, 4, 5], 3);
