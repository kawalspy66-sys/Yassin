const defaultProducts = window.MARKETLY_DEFAULT_PRODUCTS;
const PRODUCTS_STORAGE_KEY = "marketly-products";
const ORDERS_STORAGE_KEY = "marketly-orders";
let products;
try {
  const storedProducts = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY));
  products = Array.isArray(storedProducts) ? storedProducts : defaultProducts;
} catch (error) {
  console.error("Could not read saved products.", error);
  products = defaultProducts;
}

const categories = [
  { name: "All the good stuff", image: "photo-1490312278390-ab64016e0aa9" },
  { name: "Home", image: "photo-1600210492486-724fe5c67fb0" },
  { name: "Flowers", image: "photo-1490750967868-88aa4486c946" },
  { name: "Accessories", image: "photo-1590874103328-eac38a683ce7" },
  { name: "Beauty", image: "photo-1608248543803-ba4f8c70ae0b" },
  { name: "Food", image: "photo-1484723091739-30a097e8f929" }
];

const translations = {
  ku: {
    announcement: "شتێن باش، ژ لایێ کەسێن باشڤە هاتینە چێکرن.",
    makers: "بەرهەمهێنەران بناسە",
    searchPlaceholder: "ل دوو شتەكێ جوان بگەڕێ...",
    search: "بگەڕێ",
    searchLabel: "ل بەرهەمان بگەڕێ",
    language: "زمان",
    homeAria: "لاپەرەیا سەرەکی یا Marketly",
    mainNavAria: "ڕێبەری یا سەرەکی",
    sell: "ل Marketly بفروشە",
    saved: "پاراستی",
    savedAria: "شتێن پاراستی ببینە",
    bag: "سەبەتە",
    bagAria: "سەبەتەیا کڕینێ ڤەکە",
    heroEyebrow: "باشترین شت، ژبۆ تە کۆکرین",
    heroTitle: "یا باش<br>بدۆزەڤە",
    heroDescription: "شتێن بچووک ب زۆر حەزێ هاتینە چێکرن. ژ بەرهەمهێنەرێن سەربەخۆ و دوکانێن ناڤچەیێ بکرە.",
    explore: "بازارێ ببینە",
    happyShoppers: "ژ لایێ <strong>12,000+</strong> کڕیارێن دڵخۆشڤە هاتیە حەزکرن",
    heroArtAria: "کۆمەکا تایبەت ژ شتێن دەستکرد",
    sticker: "شتێن<br>باش<br>ل ڤێرە دگەهن",
    mugAlt: "فنجانەکا سیرامیکی دەستکرد ل سەر مێزەکا ڕۆناهی",
    flowersAlt: "گوڵێن تازە و ڕازاندنا مالێ",
    intention: "ب مەبەست<br>هاتینە چێکرن",
    categoryEyebrow: "هەموو جۆر شتێن جوان",
    categoriesTitle: "ب پێی جۆری بگەڕێ",
    shopAll: "هەمی ببینە",
    categoriesAria: "جۆرێن بەرهەمان",
    productsEyebrow: "ژ دەستێ مە بۆ تە",
    productsTitle: "دۆزینەوەیێن نوو",
    sortBy: "ڕێکخستن",
    sortFeatured: "تایبەت",
    sortLow: "نرخ: ژ کێم بۆ زۆر",
    sortHigh: "نرخ: ژ زۆر بۆ کێم",
    sortRating: "هەلسەنگاندنا بلند",
    filterAria: "فلتەرکرنا بەرهەمان",
    emptyTitle: "ئێستا شتەك نەهاتە دۆزین",
    emptyDescription: "گەڕانەکا دی بکە یان جۆرەكێ دی هەلبژێرە.",
    clearFilters: "فلتەران ژێببە",
    sellerEyebrow: "قۆناغا نوى یا تە ل ڤێرە دەستپێدکەت",
    sellerTitle: "تشتەكێ باش هەیە<br>دڤێت پێشکێش بکەی؟",
    sellerDescription: "بکە ئەندامێ کۆمەکێکێ کو باوەری دکەت کاروبارێن بچووک جیاوازیەکا مەزن دروست دکەن.",
    becomeSeller: "ببە فرۆشیار",
    footerDescription: "بازارەک بۆ شت و کەسێن کو حەز ژ وان دکەی.",
    copyright: "© 2026 Marketly. ژبۆ شتێن باش.",
    drawerEyebrow: "کۆکراکا بچووک یا تە",
    yourBag: "سەبەتەیا تە",
    closeBagAria: "سەبەتە دابخە",
    cartEmptyTitle: "سەبەتەیا تە ڕاڤەستیە",
    cartEmptyDescription: "دەمێ تشتەكێ حەژێ بکەی، ل ڤێرە دێ بیت.",
    keepExploring: "بگەڕێ دەمە",
    subtotal: "کۆی گشتی",
    shipping: "کرێیا هنارتن و باج دەمێ پارەدانێ دێ هێنە زیادکرن.",
    checkout: "بەردەوام بە بۆ پارەدانێ",
    savedAdded: "بۆ پاراستیان هاتە زێدەکرن",
    savedRemoved: "ژ پاراستیان هاتە ژێبرن",
    browse: "بگەڕێ ل",
    checkoutDemo: "پارەدان ل ڤێرە تەنێ نموونەیە. بۆ فرۆتنا ڕاستەقینە پارەدانێ گرێ بدە.",
    results: "دۆزینەوە",
    categories: ["هەمی شتێن باش", "مال", "گوڵ", "ئاکسسوارات", "جوانکاری", "خوارن"],
    productNames: ["فنجانا بەیانییا یەکشەمبی", "دەستەگوڵا گوڵێن کێوی", "جانتایێ بازاری", "ڕۆنا ڕووپێ ل گیایان", "شەمەعا خۆرێ بچووک", "مەرەبایێ تووتێ", "پارچەیا مێزێ یا دەست‌بافت", "گوڵگوشوارێن سیرامیکی"],
    badges: ["باشترین فرۆش", "حەژێکرییا ناڤچەیێ", "بۆ مەودایێ درێژ", "بچووک‌ژمارە", "دەست‌بافت", "تەنێ دانەیەک"]
  },
  ar: {
    announcement: "أشياء جميلة، صنعها أناس رائعون.",
    makers: "تعرّف إلى صُنّاعنا",
    searchPlaceholder: "ابحث عن شيء جميل...",
    search: "بحث",
    searchLabel: "ابحث عن المنتجات",
    language: "اللغة",
    homeAria: "الصفحة الرئيسية لـ Marketly",
    mainNavAria: "التنقل الرئيسي",
    sell: "بِع على Marketly",
    saved: "المحفوظات",
    savedAria: "عرض المنتجات المحفوظة",
    bag: "السلة",
    bagAria: "افتح سلة التسوق",
    heroEyebrow: "أجمل الأشياء، جمعناها لك",
    heroTitle: "اعثر على<br>ما <em>تحب.</em>",
    heroDescription: "أشياء صغيرة صُنعت بالكثير من الحب. تسوّق من صُنّاع مستقلين ومتاجر محلية واختر قطعًا تستحق الاحتفاظ بها.",
    explore: "اكتشف السوق",
    happyShoppers: "محبوب لدى أكثر من <strong>12,000</strong> متسوق سعيد",
    heroArtAria: "مجموعة مختارة من المنتجات المصنوعة يدويًا",
    sticker: "أشياء<br>جميلة<br>تنمو هنا",
    mugAlt: "كوب خزفي مصنوع يدويًا على طاولة مشمسة",
    flowersAlt: "زهور طازجة وديكور منزلي",
    intention: "صُنع<br>بشغف",
    categoryEyebrow: "القليل من كل شيء",
    categoriesTitle: "تسوّق حسب الفئة",
    shopAll: "تسوّق الكل",
    categoriesAria: "فئات المنتجات",
    productsEyebrow: "من أيدينا إليك",
    productsTitle: "اكتشافات مميزة",
    sortBy: "ترتيب حسب",
    sortFeatured: "مختارة",
    sortLow: "السعر: من الأقل إلى الأعلى",
    sortHigh: "السعر: من الأعلى إلى الأقل",
    sortRating: "الأعلى تقييمًا",
    filterAria: "تصفية المنتجات",
    emptyTitle: "لا توجد نتائج بعد",
    emptyDescription: "جرّب بحثًا آخر أو اختر فئة مختلفة.",
    clearFilters: "مسح عوامل التصفية",
    sellerEyebrow: "خطوتك التالية تبدأ هنا",
    sellerTitle: "لديك شيء<br>جميل لتشاركه؟",
    sellerDescription: "انضم إلى مجتمع يؤمن بأن المشاريع الصغيرة تصنع فرقًا كبيرًا.",
    becomeSeller: "انضم كبائع",
    footerDescription: "سوق للأشياء والأشخاص الذين تحبهم.",
    copyright: "© 2026 Marketly. صُنع للأشياء الجميلة.",
    drawerEyebrow: "مجموعتك الصغيرة",
    yourBag: "سلة التسوق",
    closeBagAria: "أغلق السلة",
    cartEmptyTitle: "سلتك تأخذ استراحة",
    cartEmptyDescription: "عندما تجد شيئًا تحبه، ستجده هنا.",
    keepExploring: "تابع الاستكشاف",
    subtotal: "المجموع الفرعي",
    shipping: "تُحسب رسوم الشحن والضرائب عند الدفع.",
    checkout: "تابع إلى الدفع",
    savedAdded: "أُضيف إلى المحفوظات",
    savedRemoved: "أُزيل من المحفوظات",
    browse: "تسوّق",
    checkoutDemo: "الدفع تجريبي — اربط مزود الدفع لقبول الطلبات.",
    results: "نتيجة",
    categories: ["كل الأشياء الجميلة", "المنزل", "الزهور", "إكسسوارات", "الجمال", "الطعام"],
    productNames: ["كوب صباح الأحد", "باقة زهور برية", "حقيبة السوق اليومية", "زيت نباتي للوجه", "شمعة الشمس الصغيرة", "مربى التوت", "مفرش طاولة منسوج يدويًا", "أقراط خزفية بلون الخوخ"],
    badges: ["الأكثر مبيعًا", "مفضّل محليًا", "صُنع ليدوم", "دفعة صغيرة", "منسوج يدويًا", "قطعة فريدة"]
  },
  en: {
    announcement: "Good things, made by good people.",
    makers: "Meet the makers",
    searchPlaceholder: "Search for something lovely…",
    search: "Search",
    searchLabel: "Search products",
    language: "Language",
    homeAria: "Marketly home",
    mainNavAria: "Main navigation",
    sell: "Sell on Marketly",
    saved: "Saved",
    savedAria: "Show saved items",
    bag: "Bag",
    bagAria: "Open shopping bag",
    heroEyebrow: "THE GOOD STUFF, GATHERED",
    heroTitle: "Find your<br>kind of <em>good.</em>",
    heroDescription: "Little things made with a lot of love. Shop independent makers, local favorites, and pieces worth keeping.",
    explore: "Explore the market",
    happyShoppers: "Loved by <strong>12,000+</strong> happy shoppers",
    heroArtAria: "A curated collection of handmade goods",
    sticker: "GOOD<br>THINGS<br>GROW HERE",
    mugAlt: "Handmade ceramic mug on a sunny table",
    flowersAlt: "Fresh flowers and home decor",
    intention: "Made with<br>intention",
    categoryEyebrow: "A LITTLE BIT OF EVERYTHING",
    categoriesTitle: "Wander by category",
    shopAll: "Shop all",
    categoriesAria: "Product categories",
    productsEyebrow: "FROM OUR HANDS TO YOURS",
    productsTitle: "Good finds, lately",
    sortBy: "Sort by",
    sortFeatured: "Featured",
    sortLow: "Price: low to high",
    sortHigh: "Price: high to low",
    sortRating: "Top rated",
    filterAria: "Filter products",
    emptyTitle: "No finds just yet",
    emptyDescription: "Try another search or choose a different category.",
    clearFilters: "Clear filters",
    sellerEyebrow: "YOUR NEXT CHAPTER STARTS HERE",
    sellerTitle: "Have something<br>good to share?",
    sellerDescription: "Join a community that believes small businesses make a big difference.",
    becomeSeller: "Become a seller",
    footerDescription: "A marketplace for the things — and people — you love.",
    copyright: "© 2026 Marketly. Made for good things.",
    drawerEyebrow: "YOUR LITTLE COLLECTION",
    yourBag: "Your bag",
    closeBagAria: "Close bag",
    cartEmptyTitle: "Your bag is taking a nap",
    cartEmptyDescription: "When you find something you love, it’ll be right here.",
    keepExploring: "Keep exploring",
    subtotal: "Subtotal",
    shipping: "Shipping and taxes calculated at checkout.",
    checkout: "Continue to checkout",
    savedAdded: "Added to saved items",
    savedRemoved: "Removed from saved items",
    browse: "Browse",
    checkoutDemo: "Checkout is a demo — connect your payment provider to accept orders.",
    results: "lovely finds",
    categories: ["All the good stuff", "Home", "Flowers", "Accessories", "Beauty", "Food"],
    productNames: ["Sunday Morning Mug", "Wildflower Bouquet", "Everyday Market Tote", "Botanical Face Oil", "Little Sun Candle", "Berry Picnic Jam", "Handwoven Table Runner", "Peachy Ceramic Earrings"],
    badges: ["Bestseller", "Local favorite", "Made to last", "Small batch", "Handwoven", "One of a kind"]
  }
};

