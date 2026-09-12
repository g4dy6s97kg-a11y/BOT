import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Instagram,
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
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';

type Category = 'All edit' | 'Complexion' | 'Lips' | 'Eyes' | 'Skincare' | 'Tools';
type ProductVisual = 'serum' | 'lip' | 'palette' | 'cream' | 'brush' | 'mist';
type Product = {
  id: number;
  name: string;
  brand: string;
  category: Exclude<Category, 'All edit'>;
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
  { id: 1, name: 'Honey Glow Serum', brand: 'Beauty of Joseon', category: 'Skincare', price: 32500, oldPrice: 38000, note: 'Propolis + niacinamide', rating: 4.9, reviews: 28, badge: 'Bestseller', visual: 'serum', tone: '#e5b77e', accent: '#a75b40' },
  { id: 2, name: 'Soft Pinch Blush', brand: 'Rare Beauty', category: 'Complexion', price: 42000, note: 'Liquid blush · Joy', rating: 4.8, reviews: 34, badge: 'Loved locally', visual: 'lip', tone: '#e4a29c', accent: '#7e334c' },
  { id: 3, name: 'Black Honey Lip', brand: 'Clinique', category: 'Lips', price: 38500, note: 'Almost lipstick · 04', rating: 4.9, reviews: 41, visual: 'lip', tone: '#482530', accent: '#d28186' },
  { id: 4, name: 'Peach C Frappe Palette', brand: 'Huda Beauty', category: 'Eyes', price: 69000, oldPrice: 75000, note: '18 warm peach shades', rating: 4.7, reviews: 19, badge: 'New in', visual: 'palette', tone: '#d88376', accent: '#facbb6' },
  { id: 5, name: 'Cloud Cream Moisturizer', brand: 'Dr. Jart+', category: 'Skincare', price: 47500, note: 'Ceramidin · 50ml', rating: 4.8, reviews: 23, visual: 'cream', tone: '#d9c4a9', accent: '#8d6071' },
  { id: 6, name: 'Velvet Teddy Lipstick', brand: 'MAC', category: 'Lips', price: 36000, note: 'Matte · warm nude', rating: 4.8, reviews: 31, visual: 'lip', tone: '#8c4a49', accent: '#f4c9b9' },
  { id: 7, name: 'Everyday Face Brush', brand: 'Real Techniques', category: 'Tools', price: 24000, note: 'Soft buffing finish', rating: 4.6, reviews: 16, visual: 'brush', tone: '#d7b6ae', accent: '#8c5d61' },
  { id: 8, name: 'Rosewater Face Mist', brand: 'Mario Badescu', category: 'Skincare', price: 29500, note: 'Rose + aloe · 118ml', rating: 4.7, reviews: 27, visual: 'mist', tone: '#e6b7b3', accent: '#ad5267' },
];

const categories: { label: Category; count: string; mark: string }[] = [
  { label: 'All edit', count: '24 pieces', mark: '01' },
  { label: 'Complexion', count: 'Base & blush', mark: '02' },
  { label: 'Lips', count: 'Tint & treat', mark: '03' },
  { label: 'Eyes', count: 'Colour stories', mark: '04' },
  { label: 'Skincare', count: 'Quiet rituals', mark: '05' },
  { label: 'Tools', count: 'The finish', mark: '06' },
];

function formatIQD(value: number) {
  return `${new Intl.NumberFormat('en-US').format(value)} IQD`;
}

