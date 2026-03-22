import { Link } from 'react-router-dom'
import { UI_BUTTON_SECONDARY } from '../../styles/ui'

export default function SecondaryButton({ to, children }) {
  return (
    <Link to={to} className={UI_BUTTON_SECONDARY}>
      {children}
    </Link>
  )
}