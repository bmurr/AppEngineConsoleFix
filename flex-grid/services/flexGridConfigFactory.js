angular.module('flexGrid')
    .service('flexGridConfigFactory', function () {

        this.FlexGridConfig = function () {
            this.minWidth = 40;
            this.columnWidthPercentages = [];
            this.data = [];
            this.headerMap = {};

            this.setHeaderMap = function (headerMap) {
                this.headerMap = headerMap;
            };

            this.setColumnWidthPercentages = function (widths) {
                this.columnWidthPercentages = widths;
            };

            this.setData = function (data) {
                this.data = data;
            };

            this.setMinWidth = function (minWidth) {
                this.minWidth = minWidth;
            };

            this.setSelectedCallback = function(callback){
                this.selectedCallback = callback;
            }
        }
    });