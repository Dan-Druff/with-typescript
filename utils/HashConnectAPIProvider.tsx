import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";
import React, { useEffect, useState } from "react";

//Type declarations
interface SaveData {
  topic: string;
  pairingString: string;
  privateKey: string;
  pairedWalletData: HashConnectTypes.WalletMetadata | null;
  pairedAccounts: string[];
  netWork?: string;
  id?: string;
  accountIds?: string[];
}

type Networks = "testnet" | "mainnet" | "previewnet";

interface PropsType {
  children: React.ReactNode;
  hashConnect: HashConnect;
  netWork: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  debug?: boolean;
}

export interface HashConnectProviderAPI {
  connect: () => void;
  walletData: SaveData;
  netWork: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  installedExtensions: HashConnectTypes.WalletMetadata | null;
}

const availableExtensions: HashConnectTypes.WalletMetadata[] = [];

const INITIAL_SAVE_DATA: SaveData = {
  topic: "",
  pairingString: "",
  privateKey: "",
  pairedAccounts: [],
  pairedWalletData: null,
};

let APP_CONFIG: HashConnectTypes.AppMetadata = {
  name: "dApp Example",
  description: "An example hedera dApp",
  icon: "https://absolute.url/to/icon.png",
};

const loadLocalData = (): null | SaveData => {
  let foundData = localStorage.getItem("hashConnectData");

  if (foundData) {
    const saveData: SaveData = JSON.parse(foundData);
    // setSaveData(saveData);
    return saveData;
  } else return null;
};

export const HashConnectAPIContext =
  React.createContext<HashConnectProviderAPI>({
    connect: () => null,
    walletData: INITIAL_SAVE_DATA,
    netWork: "testnet",
    installedExtensions: null,
  });

export default function HashConnectProvider({
  children,
  hashConnect,
  metaData,
  netWork,
  debug,
}: PropsType) {
  //Saving Wallet Details in Ustate
  const [saveData, SetSaveData] = useState<SaveData>(INITIAL_SAVE_DATA);
  const [installedExtensions, setInstalledExtensions] =
    useState<HashConnectTypes.WalletMetadata | null>(null);

  //? Initialize the package in mount
  const initializeHashConnect = async () => {
    const saveData = INITIAL_SAVE_DATA;
    const localData = loadLocalData();
    try {
      if (!localData) {
        if (debug) console.log("===Local data not found.=====");
        console.log("Local data not found");
        //first init and store the private for later
        let initData = await hashConnect.init(metaData ?? APP_CONFIG);
        saveData.privateKey = initData.privKey;

        //then connect, storing the new topic for later
        const state = await hashConnect.connect();
        saveData.topic = state.topic;

        //generate a pairing string, which you can display and generate a QR code from
        saveData.pairingString = hashConnect.generatePairingString(
          state,
          netWork,
          debug ?? false
        );

        //find any supported local wallets
        hashConnect.findLocalWallets();
      } else {
        if (debug) console.log("====Local data found====", localData);
        //use loaded data for initialization + connection
        hashConnect.init(metaData ?? APP_CONFIG, localData?.privateKey);
        hashConnect.connect(
          localData?.topic,
          localData?.pairedWalletData ?? metaData
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (localData) {
        SetSaveData((prevData) => ({ ...prevData, ...localData }));
        console.log("LOCAL DATA: ", localData)
      } else {
        SetSaveData((prevData) => ({ ...prevData, ...saveData }));
        console.log("saveData DATA: ", saveData)
      }
      if (debug) console.log("====Wallet details updated to state====");
    }
  };

  const saveDataInLocalStorage = (data: MessageTypes.ApprovePairing) => {
    if (debug)
      console.info("===============Saving to localstorage::=============");
    const { metadata, ...restData } = data;
    console.log("Save data in local storage");
    SetSaveData((prevSaveData) => {
      prevSaveData.pairedWalletData = metadata;
      return { ...prevSaveData, ...restData };
    });
    let dataToSave = JSON.stringify(saveData);
    localStorage.setItem("hashconnectData", dataToSave);
  };

  const additionalAccountResponseEventHandler = (
    data: MessageTypes.AdditionalAccountResponse
  ) => {
    if (debug) console.debug("additionalAccountResponseEvent", data);
    // Do a thing
    console.log("Additional accounts");
  };

  const foundExtensionEventHandler = (
    data: HashConnectTypes.WalletMetadata
  ) => {
    if (debug) console.debug("====foundExtensionEvent====", data);
    console.log("====foundExtensionEvent====", data)
    // Do a thing
    setInstalledExtensions(data);
  };

  const pairingEventHandler = (data: MessageTypes.ApprovePairing) => {
    if (debug) console.log("===Wallet connected=====", data);
    console.log("===PAIRING EVENT!!!=====", data);
    data.accountIds.forEach(id => {
      console.log("LOGGING: ",id);
    })
    // Save Data to localStorage
    saveDataInLocalStorage(data);
  };

  useEffect(() => {
    //Intialize the setup
    initializeHashConnect();

    // Attach event handlers
    hashConnect.additionalAccountResponseEvent.on(
      additionalAccountResponseEventHandler
    );
    hashConnect.foundExtensionEvent.on(foundExtensionEventHandler);
    hashConnect.pairingEvent.on(pairingEventHandler);
  //   hashConnect.pairingEvent.once((pairingData) => {
  //     //example
  //     pairingData.accountIds.forEach(id => {
  //       console.log("What is pairing data.", id);
  //     })
  // })
  console.log("UE what is walletData: ",saveData);
    return () => {
      // Detach existing handlers
      hashConnect.additionalAccountResponseEvent.off(
        additionalAccountResponseEventHandler
      );
      hashConnect.foundExtensionEvent.off(foundExtensionEventHandler);
      hashConnect.pairingEvent.off(pairingEventHandler);
      console.log("UE what is walletData: ",saveData);
    };
  }, []);

  const connect = () => {
    console.log("Connectingg: ");
    if (installedExtensions) {
      if (debug) console.log("Pairing String::", saveData.pairingString);
      hashConnect.connectToLocalWallet(saveData?.pairingString);
    } else {
      if (debug) console.log("====No Extension is not in browser====");
      return "wallet not installed";
    }
  };

  return (
    <HashConnectAPIContext.Provider
      value={{ connect, walletData: saveData, netWork, installedExtensions }}
    >
      {children}
    </HashConnectAPIContext.Provider>
  );
}

const defaultProps: Partial<PropsType> = {
  metaData: {
    name: "dApp Example",
    description: "An example hedera dApp",
    icon: "https://absolute.url/to/icon.png",
  },
  netWork: "testnet",
  debug: false,
};

HashConnectProvider.defaultProps = defaultProps;

export function useHashConnect() {
  const value = React.useContext(HashConnectAPIContext);
  return value;
}
