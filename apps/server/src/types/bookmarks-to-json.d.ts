
declare module 'bookmarks-to-json' {
    export function bookmarksToJSON(bookmarks: string, options?: {
        formatJSON?: boolean;
        spaces?: number;
        stringify?: true
    }): string;

    export function bookmarksToJSON(bookmarks: string, options?: {
        formatJSON?: boolean;
        spaces?: number;
        stringify: false
    }): Array<Folder | Bookmark>;
}