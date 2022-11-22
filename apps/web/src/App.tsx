import { useColorMode } from "@chakra-ui/system"
import { Suspense, useEffect } from "react"
import { BrowserRouter } from "react-router-dom"
import RouterNavigation from "./features/navigation"
import "./style/main.css"

const App = (): JSX.Element => {
  const { setColorMode } = useColorMode()
  useEffect(() => setColorMode("dark"), [setColorMode])

  return (
    <BrowserRouter>
      <RouterNavigation />
    </BrowserRouter>
  )
}

export default App
