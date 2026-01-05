# Screen Reader Test Plan - Mobile Bottom Navigation

**Story**: 7.7 - Implement Screen Reader Testing  
**Epic**: Epic 7 - Accessibility & WCAG Compliance  
**Test Date**: 2026-01-05  
**Component**: Filament Mobile Bottom Navigation  
**WCAG Standard**: WCAG 2.1 Level AA

---

## Overview

This document provides comprehensive testing procedures for validating the Filament Mobile Bottom Navigation component with screen readers. Screen reader testing is essential to verify that visual users and users with visual impairments have equivalent access to the component.

**Why Screen Reader Testing?**
- Automated accessibility tests (axe-core) can detect technical violations
- Screen reader testing validates the **actual user experience**
- Screen reader behavior varies by platform and version
- Manual testing catches context-specific and usability issues

---

## Test Environment Requirements

### VoiceOver (macOS)
- **OS**: macOS 13 Ventura or later
- **Browser**: Safari 16+ or Chrome 115+
- **VoiceOver**: Built-in accessibility feature
- **Time**: ~90 minutes

### NVDA (Windows)
- **OS**: Windows 10 or later
- **Browser**: Chrome 115+ or Firefox 115+
- **NVDA**: Version 2023.3 or later (free download)
- **Time**: ~90 minutes
- **Download**: https://www.nvaccess.org/download/

### TalkBack (Android)
- **OS**: Android 12 or later
- **Device**: Physical Android device or emulator
- **Browser**: Chrome Mobile
- **TalkBack**: Built-in accessibility feature
- **Time**: ~90 minutes

---

## Part 1: VoiceOver Testing (macOS)

### 1.1 Enable VoiceOver

**Method 1: Keyboard Shortcut**
```
Command (⌘) + F5
```

**Method 2: System Preferences**
1. Apple menu → System Settings
2. Accessibility → VoiceOver
3. Toggle "VoiceOver" on

**Method 3: Siri**
```
"Enable VoiceOver"
```

**Verification**: You should hear a prompt "VoiceOver is on"

### 1.2 VoiceOver Command Reference

| Action | Keys |
|--------|------|
| Next item | VO + Right Arrow |
| Previous item | VO + Left Arrow |
| Activate item | VO + Space |
| Open rotor | VO + U |
| Jump to top of page | VO + Home |
| Read page from current | VO + A |
| Read next page | VO + Page Down |

**Note**: VO = Control + Option

### 1.3 VoiceOver Testing Procedure

#### Test 1: Navigation Landmark Recognition

**Objective**: Verify navigation is announced as a landmark

**Steps**:
```
1. Enable VoiceOver (Cmd + F5)
2. Open browser and navigate to /admin
3. Press VO + U (open rotor)
4. Press Down Arrow until "Landmarks" appears
5. Select "Landmarks"
6. Look for "Mobile bottom navigation" in list
7. Press Enter/Space to jump to it
```

**Expected Announcement**:
```
"Mobile bottom navigation, navigation, landmark"
```

**Pass Criteria**: ✅
- Landmark recognized in rotor
- Announced as "navigation" role
- Labeled as "Mobile bottom navigation"

**Fail Criteria**: ❌
- Not in landmarks list
- Not labeled correctly
- Announced as generic container instead of navigation

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

#### Test 2: List Structure Announcement

**Objective**: Verify list structure is announced correctly

**Steps**:
```
1. With VoiceOver enabled, navigate to mobile navigation
2. Press VO + Right Arrow to enter the navigation
3. Listen to announcement about list
```

**Expected Announcement**:
```
"List, 5 items"
```
*(or actual number of items in your implementation)*

**Pass Criteria**: ✅
- "List" role announced
- Item count announced
- Can enter list with VO + Right Arrow

**Fail Criteria**: ❌
- Announced as "Container" or generic div
- No item count announced
- Can't navigate through list

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

#### Test 3: Item Label Announcements

**Objective**: Verify each navigation item is announced with correct label and role

**Steps**:
```
1. Within the navigation list, press VO + Right Arrow
2. Listen to first item announcement
3. Continue pressing VO + Right Arrow for each item
4. Record what VoiceOver says for each item
```

**Expected Announcements** (example - adjust to your items):
```
Item 1: "Dashboard, link"
Item 2: "Users, link"
Item 3: "Products, link"
Item 4: "Settings, link"
Item 5: "Profile, link"
```

**Pass Criteria**: ✅
- Each item announced with role "link"
- Text label clearly announced
- Consistent announcement format

