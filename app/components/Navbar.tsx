import React from "react";
import { ConnectButton } from "thirdweb/react";
import { client, wallets } from "../lib/thirdweb";
import Link from "next/link";
import Image from "next/image";
import wclogo from "@/public/wclogo.png";

const Navbar = () => {
  return (
    <div>
      <div className="header1 bg-[#040C18] text-[#f1f1f1] py-2" id="myHeader">
        <p className="text-center text-sm text-[#ec33bd]">
          PHISHING WARNING: please make sure you're visiting https://widcoin.net
          - check the URL carefully.
        </p>
      </div>

      <header className="bg-[#040C18] text-[#f1f1f1]">
        <div className="container mx-auto py-4 px-7">
          <nav className="navbar flex justify-between items-center">
            <a className="navbar-brand" href="/">
              <Image src={wclogo} height={60} width={60} alt="widcoin_logo" />
            </a>
            <div className="flex items-center space-x-7">
              {/* <Link className="nav-link text-white" href="#home">
                Home
              </Link>
              <Link className="nav-link text-white" href="#how">
                How To Buy
              </Link>
              <Link className="nav-link text-white" href="#token">
                Token Information
              </Link> */}
              <Link className="nav-link text-white" href="/claim">
                Claim
              </Link>
              {/* <Link className="nav-link text-white" href="#footer">
                Contact
              </Link> */}
              <ConnectButton client={client} wallets={wallets} />
            </div>
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
