<?php
/**
 * Plugin Name:       Horizon Cruise Content
 * Description:       Registers structured cruise lines, ships, and featured journeys for the Horizon Cruise headless WordPress CMS.
 * Version:           0.4.2
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

require_once plugin_dir_path( __FILE__ ) . 'includes/class-horizon-cruise-csv-importer.php';

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
 * Validates REST relationship IDs as positive integers.
 *
 * @param mixed           $value   Submitted parameter value.
 * @param WP_REST_Request $request Current REST request.
 * @param string          $param   Parameter name.
 * @return true|WP_Error
 */
function horizon_cruise_content_validate_positive_integer( $value, $request, $param ) {
	$valid = false !== filter_var(
		$value,
		FILTER_VALIDATE_INT,
		array( 'options' => array( 'min_range' => 1 ) )
	);

	if ( $valid ) {
		return true;
	}

	return new WP_Error(
		'rest_invalid_param',
		sprintf(
			/* translators: %s: REST parameter name. */
			__( '%s must be a positive integer.', 'horizon-cruise-content' ),
			$param
		),
		array( 'status' => 400 )
	);
}

/**
 * Registers the Cruise Line relationship filter on the Ships collection.
 *
 * The hook name uses the internal `ship` post type, not its `ships` REST base.
 *
 * @param array $params Registered collection parameters.
 * @return array
 */
function horizon_cruise_content_ship_collection_params( $params ) {
	$params['cruise_line'] = array(
		'description'       => __( 'Limit ships to the exact related Cruise Line post ID.', 'horizon-cruise-content' ),
		'type'              => 'integer',
		'minimum'           => 1,
		'sanitize_callback' => 'absint',
		'validate_callback' => 'horizon_cruise_content_validate_positive_integer',
	);

	return $params;
}
add_filter( 'rest_ship_collection_params', 'horizon_cruise_content_ship_collection_params' );

/**
 * Extracts integer IDs from the scalar, object or array shapes Pods may return.
 *
 * @param mixed $value Pods relationship value.
 * @return int[]
 */
function horizon_cruise_content_extract_relationship_ids( $value ) {
	if ( is_numeric( $value ) ) {
		return array( (int) $value );
	}
	if ( is_object( $value ) && isset( $value->ID ) ) {
		return array( (int) $value->ID );
	}
	if ( ! is_array( $value ) ) {
		return array();
	}
	if ( isset( $value['ID'] ) && is_numeric( $value['ID'] ) ) {
		return array( (int) $value['ID'] );
	}

	$ids = array();
	foreach ( $value as $item ) {
		$ids = array_merge( $ids, horizon_cruise_content_extract_relationship_ids( $item ) );
	}

	return array_values( array_unique( array_filter( array_map( 'absint', $ids ) ) ) );
}

/**
 * Finds Ship IDs by reading the relationship through Pods' field API.
 *
 * The live site proved that the relationship is readable while a Pods::find()
 * traversal returned no rows. Reading `cruise_line.ID` for each Ship delegates
 * the physical storage detail to Pods and keeps the comparison exact.
 *
 * @param int $cruise_line_id Cruise Line post ID.
 * @return int[]
 */
function horizon_cruise_content_get_ship_ids_for_cruise_line( $cruise_line_id ) {
	$cruise_line_id = absint( $cruise_line_id );
	if ( ! $cruise_line_id || ! function_exists( 'pods' ) ) {
		return array();
	}

	$candidate_ids = get_posts(
		array(
			'post_type'              => 'ship',
			'post_status'            => array_values( get_post_stati() ),
			'posts_per_page'         => -1,
			'fields'                 => 'ids',
			'no_found_rows'          => true,
			'orderby'                => 'ID',
			'order'                  => 'ASC',
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
		)
	);

	$ship_ids = array();
	foreach ( $candidate_ids as $candidate_id ) {
		$ship = pods( 'ship', $candidate_id );
		if ( ! $ship ) {
			continue;
		}

		$related_ids = horizon_cruise_content_extract_relationship_ids(
			$ship->field( 'cruise_line.ID' )
		);
		if ( in_array( $cruise_line_id, $related_ids, true ) ) {
			$ship_ids[] = absint( $candidate_id );
		}
	}

	return array_values( array_unique( $ship_ids ) );
}

