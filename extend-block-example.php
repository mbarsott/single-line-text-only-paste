<?php
/**
 * Plugin Name: Single Line Text Only Paste on Gutenberg
 * Description: Changes the behavior of the clipboard on Gutenberg by pasting only one paragraph as text only.
 * Author: Barsotti's
 * Text Domain: single-line-text-only-paste
 *
 * @package single-line-text-only-paste
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'enqueue_block_editor_assets', 'single_line_text_only_paste_enqueue_block_editor_assets' );

function single_line_text_only_paste_enqueue_block_editor_assets() {
    // Enqueue our script
    wp_enqueue_script(
        'single-line-text-only-paste-js',
        esc_url( plugins_url( '/dist/single-line-text-only-paste.js', __FILE__ ) ),
        array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor' ),
        '1.0.0',
        true // Enqueue the script in the footer.
    );
}
