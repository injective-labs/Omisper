import { BreakableText } from "@/components/Messages/BreakableText";
import classes from "./TextContent.module.css";

export type TextContentProps = {
  text: string;
};

export const TextContent: React.FC<TextContentProps> = ({ text }) => {
  return (
    <div
      className={classes.text}
      onClick={(event) => {
        event.stopPropagation();
      }}
      style={{
        color: "var(--text-primary, #191919)",
        fontSize: "14px",
        lineHeight: 1.5,
      }}>
      <BreakableText>{text}</BreakableText>
    </div>
  );
};
