<?php



/*--------------------------------------*/
/* Utility : Generate Paper Size Selector
/*--------------------------------------*/
function fn_generatPaperSizeSelection(){

  global $PAPER_TYPE,
        $defaultConfig;
  
  ob_start();  
  echo '<form method="post" action="'.$_SERVER['REQUEST_URI'].'#sizes" class="size-selector-wrapper">';
  foreach($PAPER_TYPE as $key => $value){
    $checked = '';
    if($key === $defaultConfig['size']){
      $checked = 'checked';
    }
    ?>
    
      <div class="selector-image" for="<? echo $key ?>">
        <img src="<? echo $value['icon'] ?>" alt="" for="a1">
        <div class="radio-wrapper">
          <input  class="radio-size" <? echo $checked; ?> type="radio" name="size" value="<? echo $key ?>" id="<? echo $key ?>">
          <label for="<? echo $key ?>"><? echo $value['label'] ?></label>
        </div>
      </div>
      
    
    <?php
  }
  echo '<input type="submit" class="submit-hidden"></form>';

  return ob_get_clean();
}

/*--------------------------------------*/
/* Shortcode
/*--------------------------------------*/
function fn_ptm($atts, $content){

  global $PAPER_TYPE;
  global $defaultConfig;

  $atts = shortcode_atts(
		array(

		),
		$atts,
		'price_tag_maker'
	);

    ob_start();
    //echo fn_generatPaperSizeSelection();
    ?>
    
    <div class="container-fluid ptm-wrapper">
        <div class="header-wrapper">
          <div class="header-text">
            <h3>PRICE TAG MAKER</h3>
          </div>
        </div>
        <div class="content-wrapper">
          <div class="content-text" id="sizes">
            <h4>CHOOSE TAG SIZE:</h4>
          </div>
          <div class="selector-wrapper">
            <? echo fn_generatPaperSizeSelection(); ?>
          </div>
          <div class="form-wrapper">
            <div class="form-header">
                <h4>ENTER PRODUCT NAME AND PRICE</h4>
            </div>
            <form class="" action="<? echo $_SERVER['REQUEST_URI'] ?>" method="post">
              <input type="hidden" name="size" value="<? echo $defaultConfig['size'] ?>">
              <div class="form-container">

                <?php
                $length = $PAPER_TYPE[$defaultConfig['size']]['col'] * $PAPER_TYPE[$defaultConfig['size']]['row'];
                
                for($i=0;$i< $length ;$i++){
                ?>
                
                <!-- Loop this block -->
                <div class="form-column">
                    <div class="product-column-name">
                        <div class="product-name-wrapper">
                        <label for="">Product Name:</label>
                        <input type="text" name="product_name[]" value="">
                        </div>
                    </div>
                    <div class="product-column-price">
                        <div class="product-price-wrapper">
                        <label for="">Price:</label>
                        <input type="text" name="product_price[]" value="">
                        </div>
                    </div>
                </div>

                <?php
                } //end for loop
                ?>


              </div>
              <input type="hidden" name="generatePDF" value="true" />
              <input type="hidden" name="pluginURL" value="<? echo $PAPER_TYPE[$defaultConfig['size']]['plugin_url'] ?>" />
              <input type="hidden" name="pdfTitle" value="<? echo $PAPER_TYPE[$defaultConfig['size']]['title'] ?>" />

              <input type="hidden" name="pdfDimension" value="<? echo $PAPER_TYPE[$defaultConfig['size']]['dimension'] ?>" />
              <input type="hidden" name="pdfOrientation" value="<? echo $PAPER_TYPE[$defaultConfig['size']]['orientation'] ?>" />
              <input type="hidden" name="pdfWidth" value="<? echo $PAPER_TYPE[$defaultConfig['size']]['width'] ?>" />
              <input type="hidden" name="pdfHeight" value="<? echo $PAPER_TYPE[$defaultConfig['size']]['height'] ?>" />
              
              
              <div class="button-wrapper" style="width:100%;clear:both;" >
                <button type="submit" name="" value="">CREATE PDF</button>
              </div>
            </form>
          </div>
          
        </div>
    </div>


    <?php
	return ob_get_clean();
}

add_shortcode('price_tag_maker', 'fn_ptm');