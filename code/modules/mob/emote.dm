// All mobs should have custom emote, really..
//m_type == 1 --> visual.
//m_type == 2 --> audible
/mob/proc/emote_dead(var/message)

	if(client.prefs.muted & MUTE_DEADCHAT)
		to_chat(src, SPAN_DANGER("You cannot send deadchat emotes (muted)."))
		return

	if(!(client.prefs.toggles & CHAT_DEAD))
		to_chat(src, SPAN_DANGER("You have deadchat muted."))
		return

	if(!src.client.holder)
		if(!GLOB.config.dsay_allowed)
			to_chat(src, SPAN_DANGER("Deadchat is globally muted."))
			return


	var/input
	if(!message)
		input = sanitize(input(src, "Choose an emote to display.") as text|null)
	else
		input = message

	if(input)
		log_emote("Ghost/[src.key] : [input]")
		say_dead_direct(input, src)


//This is a central proc that all emotes are run through. This handles sending the messages to living mobs
/mob/proc/send_emote(var/message, var/type)
	var/list/messagemobs = list()
	var/list/ghosts_nearby = list()
	// Mobs we've already handled via the view scan below, so the ghostsight pass over
	// GLOB.dead_mob_list (far smaller than GLOB.player_list, but still worth not re-adding) skips them.
	var/list/seen = list()

	// Walking view()'s own turfs and reading their contents directly is equivalent to the old
	// "collect turfs, then linear-scan every player checking turf membership" approach, but its
	// cost scales with what's actually nearby instead of with total server population.
	for (var/turf/T in view(world.view, get_turf(src)))
		for (var/mob/M in T)
			if (!M.client || isnewplayer(M))
				continue
			seen[M] = TRUE
			if (isghost(M))
				ghosts_nearby += M
			else if (isliving(M) && !(type == 2 && isdeaf(M)))
				messagemobs += M

	var/list/ghosts = list()
	if(src.client)
		for(var/mob/M in GLOB.dead_mob_list)
			if (!M.client || isnewplayer(M) || seen[M])
				continue
			if (M.stat == DEAD && (M.client.prefs.toggles & CHAT_GHOSTSIGHT))
				ghosts += M

	for (var/mob/N in messagemobs)
		N.show_message(message, type)

	for(var/mob/O in ghosts)
		O.show_message("[ghost_follow_link(src, O)] [message]", type)

	for(var/mob/GN in ghosts_nearby)
		GN.show_message("[ghost_follow_link(src, GN)] <b>[message]</b>", type)
