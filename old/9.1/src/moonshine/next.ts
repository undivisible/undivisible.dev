export type AlternateLink = {
  url: string;
  title?: string;
};

export type Metadata = {
  title?: string;
  description?: string;
  robots?: string;
  alternates?: {
    canonical?: string;
    types?: Record<string, AlternateLink[]>;
  };
  icons?: {
    icon?: string;
  };
};
