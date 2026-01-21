"use client"

interface RecommendationButtonsProps {
  onSend: (text: string) => void;
}

export default function RecommendationButtons({ onSend }: RecommendationButtonsProps) {
  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={() => onSend("Show high-risk areas")}
        className="px-4 py-2 rounded-full text-sm bg-white border"
      >
        Show high-risk areas
      </button>

      <button
        onClick={() => onSend("Recommend actions")}
        className="px-4 py-2 rounded-full text-sm bg-white border"
      >
        Recommend actions
      </button>
    </div>
  );
}
