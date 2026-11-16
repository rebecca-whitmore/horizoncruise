=== Horizon Cruise Content ===
Contributors: horizoncruise
Tags: headless, custom post types, cruise
Requires at least: 6.0
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Registers the structured content types used by the Horizon Cruise headless WordPress CMS.

== Description ==

Horizon Cruise Content registers three custom post types:

* Cruise Lines (`cruise_line`)
* Ships (`ship`)
* Featured Journeys (`featured_journey`)

Each type is available in the WordPress administration area and through the standard WordPress REST API. WordPress public archives and single pages remain disabled because the separate Next.js application will provide the public website.

The plugin deliberately enables only titles, featured images and revisions. Structured fields will be configured separately through Pods.

No content is deleted when the plugin is deactivated.

== Installation ==

1. In WordPress, go to Plugins > Add New Plugin > Upload Plugin.
2. Select `horizon-cruise-content.zip`.
3. Choose Install Now.
4. Activate Horizon Cruise Content.
5. Confirm that Cruise Lines, Ships and Featured Journeys appear in the WordPress admin menu.
6. In Settings > Permalinks, no change should be required. Saving the page once is safe if the REST routes are not immediately visible.

Do not configure Pods fields until the content model for the next stage has been agreed.

== REST API ==

After activation, published records are available from:

* `/wp-json/wp/v2/cruise-lines`
* `/wp-json/wp/v2/ships`
* `/wp-json/wp/v2/featured-journeys`

The standard WordPress REST permissions apply to drafts and private records.

== Changelog ==

= 0.1.0 =

* Initial custom post type registration.

