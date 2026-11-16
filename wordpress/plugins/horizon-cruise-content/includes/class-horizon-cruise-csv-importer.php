<?php
/**
 * Administrator CSV importer for Horizon Cruise structured content.
 *
 * @package HorizonCruiseContent
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Imports Horizon Cruise structured content from validated CSV files.
 */
final class Horizon_Cruise_CSV_Importer {
	const IMPORT_KEY_META = '_horizon_cruise_import_key';
	const TRANSIENT_PREFIX = 'hc_csv_import_';
	const MAX_FILE_SIZE    = 2097152;

	/**
	 * Registers importer hooks.
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_page' ) );
		add_action( 'admin_post_hc_csv_preview', array( __CLASS__, 'handle_preview' ) );
		add_action( 'admin_post_hc_csv_import', array( __CLASS__, 'handle_import' ) );
	}

	/**
	 * Adds the importer beneath Tools.
	 *
	 * @return void
	 */
	public static function register_page() {
		add_management_page(
			__( 'Horizon Cruise CSV Import', 'horizon-cruise-content' ),
			__( 'Horizon Cruise Import', 'horizon-cruise-content' ),
			'manage_options',
			'horizon-cruise-import',
			array( __CLASS__, 'render_page' )
		);
	}

	/**
	 * Returns supported CSV definitions using the actual Pods field names.
	 *
	 * @return array
	 */
	private static function definitions() {
		return array(
			'cruise_line' => array(
				'label'         => __( 'Cruise Lines', 'horizon-cruise-content' ),
				'fields'        => array(
					'short_introduction' => 'paragraph',
					'full_overview'       => 'wysiwyg',
				),
				'relationships' => array(),
			),
			'ship'        => array(
				'label'         => __( 'Ships', 'horizon-cruise-content' ),
				'fields'        => array(
					'short_introduction' => 'paragraph',
					'full_overview'       => 'wysiwyg',
					'staterooms'          => 'wysiwyg',
					'dining'              => 'wysiwyg',
					'entertainment'       => 'wysiwyg',
					'health_fitness'      => 'wysiwyg',
					'younger_travellers'  => 'wysiwyg',
					'enrichment'           => 'wysiwyg',
				),
				'relationships' => array(
					'cruise_line_import_key' => array(
						'field'    => 'cruise_line',
						'target'   => 'cruise_line',
						'multiple' => false,
					),
				),
			),
			'ship_feature' => array(
				'label'         => __( 'Ship Features', 'horizon-cruise-content' ),
				'fields'        => array(
					'section'       => 'pick',
					'description'   => 'wysiwyg',
					'display_order' => 'number',
				),
				'relationships' => array(
					'ship_import_key' => array(
						'field'    => 'ship',
						'target'   => 'ship',
						'multiple' => false,
					),
				),
			),
			'featured_journey' => array(
				'label'         => __( 'Featured Journeys', 'horizon-cruise-content' ),
				'fields'        => array(
					'headline'                  => 'paragraph',
					'journey_overview'          => 'wysiwyg',
					'duration'                  => 'text',
					'dates'                     => 'text',
					'travelling_from'           => 'wysiwyg',
					'inclusions'                => 'wysiwyg',
					'personalise_this_holiday' => 'wysiwyg',
					'from_price'                => 'number',
					'currency'                  => 'text',
					'pricing_basis'             => 'paragraph',
					'price_checked_date'        => 'date',
					'availability_note'         => 'paragraph',
					'itinerary'                 => 'wysiwyg',
				),
				'relationships' => array(
					'cruise_line_import_key' => array(
						'field'    => 'cruise_line',
						'target'   => 'cruise_line',
						'multiple' => false,
					),
					'ship_import_keys' => array(
						'field'    => 'ships',
						'target'   => 'ship',
						'multiple' => true,
					),
				),
			),
		);
	}

