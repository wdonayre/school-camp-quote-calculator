/*
    Author: William Donayre Jr.
    Github: https://github.com/wdonayre
    E-Mail: wdonayredroid@gmail.com
    Date: 08/11/2017
*/

declare var $: any;
declare var jQuery:any;
declare var window:Window;

class SCC_Calculator{
    private _formSteps : any[];
    private _fields : any;
    private _fieldsArray: string[] = [];
    private _breakdown:any[];
    private _priceList:any;
    private _total:number = 0.00;
    private _endpoint = '';
    private _breakdownSummary;
    private _totalDetails:any;

    constructor(private _mainWrapper:any){
        $=jQuery;

        this._fields = {};
        this._formSteps = [{}];
        this._breakdown = [];
        
        this._totalDetails = {
            adults:0,
            child:0
        };
    } 
    public registerEndpointURL(url:string){
        this._endpoint = url;
    }

    public registerPriceList(pl){
        this._priceList = {};
        this._priceList['mealArray'] = pl;

        for(let key in pl){

            this._priceList[key] = {};

            if(key === 'accommodation')
            {
                this._priceList[key] = pl[key];
            }
            else
            {
                if (pl.hasOwnProperty(key)) {    
                    for(let i:number=0;i<pl[key].length;i++){
                        this._priceList[key][pl[key][i]['name']] = pl[key][i]; 
                        this._priceList[key][pl[key][i]['name']]['index'] = i;          
                    }         
                }    
            }
        }
        console.log(this._priceList);
    }

    public registerFieldArray(data :string){
        this._fieldsArray.push(data);
    }

    public initializeHeight(){
        let windowHeight:number = $(window).outerHeight();
        $(this._mainWrapper).find('.scc-modal-inner').each(function(index,element){
            let tmpHeight = $(element).outerHeight();

            $(element).addClass('tmpShow'); //add this class to be able to measure the height

            if((windowHeight - 80) < $(element).outerHeight()){
                let newHeight:number = windowHeight - $(element).find('.scc-modal-header').outerHeight() - $(element).find('.scc-modal-footer').outerHeight() - 80 /* margin top and bottom */;
                $(element).addClass('scc-modal-content-scroll').find('.scc-modal-body').height(newHeight);
            }

            $(element).removeClass('tmpShow');//remove class to be able to back to initial setup
        });
    }

