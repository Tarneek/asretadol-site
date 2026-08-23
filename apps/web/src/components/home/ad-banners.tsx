import type { PublicAdvertisement } from '@/lib/types/public-api';
import { AdRotator } from '@/components/home/ad-rotator';

type Props = {
  adBanner0?: PublicAdvertisement[];
  adBanner1?: PublicAdvertisement[];
};

export function AdBanners({ adBanner0 = [], adBanner1 = [] }: Props) {
  if (adBanner0.length === 0 && adBanner1.length === 0) {
    return null;
  }

  return (
    <div className="site-container advertise3">
      <div className="row">
        {adBanner0.length > 0 ? <AdRotator ads={adBanner0} className="ad-banner" /> : null}
        {adBanner1.length > 0 ? <AdRotator ads={adBanner1} className="ad-banner" /> : null}
      </div>
    </div>
  );
}
