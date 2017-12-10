<?php
/* */

define('MAILGUN_URL', stripslashes(get_option('mailgun-api-base-url', '')));
define('MAILGUN_KEY', stripslashes(get_option('mailgun-api', ''))); 

class SCC_Obj {
	
	/** Hook WordPress
	*	@return void
	*/
	private $adultTotal =0;
	private $childTotal = 0;
	public function __construct(){
		add_filter('query_vars', array($this, 'add_query_vars'), 0);
		add_action('parse_request', array($this, 'sniff_requests'), 0);
		add_action('init', array($this, 'add_endpoint'), 0);
	}
	
	/** Add public query vars
	*	@param array $vars List of current public query vars
	*	@return array $vars 
	*/
	public function add_query_vars($vars){
		$vars[] = '__api';
		$vars[] = 'args';
		return $vars;
	}
	
	/** Add API Endpoint
	*	This is where the magic happens - brush up on your regex skillz
	*	@return void
	*/
	public function add_endpoint(){
		add_rewrite_rule('^scc/v1/?([0-9]+)?/?','index.php?__api=1&args=$matches[1]','top');
	}

	/**	Sniff Requests
	*	This is where we hijack all API requests
	* 	If $_GET['__api'] is set, we kill WP and serve up pug bomb awesomeness
	*	@return die if API request
	*/
	public function sniff_requests(){
		global $wp;
		if(isset($wp->query_vars['__api'])){
			$this->handle_request();
			exit;
		}
	}
	
	/** Handle Requests
	*	This is where we send off for an intense pug bomb package
	*	@return void 
	*/
  protected function handle_request(){
		global $wp;
		$args = $wp->query_vars['args'];

		$ret = null;
		
		
		/* ==== SEND TO CUSTOMER ==== */

		$message = file_get_contents(__DIR__.'/common-header.html');
		$message .= $this->getCustomerContent();
		$message .= file_get_contents(__DIR__.'/common-footer.html');

		$ret[] = $this->sendmailbymailgun(
			$_POST['info']['email'],
			$_POST['info']['name'],
			'Koojarewon Youth Camp',
			stripslashes(get_option('admin-email', '')),
			'Koojarewon Youth Camp - Thank you!',
			$message,
			'',
			'Koojarewon Enquiry/Quote',
			stripslashes(get_option('admin-email', ''))
		);
		
		//mail($_POST['info']['email'], 'Thank You for your Enquiry', $message, implode("\r\n", $headers));

		/* ==== SEND TO ADMIN ==== */
		 $message = file_get_contents(__DIR__.'/common-header.html');
		 $message .= $this->getAdminContent();
		 $message .= file_get_contents(__DIR__.'/common-footer.html');

		// $headers[] = 'MIME-Version: 1.0';
		// $headers[] = 'Content-type: text/html; charset=iso-8859-1';

		// $headers[] = 'To: '.stripslashes(get_option('admin-email', ''));
		// $headers[] = 'From: '.$_POST['info']['name'].'<'.$_POST['info']['email'].'>';

		//mail(stripslashes(get_option('admin-email', '')), 'Enquiry/Quote', $message, implode("\r\n", $headers));
		
		$ret[] = $this->sendmailbymailgun(
			stripslashes(get_option('admin-email', '')),
			'Admin - Koojarewon Youth Camp Calculator',
			$_POST['info']['name'],
			$_POST['info']['email'],
			'New Enquiry/Quote Received',
			$message,
			'',
			'Koojarewon Enquiry/Quote Received',
			$_POST['info']['email']
		);

		$this->send_response($ret);
	}
  
	 
	
