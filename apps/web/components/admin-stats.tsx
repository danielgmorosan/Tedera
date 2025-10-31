"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building,
  Users,
  DollarSign,
  TrendingUp,
  Leaf,
  Sun,
  Home,
} from "lucide-react";

interface Property {
  _id?: string;
  id?: string;
  name: string;
  type?: "forest" | "solar" | "real-estate";
  totalShares?: number;
  pricePerShare?: number;
  expectedYield?: number;
  availableShares?: number;
  status?: "open" | "closed";
  createdAt?: string;
}

interface AssetBreakdown {
  type: string;
  count: number;
  icon: typeof Leaf;
  color: string;
  bgColor: string;
  image: string;
  saleProgress: number;
}

export function AdminStats() {
  const [stats, setStats] = useState([
    {
      title: "Total Properties",
      value: "0",
      change: "0 this month",
      icon: Building,
      color: "text-slate-500",
    },
    {
      title: "Active Investors",
      value: "0",
      change: "0 this month",
      icon: Users,
      color: "text-slate-500",
    },
    {
      title: "Total Asset Value",
      value: "$0",
      change: "$0 this month",
      icon: DollarSign,
      color: "text-slate-500",
    },
    {
      title: "Avg. Platform Yield",
      value: "0%",
      change: "0% this month",
      icon: TrendingUp,
      color: "text-slate-500",
    },
  ]);

  const [assetBreakdown, setAssetBreakdown] = useState<AssetBreakdown[]>([
    {
      type: "Forest Assets",
      count: 0,
      icon: Leaf,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      image: "/lush-green-forest-with-tall-trees-and-sunlight.jpg",
      saleProgress: 0,
    },
    {
      type: "Energy Projects",
      count: 0,
      icon: Sun,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      image: "/modern-solar-panels-and-wind-turbines-renewable-en.jpg",
      saleProgress: 0,
    },
    {
      type: "Real Estate",
      count: 0,
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      image: "/modern-luxury-residential-building-with-clean-arch.jpg",
      saleProgress: 0,
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/properties');
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        const properties: Property[] = data.properties || [];

        // Calculate stats
        const totalProperties = properties.length;
        
        // Calculate total asset value (sum of totalShares * pricePerShare for all properties)
        const totalAssetValue = properties.reduce((sum, prop) => {
          const totalValue = (prop.totalShares || 0) * (prop.pricePerShare || 0);
          // Convert from HBAR to USD (assuming 1 HBAR = $0.05)
          return sum + (totalValue * 0.05);
        }, 0);

        // Calculate average yield
        const yields = properties
          .map(p => p.expectedYield || 0)
          .filter(y => y > 0);
        const avgYield = yields.length > 0
          ? yields.reduce((sum, y) => sum + y, 0) / yields.length
          : 0;

        // Count properties created this month
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const propertiesThisMonth = properties.filter(p => {
          if (p.createdAt) {
            const createdAt = new Date(p.createdAt);
            return createdAt >= thisMonth;
          }
          // Fallback: use _id timestamp if createdAt not available
          if (p._id) {
            try {
              const timestamp = parseInt(p._id.toString().substring(0, 8), 16) * 1000;
              const createdAt = new Date(timestamp);
              return createdAt >= thisMonth;
            } catch {
              return false;
            }
          }
          return false;
        }).length;

        // Update stats
        setStats([
          {
            title: "Total Properties",
            value: totalProperties.toString(),
            change: `+${propertiesThisMonth} this month`,
            icon: Building,
            color: "text-slate-500",
          },
          {
            title: "Active Investors",
            value: "0", // TODO: Fetch from investments API if needed
            change: "0 this month",
            icon: Users,
            color: "text-slate-500",
          },
          {
            title: "Total Asset Value",
            value: totalAssetValue >= 1000000
              ? `$${(totalAssetValue / 1000000).toFixed(1)}M`
              : totalAssetValue >= 1000
              ? `$${(totalAssetValue / 1000).toFixed(1)}K`
              : `$${totalAssetValue.toFixed(0)}`,
            change: "$0 this month", // TODO: Calculate month-over-month change
            icon: DollarSign,
            color: "text-slate-500",
          },
          {
            title: "Avg. Platform Yield",
            value: `${avgYield.toFixed(1)}%`,
            change: "0% this month", // TODO: Calculate month-over-month change
            icon: TrendingUp,
            color: "text-slate-500",
          },
        ]);

        // Calculate asset breakdown
        const forestProps = properties.filter(p => p.type === 'forest');
        const solarProps = properties.filter(p => p.type === 'solar');
        const realEstateProps = properties.filter(p => !p.type || p.type === 'real-estate');

        // Calculate sale progress for each type
        const calculateSaleProgress = (props: Property[]) => {
          if (props.length === 0) return 0;
          const totalShares = props.reduce((sum, p) => sum + (p.totalShares || 0), 0);
          const availableShares = props.reduce((sum, p) => sum + (p.availableShares || p.totalShares || 0), 0);
          if (totalShares === 0) return 0;
          return Math.round(((totalShares - availableShares) / totalShares) * 100);
        };

        setAssetBreakdown([
          {
            type: "Forest Assets",
            count: forestProps.length,
            icon: Leaf,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            image: "/lush-green-forest-with-tall-trees-and-sunlight.jpg",
            saleProgress: calculateSaleProgress(forestProps),
          },
          {
            type: "Energy Projects",
            count: solarProps.length,
            icon: Sun,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            image: "/modern-solar-panels-and-wind-turbines-renewable-en.jpg",
            saleProgress: calculateSaleProgress(solarProps),
          },
          {
            type: "Real Estate",
            count: realEstateProps.length,
            icon: Home,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            image: "/modern-luxury-residential-building-with-clean-arch.jpg",
            saleProgress: calculateSaleProgress(realEstateProps),
          },
        ]);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white box-border flex flex-col gap-3 items-start overflow-clip p-4 relative rounded-[10px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.07),0px_10px_24px_-8px_rgba(42,51,70,0.03)] h-full animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-8 bg-slate-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
