import { productsAPI, ordersAPI } from '../api';

const CATEGORIES = {
  alphonso: { label: 'Alphonso', emoji: '🥭', taste: 'rich, creamy, sweet', bestFor: 'gifting and premium eating' },
  kesar: { label: 'Kesar', emoji: '🍊', taste: 'aromatic, sweet', bestFor: 'families and everyday treats' },
  dasheri: { label: 'Dasheri', emoji: '🥭', taste: 'mild sweet, juicy', bestFor: 'fresh eating in bulk' },
  langra: { label: 'Langra', emoji: '🥭', taste: 'tangy-sweet', bestFor: 'juice and salads' },
  totapuri: { label: 'Totapuri', emoji: '🍋', taste: 'firm, less sweet', bestFor: 'pickles and processing' },
  other: { label: 'Other', emoji: '🥭', taste: 'varied', bestFor: 'exploring local varieties' },
};

const FARMING_KB = [
  {
    keys: ['grow', 'plant', 'cultivat', 'sapling', 'tree'],
    answer: 'Mango trees thrive in warm climates (24–35°C). Plant grafted saplings in well-drained soil during monsoon. Water young trees weekly; mature trees need deep watering every 2–3 weeks in dry spells. Full sun and spacing of 8–10 m between trees is ideal.',
  },
  {
    keys: ['harvest', 'ripe', 'picking', 'when to pick'],
    answer: 'Harvest when fruits change colour and give a slight give near the stem. Alphonso turns golden-yellow; Kesar gets a saffron blush. Avoid harvesting in rain — wet mangoes spoil faster. Morning harvest keeps fruits fresher for FarmGate listings.',
  },
  {
    keys: ['pest', 'disease', 'insect', 'leaf', 'spot', 'aphid', 'hopper'],
    answer: 'Common issues: mango hopper (spray neem oil before flowering), anthracnose (remove infected leaves, improve airflow), and fruit flies (bag fruits or use pheromone traps). For leaf spots, avoid overhead watering and apply copper fungicide sparingly.',
  },
  {
    keys: ['organic', 'fertiliz', 'manure', 'compost', 'nutrient'],
    answer: 'For organic mangoes: use well-decomposed cow dung compost (10–15 kg per tree yearly), neem cake, and bone meal before flowering. Mulch around the base to retain moisture. FarmGate organic listings are verified by farmer declarations.',
  },
  {
    keys: ['prun', 'trim', 'branch'],
    answer: 'Prune after harvest to open the canopy for sunlight and air. Remove dead, crossing, or water-sprout branches. Light annual pruning boosts fruit size; heavy pruning reduces yield the following season.',
  },
  {
    keys: ['water', 'irrigat', 'drought'],
    answer: 'Mangoes are drought-tolerant once established. Critical watering periods: flowering (Jan–Feb) and fruit development (Mar–May). Over-watering during flowering can drop fruit set. Drip irrigation saves water and reduces disease.',
  },
];

const FAQ_KB = [
  {
    keys: ['deliver', 'shipping', 'ship', 'courier', 'how long', 'when will'],
    answer: 'FarmGate delivers farm-fresh mangoes across India. Orders are packed within 24–48 hours of confirmation and typically arrive in 2–5 business days depending on your location. You\'ll get tracking updates once shipped.',
  },
  {
    keys: ['payment', 'pay', 'cod', 'cash', 'upi', 'card'],
    answer: 'We accept UPI, cards, and net banking at checkout. Payment status shows on your order page. Farmers receive payouts after successful delivery confirmation.',
  },
  {
    keys: ['return', 'refund', 'replace', 'damaged', 'spoiled', 'quality'],
    answer: 'Received damaged or spoiled mangoes? Report within 24 hours of delivery with photos via your order page. We arrange replacements or refunds for verified quality issues — freshness is our promise.',
  },
  {
    keys: ['organic', 'certified', 'pesticide'],
    answer: 'Organic listings on FarmGate are marked with a green badge. Farmers declare organic practices; we encourage farm visits and transparent harvest dates on each product page.',
  },
  {
    keys: ['minimum', 'min order', 'bulk', 'wholesale'],
    answer: 'Each product shows its minimum order quantity (usually 1 kg or 1 box). For bulk or event orders, ask me to find high-stock varieties — I can filter by quantity available.',
  },
  {
    keys: ['contact', 'support', 'help', 'customer'],
    answer: 'Need human support? Visit your Profile page or email support@farmgate.in. farm2door AI can handle shopping, orders, and farming tips instantly!',
  },
  {
    keys: ['farmer', 'sell', 'list', 'register farmer'],
    answer: 'Farmers can register with phone OTP verification and list mangoes from the Farmer Dashboard. Set price, stock, harvest date, and upload photos to reach customers directly.',
  },
];