	/** Response Handler
	*	This sends a JSON response to the browser
	*/
	protected function send_response($msg, $args = ''){
		$response['data'] = $msg;
		//if($args)
		//	$response['args'] = $args;
		header('content-type: application/json; charset=utf-8');
        echo json_encode($response,JSON_UNESCAPED_SLASHES)."\n";

	    exit;
	}
	private function getItem($data){
		ob_start();
		?>
			<tr>
				<th colspan="2" style="padding-left:5px; text-transform: capitalize; background:#646464; color:white;">
					<?php echo $data; ?>
				</th>
			</tr>
		<?php
			//var_dump($_POST[$data]);
			$subtotal = 0;
			foreach($_POST['items'][$data] as $key => $value){
				if(($value['text'] === "Adults") || ($key==="adults")){
					$this->adultTotal += $value['amount'];		
				}
				else if(($value['text'] === "Child") || ($key==="child")){
					$this->childTotal += $value['amount'];		
				}
			?>
				<tr>
					<?php if($data === 'accommodation'){?>
						<td><?php echo $value['text'].'@'.$_POST['info']['number-of-adults'].'/'.$value['quantity'].'days' ?></td>
						<td style="text-align:right;">$<?php $subtotal += $value['amount']; echo $value['amount'];?></td>
					<?php } else if($data === 'meals'){ ?>
						<td><?php echo ucfirst($key).'@'.$value['quantity'].' meal(s)' ?></td>
						<td style="text-align:right;">$<?php $subtotal += $value['amount']; echo $value['amount'];?></td>
					<?php } else if($data === 'activities'){ ?>
						<?php 
							$this->adultTotal += 	$_POST['info']['number-of-adults'] * $value['price'];
							$this->childTotal += 	$_POST['info']['number-of-child'] * $value['price'];
						?>
						<td><?php echo $value['activity'] ?></td>
						<td style="text-align:right;">$<?php $subtotal += $value['amount']; echo $value['amount'];?></td>
					<?php } ?>
				</tr>
			<?php
			}
			?>
			<tr>
				<td colspan="2" style="text-align:right;">
					<small>Subtotal:</small> <strong>$<?php echo $subtotal; ?></strong>
				</td>
			</tr>
			<!-- spacer -->
			<tr>
				<td width="100%" height="7" style="font-size:1px; line-height:1px; mso-line-height-rule: exactly;">&nbsp;</td>
			</tr>
			
			
			<?php
		return ob_get_clean();

	}
	private function getCustomerContent(){
		$ret = "";

		ob_start();
		?>

	<table bgcolor="#ffffff" width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                    <tbody><tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                                <!-- Spacing -->
                                <tbody><tr>
                                    <td width="100%" height="30" style="font-size:1px; line-height:1px; mso-line-height-rule: exactly;">&nbsp;</td>
                                </tr>
                                <!-- End of Spacing -->
                                <tr>
                                    <td align="center" style="">
                                        <table width="100%" align="left" cellpadding="0" cellspacing="0" border="0" class="devicewidthinner">
                                            <!-- Title -->
                                            <tbody><tr>
                                                <td style="padding:0 40px; font-family: Helvetica, Arial, sans-serif; text-align:left; font-weight:bold; font-size: 18px; line-height:24px; ">
                                                    Thank you <?php echo $_POST['info']['name'] ?> for your enquiry!
                                                </td>
                                            </tr>
                                            <!-- End of Title -->
                                            <!-- Spacing -->
                                            <tr>
                                                <td height="15" style="font-size:1px; line-height:1px; mso-line-height-rule: exactly;">&nbsp;</td>
                                            </tr>
                                            <!-- End of Spacing -->
                                            <!-- Content -->
                                            <tr>
                                                <td style="padding:0 40px; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size:14px; color: #0E0E0E; line-height:18px; text-align:left;">
                                                    We really appreciate your effort in going through the wizard and sending it to us. Thank you!
                                                    <br><br> Here is the summary of your enquiry:

                                                    <br><br>
                                                    <table width="100%">
                                                        <tbody><tr>
                                                            <th>Name</th>
                                                            <td><?php echo $_POST['info']['name']?></td>
                                                        </tr>
                                                        <tr>
                                                            <th>Email</th>
                                                            <td><?php echo $_POST['info']['email']?></td>
                                                        </tr>
                                                        <tr>
                                                            <th>Arrival Date</th>
                                                            <td><?php echo $_POST['info']['arrival-date']?></td>
                                                        </tr>
                                                        <tr>
                                                            <th>Departure Date</th>
                                                            <td><?php echo $_POST['info']['departure-date']?></td>
                                                        </tr>
                                                    </tbody></table>
                                                    <br>
													<!-- insert content here -->
													
													<table width="100%">
														<!-- accommodation-->
														<?php echo $this->getItem('accommodation');?>
														<!-- meals-->
														<?php echo $this->getItem('meals');?>
														<!-- activities-->
														<?php echo $this->getItem('activities');?>

														<!-- general total -->
														<tr>
															<td colspan="2" style="padding:3px 5px; text-align:left; background:#f5f5f5;">
																ADULT TOTAL: $<?php echo number_format($this->adultTotal,2); ?>
															</td>
														</tr>

														<tr>
															<td colspan="2" style="padding:3px 5px; text-align:left; background:#f5f5f5;">
																CHILD TOTAL: $<?php echo number_format($this->childTotal,2); ?>
															</td>
														</tr>
														<tr>
															<td colspan="2" style="font-weight:bold; padding:3px 5px; text-align:left; background:#f5f5f5; font-size:16px;">
																GENERAL TOTAL: $<?php echo number_format(($this->childTotal + $this->adultTotal),2); ?>
															</td>
														</tr>
														
													</table>

                                                    <br><br> One of our friendly personnel will connect with you shortly.

                                                    <br><br><br> Cheers,
                                                    <br> KYC Family
                                                    <br>
                                                </td>
                                            </tr>
                                            <!-- End of content -->
                                            <!-- Spacing -->
                                            <tr>
                                                <td width="100%" height="20" style="font-size:1px; line-height:1px; mso-line-height-rule: exactly;">&nbsp;</td>
                                            </tr>
                                            <!-- End of Spacing -->
                                        </tbody></table>
                                    </td>
                                </tr>
                            </tbody></table>
                        </td>
                    </tr>
				</tbody></table>
				
		<?php
		return ob_get_clean();
	}


