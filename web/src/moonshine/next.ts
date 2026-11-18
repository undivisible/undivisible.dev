export type AlternateLink = {
  url: string;
  title?: string;
};

export type MetadataImage = {
  url: string;
  width?: number;
  height?: number;
  type?: string;
  alt?: string;
};

export type Metadata = {
  title?: string;
  description?: string;
  robots?: string;
  openGraph?: {
    title?: string;
    description?: string;
    type?: "website" | "article";
    url?: string;
    images?: MetadataImage[];
  };
  twitter?: {
    card?: "summary" | "summary_large_image";
    title?: string;
    description?: string;
    images?: Pick<MetadataImage, "url" | "alt">[];
  };
  alternates?: {
    canonical?: string;
    types?: Record<string, AlternateLink[]>;
  };
  icons?: {
    icon?: string;
  };
};
