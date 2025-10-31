import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('حظر عضو من السيرفر مع سبب اختياري')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addUserOption(o => o.setName('user').setDescription('العضو').setRequired(true))
		.addStringOption(o => o.setName('reason').setDescription('السبب').setRequired(false)),
	execute: async interaction => {
		const target = interaction.options.getUser('user', true);
		const reason = interaction.options.getString('reason') ?? 'No reason provided';
		const member = await interaction.guild?.members.fetch(target.id).catch(() => null);
		if (!member) return interaction.reply({ content: 'لا يمكن إيجاد العضو.', ephemeral: true });
		if (!member.bannable) return interaction.reply({ content: 'لا أستطيع حظر هذا العضو.', ephemeral: true });
		await member.ban({ reason });
		await interaction.reply({ content: `تم حظر ${target.tag} | السبب: ${reason}`, ephemeral: true });
	},
};
