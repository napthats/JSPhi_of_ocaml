// This program was compiled from OCaml by js_of_ocaml 1.0
function caml_raise_with_arg (tag, arg) { throw [0, tag, arg]; }
function caml_raise_with_string (tag, msg) {
  caml_raise_with_arg (tag, new MlWrappedString (msg));
}
function caml_invalid_argument (msg) {
  caml_raise_with_string(caml_global_data[4], msg);
}
function caml_array_bound_error () {
  caml_invalid_argument("index out of bounds");
}
function caml_str_repeat(n, s) {
  if (!n) { return ""; }
  if (n & 1) { return caml_str_repeat(n - 1, s) + s; }
  var r = caml_str_repeat(n >> 1, s);
  return r + r;
}
function MlString(param) {
  if (param != null) {
    this.bytes = this.fullBytes = param;
    this.last = this.len = param.length;
  }
}
MlString.prototype = {
  string:null,
  bytes:null,
  fullBytes:null,
  array:null,
  len:null,
  last:0,
  toJsString:function() {
    return this.string = decodeURIComponent (escape(this.getFullBytes()));
  },
  toBytes:function() {
    if (this.string != null)
      var b = unescape (encodeURIComponent (this.string));
    else {
      var b = "", a = this.array, l = a.length;
      for (var i = 0; i < l; i ++) b += String.fromCharCode (a[i]);
    }
    this.bytes = this.fullBytes = b;
    this.last = this.len = b.length;
    return b;
  },
  getBytes:function() {
    var b = this.bytes;
    if (b == null) b = this.toBytes();
    return b;
  },
  getFullBytes:function() {
    var b = this.fullBytes;
    if (b !== null) return b;
    b = this.bytes;
    if (b == null) b = this.toBytes ();
    if (this.last < this.len) {
      this.bytes = (b += caml_str_repeat(this.len - this.last, '\0'));
      this.last = this.len;
    }
    this.fullBytes = b;
    return b;
  },
  toArray:function() {
    var b = this.bytes;
    if (b == null) b = this.toBytes ();
    var a = [], l = this.last;
    for (var i = 0; i < l; i++) a[i] = b.charCodeAt(i);
    for (l = this.len; i < l; i++) a[i] = 0;
    this.string = this.bytes = this.fullBytes = null;
    this.last = this.len;
    this.array = a;
    return a;
  },
  getArray:function() {
    var a = this.array;
    if (!a) a = this.toArray();
    return a;
  },
  getLen:function() {
    var len = this.len;
    if (len !== null) return len;
    this.toBytes();
    return this.len;
  },
  toString:function() { var s = this.string; return s?s:this.toJsString(); },
  valueOf:function() { var s = this.string; return s?s:this.toJsString(); },
  blitToArray:function(i1, a2, i2, l) {
    var a1 = this.array;
    if (a1)
      for (var i = 0; i < l; i++) a2 [i2 + i] = a1 [i1 + i];
    else {
      var b = this.bytes;
      if (b == null) b = this.toBytes();
      var l1 = this.last - i1;
      if (l <= l1)
        for (var i = 0; i < l; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
      else {
        for (var i = 0; i < l1; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
        for (; i < l; i++) a2 [i2 + i] = 0;
      }
    }
  },
  get:function (i) {
    var a = this.array;
    if (a) return a[i];
    var b = this.bytes;
    if (b == null) b = this.toBytes();
    return (i<this.last)?b.charCodeAt(i):0;
  },
  safeGet:function (i) {
    if (!this.len) this.toBytes();
    if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
    return this.get(i);
  },
  set:function (i, c) {
    var a = this.array;
    if (!a) {
      if (this.last == i) {
        this.bytes += String.fromCharCode (c & 0xff);
        this.last ++;
        return 0;
      }
      a = this.toArray();
    } else if (this.bytes != null) {
      this.bytes = this.fullBytes = this.string = null;
    }
    a[i] = c & 0xff;
    return 0;
  },
  safeSet:function (i, c) {
    if (this.len == null) this.toBytes ();
    if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
    this.set(i, c);
  },
  fill:function (ofs, len, c) {
    if (ofs >= this.last && this.last && c == 0) return;
    var a = this.array;
    if (!a) a = this.toArray();
    else if (this.bytes != null) {
      this.bytes = this.fullBytes = this.string = null;
    }
    var l = ofs + len;
    for (var i = ofs; i < l; i++) a[i] = c;
  },
  compare:function (s2) {
    if (this.string != null && s2.string != null) {
      if (this.string < s2.string) return -1;
      if (this.string > s2.string) return 1;
      return 0;
    }
    var b1 = this.getFullBytes ();
    var b2 = s2.getFullBytes ();
    if (b1 < b2) return -1;
    if (b1 > b2) return 1;
    return 0;
  },
  equal:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string == s2.string;
    return this.getFullBytes () == s2.getFullBytes ();
  },
  lessThan:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string < s2.string;
    return this.getFullBytes () < s2.getFullBytes ();
  },
  lessEqual:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string <= s2.string;
    return this.getFullBytes () <= s2.getFullBytes ();
  }
}
function MlWrappedString (s) { this.string = s; }
MlWrappedString.prototype = new MlString();
function MlMakeString (l) { this.bytes = ""; this.len = l; }
MlMakeString.prototype = new MlString ();
function caml_js_eval_string () {return eval(arguments[0].toString());}
function caml_call_gen(f, args) {
  if(f.fun)
    return caml_call_gen(f.fun, args);
  var n = f.length;
  var d = n - args.length;
  if (d == 0)
    return f.apply(null, args);
  else if (d < 0)
    return caml_call_gen(f.apply(null, args.slice(0,n)), args.slice(n));
  else
    return function (x){ return caml_call_gen(f, args.concat([x])); };
}
function caml_js_wrap_callback(f) {
  var toArray = Array.prototype.slice;
  return function () {
    var args = (arguments.length > 0)?toArray.call (arguments):[undefined];
    return caml_call_gen(f, args);
  }
}
function caml_ml_out_channels_list () { return 0; }
var caml_global_data = [0];
function caml_register_global (n, v) { caml_global_data[n + 1] = v; }
var caml_named_values = {};
function caml_register_named_value(nm,v) {
  caml_named_values[nm] = v; return 0;
}
(function(){caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,[0,new MlString("Invalid_argument")]);caml_register_global(2,[0,new MlString("Failure")]);var g=new MlString("Pervasives.do_at_exit"),f=new MlString("\n    var NS_JSPHI = com.napthats.jsphi;\n    NS_JSPHI.CLIENT_VERSION = '05103010';\n    var NS_WEBSOCKET = com.napthats.websocket;\n    var URL_WEBSOCKT = 'ws://napthats.com/ws/';\n    var CONTROL_COMMAND = {\n        49: ['1'],\n        50: ['2'],\n        51: ['3'],\n        52: ['4'],\n        53: ['5'],\n        54: ['6'],\n        55: ['7'],\n        56: ['8'],\n        57: ['9'],\n        65: ['read'],\n        66: ['board'],\n        67: ['use'],\n        68: ['erase'],\n        70: ['floor item'],\n        71: ['guard'],\n        72: ['hi'],\n        77: ['check', 'look'],\n        //80: ['pay'],\n        81: ['equip'],\n        82: ['spells'],\n        83: ['write'],\n        86: ['sort'],\n        87: ['unequip'],\n        88: ['put'],\n        89: ['y'],\n        90: ['get'],\n        96: ['check', 'look'],\n        97: ['hit'],\n        98: ['go b'],\n        99: ['cast'],\n        100: ['go l'],\n        101: ['turn b'],\n        102: ['go r'],\n        103: ['turn l'],\n        104: ['go f'],\n        105: ['turn r'],\n        106: ['use'],\n        107: ['get'],\n        109: ['put'],\n        110: ['.'],\n        111: ['equip'],\n        190: ['.']\n    };\n    var CONTROL_COMMAND_SHIFT = {\n        65: ['cast', 'analyze'],\n        66: ['cast', 'call'],\n        67: ['cast', 'create'],\n        68: ['cast', 'detect'],\n        69: ['cast', 'eagle eye'],\n        70: ['cast', 'forget'],\n        73: ['cast', 'identify'],\n        75: ['cast', 'list'],\n        76: ['cast', 'wizard lock'],\n        77: ['cast', 'disappear'],\n        78: ['cast', 'appear'],\n        80: ['cast', 'party eye'],\n        81: ['cast', 'wizard light'],\n        82: ['cast', 'return'],\n        83: ['cast', 'search'],\n        85: ['cast', 'unlock'],\n        87: ['cast', 'wizard eye'],\n        88: ['cast', 'charge spell'],\n        90: ['cast', 'destroy']\n    };\n    var phiUI;\n    var commandExecutor;\n    var ws;\n    var userId;\n    var serverIpPort;\n\n    var login = function(id, ipPort) {\n        userId = id;\n        serverIpPort = ipPort;\n        if (!userId) {\n            phiUI.showErrorMessage('Please set user id first.');\n            return;\n        }\n        //tentative\n        ws.send('$open$:' + serverIpPort);\n        commandExecutor.setUserId(userId);\n        ws.send('#open ' + userId);\n        sendMessageEnterWorld();\n    };\n\n    var logout = function() {\n        commandExecutor.resetExecutor();\n        ws.send('exit');\n    };\n\n    var recvMessage = function(msg){\n        var phidmMessage = NS_JSPHI.phidmMessageParse(msg.data);\n        if (!phidmMessage) return; //message does not exist or not end\n        commandExecutor.exec(phidmMessage);\n    };\n\n    var sendMessage = function(msg) {\n        ws.send(msg);\n    };\n\n    var sendMessageEnterWorld = function() {\n        //test default setting\n        ws.send('#map-iv 1');\n        ws.send('#status-iv 1');\n        ws.send('#version-cli ' + NS_JSPHI.CLIENT_VERSION);\n        ws.send('#ex-switch eagleeye=form');\n        ws.send('#ex-map size=57');\n        ws.send('#ex-map style=turn');\n        ws.send('#ex-switch ex-move-recv=true');\n        ws.send('#ex-switch ex-list-mode-end=true');\n        ws.send('#ex-switch ex-disp-magic=false');\n        //end test\n    };\n\n    var changeWorld = function(ipPort) {\n        serverIpPort = ipPort;\n        savePhirc(userId, serverIpPort);\n        phiUI.setPhirc(readPhircCookie(), userId + '@' + serverIpPort);\n        sendMessageEnterWorld();\n    };\n\n    var finishNewuser = function(id) {\n        userId = id;\n        savePhirc(userId, serverIpPort);\n        phiUI.setPhirc(readPhircCookie(), userId + '@' + serverIpPort);\n        commandExecutor.setUserId(id);\n        sendMessageEnterWorld();\n    };\n\n    var startNewuser = function(name, ipPort) {\n        serverIpPort = ipPort;\n        ws.send('$open$:' + serverIpPort);\n        commandExecutor.startNewuser(name);\n    };\n\n    var importPhirc = function(id, ipPort) {\n        userId = id;\n        serverIpPort = ipPort;\n        savePhirc(userId, serverIpPort);\n        phiUI.setPhirc(readPhircCookie(), userId + '@' + serverIpPort);\n        phiUI.showClientMessage('.phirc load completed.');\n    };\n\n    var showPhirc = function() {\n        if (userId) {\n            phiUI.showClientMessage(userId + ' ' + serverIpPort);\n        }\n        else {\n            phiUI.showErrorMessage('No user login.');\n        }\n    };\n\n    var savePhirc = function(id, ipPort) {\n        var savedPhircList = readPhircCookie();\n        if (!savedPhircList) savedPhircList = [];\n        for (var i = 0; i < savedPhircList.length; i++) {\n            if (id === savedPhircList[i][0]) {\n                savedPhircList[i][1] = ipPort;\n                break;\n            }\n        }\n        if (i === savedPhircList.length) {\n            savedPhircList.push([id, ipPort]);\n        }\n        writePhircCookie(savedPhircList);\n    };\n\n    //var loadPhirc = function(id) {\n    //    var savedPhircList = readPhircCookie();\n    //    if (!savedPhircList) return;\n    //    for (var i = 0; i < savedPhircList.length; i++) {\n    //        if (id === savedPhircList[i][0]) {\n    //            return savedPhircList[i];\n    //        }\n    //    }\n    //};\n\n    NS_JSPHI.readCookie = function(key){\n        var allcookies = document.cookie;\n        var pos = allcookies.indexOf(key + '=');\n        var value;\n        if (pos !== -1) {\n            var start = pos + key.length + 1;\n            var end = allcookies.indexOf(';', start);\n            if (end === -1) end = allcookies.length;\n            value = allcookies.substring(start, end);\n            value = decodeURIComponent(value);\n        }\n        return value;\n    };\n\n    var readPhircCookie = function() {\n        var value = NS_JSPHI.readCookie('phirc');\n        if (!value) return;\n        var phircList = [];\n        var _phircList = value.split(',');\n        for (var i = 0; i < _phircList.length; i++) {\n            phircList.push(_phircList[i].split('@'));\n        }\n        return phircList;\n    };\n\n    var writePhircCookie = function(_phircList) {\n        var phircList = _phircList;\n        for (var i = 0; i < phircList.length; i++) {\n            phircList[i] = phircList[i].join('@');\n        }\n        document.cookie = 'phirc=' + encodeURIComponent(phircList.join(',')) + '; max-age=' + (60*60*24*365*10);\n    };\n\n    \n    ws = NS_WEBSOCKET.connectWebSocket(URL_WEBSOCKT, recvMessage);\n    phiUI = NS_JSPHI.makePhiUI();\n    phiUI.setPhirc(readPhircCookie());\n    phiUI.bind('send', sendMessage);\n    phiUI.bind('login', login);\n    phiUI.bind('logout', logout);\n    phiUI.bind('newuser', startNewuser);\n    phiUI.bind('phirc_load', importPhirc);\n    phiUI.bind('phirc_show', showPhirc);\n    commandExecutor = NS_JSPHI.makeCommandExecutor(phiUI, ws);\n    commandExecutor.bind('change_world', changeWorld);\n    commandExecutor.bind('finish_newuser', finishNewuser);\n\n    //keypad control and shortcut key\n    (function(){\n        var isShiftPressed = false;\n\n        phiUI.bind('control_keydown', function(e){\n            var keycode = e.keyCode;\n            var controlCommand = isShiftPressed ? CONTROL_COMMAND_SHIFT : CONTROL_COMMAND;\n            if (keycode === 9) {\n                $('#text').focus();\n            }\n            if (keycode === 16) {\n                isShiftPressed = true;\n            }\n            if (controlCommand[keycode]) {\n                var commands = controlCommand[keycode];\n                for (var i = 0; i < commands.length; i++) {\n                    ws.send(commands[i]);\n                }\n            }\n            e.preventDefault();\n        });\n\n        phiUI.bind('control_keyup', function(e) {\n            var keycode = e.keyCode;\n            if (keycode === 16) {\n                isShiftPressed = false;\n            }\n        });\n    })();\n\n");function e(d){var a=caml_ml_out_channels_list(0);for(;;){if(a){var b=a[2];try {}catch(c){}var a=b;continue;}return 0;}}caml_register_named_value(g,e);var h=[0,0],l=undefined,k=false,j=Array;function m(i){return i instanceof j?0:[0,new MlWrappedString(i.toString())];}h[1]=[0,m,h[1]];var n=window;window.HTMLElement===l;function p(o){caml_js_eval_string(f);return k;}n.onload=caml_js_wrap_callback(function(q){if(q){var r=p(q);if(!(r|0))q.preventDefault();return r;}var s=event,t=p(s);s.returnValue=t;return t;});e(0);return;}());
