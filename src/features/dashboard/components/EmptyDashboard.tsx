import { FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { WorkbookEmptyState } from '../../../components/ui/PageState';

export default function EmptyDashboard() {
  return (
    <WorkbookEmptyState
      icon={FileSpreadsheet}
      title="No workbook loaded"
      description="Padhivu uses a local Excel workbook as the source of truth. Import a workbook on the landing page to view your personal dashboard."
      primaryAction={{ label: 'Return to import page', to: '/', icon: ArrowLeft }}
    />
  );
}