**Fail Criteria**: ❌
- Items announced as "button" instead of "link"
- Text not announced (no visible label)
- Icons announced instead of labels
- Redundant announcements ("icon, Dashboard, link")

**Results**:

| Item | Expected | Actual | Pass/Fail |
|------|----------|--------|-----------|
| Item 1 | "Dashboard, link" | | ☐ ☐ |
| Item 2 | "Users, link" | | ☐ ☐ |
| Item 3 | "Products, link" | | ☐ ☐ |
| Item 4 | "Settings, link" | | ☐ ☐ |
| Item 5 | "Profile, link" | | ☐ ☐ |

---

#### Test 4: Active Page Indication

**Objective**: Verify active page is announced with "current page" indicator

**Steps**:
```
1. Navigate through list items with VO + Right Arrow
2. When you reach the item for the current page, listen carefully
3. (Or navigate to home page and check first item)
```

**Expected Announcement** (if Dashboard is current page):
```
"Dashboard, link, current page"
```

**Pass Criteria**: ✅
- Active page announced with "current page"
- Clearly distinguishes active item from others
- Helps user know current location

**Fail Criteria**: ❌
- No "current page" announcement
- Can't determine which item is active
- Active page indistinguishable from inactive

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

#### Test 5: Icon Hiding Verification

**Objective**: Verify icons are NOT announced by screen reader (aria-hidden working)

**Steps**:
```
1. Navigate through items with VO + Right Arrow
2. Listen carefully to EVERY announcement
3. Check that ONLY text labels are announced
```

**Expected**: 
```
"Dashboard, link"
(NOT: "Dashboard icon, Dashboard, link")
(NOT: "home icon, Dashboard, link")
```

**Pass Criteria**: ✅
- Icons NOT announced
- ONLY visible text labels announced
- No redundant icon descriptions
- aria-hidden="true" working

**Fail Criteria**: ❌
- Icon announced before label
- Both icon and label announced
- Icon description in announcement
- Icons stealing focus from labels

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

#### Test 6: Link Activation

**Objective**: Verify links can be activated with VoiceOver commands

**Steps**:
```
1. Navigate to any navigation item
2. Press VO + Space (activate)
3. Verify navigation occurs
4. Listen to new page announcement
```

**Expected Behavior**:
```
- VO + Space presses the link
- Page navigates to new URL
- New page content announced
```

**Pass Criteria**: ✅
- VO + Space activates link
- Navigation successful
- Page changes as expected

**Fail Criteria**: ❌
- VO + Space doesn't activate
- Navigation doesn't occur
- Page doesn't load

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

#### Test 7: Keyboard Navigation (Tab Order)

**Objective**: Verify tab order is logical and navigation items are reachable

**Steps**:
```
1. Disable VoiceOver for this test (Cmd + F5)
2. Press Tab repeatedly to navigate page
3. Count how many tabs to reach first navigation item
4. Tab through each navigation item
5. Verify logical order (left to right)
```

**Expected Behavior**:
```
- Navigation items reachable with Tab key
- Items in correct visual order (left to right)
- Focus visible on each item
```

**Pass Criteria**: ✅
- All items reachable with Tab
- Focus visible and clear
- Logical tab order

**Fail Criteria**: ❌
- Items not reachable with Tab
- Tab order confusing
- Focus not visible

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

### 1.4 VoiceOver Test Summary

**Total Tests**: 7  
**Passed**: ____ / 7  
**Failed**: ____ / 7

### 1.5 VoiceOver Issues Found

Document any issues discovered during testing:

**Issue #1**:
- **Description**: 
- **Expected**: 
- **Actual**: 
- **Impact**: Critical ☐ | Serious ☐ | Minor ☐
- **Fix**: 

**Issue #2**:
- **Description**: 
- **Expected**: 
- **Actual**: 
- **Impact**: Critical ☐ | Serious ☐ | Minor ☐
- **Fix**: 

---

## Part 2: NVDA Testing (Windows)

### 2.1 Download and Install NVDA

1. Visit https://www.nvaccess.org/download/
2. Download latest stable version (2023.3+)
3. Run installer
4. Follow installation prompts
5. Launch NVDA
6. Accept user guide when prompted

### 2.2 NVDA Command Reference

| Action | Keys |
|--------|------|
| Next item | Down Arrow |
| Previous item | Up Arrow |
| Activate/Click | Enter |
| Elements list | Insert + F7 |
| NVDA menu | Insert + N |
| Read current | Insert + Down Arrow |
| Read from current | Insert + Shift + Down Arrow |

