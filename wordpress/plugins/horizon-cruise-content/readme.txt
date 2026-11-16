=== Horizon Cruise Content ===
Contributors: horizoncruise
Tags: headless, custom post types, cruise
Requires at least: 6.0
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 0.3.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Registers the structured content types used by the Horizon Cruise headless WordPress CMS.

== Description ==

Horizon Cruise Content registers four custom post types:

* Cruise Lines (`cruise_line`)
* Ships (`ship`)
* Featured Journeys (`featured_journey`)
* Ship Features (`ship_feature`)

Each type is available in the WordPress administration area and through the standard WordPress REST API. WordPress public archives and single pages remain disabled because the separate Next.js application will provide the public website.

The plugin deliberately enables only titles, featured images and revisions. Structured fields will be configured separately through Pods.

No content is deleted when the plugin is deactivated.

== Installation ==

1. In WordPress, go to Plugins > Add New Plugin > Upload Plugin.
2. Select `horizon-cruise-content.zip`.
3. Choose Install Now.
4. Activate Horizon Cruise Content.
5. Confirm that Cruise Lines, Ships, Featured Journeys and Ship Features appear in the WordPress admin menu.
6. In Settings > Permalinks, no change should be required. Saving the page once is safe if the REST routes are not immediately visible.

Do not configure Pods fields until the content model for the next stage has been agreed.

== REST API ==

After activation, published records are available from:

* `/wp-json/wp/v2/cruise-lines`
* `/wp-json/wp/v2/ships`
* `/wp-json/wp/v2/featured-journeys`
* `/wp-json/wp/v2/ship-features`

The standard WordPress REST permissions apply to drafts and private records.

== CSV Import ==

Administrators can open Tools > Horizon Cruise Import to validate, preview and import Cruise Lines or Ships from UTF-8 CSV files. Pods must be active.

The importer matches only on a permanent private import key. New records are drafts, existing publication statuses are retained, and blank or omitted fields preserve existing values. Media is not imported in this version.

Templates and a clearly labelled fictional test dataset are bundled with the plugin.

== Changelog ==

= 0.3.1 =

* Improved draft Cruise Line relationship saving and verification for Ship imports.
* Prevented equivalent formatted values from causing unnecessary updates.
* Removed discussion controls and closed comments and pingbacks for Horizon Cruise content types.

= 0.3.0 =

* Added a preview-first administrator CSV importer for Cruise Lines and Ships.
* Added UTF-8 CSV templates and fictional draft test data.

= 0.2.0 =

* Added the Ship Features (`ship_feature`) content type.

= 0.1.0 =

* Initial custom post type registration.
