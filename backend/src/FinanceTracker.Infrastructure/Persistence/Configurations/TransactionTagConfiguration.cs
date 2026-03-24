using FinanceTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceTracker.Infrastructure.Persistence.Configurations;

public sealed class TransactionTagConfiguration : IEntityTypeConfiguration<TransactionTag>
{
    public void Configure(EntityTypeBuilder<TransactionTag> builder)
    {
        builder.ToTable("transaction_tags");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Tag).HasMaxLength(64).IsRequired();
        builder.HasIndex(x => new { x.UserId, x.Tag });
        builder.HasIndex(x => new { x.TransactionId, x.Tag }).IsUnique();
        builder.HasOne(x => x.User).WithMany(x => x.TransactionTags).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Transaction).WithMany(x => x.Tags).HasForeignKey(x => x.TransactionId).OnDelete(DeleteBehavior.Cascade);
    }
}
