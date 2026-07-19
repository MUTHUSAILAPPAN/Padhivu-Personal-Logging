import { FolderOpen, ArrowLeft } from 'lucide-react';
import { ComingSoonState, PageHeader } from '../../components/ui/PageState';


export default function CollectionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Future area"
        title="Collections"
        description="Collections will organize curated lists like books, films, routines, and other workbook-backed catalogues."
      />

      <ComingSoonState
        icon={FolderOpen}
        title="Collections is coming soon"
        description="This section will group custom lists into tidy workbook collections with simple organization for later browsing."
        primaryAction={{ label: 'Back to dashboard', to: '/app', icon: ArrowLeft }}
      />
    </div>
  );
}
