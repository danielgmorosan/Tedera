"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Coins, FileText, Shield } from "lucide-react";

interface EquityTokenForm {
  // Create Equity
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: string;
  isin: string;

  // Specific Details
  nominalValue: string;
  currency: string;
  numberOfShares: string;
  totalValue: string;
  chosenRights: string[];
  dividendType: string;

  // Regulation
  regulationType: string;
  regulationSubType: string;
  blockedCountries: string[];
}

interface CreatedToken extends EquityTokenForm {
  id: string;
  transactionHash: string;
  tokenAddress: string;
  evmTokenAddress: string;
  createdAt: string;
}

const RIGHTS_OPTIONS = [
  "Voting Rights",
  "Liquidation Rights",
  "Information Rights",
  "Conversion Rights",
  "Put Right",
];

const DIVIDEND_TYPES = [
  "Fixed Dividend",
  "Variable Dividend",
  "Cumulative Dividend",
  "Non-Cumulative Dividend",
];

const REGULATION_TYPES = [
  "Regulation D",
  "Regulation S",
  "Regulation A+",
  "Regulation CF",
];

const REGULATION_SUB_TYPES = [
  "506(b)",
  "506(c)",
  "Rule 144A",
  "Tier I",
  "Tier II",
];

const COUNTRIES = [
  "United States",
  "China",
  "Russia",
  "Iran",
  "North Korea",
  "Syria",
  "Cuba",
];

