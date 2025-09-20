export interface Bookmark {
    type: "link"
    addDate: number
    title: string
    icon?: string
    url: string
}

export interface Folder {
    type: "folder"
    addDate: number
    lastModified: number
    title: string
    children: Bookmark[]
}