"use client";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Plane,
  Sparkles,
  MapPin,
  Calendar,
  Wallet,
  Users,
  History,
  Save,
  Mic,
  Download,
  Share2,
  Map,
  X,
  Copy,
  Check,
  Menu,
  ChevronLeft,
  Bold,
  List,
  Type,
  Eye,
  EyeOff,
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import maps to avoid SSR issues
const ItineraryMap = dynamic(
  () => import("../../components/itinerary/SimpleMap"),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-lg sm:rounded-xl h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading map...</p>
        </div>
      </div>
    ),
  }
);

// Interface untuk komunikasi dengan API
interface PromptMessage {
  role: "user" | "assistant";
  content: string;
}

// Interface untuk state lokal
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  messageId?: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `# 🌟 Halo! Saya AI Travel Assistant Anda  

**Mau pergi ke mana dan berapa hari?** Saya akan buatkan rencana perjalanan lengkap untuk Anda! 😊  

### Coba contoh ini:
• "Bali 5 hari dengan budget 3 juta"  
• "Jalan-jalan akhir pekan ke Bandung"  
• "3 hari di Jakarta bareng keluarga"  
• "Perjalanan budaya ke Yogyakarta selama 4 hari"`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingStep, setTypingStep] = useState("");
  const [conversationId, setConversationId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [creatingShare, setCreatingShare] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHTMLPreview, setShowHTMLPreview] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Fungsi untuk membersihkan HTML saat mulai edit
  const cleanHTMLForEditing = (html: string): string => {
    return html
      .replace(/<div[^>]*>/g, "")
      .replace(/<\/div>/g, "\n")
      .replace(/<p[^>]*>/g, "")
      .replace(/<\/p>/g, "\n\n")
      .replace(/<h1[^>]*>/g, "# ")
      .replace(/<\/h1>/g, "\n\n")
      .replace(/<h2[^>]*>/g, "## ")
      .replace(/<\/h2>/g, "\n\n")
      .replace(/<h3[^>]*>/g, "### ")
      .replace(/<\/h3>/g, "\n\n")
      .replace(/<strong[^>]*>/g, "**")
      .replace(/<\/strong>/g, "**")
      .replace(/<b[^>]*>/g, "**")
      .replace(/<\/b>/g, "**")
      .replace(/<span[^>]*>/g, "")
      .replace(/<\/span>/g, "")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/&nbsp;/g, " ")
      .replace(/<[^>]*>/g, "")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();
  };

  // Fungsi untuk mengubah teks yang diedit kembali ke HTML
  const convertEditedTextToHTML = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>")
      .replace(
        /^# (.*$)/gm,
        '<h1 style="color: #1e40af; font-size: 24px; font-weight: 700; margin: 20px 0 15px 0;">$1</h1>'
      )
      .replace(
        /^## (.*$)/gm,
        '<h2 style="color: #2563eb; font-size: 20px; font-weight: 600; margin: 15px 0 10px 0;">$1</h2>'
      )
      .replace(
        /^### (.*$)/gm,
        '<h3 style="color: #3b82f6; font-size: 18px; font-weight: 600; margin: 12px 0 8px 0;">$1</h3>'
      )
      .replace(
        /^• (.*$)/gm,
        '<li style="margin-left: 20px; margin-bottom: 5px;">• $1</li>'
      )
      .replace(
        /^-\s+(.*$)/gm,
        '<li style="margin-left: 20px; margin-bottom: 5px;">• $1</li>'
      )
      .replace(
        /^\d+\.\s+(.*$)/gm,
        '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>'
      )
      .replace(
        /Rp\s*([\d,.]+)/g,
        '<span style="background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Rp $1</span>'
      )
      .replace(
        /<li[^>]*>.*?<\/li>/g,
        (match) =>
          `<ul style="margin: 10px 0; padding-left: 20px;">${match}</ul>`
      )
      .replace(
        /<ul[^>]*><ul[^>]*>/g,
        '<ul style="margin: 10px 0; padding-left: 20px;">'
      )
      .replace(/<\/ul><\/ul>/g, "</ul>");
  };

  // Set isClient to true setelah hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate atau load conversation ID
  useEffect(() => {
    if (!isClient) return;

    const savedConvId = localStorage.getItem("travel_conversation_id");
    if (savedConvId) {
      setConversationId(savedConvId);
      // Load saved messages
      const savedMessages = localStorage.getItem(
        `chat_messages_${savedConvId}`
      );
      if (savedMessages && messages.length === 1) {
        try {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed);
        } catch (e) {
          console.error("Failed to load chat:", e);
        }
      }
    } else {
      const newConvId = `conv_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setConversationId(newConvId);
      localStorage.setItem("travel_conversation_id", newConvId);
    }
  }, [isClient]);

  // Auto-save messages
  useEffect(() => {
    if (!isClient || messages.length <= 1 || !conversationId) return;

    localStorage.setItem(
      `chat_messages_${conversationId}`,
      JSON.stringify(messages)
    );
  }, [messages, conversationId, isClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!isClient) return;

    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    };

    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, typingStep, isClient]);

  // Helper function untuk format waktu
  const formatTime = (timestamp: string) => {
    if (!isClient) return "";

    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  const simulateTyping = async () => {
    const steps = [
      "✈️ Menganalisis preferensi perjalanan Anda...",
      "🗺️ Mencari tempat wisata terbaik...",
      "🍽️ Menemukan restoran lokal autentik...",
      "💰 Menghitung estimasi budget optimal...",
      "📝 Merancang rencana perjalanan sempurna Anda...",
      "📝 Mengetik...",
    ];

    for (const step of steps) {
      setTypingStep(step);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  };

  // Handle send function
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    const messagesToSend: PromptMessage[] = [...messages, userMessage]
      .filter((msg) => msg.id !== "1")
      .map((msg) => ({ role: msg.role, content: msg.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    await simulateTyping();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          conversationId: conversationId,
          history: messagesToSend,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toISOString(),
          messageId: data.messageId,
        };

        setMessages((prev) => [...prev, aiMessage]);

        if (data.conversationId && data.conversationId !== conversationId) {
          setConversationId(data.conversationId);
          localStorage.setItem("travel_conversation_id", data.conversationId);
        }
      } else {
        throw new Error(data.error || "API request failed");
      }
    } catch (error: any) {
      console.error("Error:", error);

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Maaf, saya mengalami masalah. 😔  
        
**Error:** ${error.message || "Unknown error"}

**Silakan coba:** 1. Refresh halaman  
2. Sederhanakan permintaan Anda  
3. Coba lagi sebentar lagi`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTypingStep("");
    }
  };

  const handleDownloadPDF = async () => {
    const lastAIMessage = messages
      .filter((m: Message) => m.role === "assistant")
      .pop();

    if (!lastAIMessage) {
      alert("Tidak ada rencana perjalanan untuk diunduh");
      return;
    }

    setDownloadingPDF(true);

    try {
      const response = await fetch("/api/download-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itinerary: lastAIMessage.content,
          title: `Rencana Perjalanan - ${new Date().toLocaleDateString(
            "id-ID"
          )}`,
        }),
      });

      const data = await response.json();

      if (data.success && data.html) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(data.html);
          printWindow.document.close();
          printWindow.focus();

          setTimeout(() => {
            printWindow.print();
            printWindow.onafterprint = () => {
              printWindow.close();
            };
          }, 1000);
        }

        setShowExportModal(false);
      } else {
        throw new Error(data.error || "Gagal menghasilkan PDF");
      }
    } catch (error) {
      console.error("PDF Download Error:", error);
      alert(
        "Gagal menghasilkan PDF. Anda bisa menyalin teks dan menempelkannya ke Word/Google Docs."
      );
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleCreateShareLink = async () => {
    const lastAIMessage = messages
      .filter((m: Message) => m.role === "assistant")
      .pop();

    if (!lastAIMessage) {
      alert("Tidak ada rencana perjalanan untuk dibagikan");
      return;
    }

    setCreatingShare(true);
    try {
      const response = await fetch("/api/share/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: lastAIMessage.content,
          title: `Rencana Perjalanan - ${new Date().toLocaleDateString(
            "id-ID",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShareUrl(data.shareUrl);
        setShowExportModal(false);
        setShowShareModal(true);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Share error:", error);
      alert(`Gagal membuat tautan berbagi: ${error.message}`);
    } finally {
      setCreatingShare(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareOnWhatsApp = () => {
    const text = `Lihat rencana perjalanan saya: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareOnEmail = () => {
    const subject = "Rencana Perjalanan yang Dibagikan";
    const body = `Lihat rencana perjalanan saya: ${shareUrl}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`
    );
  };

  const handleNewChat = () => {
    if (
      window.confirm(
        "Mulai obrolan baru? Percakapan saat ini akan disimpan secara lokal."
      )
    ) {
      const newConvId = `conv_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setConversationId(newConvId);
      localStorage.setItem("travel_conversation_id", newConvId);
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `# 🌟 Halo! Saya AI Travel Assistant Anda  

**Mau pergi ke mana dan berapa hari?** Saya akan buatkan rencana perjalanan lengkap untuk Anda! 😊  

### Coba contoh ini:
• "Bali 5 hari dengan budget 3 juta"  
• "Jalan-jalan akhir pekan ke Bandung"  
• "3 hari di Jakarta bareng keluarga"  
• "Perjalanan budaya ke Yogyakarta selama 4 hari"`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setShowMap(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleVoiceInput = () => {
    if (!isClient) return;

    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = "id-ID";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert("Browser tidak mendukung voice input. Gunakan Chrome atau Edge.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Extract destination from messages untuk map
  const extractDestinationFromMessages = () => {
    const lastAIMessage = messages.filter((m) => m.role === "assistant").pop();
    if (!lastAIMessage) return null;

    const destinations = [
      "Bali",
      "Jakarta",
      "Yogyakarta",
      "Bandung",
      "Lombok",
      "Surabaya",
      "Medan",
    ];
    for (const dest of destinations) {
      if (lastAIMessage.content.includes(dest)) {
        return dest;
      }
    }
    return null;
  };

  // Fungsi untuk mulai edit
  const startEdit = (messageId: string, content: string) => {
    const cleanedContent = cleanHTMLForEditing(content);
    setEditingMessageId(messageId);
    setEditContent(cleanedContent);
    setIsEditing(true);
    setShowHTMLPreview(false);
  };

  // Fungsi untuk cancel edit
  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
    setIsEditing(false);
    setShowHTMLPreview(false);
  };

  // Fungsi untuk save edit
  const saveEdit = async () => {
    if (!editingMessageId || !editContent.trim()) return;

    const htmlContent = convertEditedTextToHTML(editContent);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === editingMessageId
          ? {
              ...msg,
              content: htmlContent,
              timestamp: new Date().toISOString(),
            }
          : msg
      )
    );

    if (conversationId) {
      const updatedMessages = messages.map((msg) =>
        msg.id === editingMessageId
          ? {
              ...msg,
              content: htmlContent,
              timestamp: new Date().toISOString(),
            }
          : msg
      );
      localStorage.setItem(
        `chat_messages_${conversationId}`,
        JSON.stringify(updatedMessages)
      );
    }

    cancelEdit();
    alert("✅ Rencana perjalanan berhasil diperbarui!");
  };

  const recreateItinerary = async (content: string) => {
    setIsLoading(true);

    try {
      const improvementRequest = `Tolong perbaiki dan tingkatkan rencana perjalanan ini. Buat lebih detail, tambahkan lebih banyak pilihan aktivitas, dan perbaiki rincian anggaran:\n\n${content}`;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: improvementRequest,
        timestamp: new Date().toISOString(),
      };

      const messagesToSend: PromptMessage[] = [...messages, userMessage]
        .filter((msg) => msg.id !== "1")
        .map((msg) => ({ role: msg.role, content: msg.content }));

      setMessages((prev) => [...prev, userMessage]);

      await simulateTyping();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: improvementRequest,
          conversationId: conversationId,
          history: messagesToSend,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toISOString(),
          messageId: data.messageId,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || "API request failed");
      }
    } catch (error: any) {
      console.error("Improvement error:", error);
      alert(`Gagal meningkatkan rencana perjalanan: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTypingStep("");
    }
  };

  // Quick prompt buttons
  const quickPrompts = [
    { text: "Bali 5 hari budget 3M", icon: MapPin },
    { text: "Weekend trip to Bandung", icon: Calendar },
    { text: "Jakarta 3 hari with family", icon: Users },
    { text: "Yogyakarta cultural trip", icon: Wallet },
  ];

  const hasItinerary = (() => {
    const lastAIMessage = messages.filter((m) => m.role === "assistant").pop();

    if (!lastAIMessage) return false;

    const content = lastAIMessage.content.toLowerCase();

    const hasDayPattern = /day\s+\d+|hari\s+\d+/i.test(content);
    const hasItineraryHeader =
      content.includes("itinerary") || content.includes("rencana perjalanan");
    const hasBudgetSection = /budget|harga|biaya/i.test(content);
    const hasSchedule = /schedule|jadwal|rencana/i.test(content);

    return (
      hasDayPattern || hasItineraryHeader || (hasBudgetSection && hasSchedule)
    );
  })();

  // Formatting functions untuk editor
  const applyFormat = (
    format: "bold" | "bullet" | "h1" | "h2" | "h3" | "price" | "table"
  ) => {
    const textarea = document.getElementById(
      "edit-textarea"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editContent.substring(start, end);
    let formattedText = "";

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "bullet":
        formattedText = `• ${selectedText}`;
        break;
      case "h1":
        formattedText = `# ${selectedText}`;
        break;
      case "h2":
        formattedText = `## ${selectedText}`;
        break;
      case "h3":
        formattedText = `### ${selectedText}`;
        break;
      case "price":
        formattedText = `Rp ${selectedText}`;
        break;
      case "table":
        formattedText = `\n| Day | Morning | Afternoon | Evening |\n| --- | --- | --- | --- |\n| Day 1 | Activity | Activity | Activity |\n`;
        break;
    }

    const newContent =
      editContent.substring(0, start) +
      formattedText +
      editContent.substring(end);
    setEditContent(newContent);

    // Focus kembali ke textarea
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // Insert template
  const insertTemplate = () => {
    const template = `# Nama Destinasi

## Day 1: Arrival & City Tour
• Morning: Check-in hotel & istirahat
• Afternoon: City tour & makan siang lokal
• Evening: Dinner & menikmati sunset

## Day 2: Cultural Exploration
• Morning: Kunjungi museum atau situs sejarah
• Afternoon: Belajar budaya lokal & kerajinan tangan
• Evening: Cultural show & dinner

**Budget per hari:** Rp 500.000 - 1.000.000`;

    setEditContent((prev) => prev + "\n\n" + template);
  };

  // Jangan render chat sebelum client ready
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">
            Memuat Travel Assistant...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                    Travel AI Planner
                  </h1>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Gemini AI
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  showMap
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Map</span>
              </button>

              {hasItinerary && (
                <button
                  onClick={() => {
                    const lastAIMessage = messages
                      .filter((m) => m.role === "assistant")
                      .pop();
                    if (lastAIMessage) {
                      startEdit(lastAIMessage.id, lastAIMessage.content);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-200 text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>Edit</span>
                </button>
              )}

              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                disabled={!hasItinerary}
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>

              <button
                onClick={handleNewChat}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <History className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-1">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`p-2 rounded-lg ${
                  showMap
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Map className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                disabled={!hasItinerary}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col gap-2">
              {hasItinerary && (
                <button
                  onClick={() => {
                    const lastAIMessage = messages
                      .filter((m) => m.role === "assistant")
                      .pop();
                    if (lastAIMessage) {
                      startEdit(lastAIMessage.id, lastAIMessage.content);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>Edit Itinerary</span>
                </button>
              )}
              <button
                onClick={handleNewChat}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <History className="w-5 h-5" />
                <span>New Chat</span>
              </button>
              <button
                onClick={() => {
                  setShowMap(!showMap);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <Map className="w-5 h-5" />
                <span>{showMap ? "Hide Map" : "Show Map"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Welcome Card */}
        {messages.length === 1 && (
          <div className="mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg">
              <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
                ✈️ Rencanakan Perjalanan Sempurna
              </h2>
              <p className="text-sm opacity-90 mb-3 sm:mb-4">
                Cukup ceritakan rencana perjalanan Anda, dan AI akan buatkan
                rencana rinci dengan anggaran!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(prompt.text);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-left group text-sm"
                  >
                    <prompt.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white group-hover:text-amber-200 flex-shrink-0" />
                    <span className="text-white truncate">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Layout Container */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          {/* Chat Container */}
          <div className={`${showMap ? "lg:w-2/3" : "w-full"}`}>
            <div
              ref={chatContainerRef}
              className="space-y-3 sm:space-y-4 mb-24 sm:mb-32 md:mb-28 h-[calc(100vh-220px)] sm:h-[calc(100vh-280px)] md:h-[calc(100vh-300px)] overflow-y-auto pr-2"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] rounded-xl sm:rounded-2xl ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-md"
                        : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {/* Message Header */}
                    <div className="p-2 sm:p-3 pb-0">
                      {message.role === "assistant" && (
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                            </div>
                            <span className="font-semibold text-xs sm:text-sm text-gray-700">
                              AI Assistant
                            </span>
                          </div>

                          {/* Action Buttons */}
                          {message.role === "assistant" &&
                            message.content.includes("Day") && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    startEdit(message.id, message.content)
                                  }
                                  className="p-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
                                  title="Edit itinerary"
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>

                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        "Minta AI untuk meningkatkan rencana perjalanan ini?"
                                      )
                                    ) {
                                      recreateItinerary(message.content);
                                    }
                                  }}
                                  disabled={isLoading}
                                  className="p-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 border border-purple-200 transition-colors"
                                  title="Tingkatkan dengan AI"
                                >
                                  <Sparkles className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                        </div>
                      )}

                      {message.role === "user" && (
                        <div className="flex items-center gap-1.5 mb-1 justify-end">
                          <span className="font-semibold text-xs sm:text-sm text-blue-100">
                            Anda
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="p-2 sm:p-3 pt-0">
                      {message.role === "assistant" ? (
                        <div className="relative">
                          {/* Scroll indicator for mobile */}
                          <div className="lg:hidden absolute right-0 top-0 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
                            ← Scroll →
                          </div>

                          <div
                            className="prose prose-sm max-w-none message-content text-xs sm:text-sm pt-4 lg:pt-0"
                            dangerouslySetInnerHTML={{
                              __html: message.content,
                            }}
                          />
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap break-words text-xs sm:text-sm">
                            {message.content.split("**").map((part, i) =>
                              i % 2 === 1 ? (
                                <strong
                                  key={i}
                                  className={`font-semibold ${
                                    message.role === "user"
                                      ? "text-blue-100"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {part}
                                </strong>
                              ) : (
                                <span
                                  key={i}
                                  className={
                                    message.role === "user"
                                      ? "text-white"
                                      : "text-gray-700"
                                  }
                                >
                                  {part}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div
                      className={`px-2 sm:px-3 pb-1.5 pt-0.5 text-xs text-gray-500 ${
                        message.role === "user"
                          ? "text-right text-blue-100/70"
                          : "text-left"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Animation */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] sm:max-w-[85%] bg-white border border-gray-200 rounded-xl sm:rounded-2xl rounded-bl-none shadow-sm p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white animate-pulse" />
                      </div>
                      <span className="font-semibold text-xs sm:text-sm text-gray-700">
                        Travel Assistant
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {typingStep}
                        </p>
                      </div>

                      <div className="flex gap-1 mt-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-2" />
            </div>
          </div>

          {/* Map Panel */}
          {showMap && (
            <div className="lg:w-1/3">
              <div className="sticky top-20 sm:top-24">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    Destination Map
                  </h3>
                  <button
                    onClick={() => setShowMap(false)}
                    className="lg:hidden p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <ItineraryMap destination={extractDestinationFromMessages()} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-3 sm:pt-6 sm:pb-4">
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
          <div className="relative">
            <button
              onClick={handleVoiceInput}
              className="absolute left-2 bottom-2 sm:left-3 sm:bottom-3 p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 transition-colors"
              disabled={isListening}
            >
              {isListening ? (
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-pulse" />
              ) : (
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Contoh: '3 hari di Jakarta dengan budget 2 juta per orang'"
              className="w-full pl-10 pr-12 sm:pl-12 sm:pr-14 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none transition-all bg-white shadow-md text-sm"
              rows={1}
              disabled={isLoading}
              style={{ minHeight: "48px", maxHeight: "100px" }}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Tekan{" "}
              <kbd className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-100 rounded text-xs border">
                Enter
              </kbd>{" "}
              untuk mengirim • Shift + Enter untuk baris baru
            </p>
          </div>
        </div>
      </div>

      {/* Export Modal - Responsif */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-sm sm:max-w-md w-full p-4 sm:p-5">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-800">
                Opsi Ekspor
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPDF}
                className="w-full p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 sm:gap-3 disabled:opacity-50"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-blue-700 text-sm sm:text-base">
                    Unduh sebagai PDF
                  </div>
                  <div className="text-xs sm:text-sm text-blue-600">
                    Format yang dapat dicetak
                  </div>
                </div>
                {downloadingPDF && (
                  <div className="ml-auto animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
                )}
              </button>

              <button
                onClick={handleCreateShareLink}
                disabled={creatingShare}
                className="w-full p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2 sm:gap-3 disabled:opacity-50"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-green-700 text-sm sm:text-base">
                    Buat Tautan Berbagi
                  </div>
                  <div className="text-xs sm:text-sm text-green-600">
                    Hasilkan URL yang dapat dibagikan
                  </div>
                </div>
                {creatingShare && (
                  <div className="ml-auto animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-green-600"></div>
                )}
              </button>

              <button
                onClick={() => setShowExportModal(false)}
                className="w-full p-2 sm:p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mt-2 sm:mt-3 text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal - Responsif */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-sm sm:max-w-md w-full p-4 sm:p-5">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-800">
                Bagikan Rencana Perjalanan
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tautan Berbagi
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-gray-50 text-xs truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(shareUrl)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs sm:text-sm"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    {copied ? "Disalin" : "Salin"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Siapa pun dengan tautan ini dapat melihat rencana perjalanan
                  Anda
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Bagikan melalui:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={shareOnWhatsApp}
                    className="p-2 sm:p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={shareOnEmail}
                    className="p-2 sm:p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    Email
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full p-2 sm:p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mt-2 text-sm"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Responsif */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-3 md:p-4 z-[9999]">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-full md:max-w-6xl h-full md:h-[90vh] flex flex-col m-2 md:m-0">
            {/* Header */}
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">
                  ✏️ Edit Rencana Perjalanan
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Edit rencana perjalanan Anda dalam format yang mudah dibaca
                </p>
              </div>
              <button
                onClick={cancelEdit}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>

            {/* Dual Panel: Edit & Preview */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Edit Panel */}
              <div className="flex-1 flex flex-col border-b md:border-r border-gray-200">
                <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-200 bg-gray-50">
                  <span className="font-medium text-sm text-gray-700">
                    Edit Text
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => applyFormat("bold")}
                      className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                      title="Bold"
                    >
                      <Bold className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => applyFormat("bullet")}
                      className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                      title="Bullet Point"
                    >
                      <List className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => applyFormat("h1")}
                      className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                      title="Heading 1"
                    >
                      <Type className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={insertTemplate}
                      className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                      title="Insert Template"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-2 sm:p-3">
                  <textarea
                    id="edit-textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full min-h-[200px] md:min-h-0 p-2 sm:p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none font-mono text-xs sm:text-sm"
                    placeholder="Edit rencana perjalanan Anda di sini..."
                    spellCheck="false"
                  />
                </div>

                <div className="p-2 sm:p-3 border-t border-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-600">
                    <strong>Format Tips:</strong> <code>**bold**</code> •{" "}
                    <code># Heading</code> • <code>• bullet</code> •{" "}
                    <code>Rp 100.000</code>
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-200 bg-gray-50">
                  <span className="font-medium text-sm text-gray-700">
                    Live Preview
                  </span>
                  <button
                    onClick={() => setShowHTMLPreview(!showHTMLPreview)}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
                  >
                    {showHTMLPreview ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                    {showHTMLPreview ? "Hide HTML" : "Show HTML"}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 sm:p-3">
                  {showHTMLPreview ? (
                    <div className="text-xs font-mono whitespace-pre-wrap break-all p-2 bg-gray-50 rounded">
                      {convertEditedTextToHTML(editContent)}
                    </div>
                  ) : (
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: convertEditedTextToHTML(editContent),
                      }}
                    />
                  )}
                </div>

                <div className="p-2 sm:p-3 border-t border-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-600">
                    <strong>Preview shows:</strong>{" "}
                    {showHTMLPreview ? "HTML code" : "Formatted version"}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-3 sm:p-4 border-t border-gray-200 gap-2 sm:gap-0">
              <button
                onClick={cancelEdit}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Batal
              </button>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Minta AI untuk meningkatkan versi yang diedit ini?"
                      )
                    ) {
                      recreateItinerary(editContent);
                      cancelEdit();
                    }
                  }}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5 text-sm"
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Tingkatkan</span>
                  <span className="sm:hidden">Tingkatkan AI</span>
                </button>

                <button
                  onClick={saveEdit}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 text-sm"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
