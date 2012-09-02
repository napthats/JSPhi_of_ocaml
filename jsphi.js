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
function caml_parse_format (fmt) {
  fmt = fmt.toString ();
  var len = fmt.length;
  if (len > 31) caml_invalid_argument("format_int: format too long");
  var f =
    { justify:'+', signstyle:'-', filler:' ', alternate:false,
      base:0, signedconv:false, width:0, uppercase:false,
      sign:1, prec:-1, conv:'f' };
  for (var i = 0; i < len; i++) {
    var c = fmt.charAt(i);
    switch (c) {
    case '-':
      f.justify = '-'; break;
    case '+': case ' ':
      f.signstyle = c; break;
    case '0':
      f.filler = '0'; break;
    case '#':
      f.alternate = true; break;
    case '1': case '2': case '3': case '4': case '5':
    case '6': case '7': case '8': case '9':
      f.width = 0;
      while (c=fmt.charCodeAt(i) - 48, c >= 0 && c <= 9) {
        f.width = f.width * 10 + c; i++
      }
      i--;
     break;
    case '.':
      f.prec = 0;
      i++;
      while (c=fmt.charCodeAt(i) - 48, c >= 0 && c <= 9) {
        f.prec = f.prec * 10 + c; i++
      }
      i--;
    case 'd': case 'i':
      f.signedconv = true; /* fallthrough */
    case 'u':
      f.base = 10; break;
    case 'x':
      f.base = 16; break;
    case 'X':
      f.base = 16; f.uppercase = true; break;
    case 'o':
      f.base = 8; break;
    case 'e': case 'f': case 'g':
      f.signedconv = true; f.conv = c; break;
    case 'E': case 'F': case 'G':
      f.signedconv = true; f.uppercase = true;
      f.conv = c.toLowerCase (); break;
    }
  }
  return f;
}
function caml_finish_formatting(f, rawbuffer) {
  if (f.uppercase) rawbuffer = rawbuffer.toUpperCase();
  var len = rawbuffer.length;
  if (f.signedconv && (f.sign < 0 || f.signstyle != '-')) len++;
  if (f.alternate) {
    if (f.base == 8) len += 1;
    if (f.base == 16) len += 2;
  }
  var buffer = "";
  if (f.justify == '+' && f.filler == ' ')
    for (var i = len; i < f.width; i++) buffer += ' ';
  if (f.signedconv) {
    if (f.sign < 0) buffer += '-';
    else if (f.signstyle != '-') buffer += f.signstyle;
  }
  if (f.alternate && f.base == 8) buffer += '0';
  if (f.alternate && f.base == 16) buffer += "0x";
  if (f.justify == '+' && f.filler == '0')
    for (var i = len; i < f.width; i++) buffer += '0';
  buffer += rawbuffer;
  if (f.justify == '-')
    for (var i = len; i < f.width; i++) buffer += ' ';
  return new MlWrappedString (buffer);
}
function caml_format_int(fmt, i) {
  if (fmt.toString() == "%d") return new MlWrappedString(""+i);
  var f = caml_parse_format(fmt);
  if (i < 0) { if (f.signedconv) { f.sign = -1; i = -i; } else i >>>= 0; }
  var s = i.toString(f.base);
  if (f.prec >= 0) {
    f.filler = ' ';
    var n = f.prec - s.length;
    if (n > 0) s = caml_str_repeat (n, '0') + s;
  }
  return caml_finish_formatting(f, s);
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
(function(){function bn(c0,c1,c2){return c0.length==2?c0(c1,c2):caml_call_gen(c0,[c1,c2]);}function az(cY,cZ){return cY.length==1?cY(cZ):caml_call_gen(cY,[cZ]);}var a=[0,new MlString("Failure")],b=[0,new MlString("Invalid_argument")],c=new MlString("phirc"),d=new MlString(",");caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,b);caml_register_global(2,a);var ak=[0,new MlString("Not_found")],aj=new MlString("%d"),ai=new MlString("Pervasives.Exit"),ah=new MlString("Pervasives.do_at_exit"),ag=new MlString("tl"),af=new MlString("hd"),ae=new MlString("String.sub"),ad=new MlString(""),ac=new MlString(""),ab=new MlString("ExtString.Invalid_string"),aa=new MlString("$('#text').focus();"),$=new MlString("@"),_=new MlString(""),Z=new MlString(" "),Y=new MlString("No user login."),X=new MlString("@"),W=new MlString(".phirc load completed."),V=new MlString("$open$:"),U=new MlString("@"),T=new MlString("@"),S=new MlString(""),R=new MlString("@"),Q=new MlString(","),P=new MlString("@"),O=new MlString("; max-age="),N=new MlString("phirc="),M=new MlString("="),L=new MlString(""),K=new MlString(";"),J=new MlString("exit"),I=new MlString(""),H=new MlString("Please set user id first."),G=new MlString("$open$:"),F=new MlString("#open "),E=new MlString("#map-iv 1"),D=new MlString("#status-iv 1"),C=new MlString("05103010"),B=new MlString("#version-cli "),A=new MlString("#ex-switch eagleeye=form"),z=new MlString("#ex-map size=57"),y=new MlString("#ex-map style=turn"),x=new MlString("#ex-switch ex-move-recv=true"),w=new MlString("#ex-switch ex-list-mode-end=true"),v=new MlString("#ex-switch ex-disp-magic=false"),u=[0,[0,49,[0,new MlString("1"),0]],[0,[0,50,[0,new MlString("2"),0]],[0,[0,51,[0,new MlString("3"),0]],[0,[0,52,[0,new MlString("4"),0]],[0,[0,53,[0,new MlString("5"),0]],[0,[0,54,[0,new MlString("6"),0]],[0,[0,55,[0,new MlString("7"),0]],[0,[0,56,[0,new MlString("8"),0]],[0,[0,57,[0,new MlString("9"),0]],[0,[0,65,[0,new MlString("read"),0]],[0,[0,67,[0,new MlString("use"),0]],[0,[0,68,[0,new MlString("erase"),0]],[0,[0,70,[0,new MlString("floor item"),0]],[0,[0,71,[0,new MlString("guard"),0]],[0,[0,72,[0,new MlString("hi"),0]],[0,[0,77,[0,new MlString("check"),[0,new MlString("look"),0]]],[0,[0,81,[0,new MlString("equip"),0]],[0,[0,82,[0,new MlString("spells"),0]],[0,[0,83,[0,new MlString("write"),0]],[0,[0,86,[0,new MlString("sort"),0]],[0,[0,87,[0,new MlString("unequip"),0]],[0,[0,88,[0,new MlString("put"),0]],[0,[0,89,[0,new MlString("y"),0]],[0,[0,90,[0,new MlString("get"),0]],[0,[0,96,[0,new MlString("check"),[0,new MlString("look"),0]]],[0,[0,97,[0,new MlString("hit"),0]],[0,[0,98,[0,new MlString("go b"),0]],[0,[0,99,[0,new MlString("cast"),0]],[0,[0,100,[0,new MlString("go l"),0]],[0,[0,101,[0,new MlString("turn b"),0]],[0,[0,102,[0,new MlString("go r"),0]],[0,[0,103,[0,new MlString("turn l"),0]],[0,[0,104,[0,new MlString("go f"),0]],[0,[0,105,[0,new MlString("turn r"),0]],[0,[0,106,[0,new MlString("use"),0]],[0,[0,107,[0,new MlString("get"),0]],[0,[0,109,[0,new MlString("put"),0]],[0,[0,110,[0,new MlString("."),0]],[0,[0,111,[0,new MlString("equip"),0]],[0,[0,190,[0,new MlString("."),0]],0]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]],t=[0,[0,65,[0,new MlString("cast"),[0,new MlString("analyze"),0]]],[0,[0,66,[0,new MlString("cast"),[0,new MlString("call"),0]]],[0,[0,67,[0,new MlString("cast"),[0,new MlString("create"),0]]],[0,[0,68,[0,new MlString("cast"),[0,new MlString("detect"),0]]],[0,[0,69,[0,new MlString("cast"),[0,new MlString("eagle eye"),0]]],[0,[0,70,[0,new MlString("cast"),[0,new MlString("forget"),0]]],[0,[0,73,[0,new MlString("cast"),[0,new MlString("identify"),0]]],[0,[0,75,[0,new MlString("cast"),[0,new MlString("list"),0]]],[0,[0,76,[0,new MlString("cast"),[0,new MlString("wizard lock"),0]]],[0,[0,77,[0,new MlString("cast"),[0,new MlString("disappear"),0]]],[0,[0,78,[0,new MlString("cast"),[0,new MlString("appear"),0]]],[0,[0,80,[0,new MlString("cast"),[0,new MlString("party eye"),0]]],[0,[0,81,[0,new MlString("cast"),[0,new MlString("wizard light"),0]]],[0,[0,82,[0,new MlString("cast"),[0,new MlString("return"),0]]],[0,[0,83,[0,new MlString("cast"),[0,new MlString("search"),0]]],[0,[0,85,[0,new MlString("cast"),[0,new MlString("unlock"),0]]],[0,[0,87,[0,new MlString("cast"),[0,new MlString("wizard eye"),0]]],[0,[0,88,[0,new MlString("cast"),[0,new MlString("charge spell"),0]]],[0,[0,90,[0,new MlString("cast"),[0,new MlString("destroy"),0]]],0]]]]]]]]]]]]]]]]]]],s=new MlString(""),r=new MlString(""),q=new MlString("ws://napthats.com/ws/"),p=new MlString("send"),o=new MlString("login"),n=new MlString("logout"),m=new MlString("newuser"),l=new MlString("phirc_load"),k=new MlString("phirc_show"),j=new MlString("change_world"),i=new MlString("finish_newuser"),h=new MlString("control_keydown"),g=new MlString("control_keyup");function f(e){throw [0,a,e];}var al=[0,ai];function av(am,ao){var an=am.getLen(),ap=ao.getLen(),aq=caml_create_string(an+ap|0);caml_blit_string(am,0,aq,0,an);caml_blit_string(ao,0,aq,an,ap);return aq;}function aw(au){var ar=caml_ml_out_channels_list(0);for(;;){if(ar){var as=ar[2];try {}catch(at){}var ar=as;continue;}return 0;}}caml_register_named_value(ah,aw);function aB(ay,ax){if(ax){var aA=ax[2],aC=az(ay,ax[1]);return [0,aC,aB(ay,aA)];}return 0;}function aH(aG,aD){if(aD){var aE=aD[2],aF=aD[1];return 0===caml_compare(aF[1],aG)?aE:[0,aF,aH(aG,aE)];}return 0;}function aM(aK,aI,aJ){if(0<=aI&&0<=aJ&&!((aK.getLen()-aJ|0)<aI)){var aL=caml_create_string(aJ);caml_blit_string(aK,aI,aL,0,aJ);return aL;}throw [0,b,ae];}var aN=[0,0],aO=[0,ab];function a5(aT,aP){var aQ=aP.getLen();if(0===aQ)var aR=0;else{var aS=0,aW=aT.getLen();try {var aU=aS,aV=0,aX=aW-aQ|0;if(!(aX<aV)){var aY=aV;a:for(;;){var aZ=0;for(;;){if(aT.safeGet(aY+aZ|0)===aP.safeGet(aZ)){var a0=aZ+1|0;if(a0===aQ){var aU=aY;throw [0,al];}var aZ=a0;continue;}var a1=aY+1|0;if(aX!==aY){var aY=a1;continue a;}break;}break;}}throw [0,aO];}catch(a2){if(a2[1]!==al)throw a2;var aR=aU;}}var a3=aP.getLen(),a4=aM(aT,aR+a3|0,(aT.getLen()-aR|0)-a3|0);return [0,aM(aT,0,aR),a4];}var a6=undefined,a_=null,a9=false,a8=Array;function a$(a7){return a7 instanceof a8?0:[0,new MlWrappedString(a7.toString())];}aN[1]=[0,a$,aN[1]];function bb(ba){return ba;}var bc=window,bd=bc.document;window.HTMLElement===a6;function cT(cS){var be=[0,s],bf=[0,r],bg=com.napthats.jsphi,bh=bg.makePhiUI(0),bi=[0,0];function bm(bj){var bk=bb(bg.phidmMessageParse(bj.data)),bl=bk==a_?0:[0,bk];return bl?bi[1].exec(bl[1]):0;}var bo=bn(com.napthats.websocket.connectWebSocket,q.toString(),bm);bi[1]=bg.makeCommandExecutor(bh,bo);function bs(bp){bo.send(E.toString());bo.send(D.toString());bo.send(av(B,C).toString());bo.send(A.toString());bo.send(z.toString());bo.send(y.toString());bo.send(x.toString());bo.send(w.toString());return bo.send(v.toString());}function cu(bq,br){be[1]=new MlWrappedString(bq);bf[1]=new MlWrappedString(br);return caml_string_equal(be[1],I)?bh.showErrorMessage(H.toString()):(bo.send(G.toString().concat(bf[1].toString())),bi[1].setUserId(be[1].toString()),bo.send(F.toString().concat(be[1].toString())),bs(0));}function cv(bt){bi[1].resetExecutor(0);return bo.send(J.toString());}function cw(bu){return bo.send(bu.toString());}function bL(bK){var bv=bd.cookie,bw=bv.indexOf(c.toString().concat(M.toString()));if(-1===bw)var bx=L;else{var by=(bw+c.toString().length|0)+1|0,bz=bv.indexOf(K.toString(),by),bA=-1===bz?bv.length:bz,bx=new MlWrappedString(decodeURIComponent(bv.substring(by,bA)));}if(caml_string_notequal(bx,S)){if(caml_string_equal(bx,ad))var bB=0;else{if(caml_string_equal(d,ac))throw [0,aO];var bF=function(bD,bC){try {var bE=a5(bD,bC),bG=bF(bE[2],bC),bH=[0,bE[1],bG];}catch(bI){if(bI[1]===aO)return [0,bD,0];throw bI;}return bH;},bB=bF(bx,d);}return aB(function(bJ){return a5(bJ,T);},bB);}return 0;}function cf(bM,bO){var bN=aH(bM,bL(0)),bP=[0,bM,bO],bQ=[0,bP,bN],bR=bQ?bN:f(ag),bS=bQ?bP:f(af),bT=bS[1],bU=av(bT,av(P,bS[2])),bV=bR;for(;;){if(bV){var bW=bV[1],bY=bV[2],bX=bW[1],bZ=av(bU,av(Q,av(bX,av(R,bW[2])))),bU=bZ,bV=bY;continue;}var b0=av(O,caml_format_int(aj,((((60*60|0)*24|0)*36|0)*5|0)*10|0));return bd.cookie=av(N,av(new MlWrappedString(encodeURIComponent(bU.toString())),b0)).toString();}}function ci(b2){var b3=aB(function(b1){return caml_js_from_array([0,b1[1].toString(),b1[2].toString()]);},b2);if(b3){var b4=0,b5=b3,b$=b3[2],b8=b3[1];for(;;){if(b5){var b7=b5[2],b6=b4+1|0,b4=b6,b5=b7;continue;}var b9=caml_make_vect(b4,b8),b_=1,ca=b$;for(;;){if(ca){var cb=ca[2];b9[b_+1]=ca[1];var cc=b_+1|0,b_=cc,ca=cb;continue;}var cd=b9;break;}break;}}else var cd=[0];return caml_js_from_array(cd);}function cx(ce){be[1]=new MlWrappedString(ce);cf(be[1],bf[1]);var cg=be[1].toString().concat(U.toString()),ch=cg.concat(bf[1].toString());bh.setPhirc(ci(bL(0)),ch);bi[1].setUserId(be[1].toString());return bs(0);}function cy(ck,cj){bf[1]=new MlWrappedString(cj);bo.send(V.toString().concat(bf[1].toString()));return bi[1].startNewuser(ck);}function cz(cl,cm){be[1]=new MlWrappedString(cl);bf[1]=new MlWrappedString(cm);cf(be[1],bf[1]);var cn=be[1].toString().concat(X.toString()),co=cn.concat(bf[1].toString());bh.setPhirc(ci(bL(0)),co);return bh.showClientMessage(W.toString());}function cA(cq){if(_!==be[1]){var cp=av(Z,bf[1]);return bh.showClientMessage(av(be[1],cp).toString());}return bh.showErrorMessage(Y.toString());}function cB(cr){bf[1]=new MlWrappedString(cr);cf(be[1],bf[1]);var cs=be[1].toString().concat($.toString()),ct=cs.concat(bf[1].toString());bh.setPhirc(ci(bL(0)),ct);return bs(0);}bh.setPhirc(ci(bL(0)),a6);bh.bind(p.toString(),cw);bh.bind(o.toString(),cu);bh.bind(n.toString(),cv);bh.bind(m.toString(),cy);bh.bind(l.toString(),cz);bh.bind(k.toString(),cA);bi[1].bind(j.toString(),cB);bi[1].bind(i.toString(),cx);var cC=[0,0];function cQ(cD){var cE=cD.keyCode,cF=cC[1]?t:u;if(9===cE)caml_js_eval_string(aa);else if(16===cE)cC[1]=1;else{var cG=cF;for(;;){if(cG){var cH=cG[2],cI=0===caml_compare(cG[1][1],cE)?1:0;if(!cI){var cG=cH;continue;}var cJ=cI;}else var cJ=0;if(cJ){var cK=cF;for(;;){if(!cK)throw [0,ak];var cL=cK[1],cN=cK[2],cM=cL[2];if(0!==caml_compare(cL[1],cE)){var cK=cN;continue;}aB(function(cO){return bo.send(cO.toString());},cM);break;}}break;}}return cD.preventDefault();}function cR(cP){return 16===cP.keyCode?(cC[1]=0,0):0;}bh.bind(h.toString(),cQ);bh.bind(g.toString(),cR);return a9;}bc.onload=bb(caml_js_wrap_callback(function(cU){if(cU){var cV=cT(cU);if(!(cV|0))cU.preventDefault();return cV;}var cW=event,cX=cT(cW);cW.returnValue=cX;return cX;}));aw(0);return;}());
