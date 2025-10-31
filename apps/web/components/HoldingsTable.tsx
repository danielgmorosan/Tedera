import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PropertyHolding } from "@/lib/services/portfolioService";
import React, { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDividendDistribution } from "@/hooks/use-dividend-distribution";
import { useWallet } from "@/context/wallet-context";
import { ethers } from "ethers";

interface HoldingData {
  id: string;
  name: string;
  category: string;
  sharesOwned: number;
  value: number; // in HBAR
  yield: number;
  gainLoss: {
    percentage: number; // % of investment made back through dividends
    isGain: boolean;
  };
  status: "sell" | "sold" | "hold";
  aiInsight: string;
  image: string;
  claimableAmount?: number;
  dividendContractAddress?: string;
}

interface HoldingsTableProps {
  holdings: PropertyHolding[];
  isDemoMode: boolean;
}

const mockHoldings: HoldingData[] = [
  {
    id: "1",
    name: "Sustainable office complex",
    category: "Wearables",
    sharesOwned: 30,
    value: 2000,
    yield: 8.5,
    gainLoss: { percentage: 14.5, isGain: true },
    status: "sell",
    aiInsight: "Restock immediately, demand is high.",
    image: "/portfolio/building-img.png",
  },
  {
    id: "2",
    name: "Sustainable office complex",
    category: "Wearables",
    sharesOwned: 150,
    value: 1500,
    yield: 8.5,
    gainLoss: { percentage: 14.5, isGain: true },
    status: "sold",
    aiInsight: "Stable sales, keep promotion running.",
    image: "/portfolio/building-img.png",
  },
  {
    id: "3",
    name: "Sustainable office complex",
    category: "Electronics",
    sharesOwned: 500,
    value: 150,
    yield: 8.5,
    gainLoss: { percentage: 14.5, isGain: true },
    status: "sold",
    aiInsight: "Low sales, consider bundle offers.",
    image: "/portfolio/building-img.png",
  },
  {
    id: "4",
    name: "Sustainable office complex",
    category: "Home Device",
    sharesOwned: 80,
    value: 300,
    yield: 8.5,
    gainLoss: { percentage: 14.5, isGain: true },
    status: "sold",
    aiInsight: "Consistent sales, monitor stock next month",
    image: "/portfolio/building-img.png",
  },
  {
    id: "5",
    name: "Sustainable office complex",
    category: "Accessories",
    sharesOwned: 200,
    value: 1200,
    yield: 8.5,
    gainLoss: { percentage: 14.5, isGain: false },
    status: "sold",
    aiInsight: "Growing demand, maintain current stock.",
    image: "/portfolio/building-img.png",
  },
];

// Helper function to format HBAR amounts - rounds to 2 decimals max, removes trailing zeros
const formatHBAR = (amount: number): string => {
  const rounded = Math.round(amount * 100) / 100; // Round to 2 decimals
  if (rounded % 1 === 0) {
    return `${Math.round(rounded)} HBAR`;
  }
  // Format to 2 decimal places and remove trailing zeros
  return `${rounded.toFixed(2).replace(/\.?0+$/, '')} HBAR`;
};

