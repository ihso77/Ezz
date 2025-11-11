import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { resetClaimCount, getClaimCount } from '../utils/claimStats.js';

export default {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('تصفير عدد استلامات تذاكر لمستخدم محدد.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('المستخدم الذي تريد تصفير استلاماته.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // يتطلب صلاحية إداري لتنفيذ الأمر
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const targetMember = interaction.guild.members.cache.get(targetUser.id);
        
        // التحقق من أن المستخدم لديه صلاحية الإداري (تم تحديدها في setDefaultMemberPermissions)
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ content: 'ليس لديك الصلاحية لاستخدام هذا الأمر.', ephemeral: true });
            return;
        }

        try {
            const oldClaims = await getClaimCount(targetUser.id);
            await resetClaimCount(targetUser.id);
            const newClaims = await getClaimCount(targetUser.id);

            await interaction.reply({ 
                content: `تم تصفير عدد استلامات التذاكر للمستخدم ${targetMember || targetUser} بنجاح.
                \n**العدد السابق:** ${oldClaims}
                \n**العدد الحالي:** ${newClaims}`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error('Error resetting claim count:', error);
            await interaction.reply({ content: 'حدث خطأ أثناء محاولة تصفير عدد الاستلامات.', ephemeral: true });
        }
    },
};
