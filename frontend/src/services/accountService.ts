import { api } from "lib/apiClient";
import type { Account, ApiResponse } from "types/api";

export const accountService = {
  list: async () => (await api.get<ApiResponse<Account[]>>("/accounts")).data.data,
  create: async (payload: Omit<Account, "id" | "isArchived">) => (await api.post<ApiResponse<Account>>("/accounts", payload)).data.data,
  update: async (id: string, payload: Omit<Account, "id" | "isArchived">) => (await api.put<ApiResponse<Account>>(`/accounts/${id}`, payload)).data.data,
  transfer: async (payload: { sourceAccountId: string; destinationAccountId: string; amount: number; transferDate: string; note?: string }) =>
    api.post("/accounts/transfer", payload)
};
