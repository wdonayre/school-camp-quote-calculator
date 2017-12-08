<?php
/*--------------------------------*/
/* Common Functions Defined here */
/*--------------------------------*/
/*=========================================*/


/**
 * Parses a template argument to the specified value
 * Template variables are defined using double curly brackets: {{ [a-zA-Z] }}
 * Returns the query back once the instances has been replaced
 * @param string $string
 * @param string $find
 * @param string $replace
 * @return string
 * @throws \Exception
 */
if(!function_exists('findReplace')){
    function findReplace($string, $find, $replace)
    {
        if (preg_match("/[a-zA-Z\_]+/", $find)) {
            return (string) preg_replace("/\{\{(\s+)?($find)(\s+)?\}\}/", $replace, $string);
        } else {
            throw new \Exception("Find statement must match regex pattern: /[a-zA-Z]+/");
        }
    }
}

/*=====================================
      LOAD CSS AND JS
======================================*/
function SCC_style() {
    wp_deregister_style( 'scc-main' );
    wp_dequeue_style( 'scc-main' );

    wp_register_style('scc-datepicker', SCC_PLUGIN_URL . 'assets/css/jquery-ui.min.css', array(), filemtime( SCC_PLUGIN_DIR.'/assets/css/jquery-ui.min.css' ), 'all');
    wp_enqueue_style('scc-datepicker', SCC_PLUGIN_URL. 'assets/css/jquery-ui.min.css', array(), filemtime( SCC_PLUGIN_DIR.'/assets/css/jquery-ui.min.css' ), 'all');

    wp_register_style('scc-datepicker-theme', SCC_PLUGIN_URL . 'assets/css/jquery-ui.theme.min.css', array(), filemtime( SCC_PLUGIN_DIR.'/assets/css/jquery-ui.theme.min.css' ), 'all');
    wp_enqueue_style('scc-datepicker-theme', SCC_PLUGIN_URL. 'assets/css/jquery-ui.theme.min.css', array(), filemtime( SCC_PLUGIN_DIR.'/assets/css/jquery-ui.theme.min.css' ), 'all');


    wp_register_style('scc-main', SCC_PLUGIN_URL . 'assets/css/scc-style.css', array(), filemtime( SCC_PLUGIN_DIR.'/assets/css/scc-style.css' ), 'all');
    wp_enqueue_style ('scc-main', SCC_PLUGIN_URL . 'assets/css/scc-style.css', array(), filemtime( SCC_PLUGIN_DIR.'/assets/css/scc-style.css' ), 'all');

    wp_register_style('scc-main-responsive', SCC_PLUGIN_URL . 'assets/css/scc-responsive.css', array(), filemtime( SCC_PLUGIN_DIR.'/assets/css/scc-responsive.css' ), 'all');
    wp_enqueue_style('scc-main-responsive', SCC_PLUGIN_URL. 'assets/css/scc-responsive.css', array(), filemtime( SCC_PLUGIN_DIR.'/assets/css/scc-responsive.css' ), 'all');
} add_action( 'wp_enqueue_scripts', 'SCC_style', 999);


function SCC_script() { // frontend
    //3rd party js include
    wp_register_script('SCC_js_datepicker',  SCC_PLUGIN_URL. 'assets/js/jquery-ui.min.js', false, filemtime( SCC_PLUGIN_DIR.'assets/js/jquery-ui.min.js' ), true);
    wp_enqueue_script('SCC_js_datepicker', SCC_PLUGIN_URL. 'assets/js/jquery-ui.min.js', false, filemtime( SCC_PLUGIN_DIR.'assets/js/jquery-ui.min.js' ), true);

    wp_register_script('SCC_js',  SCC_PLUGIN_URL. 'assets/js/scc-script.js', false, filemtime( SCC_PLUGIN_DIR.'assets/js/scc-script.js' ), true);
    wp_enqueue_script('SCC_js', SCC_PLUGIN_URL. 'assets/js/scc-script.js', false, filemtime( SCC_PLUGIN_DIR.'assets/js/scc-script.js' ), true);

    wp_enqueue_script("jquery");
} add_action( 'wp_enqueue_scripts', 'SCC_script' );


function SCC_enqueue_admin_styles() { // admin
    wp_register_style('scc-admin', SCC_PLUGIN_URL . 'assets/css/scc-admin-style.css', false, filemtime( SCC_PLUGIN_DIR .'assets/css/scc-admin-style.css'), true);
    wp_enqueue_style( 'scc-admin', SCC_PLUGIN_URL . 'assets/css/scc-admin-style.css', false, filemtime( SCC_PLUGIN_DIR .'assets/css/scc-admin-style.css'), true);
    //wp_register_script('custom-admin_js', get_stylesheet_directory_uri() . '/admin.js', false, filemtime( get_stylesheet_directory().'/admin.js' ), true);
    //wp_enqueue_script('custom-admin', get_stylesheet_directory_uri() . '/admin.js', false, filemtime( get_stylesheet_directory().'/admin.js' ), true);
} add_action( 'admin_enqueue_scripts', 'SCC_enqueue_admin_styles' );

/**/
require_once 'includes/mailer/mailer.php';

//init SCC Mailer Endpoint
new SCC_Obj();

$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/html; charset=iso-8859-1';

$headers[] = 'To: William D. <wdonayredroid@gmail.com>';
$headers[] = 'From: Koojarewon Youth Camp - Enquiry';
mail(stripslashes(get_option('admin-email', '')), 'Enquiry/Quote', 'testing', implode("\r\n", $headers));