function normalize(text) {
  return text.toLowerCase().replace(/[₹,]/g, '').trim();
}

function extractPrice(text) {
  const match = normalize(text).match(/(?:under|below|less than|max|budget|within|upto|up to)\s*(\d+)/);
  if (match) return parseInt(match[1], 10);
  const rupee = normalize(text).match(/₹?\s*(\d+)/);
  if (rupee && /budget|under|below|cheap|affordable|rs|rupee|₹/.test(normalize(text))) return parseInt(rupee[1], 10);
  return null;
}

function extractCategory(text) {
  const t = normalize(text);
  for (const key of Object.keys(CATEGORIES)) {
    if (t.includes(key)) return key;
  }
  if (/sweet|premium|king|hafus|hapus/.test(t)) return 'alphonso';
  if (/saffron|aroma/.test(t)) return 'kesar';
  if (/juice|tangy/.test(t)) return 'langra';
  if (/pickle|firm/.test(t)) return 'totapuri';
  if (/bulk|family/.test(t)) return 'dasheri';
  return null;
}

function extractQuantity(text) {
  const match = normalize(text).match(/(\d+)\s*(kg|kilo|box|dozen|piece|pieces|pcs)/);
  return match ? { qty: parseInt(match[1], 10), unit: match[2] } : null;
}

function matchKB(text, kb) {
  const t = normalize(text);
  for (const entry of kb) {
    if (entry.keys.some(k => t.includes(k))) return entry.answer;
  }
  return null;
}

function formatProductLine(p) {
  const cat = CATEGORIES[p.category] || CATEGORIES.other;
  const rating = p.avg_rating ? ` · ★${p.avg_rating}` : '';
  const organic = p.is_organic ? ' · 🌿 Organic' : '';
  return `${cat.emoji} **${p.name}** — ₹${p.price_per_unit}/${p.unit} (${p.farmer_name})${rating}${organic}`;
}

function productActions(products) {
  return products.slice(0, 5).map(p => ({
    label: `View ${p.name}`,
    type: 'navigate',
    value: `/products/${p.id}`,
  }));
}

async function fetchProducts() {
  const res = await productsAPI.list();
  return (res.data || []).filter(p => p.is_available && p.stock > 0);
}

function searchProducts(products, text) {
  const t = normalize(text);
  const maxPrice = extractPrice(text);
  const category = extractCategory(text);
  const organic = /organic/.test(t);

  let results = [...products];

  if (category) results = results.filter(p => p.category === category);
  if (maxPrice) results = results.filter(p => parseFloat(p.price_per_unit) <= maxPrice);
  if (organic) results = results.filter(p => p.is_organic);
  if (/cheap|affordable|budget|low price|economical/.test(t)) {
    results = [...results].sort((a, b) => parseFloat(a.price_per_unit) - parseFloat(b.price_per_unit));
  }
  if (/premium|best|top|quality|rated/.test(t)) {
    results = [...results].sort((a, b) => (parseFloat(b.avg_rating) || 0) - (parseFloat(a.avg_rating) || 0));
  }

  const words = t.split(/\s+/).filter(w => w.length > 2 && !['show', 'find', 'search', 'mango', 'mangoes', 'the', 'for', 'me', 'all'].includes(w));
  if (words.length) {
    const wordMatches = results.filter(p =>
      words.some(w =>
        p.name.toLowerCase().includes(w) ||
        p.farmer_name.toLowerCase().includes(w) ||
        p.description.toLowerCase().includes(w)
      )
    );
    if (wordMatches.length) results = wordMatches;
  }

  return results;
}

