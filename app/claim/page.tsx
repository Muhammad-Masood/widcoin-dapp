import React from "react";
import Claim from "../components/Claim";
import { presaleContractEthers } from "../lib/thirdweb";
import { Stage } from "../lib/types";

const page = async () => {
  const isTradingEnabled = await presaleContractEthers.isTradingEnabled();
  const winnersTillCurrentStage = await Promise.all(
    Array.from({ length: 10 }, async (_, index) => {
      const stageDetails = await presaleContractEthers.getStageSpecs(index + 1);
      console.log(stageDetails);
      return stageDetails.winner;
    })
  );
  const currentStage = await presaleContractEthers.currentStage();

  console.log(winnersTillCurrentStage, isTradingEnabled);
  return (
    <div className="flex items-center justify-center">
      <Claim
        isTradingEnabled
        winners={winnersTillCurrentStage}
        currentStage={currentStage}
      />
    </div>
  );
};

export default page;
