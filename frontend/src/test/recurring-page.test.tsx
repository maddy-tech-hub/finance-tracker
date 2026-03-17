import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecurringPage } from "pages/RecurringPage";

const createMutate = vi.fn();
const invalidateQueries = vi.fn();

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock("hooks/useFinanceQueries", () => ({
  useRecurring: () => ({ isLoading: false, data: [] }),
  useAccounts: () => ({
    data: [
      { id: "acc-1", name: "Axis", type: 1, currency: "INR", balance: 1000, isArchived: false },
      { id: "acc-2", name: "HDFC", type: 1, currency: "INR", balance: 1000, isArchived: false }
    ]
  }),
  useCategories: () => ({ data: [{ id: "cat-1", name: "Rent", type: 2, colorHex: "#fff", icon: "tag", isDefault: false }] })
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");

  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries }),
    useMutation: () => ({ mutate: createMutate, isPending: false })
  };
});

describe("RecurringPage", () => {
  beforeEach(() => {
    createMutate.mockReset();
    invalidateQueries.mockReset();
  });

  it("submits recurring payload with required startDate for expense", () => {
    const { container } = render(<RecurringPage />);

    fireEvent.change(screen.getByPlaceholderText("Amount"), { target: { value: "999" } });
    const nextRunDateInput = container.querySelector("input[name='nextRunDate']") as HTMLInputElement;
    fireEvent.change(nextRunDateInput, { target: { value: "2026-03-25" } });
    fireEvent.change(screen.getByPlaceholderText("Label (e.g., Netflix, Rent)"), { target: { value: "Prime Video" } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(createMutate).toHaveBeenCalledTimes(1);
    expect(createMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "acc-1",
        categoryId: "cat-1",
        type: 2,
        amount: 999,
        startDate: "2026-03-25",
        nextRunDate: "2026-03-25",
        note: "Prime Video"
      })
    );
  });

  it("switches to transfer mode and sends destinationAccountId instead of categoryId", () => {
    const { container } = render(<RecurringPage />);

    const typeSelect = container.querySelector("select[name='type']") as HTMLSelectElement;
    fireEvent.change(typeSelect, { target: { value: "3" } });

    const destinationSelect = container.querySelector("select[name='destinationAccountId']") as HTMLSelectElement;
    fireEvent.change(destinationSelect, { target: { value: "acc-2" } });

    fireEvent.change(screen.getByPlaceholderText("Amount"), { target: { value: "500" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(createMutate).toHaveBeenCalledTimes(1);
    expect(createMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 3,
        destinationAccountId: "acc-2",
        categoryId: undefined
      })
    );
  });
});
