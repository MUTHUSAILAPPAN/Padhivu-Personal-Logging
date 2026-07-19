import { Heart, ArrowLeft } from 'lucide-react';
import { ComingSoonState, PageHeader } from '../../components/ui/PageState';


export default function MemoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Future area"
        title="Memories"
        description="Memories will support saved moments, gratitude notes, and longer-form reflections that stay inside your workbook."
      />

      <ComingSoonState
        icon={Heart}
        title="Memories is coming soon"
        description="This space will support personal highlights, reflective notes, and simple memory organization without leaving the local workbook."
        primaryAction={{ label: 'Back to dashboard', to: '/app', icon: ArrowLeft }}
      />
    </div>
  );
}
