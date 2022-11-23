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
  StackDivider,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { option as O } from "fp-ts"
import { pipe } from "fp-ts/lib/function"
import * as React from "react"
import { frmt } from "~/libs/format"
import { Buttons } from "~/widgets/buttons"
import DatePicker from "~/widgets/DatePicker"
import { useContractControl } from "./hooks"
import { AmountInput } from "~/widgets/amount"
import { InfoOutlineIcon } from "@chakra-ui/icons"

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
          <Box rounded={"lg"} bg={"whiteAlpha.50"} boxShadow={"lg"} p={8}>
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
                  <Divider my={6} />
                  <Heading size="sm">Totals</Heading>
                  {$.totalsPending ? (
                    <Spinner />
                  ) : (
                    $.totalsUpToDate && (
                      <Stack spacing={2}>
                        <Grid templateColumns="65% 35%">
                          {[
                            "Coins Total",
                            "Coins Available",
                            "Coins Claimed",
                            "Bonuses Total",
                            "Bonuses Available",
                            "Bonuses Claimed",
                          ].map((label, idx) => (
                            <TotalsItem
                              key={idx}
                              date={$.date}
                              label={label}
                              item={$.totals[idx]}
                            />
                          ))}
                        </Grid>
                      </Stack>
                    )
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
                    <HStack spacing={8}>
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
                    </HStack>
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
                    <Divider my={6} />
                    <Heading size="sm">Tx</Heading>
                    {$.addClaimPending ? (
                      <Spinner />
                    ) : (
                      pipe(
                        $.chainId,
                        O.map(chainId =>
                          pipe(
                            $.txAddClaim,
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
                <TabPanel>
                  {" "}
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
                    <Button onClick={() => e.onClaim()}>Claim</Button>
                    <Divider my={6} />
                    <Heading size="sm">Tx</Heading>
                    {$.claimPending ? (
                      <Spinner />
                    ) : (
                      pipe(
                        $.chainId,
                        O.map(chainId =>
                          pipe(
                            $.txClaim,
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

const info: Record<string, any> = {
  "Coins Total":
    "Total amount of coins that can be claimed after all vesting periods.",
  "Coins Available":
    "Amount of coins that are available at a certain point in time. This minus coins claimed is the claimable amount.",
  "Coins Claimed": "Amount of coins that have been claimed.",
  "Bonuses Total":
    "Total amount of bonuses that can be claimed during all vesting periods.",
  "Bonuses Available":
    "Amount of bonuses that are available at a certain point in time. This minus bonuses claimed is the claimable amount.",
  "Bonuses Claimed": "Amount of bonuses that have been claimed.",
}

const withDate: Record<string, boolean> = {
  "Coins Total": false,
  "Coins Available": true,
  "Coins Claimed": false,
  "Bonuses Total": false,
  "Bonuses Available": true,
  "Bonuses Claimed": false,
}

const TotalsItem: React.FC<{ label: string; item: BigNumber; date: Date }> = ({
  label,
  item,
  date,
}) => {
  return (
    <>
      <Tooltip label={info[label]} placement="left">
        <FormLabel m={0} _hover={{ color: "gray.50" }}>
          <HStack>
            <InfoOutlineIcon />
            <Box>{label}</Box>
            {withDate[label] && <Box>({frmt.datetime(date)})</Box>}
          </HStack>
        </FormLabel>
      </Tooltip>
      <Box>{frmt.units(item)}</Box>
    </>
  )
}
