# Tez Billing

A **fast, minimal, no-login billing app** designed for small shopkeepers and freelancers who need to create invoices quickly.

The app opens directly to an invoice screen where users can add products and instantly **print or download a PDF invoice**. Shop details are saved locally in the browser so the user can open the site every day and start billing immediately.

---

## 🚀 Features

### ⚡ Instant Usage
- No login or signup required
- Open the website and start creating invoices immediately

### 🏪 Persistent Shop Details
Users can enter:
- Shop Logo
- Shop Name
- Shop Address
- Mobile Number

These details are:
- Saved in **browser localStorage**
- Automatically restored on page reload
- Editable anytime by clicking on the fields

### 📦 Quick Product Entry
Each product row includes:
- Product Name
- Quantity
- Price
- Line Total (auto-calculated)

Features:
- Press **Enter** to quickly add a new row
- Delete items easily
- Automatic total calculations

### 🧾 Auto Invoice Number
Invoices automatically generate a unique number:

```
INV-YYYYMMDD-HHMMSS
```

No database or backend required.

### 🖨️ Print Ready
Generate invoices instantly with:
- **Print Invoice**
- **Download PDF**

Invoices are formatted for **A4 printing**.

### ✍️ Signature Area
Invoices include a **signature section** at the bottom right for authorization.

### 💾 Local First
- Shop data stored locally
- No server storage
- Privacy friendly

### 📱 Mobile Friendly
Works on:
- Desktop
- Tablets
- Mobile phones

### 📶 Offline Support (PWA)
The app can be installed as a **Progressive Web App** and works offline after the first load.

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| **Vite** | Fast development and build tool |
| **React** | UI framework |
| **TailwindCSS** | Utility-first styling |
| **html2canvas** | Convert invoice UI to image |
| **jsPDF** | Generate downloadable PDF |
| **localStorage** | Persist shop details |
| **PWA** | Offline support and installable app |

---

## 📂 Project Structure

```
src/
├── components/
│   ├── Invoice.jsx
│   ├── InvoiceHeader.jsx
│   ├── ProductList.jsx
│   ├── ProductRow.jsx
│   ├── Signature.jsx
│   └── Totals.jsx
├── hooks/
│   └── useLocalStorage.js
├── utils/
│   ├── generateInvoiceNumber.js
│   └── imageStorage.js
├── tests/
│   ├── CAL_Totals.test.jsx
│   ├── EXP_Export.test.jsx
│   ├── HD_ShopDetails.test.jsx
│   ├── PR_ProductRow.test.jsx
│   ├── PWA_Offline.test.js
│   ├── RST_Reset.test.jsx
│   ├── UTILS_Helpers.test.js
│   └── setup.js
├── App.jsx
├── main.jsx
└── index.css
public/
└── icon.svg
```

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/qureshiayaz29/instant-invoice-maker.git
```

Navigate to the project:

```bash
cd instant-invoice-maker
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open in browser:

```
http://localhost:5173
```

---

## 🧪 Build for Production

Build the app:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run tests:

```bash
npm test
```

---

## 🌐 Deployment

### GitHub Pages (configured)

This project is set up to auto-deploy to GitHub Pages via GitHub Actions.

**One-time setup:**

1. Push the repo to GitHub
2. Go to **Settings → Pages → Source** and select **GitHub Actions**
3. Push to `main` — the workflow handles the rest

App will be live at:
```
https://qureshiayaz29.github.io/instant-invoice-maker/
```

**Manual deploy** (alternative):
```bash
npm run deploy
```

---

## 🧑‍💼 Intended Users

This tool is designed for:
- Small shopkeepers
- Local retail stores
- Freelancers
- Service providers
- Street vendors
- Anyone with quick billing needs

---

## 🔐 Privacy

This application:
- Stores shop details **only in the user's browser**
- Does **not** send or store any data on a server
- Does **not** track users

---

## 🧩 Future Improvements

Possible enhancements:
- GST / tax calculation support
- Customer name field
- Item search / autocomplete
- Invoice history
- Multi-currency support
- Dark mode
- Multi-language support

---

## ⭐ Why This Project Exists

Most invoice tools are slow, require a login, and are complicated.

This project focuses on **speed**, **simplicity**, and **instant usability**.

> Open the page → add items → print invoice.
> Done in under 30 seconds.