function recommendProducts(products, text) {
  const t = normalize(text);
  const maxPrice = extractPrice(text) || (/\b(\d{3,4})\b/.test(t) ? parseInt(t.match(/\b(\d{3,4})\b/)[1], 10) : null);
  const category = extractCategory(text);

  let pool = [...products];

  if (/gift|present|premium|special|luxury/.test(t)) {
    pool = pool.filter(p => p.category === 'alphonso' || (p.avg_rating && p.avg_rating >= 4));
    pool.sort((a, b) => (parseFloat(b.avg_rating) || 0) - (parseFloat(a.avg_rating) || 0));
  } else if (/family|party|bulk|quantity|many/.test(t)) {
    pool = pool.filter(p => p.stock >= 5);
    pool.sort((a, b) => parseFloat(a.price_per_unit) - parseFloat(b.price_per_unit));
  } else if (/juice|shake|smoothie/.test(t)) {
    pool = pool.filter(p => ['langra', 'dasheri', 'totapuri'].includes(p.category));
  } else if (/sweet|dessert|eat/.test(t)) {
    pool = pool.filter(p => ['alphonso', 'kesar', 'dasheri'].includes(p.category));
  } else if (/organic|healthy|natural/.test(t)) {
    pool = pool.filter(p => p.is_organic);
  }

  if (category) pool = pool.filter(p => p.category === category);

  if (maxPrice) {
    const affordable = pool.filter(p => parseFloat(p.price_per_unit) <= maxPrice);
    if (affordable.length) pool = affordable;
  }

  pool.sort((a, b) => {
    const scoreA = (parseFloat(a.avg_rating) || 3) - parseFloat(a.price_per_unit) / 1000;
    const scoreB = (parseFloat(b.avg_rating) || 3) - parseFloat(b.price_per_unit) / 1000;
    return scoreB - scoreA;
  });

  return pool;
}

function buildRecommendationText(products, text) {
  if (!products.length) return 'I couldn\'t find a perfect match right now. Try browsing all products or adjusting your budget.';

  const top = products[0];
  const cat = CATEGORIES[top.category] || CATEGORIES.other;
  const purpose = /gift|present/.test(normalize(text)) ? 'gifting' :
    /juice/.test(normalize(text)) ? 'making juice' :
    /bulk|family|party/.test(normalize(text)) ? 'feeding a group' : 'enjoying fresh mangoes';

  let intro = `For ${purpose}, I'd recommend **${top.name}** (${cat.label}) — ${cat.taste}, great for ${cat.bestFor}. `;
  intro += `It's ₹${top.price_per_unit}/${top.unit} from ${top.farmer_name}`;
  if (top.avg_rating) intro += ` with a ★${top.avg_rating} rating`;
  intro += '.';

  if (products.length > 1) {
    intro += '\n\nOther great picks:';
    products.slice(1, 4).forEach(p => { intro += `\n${formatProductLine(p)}`; });
  }

  return intro;
}

function buildSearchText(products, text) {
  if (!products.length) {
    const hints = [];
    const maxPrice = extractPrice(text);
    const category = extractCategory(text);
    if (maxPrice) hints.push(`try a higher budget than ₹${maxPrice}`);
    if (category) hints.push(`check other varieties besides ${CATEGORIES[category]?.label}`);
    return `No mangoes matched that search${hints.length ? ` — ${hints.join(' or ')}` : ''}. Want me to show all available products?`;
  }

  const maxShow = Math.min(products.length, 5);
  let msg = `Found **${products.length}** matching ${products.length === 1 ? 'variety' : 'varieties'}:\n\n`;
  products.slice(0, maxShow).forEach(p => { msg += `${formatProductLine(p)}\n`; });
  if (products.length > maxShow) msg += `\n…and ${products.length - maxShow} more.`;
  return msg;
}

function handleCart(text, cart, { addToCart, removeFromCart, updateQty, clearCart, total, itemCount }) {
  const t = normalize(text);

  if (/clear|empty|remove all/.test(t) && /cart/.test(t)) {
    if (!cart.length) return { text: 'Your cart is already empty.' };
    clearCart();
    return { text: 'Done! I\'ve cleared your cart. Ready for a fresh mango haul? 🥭' };
  }

  if (/total|how much|cost|price/.test(t) && /cart/.test(t)) {
    if (!cart.length) return { text: 'Your cart is empty — add some mangoes first!' };
    const lines = cart.map(i => `• ${i.product.name} × ${i.qty} = ₹${(i.qty * parseFloat(i.product.price_per_unit)).toFixed(0)}`);
    return {
      text: `Your cart (${itemCount} items):\n\n${lines.join('\n')}\n\n**Total: ₹${total.toFixed(0)}**`,
      actions: [{ label: 'Go to Cart', type: 'navigate', value: '/cart' }],
    };
  }

  if (/what|show|list|items|inside/.test(t) && /cart/.test(t)) {
    if (!cart.length) return { text: 'Your cart is empty. Ask me to find mangoes and I\'ll help you shop!', actions: [{ label: 'Browse Products', type: 'navigate', value: '/products' }] };
    const lines = cart.map(i => `• ${i.product.name} × ${i.qty} ${i.product.unit} — ₹${i.product.price_per_unit}/${i.product.unit}`);
    return {
      text: `You have ${itemCount} items in your cart:\n\n${lines.join('\n')}\n\nTotal: **₹${total.toFixed(0)}**`,
      actions: [
        { label: 'View Cart', type: 'navigate', value: '/cart' },
        { label: 'Checkout', type: 'navigate', value: '/cart' },
      ],
    };
  }

  const addMatch = t.match(/add\s+(.+?)\s+to\s+cart/);
  if (addMatch) {
    return { text: 'To add a product, tap **View** on any recommendation and use "Add to Cart" on the product page — or tell me "recommend alphonso under ₹800" and I\'ll find options!' };
  }

  if (/cart|basket/.test(t)) {
    if (!cart.length) return { text: 'Your cart is empty. Want me to recommend the best mangoes for you?', actions: [{ label: 'Get Recommendations', type: 'send', value: 'Recommend the best mangoes' }] };
    return {
      text: `You have **${itemCount}** items worth **₹${total.toFixed(0)}** in your cart.`,
      actions: [{ label: 'View Cart', type: 'navigate', value: '/cart' }],
    };
  }

  return null;
}

