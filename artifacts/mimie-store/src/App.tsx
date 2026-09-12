import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  Heart,
  Instagram,
  Menu,
  Minus,
  Plus,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';

type Category = 'الكل' | 'المكياج' | 'العناية بالبشرة' | 'العناية بالشعر' | 'الإكسسوارات';
type ProductVisual = 'serum' | 'lip' | 'palette' | 'cream' | 'brush' | 'mist';
type Product = {
  id: number;
  name: string;
  brand: string;
  category: Exclude<Category, 'الكل'>;
  price: number;
  oldPrice?: number;
  note: string;
  rating: number;
  reviews: number;
  badge?: string;
  visual: ProductVisual;
  tone: string;
  accent: string;
};
type CartItem = Product & { quantity: number };

const queryClient = new QueryClient();

const products: Product[] = [
  { id: 1, name: 'سيروم هاني غلو', brand: 'Beauty of Joseon', category: 'العناية بالبشرة', price: 32500, oldPrice: 38000, note: 'بروبوليس + نياسيناميد', rating: 4.9, reviews: 28, badge: 'الأكثر طلباً', visual: 'serum', tone: '#e7b887', accent: '#a75b40' },
  { id: 2, name: 'بلاش سوفت بينش', brand: 'Rare Beauty', category: 'المكياج', price: 42000, note: 'بلاش سائل · جوي', rating: 4.8, reviews: 34, badge: 'محبوب في بغداد', visual: 'lip', tone: '#e4a29c', accent: '#7e334c' },
  { id: 3, name: 'روج بلاك هاني', brand: 'Clinique', category: 'المكياج', price: 38500, note: 'ليبستك مرطب · 04', rating: 4.9, reviews: 41, visual: 'lip', tone: '#482530', accent: '#d28186' },
  { id: 4, name: 'باليت بيتش سي فريب', brand: 'Huda Beauty', category: 'المكياج', price: 69000, oldPrice: 75000, note: '18 درجة خوخية دافئة', rating: 4.7, reviews: 19, badge: 'وصل حديثاً', visual: 'palette', tone: '#d88376', accent: '#facbb6' },
  { id: 5, name: 'كريم كلاود للترطيب', brand: 'Dr. Jart+', category: 'العناية بالبشرة', price: 47500, note: 'سيراميدين · 50 مل', rating: 4.8, reviews: 23, visual: 'cream', tone: '#d9c4a9', accent: '#8d6071' },
  { id: 6, name: 'روج فيلفت تيدي', brand: 'MAC', category: 'المكياج', price: 36000, note: 'مات · نيود دافئ', rating: 4.8, reviews: 31, visual: 'lip', tone: '#8c4a49', accent: '#f4c9b9' },
  { id: 7, name: 'فرشاة الوجه اليومية', brand: 'Real Techniques', category: 'الإكسسوارات', price: 24000, note: 'لمسة ناعمة ومتجانسة', rating: 4.6, reviews: 16, visual: 'brush', tone: '#d7b6ae', accent: '#8c5d61' },
  { id: 8, name: 'بخاخ ماء الورد', brand: 'Mario Badescu', category: 'العناية بالبشرة', price: 29500, note: 'ورد + ألوفيرا · 118 مل', rating: 4.7, reviews: 27, visual: 'mist', tone: '#e6b7b3', accent: '#ad5267' },
];

const categories: { label: Category; count: string; mark: string; description: string }[] = [
  { label: 'الكل', count: '08 منتجات', mark: '01', description: 'اختيارات مميزة' },
  { label: 'المكياج', count: '04 منتجات', mark: '02', description: 'لون ولمعة' },
  { label: 'العناية بالبشرة', count: '03 منتجات', mark: '03', description: 'روتين هادئ' },
  { label: 'العناية بالشعر', count: 'قريباً', mark: '04', description: 'لمسات يومية' },
  { label: 'الإكسسوارات', count: '01 منتج', mark: '05', description: 'سر اللمسة الأخيرة' },
];

