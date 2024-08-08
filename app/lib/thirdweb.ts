import { createThirdwebClient, getContract } from "thirdweb";
import { bscTestnet, bsc } from "thirdweb/chains";
import {
  erc20_abi,
  presale_abi,
  presale_address,
  usdt_address,
  widcoin_address,
} from "../contract/data";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { ethers } from "ethers";

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
  // chain: bscTestnet,
  chain: bsc,
  // the contract's address
  address: presale_address,
  // OPTIONAL: the contract's abi
  abi: presale_abi,
});

const tokenContract = getContract({
  client,
  // the chain the contract is deployed on
  // chain: bscTestnet,
  chain: bsc,
  // the contract's address
  address: widcoin_address,
  // OPTIONAL: the contract's abi
  abi: erc20_abi,
});

const usdtContract = getContract({
  client,
  // chain: bscTestnet,
  chain: bsc,
  address: usdt_address,
  abi: erc20_abi,
});

const wallets = [
  // inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL!);

const presaleContractEthers = new ethers.Contract(
  presale_address,
  presale_abi,
  provider
);

const usdtContractEthers = new ethers.Contract(
  usdt_address,
  erc20_abi,
  provider
);

export {
  client,
  /**serverThirdweb ,**/ contract,
  wallets,
  presaleContractEthers,
  tokenContract,
  usdtContract,
  usdtContractEthers,
};