/**
 * Applies the exact Cruise Line relationship to the standard Ships query.
 *
 * WordPress remains responsible for post status, permissions, ordering and
 * pagination. `[0]` is deliberate: an empty `post__in` means "no restriction"
 * to WP_Query and could otherwise expose every published Ship.
 *
 * @param array           $args    WP_Query arguments prepared by REST.
 * @param WP_REST_Request $request Current REST request.
 * @return array
 */
function horizon_cruise_content_filter_ships_by_cruise_line( $args, $request ) {
	if ( ! $request->has_param( 'cruise_line' ) ) {
		return $args;
	}

	$ship_ids = horizon_cruise_content_get_ship_ids_for_cruise_line(
		$request->get_param( 'cruise_line' )
	);

	if ( isset( $args['post__in'] ) && is_array( $args['post__in'] ) ) {
		$ship_ids = array_values( array_intersect( array_map( 'absint', $args['post__in'] ), $ship_ids ) );
	}

	$args['post__in'] = $ship_ids ? $ship_ids : array( 0 );

	return $args;
}
add_filter( 'rest_ship_query', 'horizon_cruise_content_filter_ships_by_cruise_line', 10, 2 );

/**
 * Returns whether a post type belongs to Horizon Cruise structured content.
 *
 * @param string $post_type WordPress post type.
 * @return bool
 */
function horizon_cruise_content_is_content_type( $post_type ) {
	return in_array( $post_type, array( 'cruise_line', 'ship', 'featured_journey', 'ship_feature' ), true );
}

/**
 * Removes discussion controls from every Horizon Cruise editing screen.
 *
 * @return void
 */
function horizon_cruise_content_remove_discussion_controls() {
	foreach ( array( 'cruise_line', 'ship', 'featured_journey', 'ship_feature' ) as $post_type ) {
		remove_post_type_support( $post_type, 'comments' );
		remove_post_type_support( $post_type, 'trackbacks' );
		remove_meta_box( 'commentstatusdiv', $post_type, 'normal' );
		remove_meta_box( 'commentsdiv', $post_type, 'normal' );
	}
}
add_action( 'admin_menu', 'horizon_cruise_content_remove_discussion_controls', 100 );
add_action( 'add_meta_boxes', 'horizon_cruise_content_remove_discussion_controls', 100 );

/**
 * Forces comments and pingbacks closed whenever an HC record is saved.
 *
 * Ordinary WordPress Posts and other post types are deliberately untouched.
 *
 * @param array $data    Sanitized post data.
 * @param array $postarr Raw post data.
 * @return array
 */
function horizon_cruise_content_close_discussion_on_save( $data, $postarr ) {
	if ( isset( $data['post_type'] ) && horizon_cruise_content_is_content_type( $data['post_type'] ) ) {
		$data['comment_status'] = 'closed';
		$data['ping_status']    = 'closed';
	}

	return $data;
}
add_filter( 'wp_insert_post_data', 'horizon_cruise_content_close_discussion_on_save', 10, 2 );

/**
 * Ensures existing HC records never accept comments or pingbacks publicly.
 *
 * This enforces closure at runtime without bulk-modifying stored records.
 *
 * @param bool $open    Whether comments or pings are open.
 * @param int  $post_id Post ID.
 * @return bool
 */
function horizon_cruise_content_force_discussion_closed( $open, $post_id ) {
	$post_type = get_post_type( $post_id );
	return horizon_cruise_content_is_content_type( $post_type ) ? false : $open;
}
add_filter( 'comments_open', 'horizon_cruise_content_force_discussion_closed', 10, 2 );
add_filter( 'pings_open', 'horizon_cruise_content_force_discussion_closed', 10, 2 );

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
