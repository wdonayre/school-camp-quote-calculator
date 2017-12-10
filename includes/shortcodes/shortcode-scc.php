<?php

/* MAIN SHORTCODE */
function fn_scc($atts, $content){
    $a = shortcode_atts( array(
        'buttontext' => 'Get Quote'
    ), $atts );

    ob_start();
    ?>
        <button class="scc-modal-trigger"><?php echo $a['buttontext']; ?></button>
        <div class="scc-modal-wrapper" style="display:none;">
            <div class="scc-modal-mask"></div>
            <div class="scc-modal-content">
                <a class="scc-modal-close"></a>
                <?php echo step1(true); ?>    
                <?php echo step2(false); ?>
                <?php echo endMealSelection(false); ?> 
                <?php echo step3(false); ?> 
                <?php echo step4(false); ?> 
                <?php echo step5(false); ?> 
                <?php echo step6(false); ?> 
            </div>
        </div>
    <?php
	return ob_get_clean();
}

add_shortcode('camp_calculator', 'fn_scc');

/*================================================================*/
/*================================================================*/
/*================================================================*/


/* VIEW - STEP 1 || Personal Information */
function step1($display=true){
    ob_start();
    ?>
    <div data-view="information" data-breakdown="accommodation" data-modal-step="1" data-modal-next="2" data-modal-prev="" class="scc-modal-inner active"  style="display:<?php echo $display?'':'none';?>;">
        <div class="scc-modal-header">
            <div class="scc-modal-title">[Head Line Text Here]</div>
            <div class="scc-modal-sub-title">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </div>
        </div>
        <div class="scc-modal-body p-b-30">
            <div class="grid">
                <div class="form-group col-50p">
                    <input class="req" type="text" name="name" placeholder="Name">
                    <label class="overhead-label">Name</label>
                </div>
                <div class="form-group col-50p">
                    <input class="req" type="email" name="email" placeholder="Email">
                    <label class="overhead-label">Email</label>
                </div> 
            </div>
            <div class="grid">
                <div class="col-100p m-b-10">
                    <label>ACCOMMODATION</label>  
                </div>
                <div class="form-group col-50p">
                    <input class="req scc-date" type="text" name="arrival-date" placeholder="Arrival Date">
                    <label class="overhead-label">Arrival Date</label>
                </div>
                <div class="form-group col-50p">
                    <input class="req scc-date" type="text" name="departure-date" placeholder="Departure Date">
                    <label class="overhead-label">Departure Date</label>
                </div>
                <div class="form-group col-50p">
                    <input class="req" type="number" name="number-of-adults" placeholder="# of Adults">
                    <label class="overhead-label"># of Adults</label>
                </div>
                <div class="form-group col-50p">
                    <input class="req" type="number" name="number-of-child" placeholder="# of Children">
                    <label class="overhead-label"># of Children</label>
                </div>
            </div>
            <br>
        </div>
        <div class="scc-modal-footer"> 
            <button class="scc-btn scc-cancel fl-left">Cancel</button>
            <button class="scc-btn scc-next fl-right">Next</button> 
        </div>
    </div>
    <?php
    return ob_get_clean();    
}

/* VIEW - STEP 2 || MEAL SELECTION */
function step2($display=true){
    ob_start();
    ?>
    <div data-view="meals" data-breakdown="meals" data-modal-step="2" data-modal-next="3" data-modal-prev="" class="scc-modal-inner" style="display:<?php echo $display?'':'none';?>;">
        <div class="scc-modal-header">
            <div class="scc-modal-title">[Head Line Text Here]</div>
            <div class="scc-modal-sub-title">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </div>
        </div>
        <div class="scc-modal-body p-b-30">
            <div class="grid radio-outer group-req">
                <div class="col-100p m-b-10">
                    <label class="question-title">PLEASE CHOOSE YOUR FIRST MEAL</label>  
                </div>
                <div class="form-group col-100p m-b-0">
                    <label class="scc-radio">
                        <input type="radio" name="meal" value="breakfast"/>
                        Breakfast
                    </label>
                </div>
                <div class="form-group col-100p m-b-0">
                    <label class="scc-radio">
                        <input type="radio" name="meal" value="atea"/>
                        A/Tea
                    </label>
                </div>
                <div class="form-group col-100p m-b-0">
                    <label class="scc-radio">
                        <input type="radio" name="meal" value="lunch"/>
                        Lunch
                    </label>
                </div>
                <div class="form-group col-100p m-b-0">
                    <label class="scc-radio">
                        <input type="radio" name="meal" value="snacks"/>
                        Snacks
                    </label>
                </div>
                <div class="form-group col-100p m-b-0">
                    <label class="scc-radio">
                        <input type="radio" name="meal" value="dinner"/>
                        Dinner
                    </label>
                </div>
                <div class="form-group col-100p m-b-0">
                    <label class="scc-radio">
                        <input type="radio" name="meal" value="supper"/>
                        Supper
                    </label>
                </div>
                
            </div>
        </div>
        <br>
        <div class="scc-modal-footer"> 
            <button class="scc-btn scc-cancel fl-left">Cancel</button>
            <div class="fl-right">
                <button class="scc-btn scc-back">Back</button>
                <button class="scc-btn scc-next ">Next</button>
            </div>
            
        </div>
    </div>
    <?php
    return ob_get_clean();    
}


