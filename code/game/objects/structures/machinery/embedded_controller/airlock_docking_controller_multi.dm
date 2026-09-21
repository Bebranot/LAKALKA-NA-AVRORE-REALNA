//a controller for a docking port with multiple independent airlocks
//this is the master controller, that things will try to dock with.
/obj/structure/machinery/embedded_controller/radio/docking_port_multi
	name = "docking port controller"

	var/child_tags_txt
	var/child_names_txt
	var/list/child_names = list()

	var/datum/computer/file/embedded_program/docking/multi/docking_program

/obj/structure/machinery/embedded_controller/radio/docking_port_multi/Initialize()
	. = ..()
	docking_program = new/datum/computer/file/embedded_program/docking/multi(src)
	program = docking_program

	var/list/names = text2list(child_names_txt, ";")
	var/list/tags = text2list(child_tags_txt, ";")

	if (names.len == tags.len)
		for (var/i = 1; i <= tags.len; i++)
			child_names[tags[i]] = names[i]


/obj/structure/machinery/embedded_controller/radio/docking_port_multi/ui_interact(mob/user, datum/tgui/ui)
	ui = SStgui.try_update_ui(user, src, ui)
	if(!ui)
		ui = new(user, src, "MultiDockingConsole", name, ui_x=470, ui_y=290)
		ui.open()

/obj/structure/machinery/embedded_controller/radio/docking_port_multi/ui_data(mob/user)
	var/list/airlocks[child_names.len]
	var/i = 1
	for (var/child_tag in child_names)
		airlocks[i++] = list("name"=child_names[child_tag], "override_enabled"=(docking_program.children_override[child_tag] == "enabled"))

	return list(
		"docking_status" = docking_program.get_docking_status(),
		"airlocks" = airlocks
	)

//a docking port based on an airlock
/obj/structure/machinery/embedded_controller/radio/airlock/docking_port_multi
	name = "docking port controller"
	var/master_tag	//for mapping
	var/datum/computer/file/embedded_program/airlock/multi_docking/airlock_program
	tag_secure = TRUE

/obj/structure/machinery/embedded_controller/radio/airlock/docking_port_multi/Initialize()
	. = ..()
	airlock_program = new/datum/computer/file/embedded_program/airlock/multi_docking(src)
	program = airlock_program

/obj/structure/machinery/embedded_controller/radio/airlock/docking_port_multi/ui_interact(mob/user, datum/tgui/ui)
	ui = SStgui.try_update_ui(user, src, ui)
	if(!ui)
		ui = new(user, src, "DockingAirlockConsole", name, ui_x=470, ui_y=250)
		ui.open()

/obj/structure/machinery/embedded_controller/radio/airlock/docking_port_multi/ui_data(mob/user)
	return list(
		"chamber_pressure" = round(airlock_program.memory["chamber_sensor_pressure"]),
		"exterior_status" = airlock_program.memory["exterior_status"],
		"interior_status" = airlock_program.memory["interior_status"],
		"processing" = airlock_program.memory["processing"],
		"docking_status" = airlock_program.master_status,
		"airlock_disabled" = (airlock_program.docking_enabled && !airlock_program.override_enabled),
		"override_enabled" = airlock_program.override_enabled
	)

/obj/structure/machinery/embedded_controller/radio/airlock/docking_port_multi/ui_act(action, params)
	. = ..()
	if(.)
		return

	if(action == "command")
		var/clean = FALSE
		switch(params["command"])	//anti-HTML-hacking checks
			if("cycle_ext")
				clean = TRUE
			if("cycle_int")
				clean = TRUE
			if("force_ext")
				clean = TRUE
			if("force_int")
				clean = TRUE
			if("abort")
				clean = TRUE
			if("toggle_override")
				clean = TRUE
		if(clean)
			program.receive_user_command(params["command"])
			return TRUE



