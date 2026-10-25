const backend = window.marketlyBackend;
const PRODUCTS_STORAGE_KEY = "marketly-products";
const ORDERS_STORAGE_KEY = "marketly-orders";
const LOCAL_ADMIN_STORAGE_KEY = "marketly-local-admin";
const loginForm = document.querySelector("#admin-login");
const setupForm = document.querySelector("#admin-setup");
const productForm = document.querySelector("#product-form");
const productTableBody = document.querySelector("#product-table-body");
const orderTableBody = document.querySelector("#order-table-body");
const productMessage = document.querySelector("#product-message");
const loginMessage = document.querySelector("#login-message");
const setupNotice = document.querySelector("#admin-setup-notice");
const secureContent = document.querySelector("#admin-secure-content");
const signOutButton = document.querySelector("#admin-signout");
const toast = document.querySelector("#admin-toast");
const orderStatuses = ["New", "Processing", "Shipped", "Completed", "Cancelled"];
let products = [];
let orders = [];
let toastTimer;
let currentProductImage = "";
let previewObjectUrl = "";

function readLocalAdmin() {
  try {
    const stored = localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY);
    if (!stored) return null;
    const credentials = JSON.parse(stored);
    if (typeof credentials.username !== "string" || typeof credentials.salt !== "string" || typeof credentials.hash !== "string") {
      throw new Error("Saved demo admin credentials are invalid.");
    }
    return credentials;
  } catch (error) {
    console.error("Could not load demo admin credentials.", error);
    showToast("Saved admin login could not be read. Clear this browser's Marketly data to reset it.");
    return null;
  }
}

function toHex(bytes) {
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function derivePasswordHash(password, saltHex) {
  if (!window.crypto?.subtle) throw new Error("Secure password storage is unavailable in this browser.");
  const salt = Uint8Array.from(saltHex.match(/.{2}/g), byte => parseInt(byte, 16));
  const key = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = await window.crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" },
    key,
    256
  );
  return toHex(derived);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function showMessage(element, message) {
  element.textContent = message;
}

function imageSource(image) {
  if (/^(https?:\/\/|data:image\/|blob:)/i.test(image || "")) return image;
  return `https://images.unsplash.com/${image || "photo-1490312278390-ab64016e0aa9"}?auto=format&fit=crop&w=120&q=75`;
}

function previewImage(image, label = "", releasePrevious = true) {
  const previewWrap = document.querySelector("#image-preview-wrap");
  const preview = document.querySelector("#image-preview");
  if (releasePrevious && previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = "";
  }
  if (!image) {
    previewWrap.hidden = true;
    preview.removeAttribute("src");
    document.querySelector("#image-preview-name").textContent = "";
    return;
  }
  preview.src = imageSource(image);
  preview.alt = label ? `Preview of ${label}` : "Product image preview";
  document.querySelector("#image-preview-name").textContent = label;
  previewWrap.hidden = false;
}

function resizeProductImage(file) {
  return new Promise(async (resolve, reject) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      reject(new Error("Choose a JPG, PNG, or WebP image."));
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      reject(new Error("Choose an image smaller than 12 MB."));
      return;
    }
    let bitmap;
    try {
      try {
        bitmap = await createImageBitmap(file);
      } catch {
        throw new Error("This image could not be opened. Choose a valid JPG, PNG, or WebP image.");
      }
      const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image editing is unavailable in this browser.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const qualities = [0.82, 0.74, 0.66, 0.58, 0.5, 0.42];
      let compressed;
      for (const quality of qualities) {
        compressed = await new Promise((done, fail) => {
          canvas.toBlob(blob => blob ? done(blob) : fail(new Error("Could not prepare this image.")), "image/webp", quality);
        });
        if (compressed.size <= 300 * 1024) break;
      }
      if (!compressed || compressed.size > 300 * 1024) {
        throw new Error("This image is too detailed to store. Choose a smaller image.");
      }
      resolve(compressed);
    } catch (error) {
      reject(error);
    } finally {
      if (bitmap) bitmap.close();
    }
  });
}

function blobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error || new Error("Could not read the image.")));
    reader.readAsDataURL(blob);
  });
}

