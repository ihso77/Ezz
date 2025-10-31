import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('channel-create')
		.setDescription('إنشاء قناة جديدة')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.addStringOption(o => o.setName('name').setDescription('الاسم').setRequired(true))
		.addStringOption(o => o.setName('type').setDescription('text أو voice').addChoices(
			{ name: 'text', value: 'text' },
			{ name: 'voice', value: 'voice' }
		).setRequired(true)),
	execute: async interaction => {
		const name = interaction.options.getString('name', true);
		const type = interaction.options.getString('type', true);
		const created = await interaction.guild.channels.create({
			name,
			type: type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText,
		});
		await interaction.reply({ content: `تم إنشاء القناة ${created}.`, ephemeral: true });
	},
};
