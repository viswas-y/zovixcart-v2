# ZovixCart

Monorepo for ZovixCart — a COD-first e-commerce store for India specializing in Home & Cleaning essentials.

## Monorepo Architecture

- **`cms/`**: Sanity Studio v3 (TypeScript) for managing products, categories, and inventory.
- **`website/`**: Next.js (App Router, TypeScript, Tailwind CSS) storefront reading product data from Sanity.

---

## Prerequisites

- Node.js >= 18 (Node.js 20+ recommended)
- npm (or pnpm / yarn)
- A Sanity project (Project ID and Dataset name)

---

## Setup & Run Instructions

### 1. CMS (Sanity Studio)

1. Navigate to the `cms` folder:
   ```bash
   cd cms
   ```

2. Copy the example environment file and add your Sanity credentials:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   SANITY_STUDIO_PROJECT_ID=your_actual_sanity_project_id
   SANITY_STUDIO_DATASET=production
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the Sanity Studio development server:
   ```bash
   npm run dev
   ```
   The studio will be available at [http://localhost:3333](http://localhost:3333).

---

### 2. Website (Next.js Storefront)

1. Navigate to the `website` folder:
   ```bash
   cd website
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_actual_sanity_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2024-03-01
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   The website will be available at [http://localhost:3000](http://localhost:3000).

---

## Schema Overview (`cms/schemaTypes/`)

- **`category`**:
  - `title`: String (required)
  - `slug`: Slug generated from title (required)

- **`product`**:
  - `title`: String (required)
  - `slug`: Slug generated from title (required)
  - `category`: Reference to Category (required)
  - `price`: Number in INR (positive, required)
  - `compare_at_price`: Number in INR (optional; struck-through price)
  - `images`: Array of images with required `alt` text
  - `bullet_points`: Array of strings for key highlights
  - `description`: Text for product description
  - `delivery_estimate`: String (e.g., "3-5 business days")
  - `is_active`: Boolean flag (default: true)
  - `supplier_name`: String (internal reference)
  - `supplier_cost`: Number (internal wholesale cost in INR)

