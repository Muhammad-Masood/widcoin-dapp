import Image from "next/image";
import Presale from "./components/Presale";
export default function Home() {
  return (
    <div className="flex items-center justify-center">
      <Presale referral={undefined} />
    </div>
  );
}
