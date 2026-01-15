import { Box, Flex, Group, Image, Text } from "@mantine/core";
import logo from "@/assets/arilogo.png";

export const AppFooter: React.FC = () => {
  return (
    <Group justify="flex-start" align="center" wrap="nowrap">
      <Box>
        <Flex align="center" py="md" display="inline-flex">
          <Image src={logo} alt="Omisper" w="24px" h="24px" fit="contain" />
          <Text size="xl" fw={700} ml="xs">
            Omisper
          </Text>
        </Flex>
      </Box>
    </Group>
  );
};
