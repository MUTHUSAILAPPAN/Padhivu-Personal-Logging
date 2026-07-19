import { BarChart3, ArrowLeft } from 'lucide-react';
import { ComingSoonState, PageHeader } from '../../components/ui/PageState';


export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Future area"
        title="Insights"
        description="Insights will surface patterns, summaries, and trend views from workbook data once reporting is added."
      />

      <ComingSoonState
        icon={BarChart3}
        title="Insights is coming soon"
        description="This section will support workbook-based trends, comparisons, and visual summaries of your logged activity."
        primaryAction={{ label: 'Back to dashboard', to: '/app', icon: ArrowLeft }}
      />
    </div>
  );
}
