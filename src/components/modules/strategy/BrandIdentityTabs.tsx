'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompanyInfoForm } from "./CompanyInfoForm"
import { BrandKitForm } from "./BrandKitForm"
import { BrandAnalystChat } from "./BrandAnalystChat"

export function BrandIdentityTabs({ initialData }: { initialData: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Column: Forms (2/3) */}
      <div className="lg:col-span-2 overflow-auto pr-2">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-4">
            <TabsTrigger value="company">Azienda</TabsTrigger>
            <TabsTrigger value="brandkit">Brand Kit</TabsTrigger>
            <TabsTrigger value="tone">Tono</TabsTrigger>
            <TabsTrigger value="swot">SWOT</TabsTrigger>
            <TabsTrigger value="market">Mercato</TabsTrigger>
            <TabsTrigger value="competitors">Competitor</TabsTrigger>
            <TabsTrigger value="target">Target</TabsTrigger>
          </TabsList>
          
          <TabsContent value="company">
            <CompanyInfoForm initialData={initialData} />
          </TabsContent>
          
          <TabsContent value="brandkit">
            <BrandKitForm initialData={initialData} />
          </TabsContent>
          
          <TabsContent value="tone">
            <p className="text-muted-foreground p-4 border rounded bg-muted/10">
              Il modulo Tono di Voce sarà compilato automaticamente dall'Analista AI.
            </p>
          </TabsContent>
          
          <TabsContent value="swot">
            <p className="text-muted-foreground p-4 border rounded bg-muted/10">
              L'analisi SWOT verrà generata automaticamente dopo l'analisi del sito web.
            </p>
          </TabsContent>
          
          <TabsContent value="market">
            <p className="text-muted-foreground p-4 border rounded bg-muted/10">
              La ricerca di mercato è in fase di sviluppo.
            </p>
          </TabsContent>
          
          <TabsContent value="competitors">
            <p className="text-muted-foreground p-4 border rounded bg-muted/10">
              L'analisi dei competitor verrà attivata dall'AI.
            </p>
          </TabsContent>
          
          <TabsContent value="target">
            <p className="text-muted-foreground p-4 border rounded bg-muted/10">
              La definizione del Target Audience sarà estratta dai dati analizzati.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Column: AI Analyst (1/3) */}
      <div className="lg:col-span-1 h-full">
        <BrandAnalystChat />
      </div>
    </div>
  )
}