function readLocalList(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback.map(item => ({ ...item }));
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error(`${key} must contain a list.`);
    return parsed;
  } catch (error) {
    console.error(`Could not load ${key}.`, error);
    showToast("Saved demo data could not be read. Check browser storage.");
    return fallback.map(item => ({ ...item }));
  }
}

function saveLocalList(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Could not save ${key}.`, error);
    showToast("Could not save changes. Check browser storage and try again.");
    return false;
  }
}

function renderProducts() {
  productTableBody.innerHTML = products.map(product => `
    <tr>
      <td><div class="admin-product-cell"><img src="${escapeHTML(imageSource(product.image))}" alt=""><strong>${escapeHTML(product.name)}</strong></div></td>
      <td>${escapeHTML(product.category)}</td><td>$${Number(product.price).toFixed(2)}</td><td>${escapeHTML(product.maker)}</td>
      <td><div class="admin-row-actions"><button class="admin-action-button" type="button" data-edit-product="${Number(product.id)}">Edit</button><button class="admin-action-button danger" type="button" data-delete-product="${Number(product.id)}">Delete</button></div></td>
    </tr>`).join("");
  document.querySelector("#products-empty").hidden = products.length > 0;
  document.querySelector("#product-count").textContent = products.length;
}

function renderOrders() {
  orderTableBody.innerHTML = orders.map(order => {
    const customerName = order.customer_name || order.customer?.name;
    const customerPhone = order.customer_phone || order.customer?.phone;
    const customerAddress = order.customer_address || order.customer?.address;
    const items = Array.isArray(order.order_items) ? order.order_items : (order.items || []);
    const summary = items.map(item => `${item.quantity} × ${escapeHTML(item.name)}`).join("<br>");
    const date = new Date(order.created_at || order.createdAt);
    const dateText = Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
    return `<tr>
      <td><strong>${escapeHTML(order.id)}</strong></td>
      <td>${escapeHTML(customerName)}<br><a class="admin-customer-link" href="tel:${escapeHTML(customerPhone)}">${escapeHTML(customerPhone)}</a><br><span class="admin-address">${escapeHTML(customerAddress)}</span></td>
      <td>${summary || "—"}</td><td>$${Number(order.total || 0).toFixed(2)}</td><td>${escapeHTML(dateText)}</td>
      <td><select class="order-status" data-order-status="${escapeHTML(order.id)}" aria-label="Status for order ${escapeHTML(order.id)}">${orderStatuses.map(status => `<option value="${status}"${(order.status || "New") === status ? " selected" : ""}>${status}</option>`).join("")}</select></td>
    </tr>`;
  }).join("");
  document.querySelector("#orders-empty").hidden = orders.length > 0;
  document.querySelector("#order-count").textContent = orders.length;
  document.querySelector("#new-order-count").textContent = orders.filter(order => (order.status || "New") === "New").length;
}

async function loadStore() {
  if (!backend) {
    products = readLocalList(PRODUCTS_STORAGE_KEY, window.MARKETLY_DEFAULT_PRODUCTS);
    orders = readLocalList(ORDERS_STORAGE_KEY, []);
    renderProducts();
    renderOrders();
    return;
  }
  const [loadedProducts, loadedOrders] = await Promise.all([
    backend.getProducts(),
    backend.getOrders()
  ]);
  products = loadedProducts;
  orders = loadedOrders;
  renderProducts();
  renderOrders();
}

function resetProductForm() {
  productForm.reset();
  productForm.elements.id.value = "";
  currentProductImage = "";
  previewImage("");
  document.querySelector("#product-form-title").textContent = "Add a product";
  document.querySelector("#save-product-button").textContent = "Add product";
  document.querySelector("#cancel-edit-button").hidden = true;
  productMessage.textContent = "";
}

function openAdmin() {
  loginForm.hidden = true;
  setupForm.hidden = true;
  secureContent.hidden = false;
  signOutButton.hidden = false;
  setupNotice.hidden = Boolean(backend);
  setupNotice.textContent = backend
    ? ""
    : "Local preview mode: changes and orders are stored in this browser only. To share them with customers on other devices, connect Supabase using DEPLOYMENT.md.";
  document.querySelector("#store-mode-notice").textContent = backend
    ? "Shared store: products and orders are stored securely in your Supabase project."
    : "Local preview: manage products and orders in this browser. This does not sync to other devices.";
  loadStore().catch(error => {
    console.error("Could not load store data.", error);
    showToast("Could not load store data. Check your connection and reload.");
  });
}

function closeAdmin(message = "") {
  secureContent.hidden = true;
  signOutButton.hidden = true;
  if (backend) {
    loginForm.hidden = false;
    setupForm.hidden = true;
  } else {
    const hasCredentials = Boolean(readLocalAdmin());
    loginForm.hidden = !hasCredentials;
    setupForm.hidden = hasCredentials;
    document.querySelector("#login-username-label").innerHTML = 'Username<input name="email" type="text" autocomplete="username" required>';
    document.querySelector("#login-description").textContent = "Sign in to manage this browser’s demo store.";
  }
  if (message) showMessage(loginMessage, message);
}

async function verifySession() {
  const { data, error } = await backend.client.auth.getSession();
  if (error) throw error;
  if (!data.session) {
    closeAdmin();
    return;
  }
  const isAdmin = await backend.isAdmin();
  if (!isAdmin) {
    await backend.client.auth.signOut();
    closeAdmin("This account does not have administrator access.");
    return;
  }
  openAdmin(data.session.user);
}

if (!backend) {
  loginForm.hidden = true;
  setupNotice.textContent = "Local demo login: create a username and password for this browser. This is not secure protection for a public website.";
  const credentials = readLocalAdmin();
  if (credentials) {
    setupForm.hidden = true;
    loginForm.hidden = false;
    document.querySelector("#login-username-label").innerHTML = 'Username<input name="email" type="text" autocomplete="username" required>';
    document.querySelector("#login-description").textContent = "Sign in to manage this browser’s demo store.";
  } else {
    loginForm.hidden = true;
    setupForm.hidden = false;
  }
} else {
  setupNotice.hidden = true;
  loginForm.hidden = false;
  verifySession().catch(error => {
    console.error("Could not verify the admin session.", error);
    closeAdmin("Could not connect to Supabase. Check the project URL and public key.");
  });
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!loginForm.reportValidity()) return;
  if (!backend) {
    const credentials = readLocalAdmin();
    const formData = new FormData(loginForm);
    try {
      if (!credentials || String(formData.get("email")).trim().toLowerCase() !== credentials.username
        || await derivePasswordHash(String(formData.get("password")), credentials.salt) !== credentials.hash) {
        showMessage(loginMessage, "Incorrect username or password.");
        return;
      }
      loginForm.reset();
      loginMessage.textContent = "";
      openAdmin();
    } catch (error) {
      console.error("Could not verify demo admin credentials.", error);
      showMessage(loginMessage, "Could not verify your login in this browser.");
    }
    return;
  }
  const formData = new FormData(loginForm);
  const { error } = await backend.client.auth.signInWithPassword({
    email: String(formData.get("email")).trim(),
    password: String(formData.get("password"))
  });
  if (error) {
    console.error("Admin sign-in failed.", error);
    showMessage(loginMessage, "Sign in failed. Check your email and password.");
    return;
  }
  try {
    if (!await backend.isAdmin()) {
      await backend.client.auth.signOut();
      showMessage(loginMessage, "This account does not have administrator access.");
      return;
    }
    loginForm.reset();
    loginMessage.textContent = "";
    openAdmin();
  } catch (error) {
    console.error("Could not verify administrator access.", error);
    await backend.client.auth.signOut();
    showMessage(loginMessage, "Could not verify administrator access. Try again.");
  }
});

setupForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (backend || !setupForm.reportValidity()) return;
  const formData = new FormData(setupForm);
  const username = String(formData.get("username")).trim().toLowerCase();
  const password = String(formData.get("password"));
  const confirmation = String(formData.get("confirm-password"));
  if (password !== confirmation) {
    showMessage(document.querySelector("#setup-message"), "The passwords do not match.");
    return;
  }
  try {
    const salt = toHex(window.crypto.getRandomValues(new Uint8Array(16)));
    const hash = await derivePasswordHash(password, salt);
    localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify({ username, salt, hash }));
    setupForm.reset();
    document.querySelector("#setup-message").textContent = "";
    loginForm.hidden = false;
    setupForm.hidden = true;
    document.querySelector("#login-username-label").innerHTML = 'Username<input name="email" type="text" autocomplete="username" required>';
    document.querySelector("#login-description").textContent = "Sign in to manage this browser’s demo store.";
    showMessage(loginMessage, "Admin login saved. Sign in with the username and password you just created.");
    loginForm.elements.email.value = username;
    loginForm.elements.password.focus();
  } catch (error) {
    console.error("Could not save demo admin credentials.", error);
    showMessage(document.querySelector("#setup-message"), "Could not save your login in this browser. Try again.");
  }
});

signOutButton.addEventListener("click", async () => {
  if (!backend) {
    closeAdmin();
    return;
  }
  if (!backend) return;
  const { error } = await backend.client.auth.signOut();
  if (error) {
    console.error("Could not sign out.", error);
    showToast("Could not sign out. Please try again.");
    return;
  }
  products = [];
  orders = [];
  renderProducts();
  renderOrders();
  closeAdmin();
});

productForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!productForm.reportValidity()) return;
  const submitButton = document.querySelector("#save-product-button");
  submitButton.disabled = true;
  const formData = new FormData(productForm);
  const id = formData.get("id");
  const existingProduct = id ? products.find(item => String(item.id) === String(id)) : null;
  let uploadedImage = "";
  try {
    const selectedFile = imageFileInput.files[0];
    let image = String(formData.get("image")).trim() || currentProductImage || "photo-1490312278390-ab64016e0aa9";
    if (selectedFile) {
      const compressedImage = await resizeProductImage(selectedFile);
      if (backend) {
        uploadedImage = await backend.uploadProductImage(compressedImage);
        image = uploadedImage;
      } else {
        image = await blobAsDataUrl(compressedImage);
      }
    }
    const product = {
      ...(existingProduct || {}),
      id: id ? Number(id) : undefined,
      name: String(formData.get("name")).trim(),
      maker: String(formData.get("maker")).trim(),
      category: String(formData.get("category")),
      price: Number(formData.get("price")),
      rating: existingProduct?.rating ?? 5,
      reviews: existingProduct?.reviews ?? 0,
      badge: String(formData.get("badge")).trim(),
      image
    };
    if (!backend) {
      if (!id) product.id = Math.max(0, ...products.map(item => Number(item.id) || 0)) + 1;
      const nextProducts = id
        ? products.map(item => String(item.id) === String(id) ? product : item)
        : [...products, product];
      if (!saveLocalList(PRODUCTS_STORAGE_KEY, nextProducts)) return;
      products = nextProducts;
      renderProducts();
      resetProductForm();
      showToast(id ? "Product updated in this browser." : "Product added in this browser.");
      return;
    }
    const { data, error } = id
      ? await backend.client.from("products").update(product).eq("id", id).select().single()
      : await backend.client.from("products").insert(product).select().single();
    if (error) throw error;
    products = id
      ? products.map(item => String(item.id) === String(id) ? data : item)
      : [...products, data];
    if (selectedFile && existingProduct?.image) {
      try {
        await backend.removeProductImage(existingProduct.image);
      } catch (cleanupError) {
        console.error("Product was saved but the previous image could not be removed.", cleanupError);
        showToast("Product saved; the previous image could not be removed from storage.");
      }
    }
    renderProducts();
    resetProductForm();
    if (!toast.classList.contains("show")) showToast(id ? "Product updated." : "Product added to your shop.");
  } catch (error) {
    console.error("Could not save product.", error);
    if (uploadedImage) {
      try {
        await backend.removeProductImage(uploadedImage);
      } catch (cleanupError) {
        console.error("Could not remove the unused uploaded product image.", cleanupError);
      }
    }
    const imageErrorMessages = [
      "This image is too detailed to store. Choose a smaller image.",
      "This image could not be opened. Choose a valid JPG, PNG, or WebP image.",
      "Image editing is unavailable in this browser.",
      "Could not prepare this image."
    ];
    showToast(imageErrorMessages.includes(error.message)
      ? error.message
      : "Could not save product or upload its image. Check the image and try again.");
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelector("#cancel-edit-button").addEventListener("click", resetProductForm);
productForm.addEventListener("reset", () => {
  setTimeout(() => {
    currentProductImage = "";
    previewImage("");
    if (!productForm.elements.id.value) {
      document.querySelector("#product-form-title").textContent = "Add a product";
      document.querySelector("#save-product-button").textContent = "Add product";
      document.querySelector("#cancel-edit-button").hidden = true;
    }
  });
});

const imageFileInput = document.querySelector("#product-image-file");
imageFileInput.addEventListener("change", () => {
  const file = imageFileInput.files[0];
  if (!file) {
    previewImage(currentProductImage || productForm.elements.image.value);
    return;
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    imageFileInput.value = "";
    previewImage(currentProductImage || productForm.elements.image.value);
    showToast("Choose a JPG, PNG, or WebP image.");
    return;
  }
  if (file.size > 12 * 1024 * 1024) {
    imageFileInput.value = "";
    previewImage(currentProductImage || productForm.elements.image.value);
    showToast("Choose an image smaller than 12 MB.");
    return;
  }
  const objectUrl = URL.createObjectURL(file);
  previewImage(objectUrl, file.name, false);
  previewObjectUrl = objectUrl;
});

productForm.elements.image.addEventListener("input", () => {
  if (imageFileInput.files.length) return;
  const image = productForm.elements.image.value.trim() || currentProductImage;
  previewImage(image, image && !/^data:image\//i.test(image) ? image : "");
});

productTableBody.addEventListener("click", async event => {
  const editButton = event.target.closest("[data-edit-product]");
  const deleteButton = event.target.closest("[data-delete-product]");
  if (editButton) {
    const product = products.find(item => String(item.id) === editButton.dataset.editProduct);
    if (!product) return;
    currentProductImage = product.image || "";
    for (const [key, value] of Object.entries(product)) {
      if (key === "image") {
        productForm.elements.image.value = /^data:image\//i.test(value || "") ? "" : value;
      } else if (productForm.elements[key]) {
        productForm.elements[key].value = value;
      }
    }
    imageFileInput.value = "";
    previewImage(currentProductImage, product.name);
    document.querySelector("#product-form-title").textContent = "Edit product";
    document.querySelector("#save-product-button").textContent = "Save changes";
    document.querySelector("#cancel-edit-button").hidden = false;
    productMessage.textContent = `Editing ${product.name}`;
    productForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (deleteButton) {
    const product = products.find(item => String(item.id) === deleteButton.dataset.deleteProduct);
    if (!product || !window.confirm(`Delete "${product.name}" from your shop?`)) return;
    if (!backend) {
      const nextProducts = products.filter(item => item.id !== product.id);
      if (!saveLocalList(PRODUCTS_STORAGE_KEY, nextProducts)) return;
      products = nextProducts;
      renderProducts();
      showToast("Product deleted from this browser.");
      return;
    }
    const { error } = await backend.client.from("products").delete().eq("id", product.id);
    if (error) {
      console.error("Could not delete product.", error);
      showToast("Could not delete product. Please try again.");
      return;
    }
    products = products.filter(item => item.id !== product.id);
    renderProducts();
    try {
      await backend.removeProductImage(product.image);
    } catch (cleanupError) {
      console.error("Product was deleted but its image could not be removed from storage.", cleanupError);
      showToast("Product deleted; its image could not be removed from storage.");
      return;
    }
    showToast("Product deleted.");
  }
});

orderTableBody.addEventListener("change", async event => {
  const select = event.target.closest("[data-order-status]");
  if (!select) return;
  const order = orders.find(item => item.id === select.dataset.orderStatus);
  if (!order) return;
  const previousStatus = order.status;
  if (!backend) {
    order.status = select.value;
    if (!saveLocalList(ORDERS_STORAGE_KEY, orders)) {
      order.status = previousStatus;
      select.value = previousStatus || "New";
      return;
    }
    renderOrders();
    showToast("Order status updated in this browser.");
    return;
  }
  const { error } = await backend.client.from("orders").update({ status: select.value }).eq("id", order.id);
  if (error) {
    console.error("Could not update order status.", error);
    select.value = previousStatus || "New";
    showToast("Could not update order status. Please try again.");
    return;
  }
  order.status = select.value;
  renderOrders();
  showToast("Order status updated.");
});

document.querySelector("#refresh-orders").addEventListener("click", async () => {
  if (!backend) {
    await loadStore();
    showToast("Demo data refreshed.");
    return;
  }
  try {
    orders = await backend.getOrders();
    renderOrders();
    showToast("Orders refreshed.");
  } catch (error) {
    console.error("Could not refresh orders.", error);
    showToast("Could not refresh orders. Please try again.");
  }
});
