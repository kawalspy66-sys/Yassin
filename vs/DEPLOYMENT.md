# Put Marketly online

This site uses Supabase for shared products and customer orders, and can be hosted as a static site on Netlify. Do not publish it as a real shop until the Supabase setup below is complete. Without Supabase configuration, checkout and admin changes are browser-local demos and are not shared with customers on other devices.

## 1. Create the Supabase database

1. Create a project at [supabase.com](https://supabase.com/) and wait for it to finish provisioning.
2. In the project, open **SQL Editor**, create a query, paste all of [`supabase-schema.sql`](./supabase-schema.sql), and run it.
3. Open **Project Settings → API**. Copy the **Project URL** and the **publishable/anon public key**. Never use or publish the `service_role` key.
4. Edit [`supabase-config.js`](./supabase-config.js) and replace `YOUR_PROJECT_ID` and `YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY` with those two values.

The SQL enables row-level security and creates a public product-image bucket. Shoppers can view product photos and place orders through a database function that calculates prices on the server. Only accounts explicitly added to `admin_users` can manage products, upload or delete photos, or see orders. The admin image picker accepts JPG, PNG, and WebP up to 12 MB and resizes photos before saving.

## 2. Create your admin account

1. In Supabase, open **Authentication → Users → Add user**. Create your admin email and password, and confirm the email if prompted.
2. In **SQL Editor**, run the following, replacing the example email with the account you created:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'you@example.com'
   on conflict (user_id) do nothing;
   ```

3. In **Authentication → URL Configuration**, set the site URL to your Netlify website URL after deploying. Add that same URL to the redirect URL allow list.

Keep your password private. The admin page requires signing in, and the database checks admin access independently of the page UI.

## 3. Publish both pages with Netlify

1. Go to [netlify.com](https://www.netlify.com/) and create an account.
2. Choose **Add new site → Deploy manually** and upload this project folder (the folder containing `index.html` and `admin.html`).
3. Open the new Netlify URL on your phone. The shop is at the root URL; the admin page is at `/admin.html`.
4. Update the Supabase Auth site URL and redirect allow list as described above.

For later changes, deploy the updated project folder to the same Netlify site. Both pages are responsive and use the same hosted database, so product changes, uploaded photos, and incoming orders are shared between your phone and other customers.

## Before accepting real orders

This is a basic order-request flow, not payment processing. It collects a customer's name, phone number, and delivery address and shows the order in the protected admin page; it does not charge a card or send email/SMS notifications. Add a payment provider and notification service before relying on it for paid sales.
