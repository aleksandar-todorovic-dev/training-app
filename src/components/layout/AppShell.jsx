import { UI_CONTAINER, UI_PAGE } from '../../styles/ui'

export default function AppShell({ children }) {
  return (
    <main className={UI_PAGE}>
      <div className={UI_CONTAINER}>{children}</div>
    </main>
  )
}