import { ChakraProvider, DarkMode, GlobalStyle } from "@chakra-ui/react"
import "@fontsource/abel/400.css"
import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import { flows } from "./flows"
import { environment } from "./models/environment"
import { Env } from "./models/environment/types"
import theme from "./style/theme"

const mode = import.meta.env.MODE as Env

environment.init({
  mode,
  initFn: () => {
    flows.init()
  },
})

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root"),
)