**Note**: Insert key = Caps Lock (when configured as NVDA key)

### 2.3 NVDA Testing Procedure

#### Test 1: Navigation Region Recognition

**Objective**: Verify navigation region announced correctly

**Steps**:
```
1. Launch NVDA
2. Open browser and navigate to /admin
3. Press Insert + F7 (Elements List)
4. Select "Landmarks" tab if available
5. Look for navigation region
```

**Expected Announcement**:
```
"Navigation region, Mobile bottom navigation"
```

**Pass Criteria**: ✅
- Navigation region recognized
- Labeled correctly
- Reachable in elements list

**Fail Criteria**: ❌
- Not listed as landmark
- Incorrect label
- Not recognized as navigation

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

#### Test 2: List Structure Announcement

**Objective**: Verify list structure announced correctly

**Steps**:
```
1. With NVDA running, navigate to mobile navigation
2. Press Down Arrow to enter list
3. Listen to list announcement
```

**Expected Announcement**:
```
"List with 5 items"
```
*(or actual item count)*

**Pass Criteria**: ✅
- "List" announced
- Item count announced
- Can navigate with Down Arrow

**Fail Criteria**: ❌
- Not announced as list
- No item count
- Can't navigate items

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

#### Test 3: Item Label Announcements

**Objective**: Verify each item announced with label and role

**Steps**:
```
1. Within list, press Down Arrow for each item
2. Record what NVDA announces
3. Continue through all items
```

**Expected Announcements** (example):
```
Item 1: "Dashboard, link"
Item 2: "Users, link"
Item 3: "Products, link"
Item 4: "Settings, link"
Item 5: "Profile, link"
```

**Pass Criteria**: ✅
- Role "link" announced
- Visible text label announced
- Consistent format

**Fail Criteria**: ❌
- Role not announced
- Text label missing
- Icons announced redundantly

**Results**:

| Item | Expected | Actual | Pass/Fail |
|------|----------|--------|-----------|
| Item 1 | "Dashboard, link" | | ☐ ☐ |
| Item 2 | "Users, link" | | ☐ ☐ |
| Item 3 | "Products, link" | | ☐ ☐ |
| Item 4 | "Settings, link" | | ☐ ☐ |
| Item 5 | "Profile, link" | | ☐ ☐ |

---

#### Test 4: Active Page Indication

**Objective**: Verify active page announced with "current page"

**Steps**:
```
1. Navigate through items with Down Arrow
2. When reaching current page item, listen carefully
3. (Or navigate to home and check first item)
```

**Expected Announcement** (if Dashboard is current):
```
"Dashboard, link, current page"
```

**Pass Criteria**: ✅
- "Current page" announced for active item
- Helps user locate current position
- Distinguishes from inactive items

**Fail Criteria**: ❌
- No "current page" announcement
- Can't tell which item is active
- Active indistinguishable from inactive

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

#### Test 5: Icon Hiding Verification

**Objective**: Verify icons NOT announced

**Steps**:
```
1. Navigate through items with Down Arrow
2. Listen to every announcement
3. Verify ONLY text labels announced
```

**Expected**:
```
"Dashboard, link"
(NOT: "icon, Dashboard, link")
```

**Pass Criteria**: ✅
- Icons NOT announced
- Only text labels announced
- No redundancy

**Fail Criteria**: ❌
- Icons announced
- Redundant announcements
- Confusing information

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

#### Test 6: Link Activation

**Objective**: Verify links activatable with Enter key

**Steps**:
```
1. Navigate to navigation item
2. Press Enter to activate
3. Verify navigation occurs
4. Listen to new page announcement
```

**Expected Behavior**:
```
- Enter key activates link
- Page navigates
- New content announced
```

**Pass Criteria**: ✅
- Enter activates link
- Navigation successful
- Page loads correctly

**Fail Criteria**: ❌
- Enter doesn't work
- Navigation doesn't occur
- Page doesn't load

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

#### Test 7: Tab Navigation

**Objective**: Verify tab order is logical

**Steps**:
```
1. Press Tab repeatedly to navigate
2. Count tabs to first nav item
3. Tab through each item
4. Verify left-to-right order
```

**Expected Behavior**:
```
- Items reachable with Tab
- Focus visible
- Logical order
```

**Pass Criteria**: ✅
- All items reachable
- Clear focus
- Correct order

**Fail Criteria**: ❌
- Items skipped
- Focus not visible
- Wrong order

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