function formatIQD(value: number) {
  return `${new Intl.NumberFormat('en-US').format(value)} د.ع`;
}

function ProductVisual({ product, small = false }: { product: Product; small?: boolean }) {
  return (
    <div
      className={`visual visual-${product.visual} ${small ? 'visual-small' : ''}`}
      style={{ '--tone': product.tone, '--accent-tone': product.accent } as CSSProperties}
      aria-hidden="true"
    >
      <div className="visual-halo" />
      {product.visual === 'serum' && <><div className="serum-dropper" /><div className="serum-bottle"><span>BEAUTY<br />OF JOSEON</span><b>GLOW</b></div></>}
      {product.visual === 'lip' && <><div className="lip-shadow" /><div className="lipstick-case"><div className="lipstick-bullet" /></div><div className="lip-label">MIMIE</div></>}
      {product.visual === 'palette' && <><div className="palette"><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="palette-spark">PEACH<br />C FRAPPE</div></>}
      {product.visual === 'cream' && <><div className="cream-jar"><div>DR.JART+</div><b>CERAMIDIN</b></div><div className="cream-lid" /></>}
      {product.visual === 'brush' && <><div className="brush-head" /><div className="brush-handle" /><div className="brush-tip" /></>}
      {product.visual === 'mist' && <><div className="mist-cap" /><div className="mist-bottle"><span>ROSEWATER<br />& ALOE</span></div><div className="mist-flower" /></>}
    </div>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`logo ${light ? 'logo-light' : ''}`} data-testid="brand-logo">
      <span className="logo-mark">m</span>
      <span className="logo-word">mimie</span>
      <span className="logo-sub">beauty counter</span>
    </div>
  );
}

function Header({
  cartCount,
  announcementVisible,
  menuOpen,
  onCart,
  onDismissAnnouncement,
  onMenuToggle,
  onSearch,
}: {
  cartCount: number;
  announcementVisible: boolean;
  menuOpen: boolean;
  onCart: () => void;
  onDismissAnnouncement: () => void;
  onMenuToggle: () => void;
  onSearch: () => void;
}) {
  return (
    <header className="site-header">
      {announcementVisible && <div className="announcement">
        <span>توصيل داخل بغداد خلال ١–٢ يوم</span><span className="announcement-dot">·</span><span>التوصيل مجاناً للطلبات فوق ٧٥,٠٠٠ د.ع</span>
        <button className="announcement-close" onClick={onDismissAnnouncement} aria-label="إغلاق التنبيه" title="إغلاق" data-testid="button-dismiss-announcement"><X size={14} /></button>
      </div>}
      <div className="wrap nav-row">
        <button className="mobile-nav-action" onClick={onMenuToggle} aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} title="القائمة" data-testid="button-mobile-menu"><Menu size={21} /></button>
        <a href="#top" className="logo-link" data-testid="link-home"><Logo /></a>
        <nav className="main-nav" aria-label="التنقل الرئيسي">
          <a href="#shop" data-testid="link-shop">تسوّقي المختارات</a>
          <a href="#categories" data-testid="link-categories">التصنيفات</a>
          <a href="#story" data-testid="link-story">حكاية ميمي</a>
        </nav>
        <div className="nav-actions">
          <button className="nav-search" onClick={onSearch} data-testid="button-search" aria-label="البحث عن منتج"><Search size={18} /><span>بحث</span></button>
          <button className="bag-button" onClick={onCart} data-testid="button-cart" aria-label="فتح سلة المشتريات"><ShoppingBag size={19} /><span className="bag-label">سلّتي</span>{cartCount > 0 && <b>{cartCount}</b>}</button>
        </div>
      </div>
      {menuOpen && <nav className="mobile-menu animate-rise" aria-label="قائمة الهاتف">
        <a href="#shop" onClick={onMenuToggle} data-testid="mobile-link-shop">تسوّقي المختارات <ChevronLeft size={16} /></a>
        <a href="#categories" onClick={onMenuToggle} data-testid="mobile-link-categories">التصنيفات <ChevronLeft size={16} /></a>
        <a href="#story" onClick={onMenuToggle} data-testid="mobile-link-story">حكاية ميمي <ChevronLeft size={16} /></a>
      </nav>}
    </header>
  );
}

