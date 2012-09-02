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
function caml_int64_compare(x,y) {
  var x3 = x[3] << 16;
  var y3 = y[3] << 16;
  if (x3 > y3) return 1;
  if (x3 < y3) return -1;
  if (x[2] > y[2]) return 1;
  if (x[2] < y[2]) return -1;
  if (x[1] > y[1]) return 1;
  if (x[1] < y[1]) return -1;
  return 0;
}
function caml_int_compare (a, b) {
  if (a < b) return (-1); if (a == b) return 0; return 1;
}
function caml_compare_val (a, b, total) {
  var stack = [];
  for(;;) {
    if (!(total && a === b)) {
      if (a instanceof MlString) {
        if (b instanceof MlString) {
            if (a != b) {
		var x = a.compare(b);
		if (x != 0) return x;
	    }
        } else
          return 1;
      } else if (a instanceof Array && a[0] === (a[0]|0)) {
        var ta = a[0];
        if (ta === 250) {
          a = a[1];
          continue;
        } else if (b instanceof Array && b[0] === (b[0]|0)) {
          var tb = b[0];
          if (tb === 250) {
            b = b[1];
            continue;
          } else if (ta != tb) {
            return (ta < tb)?-1:1;
          } else {
            switch (ta) {
            case 248: {
		var x = caml_int_compare(a[2], b[2]);
		if (x != 0) return x;
		break;
	    }
            case 255: {
		var x = caml_int64_compare(a, b);
		if (x != 0) return x;
		break;
	    }
            default:
              if (a.length != b.length) return (a.length < b.length)?-1:1;
              if (a.length > 1) stack.push(a, b, 1);
            }
          }
        } else
          return 1;
      } else if (b instanceof MlString ||
                 (b instanceof Array && b[0] === (b[0]|0))) {
        return -1;
      } else {
        if (a < b) return -1;
        if (a > b) return 1;
        if (total && a != b) {
          if (a == a) return 1;
          if (b == b) return -1;
        }
      }
    }
    if (stack.length == 0) return 0;
    var i = stack.pop();
    b = stack.pop();
    a = stack.pop();
    if (i + 1 < a.length) stack.push(a, b, i + 1);
    a = a[i];
    b = b[i];
  }
}
function caml_compare (a, b) { return caml_compare_val (a, b, true); }
function caml_create_string(len) {
  if (len < 0) caml_invalid_argument("String.create");
  return new MlMakeString(len);
}
function caml_js_eval_string () {return eval(arguments[0].toString());}
function caml_js_from_array(a) { return a.slice(1); }
function caml_js_wrap_callback(f) {
  var toArray = Array.prototype.slice;
  return function () {
    var args = (arguments.length > 0)?toArray.call (arguments):[undefined];
    return caml_call_gen(f, args);
  }
}
function caml_make_vect (len, init) {
  var b = [0]; for (var i = 1; i <= len; i++) b[i] = init; return b;
}
function caml_ml_out_channels_list () { return 0; }
var caml_global_data = [0];
function caml_register_global (n, v) { caml_global_data[n + 1] = v; }
var caml_named_values = {};
function caml_register_named_value(nm,v) {
  caml_named_values[nm] = v; return 0;
}
function caml_string_equal(s1, s2) {
  var b1 = s1.fullBytes;
  var b2 = s2.fullBytes;
  if (b1 != null && b2 != null) return (b1 == b2)?1:0;
  return (s1.getFullBytes () == s2.getFullBytes ())?1:0;
}
function caml_string_notequal(s1, s2) { return 1-caml_string_equal(s1, s2); }
(function(){function a8(cu,cv,cw){return cu.length==2?cu(cv,cw):caml_call_gen(cu,[cv,cw]);}function an(cs,ct){return cs.length==1?cs(ct):caml_call_gen(cs,[ct]);}var a=[0,new MlString("Invalid_argument")],b=new MlString("phirc"),c=new MlString(",");caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,a);caml_register_global(2,[0,new MlString("Failure")]);var d=[0,new MlString("Pervasives.Exit")],aj=[0,new MlString("Not_found")],ai=new MlString("Pervasives.do_at_exit"),ah=new MlString("String.sub"),ag=new MlString(""),af=new MlString(""),ae=new MlString("ExtString.Invalid_string"),ad=new MlString("$('#text').focus();"),ac=new MlString("@"),ab=new MlString(""),aa=new MlString(" "),$=new MlString("No user login."),_=new MlString("@"),Z=new MlString(".phirc load completed."),Y=new MlString("$open$:"),X=new MlString("@"),W=new MlString("@"),V=new MlString(""),U=new MlString("="),T=new MlString(""),S=new MlString(";"),R=new MlString("exit"),Q=new MlString(""),P=new MlString("Please set user id first."),O=new MlString("$open$:"),N=new MlString("#open "),M=new MlString("#map-iv 1"),L=new MlString("#status-iv 1"),K=new MlString("05103010"),J=new MlString("#version-cli "),I=new MlString("#ex-switch eagleeye=form"),H=new MlString("#ex-map size=57"),G=new MlString("#ex-map style=turn"),F=new MlString("#ex-switch ex-move-recv=true"),E=new MlString("#ex-switch ex-list-mode-end=true"),D=new MlString("#ex-switch ex-disp-magic=false"),C=[0,[0,49,[0,new MlString("1"),0]],[0,[0,50,[0,new MlString("2"),0]],[0,[0,51,[0,new MlString("3"),0]],[0,[0,52,[0,new MlString("4"),0]],[0,[0,53,[0,new MlString("5"),0]],[0,[0,54,[0,new MlString("6"),0]],[0,[0,55,[0,new MlString("7"),0]],[0,[0,56,[0,new MlString("8"),0]],[0,[0,57,[0,new MlString("9"),0]],[0,[0,65,[0,new MlString("read"),0]],[0,[0,67,[0,new MlString("use"),0]],[0,[0,68,[0,new MlString("erase"),0]],0]]]]]]]]]]]],B=[0,[0,65,[0,new MlString("cast"),[0,new MlString("analyze"),0]]],0],A=new MlString(""),z=new MlString(""),y=new MlString("ws://napthats.com/ws/"),x=new MlString("send"),w=new MlString("login"),v=new MlString("logout"),u=new MlString("newuser"),t=new MlString("phirc_load"),s=new MlString("phirc_show"),r=new MlString("change_world"),q=new MlString("finish_newuser"),p=new MlString("control_keydown"),o=new MlString("control_keyup");function n(e,g){var f=e.getLen(),h=g.getLen(),i=caml_create_string(f+h|0);caml_blit_string(e,0,i,0,f);caml_blit_string(g,0,i,f,h);return i;}function ak(m){var j=caml_ml_out_channels_list(0);for(;;){if(j){var k=j[2];try {}catch(l){}var j=k;continue;}return 0;}}caml_register_named_value(ai,ak);function ap(am,al){if(al){var ao=al[2],aq=an(am,al[1]);return [0,aq,ap(am,ao)];}return 0;}function av(at,ar,as){if(0<=ar&&0<=as&&!((at.getLen()-as|0)<ar)){var au=caml_create_string(as);caml_blit_string(at,ar,au,0,as);return au;}throw [0,a,ah];}var aw=[0,0],ax=[0,ae];function aO(aC,ay){var az=ay.getLen();if(0===az)var aA=0;else{var aB=0,aF=aC.getLen();try {var aD=aB,aE=0,aG=aF-az|0;if(!(aG<aE)){var aH=aE;a:for(;;){var aI=0;for(;;){if(aC.safeGet(aH+aI|0)===ay.safeGet(aI)){var aJ=aI+1|0;if(aJ===az){var aD=aH;throw [0,d];}var aI=aJ;continue;}var aK=aH+1|0;if(aG!==aH){var aH=aK;continue a;}break;}break;}}throw [0,ax];}catch(aL){if(aL[1]!==d)throw aL;var aA=aD;}}var aM=ay.getLen(),aN=av(aC,aA+aM|0,(aC.getLen()-aA|0)-aM|0);return [0,av(aC,0,aA),aN];}var aP=undefined,aT=null,aS=false,aR=Array;function aU(aQ){return aQ instanceof aR?0:[0,new MlWrappedString(aQ.toString())];}aw[1]=[0,aU,aw[1]];function aW(aV){return aV;}var aX=window,aY=aX.document;window.HTMLElement===aP;function cn(cm){var aZ=[0,A],a0=[0,z],a1=com.napthats.jsphi,a2=a1.makePhiUI(0),a3=[0,0];function a7(a4){var a5=aW(a1.phidmMessageParse(a4.data)),a6=a5==aT?0:[0,a5];return a6?a3[1].exec(a6[1]):0;}var a9=a8(com.napthats.websocket.connectWebSocket,y.toString(),a7);a3[1]=a1.makeCommandExecutor(a2,a9);var a_=
function(id, ipPort) {
        var savedPhircList = readPhircCookie();
        if (!savedPhircList) savedPhircList = [];
        for (var i = 0; i < savedPhircList.length; i++) {
            if (id === savedPhircList[i][0]) {
                savedPhircList[i][1] = ipPort;
                break;
            }
        }
        if (i === savedPhircList.length) {
            savedPhircList.push([id, ipPort]);
        }
        writePhircCookie(savedPhircList);
    }
;function bc(a$){a9.send(M.toString());a9.send(L.toString());a9.send(n(J,K).toString());a9.send(I.toString());a9.send(H.toString());a9.send(G.toString());a9.send(F.toString());a9.send(E.toString());return a9.send(D.toString());}function b0(ba,bb){aZ[1]=new MlWrappedString(ba);a0[1]=new MlWrappedString(bb);return caml_string_equal(aZ[1],Q)?a2.showErrorMessage(P.toString()):(a9.send(O.toString().concat(a0[1].toString())),a3[1].setUserId(aZ[1].toString()),a9.send(N.toString().concat(aZ[1].toString())),bc(0));}function b1(bd){a3[1].resetExecutor(0);return a9.send(R.toString());}function b2(be){return a9.send(be.toString());}function bM(bu){var bf=aY.cookie,bg=bf.indexOf(b.toString().concat(U.toString()));if(-1===bg)var bh=T;else{var bi=(bg+b.toString().length|0)+1|0,bj=bf.indexOf(S.toString(),bi),bk=-1===bj?bf.length:bj,bh=new MlWrappedString(decodeURIComponent(bf.substring(bi,bk)));}if(caml_string_notequal(bh,V)){if(caml_string_equal(bh,ag))var bl=0;else{if(caml_string_equal(c,af))throw [0,ax];var bp=function(bn,bm){try {var bo=aO(bn,bm),bq=bp(bo[2],bm),br=[0,bo[1],bq];}catch(bs){if(bs[1]===ax)return [0,bn,0];throw bs;}return br;},bl=bp(bh,c);}return ap(function(bt){return aO(bt,W);},bl);}return 0;}function bO(bw){var bx=ap(function(bv){return caml_js_from_array([0,bv[1].toString(),bv[2].toString()]);},bw);if(bx){var by=0,bz=bx,bF=bx[2],bC=bx[1];for(;;){if(bz){var bB=bz[2],bA=by+1|0,by=bA,bz=bB;continue;}var bD=caml_make_vect(by,bC),bE=1,bG=bF;for(;;){if(bG){var bH=bG[2];bD[bE+1]=bG[1];var bI=bE+1|0,bE=bI,bG=bH;continue;}var bJ=bD;break;}break;}}else var bJ=[0];return caml_js_from_array(bJ);}function b3(bK){aZ[1]=new MlWrappedString(bK);an(a_,[0,aZ[1].toString(),a0[1].toString()]);var bL=aZ[1].toString().concat(X.toString()),bN=bL.concat(a0[1].toString());a2.setPhirc(bO(bM(0)),bN);a3[1].setUserId(aZ[1].toString());return bc(0);}function b4(bQ,bP){a0[1]=new MlWrappedString(bP);a9.send(Y.toString().concat(a0[1].toString()));return a3[1].startNewuser(bQ);}function b5(bR,bS){aZ[1]=new MlWrappedString(bR);a0[1]=new MlWrappedString(bS);an(a_,[0,aZ[1].toString(),a0[1].toString()]);var bT=aZ[1].toString().concat(_.toString()),bU=bT.concat(a0[1].toString());a2.setPhirc(bO(bM(0)),bU);return a2.showClientMessage(Z.toString());}function b6(bW){if(ab!==aZ[1]){var bV=n(aa,a0[1]);return a2.showClientMessage(n(aZ[1],bV).toString());}return a2.showErrorMessage($.toString());}function b7(bX){a0[1]=new MlWrappedString(bX);an(a_,[0,aZ[1].toString(),a0[1].toString()]);var bY=aZ[1].toString().concat(ac.toString()),bZ=bY.concat(a0[1].toString());a2.setPhirc(bO(bM(0)),bZ);return bc(0);}a2.setPhirc(bO(bM(0)),aP);a2.bind(x.toString(),b2);a2.bind(w.toString(),b0);a2.bind(v.toString(),b1);a2.bind(u.toString(),b4);a2.bind(t.toString(),b5);a2.bind(s.toString(),b6);a3[1].bind(r.toString(),b7);a3[1].bind(q.toString(),b3);var b8=[0,0];function ck(b9){var b_=b9.keyCode,b$=b8[1]?B:C;if(9===b_)caml_js_eval_string(ad);else if(16===b_)b8[1]=1;else{var ca=b$;for(;;){if(ca){var cb=ca[2],cc=0===caml_compare(ca[1][1],b_)?1:0;if(!cc){var ca=cb;continue;}var cd=cc;}else var cd=0;if(cd){var ce=b$;for(;;){if(!ce)throw [0,aj];var cf=ce[1],ch=ce[2],cg=cf[2];if(0!==caml_compare(cf[1],b_)){var ce=ch;continue;}ap(function(ci){return a9.send(ci.toString());},cg);break;}}break;}}return b9.preventDefault();}function cl(cj){return 16===cj.keyCode?(b8[1]=0,0):0;}a2.bind(p.toString(),ck);a2.bind(o.toString(),cl);return aS;}aX.onload=aW(caml_js_wrap_callback(function(co){if(co){var cp=cn(co);if(!(cp|0))co.preventDefault();return cp;}var cq=event,cr=cn(cq);cq.returnValue=cr;return cr;}));ak(0);return;}());
