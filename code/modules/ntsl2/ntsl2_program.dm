/*
Datum representing program state on deamon and exposing apropriate procs to DM.
*/
/datum/ntsl2_program/
	var/id = 0
	var/name = "Base NTSL2++ program"
	var/list/ready_tasks = list()


/datum/ntsl2_program/New()
	..()

/datum/ntsl2_program/Destroy()
	// new_program_computer()/new_program_tcomm() START_PROCESSING(SSntsl2, src) us, but nothing
	// ever called STOP_PROCESSING - since this is a plain /datum (not /obj), there's no base
	// Destroy() that does it for us, so every killed program used to sit in SSntsl2.processing
	// forever, still getting process() called on it, forever pinning it out of GC.
	if(datum_flags & DF_ISPROCESSING)
		STOP_PROCESSING(SSntsl2, src)
	return ..()

/datum/ntsl2_program/proc/is_ready()
	return !!id

/datum/ntsl2_program/proc/kill()
	if(is_ready())
		SSntsl2.send_task("remove", list(id = id))
	SSntsl2.handle_termination(src)
	qdel(src)

/datum/ntsl2_program/proc/execute(var/script, var/mob/user)
	if(!is_ready())
		ready_tasks += CALLBACK(src, PROC_REF(execute), script, user)
		return FALSE // We are not ready to run code
	log_ntsl("[user.name]/[user.key] uploaded script to [src] : [script]", SEVERITY_NOTICE, user.ckey)
	return SSntsl2.send_task("execute", list(id = id, code = script), program = src)
