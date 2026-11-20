import { CAPABILITY_COPY } from '@/lib/permissions';
import type { Capability } from '@/lib/types';

export function PermissionsList({ capabilities }: { capabilities: Capability[] }) {
  return (
    <section aria-labelledby="permissions-title">
      <h2
        id="permissions-title"
        className="font-heading text-lg font-semibold"
      >
        Permissions
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Capabilities this app asks the shell for.
      </p>
      <ul className="mt-4 space-y-3">
        {capabilities.map((capability) => {
          const copy = CAPABILITY_COPY[capability];
          return (
            <li
              key={capability}
              className="rounded-xl border border-border bg-card px-4 py-3"
            >
              <p className="text-sm font-semibold">{copy.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy.detail}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
