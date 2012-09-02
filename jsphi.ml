open Js
open ExtString


class type phi_ui = object
  method showErrorMessage: js_string t -> unit meth
  method bind: js_string t -> 'a -> unit meth
  method setPhirc: Js.js_string t Js.js_array t Js.js_array t -> 'a -> unit meth
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

let _CONTROL_COMMAND = [(49, ["1"]); (50, ["2"]); (51, ["3"]); (52, ["4"]); (53, ["5"]); (54, ["6"]); (55, ["7"]); (56, ["8"]); (57, ["9"]); (65, ["read"]); (67, ["use"]); (68, ["erase"]); (70, ["floor item"]); (71, ["guard"]); (72, ["hi"]); (77, ["check"; "look"]); (81, ["equip"]); (82, ["spells"]); (83, ["write"]); (86, ["sort"]); (87, ["unequip"]); (88, ["put"]); (89, ["y"]); (90, ["get"]); (96, ["check"; "look"]); (97, ["hit"]); (98, ["go b"]); (99, ["cast"]); (100, ["go l"]); (101, ["turn b"]); (102, ["go r"]); (103, ["turn l"]); (104, ["go f"]); (105, ["turn r"]); (106, ["use"]); (107, ["get"]); (109, ["put"]); (110, ["."]); (111, ["equip"]); (190, ["."])]

in let _CONTROL_COMMAND_SHIFT = [(65, ["cast"; "analyze"]); (66, ["cast"; "call"]); (67, ["cast"; "create"]); (68, ["cast"; "detect"]); (69, ["cast"; "eagle eye"]); (70, ["cast"; "forget"]); (73, ["cast"; "identify"]); (75, ["cast"; "list"]); (76, ["cast"; "wizard lock"]); (77, ["cast"; "disappear"]); (78, ["cast"; "appear"]); (80, ["cast"; "party eye"]); (81, ["cast"; "wizard light"]); (82, ["cast"; "return"]); (83, ["cast"; "search"]); (85, ["cast"; "unlock"]); (87, ["cast"; "wizard eye"]); (88, ["cast"; "charge spell"]); (90, ["cast"; "destroy"])] 


in let userId = ref ""
in let serverIpPort = ref ""
in let _NS_JSPHI : ns t = Unsafe.variable "com.napthats.jsphi"
in let phiUI = _NS_JSPHI##makePhiUI(())



in let commandExecutor = ref (Unsafe.variable "0") (* dummy *)
in let recvMessage msg =
  let phidmMessage = _NS_JSPHI##phidmMessageParse(msg##data) in
  match Opt.to_option (some phidmMessage) with
    | None -> ()
    | Some msg -> (!commandExecutor)##exec(msg)

in let ws: ws t = (Unsafe.variable "com.napthats.websocket.connectWebSocket") (Js.string "ws://napthats.com/ws/") recvMessage

in let _ = commandExecutor := _NS_JSPHI##makeCommandExecutor(phiUI, ws)




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
  userId := Js.to_string id;
  serverIpPort := Js.to_string ipPort;
  if !userId = "" 
  then phiUI##showErrorMessage(Js.string "Please set user id first.")
  else (
    ws##send((Js.string "$open$:")##concat(Js.string !serverIpPort));
    (!commandExecutor)##setUserId (Js.string !userId);
    ws##send((Js.string "#open ")##concat(Js.string !userId));
    sendMessageEnterWorld ()
  )

in let logout () =
  (!commandExecutor)##resetExecutor(());
  ws##send(Js.string "exit")


in let sendMessage msg =
  ws##send(Js.string msg)

