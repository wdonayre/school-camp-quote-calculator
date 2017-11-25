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
        $ = jQuery;
        this._fields = {};
        this._formSteps = [{}];
        this._breakdown = [];
    }
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
                if (valid) {
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
                                        '<div class="activity-item form-group" style="background-image:url(http://plugindev.dev/wp-content/plugins/school-camp-calculator/assets/images/mountain-climbing.jpg)">' +
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
        ;
        if (key != undefined) {
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
                            text: 'Children',
                            quantity: diff,
                            amount: this._priceList.accommodation.others * diff * numChild
                        }
                    ]
                };
        }
        else if (key === 'meals') {
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
                activityItems[a] = { text: this._priceList['activities'][this._fields.activities[a]]['text'] + ' @ ' + totalPax + 'pax', amount: tmpPrice * totalPax };
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
        for (var key in this._breakdown) {
            if (key != undefined) {
                for (var i = 0; i < this._breakdown[key].items.length; i++) {
                    if (key === 'accommodation') {
                        ret += this._breakdown[key].items[i].amount;
                    }
                    else if (key === 'meals') {
                        ret += this._breakdown[key].items[i].items[0].amount + this._breakdown[key].items[i].items[1].amount;
                    }
                    else if (key === 'activities') {
                        ret += this._breakdown[key].items[i].amount;
                    }
                }
            }
        }
        this._total = ret;
        return parseFloat(ret + '').toFixed(2);
    };
    /*------------------------
        Render BreakDown
    ------------------------*/
    SCC_Calculator.prototype.renderBreakdownView = function () {
        var breakdownView = $(this._mainWrapper).find('.scc-modal-inner[data-view="breakdown"] .scc-modal-body .grid');
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
        tmpTables += '<table class="scc-table">' + '<thead>' + '<tr>' + '<th colspan="2">Accommodation</th>' + '</tr>' + '</thead>' + '<tbody>' + '<tr>' + '<td>' + this._breakdown['accommodation']['items'][0].text + '@' + this._fields['number-of-adults'] + 'pax/' + this._breakdown['accommodation']['items'][0].quantity + 'days' + '</td>' + '<td class="text-right">$' + parseFloat(this._breakdown['accommodation']['items'][0].amount).toFixed(2) + '</td>' + '</tr>' + '<tr>' + '<td>' + this._breakdown['accommodation']['items'][1].text + '@' + this._fields['number-of-child'] + 'pax/' + this._breakdown['accommodation']['items'][1].quantity + 'days' + '</td>' + '<td class="text-right">$' + parseFloat(this._breakdown['accommodation']['items'][1].amount).toFixed(2) + '</td>' + '</tr>' + '</tbody>' + '</table>';
        //MEALS
        var _tbl = '';
        if (typeof this._breakdown['meals'] === 'undefined') {
            this._breakdown['meals'] = { items: [] };
        }
        for (var m = 0; m < this._breakdown['meals'].items.length; m++) {
            _tbl += '<tr><td colspan="2"><strong>' + this._breakdown['meals'].items[m]['text'] + '</strong></td></tr>';
            _tbl += '<tr><td>' + this._breakdown['meals'].items[m].items[0]['text'] + '</td><td class="text-right">$' + parseFloat(this._breakdown['meals'].items[m].items[0]['amount']).toFixed(2) + '</td></tr>';
            _tbl += '<tr><td>' + this._breakdown['meals'].items[m].items[1]['text'] + '</td><td class="text-right">$' + parseFloat(this._breakdown['meals'].items[m].items[1]['amount']).toFixed(2) + '</td></tr>';
        }
        tmpTables += '<table class="scc-table">' + '<thead>' + '<tr>' + '<th colspan="2">Meals</th>' + '</tr>' + '</thead>' + '<tbody>' + _tbl + '</tbody>' + '</table>';
        //ACTIVITIES
        _tbl = '';
        if (typeof this._breakdown['activities'] === 'undefined') {
            this._breakdown['activities'] = { items: [] };
        }
        for (var m = 0; m < this._breakdown['activities'].items.length; m++) {
            _tbl += '<tr>' +
                '<td>' + this._breakdown['activities'].items[m]['text'] + '</td>' +
                '<td class="text-right">$' + parseFloat(this._breakdown['activities'].items[m]['amount']).toFixed(2) + '</td>' +
                '</tr>';
        }
        tmpTables += '<table class="scc-table">' + '<thead>' + '<tr>' + '<th colspan="2">Activities</th>' + '</tr>' + '</thead>' + '<tbody>' + _tbl + '</tbody>' + '</table>';
        $(breakdownView).append('<div class="col-100p">' + tmpTables + '</div>');
        $(breakdownView).append('<div class="main-price-total">TOTAL: <span>$' + parseFloat(this._total + '').toFixed(2) + '</span></div><br>');
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
                    adults: 35,
                    others: 20
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NjLXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNjYy1zY3JpcHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0VBS0U7QUFNRjtJQVFJLHdCQUFvQixZQUFnQjtRQUFoQixpQkFBWSxHQUFaLFlBQVksQ0FBSTtRQUw1QixpQkFBWSxHQUFhLEVBQUUsQ0FBQztRQUc1QixXQUFNLEdBQVUsSUFBSSxDQUFDO1FBR3pCLENBQUMsR0FBQyxNQUFNLENBQUM7UUFFVCxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVNLDBDQUFpQixHQUF4QixVQUF5QixFQUFFO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRWxDLEdBQUcsQ0FBQSxDQUFDLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFBLENBQUM7WUFFZixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUUxQixFQUFFLENBQUEsQ0FBQyxHQUFHLEtBQUssZUFBZSxDQUFDLENBQzNCLENBQUM7Z0JBQ0csSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkMsQ0FBQztZQUNELElBQUksQ0FDSixDQUFDO2dCQUNHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6QixHQUFHLENBQUEsQ0FBQyxJQUFJLENBQUMsR0FBUSxDQUFDLEVBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVB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QUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxXQUFXLEdBQUMsU0FBUyxHQUFHLE1BQU0sR0FBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUMsTUFBTSxDQUFDO29CQUMvRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDbEwsT0FBTztvQkFDUCxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMxQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsVUFBVSxHQUFDLFFBQVEsR0FBRyxNQUFNLEdBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFDLE1BQU0sQ0FBQztvQkFDN0csU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRLEdBQUcsSUFB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