import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiMinus, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { EmptyState, LoadingState } from "components/feedback/States";
import { useGoals } from "hooks/useFinanceQueries";
import { goalService } from "services/financeServices";
import type { Goal } from "types/api";
import { getApiErrorMessage } from "utils/apiError";
import { formatCurrency } from "utils/format";

const toDateInput = (value?: string) => (value ? String(value).slice(0, 10) : "");

export const GoalsPage = () => {
  const goals = useGoals();
  const qc = useQueryClient();
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editName, setEditName] = useState("");
  const [editTargetAmount, setEditTargetAmount] = useState("");
  const [editCurrentAmount, setEditCurrentAmount] = useState("");
  const [editTargetDate, setEditTargetDate] = useState("");
  const [customAddAmount, setCustomAddAmount] = useState("500");
  const [customWithdrawAmount, setCustomWithdrawAmount] = useState("500");

  const createGoal = useMutation({
    mutationFn: goalService.create,
    onSuccess: () => {
      toast.success("Goal created");
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to create goal"))
  });

  const contribute = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => goalService.contribute(id, amount),
    onSuccess: () => {
      toast.success("Contribution added");
      setEditingGoal(null);
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Contribution failed"))
  });

  const withdraw = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => goalService.withdraw(id, amount),
    onSuccess: () => {
      toast.success("Withdrawal processed");
      setEditingGoal(null);
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Withdrawal failed"))
  });

  const updateGoal = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; targetAmount: number; currentAmount: number; targetDate?: string; linkedAccountId?: string } }) =>
      goalService.update(id, payload),
    onSuccess: () => {
      toast.success("Goal updated");
      setEditingGoal(null);
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to update goal"))
  });

  const deleteGoal = useMutation({
    mutationFn: goalService.remove,
    onSuccess: () => {
      toast.success("Goal deleted");
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to delete goal"))
  });

  return (
    <div className="page-grid">
      <PageHeader title="Savings Goals" subtitle="Turn future plans into measurable progress." />

      <Card title="Create a new goal" subtitle="Set a target and start with any amount">
        <form className="row-form goal-create-form" onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget as HTMLFormElement);
          createGoal.mutate({
            name: String(form.get("name") || ""),
            targetAmount: Number(form.get("targetAmount") || 0),
            currentAmount: Number(form.get("currentAmount") || 0),
            targetDate: String(form.get("targetDate")) || undefined
          });
          (e.currentTarget as HTMLFormElement).reset();
        }}>
          <label className="field">
            <span>Goal name</span>
            <input name="name" placeholder="Goal name (e.g., Emergency Fund)" required />
          </label>
          <label className="field">
            <span>Target amount</span>
            <input name="targetAmount" type="number" min="0.01" step="0.01" placeholder="Target amount" required />
          </label>
          <label className="field">
            <span>Current amount</span>
            <input name="currentAmount" type="number" min="0" step="0.01" placeholder="Starting amount" defaultValue={0} />
          </label>
          <label className="field">
            <span>Target date (optional)</span>
            <input name="targetDate" type="date" title="Optional deadline for this goal" />
          </label>
          <button className="primary-btn" type="submit" disabled={createGoal.isPending}>{createGoal.isPending ? "Creating..." : "Add Goal"}</button>
        </form>
      </Card>

      {goals.isLoading ? <LoadingState text="Loading goals..." /> : null}
      {!goals.isLoading && !(goals.data?.length) ? (
        <EmptyState text="No goals yet" hint="Create your first goal and add a quick contribution to kickstart progress." />
      ) : null}

      <div className="goal-grid">
        {goals.data?.map((goal) => (
          <Card
            key={goal.id}
            title={goal.name}
            subtitle={`${goal.progressPercent}% complete`}
            action={
              <div className="card-icon-actions">
                <button
                  className="icon-plain-btn"
                  type="button"
                  title="Edit goal"
                  aria-label="Edit goal"
                  onClick={() => {
                    setEditingGoal(goal);
                    setEditName(goal.name);
                    setEditTargetAmount(String(goal.targetAmount));
                    setEditCurrentAmount(String(goal.currentAmount));
                    setEditTargetDate(toDateInput(goal.targetDate));
                    setCustomAddAmount("500");
                    setCustomWithdrawAmount("500");
                  }}
                >
                  <FiEdit2 />
                </button>
                <button className="icon-plain-btn danger" type="button" title="Delete goal" aria-label="Delete goal" onClick={() => deleteGoal.mutate(goal.id)} disabled={deleteGoal.isPending}>
                  <FiTrash2 />
                </button>
              </div>
            }
          >
            <p className="goal-balance">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
            <div className="progress-track"><div style={{ width: `${Math.min(goal.progressPercent, 100)}%` }} /></div>
            <div className="goal-actions goal-actions-compact">
              <button className="primary-btn" type="button" onClick={() => contribute.mutate({ id: goal.id, amount: 500 })} disabled={contribute.isPending}>
                <FiPlus /> Add 500
              </button>
              <button className="ghost-btn" type="button" onClick={() => withdraw.mutate({ id: goal.id, amount: 500 })} disabled={withdraw.isPending}>
                <FiMinus /> Withdraw 500
              </button>
            </div>
          </Card>
        ))}
      </div>

      {editingGoal ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit goal">
          <section className="modal-card">
            <div className="modal-head">
              <div>
                <h3>Edit Goal</h3>
                <p>Update details or use custom add/withdraw for this goal.</p>
              </div>
              <button className="ghost-btn icon-btn" type="button" onClick={() => setEditingGoal(null)} aria-label="Close">
                <FiX />
              </button>
            </div>

            <form
              className="quick-form"
              onSubmit={(event) => {
                event.preventDefault();
                updateGoal.mutate({
                  id: editingGoal.id,
                  payload: {
                    name: editName,
                    targetAmount: Number(editTargetAmount),
                    currentAmount: Number(editCurrentAmount),
                    targetDate: editTargetDate || undefined,
                    linkedAccountId: editingGoal.linkedAccountId
                  }
                });
              }}
            >
              <label>Goal name<input value={editName} onChange={(e) => setEditName(e.target.value)} required /></label>
              <label>Target amount<input type="number" min="0.01" step="0.01" value={editTargetAmount} onChange={(e) => setEditTargetAmount(e.target.value)} required /></label>
              <label>Current amount<input type="number" min="0" step="0.01" value={editCurrentAmount} onChange={(e) => setEditCurrentAmount(e.target.value)} required /></label>
              <label>Target date<input type="date" value={editTargetDate} onChange={(e) => setEditTargetDate(e.target.value)} /></label>
              <button className="primary-btn wide" type="submit" disabled={updateGoal.isPending}>
                {updateGoal.isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>

            <div className="quick-form" style={{ marginTop: 12 }}>
              <label>
                Add amount
                <input type="number" min="0.01" step="0.01" value={customAddAmount} onChange={(e) => setCustomAddAmount(e.target.value)} />
              </label>
              <label>
                Withdraw amount
                <input type="number" min="0.01" step="0.01" value={customWithdrawAmount} onChange={(e) => setCustomWithdrawAmount(e.target.value)} />
              </label>
              <div className="wide goal-actions goal-actions-compact">
                <button className="primary-btn" type="button" onClick={() => contribute.mutate({ id: editingGoal.id, amount: Number(customAddAmount || 0) })} disabled={contribute.isPending}>
                  <FiPlus /> Add Custom
                </button>
                <button className="ghost-btn" type="button" onClick={() => withdraw.mutate({ id: editingGoal.id, amount: Number(customWithdrawAmount || 0) })} disabled={withdraw.isPending}>
                  <FiMinus /> Withdraw Custom
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
};
