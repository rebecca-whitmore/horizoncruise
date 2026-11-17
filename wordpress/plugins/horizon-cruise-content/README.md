# Horizon Cruise Content

This folder contains the source for the **Horizon Cruise Content** WordPress plugin.

The plugin registers four structured content types:

- `cruise_line` — Cruise Lines
- `ship` — Ships
- `featured_journey` — Featured Journeys
- `ship_feature` — Ship Features

The content types are editable in WordPress and exposed through the standard REST API. They do not have WordPress-rendered public pages or archives. The separate Next.js application will eventually render their public pages.

Version 0.4.2 provides an administrator-only, preview-first CSV importer for Cruise Lines, Ships, Ship Features and Featured Journeys under **Tools → Horizon Cruise Import**. It also adds exact Cruise Line relationship filtering to the Ships REST collection. The importer uses a permanent private `import_key` to update records safely and never matches records by title.

Only titles, featured images and revisions are enabled. There is no unrestricted main content editor. Pods fields, taxonomies, relationships, frontend templates and example records are intentionally outside this first stage.

## Install the packaged ZIP

1. Open the WordPress administration area.
2. Go to **Plugins → Add New Plugin → Upload Plugin**.
3. Upload `horizon-cruise-content.zip` from `wordpress/releases` in this repository.
4. Select **Install Now**, then **Activate Plugin**.
5. Confirm that **Cruise Lines**, **Ships**, **Featured Journeys** and **Ship Features** appear in the admin menu.

## Verify the installation

Create a draft record in each section and confirm:

- The editor shows a title, featured image and revisions support.
- There is no standard WordPress content editor.
- Published test records can be requested from the corresponding REST route.
- Visiting a WordPress single or archive URL does not expose a public content page.
- Existing Posts and their REST responses are unchanged.

REST collection routes:

- `/wp-json/wp/v2/cruise-lines`
- `/wp-json/wp/v2/ships`
- `/wp-json/wp/v2/featured-journeys`
- `/wp-json/wp/v2/ship-features`

Filter published Ships by their exact Cruise Line relationship:

- `/wp-json/wp/v2/ships?cruise_line=123`

`cruise_line` must be a positive integer WordPress post ID. Normal WordPress REST permissions, publication-status rules and pagination still apply.

Draft and private records require normal WordPress REST authentication.

## Deactivation

Deactivation unregisters the content types and refreshes routing rules. It does not delete posts, metadata, media or revisions. Reactivating the plugin makes the stored records available again.

No uninstall data-removal routine is included.

## CSV importer

Pods must be active, and all four Pods must use the field names represented in the bundled templates.

Supported files:

- `csv-templates/cruise-lines-template.csv`
- `csv-templates/ships-template.csv`
- `csv-templates/ship-features-template.csv`
- `csv-templates/featured-journeys-template.csv`

The importer handles titles, text, formatted content and configured relationships. It intentionally ignores media. New records are drafts; updates retain the existing publication status. Omitted columns and blank cells preserve their existing values.

`import_key` is mandatory and is stored in private WordPress metadata. Keys must be permanent and unique within a content type.

Relationship columns:

- Ships use `cruise_line_import_key`.
- Ship Features use `ship_import_key`.
- Featured Journeys use `cruise_line_import_key` and `ship_import_keys`.
- Separate multiple values in `ship_import_keys` with a pipe (`|`), for example `ship-one|ship-two`.

### Fictional test dataset

The clearly labelled test files create one fictional Cruise Line and two fictional Ships:

1. Import `csv-test-data/fictional-cruise-line.csv` as **Cruise Lines**.
2. Import `csv-test-data/fictional-ships.csv` as **Ships**.
3. Review each validation preview before selecting **Confirm import**.

All newly imported test records will be drafts.

After the Cruise Line and Ships exist, the additional fictional files can be imported in this order:

1. Import `csv-test-data/fictional-ship-features.csv` as **Ship Features**.
2. Import `csv-test-data/fictional-featured-journey.csv` as **Featured Journeys**.

### Required test sequence

1. **First import:** import the fictional Cruise Line first, then the Ships. Confirm that one line and two ships are created as drafts.
2. **Repeat import:** import both files again. Confirm that all rows are reported unchanged and no duplicates are created.
3. **Update:** change one non-blank field in a copied test CSV. Preview and import it, then confirm that only the matching `import_key` record is updated.
4. **Blank preservation:** blank a field that already contains content, import the file, and confirm the stored value remains unchanged.
5. **Invalid relationship:** change a ship's `cruise_line_import_key` to a nonexistent key. Confirm the preview rejects that row and that no orphan Ship is created.
6. **Ship Feature relationships:** repeat the same checks with `ship_import_key`, and confirm invalid Section values are rejected.
7. **Featured Journey relationships:** confirm the fictional Journey links to both test Ships using the pipe-delimited `ship_import_keys`; then test a missing or ambiguous key and confirm the whole row fails without changing it.
8. **Journey validation:** confirm negative prices, non-three-letter currencies and dates outside `YYYY-MM-DD` are rejected.

The importer never deletes records or clears fields. A validation preview expires after 30 minutes and is restricted to the administrator who uploaded it.

### Draft Cruise Line relationships

All relationship fields must allow both **Published** and **Draft** post statuses in their Pods relationship settings. Otherwise Pods can hide a correctly stored draft relationship from the editor and may reject it during a save.

In WordPress, open **Pods Admin → Edit Pods → Ships → Cruise line**. Under the relationship field options, set **Limit list by Post Status** to include both **Published** and **Draft**, then save the field and Pod. Do not publish test records to work around this setting.

Apply the same setting to:

- **Pods Admin → Edit Pods → Ship Features → Ship**
- **Pods Admin → Edit Pods → Featured Journeys → Cruise line**
- **Pods Admin → Edit Pods → Featured Journeys → Ships**

## Next stage

Pods provides the structured fields while this plugin remains the owner of post-type registration. Pods should extend the existing content types rather than recreating them.
