# FinTrack Roadmap

## Core Tracking

Fundamental financial tracking features that form the foundation of FinTrack.

### Net Worth Dashboard

Track your overall financial health with real-time calculations and visualizations.

- [x] Real-time net worth calculation
- [x] Asset and liability tracking
- [x] Interactive charts

### Budget Planner

Create and manage monthly budgets across different spending categories.

- [x] Budget categories and limits
- [x] Monthly tracking
- [x] Spending analysis

### Investment Portfolio

Manage your investment holdings and monitor potential opportunities.

- [x] Summary Cards
- [x] Holdings Management
- [x] Watchlist

### Savings Goals

Set and track progress toward your financial targets and emergency funds.

- [x] Emergency fund tracking
- [x] Goal progress visualization
- [x] Priority-based organization

## Analysis Tools

Tools for deeper insights into spending, debt, investment performance, and generating reports from tracked data.

### Expenses Tracker

Track and analyze your spending patterns across different categories.

- [ ] Category-based tracking
- [ ] Recurring expense detection
- [ ] Spending insights
    
### Debt Management

Plan and track your debt payoff strategy with calculators and projections.

- [ ] Debt snowball calculator
- [ ] Payoff timeline projections
- [ ] Interest comparison
    
### Performance

Analyze your investment returns and portfolio performance metrics.

- [x] Total gain/loss tracking
- [x] Return percentage calculations
- [x] Best/worst performer identification
- [ ] Historical performance trends
- [ ] Benchmark comparisons

### Reports [FULLY IMPLEMENTED ✓]

Generate comprehensive financial reports and export data for external use.

**Implemented (MVP + Standard Release):**
- [x] Report generation with multiple types (Comprehensive, Net Worth, Investments, Budget, Savings)
- [x] Date range selection (presets and custom)
- [x] Section selection for customized reports
- [x] Report data aggregation (net worth, investments, budget, savings)
- [x] Report viewer modal with detailed data display
- [x] CSV export functionality
- [x] PDF export functionality (using jsPDF)
- [x] Report templates (save, load, delete fully functional)
- [x] Unit tests (16 tests, all passing)

**Deferred to v2:**
- [ ] Email reports (requires external service)

## Planning Tools

Forward-looking calculators and planners for FIRE, retirement, taxes, and portfolio risk assessment.

### FIRE Calculator

Calculate your path to Financial Independence and Early Retirement.

- [x] Net worth goal setting
- [x] Progress tracking
- [x] Projected timeline

### Retirement Planner

Plan your retirement income, withdrawals, and tax optimization strategies.

- [ ] Income projections
- [ ] Withdrawal strategy
- [ ] Tax optimization

### Tax Calculator

Estimate taxes on investments and optimize your tax strategy.

- [ ] Capital gains estimation
- [ ] Tax-efficient withdrawals
- [ ] Year-end planning

### Risk Assessment

Evaluate your portfolio diversification and risk exposure metrics.

- [ ] Portfolio allocation review
- [ ] Diversification scoring
- [ ] Volatility metrics

## Data & Settings

Data management, export functionality, app settings, and auxiliary features.

### Data Export

Export and import your financial data in various formats.

- [ ] JSON format
- [ ] CSV format
- [ ] Import functionality

### Net Worth History

View historical trends and milestones in your net worth over time.

- [ ] Historical data visualization
- [ ] Trend analysis
- [ ] Milestone tracking

### Mini Games

Fun financial education games to improve your financial literacy.

- [x] Tic-Tac-Toe (with 3 difficulty levels: Easy/Medium/Hard)
- [x] Finance Quiz (25+ questions with streak bonuses)
- [x] Breakout (5 levels with brick patterns)
- [x] Memory Match (3 difficulty levels with timer)

### Settings

Configure app preferences including currency, language, and theme.

- [x] Currency selection
- [x] Language selection
- [ ] Theme (light/dark)
- [ ] Data backup

## General

General ideas, brainstorming and future considerations not yet categorized.

### Game Concepts

Here are some fun, implementable game concepts that would fit well with FinTrack:

1. "Stock Picker" Prediction Game
    - Predict whether a stock will go up or down by market close
    - Compete on leaderboards or with friends
    - Uses real market data via your existing Yahoo Finance integration

2. "Budget Tetris" Challenge
    - Given a monthly income, fit various expense categories into it
    - See how much "overflow" or "waste" you create
    - Educational and quick to play

3. Investment Trivia Quiz
    - Multiple choice questions about finance/investing
    - Levels: Beginner → Expert
    - Score tracking and streaks

4. "What If" Simulator
    - "What if I invested $500/month for 30 years?"
    - Visualize compound growth with different scenarios
    - Compare choices (stocks vs bonds vs crypto)

5. Portfolio Challenge
    - Start with fake $100,000
    - Build a portfolio from historical data
    - See how it would have performed over 1/5/10 years

6. Savings Streak
    - Gamify savings goals
    - Daily check-ins, streaks, badges
    - Encourages consistent saving habits

---

**Legend:** [x] = Implemented | [~] = Partially Implemented | [ ] = Planned

**Last updated:** February 2026
