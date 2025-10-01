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
                <h3 className="font-medium font-myanmar mb-1">Documentation</h3>
                <p className="text-xs text-muted-foreground font-myanmar">
                  Read full guides
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-3 group-hover:bg-success/20 transition-colors">
                  <Video className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-medium font-myanmar mb-1">Video Tutorials</h3>
                <p className="text-xs text-muted-foreground font-myanmar">
                  Watch step-by-step
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-warning/10 flex items-center justify-center mb-3 group-hover:bg-warning/20 transition-colors">
                  <MessageSquare className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-medium font-myanmar mb-1">Live Chat</h3>
                <p className="text-xs text-muted-foreground font-myanmar">
                  Chat with support
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-3 group-hover:bg-destructive/20 transition-colors">
                  <Mail className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-medium font-myanmar mb-1">Email Support</h3>
                <p className="text-xs text-muted-foreground font-myanmar">
                  Get help via email
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="font-myanmar"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-myanmar">
                <HelpCircle className="w-5 h-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription className="font-myanmar">
                {filteredFAQs.length} questions found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-start gap-3 pr-4">
                          <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium font-myanmar">{faq.question}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {faq.category}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-8 pr-4 text-sm text-muted-foreground font-myanmar leading-relaxed">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground font-myanmar mb-2">
                    No results found
                  </p>
                  <p className="text-sm text-muted-foreground font-myanmar">
                    Try different keywords or browse all categories
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Getting Started Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-myanmar">
                <FileSpreadsheet className="w-5 h-5" />
                Quick Start Guide
              </CardTitle>
              <CardDescription className="font-myanmar">
                လျှင်မြန်စွာ စတင်အသုံးပြုနည်း
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 font-myanmar">Configure ERPNext Connection</h4>
                    <p className="text-sm text-muted-foreground font-myanmar">
                      Settings page သို့သွားပြီး ERPNext API credentials များကို ထည့်သွင်းပါ။
                    </p>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" className="font-myanmar">
                        <Settings className="w-4 h-4 mr-2" />
                        Go to Settings
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 font-myanmar">Prepare Your Excel File</h4>
                    <p className="text-sm text-muted-foreground font-myanmar">
                      Excel file သည် required columns များ ပါရှိရမည်။ Template ကို download လုပ်နိုင်ပါသည်။
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm" className="font-myanmar">
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 font-myanmar">Upload and Import</h4>
                    <p className="text-sm text-muted-foreground font-myanmar">
                      Dashboard ရှి Upload Section တွင် file upload လုပ်ပါ။ Processing အလိုအလျောက် စတင်ပါမည်။
                    </p>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" className="font-myanmar">
                        <Upload className="w-4 h-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-success text-success-foreground flex items-center justify-center font-bold flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 font-myanmar">Monitor and Verify</h4>
                    <p className="text-sm text-muted-foreground font-myanmar">
                      Import Status ကို real-time ကြည့်ရှုနိုင်ပြီး Reports page တွင် results များကို verify လုပ်ပါ။
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-myanmar">
                <AlertCircle className="w-5 h-5" />
                Common Issues & Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border-l-4 border-l-warning bg-warning/5 rounded-r">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  <span className="font-myanmar">Connection Failed</span>
                </h4>
                <p className="text-sm text-muted-foreground font-myanmar">
                  ERPNext URL ကို မှန်ကန်စွာ ထည့်သွင်းထားခြင်း ရှိ/မရှိ စစ်ဆေးပါ။ API Key နှင့် Secret မှန်ကန်ကြောင်း သေချာစေပါ။
                </p>
              </div>

              <div className="p-4 border-l-4 border-l-destructive bg-destructive/5 rounded-r">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <span className="font-myanmar">Import Errors</span>
                </h4>
                <p className="text-sm text-muted-foreground font-myanmar">
                  Error log ကို download လုပ်ပြီး ဘယ် row များတွင် error ရှိသည်ကို စစ်ဆေးပါ။ Data format မှန်ကန်ခြင်း၊ required fields ပါရှိခြင်း စစ်ဆေးပါ။
                </p>
              </div>

              <div className="p-4 border-l-4 border-l-primary bg-primary/5 rounded-r">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-myanmar">Slow Processing</span>
                </h4>
                <p className="text-sm text-muted-foreground font-myanmar">
                  File size ကြီးပါက processing time ကြာနိုင်ပါသည်။ Smaller batches များခွဲပြီး upload လုပ်ရန် အကြံပြုပါသည်။
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-myanmar">
                <MessageSquare className="w-5 h-5" />
                Need More Help?
              </CardTitle>
              <CardDescription className="font-myanmar">
                ကျွန်ုပ်တို့၏ support team နှင့် ဆက်သွယ်ပါ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold font-myanmar">Live Chat</h4>
                      <p className="text-xs text-muted-foreground">Available 24/7</p>
                    </div>
                  </div>
                  <Button className="w-full font-myanmar" size="sm">
                    Start Chat
                  </Button>
                </div>

                <div className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold font-myanmar">Email Support</h4>
                      <p className="text-xs text-muted-foreground">support@example.com</p>
                    </div>
                  </div>
                  <Button className="w-full font-myanmar" size="sm" variant="outline">
                    Send Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* External Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-myanmar">
                <ExternalLink className="w-5 h-5" />
                External Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a 
                  href="https://docs.erpnext.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Book className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">ERPNext Documentation</p>
                      <p className="text-xs text-muted-foreground">Official ERPNext guides</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>

                <a 
                  href="https://discuss.erpnext.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium text-sm">ERPNext Forum</p>
                      <p className="text-xs text-muted-foreground">Community discussions</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>

                <a 
                  href="#" 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-medium text-sm font-myanmar">Video Tutorials</p>
                      <p className="text-xs text-muted-foreground">Step-by-step guides</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}