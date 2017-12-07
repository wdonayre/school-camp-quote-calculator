<?php
/* */

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
		
		

		$message = file_get_contents(__DIR__.'/common-header.html');
		$message .= $this->getCustomerContent();
		$message .= file_get_contents(__DIR__.'/common-footer.html');

		$headers[] = 'MIME-Version: 1.0';
		$headers[] = 'Content-type: text/html; charset=iso-8859-1';

		$headers[] = 'To: '.$_POST['info']['name'].' <'.$_POST['info']['email'].'>';
		$headers[] = 'From: Koojarewon Youth Camp - Enquiry';

		mail($to, $subject, $message, implode("\r\n", $headers));

		

        //$this->send_response($_POST['items']['activities'][0]['activity']);

		// if($reqType === "mail"){
        //     $keys = $_POST['fields'];
   
    	//     foreach($keys as $key){
        //         $ret[$key] = $key; 
        //     }
        //     //array_push($ret, array("testing" => get_post_meta('500','property_bedrooms',true))); 
        //     $this->send_response($ret);
		// }
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
}