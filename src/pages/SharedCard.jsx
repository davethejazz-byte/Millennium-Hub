import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Phone, Globe, Instagram, Linkedin, Download, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function SharedCard() {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cardId = params.get("id");
    
    if (cardId) {
      base44.entities.BusinessCard.filter({ id: cardId })
        .then((cards) => {
          const found = cards?.[0] || null;
          setCard(found);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const downloadVCard = () => {
    if (!card) return;
    const vCard = generateVCard(card);
    const blob = new Blob([vCard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (card.name || "millennium_contact").replace(/\s+/g, "_");
    a.download = `${safeName}_MV.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Card Not Found</h1>
          <p className="text-gray-500">This business card doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.href)}`;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <style>{`
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 60px rgba(59, 130, 246, 0.5); }
        }
      `}</style>

      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        {/* Card */}
        <div 
          className="w-full max-w-md mb-8"
          style={{ animation: "float 6s ease-in-out infinite" }}
        >
          <div 
            className="aspect-[1.6/1] rounded-3xl overflow-hidden relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] shadow-2xl border border-white/10"
            style={{ animation: "pulse-glow 4s ease-in-out infinite" }}
          >
            {/* Holographic Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10 pointer-events-none" />
            
            {/* Card Content */}
            <div className="relative h-full p-6 flex flex-col justify-between">
              {/* Top Section */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6986e9b548b4c40eff56b42c/4a28c451c_logocopy.png" 
                    alt="MV" 
                    className="w-10 h-10 object-contain"
                  />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Millennium Visuals</p>
                    <p className="text-[10px] text-gray-500">Media Solutions</p>
                  </div>
                </div>
                
                {/* QR Code */}
                <div className="bg-white rounded-lg p-2 shadow-lg">
                  <img 
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-20 h-20"
                  />
                </div>
              </div>

              {/* Bottom Section */}
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">{card.name}</h2>
                  <p className="text-sm text-blue-400">{card.title}</p>
                </div>

                {card.photo_url && (
                  <img 
                    src={card.photo_url} 
                    alt={card.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-white/20 shadow-xl"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="w-full max-w-md space-y-4">
          {/* Save Contact Button */}
          <Button 
            onClick={downloadVCard}
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            <UserPlus className="h-5 w-5 mr-2" /> Save Contact
          </Button>
          
          {/* Add to Wallet Button */}
          <Button 
            onClick={downloadVCard}
            variant="outline"
            className="w-full h-14 text-lg rounded-xl border-white/20 text-white hover:bg-white/10"
          >
            <Download className="h-5 w-5 mr-2" /> Add to Wallet
          </Button>

          {/* Contact Details */}
          <div className="glass rounded-2xl p-6 space-y-4">
            {card.email && (
              <a 
                href={`mailto:${card.email}`}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-white">{card.email}</p>
                </div>
              </a>
            )}

            {card.phone && (
              <a 
                href={`tel:${card.phone}`}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-white">{card.phone}</p>
                </div>
              </a>
            )}

            <a 
              href="https://www.millennium-visuals.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Globe className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Website</p>
                <p className="font-medium text-white">millennium-visuals.com</p>
              </div>
            </a>
          </div>

          {/* Custom Message */}
          {card.custom_message && (
            <div className="glass rounded-2xl p-6 text-center">
              <p className="text-gray-300 italic">"{card.custom_message}"</p>
            </div>
          )}

          {/* Social Links */}
          {(card.linkedin_url || card.instagram_url) && (
            <div className="flex justify-center gap-4">
              {card.linkedin_url && (
                <a 
                  href={card.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 glass rounded-xl hover:bg-white/10 transition-all"
                >
                  <Linkedin className="h-6 w-6 text-blue-400" />
                </a>
              )}
              {card.instagram_url && (
                <a 
                  href={card.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 glass rounded-xl hover:bg-white/10 transition-all"
                >
                  <Instagram className="h-6 w-6 text-pink-400" />
                </a>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-600">Powered by Millennium Visuals</p>
          </div>
        </div>
      </div>
    </div>
  );
}
