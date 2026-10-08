/**
 * GANGA BAVANI Fashion and Fancy - Core Application Logic
 * Interactive E-Commerce Storefront Engine
 */

// Global App State
const AppState = {
  products: PRODUCTS_DATA,
  cart: JSON.parse(localStorage.getItem("gb_cart")) || [],
  wishlist: JSON.parse(localStorage.getItem("gb_wishlist")) || [],
  currentCategory: "all",
  searchQuery: "",
  sortBy: "featured",
  selectedOccasion: "all",
  selectedFabric: "all",
  storePhone: "919876543210", // Store WhatsApp Contact
  storeName: "GANGA BAVANI Fashion and Fancy"
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initCategories();
  renderProducts();
  updateCartBadge();
  updateWishlistBadge();
  initEventListeners();
});

// Category Tabs Navigation
function initCategories() {
  const container = document.getElementById("categoryTabs");
  if (!container) return;

  container.innerHTML = CATEGORIES_META.map(cat => {
    const isActive = AppState.currentCategory === cat.id;
    return `
      <button 
        class="filter-pill ${isActive ? 'active' : ''} flex items-center gap-2" 
        onclick="setCategory('${cat.id}')"
        data-cat="${cat.id}">
        <i class="fa-solid ${cat.icon} text-xs"></i>
        <span>${cat.name}</span>
      </button>
    `;
  }).join("");
}

function setCategory(catId) {
  AppState.currentCategory = catId;
  initCategories();
  renderProducts();

  // Smooth scroll to product catalog if clicked from outside
  const catalogSection = document.getElementById("catalogSection");
  if (catalogSection && window.scrollY > catalogSection.offsetTop + 100) {
    catalogSection.scrollIntoView({ behavior: "smooth" });
  }
}

