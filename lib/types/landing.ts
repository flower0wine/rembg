/**
 * Landing page component props type definitions
 */

export interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface FeaturesSectionProps {
  features: Feature[];
}
