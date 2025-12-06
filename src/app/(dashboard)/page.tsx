import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeedPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">The Feed</h1>
        <span className="text-sm text-muted-foreground">Proactive Intelligence</span>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <p>AI analysis suggests updating your SWOT based on new competitor data.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>New Leads Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The Hunter found 5 new high-quality leads in Milan matching your criteria.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