	/**
	 * Renders the upload, preview, or result screen.
	 *
	 * @return void
	 */
	public static function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to import Horizon Cruise content.', 'horizon-cruise-content' ) );
		}

		$token = isset( $_GET['hc_token'] ) ? sanitize_key( wp_unslash( $_GET['hc_token'] ) ) : '';
		$state = $token ? get_transient( self::transient_key( $token ) ) : false;
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Horizon Cruise CSV Import', 'horizon-cruise-content' ); ?></h1>
			<p><?php esc_html_e( 'Import Horizon Cruise structured content. Every import is validated and previewed before any records are changed.', 'horizon-cruise-content' ); ?></p>
			<?php if ( ! function_exists( 'pods' ) ) : ?>
				<div class="notice notice-error"><p><?php esc_html_e( 'Pods must be active before this importer can save structured fields.', 'horizon-cruise-content' ); ?></p></div>
			<?php elseif ( is_array( $state ) && isset( $state['stage'] ) && 'preview' === $state['stage'] ) : ?>
				<?php self::render_preview( $token, $state ); ?>
			<?php elseif ( is_array( $state ) && isset( $state['stage'] ) && 'result' === $state['stage'] ) : ?>
				<?php self::render_results( $state ); ?>
			<?php else : ?>
				<?php if ( $token ) : ?>
					<div class="notice notice-warning"><p><?php esc_html_e( 'That import preview has expired. Please upload the CSV again.', 'horizon-cruise-content' ); ?></p></div>
				<?php endif; ?>
				<?php self::render_upload_form(); ?>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Renders the initial CSV upload form.
	 *
	 * @return void
	 */
	private static function render_upload_form() {
		?>
		<form method="post" enctype="multipart/form-data" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="hc_csv_preview">
			<?php wp_nonce_field( 'hc_csv_preview', 'hc_csv_nonce' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="hc-content-type"><?php esc_html_e( 'Content type', 'horizon-cruise-content' ); ?></label></th>
					<td>
						<select id="hc-content-type" name="content_type" required>
							<?php foreach ( self::definitions() as $post_type => $definition ) : ?>
								<option value="<?php echo esc_attr( $post_type ); ?>"><?php echo esc_html( $definition['label'] ); ?></option>
							<?php endforeach; ?>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="hc-csv-file"><?php esc_html_e( 'UTF-8 CSV file', 'horizon-cruise-content' ); ?></label></th>
					<td><input id="hc-csv-file" name="csv_file" type="file" accept=".csv,text/csv" required></td>
				</tr>
			</table>
			<?php submit_button( __( 'Validate and preview', 'horizon-cruise-content' ) ); ?>
		</form>
		<?php
	}

	/**
	 * Handles CSV upload and creates a non-mutating preview.
	 *
	 * @return void
	 */
	public static function handle_preview() {
		self::authorize( 'hc_csv_preview' );

		$definitions = self::definitions();
		$post_type   = isset( $_POST['content_type'] ) ? sanitize_key( wp_unslash( $_POST['content_type'] ) ) : '';
		if ( ! isset( $definitions[ $post_type ] ) ) {
			self::fail( __( 'Unsupported content type.', 'horizon-cruise-content' ) );
		}

		if ( empty( $_FILES['csv_file'] ) || ! is_array( $_FILES['csv_file'] ) ) {
			self::fail( __( 'No CSV file was uploaded.', 'horizon-cruise-content' ) );
		}

		$file = $_FILES['csv_file'];
		if ( UPLOAD_ERR_OK !== (int) $file['error'] ) {
			self::fail( sprintf( __( 'The CSV upload failed with error code %d.', 'horizon-cruise-content' ), (int) $file['error'] ) );
		}
		if ( (int) $file['size'] > self::MAX_FILE_SIZE ) {
			self::fail( __( 'The CSV is larger than the 2 MB import limit.', 'horizon-cruise-content' ) );
		}

		$parsed = self::parse_csv( $file['tmp_name'], $post_type );
		if ( is_wp_error( $parsed ) ) {
			self::fail( $parsed->get_error_message() );
		}

		$validation = self::validate_rows( $post_type, $parsed['headers'], $parsed['rows'] );
		$token      = wp_generate_password( 20, false, false );
		$state      = array(
			'stage'       => 'preview',
			'user_id'     => get_current_user_id(),
			'post_type'   => $post_type,
			'headers'     => $parsed['headers'],
			'rows'        => $parsed['rows'],
			'validation'  => $validation,
			'generated_at' => time(),
		);
		set_transient( self::transient_key( $token ), $state, 30 * MINUTE_IN_SECONDS );

		wp_safe_redirect( self::page_url( $token ) );
		exit;
	}

	/**
	 * Handles the confirmed import after validating all rows again.
	 *
	 * @return void
	 */
	public static function handle_import() {
		self::authorize( 'hc_csv_import' );

		$token = isset( $_POST['hc_token'] ) ? sanitize_key( wp_unslash( $_POST['hc_token'] ) ) : '';
		$state = $token ? get_transient( self::transient_key( $token ) ) : false;
		if ( ! is_array( $state ) || 'preview' !== $state['stage'] || get_current_user_id() !== (int) $state['user_id'] ) {
			self::fail( __( 'The import preview is invalid or has expired.', 'horizon-cruise-content' ) );
		}

		$validation = self::validate_rows( $state['post_type'], $state['headers'], $state['rows'] );
		$results    = self::apply_rows( $state['post_type'], $state['rows'], $validation );
		$state      = array(
			'stage'     => 'result',
			'user_id'   => get_current_user_id(),
			'post_type' => $state['post_type'],
			'results'   => $results,
		);
		set_transient( self::transient_key( $token ), $state, 30 * MINUTE_IN_SECONDS );

		wp_safe_redirect( self::page_url( $token ) );
		exit;
	}

	/**
	 * Parses an uploaded CSV without modifying WordPress data.
	 *
	 * @param string $path      Temporary uploaded file path.
	 * @param string $post_type Selected post type.
	 * @return array|WP_Error
	 */
	private static function parse_csv( $path, $post_type ) {
		$handle = fopen( $path, 'r' );
		if ( false === $handle ) {
			return new WP_Error( 'csv_open_failed', __( 'The uploaded CSV could not be opened.', 'horizon-cruise-content' ) );
		}

		$headers = fgetcsv( $handle );
		if ( false === $headers || empty( $headers ) ) {
			fclose( $handle );
			return new WP_Error( 'csv_empty', __( 'The CSV is empty or has no header row.', 'horizon-cruise-content' ) );
		}

		$headers[0] = preg_replace( '/^\xEF\xBB\xBF/', '', (string) $headers[0] );
		$headers    = array_map( 'trim', $headers );
		if ( count( $headers ) !== count( array_unique( $headers ) ) ) {
			fclose( $handle );
			return new WP_Error( 'duplicate_headers', __( 'The CSV contains duplicate column headings.', 'horizon-cruise-content' ) );
		}
		if ( ! in_array( 'import_key', $headers, true ) ) {
			fclose( $handle );
			return new WP_Error( 'missing_import_key', __( 'The CSV must contain an import_key column.', 'horizon-cruise-content' ) );
		}

		$definition = self::definitions()[ $post_type ];
		$allowed    = array_merge( array( 'import_key', 'title' ), array_keys( $definition['fields'] ), array_keys( $definition['relationships'] ) );
		$unknown = array_diff( $headers, $allowed );
		if ( $unknown ) {
			fclose( $handle );
			return new WP_Error(
				'unknown_headers',
				sprintf( __( 'Unsupported CSV columns: %s.', 'horizon-cruise-content' ), implode( ', ', $unknown ) )
			);
		}

		$rows        = array();
		$line_number = 1;
		while ( false !== ( $values = fgetcsv( $handle ) ) ) {
			++$line_number;
			if ( 1 === count( $values ) && null === $values[0] ) {
				continue;
			}
			if ( count( $values ) !== count( $headers ) ) {
				$rows[] = array(
					'_line'  => $line_number,
					'_error' => sprintf( __( 'Expected %1$d columns but found %2$d.', 'horizon-cruise-content' ), count( $headers ), count( $values ) ),
				);
				continue;
			}
			$row          = array_combine( $headers, $values );
			$row['_line'] = $line_number;
			$rows[]       = $row;
		}
		fclose( $handle );

		if ( empty( $rows ) ) {
			return new WP_Error( 'no_data_rows', __( 'The CSV contains no data rows.', 'horizon-cruise-content' ) );
		}

		return array( 'headers' => $headers, 'rows' => $rows );
	}

	/**
	 * Validates rows and calculates their proposed action without writing data.
	 *
	 * @param string $post_type Post type being imported.
	 * @param array  $headers   CSV headers.
	 * @param array  $rows      Parsed rows.
	 * @return array
	 */
	private static function validate_rows( $post_type, $headers, $rows ) {
		$key_counts = array();
		foreach ( $rows as $row ) {
			$key = isset( $row['import_key'] ) ? self::sanitize_import_key( $row['import_key'] ) : '';
			if ( '' !== $key ) {
				$key_counts[ $key ] = isset( $key_counts[ $key ] ) ? $key_counts[ $key ] + 1 : 1;
			}
		}

		$validation = array();
		foreach ( $rows as $index => $row ) {
			$errors = array();
			$key    = isset( $row['import_key'] ) ? self::sanitize_import_key( $row['import_key'] ) : '';
			if ( isset( $row['_error'] ) ) {
				$errors[] = $row['_error'];
			}
			if ( '' === $key ) {
				$errors[] = __( 'import_key is required.', 'horizon-cruise-content' );
			} elseif ( strlen( $key ) > 191 ) {
				$errors[] = __( 'import_key must be 191 characters or fewer.', 'horizon-cruise-content' );
			} elseif ( isset( $key_counts[ $key ] ) && $key_counts[ $key ] > 1 ) {
				$errors[] = __( 'Duplicate import_key in this CSV.', 'horizon-cruise-content' );
			}

			$matches = $key ? self::find_by_import_key( $post_type, $key ) : array();
			if ( count( $matches ) > 1 ) {
				$errors[] = __( 'More than one WordPress record has this import_key; the match is ambiguous.', 'horizon-cruise-content' );
			}
			$post_id = 1 === count( $matches ) ? (int) $matches[0] : 0;

			if ( ! $post_id && ( ! in_array( 'title', $headers, true ) || ! isset( $row['title'] ) || empty( trim( (string) $row['title'] ) ) ) ) {
				$errors[] = __( 'A non-blank title is required when creating a new record.', 'horizon-cruise-content' );
			}

			$relationships = self::validate_relationships( $post_type, $row, $post_id, $errors );
			self::validate_field_values( $post_type, $row, $errors );

			$action = $post_id ? self::proposed_action( $post_type, $post_id, $row, $relationships ) : 'create';
			if ( $errors ) {
				$action = 'failed';
			}

			$validation[ $index ] = array(
				'line'            => isset( $row['_line'] ) ? (int) $row['_line'] : $index + 2,
				'import_key'      => $key,
				'post_id'         => $post_id,
				'relationships'   => $relationships,
				'action'          => $action,
				'errors'          => $errors,
			);
		}

		return $validation;
	}

	/**
	 * Resolves every supplied relationship key before a row can be written.
	 *
	 * Blank relationship cells preserve existing values. New records require all
	 * configured relationships so they cannot be created as orphans.
	 *
	 * @param string $post_type Post type being imported.
	 * @param array  $row       Parsed CSV row.
	 * @param int    $post_id   Existing post ID, or zero for a new record.
	 * @param array  $errors    Validation errors passed by reference.
	 * @return array
	 */
	private static function validate_relationships( $post_type, $row, $post_id, &$errors ) {
		$resolved = array();
		foreach ( self::definitions()[ $post_type ]['relationships'] as $column => $relationship ) {
			$raw_value = isset( $row[ $column ] ) ? trim( (string) $row[ $column ] ) : '';
			if ( '' === $raw_value ) {
				if ( ! $post_id ) {
					$errors[] = sprintf( __( '%s is required when creating a new record.', 'horizon-cruise-content' ), $column );
				}
				continue;
			}

			$keys = $relationship['multiple'] ? explode( '|', $raw_value ) : array( $raw_value );
			$keys = array_map( array( __CLASS__, 'sanitize_import_key' ), $keys );
			if ( in_array( '', $keys, true ) ) {
				$errors[] = sprintf( __( '%s contains an empty relationship key.', 'horizon-cruise-content' ), $column );
				continue;
			}
			if ( count( $keys ) !== count( array_unique( $keys ) ) ) {
				$errors[] = sprintf( __( '%s contains a duplicate relationship key.', 'horizon-cruise-content' ), $column );
				continue;
			}

			$ids = array();
			foreach ( $keys as $key ) {
				$matches = self::find_by_import_key( $relationship['target'], $key, true );
				if ( 1 !== count( $matches ) ) {
					$errors[] = 0 === count( $matches )
						? sprintf( __( '%1$s key "%2$s" does not match an existing %3$s record.', 'horizon-cruise-content' ), $column, $key, $relationship['target'] )
						: sprintf( __( '%1$s key "%2$s" is ambiguous because it matches multiple %3$s records.', 'horizon-cruise-content' ), $column, $key, $relationship['target'] );
					continue;
				}
				$ids[] = (int) $matches[0];
			}

			if ( count( $ids ) === count( $keys ) ) {
				$resolved[ $relationship['field'] ] = $relationship['multiple'] ? $ids : $ids[0];
			}
		}

		return $resolved;
	}

	/**
	 * Validates type-specific non-relationship values before any row is written.
	 *
	 * @param string $post_type Post type being imported.
	 * @param array  $row       Parsed CSV row.
	 * @param array  $errors    Validation errors passed by reference.
	 * @return void
	 */
	private static function validate_field_values( $post_type, $row, &$errors ) {
		if ( 'ship_feature' === $post_type ) {
			if ( isset( $row['section'] ) && '' !== trim( (string) $row['section'] ) && ! in_array( trim( (string) $row['section'] ), self::ship_feature_sections(), true ) ) {
				$errors[] = __( 'section must be one of: staterooms, dining, entertainment, health_fitness, younger_travellers, enrichment.', 'horizon-cruise-content' );
			}
			if ( isset( $row['display_order'] ) && '' !== trim( (string) $row['display_order'] ) && ! preg_match( '/^\d+$/', trim( (string) $row['display_order'] ) ) ) {
				$errors[] = __( 'display_order must be a non-negative whole number.', 'horizon-cruise-content' );
			}
		}

		if ( 'featured_journey' === $post_type ) {
			if ( isset( $row['from_price'] ) && '' !== trim( (string) $row['from_price'] ) && ( ! is_numeric( trim( (string) $row['from_price'] ) ) || (float) $row['from_price'] < 0 ) ) {
				$errors[] = __( 'from_price must be a non-negative number.', 'horizon-cruise-content' );
			}
			if ( isset( $row['currency'] ) && '' !== trim( (string) $row['currency'] ) && ! preg_match( '/^[A-Za-z]{3}$/', trim( (string) $row['currency'] ) ) ) {
				$errors[] = __( 'currency must be a three-letter code such as GBP.', 'horizon-cruise-content' );
			}
			if ( isset( $row['price_checked_date'] ) && '' !== trim( (string) $row['price_checked_date'] ) && ! self::is_valid_iso_date( trim( (string) $row['price_checked_date'] ) ) ) {
				$errors[] = __( 'price_checked_date must be a valid date in YYYY-MM-DD format.', 'horizon-cruise-content' );
			}
		}
	}

	/**
	 * Returns the six values configured in the exported Ship Feature Pod.
	 *
	 * @return array
	 */
	private static function ship_feature_sections() {
		return array( 'staterooms', 'dining', 'entertainment', 'health_fitness', 'younger_travellers', 'enrichment' );
	}

	/**
	 * Validates an exact calendar date in YYYY-MM-DD format.
	 *
	 * @param string $value Date value.
	 * @return bool
	 */
	private static function is_valid_iso_date( $value ) {
		$date = DateTime::createFromFormat( '!Y-m-d', $value );
		return $date && $date->format( 'Y-m-d' ) === $value;
	}

	/**
	 * Determines whether an existing record would change.
	 *
	 * @param string $post_type      Post type.
	 * @param int    $post_id        Existing post ID.
	 * @param array  $row            CSV row.
	 * @param array  $relationships Resolved relationship IDs keyed by Pods field.
	 * @return string
	 */
	private static function proposed_action( $post_type, $post_id, $row, $relationships ) {
		if ( isset( $row['title'] ) && '' !== trim( (string) $row['title'] ) && ! self::values_are_equivalent( get_post_field( 'post_title', $post_id, 'raw' ), self::sanitize_title_value( $row['title'] ), 'text' ) ) {
			return 'update';
		}

		foreach ( self::definitions()[ $post_type ]['fields'] as $field => $field_type ) {
			if ( isset( $row[ $field ] ) && '' !== trim( (string) $row[ $field ] ) ) {
				$new_value = self::sanitize_field_value( $row[ $field ], $field_type, $field );
				$old_value = self::get_pod_field_value( $post_type, $post_id, $field );
				if ( ! self::values_are_equivalent( $old_value, $new_value, $field_type ) ) {
					return 'update';
				}
			}
		}

		foreach ( $relationships as $field => $ids ) {
			$stored_ids = self::get_relationship_ids( $post_type, $post_id, $field );
			if ( $stored_ids !== self::normalize_relationship_ids( $ids ) ) {
				return 'update';
			}
		}

		return 'unchanged';
	}

	/**
	 * Applies rows after validation and returns a detailed report.
	 *
	 * @param string $post_type Post type.
	 * @param array  $rows      Parsed rows.
	 * @param array  $validation Fresh validation state.
	 * @return array
	 */
	private static function apply_rows( $post_type, $rows, $validation ) {
		$report = array( 'created' => 0, 'updated' => 0, 'unchanged' => 0, 'failed' => 0, 'rows' => array() );

		foreach ( $validation as $index => $check ) {
			if ( 'failed' === $check['action'] ) {
				++$report['failed'];
				$report['rows'][] = array_merge( $check, array( 'message' => implode( ' ', $check['errors'] ) ) );
				continue;
			}
			if ( 'unchanged' === $check['action'] ) {
				++$report['unchanged'];
				$report['rows'][] = array_merge( $check, array( 'message' => __( 'No submitted value differs from WordPress.', 'horizon-cruise-content' ) ) );
				continue;
			}

			$row       = $rows[ $index ];
			$is_create = ! $check['post_id'];
			$post_id   = $check['post_id'];
			$pod_data  = array();
			foreach ( self::definitions()[ $post_type ]['fields'] as $field => $field_type ) {
				if ( isset( $row[ $field ] ) && '' !== trim( (string) $row[ $field ] ) ) {
					$new_value = self::sanitize_field_value( $row[ $field ], $field_type, $field );
					if ( $is_create || ! self::values_are_equivalent( self::get_pod_field_value( $post_type, $post_id, $field ), $new_value, $field_type ) ) {
						$pod_data[ $field ] = $new_value;
					}
				}
			}
			$changed_relationships = array();
			foreach ( $check['relationships'] as $field => $ids ) {
				if ( $is_create || self::get_relationship_ids( $post_type, $post_id, $field ) !== self::normalize_relationship_ids( $ids ) ) {
					$changed_relationships[ $field ] = $ids;
					$pod_data[ $field ]              = $ids;
				}
			}
			$title_changed = isset( $row['title'] ) && '' !== trim( (string) $row['title'] ) && ( $is_create || ! self::values_are_equivalent( get_post_field( 'post_title', $post_id, 'raw' ), self::sanitize_title_value( $row['title'] ), 'text' ) );

			if ( ! $is_create && ! $pod_data && ! $title_changed ) {
				++$report['unchanged'];
				$report['rows'][] = array_merge( $check, array( 'action' => 'unchanged', 'message' => __( 'No submitted value differs from WordPress.', 'horizon-cruise-content' ) ) );
				continue;
			}

			if ( $is_create ) {
				$pod_data['post_title']  = self::sanitize_title_value( $row['title'] );
				$pod_data['post_status'] = 'draft';
				$pod_data['comment_status'] = 'closed';
				$pod_data['ping_status']    = 'closed';
				$pod                     = pods( $post_type );
				$post_id                 = $pod ? $pod->add( $pod_data ) : false;
				if ( ! $post_id ) {
					++$report['failed'];
					$report['rows'][] = array_merge( $check, array( 'action' => 'failed', 'message' => __( 'Pods could not create the draft record.', 'horizon-cruise-content' ) ) );
					continue;
				}
				add_post_meta( $post_id, self::IMPORT_KEY_META, $check['import_key'], true );
			} else {
				if ( $pod_data ) {
					$pod   = pods( $post_type, $post_id );
					$saved = $pod ? $pod->save( $pod_data ) : false;
					if ( false === $saved ) {
						++$report['failed'];
						$report['rows'][] = array_merge( $check, array( 'action' => 'failed', 'message' => __( 'Pods could not save the structured fields.', 'horizon-cruise-content' ) ) );
						continue;
					}
				}
				if ( $title_changed ) {
					$title_result = wp_update_post(
						array( 'ID' => $post_id, 'post_title' => self::sanitize_title_value( $row['title'] ) ),
						true
					);
					if ( is_wp_error( $title_result ) ) {
						++$report['failed'];
						$report['rows'][] = array_merge( $check, array( 'action' => 'failed', 'message' => $title_result->get_error_message() ) );
						continue;
					}
				}
			}

			foreach ( $changed_relationships as $field => $ids ) {
				$expected_ids = self::normalize_relationship_ids( $ids );
				if ( self::get_relationship_ids( $post_type, $post_id, $field ) !== $expected_ids ) {
					$relationship_pod   = pods( $post_type, $post_id );
					$relationship_saved = $relationship_pod ? $relationship_pod->save( $field, $ids ) : false;
					if ( false === $relationship_saved || self::get_relationship_ids( $post_type, $post_id, $field ) !== $expected_ids ) {
						++$report['failed'];
						$report['rows'][] = array_merge( $check, array( 'action' => 'failed', 'message' => sprintf( __( 'Pods did not retain the %s relationship. Check that its relationship field allows draft targets.', 'horizon-cruise-content' ), $field ) ) );
						continue 2;
					}
				}
			}

			$result_action = $is_create ? 'created' : 'updated';
			++$report[ $result_action ];
			$report['rows'][] = array_merge(
				$check,
				array(
					'action'  => $result_action,
					'post_id' => $post_id,
					'message' => $is_create
						? __( 'Created as a draft.', 'horizon-cruise-content' )
						: __( 'Updated without changing publication status.', 'horizon-cruise-content' ),
				)
			);
		}

		return $report;
	}

	/**
	 * Finds records exclusively by the private import key.
	 *
	 * @param string $post_type          Post type.
	 * @param string $key                Import key.
	 * @param bool   $relationship_target Whether only selectable draft/published targets should match.
	 * @return array
	 */
	private static function find_by_import_key( $post_type, $key, $relationship_target = false ) {
		return get_posts(
			array(
				'post_type'      => $post_type,
				'post_status'    => $relationship_target ? array( 'draft', 'publish' ) : array( 'draft', 'publish', 'pending', 'private', 'future' ),
				'posts_per_page' => 2,
				'fields'         => 'ids',
				'no_found_rows'  => true,
				'meta_key'       => self::IMPORT_KEY_META,
				'meta_value'     => $key,
			)
		);
	}

	/**
	 * Renders validation results and confirmation control.
	 *
	 * @param string $token Preview token.
	 * @param array  $state Preview state.
	 * @return void
	 */
	private static function render_preview( $token, $state ) {
		$counts = array( 'create' => 0, 'update' => 0, 'unchanged' => 0, 'failed' => 0 );
		foreach ( $state['validation'] as $row ) {
			++$counts[ $row['action'] ];
		}
		?>
		<h2><?php esc_html_e( 'Validation preview - no changes have been made', 'horizon-cruise-content' ); ?></h2>
		<p><?php echo esc_html( sprintf( __( 'Create: %1$d | Update: %2$d | Unchanged: %3$d | Failed: %4$d', 'horizon-cruise-content' ), $counts['create'], $counts['update'], $counts['unchanged'], $counts['failed'] ) ); ?></p>
		<?php self::render_report_table( $state['validation'] ); ?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="hc_csv_import">
			<input type="hidden" name="hc_token" value="<?php echo esc_attr( $token ); ?>">
			<?php wp_nonce_field( 'hc_csv_import', 'hc_csv_nonce' ); ?>
			<?php submit_button( __( 'Confirm import', 'horizon-cruise-content' ), 'primary', 'submit', false ); ?>
			<a class="button" href="<?php echo esc_url( self::page_url() ); ?>"><?php esc_html_e( 'Cancel', 'horizon-cruise-content' ); ?></a>
		</form>
		<?php
	}

	/**
	 * Renders final import results.
	 *
	 * @param array $state Result state.
	 * @return void
	 */
	private static function render_results( $state ) {
		$results = $state['results'];
		?>
		<h2><?php esc_html_e( 'Import complete', 'horizon-cruise-content' ); ?></h2>
		<p><?php echo esc_html( sprintf( __( 'Created: %1$d | Updated: %2$d | Unchanged: %3$d | Failed: %4$d', 'horizon-cruise-content' ), $results['created'], $results['updated'], $results['unchanged'], $results['failed'] ) ); ?></p>
		<?php self::render_report_table( $results['rows'] ); ?>
		<p><a class="button button-primary" href="<?php echo esc_url( self::page_url() ); ?>"><?php esc_html_e( 'Start another import', 'horizon-cruise-content' ); ?></a></p>
		<?php
	}

	/**
	 * Renders row-level status details.
	 *
	 * @param array $rows Report rows.
	 * @return void
	 */
	private static function render_report_table( $rows ) {
		?>
		<table class="widefat striped">
			<thead><tr><th><?php esc_html_e( 'CSV line', 'horizon-cruise-content' ); ?></th><th><?php esc_html_e( 'Import key', 'horizon-cruise-content' ); ?></th><th><?php esc_html_e( 'Action', 'horizon-cruise-content' ); ?></th><th><?php esc_html_e( 'Details', 'horizon-cruise-content' ); ?></th></tr></thead>
			<tbody>
			<?php foreach ( $rows as $row ) : ?>
				<?php $message = isset( $row['message'] ) ? $row['message'] : ( ! empty( $row['errors'] ) ? implode( ' ', $row['errors'] ) : __( 'Ready.', 'horizon-cruise-content' ) ); ?>
				<tr><td><?php echo esc_html( $row['line'] ); ?></td><td><code><?php echo esc_html( $row['import_key'] ); ?></code></td><td><?php echo esc_html( ucfirst( $row['action'] ) ); ?></td><td><?php echo esc_html( $message ); ?></td></tr>
			<?php endforeach; ?>
			</tbody>
		</table>
		<?php
	}

	/**
	 * Checks administrator capability and request nonce.
	 *
	 * @param string $action Nonce action.
	 * @return void
	 */
	private static function authorize( $action ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die(
				esc_html__( 'You do not have permission to run this importer.', 'horizon-cruise-content' ),
				esc_html__( 'Horizon Cruise import error', 'horizon-cruise-content' ),
				array( 'response' => 403 )
			);
		}
		check_admin_referer( $action, 'hc_csv_nonce' );
		if ( ! function_exists( 'pods' ) ) {
			self::fail( __( 'Pods must be active before importing structured content.', 'horizon-cruise-content' ) );
		}
	}

	/**
	 * Sanitizes a stable external key without changing its case or punctuation.
	 *
	 * @param mixed $value Raw key.
	 * @return string
	 */
	private static function sanitize_import_key( $value ) {
		return trim( sanitize_text_field( (string) $value ) );
	}

	/**
	 * Sanitizes a WordPress title.
	 *
	 * @param mixed $value Raw title.
	 * @return string
	 */
	private static function sanitize_title_value( $value ) {
		return sanitize_text_field( (string) $value );
	}

	/**
	 * Allows safe editorial HTML while preserving CSV newlines/paragraphs.
	 *
	 * @param mixed  $value Raw field value.
	 * @param string $type  Field type.
	 * @param string $field Optional field name for field-specific normalization.
	 * @return string
	 */
	private static function sanitize_field_value( $value, $type, $field = '' ) {
		$value = (string) $value;
		if ( in_array( $type, array( 'paragraph', 'wysiwyg' ), true ) ) {
			return wp_kses_post( $value );
		}
		if ( 'number' === $type ) {
			return trim( $value );
		}
		if ( 'currency' === $field ) {
			return strtoupper( sanitize_text_field( $value ) );
		}
		return sanitize_text_field( $value );
	}

	/**
	 * Reads a structured value through Pods instead of assuming raw meta shape.
	 *
	 * @param string $post_type Post type.
	 * @param int    $post_id   Post ID.
	 * @param string $field     Pods field name.
	 * @return mixed
	 */
	private static function get_pod_field_value( $post_type, $post_id, $field ) {
		$pod = pods( $post_type, $post_id );
		return $pod ? $pod->field( $field ) : '';
	}

	/**
	 * Reads a Pods relationship defensively as an ordered list of integer IDs.
	 *
	 * @param string $post_type Post type.
	 * @param int    $post_id   Post ID.
	 * @param string $field     Relationship field name.
	 * @return array
	 */
	private static function get_relationship_ids( $post_type, $post_id, $field ) {
		$pod = pods( $post_type, $post_id );
		if ( ! $pod ) {
			return array();
		}

		$value = $pod->field( $field . '.ID' );
		return self::extract_relationship_ids( $value );
	}

	/**
	 * Extracts IDs from the scalar, object, or array shapes Pods may return.
	 *
	 * @param mixed $value Relationship value.
	 * @return array
	 */
	private static function extract_relationship_ids( $value ) {
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
			$ids = array_merge( $ids, self::extract_relationship_ids( $item ) );
		}
		return self::normalize_relationship_ids( $ids );
	}

	/**
	 * Normalizes scalar or multiple relationship values while retaining order.
	 *
	 * @param mixed $ids Relationship ID or IDs.
	 * @return array
	 */
	private static function normalize_relationship_ids( $ids ) {
		$ids = is_array( $ids ) ? $ids : array( $ids );
		$ids = array_map( 'intval', $ids );
		$ids = array_filter( $ids );
		return array_values( array_unique( $ids ) );
	}

	/**
	 * Compares imported and stored values after normalizing editor formatting.
	 *
	 * @param mixed  $stored   Value read from WordPress/Pods.
	 * @param mixed  $imported Sanitized CSV value.
	 * @param string $type     Field type.
	 * @return bool
	 */
	private static function values_are_equivalent( $stored, $imported, $type ) {
		if ( is_array( $stored ) || is_object( $stored ) ) {
			return false;
		}

		if ( in_array( $type, array( 'paragraph', 'wysiwyg' ), true ) ) {
			return self::normalize_editor_value( $stored ) === self::normalize_editor_value( $imported );
		}
		if ( 'number' === $type && is_numeric( $stored ) && is_numeric( $imported ) ) {
			return (float) $stored === (float) $imported;
		}

		$charset = get_bloginfo( 'charset' ) ? get_bloginfo( 'charset' ) : 'UTF-8';
		$stored  = html_entity_decode( wp_unslash( (string) $stored ), ENT_QUOTES | ENT_HTML5, $charset );
		$imported = html_entity_decode( wp_unslash( (string) $imported ), ENT_QUOTES | ENT_HTML5, $charset );
		return trim( $stored ) === trim( $imported );
	}

	/**
	 * Canonicalizes safe formatted content for an equivalence comparison only.
	 *
	 * The stored content itself is never rewritten by this method.
	 *
	 * @param mixed $value Editor value.
	 * @return string
	 */
	private static function normalize_editor_value( $value ) {
		$charset = get_bloginfo( 'charset' ) ? get_bloginfo( 'charset' ) : 'UTF-8';
		$value   = wp_kses_post( wp_unslash( (string) $value ) );
		$value   = html_entity_decode( $value, ENT_QUOTES | ENT_HTML5, $charset );
		$value   = wpautop( str_replace( array( "\r\n", "\r" ), "\n", $value ) );
		$value   = preg_replace( '/>\s+</u', '><', $value );
		$value   = preg_replace( '/\s+/u', ' ', $value );
		return trim( (string) $value );
	}

	/**
	 * Builds the current user's transient key.
	 *
	 * @param string $token Random preview token.
	 * @return string
	 */
	private static function transient_key( $token ) {
		return self::TRANSIENT_PREFIX . get_current_user_id() . '_' . $token;
	}

	/**
	 * Builds importer page URL.
	 *
	 * @param string $token Optional state token.
	 * @return string
	 */
	private static function page_url( $token = '' ) {
		$url = admin_url( 'tools.php?page=horizon-cruise-import' );
		return $token ? add_query_arg( 'hc_token', $token, $url ) : $url;
	}

	/**
	 * Stops safely with an administrator-facing error.
	 *
	 * @param string $message Error message.
	 * @return void
	 */
	private static function fail( $message ) {
		wp_die( esc_html( $message ), esc_html__( 'Horizon Cruise import error', 'horizon-cruise-content' ), array( 'back_link' => true ) );
	}
}

Horizon_Cruise_CSV_Importer::init();
