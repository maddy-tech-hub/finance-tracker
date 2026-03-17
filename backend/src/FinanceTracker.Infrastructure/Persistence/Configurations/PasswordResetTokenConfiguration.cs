using FinanceTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceTracker.Infrastructure.Persistence.Configurations;

public sealed class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
    {
        builder.ToTable("password_reset_tokens");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Token).HasMaxLength(200).IsRequired();
        builder.HasIndex(x => x.Token).IsUnique();
        builder.HasOne(x => x.User).WithMany(x => x.PasswordResetTokens).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
