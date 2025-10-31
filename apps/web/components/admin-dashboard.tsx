"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatePropertyForm } from "@/components/create-property-form";
import { ProfitDistributionPanel } from "@/components/profit-distribution-panel";
import { CreateEquityTokenForm } from "@/components/create-equity-token-form";
import { AdminStats } from "@/components/admin-stats";
import {
  Plus,
  DollarSign,
  Shield,
  RefreshCw,
  Coins,
} from "lucide-react";

export function AdminDashboard() {
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDemo = async () => {
    setIsResetting(true);
    // Simulate reset process
    setTimeout(() => {
      setIsResetting(false);
      // Show success message
      alert("Demo data has been reset successfully!");
    }, 2000);
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <div
        className=" bg-white flex gap-[16px] h-[54px] items-center justify-center px-[48px] py-[10px]"
        style={{
          display: "flex",
          height: "54px",
          padding: "10px 48px",
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
          <div className="overflow-clip relative shrink-0 size-[18px]">
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
              ></path>
            </svg>
          </div>
          <p className="basis-0 font-['Inter:Medium',_sans-serif] font-medium grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[#0a0d14] text-[16px]">
            Admin Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <Badge className="bg-emerald-100 border-emerald-200 text-emerald-700 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Admin Access</span>
            <span className="xs:hidden">Admin</span>
          </Badge>
          <Button
            variant="outline"
            onClick={handleResetDemo}
            disabled={isResetting}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 bg-white px-3 sm:px-4 lg:px-6 py-2 rounded-xl shadow-sm transition-all duration-200 text-[13px] font-medium"
          >
            {isResetting ? (
              <>
                <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Resetting...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Reset Demo Data</span>
                <span className="sm:hidden">Reset</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10">
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <AdminStats />
        </div>

        <Tabs defaultValue="equity" className="w-full">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
            <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-2 h-auto rounded-none">
              <TabsTrigger
                value="equity"
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 rounded-xl text-slate-600 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-emerald-200 transition-all font-medium text-[13px] whitespace-nowrap min-w-0"
              >
                <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden xs:inline sm:hidden">Equity</span>
                <span className="xs:hidden sm:inline">Create Equity Token</span>
              </TabsTrigger>
              <TabsTrigger
                value="properties"
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 rounded-xl text-slate-600 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-emerald-200 transition-all font-medium text-[13px] whitespace-nowrap min-w-0"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden xs:inline sm:hidden">List</span>
                <span className="xs:hidden sm:inline">List New Property</span>
              </TabsTrigger>
              <TabsTrigger
                value="distributions"
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 rounded-xl text-slate-600 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-emerald-200 transition-all font-medium text-[13px] whitespace-nowrap min-w-0"
              >
                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden xs:inline sm:hidden">Profits</span>
                <span className="xs:hidden sm:inline">Profit Distribution</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="equity" className="p-8 mt-0">
              <CreateEquityTokenForm />
            </TabsContent>

            <TabsContent value="properties" className="p-8 mt-0">
              <CreatePropertyForm />
            </TabsContent>

            <TabsContent value="distributions" className="p-8 mt-0">
              <ProfitDistributionPanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
