"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { useFlagExpense } from "@/hooks/use-flag-expense"
import { Expense } from "@/lib/expense_type"

export function ExpenseTable({ expenses }: { expenses: Expense[] }) {
    const rows = useMemo(() => expenses.slice(0, 500), [expenses]) // cap for safety

    return (
        <div className="max-h-[520px] overflow-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b border-black/10">
                        <th className="py-2 text-left font-medium">Date</th>
                        <th className="py-2 text-left font-medium">Merchant</th>
                        <th className="py-2 text-left font-medium">Category</th>
                        <th className="py-2 text-right font-medium">Amount</th>
                        <th className="py-2 text-left font-medium">Description</th>
                        <th className="py-2 text-left font-medium">Compliance</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((e) => (
                        <ExpenseRow key={e.id} expense={e} />
                    ))}
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={6} className="py-6 text-center text-[#6B7280]">
                                Upload a CSV to see transactions.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

function ExpenseRow({ expense }: { expense: Expense }) {
    const { data, isLoading, isError } = useFlagExpense(expense)

    const isSuspicious = data?.flag === "Suspicious"

    return (
        <tr
            className={["border-b border-black/10", isSuspicious ? "bg-white" : ""].join(" ")}
            style={isSuspicious ? { boxShadow: "inset 4px 0 0 0 #FF6B10" } : undefined}
            aria-live="polite"
        >
            <td className="py-2 align-top">{new Date(expense.date).toLocaleDateString()}</td>
            <td className="py-2 align-top">{expense.merchant}</td>
            <td className="py-2 align-top">{expense.category || "Uncategorized"}</td>
            <td className="py-2 align-top text-right">${expense.amount.toFixed(2)}</td>
            <td className="py-2 align-top">{expense.description || "-"}</td>
            <td className="py-2 align-top">
                {isLoading && (
                    <Badge variant="outline" className="border-black/20 text-[#6B7280]">
                        Checking...
                    </Badge>
                )}
                {isError && (
                    <Badge variant="destructive" className="bg-black text-white">
                        Error
                    </Badge>
                )}
                {!isLoading && !isError && data?.flag === "Suspicious" && (
                    <Badge className="bg-[#FF6B10] hover:bg-[#FF6B10] text-white" title={data?.reason || "Suspicious expense"}>
                        Suspicious
                    </Badge>
                )}
                {!isLoading && !isError && data?.flag === "Normal" && (
                    <Badge variant="outline" className="border-black/20 text-black" title={data?.reason || "Normal expense"}>
                        Normal
                    </Badge>
                )}
            </td>
        </tr>
    )
}