function ProductVisual({ product, small = false }: { product: Product; small?: boolean }) {
  return (
    <div
      className={`visual visual-${product.visual} ${small ? 'visual-small' : ''}`}
      style={{ '--tone': product.tone, '--accent-tone': product.accent } as CSSProperties}
      aria-label={`${product.name} product illustration`}
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

function Header({ cartCount, onCart, onSearch }: { cartCount: number; onCart: () => void; onSearch: () => void }) {
  return (
    <header className="site-header">
      <div className="announcement">
        <span>Baghdad delivery in 1–2 days</span><span className="announcement-dot">·</span><span>Free delivery over 75,000 IQD</span>
        <button className="announcement-close" aria-label="Dismiss announcement"><X size={13} /></button>
      </div>
      <div className="wrap nav-row">
        <button className="mobile-nav-action" onClick={onSearch} aria-label="Search products" data-testid="button-search-mobile"><Search size={20} /></button>
        <a href="#top" className="logo-link" data-testid="link-home"><Logo /></a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#shop" data-testid="link-shop">Shop the edit</a>
          <a href="#categories" data-testid="link-categories">Categories</a>
          <a href="#story" data-testid="link-story">Our little counter</a>
        </nav>
        <div className="nav-actions">
          <button className="nav-search" onClick={onSearch} data-testid="button-search"><Search size={18} /><span>Search</span></button>
          <button className="bag-button" onClick={onCart} data-testid="button-cart"><ShoppingBag size={19} /><span className="bag-label">My bag</span>{cartCount > 0 && <b>{cartCount}</b>}</button>
        </div>
      </div>
    </header>
  );
}

function Hero({ onShop }: { onShop: () => void }) {
  return (
    <section className="hero" id="top">
      <div className="hero-corner hero-corner-top">01 / 03</div>
      <div className="hero-copy animate-rise">
        <p className="eyebrow">A considered beauty edit · Baghdad / Iraq</p>
        <h1>Good things<br /><em>look good</em><br />on you.</h1>
        <p className="hero-note">The kind of beauty counter you tell your best friend about. Original, useful, and selected with a little extra care.</p>
        <div className="hero-actions"><button className="btn-main" onClick={onShop} data-testid="button-hero-shop">Explore the edit <ArrowRight size={17} /></button><a href="#story" className="hero-text-link" data-testid="link-hero-story">Why Mimie <ChevronRight size={15} /></a></div>
      </div>
      <div className="hero-art animate-rise delay-2" aria-label="Editorial arrangement of beauty products">
        <div className="arch-shape" />
        <div className="hero-sun" />
        <div className="hero-ribbon">MIMIE · SINCE 2021</div>
        <div className="hero-bottle hero-bottle-left"><span>mimie<br /><b>skin</b></span></div>
        <div className="hero-bottle hero-bottle-right"><span>GLOW<br /><b>01</b></span></div>
        <div className="hero-lip"><i /></div>
        <div className="hero-flower hero-flower-1" /><div className="hero-flower hero-flower-2" />
        <span className="hero-art-note">the everyday<br />glow ritual</span>
      </div>
      <div className="hero-corner hero-corner-bottom">Scroll to browse <ChevronDown size={14} /></div>
    </section>
  );
}

function CategoryStrip({ active, onSelect }: { active: Category; onSelect: (category: Category) => void }) {
  return (
    <section className="category-section" id="categories">
      <div className="wrap">
        <div className="section-heading compact-heading"><div><p className="eyebrow">Find your ritual</p><h2>What are we in the mood for?</h2></div><p className="heading-aside">A small, well-edited selection<br />for very good skin days.</p></div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <button key={category.label} className={`category-pill ${active === category.label ? 'category-active' : ''} animate-rise delay-${Math.min(index + 1, 5)}`} onClick={() => onSelect(category.label)} data-testid={`button-category-${category.label.toLowerCase().replace(' ', '-')}`}>
              <span className="category-mark">{category.mark}</span><span><strong>{category.label}</strong><small>{category.count}</small></span><ArrowRight size={16} />
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
        <button className={`favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={() => onFavorite(product.id)} aria-label={`Favorite ${product.name}`} data-testid={`button-favorite-${product.id}`}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></button>
        <ProductVisual product={product} />
      </div>
      <div className="product-info">
        <div className="product-brand">{product.brand}</div><h3>{product.name}</h3><p className="product-note">{product.note}</p>
        <div className="product-rating"><span><Star size={12} fill="currentColor" /> {product.rating}</span><small>({product.reviews})</small></div>
        <div className="product-buy-row"><div><strong>{formatIQD(product.price)}</strong>{product.oldPrice && <del>{formatIQD(product.oldPrice)}</del>}</div><button className="add-button" onClick={() => onAdd(product)} data-testid={`button-add-${product.id}`}><Plus size={18} /></button></div>
      </div>
    </article>
  );
}

function ShopSection({ active, onAdd, onFavorite, favorites, onClear }: { active: Category; onAdd: (product: Product) => void; onFavorite: (id: number) => void; favorites: number[]; onClear: () => void }) {
  const filtered = useMemo(() => active === 'All edit' ? products : products.filter(product => product.category === active), [active]);
  return (
    <section className="shop-section section-space" id="shop">
      <div className="wrap">
        <div className="section-heading shop-heading"><div><p className="eyebrow">The current edit</p><h2>Little luxuries,<br /><em>properly chosen.</em></h2></div><div className="shop-tools"><span className="mono product-count">{filtered.length.toString().padStart(2, '0')} / {products.length.toString().padStart(2, '0')} shown</span>{active !== 'All edit' && <button className="clear-filter" onClick={onClear} data-testid="button-clear-filter">Clear filter <X size={13} /></button>}</div></div>
        {filtered.length > 0 ? <div className="product-grid">{filtered.map(product => <ProductCard key={product.id} product={product} onAdd={onAdd} onFavorite={onFavorite} favorite={favorites.includes(product.id)} />)}</div> : <div className="empty-products"><Sparkles size={28} /><p>That edit is taking a quiet moment.</p><button className="btn-quiet" onClick={onClear}>See everything</button></div>}
        <div className="shop-footer"><span>Showing our favourites, not the whole internet.</span><a href="#categories" data-testid="link-browse-categories">Browse by category <ArrowRight size={15} /></a></div>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section className="story-section section-space" id="story">
      <div className="wrap story-grid">
        <div className="story-art"><div className="story-paper">MIMIE<br /><span>notes</span></div><div className="story-flower flower-one" /><div className="story-flower flower-two" /><div className="story-stamp">selected<br />in Baghdad</div></div>
        <div className="story-copy"><p className="eyebrow">A note from the counter</p><h2>Less scrolling.<br /><em>More finding.</em></h2><p>We started Mimie because beauty shopping should feel like being handed a little secret. Each piece is checked, loved, and chosen for the way it fits into real routines in Iraq.</p><p className="story-signoff serif">With love, Mariam & the Mimie girls</p><a href="#shop" className="btn-quiet" data-testid="link-story-shop">Meet the edit <ArrowRight size={16} /></a></div>
      </div>
    </section>
  );
}

function JournalSection() {
  return (
    <section className="journal-section">
      <div className="wrap journal-card"><div><p className="eyebrow">The Mimie note</p><h2>Beauty advice,<br /><em>without the noise.</em></h2></div><div className="journal-copy"><p>One small note in your inbox every other week: what is worth trying, what is worth skipping, and a few lovely things in between.</p><div className="journal-form"><input type="email" placeholder="Your email, if you like" aria-label="Email address" data-testid="input-email" /><button className="btn-main" data-testid="button-join-note">Join the note <Send size={15} /></button></div><small>No spam. Just good taste and an easy unsubscribe.</small></div></div>
    </section>
  );
}

function CartDrawer({ items, open, onClose, onChangeQuantity, onRemove, onWhatsApp }: { items: CartItem[]; open: boolean; onClose: () => void; onChangeQuantity: (id: number, delta: number) => void; onRemove: (id: number) => void; onWhatsApp: () => void }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => { document.body.classList.toggle('no-scroll', open); return () => document.body.classList.remove('no-scroll'); }, [open]);
  if (!open) return null;
  return <><div className="backdrop" onClick={onClose} aria-hidden="true" /><aside className="cart-drawer animate-slide" aria-label="Shopping bag">
    <div className="cart-head"><div><p className="eyebrow">Your little bag</p><h2>{count} {count === 1 ? 'piece' : 'pieces'}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close shopping bag" data-testid="button-close-cart"><X size={19} /></button></div>
    <div className="cart-content">{items.length === 0 ? <div className="cart-empty"><div className="empty-bag"><ShoppingBag size={25} /></div><h3>Your bag is waiting.</h3><p>Start with something that makes your morning feel a little more yours.</p><button className="btn-main" onClick={onClose}>Browse the edit</button></div> : <>{items.map(item => <div className="cart-item" key={item.id} data-testid={`row-cart-${item.id}`}><div className="cart-visual"><ProductVisual product={item} small /></div><div className="cart-item-copy"><div className="product-brand">{item.brand}</div><h3>{item.name}</h3><strong>{formatIQD(item.price)}</strong><div className="quantity-row"><button onClick={() => onChangeQuantity(item.id, -1)} aria-label={`Decrease ${item.name}`} data-testid={`button-decrease-${item.id}`}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => onChangeQuantity(item.id, 1)} aria-label={`Increase ${item.name}`} data-testid={`button-increase-${item.id}`}><Plus size={13} /></button><button className="remove-item" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`} data-testid={`button-remove-${item.id}`}><Trash2 size={14} /></button></div></div></div>)}</>}</div>
    {items.length > 0 && <div className="cart-bottom"><div className="cart-subtotal"><span>Subtotal</span><strong>{formatIQD(total)}</strong></div><p>Delivery is confirmed with your Mimie girl on WhatsApp.</p><button className="whatsapp-button" onClick={onWhatsApp} data-testid="button-whatsapp-order"><Send size={18} /> Order on WhatsApp <ArrowRight size={16} /></button><button className="continue-button" onClick={onClose}>Continue browsing</button></div>}
  </aside></>;
}

