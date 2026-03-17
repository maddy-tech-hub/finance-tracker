using FinanceTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceTracker.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Email).HasMaxLength(255).IsRequired();
        builder.Property(x => x.PasswordHash).IsRequired();
        builder.Property(x => x.FirstName).HasMaxLength(80).IsRequired();
        builder.Property(x => x.LastName).HasMaxLength(80).IsRequired();
        builder.HasIndex(x => x.Email).IsUnique();
    }
}