/* VIEW - STEP 3 || AGE GROUP */
function step3($display=true){
    ob_start();
    ?>
    <div data-view="age-group" data-modal-step="3" data-modal-next="4" data-modal-prev="" class="scc-modal-inner" style="display:<?php echo $display?'':'none';?>;">
        <div class="scc-modal-header">
            <div class="scc-modal-title">[Head Line Text Here]</div>
            <div class="scc-modal-sub-title">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </div>
        </div>
        <div class="scc-modal-body p-b-30">
            <div class="grid radio-outer group-req">
                <div class="col-100p m-b-10">
                    <label class="question-title">CHOICE OF AGE GROUPS</label>  
                </div>
                <div class="form-group col-100p m-b-0">
                    <label class="scc-radio">
                        <input type="radio" name="ageGroup" value="junior"/>
                        Junior School (3-6)
                    </label>
                </div>
                <div class="form-group col-100p m-b-0">
                    <label class="scc-radio">
                        <input type="radio" name="ageGroup" value="middle-school"/>
                        Middle School (year 7-9)
                    </label>
                </div>
                <div class="form-group col-100p">
                    <label class="scc-radio">
                        <input type="radio" name="ageGroup" value="adults"/>
                        Adults
                    </label>
                </div>
                <br>
                <div class="form-group col-100p  m-t-30">
                    <label class="total-price">TOTAL: <span>$124.00</span></label>
                    <!-- <a href="#">VIEW BREAKDOWN</a> -->
                </div>
            </div>
        </div>
        <div class="scc-modal-footer"> 
            <button class="scc-btn scc-cancel fl-left">Cancel</button>
            <div class="fl-right">
                <button class="scc-btn scc-back">Back</button>
                <button class="scc-btn scc-next ">Next</button>
            </div>
            
        </div>
    </div>
    <?php
    return ob_get_clean();    
}

