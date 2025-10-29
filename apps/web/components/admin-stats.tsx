"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Building,
  Users,
  DollarSign,
  TrendingUp,
  Leaf,
  Sun,
  Home,
  Info,
} from "lucide-react";

export function AdminStats() {
  const stats = [
    {
      title: "Total Properties",
      value: "6",
      change: "+2 this month",
      icon: Building,
      color: "text-slate-500",
    },
    {
      title: "Active Investors",
      value: "1,247",
      change: "+89 this month",
      icon: Users,
      color: "text-slate-500",
    },
    {
      title: "Total Asset Value",
      value: "$26.7M",
      change: "+$3.2M this month",
      icon: DollarSign,
      color: "text-slate-500",
    },
    {
      title: "Avg. Platform Yield",
      value: "8.7%",
      change: "+0.3% this month",
      icon: TrendingUp,
      color: "text-slate-500",
    },
  ];

  const assetBreakdown = [
    {
      type: "Forest Assets",
      count: 2,
      icon: Leaf,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      image: "/lush-green-forest-with-tall-trees-and-sunlight.jpg",
      saleProgress: 85,
    },
    {
      type: "Energy Projects",
      count: 2,
      icon: Sun,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      image: "/modern-solar-panels-and-wind-turbines-renewable-en.jpg",
      saleProgress: 62,
    },
    {
      type: "Real Estate",
      count: 2,
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      image: "/modern-luxury-residential-building-with-clean-arch.jpg",
      saleProgress: 43,
    },
  ];

  return (
    <div className="space-y-8 mb-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white box-border flex flex-col gap-3 items-start overflow-clip p-4 relative rounded-[10px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.07),0px_10px_24px_-8px_rgba(42,51,70,0.03)] h-full"
            >
              <div className="flex gap-2.5 items-center justify-between w-full">
                <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[1.4] text-[#0a0d14] text-[12px] tracking-[-0.12px]">
                  {stat.title}
                </p>
              </div>
              <div className="flex items-start justify-between w-full">
                <div className="flex flex-col gap-2">
                  <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.2] text-[#0a0d14] text-[22px]">
                    {stat.value}
                  </p>
                  <div className="flex gap-1.5 items-center">
                    <div className="flex gap-1 items-center">
                      <div className="relative shrink-0 size-2">
                        <TrendingUp className="h-2 w-2 text-[#2d9f75]" />
                      </div>
                      <p className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[1.4] text-[#2d9f75] text-[12px]">
                        {stat.change.split(" ")[0]}
                      </p>
                    </div>
                    <p className="font-['Inter:Medium',_sans-serif] font-medium leading-[1.4] text-[#868c98] text-[12px]">
                      {stat.change.split(" ").slice(1).join(" ")}
                    </p>
                  </div>
                </div>
                <div className="bg-[#f6f6f6] flex items-center justify-center overflow-clip p-2.5 relative rounded-[7.901px] shrink-0">
                  <Icon className="size-[18px] text-slate-500" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Card className="border-0 shadow-none rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="pt-6 pb-4 px-6">
            <h3
              className="text-2xl font-medium text-[#0A0D14] leading-[20px] mb-2"
              style={{ fontFeatureSettings: "'liga' off, 'calt' off" }}
            >
              Asset Type Distribution
            </h3>
            <p
              className="text-xs font-medium text-[#868C98] leading-[20px]"
              style={{ fontFeatureSettings: "'liga' off, 'calt' off" }}
            >
              Diversified portfolio across multiple asset classes
            </p>
          </div>

          <div className="pb-6 px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {assetBreakdown.map((asset) => {
                const Icon = asset.icon;
                return (
                  <div
                    key={asset.type}
                    className="group border relative overflow-hidden rounded-[10px] bg-white  hover:shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_10px_24px_-8px_rgba(42,51,70,0.03)] transition-all duration-300 cursor-pointer"
                  >
                    {/* Image Section */}
                    <div className="relative h-32 overflow-hidden bg-slate-100">
                      <img
                        src={asset.image || "/placeholder.svg"}
                        alt={asset.type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent" />

                      {/* Icon Overlay */}
                      <div
                        className={`absolute top-3 right-3 p-2 ${asset.bgColor} rounded-xl shadow-sm`}
                      >
                        <Icon className={`h-5 w-5 ${asset.color}`} />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-[#0A0D14] mb-1">
                            {asset.type}
                          </h4>
                          <p className="text-sm text-[#868C98]">
                            Active Properties
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-[#0A0D14]">
                            {asset.count}
                          </div>
                          <div className="text-xs text-[#868C98] mt-1">
                            Properties
                          </div>
                        </div>
                      </div>

                      {/* Progress indicator */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-[#868C98] mb-2">
                          <span>Sale Progress</span>
                          <span>{asset.saleProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-slate-500"
                            style={{ width: `${asset.saleProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
