"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import bnb from "@/public/bnb.png";
import usdt from "../../public/usdt(bep-20).png";
import wclogo from "@/public/wclogo.png";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { contract, presaleContractEthers } from "../lib/thirdweb";
import { prepareContractCall, toWei } from "thirdweb";
import { ethers } from "ethers";
import { erc20_abi, presale_address, usdt_address } from "../contract/data";
import { Stage } from "../lib/types";
import { useRouter } from "next/navigation";

const Presale = ({
  initialAirdropCountdown,
  isAirdropOpen,
  airdropEndTime,
  referral,
  stageNumber,
  stageDetails,
}: {
  initialAirdropCountdown: string;
  isAirdropOpen: boolean;
  airdropEndTime: number;
  referral: string | undefined;
  stageNumber: number;
  stageDetails: Stage;
}) => {
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

    if (activeAccount) fetchUserPurchaedWID();
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
    const totalWICCost = await presaleContractEthers.calculateTotalTokensCost(
      wicAmountDec,
      selectedPaymentMode
    );
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
      value: selectedPaymentMode !== 0 ? 0 : totalWICCost,
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

        if (selectedPaymentMode === 1) {
          if (typeof window !== "undefined") {
            const provider = new ethers.BrowserProvider(
              (window as any).ethereum
            );
            const signer = await provider.getSigner();
            const usdtSignerContract = new ethers.Contract(
              usdt_address,
              erc20_abi,
              signer
            );
            const tx = await usdtSignerContract.approve(
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
        } else {
          await prepareAndSendTransaction();
        }
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
    <div className="w-full lg:w-1/2 px-2 my-4">
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold text-yellow-500">
              Buy now and double (x2) your $WID!
            </h2>
            <p className="text-gray-700 mt-2">
              Limited time offer during the airdrop period.
            </p>
            <p className="text-red-500 font-semibold">{countdown}</p>
            <button
              className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="container v1 border-2 border-white rounded-lg bg-black bg-opacity-50 p-5">
        <div className="iq-countdown text-center">
          <h3 className="text-3d uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-yellow-400 to-yellow-600 text-3xl font-bold">
              Join Presale
            </span>
          </h3>
          <div className="progress my-2"></div>
          <p className="text-xl text-pink-500 font-semibold">
            🔥 Listings Price: <span className="font-bold">{tokenPrice}</span>{" "}
            🔥
          </p>
        </div>
        <div className="flex space-x-2 items-center justify-center my-5">
          <hr className="border-t border-white w-1/5" />
          <h2 className="text-white text-lg font-bold">
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
        <ul className="flex justify-center space-x-2 mb-5">
          {["BNB", "USDT(BEP-20)"].map((item, index) => (
            <li
              key={index}
              className="nav-item bg-purple-900 rounded-md shadow-lg"
            >
              <button
                className={`nav-link flex items-center space-x-2 p-2 text-white ${
                  selectedPaymentMode === index
                    ? "bg-purple-700"
                    : "hover:bg-purple-800"
                }`}
                onClick={() => setSelectedPaymentMode(index)}
              >
                <Image
                  src={item === "BNB" ? bnb : usdt}
                  alt={`${item}_logo`}
                  width={30}
                  height={30}
                />
                <b className="text-sm font-grinddemolished">{item}</b>
              </button>
            </li>
          ))}
        </ul>
        <div className="tab-content py-2">
          <div className={`tab-pane fade`}>
            <div className="space-y-1 mt-1 mb-2">
              <label className="text-white text-sm">Enter Amount</label>
              <div className="flex">
                <input
                  onChange={(e) => {
                    e.preventDefault();
                    setWicAmount(e.target.value);
                  }}
                  min={1}
                  type="number"
                  className="w-full py-3 px-2 outline-none rounded-l"
                  placeholder="$WID Amount to purchase"
                />
                <button className="flex items-center text-white rounded-r border-l bg-gray-300">
                  <Image
                    src={wclogo}
                    alt="Preloader Logo"
                    width={50}
                    height={40}
                  />
                </button>
              </div>
            </div>
            <div className="text-center my-5">
              <button
                className="gold-button px-6 py-3 rounded-lg bg-gradient-to-r from-gold-light to-gold-dark text-white font-bold shadow-lg hover:from-gold-dark hover:to-gold-light transform hover:scale-105 transition-transform duration-300"
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
        <div className="presaleStats bg-yellow-400 bg-opacity-25 text-gray-200 p-5 rounded-lg">
          <div className="statTop flex justify-between items-center border-b border-gray-600 pb-2">
            <p className="text-sm md:text-base">Your Referral Rewards</p>
            <p className="text-sm md:text-base">
              {userWIDTokens ? userWIDTokens.referralTokens : "---"} $WID
            </p>
          </div>
          <div className="statBottom flex justify-between items-center py-2">
            <p className="text-sm md:text-base">Stage</p>
            <p className="text-sm md:text-base">{Number(stageNumber)}</p>
          </div>
          <div className="statBottom flex justify-between items-center py-2">
            <p className="text-sm md:text-base">Token Sold</p>
            <p className="text-sm md:text-base">
              {supplySold} / {stageSupply} $WID
            </p>
          </div>
          <div className="statBottom flex justify-between items-center py-2">
            <p className="text-sm md:text-base">
              Min Participation (Winner Pool)
            </p>
            <p className="text-sm md:text-base">{minParticipationUSDT} $</p>
          </div>
        </div>

        <div className="text-center mt-5">
          <button
            className="space-y-2"
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
            <p className="text-pink-500 font-bold">Claim 10% Referral Link</p>
            {referralLink ? (
              <Badge
                variant={"secondary"}
                className="cursor-pointer font-bold"
                onClick={() => {
                  navigator.clipboard.writeText(referralLink!);
                  toast({
                    title: "Copied to Clipboard",
                  });
                }}
              >
                Copy Link
              </Badge>
            ) : (
              ""
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Presale;
