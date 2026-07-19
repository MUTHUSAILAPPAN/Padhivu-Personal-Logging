import { Settings, ArrowLeft } from 'lucide-react';
import { ComingSoonState, PageHeader } from '../../components/ui/PageState';


export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Future area"
        title="Settings"
        description="Settings will let you tune workbook preferences and local behavior without introducing a server or account layer."
      />

      <ComingSoonState
        icon={Settings}
        title="Settings is coming soon"
        description="This area will handle workbook preferences, local privacy controls, and app behavior that stays on-device."
        primaryAction={{ label: 'Back to dashboard', to: '/app', icon: ArrowLeft }}
      />
    </div>
  );
}