### 2.4 NVDA Test Summary

**Total Tests**: 7  
**Passed**: ____ / 7  
**Failed**: ____ / 7

### 2.5 NVDA Issues Found

**Issue #1**:
- **Description**: 
- **Expected**: 
- **Actual**: 
- **Impact**: Critical ☐ | Serious ☐ | Minor ☐
- **Fix**: 

**Issue #2**:
- **Description**: 
- **Expected**: 
- **Actual**: 
- **Impact**: Critical ☐ | Serious ☐ | Minor ☐
- **Fix**: 

---

## Part 3: TalkBack Testing (Android)

### 3.1 Enable TalkBack

**Method 1: Quick Enable (if volume keys configured)**
```
Press both volume keys for 3 seconds
```

**Method 2: Settings**
1. Open Settings
2. Go to Accessibility → TalkBack
3. Toggle TalkBack On
4. Confirm activation

### 3.2 TalkBack Gesture Reference

| Action | Gesture |
|--------|---------|
| Next item | Swipe right |
| Previous item | Swipe left |
| Activate/Click | Double tap |
| Read from current | Swipe down then right |
| Go to first item | Swipe up then down |
| Pause/Resume | Swipe down |
| Stop speech | Swipe down then left |

### 3.3 TalkBack Testing Procedure

#### Test 1: Navigation Landmark Announcement

**Objective**: Verify navigation landmark announced

**Steps**:
```
1. Enable TalkBack
2. Open browser and navigate to /admin
3. Swipe right repeatedly to find navigation
4. Listen to announcement
```

**Expected Announcement**:
```
"Mobile bottom navigation, navigation"
```

**Pass Criteria**: ✅
- Navigation landmark recognized
- Announced correctly
- Reachable by swiping

**Fail Criteria**: ❌
- Not announced as landmark
- Incorrect label
- Not reachable

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

#### Test 2: List Structure Announcement

**Objective**: Verify list structure announced

**Steps**:
```
1. With TalkBack on, navigate to navigation
2. Swipe right to enter list
3. Listen to list announcement
```

**Expected Announcement**:
```
"List, 5 items"
```
*(or actual item count)*

**Pass Criteria**: ✅
- "List" announced
- Item count announced
- Can navigate through items

**Fail Criteria**: ❌
- Not announced as list
- No item count
- Can't navigate

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

#### Test 3: Item Label Announcements

**Objective**: Verify each item announced with label and role

**Steps**:
```
1. Within list, swipe right for each item
2. Record announcements
3. Continue through all items
```

**Expected Announcements** (example):
```
Item 1: "Dashboard, link"
Item 2: "Users, link"
Item 3: "Products, link"
Item 4: "Settings, link"
Item 5: "Profile, link"
```

**Pass Criteria**: ✅
- Role "link" announced
- Visible text announced
- Consistent format

**Fail Criteria**: ❌
- Role not announced
- Text missing
- Icons announced

**Results**:

| Item | Expected | Actual | Pass/Fail |
|------|----------|--------|-----------|
| Item 1 | "Dashboard, link" | | ☐ ☐ |
| Item 2 | "Users, link" | | ☐ ☐ |
| Item 3 | "Products, link" | | ☐ ☐ |
| Item 4 | "Settings, link" | | ☐ ☐ |
| Item 5 | "Profile, link" | | ☐ ☐ |

---

#### Test 4: Active Page Indication

**Objective**: Verify active page indicated

**Steps**:
```
1. Swipe right through items
2. Find item for current page
3. Listen for active indicator
```

**Expected Announcement** (if Dashboard is current):
```
"Dashboard, link, current page"
```

**Pass Criteria**: ✅
- Active page indicated
- "Current page" announced
- Clear distinction from inactive

**Fail Criteria**: ❌
- No indicator of active item
- Can't determine current page
- Confusing announcements

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

#### Test 5: Icon Hiding Verification

**Objective**: Verify icons NOT announced

**Steps**:
```
1. Swipe right through items
2. Listen to announcements
3. Verify ONLY text announced
```

**Expected**:
```
"Dashboard, link"
(NOT: "icon, Dashboard")
```

**Pass Criteria**: ✅
- Icons NOT announced
- Only text announced
- Clean announcements

**Fail Criteria**: ❌
- Icons announced
- Redundant information
- Confusing

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

#### Test 6: Link Activation

**Objective**: Verify links activatable with double tap

**Steps**:
```
1. Navigate to navigation item (swipe right)
2. Double tap to activate
3. Verify navigation occurs
4. Listen to new page announcement
```

