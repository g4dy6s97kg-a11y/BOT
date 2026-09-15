import { type ChangeEvent, type CSSProperties, type Dispatch, type FormEvent, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Eye,
  EyeOff,
  FolderPlus,
  Heart,
  ImagePlus,
  Instagram,
  LayoutDashboard,
  Menu,
  Minus,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import NotFound from '@/pages/not-found';

type Category = string;
type ProductVisual = 'serum' | 'lip' | 'palette' | 'cream' | 'brush' | 'mist';
type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  note: string;
  rating: number;
  reviews: number;
  badge?: string;
  visual: ProductVisual;
  tone: string;
  accent: string;
  image?: string;
  visible?: boolean;
};
type CartItem = Product & { quantity: number };

const queryClient = new QueryClient();

const defaultProducts: Product[] = [
  { id: 1, name: 'سيروم هاني غلو', brand: 'Beauty of Joseon', category: 'العناية بالبشرة', price: 32500, oldPrice: 38000, note: 'بروبوليس + نياسيناميد', rating: 4.9, reviews: 28, badge: 'الأكثر طلباً', visual: 'serum', tone: '#e7b887', accent: '#a75b40' },
  { id: 2, name: 'بلاش سوفت بينش', brand: 'Rare Beauty', category: 'المكياج', price: 42000, note: 'بلاش سائل · جوي', rating: 4.8, reviews: 34, badge: 'محبوب في بغداد', visual: 'lip', tone: '#e4a29c', accent: '#7e334c' },
  { id: 3, name: 'روج بلاك هاني', brand: 'Clinique', category: 'المكياج', price: 38500, note: 'ليبستك مرطب · 04', rating: 4.9, reviews: 41, visual: 'lip', tone: '#482530', accent: '#d28186' },
  { id: 4, name: 'باليت بيتش سي فريب', brand: 'Huda Beauty', category: 'المكياج', price: 69000, oldPrice: 75000, note: '18 درجة خوخية دافئة', rating: 4.7, reviews: 19, badge: 'وصل حديثاً', visual: 'palette', tone: '#d88376', accent: '#facbb6' },
  { id: 5, name: 'كريم كلاود للترطيب', brand: 'Dr. Jart+', category: 'العناية بالبشرة', price: 47500, note: 'سيراميدين · 50 مل', rating: 4.8, reviews: 23, visual: 'cream', tone: '#d9c4a9', accent: '#8d6071' },
  { id: 6, name: 'روج فيلفت تيدي', brand: 'MAC', category: 'المكياج', price: 36000, note: 'مات · نيود دافئ', rating: 4.8, reviews: 31, visual: 'lip', tone: '#8c4a49', accent: '#f4c9b9' },
  { id: 7, name: 'فرشاة الوجه اليومية', brand: 'Real Techniques', category: 'الإكسسوارات', price: 24000, note: 'لمسة ناعمة ومتجانسة', rating: 4.6, reviews: 16, visual: 'brush', tone: '#d7b6ae', accent: '#8c5d61' },
  { id: 8, name: 'بخاخ ماء الورد', brand: 'Mario Badescu', category: 'العناية بالبشرة', price: 29500, note: 'ورد + ألوفيرا · 118 مل', rating: 4.7, reviews: 27, visual: 'mist', tone: '#e6b7b3', accent: '#ad5267' },
];

const defaultCategories: { label: Category; count: string; mark: string; description: string }[] = [
  { label: 'الكل', count: '08 منتجات', mark: '01', description: 'اختيارات مميزة' },
  { label: 'المكياج', count: '04 منتجات', mark: '02', description: 'لون ولمعة' },
  { label: 'العناية بالبشرة', count: '03 منتجات', mark: '03', description: 'روتين هادئ' },
  { label: 'العناية بالشعر', count: 'قريباً', mark: '04', description: 'لمسات يومية' },
  { label: 'الإكسسوارات', count: '01 منتج', mark: '05', description: 'سر اللمسة الأخيرة' },
];

const PRODUCTS_KEY = 'mimie-store-products';
const CATEGORIES_KEY = 'mimie-store-categories';

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as T : fallback;
  } catch {
    return fallback;
  }
}

