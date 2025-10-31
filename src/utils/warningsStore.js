const guildWarnings = new Map(); // guildId -> Map(userId -> [{id, reason, date}])

export function addWarning(guildId, userId, reason){
	const store = guildWarnings.get(guildId) ?? new Map();
	const list = store.get(userId) ?? [];
	const id = `${Date.now()}-${Math.floor(Math.random()*1000)}`;
	list.push({ id, reason, date: new Date().toISOString() });
	store.set(userId, list);
	guildWarnings.set(guildId, store);
	return id;
}

export function listWarnings(guildId, userId){
	const store = guildWarnings.get(guildId);
	return store?.get(userId) ?? [];
}

export function removeWarning(guildId, userId, warnId){
	const store = guildWarnings.get(guildId);
	if(!store) return false;
	const list = store.get(userId) ?? [];
	const idx = list.findIndex(w => w.id === warnId);
	if (idx === -1) return false;
	list.splice(idx,1);
	store.set(userId, list);
	return true;
}
