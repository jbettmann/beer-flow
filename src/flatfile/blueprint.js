const blueprint = {
  name: "Beer Importer",
  slug: "beer_import",
  fields: [
    {
      key: "name",
      label: "Name",
      type: "string",
      constraints: [
        {
          type: "required",
        },
      ],
    },

    {
      key: "style",
      label: "Style",
      type: "string",
      constraints: [
        {
          type: "required",
        },
      ],
    },
    {
      key: "abv",
      label: "ABV",
      type: "number",
      constraints: [
        {
          type: "required",
        },
      ],
    },
    {
      key: "ibu",
      label: "IBU",
      type: "number",
    },
    {
      key: "category",
      label: "Category",
      type: "string",
      constraints: [
        {
          type: "required",
        },
      ],
    },
    {
      key: "malts",
      label: "Malts",
      type: "string",
    },
    {
      key: "hops",
      label: "Hops",
      type: "string",
    },
    {
      key: "description",
      label: "Description",
      type: "string",
    },
    {
      key: "name_sake",
      label: "Name Sake",
      type: "string",
    },
    {
      key: "notes",
      label: "Notes",
      type: "string",
    },
    {
      key: "release_date",
      label: "Release Date",
      type: "date",
    },
    {
      key: "archived",
      label: "Archived",
      type: "boolean",
    },
  ],
};

export default blueprint;
