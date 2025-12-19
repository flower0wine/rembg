# Implementation Plan

- [x] 1. Set up project foundation and core utilities
  - [x] 1.1 Create utility functions and type definitions
    - Create `lib/utils/cn.ts` with clsx + tailwind-merge for class name merging
    - Create `lib/types/index.ts` with all TypeScript interfaces
    - Create `lib/utils/validation.ts` with Zod schemas for file and URL validation
    - _Requirements: 1.3, 1.4, 2.2_

  - [ ]\* 1.2 Write property tests for validation utilities
    - **Property 1: File Size Validation**
    - **Property 2: File Type Validation**
    - **Property 3: URL Format Validation**
    - **Validates: Requirements 1.3, 1.4, 2.2**

  - [ ] 1.3 Set up Sentry error monitoring
    - Install and configure @sentry/nextjs
    - Create `lib/monitoring/sentry.ts` with initialization
    - Add Sentry configuration files
    - _Requirements: Error handling_

- [x] 2. Set up Supabase integration
  - [x] 2.1 Configure Supabase client
    - Create `lib/supabase/client.ts` for browser client
    - Create `lib/supabase/server.ts` for server-side client
    - Create `lib/supabase/types.ts` with database types
    - _Requirements: 11.1, 11.2_

  - [x] 2.2 Create database schema
    - Create SQL migration for usage_records table
    - Create SQL migration for processing_history table

    - Add appropriate indexes
    - _Requirements: 12.1, 14.1_

  - [x] 2.3 Create Supabase middleware
    - Create `lib/supabase/middleware.ts` for session handling
    - Create `middleware.ts` for Next.js auth checks
    - _Requirements: 11.2, 11.4_

- [x] 3. Implement authentication system
  - [x] 3.1 Create auth provider and hooks
    - Create `components/providers/auth-provider.tsx`
    - Create `lib/hooks/use-auth.ts` with auth state management
    - _Requirements: 11.1, 11.2_

  - [x] 3.2 Create auth UI components
    - Create `components/features/auth/login-form.tsx`
    - Create `components/features/auth/register-form.tsx`
    - Create `components/features/auth/user-menu.tsx`
    - Create `components/features/auth/auth-guard.tsx`
    - _Requirements: 11.1, 11.3_

  - [x] 3.3 Create auth pages
    - Create `app/(auth)/login/page.tsx`
    - Create `app/(auth)/register/page.tsx`
    - Create `app/api/auth/callback/route.ts` for OAuth
    - _Requirements: 11.1_

- [x] 4. Implement browser fingerprint and usage limiting
  - [x] 4.1 Set up FingerprintJS
    - Install @fingerprintjs/fingerprintjs
    - Create `lib/utils/fingerprint.ts` with fingerprint generation
    - _Requirements: 12.1_

  - [x] 4.2 Create usage limiter
    - Create usage checking logic in API route
    - Implement guest usage tracking with fingerprint
    - _Requirements: 12.2, 12.3_

  - [ ]\* 4.3 Write property test for guest usage limit
    - **Property 9: Guest Usage Limit**
    - **Validates: Requirements 12.2, 12.3**

- [x] 5. Implement reCAPTCHA verification
  - [ ] 5.1 Set up Google reCAPTCHA v3
    - Install react-google-recaptcha-v3

    - Create `lib/utils/recaptcha.ts` with verification utilities
    - Create `app/api/verify-captcha/route.ts`
    - _Requirements: 13.1, 13.2_

  - [ ]\* 5.2 Write property test for reCAPTCHA verification
    - **Property 10: reCAPTCHA Verification Required**
    - **Validates: Requirements 13.1, 13.2**

- [x] 6. Checkpoint - Ensure all foundation tests pass


  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create shadcn UI components




  - [x] 7.1 Install required shadcn components


    - Install button, input, card, tabs, dialog, toast components
    - Run: `pnpm dlx shadcn@latest add button input card tabs dialog`
    - _Requirements: 8.1_
  - [x] 7.2 Set up theme provider


    - Create `components/providers/theme-provider.tsx` using next-themes
    - Create `components/providers/query-provider.tsx` for React Query
    - Update `app/layout.tsx` with providers
    - _Requirements: 8.4_

- [x] 8. Create layout components




  - [x] 8.1 Create header and navigation


    - Create `components/layout/navbar.tsx` with navigation links
    - Create `components/layout/header.tsx` with user menu integration
    - _Requirements: 15.1_
  - [x] 8.2 Create footer component


    - Create `components/layout/footer.tsx`
    - _Requirements: 15.1_

- [x] 9. Implement Landing Page (Home)





  - [x] 9.1 Create hero section


    - Create `components/features/landing/hero-section.tsx`
    - Implement Framer Motion animations for entrance effects
    - _Requirements: 15.1, 10.1_
  - [x] 9.2 Create features section


    - Create `components/features/landing/features-section.tsx`
    - Display feature highlights with icons and descriptions
    - _Requirements: 15.2_
  - [x] 9.3 Create how-it-works section


    - Create `components/features/landing/how-it-works.tsx`
    - Show step-by-step usage flow
    - _Requirements: 15.2_

  - [x] 9.4 Create testimonials and CTA sections

    - Create `components/features/landing/testimonials.tsx`
    - Create `components/features/landing/cta-section.tsx`
    - _Requirements: 15.3, 15.4_

  - [x] 9.5 Assemble landing page

    - Update `app/page.tsx` with all landing sections
    - Add scroll animations with Framer Motion
    - _Requirements: 15.1, 15.5_

