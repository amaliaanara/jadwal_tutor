import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPackageSchema, type Package as PackageType, type InsertPackage } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Packages() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const { toast } = useToast();

  const { data: packages = [], isLoading } = useQuery<PackageType[]>({
    queryKey: ["/api/packages"],
  });

  const form = useForm<InsertPackage>({
    resolver: zodResolver(insertPackageSchema),
    defaultValues: {
      name: "",
      hours: 0,
      price: "0",
      description: "",
      isActive: true,
    },
  });

  const createPackageMutation = useMutation({
    mutationFn: async (data: InsertPackage) => {
      await apiRequest("POST", "/api/packages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      setIsAddModalOpen(false);
      form.reset();
      toast({
        title: "Berhasil",
        description: "Paket berhasil ditambahkan",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menambahkan paket",
        variant: "destructive",
      });
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPackage> }) => {
      await apiRequest("PUT", `/api/packages/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      setEditingPackage(null);
      form.reset();
      toast({
        title: "Berhasil",
        description: "Paket berhasil diperbarui",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memperbarui paket",
        variant: "destructive",
      });
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (packageId: string) => {
      await apiRequest("DELETE", `/api/packages/${packageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({
        title: "Berhasil",
        description: "Paket berhasil dihapus",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menghapus paket",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    document.title = "Paket Pembelajaran - EduAdmin";
  }, []);

  const handleEditPackage = (pkg: PackageType) => {
    setEditingPackage(pkg);
    form.reset({
      name: pkg.name,
      hours: pkg.hours,
      price: pkg.price?.toString() || "0",
      description: pkg.description || "",
      isActive: pkg.isActive,
    });
  };

  const handleDeletePackage = (packageId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus paket ini?")) {
      deletePackageMutation.mutate(packageId);
    }
  };

  const onSubmit = (data: InsertPackage) => {
    if (editingPackage) {
      updatePackageMutation.mutate({ id: editingPackage.id, data });
    } else {
      createPackageMutation.mutate(data);
    }
  };

  const formatPrice = (price: string | null) => {
    if (!price) return "Gratis";
    const num = parseFloat(price);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-secondary-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Paket Pembelajaran</h2>
          <p className="text-secondary-600">Kelola paket dan durasi pembelajaran</p>
        </div>
        <Dialog open={isAddModalOpen || !!editingPackage} onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingPackage(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button 
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} />
              <span>Tambah Paket</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? "Edit Paket" : "Tambah Paket Baru"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Paket</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Paket 20 Jam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah Jam</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="20" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga (Opsional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1000000" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Deskripsi paket pembelajaran..." 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Status Aktif</FormLabel>
                        <div className="text-sm text-secondary-600">
                          Paket dapat dipilih oleh murid baru
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingPackage(null);
                      form.reset();
                    }}
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
                  >
                    {editingPackage ? "Perbarui" : "Tambah"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Belum ada paket</h3>
            <p className="text-secondary-600 mb-4">Tambahkan paket pembelajaran untuk memulai</p>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary-500 hover:bg-primary-600"
            >
              <Plus size={16} className="mr-2" />
              Tambah Paket Pertama
            </Button>
          </div>
        ) : (
          packages.map((pkg) => (
            <Card key={pkg.id} className="border border-secondary-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <Package className="text-primary-600 w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPackage(pkg)}
                      className="text-secondary-600 hover:text-secondary-700 hover:bg-secondary-50"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                  {pkg.name}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-600">Durasi:</span>
                    <span className="font-medium text-secondary-900">{pkg.hours} jam</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-600">Harga:</span>
                    <span className="font-medium text-secondary-900">
                      {formatPrice(pkg.price)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-600">Status:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      pkg.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {pkg.isActive ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </div>
                </div>
                
                {pkg.description && (
                  <p className="text-sm text-secondary-600 mt-2 line-clamp-3">
                    {pkg.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
