# Plan File Instructions

This directory contains detailed implementation plans for FinTrack features.

## Purpose

Plan files provide structured, detailed specifications for implementing features. They serve as:
- Implementation blueprints for developers
- Reference documents for feature requirements
- Checklists for acceptance criteria

## When to Create a Plan File

Create a plan file when:
- A feature is marked as `[ ]` (Planned) in ROADMAP.md
- You're ready to implement a new feature
- You need to refine requirements before implementation

## Plan File Structure

Each plan file should follow this template:

```markdown
# Feature Name

## Overview
Brief description of what this feature does and why it exists.

## User Story
As a [type of user], I want [goal] so that [benefit].

## Technical Requirements

### Data Models
- Define any new types/interfaces needed
- Specify changes to existing context/state

### API/External Dependencies
- List any external APIs or services
- Note authentication requirements
- Specify rate limits or constraints

### Components Needed
- List React components to create
- Identify reusable components to use

## UI/UX Design

### Layout
- Describe the page/component structure
- Include wireframe descriptions or references

### User Flow
1. Step 1: User action
2. Step 2: System response
3. Step 3: ...

### Visual Design
- Color scheme (refer to existing app patterns)
- Typography
- Responsive behavior

## Implementation Steps

1. **Step 1**: Brief description
   - Details
   - Files to modify/create
   - Expected outcome

2. **Step 2**: Brief description
   - ...

## Dependencies

### Prerequisites
- [ ] Other features that must be completed first
- [ ] External services that must be available
- [ ] Data that must exist

### External Libraries
**When adding external libraries:**
1. Check if already listed in "External Dependencies" section
2. If adding new library not in plan, notify user: "Adding [library] for [purpose]. Size: ~[X]KB. Continue?"
3. Install: `npm install [library]`
4. Document in plan's Notes section

### Related Features
- Links to related plan files or ROADMAP items

## Acceptance Criteria

### Must Have
- [ ] Critical functionality that must work
- [ ] Core user requirements

### Should Have
- [ ] Important but not critical features

### Nice to Have
- [ ] Enhancements for future iterations

## Definition of Done

A feature is considered "Done" when:

### Must Have (Required - MVP Release)
- [ ] All "Must Have" acceptance criteria met
- [ ] Code builds without errors (`npm run build` passes)
- [ ] No console errors or warnings
- [ ] UI follows UI_GUIDELINES.md
- [ ] Manual testing completed in browser
- [ ] **STOP HERE for MVP** - Ask user before continuing to "Should Have"

### Should Have (Strongly Recommended - Standard Release)
- [ ] All "Should Have" acceptance criteria met
- [ ] Basic tests implemented for complex logic only (see Testing Requirements)
- [ ] Edge cases handled
- [ ] Responsive design verified

### Nice to Have (Optional - Polished Release)
- [ ] "Nice to Have" features implemented
- [ ] Comprehensive test coverage
- [ ] Performance optimized

**Rule:** Stop after "Must Have" unless explicitly told to continue.

## UI Compliance

Before implementation, review UI_GUIDELINES.md. All features must follow these standards:

- [ ] Page container uses standard structure (bg-gray-50, max-w-7xl, mx-auto)
- [ ] Header includes back link with theme-colored hover state
- [ ] Theme color is unique (check UI_GUIDELINES.md for taken colors)
- [ ] Summary cards use 4-column responsive grid with icon containers
- [ ] Color pairs follow 100/600 pattern (e.g., bg-blue-100, text-blue-600)
- [ ] All user-facing text is translatable (use t() from useTranslation)
- [ ] Responsive design: 1 col mobile, 2 col tablet, 3+ col desktop
- [ ] Icons from Lucide React with consistent sizes
- [ ] Modals follow size standards (max-w-2xl standard, max-w-3xl complex)
- [ ] Empty states use gray-300 icon with centered layout
- [ ] Loading states use Loader2 with animate-spin

## Testing Requirements

### Minimum Test Coverage (Option B)

**REQUIRED for complex logic:**
- Data transformation functions
- Calculation logic (financial computations, aggregations)
- Utility functions with business logic

**NOT REQUIRED for simple operations:**
- Basic CRUD (add/edit/delete with no logic)
- Pure UI components (buttons, inputs, cards)
- Simple form submissions

### Test Types

1. **Unit Tests** (when logic is complex)
   ```typescript
   // Example: Test report data aggregation
   describe('calculateNetWorthChange', () => {
     it('should calculate percentage change correctly', () => {
       // test code
     })
   })
   ```

2. **Integration Tests** (at least one per feature)
   - Test complete user flow end-to-end
   - Test component with different states

3. **Manual Testing Checklist** (always required)
   - [ ] Feature works in browser (npm run dev)
   - [ ] Responsive design tested (mobile, tablet, desktop)
   - [ ] Empty states display correctly
   - [ ] Error states handled gracefully
   - [ ] Build passes successfully (`npm run build`)

### Document in Notes
If tests are skipped, document in "Notes" section with reason:
```markdown
## Notes
- Tests skipped: Simple CRUD operations, no complex logic to test
```

## Implementation Completion Verification

Before declaring a feature "complete", verify ALL items below:

### Step-by-Step Verification
- [ ] All steps in "Implementation Steps" are completed OR explicitly marked as "deferred"
- [ ] If steps are skipped, document WHY in the "Notes" section
- [ ] Build passes (`npm run build` succeeds with no errors)
- [ ] All "Must Have" acceptance criteria from plan are implemented

### Functionality Verification
- [ ] Feature works end-to-end (happy path tested manually)
- [ ] Edge cases handled (empty states, no data, errors)
- [ ] UI matches design specifications from plan
- [ ] No console errors or warnings

### External Dependencies
- [ ] All libraries listed under "External Dependencies" are installed
- [ ] Library versions documented in Notes if specific version needed
- [ ] User notified about any new dependencies added

### Documentation
- [ ] ROADMAP.md updated (checkboxes marked for completed items)
- [ ] Plan file updated if implementation differed from original plan
- [ ] Complex logic documented with comments

## Milestone Checkpoints

**STOP for user review at these milestones:**

### Checkpoint 1: After Must-Have Implementation
**Trigger:** All "Must Have" acceptance criteria are met
**Action:** Present completion summary to user
**Do NOT proceed to "Should Have" without explicit permission**

### Checkpoint 2: Before Complex Features
**Trigger:** About to implement time-consuming features (PDF generation, charts, external APIs)
**Question to ask:** "The core feature works. Should I continue with [complex feature] or mark as MVP complete?"

### Checkpoint 3: Before Final Review
**Trigger:** Implementation is complete, ready for user testing
**Action:** Present summary, wait for user to test
**Rule:** Never skip this checkpoint!

## Review & Commit Protocol

### ABSOLUTE RULE: Never Commit Without Explicit Permission

**The Workflow:**
1. **Implement** following the plan
2. **Test locally** (`npm run build`, manual browser testing)
3. **Verify completion** (check all items in "Implementation Completion Verification")
4. **Present to user** - See "Completion Summary Template" below
5. **WAIT** - User reviews and tests
6. **Address feedback** - Fix issues if found
7. **Request permission** - Ask "Should I commit and push?"
8. **Only then commit** - After explicit "yes" from user

### Completion Summary Template

When presenting finished work to user, use this format:

```markdown
## Feature Complete: [Feature Name]

