angular.module('angularApp')
.controller('StatCtrl', [ '$scope', 'MvvSrvc', 'KeenSrvc', 'StatModel', function($scope, MvvSrvc, KeenSrvc, StatModel) {
    $scope.interval = "every_hour";
    var timeframe = "this_1_day";
    $scope.timeframeName = "Heute";     
    $scope.totalLiveDelay = 0;

    var reportQuery = {
        id: 'reportQuery',
        operation: "count",
        event_collection: "notifications_start",
        timeframe: timeframe,
        timezone: "UTC"
    }
    var delaysQuery = {
        id: 'delaysQuery',
        operation: "count",
        event_collection: "statistics",
        target_property:  "totalNumberOfDelays",
        timeframe: timeframe,
        timezone: "UTC"
    }

    var liveDelays = {
        id: 'liveDelaysQuery',
        operation: 'average',
        method: 'set',
        event_collection: "statistics",
        target_property: "totalNumberOfDelays",
        timeframe: timeframe,
        interval: "daily",
        timezone: "UTC"
    }

    var liveTrains = {
        id: 'liveTrainsQuery',
        operation: 'median',
        event_collection: "statistics",
        target_property: "totalNumberOfTrains",
        timeframe: timeframe,
        interval: "hourly",
        timezone: "UTC"
    }

    $scope.data = StatModel.getData();
    $scope.options = {
        chart: {
            type: 'lineChart',
            height: 300,
            margin : {
                top: 20,
                right: 20,
                bottom: 60,
                left: 30
            },
            x: function(d){ return d.label; },
            y: function(d){ return d.value; },
            showValues: true,
            valueFormat: function(d){
                return d3.format(',.4f')(d);
            },
            transitionDuration: 500,
            useInteractiveGuideline: true,
            xAxis: {
                axisLabelDistance: 30,
                tickFormat: function(d){
                    return d3.time.format('%X')(new Date(d));
                }
            },
            yAxis: {
                axisLabel: 'Y Axis',
                axisLabelDistance: 30
            }
        }
    }

    $scope.countReports = StatModel.countReports();
    var callback = {
        id: 'statistic.controller.js',
        notify: function(value, operation) {
            if(operation === 'totalNumberOfDelays') {
                $scope.totalNumberOfDelays = value
            }
            if(operation === 'countReports') {
                $scope.countReports = value
            }
            if(operation === 'dataSet') {
                // based on plunker http://plnkr.co/edit/AwkX2FW0GGMzwplyTQMS
	            $scope.data.length = 0;
	            Array.prototype.push.apply($scope.data, StatModel.getData());

            }
            if(operation === 'dataAdd') {
                //$scope.data[0].values.push(value);  
            }
            if(operation === 'intervalChange') {
                console.log("got intervalChange in statistic.controller.js");
                console.log(value.timeframe);
                console.log(value.interval);
                $scope.interval = value.interval;
                $scope.timeframeName = value.timeframeName;

                reportQuery.timeframe = value.timeframe;
                delaysQuery.timeframe = value.timeframe;
                liveDelays.timeframe = value.timeframe;
                liveTrains.timeframe = value.timeframe;

                if(value.pollingInterval) {
                    MvvSrvc.startPolling(value.pollingInterval);
                } else {
                    MvvSrvc.stopPolling();
                    $scope.countReports = "~ ~ ~"
                    $scope.totalNumberOfDelays = "~ ~ ~"
                    KeenSrvc.execute(reportQuery);
                    KeenSrvc.execute(delaysQuery);   
                    KeenSrvc.execute(liveDelays);          
                }
            }
        }   
    }
    StatModel.registerOberserver(callback);
}]);
