'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createEmptyFixture } from '../actions/create-fixture';

interface Props {
  emailPath: string;
  fixturePath: string;
}

/**
 * Banner shown above the iframe when no .json fixture exists adjacent to the
 * current email. Provides one-click creation of `{}` so the user can start
 * filling in sample data.
 */
export function MissingFixtureBanner({ emailPath, fixturePath }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createEmptyFixture(emailPath);
      if (result.ok) {
        toast.success(`Created ${result.path.split('/').slice(-2).join('/')}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="bg-amber-3 border border-amber-7 text-amber-12 p-4 rounded-lg mb-4 flex items-center justify-between gap-4 text-sm">
      <div className="flex-1">
        <strong>No fixture found.</strong>{' '}
        Preview will render with empty data. Create{' '}
        <code className="bg-amber-4 px-1.5 py-0.5 rounded text-xs">
          {fixturePath.split('/').slice(-2).join('/')}
        </code>{' '}
        to fill in sample values.
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={handleCreate}
          disabled={pending}
          className="bg-amber-9 hover:bg-amber-10 text-amber-1 px-3 py-1.5 rounded text-xs font-medium disabled:opacity-50"
        >
          {pending ? 'Creating…' : 'Create empty fixture'}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="bg-transparent hover:bg-amber-4 text-amber-11 px-3 py-1.5 rounded text-xs"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
