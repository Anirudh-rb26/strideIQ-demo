"use client"

import * as React from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Expense } from "@/lib/expense_type"


export function UploadCSV({ onData }: { onData: (rows: Expense[]) => void }) {
    const [loading, setLoading] = React.useState(false)

    const handleFile = async (file: File) => {
        setLoading(true)
        try {
            const text = await file.text()
            const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
            const rows: Expense[] = (parsed.data || []).map((r, i) => toExpense(r, i)).filter((e): e is Expense => Boolean(e))
            onData(rows)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex w-full items-center gap-3">
            <Input
                type="file"
                accept=".csv,text/csv"
                className="border-black/20"
                onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void handleFile(f)
                }}
                aria-label="Upload CSV file"
            />
            <Button
                variant="outline"
                className="border-[#FF6B10] text-[#FF6B10] bg-transparent"
                type="button"
                onClick={() => {
                    const sample = getSampleCSV()
                    const parsed = Papa.parse<Record<string, string>>(sample, { header: true, skipEmptyLines: true })
                    const rows: Expense[] = (parsed.data || [])
                        .map((r, i) => toExpense(r, i))
                        .filter((e): e is Expense => Boolean(e))
                    onData(rows)
                }}
            >
                Load Sample
            </Button>
            {loading && <span className="text-sm text-[#6B7280]">Parsing...</span>}
        </div>
    )
}

function toExpense(r: Record<string, string>, i: number): Expense | null {
    const date = (r["Date"] || r["date"] || "").trim()
    const merchant = (r["Merchant"] || r["merchant"] || "").trim()
    const category = (r["Category"] || r["category"] || "Uncategorized").trim()
    const description = (r["Description"] || r["description"] || "").trim()
    const amtStr = (r["Amount"] || r["amount"] || "").replace(/[$,]/g, "").trim()
    const amount = Number.parseFloat(amtStr)

    if (!date || !merchant || !Number.isFinite(amount)) {
        return null
    }

    return {
        id: `${i}-${merchant}-${date}-${amount}`,
        date: new Date(date).toISOString(),
        merchant,
        category: category || "Uncategorized",
        amount,
        description,
    }
}

function getSampleCSV() {
    return `Date,Merchant,Category,Amount,Description
2025-08-01,Acme Flights,Travel,524.32,NYC client visit
2025-08-02,Urban Eats,Meals,34.80,Lunch with client
2025-08-04,Hotel Plaza,Lodging,612.15,2 nights stay
2025-08-05,Office Depot,Office Supplies,89.44,Printer ink and paper
2025-08-06,Prime Rides,Transport,44.10,Ride to airport
2025-08-07,Local Bar,Entertainment,120.00,Team celebration
`
}
