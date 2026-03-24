using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceTracker.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddV2RulesAndInsights : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "rules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    ConditionType = table.Column<int>(type: "integer", nullable: false),
                    ConditionValue = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    AmountThreshold = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    ActionType = table.Column<int>(type: "integer", nullable: false),
                    ActionValue = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_rules_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "transaction_alerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TransactionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Message = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Severity = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transaction_alerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_transaction_alerts_transactions_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_transaction_alerts_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "transaction_tags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TransactionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Tag = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transaction_tags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_transaction_tags_transactions_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_transaction_tags_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_rules_UserId_IsActive_Priority",
                table: "rules",
                columns: new[] { "UserId", "IsActive", "Priority" });

            migrationBuilder.CreateIndex(
                name: "IX_transaction_alerts_TransactionId",
                table: "transaction_alerts",
                column: "TransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_transaction_alerts_UserId_TransactionId",
                table: "transaction_alerts",
                columns: new[] { "UserId", "TransactionId" });

            migrationBuilder.CreateIndex(
                name: "IX_transaction_tags_TransactionId_Tag",
                table: "transaction_tags",
                columns: new[] { "TransactionId", "Tag" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_transaction_tags_UserId_Tag",
                table: "transaction_tags",
                columns: new[] { "UserId", "Tag" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "rules");

            migrationBuilder.DropTable(
                name: "transaction_alerts");

            migrationBuilder.DropTable(
                name: "transaction_tags");
        }
    }
}
