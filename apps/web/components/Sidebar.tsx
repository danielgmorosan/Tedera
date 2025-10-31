"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { WalletConnectButton } from "./wallet-connect-button";
import { useWallet } from "@/context/wallet-context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Copy, ExternalLink, LogOut } from "lucide-react";

const navData = [
  {
    name: "Home",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.6025 1.614C8.7217 1.5395 8.85944 1.5 9 1.5C9.14057 1.5 9.2783 1.5395 9.3975 1.614L14.5755 4.85025L9 8.13L3.4245 4.85025L8.6025 1.614ZM2.256 5.90325C2.25192 5.93534 2.24991 5.96766 2.25 6V12C2.25 12.1272 2.28236 12.2523 2.34402 12.3636C2.40568 12.4748 2.49463 12.5686 2.6025 12.636L8.25 16.1655V9.429L2.256 5.90325ZM9.75 16.1655L15.3975 12.636C15.5054 12.5686 15.5943 12.4748 15.656 12.3636C15.7176 12.2523 15.75 12.1272 15.75 12V6C15.75 5.9675 15.748 5.93525 15.744 5.90325L9.75 9.42825V16.1655Z"
          fill="black"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.6025 1.614C8.7217 1.5395 8.85944 1.5 9 1.5C9.14057 1.5 9.2783 1.5395 9.3975 1.614L14.5755 4.85025L9 8.13L3.4245 4.85025L8.6025 1.614ZM2.256 5.90325C2.25192 5.93534 2.24991 5.96766 2.25 6V12C2.25 12.1272 2.28236 12.2523 2.34402 12.3636C2.40568 12.4748 2.49463 12.5686 2.6025 12.636L8.25 16.1655V9.429L2.256 5.90325ZM9.75 16.1655L15.3975 12.636C15.5054 12.5686 15.5943 12.4748 15.656 12.3636C15.7176 12.2523 15.75 12.1272 15.75 12V6C15.75 5.9675 15.748 5.93525 15.744 5.90325L9.75 9.42825V16.1655Z"
          fill="url(#paint0_linear_64_47)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_64_47"
            x1="9"
            y1="1.5"
            x2="9"
            y2="16.1655"
            gradientUnits="userSpaceOnUse"
          >
            <stop />
            <stop offset="1" stopColor="#666666" />
          </linearGradient>
        </defs>
      </svg>
    ),
    route: "/",
  },
  {
    name: "Portfolio",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.0875 8.6625L11.625 7.125M7.5 9.75C7.5 10.1478 7.65804 10.5294 7.93934 10.8107C8.22064 11.092 8.60218 11.25 9 11.25C9.39782 11.25 9.77936 11.092 10.0607 10.8107C10.342 10.5294 10.5 10.1478 10.5 9.75C10.5 9.35218 10.342 8.97064 10.0607 8.68934C9.77936 8.40804 9.39782 8.25 9 8.25C8.60218 8.25 8.22064 8.40804 7.93934 8.68934C7.65804 8.97064 7.5 9.35218 7.5 9.75ZM4.8 14.9999C3.70361 14.1285 2.90543 12.9376 2.51608 11.5923C2.12673 10.247 2.16549 8.81385 2.62698 7.49154C3.08848 6.16923 3.94985 5.02321 5.09174 4.21231C6.23363 3.4014 7.59947 2.96576 9 2.96576C10.4005 2.96576 11.7664 3.4014 12.9083 4.21231C14.0501 5.02321 14.9115 6.16923 15.373 7.49154C15.8345 8.81385 15.8733 10.247 15.4839 11.5923C15.0946 12.9376 14.2964 14.1285 13.2 14.9999H4.8Z"
          stroke="#525866"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    route: "/portfolio",
  },
  {
    name: "Admin",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 13.5C12.3978 13.5 12.7794 13.658 13.0607 13.9393C13.342 14.2206 13.5 14.6022 13.5 15C13.5 14.6022 13.658 14.2206 13.9393 13.9393C14.2206 13.658 14.6022 13.5 15 13.5C14.6022 13.5 14.2206 13.342 13.9393 13.0607C13.658 12.7794 13.5 12.3978 13.5 12C13.5 12.3978 13.342 12.7794 13.0607 13.0607C12.7794 13.342 12.3978 13.5 12 13.5ZM12 4.5C12.3978 4.5 12.7794 4.65804 13.0607 4.93934C13.342 5.22064 13.5 5.60218 13.5 6C13.5 5.60218 13.658 5.22064 13.9393 4.93934C14.2206 4.65804 14.6022 4.5 15 4.5C14.6022 4.5 14.2206 4.34196 13.9393 4.06066C13.658 3.77936 13.5 3.39782 13.5 3C13.5 3.39782 13.342 3.77936 13.0607 4.06066C12.7794 4.34196 12.3978 4.5 12 4.5ZM6.75 13.5C6.75 12.3065 7.22411 11.1619 8.06802 10.318C8.91193 9.47411 10.0565 9 11.25 9C10.0565 9 8.91193 8.52589 8.06802 7.68198C7.22411 6.83807 6.75 5.69347 6.75 4.5C6.75 5.69347 6.27589 6.83807 5.43198 7.68198C4.58807 8.52589 3.44347 9 2.25 9C3.44347 9 4.58807 9.47411 5.43198 10.318C6.27589 11.1619 6.75 12.3065 6.75 13.5Z"
          stroke="#525866"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    route: "/admin",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const walletContext = useWallet();
  const account = walletContext?.account || null;
  const disconnect = walletContext?.disconnect || (() => {});

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
    }
  };

  const openExplorer = () => {
    if (!account) return;
    window.open(
      `https://hashscan.io/testnet/account/${account}`,
      "_blank"
    );
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-start relative bg-gray-100 overflow-hidden",
        "h-full",
        isExpanded ? "w-[240px] min-w-[240px]" : "w-[80px] min-w-[80px]"
      )}
      style={{
        width: isExpanded ? '240px' : '80px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'width',
        backfaceVisibility: 'hidden',
      }}
    >
      <div className={cn(
        "box-border flex-1 w-full flex flex-col gap-[8px]",
        isExpanded ? "items-start px-4" : "items-center px-4"
      )}
      style={{
        transition: 'opacity 0.3s ease-in-out',
        willChange: 'contents',
      }}>
        {/* Logo - positioned lower with padding-top */}
        <div className="pt-4">
          <Link
            href="/"
            className={cn(
              "relative rounded-[8px] shrink-0 flex items-center hover:opacity-90 cursor-pointer overflow-hidden",
              "h-[36px]",
              isExpanded ? "w-[36px] mb-2 justify-start" : "size-[36px] justify-center mx-auto"
            )}
            style={{
              transition: 'none',
            }}
            data-name="Icons"
            data-node-id="3:26970"
          >
          {/* Square Logo - Always visible, aligned left when expanded */}
          <div
            className="relative bg-[#080912] rounded-[8px] flex items-center justify-center pointer-events-none"
            style={{
              width: '36px',
              height: '36px',
              transition: 'none',
            }}
          >
            <svg
              width="22"
              height="16"
              viewBox="0 0 22 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[22px] h-[16px]"
            >
              <g clipPath="url(#clip0_3_26971)">
                <path
                  d="M21.7098 4.55859L21.6981 4.57031H10.7225C10.6526 4.57031 10.5569 4.58821 10.4618 4.61133C10.3626 4.63545 10.2494 4.66861 10.1376 4.7041C10.0264 4.73937 9.91346 4.77786 9.81433 4.81445L9.57312 4.91211C8.61541 5.34995 8.09772 6.13117 7.63855 6.91895C7.17385 7.71624 6.77249 8.51075 6.04871 9.06934H6.04773C5.89149 9.19077 5.55527 9.37687 5.20105 9.53418C5.02554 9.61212 4.84965 9.68123 4.69421 9.73047C4.53537 9.78078 4.41018 9.80661 4.33093 9.80664H0.182495V5.44336H6.32898C7.29646 5.44336 7.98943 5.12034 8.53992 4.63086C9.08357 4.14732 9.48639 3.50194 9.88074 2.87012C10.6775 1.59354 11.4556 0.35117 13.3104 0.206055L13.3094 0.205078L21.7098 0.146484V4.55859Z"
                  fill="url(#paint0_radial_3_26971)"
                  stroke="url(#paint1_linear_3_26971)"
                  strokeWidth="0.290909"
                />
                <path
                  d="M12.7061 8L13.5479 15.8545H7.7627L8.60449 8H12.7061Z"
                  fill="url(#paint2_radial_3_26971)"
                  stroke="url(#paint3_linear_3_26971)"
                  strokeWidth="0.290909"
                />
              </g>
              <defs>
                <radialGradient
                  id="paint0_radial_3_26971"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(10.9461 -0.473905) rotate(90) scale(17.2975 37.9221)"
                >
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <linearGradient
                  id="paint1_linear_3_26971"
                  x1="10.9461"
                  y1="0"
                  x2="10.9461"
                  y2="9.952"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" stopOpacity="0.8" />
                  <stop offset="0.780022" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <radialGradient
                  id="paint2_radial_3_26971"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(10.6551 7.46661) rotate(90) scale(14.1576 10.6182)"
                >
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <linearGradient
                  id="paint3_linear_3_26971"
                  x1="10.6551"
                  y1="7.85449"
                  x2="10.6551"
                  y2="15.9999"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" stopOpacity="0.8" />
                  <stop offset="0.780022" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <clipPath id="clip0_3_26971">
                  <rect
                    width="21.9259"
                    height="16"
                    fill="white"
                    transform="translate(0.0369873)"
                  />
                </clipPath>
              </defs>
            </svg>
            <div className="absolute inset-0 pointer-events-none shadow-[0px_4px_10px_0px_inset_rgba(255,255,255,0.18)]" />
            <div
              aria-hidden="true"
              className="absolute border border-[#080912] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_9px_6px_-8px_rgba(29,30,65,0.7),0px_0px_0px_1.5px_rgba(190,202,234,0.29)]"
            />
          </div>

        </Link>
        </div>

        <div className="h-0.5 w-full bg-gray-200 my-3 rounded-lg" />

        {navData.map((item, index) => {
          const checkMatch =
            (item.route === "/" && pathname === "/") ||
            item.route.split("/")[1] === pathname.split("/")[1];
          
          // Create dynamic icon based on active state
          const getDynamicIcon = () => {
            if (item.name === "Home") {
              return item.icon; // Home icon already has gradient
            }
            
            if (item.name === "Portfolio") {
              return (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.0875 8.6625L11.625 7.125M7.5 9.75C7.5 10.1478 7.65804 10.5294 7.93934 10.8107C8.22064 11.092 8.60218 11.25 9 11.25C9.39782 11.25 9.77936 11.092 10.0607 10.8107C10.342 10.5294 10.5 10.1478 10.5 9.75C10.5 9.35218 10.342 8.97064 10.0607 8.68934C9.77936 8.40804 9.39782 8.25 9 8.25C8.60218 8.25 8.22064 8.40804 7.93934 8.68934C7.65804 8.97064 7.5 9.35218 7.5 9.75ZM4.8 14.9999C3.70361 14.1285 2.90543 12.9376 2.51608 11.5923C2.12673 10.247 2.16549 8.81385 2.62698 7.49154C3.08848 6.16923 3.94985 5.02321 5.09174 4.21231C6.23363 3.4014 7.59947 2.96576 9 2.96576C10.4005 2.96576 11.7664 3.4014 12.9083 4.21231C14.0501 5.02321 14.9115 6.16923 15.373 7.49154C15.8345 8.81385 15.8733 10.247 15.4839 11.5923C15.0946 12.9376 14.2964 14.1285 13.2 14.9999H4.8Z"
                    stroke={checkMatch ? "url(#paint0_linear_portfolio)" : "#525866"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {checkMatch && (
                    <defs>
                      <linearGradient id="paint0_linear_portfolio" x1="9" y1="2.96576" x2="9" y2="14.9999" gradientUnits="userSpaceOnUse">
                        <stop />
                        <stop offset="1" stopColor="#666666" />
                      </linearGradient>
                    </defs>
                  )}
                </svg>
              );
            }
            
            if (item.name === "Admin") {
              return (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 13.5C12.3978 13.5 12.7794 13.658 13.0607 13.9393C13.342 14.2206 13.5 14.6022 13.5 15C13.5 14.6022 13.658 14.2206 13.9393 13.9393C14.2206 13.658 14.6022 13.5 15 13.5C14.6022 13.5 14.2206 13.342 13.9393 13.0607C13.658 12.7794 13.5 12.3978 13.5 12C13.5 12.3978 13.342 12.7794 13.0607 13.0607C12.7794 13.342 12.3978 13.5 12 13.5ZM12 4.5C12.3978 4.5 12.7794 4.65804 13.0607 4.93934C13.342 5.22064 13.5 5.60218 13.5 6C13.5 5.60218 13.658 5.22064 13.9393 4.93934C14.2206 4.65804 14.6022 4.5 15 4.5C14.6022 4.5 14.2206 4.34196 13.9393 4.06066C13.658 3.77936 13.5 3.39782 13.5 3C13.5 3.39782 13.342 3.77936 13.0607 4.06066C12.7794 4.34196 12.3978 4.5 12 4.5ZM6.75 13.5C6.75 12.3065 7.22411 11.1619 8.06802 10.318C8.91193 9.47411 10.0565 9 11.25 9C10.0565 9 8.91193 8.52589 8.06802 7.68198C7.22411 6.83807 6.75 5.69347 6.75 4.5C6.75 5.69347 6.27589 6.83807 5.43198 7.68198C4.58807 8.52589 3.44347 9 2.25 9C3.44347 9 4.58807 9.47411 5.43198 10.318C6.27589 11.1619 6.75 12.3065 6.75 13.5Z"
                    stroke={checkMatch ? "url(#paint0_linear_admin)" : "#525866"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {checkMatch && (
                    <defs>
                      <linearGradient id="paint0_linear_admin" x1="9" y1="3" x2="9" y2="15" gradientUnits="userSpaceOnUse">
                        <stop />
                        <stop offset="1" stopColor="#666666" />
                      </linearGradient>
                    </defs>
                  )}
                </svg>
              );
            }
            
            return item.icon;
          };
          
          return (
            <Link
              key={index}
              href={item.route}
              className={cn(
                "border border-transparent hover:bg-slate-100 rounded-lg transition-all duration-200 flex items-center gap-3",
                isExpanded ? "w-full px-3 py-2.5" : "size-9 grid place-items-center",
                checkMatch && "bg-white border-gray-200"
              )}
            >
              <span className={cn("flex-shrink-0", isExpanded && "w-[18px] h-[18px]")}>
                {getDynamicIcon()}
              </span>
              {isExpanded && (
                <span className={cn(
                  "text-sm font-medium whitespace-nowrap transition-opacity duration-300",
                  checkMatch ? "text-slate-900" : "text-slate-600"
                )}>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}

        {/* Toggle Button - Moved below navigation icons */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-2 rounded-lg hover:bg-slate-100 transition-all duration-200 text-slate-600 hover:text-slate-900",
            isExpanded ? "w-full px-3 py-2 justify-start" : "size-9 mx-auto justify-center"
          )}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <div className="h-0.5 w-full bg-gray-200 mb-3 mt-auto rounded-lg" />

        {/* Wallet Section */}
        <div className={cn("w-full transition-all duration-300 pb-6", !isExpanded && "flex justify-center")}>
          {isExpanded && account ? (
            <div className={cn(
              "p-3 bg-white rounded-lg border border-gray-200 space-y-3",
              "transition-opacity duration-300 ease-in-out",
              "opacity-100"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-emerald-500 rounded-full flex-shrink-0 animate-pulse"></div>
                <span className="text-xs font-medium text-slate-700">Connected Wallet</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Network</span>
                  <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    Hedera Testnet
                  </span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-xs text-slate-500">Address</span>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                    <code className="text-xs font-mono text-slate-700 flex-1 truncate">
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </code>
                    <button
                      onClick={copyAddress}
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                      title="Copy address"
                    >
                      <Copy className="h-3 w-3 text-slate-600" />
                    </button>
                    <button
                      onClick={openExplorer}
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                      title="View on explorer"
                    >
                      <ExternalLink className="h-3 w-3 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Disconnect Button */}
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg transition-colors duration-200 text-xs font-medium"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Disconnect Wallet</span>
              </button>
            </div>
          ) : (
            <WalletConnectButton />
          )}
        </div>
      </div>
    </div>
  );
}
