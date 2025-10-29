"use client";

import { useState, useEffect } from "react";
import MetricsCards from "../components/MetricsCards";
import HoldingsTable from "../components/HoldingsTable";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { CalendarIcon } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { useWallet } from "../context/wallet-context";
import { format, startOfDay, endOfDay, subDays, subMonths, subYears } from "date-fns";
import {
  fetchUserPortfolio,
  calculatePortfolioMetrics,
  PropertyHolding,
  PortfolioMetrics
} from "@/lib/services/portfolioService";
import { ethers } from "ethers";

export default function PortfolioDashboard() {
  const { user, wallet } = useAuth();
  const { provider: walletProvider, account: walletAccount } = useWallet();
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    const now = new Date();
    const currentMonth = format(now, "MMM");
    const currentYear = format(now, "yyyy");
    return `${currentMonth} 1 – 31, ${currentYear}`;
  });
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isExportActive, setIsExportActive] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [holdings, setHoldings] = useState<PropertyHolding[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalInvested: 0,
    currentValue: 0,
    totalProfit: 0,
    totalReturn: { amount: 0, percentage: 0 },
    totalHoldings: 0,
    activeProperties: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch portfolio data when not in demo mode
  useEffect(() => {
    async function loadPortfolio() {
      if (isDemoMode || !walletAccount || !walletProvider) {
        return;
      }

      setIsLoading(true);
      try {
        const userHoldings = await fetchUserPortfolio(walletAccount, walletProvider);
        setHoldings(userHoldings);

        const portfolioMetrics = calculatePortfolioMetrics(userHoldings);
        setMetrics(portfolioMetrics);
      } catch (error) {
        console.error('Error loading portfolio:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPortfolio();
  }, [isDemoMode, walletAccount, walletProvider]);

  // Get current date formatted as day of week, month day, year using date-fns
  const getCurrentDate = () => {
    const now = new Date();
    return format(now, "EEEE, MMM dd, yyyy");
  };

  // Get user's first name only when wallet is connected
  const getUserDisplayName = () => {
    // Only show name if wallet is connected
    if (!wallet || !user) return null;
    return user.username?.split(' ')[0] || user.username || null;
  };

  // Get welcome message based on wallet connection
  const getWelcomeMessage = () => {
    const displayName = getUserDisplayName();
    if (!displayName) {
      return "Welcome to your Portfolio";
    }
    return `Welcome Back, ${displayName}!`;
  };

  // Dynamic date range options using date-fns
  const getDateRangeOptions = () => {
    const now = new Date();
    const currentMonth = format(now, "MMM");
    const currentYear = format(now, "yyyy");
    
    return [
      { label: "Last 7 days", value: "last-7-days" },
      { label: "Last 30 days", value: "last-30-days" },
      { label: `${currentMonth} 1 – 31, ${currentYear}`, value: "current-month" },
      { label: "Last 3 months", value: "last-3-months" },
      { label: "Last 6 months", value: "last-6-months" },
      { label: "Last year", value: "last-year" },
      { label: "Custom range", value: "custom" },
    ];
  };

  const dateRangeOptions = getDateRangeOptions();

  const handleDateRangeSelect = (option: string) => {
    const selectedOption = dateRangeOptions.find((opt) => opt.value === option);
    if (selectedOption) {
      setSelectedDateRange(selectedOption.label);
    }
  };

  const handleExport = () => {
    // Create a simple CSV export functionality
    const csvData = [
      ["Date", "Portfolio Value", "Total Return", "APY"],
      ["2025-08-01", "$125,430.50", "+$2,430.50", "2.1%"],
      ["2025-08-02", "$126,120.75", "+$3,120.75", "2.3%"],
      ["2025-08-03", "$125,890.25", "+$2,890.25", "2.2%"],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `portfolio-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success feedback
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <div
        className="bg-white flex gap-[16px] h-[54px] items-center justify-center px-4 sm:px-6 lg:px-[48px] py-[10px]"
        style={{
          display: "flex",
          height: "54px",
          padding: "10px 16px",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          flexShrink: 0,
          borderBottom: "1px solid rgba(46, 46, 46, 0.05)",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute border-[0px_0px_1px] border-[rgba(46,46,46,0.05)] border-solid inset-0 pointer-events-none"
        />
        <div className="basis-0 content-stretch flex gap-[8px] grow items-center min-h-px min-w-px relative shrink-0">
          {/* Demo Mode Toggle */}
          <div className="flex items-center gap-3 mr-4">
            <Switch
              id="demo-mode"
              checked={isDemoMode}
              onCheckedChange={setIsDemoMode}
            />
            <Label htmlFor="demo-mode" className="text-sm font-medium cursor-pointer">
              {isDemoMode ? '🎭 Demo Mode' : '📊 Real Data'}
            </Label>
          </div>

          <div className="overflow-clip relative shrink-0 size-[18px]">
            <svg
              width="16"
              height="14"
              viewBox="0 0 16 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.08746 6.6625L10.625 5.125M6.5 7.75C6.5 8.14782 6.65804 8.52936 6.93934 8.81066C7.22064 9.09196 7.60218 9.25 8 9.25C8.39782 9.25 8.77936 9.09196 9.06066 8.81066C9.34196 8.52936 9.5 8.14782 9.5 7.75C9.5 7.35218 9.34196 6.97064 9.06066 6.68934C8.77936 6.40804 8.39782 6.25 8 6.25C7.60218 6.25 7.22064 6.40804 6.93934 6.68934C6.65804 6.97064 6.5 7.35218 6.5 7.75ZM3.8 12.9999C2.70361 12.1285 1.90543 10.9376 1.51608 9.59228C1.12673 8.24696 1.16549 6.81385 1.62698 5.49154C2.08848 4.16923 2.94985 3.02321 4.09174 2.21231C5.23363 1.4014 6.59947 0.965759 8 0.965759C9.40053 0.965759 10.7664 1.4014 11.9083 2.21231C13.0501 3.02321 13.9115 4.16923 14.373 5.49154C14.8345 6.81385 14.8733 8.24696 14.4839 9.59228C14.0946 10.9376 13.2964 12.1285 12.2 12.9999H3.8Z"
                stroke="#0A0D14"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="basis-0 font-['Inter:Medium',_sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[#0a0d14] text-[16px]">
            Portfolio
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-[24px] relative p-4 sm:p-6 lg:px-10 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
          <div className="flex flex-col gap-2">
            <p
              className="text-xs text-gray-500 font-medium"
            >
              {getCurrentDate()}
            </p>
            <h1
              className="text-xl sm:text-2xl font-semibold text-gray-900"
            >
              {getWelcomeMessage()}
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Date Range Selector */}
            <Select
              value={
                dateRangeOptions.find((opt) => opt.label === selectedDateRange)
                  ?.value
              }
              onValueChange={handleDateRangeSelect}
            >
              <SelectTrigger className="w-full sm:w-[200px] h-10 gap-2 px-3 py-2 text-sm font-medium border-gray-200">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button
              variant="outline"
              onClick={() => {
                handleExport();
                setIsExportActive(true);
                setTimeout(() => setIsExportActive(false), 2000);
              }}
              className={`flex items-center gap-2 px-3 py-2 w-full sm:w-auto h-10 text-sm font-medium ${exportSuccess ? "bg-green-50 border-green-200 text-green-700" : ""} ${isExportActive ? "bg-blue-50 border-blue-200 text-blue-700" : ""}`}
            >
              <div className="w-[13px] h-[16px]">
                {exportSuccess ? (
                  <svg
                    width="13"
                    height="16"
                    viewBox="0 0 13 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C10.0899 13 13 10.0899 13 6.5C13 2.91015 10.0899 0 6.5 0ZM9.5 5.5L6 9L3.5 6.5L4.5 5.5L6 7L8.5 4.5L9.5 5.5Z"
                      fill={isExportActive ? "#FFFFFF" : "#10B981"}
                    />
                  </svg>
                ) : (
                  <svg
                    width="13"
                    height="16"
                    viewBox="0 0 13 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.78755 15.7812L0.737549 14.7125L2.95005 12.5H1.26255V11H5.50005V15.2375H4.00005V13.5687L1.78755 15.7812ZM7.00005 15.5V14H11.5V5.75H7.75005V2H2.50005V9.5H1.00005V2C1.00005 1.5875 1.14705 1.2345 1.44105 0.941C1.73505 0.6475 2.08805 0.5005 2.50005 0.5H8.50005L13 5V14C13 14.4125 12.8533 14.7657 12.5598 15.0597C12.2663 15.3538 11.913 15.5005 11.5 15.5H7.00005Z"
                      fill={isExportActive ? "#FFFFFF" : "#868C98"}
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">
                {exportSuccess ? "Done!" : "Export"}
              </span>
            </Button>

            {/* Separator Line - Hidden on mobile */}
            <div className="hidden sm:block w-0 h-6 border-l border-gray-200"></div>
          </div>
        </div>

        {/* Metrics Cards */}
        {isLoading && !isDemoMode ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <MetricsCards metrics={metrics} isDemoMode={isDemoMode} />
        )}

        {/* Holdings Table */}
        {isLoading && !isDemoMode ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <HoldingsTable holdings={holdings} isDemoMode={isDemoMode} />
        )}
      </div>
    </div>
  );
}
