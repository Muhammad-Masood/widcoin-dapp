import { createThirdwebClient, getContract } from "thirdweb";
import { bsc, bscTestnet } from "thirdweb/chains";
import { presale_abi, presale_address } from "../contract/data";
import { createWallet, inAppWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_TW_CLIENT_KEY!,
});

// const serverThirdweb = createThirdwebClient({
//   secretKey: process.env.TW_SECRET_KEY!,
// });

// https://<chainId>.rpc.thirdweb.com/<clientId>.

const contract = getContract({
  client,
  // the chain the contract is deployed on
  chain: bscTestnet,
  // the contract's address
  address: presale_address,
  // OPTIONAL: the contract's abi
  abi: presale_abi,
});

const wallets = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

export { client, /**serverThirdweb ,**/ contract, wallets };
