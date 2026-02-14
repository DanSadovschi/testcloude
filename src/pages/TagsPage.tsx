import { type FormEvent, useEffect, useState } from 'react';
import { useTagStore } from '../stores/tagStore';
import { TAG_COLORS } from '../utils/constants';
import type { Tag } from '../types';

export default function TagsPage() {
  const { tags, loading, error, fetchTags } = useTagStore();

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4 dark:text-white">Tags</h1>
      <TagForm />
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading tags...</p>
      ) : tags.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No tags yet. Create one above.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {tags.map((tag) => (
            <TagItem key={tag.id} tag={tag} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TagForm() {
  const createTag = useTagStore((s) => s.createTag);
  const [name, setName] = useState('');
  const [color, setColor] = useState(TAG_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const ok = await createTag(name.trim(), color);
    if (ok) {
      setName('');
      setColor(TAG_COLORS[0]);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 mb-6 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="tag-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          New tag
        </label>
        <input
          id="tag-name"
          type="text"
          placeholder="Tag name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
        <div className="flex gap-1">
          {TAG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 ${
                color === c ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}

function TagItem({ tag }: { tag: Tag }) {
  const deleteTag = useTagStore((s) => s.deleteTag);
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    await deleteTag(tag.id);
  };

  return (
    <li className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span
          className="w-4 h-4 rounded-full inline-block"
          style={{ backgroundColor: tag.color }}
        />
        <span className="font-medium dark:text-gray-200">{tag.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {confirming && (
          <button
            onClick={() => setConfirming(false)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleDelete}
          className={`text-sm ${confirming ? 'text-red-600 font-medium' : 'text-gray-400 hover:text-red-500'}`}
        >
          {confirming ? 'Confirm delete' : 'Delete'}
        </button>
      </div>
    </li>
  );
}
