import { Route, Routes } from "react-router"
import { Home } from "~/pages/Home"
import { useRouterNavigation } from "./hooks"

const RouterNavigation = () => {
  const { $ } = useRouterNavigation()

  return (
    <Routes>
      <Route path={$.paths.home} element={<Home />} />
    </Routes>
  )
}

export default RouterNavigation
