import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('حذف عدد محدد من الرسائل')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addIntegerOption(o => o.setName('amount').setDescription('العدد (1-100)').setRequired(true)),
	execute: async interaction => {
		const amount = interaction.options.getInteger('amount', true);
		if (amount < 1 || amount > 100) return interaction.reply({ content: 'اختر رقم بين 1 و 100.', ephemeral: true });
		await interaction.channel.bulkDelete(amount, true).catch(() => {});
		await interaction.reply({ content: `تم حذف ${amount} رسالة.`, ephemeral: true });
	},
};