function Hero({ onShop }: { onShop: () => void }) {
  return (
    <section className="hero" id="top">
      <div className="hero-corner hero-corner-top">٠١ / ٠٣</div>
      <div className="hero-copy animate-rise">
        <p className="eyebrow">مختارات جمال بعناية · بغداد / العراق</p>
        <h1>أشياء جميلة<br /><em>تليق</em><br />بكِ.</h1>
        <p className="hero-note">كونتر الجمال الذي تخبرين عنه صديقتك المقرّبة. منتجات أصلية، عملية، ومختارة بحب أكبر بقليل.</p>
        <div className="hero-actions"><button className="btn-main" onClick={onShop} data-testid="button-hero-shop">اكتشفي المختارات <ArrowLeft size={17} /></button><a href="#story" className="hero-text-link" data-testid="link-hero-story">لماذا ميمي؟ <ChevronLeft size={15} /></a></div>
      </div>
      <div className="hero-art animate-rise delay-2" aria-label="ترتيب فني لمنتجات الجمال">
        <div className="arch-shape" />
        <div className="hero-sun" />
        <div className="hero-ribbon">MIMIE · SINCE 2021</div>
        <div className="hero-bottle hero-bottle-left"><span>mimie<br /><b>skin</b></span></div>
        <div className="hero-bottle hero-bottle-right"><span>GLOW<br /><b>01</b></span></div>
        <div className="hero-lip"><i /></div>
        <div className="hero-flower hero-flower-1" /><div className="hero-flower hero-flower-2" />
        <span className="hero-art-note">طقس<br />الإشراقة اليومية</span>
      </div>
      <div className="hero-corner hero-corner-bottom">مرّري للتسوّق <ChevronDown size={14} /></div>
    </section>
  );
}

function CategoryStrip({ active, onSelect }: { active: Category; onSelect: (category: Category) => void }) {
  return (
    <section className="category-section" id="categories">
      <div className="wrap">
        <div className="section-heading compact-heading"><div><p className="eyebrow">اختاري طقسك</p><h2>ما الذي تبحثين عنه اليوم؟</h2></div><p className="heading-aside">مجموعة صغيرة ومنتقاة<br />لأيام بشرة جميلة.</p></div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <button key={category.label} className={`category-pill ${active === category.label ? 'category-active' : ''} animate-rise delay-${Math.min(index + 1, 5)}`} onClick={() => onSelect(category.label)} data-testid={`button-category-${index}`}>
              <span className="category-mark">{category.mark}</span><span><strong>{category.label}</strong><small>{category.count} · {category.description}</small></span><ArrowLeft size={16} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, onAdd, onFavorite, favorite }: { product: Product; onAdd: (product: Product) => void; onFavorite: (id: number) => void; favorite: boolean }) {
  return (
    <article className="product-card animate-rise" data-testid={`card-product-${product.id}`}>
      <div className="product-image">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={() => onFavorite(product.id)} aria-label={favorite ? `إزالة ${product.name} من المفضلة` : `إضافة ${product.name} للمفضلة`} title="المفضلة" data-testid={`button-favorite-${product.id}`}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button>
        <ProductVisual product={product} />
      </div>
      <div className="product-info">
        <div className="product-brand">{product.brand}</div><h3>{product.name}</h3><p className="product-note">{product.note}</p>
        <div className="product-rating"><span><Star size={12} fill="currentColor" /> {product.rating}</span><small>({product.reviews} تقييم)</small></div>
        <div className="product-buy-row"><div><strong>{formatIQD(product.price)}</strong>{product.oldPrice && <del>{formatIQD(product.oldPrice)}</del>}</div><button className="add-button" onClick={() => onAdd(product)} aria-label={`إضافة ${product.name} إلى السلة`} title="أضيفي إلى السلة" data-testid={`button-add-${product.id}`}><Plus size={18} /></button></div>
      </div>
    </article>
  );
}

