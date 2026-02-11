# Reports

## Overview

The Reports feature allows users to generate, view, and export comprehensive financial reports. Users can create monthly or yearly summaries of their net worth, investments, budget adherence, and savings progress. Reports can be exported in PDF or CSV format and optionally emailed for record-keeping.

## User Story

As a FinTrack user, I want to generate and export financial reports so that I can track my financial progress over time, share information with advisors, and maintain records for tax or planning purposes.

## Technical Requirements

### Data Models

```typescript
// Add to types/financial.ts

export interface Report {
  id: string
  type: ReportType
  title: string
  dateRange: {
    start: string // ISO date
    end: string // ISO date
  }
  generatedAt: string
  data: ReportData
  format: 'pdf' | 'csv'
}

export type ReportType = 
  | 'net-worth-summary'
  | 'investment-performance'
  | 'budget-analysis'
  | 'savings-progress'
  | 'comprehensive'

export interface ReportData {
  netWorth?: {
    startAmount: number
    endAmount: number
    change: number
    changePercent: number
    history: NetWorthHistoryPoint[]
  }
  investments?: {
    totalValue: number
    totalGain: number
    totalReturn: number
    topPerformers: InvestmentPerformance[]
    worstPerformers: InvestmentPerformance[]
    allocationByType: AllocationItem[]
    allocationByAccount: AllocationItem[]
  }
  budget?: {
    totalBudget: number
    totalSpent: number
    totalRemaining: number
    adherencePercent: number
    categoryBreakdown: BudgetCategorySummary[]
    overspentCategories: string[]
  }
  savings?: {
    totalSaved: number
    totalTarget: number
    progressPercent: number
    completedGoals: number
    activeGoals: number
    goalsProgress: SavingsGoalProgress[]
  }
}

export interface ReportTemplate {
  id: string
  name: string
  type: ReportType
  defaultDateRange: 'current-month' | 'current-year' | 'last-30-days' | 'last-90-days' | 'ytd' | 'custom'
  includedSections: ReportSection[]
}

type ReportSection = 'net-worth' | 'investments' | 'budget' | 'savings' | 'summary'
```

### Context Updates

Add to FinancialContext:
- `reports: Report[]` - Store generated reports
- `reportTemplates: ReportTemplate[]` - User-defined templates
- Actions: `generateReport`, `deleteReport`, `createTemplate`, `deleteTemplate`

### External Dependencies

- **PDF Generation**: jsPDF or @react-pdf/renderer for PDF export
- **CSV Export**: Native JavaScript (no external lib needed)
- **Email Service**: Optional - could use emailjs or backend service
- **Chart Export**: html2canvas for capturing chart images for PDF

### Components Needed

1. **ReportsPage** - Main reports page
2. **ReportList** - List of generated reports
3. **ReportGenerator** - Form to create new reports
4. **ReportViewer** - View report details (modal or page)
5. **ReportTemplateManager** - Create/manage templates
6. **DateRangePicker** - Select report date range
7. **ExportButton** - Export actions (PDF, CSV, Email)
8. **ReportPreview** - Live preview before generating

## UI/UX Design

### Layout