function categoryMeta(label: string, index: number, count: number) {
  return {
    label,
    count: label === 'الكل' ? `${count.toString().padStart(2, '0')} منتجات` : `${count.toString().padStart(2, '0')} منتجات`,
    mark: index.toString().padStart(2, '0'),
    description: label === 'الكل' ? 'اختيارات مميزة' : 'اختيارات ميمي',
  };
}

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
      {product.image && <img className="uploaded-product-image" src={product.image} alt="" />}
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
      {announcementVisible && (
        <div className="announcement">
          <span>توصيل داخل بغداد خلال ١–٢ يوم</span>
          <span className="announcement-dot">·</span>
          <span>التوصيل مجاناً للطلبات فوق ٧٥,٠٠٠ د.ع</span>
          <button
            className="announcement-close"
            onClick={onDismissAnnouncement}
            aria-label="إغلاق التنبيه"
            title="إغلاق"
            data-testid="button-dismiss-announcement"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="wrap nav-row">
        <button
          className="mobile-nav-action"
          onClick={onMenuToggle}
          aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          title="القائمة"
          data-testid="button-mobile-menu"
        >
          <Menu size={21} />
        </button>

        <a href="#top" className="logo-link" data-testid="link-home">
          <Logo />
        </a>

        <nav className="main-nav" aria-label="التنقل الرئيسي">
          <a href="#shop" data-testid="link-shop">تسوّقي المختارات</a>
          <a href="#categories" data-testid="link-categories">التصنيفات</a>
          <a href="#story" data-testid="link-story">حكاية ميمي</a>
        </nav>

        <div className="nav-actions">
          <button
            className="nav-search"
            onClick={onSearch}
            data-testid="button-search"
            aria-label="البحث عن منتج"
          >
            <Search size={18} />
            <span>بحث</span>
          </button>

          <Link href="/admin" className="admin-link" data-testid="link-admin">
            <LayoutDashboard size={15} />
            <span>لوحة التحكم</span>
          </Link>

          <button
            className="bag-button"
            onClick={onCart}
            data-testid="button-cart"
            aria-label="فتح السلة"
          >
            <ShoppingBag size={19} />
            <span className="bag-label">سلّتي</span>
            {cartCount > 0 && <b>{cartCount}</b>}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="mobile-menu animate-rise" aria-label="قائمة الهاتف">
          <a href="#shop" onClick={onMenuToggle} data-testid="mobile-link-shop">
            تسوّقي المختارات <ChevronLeft size={16} />
          </a>
          <a href="#categories" onClick={onMenuToggle} data-testid="mobile-link-categories">
            التصنيفات <ChevronLeft size={16} />
          </a>
          <a href="#story" onClick={onMenuToggle} data-testid="mobile-link-story">
            حكاية ميمي <ChevronLeft size={16} />
          </a>
          <Link
            href="/admin"
            onClick={onMenuToggle}
            className="mobile-admin-link"
            data-testid="mobile-link-admin"
          >
            <LayoutDashboard size={16} /> لوحة التحكم
          </Link>
        </nav>
      )}
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

function CategoryStrip({ active, categories, onSelect }: { active: Category; categories: { label: Category; count: string; mark: string; description: string }[]; onSelect: (category: Category) => void }) {
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
        <div className="product-buy-row"><div><strong>{formatIQD(product.price)}</strong>{product.oldPrice && <del>{formatIQD(product.oldPrice)}</del>}</div>
  <button
  className="add-button"
  onClick={() => onAdd(product)}
  aria-label={`إضافة ${product.name} إلى السلة`}
  title="أضيفي إلى السلة"
  data-testid={`button-add-${product.id}`}
>
  <Plus size={18} />
</button></div>
      </div>
    </article>
  );
}

