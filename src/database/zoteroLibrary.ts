import moment from "moment";
import { Entry, Author, IIndexable } from "./filesLibrary";
import { htmlNotesProcess } from "../utils/notes";

interface Creator {
  firstName?: string,
  lastName?: string,
  prefix?: string,
  suffix?: string,
  name?: string,
  creatorType: string
}

export interface EntryDataZotero {
  abstractNote?: string;
  accessDate?: string;
  attachments?: any[];
  citekey?: string;
  citationKey?: string;
  conferenceName?: string;
  creators?: Creator[]; 
  thesisType?: string;
  date?: string;
  dateAdded: string;
  dateModified: string;
  DOI?: string;
  edition?: string;
  eprint?: string;
  eprinttype?: string;
  ISBN?: string;
  ISSN?: string;
  itemID: number;
  itemKey: string;
  itemType?: string;
  language?: string;
  journalAbbreviation?: string;
  notes?: any[];
  numPages?: string;
  pages?: string;
  place?: string;
  primaryClass?: string;
  proceedingsTitle?: string;
  publisher?: string;
  publicationTitle?: string;
  relations?: any[];
  tags?: any[];
  title?: string;
  university?: string;
  url?: string;
  volume?: string;
}

const ZOTERO_PROPERTY_MAPPING: Record<string, string> = {
  booktitle: "_containerTitle",
  date: "issued",
  DOI: "DOI",
  eprint: "eprint",
  eprinttype: "eprinttype",
  eventtitle: "event",
  journal: "_containerTitle",
  journaltitle: "_containerTitle",
  location: "publisherPlace",
  pages: "page",
  title: "title",
  venue: "eventPlace",
  year: "_year",
  publisher: "publisher",
  notes: "_note",
  abstractNote: "abstract",
  accessDate: "accessDate",
  attachments: "_attachments",
  conferenceName: "_containerTitle",
  thesisType: "thesis",
  dateAdded: "dateAdded",
  dateModified: "dateModified",
  edition: "edition",
  ISBN: "ISBN",
  ISSN: "ISSN",
  itemID: "itemID",
  itemKey: "itemKey",
  language: "lang",
  journalAbbreviation: "containerTitleShort",
  shortjournal: "containerTitleShort",
  numPages: "numPages",
  place: "publisherPlace",
  primaryClass: "primaryclass",
  proceedingsTitle: "__containerTitle",
  publicationTitle: "__containerTitle",
  relations: "_relations",
  tags: "_tags",
  university: "publisher",
  url: "URL",
  volume: "volume"
};

export class EntryZoteroAdapter extends Entry {
  abstract?: string;
  _containerTitle?: string;
  containerTitleShort?: string;
  DOI?: string;
  eprint?: string;
  eprinttype?: string;
  event?: string;
  eventPlace?: string;
  issued?: string;
  page?: string;
  primaryclass?: string;
  publisher?: string;
  publisherPlace?: string;
  title?: string;
  titleShort?: string;
  thesis?: string;
  URL?: string;
  declare _year?: string;
  declare _note?: any[];
  declare _tags?: any[];

  constructor(private data: EntryDataZotero) {
    super();

    Object.entries(ZOTERO_PROPERTY_MAPPING).forEach(
      (map: [string, string]) => {
        const [src, tgt] = map;
        if (Object.keys(this.data).indexOf(src) != -1) {
          const val = this.data[src];

          (this as IIndexable)[tgt] = val;
        }
      },
    );
  }

  get id() {
    return this.data.citekey || this.data.citationKey;
  }
  get type() {
    return this.data.itemType;
  }

  get files(): string[] {
    const attachments =  this.data.attachments ?? [];
    return ["", ...attachments.map(attach => {
      const fileName = attach.title;
      return `|[[Located]](${attach.select})\t|\t[${fileName}](file://${attach.path})|`;
    })];
  }

