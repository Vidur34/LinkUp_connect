export default function MatchBadge({ score }) {
    const getColor = () => {
        if (score >= 70) return 'match-high';
        if (score >= 40) return 'match-mid';
        return 'match-low';
    };

    const getLabel = () => {
        if (score >= 70) return '🔥';
        if (score >= 40) return '⭐';
        return '💫';
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white ${getColor()}`}
            title={`Match score: ${score}%`}
        >
            {getLabel()} {score}%
        </span>
    );
}
