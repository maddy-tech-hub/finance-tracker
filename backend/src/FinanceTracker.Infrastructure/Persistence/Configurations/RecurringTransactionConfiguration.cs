using FinanceTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceTracker.Infrastructure.Persistence.Configurations;

public sealed class RecurringTransactionConfiguration : IEntityTypeConfiguration<RecurringTransaction>
{
    public void Configure(EntityTypeBuilder<RecurringTransaction> builder)
    {
        builder.ToTable("recurring_transactions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Amount).HasColumnType("numeric(18,2)");
        builder.Property(x => x.Note).HasMaxLength(400);
        builder.HasIndex(x => x.NextRunDate);
        builder.HasOne(x => x.User).WithMany(x => x.RecurringTransactions).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Account).WithMany().HasForeignKey(x => x.AccountId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.DestinationAccount).WithMany().HasForeignKey(x => x.DestinationAccountId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);
        builder.ToTable(t => t.HasCheckConstraint("ck_recurring_amount", "\"Amount\" > 0"));
    }
}
