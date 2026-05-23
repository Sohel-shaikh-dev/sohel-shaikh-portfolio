import { getSiteSettings } from './actions'
import { SettingsForm } from './SettingsForm'

export const metadata = {
  title: 'Settings | Admin Portfolio',
}

export default async function SettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold mb-2 text-white">Global Settings</h1>
        <p className="text-gray-400">Manage your portfolio stats, resume, and default data.</p>
      </div>

      <SettingsForm initialData={settings} />
    </div>
  )
}
