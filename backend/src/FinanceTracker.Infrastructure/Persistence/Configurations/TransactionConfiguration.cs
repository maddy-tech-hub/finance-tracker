using FinanceTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceTracker.Infrastructure.Persistence.Configurations;

public sealed class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("transactions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Amount).HasColumnType("numeric(18,2)");
        builder.Property(x => x.Note).HasMaxLength(400);
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.TransactionDate);
        builder.HasIndex(x => x.AccountId);
        builder.HasIndex(x => x.CategoryId);
        builder.HasIndex(x => new { x.UserId, x.TransactionDate });
        builder.HasIndex(x => new { x.UserId, x.CategoryId, x.TransactionDate });
        builder.HasOne(x => x.User).WithMany(x => x.Transactions).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Account).WithMany(x => x.SourceTransactions).HasForeignKey(x => x.AccountId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.DestinationAccount).WithMany(x => x.DestinationTransactions).HasForeignKey(x => x.DestinationAccountId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Category).WithMany(x => x.Transactions).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(x => x.RecurringTransaction).WithMany(x => x.Transactions).HasForeignKey(x => x.RecurringTransactionId).OnDelete(DeleteBehavior.SetNull);
        builder.ToTable(t =>
        {
            t.HasCheckConstraint("ck_transactions_amount", "\"Amount\" > 0");
        });
    }
}
