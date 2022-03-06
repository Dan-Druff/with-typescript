import Link from 'next/link'
import Layout from '../components/Layout'
import { useEffect } from 'react';

import { useHashConnect } from '../utils/HashConnectAPIProvider';


const IndexPage = () => {
  const { connect, walletData, installedExtensions } = useHashConnect();
  const { accountIds, netWork, id } = walletData;

  const conCatAccounts = (lastAccs: string, Acc: string) => {
    return lastAccs + " " + Acc;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletData.pairingString);
  };

  
  const handleClick = () => {
    if (installedExtensions){
     
      connect();
      console.log("Accountid: 🍟 ",walletData);
    } 
    else
      alert(
        "Please install hashconnect wallet extension first. from chrome web store."
      );
  };
  useEffect(() => {
  console.log("UE is: ", accountIds)

    return () => {
    
    }
  }, [accountIds])

  
  return (

  <Layout title="Home | Next.js + TypeScript Example">
    <h1>🌈 WSUUP 👋</h1>
    <p>
      <Link href="/about">
        <a>About</a>
      </Link>
    </p>
    {accountIds && accountIds?.length > 0 && (
          <div>
            <h3>Connected Accounts Details:</h3>
            <p>Network:{netWork}</p>
            <p>Accounts: [{accountIds.reduce(conCatAccounts)}]</p>
          </div>
        )}
    <button onClick={() => handleClick()}>Try This :|</button>
  </Layout>

)
}

export default IndexPage