in let readCookie key = 
  let cookie = Dom_html.document##cookie in
  let pos = cookie##indexOf((Js.string (key))##concat(Js.string "=")) in
  if pos == -1
  then ""
  else
    let start = pos + (Js.string key)##length + 1 in
    let ends = cookie##indexOf_from(Js.string ";", start) in
    let ends_ = if ends = -1 then cookie##length else ends in
    Js.to_string (decodeURIComponent cookie##substring(start, ends_))

in let writePhircCookie phircList = 
  let phircCookie = List.fold_left (fun acc (key, value) -> acc ^ "," ^ key ^ "@" ^ value) (match List.hd phircList with (key, value) -> key ^ "@" ^ value) (List.tl phircList) in
  Dom_html.document##cookie <- Js.string ("phirc=" ^ (Js.to_string (encodeURIComponent (Js.string phircCookie))) ^ "; max-age=" ^ (string_of_int (60*60*24*36*5*10)))

 
in let readPhircCookie () = 
  match readCookie("phirc") with
    | "" -> []
    | value ->
        List.map (fun v -> String.split v "@") (String.nsplit value ",")

in let savePhirc id ipPort = 
  let savedPhircList = readPhircCookie () in
  writePhircCookie ((id, ipPort) :: (List.remove_assoc id savedPhircList)) 

in let sslist_to_jsarray list =
  Js.array (Array.of_list (List.map (fun (s1,s2) ->
    Js.array [| Js.string s1; Js.string s2 |])  list))

in let finishNewuser id =
  userId := Js.to_string id;
  savePhirc !userId !serverIpPort;
  phiUI##setPhirc(sslist_to_jsarray (readPhircCookie()), (Js.string (!userId))##concat(Js.string "@")##concat(Js.string !serverIpPort));
  (!commandExecutor)##setUserId(Js.string !userId);
  sendMessageEnterWorld()

in let startNewuser name ipPort =
  serverIpPort := Js.to_string ipPort;
  ws##send((Js.string ("$open$:"))##concat(Js.string !serverIpPort));
  (!commandExecutor)##startNewuser(name)


in let importPhirc id ipPort =
  userId := Js.to_string id;
  serverIpPort := Js.to_string ipPort;
  savePhirc !userId !serverIpPort;
  phiUI##setPhirc(sslist_to_jsarray (readPhircCookie ()), (Js.string (!userId))##concat(Js.string "@")##concat(Js.string !serverIpPort));
  phiUI##showClientMessage(Js.string ".phirc load completed.")

in let showPhirc () =
  if (!userId != "")
  then phiUI##showClientMessage(Js.string (!userId ^ " " ^ !serverIpPort))
  else phiUI##showErrorMessage(Js.string "No user login.")



in let changeWorld ipPort =
  serverIpPort := Js.to_string ipPort;
  savePhirc !userId !serverIpPort;
  phiUI##setPhirc(sslist_to_jsarray (readPhircCookie ()), (Js.string (!userId))##concat(Js.string "@")##concat(Js.string (!serverIpPort)));
  sendMessageEnterWorld()

in let _ =
  phiUI##setPhirc(sslist_to_jsarray (readPhircCookie ()), Js.undefined);
  phiUI##bind(Js.string "send", sendMessage);
  phiUI##bind(Js.string "login", login);
  phiUI##bind(Js.string "logout", logout);
  phiUI##bind(Js.string "newuser", startNewuser);
  phiUI##bind(Js.string "phirc_load", importPhirc);
  phiUI##bind(Js.string "phirc_show", showPhirc);
  (!commandExecutor)##bind(Js.string "change_world", changeWorld);
  (!commandExecutor)##bind(Js.string "finish_newuser", finishNewuser);
  let isShiftPressed = ref false in
  let control_keydown (e: Dom_html.keyboardEvent t) =
    let keycode = e##keyCode in
    let controlCommand = if !isShiftPressed then _CONTROL_COMMAND_SHIFT else _CONTROL_COMMAND in
    (match keycode with
      | 9 -> Unsafe.eval_string "$('#text').focus();"
      | 16 -> isShiftPressed := true
      | other_code ->
        if List.mem_assoc other_code controlCommand
        then ignore (List.map 
                (fun command -> ws##send(Js.string command))
                (List.assoc other_code controlCommand))
        else () 
    );
    Unsafe.meth_call e "preventDefault" [||] (* e.preventdefault() *)
  in
  let control_keyup (e: Dom_html.keyboardEvent t) =
    let keycode = e##keyCode in
    (match keycode with
      | 16 -> isShiftPressed := false
      | _ -> ()
    )
  in
  phiUI##bind(Js.string "control_keydown", control_keydown);
  phiUI##bind(Js.string "control_keyup", control_keyup)

in Js._false)

