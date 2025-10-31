import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('timeout')
		.setDescription('تقييد نشاط العضو لفترة محددة')
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
		.addStringOption(o => o.setName('duration').setDescription('المدة مثل 10m, 1h').setRequired(true)),
	execute: async interaction => {
		const user = interaction.options.getUser('user', true);
		const durationText = interaction.options.getString('duration', true);
		const ms = parseDuration(durationText);
		if (!ms) return interaction.reply({ content: 'صيغة مدة غير صحيحة.', ephemeral: true });
		const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
		if (!member) return interaction.reply({ content: 'لا يمكن إيجاد العضو.', ephemeral: true });
		await member.timeout(ms, `Timeout by ${interaction.user.tag}`);
		await interaction.reply({ content: `تم تقييد ${user.tag} لمدة ${durationText}`, ephemeral: true });
	},
};

function parseDuration(text){
	const match = /^([0-9]+)\s*([smhd])$/i.exec(text.trim());
	if(!match) return 0;
	const n = Number(match[1]);
	switch(match[2].toLowerCase()){
		case 's': return n*1000;
		case 'm': return n*60*1000;
		case 'h': return n*60*60*1000;
		case 'd': return n*24*60*60*1000;
		default: return 0;
	}
}
