"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Info } from "lucide-react"
import { searchByCondition, getAvailableConditions } from "@/lib/condition-search"

export function MedicineConditionSearch() {
  const [condition, setCondition] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [searched, setSearched] = useState(false)

  const handleSearch = () => {
    const searchResults = searchByCondition(condition)
    setResults(searchResults)
    setSearched(true)
  }

  const handleSelectCondition = (cond: string) => {
    setCondition(cond)
    const searchResults = searchByCondition(cond)
    setResults(searchResults)
    setSearched(true)
  }

  const availableConditions = getAvailableConditions()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Medicines by Condition
          </CardTitle>
          <CardDescription>Search common conditions to learn about treatment options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a condition (e.g., hypertension, diabetes, asthma)..."
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Search Results</TabsTrigger>
          <TabsTrigger value="common">Common Conditions</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          {searched ? (
            results.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Found {results.length} treatment options for <strong>{condition}</strong>
                </p>
                {results.map((result, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{result.medicine}</h3>
                        <p className="text-sm text-muted-foreground">
                          <strong>Dosage:</strong> {result.dosage}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{result.indication}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4 text-center">
                <p className="text-muted-foreground">No results found for "{condition}"</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try searching for conditions like: {availableConditions.slice(0, 3).join(", ")}
                </p>
              </Card>
            )
          ) : (
            <Card className="p-4 text-center">
              <p className="text-muted-foreground">Enter a condition to search for treatment options</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="common" className="space-y-3">
          <p className="text-sm text-muted-foreground mb-3">Click a condition to view treatment options:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableConditions.map((cond) => (
              <Button
                key={cond}
                variant={condition.toLowerCase() === cond.toLowerCase() ? "default" : "outline"}
                onClick={() => handleSelectCondition(cond)}
                className="text-left justify-start"
              >
                {cond.charAt(0).toUpperCase() + cond.slice(1)}
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm">Educational Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-900">
          <p>
            This search is for informational purposes only. Always consult with your healthcare provider before starting
            any new medication. The information provided is not a substitute for professional medical advice.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
