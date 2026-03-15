export default function VerifiedBadge({ size = 16 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'inline-block', flexShrink: 0 }}
            title="Verified Organisation"
        >
            <circle cx="12" cy="12" r="12" fill="#3b82f6" />
            <path
                d="M8 12.5L10.5 15L16 9.5"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
