import Sidebar from "@/components/Sidebar";
import { SidebarHeader } from "@/components/ui/sidebar";
import React from "react";

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div
          className="bg-[#080912] relative rounded-[8px] shrink-0 size-[36px] flex items-center justify-center"
          data-name="Icons"
          data-node-id="3:26970"
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
      </SidebarHeader>
    </Sidebar>
  );
}
