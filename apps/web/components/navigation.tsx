"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { Leaf, Menu, X, Store, PieChart, Settings } from "lucide-react"

interface NavigationProps {
  currentPage: "marketplace" | "portfolio" | "admin"
  onNavigate: (page: "marketplace" | "portfolio" | "admin") => void
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { id: "marketplace", label: "Marketplace", description: "Browse and invest in properties", icon: Store },
    { id: "portfolio", label: "Portfolio", description: "Track your investments", icon: PieChart },
    { id: "admin", label: "Admin", description: "Manage platform", icon: Settings },
  ]

  return (
    <>
      <header className="md:hidden border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onNavigate("marketplace")}
                className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 cursor-pointer"
              >
                <Leaf className="h-5 w-5 text-white" />
              </button>
              <h1 className="text-xl font-bold text-slate-900">hedera terra</h1>
            </div>
            <div className="flex items-center gap-3">
              <WalletConnectButton />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id as "marketplace" | "portfolio" | "admin")
                        setIsMobileMenuOpen(false)
                      }}
                      className={`flex items-center gap-4 w-full text-left p-4 rounded-xl transition-all duration-200 ${
                        currentPage === item.id
                          ? "bg-slate-50 text-slate-900 font-medium"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-slate-500">{item.description}</div>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      <aside className="hidden md:flex fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 flex-col z-40">
        {/* Logo Section */}
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onNavigate("marketplace")}
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 cursor-pointer"
            >
              <Leaf className="h-7 w-7 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">hedera terra</h1>
              <p className="text-sm text-slate-500 mt-1">RWA Marketplace</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as "marketplace" | "portfolio" | "admin")}
                  className={`flex items-center gap-4 w-full text-left p-4 rounded-2xl transition-all duration-200 ${
                    currentPage === item.id
                      ? "bg-slate-50 text-slate-900 font-medium shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${
                      currentPage === item.id ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{item.label}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Wallet Connection at Bottom */}
        <div className="p-6 border-t border-slate-200/50 bg-gradient-to-br from-slate-50/80 to-emerald-50/30 backdrop-blur-sm">
          <div className="space-y-3">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider px-1">Wallet Connection</div>
            <WalletConnectButton />
          </div>
        </div>
      </aside>
    </>
  )
}
