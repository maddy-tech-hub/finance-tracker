import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { EmptyState } from "components/feedback/States";
import { useCategories, useRulesV2 } from "hooks/useFinanceQueries";
import { rulesV2Service } from "services/financeServices";
import type { Rule, RuleRequest } from "types/api";
import { getApiErrorMessage } from "utils/apiError";

const conditionLabel: Record<number, string> = {
  1: "Merchant contains",
  2: "Amount greater than",
  3: "Category equals"
};

const actionLabel: Record<number, string> = {
  1: "Set category",
  2: "Create alert",
  3: "Add tag"
};

export const RulesPage = () => {
  const rules = useRulesV2();
  const categories = useCategories();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Rule | null>(null);
  const [form, setForm] = useState<RuleRequest>({
    name: "",
    isActive: true,
    priority: 100,
    conditionType: 1,
    conditionValue: "",
    amountThreshold: undefined,
    actionType: 2,
    actionValue: ""
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["v2-rules"] });
  };

  const createRule = useMutation({
    mutationFn: rulesV2Service.create,
    onSuccess: () => {
      toast.success("Rule created");
      invalidate();
      setForm({ name: "", isActive: true, priority: 100, conditionType: 1, conditionValue: "", amountThreshold: undefined, actionType: 2, actionValue: "" });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to create rule"))
  });

  const updateRule = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RuleRequest }) => rulesV2Service.update(id, payload),
    onSuccess: () => {
      toast.success("Rule updated");
      invalidate();
      setEditing(null);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to update rule"))
  });

  const deleteRule = useMutation({
    mutationFn: rulesV2Service.remove,
    onSuccess: () => {
      toast.success("Rule deleted");
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to delete rule"))
  });

  const fillForEdit = (rule: Rule) => {
    setEditing(rule);
    setForm({
      name: rule.name,
      isActive: rule.isActive,
      priority: rule.priority,
      conditionType: rule.conditionType,
      conditionValue: rule.conditionValue,
      amountThreshold: rule.amountThreshold,
      actionType: rule.actionType,
      actionValue: rule.actionValue
    });
  };

  return (
    <div className="page-grid">
      <PageHeader title="Rules Engine (V2)" subtitle="Create safe, explainable automation rules triggered on transaction creation." />

      <Card title={editing ? "Edit Rule" : "Create Rule"} subtitle="First version supports one condition and one action per rule">
        <p className="rules-form-hint">Keep rules predictable: start with a narrow condition, then apply one clear action.</p>
        <form className="quick-form rules-create-form" onSubmit={(e) => {
          e.preventDefault();
          if (editing) {
            updateRule.mutate({ id: editing.id, payload: form });
          } else {
            createRule.mutate(form);
          }
        }}>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </label>
          <label>
            Priority
            <input type="number" min={1} max={1000} value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: Number(e.target.value) }))} required />
          </label>
          <label>
            Active
            <select value={form.isActive ? "1" : "0"} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === "1" }))}>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </label>

          <label>
            Condition
            <select value={form.conditionType} onChange={(e) => setForm((p) => ({ ...p, conditionType: Number(e.target.value), conditionValue: "", amountThreshold: undefined }))}>
              <option value={1}>Merchant contains</option>
              <option value={2}>Amount greater than</option>
              <option value={3}>Category equals</option>
            </select>
          </label>

          {form.conditionType === 2 ? (
            <label>
              Amount threshold
              <input type="number" min="0.01" step="0.01" value={form.amountThreshold ?? ""} onChange={(e) => setForm((p) => ({ ...p, amountThreshold: Number(e.target.value) }))} placeholder="e.g. 5000" required />
            </label>
          ) : form.conditionType === 3 ? (
            <label>
              Category
              <select value={form.conditionValue ?? ""} onChange={(e) => setForm((p) => ({ ...p, conditionValue: e.target.value }))} required>
                <option value="">Select category</option>
                {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          ) : (
            <label>
              Merchant text
              <input value={form.conditionValue ?? ""} onChange={(e) => setForm((p) => ({ ...p, conditionValue: e.target.value }))} placeholder="e.g. uber" required />
            </label>
          )}

          <label>
            Action
            <select value={form.actionType} onChange={(e) => setForm((p) => ({ ...p, actionType: Number(e.target.value), actionValue: "" }))}>
              <option value={1}>Set category</option>
              <option value={2}>Create alert</option>
              <option value={3}>Add tag</option>
            </select>
          </label>

          {form.actionType === 1 ? (
            <label className="rules-action-value-field">
              Target category
              <select value={form.actionValue ?? ""} onChange={(e) => setForm((p) => ({ ...p, actionValue: e.target.value }))} required>
                <option value="">Select category</option>
                {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          ) : (
            <label className="rules-action-value-field">
              Action value
              <input value={form.actionValue ?? ""} onChange={(e) => setForm((p) => ({ ...p, actionValue: e.target.value }))} placeholder={form.actionType === 2 ? "Alert message" : "Tag name"} required />
            </label>
          )}

          <button className="primary-btn rules-submit-btn" type="submit" disabled={createRule.isPending || updateRule.isPending}>
            {editing ? (updateRule.isPending ? "Saving..." : "Save Rule") : (createRule.isPending ? "Creating..." : "Create Rule")}
          </button>

          {editing ? (
            <button className="ghost-btn wide" type="button" onClick={() => { setEditing(null); setForm({ name: "", isActive: true, priority: 100, conditionType: 1, conditionValue: "", amountThreshold: undefined, actionType: 2, actionValue: "" }); }}>
              Cancel Edit
            </button>
          ) : null}
        </form>
      </Card>

      <Card title="Rules list" subtitle="Lower priority number executes first">
        {!rules.data?.length ? (
          <EmptyState text="No rules created yet" hint="Create your first rule above to automate categorization, alerts, or tags." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Priority</th><th>Condition</th><th>Action</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {rules.data.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.priority}</td>
                    <td>{conditionLabel[r.conditionType]}{r.conditionType === 2 ? `: ${r.amountThreshold}` : `: ${r.conditionValue ?? "-"}`}</td>
                    <td>{actionLabel[r.actionType]}: {r.actionValue ?? "-"}</td>
                    <td><span className={`chip ${r.isActive ? "chip-income" : "chip-transfer"}`}>{r.isActive ? "Active" : "Inactive"}</span></td>
                    <td>
                      <div className="card-icon-actions">
                        <button className="icon-plain-btn" type="button" onClick={() => fillForEdit(r)} aria-label="Edit rule"><FiEdit2 /></button>
                        <button className="ghost-btn table-inline-btn" type="button" onClick={() => updateRule.mutate({ id: r.id, payload: { ...r, isActive: !r.isActive } })} aria-label="Toggle active">
                          {r.isActive ? "Pause" : "Start"}
                        </button>
                        <button className="icon-plain-btn danger" type="button" onClick={() => deleteRule.mutate(r.id)} aria-label="Delete rule"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editing ? (
        <button className="mobile-fab" type="button" onClick={() => setEditing(null)} aria-label="Close edit">
          <FiX />
        </button>
      ) : null}
    </div>
  );
};
