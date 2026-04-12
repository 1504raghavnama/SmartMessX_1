import { useState } from "react";
import { useOffers, useAddOffer, useRemoveOffer } from "@/hooks/useOffers";
import { PageSkeleton, ErrorDisplay } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const OwnerOffers = () => {
  const { data: offers, isLoading, error } = useOffers();
  const addOffer = useAddOffer();
  const removeOffer = useRemoveOffer();
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [validTill, setValidTill] = useState("");

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorDisplay message="Failed to load offers" onRetry={() => window.location.reload()} />;

  const handleAddOffer = async () => {
    if (!newTitle || !newDesc) return toast.error("Fill in all fields");
    try {
      await addOffer.mutateAsync({
        title: newTitle,
        description: newDesc,
        validTill: validTill || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      });
      setNewTitle("");
      setNewDesc("");
      setValidTill("");
      toast.success("Offer added!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add offer");
    }
  };

  const handleRemoveOffer = async (id: string) => {
    try {
      await removeOffer.mutateAsync(id);
      toast.success("Offer removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove offer");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dynamic Pricing & Offers</h1>

      {/* Add Offer */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Add New Offer</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-foreground">Title</Label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g., Summer Special" className="mt-1" />
          </div>
          <div>
            <Label className="text-foreground">Description</Label>
            <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="e.g., 15% off on monthly plans" className="mt-1" />
          </div>
          <div>
            <Label className="text-foreground">Valid Till</Label>
            <Input type="date" value={validTill} onChange={(e) => setValidTill(e.target.value)} className="mt-1" />
          </div>
          <Button onClick={handleAddOffer} disabled={addOffer.isPending}>
            {addOffer.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
            ) : (
              <><Plus className="w-4 h-4 mr-2" /> Add Offer</>
            )}
          </Button>
        </div>
      </div>

      {/* Existing Offers */}
      <div className="space-y-3">
        {(!offers || offers.length === 0) ? (
          <div className="text-center py-8 text-muted-foreground">No offers yet. Create one above!</div>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{offer.title}</p>
                  <p className="text-sm text-muted-foreground">{offer.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Valid till: {offer.valid_till}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveOffer(offer.id)}
                disabled={removeOffer.isPending}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OwnerOffers;