export function CreateEquityTokenForm() {
  const [formData, setFormData] = useState<EquityTokenForm>({
    tokenName: "",
    tokenSymbol: "",
    tokenDecimals: "18",
    isin: "",
    nominalValue: "",
    currency: "USD",
    numberOfShares: "",
    totalValue: "",
    chosenRights: [],
    dividendType: "",
    regulationType: "",
    regulationSubType: "",
    blockedCountries: [],
  });

  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdTokens, setCreatedTokens] = useState<CreatedToken[]>([]);
  const [search, setSearch] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Load any previously stored tokens from localStorage (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("createdEquityTokens");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          console.log("Loaded tokens from localStorage:", parsed);
          setCreatedTokens(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to parse createdEquityTokens from localStorage", e);
    }
  }, []);

  const filteredTokens = useMemo(() => {
    if (!search.trim()) return createdTokens;
    const q = search.toLowerCase();
    return createdTokens.filter((t) =>
      [t.tokenName, t.tokenSymbol, t.isin].some((field) =>
        field.toLowerCase().includes(q)
      )
    );
  }, [createdTokens, search]);

  const handleInputChange = (field: keyof EquityTokenForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRightsChange = (right: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      chosenRights: checked
        ? [...prev.chosenRights, right]
        : prev.chosenRights.filter((r) => r !== right),
    }));
  };

  const handleCountryChange = (country: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      blockedCountries: checked
        ? [...prev.blockedCountries, country]
        : prev.blockedCountries.filter((c) => c !== country),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tokenName) newErrors.tokenName = "Token name is required";
    if (!formData.tokenSymbol)
      newErrors.tokenSymbol = "Token symbol is required";
    if (!formData.isin) newErrors.isin = "ISIN is required";
    if (!formData.nominalValue)
      newErrors.nominalValue = "Nominal value is required";
    if (!formData.numberOfShares)
      newErrors.numberOfShares = "Number of shares is required";
    if (!formData.totalValue) newErrors.totalValue = "Total value is required";
    if (formData.chosenRights.length === 0)
      newErrors.chosenRights = "At least one right must be selected";
    if (!formData.dividendType)
      newErrors.dividendType = "Dividend type is required";
    if (!formData.regulationType)
      newErrors.regulationType = "Regulation type is required";
    if (!formData.regulationSubType)
      newErrors.regulationSubType = "Regulation sub-type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateToken = async () => {
    if (!validateForm()) return;

    setIsCreating(true);

    try {
      // Check if wallet is connected
      const { ethereum } = window as any;
      if (!ethereum) {
        alert('Please install MetaMask to create equity tokens');
        setIsCreating(false);
        return;
      }

      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        alert('Please connect your MetaMask wallet');
        setIsCreating(false);
        return;
      }

      // Switch to Hedera testnet
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x128' }], // Hedera testnet chain ID (296)
        });
      } catch (switchError: any) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x128',
              chainName: 'Hedera Testnet',
              nativeCurrency: {
                name: 'HBAR',
                symbol: 'HBAR',
                decimals: 18
              },
              rpcUrls: ['https://testnet.hashio.io/api'],
              blockExplorerUrls: ['https://hashscan.io/testnet']
            }],
          });
        }
      }

      // Call the API to deploy the equity token
      const response = await fetch('/api/equity-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.tokenName,
          symbol: formData.tokenSymbol,
          decimals: parseInt(formData.tokenDecimals),
          isin: formData.isin,
          nominalValue: formData.nominalValue,
          currency: formData.currency,
          numberOfShares: formData.numberOfShares,
          totalValue: formData.totalValue,
          chosenRights: formData.chosenRights,
          dividendType: formData.dividendType,
          regulationType: formData.regulationType,
          regulationSubType: formData.regulationSubType,
          blockedCountries: formData.blockedCountries,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create equity token');
      }

      const result = await response.json();
      const transactionHash = result.transactionId || result.transactionHash;
      const tokenAddress = result.tokenAddress || result.evmTokenAddress;
      const evmTokenAddress = result.evmTokenAddress || result.tokenAddress;

      console.log("API Response:", result);
      console.log("Extracted values:", { transactionHash, tokenAddress, evmTokenAddress });

      const newToken: CreatedToken = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        transactionHash,
        tokenAddress,
        evmTokenAddress,
        createdAt: new Date().toISOString(),
        ...formData,
      };

      setCreatedTokens((prev) => {
        const updated = [newToken, ...prev];
        try {
          localStorage.setItem("createdEquityTokens", JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to persist createdEquityTokens", e);
        }
        return updated;
      });

      alert(
        "Equity token created successfully! Transaction confirmed on blockchain."
      );

      // Reset form
      setFormData({
        tokenName: "",
        tokenSymbol: "",
        tokenDecimals: "18",
        isin: "",
        nominalValue: "",
        currency: "USD",
        numberOfShares: "",
        totalValue: "",
        chosenRights: [],
        dividendType: "",
        regulationType: "",
        regulationSubType: "",
        blockedCountries: [],
      });
    } catch (error) {
      console.error("Error creating token:", error);
      alert(`Failed to create equity token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <Coins className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Create Equity Token
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Configure and deploy a new equity token on the blockchain
            </p>
          </div>
        </div>
      </div>

      {filteredTokens.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Previous Equity Tokens
                </h3>
                <p className="text-sm text-slate-500">
                  View and manage all previously created equity tokens
                </p>
              </div>
            </div>

            {/* Test Copy Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const testText = "0x1234567890abcdef1234567890abcdef12345678";
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      await navigator.clipboard.writeText(testText);
                      alert("Test copy successful! Check your clipboard.");
                    } else {
                      alert("Clipboard API not available");
                    }
                  } catch (error) {
                    alert("Test copy failed: " + error);
                  }
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Test Copy Function
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by token name, symbol, or ISIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    ISIN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredTokens.map((token) => (
                  <tr key={token.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {token.tokenSymbol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {token.tokenName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-500">EQUITY</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">
                        {token.isin}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm text-slate-900 font-mono"
                          title={token.tokenAddress || token.evmTokenAddress || token.transactionHash}
                        >
                          {(token.tokenAddress || token.evmTokenAddress || token.transactionHash || '').slice(0, 6)}...
                          {(token.tokenAddress || token.evmTokenAddress || token.transactionHash || '').slice(-4)}
                        </span>
                        <button
                          type="button"
                          onClick={async (event) => {
                            event.preventDefault();
                            event.stopPropagation();

                            const addressToCopy = token.tokenAddress || token.evmTokenAddress || token.transactionHash;
                            console.log("Attempting to copy:", addressToCopy);

                            if (!addressToCopy) {
                              console.error("No address to copy");
                              alert("No address available to copy");
                              return;
                            }

                            try {
                              // Method 1: Try modern clipboard API
                              if (navigator.clipboard && navigator.clipboard.writeText) {
                                await navigator.clipboard.writeText(addressToCopy);
                                console.log("✅ Copied using Clipboard API");
                              } else {
                                // Method 2: Fallback to textarea method
                                const textArea = document.createElement('textarea');
                                textArea.value = addressToCopy;
                                textArea.style.position = 'absolute';
                                textArea.style.left = '-9999px';
                                textArea.style.top = '0';
                                textArea.setAttribute('readonly', '');
                                document.body.appendChild(textArea);

                                // Select the text
                                if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
                                  // iOS specific
                                  const range = document.createRange();
                                  range.selectNodeContents(textArea);
                                  const selection = window.getSelection();
                                  selection?.removeAllRanges();
                                  selection?.addRange(range);
                                  textArea.setSelectionRange(0, 999999);
                                } else {
                                  textArea.select();
                                }

                                const successful = document.execCommand('copy');
                                document.body.removeChild(textArea);

                                if (!successful) {
                                  throw new Error("execCommand failed");
                                }
                                console.log("✅ Copied using execCommand");
                              }

                              // Show success feedback
                              setCopiedAddress(addressToCopy);
                              setTimeout(() => setCopiedAddress(null), 2000);
                              console.log("✅ Successfully copied address:", addressToCopy);

                            } catch (error) {
                              console.error("❌ All copy methods failed:", error);

                              // Last resort: Create a prompt with the address
                              const userCopied = window.prompt(
                                "Automatic copy failed. Please copy this address manually (Ctrl+C or Cmd+C):",
                                addressToCopy
                              );

                              if (userCopied !== null) {
                                // User clicked OK, assume they copied it
                                setCopiedAddress(addressToCopy);
                                setTimeout(() => setCopiedAddress(null), 2000);
                              }
                            }
                          }}
                          className={`transition-colors ${
                            copiedAddress === (token.tokenAddress || token.evmTokenAddress || token.transactionHash)
                              ? "text-green-600"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                          title={
                            copiedAddress === (token.tokenAddress || token.evmTokenAddress || token.transactionHash)
                              ? "Copied!"
                              : "Copy address"
                          }
                        >
                          {copiedAddress === (token.tokenAddress || token.evmTokenAddress || token.transactionHash) ? (
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {filteredTokens.length} token
              {filteredTokens.length !== 1 ? "s" : ""} found
            </p>
            {search && filteredTokens.length !== createdTokens.length && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs text-emerald-600 hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      )}
      {filteredTokens.length === 0 && createdTokens.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 bg-white">
          No equity tokens created yet. Fill the form below to deploy your first
          token.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Equity Section */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Coins className="h-5 w-5 text-emerald-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Create Equity
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="tokenName"
                className="text-sm font-medium text-slate-700"
              >
                Token Name
              </Label>
              <Input
                id="tokenName"
                value={formData.tokenName}
                onChange={(e) => handleInputChange("tokenName", e.target.value)}
                placeholder="e.g., Amazon Rainforest Conservation"
                className={`rounded-xl border-slate-200 ${errors.tokenName ? "border-red-300" : ""}`}
              />
              {errors.tokenName && (
                <p className="text-red-500 text-xs">{errors.tokenName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="tokenSymbol"
                className="text-sm font-medium text-slate-700"
              >
                Token Symbol
              </Label>
              <Input
                id="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={(e) =>
                  handleInputChange("tokenSymbol", e.target.value.toUpperCase())
                }
                placeholder="e.g., ARC"
                className={`rounded-xl border-slate-200 ${errors.tokenSymbol ? "border-red-300" : ""}`}
                maxLength={10}
              />
              {errors.tokenSymbol && (
                <p className="text-red-500 text-xs">{errors.tokenSymbol}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="tokenDecimals"
                className="text-sm font-medium text-slate-700"
              >
                Token Decimals
              </Label>
              <Select
                value={formData.tokenDecimals}
                onValueChange={(value) =>
                  handleInputChange("tokenDecimals", value)
                }
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="18">18</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="isin"
                className="text-sm font-medium text-slate-700"
              >
                ISIN
              </Label>
              <Input
                id="isin"
                value={formData.isin}
                onChange={(e) =>
                  handleInputChange("isin", e.target.value.toUpperCase())
                }
                placeholder="e.g., US1234567890"
                className={`rounded-xl border-slate-200 ${errors.isin ? "border-red-300" : ""}`}
                maxLength={12}
              />
              {errors.isin && (
                <p className="text-red-500 text-xs">{errors.isin}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Specific Details Section */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Specific Details
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="nominalValue"
                  className="text-sm font-medium text-slate-700"
                >
                  Nominal Value
                </Label>
                <Input
                  id="nominalValue"
                  type="number"
                  value={formData.nominalValue}
                  onChange={(e) =>
                    handleInputChange("nominalValue", e.target.value)
                  }
                  placeholder="1.00"
                  className={`rounded-xl border-slate-200 ${errors.nominalValue ? "border-red-300" : ""}`}
                />
                {errors.nominalValue && (
                  <p className="text-red-500 text-xs">{errors.nominalValue}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="currency"
                  className="text-sm font-medium text-slate-700"
                >
                  Currency
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="HBAR">HBAR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="numberOfShares"
                  className="text-sm font-medium text-slate-700"
                >
                  Number of Shares
                </Label>
                <Input
                  id="numberOfShares"
                  type="number"
                  value={formData.numberOfShares}
                  onChange={(e) =>
                    handleInputChange("numberOfShares", e.target.value)
                  }
                  placeholder="1000"
                  className={`rounded-xl border-slate-200 ${errors.numberOfShares ? "border-red-300" : ""}`}
                />
                {errors.numberOfShares && (
                  <p className="text-red-500 text-xs">
                    {errors.numberOfShares}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="totalValue"
                  className="text-sm font-medium text-slate-700"
                >
                  Total Value
                </Label>
                <Input
                  id="totalValue"
                  type="number"
                  value={formData.totalValue}
                  onChange={(e) =>
                    handleInputChange("totalValue", e.target.value)
                  }
                  placeholder="100000"
                  className={`rounded-xl border-slate-200 ${errors.totalValue ? "border-red-300" : ""}`}
                />
                {errors.totalValue && (
                  <p className="text-red-500 text-xs">{errors.totalValue}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">
                Chosen Rights
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {RIGHTS_OPTIONS.map((right) => (
                  <div key={right} className="flex items-center space-x-2">
                    <Checkbox
                      id={right}
                      checked={formData.chosenRights.includes(right)}
                      onCheckedChange={(checked) =>
                        handleRightsChange(right, checked as boolean)
                      }
                    />
                    <Label htmlFor={right} className="text-sm text-slate-600">
                      {right}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.chosenRights && (
                <p className="text-red-500 text-xs">{errors.chosenRights}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="dividendType"
                className="text-sm font-medium text-slate-700"
              >
                Dividend Type
              </Label>
              <Select
                value={formData.dividendType}
                onValueChange={(value) =>
                  handleInputChange("dividendType", value)
                }
              >
                <SelectTrigger
                  className={`rounded-xl border-slate-200 ${errors.dividendType ? "border-red-300" : ""}`}
                >
                  <SelectValue placeholder="Select dividend type" />
                </SelectTrigger>
                <SelectContent>
                  {DIVIDEND_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dividendType && (
                <p className="text-red-500 text-xs">{errors.dividendType}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regulation Section */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Regulation
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="regulationType"
                  className="text-sm font-medium text-slate-700"
                >
                  Regulation Type
                </Label>
                <Select
                  value={formData.regulationType}
                  onValueChange={(value) =>
                    handleInputChange("regulationType", value)
                  }
                >
                  <SelectTrigger
                    className={`rounded-xl border-slate-200 ${errors.regulationType ? "border-red-300" : ""}`}
                  >
                    <SelectValue placeholder="Select regulation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGULATION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.regulationType && (
                  <p className="text-red-500 text-xs">
                    {errors.regulationType}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="regulationSubType"
                  className="text-sm font-medium text-slate-700"
                >
                  Regulation Sub-type
                </Label>
                <Select
                  value={formData.regulationSubType}
                  onValueChange={(value) =>
                    handleInputChange("regulationSubType", value)
                  }
                >
                  <SelectTrigger
                    className={`rounded-xl border-slate-200 ${errors.regulationSubType ? "border-red-300" : ""}`}
                  >
                    <SelectValue placeholder="Select regulation sub-type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGULATION_SUB_TYPES.map((subType) => (
                      <SelectItem key={subType} value={subType}>
                        {subType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.regulationSubType && (
                  <p className="text-red-500 text-xs">
                    {errors.regulationSubType}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">
                Blocked Countries
              </Label>
              <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                {COUNTRIES.map((country) => (
                  <div key={country} className="flex items-center space-x-2">
                    <Checkbox
                      id={country}
                      checked={formData.blockedCountries.includes(country)}
                      onCheckedChange={(checked) =>
                        handleCountryChange(country, checked as boolean)
                      }
                    />
                    <Label htmlFor={country} className="text-sm text-slate-600">
                      {country}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary and Action */}
      <Card className="shadow-sm rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">
                Ready to Create Token?
              </h3>
              <p className="text-slate-600 text-sm">
                Review your configuration and click create to deploy your equity
                token on the blockchain.
              </p>
              {formData.chosenRights.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.chosenRights.map((right) => (
                    <Badge
                      key={right}
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 border border-emerald-200"
                    >
                      {right}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={() => {
                // Auto-compute total value if missing
                if (
                  !formData.totalValue &&
                  formData.numberOfShares &&
                  formData.nominalValue
                ) {
                  const total =
                    Number(formData.numberOfShares) *
                    Number(formData.nominalValue);
                  if (!Number.isNaN(total)) {
                    handleInputChange("totalValue", total.toString());
                  }
                }
                handleCreateToken();
              }}
              disabled={
                isCreating || !formData.tokenName || !formData.tokenSymbol
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-all duration-200 min-w-[200px]"
            >
              {isCreating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Creating Token...
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  Create Equity Token
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