function ShopSection({ active, query, onAdd, onFavorite, favorites, onClear }: { active: Category; query: string; onAdd: (product: Product) => void; onFavorite: (id: number) => void; favorites: number[]; onClear: () => void }) {
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ar');
    return products.filter(product => {
      const matchesCategory = active === 'الكل' || product.category === active;
      const searchable = `${product.name} ${product.brand} ${product.note} ${product.category}`.toLocaleLowerCase('ar');
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [active, query]);
  return (
    <section className="shop-section section-space" id="shop">
      <div className="wrap">
        <div className="section-heading shop-heading"><div><p className="eyebrow">مختارات ميمي الحالية</p><h2>كماليات صغيرة،<br /><em>مختارة صح.</em></h2></div><div className="shop-tools"><span className="mono product-count">{filtered.length.toString().padStart(2, '0')} / {products.length.toString().padStart(2, '0')} منتجات</span>{(active !== 'الكل' || query) && <button className="clear-filter" onClick={onClear} data-testid="button-clear-filter">مسح التصفية <X size={13} /></button>}</div></div>
        {filtered.length > 0 ? <div className="product-grid">{filtered.map(product => <ProductCard key={product.id} product={product} onAdd={onAdd} onFavorite={onFavorite} favorite={favorites.includes(product.id)} />)}</div> : <div className="empty-products"><Sparkles size={28} /><p>لم نعثر على هذه القطعة بعد.</p><button className="btn-quiet" onClick={onClear} data-testid="button-empty-products">شاهدي كل المنتجات</button></div>}
        <div className="shop-footer"><span>نختار لكِ المفضّلات، لا كل الإنترنت.</span><a href="#categories" data-testid="link-browse-categories">تصفّحي حسب التصنيف <ArrowLeft size={15} /></a></div>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section className="story-section section-space" id="story">
      <div className="wrap story-grid">
        <div className="story-art"><div className="story-paper">MIMIE<br /><span>notes</span></div><div className="story-flower flower-one" /><div className="story-flower flower-two" /><div className="story-stamp">مختار<br />في بغداد</div></div>
        <div className="story-copy"><p className="eyebrow">ملاحظة من الكونتر</p><h2>تصفّح أقل.<br /><em>اكتشفي أكثر.</em></h2><p>بدأنا ميمي لأن التسوّق للجمال يجب أن يشبه سرّاً صغيراً تسلّمكِ إياه صديقتك. كل قطعة نتحقق منها، نحبها، ونختارها لتناسب روتينكِ الحقيقي في العراق.</p><p className="story-signoff serif">بحب، مريم وبنات ميمي</p><a href="#shop" className="btn-quiet" data-testid="link-story-shop">شاهدي المختارات <ArrowLeft size={16} /></a></div>
      </div>
    </section>
  );
}

function JournalSection({ onSubscribe }: { onSubscribe: () => void }) {
  return (
    <section className="journal-section">
      <div className="wrap journal-card"><div><p className="eyebrow">ملاحظة ميمي</p><h2>نصيحة جمال،<br /><em>بلا ضجيج.</em></h2></div><div className="journal-copy"><p>رسالة صغيرة كل أسبوعين: ما يستحق التجربة، وما يستحق التجاوز، وأشياء جميلة في المنتصف.</p><form className="journal-form" onSubmit={event => { event.preventDefault(); onSubscribe(); }}><input type="email" required placeholder="بريدكِ الإلكتروني" aria-label="البريد الإلكتروني" data-testid="input-email" /><button className="btn-main" type="submit" data-testid="button-join-note">انضمّي للملاحظة <Send size={15} /></button></form><small>لا رسائل مزعجة. ذوق جميل، وإلغاء اشتراك سهل.</small></div></div>
    </section>
  );
}

function CartDrawer({ items, open, onClose, onChangeQuantity, onRemove, onWhatsApp }: { items: CartItem[]; open: boolean; onClose: () => void; onChangeQuantity: (id: number, delta: number) => void; onRemove: (id: number) => void; onWhatsApp: () => void }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => { document.body.classList.toggle('no-scroll', open); return () => document.body.classList.remove('no-scroll'); }, [open]);
  if (!open) return null;
  return <><div className="backdrop" onClick={onClose} aria-hidden="true" /><aside className="cart-drawer animate-slide" aria-label="سلة المشتريات">
    <div className="cart-head"><div><p className="eyebrow">سلّتك الصغيرة</p><h2>{count} {count === 1 ? 'قطعة' : 'قطع'}</h2></div><button className="icon-btn" onClick={onClose} aria-label="إغلاق السلة" title="إغلاق" data-testid="button-close-cart"><X size={19} /></button></div>
    <div className="cart-content">{items.length === 0 ? <div className="cart-empty"><div className="empty-bag"><ShoppingBag size={25} /></div><h3>السلة بانتظاركِ.</h3><p>ابدئي بقطعة تجعل صباحكِ أقرب إليكِ.</p><button className="btn-main" onClick={onClose} data-testid="button-browse-from-cart">تصفّحي المختارات</button></div> : <>{items.map(item => <div className="cart-item" key={item.id} data-testid={`row-cart-${item.id}`}><div className="cart-visual"><ProductVisual product={item} small /></div><div className="cart-item-copy"><div className="product-brand">{item.brand}</div><h3>{item.name}</h3><strong>{formatIQD(item.price)}</strong><div className="quantity-row"><button onClick={() => onChangeQuantity(item.id, -1)} aria-label={`تقليل كمية ${item.name}`} title="تقليل" data-testid={`button-decrease-${item.id}`}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => onChangeQuantity(item.id, 1)} aria-label={`زيادة كمية ${item.name}`} title="زيادة" data-testid={`button-increase-${item.id}`}><Plus size={13} /></button><button className="remove-item" onClick={() => onRemove(item.id)} aria-label={`حذف ${item.name}`} title="حذف" data-testid={`button-remove-${item.id}`}><Trash2 size={14} /></button></div></div></div>)}</>}</div>
    {items.length > 0 && <div className="cart-bottom"><div className="cart-subtotal"><span>المجموع الفرعي</span><strong>{formatIQD(total)}</strong></div><div className="cart-total"><span>الإجمالي</span><strong>{formatIQD(total)}</strong></div><p>نؤكد أجور التوصيل معكِ عبر واتساب قبل الإرسال.</p><button className="whatsapp-button" onClick={onWhatsApp} data-testid="button-whatsapp-order"><Send size={18} /> إتمام الطلب عبر واتساب <ArrowLeft size={16} /></button><button className="continue-button" onClick={onClose} data-testid="button-continue-browsing">متابعة التسوّق</button></div>}
  </aside></>;
}

