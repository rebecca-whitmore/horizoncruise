<?php
/**
 * Plugin Name:       Horizon Cruise Content
 * Description:       Registers structured cruise lines, ships, and featured journeys for the Horizon Cruise headless WordPress CMS.
 * Version:           0.2.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Horizon Cruise
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       horizon-cruise-content
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers Horizon Cruise's structured content types.
 *
 * These records are managed in WordPress and exposed through the REST API,
 * but WordPress must not render public archive or single pages for them. The
 * public presentation will be provided by the separate Next.js application.
 *
 * @return void
 */
function horizon_cruise_content_register_post_types() {
	$shared_args = array(
		'public'              => false,
		'publicly_queryable'  => false,
		'exclude_from_search' => true,
		'show_ui'             => true,
		'show_in_menu'        => true,
		'show_in_admin_bar'   => true,
		'show_in_nav_menus'   => false,
		'show_in_rest'        => true,
		'has_archive'         => false,
		'hierarchical'        => false,
		'rewrite'             => false,
		'query_var'           => false,
		'map_meta_cap'        => true,
		'supports'            => array( 'title', 'thumbnail', 'revisions' ),
	);

	register_post_type(
		'cruise_line',
		array_merge(
			$shared_args,
			array(
				'labels'        => array(
					'name'                     => __( 'Cruise Lines', 'horizon-cruise-content' ),
					'singular_name'            => __( 'Cruise Line', 'horizon-cruise-content' ),
					'add_new'                  => __( 'Add New', 'horizon-cruise-content' ),
					'add_new_item'             => __( 'Add New Cruise Line', 'horizon-cruise-content' ),
					'edit_item'                => __( 'Edit Cruise Line', 'horizon-cruise-content' ),
					'new_item'                 => __( 'New Cruise Line', 'horizon-cruise-content' ),
					'view_item'                => __( 'View Cruise Line Data', 'horizon-cruise-content' ),
					'view_items'               => __( 'View Cruise Line Data', 'horizon-cruise-content' ),
					'search_items'             => __( 'Search Cruise Lines', 'horizon-cruise-content' ),
					'not_found'                => __( 'No cruise lines found.', 'horizon-cruise-content' ),
					'not_found_in_trash'       => __( 'No cruise lines found in Trash.', 'horizon-cruise-content' ),
					'all_items'                => __( 'All Cruise Lines', 'horizon-cruise-content' ),
					'archives'                 => __( 'Cruise Line Archives', 'horizon-cruise-content' ),
					'attributes'               => __( 'Cruise Line Attributes', 'horizon-cruise-content' ),
					'insert_into_item'         => __( 'Insert into cruise line', 'horizon-cruise-content' ),
					'uploaded_to_this_item'    => __( 'Uploaded to this cruise line', 'horizon-cruise-content' ),
					'featured_image'           => __( 'Cruise Line Image', 'horizon-cruise-content' ),
					'set_featured_image'       => __( 'Set cruise line image', 'horizon-cruise-content' ),
					'remove_featured_image'    => __( 'Remove cruise line image', 'horizon-cruise-content' ),
					'use_featured_image'       => __( 'Use as cruise line image', 'horizon-cruise-content' ),
					'item_published'           => __( 'Cruise line published.', 'horizon-cruise-content' ),
					'item_published_privately' => __( 'Cruise line published privately.', 'horizon-cruise-content' ),
					'item_reverted_to_draft'   => __( 'Cruise line reverted to draft.', 'horizon-cruise-content' ),
					'item_scheduled'           => __( 'Cruise line scheduled.', 'horizon-cruise-content' ),
					'item_updated'             => __( 'Cruise line updated.', 'horizon-cruise-content' ),
					'menu_name'                => __( 'Cruise Lines', 'horizon-cruise-content' ),
				),
				'menu_icon'     => 'dashicons-admin-site-alt3',
				'menu_position' => 20,
				'rest_base'     => 'cruise-lines',
			)
		)
	);

	register_post_type(
		'ship',
		array_merge(
			$shared_args,
			array(
				'labels'        => array(
					'name'                     => __( 'Ships', 'horizon-cruise-content' ),
					'singular_name'            => __( 'Ship', 'horizon-cruise-content' ),
					'add_new'                  => __( 'Add New', 'horizon-cruise-content' ),
					'add_new_item'             => __( 'Add New Ship', 'horizon-cruise-content' ),
					'edit_item'                => __( 'Edit Ship', 'horizon-cruise-content' ),
					'new_item'                 => __( 'New Ship', 'horizon-cruise-content' ),
					'view_item'                => __( 'View Ship Data', 'horizon-cruise-content' ),
					'view_items'               => __( 'View Ship Data', 'horizon-cruise-content' ),
					'search_items'             => __( 'Search Ships', 'horizon-cruise-content' ),
					'not_found'                => __( 'No ships found.', 'horizon-cruise-content' ),
					'not_found_in_trash'       => __( 'No ships found in Trash.', 'horizon-cruise-content' ),
					'all_items'                => __( 'All Ships', 'horizon-cruise-content' ),
					'archives'                 => __( 'Ship Archives', 'horizon-cruise-content' ),
					'attributes'               => __( 'Ship Attributes', 'horizon-cruise-content' ),
					'insert_into_item'         => __( 'Insert into ship', 'horizon-cruise-content' ),
					'uploaded_to_this_item'    => __( 'Uploaded to this ship', 'horizon-cruise-content' ),
					'featured_image'           => __( 'Ship Image', 'horizon-cruise-content' ),
					'set_featured_image'       => __( 'Set ship image', 'horizon-cruise-content' ),
					'remove_featured_image'    => __( 'Remove ship image', 'horizon-cruise-content' ),
					'use_featured_image'       => __( 'Use as ship image', 'horizon-cruise-content' ),
					'item_published'           => __( 'Ship published.', 'horizon-cruise-content' ),
					'item_published_privately' => __( 'Ship published privately.', 'horizon-cruise-content' ),
					'item_reverted_to_draft'   => __( 'Ship reverted to draft.', 'horizon-cruise-content' ),
					'item_scheduled'           => __( 'Ship scheduled.', 'horizon-cruise-content' ),
					'item_updated'             => __( 'Ship updated.', 'horizon-cruise-content' ),
					'menu_name'                => __( 'Ships', 'horizon-cruise-content' ),
				),
				'menu_icon'     => 'dashicons-palmtree',
				'menu_position' => 21,
				'rest_base'     => 'ships',
			)
		)
	);

	register_post_type(
		'featured_journey',
		array_merge(
			$shared_args,
			array(
				'labels'        => array(
					'name'                     => __( 'Featured Journeys', 'horizon-cruise-content' ),
					'singular_name'            => __( 'Featured Journey', 'horizon-cruise-content' ),
					'add_new'                  => __( 'Add New', 'horizon-cruise-content' ),
					'add_new_item'             => __( 'Add New Featured Journey', 'horizon-cruise-content' ),
					'edit_item'                => __( 'Edit Featured Journey', 'horizon-cruise-content' ),
					'new_item'                 => __( 'New Featured Journey', 'horizon-cruise-content' ),
					'view_item'                => __( 'View Featured Journey Data', 'horizon-cruise-content' ),
					'view_items'               => __( 'View Featured Journey Data', 'horizon-cruise-content' ),
					'search_items'             => __( 'Search Featured Journeys', 'horizon-cruise-content' ),
					'not_found'                => __( 'No featured journeys found.', 'horizon-cruise-content' ),
					'not_found_in_trash'       => __( 'No featured journeys found in Trash.', 'horizon-cruise-content' ),
					'all_items'                => __( 'All Featured Journeys', 'horizon-cruise-content' ),
					'archives'                 => __( 'Featured Journey Archives', 'horizon-cruise-content' ),
					'attributes'               => __( 'Featured Journey Attributes', 'horizon-cruise-content' ),
					'insert_into_item'         => __( 'Insert into featured journey', 'horizon-cruise-content' ),
					'uploaded_to_this_item'    => __( 'Uploaded to this featured journey', 'horizon-cruise-content' ),
					'featured_image'           => __( 'Featured Journey Image', 'horizon-cruise-content' ),
					'set_featured_image'       => __( 'Set featured journey image', 'horizon-cruise-content' ),
					'remove_featured_image'    => __( 'Remove featured journey image', 'horizon-cruise-content' ),
					'use_featured_image'       => __( 'Use as featured journey image', 'horizon-cruise-content' ),
					'item_published'           => __( 'Featured journey published.', 'horizon-cruise-content' ),
					'item_published_privately' => __( 'Featured journey published privately.', 'horizon-cruise-content' ),
					'item_reverted_to_draft'   => __( 'Featured journey reverted to draft.', 'horizon-cruise-content' ),
					'item_scheduled'           => __( 'Featured journey scheduled.', 'horizon-cruise-content' ),
					'item_updated'             => __( 'Featured journey updated.', 'horizon-cruise-content' ),
					'menu_name'                => __( 'Featured Journeys', 'horizon-cruise-content' ),
				),
				'menu_icon'     => 'dashicons-location-alt',
				'menu_position' => 22,
				'rest_base'     => 'featured-journeys',
			)
		)
	);

	register_post_type(
		'ship_feature',
		array_merge(
			$shared_args,
			array(
				'labels'        => array(
					'name'                     => __( 'Ship Features', 'horizon-cruise-content' ),
					'singular_name'            => __( 'Ship Feature', 'horizon-cruise-content' ),
					'add_new'                  => __( 'Add New', 'horizon-cruise-content' ),
					'add_new_item'             => __( 'Add New Ship Feature', 'horizon-cruise-content' ),
					'edit_item'                => __( 'Edit Ship Feature', 'horizon-cruise-content' ),
					'new_item'                 => __( 'New Ship Feature', 'horizon-cruise-content' ),
					'view_item'                => __( 'View Ship Feature Data', 'horizon-cruise-content' ),
					'view_items'               => __( 'View Ship Feature Data', 'horizon-cruise-content' ),
					'search_items'             => __( 'Search Ship Features', 'horizon-cruise-content' ),
					'not_found'                => __( 'No ship features found.', 'horizon-cruise-content' ),
					'not_found_in_trash'       => __( 'No ship features found in Trash.', 'horizon-cruise-content' ),
					'all_items'                => __( 'All Ship Features', 'horizon-cruise-content' ),
					'archives'                 => __( 'Ship Feature Archives', 'horizon-cruise-content' ),
					'attributes'               => __( 'Ship Feature Attributes', 'horizon-cruise-content' ),
					'insert_into_item'         => __( 'Insert into ship feature', 'horizon-cruise-content' ),
					'uploaded_to_this_item'    => __( 'Uploaded to this ship feature', 'horizon-cruise-content' ),
					'featured_image'           => __( 'Ship Feature Image', 'horizon-cruise-content' ),
					'set_featured_image'       => __( 'Set ship feature image', 'horizon-cruise-content' ),
					'remove_featured_image'    => __( 'Remove ship feature image', 'horizon-cruise-content' ),
					'use_featured_image'       => __( 'Use as ship feature image', 'horizon-cruise-content' ),
					'item_published'           => __( 'Ship feature published.', 'horizon-cruise-content' ),
					'item_published_privately' => __( 'Ship feature published privately.', 'horizon-cruise-content' ),
					'item_reverted_to_draft'   => __( 'Ship feature reverted to draft.', 'horizon-cruise-content' ),
					'item_scheduled'           => __( 'Ship feature scheduled.', 'horizon-cruise-content' ),
					'item_updated'             => __( 'Ship feature updated.', 'horizon-cruise-content' ),
					'menu_name'                => __( 'Ship Features', 'horizon-cruise-content' ),
				),
				'menu_icon'     => 'dashicons-star-filled',
				'menu_position' => 23,
				'rest_base'     => 'ship-features',
			)
		)
	);
}
add_action( 'init', 'horizon_cruise_content_register_post_types' );

/**
 * Registers the post types before refreshing WordPress's routing rules.
 * No content is created or removed during activation.
 *
 * @return void
 */
function horizon_cruise_content_activate() {
	horizon_cruise_content_register_post_types();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'horizon_cruise_content_activate' );

/**
 * Refreshes routing rules only. Deactivation deliberately preserves all data.
 *
 * @return void
 */
function horizon_cruise_content_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'horizon_cruise_content_deactivate' );
