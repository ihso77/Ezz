import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('setnick')
		.setDescription('تغيير لقب العضو')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
		.addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
		.addStringOption(o => o.setName('nickname').setDescription('اللقب الجديد').setRequired(true)),
	execute: async interaction => {
		const user = interaction.options.getUser('user', true);
		const nickname = interaction.options.getString('nickname', true);
		const member = await interaction.guild?.members.fetch(user.id).catch(() => null);
		if (!member) return interaction.reply({ content: 'لا يمكن إيجاد العضو.', ephemeral: true });
		await member.setNickname(nickname).catch(() => null);
		await interaction.reply({ content: `تم تغيير لقب ${user.tag} إلى ${nickname}`, ephemeral: true });
	},
};
