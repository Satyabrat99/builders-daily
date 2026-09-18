"use client";
import ContentCard from './ContentCard';
import { theme } from '@/theme';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function DailyReport({ data }) {
  const { getSetting } = useSiteSettings();

  const bgs = {
    model: getSetting('card_bg_model', ''),
    tool: getSetting('card_bg_tool', ''),
    repo: getSetting('card_bg_repo', ''),
    paper: getSetting('card_bg_paper', ''),
  };

  if (!data) return null;

  return (
    <section style={styles.section}>
      <div className="daily-report-grid" style={styles.cardsContainer}>
        <ContentCard 
          tagTitle="Model of the day:" 
          itemName={data.modelOfTheDay?.name || "None"} 
          link={data.modelOfTheDay?.url}
          bgImage={bgs.model}
        />
        <ContentCard 
          tagTitle="Tool of the day:" 
          itemName={data.toolOfTheDay?.name || "None"} 
          link={data.toolOfTheDay?.url}
          bgImage={bgs.tool}
        />
        <ContentCard 
          tagTitle="Repo of the day:" 
          itemName={data.repoOfTheDay?.name || "None"} 
          link={data.repoOfTheDay?.url}
          bgImage={bgs.repo}
        />
        <ContentCard 
          tagTitle="Paper of the day:" 
          itemName={data.paperOfTheDay?.name || "None"} 
          link={data.paperOfTheDay?.url}
          bgImage={bgs.paper}
        />
      </div>
    </section>
  );
}

const styles = {
  section: {
    marginTop: '20px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 10,
  },
  cardsContainer: {
    width: '100%',
  }
};
