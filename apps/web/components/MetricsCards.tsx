export default function MetricsCards() {
  const imgLineChart = "/portfolio/Metrics.svg";

  return (
    <div className="content-stretch grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-[20px]  h-full relative  w-full">
      {/* Total Invested Card */}
      <div className="bg-white box-border h-full content-stretch flex flex-col gap-[12px]  overflow-clip p-[16px] relative rounded-[10px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.07),0px_10px_24px_-8px_rgba(42,51,70,0.03)] size-full">
        <div
          className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full"
          data-node-id="2:4715"
        >
          <p
            className="basis-0 css-9flwuj font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#0a0d14] text-[12px] tracking-[-0.12px]"
            data-node-id="2:4716"
          >
            Total invested
          </p>
        </div>
        <div
          className="basis-0 content-stretch flex gap-[16px] grow items-end min-h-px min-w-px relative shrink-0 w-full"
          data-node-id="2:4718"
        >
          <div
            className="basis-0 content-stretch flex flex-col gap-[8px] grow  justify-end min-h-px min-w-px relative shrink-0"
            data-node-id="2:4719"
          >
            <p
              className="css-k0nvzb font-['Inter:Semi_Bold',_sans-serif] font-medium leading-[1.2] not-italic relative shrink-0 text-[#0a0d14] text-[22px] text-nowrap whitespace-pre"
              data-node-id="2:4720"
            >
              $98,450
            </p>
            <div
              className="content-stretch flex gap-[6px] items-center relative shrink-0"
              data-node-id="2:4721"
            >
              <div
                className="content-stretch flex gap-[3px] items-center relative shrink-0"
                data-node-id="2:4722"
              >
                <div
                  className="relative shrink-0 size-[8px]"
                  data-name="bxs:up-arrow"
                  data-node-id="2:4723"
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M4 1L6.5 4H1.5L4 1Z" fill="#2d9f75" />
                  </svg>
                </div>
                <p
                  className="css-c8nvji font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[1.4] not-italic relative shrink-0 text-[#2d9f75] text-[12px] text-nowrap whitespace-pre"
                  data-node-id="2:4725"
                >
                  12.5%
                </p>
              </div>
              <p
                className="css-668lj font-['Inter:Medium',_sans-serif] font-medium leading-[1.4] not-italic relative shrink-0 text-[#868c98] text-[12px] text-nowrap whitespace-pre"
                data-node-id="2:4726"
              >
                from last month
              </p>
            </div>
          </div>
          <div
            className="h-[71px] overflow-clip relative shrink-0 w-[112px]"
            data-node-id="2:4727"
          >
            {/* Background dots removed - decorative element */}
            <div
              className="absolute h-[80px] left-[-22px] w-[175px]"
              data-name="Line Chart"
              data-node-id="2:7529"
            >
              <img
                alt=""
                className="block max-w-none size-full"
                src={imgLineChart}
              />
            </div>
            {/* Decorative group element removed */}
            <p
              className="absolute css-c8nvji font-['Inter:Medium',_sans-serif] font-medium leading-[1.4] left-[65px] not-italic text-[#2d9f75] text-[10px] text-nowrap top-[-2px] whitespace-pre"
              data-node-id="2:7538"
            >
              +$12,180
            </p>
          </div>
        </div>
      </div>

      {/* Current Value Card */}
      <div
        className="bg-white h-full box-border content-stretch flex flex-col gap-[12px]  overflow-clip p-[16px] relative rounded-[12px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.07),0px_10px_24px_-8px_rgba(42,51,70,0.03)] size-full"
        data-node-id="3:98663"
      >
        <div
          className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full"
          data-node-id="3:98664"
        >
          <p
            className="basis-0 css-9flwuj font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#0a0d14] text-[12px] tracking-[-0.12px]"
            data-node-id="3:98665"
          >
            Current Value
          </p>
          <div
            className="overflow-clip relative shrink-0 size-[14px]"
            data-name="info-circle"
            data-node-id="3:98666"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 12.25C9.89949 12.25 12.25 9.89949 12.25 7C12.25 4.10051 9.89949 1.75 7 1.75C4.10051 1.75 1.75 4.10051 1.75 7C1.75 9.89949 4.10051 12.25 7 12.25Z"
                stroke="rgba(205, 208, 213, 1)"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 4.375V7L8.75 8.75"
                stroke="rgba(205, 208, 213, 1)"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div
          className="content-stretch flex flex-col gap-[12px]  relative shrink-0 w-full"
          data-node-id="3:98667"
        >
          <div
            className="content-stretch flex items-end justify-between relative shrink-0 w-full"
            data-node-id="3:98668"
          >
            <div
              className="content-stretch flex gap-[8px] items-end relative shrink-0"
              data-node-id="3:98669"
            >
              <p
                className="css-wjv8op font-['Inter_Display:SemiBold',_sans-serif] leading-[1.2] not-italic relative shrink-0 text-[#0a0d14] text-[20px] text-nowrap whitespace-pre"
                data-node-id="3:98670"
              >
                150
              </p>
              <div
                className="content-stretch flex gap-[4px] items-center relative shrink-0"
                data-node-id="3:98671"
              >
                <div
                  className="content-stretch flex gap-[3px] items-center relative shrink-0"
                  data-node-id="3:98672"
                >
                  <div
                    className="relative shrink-0 size-[8px]"
                    data-name="bxs:up-arrow"
                    data-node-id="3:98673"
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M4 1L6.5 4H1.5L4 1Z" fill="#2d9f75" />
                    </svg>
                  </div>
                  <p
                    className="css-67x1rm font-['Inter_Display:SemiBold',_sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#2d9f75] text-[12px] text-nowrap whitespace-pre"
                    data-node-id="3:98675"
                  >
                    4.5%
                  </p>
                </div>
              </div>
            </div>
            <div
              className="content-stretch flex gap-[3px] items-center leading-[1.4] not-italic relative shrink-0 text-nowrap whitespace-pre"
              data-node-id="3:98676"
            >
              <p
                className="css-67x1rm font-['Inter_Display:SemiBold',_sans-serif] relative shrink-0 text-[#2d9f75] text-[12px]"
                data-node-id="3:98677"
              >
                80%
              </p>
              <p
                className="css-imr5wn font-['Inter_Display:Medium',_sans-serif] relative shrink-0 text-[#868c98] text-[11px]"
                data-node-id="3:98678"
              >
                Progress goal
              </p>
            </div>
          </div>
          <div
            className="relative rounded-[100px] shrink-0 w-[240px] h-[20px] group cursor-pointer"
            data-node-id="3:98679"
            style={{
              background: "rgba(245, 245, 245, 0.01)",
              boxShadow:
                "0px 5px 5px -2.5px rgba(42, 51, 70, 0.03), 0px 0px 0px 1px rgba(0, 0, 0, 0.07)",
              borderRadius: "100px",
            }}
          >
            <div className="flex flex-row p-[5px_6px] gap-[5px] w-[240px] h-[20px]">
              <div
                className="flex flex-col p-0 gap-[10px] w-[228px] h-[10px] bg-[#F5F5F5] rounded-[100px] flex-none order-0 flex-grow-1 relative overflow-hidden group-hover:bg-[#EEEEEE] transition-all duration-300"
                data-node-id="3:98680"
              >
                <div
                  className="w-[182px] h-[10px] bg-[#48CAA1] rounded-[31px] flex-none order-0 flex-grow-0 relative transition-all duration-500 ease-out group-hover:bg-[#3AB08A] group-hover:scale-105 group-hover:shadow-lg"
                  data-node-id="3:98681"
                  style={{
                    boxShadow:
                      "0px 2px 4px -2px rgba(45, 159, 117, 0.4), inset 0px 3px 4px rgba(255, 255, 255, 0.3)",
                    animation: "progressFill 2s ease-out forwards",
                  }}
                />
                {/* Animated shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              </div>
            </div>
            {/* Tooltip on hover */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              80% Complete
            </div>
          </div>
          <div
            className="content-stretch flex gap-[6px]  relative shrink-0 w-full"
            data-node-id="3:98682"
          >
            <p
              className="basis-0 css-668lj font-['Inter:Medium',_sans-serif] font-medium grow leading-[1.5] min-h-px min-w-px not-italic relative shrink-0 text-[#868c98] text-[10px]"
              data-node-id="3:98683"
            >
              You're currently at 80% of your value goal. keep it up!
            </p>
          </div>
        </div>
      </div>

      {/* Total Profit Received Card */}
      <div className=" h-full bg-white box-border content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px overflow-clip p-[16px] relative rounded-[10px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.07),0px_10px_24px_-8px_rgba(42,51,70,0.03)] shrink-0">
        <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
          <p className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#0a0d14] text-[12px] tracking-[-0.12px]">
            Total Profit Received
          </p>
        </div>
        <div className="basis-0 content-stretch flex grow items-end justify-between min-h-px min-w-px relative shrink-0 w-[272px]">
          <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0">
            <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.2] not-italic relative shrink-0 text-[#0a0d14] text-[22px] text-nowrap whitespace-pre">
              45.2%
            </p>
            <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
              <div className="content-stretch flex gap-[3px] items-center relative shrink-0">
                <div className="relative shrink-0 size-[8px]">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M4 1L6.5 4H1.5L4 1Z" fill="#2d9f75" />
                  </svg>
                </div>
                <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[1.4] not-italic relative shrink-0 text-[#2d9f75] text-[12px] text-nowrap whitespace-pre">
                  9.2%
                </p>
              </div>
              <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.4] not-italic relative shrink-0 text-[#868c98] text-[12px] text-nowrap whitespace-pre">
                growth
              </p>
            </div>
          </div>
          <div className="content-stretch flex gap-[2px] items-end relative shrink-0 w-[145px] pr-6">
            <div className="basis-0 content-stretch flex flex-col gap-[2px] grow items-center justify-center min-h-px min-w-px relative shrink-0 group cursor-pointer">
              <div
                className="bg-[rgba(56,198,153,0.2)] h-[37px] rounded-[2px] shrink-0 w-full transition-all duration-500 ease-out hover:bg-[rgba(56,198,153,0.4)] hover:scale-105 group-hover:shadow-lg relative overflow-hidden"
                style={{
                  animation: "barGrow 1.5s ease-out forwards",
                  animationDelay: "0.2s",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(56,198,153,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              </div>
              <div className="box-border content-stretch flex gap-[10px] h-[12px] items-center justify-center px-[2px] py-0 relative rounded-[100px] shrink-0">
                <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(134,140,152,0.7)] text-center text-nowrap">
                  <p className="leading-[1.4] whitespace-pre">Apr</p>
                </div>
              </div>
            </div>
            <div className="basis-0 content-stretch flex flex-col gap-[2px] grow items-center justify-center min-h-px min-w-px relative shrink-0 group cursor-pointer">
              <div
                className="bg-[rgba(56,198,153,0.2)] h-[51px] rounded-[2px] shrink-0 w-full transition-all duration-500 ease-out hover:bg-[rgba(56,198,153,0.4)] hover:scale-105 group-hover:shadow-lg relative overflow-hidden"
                style={{
                  animation: "barGrow 1.5s ease-out forwards",
                  animationDelay: "0.4s",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(56,198,153,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              </div>
              <div className="box-border content-stretch flex gap-[10px] h-[12px] items-center justify-center px-[2px] py-0 relative rounded-[100px] shrink-0">
                <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(134,140,152,0.7)] text-center text-nowrap">
                  <p className="leading-[1.4] whitespace-pre">May</p>
                </div>
              </div>
            </div>
            <div className="basis-0 content-stretch flex flex-col gap-[2px] grow items-center justify-center min-h-px min-w-px relative shrink-0 group cursor-pointer">
              <div
                className="bg-[rgba(56,198,153,0.2)] h-[44px] rounded-[2px] shrink-0 w-full transition-all duration-500 ease-out hover:bg-[rgba(56,198,153,0.4)] hover:scale-105 group-hover:shadow-lg relative overflow-hidden"
                style={{
                  animation: "barGrow 1.5s ease-out forwards",
                  animationDelay: "0.6s",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(56,198,153,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              </div>
              <div className="box-border content-stretch flex gap-[10px] h-[12px] items-center justify-center px-[2px] py-0 relative rounded-[100px] shrink-0">
                <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(134,140,152,0.7)] text-center text-nowrap">
                  <p className="leading-[1.4] whitespace-pre">Jun</p>
                </div>
              </div>
            </div>
            <div className="basis-0 content-stretch flex flex-col gap-[2px] grow items-center justify-center min-h-px min-w-px relative shrink-0 group cursor-pointer">
              <div
                className="bg-[rgba(56,198,153,0.2)] h-[39px] rounded-[2px] shrink-0 w-full transition-all duration-500 ease-out hover:bg-[rgba(56,198,153,0.4)] hover:scale-105 group-hover:shadow-lg relative overflow-hidden"
                style={{
                  animation: "barGrow 1.5s ease-out forwards",
                  animationDelay: "0.8s",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(56,198,153,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              </div>
              <div className="box-border content-stretch flex gap-[10px] h-[12px] items-center justify-center px-[2px] py-0 relative rounded-[100px] shrink-0">
                <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(134,140,152,0.7)] text-center text-nowrap">
                  <p className="leading-[1.4] whitespace-pre">Jul</p>
                </div>
              </div>
            </div>
            <div className="basis-0 content-stretch flex flex-col gap-[2px] grow items-center justify-center min-h-px min-w-px relative shrink-0 group cursor-pointer">
              <div
                className="bg-[#38c699] h-[50px] relative rounded-[2px] shrink-0 w-full transition-all duration-500 ease-out hover:bg-[#2db085] hover:scale-105 group-hover:shadow-lg overflow-hidden"
                style={{
                  animation: "barGrow 1.5s ease-out forwards",
                  animationDelay: "1.0s",
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute border-[0.5px] border-solid border-white inset-0 rounded-[2px]"
                />
                <div className="absolute inset-0 shadow-[0px_-8px_18px_0px_inset_rgba(255,255,255,0.3)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(56,198,153,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              </div>
              <div className="box-border content-stretch flex gap-[10px] h-[12px] items-center justify-center px-[2px] py-0 relative rounded-[100px] shrink-0">
                <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(134,140,152,0.7)] text-center text-nowrap">
                  <p className="leading-[1.4] whitespace-pre">Aug</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Return Card */}
      <div
        className="bg-white h-full box-border content-stretch flex flex-col gap-[10.899px] items-start overflow-clip p-[14.533px] relative rounded-[10.899px] shadow-[0px_0px_0px_0.908px_rgba(0,0,0,0.07),0px_9.083px_21.799px_-7.266px_rgba(42,51,70,0.03)] size-full"
        data-node-id="3:98686"
      >
        <div
          className="content-stretch flex gap-[9.083px] items-center justify-center relative shrink-0 w-full"
          data-node-id="3:98687"
        >
          <p
            className="basis-0 css-a3ue0k font-['Inter:Medium',_sans-serif] font-medium grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#0a0d14] text-[10.899px] tracking-[-0.109px]"
            data-node-id="3:98688"
          >
            Total Return
          </p>
          <div
            className="overflow-clip relative shrink-0 size-[12.716px]"
            data-name="info-circle"
            data-node-id="3:98689"
          >
            <svg width="12.716" height="12.716" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 12.25C9.89949 12.25 12.25 9.89949 12.25 7C12.25 4.10051 9.89949 1.75 7 1.75C4.10051 1.75 1.75 4.10051 1.75 7C1.75 9.89949 4.10051 12.25 7 12.25Z"
                stroke="rgba(205, 208, 213, 1)"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 4.375V7L8.75 8.75"
                stroke="rgba(205, 208, 213, 1)"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div
          className="basis-0 content-stretch flex flex-col gap-[7.266px] grow items-start min-h-px min-w-px relative shrink-0 w-full"
          data-node-id="3:98690"
        >
          <div
            className="basis-0 bg-[#f7f7f7] grow min-h-px min-w-px relative rounded-[6.358px] shrink-0 w-full"
            data-node-id="3:98691"
            style={{
              borderRadius: "6.358px",
              border: "0.908px solid #FFF",
              background: "#F7F7F7",
              boxShadow: "0 0 0 0.908px rgba(0, 0, 0, 0.07)",
            }}
          >
            <div
              className="box-border content-stretch flex h-full items-center justify-between overflow-clip px-[10.899px] py-[4.541px] relative w-full"
              style={{
                display: "flex",
                width: "100%",
                padding: "4.541px 10.899px",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                className="content-stretch flex gap-[9.083px] items-end relative shrink-0"
                data-node-id="3:98692"
              >
                <p
                  className="css-wjv8op font-['Inter_Display:SemiBold',_sans-serif] leading-[1.2] not-italic relative shrink-0 text-[#0a0d14] text-[18.166px] w-[32.698px]"
                  data-node-id="3:98693"
                >
                  102
                </p>
                <div
                  className="content-stretch flex gap-[2.725px] h-[18.166px] items-center relative shrink-0"
                  data-node-id="3:98694"
                >
                  <div
                    className="relative shrink-0 size-[7.266px]"
                    data-name="bxs:up-arrow"
                    data-node-id="3:98695"
                  >
                    <svg
                      width="7.266"
                      height="7.266"
                      viewBox="0 0 8 8"
                      fill="none"
                    >
                      <path d="M4 1L6.5 4H1.5L4 1Z" fill="#2d9f75" />
                    </svg>
                  </div>
                  <p
                    className="css-67x1rm font-['Inter_Display:SemiBold',_sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#2d9f75] text-[10.899px] text-nowrap whitespace-pre"
                    data-node-id="3:98697"
                  >
                    80
                  </p>
                </div>
              </div>
              <p
                className="css-imr5wn font-['Inter_Display:Medium',_sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#868c98] text-[10.899px] text-nowrap whitespace-pre"
                data-node-id="3:98698"
              >
                Adequate Stock
              </p>
            </div>
            <div
              aria-hidden="true"
              className="absolute border-[0.908px] border-solid border-white inset-0 pointer-events-none rounded-[6.358px] shadow-[0px_0px_0px_0.908px_rgba(0,0,0,0.07)]"
            />
          </div>
          <div
            className="basis-0 bg-[#f7f7f7] grow min-h-px min-w-px relative rounded-[6.358px] shrink-0 w-full"
            data-node-id="3:98699"
            style={{
              borderRadius: "6.358px",
              border: "0.908px solid #FFF",
              background: "#F7F7F7",
              boxShadow: "0 0 0 0.908px rgba(0, 0, 0, 0.07)",
            }}
          >
            <div
              className="box-border content-stretch flex h-full items-center justify-between overflow-clip px-[10.899px] py-[4.541px] relative w-full"
              style={{
                display: "flex",
                width: "100%",
                padding: "4.541px 10.899px",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                className="content-stretch flex gap-[7.266px] items-end relative shrink-0"
                data-node-id="3:98700"
              >
                <p
                  className="css-wjv8op font-['Inter_Display:SemiBold',_sans-serif] leading-[1.2] not-italic relative shrink-0 text-[#0a0d14] text-[18.166px] text-nowrap whitespace-pre"
                  data-node-id="3:98701"
                >
                  18
                </p>
                <div
                  className="content-stretch flex gap-[2.725px] h-[18.166px] items-center w-full relative shrink-0"
                  data-node-id="3:98702"
                >
                  <div className="flex items-center justify-center relative shrink-0">
                    <div className="flex-none scale-y-[-100%]">
                      <div
                        className="relative size-[7.266px]"
                        data-node-id="3:98703"
                      >
                        <svg
                          width="7.266"
                          height="7.266"
                          viewBox="0 0 8 8"
                          fill="none"
                        >
                          <path d="M4 7L1.5 4H6.5L4 7Z" fill="#d84e68" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p
                    className="css-2qvfzs font-['Inter_Display:SemiBold',_sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#d84e68] text-[10.899px] text-nowrap whitespace-pre"
                    data-node-id="3:98705"
                  >
                    10
                  </p>
                </div>
              </div>
              <p
                className="css-imr5wn font-['Inter_Display:Medium',_sans-serif] leading-[1.4] not-italic relative shrink-0 text-[#868c98] text-[10.899px] text-nowrap whitespace-pre"
                data-node-id="3:98706"
              >
                Low Stock
              </p>
            </div>
            <div
              aria-hidden="true"
              className="absolute border-[0.908px] border-solid border-white inset-0 pointer-events-none rounded-[6.358px] shadow-[0px_0px_0px_0.908px_rgba(0,0,0,0.07)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
