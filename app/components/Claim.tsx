"use client";
import React, { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { contract, presaleContractEthers } from "../lib/thirdweb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Claim = ({
  isTradingEnabled,
  winners,
  currentStage,
}: {
  isTradingEnabled: boolean;
  winners: {
    winner: string;
    winningPool: number;
  }[];
  currentStage: number;
}) => {
  const [data, setData] = useState({
    isTradingEnabled,
    winners,
    currentStage,
  });
  const [stageNumber, setStageNumber] = useState(1);
  const [isWinnerClaimPending, setIsWinnerClaimPending] = useState(false);
  const {
    mutate: sendTransaction,
    isPending,
    isSuccess,
    isError,
  } = useSendTransaction();
  const activeAccount = useActiveAccount();
  const router = useRouter();

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
        title: "Tokens claimed request processed successfully!",
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
      setIsWinnerClaimPending(true);
      const transaction = prepareContractCall({
        contract,
        method: "function claimWinnerPool(uint8 stageNumber)",
        params: [stageNumber - 1],
      });
      sendTransaction(transaction);
      toast({
        title: "Winning pool claimed request processed successfully!",
        description: "Wait for the transaction confirmation",
      });
    } catch (error) {
      toast({
        title: "Error claiming winning pool.",
        description: String(error),
      });
    } finally {
      setIsWinnerClaimPending(false);
    }
  };

  useEffect(() => {
    const updateData = async () => {
      const isTradingEnabled = await presaleContractEthers.isTradingEnabled();
      const winnersTillCurrentStage = await Promise.all(
        Array.from({ length: 10 }, async (_, index) => {
          const stageDetails = await presaleContractEthers.getStageSpecs(
            index + 1
          );
          return {
            winner: stageDetails.winner,
            winningPool: Number(stageDetails.winningPool) / 1e8,
          };
        })
      );
      const updatedCurrentStage = Number(
        await presaleContractEthers.currentStage()
      );
      setData({
        currentStage: updatedCurrentStage,
        isTradingEnabled: isTradingEnabled,
        winners: winnersTillCurrentStage,
      });
    };
    updateData();
    if (isSuccess) {
      setTimeout(() => {
        updateData();
        router.refresh();
      }, 8000);
    }
  }, [activeAccount?.address, isError, isSuccess]);

  useEffect(() => {
    const updateData = async () => {
      const isTradingEnabled = await presaleContractEthers.isTradingEnabled();
      const winnersTillCurrentStage = await Promise.all(
        Array.from({ length: 10 }, async (_, index) => {
          const stageDetails = await presaleContractEthers.getStageSpecs(
            index + 1
          );
          return {
            winner: stageDetails.winner,
            winningPool: Number(stageDetails.winningPool) / 1e8,
          };
        })
      );
      const updatedCurrentStage = Number(
        await presaleContractEthers.currentStage()
      );
      setData({
        currentStage: updatedCurrentStage,
        isTradingEnabled: isTradingEnabled,
        winners: winnersTillCurrentStage,
      });
    };
    updateData();
  }, []);

  return (
    <div className="w-full lg:w-1/2 px-5 mt-10">
      <div className="container border-2 border-white rounded-lg bg-black bg-opacity-50 p-5">
        <div className="text-center mb-5">
          <h3 className="uppercase text-gradient text-3xl font-bold text-white">
            Claim Your Tokens
          </h3>
        </div>

        <div className="text-center my-5">
          <button
            className={`px-6 py-3 rounded-lg bg-gradient-to-r from-gold-light to-gold-dark text-white font-bold shadow-lg hover:from-gold-dark hover:to-gold-light transform hover:scale-105 transition-transform duration-300 ${
              isPending || !data.isTradingEnabled
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={handleClaimTokens}
            disabled={isPending || !data.isTradingEnabled}
          >
            {isPending ? "Processing..." : "Claim Tokens"}
          </button>
        </div>

        <div className="text-center my-5">
          <Dialog>
            <DialogTrigger asChild>
              <button
                className={`px-6 py-3 rounded-lg bg-gradient-to-r from-gold-light to-gold-dark text-white font-bold shadow-lg hover:from-gold-dark hover:to-gold-light transform hover:scale-105 transition-transform duration-300 ${
                  isWinnerClaimPending || !data.isTradingEnabled
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={isWinnerClaimPending || !data.isTradingEnabled}
              >
                {isWinnerClaimPending ? "Processing..." : "Claim Winner Pool"}
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Claim Winner Pool</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stageNumber" className="text-right">
                    Stage Number
                  </Label>
                  <Input
                    id="stageNumber"
                    className="col-span-3 rounded-lg px-3 py-2"
                    placeholder="Stage Number"
                    onChange={(e) => {
                      e.preventDefault();
                      const val = Number(e.target.value);
                      if (val > 10 || val < data.currentStage - 1) return;
                      setStageNumber(val);
                    }}
                    type="number"
                    min={data.currentStage - 1}
                    max={10}
                    defaultValue={data.currentStage - 1}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-gold-light to-gold-dark text-white font-bold shadow-lg hover:from-gold-dark hover:to-gold-light transform hover:scale-105 transition-transform duration-300"
                  type="submit"
                  onClick={handleClaimWinnerPool}
                >
                  Claim
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-center my-5 bg-blue-950 text-gray-900 p-5 rounded-lg mt-5">
          <h3 className="text-center text-2xl mb-4 text-white font-semibold">
            Winners
          </h3>
          {!data.winners[0].winner.startsWith("0x000")
            ? Array.from({ length: stageNumber }).map((stage, index) => (
                <div
                  key={index}
                  className={`flex flex-col text-xs lg:text-base md:text-base sm:flex-row justify-between items-start sm:items-center border-b border-black pb-2 bg-blue-900 text-white p-4 rounded-lg mt-5`}
                >
                  <p className="text-left mb-2 sm:mb-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {`Stage ${index + 1}`}
                  </p>
                  <Link
                    className="text-right text-white flex-1 flex items-center overflow-hidden"
                    target="_blank"
                    href={`https://bscscan.com/address/${data.winners[index].winner}`}
                  >
                    {data.winners[index].winner.substring(0, 6) +
                      "..." +
                      data.winners[index].winner.substring(
                        data.winners[index].winner.length - 4
                      )}
                    <span className="pl-2 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                      {"($" + data.winners[index].winningPool.toString() + ")"}
                    </span>
                  </Link>
                </div>
              ))
            : data.winners.every((winner) =>
                winner.winner.startsWith("0x000")
              ) && (
                <p className="text-center font-medium tracking-wide text-neutral-100">
                  No winners yet
                </p>
              )}
        </div>
      </div>
    </div>
  );
};

export default Claim;
