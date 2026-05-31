import { Edit3, LogOut, Plus, Save, StickyNote, Trash2, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote
} from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { Note } from "../types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function DashboardPage() {
  const { token, user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadNotes() {
      if (!token) {
        return;
      }

      setError("");
      setIsLoading(true);

      try {
        const data = await getNotes(token);

        if (!ignore) {
          setNotes(data.notes);
        }
      } catch (caughtError) {
        if (!ignore) {
          setError(caughtError instanceof Error ? caughtError.message : "Could not load notes.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadNotes();

    return () => {
      ignore = true;
    };
  }, [token]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const data = await createNote(token, title, content);
      setNotes((currentNotes) => [data.note, ...currentNotes]);
      setTitle("");
      setContent("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not save note.");
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(note: Note) {
    setEditingId(note.id);
    setEditingTitle(note.title);
    setEditingContent(note.content);
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
    setEditingContent("");
  }

  async function handleUpdate(noteId: string) {
    if (!token) {
      return;
    }

    setError("");

    try {
      const data = await updateNote(token, noteId, editingTitle, editingContent);
      setNotes((currentNotes) =>
        currentNotes.map((note) => (note.id === noteId ? data.note : note))
      );
      cancelEditing();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update note.");
    }
  }

  async function handleDelete(noteId: string) {
    if (!token) {
      return;
    }

    setError("");

    try {
      await deleteNote(token, noteId);
      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not delete note.");
    }
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">Secure Notes</p>
          <h1>My notes</h1>
          <p className="user-line">{user?.email}</p>
        </div>
        <button className="ghost-button" type="button" onClick={logout}>
          <LogOut size={18} aria-hidden="true" />
          Log out
        </button>
      </header>

      <section className="workspace" aria-label="Notes workspace">
        <form className="note-form" onSubmit={handleCreate}>
          <h2>New note</h2>
          <label>
            Title
            <input
              value={title}
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>
          <label>
            Content
            <textarea
              value={content}
              maxLength={5000}
              rows={8}
              onChange={(event) => setContent(event.target.value)}
              required
            />
          </label>
          <button className="primary-button" type="submit" disabled={isSaving}>
            <Plus size={18} aria-hidden="true" />
            {isSaving ? "Saving..." : "Add note"}
          </button>
        </form>

        <section className="notes-area" aria-labelledby="notes-heading">
          <div className="section-heading">
            <h2 id="notes-heading">Saved notes</h2>
            <span>{notes.length}</span>
          </div>

          {error && <p className="alert">{error}</p>}
          {isLoading && <p className="muted">Loading notes...</p>}

          {!isLoading && notes.length === 0 && (
            <div className="empty-state">
              <StickyNote size={32} aria-hidden="true" />
              <p>No notes yet.</p>
            </div>
          )}

          <div className="notes-grid">
            {notes.map((note) => (
              <article className="note-card" key={note.id}>
                {editingId === note.id ? (
                  <div className="edit-stack">
                    <input
                      aria-label="Edit title"
                      value={editingTitle}
                      maxLength={120}
                      onChange={(event) => setEditingTitle(event.target.value)}
                    />
                    <textarea
                      aria-label="Edit content"
                      value={editingContent}
                      maxLength={5000}
                      rows={7}
                      onChange={(event) => setEditingContent(event.target.value)}
                    />
                    <div className="button-row">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => handleUpdate(note.id)}
                        aria-label="Save note"
                        title="Save note"
                      >
                        <Save size={18} aria-hidden="true" />
                      </button>
                      <button
                        className="icon-button"
                        type="button"
                        onClick={cancelEditing}
                        aria-label="Cancel edit"
                        title="Cancel edit"
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="note-header">
                      <h3>{note.title}</h3>
                      <div className="button-row">
                        <button
                          className="icon-button"
                          type="button"
                          onClick={() => startEditing(note)}
                          aria-label="Edit note"
                          title="Edit note"
                        >
                          <Edit3 size={18} aria-hidden="true" />
                        </button>
                        <button
                          className="icon-button danger"
                          type="button"
                          onClick={() => handleDelete(note.id)}
                          aria-label="Delete note"
                          title="Delete note"
                        >
                          <Trash2 size={18} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <p className="note-content">{note.content}</p>
                    <time dateTime={note.updatedAt}>Updated {formatDate(note.updatedAt)}</time>
                  </>
                )}
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