- [x] 10. Implement Pricing Page






  - [x] 10.1 Create pricing components

    - Create `components/features/pricing/pricing-card.tsx`
    - Create `components/features/pricing/pricing-toggle.tsx`
    - Create `components/features/pricing/feature-list.tsx`
    - _Requirements: 16.1, 16.2_

  - [x] 10.2 Create pricing page

    - Create `app/pricing/page.tsx`
    - Implement monthly/annual toggle with price display
    - _Requirements: 16.1, 16.4_

- [x] 11. Checkpoint - Ensure landing and pricing pages work





  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement image upload components




  - [x] 12.1 Create drop zone component


    - Create `components/features/background-removal/drop-zone.tsx`
    - Implement drag-and-drop with visual feedback
    - Add Framer Motion animations for drag states
    - _Requirements: 3.1, 3.2, 10.3_
  - [ ]\* 12.2 Write property test for multiple file drop handling
    - **Property 4: Multiple File Drop Handling**
    - **Validates: Requirements 3.3**
  - [x] 12.3 Create image uploader component


    - Create `components/features/background-removal/image-uploader.tsx`
    - Integrate file input with validation
    - _Requirements: 1.1, 1.2_
  - [x] 12.4 Create URL input component


    - Create `components/features/background-removal/url-input.tsx`
    - Implement URL validation with Zod
    - _Requirements: 2.1, 2.2_

- [x] 13. Implement image processing components





  - [x] 13.1 Create processing status component


    - Create `components/features/background-removal/processing-status.tsx`
    - Show loading indicator with progress
    - _Requirements: 4.1, 4.3_
  - [ ]\* 13.2 Write property test for upload controls disabled during processing
    - **Property 5: Upload Controls Disabled During Processing**
    - **Validates: Requirements 4.2**
  - [x] 13.3 Create image preview component


    - Create `components/features/background-removal/image-preview.tsx`
    - Display checkered background for transparency
    - _Requirements: 5.3_
  - [x] 13.4 Create image comparison slider


    - Install react-compare-slider library
    - Create `components/features/background-removal/image-comparison.tsx`
    - _Requirements: 5.1, 5.2_

- [x] 14. Implement download functionality




  - [x] 14.1 Create download utilities


    - Create `lib/utils/download.ts` with filename generation
    - Implement PNG download with transparency
    - _Requirements: 6.1, 6.2_
  - [ ]\* 14.2 Write property test for download filename generation
    - **Property 6: Download Filename Generation**
    - **Validates: Requirements 6.2**
  - [x] 14.3 Create download button component


    - Create `components/features/background-removal/download-button.tsx`
    - _Requirements: 6.1, 6.3_

- [x] 15. Implement batch processing





  - [x] 15.1 Create batch uploader component


    - Create `components/features/background-removal/batch-uploader.tsx`
    - Support multiple file selection
    - _Requirements: 9.1, 9.2_
  - [ ]\* 15.2 Write property test for batch queue processing
    - **Property 7: Batch Queue Processing**
    - **Validates: Requirements 9.2**
  - [x] 15.3 Create batch progress component


    - Create `components/features/background-removal/batch-progress.tsx`
    - Show individual progress for each image
    - _Requirements: 9.3_
  - [ ]\* 15.4 Write property test for batch error isolation
    - **Property 8: Batch Error Isolation**
    - **Validates: Requirements 9.5**
  - [x] 15.5 Create mode switcher component


    - Create `components/features/background-removal/mode-switcher.tsx`
    - Implement tab switching with Framer Motion
    - _Requirements: 9.1, 10.2_

- [x] 16. Checkpoint - Ensure all component tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Implement API layer




  - [x] 17.1 Create Axios client


    - Create `lib/api/client.ts` with interceptors
    - Configure error handling and retry logic
    - _Requirements: 4.3_
  - [x] 17.2 Create background removal API functions


    - Create `lib/api/background-removal.ts`
    - Implement single and batch processing functions
    - _Requirements: 4.1, 9.2_
  - [x] 17.3 Create React Query hooks


    - Create `lib/hooks/use-background-removal.ts`
    - Create `lib/hooks/use-batch-removal.ts`
    - _Requirements: 4.1, 9.2_

- [x] 18. Implement API routes





  - [x] 18.1 Create background removal API route



    - Create `app/api/remove-bg/route.ts`
    - Integrate reCAPTCHA verification
    - Integrate usage limit checking
    - _Requirements: 4.1, 12.2, 13.1_

- [x] 19. Implement processing history





  - [x] 19.1 Create history hooks


    - Create `lib/hooks/use-history.ts`
    - Implement CRUD operations for history
    - _Requirements: 14.1, 14.4_
  - [ ]\* 19.2 Write property test for history record creation
    - **Property 11: History Record Creation**
    - **Validates: Requirements 14.1**
  - [x] 19.3 Create history components


    - Create `components/features/history/history-list.tsx`
    - Create `components/features/history/history-item.tsx`
    - _Requirements: 14.1, 14.2_


  - [x] 19.4 Create history page




    - Create `app/history/page.tsx`
    - Implement pagination and filtering
    - _Requirements: 14.1_

- [x] 20. Assemble background removal app page





  - [x] 20.1 Create main app page


    - Create `app/app/page.tsx`
    - Integrate all background removal components
    - Wire up single and batch modes
    - _Requirements: 1.1, 2.1, 3.1, 9.1_
  - [x] 20.2 Add toast notifications


    - Configure sonner toast provider
    - Add toast notifications for all user feedback
    - _Requirements: 8.3_

- [x] 21. Implement SEO and metadata





  - [x] 21.1 Add metadata to all pages


    - Add title, description, Open Graph tags to layout
    - Create metadata for each page
    - _Requirements: 7.1_

  - [x] 21.2 Optimize server components


    - Ensure static content is server-rendered
    - Optimize client component boundaries
    - _Requirements: 7.2, 7.3_

- [x] 22. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
