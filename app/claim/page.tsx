import React, { Suspense } from "react";
import Claim from "../components/Claim";
import { presaleContractEthers } from "../lib/thirdweb";
import { Stage } from "../lib/types";

const page = async () => {
  const isTradingEnabled = await presaleContractEthers.isTradingEnabled();
  const winnersTillCurrentStage = await Promise.all(
    Array.from({ length: 10 }, async (_, index) => {
      const stageDetails = await presaleContractEthers.getStageSpecs(index + 1);
      console.log(stageDetails);
      return {
        winner: stageDetails.winner,
        winningPool: Number(stageDetails.winningPool) / 1e8,
      };
    })
  );
  const currentStage = Number(await presaleContractEthers.currentStage());
  console.log(winnersTillCurrentStage, currentStage, isTradingEnabled);
  return (
    <Suspense>
      <div className="flex items-center justify-center">
        <Claim
          isTradingEnabled={isTradingEnabled}
          winners={winnersTillCurrentStage}
          currentStage={currentStage}
        />
      </div>
    </Suspense>
  );
};

export default page;