function ShopSection({ active, query, products, onAdd, onFavorite, favorites, onClear }: { active: Category; query: string; products: Product[]; onAdd: (product: Product) => void; onFavorite: (id: number) => void; favorites: number[]; onClear: () => void }) {
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ar');
    return products.filter(product => {
      const matchesCategory = active === 'الكل' || product.category === active;
      const searchable = `${product.name} ${product.brand} ${product.note} ${product.category}`.toLocaleLowerCase('ar');
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [active, query, products]);
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

function CartDrawer({ items, open, onClose, onChangeQuantity, onRemove, onInstagram }: { items: CartItem[]; open: boolean; onClose: () => void; onChangeQuantity: (id: number, delta: number) => void; onRemove: (id: number) => void; onInstagram: () => void }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => { document.body.classList.toggle('no-scroll', open); return () => document.body.classList.remove('no-scroll'); }, [open]);
  if (!open) return null;
  return <><div className="backdrop" onClick={onClose} aria-hidden="true" /><aside className="cart-drawer animate-slide" aria-label="سلة المشتريات">
    <div className="cart-head"><div><p className="eyebrow">سلّتك الصغيرة</p><h2>{count} {count === 1 ? 'قطعة' : 'قطع'}</h2></div><button className="icon-btn" onClick={onClose} aria-label="إغلاق السلة" title="إغلاق" data-testid="button-close-cart"><X size={19} /></button></div>
    <div className="cart-content">{items.length === 0 ? <div className="cart-empty"><div className="empty-bag"><ShoppingBag size={25} /></div><h3>السلة بانتظاركِ.</h3><p>ابدئي بقطعة تجعل صباحكِ أقرب إليكِ.</p><button className="btn-main" onClick={onClose} data-testid="button-browse-from-cart">تصفّحي المختارات</button></div> : <>{items.map(item => <div className="cart-item" key={item.id} data-testid={`row-cart-${item.id}`}><div className="cart-visual"><ProductVisual product={item} small /></div><div className="cart-item-copy"><div className="product-brand">{item.brand}</div><h3>{item.name}</h3><strong>{formatIQD(item.price)}</strong><div className="quantity-row"><button onClick={() => onChangeQuantity(item.id, -1)} aria-label={`تقليل كمية ${item.name}`} title="تقليل" data-testid={`button-decrease-${item.id}`}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => onChangeQuantity(item.id, 1)} aria-label={`زيادة كمية ${item.name}`} title="زيادة" data-testid={`button-increase-${item.id}`}><Plus size={13} /></button><button className="remove-item" onClick={() => onRemove(item.id)} aria-label={`حذف ${item.name}`} title="حذف" data-testid={`button-remove-${item.id}`}><Trash2 size={14} /></button></div></div></div>)}</>}</div>
     {items.length > 0 && <div className="cart-bottom"><div className="cart-subtotal"><span>المجموع الفرعي</span><strong>{formatIQD(total)}</strong></div><div className="cart-total"><span>الإجمالي</span><strong>{formatIQD(total)}</strong></div><p>تُنسخ تفاصيل طلبكِ تلقائياً، ثم نفتح حساب ميمي على Instagram لإرسالها.</p><button className="instagram-button" onClick={onInstagram} data-testid="button-instagram-order"><Instagram size={18} /> اطلب عبر Instagram <ArrowLeft size={16} /></button><button className="continue-button" onClick={onClose} data-testid="button-continue-browsing">متابعة التسوّق</button></div>}
  </aside></>;
}

function Footer() {
  return <footer className="site-footer"><div className="wrap footer-grid"><div><Logo light /><p className="footer-intro">كونتر جمالكِ الخاص،<br />على بُعد رسالة.</p><div className="socials"><a href="https://www.instagram.com/mimie.store05m/" target="_blank" rel="noreferrer" aria-label="إنستغرام ميمي" data-testid="link-instagram"><Instagram size={17} /></a></div></div><div className="footer-links"><div><span className="footer-label">تصفّحي</span><a href="#shop">المختارات</a><a href="#categories">التصنيفات</a><a href="#story">حكايتنا</a></div><div><span className="footer-label">نحن هنا</span><a href="https://www.instagram.com/mimie.store05m/" target="_blank" rel="noreferrer">اطلبي عبر Instagram</a><a href="#shop">ملاحظات التوصيل</a><a href="#top">العودة للأعلى</a></div></div></div><div className="wrap footer-bottom"><span>© ٢٠٢٤ ميمي ستور · بغداد، العراق</span><span>مصنوع لأيام الإشراقة اليومية.</span></div></footer>;
}

