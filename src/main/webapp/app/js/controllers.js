var podcastControllers = angular.module('podcastControllers', []);

podcastControllers.controller('ItemsListCtrl', function ($scope, $http, $routeParams, $cacheFactory, Restangular, ngstomp) {

    // Gestion du cache de la pagination :
    var cache = $cacheFactory.get('paginationCache') || $cacheFactory('paginationCache');

    //$scope.selectPage = function (pageNo) {
    $scope.changePage = function(newPage) {
        cache.put('currentPage', newPage);
        Restangular.one("item/pagination").get({size: 12, page :newPage-1, direction : 'DESC', properties : 'pubdate'}).then(function(itemsResponse) {
            $scope.items = itemsResponse.content;

            $scope.currentPage = newPage;
            $scope.totalItems = parseInt(itemsResponse.totalElements);

        });
    };

    // Longeur inconnu au chargement :
    $scope.totalItems = Number.MAX_VALUE;
    $scope.maxSize = 10;
    $scope.currentPage = cache.get("currentPage") || 1;
    $scope.changePage($scope.currentPage);

    $scope.download = function(item) {
        Restangular.one("item").customGET(item.id + "/addtoqueue");
    };
    $scope.stopDownload = function(item) {
        Restangular.one("task").customPOST(item.id, "downloadManager/stopDownload");
    };
    $scope.toggleDownload = function(item) {
        Restangular.one("task").customPOST(item.id, "downloadManager/toogleDownload");
    };

    $scope.wsClient = ngstomp('/download', SockJS);
    $scope.wsClient.connect("user", "password", function(){
        $scope.wsClient.subscribe("/topic/download", function(message) {
            var item = JSON.parse(message.body);

            var elemToUpdate = _.find($scope.items, { 'id': item.id });
            if (elemToUpdate)
                _.assign(elemToUpdate, item);
        });
    });

});

podcastControllers.controller('ItemDetailCtrl', function ($scope, $routeParams, $http, Restangular, ngstomp) {
    var idItem = $routeParams.itemId;

    Restangular.one("item", idItem).get().then(function(item) {
        $scope.item = item;
        $scope.wsClient = ngstomp("/download", SockJS);
        $scope.wsClient.connect("user", "password", function(){
            $scope.wsClient.subscribe("/topic/podcast/" + item.podcastId, function(message) {
                var itemFromWS = JSON.parse(message.body);

                if (itemFromWS.id == $scope.item.id) {
                    _.assign($scope.item, itemFromWS);
                }
            });
        });
    });

    $scope.download = function(item) {
        Restangular.one("item").customGET(item.id + "/addtoqueue");
    };

    $scope.remove = function(item) {
        Restangular.one("item", item.id).remove().then(function() {
            $scope.podcast.items = _.reject($scope.podcast.items, function(elem) {
                return (elem.id == item.id);
            });
        });
    };

    $scope.stopDownload = function(item) {
        Restangular.one("task").customPOST(item.id, "downloadManager/stopDownload");
    };
    $scope.toggleDownload = function(item) {
        Restangular.one("task").customPOST(item.id, "downloadManager/toogleDownload");
    };

});

podcastControllers.controller('PodcastsListCtrl', function ($scope, Restangular, localStorageService) {
    $scope.podcasts = localStorageService.get('podcastslist');
    Restangular.all("podcast").getList().then(function(podcasts) {
        $scope.podcasts = podcasts;
        localStorageService.add('podcastslist', podcasts);
    });
});