function Footer() {
  return <footer className="site-footer"><div className="wrap footer-grid"><div><Logo light /><p className="footer-intro">كونتر جمالكِ الخاص،<br />على بُعد رسالة.</p><div className="socials"><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="إنستغرام ميمي" data-testid="link-instagram"><Instagram size={17} /></a><a href="https://wa.me/9647700000000" target="_blank" rel="noreferrer" aria-label="واتساب ميمي" data-testid="link-whatsapp"><Send size={17} /></a></div></div><div className="footer-links"><div><span className="footer-label">تصفّحي</span><a href="#shop">المختارات</a><a href="#categories">التصنيفات</a><a href="#story">حكايتنا</a></div><div><span className="footer-label">نحن هنا</span><a href="https://wa.me/9647700000000" target="_blank" rel="noreferrer">راسلينا واتساب</a><a href="#shop">ملاحظات التوصيل</a><a href="#top">العودة للأعلى</a></div></div></div><div className="wrap footer-bottom"><span>© ٢٠٢٤ ميمي ستور · بغداد، العراق</span><span>مصنوع لأيام الإشراقة اليومية.</span></div></footer>;
}

function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>('الكل');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [toast, setToast] = useState('');
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const flash = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2300); };
  const addToCart = (product: Product) => { setCart(current => current.some(item => item.id === product.id) ? current.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }]); flash(`أضيفت «${product.name}» إلى السلة`); };
  const changeQuantity = (id: number, delta: number) => setCart(current => current.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const removeItem = (id: number) => { const product = cart.find(item => item.id === id); setCart(current => current.filter(item => item.id !== id)); if (product) flash(`حُذفت «${product.name}» من السلة`); };
  const whatsappOrder = () => {
    const lines = cart.map(item => `- ${item.name} × ${item.quantity} — ${formatIQD(item.price * item.quantity)}`).join('\n');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const message = encodeURIComponent(`مرحباً ميمي، أود طلب المنتجات التالية:\n\n${lines}\n\nالمجموع: ${formatIQD(total)}\n\nالاسم ومنطقة التوصيل:`);
    window.open(`https://wa.me/9647700000000?text=${message}`, '_blank', 'noopener,noreferrer');
  };
  const selectCategory = (category: Category) => { setActiveCategory(category); setQuery(''); document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const clearFilters = () => { setActiveCategory('الكل'); setQuery(''); };
  return <div className="grain" dir="rtl">
    <Header cartCount={cartCount} announcementVisible={announcementVisible} menuOpen={menuOpen} onCart={() => setCartOpen(true)} onDismissAnnouncement={() => setAnnouncementVisible(false)} onMenuToggle={() => setMenuOpen(value => !value)} onSearch={() => { setSearchOpen(value => !value); setMenuOpen(false); }} />
    {searchOpen && <div className="search-panel animate-rise"><div className="wrap"><Search size={18} /><input autoFocus value={query} placeholder="ابحثي عن منتج أو ماركة..." aria-label="البحث عن منتج" data-testid="input-search" onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') setSearchOpen(false); }} /><button onClick={() => { setQuery(''); setSearchOpen(false); }} aria-label="إغلاق البحث" title="إغلاق" data-testid="button-close-search"><X size={18} /></button></div></div>}
    <main><Hero onShop={() => selectCategory('الكل')} /><div className="perk-row"><div><Check size={16} /><span>منتجات أصلية دائماً</span></div><div><Check size={16} /><span>توصيل محلي بتغليف محبب</span></div><div><Check size={16} /><span>نصيحة من شخص حقيقي</span></div></div><CategoryStrip active={activeCategory} onSelect={selectCategory} /><ShopSection active={activeCategory} query={query} onAdd={addToCart} onFavorite={id => setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])} favorites={favorites} onClear={clearFilters} /><StorySection /><JournalSection onSubscribe={() => flash('شكراً لانضمامكِ إلى ملاحظة ميمي')} /></main>
    <Footer /><CartDrawer items={cart} open={cartOpen} onClose={() => setCartOpen(false)} onChangeQuantity={changeQuantity} onRemove={removeItem} onWhatsApp={whatsappOrder} />
    {toast && <div className="toast animate-toast" role="status" data-testid="status-cart"><Check size={16} />{toast}</div>}
  </div>;
}

function Router() {
  return <ErrorBoundary resetKey={location.pathname}><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  useEffect(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; return () => { document.documentElement.dir = 'ltr'; document.documentElement.lang = 'en'; }; }, []);
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;