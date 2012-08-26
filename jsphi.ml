open Js


class type phi_ui = object
  method showErrorMessage: js_string t -> unit meth
  method bind: js_string t -> 'a -> unit meth
  method setPhirc: js_string t -> js_string t -> unit meth
  method showClientMessage: js_string t -> unit meth
end


class type com = object
  method setUserId: js_string t -> unit meth
  method bind: js_string t -> 'a -> unit meth
  method exec: js_string t -> unit meth
  method resetExecutor: unit -> unit meth
  method startNewuser: js_string t -> unit meth
end

class type phi_message = object
  method data: js_string t readonly_prop
end

class type ws = object
  method send: js_string t -> unit meth
end

class type ns = object
  method _CLIENT_VERSION: js_string t prop
  method readCookie: (js_string t -> js_string t) prop
  method makePhiUI: unit -> phi_ui t meth
  method makeCommandExecutor: phi_ui t -> ws t -> com t meth
  method phidmMessageParse: js_string t -> js_string t meth
end


let _ = Dom_html.window##onload <- Dom_html.handler (fun _ -> 

let _CONTROL_COMMAND = Unsafe.variable "
    {
        49: ['1'],
        50: ['2'],
        51: ['3'],
        52: ['4'],
        53: ['5'],
        54: ['6'],
        55: ['7'],
        56: ['8'],
        57: ['9'],
        65: ['read'],
        66: ['board'],
        67: ['use'],
        68: ['erase'],
        70: ['floor item'],
        71: ['guard'],
        72: ['hi'],
        77: ['check', 'look'],
        //80: ['pay'],
        81: ['equip'],
        82: ['spells'],
        83: ['write'],
        86: ['sort'],
        87: ['unequip'],
        88: ['put'],
        89: ['y'],
        90: ['get'],
        96: ['check', 'look'],
        97: ['hit'],
        98: ['go b'],
        99: ['cast'],
        100: ['go l'],
        101: ['turn b'],
        102: ['go r'],
        103: ['turn l'],
        104: ['go f'],
        105: ['turn r'],
        106: ['use'],
        107: ['get'],
        109: ['put'],
        110: ['.'],
        111: ['equip'],
        190: ['.']
    }
"

in let _CONTROL_COMMAND_SHIFT = Unsafe.variable "
    {
        65: ['cast', 'analyze'],
        66: ['cast', 'call'],
        67: ['cast', 'create'],
        68: ['cast', 'detect'],
        69: ['cast', 'eagle eye'],
        70: ['cast', 'forget'],
        73: ['cast', 'identify'],
        75: ['cast', 'list'],
        76: ['cast', 'wizard lock'],
        77: ['cast', 'disappear'],
        78: ['cast', 'appear'],
        80: ['cast', 'party eye'],
        81: ['cast', 'wizard light'],
        82: ['cast', 'return'],
        83: ['cast', 'search'],
        85: ['cast', 'unlock'],
        87: ['cast', 'wizard eye'],
        88: ['cast', 'charge spell'],
        90: ['cast', 'destroy']
    }
"

in let userId = ref ""
in let serverIpPort = ref ""
in let _NS_JSPHI : ns t = Unsafe.variable "com.napthats.jsphi"
in let phiUI = _NS_JSPHI##makePhiUI(())



in let commandExecutor = ref (Unsafe.variable "0")
in let recvMessage msg =
  let phidmMessage = _NS_JSPHI##phidmMessageParse(msg##data) in
  match Opt.to_option (some phidmMessage) with
    | None -> ()
    | Some msg -> (!commandExecutor)##exec(msg)

in let ws: ws t = (Unsafe.variable "com.napthats.websocket.connectWebSocket") (Js.string "ws://napthats.com/ws/") recvMessage

in let _ = commandExecutor := _NS_JSPHI##makeCommandExecutor(phiUI, ws)


in let savePhirc id ipPort = ()
(*  in let savedPhircList = readPhircCookie () in
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
    }*)

