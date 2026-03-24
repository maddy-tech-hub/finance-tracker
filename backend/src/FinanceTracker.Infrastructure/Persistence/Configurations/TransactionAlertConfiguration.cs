using FinanceTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceTracker.Infrastructure.Persistence.Configurations;

public sealed class TransactionAlertConfiguration : IEntityTypeConfiguration<TransactionAlert>
{
    public void Configure(EntityTypeBuilder<TransactionAlert> builder)
    {
        builder.ToTable("transaction_alerts");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Message).HasMaxLength(300).IsRequired();
        builder.HasIndex(x => new { x.UserId, x.TransactionId });
        builder.HasOne(x => x.User).WithMany(x => x.Alerts).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Transaction).WithMany(x => x.Alerts).HasForeignKey(x => x.TransactionId).OnDelete(DeleteBehavior.Cascade);
    }
}
