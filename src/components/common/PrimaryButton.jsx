import { Link } from 'react-router-dom'
import { UI_BUTTON_PRIMARY } from '../../styles/ui'

export default function PrimaryButton({ to, children }) {
  return (
    <Link to={to} className={UI_BUTTON_PRIMARY}>
      {children}
    </Link>
  )
}