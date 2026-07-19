import { FileSpreadsheet, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const reports = [
  {
    title: 'Attendance Report',
    description: 'Daily and period attendance with status and hours.',
  },
  {
    title: 'Leave Report',
    description: 'Approved, rejected, and pending leave summaries.',
  },
  {
    title: 'Geo Fence Report',
    description: 'Exit / return events and distance from plant fence.',
  },
  {
    title: 'Worker Report',
    description: 'Worker roster, plant assignment, and activity.',
  },
  {
    title: 'Monthly Report',
    description: 'Month-end attendance rollup by plant.',
  },
]

export function AdminReportsPage() {
  const onExport = (format: 'excel' | 'pdf', title: string) => {
    toast.message(`${format.toUpperCase()} export prepared`, {
      description: `${title} — wire this button to your reporting Edge Function when ready.`,
    })
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate and export workforce reports."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.title}>
            <CardHeader>
              <CardTitle className="text-base">{r.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{r.description}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExport('excel', r.title)}
                >
                  <FileSpreadsheet className="h-4 w-4" /> Excel
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExport('pdf', r.title)}
                >
                  <FileText className="h-4 w-4" /> PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