    public init(){
        let obj = this;
        let innerHeight:number = 0;
        let tallestView:any = null;

        //let windowHeight:number = $(window).outerHeight();

        /*-------------------------------
          Initialize height and position
        --------------------------------*/
        this.initializeHeight();

        //Initialize button click events || NEXT ||
        $(this._mainWrapper).find('.scc-modal-content .scc-modal-inner').each(function(index,element){
            
            // Init Next Button
            $(element).find('.scc-next').on('click',function(e){
                e.preventDefault();
                
                //refresh activities fields
                if($(this).closest('.scc-modal-inner').attr('data-breakdown') === 'activities'){
                    obj._fields.activities = [];
                }

                let valid:boolean = obj.validateFields( $(element).closest('.scc-modal-inner').find('.form-group input'));

                if(valid && ($(element).closest('.scc-modal-inner').attr('data-view') !== 'breakdown')){
                    $(element).closest('.scc-modal-inner').hide().removeClass('active');
                    $($(element).closest('.scc-modal-inner').parent().find('.scc-modal-inner')[index+1]).fadeIn().addClass('active');
                
                    //process breakdown

                    obj.updateBreakdown($(element).closest('.scc-modal-inner'));

                    //check if current view is now activities
                    if($($(element).closest('.scc-modal-inner').parent().find('.scc-modal-inner')[index+1]).attr('data-breakdown') === 'activities')
                    {
                        let activitiesArray:string = '';
                        for(let activityKey in obj._priceList['activities'])
                        {
                            //console.log(activityKey);
                            if(typeof activityKey !== 'undefined')
                            {
                                var tmpActivity = obj._priceList['activities'][activityKey];
                                var ageGroup = {
                                    'junior':{
                                        min: 3,
                                        max:7
                                    },
                                    'middle-school':{
                                        min:8,
                                        max:9
                                    },
                                    'adults':{
                                        min:10,
                                        max:999
                                    }
                                };
                                var allowed = false;
                                var currentAgeGroup = ageGroup[obj._fields.ageGroup];

                                if(tmpActivity.ageGroup.min == null && tmpActivity.ageGroup.max==null){
                                    allowed = true;
                                }
                                else if(tmpActivity.ageGroup.min == null && (tmpActivity.ageGroup.max>=currentAgeGroup.max ))
                                {
                                    allowed = true;
                                }
                                else if(((tmpActivity.ageGroup.min <= currentAgeGroup.min)) && tmpActivity.ageGroup.max==null)
                                {
                                    allowed = true;
                                }
                                else if(tmpActivity.ageGroup.min <= currentAgeGroup.min && tmpActivity.ageGroup.max >= currentAgeGroup.max)
                                {
                                    allowed = true;
                                }
                                var tmpPrice = (typeof tmpActivity.price.default === 'undefined')?tmpActivity.price.adults:tmpActivity.price.default;
                                if(allowed)
                                {
                                    activitiesArray += '<div class="col-g-4">'+
                                                    '<div class="activity-item form-group" style="background-image:url(/wp-content/plugins/school-camp-calculator/assets/images/mountain-climbing.jpg)">'+
                                                        '<label class="activity-item-title">'+tmpActivity.text+'</label>'+
                                                        '<span class="activity-item-price">$ '+tmpPrice+'</span>'+
                                                        '<input class="disabled" type="hidden" name="activities" value="'+tmpActivity.name+'" />'+
                                                    '</div>'+           
                                                '</div>';   
                                    
                                    
                                }
                                
                            }
                        }
                        $($(element).closest('.scc-modal-inner').parent().find('.scc-modal-inner')[index+1]).find('.activity-selector-wrapper').html(activitiesArray);
                        obj.initializeHeight();
                        obj.reinitializeActivities();
                    }
                    $(element).closest('.scc-modal-content').find('.total-price').each(function(index,element){
                        $(element).find('span').text('$'+obj.getTotal());
                    });
                    //this.getTotal()
                }
                else
                {
                    obj.submitFields();    
                }
                console.log(obj._fields); //TEMPORARY
                this._total = obj.getTotal();
                console.log(this._total);
            });   
            
            //Init Back Button || BACK ||
            $(element).find('.scc-back').on('click',function(e){
                e.preventDefault();
                if(index > 0){
                    $(element).closest('.scc-modal-inner').hide().removeClass('active')
                    $($(element).closest('.scc-modal-inner').parent().find('.scc-modal-inner')[index-1]).fadeIn().addClass('active')
                }
            }); 
        });
    }

    /* ---------------------------------- */
    //COMPONENT CLICK EVENT :: Activities //
    /* ---------------------------------- */
    private reinitializeActivities(){
        let obj = this;
        $(this._mainWrapper).find('.activity-item').on('click',function(e){
            e.preventDefault();
            $(this).toggleClass('selected');
            if($(this).hasClass('selected')){
                $(this).find('input').removeClass('disabled');
            }
            else{
                $(this).find('input').addClass('disabled');   
            }
            
            if(typeof obj._breakdown['activities'].items !== 'undefined'){
                obj._breakdown['activities'].items = [];
                obj._fields.activities = [];
            }

            let valid:boolean = obj.validateFields( $(this).closest('.scc-modal-inner').find('.form-group input'));
            if(valid){
                obj.updateBreakdown($(this).closest('.scc-modal-inner'));
                $(this).closest('.scc-modal-wrapper').find('.total-price span').text('$'+obj.getTotal()); 
            }
        });
    }

