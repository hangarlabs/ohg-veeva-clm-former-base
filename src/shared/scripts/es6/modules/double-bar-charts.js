'use strict';

/*
 * Double Bar Chart Module
 */

export default () => {

	//return if no double bar charts on current slide
	var charts = $('.slide .double-bar-chart');
	if (charts.length === 0) { return; }

	//check for tabs. If not, check for patient nav
	var tabs = $('.tabs li');
	if (tabs.length === 0) {
		tabs = $('.patient-nav li');
	}

	var slideId = $('.slide').attr('id');
	var timeLineArray;


	//----- utils ------//

	// [20,18,13] -> [{num:20},{num:18},{num:13}]
	const arrayOfObjects = array => {
		array.forEach( function(val,i) {
			array[i] = { num:val };
		});
		return array;
	};

	const createChartAnimations = () => {
		var array = [];

		charts.each( function(i) {
			var chart = charts.eq(i);

			//chart bars
			var grayBars = chart.find('.bar.gray');
			var greenBars = chart.find('.bar.green');
			var blueBars = chart.find('.bar.blue');

			//array of bar number values
			var grayBarNumbers = grayBars.find('p').text().toString().split('%').slice(0,-1);
			var greenBarNumbers = greenBars.find('h2').text().toString().split('%').slice(0,-1);
			var blueBarNumbers = blueBars.find('p').text().toString().split('%').slice(0,-1);

			//array of objects containig bar number values [20,18,13] -> [{num:20},{num:18},{num:13}]
			//necessary conversion for TimelineMax
			grayBarNumbers = arrayOfObjects(grayBarNumbers);
			greenBarNumbers = arrayOfObjects(greenBarNumbers);
			blueBarNumbers = arrayOfObjects(blueBarNumbers);

			var tl = new TimelineMax({ paused:true });
			var barDuration = 1.4; //bar animation duration

			//animate bars
			tl.from(grayBars, barDuration,{ height:0, ease:Power2.easeInOut }, 'grayBarsBegin')
				.from(greenBars, 0.5,{ autoAlpha:0 }, 'grayBarsCompleted')
				.from(greenBars, barDuration,{ height:0, ease:Power2.easeInOut }, 'grayBarsCompleted')
				.from(blueBars, 0.5,{ autoAlpha:0 }, 'grayBarsCompleted')
				.from(blueBars, barDuration,{ height:0, ease:Power2.easeInOut }, 'grayBarsCompleted')
			//animate numbers
				.appendMultiple(
					TweenMax.allFrom(grayBarNumbers, barDuration,{
						num:0, roundProps:'num',
						onUpdate:function(){
							//update bar values
							grayBars.each(function(j) {
								grayBars.eq(j).find('p').text(grayBarNumbers[j].num + '%');
							});
						}
					}), 'grayBarsBegin')

				.appendMultiple(
					TweenMax.allFrom(greenBarNumbers, barDuration,{
						num:0, roundProps:'num',
						onUpdate:function(){
							//update bar values
							greenBars.each(function(j) {
								greenBars.eq(j).find('h2').text(greenBarNumbers[j].num + '%');
							});
						}
					}), 'grayBarsCompleted')

				.appendMultiple(
					TweenMax.allFrom(blueBarNumbers, barDuration,{
						num:0, roundProps:'num',
						onUpdate:function(){
							//update bar values
							blueBars.each(function(j) {
								blueBars.eq(j).find('p').text(blueBarNumbers[j].num + '%');
							});
						}
					}), 'grayBarsCompleted');

			array.push(tl);
		});

		return array;
	};


	//----- handlers ------//

	tabs.on('click', function tabClicked(e) {
		var index = tabs.index(this);

		if (slideId === 'neulasta_icva_2_1') {
			timeLineArray[index].play(0);
		}

		else if (slideId === 'neulasta_icva_4_1') {
			if (index === 2) { timeLineArray[0].play(0); }
		}

		else if (slideId === 'neulasta_icva_4_2') {
			if (index === 2) { timeLineArray[0].play(0); }
			if (index === 3) { timeLineArray[1].play(0); }
		}
	});

	// Slide 2.3
	$('#neulasta_icva_2_3 #tab-item-1-section-open').on('click', function tabClicked(e) {
		timeLineArray[0].play(0);
	});


	//----- init ------//

	timeLineArray = createChartAnimations();
	timeLineArray[0].play(0);
};
