"use client";

import { Expense } from "@/lib/expense_type";
import { useQuery } from "@tanstack/react-query";

export function useFlagExpense(expense: Expense) {
  return useQuery({
    queryKey: ["flag-expense", expense.id],
    queryFn: async () => {
      const res = await fetch("/api/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expense }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to flag expense");
      }
      return (await res.json()) as { flag: "Suspicious" | "Normal"; reason?: string };
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
