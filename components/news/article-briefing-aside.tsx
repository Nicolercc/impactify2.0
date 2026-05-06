import { BriefingPanel } from "@/components/news/briefing-panel";
import { BriefingProvider } from "@/components/news/briefing-store";
import { briefingFromRow } from "@/lib/news/briefing";
import { fetchAiBriefingRowForArticle } from "@/lib/news/queries";

export async function ArticleBriefingAside({
  articleId,
  articleTitle,
  articleBody,
  relatedCauseSlug,
}: {
  articleId: string;
  articleTitle: string;
  articleBody: string;
  relatedCauseSlug: string | null;
}) {
  const briefingRow = await fetchAiBriefingRowForArticle(articleId);
  const existingBriefing = briefingFromRow(briefingRow);

  return (
    <BriefingProvider
      articleId={articleId}
      articleTitle={articleTitle}
      articleBody={articleBody}
      existingBriefing={existingBriefing}
    >
      <BriefingPanel relatedCauseSlug={relatedCauseSlug} />
    </BriefingProvider>
  );
}
