using FinanceTracker.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinanceTracker.Infrastructure.Persistence.Configurations;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(80).IsRequired();
        builder.Property(x => x.ColorHex).HasMaxLength(16).IsRequired();
        builder.Property(x => x.Icon).HasMaxLength(32).IsRequired();
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => new { x.UserId, x.Name, x.Type }).IsUnique();
        builder.HasOne(x => x.User).WithMany(x => x.Categories).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
