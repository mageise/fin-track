# Quick Start

## Start the development server

```bash
npm run dev
```

Then open your browser to: **http://localhost:5173**

## ⚠️ IMPORTANT: Do NOT open the HTML file directly!

Opening `index.html` directly in your browser will NOT work because:
- The app uses ES modules that require a server
- Tailwind CSS needs to be processed by Vite
- The paths in the built files are relative to a server root

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests

## What You Should See

When you run `npm run dev` and visit http://localhost:5173, you should see:
- A header "Net Worth Dashboard" 
- 4 summary cards showing Net Worth, Assets, Liabilities, and FIRE Progress
- Two charts (Net Worth Trend line chart and Asset Allocation pie chart)
- Two sections for Assets and Liabilities with "Add Asset" and "Add Liability" buttons
- Forms to enter your financial data
