import { Badge, Text, Tooltip } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import React, { useCallback } from "react";
import { AddressTooltipLabel } from "@/components/AddressBadge";
import { shortAddress } from "@/helpers/strings";

export type ConnectedAddressProps = {
  address: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
};

export const ConnectedAddress: React.FC<ConnectedAddressProps> = ({
  address,
  size = "sm",
  onClick,
}) => {
  const clipboard = useClipboard({ timeout: 1000 });

  const handleCopy = useCallback(
    (
      event:
        | React.MouseEvent<HTMLDivElement>
        | React.KeyboardEvent<HTMLDivElement>,
    ) => {
      event.stopPropagation();
      clipboard.copy(address);
    },
    [clipboard, address],
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (onClick) {
        onClick();
      } else {
        handleCopy(event);
      }
    },
    [onClick, handleCopy],
  );

  const handleKeyboardCopy = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        if (onClick) {
          onClick();
        } else {
          handleCopy(event);
        }
      }
    },
    [onClick, handleCopy],
  );

  return (
    <Tooltip
      label={
        clipboard.copied ? (
          <Text size="xs">Copied!</Text>
        ) : (
          <AddressTooltipLabel address={address} />
        )
      }
      withArrow
      events={{ hover: true, focus: true, touch: true }}>
      <Badge
        variant="default"
        size={size}
        radius="md"
        onKeyDown={handleKeyboardCopy}
        onClick={handleClick}
        miw={100}
        tabIndex={0}
        style={{ cursor: onClick ? "pointer" : "default" }}
        styles={{
          label: {
            textTransform: "none",
          },
        }}>
        {shortAddress(address)}
      </Badge>
    </Tooltip>
  );
};
