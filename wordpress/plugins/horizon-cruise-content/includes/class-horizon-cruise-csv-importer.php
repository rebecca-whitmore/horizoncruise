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
 * Imports Cruise Lines and Ships from validated CSV files.
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
				'label'  => __( 'Cruise Lines', 'horizon-cruise-content' ),
				'fields' => array(
					'short_introduction' => 'paragraph',
					'full_overview'       => 'wysiwyg',
				),
			),
			'ship'        => array(
				'label'  => __( 'Ships', 'horizon-cruise-content' ),
				'fields' => array(
					'short_introduction' => 'paragraph',
					'full_overview'       => 'wysiwyg',
					'staterooms'          => 'wysiwyg',
					'dining'              => 'wysiwyg',
					'entertainment'       => 'wysiwyg',
					'health_fitness'      => 'wysiwyg',
					'younger_travellers'  => 'wysiwyg',
					'enrichment'           => 'wysiwyg',
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
			<p><?php esc_html_e( 'Import Cruise Lines or Ships. Every import is validated and previewed before any records are changed.', 'horizon-cruise-content' ); ?></p>
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

		$allowed = array_merge( array( 'import_key', 'title' ), array_keys( self::definitions()[ $post_type ]['fields'] ) );
		if ( 'ship' === $post_type ) {
			$allowed[] = 'cruise_line_import_key';
		}
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

			$relationship_id = 0;
			if ( 'ship' === $post_type && array_key_exists( 'cruise_line_import_key', $row ) && '' !== trim( (string) $row['cruise_line_import_key'] ) ) {
				$line_key     = self::sanitize_import_key( $row['cruise_line_import_key'] );
				$line_matches = self::find_by_import_key( 'cruise_line', $line_key );
				if ( 1 !== count( $line_matches ) ) {
					$errors[] = 0 === count( $line_matches )
						? __( 'cruise_line_import_key does not match an existing Cruise Line.', 'horizon-cruise-content' )
						: __( 'cruise_line_import_key matches multiple Cruise Lines and is ambiguous.', 'horizon-cruise-content' );
				} else {
					$relationship_id = (int) $line_matches[0];
				}
			} elseif ( 'ship' === $post_type && ! $post_id ) {
				$errors[] = __( 'A valid cruise_line_import_key is required when creating a new Ship.', 'horizon-cruise-content' );
			}

			$action = $post_id ? self::proposed_action( $post_type, $post_id, $row, $relationship_id ) : 'create';
			if ( $errors ) {
				$action = 'failed';
			}

			$validation[ $index ] = array(
				'line'            => isset( $row['_line'] ) ? (int) $row['_line'] : $index + 2,
				'import_key'      => $key,
				'post_id'         => $post_id,
				'relationship_id' => $relationship_id,
				'action'          => $action,
				'errors'          => $errors,
			);
		}

		return $validation;
	}

	/**
	 * Determines whether an existing record would change.
	 *
	 * @param string $post_type      Post type.
	 * @param int    $post_id        Existing post ID.
	 * @param array  $row            CSV row.
	 * @param int    $relationship_id Resolved Cruise Line ID.
	 * @return string
	 */
	private static function proposed_action( $post_type, $post_id, $row, $relationship_id ) {
		if ( isset( $row['title'] ) && '' !== trim( (string) $row['title'] ) && get_the_title( $post_id ) !== self::sanitize_title_value( $row['title'] ) ) {
			return 'update';
		}

		foreach ( self::definitions()[ $post_type ]['fields'] as $field => $field_type ) {
			if ( isset( $row[ $field ] ) && '' !== trim( (string) $row[ $field ] ) ) {
				$new_value = self::sanitize_field_value( $row[ $field ], $field_type );
				$old_value = (string) get_post_meta( $post_id, $field, true );
				if ( $old_value !== $new_value ) {
					return 'update';
				}
			}
		}

		if ( 'ship' === $post_type && $relationship_id && (int) get_post_meta( $post_id, 'cruise_line', true ) !== $relationship_id ) {
			return 'update';
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
					$pod_data[ $field ] = self::sanitize_field_value( $row[ $field ], $field_type );
				}
			}
			if ( 'ship' === $post_type && $check['relationship_id'] ) {
				$pod_data['cruise_line'] = $check['relationship_id'];
			}

			if ( $is_create ) {
				$pod_data['post_title']  = self::sanitize_title_value( $row['title'] );
				$pod_data['post_status'] = 'draft';
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
				if ( isset( $row['title'] ) && '' !== trim( (string) $row['title'] ) ) {
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
	 * @param string $post_type Post type.
	 * @param string $key       Import key.
	 * @return array
	 */
	private static function find_by_import_key( $post_type, $key ) {
		return get_posts(
			array(
				'post_type'      => $post_type,
				'post_status'    => array_values( get_post_stati() ),
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
	 * @return string
	 */
	private static function sanitize_field_value( $value, $type ) {
		$value = (string) $value;
		if ( in_array( $type, array( 'paragraph', 'wysiwyg' ), true ) ) {
			return wp_kses_post( $value );
		}
		return sanitize_text_field( $value );
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