### What Was Implemented
- [ ] Core functionality: [describe]
- [ ] UI components: [list]
- [ ] Data flow: [describe]

### What Was Skipped/Deferred
- [ ] [Feature]: Reason - [why deferred]
- [ ] [Feature]: Will be in v2

### Test Results
- Build: ✅ Passed / ❌ Failed
- Manual testing: ✅ Tested / ❌ Not tested
- Browser: Chrome, Firefox, Safari

### Dependencies Added
- [library-name]: [purpose] ([size if known])

### Known Issues/Limitations
- [Issue 1]: [description]
- [Issue 2]: [description]

### Ready for Review?
[ ] Yes - Please test and review
[ ] No - Still working on [X]

**Next step:** Your review → My fixes (if needed) → Commit on your approval
```

### User Review Checklist

User should verify before giving commit approval:
- [ ] Feature works as described in plan
- [ ] Code quality acceptable (clean, readable)
- [ ] No obvious bugs or crashes
- [ ] UI matches expectations
- [ ] Performance acceptable
- [ ] Ready to merge to master

## Handling Scope Decisions

### When to Stop and Ask User

**Stop implementation and ask when:**

1. **Dependencies unavailable** - Required library has issues or is incompatible
2. **Complexity exceeds estimate** - Taking 2x+ longer than planned
3. **Feature creep** - Want to add something not in original plan
4. **Defer vs Implement** - Unsure if "Should Have" is worth it now
5. **Checkpoint reached** - Must-Have is done, Should-Have pending

### How to Ask

Use this template:

```
I'm at [checkpoint]. I've completed:
✅ [Feature X]
✅ [Feature Y]
✅ [Feature Z]