function Home({ products, categories, cart, setCart }: { products: Product[]; categories: string[]; cart: CartItem[]; setCart: Dispatch<SetStateAction<CartItem[]>> }) {
  const [activeCategory, setActiveCategory] = useState<Category>('الكل');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [toast, setToast] = useState('');
  useEffect(() => {
    setCart(current => current.flatMap(item => {
      const refreshed = products.find(product => product.id === item.id);
      return refreshed ? [{ ...refreshed, quantity: item.quantity }] : [];
    }));
    setFavorites(current => current.filter(id => products.some(product => product.id === id)));
  }, [products]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const flash = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2300); };
  const addToCart = (product: Product) => { setCart(current => current.some(item => item.id === product.id) ? current.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }]); flash(`أضيفت «${product.name}» إلى السلة`); };
  const changeQuantity = (id: number, delta: number) => setCart(current => current.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const removeItem = (id: number) => { const product = cart.find(item => item.id === id); setCart(current => current.filter(item => item.id !== id)); if (product) flash(`حُذفت «${product.name}» من السلة`); };
  const instagramOrder = () => {
    const lines = cart.map(item => `- ${item.name} × ${item.quantity} — ${formatIQD(item.price * item.quantity)}`).join('\n');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderText = `مرحباً ميمي، أود طلب المنتجات التالية:\n\n${lines}\n\nالمجموع: ${formatIQD(total)}\n\nالاسم ومنطقة التوصيل:`;
    navigator.clipboard?.writeText(orderText).catch(() => undefined);
    window.open('https://www.instagram.com/mimie.store05m/', '_blank', 'noopener,noreferrer');
    flash('نُسخت تفاصيل طلبكِ، أرسليها في Instagram');
  };
  const selectCategory = (category: Category) => { setActiveCategory(category); setQuery(''); document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const clearFilters = () => { setActiveCategory('الكل'); setQuery(''); };
  return <div className="grain" dir="rtl">
     <Header cartCount={cartCount} announcementVisible={announcementVisible} menuOpen={menuOpen} onCart={() => setCartOpen(true)} onDismissAnnouncement={() => setAnnouncementVisible(false)} onMenuToggle={() => setMenuOpen(value => !value)} onSearch={() => { setSearchOpen(value => !value); setMenuOpen(false); }} />
    {searchOpen && <div className="search-panel animate-rise"><div className="wrap"><Search size={18} /><input autoFocus value={query} placeholder="ابحثي عن منتج أو ماركة..." aria-label="البحث عن منتج" data-testid="input-search" onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') setSearchOpen(false); }} /><button onClick={() => { setQuery(''); setSearchOpen(false); }} aria-label="إغلاق البحث" title="إغلاق" data-testid="button-close-search"><X size={18} /></button></div></div>}
     <main><Hero onShop={() => selectCategory('الكل')} /><div className="perk-row"><div><Check size={16} /><span>منتجات أصلية دائماً</span></div><div><Check size={16} /><span>توصيل محلي بتغليف محبب</span></div><div><Check size={16} /><span>نصيحة من شخص حقيقي</span></div></div><CategoryStrip active={activeCategory} categories={[categoryMeta('الكل', 1, products.length), ...categories.map((label, index) => categoryMeta(label, index + 2, products.filter(product => product.category === label).length))]} onSelect={selectCategory} /><ShopSection active={activeCategory} query={query} products={products} onAdd={addToCart} onFavorite={id => setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])} favorites={favorites} onClear={clearFilters} /><StorySection /><JournalSection onSubscribe={() => flash('شكراً لانضمامكِ إلى ملاحظة ميمي')} /></main>
     <Footer /><CartDrawer items={cart} open={cartOpen} onClose={() => setCartOpen(false)} onChangeQuantity={changeQuantity} onRemove={removeItem} onInstagram={instagramOrder} />
    {toast && <div className="toast animate-toast" role="status" data-testid="status-cart"><Check size={16} />{toast}</div>}
  </div>;
}

