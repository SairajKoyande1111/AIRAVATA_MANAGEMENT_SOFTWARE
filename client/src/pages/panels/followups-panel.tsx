import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FollowupsPanel() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Follow-ups</h1>
        <p className="text-muted-foreground">Schedule and manage client follow-ups</p>
      </div>
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Follow-ups feature coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
