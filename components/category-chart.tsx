"use client"

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"

export function CategoryChart({
    data,
}: {
    data: { name: string; value: number }[]
}) {
    const sorted = [...data].sort((a, b) => b.value - a.value)
    const colors = (idx: number) => {
        if (idx === 0) return "#FF6B10" // highlight
        return idx % 2 === 0 ? "#000000" : "#6B7280" // black/gray alternation
    }

    return (
        <div className="h-72 w-full">
            <ResponsiveContainer>
                <PieChart>
                    <Pie data={sorted} dataKey="value" nameKey="name" outerRadius={100} innerRadius={50} stroke="#ffffff">
                        {sorted.map((_, i) => (
                            <Cell key={i} fill={colors(i)} />
                        ))}
                    </Pie>
                    <Tooltip
                        wrapperClassName="bg-red-500"
                        wrapperStyle={{ border: "1px solid rgba(0,0,0,0.1)" }}
                        formatter={(value: any, name: any) => [`$${Number(value).toFixed(2)}`, name]}
                    />
                </PieChart>
            </ResponsiveContainer>
            {/* <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {sorted.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                        <span
                            aria-hidden
                            className="inline-block h-3 w-3 rounded-sm"
                            style={{ backgroundColor: i === 0 ? "#FF6B10" : i % 2 === 0 ? "#000000" : "#6B7280" }}
                        />
                        <span className="truncate">{d.name}</span>
                        <span className="ml-auto font-medium">${d.value.toFixed(2)}</span>
                    </div>
                ))}
            </div> */}
        </div>
    )
}
