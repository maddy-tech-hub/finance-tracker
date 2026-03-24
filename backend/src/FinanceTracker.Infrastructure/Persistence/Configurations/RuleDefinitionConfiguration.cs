using FinanceTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceTracker.Infrastructure.Persistence.Configurations;

public sealed class RuleDefinitionConfiguration : IEntityTypeConfiguration<RuleDefinition>
{
    public void Configure(EntityTypeBuilder<RuleDefinition> builder)
    {
        builder.ToTable("rules");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(120).IsRequired();
        builder.Property(x => x.ConditionValue).HasMaxLength(200);
        builder.Property(x => x.ActionValue).HasMaxLength(200);
        builder.Property(x => x.AmountThreshold).HasColumnType("numeric(18,2)");
        builder.HasIndex(x => new { x.UserId, x.IsActive, x.Priority });
        builder.HasOne(x => x.User).WithMany(x => x.Rules).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
