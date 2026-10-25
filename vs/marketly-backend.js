(() => {
  const config = window.MARKETLY_SUPABASE_CONFIG;
  const configured = config
    && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.url)
    && config.anonKey
    && !config.anonKey.includes("YOUR_")
    && window.supabase;

  if (!configured) {
    window.marketlyBackend = null;
    return;
  }

  const client = window.supabase.createClient(config.url, config.anonKey);
  window.marketlyBackend = {
    client,
    async getProducts() {
      const { data, error } = await client
        .from("products")
        .select("id,name,maker,category,price,rating,reviews,badge,image")
        .order("id");
      if (error) throw error;
      return data;
    },
    async uploadProductImage(file) {
      const extension = file.type === "image/webp" ? "webp" : "jpg";
      const path = `products/${crypto.randomUUID()}.${extension}`;
      const { error } = await client.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
      if (error) throw error;
      return client.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    },
    async removeProductImage(imageUrl) {
      const prefix = `${config.url}/storage/v1/object/public/product-images/`;
      if (!imageUrl.startsWith(prefix)) return;
      const path = imageUrl.slice(prefix.length);
      if (!path.startsWith("products/") || path.includes("..")) return;
      const { error } = await client.storage.from("product-images").remove([path]);
      if (error) throw error;
    },
    async placeOrder(customer, items) {
      const { data, error } = await client.rpc("place_marketly_order", {
        p_customer_name: customer.name,
        p_customer_phone: customer.phone,
        p_customer_address: customer.address,
        p_items: items.map(item => ({ id: item.id, quantity: item.quantity }))
      });
      if (error) throw error;
      return data;
    },
    async isAdmin() {
      const { data, error } = await client.rpc("is_marketly_admin");
      if (error) throw error;
      return data === true;
    },
    async getOrders() {
      const { data, error } = await client
        .from("orders")
        .select("id,customer_name,customer_phone,customer_address,total,status,created_at,order_items(name,quantity)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  };
})();