	private function getAdminContent(){
		$ret = "";

		ob_start();
		?>

	<table bgcolor="#ffffff" width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                    <tbody><tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                                <!-- Spacing -->
                                <tbody><tr>
                                    <td width="100%" height="30" style="font-size:1px; line-height:1px; mso-line-height-rule: exactly;">&nbsp;</td>
                                </tr>
                                <!-- End of Spacing -->
                                <tr>
                                    <td align="center" style="">
                                        <table width="100%" align="left" cellpadding="0" cellspacing="0" border="0" class="devicewidthinner">
                                            <!-- Title -->
                                            <tbody>
											<tr>
                                                <td style="padding:0 40px; font-family: Helvetica, Arial, sans-serif; text-align:left; font-weight:bold; font-size: 18px; line-height:24px; ">
                                                    New Enquiry Request!
                                                </td>
                                            </tr>
                                            <!-- End of Title -->
                                            <!-- Spacing -->
                                            <tr>
                                                <td height="15" style="font-size:1px; line-height:1px; mso-line-height-rule: exactly;">&nbsp;</td>
                                            </tr>
                                            <!-- End of Spacing -->
                                            <!-- Content -->
                                            <tr>
                                                <td style="padding:0 40px; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-size:14px; color: #0E0E0E; line-height:18px; text-align:left;">
                                                    Here is the details of the enquiry:

                                                    <br><br>
                                                    <table width="100%">
                                                        <tbody><tr>
                                                            <th>Name</th>
                                                            <td><?php echo $_POST['info']['name']?></td>
                                                        </tr>
                                                        <tr>
                                                            <th>Email</th>
                                                            <td><?php echo $_POST['info']['email']?></td>
                                                        </tr>
                                                        <tr>
                                                            <th>Arrival Date</th>
                                                            <td><?php echo $_POST['info']['arrival-date']?></td>
                                                        </tr>
                                                        <tr>
                                                            <th>Departure Date</th>
                                                            <td><?php echo $_POST['info']['departure-date']?></td>
                                                        </tr>
														<tr>
                                                            <th>Start Meal</th>
                                                            <td><?php echo $_POST['info']['meal']?></td>
                                                        </tr>
														<tr>
                                                            <th>Last Meal</th>
                                                            <td><?php echo $_POST['info']['end-meal']?></td>
                                                        </tr>
                                                    </tbody></table>
                                                    <br>
													<!-- insert content here -->
													
													<table width="100%">
														<!-- accommodation-->
														<?php echo $this->getItem('accommodation');?>
														<!-- meals-->
														<?php echo $this->getItem('meals');?>
														<!-- activities-->
														<?php echo $this->getItem('activities');?>

														<!-- general total -->
														<tr>
															<td colspan="2" style="padding:3px 5px; text-align:left; background:#f5f5f5;">
																ADULT TOTAL: $<?php echo number_format($this->adultTotal,2); ?>
															</td>
														</tr>

														<tr>
															<td colspan="2" style="padding:3px 5px; text-align:left; background:#f5f5f5;">
																CHILD TOTAL: $<?php echo number_format($this->childTotal,2); ?>
															</td>
														</tr>
														<tr>
															<td colspan="2" style="font-weight:bold; padding:3px 5px; text-align:left; background:#f5f5f5; font-size:16px;">
																GENERAL TOTAL: $<?php echo number_format(($this->childTotal + $this->adultTotal),2); ?>
															</td>
														</tr>
														
													</table>

                                                    <br><br><br> Cheers,
                                                    <br> KYC Family
                                                    <br>
                                                </td>
                                            </tr>
                                            <!-- End of content -->
                                            <!-- Spacing -->
                                            <tr>
                                                <td width="100%" height="20" style="font-size:1px; line-height:1px; mso-line-height-rule: exactly;">&nbsp;</td>
                                            </tr>
                                            <!-- End of Spacing -->
                                        </tbody></table>
                                    </td>
                                </tr>
                            </tbody></table>
                        </td>
                    </tr>
				</tbody></table>
				
		<?php
		return ob_get_clean();
	}

