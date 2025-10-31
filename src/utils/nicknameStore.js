const guildNicknameHistory = new Map(); // guildId -> Map(userId -> [nickname])

export function addNickname(guildId, userId, nickname){
	const store = guildNicknameHistory.get(guildId) ?? new Map();
	const list = store.get(userId) ?? [];
	if (nickname && (list.length === 0 || list[list.length - 1] !== nickname)) {
		list.push(nickname);
		store.set(userId, list);
		guildNicknameHistory.set(guildId, store);
	}
}

export function getNicknameHistory(guildId, userId){
	const store = guildNicknameHistory.get(guildId);
	return store?.get(userId) ?? [];
}
