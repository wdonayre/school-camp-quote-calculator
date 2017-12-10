<?php
/*========================
    Settings Page
========================*/

add_action('admin_menu', 'fn_scc_settings');

function fn_scc_settings() {
    $page_title = 'Koojarewon School Camp Calculator';
    $menu_title = 'SCCalculator';
    $capability = 'edit_posts';
    $menu_slug = 'scc_settings';
    $function = 'scc_render_settings_page';
    $icon_url = '';
    $position = 24;

    add_menu_page( $page_title, $menu_title, $capability, $menu_slug, $function, $icon_url, $position );
}

function scc_render_settings_page() {

    if(isset($_POST['admin_save'])){
        scc_admin_save();
    }

    $ret = array(
        'priceConfig' => stripslashes(get_option('price-config', '')),
        'workflowConfig' => stripslashes(get_option('workflow-config', '')),
        'adminEmail' => stripslashes(get_option('admin-email', '')),
        'mailgunDomain' => stripslashes(get_option('mailgun-domain', '')),
        'mailgunApi' => stripslashes(get_option('mailgun-api', '')),
        'mailgunApiBaseUrl' => stripslashes(get_option('mailgun-api-base-url', '')),
    );

    ob_start();
    ?>
        <h1>SCC Settings</h1>

        <form method="POST">

            <?php echo wp_nonce_field( 'scc_settings_nonce' ); ?>
            <input type="hidden" name="admin_save" value="" />
            <div class="scc-form-group">
                <label for="admin-email">Admin Email</label>
                <input name="admin-email" value="<? echo $ret['adminEmail'] ?>" />
            </div>
            <div class="scc-form-group">
                <label for="price-config">Price Configuration</label>
                <textarea name="price-config"><? echo $ret['priceConfig'] ?></textarea>
            </div>

            <div class="scc-form-group">
                <label for="workflow-config">Workflow Configuration</label>
                <textarea name="workflow-config"><? echo $ret['workflowConfig'] ?></textarea>
            </div>
            <br><hr>

            <h2>MAILGUN API SETTINGS</h2>

            <div class="scc-form-group">
                <label for="mailgun-domain">Mailgun Domain</label>
                <input name="mailgun-domain" value="<? echo $ret['mailgunDomain'] ?>" />
            </div>

            <div class="scc-form-group">
                <label for="mailgun-api">Mailgun API</label>
                <input name="mailgun-api" value="<? echo $ret['mailgunApi'] ?>" />
            </div>

            <div class="scc-form-group">
                <label for="mailgun-api-base-url">Mailgun API Base Url</label>
                <input name="mailgun-api-base-url" value="<? echo $ret['mailgunApiBaseUrl'] ?>" />
            </div>

            <br/>
            <input type="submit" value="Save" class="button button-primary button-large">
        </form>

    <?php
    echo ob_get_clean();
    scc_admin_css();
}

function scc_admin_css(){
    ob_start();
    ?>
        <style>
            .scc-form-group {
                margin-bottom:25px;
            }

            .scc-form-group > label {
                display:block;
                margin-bottom:8px;
            }

            .scc-form-group textarea {
                width:100%;
                max-width:640px;
                min-height:250px;
            }
        </style>
    <?php
    echo ob_get_clean();
}

function scc_admin_save(){
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized user');
    }

    if (!wp_verify_nonce($_POST['_wpnonce'], 'scc_settings_nonce' )) {
        wp_die('Nonce verification failed');
    }

    if (isset($_POST['price-config'])) {
        update_option('price-config', $_POST['price-config']);
        //$value = $_POST['price-config'];
    } 
    if (isset($_POST['workflow-config'])) {
        update_option('workflow-config', $_POST['workflow-config']);
        //$value = $_POST['price-config'];
    } 
    if (isset($_POST['admin-email'])) {
        update_option('admin-email', $_POST['admin-email']);
        //$value = $_POST['price-config'];
    } 

    /* MAIL GUN */
    if (isset($_POST['mailgun-domain'])) {
        update_option('mailgun-domain', $_POST['mailgun-domain']);
    } 
    if (isset($_POST['mailgun-api'])) {
        update_option('mailgun-api', $_POST['mailgun-api']);
    } 
    if (isset($_POST['mailgun-api-base-url'])) {
        update_option('mailgun-api-base-url', $_POST['mailgun-api-base-url']);
    } 

}