in let readPhircCookie () = ""
(*Unsafe.variable "
function() {
        var value = readCookie('phirc');
        if (!value) return;
        var phircList = [];
        var _phircList = value.split(',');
        for (var i = 0; i < _phircList.length; i++) {
            phircList.push(_phircList[i].split('@'));
        }
        return phircList;
    }
"*)


in let sendMessageEnterWorld () =
  ws##send(Js.string "#map-iv 1");
  ws##send(Js.string "#status-iv 1");
  ws##send(Js.string ("#version-cli " ^ "05103010")); (* TODO: extract version number *)
  ws##send(Js.string "#ex-switch eagleeye=form");
  ws##send(Js.string "#ex-map size=57");
  ws##send(Js.string "#ex-map style=turn");
  ws##send(Js.string "#ex-switch ex-move-recv=true");
  ws##send(Js.string "#ex-switch ex-list-mode-end=true");
  ws##send(Js.string "#ex-switch ex-disp-magic=false")


in let login id ipPort =
  Dom_html.window##alert(Js.string id);
  Dom_html.window##alert(Js.string ipPort);
  userId := id;
  serverIpPort := ipPort;
(*  if !userId = "" *)
  if false
  then phiUI##showErrorMessage(Js.string "Please set user id first.")
  else (
    ws##send(Js.string ("$open$:" ^ ipPort));
    (!commandExecutor)##setUserId (Js.string id);
    ws##send(Js.string ("#open " ^ id));
(*    ws##send(Js.string ("$open$:" ^ "napthats.com:20017"));
    (!commandExecutor)##setUserId (Js.string "guest1");
    ws##send(Js.string ("#open " ^ "guest1"));    *)

    sendMessageEnterWorld ()
  )

in let logout () =
  (!commandExecutor)##resetExecutor(());
  ws##send(Js.string "exit")


in let sendMessage msg =
  ws##send(Js.string msg)


in let changeWorld ipPort =
  serverIpPort := ipPort;
  savePhirc(!userId, !serverIpPort);
  phiUI##setPhirc(Js.string (readPhircCookie ()), Js.string (!userId ^ "@" ^ !serverIpPort));
  sendMessageEnterWorld()


in let finishNewuser id =
  userId := id;
  savePhirc(!userId, !serverIpPort);
  phiUI##setPhirc(Js.string (readPhircCookie ()), Js.string (!userId ^ "@" ^ !serverIpPort));
  (!commandExecutor)##setUserId(Js.string id);
  sendMessageEnterWorld()

in let startNewuser name ipPort =
  serverIpPort := ipPort;
  ws##send(Js.string ("$open$:" ^ !serverIpPort));
  (!commandExecutor)##startNewuser(name)


in let importPhirc id ipPort =
  userId := id;
  serverIpPort := ipPort;
  savePhirc(!userId, !serverIpPort);
  phiUI##setPhirc(Js.string (readPhircCookie ()), Js.string (!userId ^ "@" ^ !serverIpPort));
  phiUI##showClientMessage(Js.string ".phirc load compin leted.")

in let showPhirc () =
(*  if (!userId != "") *)
  if false
  then phiUI##showClientMessage(Js.string (!userId ^ " " ^ !serverIpPort))
  else phiUI##showErrorMessage(Js.string "No user login.")



in let readCookie key = ""

(*Unsafe.variable "
function(key){
        var allcookies = document.cookie;
        var pos = allcookies.indexOf(key + '=');
        var value;
        if (pos !== -1) {
            var start = pos + key.length + 1;
            var end = allcookies.indexOf(';', start);
            if (end === -1) end = allcookies.length;
            value = allcookies.substring(start, end);
            value = decodeURIComponent(value);
        }
        return value;
    }
"*)


in let writePhircCookie _phircList = ()
(*
Unsafe.variable "
function(_phircList) {
        var phircList = _phircList;
        for (var i = 0; i < phircList.length; i++) {
            phircList[i] = phircList[i].join('@');
        }
        document.cookie = 'phirc=' + encodeURIComponent(phircList.join(',')) + '; max-age=' + (60*60*24*365*10);
    }
"*)

in let _ =
  phiUI##setPhirc(Js.string (readPhircCookie ()), Js.string "");
  phiUI##bind(Js.string "send", sendMessage);
  phiUI##bind(Js.string "login", login);
  phiUI##bind(Js.string "logout", logout);
  phiUI##bind(Js.string "newuser", startNewuser);
  phiUI##bind(Js.string "phirc_load", importPhirc);
  phiUI##bind(Js.string "phirc_show", showPhirc);
  (!commandExecutor)##bind(Js.string "change_world", changeWorld);
  (!commandExecutor)##bind(Js.string "finish_newuser", finishNewuser)
(*  Unsafe.eval_string "
    //keypad control and shortcut key
    (function(){
        var isShiftPressed = false;

        phiUI.bind('control_keydown', function(e){
            var keycode = e.keyCode;
            var controlCommand = isShiftPressed ? CONTROL_COMMAND_SHIFT : CONTROL_COMMAND;
            if (keycode === 9) {
                $('#text').focus();
            }
            if (keycode === 16) {
                isShiftPressed = true;
            }
            if (controlCommand[keycode]) {
                var commands = controlCommand[keycode];
                for (var i = 0; i < commands.length; i++) {
                    ws.send(commands[i]);
                }
            }
            e.preventDefault();
        });

        phiUI.bind('control_keyup', function(e) {
            var keycode = e.keyCode;
            if (keycode === 16) {
                isShiftPressed = false;
            }
        });
    })();
"*)


in Js._false)

(*let _ = Dom_html.window##onload <- Dom_html.handler (fun _ -> ignore (func ()); Js._false)*)
