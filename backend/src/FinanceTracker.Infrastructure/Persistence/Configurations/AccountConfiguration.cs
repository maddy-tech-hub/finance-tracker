using FinanceTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceTracker.Infrastructure.Persistence.Configurations;

public sealed class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("accounts");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Currency).HasMaxLength(10).IsRequired();
        builder.Property(x => x.Balance).HasColumnType("numeric(18,2)");
        builder.HasIndex(x => x.UserId);
        builder.HasOne(x => x.User).WithMany(x => x.Accounts).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.ToTable(t => t.HasCheckConstraint("ck_accounts_balance", "\"Balance\" >= -999999999"));
    }
}