const photoUrl = (photo, width = 600) => {
  if (/^(https?:\/\/|data:image\/)/i.test(photo)) return photo;
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=82`;
};
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[character]);
const defaultLanguage = localStorage.getItem("marketly-language") || "ku";
const state = { language: translations[defaultLanguage] ? defaultLanguage : "ku", category: "All the good stuff", query: "", sort: "featured", favorites: new Set(), cart: new Map(), favoritesOnly: false };
const grid = document.querySelector("#product-grid");
const categoryList = document.querySelector("#category-list");
const filterChips = document.querySelector("#filter-chips");
const searchInput = document.querySelector("#search-input");
const toast = document.querySelector("#toast");
let toastTimer;

function translatePage() {
  const language = translations[state.language];
  document.documentElement.lang = state.language === "ku" ? "ku-Arab" : state.language;
  document.documentElement.dir = state.language === "en" ? "ltr" : "rtl";
  document.title = state.language === "ku" ? "Marketly — شتێن باش بدۆزەڤە" : state.language === "ar" ? "Marketly — اكتشف الأشياء الجميلة" : "Marketly — Find your kind of good";
  document.querySelector("#language-select").value = state.language;
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const value = language[element.dataset.i18n];
    if (value !== undefined) element.innerHTML = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
    element.placeholder = language[element.dataset.i18nPlaceholder];
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(element => {
    element.setAttribute("aria-label", language[element.dataset.i18nAria]);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach(element => {
    element.alt = language[element.dataset.i18nAlt];
  });
  document.querySelector("#category-list").setAttribute("aria-label", language.categoriesAria);
  document.querySelector("#filter-chips").setAttribute("aria-label", language.filterAria);
}

function renderCategories() {
  const language = translations[state.language];
  categoryList.innerHTML = categories.map((category, index) => `
    <button class="category-card" type="button" data-category="${category.name}" aria-label="${language.browse} ${language.categories[index]}">
      <span class="category-image"><img src="${photoUrl(category.image, 360)}" alt="" loading="lazy"></span>
      <span class="category-name">${language.categories[index]}</span>
    </button>
  `).join("");
}

function renderChips() {
  const language = translations[state.language];
  filterChips.innerHTML = categories.map(category => `
    <button class="filter-chip${state.category === category.name ? " active" : ""}" type="button" data-category="${category.name}" aria-pressed="${state.category === category.name}">${language.categories[categories.indexOf(category)]}</button>
  `).join("");
}

function getVisibleProducts() {
  const language = translations[state.language];
  const query = state.query.trim().toLowerCase();
  let items = products.filter(product => {
    const categoryMatch = state.category === "All the good stuff" || product.category === state.category;
    const productIndex = products.indexOf(product);
    const categoryIndex = categories.findIndex(category => category.name === product.category);
    const textMatch = !query || `${product.name} ${product.maker} ${product.category} ${language.productNames[product.id - 1] || product.name} ${language.categories[categoryIndex] || product.category}`.toLowerCase().includes(query);
    const favoriteMatch = !state.favoritesOnly || state.favorites.has(product.id);
    return categoryMatch && textMatch && favoriteMatch;
  });
  if (state.sort === "price-low") items.sort((a, b) => a.price - b.price);
  if (state.sort === "price-high") items.sort((a, b) => b.price - a.price);
  if (state.sort === "rating") items.sort((a, b) => b.rating - a.rating);
  return items;
}

function renderProducts() {
  const language = translations[state.language];
  const items = getVisibleProducts();
  grid.innerHTML = items.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${escapeHTML(photoUrl(product.image))}" alt="${escapeHTML(language.productNames[product.id - 1] || product.name)}" loading="lazy">
        ${product.badge ? `<span class="product-badge">${escapeHTML(language.badges[product.id - 1] || product.badge)}</span>` : ""}
        <button class="favorite-button${state.favorites.has(product.id) ? " is-favorite" : ""}" type="button" data-favorite="${product.id}" aria-label="${state.favorites.has(product.id) ? language.savedRemoved : language.savedAdded}" aria-pressed="${state.favorites.has(product.id)}">${state.favorites.has(product.id) ? "♥" : "♡"}</button>
        <button class="quick-add" type="button" data-add="${product.id}">${language.bag} · $${Number(product.price).toFixed(2)}</button>
      </div>
      <div class="product-info">
        <p class="product-maker">${escapeHTML(product.maker)}</p>
        <div class="product-name-row"><h3 class="product-name">${escapeHTML(language.productNames[product.id - 1] || product.name)}</h3><span class="product-price">$${Number(product.price).toFixed(2)}</span></div>
        <div class="product-rating"><span aria-label="${product.rating}">★★★★★</span> ${product.rating} (${product.reviews})</div>
      </div>
    </article>
  `).join("");
  document.querySelector("#result-count").textContent = `${items.length} ${language.results}`;
  document.querySelector("#empty-state").hidden = items.length !== 0;
  grid.hidden = items.length === 0;
}

