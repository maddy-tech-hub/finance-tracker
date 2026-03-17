using FinanceTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceTracker.Infrastructure.Persistence.Configurations;

public sealed class SavingsGoalConfiguration : IEntityTypeConfiguration<SavingsGoal>
{
    public void Configure(EntityTypeBuilder<SavingsGoal> builder)
    {
        builder.ToTable("goals");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(120).IsRequired();
        builder.Property(x => x.TargetAmount).HasColumnType("numeric(18,2)");
        builder.Property(x => x.CurrentAmount).HasColumnType("numeric(18,2)");
        builder.HasIndex(x => x.UserId);
        builder.HasOne(x => x.User).WithMany(x => x.Goals).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.LinkedAccount).WithMany(x => x.LinkedGoals).HasForeignKey(x => x.LinkedAccountId).OnDelete(DeleteBehavior.SetNull);
        builder.ToTable(t => t.HasCheckConstraint("ck_goal_target", "\"TargetAmount\" > 0"));
    }
}
