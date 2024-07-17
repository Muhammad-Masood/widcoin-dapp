import Image from "next/image";
import Presale from "./components/Presale";
import { presaleContractEthers } from "./lib/thirdweb";
import { ethers } from "ethers";
import { Stage } from "./lib/types";
export default async function Home() {
  const currentStageNumber = await presaleContractEthers.currentStage();
  const stageDetails = await presaleContractEthers.getStageSpecs(
    currentStageNumber
  );
  const updatedSupplySold = ethers.formatEther(stageDetails.supplySold);
  const updatedStageSupply = ethers.formatEther(stageDetails.supplySold);
  const updatedMinPartcip = ethers.formatEther(stageDetails.minParticipationUSDT);
  const updatedTokenPrice = Number(stageDetails.tokenPrice)/1e8;
  const updatedStageDetails: Stage = {
    ...stageDetails,
    minParticipationUSDT: updatedMinPartcip,
    supplySold: updatedSupplySold,
    stageSupply: updatedStageSupply,
    tokenPrice: updatedTokenPrice
  }
  console.log(updatedStageDetails)
  return (
    <div className="flex items-center justify-center">
      <Presale referral={undefined} stageDetails={updatedStageDetails} stageNumber={currentStageNumber} />
    </div>
  );
}
