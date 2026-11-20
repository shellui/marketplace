import type { PublisherKind } from '@/lib/types';

const LABEL: Record<PublisherKind, string> = {
  official: 'Official',
  verified: 'Verified',
  community: 'Community',
};

export function PublisherBadge({ kind }: { kind: PublisherKind }) {
  const official = kind === 'official';
  return (
    <span
      className={
        official
          ? 'inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground'
          : 'inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-foreground'
      }
    >
      {LABEL[kind]}
    </span>
  );
}
