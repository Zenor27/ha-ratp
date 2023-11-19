import { Flex, Image, Loader, Text } from "@mantine/core";
import { useBuses } from "../hooks/useBuses";

export const Buses = () => {
  const { buses, isLoading } = useBuses();

  return (
    <Flex justify="center" align="center" h="100%" direction="column" gap={16}>
      {isLoading && <Loader />}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gridGap: "1rem",
        }}
      >
        {buses?.map((bus, index) => (
          <Flex key={index} align="center" justify="space-between" gap="1rem">
            <Image src={bus.pictureUrl} alt={bus.name} w={30} />
            <Text size="md">{bus.direction}</Text>
            <Text fw="bold">{bus.waitingTime}min.</Text>
          </Flex>
        ))}
      </div>
    </Flex>
  );
};