podcastControllers.controller('PodcastDetailCtrl', function ($scope, $routeParams, Restangular, ngstomp, localStorageService) {
    var idPodcast = $routeParams.podcastId;

    // LocalStorage de la valeur du podcast :
    $scope.$watch('podcast', function(newval, oldval) {
        localStorageService.add("podcast/" + idPodcast, newval);
    });

    $scope.podcast = localStorageService.get("podcast/" + idPodcast ) || {};

    Restangular.one("podcast", $routeParams.podcastId).get().then(function(podcast) {
        $scope.podcast = podcast;

        $scope.wsClient = ngstomp("/download", SockJS);
        $scope.wsClient.connect("user", "password", function(){
            $scope.wsClient.subscribe("/topic/podcast/" + idPodcast, function(message) {
                var item = JSON.parse(message.body);
                var elemToUpdate = _.find($scope.podcast.items, { 'id': item.id });
                _.assign(elemToUpdate, item);
            });
        });

    });


    $scope.download = function(item) {
        Restangular.one("item").customGET(item.id + "/addtoqueue");
    };

    $scope.remove = function(item) {
        Restangular.one("item", item.id).remove().then(function() {
            $scope.podcast.items = _.reject($scope.podcast.items, function(elem) {
                return (elem.id == item.id);
            });
        });
    };
    $scope.refresh = function() {
        Restangular.one("task").customPOST($scope.podcast.id, "updateManager/updatePodcast/force").then(function() {
            $scope.podcast.get().then(function(podcast) {
                $scope.podcast.items = podcast.items;
            });
        });
    };
    $scope.stopDownload = function(item) {
        Restangular.one("task").customPOST(item.id, "downloadManager/stopDownload");
    };
    $scope.toggleDownload = function(item) {
        Restangular.one("task").customPOST(item.id, "downloadManager/toogleDownload");
    };

    $scope.save = function() {
        var podcastToUpdate = _.cloneDeep($scope.podcast);
        podcastToUpdate.items = null;
        $scope.podcast.patch(podcastToUpdate);
    };
});

podcastControllers.controller('DownloadCtrl', function ($scope, $http, $routeParams, Restangular, ngstomp) {
    $scope.items = Restangular.all("task/downloadManager/downloading").getList().$object;

    $scope.refreshWaitingItems = function() {
        var scopeWaitingItems = $scope.waitingitems || Restangular.all("task/downloadManager/queue");
        scopeWaitingItems.getList().then(function(waitingitems) {
            $scope.waitingitems = waitingitems;
        });
    }();
    //$scope.refreshWaitingItems();

    Restangular.one("task/downloadManager/limit").get().then(function(data) {
        $scope.numberOfSimDl = parseInt(data);
    });

    $scope.updateNumberOfSimDl = function() {
        Restangular.one("task").customPOST($scope.numberOfSimDl, "downloadManager/limit");
    }

    /** Spécifique aux éléments de la liste : **/
    $scope.stopDownload = function(item) {
        Restangular.one("task").customPOST(item.id, "downloadManager/stopDownload");
    }
    $scope.toggleDownload = function(item) {
        Restangular.one("task").customPOST(item.id, "downloadManager/toogleDownload");
    }

    /** Global **/
    $scope.stopAllDownload = function() {
        Restangular.one("task").customGET("downloadManager/stopAllDownload");
    }
    $scope.pauseAllDownload = function() {
        Restangular.one("task").customGET("downloadManager/pauseAllDownload");
    }
    $scope.restartAllCurrentDownload = function() {
        Restangular.one("task").customGET("downloadManager/restartAllCurrentDownload");
    }
    $scope.removeFromQueue = function(item) {
        Restangular.one("task").customDELETE("downloadManager/queue/" + item.id);//.then($scope.refreshWaitingItems);

    }

    $scope.wsClient = ngstomp('/download', SockJS);
    $scope.wsClient.connect("user", "password", function(){
        $scope.wsClient.subscribe("/topic/download", function(message) {
            var item = JSON.parse(message.body);

            var elemToUpdate = _.find($scope.items, { 'id': item.id });

            switch (item.status) {
                case 'Started' :
                case 'Paused' :
                    if (elemToUpdate)
                        _.assign(elemToUpdate, item);
                    else
                        $scope.items.push(item);

                    break;
                case 'Stopped' :
                case 'Finish' :
                    if (elemToUpdate)
                        _.remove($scope.items, function(item) { return item.id == elemToUpdate.id})
                    break;
            }
        });
        $scope.wsClient.subscribe("/topic/waitingList", function(message) {
            var items = JSON.parse(message.body);
            $scope.waitingitems = items;
            //console.log(item);
        });
    });
    /*
     Restangular.all("task/downloadManager/queue").getList().then(function(waitingitems) {
     $scope.waitingitems = waitingitems;
     });
     */
});

podcastControllers.controller('PodcastAddCtrl', function ($scope, Restangular) {
    var podcasts = Restangular.all("podcast");

    $scope.podcast = {};
    $scope.podcast.hasToBeDeleted = true;


    $scope.save = function() {
        podcasts.post($scope.podcast);
    }
});