'use client';

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit, Trash2, Box, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

    // Form states
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');

    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [activeProductId, setActiveProductId] = useState<string>('');
    const [categoryName, setCategoryName] = useState('');
    const [categoryKeywords, setCategoryKeywords] = useState(''); // Comma separated

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await api.products.list();
            setProducts(data);
        } catch (error: any) {
            toast.error(error.message || 'Ürünler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Product Handlers
    const handleProductSubmit = async () => {
        try {
            if (editingProduct) {
                await api.post(`/products/${editingProduct.id}`, { name: productName, description: productDescription });
                // NOTE: api helper uses POST inside. We should maybe add a real PUT/PATCH or just use raw fetch if generic POST isn't sufficient. 
                // Assuming standard REST, I'll use generic fetch for updates if `api.products` isn't fully built out.
                await fetch(`${api.getBaseUrl()}/products/${editingProduct.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
                    body: JSON.stringify({ name: productName, description: productDescription })
                });
                toast.success('Ürün güncellendi');
            } else {
                await fetch(`${api.getBaseUrl()}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
                    body: JSON.stringify({ name: productName, description: productDescription })
                });
                toast.success('Yeni ürün eklendi');
            }
            setIsProductDialogOpen(false);
            fetchProducts();
        } catch (error: any) {
            toast.error('Kayıt başarısız');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Bu ürünü ve altındaki tüm kategorileri silmek istediğinize emin misiniz?')) return;
        try {
            await fetch(`${api.getBaseUrl()}/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            toast.success('Ürün silindi');
            fetchProducts();
        } catch (error) {
            toast.error('Silme başarısız');
        }
    };

    // Category Handlers
    const handleCategorySubmit = async () => {
        try {
            const keywordsArray = categoryKeywords.split(',').map(k => k.trim()).filter(Boolean);
            if (editingCategory) {
                await fetch(`${api.getBaseUrl()}/products/categories/${editingCategory.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
                    body: JSON.stringify({ name: categoryName, keywords: keywordsArray })
                });
                toast.success('Kategori güncellendi');
            } else {
                await fetch(`${api.getBaseUrl()}/products/${activeProductId}/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
                    body: JSON.stringify({ name: categoryName, keywords: keywordsArray })
                });
                toast.success('Yeni kategori eklendi');
            }
            setIsCategoryDialogOpen(false);
            fetchProducts();
        } catch (error) {
            toast.error('Kayıt başarısız');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
        try {
            await fetch(`${api.getBaseUrl()}/products/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            toast.success('Kategori silindi');
            fetchProducts();
        } catch (error) {
            toast.error('Silme başarısız');
        }
    };

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ürünler ve Modüller</h1>
                    <p className="text-muted-foreground mt-1">Destek departmanlarınız için ana ürünleri ve yapay zeka tarafından sınıflandırılacak alt kategorileri yönetin.</p>
                </div>
                <Button onClick={() => {
                    setEditingProduct(null);
                    setProductName('');
                    setProductDescription('');
                    setIsProductDialogOpen(true);
                }} className="bg-brand-600 hover:bg-brand-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Ürün Ekle
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {products.length === 0 ? (
                    <Card className="bg-card/50 border-white/5 p-12 text-center border-dashed">
                        <Box className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-xl font-medium mb-2">Henüz Ürün Tanımlanmamış</h3>
                        <p className="text-muted-foreground mb-6">Müşterilerin talep açabileceği ana ürünleri ve modülleri "Yeni Ürün Ekle" butonunu kullanarak tanımlayabilirsiniz.</p>
                    </Card>
                ) : products.map(product => (
                    <Card key={product.id} className="bg-card/40 border-white/5 overflow-hidden">
                        <CardHeader className="bg-slate-900/50 pb-4 border-b border-white/5 flex flex-row items-start justify-between">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-xl block">
                                    <Box className="h-5 w-5 text-brand-400" />
                                    {product.name}
                                </CardTitle>
                                {product.description && (
                                    <CardDescription>{product.description}</CardDescription>
                                )}
                            </div>
                            <div className="flex items-center gap-2 m-0 p-0">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => {
                                    setEditingProduct(product);
                                    setProductName(product.name);
                                    setProductDescription(product.description || '');
                                    setIsProductDialogOpen(true);
                                }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-400" onClick={() => handleDeleteProduct(product.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-medium text-slate-300">Alt Kategoriler (Yapay Zeka Etiketleri)</h4>
                                <Button variant="outline" size="sm" className="h-8 text-xs bg-transparent border-white/10 hover:bg-white/5" onClick={() => {
                                    setActiveProductId(product.id);
                                    setEditingCategory(null);
                                    setCategoryName('');
                                    setCategoryKeywords('');
                                    setIsCategoryDialogOpen(true);
                                }}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Kategori Ekle
                                </Button>
                            </div>

                            {(!product.categories || product.categories.length === 0) ? (
                                <div className="text-sm text-muted-foreground italic bg-slate-900/30 p-4 rounded-lg flex items-center justify-center border border-white/5 border-dashed">
                                    Bu ürün için henüz alt kategori/modül tanımlanmamış. AI akıllı etiketlemesi için kategori ekleyin.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {product.categories.map((cat: any) => (
                                        <div key={cat.id} className="bg-slate-900 p-3 rounded-lg border border-white/5 group">
                                            <div className="flex items-start justify-between">
                                                <div className="font-medium flex items-center gap-1.5 text-sm">
                                                    <Tag className="h-3.5 w-3.5 text-brand-500" />
                                                    {cat.name}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                                        setActiveProductId(product.id);
                                                        setEditingCategory(cat);
                                                        setCategoryName(cat.name);
                                                        setCategoryKeywords((cat.keywords || []).join(', '));
                                                        setIsCategoryDialogOpen(true);
                                                    }}>
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDeleteCategory(cat.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {cat.keywords && cat.keywords.map((kw: string, i: number) => (
                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-400 border border-white/5">
                                                        {kw}
                                                    </span>
                                                ))}
                                                {(!cat.keywords || cat.keywords.length === 0) && (
                                                    <span className="text-[10px] text-muted-foreground italic">Anahtar kelime yok</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Product Dialog */}
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogContent className="bg-slate-950 border-white/10 sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
                        <DialogDescription>
                            Ana ürün veya hizmetinizi tanımlayın. Müşteriler bilet oluştururken ilk olarak bu ürünleri görecekler.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ürün Adı <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="Örn: Aluplan Pro"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                className="bg-slate-900 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Açıklama</label>
                            <Textarea
                                placeholder="Ürünle ilgili kısa bir açıklama..."
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                                className="bg-slate-900 border-white/10 resize-none h-24"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsProductDialogOpen(false)}>İptal</Button>
                        <Button onClick={handleProductSubmit} disabled={!productName.trim()} className="bg-brand-600 hover:bg-brand-500">
                            Kaydet
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Category Dialog */}
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent className="bg-slate-950 border-white/10 sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Modül / Kategori Ekle'}</DialogTitle>
                        <DialogDescription>
                            Gelen biletlerin yapay zeka tarafından alt etiketlenmesi için kullanacağı alt kategoriyi ve o kategoriyle bağdaşan anahtar kelimeleri girin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Kategori Adı <span className="text-red-500">*</span></label>
                            <Input
                                placeholder="Örn: Fatura Modülü"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                className="bg-slate-900 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Anahtar Kelimeler (Virgülle Ayırın)</label>
                            <Textarea
                                placeholder="Örn: fatura oluşturma, iptal, kdv, e-fatura"
                                value={categoryKeywords}
                                onChange={(e) => setCategoryKeywords(e.target.value)}
                                className="bg-slate-900 border-white/10 resize-none h-24"
                            />
                            <p className="text-[11px] text-muted-foreground mt-1 text-justify">
                                Yapay zeka, kullanıcı biletini bu etiketler listesinden birine sınıflandırmaya çalışırken bu kelimeler bağlam oluşturmasına yardımcı olabilir.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCategoryDialogOpen(false)}>İptal</Button>
                        <Button onClick={handleCategorySubmit} disabled={!categoryName.trim()} className="bg-brand-600 hover:bg-brand-500">
                            Kaydet
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
