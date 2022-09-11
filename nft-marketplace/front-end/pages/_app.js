import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";
import Head from "next/head";
import Header from "../components/Header";

function NFTMarketPlace({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>Nick's NFT Marketplace</title>
        <meta name="description" content="Nick's NFT Marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MoralisProvider initializeOnMount={false}>
        <Header />
        <Component {...pageProps} />
      </MoralisProvider>
    </div>
  );
}

export default NFTMarketPlace;
