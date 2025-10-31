import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('عرض معلومات العضو')
		.addUserOption(o => o.setName('user').setDescription('العضو')),
	execute: async interaction => {
		const user = interaction.options.getUser('user') ?? interaction.user;
		const member = await interaction.guild.members.fetch(user.id).catch(() => null);
		const roles = member ? member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.toString()).join(', ') || 'لا يوجد' : 'N/A';
		const embed = new EmbedBuilder()
			.setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
			.setThumbnail(user.displayAvatarURL({ size: 256 }))
			.addFields(
				{ name: 'انضم للسيرفر', value: member ? `<t:${Math.floor(member.joinedTimestamp/1000)}:R>` : 'N/A', inline: true },
				{ name: 'تاريخ إنشاء الحساب', value: `<t:${Math.floor(user.createdTimestamp/1000)}:R>`, inline: true },
				{ name: 'الرتب', value: roles }
			);
		await interaction.reply({ embeds: [embed] });
	},
};
