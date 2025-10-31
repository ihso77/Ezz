import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('channel-delete')
		.setDescription('حذف قناة معينة')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.addChannelOption(o => o.setName('channel').setDescription('القناة').addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice).setRequired(true)),
	execute: async interaction => {
		const channel = interaction.options.getChannel('channel', true);
		await channel.delete().catch(() => null);
		await interaction.reply({ content: 'تم حذف القناة.', ephemeral: true });
	},
};
