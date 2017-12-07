/*
    Author: William Donayre Jr.
    Github: https://github.com/wdonayre
    E-Mail: wdonayredroid@gmail.com
    Date: 08/11/2017
*/
var SCC_Calculator = /** @class */ (function () {
    function SCC_Calculator(_mainWrapper) {
        this._mainWrapper = _mainWrapper;
        this._fieldsArray = [];
        this._total = 0.00;
        this._endpoint = '';
        $ = jQuery;
        this._fields = {};
        this._formSteps = [{}];
        this._breakdown = [];
        this._totalDetails = {
            adults: 0,
            child: 0
        };
    }
    SCC_Calculator.prototype.registerEndpointURL = function (url) {
        this._endpoint = url;
    };
    SCC_Calculator.prototype.registerPriceList = function (pl) {
        this._priceList = {};
        this._priceList['mealArray'] = pl;
        for (var key in pl) {
            this._priceList[key] = {};
            if (key === 'accommodation') {
                this._priceList[key] = pl[key];
            }
            else {
                if (pl.hasOwnProperty(key)) {
                    for (var i = 0; i < pl[key].length; i++) {
                        this._priceList[key][pl[key][i]['name']] = pl[key][i];
                        this._priceList[key][pl[key][i]['name']]['index'] = i;
                    }
                }
            }
        }
        console.log(this._priceList);
    };
    SCC_Calculator.prototype.registerFieldArray = function (data) {
        this._fieldsArray.push(data);
    };
    SCC_Calculator.prototype.initializeHeight = function () {
        var windowHeight = $(window).outerHeight();
        $(this._mainWrapper).find('.scc-modal-inner').each(function (index, element) {
            var tmpHeight = $(element).outerHeight();
            $(element).addClass('tmpShow'); //add this class to be able to measure the height
            if ((windowHeight - 80) < $(element).outerHeight()) {
                var newHeight = windowHeight - $(element).find('.scc-modal-header').outerHeight() - $(element).find('.scc-modal-footer').outerHeight() - 80 /* margin top and bottom */;
                $(element).addClass('scc-modal-content-scroll').find('.scc-modal-body').height(newHeight);
            }
            $(element).removeClass('tmpShow'); //remove class to be able to back to initial setup
        });
    };
    SCC_Calculator.prototype.init = function () {
        var obj = this;
        var innerHeight = 0;
        var tallestView = null;
        //let windowHeight:number = $(window).outerHeight();
        /*-------------------------------
          Initialize height and position
        --------------------------------*/
        this.initializeHeight();
        //Initialize button click events || NEXT ||
        $(this._mainWrapper).find('.scc-modal-content .scc-modal-inner').each(function (index, element) {
            // Init Next Button
            $(element).find('.scc-next').on('click', function (e) {
                e.preventDefault();
                //refresh activities fields
                if ($(this).closest('.scc-modal-inner').attr('data-breakdown') === 'activities') {
                    obj._fields.activities = [];
                }
                var valid = obj.validateFields($(element).closest('.scc-modal-inner').find('.form-group input'));
                if (valid && ($(element).closest('.scc-modal-inner').attr('data-view') !== 'breakdown')) {
                    $(element).closest('.scc-modal-inner').hide().removeClass('active');
                    $($(element).closest('.scc-modal-inner').parent().find('.scc-modal-inner')[index + 1]).fadeIn().addClass('active');
                    //process breakdown
                    obj.updateBreakdown($(element).closest('.scc-modal-inner'));
                    //check if current view is now activities
                    if ($($(element).closest('.scc-modal-inner').parent().find('.scc-modal-inner')[index + 1]).attr('data-breakdown') === 'activities') {
                        var activitiesArray = '';
                        for (var activityKey in obj._priceList['activities']) {
                            //console.log(activityKey);
                            if (typeof activityKey !== 'undefined') {
                                var tmpActivity = obj._priceList['activities'][activityKey];
                                var ageGroup = {
                                    'junior': {
                                        min: 3,
                                        max: 7
                                    },
                                    'middle-school': {
                                        min: 8,
                                        max: 9
                                    },
                                    'adults': {
                                        min: 10,
                                        max: 999
                                    }
                                };
                                var allowed = false;
                                var currentAgeGroup = ageGroup[obj._fields.ageGroup];
                                if (tmpActivity.ageGroup.min == null && tmpActivity.ageGroup.max == null) {
                                    allowed = true;
                                }
                                else if (tmpActivity.ageGroup.min == null && (tmpActivity.ageGroup.max >= currentAgeGroup.max)) {
                                    allowed = true;
                                }
                                else if (((tmpActivity.ageGroup.min <= currentAgeGroup.min)) && tmpActivity.ageGroup.max == null) {
                                    allowed = true;
                                }
                                else if (tmpActivity.ageGroup.min <= currentAgeGroup.min && tmpActivity.ageGroup.max >= currentAgeGroup.max) {
                                    allowed = true;
                                }
                                var tmpPrice = (typeof tmpActivity.price.default === 'undefined') ? tmpActivity.price.adults : tmpActivity.price.default;
                                if (allowed) {
                                    activitiesArray += '<div class="col-g-4">' +
                                        '<div class="activity-item form-group" style="background-image:url(/wp-content/plugins/school-camp-calculator/assets/images/mountain-climbing.jpg)">' +
                                        '<label class="activity-item-title">' + tmpActivity.text + '</label>' +
                                        '<span class="activity-item-price">$ ' + tmpPrice + '</span>' +
                                        '<input class="disabled" type="hidden" name="activities" value="' + tmpActivity.name + '" />' +
                                        '</div>' +
                                        '</div>';
                                }
                            }
                        }
                        $($(element).closest('.scc-modal-inner').parent().find('.scc-modal-inner')[index + 1]).find('.activity-selector-wrapper').html(activitiesArray);
                        obj.initializeHeight();
                        obj.reinitializeActivities();
                    }
                    $(element).closest('.scc-modal-content').find('.total-price').each(function (index, element) {
                        $(element).find('span').text('$' + obj.getTotal());
                    });
                    //this.getTotal()
                }
                else {
                    obj.submitFields();
                }
                console.log(obj._fields); //TEMPORARY
                this._total = obj.getTotal();
                console.log(this._total);
            });
            //Init Back Button || BACK ||
            $(element).find('.scc-back').on('click', function (e) {
                e.preventDefault();
                if (index > 0) {
                    $(element).closest('.scc-modal-inner').hide().removeClass('active');
                    $($(element).closest('.scc-modal-inner').parent().find('.scc-modal-inner')[index - 1]).fadeIn().addClass('active');
                }
            });
        });
    };
    /* ---------------------------------- */
    //COMPONENT CLICK EVENT :: Activities //
    /* ---------------------------------- */
    SCC_Calculator.prototype.reinitializeActivities = function () {
        var obj = this;
        $(this._mainWrapper).find('.activity-item').on('click', function (e) {
            e.preventDefault();
            $(this).toggleClass('selected');
            if ($(this).hasClass('selected')) {
                $(this).find('input').removeClass('disabled');
            }
            else {
                $(this).find('input').addClass('disabled');
            }
            if (typeof obj._breakdown['activities'].items !== 'undefined') {
                obj._breakdown['activities'].items = [];
                obj._fields.activities = [];
            }
            var valid = obj.validateFields($(this).closest('.scc-modal-inner').find('.form-group input'));
            if (valid) {
                obj.updateBreakdown($(this).closest('.scc-modal-inner'));
                $(this).closest('.scc-modal-wrapper').find('.total-price span').text('$' + obj.getTotal());
            }
        });
    };
    SCC_Calculator.prototype.updateBreakdown = function (wrapper) {
        var key = $(wrapper).attr('data-breakdown');
        if (key != undefined && key !== 'end-meal') {
            if (typeof this._breakdown[key] === 'undefined') {
                this._breakdown[key] = {};
            }
        }
        var arrival = new Date(this._fields['arrival-date']);
        var departure = new Date(this._fields['departure-date']);
        var diff = Math.ceil(Math.abs(departure.getTime() - arrival.getTime()) / (1000 * 3600 * 24)); //days/nights stay
        var numAdults = parseInt(this._fields['number-of-adults']);
        var numChild = parseInt(this._fields['number-of-child']);
        if (key === 'accommodation') {
            this._breakdown[key] =
                {
                    text: key,
                    items: [
                        {
                            text: 'Adults',
                            quantity: diff,
                            amount: this._priceList.accommodation.adults * diff * numAdults
                        },
                        {
                            text: 'Child',
                            quantity: diff,
                            amount: this._priceList.accommodation.others * diff * numChild
                        }
                    ]
                };
        }
        else if (key === 'end-meal') {
            var endMealIndex = this._priceList['meals'][this._fields['end-meal']].index;
            //console.log("Meal Index: " + endMealIndex);
            var mealKey = 'meals';
            var startMealIndex = this._priceList[mealKey][this._fields.meal].index;
            var mealCount = [];
            var mealItems = [];
            for (var d = 0; d <= diff; d++) {
                for (var m = startMealIndex; m < this._priceList['mealArray'][mealKey].length; m++) {
                    startMealIndex = 0; //back to first meal index
                    var endMealFlag = false;
                    if ((d == (diff)) && (m > endMealIndex)) {
                        endMealFlag = true;
                    }
                    if (endMealFlag == false) {
                        if (typeof mealItems[m] === 'undefined') {
                            mealItems[m] = { text: this._priceList['mealArray'][mealKey][m]['text'], items: [{ text: 'Adults', quantity: 0, amount: 0 }, { text: 'Child', quantity: 0, amount: 0 }] };
                        }
                        //Adults
                        mealItems[m]['items'][0]['quantity'] += 1;
                        mealItems[m]['items'][0]['text'] = 'Adults @ ' + numAdults + 'pax/' + mealItems[m]['items'][0]['quantity'] + 'meal(s)';
                        mealItems[m]['items'][0]['amount'] = mealItems[m]['items'][0]['quantity'] * numAdults * this._priceList[mealKey][this._priceList['mealArray']['meals'][m]['name']]['price']['adults'];
                        //Child
                        mealItems[m]['items'][1]['quantity'] += 1;
                        mealItems[m]['items'][1]['text'] = 'Child @ ' + numChild + 'pax/' + mealItems[m]['items'][1]['quantity'] + 'meal(s)';
                        mealItems[m]['items'][1]['amount'] = mealItems[m]['items'][1]['quantity'] * numChild * this._priceList[mealKey][this._priceList['mealArray']['meals'][m]['name']]['price']['others'];
                    }
                }
            }
            mealItems = this.arrayClean(undefined, mealItems);
            this._breakdown[mealKey] = {
                text: mealKey,
                items: mealItems
            };
        }
        else if (key === 'mealsxxxxxxx') {
            var startMealIndex = this._priceList[key][this._fields.meal].index;
            var mealCount = [];
            var mealItems = [];
            for (var d = 0; d < diff; d++) {
                for (var m = startMealIndex; m < this._priceList['mealArray']['meals'].length; m++) {
                    startMealIndex = 0; //back to first meal index
                    if (typeof mealItems[m] === 'undefined') {
                        mealItems[m] = { text: this._priceList['mealArray']['meals'][m]['text'], items: [{ text: 'Adults', quantity: 0, amount: 0 }, { text: 'Child', quantity: 0, amount: 0 }] };
                    }
                    //Adults
                    mealItems[m]['items'][0]['quantity'] += 1;
                    mealItems[m]['items'][0]['text'] = 'Adults @ ' + numAdults + 'pax/' + mealItems[m]['items'][0]['quantity'] + 'days';
                    mealItems[m]['items'][0]['amount'] = mealItems[m]['items'][0]['quantity'] * numAdults * this._priceList[key][this._priceList['mealArray']['meals'][m]['name']]['price']['adults'];
                    //Child
                    mealItems[m]['items'][1]['quantity'] += 1;
                    mealItems[m]['items'][1]['text'] = 'Child @ ' + numChild + 'pax/' + mealItems[m]['items'][1]['quantity'] + 'days';
                    mealItems[m]['items'][1]['amount'] = mealItems[m]['items'][1]['quantity'] * numChild * this._priceList[key][this._priceList['mealArray']['meals'][m]['name']]['price']['others'];
                }
                mealItems = this.arrayClean(undefined, mealItems);
            }
            this._breakdown[key] = {
                text: key,
                items: mealItems
            };
        }
        else if (key === 'activities') {
            var activityItems = [];
            for (var a = 0; a < this._fields.activities.length; a++) {
                var tmpPrice = (typeof this._priceList['activities'][this._fields.activities[a]]['price']['default'] === 'undefined') ?
                    this._priceList['activities'][this._fields.activities[a]]['price']['adults'] :
                    this._priceList['activities'][this._fields.activities[a]]['price']['default'];
                var totalPax = (parseInt(this._fields['number-of-adults']) + parseInt(this._fields['number-of-child']));
                activityItems[a] = { text: this._priceList['activities'][this._fields.activities[a]]['text'] + ' @ ' + totalPax + 'pax', amount: tmpPrice * totalPax, price: tmpPrice };
            }
            this._breakdown[key] = {
                text: key,
                items: activityItems
            };
        }
        console.log('breakdown:::');
        console.log(this._breakdown);
        this.getTotal();
        this.renderBreakdownView();
    };
    //utility functions
    /*======================================
    
    ======================================*/
    SCC_Calculator.prototype.arrayClean = function (deleteValue, data) {
        for (var i = 0; i < data.length; i++) {
            if (data[i] == deleteValue) {
                data.splice(i, 1);
                i--;
            }
        }
        return data;
    };
    SCC_Calculator.prototype.updateValues = function (field) {
        var key = field.getAttribute('name');
        //check if we registered this field name to be an array or not
        if (this._fieldsArray.indexOf(key) < 0) {
            this._fields[key] = field.value;
        }
        else {
            //make sure .push method for array will work, so we make sure the array is defined.
            if (typeof this._fields[key] === 'undefined') {
                this._fields[key] = [];
            }
            //dont add if the input box is disabled
            if (!($(field).hasClass('disabled'))) {
                this._fields[key].push(field.value);
            }
        }
        //if (!field.hasOwnProperty(key)) {
        // }
        //console.log(this._fields);
    };
    /*======================================
    
    ======================================*/
    SCC_Calculator.prototype.validateFields = function (fields) {
        var ret = true;
        var prevKey = '';
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var field = fields_1[_i];
            if ($(field).val().length < 1 && $(field).hasClass('req')) {
                if ($(field).closest('.form-group').find('label.overhead-error').length < 1) {
                    $(field).parent().addClass('form-group-error');
                    $(field).closest('.form-group').append('<label class="overhead-error">Required missing field</label>');
                }
                ret = false;
            }
            else {
                $(field).parent().removeClass('form-group-error');
                $(field).closest('.form-group').find('label.overhead-error').remove();
                //update field values
            }
            //check email field type
            if (field.getAttribute('type') === 'email') {
                if (!(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(field.value))) {
                    if ($(field).closest('.form-group').find('label.overhead-error').length < 1) {
                        $(field).parent().addClass('form-group-error');
                        $(field).closest('.form-group').append('<label class="overhead-error">Invalid Email Address</label>');
                    }
                    ret = false;
                }
            }
            //if radio or checkbox
            var currentKey = field.getAttribute('name');
            if ((field.getAttribute('type') === 'radio')) {
                //
                var tmpField = $(field).closest('.scc-modal-inner').find('input[type="' + field.getAttribute('type') + '"]:checked');
                if ((prevKey !== currentKey) && (tmpField.length > 0)) {
                    this.updateValues(tmpField[0]);
                    prevKey = currentKey;
                }
            }
            else {
                this.updateValues(field);
            }
        }
        return ret;
    };
    /*------------------------
        Compute Total
    ------------------------*/
    SCC_Calculator.prototype.getTotal = function () {
        var ret = 0;
        this._totalDetails.adults = 0;
        this._totalDetails.child = 0;
        for (var key in this._breakdown) {
            if (key != undefined) {
                for (var i = 0; i < this._breakdown[key].items.length; i++) {
                    if (key === 'accommodation') {
                        ret += this._breakdown[key].items[i].amount;
                        if (this._breakdown[key].items[i].text === 'Adults') {
                            this._totalDetails.adults += this._breakdown[key].items[i].amount;
                        }
                        else if (this._breakdown[key].items[i].text === 'Child') {
                            this._totalDetails.child += this._breakdown[key].items[i].amount;
                        }
                    }
                    else if (key === 'meals') {
                        ret += this._breakdown[key].items[i].items[0].amount + this._breakdown[key].items[i].items[1].amount;
                        this._totalDetails.adults += this._breakdown[key].items[i].items[0].amount;
                        this._totalDetails.child += this._breakdown[key].items[i].items[1].amount;
                    }
                    else if (key === 'activities') {
                        ret += this._breakdown[key].items[i].amount;
                    }
                }
            }
        }
        if (this._fields['activities']) {
            for (var a = 0; a < this._fields.activities.length; a++) {
                var tmpPrice = (typeof this._priceList['activities'][this._fields.activities[a]]['price']['default'] === 'undefined') ?
                    this._priceList['activities'][this._fields.activities[a]]['price']['adults'] :
                    this._priceList['activities'][this._fields.activities[a]]['price']['default'];
                this._totalDetails.adults += this._fields['number-of-adults'] * tmpPrice;
                this._totalDetails.child += this._fields['number-of-child'] * tmpPrice;
            }
        }
        console.log('TOTAL DETAILS: ');
        console.log(this._totalDetails);
        this._total = ret;
        return parseFloat(ret + '').toFixed(2);
    };
    /*------------------------
        Render BreakDown
    ------------------------*/
    SCC_Calculator.prototype.renderBreakdownView = function () {
        var breakdownView = $(this._mainWrapper).find('.scc-modal-inner[data-view="breakdown"] .scc-modal-body .grid');
        this._breakdownSummary = {
            'activities': {},
            'meals': {},
            'accommodation': {}
        };
        //clear contents
        $(breakdownView).html('');
        //NAME
        $(breakdownView).append('<div class="col-50p m-b-10 info-wrapper"><div class="info-group"><label>Name</label><span>' + this._fields.name + '</span></div></div>');
        //EMAIL
        $(breakdownView).append('<div class="col-50p m-b-10 info-wrapper"><div class="info-group"><label>Email</label><span>' + this._fields.email + '</span></div></div>');
        //LABEL --> Breakdown
        $(breakdownView).append('<div class="col-100p m-b-10"><label>BREAKDOWN</label></div><br>');
        var tmpTables = '';
        //ACCOMMODATION
        tmpTables += '<table class="scc-table">' + '<thead>' + '<tr>' + '<th colspan="2">Accommodation</th>' + '</tr>' + '</thead>' + '<tbody>' + '<tr>' + '<td>' + this._breakdown['accommodation']['items'][0].text + '@' + this._fields['number-of-adults'] + 'pax/' + this._breakdown['accommodation']['items'][0].quantity + 'days' + '</td>' + '<td class="text-right">$' + parseFloat(this._breakdown['accommodation']['items'][0].amount).toFixed(2) + '</td>' + '</tr>' + '<tr>' + '<td>' + this._breakdown['accommodation']['items'][1].text + '@' + this._fields['number-of-child'] + 'pax/' + this._breakdown['accommodation']['items'][1].quantity + 'days' + '</td>' + '<td class="text-right">$' + parseFloat(this._breakdown['accommodation']['items'][1].amount).toFixed(2) + '</td>' + '</tr>' + '<tr><td colspan="2" class="subtotal">Subtotal: <span>$' + parseFloat((this._breakdown['accommodation']['items'][0].amount + this._breakdown['accommodation']['items'][1].amount) + '').toFixed(2) + '</span></td></tr></tbody>' + '</table>';
        //Update breakdown summary
        this._breakdownSummary.accommodation = this._breakdown['accommodation']['items'];
        //MEALS
        var _tbl = '';
        if (typeof this._breakdown['meals'] === 'undefined') {
            this._breakdown['meals'] = { items: [] };
        }
        var mealAdultTotal = 0;
        var mealChildTotal = 0;
        var mealQtyAdults = 0;
        var mealQtyChild = 0;
        for (var m = 0; m < this._breakdown['meals'].items.length; m++) {
            //_tbl+='<tr><td colspan="2"><strong>'+this._breakdown['meals'].items[m]['text']+'</strong></td></tr>'
            //_tbl+='<tr><td>'+this._breakdown['meals'].items[m].items[0]['text']+'</td><td class="text-right">$'+parseFloat(this._breakdown['meals'].items[m].items[0]['amount']).toFixed(2)+'</td></tr>'
            //_tbl+='<tr><td>'+this._breakdown['meals'].items[m].items[1]['text']+'</td><td class="text-right">$'+parseFloat(this._breakdown['meals'].items[m].items[1]['amount']).toFixed(2)+'</td></tr>'
            mealAdultTotal += this._breakdown['meals'].items[m].items[0]['amount'];
            mealQtyAdults += this._breakdown['meals'].items[m].items[0].quantity;
            mealChildTotal += this._breakdown['meals'].items[m].items[1]['amount'];
            mealQtyChild += this._breakdown['meals'].items[m].items[1].quantity;
        }
        this._breakdownSummary.meals = {
            adults: { quantity: mealQtyAdults, amount: mealAdultTotal },
            child: { quantity: mealQtyChild, amount: mealChildTotal }
        };
        _tbl += '<tr><td>Adults @ ' + mealQtyAdults + ' meal(s)</td><td class="text-right">$' + parseFloat(mealAdultTotal + '').toFixed(2) + '</td></tr>';
        _tbl += '<tr><td>Child @ ' + mealQtyChild + ' meal(s)</td><td class="text-right">$' + parseFloat(mealChildTotal + '').toFixed(2) + '</td></tr>';
        _tbl += '<tr><td colspan="2" class="subtotal">Subtotal: <span>$' + parseFloat((mealAdultTotal + mealChildTotal) + '').toFixed(2) + '</span></td></tr>';
        tmpTables += '<table class="scc-table">' + '<thead>' + '<tr>' + '<th colspan="2">Meals</th>' + '</tr>' + '</thead>' + '<tbody>' + _tbl + '</tbody>' + '</table>';
        //ACTIVITIES
        _tbl = '';
        if (typeof this._breakdown['activities'] === 'undefined') {
            this._breakdown['activities'] = { items: [] };
        }
        var activityTotalAmount = 0;
        this._breakdownSummary.activities = [];
        for (var m = 0; m < this._breakdown['activities'].items.length; m++) {
            _tbl += '<tr>' +
                '<td>' + this._breakdown['activities'].items[m]['text'] + '</td>' +
                '<td class="text-right">$' + parseFloat(this._breakdown['activities'].items[m]['amount']).toFixed(2) + '</td>' +
                '</tr>';
            this._breakdownSummary.activities.push({ activity: this._breakdown['activities'].items[m]['text'], amount: this._breakdown['activities'].items[m]['amount'], price: this._breakdown['activities'].items[m]['price'] });
            activityTotalAmount += this._breakdown['activities'].items[m]['amount'];
        }
        _tbl += '<tr><td colspan="2" class="subtotal">Subtotal: <span>$' + parseFloat(activityTotalAmount + '').toFixed(2) + '</span></td></tr>';
        tmpTables += '<table class="scc-table">' + '<thead>' + '<tr>' + '<th colspan="2">Activities</th>' + '</tr>' + '</thead>' + '<tbody>' + _tbl + '</tbody>' + '</table>';
        $(breakdownView).append('<div class="col-100p">' + tmpTables + '</div>');
        $(breakdownView).append('<div class="main-price-total">ADULT TOTAL: <span style="color:#343434;">$' + parseFloat(this._totalDetails.adults + '').toFixed(2) + '</span> <br> CHILD TOTAL: <span style="color:#343434;">$' + parseFloat(this._totalDetails.child + '').toFixed(2) + '</span> <br> <strong>GENERAL TOTAL:</strong> <span>$' + parseFloat(this._total + '').toFixed(2) + '</span></div><br>');
        console.log("BREAKDOWN");
        console.log(this._breakdown);
        //console.log(this._breakdownSummary);
    };
    /*------------------------
        Submit Fields
    ------------------------*/
    SCC_Calculator.prototype.submitFields = function () {
        var tmpData = {
            info: this._fields,
            items: this._breakdownSummary
        };
        $.ajax({
            url: this._endpoint,
            type: "post",
            data: tmpData,
            complete: function () {
                $('.scc-modal-wrapper .scc-modal-inner').hide();
                $('.scc-modal-wrapper .scc-modal-inner[data-view="thankyou"]').fadeIn();
            }
        });
    };
    return SCC_Calculator;
}());
jQuery(document).ready(function ($) {
    //temporary
    var priceList = {
        accommodation: {
            adults: 22.00,
            others: 22.00
        },
        meals: [
            {
                text: 'Breakfast',
                name: 'breakfast',
                price: {
                    adults: 17.25,
                    others: 14.50
                }
            },
            {
                text: 'A/Tea',
                name: 'atea',
                price: {
                    adults: 3.50,
                    others: 3.50
                }
            },
            {
                text: 'Lunch',
                name: 'lunch',
                price: {
                    adults: 17.25,
                    others: 14.50
                }
            },
            {
                text: 'Snacks',
                name: 'snacks',
                price: {
                    adults: 3.50,
                    others: 3.50
                }
            },
            {
                text: 'Dinner',
                name: 'dinner',
                price: {
                    adults: 17.25,
                    others: 14.50
                }
            },
            {
                text: 'Supper',
                name: 'supper',
                price: {
                    adults: 17.25,
                    others: 14.50
                }
            }
        ],
        activities: [
            {
                text: 'Camp Out & Cook Out',
                name: 'camp-out-cook-out',
                category: 'leadership',
                ageGroup: {
                    min: 5,
                    max: null
                },
                price: {
                    default: 55
                },
            },
            {
                text: 'Trust Initiatives',
                name: 'trust-initiatives',
                category: 'leadership',
                ageGroup: {
                    min: 6,
                    max: null
                },
                price: {
                    default: 16
                }
            },
            {
                text: 'Hoop Pine Climb',
                name: 'hoop-pint-climb',
                category: 'high-adventure',
                ageGroup: {
                    min: 6,
                    max: null
                },
                price: {
                    default: 35
                }
            },
            {
                text: 'Survivor!!!',
                name: 'survivor',
                category: 'ground-adventure',
                ageGroup: {
                    min: 5,
                    max: null
                },
                price: {
                    default: 16
                }
            },
            {
                text: 'The Great Escape',
                name: 'the-great-escape',
                category: 'ground-adventure',
                ageGroup: {
                    min: 4,
                    max: null
                },
                price: {
                    default: 18
                }
            },
            {
                text: 'The Island',
                name: 'the-island',
                category: 'ground-adventure',
                ageGroup: {
                    min: 3,
                    max: 9
                },
                price: {
                    default: 16
                }
            },
            {
                text: 'Jungle Fever',
                name: 'jungle-fever',
                category: 'ground-adventure',
                ageGroup: {
                    min: null,
                    max: 6
                },
                price: {
                    default: 16
                }
            },
            {
                text: 'Team Challenge',
                name: 'team-challenge',
                category: 'team-initiative-activities',
                ageGroup: {
                    min: null,
                    max: null
                },
                price: {
                    default: 16
                }
            },
            {
                text: 'Team Building',
                name: 'team-building',
                category: 'team-initiative-activities',
                ageGroup: {
                    min: null,
                    max: null
                },
                price: {
                    default: 16
                }
            },
            {
                text: 'Wilderness Skills',
                name: 'wilderness-skills',
                category: 'team-initiative-activities',
                ageGroup: {
                    min: 5,
                    max: null
                },
                price: {
                    default: 16
                }
            },
            {
                text: 'Scavenger Hunt',
                name: 'scavenger-hunt',
                category: 'exploration',
                ageGroup: {
                    min: 3,
                    max: 7
                },
                price: {
                    default: 13
                }
            },
            {
                text: 'Nature Walk',
                name: 'nature-walk',
                category: 'exploration',
                ageGroup: {
                    min: null,
                    max: null
                },
                price: {
                    default: 13
                }
            }
        ]
    };
    var questions = {
        meals: {
            headline: null,
            subheadline: null,
            question: 'Please choose your first meal',
            priceList: priceList.meals
        },
        ageGroup: {
            headline: null,
            subheadline: null,
            question: 'Choice of age groups',
        },
        activities: {
            headline: null,
            subheadline: null,
            question: 'Select activities',
            priceList: priceList.activities
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
    $("input.scc-date").datepicker({
        inline: true,
        minDate: dateToday,
    });
    $("button.scc-modal-trigger").on('click', function (e) {
        e.preventDefault();
        $(this).next().fadeIn();
        scc.initializeHeight();
        $('body').addClass('scc-modal-fixed');
    });
    $('.scc-modal-close').on('click', function (e) {
        e.preventDefault();
        $(this).closest('.scc-modal-wrapper').fadeOut();
        $('body').removeClass('scc-modal-fixed');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NjLXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNjYy1zY3JpcHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0VBS0U7QUFNRjtJQVdJLHdCQUFvQixZQUFnQjtRQUFoQixpQkFBWSxHQUFaLFlBQVksQ0FBSTtRQVI1QixpQkFBWSxHQUFhLEVBQUUsQ0FBQztRQUc1QixXQUFNLEdBQVUsSUFBSSxDQUFDO1FBQ3JCLGNBQVMsR0FBRyxFQUFFLENBQUM7UUFLbkIsQ0FBQyxHQUFDLE1BQU0sQ0FBQztRQUVULElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsYUFBYSxHQUFHO1lBQ2pCLE1BQU0sRUFBQyxDQUFDO1lBQ1IsS0FBSyxFQUFDLENBQUM7U0FDVixDQUFDO0lBQ04sQ0FBQztJQUNNLDRDQUFtQixHQUExQixVQUEyQixHQUFVO1FBQ2pDLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0lBQ3pCLENBQUM7SUFFTSwwQ0FBaUIsR0FBeEIsVUFBeUIsRUFBRTtRQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUVsQyxHQUFHLENBQUEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQSxDQUFDO1lBRWYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFMUIsRUFBRSxDQUFBLENBQUMsR0FBRyxLQUFLLGVBQWUsQ0FBQyxDQUMzQixDQUFDO2dCQUNHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLENB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QUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLElBQUksRUFBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxFQUFDLENBQUcsRUFBQyxDQUFDO29CQUMvSixDQUFDO29CQUNELFFBQVE7b0JBQ1IsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDMUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLFdBQVcsR0FBQyxTQUFTLEdBQUcsTUFBTSxHQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBQyxNQUFNLENBQUM7b0JBQy9HLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNsTCxPQUFPO29CQUNQLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxVQUFV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