type ProductForm = {
  name: string;
  price: string;
  note: string;
  category: string;
  image: string;
  brand: string;
  visual: ProductVisual;
};

const emptyProductForm: ProductForm = {
  name: '',
  price: '',
  note: '',
  category: '',
  image: '',
  brand: 'Mimie Store',
  visual: 'serum',
};

function Admin({ products, categories, onProductsChange, onCategoriesChange }: {
  products: Product[];
  categories: string[];
  onProductsChange: (products: Product[]) => void;
  onCategoriesChange: (categories: string[]) => void;
}) {
  const [, setLocation] = useLocation();
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProductForm);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [query, setQuery] = useState('');

  const visibleProducts = products.filter(product => product.visible !== false);
  const filteredProducts = products.filter(product => {
    const needle = query.trim().toLocaleLowerCase('ar');
    return !needle || `${product.name} ${product.brand} ${product.category}`.toLocaleLowerCase('ar').includes(needle);
  });
  const flashAdmin = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    window.setTimeout(() => setFeedback(null), 3000);
  };
  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyProductForm, category: categories[0] ?? '' });
    window.setTimeout(() => document.querySelector('.admin-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };
  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      price: String(product.price),
      note: product.note,
      category: product.category,
      image: product.image ?? '',
      brand: product.brand,
      visual: product.visual,
    });
    window.setTimeout(() => document.querySelector('.admin-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };
  const closeEditor = () => {
    setEditing(null);
    setForm({ ...emptyProductForm, category: categories[0] ?? '' });
  };
  const startCategoryEdit = (category: string) => {
    setEditingCategory(category);
    setCategoryName(category);
  };
  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setCategoryName('');
  };
  const saveProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = Number(form.price);
    if (!form.name.trim() || !form.category || !Number.isFinite(price) || price <= 0) {
      flashAdmin('error', 'أكملي اسم المنتج والسعر والقسم بشكل صحيح.');
      return;
    }
    if (editing) {
      onProductsChange(products.map(product => product.id === editing.id ? {
        ...product,
        name: form.name.trim(),
        price,
        note: form.note.trim() || 'اختيار ميمي اليومي',
        category: form.category,
        image: form.image || undefined,
        brand: form.brand.trim() || 'Mimie Store',
        visual: form.visual,
      } : product));
      flashAdmin('success', 'تم حفظ تعديلات المنتج.');
    } else {
      const nextId = products.reduce((highest, product) => Math.max(highest, product.id), 0) + 1;
      onProductsChange([...products, {
        id: nextId,
        name: form.name.trim(),
        brand: form.brand.trim() || 'Mimie Store',
        category: form.category,
        price,
        note: form.note.trim() || 'اختيار ميمي اليومي',
        rating: 5,
        reviews: 0,
        visual: form.visual,
        tone: '#e4b2ab',
        accent: '#9d5267',
        image: form.image || undefined,
        visible: true,
      }]);
      flashAdmin('success', 'تمت إضافة المنتج إلى المتجر.');
    }
    closeEditor();
  };
  const deleteProduct = (product: Product) => {
    if (!window.confirm(`هل تريدين حذف «${product.name}» نهائياً؟`)) return;
    onProductsChange(products.filter(item => item.id !== product.id));
    if (editing?.id === product.id) closeEditor();
    flashAdmin('success', 'تم حذف المنتج.');
  };
  const toggleProduct = (product: Product) => {
    onProductsChange(products.map(item => item.id === product.id ? { ...item, visible: item.visible === false } : item));
    flashAdmin('success', product.visible === false ? 'ظهر المنتج في المتجر.' : 'تم إخفاء المنتج من المتجر.');
  };
  const addCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = categoryName.trim();
    if (!cleanName) return;
    if (cleanName === 'الكل' || categories.some(category => category === cleanName && category !== editingCategory)) {
      flashAdmin('error', 'هذا القسم موجود مسبقاً.');
      return;
    }
    if (editingCategory) {
      onCategoriesChange(categories.map(category => category === editingCategory ? cleanName : category));
      onProductsChange(products.map(product => product.category === editingCategory ? { ...product, category: cleanName } : product));
      setForm(current => current.category === editingCategory ? { ...current, category: cleanName } : current);
      cancelCategoryEdit();
      flashAdmin('success', 'تم تعديل اسم القسم وتحديث المنتجات المرتبطة.');
      return;
    }
    onCategoriesChange([...categories, cleanName]);
    setCategoryName('');
    flashAdmin('success', 'تمت إضافة القسم الجديد.');
  };
  const deleteCategory = (category: string) => {
    if (products.some(product => product.category === category)) {
      flashAdmin('error', 'لا يمكن حذف هذا القسم قبل نقل المنتجات الموجودة فيه.');
      return;
    }
    if (!window.confirm(`حذف قسم «${category}»؟`)) return;
    onCategoriesChange(categories.filter(item => item !== category));
    if (form.category === category) setForm(current => ({ ...current, category: categories.find(item => item !== category) ?? '' }));
    flashAdmin('success', 'تم حذف القسم.');
  };
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      flashAdmin('error', 'اختاري ملف صورة صالحاً.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm(current => ({ ...current, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  return <div className="admin-page" dir="rtl">
    <header className="admin-topbar">
      <div className="wrap admin-topbar-inner">
        <div className="admin-brand"><Link href="/" className="admin-back" data-testid="link-back-store"><ArrowRight size={17} /> المتجر</Link><span className="admin-divider" /><Logo /></div>
        <div className="admin-top-actions"><span className="admin-status"><span /> حفظ محلي تلقائي</span><button className="admin-top-link" onClick={() => setLocation('/')} data-testid="button-view-store">عرض المتجر <ArrowLeft size={15} /></button></div>
      </div>
    </header>
    <main className="wrap admin-main">
      <div className="admin-intro">
        <div><p className="eyebrow">MIMIE · مساحة الإدارة</p><h1>لوحة التحكم</h1><p>رتّبي كاونتر ميمي من هاتفك. كل تغيير يُحفظ على هذا الجهاز فوراً.</p></div>
        <button className="admin-primary-button" onClick={openNew} data-testid="button-add-product"><Plus size={18} /> إضافة منتج جديد</button>
      </div>
      {feedback && <div className={`admin-feedback ${feedback.type}`} role="status" data-testid="status-admin-feedback">{feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}{feedback.text}</div>}
      <section className="admin-stats" aria-label="ملخص المتجر">
        <div><PackageIcon /><strong>{products.length}</strong><span>كل المنتجات</span></div>
        <div><Eye size={20} /><strong>{visibleProducts.length}</strong><span>تظهر للزبائن</span></div>
        <div><FolderPlus size={20} /><strong>{categories.length}</strong><span>الأقسام</span></div>
      </section>
      <div className="admin-layout">
        <section className="admin-products-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">كتالوج ميمي</p><h2>المنتجات <span>{products.length}</span></h2></div><div className="admin-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="ابحثي في المنتجات" aria-label="البحث في المنتجات" data-testid="input-admin-search" /></div></div>
          {filteredProducts.length === 0 ? <div className="admin-empty"><PackageIcon size={30} /><h3>لا توجد منتجات مطابقة</h3><p>جرّبي كلمة أخرى أو أضيفي منتجاً جديداً.</p></div> : <div className="admin-product-list">{filteredProducts.map(product => <article className={`admin-product-row ${product.visible === false ? 'is-hidden' : ''}`} key={product.id} data-testid={`admin-product-${product.id}`}>
            <div className="admin-product-thumb"><ProductVisual product={product} small /></div>
            <div className="admin-product-details"><div className="admin-product-name"><h3>{product.name}</h3>{product.visible === false && <span className="hidden-pill"><EyeOff size={12} /> مخفي</span>}</div><span>{product.brand} · {product.category}</span><strong>{formatIQD(product.price)}</strong></div>
            <div className="admin-row-actions"><button className="admin-icon-button" onClick={() => toggleProduct(product)} aria-label={product.visible === false ? `إظهار ${product.name}` : `إخفاء ${product.name}`} title={product.visible === false ? 'إظهار المنتج' : 'إخفاء المنتج'} data-testid={`button-toggle-product-${product.id}`}>{product.visible === false ? <Eye size={17} /> : <EyeOff size={17} />}</button><button className="admin-icon-button" onClick={() => openEdit(product)} aria-label={`تعديل ${product.name}`} title="تعديل المنتج" data-testid={`button-edit-product-${product.id}`}><Pencil size={17} /></button><button className="admin-icon-button danger" onClick={() => deleteProduct(product)} aria-label={`حذف ${product.name}`} title="حذف المنتج" data-testid={`button-delete-product-${product.id}`}><Trash2 size={17} /></button></div>
          </article>)}</div>}
        </section>
        <aside className="admin-side-column">
           <section className="admin-panel category-admin-panel"><div className="admin-panel-heading compact"><div><p className="eyebrow">تنظيم الكتالوج</p><h2>الأقسام</h2></div><FolderPlus size={20} /></div><form className="category-add-form" onSubmit={addCategory}><input value={categoryName} onChange={event => setCategoryName(event.target.value)} placeholder={editingCategory ? 'الاسم الجديد للقسم' : 'اسم القسم الجديد'} aria-label={editingCategory ? 'الاسم الجديد للقسم' : 'اسم القسم الجديد'} data-testid="input-new-category" /><button type="submit" aria-label={editingCategory ? 'حفظ تعديل القسم' : 'إضافة قسم'} title={editingCategory ? 'حفظ تعديل القسم' : 'إضافة قسم'} data-testid="button-add-category">{editingCategory ? <Save size={18} /> : <Plus size={18} />}</button>{editingCategory && <button type="button" className="category-cancel-button" onClick={cancelCategoryEdit} aria-label="إلغاء تعديل القسم" title="إلغاء تعديل القسم" data-testid="button-cancel-category-edit"><X size={16} /></button>}</form><div className="category-admin-list">{categories.map(category => <div key={category}><span>{category}<small>{products.filter(product => product.category === category).length} منتجات</small></span><div className="category-row-actions"><button onClick={() => startCategoryEdit(category)} aria-label={`تعديل قسم ${category}`} title="تعديل القسم" data-testid={`button-edit-category-${category}`}><Pencil size={15} /></button><button onClick={() => deleteCategory(category)} aria-label={`حذف قسم ${category}`} title="حذف القسم" data-testid={`button-delete-category-${category}`}><Trash2 size={15} /></button></div></div>)}</div><p className="admin-help"><AlertCircle size={14} /> تعديل القسم يحدّث منتجاته تلقائياً، ولا يمكن حذف قسم مرتبط بمنتجات.</p></section>
          {!editing && <div className="admin-side-note"><Sparkles size={19} /><div><strong>ملاحظة ميمي</strong><p>أضيفي صوراً واضحة بنسبة مربعة لتظهر أجمل على المتجر.</p></div></div>}
        </aside>
      </div>
      <section className={`admin-editor ${editing ? 'editor-open' : ''}`} aria-label="نموذج المنتج">
        <div className="admin-editor-heading"><div><p className="eyebrow">{editing ? 'تعديل التفاصيل' : 'منتج جديد'}</p><h2>{editing ? 'تعديل المنتج' : 'إضافة منتج إلى الكاونتر'}</h2></div>{editing && <button className="admin-close-editor" onClick={closeEditor} aria-label="إغلاق نموذج التعديل" title="إغلاق" data-testid="button-close-editor"><X size={18} /></button>}</div>
        <form onSubmit={saveProduct} className="admin-form">
          <label>اسم المنتج<input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="مثال: ماسك الطين الوردي" required data-testid="input-product-name" /></label>
          <label>العلامة التجارية<input value={form.brand} onChange={event => setForm({ ...form, brand: event.target.value })} placeholder="اسم الماركة" data-testid="input-product-brand" /></label>
          <label>السعر بالدينار العراقي<input type="number" min="1" value={form.price} onChange={event => setForm({ ...form, price: event.target.value })} placeholder="35000" required data-testid="input-product-price" /></label>
          <label>القسم<select value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} required data-testid="select-product-category"><option value="" disabled>اختاري القسم</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
          <label className="admin-form-wide">وصف المنتج<textarea value={form.note} onChange={event => setForm({ ...form, note: event.target.value })} placeholder="مثال: ترطيب عميق · 50 مل" rows={3} data-testid="textarea-product-note" /></label>
          <label className="admin-form-wide">رابط صورة المنتج<input value={form.image} onChange={event => setForm({ ...form, image: event.target.value })} placeholder="https://..." dir="ltr" data-testid="input-product-image-url" /><span className="field-hint">أو اختاري صورة من الهاتف</span><span className="file-picker"><ImagePlus size={17} /> اختيار صورة<input type="file" accept="image/*" onChange={handleFile} aria-label="اختيار صورة من الهاتف" data-testid="input-product-image-file" /></span></label>
          {form.image && <div className="admin-image-preview"><img src={form.image} alt="معاينة صورة المنتج" /><button type="button" onClick={() => setForm({ ...form, image: '' })} aria-label="إزالة صورة المنتج" title="إزالة الصورة" data-testid="button-remove-product-image"><X size={15} /></button></div>}
          <label>نمط الرسم الافتراضي<select value={form.visual} onChange={event => setForm({ ...form, visual: event.target.value as ProductVisual })} data-testid="select-product-visual"><option value="serum">زجاجة</option><option value="lip">روج</option><option value="palette">باليت</option><option value="cream">علبة كريم</option><option value="brush">فرشاة</option><option value="mist">بخاخ</option></select></label>
          <div className="admin-form-actions"><button type="submit" className="admin-primary-button" data-testid="button-save-product"><Save size={17} /> {editing ? 'حفظ التعديلات' : 'إضافة المنتج'}</button>{editing && <button type="button" className="admin-secondary-button" onClick={closeEditor} data-testid="button-cancel-editor">إلغاء</button>}</div>
        </form>
      </section>
    </main>
  </div>;
}

