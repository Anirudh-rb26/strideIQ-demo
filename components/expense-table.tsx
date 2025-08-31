"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { useFlagExpense } from "@/hooks/use-flag-expense"
import { Expense } from "@/lib/expense_type"
import { AlertCircle, CheckCircle2, Clock, X } from "lucide-react"

export function ExpenseTable({ expenses }: { expenses: Expense[] }) {
    const rows = useMemo(() => expenses.slice(0, 500), [expenses]) // cap for safety
    const { data: flagData, isLoading: flagsLoading, isError: flagsError } = useFlagExpense(rows)

    return (
        <div className="">
            <div className="max-h-[520px] overflow-auto">
                <table className="w-full">
                    <thead className="">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Merchant
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.map((e, index) => (
                            <ExpenseRow
                                key={e.id}
                                expense={e}
                                flagData={flagData?.[e.id]}
                                isLoading={flagsLoading}
                                isError={flagsError}
                                isEven={index % 2 === 0}
                            />
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-1">No transactions</h4>
                                        <p className="text-sm text-gray-500">Upload a CSV to see transactions.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function ExpenseRow({
    expense,
    flagData,
    isLoading,
    isError,
    isEven
}: {
    expense: Expense
    flagData?: { flag: "Suspicious" | "Normal"; reason?: string }
    isLoading: boolean
    isError: boolean
    isEven: boolean
}) {
    const isSuspicious = flagData?.flag === "Suspicious"

    return (
        <tr
            className={`
                hover:bg-gray-50 transition-colors duration-150
                ${isSuspicious ? "bg-red-50/50 border-l-4 border-l-red-500" : ""}
                ${isEven ? "bg-gray-50/30" : "bg-white"}
            `}
            aria-live="polite"
        >
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                    {new Date(expense.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric'
                    })}
                </div>
            </td>

            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-3">
                        {expense.merchant.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm font-medium text-gray-900">{expense.merchant}</div>
                </div>
            </td>

            <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {expense.category || "Uncategorized"}
                </span>
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-sm font-semibold text-gray-900">
                    ${expense.amount.toFixed(2)}
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="text-sm text-gray-600 max-w-xs truncate" title={expense.description}>
                    {expense.description || "-"}
                </div>
            </td>

            <td className="px-6 py-4 whitespace-nowrap">
                {isLoading && (
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2 animate-spin" />
                        <Badge variant="outline" className="border-gray-200 text-gray-600 bg-gray-50">
                            Checking...
                        </Badge>
                    </div>
                )}
                {isError && (
                    <div className="flex items-center">
                        <X className="w-4 h-4 text-red-500 mr-2" />
                        <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white">
                            Error
                        </Badge>
                    </div>
                )}
                {!isLoading && !isError && flagData?.flag === "Suspicious" && (
                    <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                        <Badge
                            className="bg-red-500 hover:bg-red-600 text-white cursor-help"
                            title={flagData?.reason || "Suspicious expense"}
                        >
                            Suspicious
                        </Badge>
                    </div>
                )}
                {!isLoading && !isError && flagData?.flag === "Normal" && (
                    <div className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                        <Badge
                            variant="outline"
                            className="border-green-200 text-green-700 bg-green-50 cursor-help"
                            title={flagData?.reason || "Normal expense"}
                        >
                            Normal
                        </Badge>
                    </div>
                )}
            </td>
        </tr>
    )
}