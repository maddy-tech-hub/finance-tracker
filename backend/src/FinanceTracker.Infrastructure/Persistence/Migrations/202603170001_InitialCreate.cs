using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FinanceTracker.Infrastructure.Persistence.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "users",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                PasswordHash = table.Column<string>(type: "text", nullable: false),
                FirstName = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                LastName = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                IsEmailVerified = table.Column<bool>(type: "boolean", nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table => { table.PrimaryKey("PK_users", x => x.Id); });

        migrationBuilder.CreateTable(
            name: "accounts",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                Type = table.Column<int>(type: "integer", nullable: false),
                Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                Balance = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_accounts", x => x.Id);
                table.ForeignKey("FK_accounts_users_UserId", x => x.UserId, "users", "Id", onDelete: ReferentialAction.Cascade);
                table.CheckConstraint("ck_accounts_balance", "\"Balance\" >= -999999999");
            });

        migrationBuilder.CreateTable(
            name: "categories",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                ColorHex = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                Icon = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                Type = table.Column<int>(type: "integer", nullable: false),
                IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_categories", x => x.Id);
                table.ForeignKey("FK_categories_users_UserId", x => x.UserId, "users", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "goals",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                LinkedAccountId = table.Column<Guid>(type: "uuid", nullable: true),
                Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                TargetAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                CurrentAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                TargetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_goals", x => x.Id);
                table.ForeignKey("FK_goals_accounts_LinkedAccountId", x => x.LinkedAccountId, "accounts", "Id", onDelete: ReferentialAction.SetNull);
                table.ForeignKey("FK_goals_users_UserId", x => x.UserId, "users", "Id", onDelete: ReferentialAction.Cascade);
                table.CheckConstraint("ck_goal_target", "\"TargetAmount\" > 0");
            });

        migrationBuilder.CreateTable(
            name: "password_reset_tokens",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                Token = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UsedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_password_reset_tokens", x => x.Id);
                table.ForeignKey("FK_password_reset_tokens_users_UserId", x => x.UserId, "users", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "refresh_tokens",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                Token = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                RevokedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                ReplacedByToken = table.Column<string>(type: "text", nullable: true),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_refresh_tokens", x => x.Id);
                table.ForeignKey("FK_refresh_tokens_users_UserId", x => x.UserId, "users", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "recurring_transactions",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                AccountId = table.Column<Guid>(type: "uuid", nullable: false),
                DestinationAccountId = table.Column<Guid>(type: "uuid", nullable: true),
                CategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                Type = table.Column<int>(type: "integer", nullable: false),
                Frequency = table.Column<int>(type: "integer", nullable: false),
                Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                Note = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: true),
                StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                NextRunDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                IsPaused = table.Column<bool>(type: "boolean", nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_recurring_transactions", x => x.Id);
                table.ForeignKey("FK_recurring_transactions_accounts_AccountId", x => x.AccountId, "accounts", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_recurring_transactions_accounts_DestinationAccountId", x => x.DestinationAccountId, "accounts", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_recurring_transactions_categories_CategoryId", x => x.CategoryId, "categories", "Id", onDelete: ReferentialAction.SetNull);
                table.ForeignKey("FK_recurring_transactions_users_UserId", x => x.UserId, "users", "Id", onDelete: ReferentialAction.Cascade);
                table.CheckConstraint("ck_recurring_amount", "\"Amount\" > 0");
            });

        migrationBuilder.CreateTable(
            name: "budgets",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                Month = table.Column<int>(type: "integer", nullable: false),
                Year = table.Column<int>(type: "integer", nullable: false),
                Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_budgets", x => x.Id);
                table.ForeignKey("FK_budgets_categories_CategoryId", x => x.CategoryId, "categories", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_budgets_users_UserId", x => x.UserId, "users", "Id", onDelete: ReferentialAction.Cascade);
                table.CheckConstraint("ck_budget_amount", "\"Amount\" > 0");
                table.CheckConstraint("ck_budget_month", "\"Month\" >= 1 AND \"Month\" <= 12");
            });

        migrationBuilder.CreateTable(
            name: "transactions",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                UserId = table.Column<Guid>(type: "uuid", nullable: false),
                AccountId = table.Column<Guid>(type: "uuid", nullable: false),
                DestinationAccountId = table.Column<Guid>(type: "uuid", nullable: true),
                CategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                RecurringTransactionId = table.Column<Guid>(type: "uuid", nullable: true),
                Type = table.Column<int>(type: "integer", nullable: false),
                Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                Note = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: true),
                TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                IsRecurringGenerated = table.Column<bool>(type: "boolean", nullable: false),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_transactions", x => x.Id);
                table.ForeignKey("FK_transactions_accounts_AccountId", x => x.AccountId, "accounts", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_transactions_accounts_DestinationAccountId", x => x.DestinationAccountId, "accounts", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_transactions_categories_CategoryId", x => x.CategoryId, "categories", "Id", onDelete: ReferentialAction.SetNull);
                table.ForeignKey("FK_transactions_recurring_transactions_RecurringTransactionId", x => x.RecurringTransactionId, "recurring_transactions", "Id", onDelete: ReferentialAction.SetNull);
                table.ForeignKey("FK_transactions_users_UserId", x => x.UserId, "users", "Id", onDelete: ReferentialAction.Cascade);
                table.CheckConstraint("ck_transactions_amount", "\"Amount\" > 0");
            });

        migrationBuilder.CreateIndex(name: "IX_users_Email", table: "users", column: "Email", unique: true);
        migrationBuilder.CreateIndex(name: "IX_accounts_UserId", table: "accounts", column: "UserId");
        migrationBuilder.CreateIndex(name: "IX_categories_UserId", table: "categories", column: "UserId");
        migrationBuilder.CreateIndex(name: "IX_categories_UserId_Name_Type", table: "categories", columns: new[] { "UserId", "Name", "Type" }, unique: true);
        migrationBuilder.CreateIndex(name: "IX_transactions_UserId", table: "transactions", column: "UserId");
        migrationBuilder.CreateIndex(name: "IX_transactions_TransactionDate", table: "transactions", column: "TransactionDate");
        migrationBuilder.CreateIndex(name: "IX_transactions_AccountId", table: "transactions", column: "AccountId");
        migrationBuilder.CreateIndex(name: "IX_transactions_CategoryId", table: "transactions", column: "CategoryId");
        migrationBuilder.CreateIndex(name: "IX_transactions_UserId_TransactionDate", table: "transactions", columns: new[] { "UserId", "TransactionDate" });
        migrationBuilder.CreateIndex(name: "IX_transactions_UserId_CategoryId_TransactionDate", table: "transactions", columns: new[] { "UserId", "CategoryId", "TransactionDate" });
        migrationBuilder.CreateIndex(name: "IX_transactions_DestinationAccountId", table: "transactions", column: "DestinationAccountId");
        migrationBuilder.CreateIndex(name: "IX_transactions_RecurringTransactionId", table: "transactions", column: "RecurringTransactionId");
        migrationBuilder.CreateIndex(name: "IX_budgets_UserId_CategoryId_Month_Year", table: "budgets", columns: new[] { "UserId", "CategoryId", "Month", "Year" }, unique: true);
        migrationBuilder.CreateIndex(name: "IX_budgets_CategoryId", table: "budgets", column: "CategoryId");
        migrationBuilder.CreateIndex(name: "IX_goals_UserId", table: "goals", column: "UserId");
        migrationBuilder.CreateIndex(name: "IX_goals_LinkedAccountId", table: "goals", column: "LinkedAccountId");
        migrationBuilder.CreateIndex(name: "IX_recurring_transactions_NextRunDate", table: "recurring_transactions", column: "NextRunDate");
        migrationBuilder.CreateIndex(name: "IX_recurring_transactions_UserId", table: "recurring_transactions", column: "UserId");
        migrationBuilder.CreateIndex(name: "IX_recurring_transactions_AccountId", table: "recurring_transactions", column: "AccountId");
        migrationBuilder.CreateIndex(name: "IX_recurring_transactions_DestinationAccountId", table: "recurring_transactions", column: "DestinationAccountId");
        migrationBuilder.CreateIndex(name: "IX_recurring_transactions_CategoryId", table: "recurring_transactions", column: "CategoryId");
        migrationBuilder.CreateIndex(name: "IX_refresh_tokens_UserId", table: "refresh_tokens", column: "UserId");
        migrationBuilder.CreateIndex(name: "IX_refresh_tokens_Token", table: "refresh_tokens", column: "Token", unique: true);
        migrationBuilder.CreateIndex(name: "IX_password_reset_tokens_Token", table: "password_reset_tokens", column: "Token", unique: true);
        migrationBuilder.CreateIndex(name: "IX_password_reset_tokens_UserId", table: "password_reset_tokens", column: "UserId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "budgets");
        migrationBuilder.DropTable(name: "goals");
        migrationBuilder.DropTable(name: "password_reset_tokens");
        migrationBuilder.DropTable(name: "refresh_tokens");
        migrationBuilder.DropTable(name: "transactions");
        migrationBuilder.DropTable(name: "recurring_transactions");
        migrationBuilder.DropTable(name: "accounts");
        migrationBuilder.DropTable(name: "categories");
        migrationBuilder.DropTable(name: "users");
    }
}