function PackageIcon({ size = 20 }: { size?: number }) {
  return <ShoppingBag size={size} />;
}

function Router({ products, categories, cart, setCart, onProductsChange, onCategoriesChange }: { products: Product[]; categories: string[]; cart: CartItem[]; setCart: Dispatch<SetStateAction<CartItem[]>>; onProductsChange: (products: Product[]) => void; onCategoriesChange: (categories: string[]) => void }) {
  const visibleProducts = useMemo(() => products.filter(product => product.visible !== false), [products]);
  return <ErrorBoundary resetKey={location.pathname}><Switch><Route path="/" component={() => <Home products={visibleProducts} categories={categories} cart={cart} setCart={setCart} />} /><Route path="/admin" component={() => <Admin products={products} categories={categories} onProductsChange={onProductsChange} onCategoriesChange={onCategoriesChange} />} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  const [products, setProducts] = useState<Product[]>(() => readStored(PRODUCTS_KEY, defaultProducts));
  const [categories, setCategories] = useState<string[]>(() => readStored(CATEGORIES_KEY, defaultCategories.filter(category => category.label !== 'الكل').map(category => category.label)));
  const [cart, setCart] = useState<CartItem[]>([]);
  const updateProducts = (nextProducts: Product[]) => {
    setProducts(nextProducts);
    setCart(current => current.flatMap(item => {
      const refreshed = nextProducts.find(product => product.id === item.id && product.visible !== false);
      return refreshed ? [{ ...refreshed, quantity: item.quantity }] : [];
    }));
  };
  useEffect(() => { window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }, [products]);
  useEffect(() => { window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; return () => { document.documentElement.dir = 'ltr'; document.documentElement.lang = 'en'; }; }, []);
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router products={products} categories={categories} cart={cart} setCart={setCart} onProductsChange={updateProducts} onCategoriesChange={setCategories} /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