function updateView() {
  renderChips();
  renderProducts();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function updateCartCount() {
  const count = [...state.cart.values()].reduce((total, quantity) => total + quantity, 0);
  document.querySelector("#cart-count").textContent = count;
  document.querySelector("#drawer-count").textContent = `(${count})`;
}

function renderCart() {
  const language = translations[state.language];
  const cartItems = document.querySelector("#cart-items");
  const cartEmpty = document.querySelector("#cart-empty");
  const cartSummary = document.querySelector("#cart-summary");
  const entries = [...state.cart.entries()];
  cartEmpty.hidden = entries.length > 0;
  cartSummary.hidden = entries.length === 0;
  cartItems.innerHTML = entries.map(([id, quantity]) => {
    const product = products.find(item => item.id === id);
    if (!product) return "";
    return `<div class="cart-item">
      <img src="${escapeHTML(photoUrl(product.image, 180))}" alt="">
      <div><h3>${escapeHTML(language.productNames[product.id - 1] || product.name)}</h3><p>${escapeHTML(product.maker)}</p>
        <div class="quantity-controls"><button type="button" data-quantity="${id}" data-change="-1" aria-label="${escapeHTML(language.productNames[product.id - 1] || product.name)} −">−</button><span>${quantity}</span><button type="button" data-quantity="${id}" data-change="1" aria-label="${escapeHTML(language.productNames[product.id - 1] || product.name)} +">+</button></div>
      </div>
      <span class="cart-item-price">$${(product.price * quantity).toFixed(2)}</span>
    </div>`;
  }).join("");
  const subtotal = entries.reduce((sum, [id, quantity]) => {
    const product = products.find(item => item.id === id);
    return sum + (product ? product.price * quantity : 0);
  }, 0);
  document.querySelector("#cart-subtotal").textContent = `$${subtotal.toFixed(2)}`;
  updateCartCount();
}

function openCart() {
  document.querySelector("#overlay").hidden = false;
  document.querySelector("#cart-drawer").hidden = false;
  document.body.style.overflow = "hidden";
  document.querySelector("#cart-close").focus();
}

function closeCart() {
  document.querySelector("#overlay").hidden = true;
  document.querySelector("#cart-drawer").hidden = true;
  document.body.style.overflow = "";
  document.querySelector("#cart-open").focus();
}

function addToCart(id) {
  state.cart.set(id, (state.cart.get(id) || 0) + 1);
  renderCart();
  const product = products.find(item => item.id === id);
  showToast(`${translations[state.language].productNames[id - 1] || product.name} — ${translations[state.language].bag}`);
}

translatePage();
renderCategories();
updateView();
renderCart();
if (window.marketlyBackend) {
  window.marketlyBackend.getProducts().then(sharedProducts => {
    products = sharedProducts;
    renderCategories();
    updateView();
  }).catch(error => {
    console.error("Could not load products from the store database.", error);
    products = [];
    updateView();
    showToast("Products could not be loaded. Please refresh and try again.");
  });
}

document.addEventListener("click", event => {
  const categoryButton = event.target.closest("[data-category]");
  const addButton = event.target.closest("[data-add]");
  const favoriteButton = event.target.closest("[data-favorite]");
  const quantityButton = event.target.closest("[data-quantity]");

  if (categoryButton) {
    state.category = categoryButton.dataset.category;
    state.favoritesOnly = false;
    updateView();
    document.querySelector("#products-heading").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (addButton) addToCart(Number(addButton.dataset.add));
  if (favoriteButton) {
    const id = Number(favoriteButton.dataset.favorite);
    const wasFavorite = state.favorites.has(id);
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    if (state.favoritesOnly && state.favorites.size === 0) state.favoritesOnly = false;
    updateView();
    showToast(wasFavorite ? translations[state.language].savedRemoved : translations[state.language].savedAdded);
  }
  if (quantityButton) {
    const id = Number(quantityButton.dataset.quantity);
    const nextQuantity = (state.cart.get(id) || 0) + Number(quantityButton.dataset.change);
    if (nextQuantity <= 0) state.cart.delete(id);
    else state.cart.set(id, nextQuantity);
    renderCart();
  }
});

document.querySelector("#search-form").addEventListener("submit", event => event.preventDefault());
searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  renderProducts();
});
document.querySelector("#sort-select").addEventListener("change", event => {
  state.sort = event.target.value;
  renderProducts();
});
document.querySelector("#favorites-shortcut").addEventListener("click", () => {
  state.favoritesOnly = !state.favoritesOnly;
  state.category = "All the good stuff";
  updateView();
  document.querySelector("#products-heading").scrollIntoView({ behavior: "smooth", block: "start" });
});
document.querySelector("#clear-filters").addEventListener("click", () => {
  state.category = "All the good stuff";
  state.query = "";
  state.favoritesOnly = false;
  searchInput.value = "";
  updateView();
});
document.querySelector("#cart-open").addEventListener("click", openCart);
document.querySelector("#cart-close").addEventListener("click", closeCart);
document.querySelector("#overlay").addEventListener("click", closeCart);
document.querySelector("#continue-shopping").addEventListener("click", closeCart);
document.querySelector("#checkout-button").addEventListener("click", () => {
  document.querySelector("#cart-summary").hidden = true;
  document.querySelector("#checkout-form").hidden = false;
  document.querySelector("#customer-name").focus();
});
document.querySelector("#checkout-back").addEventListener("click", () => {
  document.querySelector("#checkout-form").hidden = true;
  document.querySelector("#cart-summary").hidden = false;
});
document.querySelector("#checkout-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const entries = [...state.cart.entries()].map(([id, quantity]) => {
    const product = products.find(item => item.id === id);
    return product ? { id: product.id, name: product.name, price: Number(product.price), quantity } : null;
  }).filter(Boolean);
  if (!entries.length) return;
  const customer = Object.fromEntries(new FormData(form));
  const submitButton = form.querySelector('[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Placing order…";
  try {
    if (window.marketlyBackend) {
      await window.marketlyBackend.placeOrder(customer, entries);
    } else {
      let orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || "[]");
      if (!Array.isArray(orders)) orders = [];
      orders.unshift({
        id: `ORD-${Date.now().toString(36).toUpperCase()}`,
        customer,
        items: entries,
        total: entries.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: "New",
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    }
  } catch (error) {
    console.error("Could not save the order.", error);
    submitButton.disabled = false;
    submitButton.textContent = "Place order";
    showToast("Could not place your order. Please try again.");
    return;
  }
  state.cart.clear();
  form.reset();
  form.hidden = true;
  document.querySelector("#cart-empty").hidden = false;
  submitButton.disabled = false;
  submitButton.textContent = "Place order";
  renderCart();
  showToast(window.marketlyBackend ? "Thanks! Your order has been received." : "Demo order saved in this browser only.");
});
document.querySelector("#language-select").addEventListener("change", event => {
  state.language = event.target.value;
  localStorage.setItem("marketly-language", state.language);
  translatePage();
  renderCategories();
  updateView();
  renderCart();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !document.querySelector("#cart-drawer").hidden) closeCart();
});
window.addEventListener("storage", event => {
  if (event.key !== PRODUCTS_STORAGE_KEY) return;
  try {
    products = event.newValue ? JSON.parse(event.newValue) : defaultProducts;
    if (!Array.isArray(products)) throw new Error("Saved products must be an array.");
    for (const id of state.cart.keys()) {
      if (!products.some(product => product.id === id)) state.cart.delete(id);
    }
    renderCategories();
    updateView();
    renderCart();
  } catch (error) {
    console.error("Could not refresh saved products.", error);
    showToast("Products could not be refreshed. Reload this page.");
  }
});