export default function HoldingsTable({ holdings, isDemoMode }: HoldingsTableProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [liveClaimable, setLiveClaimable] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { getDistributionCount, claimDividend } = useDividendDistribution();
  const { provider, account } = useWallet();

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Fetch live claimable amount directly from contract
  const fetchLiveClaimable = useCallback(async (holding: HoldingData) => {
    try {
      if (!provider || !account || !holding.dividendContractAddress) {
        console.log('⚠️ Cannot fetch live claimable:', {
          hasProvider: !!provider,
          hasAccount: !!account,
          hasContract: !!holding.dividendContractAddress,
        });
        return;
      }

      console.log(`🔍 Fetching live claimable for ${holding.name} from ${holding.dividendContractAddress}`);

      const abi = [
        "function getDistributionCount() view returns (uint256)",
        "function hasClaimed(uint256 distributionId, address holder) view returns (bool)",
        "function getClaimableDividend(uint256 distributionId, address holder) view returns (uint256)",
      ];

      const contract = new ethers.Contract(
        holding.dividendContractAddress,
        abi,
        provider
      );

      const countBN = await contract.getDistributionCount();
      const count = parseInt(countBN.toString(), 10);
      console.log(`📊 Found ${count} distributions for ${holding.name}`);

      if (count === 0) {
        console.log(`📊 No distributions found for ${holding.name}`);
        setLiveClaimable((prev) => ({ ...prev, [holding.id]: 0 }));
        return;
      }

      // Iterate through all distributions and sum up unclaimed amounts
      let total = ethers.BigNumber.from(0);

      for (let i = 0; i < count; i++) {
        try {
          const claimed: boolean = await contract.hasClaimed(i, account);
          console.log(`  Distribution ${i}: claimed=${claimed}`);
          if (claimed) continue;

          const amt: ethers.BigNumber = await contract.getClaimableDividend(i, account);
          console.log(`  Distribution ${i}: claimable=${ethers.utils.formatUnits(amt, 8)} HBAR`);
          if (amt && !amt.isZero()) {
            total = total.add(amt);
          }
        } catch (err) {
          // Skip this distribution if there's an error
          console.warn(`Error checking distribution ${i} for ${holding.dividendContractAddress}:`, err);
          continue;
        }
      }

      const hbar = parseFloat(ethers.utils.formatUnits(total, 8));
      console.log(`✅ Total claimable for ${holding.name}: ${hbar} HBAR`);
      setLiveClaimable((prev) => ({ ...prev, [holding.id]: hbar }));
    } catch (error) {
      console.error("❌ Error fetching live claimable amount:", error);
      setLiveClaimable((prev) => ({ ...prev, [holding.id]: 0 }));
    }
  }, [provider, account]);

  // Toggle expanded and fetch live data when expanding
  const onRowToggle = useCallback((holding: HoldingData) => {
    const wasExpanded = expanded[holding.id];
    toggleExpanded(holding.id);
    
    // Fetch live claimable when expanding (not collapsing)
    if (!wasExpanded && !isDemoMode) {
      // Delay to let state commit first
      setTimeout(() => {
        fetchLiveClaimable(holding);
      }, 0);
    }
  }, [expanded, toggleExpanded, fetchLiveClaimable, isDemoMode]);

  const handleClaimLatest = useCallback(
    async (
      holding: (HoldingData & { dividendContractAddress?: string })
    ) => {
      if (!holding.dividendContractAddress) {
        toast({
          title: "No dividend contract",
          description: "Missing dividend distributor address.",
          variant: "destructive",
        });
        return;
      }
      try {
        setClaimingId(holding.id);
        const count = await getDistributionCount(
          holding.dividendContractAddress
        );
        if (!count || count <= 0) {
          toast({ title: "Nothing to claim", description: "No distributions found yet." });
          return;
        }
        const latestId = count - 1;
        const txHash = await claimDividend(
          holding.dividendContractAddress,
          latestId
        );
        toast({
          title: "Claim submitted",
          description: `Tx: ${txHash.substring(0, 10)}...`,
        });
        
        // Refresh live claimable amount after successful claim
        await fetchLiveClaimable(holding);
      } catch (err: any) {
        toast({
          title: "Claim failed",
          description: err?.message || "Unknown error",
          variant: "destructive",
        });
      } finally {
        setClaimingId(null);
      }
    },
    [claimDividend, getDistributionCount, toast, fetchLiveClaimable]
  );
  // Convert PropertyHolding to HoldingData format
  const realHoldings: HoldingData[] = holdings.map((h) => ({
    id: h.propertyId,
    name: h.propertyName,
    category: h.category,
    sharesOwned: h.sharesOwned,
    value: h.currentValue, // in HBAR
    yield: h.expectedYield,
    gainLoss: {
      percentage: h.gainLoss.percentage, // % of investment made back through dividends
      isGain: h.gainLoss.isGain,
    },
    status: h.status === 'active' ? 'hold' : 'sold',
    aiInsight: h.claimableDividends > 0
      ? `${formatHBAR(h.claimableDividends)} available to claim`
      : 'No dividends available yet',
    image: h.propertyImage,
    dividendContractAddress: h.dividendContractAddress,
    claimableAmount: h.claimableDividends,
  }));

  const displayHoldings = isDemoMode ? mockHoldings : realHoldings;

  // Optional: fetch live claimables for expanded rows when dependencies change
  useEffect(() => {
    if (isDemoMode || !provider || !account) return;
    Object.keys(expanded).forEach((id) => {
      if (expanded[id]) {
        const h = displayHoldings.find((x) => x.id === id);
        if (h && h.dividendContractAddress) {
          fetchLiveClaimable(h);
        }
      }
    });
  }, [expanded, provider, account, isDemoMode, fetchLiveClaimable, displayHoldings]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 7H14M7 2V14M2 3.4C2 3.16 2.096 2.93 2.268 2.768C2.44 2.606 2.674 2.5 2.9 2.5H13.1C13.326 2.5 13.56 2.606 13.732 2.768C13.904 2.93 14 3.16 14 3.4V12.6C14 12.84 13.904 13.07 13.732 13.232C13.56 13.394 13.326 13.5 13.1 13.5H2.9C2.674 13.5 2.44 13.394 2.268 13.232C2.096 13.07 2 12.84 2 12.6V3.4Z"
                stroke="#0A0D14"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900">My Holdings</h3>
        </div>

        <div className="hidden sm:flex gap-2">
          <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 7L5.646 7.354L6 7.707L6.354 7.354L6 7ZM6.5 2.5C6.5 2.367 6.447 2.24 6.354 2.146C6.26 2.053 6.133 2 6 2C5.867 2 5.74 2.053 5.646 2.146C5.553 2.24 5.5 2.367 5.5 2.5H6.5ZM3.146 4.854L5.646 7.354L6.354 6.646L3.854 4.146L3.146 4.854ZM6.354 7.354L8.854 4.854L8.146 4.146L5.646 6.646L6.354 7.354ZM6.5 7V2.5H5.5V7H6.5Z"
                fill="#868C98"
              />
              <path
                d="M2.5 8V8.5C2.5 8.765 2.605 9.02 2.793 9.207C2.98 9.395 3.235 9.5 3.5 9.5H8.5C8.765 9.5 9.02 9.395 9.207 9.207C9.395 9.02 9.5 8.765 9.5 8.5V8"
                stroke="#868C98"
                strokeWidth="1.167"
              />
            </svg>
            Profit History
          </button>

          <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M8 7.5C8.653 7.5 9.209 7.918 9.415 8.5H10C10.133 8.5 10.26 8.553 10.354 8.646C10.447 8.74 10.5 8.867 10.5 9C10.5 9.133 10.447 9.26 10.354 9.354C10.26 9.447 10.133 9.5 10 9.5H9.415C9.312 9.793 9.12 10.046 8.867 10.226C8.613 10.405 8.31 10.501 8 10.501C7.69 10.501 7.387 10.405 7.133 10.226C6.88 10.046 6.688 9.793 6.585 9.5H2C1.867 9.5 1.74 9.447 1.646 9.354C1.553 9.26 1.5 9.133 1.5 9C1.5 8.867 1.553 8.74 1.646 8.646C1.74 8.553 1.867 8.5 2 8.5H6.585C6.688 8.207 6.88 7.954 7.134 7.775C7.387 7.596 7.69 7.5 8 7.5Z"
                fill="#868C98"
              />
            </svg>
            Analytics
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Table>
        <TableHeader>
          <TableRow className="bg-neutral-50 hover:bg-neutral-50">
            <TableHead className="w-[310px] text-xs text-muted-foreground font-medium">
              <div className="flex gap-2 items-center">
                <Checkbox />
                <span>Property</span>
              </div>
            </TableHead>
            <TableHead className="w-[130px] text-xs text-muted-foreground font-medium">
              Category
            </TableHead>
            <TableHead className="w-[101px] text-xs text-muted-foreground font-medium">
              Shares owned
            </TableHead>
            <TableHead className="w-[102px] text-xs text-muted-foreground font-medium">
              Value
            </TableHead>
            <TableHead className="w-[120px] text-xs text-muted-foreground font-medium">
              Yield
            </TableHead>
            <TableHead className="w-[100px] text-xs text-muted-foreground font-medium">
              Gain/loss
            </TableHead>
            <TableHead className="w-[100px] text-xs text-muted-foreground font-medium">
              Status
            </TableHead>
            <TableHead className="flex-1 text-xs text-muted-foreground font-medium">
              Available Dividends
            </TableHead>
            <TableHead className="w-14 text-center text-xs text-muted-foreground font-medium">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayHoldings.map((holding) => {
            const isExpanded = !!expanded[holding.id];
            // Use live claimable amount if available, otherwise fall back to pre-computed value
            const claimableAmount = liveClaimable[holding.id] ?? holding.claimableAmount ?? 0;
            return (
            <React.Fragment key={holding.id}>
            <TableRow className="cursor-pointer" onClick={() => onRowToggle(holding)}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Checkbox />
                  <div className="flex items-center gap-3">
                    <div className="w-[30px] h-[30px] rounded-md overflow-hidden bg-gradient-to-br from-blue-400 to-green-400 flex-shrink-0">
                      <img
                        src={holding.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (
                            e.target as HTMLImageElement
                          ).parentElement!.style.background =
                            "linear-gradient(135deg, #60A5FA 0%, #34D399 100%)";
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs font-medium text-[#0A0D14]">
                        <span>{holding.name}</span>
                        <svg
                          className={`transition-transform ${expanded[holding.id] ? 'rotate-180' : ''}`}
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path d="M5 7L2 3h6L5 7z" fill="#0A0D14" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-2 h-2 bg-neutral-100 rounded-full flex items-center justify-center">
                          <svg
                            width="5"
                            height="5"
                            viewBox="0 0 5 5"
                            fill="none"
                          >
                            <path
                              d="M2.5 0.5L4.5 2.5H0.5L2.5 0.5Z"
                              stroke="currentColor"
                              strokeWidth="0.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span className="text-[6px] text-[#868C98]">
                          Forest
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="bg-neutral-100 text-[#525866] border-white shadow-sm"
                >
                  {holding.category}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-xs text-[#0A0D14]">
                  {holding.sharesOwned}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs font-medium text-[#0A0D14]">
                  {formatHBAR(holding.value)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-[#2D9F75]">
                    {holding.yield}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {holding.gainLoss.isGain ? (
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M4.5 1L7 4H2L4.5 1Z" fill="#2D9F75" />
                    </svg>
                  ) : (
                    <div className="rotate-180">
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M4.5 1L7 4H2L4.5 1Z" fill="#E53E3E" />
                      </svg>
                    </div>
                  )}
                  <span className="text-xs font-medium text-[#0A0D14]">
                    {holding.gainLoss.percentage}% APY
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={
                    holding.status === "sell"
                      ? "bg-[rgba(253,241,227,0.5)] text-[#A96233] border-transparent"
                      : "bg-[rgba(214,255,230,0.5)] text-[#247E4A] border-transparent"
                  }
                >
                  {holding.status === "sell" ? "Sell" : "Sold"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 1L8 4H2L5 1Z" fill="#0A0D14" />
                  </svg>
                  <span className="text-xs text-[#0A0D14] truncate">
                    {claimableAmount > 0
                      ? `${formatHBAR(claimableAmount)} available to claim`
                      : 'No dividends available yet'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <button className="text-[#868C98] hover:text-[#0A0D14]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="3" r="1" fill="currentColor" />
                    <circle cx="8" cy="8" r="1" fill="currentColor" />
                    <circle cx="8" cy="13" r="1" fill="currentColor" />
                  </svg>
                </button>
              </TableCell>
            </TableRow>
            {isExpanded && (
              <TableRow className="bg-gradient-to-br from-slate-50/50 to-emerald-50/30">
                <TableCell colSpan={10}>
                  <div className="flex flex-col gap-4 p-4">
                    {/* Enhanced metrics grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-emerald-100/50 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 2L11 6H5L8 2Z" fill="#10B981" />
                            </svg>
                          </div>
                          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Shares Owned</div>
                        </div>
                        <div className="text-xl font-bold text-gray-900 mt-1">{holding.sharesOwned.toLocaleString()}</div>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-100/50 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 1L10 5H6L8 1Z" fill="#3B82F6" />
                            </svg>
                          </div>
                          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Value</div>
                        </div>
                        <div className="text-xl font-bold text-blue-700 mt-1">{formatHBAR(holding.value)}</div>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-purple-100/50 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 3L11 7H5L8 3Z" fill="#A855F7" />
                            </svg>
                          </div>
                          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Yield</div>
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <div className="text-xl font-bold text-purple-700">{holding.yield}%</div>
                          <div className="text-sm text-gray-500">APY</div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {formatHBAR((holding.value * holding.yield) / 100)} / year
                        </div>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-amber-100/50 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 1L12 8L4 8L8 1Z" fill="#F59E0B" />
                            </svg>
                          </div>
                          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Gain/Loss</div>
                        </div>
                        <div className={`text-xl font-bold mt-1 flex items-center gap-1 ${
                          holding.gainLoss.isGain ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {holding.gainLoss.isGain ? (
                            <svg width="12" height="12" viewBox="0 0 9 9" fill="none">
                              <path d="M4.5 1L7 4H2L4.5 1Z" fill="#10B981" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 9 9" fill="none" className="rotate-180">
                              <path d="M4.5 1L7 4H2L4.5 1Z" fill="#EF4444" />
                            </svg>
                          )}
                          {holding.gainLoss.percentage}%
                        </div>
                      </div>
                    </div>

                    {/* Dividends section */}
                    <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-lg p-4 border border-emerald-200/50">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M10 2L13 7H7L10 2Z" fill="#10B981" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-0.5">Available Dividends</div>
                            <div className="text-base font-bold text-gray-900">
                              {claimableAmount > 0
                                ? formatHBAR(claimableAmount)
                                : 'No dividends available yet'}
                            </div>
                          </div>
                        </div>
                        <button
                          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all shadow-sm hover:shadow-md ${
                            claimableAmount > 0
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent'
                              : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                          }`}
                          disabled={claimableAmount <= 0 || claimingId === holding.id}
                          onClick={(e) => { e.stopPropagation(); handleClaimLatest(holding as any); }}
                        >
                          {claimingId === holding.id ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Claiming...
                            </>
                          ) : claimableAmount > 0 ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 1L12 5H4L8 1Z" fill="currentColor" />
                              </svg>
                              Claim {formatHBAR(claimableAmount)}
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 1L12 5H4L8 1Z" fill="currentColor" />
                              </svg>
                              Claim Rewards
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
            </React.Fragment>
            );})}
        </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4 p-4">
        {displayHoldings.map((holding) => {
          const isExpanded = !!expanded[holding.id];
          // Use live claimable amount if available, otherwise fall back to pre-computed value
          const claimableAmount = liveClaimable[holding.id] ?? holding.claimableAmount ?? 0;
          return (
          <div key={holding.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" onClick={() => onRowToggle(holding)}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-[30px] h-[30px] rounded-md overflow-hidden bg-gradient-to-br from-blue-400 to-green-400 flex-shrink-0">
                <img
                  src={holding.image}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (
                      e.target as HTMLImageElement
                    ).parentElement!.style.background =
                      "linear-gradient(135deg, #60A5FA 0%, #34D399 100%)";
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 text-sm font-medium text-[#0A0D14] mb-1">
                  <span>{holding.name}</span>
                  <svg
                    className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                  >
                    <path d="M5 7L2 3h6L5 7z" fill="#0A0D14" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-2 h-2 bg-neutral-100 rounded-full flex items-center justify-center">
                    <svg
                      width="5"
                      height="5"
                      viewBox="0 0 5 5"
                      fill="none"
                    >
                      <path
                        d="M2.5 0.5L4.5 2.5H0.5L2.5 0.5Z"
                        stroke="currentColor"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-[6px] text-[#868C98]">Forest</span>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-neutral-100 text-[#525866] border-white shadow-sm text-xs"
                >
                  {holding.category}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100">
                <div className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Shares Owned</div>
                <div className="text-lg font-bold text-emerald-700">{holding.sharesOwned.toLocaleString()}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
                <div className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Value</div>
                <div className="text-lg font-bold text-blue-700">{formatHBAR(holding.value)}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100 col-span-2">
                <div className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Yield</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-lg font-bold text-purple-700">{holding.yield}%</div>
                  <div className="text-xs text-gray-600">APY</div>
                  <div className="ml-auto text-xs text-gray-600">
                    {formatHBAR((holding.value * holding.yield) / 100)} / year
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {holding.gainLoss.isGain ? (
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M4.5 1L7 4H2L4.5 1Z" fill="#2D9F75" />
                  </svg>
                ) : (
                  <div className="rotate-180">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M4.5 1L7 4H2L4.5 1Z" fill="#E53E3E" />
                    </svg>
                  </div>
                )}
                <span className="text-sm font-medium text-[#0A0D14]">
                  {holding.gainLoss.percentage}% APY
                </span>
              </div>
              <Badge
                variant="secondary"
                className={
                  holding.status === "sell"
                    ? "bg-[rgba(253,241,227,0.5)] text-[#A96233] border-transparent"
                    : "bg-[rgba(214,255,230,0.5)] text-[#247E4A] border-transparent"
                }
              >
                {holding.status === "sell" ? "Sell" : "Sold"}
              </Badge>
            </div>

            {isExpanded && (
              <div className="mt-4 space-y-4">
                {/* Enhanced metrics grid for mobile */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100">
                    <div className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Shares</div>
                    <div className="text-base font-bold text-emerald-700">{holding.sharesOwned.toLocaleString()}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
                    <div className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Value</div>
                    <div className="text-base font-bold text-blue-700">{formatHBAR(holding.value)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100 col-span-2">
                    <div className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Yield</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-base font-bold text-purple-700">{holding.yield}%</div>
                      <div className="text-xs text-gray-600">APY</div>
                      <div className="ml-auto text-xs text-gray-600">
                        {formatHBAR((holding.value * holding.yield) / 100)} / year
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dividends section for mobile */}
                <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-lg p-4 border border-emerald-200/50">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M10 2L13 7H7L10 2Z" fill="#10B981" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Available Dividends</div>
                      <div className="text-sm font-bold text-gray-900">
                        {claimableAmount > 0
                          ? formatHBAR(claimableAmount)
                          : 'No dividends available yet'}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all shadow-sm hover:shadow-md ${
                      claimableAmount > 0
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent'
                        : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                    }`}
                    disabled={claimableAmount <= 0 || claimingId === holding.id}
                    onClick={(e) => { e.stopPropagation(); handleClaimLatest(holding as any); }}
                  >
                    {claimingId === holding.id ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Claiming...
                      </>
                    ) : claimableAmount > 0 ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 1L12 5H4L8 1Z" fill="currentColor" />
                        </svg>
                        Claim {formatHBAR(claimableAmount)}
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 1L12 5H4L8 1Z" fill="currentColor" />
                        </svg>
                        Claim Rewards
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          );})}
      </div>
    </div>
  );
}