// Product Filtering & Rendering
function renderProducts() {
  const grid = document.getElementById("productGrid");
  const countDisplay = document.getElementById("productCount");
  if (!grid) return;

  let filtered = [...AppState.products];

  // Category Filter
  if (AppState.currentCategory !== "all") {
    filtered = filtered.filter(p => p.category === AppState.currentCategory);
  }

  // Search Filter
  if (AppState.searchQuery.trim() !== "") {
    const q = AppState.searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      p.fabric.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.badge && p.badge.toLowerCase().includes(q))
    );
  }

  // Occasion Filter
  if (AppState.selectedOccasion !== "all") {
    filtered = filtered.filter(p => p.occasion === AppState.selectedOccasion);
  }

  // Sorting
  if (AppState.sortBy === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (AppState.sortBy === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (AppState.sortBy === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (AppState.sortBy === "discount") {
    filtered.sort((a, b) => {
      const discA = ((a.originalPrice - a.price) / a.originalPrice);
      const discB = ((b.originalPrice - b.price) / b.originalPrice);
      return discB - discA;
    });
  }

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} exclusive designs`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 text-3xl">
          <i class="fa-solid fa-magnifying-glass"></i>
        </div>
        <h3 class="text-2xl font-serif font-bold text-gray-800 mb-2">No Designs Found</h3>
        <p class="text-gray-500 max-w-md mx-auto mb-6">We couldn't find items matching your search criteria. Try clearing filters or search with another keyword.</p>
        <button onclick="resetFilters()" class="px-6 py-2.5 bg-amber-700 text-white rounded-full font-medium hover:bg-amber-800 transition">
          View All Collections
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const isWishlisted = AppState.wishlist.includes(p.id);
    const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);

    return `
      <div class="product-card group relative flex flex-col justify-between">
        <div>
          <!-- Image Section -->
          <div class="product-image-container relative">
            <img 
              src="${p.image}" 
              alt="${p.name}" 
              loading="lazy"
              class="product-image"
              onerror="this.src='https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'"
            />
            
            <!-- Badges -->
            <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              ${p.badge ? `
                <span class="badge-silk text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded shadow-sm">
                  ${p.badge}
                </span>
              ` : ''}
              <span class="bg-emerald-800 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                ${discount}% OFF
              </span>
            </div>

            <!-- Wishlist Heart Button -->
            <button 
              onclick="toggleWishlist(${p.id}, event)"
              title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
              class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 flex items-center justify-center shadow hover:bg-white hover:text-red-600 transition z-10">
              <i class="${isWishlisted ? 'fa-solid fa-heart text-red-600' : 'fa-regular fa-heart'}"></i>
            </button>

            <!-- Quick Action Hover Bar -->
            <div class="product-actions-overlay">
              <button 
                onclick="openQuickView(${p.id})"
                class="flex-1 py-2 px-3 bg-white/95 text-gray-900 rounded-lg text-xs font-semibold shadow hover:bg-amber-50 hover:text-amber-900 transition flex items-center justify-center gap-1.5">
                <i class="fa-regular fa-eye"></i> Quick View
              </button>
              <button 
                onclick="quickWhatsAppInquiry(${p.id})"
                class="py-2 px-3 bg-[#25D366] text-white rounded-lg text-xs font-semibold shadow hover:bg-[#20ba5a] transition flex items-center justify-center gap-1.5"
                title="Direct WhatsApp Inquiry">
                <i class="fa-brands fa-whatsapp text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Product Details -->
          <div class="p-4">
            <div class="flex items-center justify-between text-xs text-amber-800 font-medium mb-1">
              <span class="uppercase tracking-wider">${p.subcategory}</span>
              <span class="flex items-center gap-1 text-amber-600">
                <i class="fa-solid fa-star text-[11px] text-amber-500"></i> ${p.rating} (${p.reviewCount})
              </span>
            </div>

            <h4 class="font-serif font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-amber-800 transition">
              ${p.name}
            </h4>

            <p class="text-xs text-gray-500 line-clamp-1 mb-3">
              <i class="fa-solid fa-gem text-[10px] text-amber-700 mr-1"></i> ${p.fabric}
            </p>

            <!-- Price Breakdown -->
            <div class="flex items-baseline gap-2 mb-4">
              <span class="text-lg font-bold text-gray-900">₹${p.price.toLocaleString("en-IN")}</span>
              <span class="text-xs text-gray-400 line-through">₹${p.originalPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <!-- Add to Cart CTA -->
        <div class="p-4 pt-0">
          <button 
            onclick="addToCart(${p.id})"
            class="w-full py-2.5 px-4 bg-gray-900 hover:bg-amber-800 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm">
            <i class="fa-solid fa-bag-shopping text-xs"></i> Add to Bag
          </button>
        </div>
      </div>
    `;
  }).join("");
}

// Reset Filters
function resetFilters() {
  AppState.currentCategory = "all";
  AppState.searchQuery = "";
  AppState.selectedOccasion = "all";
  AppState.sortBy = "featured";

  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";
  
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) sortSelect.value = "featured";

  const occasionSelect = document.getElementById("occasionSelect");
  if (occasionSelect) occasionSelect.value = "all";

  initCategories();
  renderProducts();
}

// Quick View Modal
function openQuickView(productId) {
  const p = AppState.products.find(item => item.id === productId);
  if (!p) return;

  const modal = document.getElementById("quickViewModal");
  const content = document.getElementById("quickViewContent");
  if (!modal || !content) return;

  const isWishlisted = AppState.wishlist.includes(p.id);
  const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);

  content.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
      <!-- Image Gallery Preview -->
      <div class="space-y-4">
        <div class="rounded-xl overflow-hidden aspect-[3/4] bg-amber-50/50 border border-amber-200/50 shadow-inner relative">
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover" />
          <span class="absolute top-3 left-3 badge-silk text-xs px-3 py-1 rounded shadow">
            ${p.badge || 'GANGA BAVANI Special'}
          </span>
        </div>
      </div>

      <!-- Details -->
      <div class="flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs uppercase tracking-widest text-amber-800 font-bold bg-amber-100/70 px-2.5 py-1 rounded">
              ${p.subcategory}
            </span>
            <div class="flex items-center text-amber-500 text-sm">
              <i class="fa-solid fa-star mr-1"></i>
              <span class="font-bold text-gray-800 mr-1">${p.rating}</span>
              <span class="text-gray-400 text-xs">(${p.reviewCount} reviews)</span>
            </div>
          </div>

          <h2 class="text-2xl font-serif font-bold text-gray-900 leading-tight mb-3">
            ${p.name}
          </h2>

          <div class="flex items-baseline gap-3 mb-4 pb-4 border-b border-gray-100">
            <span class="text-3xl font-bold text-gray-900">₹${p.price.toLocaleString("en-IN")}</span>
            <span class="text-base text-gray-400 line-through">₹${p.originalPrice.toLocaleString("en-IN")}</span>
            <span class="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Save ${discount}%
            </span>
          </div>

          <!-- Specifications -->
          <div class="space-y-2.5 text-sm mb-6 bg-stone-50 p-4 rounded-xl border border-stone-200/60">
            <p><strong class="text-gray-700">Fabric & Material:</strong> <span class="text-gray-600">${p.fabric}</span></p>
            <p><strong class="text-gray-700">Ideal Occasion:</strong> <span class="text-gray-600">${p.occasion}</span></p>
            ${p.blouse ? `<p><strong class="text-gray-700">Blouse Details:</strong> <span class="text-gray-600">${p.blouse}</span></p>` : ''}
            <p><strong class="text-gray-700">Authenticity:</strong> <span class="text-emerald-700 font-medium">100% Quality Guaranteed by GANGA BAVANI</span></p>
          </div>

          <p class="text-sm text-gray-600 leading-relaxed mb-6">
            ${p.description}
          </p>

          <!-- Size / Cut Option -->
          <div class="mb-6">
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Available Size / Length</label>
            <div class="flex flex-wrap gap-2" id="quickViewSizeOptions">
              ${p.sizes.map((s, idx) => `
                <button type="button" class="px-3.5 py-1.5 border border-amber-800 bg-amber-50 text-amber-900 text-xs font-semibold rounded-lg">
                  ${s}
                </button>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Action CTAs -->
        <div class="space-y-3 pt-4 border-t border-gray-100">
          <div class="flex gap-3">
            <button 
              onclick="addToCart(${p.id}); closeQuickView();" 
              class="flex-1 py-3 px-6 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2">
              <i class="fa-solid fa-bag-shopping"></i> Add to Shopping Bag
            </button>
            <button 
              onclick="toggleWishlist(${p.id});" 
              class="w-12 h-12 rounded-xl border border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-200 transition flex items-center justify-center">
              <i class="${isWishlisted ? 'fa-solid fa-heart text-red-600' : 'fa-regular fa-heart'} text-lg"></i>
            </button>
          </div>

          <button 
            onclick="quickWhatsAppInquiry(${p.id})"
            class="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold rounded-xl transition shadow flex items-center justify-center gap-2 text-sm">
            <i class="fa-brands fa-whatsapp text-lg"></i> Inquire / Order on WhatsApp Directly
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeQuickView() {
  const modal = document.getElementById("quickViewModal");
  if (modal) modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

// Shopping Cart Management
function addToCart(productId, size = null, quantity = 1) {
  const product = AppState.products.find(p => p.id === productId);
  if (!product) return;

  const chosenSize = size || product.sizes[0];
  const existingItemIndex = AppState.cart.findIndex(
    item => item.id === productId && item.size === chosenSize
  );

  if (existingItemIndex > -1) {
    AppState.cart[existingItemIndex].quantity += quantity;
  } else {
    AppState.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      fabric: product.fabric,
      size: chosenSize,
      quantity: quantity
    });
  }

  saveCart();
  updateCartBadge();
  showToast(`Added "${product.name.slice(0, 24)}..." to your bag!`, "fa-bag-shopping");
}

function removeFromCart(index) {
  AppState.cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartBadge();
  showToast("Item removed from bag", "fa-trash-can");
}

function updateCartQuantity(index, delta) {
  if (!AppState.cart[index]) return;
  AppState.cart[index].quantity += delta;
  if (AppState.cart[index].quantity <= 0) {
    removeFromCart(index);
    return;
  }
  saveCart();
  renderCart();
  updateCartBadge();
}

function saveCart() {
  localStorage.setItem("gb_cart", JSON.stringify(AppState.cart));
}

function updateCartBadge() {
  const badges = document.querySelectorAll(".cart-badge-count");
  const totalCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
  badges.forEach(b => {
    b.textContent = totalCount;
    b.style.display = totalCount > 0 ? "flex" : "none";
  });
}

// Render Cart Drawer
function renderCart() {
  const container = document.getElementById("cartItemsContainer");
  const subtotalEl = document.getElementById("cartSubtotal");
  const savingsEl = document.getElementById("cartSavings");
  const totalEl = document.getElementById("cartFinalTotal");
  const checkoutBtn = document.getElementById("cartCheckoutBtn");
  const waBtn = document.getElementById("cartWhatsAppBtn");
  if (!container) return;

  if (AppState.cart.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center text-gray-500">
        <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 text-2xl">
          <i class="fa-solid fa-bag-shopping"></i>
        </div>
        <p class="font-serif font-bold text-gray-800 text-lg">Your Bag is Empty</p>
        <p class="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Explore our Sarees, Women, Men, Kids & Fancy accessories to fill your bag!</p>
        <button onclick="closeCart()" class="mt-6 px-5 py-2 bg-amber-800 text-white rounded-lg text-xs font-semibold hover:bg-amber-900 transition">
          Continue Shopping
        </button>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = "₹0";
    if (savingsEl) savingsEl.textContent = "₹0";
    if (totalEl) totalEl.textContent = "₹0";
    if (checkoutBtn) checkoutBtn.disabled = true;
    if (waBtn) waBtn.disabled = true;
    return;
  }

  let subtotal = 0;
  let originalTotal = 0;

  container.innerHTML = AppState.cart.map((item, idx) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    originalTotal += item.originalPrice * item.quantity;

    return `
      <div class="flex gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm relative">
        <img src="${item.image}" alt="${item.name}" class="w-20 h-24 object-cover rounded-lg bg-gray-50 flex-shrink-0" />
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between">
              <h4 class="font-medium text-xs text-gray-900 line-clamp-2 pr-4">${item.name}</h4>
              <button onclick="removeFromCart(${idx})" class="text-gray-400 hover:text-red-600 transition text-xs">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
            <p class="text-[11px] text-gray-500 mt-0.5">Size: ${item.size}</p>
          </div>
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center gap-2">
              <button onclick="updateCartQuantity(${idx}, -1)" class="qty-btn text-xs">-</button>
              <span class="text-xs font-bold text-gray-800 w-4 text-center">${item.quantity}</span>
              <button onclick="updateCartQuantity(${idx}, 1)" class="qty-btn text-xs">+</button>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold text-gray-900">₹${itemTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  const savings = originalTotal - subtotal;
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString("en-IN")}`;
  if (savingsEl) savingsEl.textContent = `₹${savings.toLocaleString("en-IN")}`;
  if (totalEl) totalEl.textContent = `₹${subtotal.toLocaleString("en-IN")}`;
  if (checkoutBtn) checkoutBtn.disabled = false;
  if (waBtn) waBtn.disabled = false;
}

function openCart() {
  const drawer = document.getElementById("cartDrawer");
  const backdrop = document.getElementById("cartBackdrop");
  if (!drawer || !backdrop) return;
  renderCart();
  backdrop.classList.add("active");
  drawer.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  const drawer = document.getElementById("cartDrawer");
  const backdrop = document.getElementById("cartBackdrop");
  if (drawer) drawer.classList.remove("active");
  if (backdrop) backdrop.classList.remove("active");
  document.body.style.overflow = "auto";
}

// Wishlist Logic
function toggleWishlist(productId, event = null) {
  if (event) event.stopPropagation();

  const index = AppState.wishlist.indexOf(productId);
  const product = AppState.products.find(p => p.id === productId);

  if (index > -1) {
    AppState.wishlist.splice(index, 1);
    showToast(`Removed from your wishlist`, "fa-heart");
  } else {
    AppState.wishlist.push(productId);
    showToast(`Saved "${product ? product.name.slice(0, 20) : 'Item'}..." to wishlist!`, "fa-heart");
  }

  localStorage.setItem("gb_wishlist", JSON.stringify(AppState.wishlist));
  updateWishlistBadge();
  renderProducts(); // Re-render to update heart states
}

function updateWishlistBadge() {
  const badges = document.querySelectorAll(".wishlist-badge-count");
  const count = AppState.wishlist.length;
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? "flex" : "none";
  });
}

function openWishlist() {
  const modal = document.getElementById("wishlistModal");
  const container = document.getElementById("wishlistItemsContainer");
  if (!modal || !container) return;

  const items = AppState.products.filter(p => AppState.wishlist.includes(p.id));

  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-gray-500">
        <i class="fa-regular fa-heart text-4xl text-rose-300 mb-3"></i>
        <h4 class="font-serif font-bold text-gray-800 text-lg">Your Wishlist is Empty</h4>
        <p class="text-xs text-gray-400 mt-1">Click the heart icon on any saree or outfit to save it for later.</p>
      </div>
    `;
  } else {
    container.innerHTML = items.map(p => `
      <div class="flex gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm items-center">
        <img src="${p.image}" class="w-16 h-20 object-cover rounded-lg" />
        <div class="flex-1">
          <h4 class="text-xs font-bold text-gray-900 line-clamp-1">${p.name}</h4>
          <p class="text-xs text-amber-800 font-semibold mt-1">₹${p.price.toLocaleString("en-IN")}</p>
          <div class="flex gap-2 mt-2">
            <button onclick="addToCart(${p.id}); toggleWishlist(${p.id});" class="text-xs px-2.5 py-1 bg-amber-800 text-white rounded hover:bg-amber-900">
              Move to Bag
            </button>
            <button onclick="toggleWishlist(${p.id})" class="text-xs text-red-600 hover:underline">
              Remove
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeWishlist() {
  const modal = document.getElementById("wishlistModal");
  if (modal) modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

// WhatsApp Integration Engine
function quickWhatsAppInquiry(productId) {
  const p = AppState.products.find(item => item.id === productId);
  if (!p) return;

  const message = `Namaste *${AppState.storeName}*! 🙏\n\nI am interested in this item from your collection:\n*Item:* ${p.name}\n*Category:* ${p.subcategory}\n*Price:* ₹${p.price.toLocaleString("en-IN")}\n*Fabric:* ${p.fabric}\n\nCould you please confirm if this piece is available? I would like to purchase it!`;
  
  const encoded = encodeURIComponent(message);
  window.open(`https://api.whatsapp.com/send?phone=${AppState.storePhone}&text=${encoded}`, "_blank");
}

function sendCartViaWhatsApp() {
  if (AppState.cart.length === 0) {
    showToast("Please add items to your bag first", "fa-bag-shopping");
    return;
  }

  let total = 0;
  let itemsText = "";

  AppState.cart.forEach((item, i) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    itemsText += `${i + 1}. *${item.name}* (Size: ${item.size}) x ${item.quantity} = ₹${itemTotal.toLocaleString("en-IN")}\n`;
  });

  const message = `Namaste *${AppState.storeName}*! 🙏\n\nI want to place an order for the following items:\n-------------------------------------\n${itemsText}-------------------------------------\n*Total Order Amount:* ₹${total.toLocaleString("en-IN")}\n\nPlease share payment details (UPI/Bank) and confirm delivery availability. Thank you!`;

  const encoded = encodeURIComponent(message);
  window.open(`https://api.whatsapp.com/send?phone=${AppState.storePhone}&text=${encoded}`, "_blank");
}

// Checkout Simulator & Confirmation Receipt
function openCheckoutModal() {
  if (AppState.cart.length === 0) return;
  closeCart();
  const modal = document.getElementById("checkoutModal");
  const summaryEl = document.getElementById("checkoutOrderSummary");
  if (!modal || !summaryEl) return;

  let total = 0;
  summaryEl.innerHTML = AppState.cart.map(item => {
    total += item.price * item.quantity;
    return `
      <div class="flex justify-between text-xs py-1 text-gray-600">
        <span class="line-clamp-1 pr-2">${item.name} (${item.quantity}x)</span>
        <span class="font-medium text-gray-900">₹${(item.price * item.quantity).toLocaleString("en-IN")}</span>
      </div>
    `;
  }).join("") + `
    <div class="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-sm text-gray-900">
      <span>Total Payable:</span>
      <span>₹${total.toLocaleString("en-IN")}</span>
    </div>
  `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

function handleCheckoutSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.customerName.value.trim();
  const phone = form.customerPhone.value.trim();
  const address = form.customerAddress.value.trim();
  const city = form.customerCity.value.trim();
  const paymentMethod = form.paymentMethod.value;

  if (!name || !phone || !address || !city) {
    showToast("Please fill all required shipping fields", "fa-triangle-exclamation");
    return;
  }

  // Generate Order ID
  const orderId = "GB-" + Math.floor(100000 + Math.random() * 900000);
  const totalAmount = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Close checkout modal & show receipt
  closeCheckoutModal();

  const receiptModal = document.getElementById("receiptModal");
  const receiptContent = document.getElementById("receiptContent");

  if (receiptModal && receiptContent) {
    receiptContent.innerHTML = `
      <div class="text-center pb-4 border-b border-gray-100">
        <div class="w-24 h-18 sm:w-28 sm:h-20 mx-auto mb-2.5 p-2 rounded-2xl bg-white border-2 border-amber-300 shadow-sm flex items-center justify-center">
          <img src="images/logo_transparent.png" alt="Ambati Logo" class="max-h-full max-w-full object-contain filter drop-shadow-sm" />
        </div>
        <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-lg">
          <i class="fa-solid fa-check"></i>
        </div>
        <h3 class="font-serif font-bold text-2xl text-gray-900">Order Placed Successfully!</h3>
        <p class="text-xs text-gray-500 mt-1">Thank you for shopping with <strong class="text-amber-900">GANGA BAVANI Fashion & Fancy</strong></p>
        <span class="inline-block mt-2 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
          Order ID: #${orderId}
        </span>
      </div>

      <div class="my-4 space-y-2 text-xs text-gray-600">
        <div class="flex justify-between"><strong class="text-gray-800">Customer Name:</strong> <span>${name}</span></div>
        <div class="flex justify-between"><strong class="text-gray-800">Contact Phone:</strong> <span>${phone}</span></div>
        <div class="flex justify-between"><strong class="text-gray-800">Delivery Address:</strong> <span>${address}, ${city}</span></div>
        <div class="flex justify-between"><strong class="text-gray-800">Payment Selected:</strong> <span class="capitalize">${paymentMethod}</span></div>
        <div class="flex justify-between"><strong class="text-gray-800">Total Amount:</strong> <span class="font-bold text-amber-900 text-sm">₹${totalAmount.toLocaleString("en-IN")}</span></div>
      </div>

      <div class="pt-4 border-t border-gray-100 space-y-2">
        <button 
          onclick="sendConfirmationWhatsApp('${orderId}', '${name}', '${phone}', '${city}', ${totalAmount})" 
          class="w-full py-2.5 bg-[#25D366] text-white text-xs font-bold rounded-lg hover:bg-[#20ba5a] flex items-center justify-center gap-2">
          <i class="fa-brands fa-whatsapp text-sm"></i> Send Order Receipt to Store on WhatsApp
        </button>
        <button 
          onclick="closeReceiptModal()" 
          class="w-full py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200">
          Close & Back to Store
        </button>
      </div>
    `;

    receiptModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // Clear Cart
  AppState.cart = [];
  saveCart();
  updateCartBadge();
  form.reset();
}

function sendConfirmationWhatsApp(orderId, name, phone, city, total) {
  const message = `Namaste *${AppState.storeName}*! 🙏\n\nI have submitted Order *#${orderId}*:\n*Customer:* ${name}\n*Phone:* ${phone}\n*City:* ${city}\n*Order Value:* ₹${total.toLocaleString("en-IN")}\n\nPlease confirm my dispatch tracking details. Thank you!`;
  const encoded = encodeURIComponent(message);
  window.open(`https://api.whatsapp.com/send?phone=${AppState.storePhone}&text=${encoded}`, "_blank");
}

function closeReceiptModal() {
  const modal = document.getElementById("receiptModal");
  if (modal) modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

// Toast Feedback Notification
function showToast(message, icon = "fa-check") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.innerHTML = `
    <i class="fa-solid ${icon} text-amber-400"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3000);
}

// Event Listeners Initialization
function initEventListeners() {
  // Search bar input listener
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      AppState.sortBy = e.target.value;
      renderProducts();
    });
  }

  // Occasion filter dropdown
  const occasionSelect = document.getElementById("occasionSelect");
  if (occasionSelect) {
    occasionSelect.addEventListener("change", (e) => {
      AppState.selectedOccasion = e.target.value;
      renderProducts();
    });
  }

  // Close modals on clicking outside overlay
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      e.target.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });

  // Mobile menu drawer
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenuDrawer = document.getElementById("mobileMenuDrawer");
  const closeMobileMenuBtn = document.getElementById("closeMobileMenuBtn");
  if (mobileMenuBtn && mobileMenuDrawer) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenuDrawer.classList.add("active");
    });
    if (closeMobileMenuBtn) {
      closeMobileMenuBtn.addEventListener("click", () => {
        mobileMenuDrawer.classList.remove("active");
      });
    }
  }
}
