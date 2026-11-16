# Horizon Cruise Content

This folder contains the source for the **Horizon Cruise Content** WordPress plugin.

The plugin registers four structured content types:

- `cruise_line` — Cruise Lines
- `ship` — Ships
- `featured_journey` — Featured Journeys
- `ship_feature` — Ship Features

The content types are editable in WordPress and exposed through the standard REST API. They do not have WordPress-rendered public pages or archives. The separate Next.js application will eventually render their public pages.

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

Draft and private records require normal WordPress REST authentication.

## Deactivation

Deactivation unregisters the content types and refreshes routing rules. It does not delete posts, metadata, media or revisions. Reactivating the plugin makes the stored records available again.

No uninstall data-removal routine is included.

## Next stage

Pods will provide the structured fields after the field model has been agreed. This plugin must remain the owner of the post-type registration; Pods should extend the existing content types rather than recreating them.
