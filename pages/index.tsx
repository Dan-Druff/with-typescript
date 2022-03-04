import Link from 'next/link'
import Layout from '../components/Layout'


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
      console.log("Accountid: 🍟 ",accountIds);
      connect();
    } 
    else
      alert(
        "Please install hashconnect wallet extension first. from chrome web store."
      );
  };

  
  return (

  <Layout title="Home | Next.js + TypeScript Example">
    <h1>🌈 WSUUP 👋</h1>
    <p>
      <Link href="/about">
        <a>About</a>
      </Link>
    </p>
    <button onClick={() => handleClick()}>Try This :|</button>
  </Layout>

)
}

export default IndexPage