async function handleOrders(text, user) {
  const t = normalize(text);
  if (!/order|track|deliver|shipment|status|package/.test(t)) return null;

  if (!user) {
    return {
      text: 'Please log in to track your orders. I can help you shop meanwhile!',
      actions: [{ label: 'Log In', type: 'navigate', value: '/login' }],
    };
  }

  if (user.role !== 'customer') {
    return { text: 'Order tracking is available for customers. Farmers can manage orders from the Farmer Dashboard.', actions: [{ label: 'Farmer Dashboard', type: 'navigate', value: '/farmer/dashboard' }] };
  }

  try {
    const res = await ordersAPI.myOrders();
    const orders = res.data || [];

    if (!orders.length) {
      return {
        text: 'You don\'t have any orders yet. Shall I find some fresh mangoes for you?',
        actions: [{ label: 'Shop Mangoes', type: 'navigate', value: '/products' }],
      };
    }

    const recent = orders.slice(0, 5);
    let msg = `You have **${orders.length}** order${orders.length > 1 ? 's' : ''}. Here are the latest:\n\n`;
    recent.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const items = o.items.slice(0, 2).map(i => i.product_name).join(', ');
      msg += `📦 **Order #${o.id}** (${date}) — ${o.status} · ₹${parseFloat(o.total_amount).toFixed(0)}\n   ${items}${o.items.length > 2 ? '…' : ''}\n`;
    });

    const pending = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
    if (pending.length) msg += `\n${pending.length} order${pending.length > 1 ? 's' : ''} still in progress.`;

    return {
      text: msg,
      actions: [
        { label: 'View All Orders', type: 'navigate', value: '/orders' },
        ...(recent[0] ? [{ label: `Order #${recent[0].id} Details`, type: 'navigate', value: `/orders/${recent[0].id}` }] : []),
      ],
    };
  } catch {
    return { text: 'I couldn\'t fetch your orders right now. Please try again or visit the Orders page.' };
  }
}

function handleFutureFeatures(text) {
  const t = normalize(text);
  if (/image|photo|picture|upload|scan|analyze|leaf/.test(t) && /mango|plant|leaf|crop|upload|analy/.test(t)) {
    return {
      text: '📷 **Image analysis** is coming soon! You\'ll be able to upload photos of mangoes or leaves for ripeness and health checks. Stay tuned!',
      actions: [{ label: 'Farming Tips', type: 'send', value: 'How do I know when mangoes are ripe?' }],
    };
  }
  if (/voice|speak|talk|microphone|mic|audio/.test(t)) {
    return {
      text: '🎤 **Voice interaction** is on our roadmap! Soon you\'ll be able to talk to farm2door AI hands-free while shopping or farming.',
    };
  }
  return null;
}

function handleGreeting(text) {
  const t = normalize(text);
  if (/^(hi|hello|hey|namaste|good morning|good evening|good afternoon)\b/.test(t)) return true;
  return false;
}

export const QUICK_ACTIONS = [
  { id: 'search', label: '🛍 Search Products', message: 'Show me available mangoes' },
  { id: 'recommend', label: '🥭 Best Mangoes', message: 'Recommend the best mangoes for me' },
  { id: 'orders', label: '📦 My Orders', message: 'Track my orders' },
  { id: 'cart', label: '🛒 My Cart', message: 'What\'s in my cart?' },
  { id: 'farming', label: '🌾 Farming Tips', message: 'How do I grow mango trees?' },
  { id: 'faq', label: '❓ FAQ', message: 'How does delivery work?' },
];

