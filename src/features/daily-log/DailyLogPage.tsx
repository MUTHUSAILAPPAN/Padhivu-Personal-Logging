import { BookOpen, ArrowLeft } from 'lucide-react';
import { ComingSoonState, PageHeader } from '../../components/ui/PageState';


export default function DailyLogPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Future area"
        title="Daily Log"
        description="Daily Log will capture day-by-day reflections, quick notes, and simple routine tracking inside the workbook."
      />

      <ComingSoonState
        icon={BookOpen}
        title="Daily Log is coming soon"
        description="This section will support concise daily entries, lightweight reflection prompts, and a clean workbook timeline for each day."
        primaryAction={{ label: 'Back to dashboard', to: '/app', icon: ArrowLeft }}
      />
    </div>
  );
}
