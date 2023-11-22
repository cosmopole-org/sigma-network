
let folders = {
    FILES: "",
    PREVIEWS: "",
    TEMP: "",
    PDF_PAGES: ""
}

export let setupFoldersPath = (rootPath: string) => {
    folders.FILES = `${rootPath}/data/files`
    folders.PREVIEWS = `${rootPath}/data/previews`
    folders.TEMP = `${rootPath}/data/temp`
    folders.PDF_PAGES = `${rootPath}/data/pdf-pages`
}

export default folders
