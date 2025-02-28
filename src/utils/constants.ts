export const workspaceDir = `${(window as any).siyuan.config.system.workspaceDir}`;
export const dataDir = `${(window as any).siyuan.config.system.dataDir}`;
export const mediaDir = "./assets";
export const isDev = process.env.NODE_ENV === "development";
export const siyuanApiUrl = "";
export const siyuanApiToken = "";

export const databaseType = ["BibTex and CSL-JSON", "Zotero", "Juris-M"] as const;
export const REF_DIR_PATH = "./references/";
// 用户指南不应该作为可以写入的笔记本
export const hiddenNotebook: Set<string> = new Set(["思源笔记用户指南", "SiYuan User Guide"]);
export const STORAGE_NAME = "menu-config";
export const defaultReferencePath = "/References";
export const defaultNoteTemplate = `
---

**Title**:\t{{title}}

**Author**:\t{{authorString}}

**Year**:\t{{year}}

---

# Abstract

{{abstract}}

# Select on Zotero

[zotero]({{zoteroSelectURI}})

# Files

{{files}}

# Note

{{note}}
`;
export const defaultLinkTemplate = "({{shortAuthor}} {{year}})";
