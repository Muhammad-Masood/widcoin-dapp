// "use server";
import Image from "next/image";
import Presale from "./components/Presale";
import { presaleContractEthers } from "./lib/thirdweb";
import { ethers } from "ethers";
import { Stage } from "./lib/types";
import { calculateInitialCountdown } from "@/lib/utils";
import { Suspense } from "react";

// export const dynamic = "force-dynamic";

export default async function Home() {
  const isAirdropOpen = await presaleContractEthers.isAirdropOpen();
  const airdropEndTime = await presaleContractEthers.airdropEndTime();
  const currentStageNumber = await presaleContractEthers.currentStage();
  const stageDetails = await presaleContractEthers.getStageSpecs(
    currentStageNumber
  );
  const updatedStageSupply = ethers.formatEther(stageDetails.stageSupply);
  const supplySoldFormat = Number(ethers.formatEther(stageDetails.supplySold));
  const remainingSupply = Number(updatedStageSupply) - supplySoldFormat;
  const updatedMinPartcip = Number(stageDetails.minParticipationUSDT) / 1e8;
  const updatedTokenPrice = Number(stageDetails.tokenPrice) / 1e8;
  const updatedStageDetails: Stage = {
    ...stageDetails,
    minParticipationUSDT: updatedMinPartcip,
    supplyRemaining: remainingSupply,
    stageSupply: updatedStageSupply,
    tokenPrice: updatedTokenPrice,
  };

  const currentStage = await presaleContractEthers.currentStage();
  let totalFundsRaised: number = 0;
  const stageSpecs = await Promise.all(
    Array.from({ length: Number(currentStage) }, async (_, index) => {
      const stageSpecs: Stage = await presaleContractEthers.getStageSpecs(
        index + 1
      );
      const supplySoldFormat = Number(
        ethers.formatEther(stageSpecs.supplySold!)
      );
      totalFundsRaised +=
        supplySoldFormat * Number(ethers.formatUnits(stageSpecs.tokenPrice, 8));
      return stageSpecs;
    })
  );

  return (
    <Suspense>
      <div className="flex items-center justify-center">
        <Presale
          initialAirdropCountdown={
            isAirdropOpen ? calculateInitialCountdown(airdropEndTime) : ""
          }
          isAirdropOpen={isAirdropOpen}
          airdropEndTime={Number(airdropEndTime)}
          // referral={undefined}
          stageDetails={updatedStageDetails}
          stageNumber={currentStageNumber}
          totalFundsRaised={totalFundsRaised}
        />
      </div>
    </Suspense>
  );
}
