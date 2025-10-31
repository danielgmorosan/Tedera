"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BuyPanel } from "@/components/buy-panel";
import { ActivityTimeline } from "@/components/activity-timeline";
import { DocumentDrawer } from "@/components/document-drawer";
import {
  MapPin,
  TrendingUp,
  Leaf,
  Sun,
  Home,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  FileText,
  ArrowLeft,
  Share,
  Heart,
  X,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useWallet } from "@/context/wallet-context";
import { ethers } from "ethers";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Property {
  id: string;
  title: string;
  location: string;
  type: "forest" | "solar" | "real-estate";
  image: string;
  images?: string[]; // Array of image URLs for gallery
  availableSupply: number;
  expectedYield: number;
  totalValue: number;
  sustainabilityScore: number;
  tags: string[];
  description: string;
  area?: string;
  established?: string;
  totalShares?: number;
  availableShares?: number;
  pricePerShare?: number;
  lastDistribution?: string;
  nextDistribution?: string;
  saleContractAddress?: string;
  status?: "open" | "closed";
}

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
}

const typeIcons = {
  forest: Leaf,
  solar: Sun,
  "real-estate": Home,
};

const typeColors = {
  forest: "text-green-600",
  solar: "text-yellow-600",
  "real-estate": "text-blue-600",
};

interface Distribution {
  _id: string;
  property: string;
  totalAmount: number;
  description?: string;
  executedAt: string | Date;
  createdAt?: string | Date;
}

