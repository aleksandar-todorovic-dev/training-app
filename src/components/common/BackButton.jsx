import { Link } from 'react-router-dom'
import { UI_BUTTON_GHOST } from '../../styles/ui'

export default function BackButton({ to, children = 'Back' }) {
  return (
    <Link to={to} className={UI_BUTTON_GHOST}>
      {children}
    </Link>
  )
}