/* VIEW - STEP 4 || ACTIVITY SELECTOR */
function step4($display=true){
    ob_start();
    ?>
    <div data-view="activities" data-breakdown="activities" data-modal-step="4" data-modal-next="5" data-modal-prev="" class="scc-modal-inner" style="display:<?php echo $display?'':'none';?>;">
        <div class="scc-modal-header">
            <div class="scc-modal-title">[Head Line Text Here]</div>
            <div class="scc-modal-sub-title">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </div>
        </div>
        <div class="scc-modal-body p-b-30">
            <div class="grid">
                <div class="col-100p m-b-10">
                    <label>SELECT ACTIVITIES</label>  
                </div>
                <div class="">
                    <div class="activity-selector-wrapper" name="activity">
                        <div class="col-g-4">
                            <div class="activity-item form-group" style="background-image:url(<?php echo SCC_PLUGIN_ASSETS_URL.'mountain-climbing.jpg'?>)">
                                <label class="activity-item-title">Mountain Climbing</label>
                                <span class="activity-item-price">$ 20.00</span>
                                <input class="disabled" type="hidden" name="activities" value="mountain-climbing" />
                            </div>
                        </div>              
                    </div>
                </div>
                
                <br>
                <div class="form-group col-100p  m-t-30">
                    <label class="total-price">TOTAL: <span>$124.00</span></label>
                    <!-- <a href="#">VIEW BREAKDOWN</a> -->
                </div>
            </div>
        </div>
        <div class="scc-modal-footer"> 
            <button class="scc-btn scc-cancel fl-left">Cancel</button>
            <div class="fl-right">
                <button class="scc-btn scc-back">Back</button>
                <button class="scc-btn scc-next ">Next</button>
            </div>
            
        </div>
    </div>
    <?php
    return ob_get_clean();    
}
/* VIEW - STEP 5 || BREAKDOWN */
function step5($display=true){
    ob_start();
    ?>
    <div data-view="breakdown" data-modal-step="5" data-modal-next="6" data-modal-prev="" class="scc-modal-inner" style="display:<?php echo $display?'':'none';?>;">

    <div class="scc-modal-header">
        <div class="scc-modal-title">[Head Line Text Here]</div>
        <div class="scc-modal-sub-title">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </div>
    </div>
    <div class="scc-modal-body p-b-30">  
        <div class="grid"></div>
    </div>
    <div class="scc-modal-footer"> 
        <button class="scc-btn scc-cancel fl-left">Cancel</button>
        <div class="fl-right">
            <button class="scc-btn scc-back">Back</button>
            <button class="scc-btn scc-submit ">SUBMIT</button>
        </div>
        
    </div>
        
    </div>
    <?php
    return ob_get_clean();    
}

/* VIEW - STEP 6 || THANK YOU */
function step6($display=true){
    ob_start();
    ?>
    <div data-view="thankyou" data-modal-step="6" data-modal-next="" data-modal-prev="" class="scc-modal-inner" style="display:<?php echo $display?'':'none';?>;">

        <div class="scc-modal-body p-b-30">
            <div class="scc-alert">
                <h2><img src="<?php echo SCC_PLUGIN_ASSETS_URL.'success.png'?>"> Thank You!</h2>    
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </p>
            </div>     
        </div>
        
    </div>
    <?php
    return ob_get_clean();    
}

/* VIEW -  END MEAL SELECTION */
function endMealSelection($display=true){
    ob_start();
    ?>
    <div data-view="end-meal" data-breakdown="end-meal" data-modal-step="2" data-modal-next="3" data-modal-prev="" class="scc-modal-inner" style="display:<?php echo $display?'':'none';?>;">
        <div class="scc-modal-header">
            <div class="scc-modal-title">[Head Line Text Here]</div>
            <div class="scc-modal-sub-title">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </div>
        </div>
        <div class="scc-modal-body p-b-30">
            <div class="grid radio-outer group-req">
                <div class="col-100p m-b-10">
                    <label class="question-title">PLEASE CHOOSE YOUR LAST MEAL</label>  
                </div>
                <div class="form-group col-100p m-b-0">
                    <label class="scc-radio">
                        <input type="radio" name="end-meal" value="breakfast"/>
                        Breakfast
                    </label>
                </div>
                <div class="form-group col-100p m-b-0">
                    <label class="scc-radio">
                        <input type="radio" name="end-meal" value="atea"/>
                        A/Tea
                    </label>
                </div>
                <div class="form-group col-100p m-b-0">
                    <label class="scc-radio">
                        <input type="radio" name="end-meal" value="lunch"/>
                        Lunch
                    </label>
                </div>
                <div class="form-group col-100p m-b-0">
                    <label class="scc-radio">
                        <input type="radio" name="end-meal" value="snacks"/>
                        Snacks
                    </label>
                </div>
                <div class="form-group col-100p m-b-0">
                    <label class="scc-radio">
                        <input type="radio" name="end-meal" value="dinner"/>
                        Dinner
                    </label>
                </div>
                <div class="form-group col-100p m-b-0">
                    <label class="scc-radio">
                        <input type="radio" name="end-meal" value="supper"/>
                        Supper
                    </label>
                </div>
                
            </div>
        </div>
        <br>
        <div class="scc-modal-footer"> 
            <button class="scc-btn scc-cancel fl-left">Cancel</button>
            <div class="fl-right">
                <button class="scc-btn scc-back">Back</button>
                <button class="scc-btn scc-next ">Next</button>
            </div>
            
        </div>
    </div>
    <?php
    return ob_get_clean();    
}
