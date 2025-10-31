import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('رفع الحظر عن عضو')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addStringOption(o => o.setName('user').setDescription('ID المستخدم المحظور').setRequired(true)),
	execute: async interaction => {
		const userId = interaction.options.getString('user', true);
		try {
			await interaction.guild?.members.unban(userId);
			await interaction.reply({ content: `تم رفع الحظر عن <@${userId}>`, ephemeral: true });
		} catch {
			await interaction.reply({ content: 'تعذر رفع الحظر. تأكد من صحة المعرف.', ephemeral: true });
		}
	},
};
