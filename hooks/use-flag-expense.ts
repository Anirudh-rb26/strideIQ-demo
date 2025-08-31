"use client";

import { Expense } from "@/lib/expense_type";
import { useQuery } from "@tanstack/react-query";

// Helper function to chunk array into batches
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function useFlagExpense(expenses: Expense[]) {
  return useQuery({
    queryKey: [
      "flag-expense",
      expenses
        .map((e) => e.id)
        .sort()
        .join(","),
    ],
    queryFn: async () => {
      if (expenses.length === 0) return {};

      const batches = chunkArray(expenses, 25);
      const allResults: Record<string, { flag: "Suspicious" | "Normal"; reason?: string }> = {};

      // Process each batch sequentially
      for (const batch of batches) {
        const res = await fetch("/api/flag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expenses: batch }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || "Failed to flag expense");
        }

        const batchResults = (await res.json()) as Record<
          string,
          { flag: "Suspicious" | "Normal"; reason?: string }
        >;
        Object.assign(allResults, batchResults);
      }

      return allResults;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: expenses.length > 0,
  });
}
