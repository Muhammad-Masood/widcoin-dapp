import Image from "next/image";
import Presale from "./components/Presale";
import { presaleContractEthers } from "./lib/thirdweb";
import { ethers } from "ethers";
import { Stage } from "./lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const isAirdropOpen = await presaleContractEthers.isAirdropOpen();
  const airdropEndTime = await presaleContractEthers.airdropEndTime();
  const currentStageNumber = await presaleContractEthers.currentStage();
  const stageDetails = await presaleContractEthers.getStageSpecs(
    currentStageNumber
  );
  const updatedSupplySold = ethers.formatEther(stageDetails.supplySold);
  const updatedStageSupply = ethers.formatEther(stageDetails.stageSupply);
  const updatedMinPartcip = Number(stageDetails.minParticipationUSDT) / 1e8;
  const updatedTokenPrice = Number(stageDetails.tokenPrice) / 1e8;
  const updatedStageDetails: Stage = {
    ...stageDetails,
    minParticipationUSDT: updatedMinPartcip,
    supplySold: updatedSupplySold,
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
      totalFundsRaised +=
        Number(ethers.formatEther(stageSpecs.supplySold)) *
        Number(ethers.formatUnits(stageSpecs.tokenPrice, 8));
      return stageSpecs;
    })
  );

  console.log(stageSpecs, totalFundsRaised);

  const calculateInitialCountdown = () => {
    const now = Date.now();
    const distance = Number(airdropEndTime) * 1000 - now;
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const countdown: string = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    return countdown;
  };

  return (
    <div className="flex items-center justify-center">
      <Presale
        initialAirdropCountdown={
          isAirdropOpen ? calculateInitialCountdown() : ""
        }
        isAirdropOpen={isAirdropOpen}
        airdropEndTime={Number(airdropEndTime)}
        referral={undefined}
        stageDetails={updatedStageDetails}
        stageNumber={currentStageNumber}
        totalFundsRaised={totalFundsRaised}
      />
    </div>
  );
}