export function PropertyDetail({ property, onBack }: PropertyDetailProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [downloadingProspectus, setDownloadingProspectus] = useState(false);
  const [schedulingVisit, setSchedulingVisit] = useState(false);
  const [viewingReports, setViewingReports] = useState(false);
  const [realOwnership, setRealOwnership] = useState<{
    sharesSold: number;
    availableShares: number;
    ownedPercentage: number;
  } | null>(null);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loadingDistributions, setLoadingDistributions] = useState(true);
  
  const Icon = typeIcons[property.type];
  const iconColor = typeColors[property.type];
  const { provider } = useWallet();

  // Fetch real ownership data from blockchain
  useEffect(() => {
    const fetchOwnershipData = async () => {
      if (!property.saleContractAddress || !provider) {
        return;
      }

      try {
        const PropertySaleABI = [
          "function totalShares() external view returns (uint256)",
          "function sharesSold() external view returns (uint256)",
        ];

        const saleContract = new ethers.Contract(
          property.saleContractAddress,
          PropertySaleABI,
          provider
        );

        const totalSharesWei = await saleContract.totalShares();
        const sharesSoldWei = await saleContract.sharesSold();
        
        const totalShares = parseFloat(ethers.utils.formatUnits(totalSharesWei, 18));
        const sharesSold = parseFloat(ethers.utils.formatUnits(sharesSoldWei, 18));
        const availableShares = totalShares - sharesSold;
        const ownedPercentage = totalShares > 0 ? (sharesSold / totalShares) * 100 : 0;

        setRealOwnership({
          sharesSold,
          availableShares,
          ownedPercentage,
        });
      } catch (error) {
        console.error('Error fetching ownership data:', error);
      }
    };

    fetchOwnershipData();
  }, [property.saleContractAddress, provider]);

  // Fetch distribution data
  useEffect(() => {
    const fetchDistributions = async () => {
      if (!property.id) {
        setLoadingDistributions(false);
        return;
      }

      try {
        setLoadingDistributions(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('hedera-auth-token') : null;
        const response = await fetch(`/api/distributions/property/${property.id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const data = await response.json();
          setDistributions(data.distributions || []);
        }
      } catch (error) {
        console.error('Error fetching distributions:', error);
      } finally {
        setLoadingDistributions(false);
      }
    };

    fetchDistributions();
  }, [property.id]);

  // Use real data if available, otherwise fallback to property.availableSupply
  const ownedPercentage = realOwnership 
    ? realOwnership.ownedPercentage 
    : (100 - property.availableSupply);
  
  const availableShares = realOwnership
    ? realOwnership.availableShares
    : (property.totalShares ? (property.availableSupply / 100) * property.totalShares : 0);
  
  const sharesOwned = realOwnership
    ? realOwnership.sharesSold
    : (property.totalShares ? ((ownedPercentage / 100) * property.totalShares) : 0);

  // Calculate total value in HBAR
  const totalShares = property.totalShares || 1000;
  const pricePerShare = property.pricePerShare || 0;
  const totalValue = property.totalValue ?? (totalShares * pricePerShare);

  // Helper function to format HBAR amounts
  const formatLargeHBAR = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M HBAR`.replace(/\.?0+$/, '');
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)}K HBAR`.replace(/\.?0+$/, '');
    }
    const rounded = Math.round(amount * 100) / 100;
    if (rounded % 1 === 0) {
      return `${Math.round(rounded)} HBAR`;
    }
    return `${rounded.toFixed(2).replace(/\.?0+$/, '')} HBAR`;
  };

  // Helper function to format HBAR for smaller amounts
  const formatHBAR = (amount: number): string => {
    const rounded = Math.round(amount * 100) / 100;
    if (rounded % 1 === 0) {
      return `${Math.round(rounded)} HBAR`;
    }
    return `${rounded.toFixed(2).replace(/\.?0+$/, '')} HBAR`;
  };

  // Get last distribution
  const lastDistribution = distributions.length > 0 
    ? distributions[0] 
    : null;

  // Calculate next distribution date (3 months after last distribution, or use property.nextDistribution)
  const getNextDistributionDate = (): string => {
    if (property.nextDistribution) {
      return property.nextDistribution;
    }
    
    if (lastDistribution?.executedAt) {
      const lastDate = new Date(lastDistribution.executedAt);
      const nextDate = new Date(lastDate);
      nextDate.setMonth(nextDate.getMonth() + 3);
      
      const month = nextDate.toLocaleDateString('en-US', { month: 'short' });
      const year = nextDate.getFullYear();
      return `${month} ${year}`;
    }
    
    // Default to Q2 2024 if no data available
    return "Q2 2024";
  };

  // Calculate distribution history for last 12 months
  const getDistributionHistory = () => {
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyData: { [key: string]: number } = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months with 0
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = 0;
    }
    
    // Sum distributions by month
    distributions.forEach(dist => {
      const distDate = new Date(dist.executedAt || dist.createdAt || Date.now());
      if (distDate >= twelveMonthsAgo && distDate <= now) {
        const monthKey = `${distDate.getFullYear()}-${String(distDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey] += dist.totalAmount || 0;
        }
      }
    });
    
    // Get max value for scaling
    const values = Object.values(monthlyData);
    const maxValue = Math.max(...values, 1); // Avoid divide by zero
    
    // Format for chart display
    const chartData = Object.keys(monthlyData).map(key => {
      const date = new Date(key);
      const monthIndex = date.getMonth();
      return {
        month: monthNames[monthIndex],
        amount: monthlyData[key],
        height: (monthlyData[key] / maxValue) * 100,
      };
    });
    
    return chartData;
  };

  const distributionHistory = getDistributionHistory();

  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `Check out this ${property.type} investment opportunity: ${property.title} in ${property.location}`,
      url: window.location.href,
    };

    try {
      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (error) {
      // If sharing fails, try to copy to clipboard as fallback
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (clipboardError) {
        console.error("Failed to share or copy to clipboard:", clipboardError);
      }
    }
  };

  const handleDownloadProspectus = async () => {
    setDownloadingProspectus(true);
    try {
      // Simulate download process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a mock PDF download
      const link = document.createElement("a");
      link.href = "/placeholder.pdf"; // In a real app, this would be the actual PDF URL
      link.download = `${property.title.replace(/\s+/g, "_")}_Prospectus.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download prospectus:", error);
    } finally {
      setDownloadingProspectus(false);
    }
  };

  const handleScheduleVisit = () => {
    setSchedulingVisit(true);
    // Simulate scheduling process
    setTimeout(() => {
      alert(
        `Site visit scheduling for ${property.title} will be available soon. We'll contact you within 24 hours to arrange your visit.`
      );
      setSchedulingVisit(false);
    }, 1000);
  };

  const handleViewReports = () => {
    setViewingReports(true);
    // Simulate loading reports
    setTimeout(() => {
      alert(
        `Financial reports for ${property.title} are being prepared. You'll receive an email with the latest reports within the next hour.`
      );
      setViewingReports(false);
    }, 1000);
  };

  // Use all uploaded images, no hardcoded defaults
  const propertyImages = property.images && property.images.length > 0
    ? property.images
    : (property.image ? [property.image] : []); // Fallback to single image for backward compatibility

  const allImages = propertyImages.map((imageUrl, index) => ({
    src: imageUrl,
    alt: `${property.title} - Image ${index + 1}`,
  }));

  // Calculate real stats from property data
  const stats = {
    area: property.area || "N/A",
    established: property.established || "N/A",
    totalShares: totalShares,
    pricePerShare: pricePerShare,
  };

  return (
    <div className="bg-gradient-to-br from-slate-50/30 via-white to-slate-50/30 min-h-screen">
      <div
        className=" bg-white flex gap-[16px] !pl-7 h-[54px] items-center justify-center px-[48px] py-[10px]"
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
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>
        </div>
      </div>

      <div className=" px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="relative h-64 md:h-80 lg:h-96 rounded-t-2xl overflow-hidden">
                    {/* Image Carousel */}
                    {propertyImages.length > 0 ? (
                      <Carousel className="w-full h-full">
                        <CarouselContent className="h-full">
                          {propertyImages.map((imageUrl, index) => (
                            <CarouselItem key={index} className="h-full">
                              <div className="relative h-full">
                                <img
                                  src={imageUrl}
                                  alt={`${property.title} - Image ${index + 1}`}
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => setShowPhotoModal(true)}
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        {propertyImages.length > 1 && (
                          <>
                            <CarouselPrevious className="left-4 bg-white/90 hover:bg-white text-slate-800 border-slate-200 shadow-lg">
                              <ChevronLeft className="h-5 w-5" />
                            </CarouselPrevious>
                            <CarouselNext className="right-4 bg-white/90 hover:bg-white text-slate-800 border-slate-200 shadow-lg">
                              <ChevronRight className="h-5 w-5" />
                            </CarouselNext>
                          </>
                        )}
                      </Carousel>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-slate-100">
                        <div className="text-center text-slate-400">
                          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                          <p>No images available</p>
                        </div>
                      </div>
                    )}

                    {/* Image counter badge (if multiple images) */}
                    {propertyImages.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm z-10">
                        {propertyImages.length} photos
                      </div>
                    )}
                  </div>

                  {/* Property type and sustainability badges */}
                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                    <Badge
                      variant="secondary"
                      className="bg-white/90 backdrop-blur-lg border border-white/20 shadow-lg text-slate-800 font-semibold px-3 py-1.5 rounded-full hover:bg-white/95 transition-all duration-200"
                    >
                      <Icon className={`h-3.5 w-3.5 mr-2 ${iconColor}`} />
                      {property.type === "real-estate"
                        ? "Real Estate"
                        : property.type.charAt(0).toUpperCase() +
                          property.type.slice(1)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50/90 backdrop-blur-lg border border-emerald-200/60 shadow-lg text-emerald-800 font-semibold px-3 py-1.5 rounded-full hover:bg-emerald-50/95 transition-all duration-200"
                    >
                      Sustainability: {property.sustainabilityScore}/100
                    </Badge>
                  </div>

                  {/* Sale Status Badge */}
                  {(property.availableSupply > 0 && (property.status === "open" || !property.status)) && (
                    <Badge
                      variant="default"
                      className="absolute top-4 right-4 bg-emerald-500/95 text-white backdrop-blur-lg border border-emerald-600/20 shadow-lg font-semibold px-3 py-1.5 rounded-full hover:bg-emerald-500 transition-all duration-200"
                    >
                      Sale Active
                    </Badge>
                  )}
                  {(property.availableSupply === 0 || property.status === "closed") && (
                    <Badge
                      variant="secondary"
                      className="absolute top-4 right-4 bg-slate-800/95 text-white backdrop-blur-lg border border-slate-700/20 shadow-lg font-semibold px-3 py-1.5 rounded-full hover:bg-slate-800 transition-all duration-200"
                    >
                      Sold Out
                    </Badge>
                  )}
                </div>

                {/* Property Information Section - Increased spacing */}
                <div className="p-6 sm:p-8 mt-12 pt-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
                        {property.title}
                      </h1>
                      <div className="flex items-center text-slate-600 mb-6">
                        <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                        <span className="text-base font-medium">
                          {property.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-8">
                      <div className="text-3xl font-bold text-slate-900 mb-1">
                        {formatLargeHBAR(totalValue)}
                      </div>
                      <div className="text-sm text-slate-500 font-medium">
                        Total Value
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed text-base max-w-4xl">
                    {property.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {property.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors px-4 py-2 rounded-full font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Stats */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-slate-900 font-semibold">
                  <BarChart3 className="h-5 w-5 mr-2 text-slate-600" />
                  Property Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-200 hover:shadow-sm">
                    <div className="text-lg font-semibold text-slate-900">
                      {stats.area}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">
                      Total Area
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-200 hover:shadow-sm">
                    <div className="text-lg font-semibold text-slate-900">
                      {stats.established}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">
                      Established
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-200 hover:shadow-sm">
                    <div className="text-lg font-semibold text-slate-900">
                      {stats.totalShares.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">
                      Total Shares
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-200 hover:shadow-sm">
                    <div className="text-lg font-semibold text-slate-900">
                      {formatHBAR(stats.pricePerShare)}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">
                      Price per Share
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ownership Breakdown */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-slate-900 font-semibold">
                  <Users className="h-5 w-5 mr-2 text-slate-600" />
                  Ownership Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">
                      Owned by Investors
                    </span>
                    <span className="font-bold text-slate-900">
                      {ownedPercentage.toFixed(2)}%
                    </span>
                  </div>
                  <Progress value={ownedPercentage} className="h-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">
                      Available for Purchase
                    </span>
                    <span className="font-bold text-emerald-600">
                      {(100 - ownedPercentage).toFixed(2)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-emerald-50/80 hover:bg-emerald-100/80 rounded-xl border border-emerald-100 hover:border-emerald-200 transition-all duration-200 hover:shadow-sm">
                      <div className="text-lg font-bold text-emerald-700">
                        {Math.floor(sharesOwned).toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600 font-medium">
                        Shares Owned
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50/80 hover:bg-blue-100/80 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-200 hover:shadow-sm">
                      <div className="text-lg font-bold text-blue-700">
                        {Math.floor(availableShares).toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600 font-medium">
                        Shares Available
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Timeline and Documents */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
              <Tabs defaultValue="timeline" className="w-full">
                <div className="px-6 pt-6 pb-4">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg">
                    <TabsTrigger
                      value="timeline"
                      className="rounded-md font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 hover:text-slate-800 transition-all duration-200"
                    >
                      Activity Timeline
                    </TabsTrigger>
                    <TabsTrigger
                      value="documents"
                      className="rounded-md font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-600 hover:text-slate-800 transition-all duration-200"
                    >
                      Documents
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="timeline" className="px-6 pb-6 pt-0">
                  <ActivityTimeline propertyId={property.id} />
                </TabsContent>
                <TabsContent value="documents" className="px-6 pb-6 pt-0">
                  <DocumentDrawer propertyId={property.id} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Buy Panel */}
            <BuyPanel property={property} />

            {/* Yield Information */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm mb-[27px]">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-slate-900 font-semibold">
                  <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                  Yield Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-0">
                <div className="flex justify-between items-center p-4 bg-emerald-50/80 hover:bg-emerald-100/80 rounded-xl border border-emerald-100 hover:border-emerald-200 transition-all duration-200">
                  <span className="text-slate-600 font-medium">
                    Expected Annual Yield
                  </span>
                  <span className="text-xl font-bold text-emerald-600">
                    {property.expectedYield}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50/80 hover:bg-slate-100/80 rounded-lg border border-slate-100 hover:border-slate-200 transition-all duration-200">
                  <span className="text-slate-600 font-medium">
                    Last Distribution
                  </span>
                  <span className="font-semibold text-slate-900">
                    {loadingDistributions ? (
                      <span className="text-slate-400">Loading...</span>
                    ) : lastDistribution ? (
                      formatHBAR(lastDistribution.totalAmount || 0)
                    ) : (
                      property.lastDistribution || "No distributions yet"
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50/80 hover:bg-slate-100/80 rounded-lg border border-slate-100 hover:border-slate-200 transition-all duration-200">
                  <span className="text-slate-600 font-medium">
                    Next Distribution
                  </span>
                  <span className="font-semibold text-slate-900">
                    {getNextDistributionDate()}
                  </span>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-600 font-medium mb-3">
                    Distribution History (12 months)
                  </div>
                  <div className="h-32 bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-all duration-200">
                    {loadingDistributions ? (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-slate-400 text-sm">Loading chart...</span>
                      </div>
                    ) : distributionHistory.length > 0 ? (
                      <>
                        <div className="h-full flex items-end justify-between space-x-1">
                          {distributionHistory.map((data, index) => {
                            const intensity = Math.min(data.height / 100, 1);
                            const colorClass = 
                              intensity > 0.8 ? 'bg-emerald-500' :
                              intensity > 0.6 ? 'bg-emerald-400' :
                              intensity > 0.4 ? 'bg-emerald-300' :
                              intensity > 0.2 ? 'bg-emerald-200' :
                              'bg-emerald-100';
                            return (
                              <div
                                key={index}
                                className={`flex-1 ${colorClass} rounded-t-sm transition-all duration-300 hover:opacity-80`}
                                style={{ height: `${Math.max(data.height, 5)}%` }}
                                title={`${data.month}: ${formatHBAR(data.amount)}`}
                              ></div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                          <span>{distributionHistory[0]?.month || 'Jan'}</span>
                          <span>{distributionHistory[Math.floor(distributionHistory.length / 2)]?.month || 'Jun'}</span>
                          <span>{distributionHistory[distributionHistory.length - 1]?.month || 'Dec'}</span>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-slate-400 text-sm">No distribution data available</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-900 font-semibold">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-all duration-200 rounded-xl py-3 h-auto font-medium hover:shadow-sm"
                  onClick={handleDownloadProspectus}
                  disabled={downloadingProspectus}
                >
                  <FileText className="h-4 w-4 mr-3 text-slate-500" />
                  {downloadingProspectus
                    ? "Downloading..."
                    : "Download Prospectus"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-all duration-200 rounded-xl py-3 h-auto font-medium hover:shadow-sm"
                  onClick={handleScheduleVisit}
                  disabled={schedulingVisit}
                >
                  <Calendar className="h-4 w-4 mr-3 text-slate-500" />
                  {schedulingVisit ? "Scheduling..." : "Schedule Site Visit"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-all duration-200 rounded-xl py-3 h-auto font-medium hover:shadow-sm"
                  onClick={handleViewReports}
                  disabled={viewingReports}
                >
                  <DollarSign className="h-4 w-4 mr-3 text-slate-500" />
                  {viewingReports ? "Loading..." : "View Financial Reports"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showPhotoModal && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div 
            className="relative w-full max-w-6xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-semibold">
                {property.title} - Photos ({allImages.length})
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPhotoModal(false)}
                className="text-white hover:bg-white/10 rounded-full p-2"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            {/* Carousel in Modal */}
            {allImages.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {allImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative flex items-center justify-center min-h-[60vh] bg-black/50 rounded-lg">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg"
                          onError={(e) => {
                            console.error('Failed to load image:', image.src);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            // Show error message
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'flex flex-col items-center justify-center text-white p-8';
                            errorDiv.innerHTML = `
                              <svg class="h-16 w-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p class="text-lg">Failed to load image</p>
                              <p class="text-sm text-gray-400 mt-2 break-all max-w-md">${image.src}</p>
                            `;
                            target.parentElement?.appendChild(errorDiv);
                          }}
                          onLoad={(e) => {
                            // Remove any error messages when image loads successfully
                            const target = e.target as HTMLImageElement;
                            target.style.display = '';
                            const errorDiv = target.parentElement?.querySelector('div');
                            if (errorDiv) {
                              errorDiv.remove();
                            }
                          }}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {allImages.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4 bg-white/90 hover:bg-white text-slate-800 border-slate-200 shadow-lg">
                      <ChevronLeft className="h-5 w-5" />
                    </CarouselPrevious>
                    <CarouselNext className="right-4 bg-white/90 hover:bg-white text-slate-800 border-slate-200 shadow-lg">
                      <ChevronRight className="h-5 w-5" />
                    </CarouselNext>
                  </>
                )}
              </Carousel>
            ) : (
              <div className="flex items-center justify-center h-64 text-white">
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                  <p>No images available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
