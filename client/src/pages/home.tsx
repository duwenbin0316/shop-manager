import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Product, InsertProduct } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Package, Pencil, Trash2, ImageIcon, Tag, X, Store } from "lucide-react";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import ProductForm from "@/components/ProductForm";

const DEFAULT_CATEGORIES = ["食品", "饮料", "日用品", "零食", "烟酒", "其他"];

export default function Home() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: serverCategories = [] } = useQuery<string[]>({
    queryKey: ["/api/categories"],
  });

  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...serverCategories])).sort();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "删除成功", description: "商品已移除" });
      setDeleteTarget(null);
    },
    onError: () => {
      toast({ title: "删除失败", variant: "destructive" });
    },
  });

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Store className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight" data-testid="text-app-title">旭东商店</h1>
          </div>
          <Button
            onClick={handleAdd}
            size="sm"
            data-testid="button-add-product"
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            添加商品
          </Button>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-5xl mx-auto px-4 pt-5 pb-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索商品名称..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="button-clear-search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-category-filter">
              <Tag className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="全部分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {allCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 text-sm text-muted-foreground" data-testid="text-product-count">
          共 {filtered.length} 件商品
          {categoryFilter !== "all" && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {categoryFilter}
              <button onClick={() => setCategoryFilter("all")} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-5xl mx-auto px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-28 w-full sm:h-36" />
                <div className="p-3.5 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="empty-state">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium mb-1">
              {products.length === 0 ? "还没有商品" : "没有找到匹配的商品"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {products.length === 0
                ? "点击「添加商品」开始录入你家店铺的商品和价格"
                : "试试其他搜索词或分类"}
            </p>
            {products.length === 0 && (
              <Button onClick={handleAdd} size="sm" data-testid="button-empty-add">
                <Plus className="w-4 h-4 mr-1.5" />
                添加第一件商品
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => handleEdit(product)}
                onDelete={() => setDeleteTarget(product)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 pb-6">
        <PerplexityAttribution />
      </footer>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "编辑商品" : "添加商品"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "修改商品信息后点击保存" : "填写商品信息，录入到你的商品库"}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            categories={allCategories}
            onSuccess={handleFormSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除「{deleteTarget?.name}」吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const canPreview = !!product.imageData && !imgError;
  const previewImageSrc = canPreview ? product.imageData ?? undefined : undefined;

  return (
    <>
      <Card
        className="overflow-hidden group transition-all hover:shadow-md"
        data-testid={`card-product-${product.id}`}
      >
        <div className="flex gap-3 p-3 sm:block sm:p-0">
          {/* Image */}
          <button
            type="button"
            className="h-24 w-24 shrink-0 bg-muted relative overflow-hidden rounded-lg sm:h-auto sm:w-full sm:rounded-none sm:aspect-[5/4] text-left disabled:cursor-default"
            onClick={() => canPreview && setPreviewOpen(true)}
            disabled={!canPreview}
            data-testid={`button-preview-image-${product.id}`}
          >
            {canPreview ? (
              <img
                src={previewImageSrc}
                alt={product.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-zoom-in"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground/40 sm:w-10 sm:h-10" />
              </div>
            )}
            <Badge
              variant="secondary"
              className="hidden sm:inline-flex absolute top-2.5 left-2.5 text-xs bg-background/85 backdrop-blur-sm"
            >
              {product.category}
            </Badge>
          </button>

          {/* Info */}
          <div className="min-w-0 flex-1 sm:p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3
                  className="font-medium text-sm leading-5 line-clamp-2 sm:text-[15px]"
                  data-testid={`text-name-${product.id}`}
                >
                  {product.name}
                </h3>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Tag className="w-3.5 h-3.5 shrink-0" />
                  <Badge variant="outline" className="px-2 py-0 text-[11px] font-medium">
                    {product.category}
                  </Badge>
                </div>
                <p
                  className="text-base font-semibold text-primary mt-2 sm:text-lg"
                  data-testid={`text-price-${product.id}`}
                >
                  ¥{product.price.toFixed(2)}
                </p>
                {product.note && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                    {product.note}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onEdit}
                  data-testid={`button-edit-${product.id}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={onDelete}
                  data-testid={`button-delete-${product.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          hideClose
          className="max-w-3xl border-0 bg-transparent p-2 shadow-none sm:p-4"
        >
          <DialogClose
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/20 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-white/35 focus:outline-none focus:ring-2 focus:ring-white/80 focus:ring-offset-0"
            aria-label="关闭预览"
            data-testid={`button-close-preview-${product.id}`}
          >
            <X className="h-5 w-5" />
          </DialogClose>
          {canPreview && (
            <img
              src={previewImageSrc}
              alt={`${product.name} 预览图`}
              className="w-full max-h-[80vh] object-contain rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
