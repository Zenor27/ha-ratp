import { useQuery } from "react-query";

const IDFM_API_KEY = import.meta.env.VITE_IDFM_API_KEY as string;

const STOP_ID = "STIF:StopPoint:Q:25337:" as const;

const STOP_MONITORING_API_URL =
  "https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring" as const;

const LINE_ID_TO_PICTURE_URL = {
  "STIF:Line::C01119:":
    "https://www.ratp.fr/sites/default/files/lines-assets/picto/busratp/picto_busratp_ligne-87.1496915873.svg",
  "STIF:Line::C02251:":
    "https://www.ratp.fr/sites/default/files/lines-assets/picto/busratp/picto_busratp_ligne-77.1554114767.svg",
} as const;

const LINE_ID_TO_NAME = {
  "STIF:Line::C01119:": "87",
  "STIF:Line::C02251:": "77",
} as const;

export type Bus = {
  name: string;
  direction: string;
  pictureUrl: string;
  waitingTime: number;
};

const fetchBuses = async (): Promise<Bus[]> => {
  const response = await fetch(
    `${STOP_MONITORING_API_URL}?MonitoringRef=${STOP_ID}`,
    {
      headers: {
        apiKey: IDFM_API_KEY,
      },
    }
  );
  if (!response.ok) {
    console.error(response);
    return [];
  }
  const data = await response.json();
  const buses =
    data?.["Siri"]?.["ServiceDelivery"]?.["StopMonitoringDelivery"]?.[0]?.[
      "MonitoredStopVisit"
    ] || [];

  return buses
    .sort((bus1: any, bus2: any) => {
      const lineId1 = bus1["MonitoredVehicleJourney"]["LineRef"][
        "value"
      ] as keyof typeof LINE_ID_TO_NAME;
      const lineName1 = LINE_ID_TO_NAME[lineId1] as string;
      const lineId2 = bus2["MonitoredVehicleJourney"]["LineRef"][
        "value"
      ] as keyof typeof LINE_ID_TO_NAME;
      const lineName2 = LINE_ID_TO_NAME[lineId2] as string;
      return lineName1.localeCompare(lineName2);
    })
    .map((bus: any) => {
      const lineId = bus["MonitoredVehicleJourney"]["LineRef"][
        "value"
      ] as keyof typeof LINE_ID_TO_NAME;
      const lineName = LINE_ID_TO_NAME[lineId] as string;
      const linePictureUrl = LINE_ID_TO_PICTURE_URL[lineId];
      const direction = bus["MonitoredVehicleJourney"]["DestinationName"][0][
        "value"
      ] as string;
      const waitingTime = bus["MonitoredVehicleJourney"]["MonitoredCall"][
        "ExpectedDepartureTime"
      ] as string;
      const waitingTimeInMinutes = Math.max(
        Math.floor((new Date(waitingTime).getTime() - Date.now()) / 1000 / 60),
        0
      );
      return {
        name: lineName,
        direction,
        pictureUrl: linePictureUrl,
        waitingTime: waitingTimeInMinutes,
      } as Bus;
    });
};

type UseBusesProps = {
  pollingInterval?: number;
};

export const useBuses = (
  { pollingInterval = 60 }: UseBusesProps = {
    pollingInterval: 60,
  }
) => {
  const { data, isLoading } = useQuery("buses", {
    queryFn: fetchBuses,
    refetchInterval: pollingInterval * 1000,
  });

  return { buses: data, isLoading };
};
