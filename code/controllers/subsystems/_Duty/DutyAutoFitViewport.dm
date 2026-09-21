// AuroraDuty (local-only): world.view is a fixed 15x15 tile square (code/world.dm), but the
// player's mapwindow pane can be resized to any aspect ratio by maximizing or dragging the game
// window. BYOND doesn't fire a DM-side event when a pane is resized, so nothing previously re-fit
// the view except /client/verb/fit_viewport() (code/game/verbs/ooc.dm), which only runs at login,
// and on fullscreen/menu toggle - never on a live window resize. That gap is what caused black
// bars after maximizing.
//
// fit_viewport() already no-ops cheaply if the pane is already the right size (it compares pixel
// width before doing anything), so it's safe to just call it periodically for every connected
// client instead of trying to detect resizes ourselves.
SUBSYSTEM_DEF(duty_auto_fit_viewport)
	name = "Duty Auto Fit Viewport"
	priority = FIRE_PRIORITY_PING
	init_stage = INITSTAGE_EARLY
	wait = 3 SECONDS
	flags = SS_NO_INIT
	runlevels = RUNLEVEL_LOBBY | RUNLEVELS_DEFAULT
	var/list/currentrun = list()

/datum/controller/subsystem/duty_auto_fit_viewport/fire(resumed = FALSE)
	if(!resumed)
		src.currentrun = GLOB.clients.Copy()

	var/list/currentrun = src.currentrun
	while(currentrun.len)
		var/client/target = currentrun[currentrun.len]
		currentrun.len--

		if(target?.fully_created)
			target.attempt_auto_fit_viewport()

		if(MC_TICK_CHECK)
			return
