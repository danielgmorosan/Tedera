"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { FileText, Download, Eye, Calendar, Shield, BarChart3 } from "lucide-react"

interface Document {
  id: string
  title: string
  type: "appraisal" | "sustainability" | "legal" | "financial"
  description: string
  size: string
  lastUpdated: string
  status: "current" | "archived"
}

interface DocumentDrawerProps {
  propertyId: string
}

const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Property Appraisal Report",
    type: "appraisal",
    description: "Independent third-party valuation of the property assets",
    size: "2.4 MB",
    lastUpdated: "2024-01-15",
    status: "current",
  },
  {
    id: "2",
    title: "Sustainability Impact Report",
    type: "sustainability",
    description: "Annual environmental and social impact assessment",
    size: "1.8 MB",
    lastUpdated: "2024-01-10",
    status: "current",
  },
  {
    id: "3",
    title: "Title Deeds & Legal Documents",
    type: "legal",
    description: "Property ownership documents and legal certificates",
    size: "3.2 MB",
    lastUpdated: "2023-12-01",
    status: "current",
  },
  {
    id: "4",
    title: "Financial Performance Q4 2023",
    type: "financial",
    description: "Quarterly financial statements and profit distribution details",
    size: "1.1 MB",
    lastUpdated: "2024-01-05",
    status: "current",
  },
  {
    id: "5",
    title: "Carbon Credit Certification",
    type: "sustainability",
    description: "Verified carbon credit certificates and methodology",
    size: "0.9 MB",
    lastUpdated: "2023-11-20",
    status: "current",
  },
  {
    id: "6",
    title: "Insurance Documentation",
    type: "legal",
    description: "Property insurance policies and coverage details",
    size: "1.5 MB",
    lastUpdated: "2023-10-15",
    status: "archived",
  },
]

const documentIcons = {
  appraisal: BarChart3,
  sustainability: Shield,
  legal: FileText,
  financial: Calendar,
}

const documentColors = {
  appraisal: "text-blue-600",
  sustainability: "text-green-600",
  legal: "text-purple-600",
  financial: "text-orange-600",
}

export function DocumentDrawer({ propertyId }: DocumentDrawerProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleDownload = async (document: Document) => {
    setDownloadingId(document.id)

    try {
      // Simulate download delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create a mock download
      const blob = new Blob([`Mock content for ${document.title}`], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${document.title.replace(/\s+/g, "_")}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Download Complete",
        description: `${document.title} has been downloaded successfully.`,
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const handlePreview = async (document: Document) => {
    setPreviewingId(document.id)

    try {
      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Open preview in new window (simulated)
      const previewWindow = window.open("", "_blank", "width=800,height=600")
      if (previewWindow) {
        previewWindow.document.write(`
          <html>
            <head><title>${document.title} - Preview</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h1>${document.title}</h1>
              <p><strong>Type:</strong> ${document.type}</p>
              <p><strong>Description:</strong> ${document.description}</p>
              <p><strong>Size:</strong> ${document.size}</p>
              <p><strong>Last Updated:</strong> ${formatDate(document.lastUpdated)}</p>
              <hr>
              <p>This is a preview of the document content. The actual document would be displayed here.</p>
            </body>
          </html>
        `)
        previewWindow.document.close()
      }

      toast({
        title: "Preview Opened",
        description: `${document.title} preview opened in a new window.`,
      })
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: "There was an error opening the document preview. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPreviewingId(null)
    }
  }

  const currentDocuments = mockDocuments.filter((doc) => doc.status === "current")
  const archivedDocuments = mockDocuments.filter((doc) => doc.status === "archived")

  return (
    <div className="space-y-6">
      {/* Current Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Current Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentDocuments.map((document) => {
              const Icon = documentIcons[document.type]
              const iconColor = documentColors[document.type]

              return (
                <div
                  key={document.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{document.title}</h4>
                        <p className="text-sm text-muted-foreground">{document.description}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {document.type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{document.size}</span>
                        <span>Updated {formatDate(document.lastUpdated)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(document)}
                          disabled={previewingId === document.id || downloadingId === document.id}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {previewingId === document.id ? "Opening..." : "Preview"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(document)}
                          disabled={downloadingId === document.id || previewingId === document.id}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {downloadingId === document.id ? "Downloading..." : "Download"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Archived Documents */}
      {archivedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Archived Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {archivedDocuments.map((document) => {
                const Icon = documentIcons[document.type]
                const iconColor = documentColors[document.type]

                return (
                  <div key={document.id} className="flex items-start gap-4 p-4 border rounded-lg opacity-75">
                    <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground">{document.title}</h4>
                          <p className="text-sm text-muted-foreground">{document.description}</p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          Archived
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{document.size}</span>
                          <span>Updated {formatDate(document.lastUpdated)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(document)}
                          disabled={downloadingId === document.id}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {downloadingId === document.id ? "Downloading..." : "Download"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
