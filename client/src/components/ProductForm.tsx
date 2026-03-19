import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Product, InsertProduct } from "@shared/schema";
import { insertProductSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

interface ProductFormProps {
  product: Product | null;
  categories: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

export default function ProductForm({ product, categories, onSuccess, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [customCategory, setCustomCategory] = useState("");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [note, setNote] = useState(product?.note ?? "");
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCustom = category === "__custom__";
  const effectiveCategory = isCustom ? customCategory : category;

  const mutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      if (product) {
        await apiRequest("PUT", `/api/products/${product.id}`, data);
      } else {
        await apiRequest("POST", "/api/products", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: product ? "更新成功" : "添加成功",
        description: product ? "商品信息已更新" : "商品已添加到你的商品库",
      });
      onSuccess();
    },
    onError: (err: Error) => {
      toast({ title: "操作失败", description: err.message, variant: "destructive" });
    },
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setImageUrl(data.url);
    } catch {
      toast({ title: "图片上传失败", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const data = {
      name: name.trim(),
      price: parseFloat(price),
      category: effectiveCategory.trim(),
      imageUrl: imageUrl || null,
      note: note.trim() || null,
    };

    const result = insertProductSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? "general";
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    mutation.mutate(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-product">
      {/* Image upload */}
      <div>
        <Label className="text-sm font-medium mb-1.5 block">商品图片</Label>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
          data-testid="input-image-file"
        />
        {imageUrl ? (
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background"
              data-testid="button-remove-image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors"
            data-testid="button-upload-image"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8" />
                <span className="text-sm">点击上传图片</span>
                <span className="text-xs">支持 JPG/PNG/GIF/WEBP，最大 5MB</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Name */}
      <div>
        <Label htmlFor="name" className="text-sm font-medium mb-1.5 block">
          商品名称 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：可口可乐 500ml"
          data-testid="input-name"
        />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
      </div>

      {/* Price */}
      <div>
        <Label htmlFor="price" className="text-sm font-medium mb-1.5 block">
          售价 (元) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          data-testid="input-price"
        />
        {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
      </div>

      {/* Category */}
      <div>
        <Label className="text-sm font-medium mb-1.5 block">
          分类 <span className="text-destructive">*</span>
        </Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger data-testid="select-category">
            <SelectValue placeholder="选择分类" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
            <SelectItem value="__custom__">+ 自定义分类</SelectItem>
          </SelectContent>
        </Select>
        {isCustom && (
          <Input
            className="mt-2"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="输入新的分类名称"
            data-testid="input-custom-category"
          />
        )}
        {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
      </div>

      {/* Note */}
      <div>
        <Label htmlFor="note" className="text-sm font-medium mb-1.5 block">备注</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="可选，例如：进价3元"
          rows={2}
          data-testid="input-note"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          data-testid="button-cancel"
        >
          取消
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1"
          data-testid="button-submit"
        >
          {mutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
          ) : null}
          {product ? "保存修改" : "添加商品"}
        </Button>
      </div>
    </form>
  );
}
