"use client"

import { useMemo, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UploadCSV } from "@/components/upload-csv"
import { CategoryChart } from "@/components/category-chart"
import { ExpenseTable } from "@/components/expense-table"
import { Expense } from "@/lib/expense_type"
import { cn } from "@/lib/utils"

export default function Page() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all")

  // TanStack Query client (scoped to page)
  const [queryClient] = useState(() => new QueryClient())

  const totalSpend = useMemo(
    () => expenses.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0),
    [expenses],
  )

  // Cashback tracker: 1.5%
  const cashbackRate = 0.015
  const cashbackAccrued = useMemo(() => totalSpend * cashbackRate, [totalSpend])

  const categories = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) {
      const key = e.category || "Uncategorized"
      map.set(key, (map.get(key) || 0) + (Number.isFinite(e.amount) ? e.amount : 0))
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [expenses])

  const filteredExpenses = useMemo(() => {
    const q = search.trim().toLowerCase()
    return expenses
      .filter((e) => (categoryFilter === "all" ? true : e.category === categoryFilter))
      .filter((e) => {
        if (!q) return true
        return (
          e.merchant.toLowerCase().includes(q) ||
          (e.description || "").toLowerCase().includes(q) ||
          (e.category || "").toLowerCase().includes(q)
        )
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [expenses, categoryFilter, search])

  const distinctCategories = useMemo(() => {
    const set = new Set(expenses.map((e) => e.category || "Uncategorized"))
    return Array.from(set.values()).sort()
  }, [expenses])

  return (
    <QueryClientProvider client={queryClient}>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 text-black">
        <header className="mb-6 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className={cn("text-pretty text-2xl font-semibold")}>Real-time Expense Management</h1>
        </header>

        {/* Upload */}
        <section className="mb-6">
          <Card className="border-black/10">
            <CardHeader>
              <CardTitle className="text-lg">Upload Expenses CSV</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <UploadCSV onData={(rows) => setExpenses(rows)} />
              <p className="text-sm text-[#6B7280]">
                Expected columns: Date, Merchant, Category, Amount, Description (optional).
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Metrics */}
        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-black/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#6B7280]">Total Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">${totalSpend.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="border-black/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#6B7280]">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{expenses.length}</div>
            </CardContent>
          </Card>

          <Card className="border-black/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#6B7280]">Cashback Accrued</CardTitle>
            </CardHeader>
            <CardContent className="flex items-baseline gap-2">
              <div className="text-2xl font-semibold">${cashbackAccrued.toFixed(2)}</div>
              <Badge variant="outline" className="border-[#FF6B10] text-[#FF6B10]">
                1.5%
              </Badge>
            </CardContent>
          </Card>
        </section>

        {/* Chart + Filters */}
        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-black/10 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryChart data={categories} />
            </CardContent>
          </Card>

          <Card className="border-black/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input
                placeholder="Search merchant, description, category"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-black/20 focus-visible:ring-[#FF6B10]"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant={categoryFilter === "all" ? "default" : "outline"}
                  className={cn(
                    categoryFilter === "all" ? "bg-[#FF6B10] hover:bg-[#FF6B10] text-white" : "border-black/20",
                  )}
                  onClick={() => setCategoryFilter("all")}
                >
                  All
                </Button>
                {distinctCategories.map((c) => (
                  <Button
                    key={c}
                    size="sm"
                    variant={categoryFilter === c ? "default" : "outline"}
                    className={cn(
                      categoryFilter === c ? "bg-[#FF6B10] hover:bg-[#FF6B10] text-white" : "border-black/20",
                    )}
                    onClick={() => setCategoryFilter(c)}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Table */}
        <section className="mb-10">
          <Card className="border-black/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseTable expenses={filteredExpenses} />
            </CardContent>
          </Card>
        </section>
      </main>
    </QueryClientProvider>
  )
}
