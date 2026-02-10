import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Pencil, 
  Trash2, 
  DollarSign,
  Briefcase,
  MoreVertical 
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { validateClientForm } from "@/lib/flow-guards";

export default function Clients() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteClient, setDeleteClient] = useState(null);
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();

  const {
    data: clients = [],
    isLoading,
    isError: clientsError,
    refetch: refetchClients,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list("-created_date"),
  });

  const {
    data: jobs = [],
    isError: jobsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => base44.entities.Job.list(),
  });

  const [formData, setFormData] = useState({
    name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      contact_name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    });
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setFormOpen(false);
      resetForm();
      toast.success("Client added!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setFormOpen(false);
      setEditingClient(null);
      resetForm();
      toast.success("Client updated!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setDeleteClient(null);
      toast.success("Client deleted!");
    },
  });

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || "",
      contact_name: client.contact_name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      notes: client.notes || "",
    });
    setFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateClientForm(formData);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }

    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data: validation.data });
    } else {
      createMutation.mutate(validation.data);
    }
  };

  // Calculate client stats from jobs
  const getClientStats = (clientName) => {
    const clientJobs = jobs.filter(j => 
      j.client_name?.toLowerCase() === clientName?.toLowerCase()
    );
    const totalJobs = clientJobs.length;
    const totalRevenue = clientJobs.reduce((sum, j) => sum + (j.total_income || 0), 0);
    return { totalJobs, totalRevenue };
  };

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(search.toLowerCase()) ||
    client.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold glow-text text-white">Clients</h1>
          <p className="text-gray-400 mt-1">Manage your client relationships</p>
        </div>
        <Button 
          onClick={() => { setEditingClient(null); resetForm(); setFormOpen(true); }} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="glass rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {(clientsError || jobsError) && (
        <div className="glass rounded-2xl p-6 border border-red-500/30">
          <p className="text-red-300">Failed to load client data.</p>
          <Button
            onClick={() => {
              refetchClients();
              refetchJobs();
            }}
            className="mt-3 bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-gray-400">No clients found</p>
          <Button onClick={() => setFormOpen(true)} variant="link" className="mt-2 text-blue-400">
            Add your first client
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => {
            const stats = getClientStats(client.name);
            return (
              <div key={client.id} className="glass rounded-2xl p-6 group hover:bg-white/5 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                      {client.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">{client.name}</h3>
                      {client.contact_name && (
                        <p className="text-sm text-gray-400">{client.contact_name}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1a1a24] border-white/10">
                      <DropdownMenuItem onClick={() => handleEdit(client)} className="cursor-pointer text-white">
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteClient(client)} className="cursor-pointer text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {client.email && (
                    <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </a>
                  )}
                  {client.phone && (
                    <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </a>
                  )}
                  {client.address && (
                    <p className="flex items-center gap-2 text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {client.address}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-white">{stats.totalJobs} jobs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-white">${stats.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) { setEditingClient(null); resetForm(); }}}>
        <DialogContent className="bg-[#12121a] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{editingClient ? "Edit Client" : "Add Client"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-gray-300">Company/Client Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                  placeholder="Acme Corp"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Contact Person</Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <Label className="text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                  placeholder="john@acme.com"
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
              <div className="col-span-2">
                <Label className="text-gray-300">Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-white/5 border-white/10 mt-1 text-white placeholder:text-gray-500"
                  placeholder="123 Main St, City, State"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about the client..."
                  className="bg-white/5 border-white/10 mt-1 h-20 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)} className="text-gray-300 hover:text-white">Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingClient ? "Update" : "Add Client"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteClient} onOpenChange={() => setDeleteClient(null)}>
        <AlertDialogContent className="bg-[#12121a] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteClient?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteClient.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
