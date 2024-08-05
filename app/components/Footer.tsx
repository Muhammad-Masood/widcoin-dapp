import React from "react";
import { presale_address, widcoin_address } from "../contract/data";

const Footer = () => {
  // Replace these URLs with your actual contract and presale URLs
  const tokenAddressUrl =
    `https://bscscan.com/address/${widcoin_address}`;
  const presaleAddressUrl = `https://bscscan.com/address/${presale_address}`;

  return (
    <footer className="bg-[#040C18] text-[#f1f1f1] py-5 text-center flex flex-col items-center">
      <p>&copy; 2024 WidCoin</p>
      <div className="flex items-center gap-4 mt-3">
        <a
          href={tokenAddressUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <img
            src={'/bsscan.png'}
            alt="bsscan_logo"
            className="w-6 h-6" // Adjust the size as needed
          />
          <span>WID Coin Contract</span>
        </a>
        <a
          href={presaleAddressUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <img
            src={'/bsscan.png'}
            alt="BSScan Logo"
            className="w-6 h-6" // Adjust the size as needed
          />
          <span>Presale Contract</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
