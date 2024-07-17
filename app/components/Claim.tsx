"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import bnb from "../public/bnb.png";
import usdt from "../public/usdt.png";
import wclogo from "../public/wclogo.png";
import { toast } from "@/components/ui/use-toast";
import { useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { contract } from "../lib/thirdweb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Claim = ({
  isTradingEnabled,
  winners,
  currentStage,
}: {
  isTradingEnabled: boolean;
  winners: string[];
  currentStage: number;
}) => {
  const [stageSpecs, setStageSpecs] = useState(null);
  const [stageNumber, setStageNumber] = useState(1);
  const {
    mutate: sendTransaction,
    isPending,
    isSuccess,
  } = useSendTransaction();

  const handleClaimTokens = async () => {
    try {
      if (!isTradingEnabled) {
        toast({
          title: "Trading is not enabled.",
          description: "Please try again later.",
          variant: "destructive",
        });
        return;
      }
      const transaction = prepareContractCall({
        contract,
        method: "function claimTokens()",
        params: [],
      });
      sendTransaction(transaction);
      toast({
        title: "Tokens claimed successfully!",
        description: "Wait for the transaction confirmation",
      });
    } catch (error) {
      toast({
        title: "Error claiming tokens.",
        description: String(error),
      });
      console.log(error);
    }
  };

  const handleClaimWinnerPool = async () => {
    try {
      const transaction = prepareContractCall({
        contract,
        method: "function claimWinnerPool(uint8 stageNumber)",
        params: [stageNumber],
      });
      sendTransaction(transaction);
      toast({
        title: "Winning Pool Claimed Successfully!",
        description: "Wait for the transaction confirmation",
      });
    } catch (error) {
      toast({
        title: "Error claiming winning pool.",
        description: String(error),
      });
    }
  };

  return (
    <div className="w-full lg:w-1/2 px-5 mt-10">
      <div className="container v1 border-2 border-white rounded-lg bg-black bg-opacity-50 p-5">
        <div className="iq-countdown text-center">
          <h3 className="text-3d uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-yellow-400 to-yellow-600 text-3xl font-bold">
              Claim Your Tokens
            </span>
          </h3>
        </div>

        <div className="text-center my-5">
          <button
            className="gold-button px-6 py-3 rounded-lg bg-gradient-to-r from-gold-light to-gold-dark text-white font-bold shadow-lg hover:from-gold-dark hover:to-gold-light transform hover:scale-105 transition-transform duration-300"
            onClick={handleClaimTokens}
            disabled={isPending}
          >
            {isPending ? "Processing..." : "Claim Tokens"}
          </button>
        </div>

        <div className="text-center my-5">
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="gold-button px-6 py-3 rounded-lg bg-gradient-to-r from-gold-light to-gold-dark text-white font-bold shadow-lg hover:from-gold-dark hover:to-gold-light transform hover:scale-105 transition-transform duration-300"
                disabled={isPending}
              >
                {isPending ? "Processing..." : "Claim Winner Pool"}
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Claim Winner Pool</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Stage Number
                  </Label>
                  <Input
                    id="name"
                    defaultValue="Pedro Duarte"
                    className="col-span-3"
                    placeholder="Stage Number"
                    onChange={(e) => {
                      e.preventDefault();
                      setStageNumber(Number(e.target.value));
                    }}
                    type="number"
                    min={1}
                    max={10}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleClaimWinnerPool}>
                  Claim
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* {stageSpecs && (
          <div className="presaleStats bg-yellow-400 bg-opacity-25 text-gray-200 p-5 rounded-lg mt-5">
            <div className="statTop flex justify-between border-b border-gray-600 pb-2">
              <p>Current Stage</p>
              <p>{stageSpecs.stageNumber}</p>
            </div>
            <div className="statBottom flex justify-between">
              <p>Token Sold</p>
              <p>{stageSpecs.supplySold}</p>
            </div>
            <div className="statBottom flex justify-between">
              <p>Remaining Tokens</p>
              <p>{stageSpecs.stageSupply - stageSpecs.supplySold}</p>
            </div>
          </div>
        )} */}

        <div className="winnerStats bg-yellow-400 bg-opacity-25 text-gray-200 p-5 rounded-lg mt-5">
          <h3 className="text-center text-2xl mb-4">Winners</h3>
          {Array.from({ length: stageNumber }).map((_, index) => (
            <div
              key={index}
              className={`winnerItem flex justify-between border-b border-gray-600 pb-2 ${
                winners[index].startsWith("0x000")
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
            >
              <p className="flex-1 text-left">Stage {index + 1}</p>
              <p className="flex-1 text-right">{winners[index]}</p>
            </div>
          ))}
          {winners.every((winner) => winner.startsWith("0x000")) && (
            <p className="text-center">No winners yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Claim;
