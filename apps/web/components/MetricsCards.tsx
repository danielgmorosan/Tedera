import { PortfolioMetrics } from "@/lib/services/portfolioService";
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, Tooltip, Dot } from 'recharts';

interface MetricsCardsProps {
  metrics: PortfolioMetrics;
  isDemoMode: boolean;
}

export default function MetricsCards({ metrics, isDemoMode }: MetricsCardsProps) {
  // Demo data
  const demoMetrics = {
    totalInvested: 98450, // in HBAR
    currentValue: 125430.50, // in HBAR
    totalProfit: 45.2, // in HBAR (claimable)
    totalDividendsReceived: 1234.5, // in HBAR (all dividends)
    roi: 1.25, // ROI as percentage
    totalReturn: {
      amount: 26980.50, // in USD
      percentage: 27.4,
    },
    totalHoldings: 150,
    activeProperties: 102,
    monthlyProfit: [
      { month: 'Jun', amount: 150 },
      { month: 'Jul', amount: 220 },
      { month: 'Aug', amount: 180 },
      { month: 'Sep', amount: 160 },
      { month: 'Oct', amount: 250 },
    ],
    investmentHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 70000 + (i * 1000),
    })),
    monthlyChange: 12.5,
  };

  const displayMetrics = isDemoMode ? demoMetrics : metrics;

  // Format currency (USD)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format HBAR (similar to formatHBAR in HoldingsTable)
  const formatHBAR = (amount: number): string => {
    const rounded = Math.round(amount * 100) / 100; // Round to 2 decimals
    if (rounded % 1 === 0) {
      return `${Math.round(rounded)} HBAR`;
    }
    return `${rounded.toFixed(2).replace(/\.?0+$/, '')} HBAR`;
  };

  // Get monthly change (use real data if available)
  const monthlyChange = isDemoMode ? 12.5 : (displayMetrics.monthlyChange || 0);

  // Prepare investment history for line chart (last 30 days)
  const investmentChartData = displayMetrics.investmentHistory?.slice(-30) || [];
  const maxInvestment = Math.max(...investmentChartData.map(d => d.amount || 0), displayMetrics.totalInvested);
  const minInvestment = Math.min(...investmentChartData.map(d => d.amount || 0), displayMetrics.totalInvested * 0.7);

  // Prepare monthly profit data for bar chart
  const profitChartData = displayMetrics.monthlyProfit || [];
  const maxProfit = Math.max(...profitChartData.map(d => d.amount || 0), 1);

  return (
    <div className="content-stretch grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-[20px]  h-full relative  w-full">
      {/* Total Invested Card - Chart Only */}
      <div className="bg-white box-border h-full content-stretch flex flex-col gap-[12px] overflow-clip p-[16px] relative rounded-[10px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.07),0px_10px_24px_-8px_rgba(42,51,70,0.03)] size-full">
        <div
          className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full"
        >
          <p
            className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#0a0d14] text-[12px] tracking-[-0.12px]"
          >
            Total invested
          </p>
        </div>
        <div
          className="flex-1 w-full h-full min-h-0 relative"
        >
          {investmentChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={investmentChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="investmentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d9f75" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2d9f75" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#2d9f75"
                  strokeWidth={2}
                  fill="url(#investmentGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#2d9f75', stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }}
                  labelStyle={{
                    color: '#868c98',
                    fontSize: '10px',
                    fontWeight: 500,
                  }}
                  formatter={(value: number) => formatHBAR(value)}
                  cursor={{ stroke: '#2d9f75', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
              No data
            </div>
          )}
        </div>
      </div>

      {/* ROI Card */}
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
            ROI
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
                {formatHBAR(displayMetrics.totalDividendsReceived || 0)}
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
                    {displayMetrics.roi?.toFixed(2) || '0.00'}%
                  </p>
                </div>
              </div>
            </div>
            <div
              className="content-stretch flex gap-[3px] items-center leading-[1.4] not-italic relative shrink-0 text-nowrap whitespace-pre"
              data-node-id="3:98676"
            >
              <p
                className="css-imr5wn font-['Inter_Display:Medium',_sans-serif] relative shrink-0 text-[#868c98] text-[11px]"
                data-node-id="3:98678"
              >
                Return on Investment
              </p>
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
              {formatHBAR(displayMetrics.totalDividendsReceived || 0)} made back from {formatHBAR(displayMetrics.totalInvested)} invested
            </p>
          </div>
        </div>
      </div>

      {/* Available HBAR to Claim Card */}
      <div className=" h-full bg-white box-border content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px overflow-clip p-[16px] relative rounded-[10px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.07),0px_10px_24px_-8px_rgba(42,51,70,0.03)] shrink-0">
        <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
          <p className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#0a0d14] text-[12px] tracking-[-0.12px]">
            Available HBAR to Claim
          </p>
        </div>
        <div className="basis-0 content-stretch flex grow items-end justify-between min-h-px min-w-px relative shrink-0 w-[272px]">
          <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0">
            <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.2] not-italic relative shrink-0 text-[#0a0d14] text-[22px] text-nowrap whitespace-pre">
              {formatHBAR(displayMetrics.totalProfit)}
            </p>
          </div>
          <div className="content-stretch flex gap-[2px] items-end relative shrink-0 w-[145px] pr-6">
            {profitChartData.length > 0 ? (
              profitChartData.map((item, index) => {
                const height = maxProfit > 0 ? (item.amount / maxProfit) * 50 : 0;
                const isLatest = index === profitChartData.length - 1;
                return (
                  <div key={item.month} className="basis-0 content-stretch flex flex-col gap-[2px] grow items-center justify-center min-h-px min-w-px relative shrink-0 group cursor-pointer">
                    <div
                      className={`rounded-[2px] shrink-0 w-full transition-all duration-500 ease-out hover:scale-105 group-hover:shadow-lg relative overflow-hidden ${
                        isLatest ? 'bg-[#38c699]' : 'bg-[rgba(56,198,153,0.2)]'
                      }`}
                      style={{
                        height: `${Math.max(20, height)}px`,
                        animation: `barGrow 1.5s ease-out forwards`,
                        animationDelay: `${(index + 1) * 0.2}s`,
                      }}
                    >
                      {isLatest && (
                        <>
                          <div aria-hidden="true" className="absolute border-[0.5px] border-solid border-white inset-0 rounded-[2px]" />
                          <div className="absolute inset-0 shadow-[0px_-8px_18px_0px_inset_rgba(255,255,255,0.3)]" />
                        </>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(56,198,153,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                    </div>
                    {/* Hover tooltip showing HBAR earned in that month */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {formatHBAR(item.amount)}
                    </div>
                    <div className="box-border content-stretch flex gap-[10px] h-[12px] items-center justify-center px-[2px] py-0 relative rounded-[100px] shrink-0">
                      <div className="flex flex-col font-['Inter:Medium',_sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-[rgba(134,140,152,0.7)] text-center text-nowrap">
                        <p className="leading-[1.4] whitespace-pre">{item.month}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback to demo bars if no data
              ['Apr', 'May', 'Jun', 'Jul', 'Aug'].map((month, index) => (
                <div key={month} className="basis-0 content-stretch flex flex-col gap-[2px] grow items-center justify-center min-h-px min-w-px relative shrink-0">
                  <div className="bg-[rgba(56,198,153,0.2)] h-[37px] rounded-[2px] shrink-0 w-full" />
                  <div className="box-border content-stretch flex gap-[10px] h-[12px] items-center justify-center px-[2px] py-0 relative rounded-[100px] shrink-0">
                    <p className="text-[10px] text-[rgba(134,140,152,0.7)]">{month}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Overview Card - Live Data */}
      <div
        className="bg-white h-full box-border content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative rounded-[10px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.07),0px_10px_24px_-8px_rgba(42,51,70,0.03)] size-full"
      >
        <div
          className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full"
        >
          <p
            className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[1.4] min-h-px min-w-px not-italic relative shrink-0 text-[#0a0d14] text-[12px] tracking-[-0.12px]"
          >
            Portfolio Overview
          </p>
        </div>
        <div
          className="flex-1 content-stretch flex flex-col gap-[10px] items-start min-w-0 relative shrink-0 w-full overflow-visible"
        >
          {/* Active Properties */}
          <div className="bg-[#f7f7f7] w-full rounded-[8px] p-3 border border-gray-100 min-h-0 overflow-visible">
            <div className="flex items-center justify-between mb-2">
              <p className="font-['Inter:Medium',_sans-serif] font-medium text-[#868c98] text-[11px] leading-tight whitespace-nowrap">
                Active Properties
              </p>
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></div>
            </div>
            <p className="font-['Inter_Display:SemiBold',_sans-serif] font-semibold text-[#0a0d14] text-[20px] leading-tight mb-1">
              {displayMetrics.activeProperties || 0}
            </p>
            <p className="font-['Inter:Medium',_sans-serif] font-medium text-[#868c98] text-[10px] leading-tight whitespace-normal break-words">
              of {displayMetrics.totalHoldings || 0} total holdings
            </p>
          </div>

          {/* Portfolio Value Change */}
          <div className="bg-[#f7f7f7] w-full rounded-[8px] p-3 border border-gray-100 min-h-0 overflow-visible">
            <div className="flex items-center justify-between mb-2">
              <p className="font-['Inter:Medium',_sans-serif] font-medium text-[#868c98] text-[11px] leading-tight whitespace-nowrap">
                Portfolio Value
              </p>
              {((displayMetrics.currentValue - displayMetrics.totalInvested) >= 0) ? (
                <svg width="12" height="12" viewBox="0 0 8 8" fill="none" className="shrink-0">
                  <path d="M4 1L6.5 4H1.5L4 1Z" fill="#2d9f75" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 8 8" fill="none" className="shrink-0">
                  <path d="M4 7L6.5 4H1.5L4 7Z" fill="#d84e68" />
                </svg>
              )}
            </div>
            <p className="font-['Inter_Display:SemiBold',_sans-serif] font-semibold text-[#0a0d14] text-[20px] leading-tight mb-1 break-words">
              {formatHBAR(displayMetrics.currentValue)}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-['Inter:Medium',_sans-serif] font-medium text-[10px] leading-tight whitespace-nowrap ${
                (displayMetrics.currentValue - displayMetrics.totalInvested) >= 0 ? 'text-[#2d9f75]' : 'text-[#d84e68]'
              }`}>
                {(displayMetrics.currentValue - displayMetrics.totalInvested) >= 0 ? '+' : ''}
                {formatHBAR(displayMetrics.currentValue - displayMetrics.totalInvested)}
              </span>
              <span className="font-['Inter:Medium',_sans-serif] font-medium text-[#868c98] text-[10px] leading-tight whitespace-nowrap">
                from invested
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