```
┌─────────────────────────────────────────────┐
│  ← Back to Toolbox    Reports              │
├─────────────────────────────────────────────┤
│  Summary Cards (4):                         │
│  [Reports Gen] [Last Report] [PDF Exp] [CSV]│
├─────────────────────────────────────────────┤
│  Generate New Report                        │
│  ┌──────────────────────────────────────┐  │
│  │ Report Type: [Comprehensive ▼]       │  │
│  │                                        │  │
│  │ Date Range: [Last 30 Days ▼]         │  │
│  │          or Custom: [start] to [end] │  │
│  │                                        │  │
│  │ [x] Net Worth    [x] Investments    │  │
│  │ [x] Budget       [x] Savings        │  │
│  │                                        │  │
│  │ [Generate Report]                     │  │
│  └──────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  Recent Reports                            │
│  ┌──────────────────────────────────────┐  │
│  │ 📄 Comprehensive Report - Feb 2025  │  │
│  │    Generated: Feb 11, 2025          │  │
│  │    [View] [PDF] [CSV] [Delete]      │  │
│  └──────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  Report Templates                          │
│  ┌──────────────────────────────────────┐  │
│  │ 📋 Monthly Net Worth Summary         │  │
│  │ 📋 Quarterly Investment Review       │  │
│  │ [+ Create Template]                  │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### User Flow

1. **Generate Report**: Click "Generate New Report" → Select type → Choose date range → Select sections → Generate
2. **View Report**: Click on report in list → View full report with charts and data
3. **Export Report**: Click PDF/CSV button → Download file
4. **Email Report**: Click Email button → Enter recipient → Send
5. **Create Template**: Click "Create Template" → Configure default settings → Save
6. **Use Template**: Select template → Auto-fills settings → Generate

### Visual Design

- **Theme Color**: Indigo (not yet used by other tools)
- **Icons**: FileText for reports, Download for export, Mail for email, Plus for create
- **Report Cards**: Show generation date, type icon, quick actions
- **Date Display**: Human-readable (e.g., "February 2025", "Last 30 Days")
- **Preview Panel**: Live preview updates as user changes options

## Implementation Steps

### Step 1: Update Types and Context

**Files to modify:**
- `src/types/financial.ts` - Add Report, ReportType, ReportData interfaces
- `src/contexts/FinancialContext.tsx` - Add reports state and actions

**Details:**
- Add Report interface with all fields
- Add ReportType and ReportData types
- Add report-related actions to reducer
- Initialize empty reports array in defaultState

**Expected outcome:** Type system supports report functionality

### Step 2: Create Reports Page Structure

**Files to create:**
- `src/pages/Reports.tsx` - Main page component

**Details:**
- Follow standard page structure (bg-gray-50, max-w-7xl)
- Add to App.tsx routes at `/reports`
- Include header with back link and indigo theme
- Create 4 summary cards (total reports, last generated, PDF exports, CSV exports)

**Expected outcome:** Page renders with basic layout

### Step 3: Create Report Generator Form

**Components:**
- Report type dropdown (Comprehensive, Net Worth, Investments, Budget, Savings)
- Date range selector (presets + custom date picker)
- Section checkboxes (which data to include)
- Generate button

**Details:**
- Use existing Select/Input components
- DateRangePicker component for custom ranges
- Validation: Ensure at least one section selected
- Show preview summary before generating

**Expected outcome:** Users can configure report settings

### Step 4: Implement Report Data Aggregation

**Logic:**
- Calculate net worth change over period
- Aggregate investment performance
- Summarize budget adherence
- Compile savings progress
- Format data for display

**Details:**
- Filter data by date range
- Calculate percentages and changes
- Identify top/worst performers
- Handle missing data gracefully

**Expected outcome:** Report data is calculated correctly

### Step 5: Create Report Viewer

**Components:**
- Report header (title, date range, generation date)
- Net Worth section with mini chart
- Investments section with allocation pie chart
- Budget section with adherence bar
- Savings section with progress bars
- Export actions bar

**Details:**
- Use Card components for sections
- Display charts using Recharts
- Show percentages, changes, trends
- Responsive layout

**Expected outcome:** Reports display beautifully with all data

### Step 6: Implement CSV Export

**Function:**
- Convert report data to CSV format
- Handle nested data (flatten or create multiple sheets)
- Add headers and proper formatting
- Trigger browser download

**Details:**
- Net Worth CSV: Date, Assets, Liabilities, Net Worth
- Investments CSV: Symbol, Shares, Cost, Value, Gain
- Budget CSV: Category, Budget, Spent, Remaining
- Comprehensive: Multiple sheets or combined

**Expected outcome:** Users can download CSV files

### Step 7: Implement PDF Export

**Integration:**
- Use @react-pdf/renderer or jsPDF
- Style PDF to match app branding
- Include charts as images (use html2canvas)
- Multi-page support for long reports

**Details:**
- Create PDF template components
- Generate chart images
- Format tables and text
- Add page numbers and headers

**Expected outcome:** Professional PDF reports generated

### Step 8: Create Report List and Templates

**Components:**
- ReportList - Display generated reports with actions
- ReportTemplateManager - Create and manage templates

**Details:**
- Show report metadata (type, date, sections)
- Quick actions: View, PDF, CSV, Delete
- Template creation form
- Template selection shortcuts

**Expected outcome:** Users can manage reports and templates

### Step 9: Add Email Functionality (Optional)

**Integration:**
- Email input field
- Use emailjs or backend service
- Attach PDF/CSV
- Show success/error messages

**Details:**
- Simple email form modal
- Validation for email format
- Loading state during send
- Confirmation message

**Expected outcome:** Reports can be emailed

### Step 10: Polish and Testing

**Tasks:**
- Add loading states during generation
- Handle empty data scenarios
- Add confirmation dialogs for delete
- Test all date ranges
- Verify exports work correctly
- Add translations

**Expected outcome:** Production-ready feature

## UI Compliance

This feature must follow FinTrack UI guidelines:

- [ ] **Theme Color**: Indigo (unique, not used by other tools)
- [ ] **Page Structure**: Standard container (bg-gray-50, max-w-7xl, mx-auto)
- [ ] **Header**: Back link with indigo hover, FileText icon, "Reports" title
- [ ] **Summary Cards**: 4-column grid (Total Reports, Last Generated, PDF Exports, CSV Exports)
- [ ] **Color Pairs**: Use indigo-100/bg with indigo-600/text
- [ ] **Translation**: All labels and buttons translatable (t() hook)
- [ ] **Responsive**: 1 col mobile, 2 col tablet, 3+ col desktop
- [ ] **Icons**: Lucide React (FileText, Download, Mail, Plus, Trash2, Eye)
- [ ] **Modals**: max-w-2xl for email, max-w-3xl for preview
- [ ] **Empty States**: FileText icon in gray-300 when no reports
- [ ] **Loading**: Loader2 with animate-spin during generation
- [ ] **Action Buttons**: Generate (indigo), Export (blue), Delete (red hover)

## Dependencies

### Prerequisites
- [x] Net Worth Dashboard (data source)
- [x] Investment Portfolio (data source)
- [x] Budget Planner (data source)
- [x] Savings Goals (data source)
- [x] FinancialContext (for data access)

### External Libraries
- [ ] @react-pdf/renderer OR jsPDF (PDF generation)
- [ ] html2canvas (chart to image for PDF)
- [ ] emailjs-com OR backend email service (optional)

### Related Features
- All data features provide input for reports
- Performance analytics provides investment insights

## Acceptance Criteria

### Must Have
- [ ] Users can generate comprehensive financial reports
- [ ] Users can select date ranges (presets and custom)
- [ ] Users can choose which sections to include
- [ ] Reports display net worth, investments, budget, and savings data
- [ ] Users can export reports as CSV
- [ ] Users can export reports as PDF
- [ ] Generated reports are saved and can be viewed later
- [ ] Users can delete generated reports
- [ ] Reports persist in localStorage

### Should Have
- [ ] Report templates for quick generation
- [ ] Email reports to specified address
- [ ] Report preview before generating
- [ ] Monthly and yearly summary options
- [ ] Comparison with previous periods

### Nice to Have
- [ ] Scheduled automatic reports
- [ ] Multiple currency support in reports
- [ ] Custom branding/logo on PDFs
- [ ] Report sharing via link
- [ ] Print-optimized styling

## Testing Considerations

### Unit Tests
- Report data aggregation logic
- CSV export formatting
- Date range filtering
- Template saving/loading

### Integration Tests
- Generate report flow
- Export to PDF flow
- Export to CSV flow
- Email report flow

### Edge Cases
- [ ] No data in selected date range
- [ ] Very large date ranges (multiple years)
- [ ] Single day report
- [ ] Future date range
- [ ] Export with special characters in data
- [ ] PDF generation with many charts
- [ ] Email without configured service

## Notes

- Consider PDF generation performance for large datasets
- PDF charts may need static rendering (not interactive)
- Email feature can be optional MVP, add later
- Consider adding report scheduling in future
- Theme color: indigo (not used by existing tools)
- Icons: FileText, Download, Mail, Plus, Calendar, Filter
- Reference similar implementations: Savings page for card patterns, Performance page for charts

## References

- Card patterns: `src/pages/Savings.tsx`
- Chart implementations: `src/pages/Performance.tsx`
- Date handling: `src/pages/InvestmentPortfolio.tsx`
- Export logic patterns: Research jsPDF and @react-pdf/renderer docs
- Modal patterns: `src/components/InvestmentForm.tsx`
