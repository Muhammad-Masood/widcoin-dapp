import Image from "next/image";
import Presale from "../components/Presale";
export default function Home({ params }: { params: { address: string|undefined } }) {
  const { address } = params;
  return (
    <div className="flex items-center justify-center">
      <Presale referral={address}/>
    </div>
  );
}
