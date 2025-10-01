import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Search,
  FileSpreadsheet,
  Upload,
  Settings,
  AlertCircle,
  CheckCircle2,
  Book,
  Video,
  MessageSquare,
  Mail,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: "1",
    category: "Getting Started",
    question: "Excel file များကို မည်သို့ upload လုပ်မလဲ?",
    answer: "Dashboard page ရှိ Upload Section တွင် file များကို drag & drop လုပ်ပါ သို့မဟုတ် 'Browse Files' button ကို နှိပ်ပြီး file ရွေးချယ်နိုင်ပါသည်။ Upload ပြုလုပ်ပြီးနောက် အလိုအလျောက် processing စတင်ပါမည်။"
  },
  {
    id: "2",
    category: "Getting Started",
    question: "ဘယ် file format တွေကို support လုပ်ပါသလဲ?",
    answer: "လောလောဆယ် .xlsx နှင့် .xls file format များကို support လုပ်ပါသည်။ CSV files များအတွက် support ကို မကြာမီ ထည့်သွင်းပါမည်။"
  },
  {
    id: "3",
    category: "Troubleshooting",
    question: "Import failed ဖြစ်ပါက မည်သို့ ဖြေရှင်းမလဲ?",
    answer: "Import History page သို့သွားပြီး error details များကို စစ်ဆေးပါ။ Common issues များမှာ: (1) Invalid data format, (2) Missing required fields, (3) Duplicate entries, (4) ERPNext connection issues။ Error log ကို download လုပ်ပြီး အသေးစိတ် ကြည့်နိုင်ပါသည်။"
  },
  {
    id: "4",
    category: "ERPNext Integration",
    question: "ERPNext နှင့် မည်သို့ ချိတ်ဆက်မလဲ?",
    answer: "Settings page သို့သွားပြီး ERPNext Base URL, API Key နှင့် API Secret များကို ထည့်သွင်းပါ။ 'Test Connection' button နှိပ်ပြီး connection စစ်ဆေးနိုင်ပါသည်။"
  },
  {
    id: "5",
    category: "Data Management",
    question: "Import လုပ်ပြီးသော data များကို မည်သို့ verify လုပ်မလဲ?",
    answer: "Reports page တွင် import history နှင့် success/failure statistics များကို ကြည့်နိုင်ပါသည်။ Analytics page တွင် detailed charts များလည်း ရရှိနိုင်ပါသည်။"
  },
  {
    id: "6",
    category: "Security",
    question: "Upload လုပ်သော files များ ဘယ်လောက်ကြာ သိမ်းဆည်းထားမလဲ?",
    answer: "Files များကို 30 ရက် ကြာ သိမ်းဆည်းထားပြီး၊ ထိုနောက် automatically delete လုပ်ပါမည်။ Security အတွက် files များကို encrypted သိမ်းဆည်းထားပါသည်။"
  },
  {
    id: "7",
    category: "Performance",
    question: "တစ်ကြိမ် upload တွင် ဘယ်နှုန်းထိ records များ တင်နိုင်မလဲ?",
    answer: "လောလောဆယ် file တစ်ခုလျှင် maximum 10,000 records အထိ support လုပ်ပါသည်။ ပိုမိုကြီးမားသော datasets များအတွက် multiple files များခွဲပြီး upload လုပ်ရန် အကြံပြုပါသည်။"
  },
  {
    id: "8",
    category: "User Management",
    question: "User roles များက ဘာတွေလဲ?",
    answer: "သုံးမျိုးရှိပါသည်: (1) Admin - အကုန်လုံး manage လုပ်နိုင်သည်, (2) Manager - imports များ view နှင့် manage လုပ်နိုင်သည်, (3) User - import upload လုပ်ပြီး own data view လုပ်နိုင်သည်။"
  }
];

const categories = ["All", "Getting Started", "Troubleshooting", "ERPNext Integration", "Data Management", "Security", "Performance", "User Management"];

export default function Help() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-gradient-to-r from-card to-card/80 border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/95">
          <div className="px-6 py-5">
            <div>
              <h2 className="text-3xl font-bold text-foreground font-myanmar bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Help & Documentation
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 font-myanmar">
                အကူအညီများနှင့် အသုံးပြုပုံ လမ်းညွှန်များ
              </p>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Book className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font