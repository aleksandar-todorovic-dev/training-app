import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import PlanOverviewPage from '../pages/PlanOverviewPage'
import CyclePage from '../pages/CyclePage'
import DayPage from '../pages/DayPage'
import ExercisePage from '../pages/ExercisePage'
import CorePage from '../pages/CorePage'
import WarmupPage from '../pages/WarmupPage'
import GuidePage from '../pages/GuidePage'
import EndCyclePage from '../pages/EndCyclePage'
import NotFoundPage from '../pages/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/plan/:planId',
    element: <PlanOverviewPage />,
  },
  {
    path: '/plan/:planId/cycle',
    element: <CyclePage />,
  },
  {
    path: '/plan/:planId/day/:dayId',
    element: <DayPage />,
  },
  {
    path: '/plan/:planId/day/:dayId/exercise/:exerciseId',
    element: <ExercisePage />,
  },
  {
    path: '/plan/:planId/day/:dayId/core/:coreId',
    element: <CorePage />,
  },
  {
    path: '/plan/:planId/day/:dayId/warmup',
    element: <WarmupPage />,
  },
  {
    path: '/plan/:planId/guide',
    element: <GuidePage />,
  },
  {
    path: '/plan/:planId/end-cycle',
    element: <EndCyclePage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}