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
function caml_blit_string(s1, i1, s2, i2, len) {
  if (len === 0) return;
  if (i2 === s2.last && s2.bytes != null) {
    var b = s1.bytes;
    if (b == null) b = s1.toBytes ();
    if (i1 > 0 || s1.last > len) b = b.slice(i1, i1 + len);
    s2.bytes += b;
    s2.last += b.length;
    return;
  }
  var a = s2.array;
  if (!a) a = s2.toArray(); else { s2.bytes = s2.string = null; }
  s1.blitToArray (i1, a, i2, len);
}
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
function caml_create_string(len) {
  if (len < 0) caml_invalid_argument("String.create");
  return new MlMakeString(len);
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
(function(){function ao(a1,a2,a3){return a1.length==2?a1(a2,a3):caml_call_gen(a1,[a2,a3]);}caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,[0,new MlString("Invalid_argument")]);caml_register_global(2,[0,new MlString("Failure")]);var V=new MlString("Pervasives.do_at_exit"),U=new MlString(" "),T=new MlString("No user login."),S=new MlString("@"),R=new MlString(".phirc load compin leted."),Q=new MlString("$open$:"),P=new MlString("@"),O=new MlString("@"),N=new MlString("exit"),M=new MlString("Please set user id first."),L=new MlString("napthats.com:20017"),K=new MlString("$open$:"),J=new MlString("guest1"),I=new MlString("guest1"),H=new MlString("#open "),G=new MlString("#map-iv 1"),F=new MlString("#status-iv 1"),E=new MlString("05103010"),D=new MlString("#version-cli "),C=new MlString("#ex-switch eagleeye=form"),B=new MlString("#ex-map size=57"),A=new MlString("#ex-map style=turn"),z=new MlString("#ex-switch ex-move-recv=true"),y=new MlString("#ex-switch ex-list-mode-end=true"),x=new MlString("#ex-switch ex-disp-magic=false"),w=new MlString(""),v=new MlString(""),u=new MlString(""),t=new MlString("ws://napthats.com/ws/"),s=new MlString(""),r=new MlString("send"),q=new MlString("login"),p=new MlString("logout"),o=new MlString("newuser"),n=new MlString("phirc_load"),m=new MlString("phirc_show"),l=new MlString("change_world"),k=new MlString("finish_newuser");function j(a,c){var b=a.getLen(),d=c.getLen(),e=caml_create_string(b+d|0);caml_blit_string(a,0,e,0,b);caml_blit_string(c,0,e,b,d);return e;}function W(i){var f=caml_ml_out_channels_list(0);for(;;){if(f){var g=f[2];try {}catch(h){}var f=g;continue;}return 0;}}caml_register_named_value(V,W);var X=[0,0],aa=null,$=undefined,_=false,Z=Array;function ab(Y){return Y instanceof Z?0:[0,new MlWrappedString(Y.toString())];}X[1]=[0,ab,X[1]];function ad(ac){return ac;}var ae=window;window.HTMLElement===$;function aW(aV){var af=[0,v],ag=[0,u],ah=com.napthats.jsphi,ai=ah.makePhiUI(0),aj=[0,0];function an(ak){var al=ad(ah.phidmMessageParse(ak.data)),am=al==aa?0:[0,al];return am?aj[1].exec(am[1]):0;}var ap=ao(com.napthats.websocket.connectWebSocket,t.toString(),an);aj[1]=ah.makeCommandExecutor(ai,ap);function az(aq){return w;}function au(ar){ap.send(G.toString());ap.send(F.toString());ap.send(j(D,E).toString());ap.send(C.toString());ap.send(B.toString());ap.send(A.toString());ap.send(z.toString());ap.send(y.toString());return ap.send(x.toString());}function aM(as,at){ae.alert(as.toString());ae.alert(at.toString());af[1]=as;ag[1]=at;return 0?ai.showErrorMessage(M.toString()):(ap.send(j(K,L).toString()),aj[1].setUserId(J.toString()),ap.send(j(H,I).toString()),au(0));}function aN(av){aj[1].resetExecutor(0);return ap.send(N.toString());}function aO(aw){return ap.send(aw.toString());}function aP(ax){ag[1]=ax;var ay=j(O,ag[1]),aA=j(af[1],ay).toString();ai.setPhirc(az(0).toString(),aA);return au(0);}function aQ(aB){af[1]=aB;var aC=j(P,ag[1]),aD=j(af[1],aC).toString();ai.setPhirc(az(0).toString(),aD);aj[1].setUserId(aB.toString());return au(0);}function aR(aF,aE){ag[1]=aE;ap.send(j(Q,ag[1]).toString());return aj[1].startNewuser(aF);}function aS(aG,aH){af[1]=aG;ag[1]=aH;var aI=j(S,ag[1]),aJ=j(af[1],aI).toString();ai.setPhirc(az(0).toString(),aJ);return ai.showClientMessage(R.toString());}function aT(aL){if(0){var aK=j(U,ag[1]);return ai.showClientMessage(j(af[1],aK).toString());}return ai.showErrorMessage(T.toString());}var aU=s.toString();ai.setPhirc(az(0).toString(),aU);ai.bind(r.toString(),aO);ai.bind(q.toString(),aM);ai.bind(p.toString(),aN);ai.bind(o.toString(),aR);ai.bind(n.toString(),aS);ai.bind(m.toString(),aT);aj[1].bind(l.toString(),aP);aj[1].bind(k.toString(),aQ);return _;}ae.onload=ad(caml_js_wrap_callback(function(aX){if(aX){var aY=aW(aX);if(!(aY|0))aX.preventDefault();return aY;}var aZ=event,a0=aW(aZ);aZ.returnValue=a0;return a0;}));W(0);return;}());