  get authorString() {
    const authors = this.data.creators?.filter(c => c.creatorType === "author");
    if (authors) {
      const names = authors.map((name) => {
        if (name.name) {
          return name.name;
        } else {
          const parts = [name.firstName, name.prefix, name.lastName, name.suffix];
          // Drop any null parts and join
          return parts.filter((x) => x).join(" ");
        }
      });
      return names.join(", ");
    } else {
      return "";
    }
  }

  get shortAuthor(): string {
    const limit = 2;
    let shortAuthor = "";
    const author = this.data.creators?.filter(c => c.creatorType === "author");
    if (author.length == 0) {
      return "";
    }
    for (let i = 0; i < limit && i < author.length; i++) {
      const name = author[i].lastName ? author[i].lastName: author[i].name;
      if (i == 0) {
        shortAuthor += name ?? "";
      } else if (i == limit - 1) {
        shortAuthor += name ? " and " + name : "";
        if (limit < author.length) {
          shortAuthor +=  shortAuthor.length ? " et al." : "";
        }
      } else if (author.length < limit && i == author.length - 1) {
        shortAuthor += name ? " and " + name : "";
      } else {
        shortAuthor += name ? ", " + name : "";
      }
    }
    return shortAuthor;
  }

  get containerTitle() {
    if (this._containerTitle) {
      return this._containerTitle;
    } else if (this.eprint) {
      const prefix = this.eprinttype
        ? `${this.eprinttype}:`
        : "";
      const suffix = this.primaryclass
        ? ` [${this.primaryclass}]`
        : "";
      return `${prefix}${this.eprint}${suffix}`;
    } else if (this.type === "thesis") {
      return `${this.publisher} ${this.thesis}`;
    }
  }

  get issuedDate() {
    if (this.issued) {
      switch (this.issued.length) {
        case 4: return moment(this.issued, "YYYY").toDate();
        case 6: return moment(this.issued, "M/YYYY").toDate();
        case 7: return moment(this.issued, "MM/YYYY").toDate();
        case 10: return moment(this.issued, "YYYY-MM-DD").toDate();
        default: return null;
      }
    } else return null;
  }

  get author(): Author[] {
    const authors = this.data.creators?.filter(c => c.creatorType === "author");
    if (authors) {
      return authors.map((a) => {
        if (a.name) {
          return {
            given: "",
            family: a.name
          };
        } else {
          return {
            given: a.firstName,
            family: a.lastName,
          };
        }
      });
    } else {
      return [];
    }
  }

  get note(): string {
    return this._note?.map((singleNote, index) => {
      return `\n\n---\n\n###### Note No.${index+1}\t[[Locate]](zotero://select/items/0_${singleNote.key}/)\t[[Open]](zotero://note/u/${singleNote.key}/)\n\n\n\n` + htmlNotesProcess(singleNote.note.replace(/\\(.?)/g, (m, p1) => p1));
    }).join("\n\n");
  }

  get tags(): string {
    return this._tags?.map(tag => tag.tag).join(", ");
  }
}

/**
   * For the given citekey, find the corresponding `Entry` and return a
   * collection of template variable assignments.
   */
export function getTemplateVariablesForZoteroEntry(entry: EntryZoteroAdapter): Record<string, any> {
  const shortcuts = {
    citekey: entry.id,

    abstract: entry.abstract,
    author: entry.author,
    authorString: entry.authorString,
    containerTitle: entry.containerTitle,
    DOI: entry.DOI,
    eprint: entry.eprint,
    eprinttype: entry.eprinttype,
    eventPlace: entry.eventPlace,
    note: entry.note,
    page: entry.page,
    publisher: entry.publisher,
    publisherPlace: entry.publisherPlace,
    tags: entry.tags,
    title: entry.title,
    titleShort: entry.titleShort,
    type: entry.type,
    shortAuthor: entry.shortAuthor,
    URL: entry.URL,
    year: entry.year?.toString(),
    files: entry.files,
    zoteroSelectURI: entry.zoteroSelectURI,
  };

  return { entry: entry.toJSON(), ...shortcuts };
}
