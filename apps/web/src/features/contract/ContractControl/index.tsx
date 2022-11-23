import { BigNumber } from "ethers"
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  HStack,
  Input,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
} from "@chakra-ui/react"
import { option as O } from "fp-ts"
import { pipe } from "fp-ts/lib/function"
import * as React from "react"
import { frmt } from "~/libs/format"
import { Buttons } from "~/widgets/buttons"
import DatePicker from "~/widgets/DatePicker"
import { useContractControl } from "./hooks"
import { AmountInput } from "~/widgets/amount"

export const ContractControl: React.FC = () => {
  const { $, e } = useContractControl()

  return pipe(
    $.contract,
    O.map(() => (
      <>
        <Flex direction="row">
          <Text color="gray.400">Network:</Text>
          <Text color="whiteAlpha.900" marginX="2">
            {pipe(
              $.chainId,
              O.map(chainId =>
                chainId === 1 ? (
                  <Badge backgroundColor="green.500">Mainnet</Badge>
                ) : chainId === 5 ? (
                  <Badge backgroundColor="orange.500">Rinkeby</Badge>
                ) : chainId === 137 ? (
                  <Badge backgroundColor="purple.500">Polygon</Badge>
                ) : chainId === 80001 ? (
                  <Badge backgroundColor="orange.500">Mumbai</Badge>
                ) : (
                  "-"
                ),
              ),
              O.getOrElseW(() => null),
            )}
          </Text>
        </Flex>
        <Flex direction="row">
          <Text color="gray.400">Contract Address:</Text>
          <Box marginX="2">
            {pipe(
              $.contract,
              O.map(contract =>
                pipe(
                  $.chainId,
                  O.map(chainId => (
                    <Tag
                      as="a"
                      href={frmt.explorerAddr(chainId, contract.address)}
                      target="_blank"
                    >
                      {contract.address}
                    </Tag>
                  )),
                  O.getOrElseW(() => "-"),
                ),
              ),
              O.getOrElseW(() => "-"),
            )}
          </Box>
        </Flex>
        <Stack w="xl">
          <Box rounded={"lg"} bg={"gray.700"} boxShadow={"lg"} p={8}>
            <Tabs index={$.tabIndex} onChange={e.onTabChange}>
              <TabList>
                <Tab>Totals</Tab>
                <Tab>Add Claim</Tab>
                <Tab>Claim</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Stack spacing={3}>
                    <FormControl>
                      <FormLabel>Account</FormLabel>
                      <Input
                        value={pipe(
                          $.account,
                          O.getOrElseW(() => ""),
                        )}
                        onChange={event =>
                          e.onAccountChange(event.currentTarget.value)
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>At Date</FormLabel>
                      <DatePicker
                        onChange={date => e.onDateChange(date as Date)}
                        selectedDate={$.date || undefined}
                      />
                    </FormControl>
                    <Button onClick={() => e.onFetchTotalsAt()}>
                      Fetch Totals
                    </Button>
                  </Stack>
                  <Divider my={3} />
                  <Heading size="sm">Totals</Heading>
                  {$.totalsPending ? (
                    <Spinner />
                  ) : (
                    <Stack spacing={2}>
                      <Grid templateColumns="30% 70%">
                        {[
                          "Coins Vested",
                          "Coins Available",
                          "Coins Claimed",
                          "Bonuses Total",
                          "Bonuses Available",
                          "Bonuses Claimed",
                        ].map((label, idx) => (
                          <TotalsItem
                            key={idx}
                            label={label}
                            item={$.totals[idx]}
                          />
                        ))}
                      </Grid>
                    </Stack>
                  )}
                </TabPanel>
                <TabPanel>
                  <Stack spacing={3}>
                    <FormControl>
                      <FormLabel>Account</FormLabel>
                      <Input
                        value={pipe(
                          $.account,
                          O.getOrElseW(() => ""),
                        )}
                        onChange={event =>
                          e.onAccountChange(event.currentTarget.value)
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Amount</FormLabel>
                      <AmountInput
                        amount={$.amount}
                        onChange={value => e.onAmountChange(value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Bonus</FormLabel>
                      <AmountInput
                        amount={$.bonus}
                        onChange={value => e.onBonusChange(value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Start</FormLabel>
                      <DatePicker
                        onChange={date => e.onStartChange(date as Date)}
                        selectedDate={$.start || undefined}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>End</FormLabel>
                      <DatePicker
                        onChange={date => e.onEndChange(date as Date)}
                        selectedDate={$.end || undefined}
                      />
                    </FormControl>
                    <Button onClick={() => e.onAddClaim()}>Add Claim</Button>
                    <Divider my={3} />
                    <Heading size="sm">Tx</Heading>
                    {$.addClaimPending ? (
                      <Spinner />
                    ) : (
                      pipe(
                        $.chainId,
                        O.map(chainId =>
                          pipe(
                            $.tx,
                            O.map(tx => (
                              <Tag
                                as="a"
                                href={frmt.explorer(chainId, tx)}
                                target="_blank"
                              >
                                {tx}
                              </Tag>
                            )),
                            O.getOrElseW(() => "-"),
                          ),
                        ),
                        O.getOrElseW(() => "-"),
                      )
                    )}
                  </Stack>
                </TabPanel>
                <TabPanel>claim</TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Stack>
      </>
    )),
    O.getOrElse(() => (
      <>
        <Buttons.Primary onClick={() => e.onConnectWallet()}>
          Connect Wallet
        </Buttons.Primary>
      </>
    )),
  )
}

const TotalsItem: React.FC<{ label: string; item: BigNumber }> = ({
  label,
  item,
}) => {
  return (
    <>
      <Box>{label}</Box>
      <Box>{frmt.units(item)}</Box>
    </>
  )
}
