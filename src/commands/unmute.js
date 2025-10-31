import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('إزالة الإسكات عن عضو')
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true)),
	execute: async interaction => {
		const user = interaction.options.getUser('user', true);
		const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
		if (!member) return interaction.reply({ content: 'لا يمكن إيجاد العضو.', ephemeral: true });
		await member.timeout(null, `Unmuted by ${interaction.user.tag}`);
		await interaction.reply({ content: `تم إزالة الإسكات عن ${user.tag}`, ephemeral: true });
	},
};