**Expected Behavior**:
```
- Double tap activates link
- Page navigates
- New content announced
```

**Pass Criteria**: ✅
- Double tap works
- Navigation successful
- Page loads

**Fail Criteria**: ❌
- Double tap doesn't work
- Navigation fails
- Page doesn't load

**Result**: ☐ Pass ☐ Fail | Notes: _________________

---

### 3.4 TalkBack Test Summary

**Total Tests**: 6  
**Passed**: ____ / 6  
**Failed**: ____ / 6

### 3.5 TalkBack Issues Found

**Issue #1**:
- **Description**: 
- **Expected**: 
- **Actual**: 
- **Impact**: Critical ☐ | Serious ☐ | Minor ☐
- **Fix**: 

**Issue #2**:
- **Description**: 
- **Expected**: 
- **Actual**: 
- **Impact**: Critical ☐ | Serious ☐ | Minor ☐
- **Fix**: 

---

## Part 4: Test Summary & Recommendations

### 4.1 Overall Results

| Screen Reader | Tests Passed | Tests Failed | Critical Issues | Status |
|---------------|-------------|--------------|-----------------|--------|
| VoiceOver | ___ / 7 | ___ / 7 | ___ | ☐ Pass ☐ Fail |
| NVDA | ___ / 7 | ___ / 7 | ___ | ☐ Pass ☐ Fail |
| TalkBack | ___ / 6 | ___ / 6 | ___ | ☐ Pass ☐ Fail |
| **TOTAL** | **___ / 20** | **___ / 20** | **___** | **☐ Pass ☐ Fail** |

### 4.2 Critical Issues Summary

**Critical Issues** (Must fix before release):
1. 
2. 
3. 

**Serious Issues** (Should fix):
1. 
2. 

**Minor Issues** (Nice to fix):
1. 
2. 

### 4.3 Recommendations

**For Developers**:
1. Focus on fixes for critical issues first
2. Re-test after each fix
3. Document all changes
4. Consider screen reader users in future changes

**For Users**:
1. Test with your actual screen reader
2. Provide feedback if issues found
3. Report problems to project team

**For Project**:
1. Include screen reader testing in QA process
2. Test with real users who use screen readers
3. Document findings in accessibility guide
4. Update documentation as needed

---

## Part 5: Sign-Off

### Tester Information

**Tester Name**: _____________________  
**Date Tested**: _____________________  
**Screen Readers Tested**: ☐ VoiceOver ☐ NVDA ☐ TalkBack

### Test Conditions

**Environment**:
- macOS Version: ___________
- Windows Version: ___________
- Android Version: ___________
- Browser(s): ___________

**Component Version**: _____________________  
**Build Date**: _____________________

### Approval

**All Tests Passed**: ☐ Yes ☐ No

**Ready for Release**: ☐ Yes ☐ No

**Reviewer Name**: _____________________  
**Reviewer Signature**: _____________________ Date: _____

**Notes**:
```
[Any additional notes or comments]
```

---

## Appendix: Component Implementation Details

### Current HTML Structure

```blade
<nav 
    class="fmbn-nav" 
    role="navigation"
    aria-label="Mobile bottom navigation"
>
    <ul class="fmbn-nav__list" role="list">
        @foreach($items as $item)
            <li class="fmbn-nav__item">
                <a 
                    href="{{ $item['url'] }}"
                    @if($item['active'])
                        aria-current="page"
                    @endif
                    class="fmbn-nav__link"
                >
                    @if($item['icon'])
                        <span class="fmbn-nav__icon" aria-hidden="true">
                            @svg($item['icon'])
                        </span>
                    @endif
                    <span class="fmbn-nav__label">
                        {{ $item['label'] }}
                    </span>
                </a>
            </li>
        @endforeach
    </ul>
</nav>
```

### ARIA Attributes Used

- `role="navigation"` - Landmark role
- `aria-label="Mobile bottom navigation"` - Landmark label
- `aria-current="page"` - Active page indicator
- `aria-hidden="true"` - Icon hiding
- `role="list"` - List structure (backup)

### CSS Classes for Styling

- `.fmbn-nav` - Navigation container
- `.fmbn-nav__list` - List container
- `.fmbn-nav__item` - List item
- `.fmbn-nav__link` - Link element
- `.fmbn-nav__icon` - Icon container (hidden from SR)
- `.fmbn-nav__label` - Text label (announced)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-05  
**Status**: Ready for Testing
