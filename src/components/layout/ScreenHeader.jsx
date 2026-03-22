import { UI_TEXT_MUTED, UI_TITLE } from '../../styles/ui'

export default function ScreenHeader({ title, subtitle }) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className={UI_TITLE}>{title}</h1>
      {subtitle ? <p className={UI_TEXT_MUTED}>{subtitle}</p> : null}
    </header>
  )
}