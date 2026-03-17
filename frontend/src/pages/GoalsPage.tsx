import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { EmptyState, LoadingState } from "components/feedback/States";
import { useGoals } from "hooks/useFinanceQueries";
import { goalService } from "services/financeServices";
import { getApiErrorMessage } from "utils/apiError";
import { formatCurrency } from "utils/format";

export const GoalsPage = () => {
  const goals = useGoals();
  const qc = useQueryClient();

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
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Contribution failed"))
  });

  return (
    <div className="page-grid">
      <PageHeader title="Savings Goals" subtitle="Turn future plans into measurable progress." />
      <Card title="Create a new goal" subtitle="Set a target and start with any amount">
        <form className="row-form" onSubmit={(e) => {
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
          <input name="name" placeholder="Goal name (e.g., Emergency Fund)" required />
          <input name="targetAmount" type="number" min="0.01" step="0.01" placeholder="Target amount" required />
          <input name="currentAmount" type="number" min="0" step="0.01" placeholder="Starting amount" defaultValue={0} />
          <input name="targetDate" type="date" />
          <button className="primary-btn" type="submit" disabled={createGoal.isPending}>{createGoal.isPending ? "Creating..." : "Add Goal"}</button>
        </form>
      </Card>

      {goals.isLoading ? <LoadingState text="Loading goals..." /> : null}
      {!goals.isLoading && !(goals.data?.length) ? (
        <EmptyState text="No goals yet" hint="Create your first goal and add a quick contribution to kickstart progress." />
      ) : null}

      <div className="goal-grid">
        {goals.data?.map((goal) => (
          <Card key={goal.id} title={goal.name} subtitle={`${goal.progressPercent}% complete`}>
            <p className="goal-balance">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
            <div className="progress-track"><div style={{ width: `${Math.min(goal.progressPercent, 100)}%` }} /></div>
            <div className="goal-actions">
              <button className="primary-btn" type="button" onClick={() => contribute.mutate({ id: goal.id, amount: 500 })} disabled={contribute.isPending}>+ Add 500</button>
              <button className="ghost-btn" type="button" onClick={() => contribute.mutate({ id: goal.id, amount: 1000 })} disabled={contribute.isPending}>+ Add 1000</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
