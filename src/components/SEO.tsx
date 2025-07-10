import { Helmet } from 'react-helmet-async';

type SEOProps = {
  title?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
};

export function SEO({ title, description, imageUrl, imageAlt }: SEOProps) {
  const siteName = 'موتیو';
  const defaultDescription = 'پلتفرم انگیزشی برای رسیدن شما به اهدافتان';
  const defaultImageUrl = 'https://imotiv.ir/og-image.png'; // A default image for social sharing
  const defaultImageAlt = 'Motiv.ir logo';

  const pageTitle = title ? `${title} | ${siteName}` : siteName;
  const pageDescription = description || defaultDescription;
  const pageImageUrl = imageUrl || defaultImageUrl;
  const pageImageAlt = imageAlt || defaultImageAlt;

  return (
    <Helmet
      title={title}
      defaultTitle={siteName}
      titleTemplate={`%s | ${siteName}`}
    >
      <meta name="description" content={pageDescription} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImageUrl} />
      <meta property="og:image:alt" content={pageImageAlt} />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content="website" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImageUrl} />
      <meta name="twitter:image:alt" content={pageImageAlt} />
    </Helmet>
  );
}