    public updateBreakdown(wrapper:any){
        let key:string = $(wrapper).attr('data-breakdown');
        
        if(key!= undefined && key!== 'end-meal')
        {
            if(typeof this._breakdown[key] === 'undefined')
            {
                this._breakdown[key] = {};
            }
        }

        var arrival =  new Date(this._fields['arrival-date']);  
        var departure = new Date(this._fields['departure-date']); 
        var diff = Math.ceil( Math.abs(departure.getTime() - arrival.getTime())  / (1000 * 3600 * 24));  //days/nights stay
        
        let numAdults:number = parseInt(this._fields['number-of-adults']);
        let numChild:number = parseInt(this._fields['number-of-child']);

        if(key==='accommodation')
        {
            this._breakdown[key] = 
            {
                text:key,
                items:[
                    {
                        text:'Adults',
                        quantity: diff,
                        amount: this._priceList.accommodation.adults * diff * numAdults
                    },
                    {
                        text:'Child',
                        quantity: diff,
                        amount: this._priceList.accommodation.others * diff * numChild
                    }
                ]
            };

        }
        else if(key==='end-meal')
        {
            let endMealIndex  = this._priceList['meals'][this._fields['end-meal']].index;
            //console.log("Meal Index: " + endMealIndex);
            let mealKey = 'meals';
            let startMealIndex  = this._priceList[mealKey][this._fields.meal].index;
            let mealCount:any[] = [];
            let mealItems:any[] = [];
            for(let d:number = 0;d <= diff;d++)
            {
                for(let m:number=startMealIndex; m<this._priceList['mealArray'][mealKey].length; m++)
                {

                    startMealIndex = 0; //back to first meal index
                    let endMealFlag:boolean = false;
                    if((d == (diff)) && (m>endMealIndex))
                    {
                        endMealFlag = true;
                    }

                    if(endMealFlag == false){
                        if(typeof mealItems[m] === 'undefined'){
                            mealItems[m] = {text:this._priceList['mealArray'][mealKey][m]['text'],items:[  {text:'Adults',quantity:0,amount:0}, {text:'Child',quantity:0,amount:0}  ]};
                        }
                        //Adults
                        mealItems[m]['items'][0]['quantity'] += 1;
                        mealItems[m]['items'][0]['text'] = 'Adults @ '+numAdults + 'pax/' +mealItems[m]['items'][0]['quantity']+'meal(s)';
                        mealItems[m]['items'][0]['amount'] = mealItems[m]['items'][0]['quantity'] * numAdults * this._priceList[mealKey][this._priceList['mealArray']['meals'][m]['name']]['price']['adults'];
                        //Child
                        mealItems[m]['items'][1]['quantity'] += 1;
                        mealItems[m]['items'][1]['text'] = 'Child @ '+numChild + 'pax/' +mealItems[m]['items'][1]['quantity']+'meal(s)';
                        mealItems[m]['items'][1]['amount'] = mealItems[m]['items'][1]['quantity'] * numChild * this._priceList[mealKey][this._priceList['mealArray']['meals'][m]['name']]['price']['others'];
                        

                   }
                }
                
            }

            mealItems = this.arrayClean(undefined,mealItems);

            this._breakdown[mealKey] = {
                text:mealKey,
                items:mealItems    
            };
            
        }
        else if(key==='mealsxxxxxxx') //to be removed
        {
            let startMealIndex  = this._priceList[key][this._fields.meal].index;
            let mealCount:any[] = [];
            let mealItems:any[] = [];
            for(let d:number = 0;d < diff;d++)
            {
                for(let m:number=startMealIndex; m<this._priceList['mealArray']['meals'].length; m++)
                {

                    startMealIndex = 0; //back to first meal index
                    if(typeof mealItems[m] === 'undefined'){
                        mealItems[m] = {text:this._priceList['mealArray']['meals'][m]['text'],items:[  {text:'Adults',quantity:0,amount:0}, {text:'Child',quantity:0,amount:0}  ]};
                    }
                    //Adults
                    mealItems[m]['items'][0]['quantity'] += 1;
                    mealItems[m]['items'][0]['text'] = 'Adults @ '+numAdults + 'pax/' +mealItems[m]['items'][0]['quantity']+'days';
                    mealItems[m]['items'][0]['amount'] = mealItems[m]['items'][0]['quantity'] * numAdults * this._priceList[key][this._priceList['mealArray']['meals'][m]['name']]['price']['adults'];
                    //Child
                    mealItems[m]['items'][1]['quantity'] += 1;
                    mealItems[m]['items'][1]['text'] = 'Child @ '+numChild + 'pax/' +mealItems[m]['items'][1]['quantity']+'days';
                    mealItems[m]['items'][1]['amount'] = mealItems[m]['items'][1]['quantity'] * numChild * this._priceList[key][this._priceList['mealArray']['meals'][m]['name']]['price']['others'];
                }
                mealItems = this.arrayClean(undefined,mealItems);
            }

            this._breakdown[key] = {
                text:key,
                items:mealItems    
            };


        }
        else if(key==='activities')
        {
            let activityItems:any[] = [];
            for(let a:number = 0;a < this._fields.activities.length;a++)
            {
                var tmpPrice = (
                    typeof this._priceList['activities'][this._fields.activities[a]]['price']['default'] === 'undefined')?
                    this._priceList['activities'][this._fields.activities[a]]['price']['adults']:
                    this._priceList['activities'][this._fields.activities[a]]['price']['default'];

                let totalPax:number = (parseInt(this._fields['number-of-adults']) + parseInt(this._fields['number-of-child']));
                activityItems[a] = {text:this._priceList['activities'][this._fields.activities[a]]['text']+' @ '+totalPax+'pax',amount: tmpPrice * totalPax,price:tmpPrice};
            
            }
            this._breakdown[key] = {
                text:key,
                items:activityItems 
            };
        }
        console.log('breakdown:::');
        console.log(this._breakdown);
        this.getTotal();
        
        
        
        this.renderBreakdownView();

    }

