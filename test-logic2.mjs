import fs from 'fs';
const data = JSON.parse(fs.readFileSync('./channel-response.json', 'utf8'));

const channelId = 'UC2G7zKbsBNpoVYbwb-NS56w';
const channelIdFromData = data.channelId || data.channel_id || channelId;

const bannerUrl = data.banner?.desktop?.at?.(-1)?.url ||
                 data.banner?.desktop?.[0]?.url ||
                 data.bannerExternalUrl ||
                 data.banner_external_url ||
                 data.brandingSettings?.image?.bannerExternalUrl || 
                 data.branding_settings?.image?.banner_external_url ||
                 data.header?.banner?.thumbnails?.at?.(-1)?.url ||
                 data.header?.banner?.thumbnails?.[0]?.url ||
                 data.banner?.thumbnails?.at?.(-1)?.url ||
                 data.banner?.thumbnails?.[0]?.url ||
                 data.header?.banner?.at?.(-1)?.url ||
                 data.header?.banner?.[0]?.url ||
                 data.banner?.at?.(-1)?.url ||
                 data.banner?.[0]?.url ||
                 data.brandingSettings?.image?.bannerTabletLowImageUrl ||
                 data.brandingSettings?.image?.bannerMobileLowImageUrl ||
                 data.header?.banner?.url ||
                 data.mobileBanner?.at?.(-1)?.url ||
                 data.mobileBanner?.[0]?.url ||
                 data.tvBanner?.at?.(-1)?.url ||
                 data.tvBanner?.[0]?.url ||
                 data.about?.banner?.at?.(-1)?.url ||
                 data.about?.banner?.[0]?.url ||
                 (Array.isArray(data.banner) && typeof data.banner[0] === 'string' ? data.banner[0] : null) ||
                 (typeof data.banner === 'string' ? data.banner : null) ||
                 null;

let finalBannerUrl = bannerUrl;
if (finalBannerUrl && finalBannerUrl.includes('googleusercontent.com') && !finalBannerUrl.includes('=w')) {
  finalBannerUrl = `${finalBannerUrl}=w2120-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`;
}

const result = {
  id: channelIdFromData,
  bannerUrl: finalBannerUrl,
  snippet: {
    title: data.title || "ערוץ לא ידוע",
    description: data.description || "",
    thumbnails: {
      default: { url: (Array.isArray(data.avatar) ? data.avatar[0]?.url : typeof data.avatar === 'string' ? data.avatar : null) || data.thumbnails?.[0]?.url || data.author?.avatar?.[0]?.url || null },
      medium: { url: (Array.isArray(data.avatar) ? data.avatar[1]?.url || data.avatar[0]?.url : typeof data.avatar === 'string' ? data.avatar : null) || data.thumbnails?.[1]?.url || data.thumbnails?.[0]?.url || null },
      high: { url: (Array.isArray(data.avatar) && data.avatar.length > 0 ? data.avatar[data.avatar.length - 1].url : typeof data.avatar === 'string' ? data.avatar : null) || data.thumbnails?.[0]?.url || null },
    },
    customUrl: data.customUrl || data.custom_url,
  },
  statistics: {
    subscriberCount: data.subscriberCountText || data.subscribers,
    videoCount: data.videosCountText || data.videos_count,
  },
};

console.log(JSON.stringify(result, null, 2));
