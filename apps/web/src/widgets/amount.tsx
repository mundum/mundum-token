import { Input } from "@chakra-ui/react"
import { option as O } from "fp-ts"
import { Option } from "fp-ts/lib/Option"
import * as React from "react"
import { frmt } from "~/libs/format"

export const AmountInput: React.FC<{
  amount: Option<string>
  disabled?: boolean
  onChange: (amount: string) => void
}> = ({ amount, disabled = false, onChange }) => {
  return (
    <>
      <Input
        disabled={disabled}
        onChange={e => onChange(e.currentTarget.value.replace(/\D/, ""))}
        value={O.getOrElseW(() => "")(amount)}
      />
      <Input disabled value={frmt.bigNumber(O.getOrElseW(() => "0")(amount))} />
      <Input
        disabled
        value={frmt.bigNumberHex(O.getOrElseW(() => "0")(amount))}
      />
    </>
  )
}
