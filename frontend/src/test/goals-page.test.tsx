import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoalsPage } from "pages/GoalsPage";

const createMutate = vi.fn();
const contributeMutate = vi.fn();
const invalidateQueries = vi.fn();

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock("hooks/useFinanceQueries", () => ({
  useGoals: () => ({ isLoading: false, data: [] })
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");

  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries }),
    useMutation: vi
      .fn()
      .mockImplementationOnce(() => ({ mutate: createMutate, isPending: false }))
      .mockImplementationOnce(() => ({ mutate: contributeMutate, isPending: false }))
  };
});

describe("GoalsPage", () => {
  beforeEach(() => {
    createMutate.mockReset();
    contributeMutate.mockReset();
    invalidateQueries.mockReset();
  });

  it("submits create goal payload when Save is clicked", () => {
    render(<GoalsPage />);

    fireEvent.change(screen.getByPlaceholderText("Goal name (e.g., Emergency Fund)"), { target: { value: "Trip" } });
    fireEvent.change(screen.getByPlaceholderText("Target amount"), { target: { value: "10000" } });
    fireEvent.change(screen.getByPlaceholderText("Starting amount"), { target: { value: "250" } });

    fireEvent.click(screen.getByRole("button", { name: "Add Goal" }));

    expect(createMutate).toHaveBeenCalledTimes(1);
    expect(createMutate).toHaveBeenCalledWith({
      name: "Trip",
      targetAmount: 10000,
      currentAmount: 250,
      targetDate: undefined
    });
  });
});