export const WELCOME_MESSAGE = {
  text: 'Hi! I\'m **🌱 farm2door AI** — your smart shopping and farming assistant.\n\nI can help you find mangoes, get personalized recommendations, track orders, manage your cart, and answer farming questions.\n\nWhat would you like to do today?',
};

export async function processMessage(text, context) {
  const { user, cart, total, itemCount, clearCart } = context;
  const t = normalize(text);

  if (!text.trim()) return { text: 'Type a message or tap a quick action below!' };

  const future = handleFutureFeatures(text);
  if (future) return future;

  if (handleGreeting(text)) {
    const name = user?.first_name || user?.username;
    return {
      text: `Hello${name ? ` ${name}` : ''}! 👋 I'm farm2door AI. Ask me to find mangoes, recommend varieties, check your orders, or share farming tips.`,
      actions: QUICK_ACTIONS.slice(0, 4).map(a => ({ label: a.label, type: 'send', value: a.message })),
    };
  }

  const cartResult = handleCart(text, cart, context);
  if (cartResult) return cartResult;

  const orderResult = await handleOrders(text, user);
  if (orderResult) return orderResult;

  const farmingAnswer = matchKB(text, FARMING_KB);
  if (farmingAnswer || /farm|agri|crop|soil|tree|plant|harvest|pest|mango grow/.test(t)) {
    if (farmingAnswer) return { text: `🌾 ${farmingAnswer}` };
    return { text: '🌾 I can help with mango farming! Try asking about planting, harvesting, pests, organic fertilizers, pruning, or irrigation.' };
  }

  const faqAnswer = matchKB(text, FAQ_KB);
  if (faqAnswer) return { text: `ℹ️ ${faqAnswer}` };

  let products = [];
  try {
    products = await fetchProducts();
  } catch {
    return { text: 'I\'m having trouble reaching the product catalog. Please check your connection and try again.' };
  }

  if (/recommend|suggest|best|which mango|what should|pick for|ideal|perfect/.test(t)) {
    const recommended = recommendProducts(products, text);
    return {
      text: buildRecommendationText(recommended, text),
      actions: productActions(recommended),
      links: [{ label: 'Browse all products', path: '/products' }],
    };
  }

  if (/search|show|find|list|get|want|under|below|cheap|organic|available|mango/.test(t)) {
    const results = searchProducts(products, text);
    const searchQuery = extractCategory(text) || normalize(text).replace(/show|find|search|mangoes|mango/g, '').trim();
    return {
      text: buildSearchText(results, text),
      actions: productActions(results),
      links: results.length ? [{ label: 'View all in catalog', path: `/products${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}` }] : [{ label: 'Browse Products', path: '/products' }],
    };
  }

  if (/personal|favourite|favorite|for me|love|like/.test(t)) {
    const pool = user
      ? recommendProducts(products, cart.length ? `sweet family ${extractPrice(text) || ''}` : 'best sweet')
      : recommendProducts(products, 'premium gift');
    const prefix = user ? `Based on your FarmGate profile` : `For new visitors`;
    return {
      text: `${prefix}, here are top picks:\n\n${buildRecommendationText(pool, text)}`,
      actions: productActions(pool),
    };
  }

  if (/help|what can you|how do you|features|capabilities/.test(t)) {
    return {
      text: 'I can help with:\n\n🛍 **Search** — "Show mangoes under ₹500"\n🥭 **Recommend** — "Best mango for gifting"\n📦 **Orders** — "Track my orders"\n🛒 **Cart** — "What\'s in my cart?"\n🌾 **Farming** — "When to harvest mangoes?"\n❓ **FAQ** — "How does delivery work?"\n\n📷 Image analysis and 🎤 voice chat are coming soon!',
      actions: QUICK_ACTIONS.map(a => ({ label: a.label, type: 'send', value: a.message })),
    };
  }

  const fallbackResults = searchProducts(products, text);
  if (fallbackResults.length) {
    return {
      text: `I found these mangoes related to your question:\n\n${buildSearchText(fallbackResults, text)}`,
      actions: productActions(fallbackResults),
    };
  }

  return {
    text: 'I\'m not sure I understood that. Try asking me to search products, recommend mangoes, track orders, or answer a farming question!',
    actions: QUICK_ACTIONS.slice(0, 3).map(a => ({ label: a.label, type: 'send', value: a.message })),
  };
}