function Footer() {
  return <footer className="site-footer"><div className="wrap footer-grid"><div><Logo light /><p className="footer-intro">Your private beauty counter,<br />a message away.</p><div className="socials"><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Mimie Instagram" data-testid="link-instagram"><Instagram size={17} /></a><a href="https://wa.me/9647700000000" target="_blank" rel="noreferrer" aria-label="Mimie WhatsApp" data-testid="link-whatsapp"><Send size={17} /></a></div></div><div className="footer-links"><div><span className="footer-label">Explore</span><a href="#shop">The edit</a><a href="#categories">Categories</a><a href="#story">Our story</a></div><div><span className="footer-label">Need a hand?</span><a href="https://wa.me/9647700000000" target="_blank" rel="noreferrer">WhatsApp us</a><a href="#shop">Delivery notes</a><a href="#top">Back to top</a></div></div></div><div className="wrap footer-bottom"><span>© 2024 Mimie Store · Baghdad, Iraq</span><span>Made for the everyday glow.</span></div></footer>;
}

function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>('All edit');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState('');
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const flash = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2300); };
  const addToCart = (product: Product) => { setCart(current => current.some(item => item.id === product.id) ? current.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }]); flash(`${product.name} added to your bag`); };
  const changeQuantity = (id: number, delta: number) => setCart(current => current.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const removeItem = (id: number) => setCart(current => current.filter(item => item.id !== id));
  const whatsappOrder = () => {
    const lines = cart.map(item => `- ${item.name} x ${item.quantity} — ${formatIQD(item.price * item.quantity)}`).join('\n');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const message = encodeURIComponent(`Hi Mimie, I'd like to order:\n\n${lines}\n\nSubtotal: ${formatIQD(total)}\n\nMy name and delivery area:`);
    window.open(`https://wa.me/9647700000000?text=${message}`, '_blank', 'noopener,noreferrer');
  };
  const selectCategory = (category: Category) => { setActiveCategory(category); document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  return <div className="grain">
    <Header cartCount={cartCount} onCart={() => setCartOpen(true)} onSearch={() => setSearchOpen(value => !value)} />
    {searchOpen && <div className="search-panel animate-rise"><div className="wrap"><Search size={18} /><input autoFocus placeholder="Search the edit..." aria-label="Search the edit" data-testid="input-search" onKeyDown={event => { if (event.key === 'Escape') setSearchOpen(false); }} /><button onClick={() => setSearchOpen(false)} aria-label="Close search" data-testid="button-close-search"><X size={18} /></button></div></div>}
    <main><Hero onShop={() => selectCategory('All edit')} /><div className="perk-row"><div><Check size={16} /><span>Authentic products, always</span></div><div><Check size={16} /><span>Local delivery, lovingly packed</span></div><div><Check size={16} /><span>Advice from a real person</span></div></div><CategoryStrip active={activeCategory} onSelect={selectCategory} /><ShopSection active={activeCategory} onAdd={addToCart} onFavorite={id => setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])} favorites={favorites} onClear={() => setActiveCategory('All edit')} /><StorySection /><JournalSection /></main>
    <Footer /><CartDrawer items={cart} open={cartOpen} onClose={() => setCartOpen(false)} onChangeQuantity={changeQuantity} onRemove={removeItem} onWhatsApp={whatsappOrder} />
    {toast && <div className="toast animate-toast" role="status" data-testid="status-cart"><Check size={16} />{toast}</div>}
  </div>;
}

function Router() {
  return <ErrorBoundary resetKey={location.pathname}><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;