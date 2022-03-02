import {HashConnect} from 'hashconnect';
import HashConnectProvider from '../utils/HashConnectAPIProvider';
const hashConnect = new HashConnect(true);

function MyApp({ Component, pageProps }) {

    return (
        <HashConnectProvider hashConnect={hashConnect} debug>
          <Component {...pageProps} />
        </HashConnectProvider>
    )
}
export default MyApp