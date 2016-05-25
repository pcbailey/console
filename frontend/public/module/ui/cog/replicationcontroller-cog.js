/**
 * @fileoverview
 * Cog menu directive for replication controllers.
 */

angular.module('bridge.ui')
.directive('coReplicationcontrollerCog', function(k8s, ModalLauncherSvc, resourceMgrSvc) {
  'use strict';

  return {
    template: '<div class="co-m-cog-wrapper"><co-cog options="cogOptions" size="small" anchor="left"></co-cog></div>',
    restrict: 'E',
    replace: true,
    scope: {
      'rc': '='
    },
    controller: function($scope) {
      var deregisterWatch;

      function getRC() {
        return $scope.rc;
      }

      function getDeleteFn() {
        return function() {
          return k8s.replicationcontrollers.delete($scope.rc);
        };
      }

      function getEditLink() {
        return resourceMgrSvc.getEditLink($scope.rc, k8s.enum.Kind.REPLICATIONCONTROLLER);
      }

      function generateOptions() {
        $scope.cogOptions = [
          {
            label: 'Modify Desired Count...',
            weight: 100,
            callback: ModalLauncherSvc.open.bind(null, 'configure-replica-count', {
              resourceKind: k8s.enum.Kind.REPLICATIONCONTROLLER,
              resource:     getRC
            }),
          },
          {
            label: 'Modify Label Selector...',
            weight: 200,
            callback: ModalLauncherSvc.open.bind(null, 'configure-selector', {
              resourceKind: k8s.enum.Kind.REPLICATIONCONTROLLER,
              selectorKind: k8s.enum.Kind.POD,
              resource: getRC,
              message: 'Replication Controllers ensure the configured number ' +
                  'of pods matching this label selector are healthy and running:',
            }),
          },
          {
            label: 'Modify Labels...',
            weight: 300,
            callback: ModalLauncherSvc.open.bind(null, 'configure-labels', {
              kind: k8s.enum.Kind.REPLICATIONCONTROLLER,
              resource: getRC,
            }),
          },
          {
            label: 'Edit Replication Controller...',
            weight: 400,
            href: getEditLink(),
          },
          {
            label: 'Delete Replication Controller...',
            weight: 500,
            callback: ModalLauncherSvc.open.bind(null, 'confirm', {
              title: 'Delete Replication Controller',
              message: 'Are you sure you want to delete ' +
                  $scope.rc.metadata.name + '?',
              btnText: 'Delete Replication Controller',
              executeFn: getDeleteFn
            }),
          }
        ];
      }

      // Run once after app is populated.
      deregisterWatch = $scope.$watch('rc.metadata.name', function() {
        if ($scope.rc && $scope.rc.metadata && $scope.rc.metadata.name) {
          generateOptions();
          deregisterWatch();
        }
      });

    }
  };

});
