import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
}

const FALLBACK_SITE_URL = "https://maytepethotel.com";
const DEFAULT_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/0maNRANWg8NigfI6BuWwrjJItVC2/social-images/social-1770176941336-Logo MPH con fondo (1).png";

const Seo = ({ title, description, path, image, type = "website", noindex }: SeoProps) => {
  // Canonical/og:url should reflect the actual host the user is on,
  // so mypet-app.lovable.app doesn't compete with maytepethotel.com for SEO.
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : FALLBACK_SITE_URL;
  const url = `${origin}${path}`;
  const img = image || DEFAULT_IMAGE;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
};

export default Seo;
