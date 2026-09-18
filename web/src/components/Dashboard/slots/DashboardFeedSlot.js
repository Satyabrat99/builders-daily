"use client";
import DailyReport from '@/components/Dashboard/DailyReport';
import PromoSlider from '@/components/Promotions/PromoSlider';
import DualFeedSection from '@/components/Dashboard/DualFeedSection';
import ShareCard from '@/components/Promotions/ShareCard';
import GemsSlider from '@/components/Dashboard/GemsSlider';
import GoodiesSection from '@/components/Dashboard/GoodiesSection';
import RepoSlider from '@/components/Dashboard/RepoSlider';
import HNSlider from '@/components/Dashboard/HNSlider';
import RedditSlider from '@/components/Dashboard/RedditSlider';
import ProductHuntPicks from '@/components/Dashboard/ProductHuntPicks';
import Divider from '@/components/ui/Divider';

export default function DashboardFeedSlot({ contentJson }) {
  if (!contentJson) return null;

  return (
    <>
      <DailyReport data={contentJson.dailyReport} />
      <PromoSlider />
      <Divider />
      <DualFeedSection 
        links={contentJson.freshLinks} 
        products={contentJson.aiTools} 
      />
      <ShareCard />
      <GemsSlider />
      <Divider />
      <GoodiesSection />
      <Divider />
      <RepoSlider items={contentJson.repos} />
      <Divider />
      <HNSlider items={contentJson.hn} />
      <Divider />
      <RedditSlider items={contentJson.reddit} />
      <Divider />
      <ProductHuntPicks items={contentJson.phPicks} />
    </>
  );
}
