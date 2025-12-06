'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompanyInfoForm } from "./CompanyInfoForm"
import { BrandKitForm } from "./BrandKitForm"

export function BrandIdentityTabs() {
  return (
    <Tabs defaultValue="company" className="w-full">
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="company">Azienda</TabsTrigger>
        <TabsTrigger value="brandkit">Brand Kit</TabsTrigger>
        <TabsTrigger value="tone">Tono di Voce</TabsTrigger>
        <TabsTrigger value="swot">SWOT</TabsTrigger>
        <TabsTrigger value="market">Mercato</TabsTrigger>
        <TabsTrigger value="competitors">Competitor</TabsTrigger>
        <TabsTrigger value="target">Target</TabsTrigger>
      </TabsList>
      
      <TabsContent value="company" className="mt-6">
        <CompanyInfoForm />
      </TabsContent>
      
      <TabsContent value="brandkit" className="mt-6">
        <BrandKitForm />
      </TabsContent>
      
      <TabsContent value="tone" className="mt-6">
        <p className="text-muted-foreground">Tono di Voce - Coming Soon</p>
      </TabsContent>
      
      <TabsContent value="swot" className="mt-6">
        <p className="text-muted-foreground">SWOT Analysis - Coming Soon</p>
      </TabsContent>
      
      <TabsContent value="market" className="mt-6">
        <p className="text-muted-foreground">Ricerca di Mercato - Coming Soon</p>
      </TabsContent>
      
      <TabsContent value="competitors" className="mt-6">
        <p className="text-muted-foreground">Competitor Analysis - Coming Soon</p>
      </TabsContent>
      
      <TabsContent value="target" className="mt-6">
        <p className="text-muted-foreground">Target Audience - Coming Soon</p>
      </TabsContent>
    </Tabs>
  )
}
