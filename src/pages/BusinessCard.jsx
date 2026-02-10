import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Download, 
  Mail, 
  Phone, 
  Instagram,
  Linkedin,
  Pencil,
  Check,
  Copy,
  ExternalLink,
  Plus,
  Users,
  ChevronLeft,
  ChevronRight,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { validateBusinessCardForm } from "@/lib/flow-guards";

const MV_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6986e9b548b4c40eff56b42c/4a28c451c_logocopy.png";

function generateVCard(card) {
  return `BEGIN:VCARD
VERSION:3.0
FN:${card.name}
ORG:Millennium Visuals
TITLE:${card.title || ""}
TEL:${card.phone || ""}
EMAIL:${card.email}
URL:https://www.millennium-visuals.com
NOTE:${card.custom_message || ""}
END:VCARD`;
}

function DigitalCard({ card }) {
  const qrCodeUrl = card.shareUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(card.shareUrl)}&bgcolor=ffffff&color=0a0a1a`
    : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent("https://millennium-visuals.com")}&bgcolor=ffffff&color=0a0a1a`;

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Card Container */}
      <div className="relative transform hover:scale-[1.02] transition-all duration-500">
        {/* Main Card - Responsive aspect ratio */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-2xl min-h-[280px] sm:min-h-0 sm:aspect-[1.7/1]">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0f172a] to-[#0a0a1a]" />
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-10" 
            style={{
              backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} 
          />
          
          {/* Glow Effects */}
          <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-purple-500/10 rounded-full blur-3xl" />
          
          {/* Border Glow */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border border-blue-500/30" />
          
          {/* Content */}
          <div className="relative h-full p-4 sm:p-6 flex flex-col justify-between z-10">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/30 rounded-lg sm:rounded-xl blur-md" />
                  <img src={MV_LOGO} alt="MV" className="w-8 h-8 sm:w-12 sm:h-12 object-contain relative" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-white tracking-wider">MILLENNIUM</p>
                  <p className="text-[8px] sm:text-[10px] text-blue-400 tracking-[0.2em] sm:tracking-[0.3em] uppercase">Visuals</p>
                </div>
              </div>
              
              {/* QR Code with frame */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-blue-500/20 rounded-lg sm:rounded-xl blur-lg" />
                <div className="relative bg-white rounded-lg sm:rounded-xl p-1.5 sm:p-2 border border-blue-500/30">
                  <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 sm:w-20 sm:h-20" />
                </div>
              </div>
            </div>

            {/* Footer with profile */}
            <div className="flex items-end justify-between gap-3 mt-4 sm:mt-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white mb-0.5 sm:mb-1 truncate">{card.name || "Your Name"}</h2>
                <p className="text-xs sm:text-sm text-blue-400 font-medium mb-2 sm:mb-3 truncate">{card.title || "Your Title"}</p>
                
                <div className="space-y-1 sm:space-y-1.5">
                  {card.email && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-300">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400" />
                      </div>
                      <span className="truncate">{card.email}</span>
                    </div>
                  )}
                  {card.phone && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-300">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400" />
                      </div>
                      <span className="truncate">{card.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {card.photo_url && (
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl blur-lg opacity-50" />
                  <img 
                    src={card.photo_url} 
                    alt={card.name}
                    className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover border-2 border-blue-500/50 shadow-xl"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
        </div>
        
        {/* Shadow/Reflection */}
        <div className="absolute -bottom-4 sm:-bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-8 sm:h-12 bg-blue-500/20 blur-2xl rounded-full" />
      </div>
    </div>
  );
}

export default function BusinessCard() {
  const [editMode, setEditMode] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: employees = [],
    isError: employeesError,
    refetch: refetchEmployees,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: () => base44.entities.Employee.list(),
  });

  const {
    data: cards = [],
    isLoading,
    isError: cardsError,
    refetch: refetchCards,
  } = useQuery({
    queryKey: ["business-cards"],
    queryFn: () => base44.entities.BusinessCard.list(),
  });

  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    title: "",
    email: "",
    phone: "",
    linkedin_url: "",
    instagram_url: "",
    custom_message: "",
    photo_url: "",
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BusinessCard.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-cards"] });
      setEditMode(false);
      setEditingCard(null);
      toast.success("Card created!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BusinessCard.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-cards"] });
      setEditMode(false);
      setEditingCard(null);
      toast.success("Card updated!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BusinessCard.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-cards"] });
      setSelectedCardIndex(0);
      toast.success("Card deleted!");
    },
  });

  const openNewCard = () => {
    setEditingCard(null);
    setFormData({
      employee_id: "",
      name: "",
      title: "",
      email: "",
      phone: "",
      linkedin_url: "",
      instagram_url: "",
      custom_message: "",
      photo_url: "",
    });
    setEditMode(true);
  };

  const openEditCard = (card) => {
    setEditingCard(card);
    setFormData({
      employee_id: card.employee_id || "",
      name: card.name || "",
      title: card.title || "",
      email: card.email || "",
      phone: card.phone || "",
      linkedin_url: card.linkedin_url || "",
      instagram_url: card.instagram_url || "",
      custom_message: card.custom_message || "",
      photo_url: card.photo_url || "",
    });
    setEditMode(true);
  };

  const handleEmployeeSelect = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      setFormData(prev => ({
        ...prev,
        employee_id: employeeId,
        name: emp.name || prev.name,
        email: emp.email || prev.email,
        phone: emp.phone || prev.phone,
        title: emp.role || prev.title,
        photo_url: emp.photo_url || prev.photo_url,
      }));
    }
  };

  const handleSave = () => {
    const validation = validateBusinessCardForm(formData);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    const vCardData = generateVCard(validation.data);
    const cardData = {
      ...validation.data,
      qr_data: vCardData,
    };

    if (editingCard) {
      updateMutation.mutate({ id: editingCard.id, data: cardData });
    } else {
      createMutation.mutate(cardData);
    }
  };

  const currentCard = cards[selectedCardIndex];
  const shareUrl = currentCard ? `${window.location.origin}${createPageUrl("SharedCard")}?id=${currentCard.id}` : "";

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Link copied!");
      })
      .catch(() => {
        toast.error("Could not copy link. Please copy it manually.");
      });
  };

  const downloadVCard = () => {
    if (!currentCard) return;
    const vCard = generateVCard(currentCard);
    const blob = new Blob([vCard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (currentCard.name || "millennium_contact").replace(/\s+/g, "_");
    a.download = `${safeName}_MV.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Contact downloaded!");
  };

  const navigateCard = (direction) => {
    if (direction === "prev" && selectedCardIndex > 0) {
      setSelectedCardIndex(selectedCardIndex - 1);
    } else if (direction === "next" && selectedCardIndex < cards.length - 1) {
      setSelectedCardIndex(selectedCardIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text text-white">Digital Business Cards</h1>
          <p className="text-gray-400 mt-1">Create and share cards for your team</p>
        </div>
        <Button onClick={openNewCard} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> New Card
        </Button>
      </div>

      {(employeesError || cardsError) && (
        <div className="glass rounded-2xl p-6 border border-red-500/30">
          <p className="text-red-300">Failed to load business card data.</p>
          <Button
            onClick={() => {
              refetchEmployees();
              refetchCards();
            }}
            className="mt-3 bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cards.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Business Cards Yet</h3>
          <p className="text-gray-400 mb-4">Create digital cards for your team members to share with clients</p>
          <Button onClick={openNewCard} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Create First Card
          </Button>
        </div>
      ) : (
        <>
          {/* Card Carousel */}
          <div className="relative">
            {cards.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20"
                  onClick={() => navigateCard("prev")}
                  disabled={selectedCardIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20"
                  onClick={() => navigateCard("next")}
                  disabled={selectedCardIndex === cards.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            <div className="px-12 py-4">
              {currentCard && (
                <DigitalCard 
                  card={{ ...currentCard, shareUrl }} 
                />
              )}
            </div>

            {/* Card Indicator */}
            {cards.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {cards.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCardIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === selectedCardIndex ? "bg-blue-500 w-6" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Current Card Info */}
          {currentCard && (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white">{currentCard.name}</h3>
              <p className="text-gray-400">{currentCard.title}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={downloadVCard} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" /> Download Contact
            </Button>
            <Button onClick={copyShareLink} className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Link to={createPageUrl("SharedCard") + `?id=${currentCard?.id}`} target="_blank">
              <Button className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
                <ExternalLink className="h-4 w-4 mr-2" /> Preview
              </Button>
            </Link>
            <Button onClick={() => openEditCard(currentCard)} className="bg-white/10 border border-white/20 text-white hover:bg-white/20">
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button 
              onClick={() => deleteMutation.mutate(currentCard.id)} 
              className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>

          {/* Social Links */}
          {currentCard && (currentCard.linkedin_url || currentCard.instagram_url) && (
            <div className="flex justify-center gap-4">
              {currentCard.linkedin_url && (
                <a href={currentCard.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-3 glass rounded-full hover:bg-white/10 transition-all">
                  <Linkedin className="h-5 w-5 text-blue-400" />
                </a>
              )}
              {currentCard.instagram_url && (
                <a href={currentCard.instagram_url} target="_blank" rel="noopener noreferrer" className="p-3 glass rounded-full hover:bg-white/10 transition-all">
                  <Instagram className="h-5 w-5 text-pink-400" />
                </a>
              )}
            </div>
          )}

          {/* All Cards List */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">All Team Cards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {cards.map((card, idx) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCardIndex(idx)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    idx === selectedCardIndex 
                      ? "bg-blue-500/20 border-blue-500/50" 
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {card.photo_url ? (
                      <img src={card.photo_url} alt={card.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                        {card.name?.split(" ").map(n => n[0]).join("")}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white">{card.name}</p>
                      <p className="text-sm text-gray-400">{card.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Edit/Create Modal */}
      <Dialog open={editMode} onOpenChange={setEditMode}>
        <DialogContent className="bg-[#12121a] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editingCard ? "Edit Card" : "Create New Card"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Employee Selector */}
            {employees.length > 0 && !editingCard && (
              <div>
                <Label className="text-gray-300">Link to Team Member (optional)</Label>
                <Select value={formData.employee_id} onValueChange={handleEmployeeSelect}>
                  <SelectTrigger className="bg-white/5 border-white/10 mt-1 text-white">
                    <SelectValue placeholder="Select team member to auto-fill" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a24] border-white/10">
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id} className="text-white">{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-gray-300">Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                  placeholder="John Smith"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Title / Role</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Lead Videographer"
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label className="text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                  placeholder="john@millennium-visuals.com"
                />
              </div>
              <div>
                <Label className="text-gray-300">Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label className="text-gray-300">LinkedIn URL</Label>
                <Input
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label className="text-gray-300">Instagram URL</Label>
                <Input
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Personal Tagline</Label>
                <Textarea
                  value={formData.custom_message}
                  onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
                  placeholder="Making your vision a reality..."
                  className="bg-white/5 border-white/10 mt-1 h-20 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setEditMode(false)} className="text-gray-300 hover:text-white">Cancel</Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                {editingCard ? "Update Card" : "Create Card"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
