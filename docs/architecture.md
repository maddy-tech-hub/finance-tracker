# Architecture Notes

## Business Rules Implemented
- Password complexity enforcement
- Transfer atomicity and account balance safety
- Budget uniqueness per category/month/year/user
- Budget threshold calculations (80/100/120)
- Goal contribution/withdraw linked account balance handling
- Recurring transactions with duplicate prevention
- Expense-only budget actual spend

## Security
- JWT bearer authentication
- Refresh token rotation with persistence
- Login rate limiting
- Global exception boundary
