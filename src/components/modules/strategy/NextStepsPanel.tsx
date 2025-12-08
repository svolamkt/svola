'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ArrowRight, Target, Zap, Search } from "lucide-react"

interface NextStep {
  priority: number
  category: 'clarity' | 'differentiation' | 'optimization' | string
  action: string
  reason: string
  impact?: 'high' | 'medium' | 'low'
  effort?: 'high' | 'medium' | 'low'
}

interface NextStepsPanelProps {
  steps: NextStep[]
}

export function NextStepsPanel({ steps }: NextStepsPanelProps) {
  if (!steps || steps.length === 0) return null

  const sortedSteps = [...steps].sort((a, b) => a.priority - b.priority)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clarity': return <Search className="h-4 w-4 text-blue-500" />
      case 'differentiation': return <Target className="h-4 w-4 text-purple-500" />
      case 'optimization': return <Zap className="h-4 w-4 text-yellow-500" />
      default: return <ArrowRight className="h-4 w-4 text-gray-500" />
    }
  }

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <Card className="shadow-md border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Prossimi Passi Operativi
        </CardTitle>
        <CardDescription>
          Azioni raccomandate per migliorare la strategia del tuo brand
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedSteps.map((step, idx) => (
          <div 
            key={idx} 
            className="group relative flex flex-col gap-2 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                  {step.priority}
                </span>
                {step.action}
              </div>
              <Badge variant="outline" className="capitalize flex items-center gap-1">
                {getCategoryIcon(step.category)}
                {step.category}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground pl-8">
              {step.reason}
            </p>

            {step.impact && (
              <div className="flex items-center gap-2 pl-8 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getImpactColor(step.impact)}`}>
                  Impact: {step.impact}
                </span>
                {step.effort && (
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Effort: {step.effort}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

