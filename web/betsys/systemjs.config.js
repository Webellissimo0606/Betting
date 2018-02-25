/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
  System.config({
    paths: {
      // paths serve as alias
      'npm:': 'node_modules/'
    },
    // map tells the System loader where to look for things
    defaltJSExtensions : true,
    map: {
      // our app is within the app folder
      app: 'app/app',
      // angular bundles
      '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
      '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
      '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
      '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
      '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
      '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
      '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
      '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
      '@angular/upgrade': 'npm:@angular/upgrade/bundles/upgrade.umd.js',
      // other libraries
      'rxjs': 'npm:rxjs',
      'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js',
      'moment' : 'node_modules/moment/moment.js',
      'ng2-bootstrap/ng2-bootstrap' : 'node_modules/ng2-bootstrap/bundles/ng2-bootstrap.umd.js',
      'ng2-dnd' : 'node_modules/ng2-dnd/bundles',
      'ng2-bs3-modal': 'node_modules/ng2-bs3-modal',
      'ts-metadata-helper': 'npm:ts-metadata-helper',
      'angular2-dynamic-component': 'npm:angular2-dynamic-component',
      'angular2-busy': 'npm:angular2-busy',
      'moment': 'npm:moment',
      'moment-timezone': 'npm:moment-timezone'
    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      app: {
        main: './main.js',
        defaultExtension: 'js'
      },
      rxjs: {
        defaultExtension: 'js'
      },
      'ng2-dnd' : {
        main:'./index.umd.js',
        defaultExtension : 'js'
      },
      'ng2-bs3-modal' : {
        main:'./ng2-bs3-modal.js',
        defaultExtension : 'js'
      },
      'ts-metadata-helper': {
        defaultExtension: 'js'
      },
      'angular2-dynamic-component': {
        defaultExtension: 'js'
      },
      'angular2-busy': {
        main: './index.js',
        defaultExtension: 'js'
      },
      'moment': {
        main: './moment.js',
        defaultExtension: 'js'
      },
      'moment-timezone': {
        main: './index.js',
        defaultExtension: 'js'
      }
    }
  });
})(this);