    //utility functions
    /*======================================
    
    ======================================*/
    private arrayClean(deleteValue:any,data:any[]){
        
        for (var i = 0; i < data.length; i++) {
            if (data[i] == deleteValue) {         
                data.splice(i, 1);
                i--;
            }
        }
        return data;
    }

    private updateValues(field:any){
        let key:string = field.getAttribute('name');

        //check if we registered this field name to be an array or not
        if(this._fieldsArray.indexOf(key) < 0)
        {
            this._fields[key] = field.value;
        }
        else
        {
            //make sure .push method for array will work, so we make sure the array is defined.
            if(typeof this._fields[key] === 'undefined'){
                this._fields[key] = [];
            }

            //dont add if the input box is disabled
            if(!($(field).hasClass('disabled')))
            {
                this._fields[key].push(field.value);
            }
        }
        //if (!field.hasOwnProperty(key)) {
               
       // }
       //console.log(this._fields);
        
    }

    /*======================================
    
    ======================================*/
    private validateFields(fields:any[]){
        let ret:boolean = true;
        let prevKey:string = '';

        for(let field of fields){
            if($(field).val().length < 1 && $(field).hasClass('req'))
            {
                if($(field).closest('.form-group').find('label.overhead-error').length < 1)
                {
                    $(field).parent().addClass('form-group-error');
                    $(field).closest('.form-group').append('<label class="overhead-error">Required missing field</label>');
                }
                ret = false;
            }
            else
            {
                $(field).parent().removeClass('form-group-error');    
                $(field).closest('.form-group').find('label.overhead-error').remove();
                
                //update field values
                
            }

            //check email field type
            if(field.getAttribute('type') === 'email')
            {
                if (!(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(field.value)))
                {
                    if($(field).closest('.form-group').find('label.overhead-error').length < 1)
                    {
                        $(field).parent().addClass('form-group-error');
                        $(field).closest('.form-group').append('<label class="overhead-error">Invalid Email Address</label>');
                    }
                    ret = false;
                } 
            }
            
            //if radio or checkbox
            let currentKey = field.getAttribute('name');
            if((field.getAttribute('type') === 'radio')){
                //
                let tmpField : any = $(field).closest('.scc-modal-inner').find('input[type="'+field.getAttribute('type')+'"]:checked');

                if(( prevKey !== currentKey ) && (tmpField.length > 0) ){
                    this.updateValues(tmpField[0]);
                    prevKey = currentKey;
                }
            }
            else
            {
                this.updateValues(field);
            }
            
            
        }

        return ret;
    }

