using FinanceTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceTracker.Infrastructure.Persistence.Configurations;

public sealed class BudgetConfiguration : IEntityTypeConfiguration<Budget>
{
    public void Configure(EntityTypeBuilder<Budget> builder)
    {
        builder.ToTable("budgets");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Amount).HasColumnType("numeric(18,2)");
        builder.HasIndex(x => new { x.UserId, x.CategoryId, x.Month, x.Year }).IsUnique();
        builder.HasOne(x => x.User).WithMany(x => x.Budgets).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Category).WithMany(x => x.Budgets).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Cascade);
        builder.ToTable(t =>
        {
            t.HasCheckConstraint("ck_budget_amount", "\"Amount\" > 0");
            t.HasCheckConstraint("ck_budget_month", "\"Month\" >= 1 AND \"Month\" <= 12");
        });
    }
}
