"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import type { Medicine } from "@/lib/types"
import { calculateAdherence } from "@/lib/adherence-utils"

interface AdherenceAnalyticsProps {
  medicines: Medicine[]
}

export function AdherenceAnalytics({ medicines }: AdherenceAnalyticsProps) {
  const adherence = useMemo(() => calculateAdherence(medicines), [medicines])

  const pieData = [
    { name: "Taken", value: adherence.month },
    { name: "Missed", value: Math.max(0, 100 - adherence.month) },
  ]

  const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))"]

  // Last 14 days for chart
  const chartData = adherence.trends.slice(-14)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Adherence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{adherence.overall}%</div>
            <Progress value={adherence.overall} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{adherence.week}%</div>
            <Progress value={adherence.week} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{adherence.month}%</div>
            <Progress value={adherence.month} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">By Medicine</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Adherence Trends (Last 14 Days)</CardTitle>
              <CardDescription>Your daily medication adherence rate</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="adherenceRate"
                    stroke="hsl(var(--primary))"
                    dot={false}
                    name="Adherence %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Adherence by Medicine (30 Days)</CardTitle>
              <CardDescription>Performance for each medication</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adherence.byMedicine.map((med) => (
                  <div key={med.medicineId}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{med.medicineName}</p>
                      <span className="text-sm font-semibold">{med.adherenceRate}%</span>
                    </div>
                    <Progress value={med.adherenceRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>This Month Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Average</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                    <YAxis style={{ fontSize: "12px" }} />
                    <Tooltip />
                    <Bar dataKey="takenDoses" stackId="a" fill="hsl(var(--primary))" name="Taken" />
                    <Bar dataKey="missedDoses" stackId="a" fill="hsl(var(--destructive))" name="Missed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
