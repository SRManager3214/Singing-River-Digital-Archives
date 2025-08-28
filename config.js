window.SR_CONFIG = {
  siteName: "Singing River Genealogy & Local History Library",
  rowsPerPage: 24,
  collections: [
    { id: "sr-obits", label: "Obituaries" },
    { id: "sryearbooks", label: "Yearbooks" },
    { id: "srfamilyfiles", label: "Family Files" },
    { id: "singing-river-jcsr", label: "School Records" }
  ],
  mediatypes: ["texts"],
  fields: ["identifier","title","date","description","creator","collection","publicdate","mediatype"],
  sort: ["date desc","publicdate desc"]
};
