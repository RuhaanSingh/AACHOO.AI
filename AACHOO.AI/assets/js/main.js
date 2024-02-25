"use strict";

const errorLabel = document.querySelector("label[for='error-msg']");
const latInp = document.querySelector("#latitude");
const lonInp = document.querySelector("#longitude");
const airQuality = document.querySelector(".air-quality");
const airQualityStat = document.querySelector(".air-quality-status");
const srchBtn = document.querySelector(".search-btn");
const componentsEle = document.querySelectorAll(".component-val");

const appId = "c1d2d185956c5e93de7e48f777e18c9b";
const link = "https://api.openweathermap.org/data/2.5/air_pollution";

const getUserLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onPositionGathered, onPositionGatherError);
    } else {
        onPositionGatherError({ message: "Geolocation is not supported by this browser." });
    }
};

const onPositionGathered = (pos) => {
    let lat = pos.coords.latitude.toFixed(4), lon = pos.coords.longitude.toFixed(4);
    latInp.value = lat;
    lonInp.value = lon;
    getAirQuality(lat, lon);
};

const getAirQuality = async (lat, lon) => {
    try {
        const rawData = await fetch(`${link}?lat=${lat}&lon=${lon}&appid=${appId}`);
        const airData = await rawData.json();
        setValuesOfAir(airData);
        setComponentsOfAir(airData);
    } catch (err) {
        onPositionGatherError({ message: "Failed to fetch air quality data." });
        console.error(err);
    }
};

const setValuesOfAir = airData => {
    const aqi = airData.list[0].main.aqi;
    let airStat = "", color = "";
    airQuality.innerText = aqi;
    switch (aqi) {
        case 1:
            airStat = "Good: It is good to go outside";
            color = "green";
            break;
        case 2:
            airStat = "Fair: It's okay to go outside";
            color = "yellow";
            break;
        case 3:
            airStat = "Moderate: It's okay to go outside with necessary precautions";
            color = "orange";
            break;
        case 4:
            airStat = "Poor: Not recommended to go outside";
            color = "red";
            break;
        case 5:
            airStat = "Very Poor: Go out only if necessary. Caution must be taken";
            color = "purple";
            break;
        default:
            airStat = "Unknown";
            break;
    }
    airQualityStat.innerText = airStat;
    airQualityStat.style.color = color;
};

const setComponentsOfAir = airData => {
    let components = {...airData.list[0].components};
    componentsEle.forEach(ele => {
        const attr = ele.getAttribute('data-comp');
        ele.innerText = components[attr] + " μg/m³";
    });
    const allergies = mapPollutantsToAllergies(components);
    const allergiesEle = document.querySelector(".allergies-info");
    allergiesEle.innerHTML = allergies.length > 0 ? "<b>Potential Allergies:</b> " + allergies.join("<br>") : "No specific allergies detected based on current air quality.";
};

const onPositionGatherError = e => {
    errorLabel.innerText = e.message;
};

srchBtn.addEventListener("click", () => {
    getAirQuality(parseFloat(latInp.value).toFixed(4), parseFloat(lonInp.value).toFixed(4));
});

// Function mapping pollutants to potential allergies
function mapPollutantsToAllergies(pollutants) {
    let allergies = [];
    if (pollutants["pm2_5"] > 29) {
        allergies.push("Fine particles (PM2.5) may worsen asthma and trigger allergies such as pollen allergy.");
    }
    if (pollutants["o3"] > 85) {
        allergies.push("Ozone can irritate the airways, exacerbating bronchitis, and asthma, and may increase sensitivity to allergens.");
    }
    if (pollutants["no2"] > 30) {
        allergies.push("Nitrogen dioxide can increase susceptibility to respiratory infections and pollen allergies.");
    }
    if (pollutants["so2"] > 17) {
        allergies.push("Sulphur dioxide can trigger asthma and enhance sensitivity to allergens for people with allergic rhinitis.");
    }
    // Add more conditions as needed

    if (allergies.length === 0) {
        allergies.push("Very rare chance of potential allergy based on current air quality.");
    }
    return allergies;
}

