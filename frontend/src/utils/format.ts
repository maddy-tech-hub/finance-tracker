export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value || 0);

export const formatDate = (value: string) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