    /*------------------------
        Compute Total
    ------------------------*/
    private getTotal(){
        let ret:number = 0;

        this._totalDetails.adults = 0;
        this._totalDetails.child = 0;

        for(let key in this._breakdown){
            if (key != undefined)
            {
                for(let i:number=0;i<this._breakdown[key].items.length;i++){
                    if(key ==='accommodation'){
                        ret += this._breakdown[key].items[i].amount;
                        if(this._breakdown[key].items[i].text === 'Adults'){
                            this._totalDetails.adults += this._breakdown[key].items[i].amount;
                        }
                        else if(this._breakdown[key].items[i].text === 'Child'){
                            this._totalDetails.child += this._breakdown[key].items[i].amount;
                        }
                    } 
                    else if(key==='meals')
                    {
                        ret += this._breakdown[key].items[i].items[0].amount + this._breakdown[key].items[i].items[1].amount;
                        
                        this._totalDetails.adults += this._breakdown[key].items[i].items[0].amount;
                        this._totalDetails.child  += this._breakdown[key].items[i].items[1].amount;
                    }  
                    else if(key === 'activities')
                    {
                        ret += this._breakdown[key].items[i].amount;
                    } 
                }  
            }
        }

        if(this._fields['activities']){
            for(let a:number = 0;a < this._fields.activities.length;a++){
                var tmpPrice = (
                    typeof this._priceList['activities'][this._fields.activities[a]]['price']['default'] === 'undefined')?
                    this._priceList['activities'][this._fields.activities[a]]['price']['adults']:
                    this._priceList['activities'][this._fields.activities[a]]['price']['default'];

                this._totalDetails.adults += this._fields['number-of-adults'] * tmpPrice;
                this._totalDetails.child += this._fields['number-of-child'] * tmpPrice;
            }
        }
        console.log('TOTAL DETAILS: ');
        console.log(this._totalDetails);
        this._total = ret;
        return parseFloat(ret+'').toFixed(2);
    }
    /*------------------------
        Render BreakDown
    ------------------------*/
    private renderBreakdownView(){
        let breakdownView:any = $(this._mainWrapper).find('.scc-modal-inner[data-view="breakdown"] .scc-modal-body .grid');  
        
        this._breakdownSummary = {
            'activities':{},
            'meals':{},
            'accommodation':{}
        };

        //clear contents
        $(breakdownView).html('');

        //NAME
        $(breakdownView).append('<div class="col-50p m-b-10 info-wrapper"><div class="info-group"><label>Name</label><span>'+this._fields.name+'</span></div></div>');
        //EMAIL
        $(breakdownView).append('<div class="col-50p m-b-10 info-wrapper"><div class="info-group"><label>Email</label><span>'+this._fields.email+'</span></div></div>');

        //LABEL --> Breakdown
        $(breakdownView).append('<div class="col-100p m-b-10"><label>BREAKDOWN</label></div><br>');

        var tmpTables = '';


        //ACCOMMODATION
        tmpTables += '<table class="scc-table">'+'<thead>'+'<tr>'+'<th colspan="2">Accommodation</th>'+'</tr>'+'</thead>'+'<tbody>'+'<tr>'+'<td>'+this._breakdown['accommodation']['items'][0].text+'@'+this._fields['number-of-adults']+'pax/'+this._breakdown['accommodation']['items'][0].quantity+'days'+'</td>'+'<td class="text-right">$'+parseFloat(this._breakdown['accommodation']['items'][0].amount).toFixed(2)+'</td>'+'</tr>'+'<tr>'+'<td>'+this._breakdown['accommodation']['items'][1].text+'@'+this._fields['number-of-child']+'pax/'+this._breakdown['accommodation']['items'][1].quantity+'days'+'</td>'+'<td class="text-right">$'+parseFloat(this._breakdown['accommodation']['items'][1].amount).toFixed(2)+'</td>'+'</tr>'+'<tr><td colspan="2" class="subtotal">Subtotal: <span>$'+ parseFloat((this._breakdown['accommodation']['items'][0].amount + this._breakdown['accommodation']['items'][1].amount)+'').toFixed(2) +'</span></td></tr></tbody>'+'</table>';
        //Update breakdown summary
        this._breakdownSummary.accommodation = this._breakdown['accommodation']['items'];
        
        
        //MEALS
        var _tbl = '';
        if(typeof this._breakdown['meals'] === 'undefined')
        {
            this._breakdown['meals'] = {items:[]};
        }

        let mealAdultTotal = 0;
        let mealChildTotal = 0;
        let mealQtyAdults = 0;
        let mealQtyChild = 0;

        for(let m:number=0;m<this._breakdown['meals'].items.length;m++){
            //_tbl+='<tr><td colspan="2"><strong>'+this._breakdown['meals'].items[m]['text']+'</strong></td></tr>'
            //_tbl+='<tr><td>'+this._breakdown['meals'].items[m].items[0]['text']+'</td><td class="text-right">$'+parseFloat(this._breakdown['meals'].items[m].items[0]['amount']).toFixed(2)+'</td></tr>'
            //_tbl+='<tr><td>'+this._breakdown['meals'].items[m].items[1]['text']+'</td><td class="text-right">$'+parseFloat(this._breakdown['meals'].items[m].items[1]['amount']).toFixed(2)+'</td></tr>'
            mealAdultTotal  += this._breakdown['meals'].items[m].items[0]['amount'];
            mealQtyAdults   += this._breakdown['meals'].items[m].items[0].quantity;
            mealChildTotal  += this._breakdown['meals'].items[m].items[1]['amount'];
            mealQtyChild    += this._breakdown['meals'].items[m].items[1].quantity;
        }
        this._breakdownSummary.meals = {
            adults:{ quantity: mealQtyAdults, amount: mealAdultTotal},
            child: { quantity: mealQtyChild, amount: mealChildTotal}
        };
        _tbl+='<tr><td>Adults @ '+mealQtyAdults+' meal(s)</td><td class="text-right">$'+parseFloat(mealAdultTotal+'').toFixed(2)+'</td></tr>';
        _tbl+='<tr><td>Child @ '+mealQtyChild+' meal(s)</td><td class="text-right">$'+parseFloat(mealChildTotal+'').toFixed(2)+'</td></tr>';
        _tbl+='<tr><td colspan="2" class="subtotal">Subtotal: <span>$'+ parseFloat((mealAdultTotal + mealChildTotal)+'').toFixed(2) +'</span></td></tr>';
        tmpTables += '<table class="scc-table">'+'<thead>'+'<tr>'+'<th colspan="2">Meals</th>'+'</tr>'+'</thead>'+'<tbody>'+_tbl+'</tbody>'+'</table>';
        
        
        //ACTIVITIES
        _tbl = '';
        if(typeof this._breakdown['activities'] === 'undefined')
        {
            this._breakdown['activities'] = {items:[]};
        }
        let activityTotalAmount = 0;
        this._breakdownSummary.activities = [];
        for(let m:number=0;m<this._breakdown['activities'].items.length;m++){
            _tbl+=  '<tr>'+
                        '<td>'+this._breakdown['activities'].items[m]['text']+'</td>'+
                        '<td class="text-right">$'+parseFloat(this._breakdown['activities'].items[m]['amount']).toFixed(2)+'</td>'+
                    '</tr>';
            this._breakdownSummary.activities.push({activity:this._breakdown['activities'].items[m]['text'], amount: this._breakdown['activities'].items[m]['amount'],price:this._breakdown['activities'].items[m]['price']});
            activityTotalAmount += this._breakdown['activities'].items[m]['amount'];
        }
        _tbl += '<tr><td colspan="2" class="subtotal">Subtotal: <span>$'+ parseFloat(activityTotalAmount + '').toFixed(2) +'</span></td></tr>';
        tmpTables += '<table class="scc-table">'+'<thead>'+'<tr>'+'<th colspan="2">Activities</th>'+'</tr>'+'</thead>'+'<tbody>'+_tbl+'</tbody>'+'</table>';
        
        $(breakdownView).append('<div class="col-100p">'+tmpTables+'</div>');

        $(breakdownView).append('<div class="main-price-total">ADULT TOTAL: <span style="color:#343434;">$'+parseFloat(this._totalDetails.adults+'').toFixed(2)+'</span> <br> CHILD TOTAL: <span style="color:#343434;">$'+parseFloat(this._totalDetails.child+'').toFixed(2)+'</span> <br> <strong>GENERAL TOTAL:</strong> <span>$'+parseFloat(this._total+'').toFixed(2)+'</span></div><br>')


        console.log("BREAKDOWN");
        console.log(this._breakdown);
        //console.log(this._breakdownSummary);
    }

