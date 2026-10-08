# GANGA BAVANI Fashion & Fancy - E-Commerce Website

A modern, responsive Indian ethnic fashion and fancy accessories boutique storefront designed for **GANGA BAVANI Fashion and Fancy**.

## ✨ Features

- **Department Coverage**:
  - **Sarees & Pattu**: Pure Kanjivaram Silk, Banarasi Katan Silk, Chanderi Tissue Organza, Gadwal, Mysore Crepe, Mulmul Cotton.
  - **Women's Couture**: Heritage Bridal Lehengas, Flared Anarkali sets, Straight Kurtis with Palazzos, Evening Gowns.
  - **Men's Collection**: Royal Wedding Sherwanis, Pure Silk Dhotis & Angavastrams, Kurta-Pajama with Nehru Jackets, European Linen Shirts.
  - **Kids' Wear**: Girls' Traditional Pattu Pavadai, Boys' Dhoti-Kurta Sets, Sparkle Party Frocks, Indo-Western Sherwanis.
  - **Fancy & Accessories**: Antique Temple Jewellery Choker sets, Handmade Silk Thread Bangles, Zardozi Pearl Potlis, Pure Silk Dupattas, Kundan Maang Tikkas.
- **Direct WhatsApp Ordering**:
  - Direct 1-click WhatsApp inquiry on every item.
  - Full Cart export to WhatsApp with structured product names, sizes, quantities, and total order sum.
- **Dynamic Catalog Engine**:
  - Live search across titles, fabrics, tags, and descriptions.
  - Filter by Category pills, Occasion (Wedding, Festive, Party, Daily), and Sort (Price, Rating, Discounts).
- **Interactive Bag & Wishlist**:
  - Slide-over Cart drawer with real-time subtotal, savings, and quantity management.
  - Wishlist tracking with local storage persistence.
  - Quick-view product modal with sizing options and fabric specifications.
- **Simulated Checkout & Order Receipt**:
  - Delivery address form with UPI / COD / Card selection.
  - Order confirmation receipt with Order ID generator and WhatsApp confirmation sender.

## 🚀 How to Run

### Option 1: Open directly in your browser
Double-click `index.html` or open it with Google Chrome, Edge, or Firefox.

### Option 2: Run with Python HTTP Server
```bash
cd "C:\Users\lokes\.gemini\antigravity\scratch\ganga-bavani-fashion"
python -m http.server 8080
```
Then visit `http://localhost:8080` in your web browser.

## 🛠️ Customization Guide

1. **Update WhatsApp Number & Store Details**:
   - Open `js/app.js` and edit `AppState.storePhone` (e.g. `"919876543210"`).
2. **Add or Modify Products**:
   - Open `js/products.js` and add or edit product objects inside `PRODUCTS_DATA`.
