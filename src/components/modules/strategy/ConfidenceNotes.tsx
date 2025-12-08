'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ConfidenceNote {
  field: string
  confidence: 'low' | 'medium' | 'high'
  source: string
  note: string
}

interface ConfidenceNotesProps {
  notes: ConfidenceNote[]
}

export function ConfidenceNotes({ notes }: ConfidenceNotesProps) {
  if (!notes || notes.length === 0) return null

  const getBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
      case 'low': return 'bg-red-100 text-red-800 hover:bg-red-100'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'Alta Confidenza'
      case 'medium': return 'Media Confidenza'
      case 'low': return 'Bassa Confidenza'
      default: return 'Confidenza'
    }
  }

  return (
    <Card className="border-l-4 border-l-blue-500 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-500" />
          Note di Confidenza & Trasparenza
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {notes.map((note, idx) => (
          <div key={idx} className="flex items-start justify-between text-sm p-2 rounded-md bg-muted/30">
            <div className="space-y-1">
              <div className="font-medium capitalize text-foreground/90">
                {(note.field || 'Generale').replace(/_/g, ' ')}
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {note.note}
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className={`ml-2 whitespace-nowrap ${getBadgeColor(note.confidence)}`}>
                    {getConfidenceLabel(note.confidence)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fonte: {note.source}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

