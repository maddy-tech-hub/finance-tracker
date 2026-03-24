import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiChevronRight, FiClock, FiCreditCard, FiMenu, FiPlus, FiSearch, FiTag, FiTarget, FiUser, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAccounts, useCategories } from "hooks/useFinanceQueries";
import { goalService, recurringService, transactionService } from "services/financeServices";
import { useAuthStore } from "store/authStore";
import { formatCurrency, formatDate } from "utils/format";

const today = new Date().toISOString().slice(0, 10);

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  to: string;
  icon: ReactNode;
};

type TopbarProps = {
  onOpenNav?: () => void;
};

export const Topbar = ({ onOpenNav }: TopbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const fullName = useAuthStore((s) => s.fullName) ?? "User";
  const shortName = fullName.split(" ")[0] ?? "User";
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const blurTimeoutRef = useRef<number | null>(null);
  const qc = useQueryClient();
  const accounts = useAccounts();
  const categories = useCategories();
  const searchEnabled = search.trim().length >= 2;

  const txSearch = useQuery({
    queryKey: ["top-search-tx", search],
    queryFn: () => transactionService.list({ search }),
    enabled: searchEnabled
  });

  const goalsSearch = useQuery({
    queryKey: ["top-search-goals", search],
    queryFn: () => goalService.list(),
    enabled: searchEnabled
  });

  const recurringSearch = useQuery({
    queryKey: ["top-search-recurring", search],
    queryFn: () => recurringService.list(),
    enabled: searchEnabled
  });

  const categoryOptions = useMemo(() => categories.data?.filter((c) => c.type === 2) ?? [], [categories.data]);
  const canSubmit = (accounts.data?.length ?? 0) > 0 && categoryOptions.length > 0;
  const hasAccounts = (accounts.data?.length ?? 0) > 0;
  const hasExpenseCategories = categoryOptions.length > 0;

  const resultItems = useMemo<SearchItem[]>(() => {
    if (!searchEnabled) return [];

    const term = search.trim().toLowerCase();

    const txItems = (txSearch.data ?? []).slice(0, 4).map((tx) => ({
      id: `tx-${tx.id}`,
      title: tx.note?.trim() ? tx.note : "Transaction",
      subtitle: `${formatCurrency(tx.amount)} • ${formatDate(tx.transactionDate)}`,
      to: `/transactions?search=${encodeURIComponent(search.trim())}`,
      icon: <FiCreditCard />
    }));

    const goalItems = (goalsSearch.data ?? [])
      .filter((g) => g.name.toLowerCase().includes(term))
      .slice(0, 3)
      .map((g) => ({
        id: `goal-${g.id}`,
        title: g.name,
        subtitle: `Goal • ${g.progressPercent}% complete`,
        to: "/goals",
        icon: <FiTarget />
      }));

    const recurringItems = (recurringSearch.data ?? [])
      .filter((r) => (r.note ?? "").toLowerCase().includes(term))
      .slice(0, 3)
      .map((r) => ({
        id: `rec-${r.id}`,
        title: r.note?.trim() ? r.note : "Recurring item",
        subtitle: `Recurring • ${formatCurrency(r.amount)} • ${formatDate(r.nextRunDate)}`,
        to: "/recurring",
        icon: <FiClock />
      }));

    const categoryItems = (categories.data ?? [])
      .filter((c) => c.name.toLowerCase().includes(term))
      .slice(0, 3)
      .map((c) => ({
        id: `cat-${c.id}`,
        title: c.name,
        subtitle: `Category • ${c.type === 1 ? "Income" : "Expense"}`,
        to: "/settings",
        icon: <FiTag />
      }));

    return [...txItems, ...goalItems, ...recurringItems, ...categoryItems].slice(0, 10);
  }, [categories.data, goalsSearch.data, recurringSearch.data, search, searchEnabled, txSearch.data]);

  const goToResult = (item: SearchItem) => {
    navigate(item.to);
    setSearch("");
    setShowResults(false);
  };

  useEffect(() => {
    setShowResults(false);
    setSearch("");
  }, [location.pathname]);

  useEffect(() => () => {
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
    }
  }, []);

  const addTransaction = useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      toast.success("Transaction saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: () => {
      toast.error("Unable to save transaction");
    }
  });

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          {onOpenNav ? (
            <button className="ghost-btn icon-btn mobile-menu-btn" type="button" aria-label="Open navigation" onClick={onOpenNav}>
              <FiMenu />
            </button>
          ) : null}
          <div className="search-box search-shell" role="search">
            <FiSearch />
            <input
            placeholder="Search transactions, goals, recurring, categories"
            aria-label="Search"
            value={search}
            onFocus={() => {
              if (blurTimeoutRef.current) {
                window.clearTimeout(blurTimeoutRef.current);
                blurTimeoutRef.current = null;
              }
              setShowResults(true);
            }}
            onBlur={() => {
              blurTimeoutRef.current = window.setTimeout(() => {
                setShowResults(false);
              }, 120);
            }}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              setShowResults(value.trim().length >= 2);
            }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && resultItems.length > 0) {
                  e.preventDefault();
                  goToResult(resultItems[0]);
                }
                if (e.key === "Escape") {
                  setShowResults(false);
                }
              }}
            />
            {search && (
              <button
                type="button"
                className="icon-plain-btn"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  setShowResults(false);
                }}
              >
                <FiX size={15} />
              </button>
            )}

            {showResults && searchEnabled ? (
              <div className="search-results" onMouseDown={(e) => e.preventDefault()}>
                {resultItems.length === 0 ? (
                  <div className="search-empty">No matches found</div>
                ) : (
                  resultItems.map((item) => (
                    <button key={item.id} type="button" className="search-result-item" onClick={() => goToResult(item)}>
                      <span className="search-result-icon">{item.icon}</span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.subtitle}</small>
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </div>
        <div className="topbar-actions">
          <button className="primary-btn topbar-add" type="button" onClick={() => setOpen(true)}>
            <FiPlus /> Add Transaction
          </button>
          <button className="ghost-btn icon-btn" type="button" aria-label="Notifications">
            <FiBell />
          </button>
          <Link className="profile-pill profile-entry desktop-profile-pill" to="/user-profile" aria-label="Open user profile">
            <span className="profile-icon"><FiUser /></span>
            <span className="profile-name">{shortName}</span>
            <FiChevronRight size={14} />
          </Link>
          <Link className="ghost-btn icon-btn mobile-profile-btn" to="/user-profile" aria-label="Open user profile">
            <FiUser />
          </Link>
        </div>
      </header>

      <button className="mobile-fab" type="button" onClick={() => setOpen(true)} aria-label="Add transaction">
        <FiPlus />
      </button>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Quick add transaction">
          <section className="modal-card">
            <div className="modal-head">
              <div>
                <h3>Quick Add Transaction</h3>
                <p>Capture it in seconds and keep your dashboard accurate.</p>
              </div>
              <button className="ghost-btn icon-btn" type="button" onClick={() => setOpen(false)} aria-label="Close">
                <FiX />
              </button>
            </div>

            {!canSubmit ? (
              <div className="recurring-setup-hint" role="status" aria-live="polite">
                <p>
                  {!hasAccounts && !hasExpenseCategories
                    ? "Add at least one account and one expense category to use quick add."
                    : !hasAccounts
                      ? "Add at least one account to use quick add."
                      : "Add an expense category to use quick add."}
                </p>
                <div className="recurring-setup-actions">
                  {!hasAccounts ? (
                    <Link className="ghost-btn recurring-setup-action" to="/accounts" onClick={() => setOpen(false)}>
                      Go to accounts
                    </Link>
                  ) : null}
                  {!hasExpenseCategories ? (
                    <Link className="ghost-btn recurring-setup-action" to="/settings" onClick={() => setOpen(false)}>
                      Go to category settings
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : (
              <form
                className="quick-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!canSubmit) {
                    toast.error("Create at least one account and expense category first.");
                    return;
                  }
                  const form = new FormData(event.currentTarget as HTMLFormElement);
                  addTransaction.mutate({
                    accountId: String(form.get("accountId")),
                    destinationAccountId: undefined,
                    categoryId: String(form.get("categoryId")),
                    type: Number(form.get("type")),
                    amount: Number(form.get("amount")),
                    transactionDate: String(form.get("transactionDate")),
                    note: String(form.get("note") || "")
                  });
                  (event.currentTarget as HTMLFormElement).reset();
                }}
              >
                <label>
                  Account
                  <select name="accountId" required>
                    {accounts.data?.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Category
                  <select name="categoryId" required>
                    {categoryOptions.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Type
                  <select name="type" defaultValue={2}>
                    <option value={1}>Income</option>
                    <option value={2}>Expense</option>
                  </select>
                </label>

                <label>
                  Amount
                  <input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required autoFocus />
                </label>

                <label>
                  Date
                  <input name="transactionDate" type="date" defaultValue={today} required />
                </label>

                <label className="wide">
                  Note
                  <input name="note" placeholder="Optional note" />
                </label>

                <button className="primary-btn wide" type="submit" disabled={addTransaction.isPending || !canSubmit}>
                  {addTransaction.isPending ? "Saving..." : "Save Transaction"}
                </button>
              </form>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
};

