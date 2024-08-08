"use client";
import React, { useEffect, useState } from "react";
// import bnb from "../../public/bnb.png";
// import usdt from "../../public/usdt(bep-20).png";
// import wclogo from "@/public/wclogo.png";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { contract, presaleContractEthers } from "../lib/thirdweb";
import { prepareContractCall, toWei } from "thirdweb";
import { ethers } from "ethers";
import {
  erc20_abi,
  presale_address,
  usdc_address,
  usdt_address,
  widcoin_address,
} from "../contract/data";
import { Stage } from "../lib/types";
import { useRouter } from "next/navigation";

const tokenAddressUrl = `https://bscscan.com/address/${widcoin_address}`;
const presaleAddressUrl = `https://bscscan.com/address/${presale_address}`;

const Presale = ({
  initialAirdropCountdown,
  isAirdropOpen,
  airdropEndTime,
  referral,
  stageNumber,
  stageDetails,
  totalFundsRaised,
}: {
  initialAirdropCountdown: string;
  isAirdropOpen: boolean;
  airdropEndTime: number;
  referral: string | undefined;
  stageNumber: number;
  stageDetails: Stage;
  totalFundsRaised: Number;
}) => {
  console.log(stageDetails);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<number>(0); // 0 => BNB 1 => USDT
  const [showPopup, setShowPopup] = useState<boolean>(isAirdropOpen);
  const [referralLink, setReferralLink] = useState<string | undefined>(
    undefined
  );
  const [wicAmount, setWicAmount] = useState<string>("");
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [userWIDTokens, setUserWIDTokens] = useState<
    | {
        purchasedTokens: number;
        referralTokens: number;
      }
    | undefined
  >(undefined);
  const [countdown, setCountdown] = useState<string>(initialAirdropCountdown);

  const activeAccount = useActiveAccount();
  const { toast } = useToast();
  const router = useRouter();
  const {
    mutate: sendTransaction,
    isPending,
    isSuccess,
    error,
    isError,
  } = useSendTransaction();
  const { stageSupply, supplySold, tokenPrice, minParticipationUSDT } =
    stageDetails;

  useEffect(() => {
    const fetchUserPurchaedWID = async () => {
      const { address } = activeAccount!;
      const amount = await presaleContractEthers.purchasedTokens(address);
      const referralTokens = await presaleContractEthers.refferalTokens(
        address
      );
      setUserWIDTokens({
        purchasedTokens: Number(ethers.formatEther(amount)),
        referralTokens: Number(ethers.formatEther(referralTokens)),
      });
    };

    const updateStageDetails = async () => {
      const currentStageNumber = await presaleContractEthers.currentStage();
      const stageDetails = await presaleContractEthers.getStageSpecs(
        currentStageNumber
      );
      const updatedSupplySold = ethers.formatEther(stageDetails.supplySold);
      const updatedStageSupply = ethers.formatEther(stageDetails.stageSupply);
      const updatedMinPartcip = Number(stageDetails.minParticipationUSDT) / 1e8;
      const updatedTokenPrice = Number(stageDetails.tokenPrice) / 1e8;
      stageDetails.stageSupply = updatedStageSupply;
      stageDetails.supplySold = updatedSupplySold;
      stageDetails.tokenPrice = updatedTokenPrice;
      stageDetails.minParticipationUSDT = updatedMinPartcip;
    };

    if (activeAccount) {
      fetchUserPurchaedWID();
      updateStageDetails();
    }
    if (isError) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    if (isSuccess) {
      toast({
        title: "Purchase Transaction processed successfully!",
        description: "Please wait for the transaction confirmation.",
      });
      setTimeout(() => {
        router.refresh();
      }, 6000);
    }
  }, [activeAccount?.address, isError, isSuccess]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      console.log(now);
      const distance = Number(airdropEndTime) * 1000 - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);

      if (distance < 0) {
        clearInterval(interval);
        setCountdown("Airdrop Ended");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [airdropEndTime]);

  const prepareAndSendTransaction = async () => {
    const wicAmountDec = toWei(wicAmount);
    // const totalWICCost = await presaleContractEthers.calculateTotalTokensCost(
    //   wicAmountDec,
    //   selectedPaymentMode
    // );
    const transaction = prepareContractCall({
      contract,
      method: "function buyToken(uint256 amount, uint8 mode,address refferal)",
      params: [
        wicAmountDec,
        selectedPaymentMode,
        referral === undefined
          ? "0x0000000000000000000000000000000000000000"
          : referral,
      ],
      // value: selectedPaymentMode !== 0 ? 0 : totalWICCost,
    });
    sendTransaction(transaction);
  };

  const buyToken = async () => {
    if (!activeAccount) {
      toast({
        title: "Connect Your Wallet",
        variant: "destructive",
      });
    } else {
      try {
        setIsApproving(true);
        const wicAmountDec = toWei(wicAmount);
        const totalWICCost =
          await presaleContractEthers.calculateTotalTokensCost(
            wicAmountDec,
            selectedPaymentMode
          );

        // if (selectedPaymentMode === 1) {
        if (typeof window !== "undefined") {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const signer = await provider.getSigner();
          const tokenSignerContract = new ethers.Contract(
            selectedPaymentMode === 1 ? usdt_address : usdc_address,
            erc20_abi,
            signer
          );
          const tx = await tokenSignerContract.approve(
            presale_address,
            totalWICCost
          );
          console.log(tx);
          setTimeout(() => {
            console.log("processing after 10 seconds");
            prepareAndSendTransaction();
          }, 9000);
          toast({
            title: "Approval transaction processed successfully!",
            description:
              "Please wait for the confirmation and purchase transaction.",
          });
        }
        // } else {
        //   await prepareAndSendTransaction();
        // }
      } catch (error) {
        toast({
          title: "Error",
          description: String(error),
          variant: "destructive",
        });
      } finally {
        setIsApproving(false);
      }
    }
  };

  return (
    <div className="w-full lg:w-1/2 my-4">
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-black p-6 rounded-lg shadow-2xl text-center">
            <h2 className="text-2xl font-bold text-yellow-400">
              Buy now and double (x2) your $WID!
            </h2>
            <p className="text-gray-300 mt-3">
              Limited time offer during the airdrop period.
            </p>
            <p className="text-red-500 font-semibold text-lg">{countdown}</p>
            <button
              className="mt-5 px-5 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg shadow-lg hover:from-yellow-600 hover:to-yellow-700"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="container border-2 border-blue-500 rounded-lg bg-gradient-to-r from-blue-900 via-purple-900 to-black px-2 lg:px-5 py-5 ">
        <div className="iq-countdown text-center pb-2 pt-2">
          <h3 className="uppercase text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 pb-2">
            Join Presale
          </h3>
          <div className="progress my-3 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500"
              style={{ width: "50%" }}
            ></div>
          </div>
          <p className="text-xl text-yellow-400 font-semibold pb-2 pt-2">
            🔥 1 $WID = <span className="font-bold">${tokenPrice}</span> 🔥
          </p>
        </div>
        <ul className="flex justify-center space-x-6 mb-5 pt-3">
          {["USDC(BEP-20)", "USDT(BEP-20)"].map((item, index) => (
            <li
              key={index}
              className="nav-item bg-purple-800 rounded-md shadow-lg"
            >
              <button
                className={`nav-link flex items-center space-x-2 p-3 text-white ${
                  selectedPaymentMode === index
                    ? "bg-purple-700"
                    : "hover:bg-purple-600"
                }`}
                onClick={() => setSelectedPaymentMode(index)}
              >
                <img
                  src={
                    item === "USDC(BEP-20)"
                      ? "/usdc(bep-20).png"
                      : "/usdt(bep-20).png"
                  }
                  alt={`${item}_logo`}
                  width={30}
                  height={30}
                />
                <b className="">
                  {item === "USDT(BEP-20)" ? (
                    <div className="flex flex-col">
                      <p className="text-xs lg:text-md md:text-sm font-bold tracking-wide">
                        USDT
                      </p>
                      <span className="text-xs lg:text-sm font-normal lg:font-bold md:font-medium">
                        (BEP-20)
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <p className="text-xs lg:text-md md:text-sm font-bold tracking-wide">
                        USDC
                      </p>
                      <span className="text-xs lg:text-sm font-normal lg:font-bold md:font-medium">
                        (BEP-20)
                      </span>
                    </div>
                  )}
                </b>
              </button>
            </li>
          ))}
        </ul>
        {/* {selectedPaymentMode == 1 && ( */}
        <div className="text-center mt-2 text-sm text-gray-400">
          <p>Note: There will be a total of 2 transactions.</p>
        </div>
        {/* )} */}
        <div className="tab-content py-4">
          <div className={`tab-pane fade show active`}>
            <div className="space-y-2 mt-2 mb-4">
              <label className="text-white text-sm">Enter Amount</label>
              <div className="flex">
                <input
                  onChange={(e) => {
                    e.preventDefault();
                    setWicAmount(e.target.value);
                  }}
                  min={1}
                  type="number"
                  className="w-full py-3 px-3 outline-none rounded-l bg-gray-800 text-white text-sm"
                  placeholder="$WID Amount to purchase"
                />
                <button className="flex items-center text-white rounded-r border-l bg-gray-600 px-4">
                  <img
                    src="/wclogo.png"
                    alt="Preloader Logo"
                    width={50}
                    height={40}
                  />
                </button>
              </div>
            </div>
            <div className="text-center my-5">
              <button
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-gold-light to-gold-dark text-white font-bold shadow-lg hover:from-gold-dark hover:to-gold-light transform hover:scale-105 transition-transform duration-300"
                onClick={buyToken}
                disabled={isPending || isApproving}
              >
                {isPending || isApproving
                  ? isApproving
                    ? "Approving..."
                    : "Processing..."
                  : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
        <div className="presaleStats bg-yellow-500 bg-opacity-10 text-gray-200 p-6 rounded-lg shadow-inner">
          <div className="flex space-x-2 items-center justify-center my-5">
            <hr className="border-t border-white w-1/5" />
            <h2 className="text-white text-md font-bold">
              Your Purchased $WID ={" "}
              {userWIDTokens
                ? userWIDTokens.purchasedTokens.toString() +
                  " " +
                  "($" +
                  (userWIDTokens.purchasedTokens * tokenPrice).toString() +
                  ")"
                : "---"}
            </h2>
            <hr className="border-t border-white w-1/5" />
          </div>
          <div className="statTop flex justify-between items-center border-b border-gray-600 pb-3">
            <p className="text-sm md:text-base">Your Referral Rewards</p>
            <p className="text-sm md:text-base">
              {userWIDTokens ? userWIDTokens.referralTokens : "---"} $WID
            </p>
          </div>
          <div className="statBottom flex justify-between items-center py-3">
            <p className="text-sm md:text-base">Stage</p>
            <p className="text-sm md:text-base">{Number(stageNumber)}</p>
          </div>
          <div className="statBottom flex justify-between items-center py-3">
            <p className="text-sm md:text-base">Token Sold</p>
            <p className="text-sm md:text-base">
              {supplySold} / {stageSupply} $WID
            </p>
          </div>
          <div className="statBottom flex justify-between items-center py-3">
            <p className="text-sm md:text-base">
              Min Participation (Winner Pool)
            </p>
            <p className="text-sm md:text-base">{minParticipationUSDT} $</p>
          </div>
          <div className="statBottom flex justify-between items-center py-3">
            <p className="text-sm md:text-base">Total Funds Raised</p>
            <p className="text-sm md:text-base">
              {totalFundsRaised.toString()} $
            </p>
          </div>
        </div>
        <div className="text-center mt-6 flex items-center justify-center flex-col">
          <button
            className="px-4 py-2 bg-purple-700 text-white rounded-lg shadow-md hover:bg-purple-600"
            onClick={() =>
              activeAccount === undefined
                ? toast({
                    title: "Connect Your Wallet",
                    variant: "destructive",
                  })
                : setReferralLink(
                    `${window.location.href}${activeAccount!.address}`
                  )
            }
          >
            <p className="text-pink-200 font-bold">Claim 10% Referral Link</p>
            {referralLink && (
              <Badge
                variant={"secondary"}
                className="cursor-pointer font-bold mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  toast({
                    title: "Copied to Clipboard",
                  });
                }}
              >
                Copy Link
              </Badge>
            )}
          </button>
          <div className="flex items-center gap-4 mt-3 text-white pt-3">
            <a
              href={tokenAddressUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 lg:gap-2 md:gap-2"
            >
              <img
                src={"/bsscan.png"}
                alt="bsscan_logo"
                className="w-6 h-6" // Adjust the size as needed
              />
              <span className="text-xs lg:text-sm md:text-sm">
                WID Coin Contract
              </span>
            </a>
            <a
              href={presaleAddressUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center  gap-1 lg:gap-2 md:gap-2"
            >
              <img
                src={"/bsscan.png"}
                alt="BSScan Logo"
                className="w-6 h-6" // Adjust the size as needed
              />
              <span className="text-xs lg:text-sm md:text-sm">
                Presale Contract
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Presale;