I have a decision to make:

**Option A:** Continue with [complex feature]
- Pros: Full feature set, complete experience
- Cons: Adds ~2-3 hours, requires [library]

**Option B:** Mark as MVP complete, defer [complex feature] to v2
- Pros: Faster delivery, core value delivered now
- Cons: [Feature] not available yet

**Option C:** [Alternative approach]

What would you prefer? I'm happy to go with any option.
```

### Making the Decision

**Default Rule:** If unsure, prefer Option B (MVP complete) unless:
- Feature is core to user experience
- Without it, feature feels incomplete
- User explicitly requested full implementation

## Tips for Writing Good Plans

1. **Be Specific**: Include concrete details, not vague descriptions
2. **Think Step-by-Step**: Break implementation into logical, ordered steps
3. **Consider Edge Cases**: What could go wrong? How should it be handled?
4. **Reference Existing Code**: Point to similar implementations in the codebase
5. **Follow UI Guidelines**: Reference `UI_GUIDELINES.md` for consistent design
6. **Keep It Updated**: Mark items as complete as you implement them
7. **Link to ROADMAP**: Update ROADMAP.md checkbox when plan is complete

## Example Plan File

See `plan-example.md` for a filled-out example (create this as a reference).

## Workflow

### Complete Workflow

1. **Identify Feature**: Pick from ROADMAP.md `[ ]` items
2. **Review UI Guidelines**: Read `UI_GUIDELINES.md` for design standards
3. **Create Plan**: Write detailed plan following this template
4. **Review**: Ensure plan is complete and clear
5. **Implement**: Follow the plan step-by-step
6. **Checkpoint 1**: Stop after "Must Have" - ask user before continuing
7. **Implement**: Continue with "Should Have" if approved (or skip)
8. **Checkpoint 2**: Stop before complex features - ask user
9. **Complete**: Finish all planned features
10. **Checkpoint 3**: Final review - present completion summary
11. **User Review**: User tests and reviews code
12. **Fix**: Address any feedback
13. **Request Permission**: Ask "Should I commit and push?"
14. **Commit**: Only after explicit user approval
15. **Update ROADMAP**: Check off `[x]` when feature is complete
16. **Archive**: Move plan to `completed/` subdirectory (optional)

### Quick Reference

| Stage | Action | User Involvement |
|-------|--------|------------------|
| Planning | Create plan file | Review plan |
| Implementation | Build feature | Checkpoint reviews |
| Completion | Present summary | Test & review |
| Commit | Ask permission | Approve/Reject |
| Done | Push to master | - |

## Questions?

Refer to existing plan files in this directory for examples, or update this instructions file if guidelines need clarification.
