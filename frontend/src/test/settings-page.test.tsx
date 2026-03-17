import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPage } from "pages/SettingsPage";

const createMutate = vi.fn();
const invalidateQueries = vi.fn();
const logout = vi.fn();

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock("store/authStore", () => ({
  useAuthStore: (selector: (state: { logout: () => void }) => unknown) => selector({ logout })
}));

vi.mock("hooks/useFinanceQueries", () => ({
  useCategories: () => ({ data: [] })
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");

  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries }),
    useMutation: () => ({ mutate: createMutate, isPending: false })
  };
});

describe("SettingsPage", () => {
  beforeEach(() => {
    createMutate.mockReset();
  });

  it("calls category create mutation when Add Category is clicked", () => {
    render(<SettingsPage />);

    fireEvent.change(screen.getByPlaceholderText("Category name"), { target: { value: "Snacks" } });
    fireEvent.change(screen.getByDisplayValue("#2563EB"), { target: { value: "#222222" } });
    fireEvent.change(screen.getByDisplayValue("tag"), { target: { value: "food" } });

    fireEvent.click(screen.getByRole("button", { name: "Add Category" }));

    expect(createMutate).toHaveBeenCalledTimes(1);
    expect(createMutate).toHaveBeenCalledWith({
      name: "Snacks",
      type: 1,
      colorHex: "#222222",
      icon: "food"
    });
  });
});
