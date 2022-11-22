import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { option as O } from "fp-ts";
import { Option } from "fp-ts/lib/Option";
import * as React from "react";

export const RecipientInput: React.FC<{
  recipient: Option<string>;
  disabled?: boolean;
  onChange: (recipient: string) => void;
}> = ({ recipient, disabled = false, onChange }) => {
  return (
    <>
      <FormControl id="recipient">
        <FormLabel>Recipient address</FormLabel>
        <Input
          disabled={disabled}
          value={O.getOrElseW(() => "")(recipient)}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      </FormControl>
    </>
  );
};
