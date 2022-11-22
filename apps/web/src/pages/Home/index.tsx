import { Box, HStack } from "@chakra-ui/react"
import React from "react"
import { ContractControl } from "~/features/contract/ContractControl"
import { ControlCenter } from "~/features/contract/ControlCenter"
import { MainContainer } from "~/views/MainContainer"

export const Home: React.FC = () => {
  return (
    <MainContainer>
      <Box overflow="auto" mt={8}>
        <ControlCenter />
      </Box>
    </MainContainer>
  )
}
