import { useQuery } from "react-query";

const IDFM_API_KEY = import.meta.env.VITE_IDFM_API_KEY as string;

const GENERAL_MESSAGE_API_URL =
  "https://prim.iledefrance-mobilites.fr/marketplace/general-message" as const;

const LINE_CODE_TO_NAME = {
  "STIF:Line::C01371:": "1",
  "STIF:Line::C01372:": "2",
  "STIF:Line::C01373:": "3",
  "STIF:Line::C01386:": "3bis",
  "STIF:Line::C01374:": "4",
  "STIF:Line::C01375:": "5",
  "STIF:Line::C01376:": "6",
  "STIF:Line::C01377:": "7",
  "STIF:Line::C01387:": "7bis",
  "STIF:Line::C01378:": "8",
  "STIF:Line::C01379:": "9",
  "STIF:Line::C01380:": "10",
  "STIF:Line::C01381:": "11",
  "STIF:Line::C01382:": "12",
  "STIF:Line::C01383:": "13",
  "STIF:Line::C01384:": "14",
} as const;

const LINE_CODE_TO_PICTURE_URL = {
  "STIF:Line::C01371:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/8e63c8180c0378991029ec5141e4c6a5/download/",
  "STIF:Line::C01372:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/cdaa0aa338d1acbd2e9d31fe21fc6eb7/download/",
  "STIF:Line::C01373:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/418ea5fcc3bf22ac253c1aafcd531684/download/",
  "STIF:Line::C01386:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/157da4ee0a222feb976fc9acc40c568b/download/",
  "STIF:Line::C01374:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/827ff49af57d362f6a7c5f2d1022528c/download/",
  "STIF:Line::C01375:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/e1babbb11951e80ae32d076528ef2ad1/download/",
  "STIF:Line::C01376:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/11ba6d8a602ec0780fe8c01aa58b542d/download/",
  "STIF:Line::C01377:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/b29f81837830b3a14fb876aaecc20e9c/download/",
  "STIF:Line::C01387:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/e08d6e9d99727bb7d55ffc5c44801f72/download/",
  "STIF:Line::C01378:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/6dc2bda2dcd7cffbde8cf5a6c194ba59/download/",
  "STIF:Line::C01379:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/5fe858163d92581d16bcab8aba61f26a/download/",
  "STIF:Line::C01380:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/4adaa198c6e4212d9f8bfe0e744ba857/download/",
  "STIF:Line::C01381:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/091275f9a999a893de5eb4703e1a74af/download/",
  "STIF:Line::C01382:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/68749e9f1ce05a0a4cae6610f95eecc0/download/",
  "STIF:Line::C01383:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/0b8a36241880cd49a78f24dbaca0433b/download/",
  "STIF:Line::C01384:":
    "https://data.iledefrance-mobilites.fr/explore/dataset/referentiel-des-lignes/files/7b99df056fae694cd8d96c160696d757/download/",
} as const;

const LINE_CODES = Object.keys(LINE_CODE_TO_NAME) as Array<
  keyof typeof LINE_CODE_TO_NAME
>;

type MetroStatus =
  | {
      status: "OK";
    }
  | {
      status: "ISSUE";
      information: string;
    };

export type Metro = {
  name: string;
  pictureUrl: string;
} & MetroStatus;

const fetchMetros = async (): Promise<Metro[]> => {
  const promises = LINE_CODES.map(async (lineCode) => {
    const response = await fetch(
      `${GENERAL_MESSAGE_API_URL}?LineRef=${lineCode}`,
      {
        headers: {
          apiKey: IDFM_API_KEY,
        },
      }
    );
    if (!response.ok) {
      console.error(response);
      return {
        name: LINE_CODE_TO_NAME[lineCode],
        pictureUrl: LINE_CODE_TO_PICTURE_URL[lineCode],
        status: "ISSUE",
        information: "Error while fetching metro status",
      } as Metro;
    }
    const json = await response.json();
    const messages =
      json["Siri"]?.["ServiceDelivery"]?.["GeneralMessageDelivery"]?.[0];

    const information =
      messages?.["InfoMessage"]?.map((info: any) => {
        const infoMessages = info["Content"]?.["Message"];
        const shortMessage = infoMessages?.find(
          (message: any) => message["MessageType"] === "SHORT_MESSAGE"
        );
        return shortMessage?.["MessageText"]?.["value"] || "N/A";
      }) || [];

    return {
      name: LINE_CODE_TO_NAME[lineCode],
      pictureUrl: LINE_CODE_TO_PICTURE_URL[lineCode],
      status: information.length !== 0 ? "ISSUE" : "OK",
      information,
    } as Metro;
  });

  return Promise.all(promises);
};

type UseMetrosProps = {
  pollingInterval?: number;
};

export const useMetros = (
  { pollingInterval = 60 }: UseMetrosProps = {
    pollingInterval: 60,
  }
) => {
  const { data, isLoading } = useQuery("metros", {
    queryFn: fetchMetros,
    refetchInterval: pollingInterval * 1000,
  });

  return {
    metros: data,
    isLoading,
  };
};
