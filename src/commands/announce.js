import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('announce')
		.setDescription('إرسال إعلان في قناة محددة')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addStringOption(o => o.setName('message').setDescription('نص الإعلان').setRequired(true))
		.addChannelOption(o => o.setName('channel').setDescription('القناة').addChannelTypes(ChannelType.GuildText)),
	execute: async interaction => {
		const message = interaction.options.getString('message', true);
		const channel = interaction.options.getChannel('channel') ?? interaction.channel;
		if (!('send' in channel)) return interaction.reply({ content: 'قناة غير صالحة.', ephemeral: true });
		await channel.send({ content: message });
		await interaction.reply({ content: 'تم إرسال الإعلان.', ephemeral: true });
	},
};
