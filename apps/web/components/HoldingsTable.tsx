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

interface HoldingData {
  id: string;
  name: string;
  category: string;
  sharesOwned: number;
  oldPrice: number;
  value: number;
  yield: number;
  gainLoss: {
    percentage: number;
    isGain: boolean;
  };
  status: "sell" | "sold" | "hold";
  aiInsight: string;
  image: string;
}

const mockHoldings: HoldingData[] = [
  {
    id: "1",
    name: "Sustainable office complex",
    category: "Wearables",
    sharesOwned: 30,
    oldPrice: 2000,
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
    oldPrice: 1500,
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
    oldPrice: 150,
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
    oldPrice: 300,
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
    oldPrice: 1200,
    value: 1200,
    yield: 8.5,
    gainLoss: { percentage: 14.5, isGain: false },
    status: "sold",
    aiInsight: "Growing demand, maintain current stock.",
    image: "/portfolio/building-img.png",
  },
];

export default function HoldingsTable() {
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
            <TableHead className="w-[101px] text-xs text-muted-foreground font-medium">
              Old Price
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
              AI Insight
            </TableHead>
            <TableHead className="w-14 text-center text-xs text-muted-foreground font-medium">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockHoldings.map((holding) => (
            <TableRow key={holding.id}>
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
                      <div className="text-xs font-medium text-[#0A0D14]">
                        {holding.name}
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
                  ${holding.oldPrice.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs font-medium text-[#0A0D14]">
                  ${holding.value.toLocaleString()}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-[#2D9F75]">$</span>
                  <span className="text-xs text-[#0A0D14]">
                    {holding.yield}
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
                    {holding.aiInsight}
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
          ))}
        </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4 p-4">
        {mockHoldings.map((holding) => (
          <div key={holding.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
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
                <div className="text-sm font-medium text-[#0A0D14] mb-1">
                  {holding.name}
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

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Shares Owned</div>
                <div className="text-sm font-medium text-[#0A0D14]">{holding.sharesOwned}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Value</div>
                <div className="text-sm font-medium text-[#0A0D14]">${holding.value.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Old Price</div>
                <div className="text-sm font-medium text-[#0A0D14]">${holding.oldPrice.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Yield</div>
                <div className="text-sm font-medium text-[#0A0D14]">{holding.yield}%</div>
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

            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-2">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="mt-0.5 flex-shrink-0">
                  <path d="M5 1L8 4H2L5 1Z" fill="#0A0D14" />
                </svg>
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">AI Insight</div>
                  <div className="text-xs text-[#0A0D14]">{holding.aiInsight}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
