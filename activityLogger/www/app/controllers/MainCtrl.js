'use strict';


angular.module('ActivityLogger').controller('MainCtrl',
    function($scope, $state) {
        // set up the selectable options
        this.possibleActivityTypes = [{
            id: 1,
            label: 'Run'
        }, {
            id: 2,
            label: 'Bike'
        }];

        this.selectedActivityType = this.possibleActivityTypes[0];
        this.comment = '';

        var thisCtrl = this;
        this.startActivity = function() {
            // we could validate something here
            // but we don't have anything to validate at the moment
            if (thisCtrl.selectedActivityType !== undefined) {
                $state.go('tab.activity', {
                    'type': thisCtrl.selectedActivityType.label,
                    'comment': thisCtrl.comment
                });
            }
        };
    });