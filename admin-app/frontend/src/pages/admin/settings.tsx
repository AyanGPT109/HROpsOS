import { useTheme } from 'next-themes'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function AdminSettingsPage() {
  const { theme, setTheme } = useTheme()
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Preferences and account controls." />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <Button
              key={t}
              variant={theme === t ? 'default' : 'outline'}
              onClick={() => setTheme(t)}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/auth/force-change-password')}>
            Change password
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await logout()
              toast.success('Signed out')
              navigate('/login')
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
