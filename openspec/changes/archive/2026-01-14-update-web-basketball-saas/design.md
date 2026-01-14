# Design: Basketball Video SaaS Marketing Website

## Overview

This document outlines the design approach for transforming the generic React Starter Kit marketing site into a focused basketball video SaaS product landing page.

## Architecture

### Existing Infrastructure

The marketing site uses:

- **Astro**: Static site generation for optimal performance
- **ShadCN UI**: Pre-built accessible components
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type-safe development

This infrastructure remains unchanged. We're updating content and component usage, not the technical foundation.

## Component Strategy

### New/Modified Components

#### 1. Video Comparison Section

**Location**: Home page hero
**Purpose**: Demonstrate the core value proposition

```
┌─────────────────────────────────────────────────┐
│  Original Basketball Footage  │  AI-Generated Highlights  │
│  ┌─────────────────────┐     │  ┌─────────────────────┐  │
│  │   Video Player      │     │  │   Video Player      │  │
│  │  (Full game footage)│     │  │  (Highlight clips)  │  │
│  └─────────────────────┘     │  └─────────────────────┘  │
│  [Play] [Timeline]            │  [Play] [Timeline]        │
└─────────────────────────────────────────────────┘
                    ↓
         "Turn 48 minutes of game footage
          into 3 minutes of highlights"
```

**Implementation**:

- Use HTML5 `<video>` elements
- Add side-by-side layout with Tailwind grid
- Sync playback controls if technically feasible
- Fallback: independent players with clear labels

#### 2. Feature Cards

**Location**: Home page and features page
**Changes**: Update content to focus on basketball video features

Current card structure (reuse):

```tsx
<Card>
  <CardHeader>
    <CardTitle>Feature Name</CardTitle>
    <CardDescription>Brief description</CardDescription>
  </CardHeader>
  <CardContent>Detailed explanation</CardContent>
</Card>
```

#### 3. Use Case Sections

**Location**: Features page
**Purpose**: Show how different creator types benefit

Structure:

```tsx
<section>
  <h2>For {CreatorType}</h2>
  <Card>
    <CardContent>
      <p>{Benefit statement}</p>
      <ul>{Key benefits list}</ul>
    </CardContent>
  </Card>
</section>
```

## Content Structure

### Page-by-Page Breakdown

#### index.astro (Home)

1. **Hero Section**: Video comparison demo + main CTA
2. **Value Props**: 3-4 key benefits (AI detection, speed, quality)
3. **Feature Preview**: Brief overview of major features
4. **Social Proof**: Testimonials or usage stats (if available)
5. **CTA Section**: Final call-to-action

#### features.astro

1. **Hero**: Feature overview header
2. **Feature Categories**:
   - AI & Automation (highlight detection, play recognition)
   - Export Options (formats, platforms, branding)
   - User Experience (fast processing, intuitive interface)
   - Creator Tools (batch processing, templates)
3. **Use Cases**: Detailed breakdown for different creator types
4. **Technical Specs**: Brief mention of processing quality, formats supported

#### about.astro

1. **Mission**: Help content creators produce better basketball content
2. **Problem Statement**: Manual highlight editing is time-consuming
3. **Solution**: AI-powered automated highlight generation
4. **Technology**: Brief mention of tech stack (appropriate for marketing)
5. **Team/Credibility**: Trust-building content

#### pricing.astro

1. **Pricing Tiers**: Free/Pro/Team (placeholder structure)
2. **Feature Comparison**: Grid showing what's included
3. **FAQ**: Common questions about pricing and usage

## Design Decisions

### 1. Side-by-Side Video Layout

**Decision**: Use split-screen comparison on desktop, stacked on mobile

**Rationale**:

- Direct visual comparison is most compelling
- Works well on desktop where most content creators work
- Mobile-friendly with responsive design

**Trade-offs**:

- Slightly more complex layout than single video
- Requires attention to responsive breakpoints

### 2. Focus on Media Creators

**Decision**: Target content creators (YouTubers, TikTokers, sports media) rather than coaches/players

**Rationale**:

- User confirmed this as the target audience
- Clearer value proposition (time-saving for editors)
- Broader market opportunity

**Implications**:

- Emphasize export to social platforms
- Highlight speed and ease of use
- Mention quality/branding features

### 3. Reuse Existing Components

**Decision**: Modify existing ShadCN UI component usage rather than building new components

**Rationale**:

- Faster development
- Consistent design language
- Proven accessibility

**Exceptions**:

- May need custom video player component if sync functionality needed
- Potentially custom pricing comparison table

### 4. Content Hierarchy

**Decision**: Feature benefits over technical details

**Rationale**:

- Marketing site should sell value, not implementation
- Technical details in `about.astro` for interested users
- Most creators care about outcomes (time saved, quality improved)

## Content Guidelines

### Tone

- Professional yet energetic
- Emphasize speed and ease
- Sports-adjacent language (game-changing, highlight reel, etc.)

### Key Messages

1. **Save Time**: Hours of editing → minutes of AI processing
2. **Quality**: Professional-grade highlights automatically
3. **Flexibility**: Export for any platform
4. **Affordability**: Accessible to creators of all sizes

### Visual Approach

- Basketball imagery (courts, players, highlights)
- Clean, modern design (ShadCN provides this foundation)
- High contrast for video sections

## Technical Considerations

### Video Assets

- **Placeholder**: Use stock basketball footage initially
- **Format**: MP4, optimized for web (compressed, multiple resolutions)
- **Hosting**: Can use local assets in `apps/web/public/` or CDN

### Performance

- Lazy load video players (off-screen videos don't load immediately)
- Consider video poster images for initial load
- Optimize images for responsive display

### Accessibility

- Alt text for all images
- Video captions/subtitles where possible
- Keyboard navigation for video controls
- Proper ARIA labels

### SEO Considerations

- Keywords: basketball highlights, video editing, content creation, AI video
- Meta descriptions updated for each page
- Open Graph tags for social sharing

## Success Metrics

### Content Quality

- All references to "React Starter Kit" removed
- Clear value proposition on first screen
- Consistent messaging across all pages

### User Experience

- Video comparison loads and plays smoothly
- Mobile-responsive layout
- Clear CTAs on every page

### Conversion

- Sign-up/trial CTAs prominent
- Clear path from landing → features → pricing → signup

## Future Enhancements (Out of Scope)

1. Interactive demo with user-uploaded video
2. Real-time video sync between original and highlights
3. Animated transitions and micro-interactions
4. Integration with actual SaaS pricing/subscription data
5. Customer testimonials and case studies
