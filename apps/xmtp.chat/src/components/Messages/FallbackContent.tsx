import { Text } from "@mantine/core";
import classes from "./TextContent.module.css";

export type FallbackContentProps = {
  text: string;
};

export const FallbackContent: React.FC<FallbackContentProps> = ({ text }) => {
  return (
    <div 
      className={classes.text}
      style={{
        color: "#000000",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontFamily: "inherit",
        fontSize: "1.5em",
      }}>
      {text}
    </div>
  );
};
