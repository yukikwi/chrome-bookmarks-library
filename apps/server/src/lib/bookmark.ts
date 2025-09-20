import type { Bookmark, Folder } from "@/types/bookmark";

export const getAllBookmarks = (bookmarks: Array<Folder | Bookmark>) => {
  const allBookmarks: Bookmark[] = [];
  for (const item of bookmarks) {
    if (item.type === "folder") {
      allBookmarks.push(...(getAllBookmarks(item.children)));
    } else {
      allBookmarks.push(item);
    }
  }
  return allBookmarks;
};
