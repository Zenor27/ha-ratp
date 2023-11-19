import { Flex, Image, Loader, Modal } from "@mantine/core";
import { Metro, useMetros } from "../hooks/useMetros";
import { useState } from "react";

export const Metros = () => {
  const { metros, isLoading } = useMetros();
  const [openedMetro, setOpenedMetro] = useState<Metro | null>(null);

  return (
    <>
      <Flex justify="center" align="center" h="100%">
        {isLoading && <Loader />}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gridGap: "1rem",
          }}
        >
          {metros?.map((metro) => (
            <div key={metro.name}>
              <Image
                src={metro.pictureUrl}
                alt={metro.name}
                style={{
                  border: `8px solid ${
                    metro.status === "OK" ? "green" : "red"
                  }`,
                  borderRadius: "50%",
                }}
                onClick={() => setOpenedMetro(metro)}
              />
            </div>
          ))}
        </div>
      </Flex>
      <Modal
        opened={openedMetro !== null}
        onClose={() => setOpenedMetro(null)}
        title={openedMetro && `Line ${openedMetro.name}`}
        centered
      >
        {openedMetro ? (
          <>
            {openedMetro?.status === "ISSUE" ? (
              <div>{openedMetro.information}</div>
            ) : (
              <div>No issue on line {openedMetro?.name}</div>
            )}
          </>
        ) : (
          <></>
        )}
      </Modal>
    </>
  );
};
