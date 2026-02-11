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

## Testing Considerations

- Unit tests needed
- Integration test scenarios
- Edge cases to handle

## Notes

Any additional context, references, or considerations.
```

## Naming Convention

Use kebab-case: `plan-FEATURE-NAME.md`

Examples:
- `plan-expenses-tracker.md`
- `plan-data-export.md`
- `plan-retirement-planner.md`

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

1. **Identify Feature**: Pick from ROADMAP.md `[ ]` items
2. **Review UI Guidelines**: Read `UI_GUIDELINES.md` for design standards
3. **Create Plan**: Write detailed plan following this template
4. **Review**: Ensure plan is complete and clear
5. **Implement**: Follow the plan step-by-step
6. **Update ROADMAP**: Check off `[x]` when feature is complete
7. **Archive**: Move plan to `completed/` subdirectory (optional)

## Questions?

Refer to existing plan files in this directory for examples, or update this instructions file if guidelines need clarification.
