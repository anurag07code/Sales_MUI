# SalesFirst - AI-Powered Sales Intelligence Platform

SalesFirst is a modern, comprehensive sales intelligence platform that helps teams transform their sales process with AI-driven insights, automated RFP analysis, contract review, and deal pipeline management.

## 🚀 Features

### Core Modules

- **Brand Analysis** - Deep insights into company profiles, market position, and competitive intelligence with AI-powered analytics
- **RFP Lifecycle** - Streamlined proposals from analysis to generation with intelligent automation
- **Legal Contracts** - AI-powered contract review with instant risk assessment and compliance checks
- **Deals Tracker** - Predictive pipeline management with real-time forecasting and revenue intelligence

### Key Features

- ✨ Modern, responsive UI with smooth animations and hover effects
- 🎨 Beautiful design with vibrant blue accent color (#3B82F6)
- 🌙 Dark mode support
- 📱 Fully responsive across mobile, tablet, and desktop
- ⚡ Fast performance with Vite and React
- 🎯 Interactive data visualizations
- 🔄 Animated background mesh pattern
- 💼 Enterprise-grade features

## 🛠️ Technologies

This project is built with:

- **Vite** - Next-generation frontend tooling
- **React 18** - UI library
- **JavaScript (ESM)** - React with JSX (no TypeScript)
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and state management
- **Lucide React** - Beautiful icon library
- **Sonner** - Toast notifications

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm (or use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Setup Steps

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd Salesfirst

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
Salesfirst/
├── src/
│   ├── components/        # Reusable React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── AnimatedDataMesh.jsx
│   │   ├── TopNavigation.jsx
│   │   └── ...
│   ├── pages/             # Page components
│   │   ├── Index.jsx       # Homepage
│   │   ├── BrandAnalysis.jsx
│   │   ├── RFPLifecycle.jsx
│   │   ├── Contracts.jsx
│   │   └── Deals.jsx
│   ├── hooks/             # Custom React hooks
│   ├── lib/                # Utilities and mock data
│   └── App.jsx             # Main application component
├── public/                 # Static assets
└── package.json
```

## 🎨 Design System

### Color Palette

- **Primary Blue**: `#3B82F6` (HSL: 217 91% 60%)
- **Darker Blue**: `#2563EB` (for gradients)
- **Background**: Pure white `#FFFFFF`
- **Card Background**: Off-white `#FAFAFA`
- **Text**: Dark gray for readability

### Key Design Features

- Modern, clean aesthetic with subtle animations
- Smooth hover effects on all interactive elements
- Professional gradient effects
- Consistent spacing and typography
- Responsive grid layouts

## 🚦 Available Scripts

```sh
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🌐 Deployment

### Vercel (recommended)

This repo includes a `vercel.json`. Push to GitHub and import the repo in Vercel:

1. Go to `https://vercel.com/new`, import your repository
2. Framework preset: Vite
3. Build command: `vite build`
4. Output directory: `dist`

Environment is static (client-side). No server config needed.

### Other hosts

- Netlify: set build to `vite build`, publish `dist/`
- Static hosting: run `npm run build` and upload the `dist/` folder

## 🎯 Key Pages

- **Homepage** (`/`) - Modern landing page with hero section, features, testimonials
- **Brand Analysis** (`/brand-analysis`) - Company profiling and market intelligence
- **RFP Lifecycle** (`/rfp-lifecycle`) - RFP management and proposal generation
- **Contracts** (`/contracts`) - Contract review and risk assessment
- **Deals** (`/deals`) - Pipeline tracking and forecasting

## 💡 Development Tips

- Components are plain React with JSX (no TypeScript)
- Styling uses Tailwind CSS utility classes
- Custom components extend shadcn/ui base components
- Animation patterns use CSS transitions and transforms
- Theme switching is handled via CSS variables

## 📝 Notes

- The project uses a fixed top navigation on the homepage
- Sidebar navigation is used on internal pages
- Background mesh animation is consistent across all pages
- All hover effects use smooth 300ms transitions
- Icons are from Lucide React library

## 🤝 Contributing

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using modern web technologies
