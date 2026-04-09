import { salesFetch, salesFetchJson } from "@/lib/http";

export type TagResponse = {
  id: number;
  name: string;
};

export type DocumentTagResponse = {
  documentType: string;
  documentId: number;
  tags: TagResponse[];
};

export async function getAllTags(): Promise<TagResponse[]> {
  return await salesFetchJson<TagResponse[]>(`/tags`);
}

export async function getDocumentTags(documentType: string, documentId: number): Promise<DocumentTagResponse> {
  return await salesFetchJson<DocumentTagResponse>(`/tags/${encodeURIComponent(documentType)}/${documentId}`);
}

export async function addTagsToDocument(documentType: string, documentId: number, tagIds: number[]): Promise<void> {
  const res = await salesFetch(`/tags/${encodeURIComponent(documentType)}/${documentId}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tagIds }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function removeTagsFromDocument(documentType: string, documentId: number, tagIds: number[]): Promise<void> {
  const res = await salesFetch(`/tags/${encodeURIComponent(documentType)}/${documentId}/remove`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tagIds }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
}

