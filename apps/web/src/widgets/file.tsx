import { Box } from "@chakra-ui/react";
import React from "react";
import { useDropzone } from "react-dropzone";
import { Icon } from "@chakra-ui/react";
import { AiOutlineCloudUpload } from "react-icons/ai";

interface Props {
  label: string;
  onAcceptFile: (file: any) => void;
}

const FileDrop: React.FC<Props> = (props) => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    maxFiles: 1,
  });

  React.useEffect(() => {
    acceptedFiles.forEach(props.onAcceptFile);
  }, [acceptedFiles, props.onAcceptFile]);

  return (
    <Box fill="horizontal">
      <div {...getRootProps()}>
        <Box align="center" fill="horizontal">
          <Icon boxSize="10" as={AiOutlineCloudUpload} />
        </Box>
        <Box margin={{ top: "small" }} align="center" fill="horizontal">
          {props.label}
        </Box>
        <input {...getInputProps()} />
      </div>
    </Box>
  );
};

export default FileDrop;