getUserLocation();

jQuery(document).ready(function ($) {


    /*---------------------------------------------*
     * Mobile menu
     ---------------------------------------------*/
    $('#navbar-collapse').find('a[href*=#]:not([href=#])').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: (target.offset().top - 40)
                }, 1000);
                if ($('.navbar-toggle').css('display') != 'none') {
                    $(this).parents('.container').find(".navbar-toggle").trigger("click");
                }
                return false;
            }
        }
    });


    /*---------------------------------------------*
     * For Price Table
     ---------------------------------------------*/

    checkScrolling($('.cd-pricing-body'));
    $(window).on('resize', function () {
        window.requestAnimationFrame(function () {
            checkScrolling($('.cd-pricing-body'))
        });
    });
    $('.cd-pricing-body').on('scroll', function () {
        var selected = $(this);
        window.requestAnimationFrame(function () {
            checkScrolling(selected)
        });
    });

    function checkScrolling(tables) {
        tables.each(function () {
            var table = $(this),
                    totalTableWidth = parseInt(table.children('.cd-pricing-features').width()),
                    tableViewport = parseInt(table.width());
            if (table.scrollLeft() >= totalTableWidth - tableViewport - 1) {
                table.parent('li').addClass('is-ended');
            } else {
                table.parent('li').removeClass('is-ended');
            }
        });
    }

    //switch from monthly to annual pricing tables
    bouncy_filter($('.cd-pricing-container'));

    function bouncy_filter(container) {
        container.each(function () {
            var pricing_table = $(this);
            var filter_list_container = pricing_table.children('.cd-pricing-switcher'),
                    filter_radios = filter_list_container.find('input[type="radio"]'),
                    pricing_table_wrapper = pricing_table.find('.cd-pricing-wrapper');

            //store pricing table items
            var table_elements = {};
            filter_radios.each(function () {
                var filter_type = $(this).val();
                table_elements[filter_type] = pricing_table_wrapper.find('li[data-type="' + filter_type + '"]');
            });

            //detect input change event
            filter_radios.on('change', function (event) {
                event.preventDefault();
                //detect which radio input item was checked
                var selected_filter = $(event.target).val();

                //give higher z-index to the pricing table items selected by the radio input
                show_selected_items(table_elements[selected_filter]);

                //rotate each cd-pricing-wrapper 
                //at the end of the animation hide the not-selected pricing tables and rotate back the .cd-pricing-wrapper

                if (!Modernizr.cssanimations) {
                    hide_not_selected_items(table_elements, selected_filter);
                    pricing_table_wrapper.removeClass('is-switched');
                } else {
                    pricing_table_wrapper.addClass('is-switched').eq(0).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
                        hide_not_selected_items(table_elements, selected_filter);
                        pricing_table_wrapper.removeClass('is-switched');
                        //change rotation direction if .cd-pricing-list has the .cd-bounce-invert class
                        if (pricing_table.find('.cd-pricing-list').hasClass('cd-bounce-invert'))
                            pricing_table_wrapper.toggleClass('reverse-animation');
                    });
                }
            });
        });
    }
    function show_selected_items(selected_elements) {
        selected_elements.addClass('is-selected');
    }

    function hide_not_selected_items(table_containers, filter) {
        $.each(table_containers, function (key, value) {
            if (key != filter) {
                $(this).removeClass('is-visible is-selected').addClass('is-hidden');

            } else {
                $(this).addClass('is-visible').removeClass('is-hidden is-selected');
            }
        });
    }


    /*---------------------------------------------*
     * STICKY scroll
     ---------------------------------------------*/

    $.localScroll();



// scroll Up

    $(window).scroll(function () {
        if ($(this).scrollTop() > 600) {
            $('.scrollup').fadeIn('slow');
        } else {
            $('.scrollup').fadeOut('slow');
        }
    });
    $('.scrollup').click(function () {
        $("html, body").animate({scrollTop: 0}, 1000);
        return false;
    });


    //End
});