    /*------------------------
        Submit Fields
    ------------------------*/
    private submitFields(){
        
        var tmpData = {
           info:this._fields,
           items:this._breakdownSummary
        }
        
        $.ajax({
            url: this._endpoint,
            type: "post",
            data:tmpData,
            complete: function(){
                $('.scc-modal-wrapper .scc-modal-inner').hide();
                $('.scc-modal-wrapper .scc-modal-inner[data-view="thankyou"]').fadeIn();
            }
        });
    }
}



jQuery(document).ready(function($){
    //temporary


    var priceList = {
        accommodation: {
            adults:22.00,
            others:22.00
        },
        meals:[
            {
                text:'Breakfast',
                name:'breakfast',
                price:{
                    adults: 17.25,
                    others: 14.50
                }
            },
            {
                text:'A/Tea',
                name:'atea',
                price:{
                    adults:3.50,
                    others:3.50
                }
            },
            {
                text:'Lunch',
                name:'lunch',
                price:{
                    adults:17.25,
                    others:14.50
                }
            },
            {
                text:'Snacks',
                name:'snacks',
                price:{
                    adults:3.50,
                    others:3.50
                }
            },
            {
                text:'Dinner',
                name:'dinner',
                price:{
                    adults:17.25,
                    others:14.50
                }
            },
            {
                text:'Supper',
                name:'supper',
                price:{
                    adults:17.25,
                    others:14.50
                }
            } 
        ],
        activities:[
            {
                text:'Camp Out & Cook Out',
                name:'camp-out-cook-out',
                category:'leadership',
                ageGroup:{
                    min:5,
                    max:null
                },
                price:{
                    default:55
                },
                
            },
            {
                text:'Trust Initiatives',
                name:'trust-initiatives',
                category:'leadership',
                ageGroup:{
                    min:6,
                    max:null
                },
                price: {
                    default:16
                }
            },
            {
                text:'Hoop Pine Climb',
                name:'hoop-pint-climb',
                category:'high-adventure',
                ageGroup:{
                    min:6,
                    max:null
                },
                price:{
                    default:35
                }
            },
            {
                text:'Survivor!!!',
                name:'survivor',
                category:'ground-adventure',
                ageGroup:{
                    min:5,
                    max:null
                },
                price:{
                    default:16
                }
            },
            {
                text:'The Great Escape',
                name:'the-great-escape',
                category:'ground-adventure',
                ageGroup:{
                    min:4,
                    max:null
                },
                price:{
                    default:18
                }
            },
            {
                text:'The Island',
                name:'the-island',
                category:'ground-adventure',
                ageGroup:{
                    min:3,
                    max:9
                },
                price:{
                    default:16
                }
            },
            {
                text:'Jungle Fever',
                name:'jungle-fever',
                category:'ground-adventure',
                ageGroup:{
                    min:null,
                    max:6
                },
                price:{
                    default:16
                }
            },
            {
                text:'Team Challenge',
                name:'team-challenge',
                category:'team-initiative-activities',
                ageGroup:{
                    min:null,
                    max:null
                },
                price:{
                    default:16
                }
            },
            {
                text:'Team Building',
                name:'team-building',
                category:'team-initiative-activities',
                ageGroup:{
                    min:null,
                    max:null
                },
                price:{
                    default:16
                }
            },
            {
                text:'Wilderness Skills',
                name:'wilderness-skills',
                category:'team-initiative-activities',
                ageGroup:{
                    min:5,
                    max:null
                },
                price:{
                    default:16
                }
            },
            {
                text:'Scavenger Hunt',
                name:'scavenger-hunt',
                category:'exploration',
                ageGroup:{
                    min:3,
                    max:7
                },
                price:{
                    default:13
                }
            },
            {
                text:'Nature Walk',
                name:'nature-walk',
                category:'exploration',
                ageGroup:{
                    min:null,
                    max:null
                },
                price:{
                    default:13
                }
            }
        ]
    };

    var questions = {
        meals:{
            headline:null,
            subheadline:null,
            question:'Please choose your first meal',
            priceList:priceList.meals
        },
        ageGroup:{
            headline:null,
            subheadline:null,
            question:'Choice of age groups',    
        },
        activities:{
            headline:null,
            subheadline:null,
            question:'Select activities',
            priceList:priceList.activities    
        }
    };



    var scc = new SCC_Calculator($('.scc-modal-wrapper'));
    scc.registerFieldArray('activities'); //register field activities to support multiple answers
    scc.registerPriceList(priceList);
    scc.registerEndpointURL('/scc/v1');
    scc.init();
    // $('.scc-modal-wrapper .scc-modal-inner').each(function(index,element){
    
    // };
    var dateToday = new Date();
    $( "input.scc-date" ).datepicker({
        inline: true,
        minDate: dateToday,
    });

    $("button.scc-modal-trigger").on('click',function(e){
        e.preventDefault();
        $(this).next().fadeIn();
        scc.initializeHeight();
        $('body').addClass('scc-modal-fixed');
    });

    $('.scc-modal-close').on('click',function(e){
        e.preventDefault();
        $(this).closest('.scc-modal-wrapper').fadeOut();
        $('body').removeClass('scc-modal-fixed');
    });

});



    
