# basketball-saas-marketing Specification

## Purpose

TBD - created by archiving change update-web-basketball-saas. Update Purpose after archive.

## Requirements

### Requirement: Marketing Website Content

The marketing website at `apps/web/` MUST provide accurate, engaging content about the basketball video SaaS platform. The website SHALL accurately represent the product's purpose of creating AI-generated basketball highlights for content creators.

#### Scenario: User visits home page

**Given** a user navigates to the website root
**When** the home page loads
**Then** they should see:

- A hero section with basketball-focused branding
- A headline mentioning basketball highlights or video creation
- A side-by-side video comparison showing original footage vs. AI-generated highlights
- At least 3 feature highlights related to the SaaS product
- Call-to-action buttons encouraging trial or demo
- No references to "React Starter Kit" or developer tooling

#### Scenario: User visits features page

**Given** a user navigates to the features page
**When** the page loads
**Then** they should see:

- Feature categories relevant to video content creation (AI/automation, exports, creator tools)
- Detailed descriptions of highlight generation capabilities
- Use case examples for different creator types (YouTubers, TikTok creators, sports media)
- No code examples or developer-focused content
- Technical details focused on video quality, formats, and processing speed

#### Scenario: User visits about page

**Given** a user navigates to the about page
**When** the page loads
**Then** they should see:

- Mission statement focused on helping content creators
- Problem statement about manual highlight editing being time-consuming
- Solution description of AI-powered automated highlights
- No focus on developer tools or infrastructure
- Clear value proposition for content creators

#### Scenario: User visits pricing page

**Given** a user navigates to the pricing page
**When** the page loads
**Then** they should see:

- At least 2 pricing tiers (Free/Starter and Paid/Pro)
- Feature comparison between tiers
- Pricing information relevant to content creators (exports, storage limits, video length limits)
- FAQ section addressing common questions

---

### Requirement: Video Comparison Showcase

The home page MUST include a visual demonstration of the product's core capability: converting full basketball game footage into highlight reels. The video comparison SHALL clearly show the difference between original footage and AI-generated highlights.

#### Scenario: User views video comparison

**Given** a user is on the home page
**When** the hero section loads
**Then** they should see:

- Two video players displayed side-by-side on desktop (or stacked on mobile)
- Left player labeled "Original Footage" or similar
- Right player labeled "AI Highlights" or similar
- Both players functional with play/pause controls
- Videos showing basketball game content
- Clear visual distinction between the two (original is longer/slower, highlights are concise/dynamic)

#### Scenario: Mobile user views video comparison

**Given** a user accesses the home page on a mobile device
**When** the hero section loads
**Then** they should see:

- Video players stacked vertically (not side-by-side)
- Both players still functional
- Responsive layout that adapts to screen size
- No horizontal scrolling required

---

### Requirement: Content Creator Focus

All website content MUST speak to media and content creators as the target audience. The messaging SHALL emphasize time savings, ease of use, and social media optimization for creators.

#### Scenario: Website messaging alignment

**Given** any page on the website
**When** a user reads the content
**Then** they should see:

- Language addressing creators (YouTubers, TikTokers, sports media)
- Emphasis on time savings and ease of use
- References to social media platforms (YouTube, TikTok, Instagram)
- Export formats relevant to content creation (MP4, social-optimized)
- No developer-focused jargon (unless in a technical footer)

#### Scenario: Use case examples

**Given** a user viewing the features page
**When** they reach the use case sections
**Then** they should see:

- At least 3 different creator types mentioned
- Specific benefits for each creator type
- Examples of how each uses the product
- Relatable scenarios (e.g., "Create daily basketball highlights for your YouTube channel")

---

### Requirement: Clear Value Proposition

The website MUST clearly communicate what the product does and why it's valuable. The value proposition SHALL be immediately understandable within 5 seconds of viewing any page.

#### Scenario: User understands product within 5 seconds

**Given** a user lands on any page
**When** they view the first screen of content
**Then** they should be able to answer:

- What does this product do? (AI-generated basketball highlights)
- Who is it for? (Content creators)
- What's the main benefit? (Save time editing footage)

#### Scenario: User sees proof points

**Given** a user exploring the website
**When** they read through features and benefits
**Then** they should see:

- Quantifiable claims where possible (e.g., "Turn 48 minutes into 3 minutes")
- Feature benefits, not just features
- Clear advantages over manual editing
- Social proof elements if available (testimonials, usage stats)

---

### Requirement: Conversion-Focused Design

The website MUST guide users toward sign-up, trial, or demo actions. The design SHALL include clear call-to-action buttons and a logical user journey from awareness to consideration to action.

#### Scenario: Clear call-to-action buttons

**Given** a user viewing any page
**When** they look for next steps
**Then** they should see:

- At least one CTA button per page
- Clear, action-oriented button text (e.g., "Try Free", "Start Creating", "Watch Demo")
- Buttons placed prominently in hero and bottom sections
- Consistent CTA strategy across pages

#### Scenario: Logical user journey

**Given** a user exploring the website
**When** they navigate between pages
**Then** they should experience:

- Clear navigation between pages
- Progressive disclosure of information (high-level → detailed)
- Pricing information available before sign-up prompts
- No dead ends or confusing navigation

---

### Requirement: Technical Accuracy

While marketing-focused, the website MUST accurately reflect the product's capabilities without making unrealistic claims. All technical details SHALL be consistent with the actual implementation and SHALL avoid overpromising AI capabilities.

#### Scenario: Feature claims are realistic

**Given** a feature claim on the website
**When** a user reads about capabilities
**Then** the claim should:

- Be achievable with the planned v1 product
- Not overpromise AI capabilities
- Accurately describe the value proposition
- Have basis in actual technical implementation

#### Scenario: Technical details are appropriate

**Given** a user viewing technical sections
**When** they read about processing or exports
**Then** the information should:

- Match the actual tech stack capabilities
- Reference relevant technologies (video formats, processing quality)
- Avoid unnecessary technical jargon for marketing pages
- Be consistent across all pages

---

### Requirement: SEO and Accessibility

The website MUST follow SEO best practices and be accessible to all users. The site SHALL include proper meta tags, alt text, and ARIA labels while maintaining keyboard navigation and screen reader compatibility.

#### Scenario: Search engine optimization

**Given** the website is deployed
**When** search engines crawl the pages
**Then** they should find:

- Descriptive page titles for each page
- Meta descriptions with relevant keywords
- Alt text on all images
- Proper heading hierarchy (h1, h2, h3)
- Keywords: basketball highlights, video editing, content creation, AI video

#### Scenario: Accessibility compliance

**Given** a user with disabilities accesses the site
**When** they navigate the website
**Then** they should experience:

- Keyboard-navigable interface
- Screen reader-friendly content
- ARIA labels on interactive elements
- Sufficient color contrast
- No content that requires video/audio to understand key messages

---
