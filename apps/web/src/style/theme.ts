import { extendTheme } from "@chakra-ui/react"

export const theme = extendTheme({
  fonts: {
    heading: "Abel, sans-serif",
    body: "Abel, sans-serif",
  },
  initialColorMode: "dark",
  components: {
    FormLabel: {
      baseStyle: {
        color: "gray.400",
        mb: 1,
      },
    },
  },
})

export default theme
