import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function collectCommands() {
	const commands = [];
	const base = path.join(__dirname, 'commands');
	let files = [];
	try {
		files = readdirSync(base).filter(f => f.endsWith('.js'));
	} catch (_) {
		return commands;
	}
	for (const file of files) {
		const fullPath = path.join(base, file);
		const mod = await import(pathToFileURL(fullPath).href);
		if (mod.default?.data) commands.push(mod.default.data.toJSON());
	}
	return commands;
}

(async () => {
	const token = process.env.DISCORD_TOKEN;
	const clientId = process.env.CLIENT_ID;
	const guildId = process.env.GUILD_ID; // optional for guild registration
	if (!token || !clientId) {
		console.error('يرجى ضبط DISCORD_TOKEN و CLIENT_ID في .env');
		process.exit(1);
	}

	const commands = await collectCommands();
	const rest = new REST({ version: '10' }).setToken(token);

	try {
		console.log(`Registering ${commands.length} application (/) commands...`);
		if (guildId) {
			await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
			console.log('تم تسجيل الأوامر على مستوى السيرفر المحدد.');
		} else {
			await rest.put(Routes.applicationCommands(clientId), { body: commands });
			console.log('تم تسجيل الأوامر على مستوى جميع السيرفرات (قد يستغرق الأمر ساعة).');
		}
	} catch (error) {
		console.error(error);
	}
})();
