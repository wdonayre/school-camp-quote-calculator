<?php
/**
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://github.com/wdonayre
 * @since             1.0.0
 * @package           Map_Lawyer_Calculator
 *
 * @wordpress-plugin
 * Plugin Name:       School Camp Calculator
 * Plugin URI:        http://jvos.co.nz
 * Description:       ---
 * Version:           1.0.0
 * Author:            William Donayre Jr.
 * Author URI:        https://github.com/wdonayre
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       school-camp-calculator
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) exit;

// Define some useful constants
if ( ! defined( 'SCC_VERSION' ) ) define( 'SCC_VERSION', '1.0.0' );
if ( ! defined( 'SCC_PLUGIN_DIR' ) ) define( 'SCC_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
if ( ! defined( 'SCC_PLUGIN_URL' ) ) define( 'SCC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
if ( ! defined( 'SCC_PLUGIN_FILE' ) ) define( 'SCC_PLUGIN_FILE', __FILE__ );
if ( ! defined( 'SCC_PLUGIN_ASSETS_URL' ) ) define( 'SCC_PLUGIN_ASSETS_URL', plugin_dir_url( __FILE__ ).'assets/images/' );






require_once SCC_PLUGIN_DIR . 'functions.php';
require_once SCC_PLUGIN_DIR . 'includes/shortcodes/init.php';

//settings page
require_once SCC_PLUGIN_DIR . 'admin/settings.php';