	/* MAILGUN FUNCTIONS */
	// private function mailgunSend($to,$from,$msg){
	// 	$tag = "Koojarewon Quote/Enquiry";

	// 	$apiKey = stripslashes(get_option('mailgun-api', ''));
	// 	$mailgunDomain = stripslashes(get_option('mailgun-domain', ''));
	// 	$apiBaseUrl = stripslashes(get_option('mailgun-api-base-url', ''));

	// 	$ch = curl_init($apiBaseUrl."/messages");

	// 	curl_setopt($ch, CURLOPT_FILE, $fp);
	// 	curl_setopt($ch, CURLOPT_HEADER, 0);



	// 	curl -s --user 'api:YOUR_API_KEY' \
	// 	https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/messages \
	// 	-F from='Sender Bob <sbob@YOUR_DOMAIN_NAME>' \
	// 	-F to='alice@example.com' \
	// 	-F subject='Hello' \
	// 	-F text='Testing some Mailgun awesomness!' \
	// 	-F o:tag='September newsletter' \
	// 	-F o:tag='newsletters'
	// }


	
	private function sendmailbymailgun($to,$toname,$mailfromname,$mailfrom,$subject,$html,$text,$tag,$replyto){
		$array_data = array(
			'from'=> $mailfromname .'<'.$mailfrom.'>',
			'to'=>$toname.'<'.$to.'>',
			'subject'=>$subject,
			'html'=>$html,
			'text'=>$text,
			'o:tracking'=>'yes',
			'o:tracking-clicks'=>'yes',
			'o:tracking-opens'=>'yes',
			'o:tag'=>$tag,
			'h:Reply-To'=>$replyto
		);
	
		$session = curl_init(MAILGUN_URL.'/messages');
		curl_setopt($session, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		  curl_setopt($session, CURLOPT_USERPWD, 'api:'.MAILGUN_KEY);
		curl_setopt($session, CURLOPT_POST, true);
		curl_setopt($session, CURLOPT_POSTFIELDS, $array_data);
		curl_setopt($session, CURLOPT_HEADER, false);
		curl_setopt($session, CURLOPT_ENCODING, 'UTF-8');
		curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($session, CURLOPT_SSL_VERIFYPEER, false);
		$response = curl_exec($session);
		curl_close($session);
		$results = json_decode($response, true);
		return $results;
	}

	
}