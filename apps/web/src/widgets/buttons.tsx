import { Button, ButtonProps } from "@chakra-ui/react";
import * as React from "react";

const Primary: React.FC<ButtonProps> = (props) => {
  return (
    <Button
      bg={"blue.400"}
      color={"white"}
      _hover={{
        bg: "blue.500",
      }}
      {...props}
    >
      {props.children}
    </Button>
  );
};

export const Buttons = {
  Primary,
};
