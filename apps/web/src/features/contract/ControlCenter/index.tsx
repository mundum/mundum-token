import { Flex, Heading, Stack, StackDivider } from "@chakra-ui/react"
import * as React from "react"
import { ContractControl } from "../ContractControl"

export const ControlCenter: React.FC = () => {
  return (
    <Stack spacing={8} mx={"auto"} maxW={"5xl"} py={12} px={6}>
      <Stack align={"center"} spacing={10}>
        <Heading fontSize={"4xl"}>Mundum Test Center</Heading>
        <Stack
          direction={["column", "row"]}
          spacing={10}
          divider={<StackDivider color="gray.200" />}
          align="start"
        >
          <Stack>
            <Heading fontSize="2xl">Vesting Contract</Heading>
            <ContractControl />
          </Stack>
          {/* <Stack align={"center"}>
            <Heading fontSize="2xl">Payloads</Heading>
            Details
          </Stack> */}
        </Stack>
      </Stack>
    </Stack>
  )
}
