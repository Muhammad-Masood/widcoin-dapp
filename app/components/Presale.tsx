"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import bnb from "@/public/bnb.png";
import usdt from "../../public/usdt(bep-20).png";
import wclogo from "@/public/wclogo.png";
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { contract } from "../lib/thirdweb";
import { prepareContractCall, toWei } from "thirdweb";
import { ethers } from "ethers";
import { presale_abi, presale_address } from "../contract/data";

const Presale = ({ referral }: { referral: string | undefined }) => {
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<number>(0); // 0 => BNB 1 => USDT
  const [referralLink, setReferralLink] = useState<string | undefined>(
    undefined
  );
  const [wicAmount, setWicAmount] = useState<string>("");
  const activeAccount = useActiveAccount();
  const { toast } = useToast();
  const {
    mutate: sendTransaction,
    isPending,
    isSuccess,
  } = useSendTransaction();

  const buyToken = async () => {
    if (!activeAccount) {
      toast({
        title: "Connect Your Wallet",
        variant: "destructive",
      });
    } else {
      try {
        const wicAmountDec = toWei(wicAmount);
        // const { data, isLoading } = useReadContract({
        //   contract,
        //   method:
        //     "function calculateTotalTokensCost(uint256 token_amount, uint8 mode) returns (uint256)",
        //   params: [wicAmountDec, 0],
        // })
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL!
        );
        const presaleContract = new ethers.Contract(
          presale_address,
          presale_abi,
          provider
        );
        const totalWICCost = await presaleContract.calculateTotalTokensCost(
          wicAmountDec,
          selectedPaymentMode
        );
        console.log(totalWICCost);
        const transaction = prepareContractCall({
          contract,
          method:
            "function buyToken(uint256 amount, uint8 mode,address refferal)",
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
        toast({
          title: "Transaction Processed Successfully.",
          description: "Please wait for the confirmation.",
          variant: "destructive",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: String(error),
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="w-full lg:w-1/2 px-5 my-4">
      <div className="container v1 border-2 border-white rounded-lg bg-black bg-opacity-50 p-5">
        <div className="iq-countdown text-center">
          <h3 className="text-3d uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-yellow-400 to-yellow-600 text-3xl font-bold">
              Join Presale
            </span>
          </h3>
          <div className="progress my-2"></div>
          <p className="text-xl text-pink-500 font-semibold">
            🔥 Listings Price: '---' 🔥
          </p>
        </div>
        <div className="flex space-x-2 items-center justify-center my-5">
          <hr className="border-t border-white w-1/5" />
          <h2 className="text-white text-lg font-bold">Your Purchased $WIC = </h2>
          <hr className="border-t border-white w-1/5" />
        </div>
        <ul className="flex justify-center space-x-2 mb-5">
          {["BNB", "USDT(BEP-20)"].map((item, index) => (
            <li
              key={index}
              className="nav-item bg-purple-900 rounded-md shadow-lg"
            >
              <button
                className="nav-link flex items-center space-x-2 p-2 text-white"
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
                  type="text"
                  className="w-full py-3 px-2 outline-none rounded-l"
                  placeholder="$WIC Amount to purchase"
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
            {/* <div className="space-y-1 mt-2">
              <label htmlFor="" className="text-white text-sm">
                {selectedToken} To Pay
              </label>
              <div className="flex">
                <input
                  type="text"
                  className="w-full py-3 px-2 outline-none rounded-l"
                  placeholder="0.00"
                />
                <button className="flex items-center text-white rounded-r border-l bg-gray-300">
                  <Image
                    src={selectedToken === "BNB" ? bnb : usdt}
                    alt={`${selectedToken} Logo`}
                    width={50}
                    height={40}
                  />
                </button>
              </div>
            </div> */}
            <div className="text-center my-5">
              <button
                className="gold-button px-6 py-3 rounded-lg bg-gradient-to-r from-gold-light to-gold-dark text-white font-bold shadow-lg hover:from-gold-dark hover:to-gold-light transform hover:scale-105 transition-transform duration-300"
                onClick={buyToken}
                disabled={isPending}
              >
                {isPending ? "Processing..." : "Buy Now"}
              </button>
            </div>
          </div>
        </div>
        <div className="presaleStats bg-yellow-400 bg-opacity-25 text-gray-200 p-5 rounded-lg">
          <div className="statTop flex justify-between border-b border-gray-600 pb-2">
            <p>Your Referral Rewards</p>
            <p>0.00 $WIC</p>
          </div>
          <div className="statBottom flex justify-between">
            <p>Stage</p>
            <p>1</p>
          </div>
          <div className="statBottom flex justify-between">
            <p>Token Sold</p>
            <p>1231.02 / 1234568.4 WIC</p>
          </div>
          <div className="statBottom flex justify-between">
            <p>Remaining Token</p>
            <p>16765410.98 WIC</p>
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
            <p className="text-pink-500 font-bold">Claim 5% Referral Link</p>
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
