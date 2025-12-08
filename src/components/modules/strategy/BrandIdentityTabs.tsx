'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompanyInfoForm } from "./CompanyInfoForm"
import { BrandKitForm } from "./BrandKitForm"
import { BrandAnalysisForm } from "./BrandAnalysisForm"
import { BrandDNAView } from "./BrandDNAView"
import { ProductMatrixView } from "./ProductMatrixView"
import { TargetAudienceView } from "./TargetAudienceView"
import { MarketContextView } from "./MarketContextView"
import { CompetitorsView } from "./CompetitorsView"
import { MarketingAssetsView } from "./MarketingAssetsView"
import { Database } from "@/lib/supabase/types"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

interface BrandIdentityTabsProps {
  initialData: BrandIdentity | null;
}

export function BrandIdentityTabs({ initialData }: BrandIdentityTabsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Column: Forms/Views (2/3) */}
      <div className="lg:col-span-2 overflow-auto pr-2">
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-4 h-auto flex-wrap">
            <TabsTrigger value="company">Azienda</TabsTrigger>
            <TabsTrigger value="brandkit">Brand Kit</TabsTrigger>
            <TabsTrigger value="dna">DNA</TabsTrigger>
            <TabsTrigger value="product">Prodotto</TabsTrigger>
            <TabsTrigger value="target">Target</TabsTrigger>
            <TabsTrigger value="market">Mercato</TabsTrigger>
            <TabsTrigger value="competitors">Competitor</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="company">
            <CompanyInfoForm initialData={initialData} />
          </TabsContent>
          
          <TabsContent value="brandkit">
            <BrandKitForm initialData={initialData} />
          </TabsContent>
          
          <TabsContent value="dna">
            <BrandDNAView data={initialData} />
          </TabsContent>
          
          <TabsContent value="product">
            <ProductMatrixView data={initialData} />
          </TabsContent>

          <TabsContent value="target">
            <TargetAudienceView data={initialData} />
          </TabsContent>
          
          <TabsContent value="market">
            <MarketContextView data={initialData} />
          </TabsContent>
          
          <TabsContent value="competitors">
            <CompetitorsView data={initialData} />
          </TabsContent>
          
          <TabsContent value="assets">
            <MarketingAssetsView data={initialData} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Column: AI Analyst (1/3) */}
      <div className="lg:col-span-1 h-full">
        <BrandAnalysisForm />
      </div>
    </div>
  )
}
